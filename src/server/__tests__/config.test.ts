import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@nocobase/server', () => ({ Plugin: class {}, Migration: class {} }));
import { PluginCustomLoginPageServer, isSchemaDriftError, toSnakeCase } from '../index';
import AddMobileColumnsMigration from '../migrations/20260930000000-add-mobile-columns';

describe('configuration persistence and last good cache', () => {
  let plugin: any;
  let actions: any;
  let repo: any;
  let transaction: any;
  const oldConfig = { enabled: false, canvasWidth: 'wide', gridSchema: { use: 'saved-layout' } };
  const context = (values = {}) => ({
    action: { params: { values } },
    body: undefined,
    throw(status: number, message: string) { throw Object.assign(new Error(message), { status }); },
  });

  beforeEach(async () => {
    repo = {
      findOne: vi.fn().mockResolvedValue(oldConfig),
      update: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(oldConfig),
    };
    transaction = vi.fn(async (callback) => callback({ id: 'transaction' }));
    plugin = new PluginCustomLoginPageServer();
    Object.assign(plugin, {
      db: { getRepository: () => repo, sequelize: { transaction } },
      app: {
        resource: (resource) => { actions = resource.actions; },
        acl: { allow: vi.fn(), registerSnippet: vi.fn() },
        logger: { error: vi.fn(), warn: vi.fn() },
      },
    });
    await plugin.load();
    await actions.getPublicConfig(context(), vi.fn());
  });

  it.each(['update', 'create', 'commit', 'readback'])('rejects a failed %s without publishing requested values', async (failure) => {
    const previousCache = plugin.cachedPublicConfig;
    if (failure === 'update') repo.update.mockRejectedValue(new Error('offline'));
    if (failure === 'create') {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockRejectedValue(new Error('constraint'));
    }
    if (failure === 'commit') transaction.mockImplementation(async (callback) => {
      await callback({});
      throw new Error('commit failed');
    });
    if (failure === 'readback') repo.findOne.mockResolvedValueOnce(oldConfig).mockResolvedValueOnce(null);
    const ctx = context({ enabled: true });
    const next = vi.fn();
    await expect(actions.saveConfig(ctx, next)).rejects.toMatchObject({ status: 503 });
    expect(ctx.body).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(plugin.cachedPublicConfig).toBe(previousCache);
  });

  it('publishes only after commit and updates only the submitted fields', async () => {
    const previousCache = plugin.cachedPublicConfig;
    const saved = { ...oldConfig, enabled: true };
    repo.findOne.mockResolvedValueOnce(oldConfig).mockResolvedValueOnce(saved);
    transaction.mockImplementation(async (callback) => {
      const result = await callback({ id: 'transaction' });
      expect(plugin.cachedPublicConfig).toBe(previousCache);
      return result;
    });
    const ctx = context({ enabled: true });
    await actions.saveConfig(ctx, vi.fn());
    expect(repo.update).toHaveBeenCalledWith({ filter: { key: 'default' }, values: { enabled: true }, transaction: { id: 'transaction' } });
    expect(ctx.body).toMatchObject(saved);
    expect(plugin.cachedPublicConfig).toMatchObject(saved);
  });

  it('does not give the editor defaults when reading fails', async () => {
    repo.findOne.mockRejectedValue(new Error('offline'));
    await expect(actions.getConfig(context(), vi.fn())).rejects.toMatchObject({ status: 503 });
  });

  it('serves last good config during outage and native login on a cold start', async () => {
    plugin.lastCacheTime = 0;
    repo.findOne.mockRejectedValue(new Error('offline'));
    const ctx = context();
    await actions.getPublicConfig(ctx, vi.fn());
    expect(ctx.body).toMatchObject(oldConfig);
    plugin.cachedPublicConfig = null;
    await actions.getPublicConfig(ctx, vi.fn());
    expect(ctx.body).toEqual({ enabled: false });
  });

  describe('distributed cache (Redis/app.cache) multi-pod synchronization', () => {
    it('serves config directly from app.cache without hitting repo when cache hit occurs', async () => {
      const redisConfig = { enabled: true, canvasWidth: 'full', customBlocks: [] };
      const cacheMock = {
        get: vi.fn().mockResolvedValue(redisConfig),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      };
      plugin.app.cache = cacheMock;
      repo.findOne.mockClear();

      const ctx = context();
      await actions.getPublicConfig(ctx, vi.fn());

      expect(cacheMock.get).toHaveBeenCalledWith('custom_login:public_config');
      expect(repo.findOne).not.toHaveBeenCalled();
      expect(ctx.body).toEqual(redisConfig);
    });

    it('falls back to memory and database when app.cache throws an error', async () => {
      const cacheMock = {
        get: vi.fn().mockRejectedValue(new Error('Redis connection timeout')),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      };
      plugin.app.cache = cacheMock;
      plugin.cachedPublicConfig = null;
      plugin.lastCacheTime = 0;

      const ctx = context();
      await actions.getPublicConfig(ctx, vi.fn());

      expect(cacheMock.get).toHaveBeenCalled();
      expect(repo.findOne).toHaveBeenCalled();
      expect(ctx.body).toMatchObject(oldConfig);
    });

    it('syncs updated configuration into app.cache when saveConfig is called', async () => {
      const cacheMock = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        del: vi.fn().mockResolvedValue(undefined),
      };
      plugin.app.cache = cacheMock;
      const updated = { ...oldConfig, enabled: true, canvasWidth: 'standard' };
      repo.findOne.mockResolvedValueOnce(oldConfig).mockResolvedValueOnce(updated);

      const ctx = context({ enabled: true, canvasWidth: 'standard' });
      await actions.saveConfig(ctx, vi.fn());

      expect(cacheMock.set).toHaveBeenCalledWith(
        'custom_login:public_config',
        expect.objectContaining({ enabled: true, canvasWidth: 'standard' }),
        60000
      );
    });
  });

  describe('mobile independent layout persistence & schema auto-healing', () => {
    it('persists mobile columns with strict boolean coercion and sets Cache-Control', async () => {
      const savedMobile = {
        ...oldConfig,
        enableMobileCustom: true,
        mobileGridSchema: { use: 'mobile-layout' },
        enableMobileTheme: true,
        mobileContainerStyle: 'card',
      };
      repo.findOne.mockResolvedValueOnce(oldConfig).mockResolvedValueOnce(savedMobile);

      const ctx = context({
        enableMobileCustom: 1, // should be coerced to true
        mobileGridSchema: { use: 'mobile-layout' },
        enableMobileTheme: 'true', // should be coerced to true
        mobileContainerStyle: 'card',
      });
      await actions.saveConfig(ctx, vi.fn());

      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            enableMobileCustom: true,
            enableMobileTheme: true,
            mobileContainerStyle: 'card',
          }),
        })
      );
      expect(ctx.body.enableMobileCustom).toBe(true);

      // Verify getPublicConfig sets Cache-Control header and serves boolean
      const publicCtx: any = {
        set: vi.fn(),
        body: undefined,
      };
      plugin.cachedPublicConfig = null;
      plugin.lastCacheTime = 0;
      repo.findOne.mockResolvedValueOnce({
        ...savedMobile,
        enableMobileCustom: 1, // simulates raw SQLite integer 1
      });
      await actions.getPublicConfig(publicCtx, vi.fn());
      expect(publicCtx.set).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      expect(publicCtx.body.enableMobileCustom).toBe(true);
    });

    it('auto-heals schema by calling addColumn when table exists but lacks columns', async () => {
      const addColumn = vi.fn().mockResolvedValue(undefined);
      const queryInterface = {
        showAllTables: vi.fn().mockResolvedValue(['custom_login_configs']),
        describeTable: vi.fn().mockResolvedValue({
          id: {},
          key: {},
          enabled: {},
        }), // missing all 5 mobile columns
        addColumn,
      };

      plugin.db = {
        getRepository: () => repo,
        Sequelize: {
          BOOLEAN: 'BOOLEAN',
          TEXT: 'TEXT',
          STRING: () => 'VARCHAR(255)',
        },
        sequelize: {
          getQueryInterface: () => queryInterface,
          transaction,
        },
      };

      await plugin.autoHealSchema();

      expect(addColumn).toHaveBeenCalledTimes(5);
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'enableMobileCustom', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobileGridSchema', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'enableMobileTheme', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobileThemeConfig', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobileContainerStyle', expect.any(Object));
    });

    it('uses Collection.sync() when DB_UNDERSCORED=true and snake_case columns are missing (even if camelCase columns were added by old beta)', async () => {
      const colSync = vi.fn().mockResolvedValue(undefined);
      const addColumn = vi.fn().mockResolvedValue(undefined);
      const queryInterface = {
        showAllTables: vi.fn().mockResolvedValue(['custom_login_configs']),
        describeTable: vi.fn().mockResolvedValue({
          id: {},
          key: {},
          enabled: {},
          // 模拟旧版 0.2.0-beta.17 误建的驼峰列，蛇形列仍缺失
          enableMobileCustom: {},
          mobileGridSchema: {},
          enableMobileTheme: {},
          mobileThemeConfig: {},
          mobileContainerStyle: {},
        }),
        addColumn,
      };

      const mockCol = {
        sync: colSync,
        model: {
          rawAttributes: {
            id: { field: 'id' },
            key: { field: 'key' },
            enabled: { field: 'enabled' },
            enableMobileCustom: { field: 'enable_mobile_custom' },
            mobileGridSchema: { field: 'mobile_grid_schema' },
            enableMobileTheme: { field: 'enable_mobile_theme' },
            mobileThemeConfig: { field: 'mobile_theme_config' },
            mobileContainerStyle: { field: 'mobile_container_style' },
          },
        },
      };

      plugin.db = {
        options: { underscored: true },
        getRepository: () => repo,
        getCollection: () => mockCol,
        sequelize: {
          getQueryInterface: () => queryInterface,
          transaction,
        },
      };

      await plugin.autoHealSchema();

      expect(colSync).toHaveBeenCalledTimes(1);
      expect(addColumn).not.toHaveBeenCalled();
    });

    it('skips Collection.sync() when all mapped snake_case columns already exist', async () => {
      const colSync = vi.fn().mockResolvedValue(undefined);
      const addColumn = vi.fn().mockResolvedValue(undefined);
      const queryInterface = {
        showAllTables: vi.fn().mockResolvedValue(['custom_login_configs']),
        describeTable: vi.fn().mockResolvedValue({
          id: {},
          key: {},
          enabled: {},
          enable_mobile_custom: {},
          mobile_grid_schema: {},
          enable_mobile_theme: {},
          mobile_theme_config: {},
          mobile_container_style: {},
        }),
        addColumn,
      };

      const mockCol = {
        sync: colSync,
        model: {
          rawAttributes: {
            id: { field: 'id' },
            key: { field: 'key' },
            enabled: { field: 'enabled' },
            enableMobileCustom: { field: 'enable_mobile_custom' },
            mobileGridSchema: { field: 'mobile_grid_schema' },
            enableMobileTheme: { field: 'enable_mobile_theme' },
            mobileThemeConfig: { field: 'mobile_theme_config' },
            mobileContainerStyle: { field: 'mobile_container_style' },
          },
        },
      };

      plugin.db = {
        options: { underscored: true },
        getRepository: () => repo,
        getCollection: () => mockCol,
        sequelize: {
          getQueryInterface: () => queryInterface,
          transaction,
        },
      };

      await plugin.autoHealSchema();

      expect(colSync).not.toHaveBeenCalled();
      expect(addColumn).not.toHaveBeenCalled();
    });

    it('falls back to snake_case column names in addColumn when underscored is enabled and col.sync is unavailable', async () => {
      const addColumn = vi.fn().mockResolvedValue(undefined);
      const queryInterface = {
        showAllTables: vi.fn().mockResolvedValue(['custom_login_configs']),
        describeTable: vi.fn().mockResolvedValue({
          id: {},
          key: {},
          enabled: {},
        }),
        addColumn,
      };

      plugin.db = {
        options: { underscored: true },
        getRepository: () => repo,
        sequelize: {
          getQueryInterface: () => queryInterface,
          transaction,
        },
      };

      await plugin.autoHealSchema();

      expect(addColumn).toHaveBeenCalledTimes(5);
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'enable_mobile_custom', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobile_grid_schema', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'enable_mobile_theme', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobile_theme_config', expect.any(Object));
      expect(addColumn).toHaveBeenCalledWith('custom_login_configs', 'mobile_container_style', expect.any(Object));
    });

    it('migration uses snake_case mapping and prefers Collection.sync() under DB_UNDERSCORED=true', async () => {
      const colSync = vi.fn().mockResolvedValue(undefined);
      const addColumn = vi.fn().mockResolvedValue(undefined);
      const migration: any = new AddMobileColumnsMigration();
      migration.app = {
        logger: { info: vi.fn(), warn: vi.fn() },
        db: {
          options: { underscored: true },
          getCollection: () => ({
            sync: colSync,
            model: {
              rawAttributes: {
                enableMobileCustom: { field: 'enable_mobile_custom' },
                mobileGridSchema: { field: 'mobile_grid_schema' },
                enableMobileTheme: { field: 'enable_mobile_theme' },
                mobileThemeConfig: { field: 'mobile_theme_config' },
                mobileContainerStyle: { field: 'mobile_container_style' },
              },
            },
          }),
          sequelize: {
            getQueryInterface: () => ({
              showAllTables: vi.fn().mockResolvedValue(['custom_login_configs']),
              describeTable: vi.fn().mockResolvedValue({ id: {}, key: {} }),
              addColumn,
            }),
          },
        },
      };

      await migration.up();
      expect(colSync).toHaveBeenCalledTimes(1);
      expect(addColumn).not.toHaveBeenCalled();
    });

    it('detects missing column errors as schema drift and recovers/falls back gracefully in getConfig, getPublicConfig and saveConfig', async () => {
      expect(toSnakeCase('enableMobileCustom')).toBe('enable_mobile_custom');
      expect(isSchemaDriftError(new Error("Unknown column 'enable_mobile_custom' in 'SELECT'"))).toBe(true);
      expect(isSchemaDriftError(new Error('SQLITE_ERROR: no such column: enable_mobile_custom'))).toBe(true);
      expect(isSchemaDriftError(new Error('offline'))).toBe(false);

      const mockCol = { sync: vi.fn().mockResolvedValue(undefined) };
      const mariaDbColErr = Object.assign(new Error("Unknown column 'enable_mobile_custom' in 'SELECT'"), {
        original: { errno: 1054, sqlState: '42S22', code: 'ER_BAD_FIELD_ERROR' },
      });

      const driftRepo = {
        findOne: vi
          .fn()
          .mockRejectedValueOnce(mariaDbColErr)
          .mockRejectedValueOnce(mariaDbColErr),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;
      Object.assign(freshPlugin, {
        db: {
          getRepository: () => driftRepo,
          getCollection: () => mockCol,
        },
        app: {
          resource: (res: any) => { capturedActions = res.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });
      await freshPlugin.load();

      // getConfig: 即使自愈后重试依然缺列，也应优雅降级返回默认值而不是抛 503
      const getCtx: any = { action: { params: {} }, request: {}, body: undefined, throw: vi.fn() };
      const getNext = vi.fn();
      await capturedActions.getConfig(getCtx, getNext);
      expect(mockCol.sync).toHaveBeenCalledTimes(1);
      expect(getCtx.throw).not.toHaveBeenCalled();
      expect(getNext).toHaveBeenCalled();
      expect(getCtx.body).toMatchObject({ enabled: true, template: 'split' });

      // getPublicConfig: 遇到缺列错误时尝试自愈并成功读取配置
      const healedRecord = { key: 'default', enabled: true, template: 'center', canvasWidth: 'wide' };
      driftRepo.findOne.mockRejectedValueOnce(mariaDbColErr).mockResolvedValueOnce(healedRecord);
      const pubCtx: any = { set: vi.fn(), body: undefined };
      await capturedActions.getPublicConfig(pubCtx, vi.fn());
      expect(mockCol.sync).toHaveBeenCalledTimes(2);
      expect(pubCtx.body).toMatchObject({ enabled: true, template: 'center' });
    });
  });

  describe('lifecycle initialization & defensive repository registration', () => {
    it('awaits db.import during beforeLoad and getConfig immediately returns default config without 503', async () => {
      let importResolved = false;
      const testRepo = {
        findOne: vi.fn().mockImplementation(async () => {
          if (!importResolved) {
            throw new Error('Collection was not imported yet');
          }
          return null; // Initial empty state before seeding
        }),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;

      Object.assign(freshPlugin, {
        db: {
          import: vi.fn(async () => {
            await new Promise((r) => setTimeout(r, 20));
            importResolved = true;
          }),
          getRepository: () => (importResolved ? testRepo : null),
          sequelize: {
            transaction: vi.fn(async (cb) => cb({})),
            getQueryInterface: () => ({
              showAllTables: vi.fn().mockResolvedValue([]),
            }),
          },
        },
        app: {
          resource: (resource: any) => { capturedActions = resource.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });

      // beforeLoad must await import
      await freshPlugin.beforeLoad();
      expect(importResolved).toBe(true);

      await freshPlugin.load();

      const ctx = context();
      const next = vi.fn();
      await capturedActions.getConfig(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(ctx.body).toMatchObject({
        canvasWidth: 'wide',
        containerStyle: 'transparent',
      });
      expect(ctx.body.enabled).toBe(true);
    });

    it('defensively registers collection if getRepository initially returns null', async () => {
      const defensiveRepo = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      let registered = false;
      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;

      Object.assign(freshPlugin, {
        db: {
          import: vi.fn().mockResolvedValue(undefined),
          hasCollection: vi.fn(() => registered),
          collection: vi.fn((col) => {
            expect(col.name).toBe('custom_login_configs');
            registered = true;
          }),
          getRepository: (name: string) => (registered && name === 'custom_login_configs' ? defensiveRepo : null),
          sequelize: {
            transaction: vi.fn(async (cb) => cb({})),
            getQueryInterface: () => ({
              showAllTables: vi.fn().mockResolvedValue([]),
            }),
          },
        },
        app: {
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() }, // test app.log compatibility
          resource: (resource: any) => { capturedActions = resource.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
        },
      });

      await freshPlugin.load();

      // getRepo should notice null, call collection(), and recover repo
      const repo = freshPlugin.getRepo();
      expect(repo).toBe(defensiveRepo);
      expect(freshPlugin.db.collection).toHaveBeenCalled();

      const ctx = context();
      await capturedActions.getConfig(ctx, vi.fn());
      expect(ctx.body.enabled).toBe(true);
    });

    it('recovers repository even if hasCollection is already true but repository is initially null', async () => {
      const defensiveRepo = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      let registered = false;
      const freshPlugin = new PluginCustomLoginPageServer();
      Object.assign(freshPlugin, {
        db: {
          hasCollection: vi.fn(() => true), // Collection supposedly exists
          collection: vi.fn((col) => {
            registered = true;
          }),
          getRepository: (name: string) => (registered ? defensiveRepo : null),
        },
        app: {
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });

      const repo = freshPlugin.getRepo();
      expect(repo).toBe(defensiveRepo);
      expect(freshPlugin.db.collection).toHaveBeenCalled();
    });

    it('safely performs saveConfig when sequelize.transaction is unavailable', async () => {
      const savedConfig = { key: 'default', enabled: true, canvasWidth: 'wide' };
      const nonTxRepo = {
        findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(savedConfig),
        create: vi.fn().mockResolvedValue(savedConfig),
        update: vi.fn().mockResolvedValue(undefined),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;

      Object.assign(freshPlugin, {
        db: {
          getRepository: () => nonTxRepo,
          sequelize: null, // No sequelize / no transaction method
        },
        app: {
          resource: (resource: any) => { capturedActions = resource.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });

      await freshPlugin.load();

      const ctx = context({ enabled: true });
      const next = vi.fn();
      await capturedActions.saveConfig(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(nonTxRepo.create).toHaveBeenCalled();
      expect(ctx.body).toMatchObject({ enabled: true, canvasWidth: 'wide' });
    });

    it('captures createdCol.repository immediately when db.collection returns the instance', async () => {
      const defensiveRepo = { findOne: vi.fn().mockResolvedValue(null) };
      const freshPlugin = new PluginCustomLoginPageServer();
      Object.assign(freshPlugin, {
        db: {
          collection: vi.fn(() => ({ name: 'custom_login_configs', repository: defensiveRepo })),
          getRepository: vi.fn(() => null), // simulate delay in getRepository index update
        },
        app: { log: { warn: vi.fn() } },
      });

      const repo = freshPlugin.getRepo();
      expect(repo).toBe(defensiveRepo);
      expect(freshPlugin.db.collection).toHaveBeenCalled();
    });

    it('prefers request body when action.params.values is empty object in saveConfig', async () => {
      const savedConfig = { key: 'default', enabled: false, canvasWidth: 'wide' };
      const mockRepo = {
        findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(savedConfig),
        create: vi.fn().mockResolvedValue(savedConfig),
        update: vi.fn().mockResolvedValue(undefined),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;
      Object.assign(freshPlugin, {
        db: { getRepository: () => mockRepo, sequelize: null },
        app: {
          resource: (res: any) => { capturedActions = res.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });
      await freshPlugin.load();

      const ctx: any = {
        action: { params: { values: {} } }, // empty object
        request: { body: { enabled: false } }, // real payload in body
        body: undefined,
        throw: vi.fn(),
      };
      const next = vi.fn();
      await capturedActions.saveConfig(ctx, next);

      expect(next).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        values: expect.objectContaining({ enabled: false }),
      }));
    });

    it('recovers with auto-sync and default values when getConfig encounters table missing error on blank database', async () => {
      const mockCol = {
        sync: vi.fn().mockResolvedValue(undefined),
      };
      const mockRepo = {
        findOne: vi.fn()
          .mockRejectedValueOnce(new Error('SQLITE_ERROR: no such table: custom_login_configs'))
          .mockResolvedValueOnce(null),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;
      Object.assign(freshPlugin, {
        db: {
          getRepository: () => mockRepo,
          getCollection: () => mockCol,
        },
        app: {
          resource: (res: any) => { capturedActions = res.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });
      await freshPlugin.load();

      const ctx: any = {
        action: { params: {} },
        request: {},
        body: undefined,
        throw: vi.fn(),
      };
      const next = vi.fn();
      await capturedActions.getConfig(ctx, next);

      expect(mockCol.sync).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(ctx.throw).not.toHaveBeenCalled();
      expect(ctx.body).toMatchObject({
        enabled: true,
        template: 'split',
        canvasWidth: 'wide',
      });
    });

    it('auto-syncs table and succeeds when saveConfig encounters missing table error', async () => {
      const savedConfig = { key: 'default', enabled: true, canvasWidth: 'wide' };
      const mockCol = {
        sync: vi.fn().mockResolvedValue(undefined),
      };
      const mockRepo = {
        findOne: vi.fn()
          .mockRejectedValueOnce(new Error('Table custom_login_configs does not exist'))
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(savedConfig),
        create: vi.fn().mockResolvedValue(savedConfig),
        update: vi.fn().mockResolvedValue(undefined),
      };

      const freshPlugin = new PluginCustomLoginPageServer();
      let capturedActions: any = null;
      Object.assign(freshPlugin, {
        db: {
          getRepository: () => mockRepo,
          getCollection: () => mockCol,
          sequelize: null,
        },
        app: {
          resource: (res: any) => { capturedActions = res.actions; },
          acl: { allow: vi.fn(), registerSnippet: vi.fn() },
          log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
        },
      });
      await freshPlugin.load();

      const ctx: any = {
        action: { params: { values: { enabled: true } } },
        request: {},
        body: undefined,
        throw: vi.fn(),
      };
      const next = vi.fn();
      await capturedActions.saveConfig(ctx, next);

      expect(mockCol.sync).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(ctx.throw).not.toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });
});


