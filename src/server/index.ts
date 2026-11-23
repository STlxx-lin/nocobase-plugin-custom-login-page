import { Plugin } from '@nocobase/server';
import { DataTypes } from '@nocobase/database';
import path from 'path';
import { triggerWorkflowAction } from './actions/trigger-workflow';
import { getCaptchaAction } from './actions/captcha';
import customLoginConfigsCollection from './collections/custom-login-configs';

const DEFAULT_PRESET_GRID_SCHEMA = {
  use: 'LoginPageBlockGridModel',
  uid: 'custom_login_page_grid',
  props: {
    colGap: 24,
    rowGap: 24,
    layout: {
      version: 2,
      rows: [
        {
          id: 'row_login_main',
          cells: [
            {
              id: 'row_login_main:cell:0',
              items: ['hero_block_001', 'features_block_001'],
            },
            {
              id: 'row_login_main:cell:1',
              items: ['signin_form_block_001'],
            },
          ],
          sizes: [14, 10],
        },
      ],
    },
  },
  subModels: {
    items: [
      {
        uid: 'hero_block_001',
        use: 'CustomHeroBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          title: '驱动企业数字化新未来',
          subtitle: '基于灵活可扩展的现代无代码与插件化体系，提供端到端企业级应用解决方案。',
          badge: '全新数字化协同架构',
          align: 'left',
          textColor: '#ffffff',
        },
      },
      {
        uid: 'features_block_001',
        use: 'CustomFeaturesBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          columns: 3,
          cardBg: 'rgba(255, 255, 255, 0.12)',
          textColor: '#ffffff',
          items: [
            {
              icon: 'RocketOutlined',
              title: '极速敏捷扩展',
              desc: '插件化架构，按需加载，随心编排专属业务模型与自定义流程。',
            },
            {
              icon: 'SafetyCertificateOutlined',
              title: '全方位安全合规',
              desc: '细粒度 RBAC 权限控制体系与行为审计，全链路守护企业数据资产。',
            },
            {
              icon: 'ThunderboltOutlined',
              title: '全球化生态支持',
              desc: '支持多语言、多时区与分布式部署，随时随地触达全球业务。',
            },
          ],
        },
      },
      {
        uid: 'signin_form_block_001',
        use: 'SignInFormBlockModel',
        parentId: 'custom_login_page_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          title: '欢迎登录',
          subtitle: '请输入您的账号密码开启高效协同',
          cardBg: 'rgba(255, 255, 255, 0.94)',
        },
      },
    ],
  },
};

const DEFAULT_PRESET_MOBILE_GRID_SCHEMA = {
  use: 'LoginPageBlockGridModel',
  uid: 'custom_login_page_mobile_grid',
  props: {
    colGap: 16,
    rowGap: 20,
    layout: {
      version: 2,
      rows: [
        {
          id: 'row_mobile_login_main',
          cells: [
            {
              id: 'row_mobile_login_main:cell:0',
              items: ['signin_form_block_mobile_001'],
            },
          ],
          sizes: [24],
        },
      ],
    },
  },
  subModels: {
    items: [
      {
        uid: 'signin_form_block_mobile_001',
        use: 'SignInFormBlockModel',
        parentId: 'custom_login_page_mobile_grid',
        subKey: 'items',
        subType: 'array',
        props: {
          title: '欢迎登录',
          subtitle: '请输入账号密码登录系统',
          cardBg: 'rgba(255, 255, 255, 0.95)',
        },
      },
    ],
  },
};

const DEFAULT_CONFIG_VALUES = {
  gridSchema: DEFAULT_PRESET_GRID_SCHEMA,
  key: 'default',
  enabled: true,
  template: 'split',
  canvasParentId: 'custom_login_canvas_page',
  canvasWidth: 'wide',
  containerStyle: 'transparent',
  leftSpanRatio: 62,
  customBlocks: [],
  allowedWorkflowKeys: [],
  rateLimitPerMinute: 15,
  enableMobileCustom: false,
  mobileGridSchema: null,
  enableMobileTheme: false,
  mobileThemeConfig: {},
  mobileContainerStyle: 'transparent',
  themeConfig: {
    brandTitle: 'NocoBase',
    brandSubtitle: '企业级无代码应用构建与协作平台',
    brandLogo: '',
    brandPosterUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80',
    primaryColor: '#1677ff',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%)',
    copyright: 'Copyright © 2026 NocoBase. All rights reserved.',
    icp: '',
  },
};

