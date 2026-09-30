import { Plugin } from '@nocobase/server';
import { DataTypes } from '@nocobase/database';
import path from 'path';
import { triggerWorkflowAction } from './actions/trigger-workflow';
import { getCaptchaAction } from './actions/captcha';

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
        this.app.logger?.warn?.(`[CustomLoginPage] Distributed cache read failed, fallback to memory: ${err.message}`);
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
        this.app.logger?.warn?.(`[CustomLoginPage] Distributed cache write failed: ${err.message}`);
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
        this.app.logger?.warn?.(`[CustomLoginPage] Distributed cache del failed: ${err.message}`);
      }
    }
  }

  async afterAdd() {}

  async beforeLoad() {
    this.db.import({
      directory: path.resolve(__dirname, 'collections'),
    });
  }

  async install() {
    // 首次激活插件时初始化默认配置种子记录，彻底避免在运行时读接口中产生写竞争
    try {
      const repo = this.getRepo();
      if (repo) {
        const existing = await repo.findOne({ filter: { key: 'default' } });
        if (!existing) {
          await repo.create({ values: DEFAULT_CONFIG_VALUES });
        }
      }
    } catch (err: any) {
      this.app.logger?.warn?.(`[CustomLoginPage] Failed to seed default configuration: ${err.message}`);
    }
  }

  getRepo() {
    return this.db.getRepository('custom_login_configs');
  }

  /**
   * 自动自愈式表结构校验与无感迁移：
   * 运行时检查并动态补齐移动端专属 5 个字段，避免因旧表结构缺失抛出 SQL 异常
   */
  async autoHealSchema(): Promise<void> {
    try {
      const queryInterface = this.db?.sequelize?.getQueryInterface?.();
      if (!queryInterface) return;
      const tableName = 'custom_login_configs';
      const tables = await queryInterface.showAllTables();
      const tableExists = tables.some((t: any) => {
        const name = typeof t === 'string' ? t : t?.tableName;
        return name === tableName || name?.toLowerCase() === tableName.toLowerCase();
      });
      if (!tableExists) return;

      const description = await queryInterface.describeTable(tableName);
      const columnsToAdd = [
        { name: 'enableMobileCustom', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileGridSchema', type: DataTypes.TEXT, options: { allowNull: true } },
        { name: 'enableMobileTheme', type: DataTypes.BOOLEAN, options: { defaultValue: false } },
        { name: 'mobileThemeConfig', type: DataTypes.TEXT, options: { defaultValue: '{}' } },
        { name: 'mobileContainerStyle', type: DataTypes.STRING(255), options: { defaultValue: 'transparent' } },
      ];

      for (const col of columnsToAdd) {
        if (!description[col.name]) {
          this.app.logger?.info?.(`[CustomLoginPage] Auto-healing schema: adding missing column ${col.name} to ${tableName}`);
          await queryInterface.addColumn(tableName, col.name, {
            type: col.type,
            ...col.options,
          });
        }
      }
    } catch (err: any) {
      this.app.logger?.warn?.(`[CustomLoginPage] Auto-healing schema check skipped/failed: ${err.message}`);
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
            this.app.logger?.warn?.(`[CustomLoginPage] Failed to read public config: ${err.message}`);
            // Never replace a working page with defaults during a database outage.
            ctx.body = this.cachedPublicConfig || { enabled: false };
            await next();
            return;
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
            this.app.logger?.error?.(`[CustomLoginPage] Failed to read config: ${err.message}`);
            ctx.throw(503, 'Configuration could not be loaded. Please retry.');
          }

          const rawRecord = (record?.toJSON ? record.toJSON() : record) || DEFAULT_CONFIG_VALUES;

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
          const rawValues = ctx.action?.params?.values || ctx.request?.body || {};
          const values = sanitizeConfigValues(rawValues);
          let record: any = null;

          try {
            const repo = this.getRepo();
            if (!repo) throw new Error('Configuration repository is unavailable');
            record = await this.db.sequelize.transaction(async (transaction) => {
              const existing = await repo.findOne({ filter: { key: 'default' }, transaction });
              if (!existing) {
                return repo.create({ values: { ...DEFAULT_CONFIG_VALUES, ...values, key: 'default' }, transaction });
              }
              await repo.update({ filter: { key: 'default' }, values, transaction });
              const saved = await repo.findOne({ filter: { key: 'default' }, transaction });
              if (!saved) throw new Error('Saved configuration could not be read back');
              return saved;
            });
            if (!record) throw new Error('Configuration was not saved');
          } catch (err: any) {
            this.app.logger?.error?.(`[CustomLoginPage] Failed to save config: ${err.message}`);
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
