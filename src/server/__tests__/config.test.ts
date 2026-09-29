import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@nocobase/server', () => ({ Plugin: class {} }));
import { PluginCustomLoginPageServer } from '../index';

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
});