const PUBLIC_CONFIG_CACHE_KEY = 'custom_login:public_config';

export { DEFAULT_PRESET_GRID_SCHEMA, DEFAULT_PRESET_MOBILE_GRID_SCHEMA, DEFAULT_CONFIG_VALUES, PUBLIC_CONFIG_CACHE_KEY };

const ALLOWED_CONFIG_KEYS = [
  'enabled',
  'template',
  'canvasParentId',
  'canvasWidth',
  'containerStyle',
  'leftSpanRatio',
  'themeConfig',
  'customBlocks',
  'gridSchema',
  'allowedWorkflowKeys',
  'rateLimitPerMinute',
  'enableMobileCustom',
  'mobileGridSchema',
  'enableMobileTheme',
  'mobileThemeConfig',
  'mobileContainerStyle',
];

const sanitizeConfigValues = (input: any) => {
  if (!input || typeof input !== 'object') return {};
  const sanitized: Record<string, any> = {};
  for (const key of ALLOWED_CONFIG_KEYS) {
    if (key in input) {
      sanitized[key] = input[key];
    }
  }
  if ('rateLimitPerMinute' in sanitized) {
    const limit = parseInt(sanitized.rateLimitPerMinute, 10);
    sanitized.rateLimitPerMinute = !isNaN(limit) && limit > 0 && limit <= 600 ? limit : 15;
  }
  if ('canvasWidth' in sanitized) {
    if (!['standard', 'wide', 'full'].includes(sanitized.canvasWidth)) {
      sanitized.canvasWidth = 'wide';
    }
  }
  if ('containerStyle' in sanitized) {
    if (!['transparent', 'glass', 'card', 'dark-card'].includes(sanitized.containerStyle)) {
      sanitized.containerStyle = 'transparent';
    }
  }
  if ('mobileContainerStyle' in sanitized) {
    if (!['transparent', 'glass', 'card', 'dark-card'].includes(sanitized.mobileContainerStyle)) {
      sanitized.mobileContainerStyle = 'transparent';
    }
  }
  if ('enableMobileCustom' in sanitized) {
    sanitized.enableMobileCustom = Boolean(sanitized.enableMobileCustom);
  }
  if ('enableMobileTheme' in sanitized) {
    sanitized.enableMobileTheme = Boolean(sanitized.enableMobileTheme);
  }
  return sanitized;
};

const MOBILE_COLUMNS_FALLBACK = [
  { name: 'enableMobileCustom', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
  { name: 'mobileGridSchema', type: DataTypes.TEXT, options: { allowNull: true } },
  { name: 'enableMobileTheme', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
  { name: 'mobileThemeConfig', type: DataTypes.TEXT, options: { defaultValue: '{}' } },
  { name: 'mobileContainerStyle', type: DataTypes.STRING(255), options: { defaultValue: 'transparent' } },
];

export const toSnakeCase = (name: string): string =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

export const isSchemaDriftError = (err: any): boolean => {
  const errMsg = String(err?.message || err || '').toLowerCase();
  const code = String(err?.original?.code || err?.parent?.code || err?.code || '').toUpperCase();
  const errno = Number(err?.original?.errno ?? err?.parent?.errno ?? err?.errno);
  const sqlState = String(err?.original?.sqlState || err?.parent?.sqlState || err?.sqlState || '').toUpperCase();

  return (
    errMsg.includes('no such table') ||
    errMsg.includes("doesn't exist") ||
    errMsg.includes('does not exist') ||
    errMsg.includes('relation') ||
    errMsg.includes('unknown column') ||
    errMsg.includes('no such column') ||
    errMsg.includes('has no column') ||
    errMsg.includes('invalid column') ||
    code === 'ER_BAD_FIELD_ERROR' ||
    code === 'ER_NO_SUCH_TABLE' ||
    code === '42703' ||
    code === '42P01' ||
    errno === 1054 ||
    errno === 1146 ||
    sqlState === '42S22' ||
    sqlState === '42S02'
  );
};

const hasColumnInDescription = (description: Record<string, any>, columnName: string): boolean => {
  if (!description || typeof description !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(description, columnName)) return true;
  const lower = columnName.toLowerCase();
  return Object.keys(description).some((key) => key.toLowerCase() === lower);
};

const safeParse = (val: any, fallback: any) => {
  if (!val) return fallback;
  if (typeof val === 'object' && val !== null) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' && parsed !== null ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

export class PluginCustomLoginPageServer extends Plugin {
  private cachedPublicConfig: any = null;
  private lastCacheTime = 0;
  private readonly CACHE_TTL_MS = 60000;

  private getAppLogger() {
    return (this.app as any)?.logger || (this.app as any)?.log;
  }

  private logError(message: string, err?: any) {
    const logger = this.getAppLogger();
    const detail = err ? (err.stack || err.message || String(err)) : '';
    const fullMsg = detail ? `[CustomLoginPage] ${message}: ${detail}` : `[CustomLoginPage] ${message}`;
    if (logger?.error) {
      logger.error(fullMsg);
    } else if (logger?.warn) {
      logger.warn(fullMsg);
    } else {
      console.error(fullMsg);
    }
  }

  private logWarn(message: string, err?: any) {
    const logger = this.getAppLogger();
    const detail = err ? (err.message || String(err)) : '';
    const fullMsg = detail ? `[CustomLoginPage] ${message}: ${detail}` : `[CustomLoginPage] ${message}`;
    if (logger?.warn) {
      logger.warn(fullMsg);
    } else if (logger?.info) {
      logger.info(fullMsg);
    } else {
      console.warn(fullMsg);
    }
  }

  private logInfo(message: string) {
    const logger = this.getAppLogger();
    const fullMsg = `[CustomLoginPage] ${message}`;
    if (logger?.info) {
      logger.info(fullMsg);
    } else {
      console.info(fullMsg);
    }
  }

  /**
   * 优先从分布式缓存（Redis/app.cache）读取，未命中则读取本地内存缓存
   */
  async getPublicConfigFromCache(): Promise<any> {
    if ((this.app as any)?.cache?.get) {
      try {
        const cached = await (this.app as any).cache.get(PUBLIC_CONFIG_CACHE_KEY);
        if (cached) {
          return cached;
        }
      } catch (err: any) {
        this.logWarn('Distributed cache read failed, fallback to memory', err);
      }
    }
    const now = Date.now();
    if (this.cachedPublicConfig && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.cachedPublicConfig;
    }
    return null;
  }

  /**
   * 同步写入分布式缓存（Redis）及本地内存，保障 K8s 多 Pod 节点毫秒级同步
   */
  async setPublicConfigCache(config: any): Promise<void> {
    this.cachedPublicConfig = config;
    this.lastCacheTime = Date.now();

    if ((this.app as any)?.cache?.set) {
      try {
        await (this.app as any).cache.set(PUBLIC_CONFIG_CACHE_KEY, config, this.CACHE_TTL_MS);
      } catch (err: any) {
        this.logWarn('Distributed cache write failed', err);
      }
    }
  }

  /**
   * 清除分布式及本地缓存
   */
  async clearPublicConfigCache(): Promise<void> {
    this.cachedPublicConfig = null;
    this.lastCacheTime = 0;

    if ((this.app as any)?.cache?.del) {
      try {
        await (this.app as any).cache.del(PUBLIC_CONFIG_CACHE_KEY);
      } catch (err: any) {
        this.logWarn('Distributed cache del failed', err);
      }
    }
  }

  async afterAdd() {}

  async beforeLoad() {
    if (typeof this.db?.import === 'function') {
      await this.db.import({
        directory: path.resolve(__dirname, 'collections'),
      });
    }
  }

  async install() {
    // 首次激活插件时初始化默认配置种子记录，彻底避免在运行时读接口中产生写竞争
    try {
      await this.autoHealSchema();
      const repo = this.getRepo();
      if (repo) {
        const existing = await repo.findOne({ filter: { key: 'default' } });
        if (!existing) {
          await repo.create({ values: DEFAULT_CONFIG_VALUES });
        }
      }
    } catch (err: any) {
      this.logWarn('Failed to seed default configuration', err);
    }
  }

  getRepo() {
    let repo = this.db?.getRepository?.('custom_login_configs') || (this.db?.getCollection?.('custom_login_configs') as any)?.repository;
    if (!repo && this.db) {
      try {
        let createdCol: any = null;
        if (typeof this.db.collection === 'function') {
          createdCol = this.db.collection(customLoginConfigsCollection);
        }
        repo = (createdCol as any)?.repository || this.db.getRepository?.('custom_login_configs') || (this.db.getCollection?.('custom_login_configs') as any)?.repository;
      } catch (err: any) {
        this.logWarn('Defensive registration of custom_login_configs collection encountered error', err);
      }
    }
    return repo || null;
  }

  private isUnderscored(): boolean {
    if (typeof this.db?.options?.underscored === 'boolean') {
      return this.db.options.underscored;
    }
    const sequelizeUnderscored = (this.db?.sequelize as any)?.options?.define?.underscored;
    if (typeof sequelizeUnderscored === 'boolean') {
      return sequelizeUnderscored;
    }
    return process.env.DB_UNDERSCORED === 'true';
  }

  /**
   * 自动自愈式表结构校验与无感迁移：
   * 优先通过 NocoBase Collection.sync() 按 ORM 映射（兼容 DB_UNDERSCORED=true 与表前缀/Schema）补齐缺失列，
   * 避免硬编码驼峰列名导致 DB_UNDERSCORED=true 下出现 1054 Unknown column 异常。
   */
  async autoHealSchema(forceSyncOnNoQueryInterface = false): Promise<void> {
    try {
      const col = this.db?.getCollection?.('custom_login_configs');
      const queryInterface = this.db?.sequelize?.getQueryInterface?.();
      if (!queryInterface) {
        if (forceSyncOnNoQueryInterface && typeof col?.sync === 'function') {
          this.logInfo('Auto-healing schema via collection.sync()');
          await col.sync();
        }
        return;
      }

      const rawTableName =
        (typeof col?.getTableNameWithSchema === 'function' ? col.getTableNameWithSchema() : null) ||
        (typeof col?.model?.getTableName === 'function' ? col.model.getTableName() : null) ||
        'custom_login_configs';
      const plainTableName =
        typeof rawTableName === 'string' ? rawTableName : rawTableName?.tableName || 'custom_login_configs';

      const tables = await queryInterface.showAllTables();
      const tableExists = tables.some((t: any) => {
        const name = typeof t === 'string' ? t : t?.tableName;
        return name === plainTableName || name?.toLowerCase() === plainTableName.toLowerCase();
      });
      if (!tableExists) {
        if (typeof col?.sync === 'function') {
          this.logInfo(`Table ${plainTableName} does not exist in DB, auto-syncing collection to create table`);
          await col.sync();
        }
        return;
      }

      const underscored = this.isUnderscored();
      const rawAttributes = col?.model?.rawAttributes;
      const resolveColumnName = (fieldName: string): string => {
        const mapped = rawAttributes?.[fieldName]?.field;
        if (mapped) return mapped;
        return underscored ? toSnakeCase(fieldName) : fieldName;
      };

      const expectedColumns: string[] =
        rawAttributes && Object.keys(rawAttributes).length > 0
          ? Object.entries(rawAttributes).map(([attrName, attr]: [string, any]) => attr?.field || resolveColumnName(attrName))
          : MOBILE_COLUMNS_FALLBACK.map((c) => resolveColumnName(c.name));

      const description = await queryInterface.describeTable(rawTableName);
      const missingColumns = expectedColumns.filter((colName) => !hasColumnInDescription(description, colName));

      if (missingColumns.length === 0) {
        return;
      }

      if (typeof col?.sync === 'function') {
        this.logInfo(
          `Auto-healing schema: syncing collection ${plainTableName} for missing columns (${missingColumns.join(', ')})`
        );
        await col.sync();
        return;
      }

      for (const item of MOBILE_COLUMNS_FALLBACK) {
        const columnName = resolveColumnName(item.name);
        if (!hasColumnInDescription(description, columnName)) {
          this.logInfo(`Auto-healing schema: adding missing column ${columnName} to ${plainTableName}`);
          await queryInterface.addColumn(rawTableName, columnName, {
            type: item.type,
            ...item.options,
          });
        }
      }
    } catch (err: any) {
      this.logWarn('Auto-healing schema check skipped/failed', err);
    }
  }

  async load() {
    // 启动时自动执行表结构自愈检测
    await this.autoHealSchema();

    // 注册资源
    this.app.resource({
      name: 'customLoginPage',
      actions: {
        getPublicConfig: async (ctx, next) => {
          ctx.set?.('Cache-Control', 'no-cache, no-store, must-revalidate');

          const cached = await this.getPublicConfigFromCache();
          if (cached) {
            ctx.body = cached;
            await next();
            return;
          }

          let record: any = null;
          try {
            const repo = this.getRepo();
            if (repo) {
              record = await repo.findOne({ filter: { key: 'default' } });
            }
          } catch (err: any) {
            if (isSchemaDriftError(err)) {
              this.logError('Schema drift detected while reading public config, attempting auto-heal', err);
              try {
                await this.autoHealSchema(true);
                const repo = this.getRepo();
                if (repo) {
                  record = await repo.findOne({ filter: { key: 'default' } });
                }
              } catch (healErr: any) {
                this.logWarn('Failed to recover public config after schema auto-heal', healErr);
                ctx.body = this.cachedPublicConfig || { enabled: false };
                await next();
                return;
              }
            } else {
              this.logWarn('Failed to read public config', err);
              // Never replace a working page with defaults during a database outage.
              ctx.body = this.cachedPublicConfig || { enabled: false };
              await next();
              return;
            }
          }

          const rawRecord = (record?.toJSON ? record.toJSON() : record) || DEFAULT_CONFIG_VALUES;

          const publicConfig = {
            enabled: rawRecord.enabled ?? true,
            template: rawRecord.template || 'split',
            canvasWidth: rawRecord.canvasWidth || 'wide',
            containerStyle: rawRecord.containerStyle || 'transparent',
            leftSpanRatio: rawRecord.leftSpanRatio,
            canvasParentId: rawRecord.canvasParentId || 'custom_login_canvas_page',
            themeConfig: safeParse(rawRecord.themeConfig, DEFAULT_CONFIG_VALUES.themeConfig),
            customBlocks: safeParse(rawRecord.customBlocks, []),
            gridSchema: safeParse(rawRecord.gridSchema, DEFAULT_PRESET_GRID_SCHEMA),
            enableMobileCustom: Boolean(rawRecord.enableMobileCustom),
            mobileGridSchema: safeParse(rawRecord.mobileGridSchema, null),
            enableMobileTheme: Boolean(rawRecord.enableMobileTheme),
            mobileThemeConfig: safeParse(rawRecord.mobileThemeConfig, {}),
            mobileContainerStyle: rawRecord.mobileContainerStyle || 'transparent',
          };

          await this.setPublicConfigCache(publicConfig);
          ctx.body = publicConfig;
          await next();
        },

        getConfig: async (ctx, next) => {
          let record: any = null;
          try {
            const repo = this.getRepo();
            if (!repo) throw new Error('Configuration repository is unavailable');
            record = await repo.findOne({ filter: { key: 'default' } });
          } catch (err: any) {
            this.logError('Failed to read config', err);
            // 降级策略：检测是否由于缺表或缺列导致（空白数据库/版本升级 Schema 漂移），若是则尝试自愈并优雅降级
            const schemaDrift = isSchemaDriftError(err);
            if (schemaDrift) {
              try {
                this.logInfo('Schema drift detected on getConfig (missing table or column), auto-healing schema...');
                await this.autoHealSchema(true);
                const repo = this.getRepo();
                record = await repo?.findOne?.({ filter: { key: 'default' } });
              } catch (syncErr: any) {
                this.logWarn('Auto-heal schema on getConfig failed, falling back to default config', syncErr);
              }
            }
            // 若数据库发生真实故障（如网络断开/离线），必须安全抛出 503 阻止前端覆盖已有页面
            if (!record && !schemaDrift) {
              ctx.throw(503, 'Configuration could not be loaded. Please retry.');
            }
          }

          const rawRecord = (record?.toJSON ? record.toJSON() : record) || this.cachedPublicConfig || DEFAULT_CONFIG_VALUES;

          ctx.body = {
            ...rawRecord,
            canvasWidth: rawRecord.canvasWidth || 'wide',
            themeConfig: safeParse(rawRecord.themeConfig, DEFAULT_CONFIG_VALUES.themeConfig),
            customBlocks: safeParse(rawRecord.customBlocks, []),
            gridSchema: safeParse(rawRecord.gridSchema, DEFAULT_PRESET_GRID_SCHEMA),
            enableMobileCustom: Boolean(rawRecord.enableMobileCustom),
            mobileGridSchema: safeParse(rawRecord.mobileGridSchema, null),
            enableMobileTheme: Boolean(rawRecord.enableMobileTheme),
            mobileThemeConfig: safeParse(rawRecord.mobileThemeConfig, {}),
            mobileContainerStyle: rawRecord.mobileContainerStyle || 'transparent',
          };
          await next();
        },

        saveConfig: async (ctx, next) => {
          const getValidObject = (obj: any) =>
            obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0 ? obj : null;

          const rawValues =
            getValidObject(ctx.action?.params?.values) ||
            getValidObject(ctx.request?.body?.values) ||
            getValidObject(ctx.request?.body) ||
            getValidObject(ctx.action?.params) ||
            ctx.action?.params?.values ||
            ctx.request?.body?.values ||
            ctx.request?.body ||
            {};
          const values = sanitizeConfigValues(rawValues);
          let record: any = null;

          try {
            const repo = this.getRepo();
            if (!repo) throw new Error('Configuration repository is unavailable');
            const executeSave = async (transaction?: any) => {
              const findOptions = transaction ? { filter: { key: 'default' }, transaction } : { filter: { key: 'default' } };
              let existing: any = null;
              try {
                existing = await repo.findOne(findOptions);
              } catch (findErr: any) {
                if (isSchemaDriftError(findErr)) {
                  await this.autoHealSchema(true);
                  existing = await repo.findOne(findOptions);
                } else {
                  throw findErr;
                }
              }
              if (!existing) {
                return repo.create({
                  values: { ...DEFAULT_CONFIG_VALUES, ...values, key: 'default' },
                  ...(transaction ? { transaction } : {}),
                });
              }
              await repo.update({
                filter: { key: 'default' },
                values,
                ...(transaction ? { transaction } : {}),
              });
              const saved = await repo.findOne(findOptions);
              if (!saved) throw new Error('Saved configuration could not be read back');
              return saved;
            };

            if (typeof this.db?.sequelize?.transaction === 'function') {
              record = await this.db.sequelize.transaction(executeSave);
            } else {
              record = await executeSave();
            }
            if (!record) throw new Error('Configuration was not saved');
          } catch (err: any) {
            this.logError('Failed to save config', err);
            ctx.throw(503, 'Configuration could not be saved. Please retry.');
          }

          const rawRecord = record?.toJSON ? record.toJSON() : record;
          const fullConfig = {
            ...rawRecord,
            canvasWidth: rawRecord.canvasWidth || 'wide',
            themeConfig: safeParse(rawRecord.themeConfig, DEFAULT_CONFIG_VALUES.themeConfig),
            customBlocks: safeParse(rawRecord.customBlocks, []),
            gridSchema: safeParse(rawRecord.gridSchema, DEFAULT_PRESET_GRID_SCHEMA),
            enableMobileCustom: Boolean(rawRecord.enableMobileCustom),
            mobileGridSchema: safeParse(rawRecord.mobileGridSchema, null),
            enableMobileTheme: Boolean(rawRecord.enableMobileTheme),
            mobileThemeConfig: safeParse(rawRecord.mobileThemeConfig, {}),
            mobileContainerStyle: rawRecord.mobileContainerStyle || 'transparent',
          };

          const publicConfig = {
            enabled: fullConfig.enabled ?? true,
            template: fullConfig.template || 'split',
            canvasWidth: fullConfig.canvasWidth || 'wide',
            containerStyle: fullConfig.containerStyle || 'transparent',
            leftSpanRatio: fullConfig.leftSpanRatio,
            canvasParentId: fullConfig.canvasParentId || 'custom_login_canvas_page',
            themeConfig: fullConfig.themeConfig,
            customBlocks: fullConfig.customBlocks,
            gridSchema: fullConfig.gridSchema,
            enableMobileCustom: fullConfig.enableMobileCustom,
            mobileGridSchema: fullConfig.mobileGridSchema,
            enableMobileTheme: fullConfig.enableMobileTheme,
            mobileThemeConfig: fullConfig.mobileThemeConfig,
            mobileContainerStyle: fullConfig.mobileContainerStyle,
          };

          // 立即同步更新分布式缓存（Redis）及本地内存，使所有 Pod 实例即刻生效
          await this.setPublicConfigCache(publicConfig);

          ctx.body = fullConfig;
          await next();
        },

        triggerWorkflow: triggerWorkflowAction,
        getCaptcha: getCaptchaAction,
      },
    });

    // 开放 ACL 权限
    this.app.acl.allow('customLoginPage', 'getPublicConfig', 'public');
    this.app.acl.allow('customLoginPage', 'triggerWorkflow', 'public');
    this.app.acl.allow('customLoginPage', 'getCaptcha', 'public');
    this.app.acl.allow('customLoginPage', 'getConfig', 'allowConfigure');
    this.app.acl.allow('customLoginPage', 'saveConfig', 'allowConfigure');

    // 注册标准插件权限代码片段 (Snippet)
    const pluginName = this.options?.name || this.name || 'custom-login-page';
    this.app.acl.registerSnippet({
      name: `pm.${pluginName}`,
      actions: ['customLoginPage:getConfig', 'customLoginPage:saveConfig'],
    });
  }
}

export default PluginCustomLoginPageServer;

// reload trigger 1789432821542
