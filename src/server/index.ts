import { Plugin } from '@nocobase/server';
import path from 'path';
import { triggerWorkflowAction } from './actions/trigger-workflow';

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

export { DEFAULT_PRESET_GRID_SCHEMA, DEFAULT_CONFIG_VALUES };

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

  async load() {
    // 注册资源
    this.app.resource({
      name: 'customLoginPage',
      actions: {
        getPublicConfig: async (ctx, next) => {
          const now = Date.now();
          if (this.cachedPublicConfig && now - this.lastCacheTime < this.CACHE_TTL_MS) {
            ctx.body = this.cachedPublicConfig;
            await next();
            return;
          }

          let record: any = null;
          try {
            const repo = this.getRepo();
            if (repo) {
              record = await repo.findOne({ filter: { key: 'default' } });
            }
          } catch (e) {
            // 数据库未同步或异常时平滑降级为预设配置
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
          };

          this.cachedPublicConfig = publicConfig;
          this.lastCacheTime = now;
          ctx.body = publicConfig;
          await next();
        },

        getConfig: async (ctx, next) => {
          let record: any = null;
          try {
            const repo = this.getRepo();
            if (repo) {
              record = await repo.findOne({ filter: { key: 'default' } });
            }
          } catch (e) {
            // 数据库未同步或异常时平滑降级
          }

          const rawRecord = (record?.toJSON ? record.toJSON() : record) || DEFAULT_CONFIG_VALUES;

          ctx.body = {
            ...rawRecord,
            canvasWidth: rawRecord.canvasWidth || 'wide',
            themeConfig: safeParse(rawRecord.themeConfig, DEFAULT_CONFIG_VALUES.themeConfig),
            customBlocks: safeParse(rawRecord.customBlocks, []),
            gridSchema: safeParse(rawRecord.gridSchema, DEFAULT_PRESET_GRID_SCHEMA),
          };
          await next();
        },

        saveConfig: async (ctx, next) => {
          const rawValues = ctx.action?.params?.values || ctx.request?.body || {};
          const values = sanitizeConfigValues(rawValues);
          let record: any = null;

          try {
            const repo = this.getRepo();
            if (repo) {
              const existing = await repo.findOne({ filter: { key: 'default' } });
              if (!existing) {
                record = await repo.create({ values: { ...DEFAULT_CONFIG_VALUES, ...values, key: 'default' } });
              } else {
                await repo.update({ filter: { key: 'default' }, values });
                record = await repo.findOne({ filter: { key: 'default' } });
              }
            }
          } catch (err: any) {
            this.app.logger?.error?.(`[CustomLoginPage] Failed to save config: ${err.message}`);
          }

          const rawRecord = (record?.toJSON ? record.toJSON() : record) || { ...DEFAULT_CONFIG_VALUES, ...values };
          const fullConfig = {
            ...rawRecord,
            canvasWidth: rawRecord.canvasWidth || 'wide',
            themeConfig: safeParse(rawRecord.themeConfig, DEFAULT_CONFIG_VALUES.themeConfig),
            customBlocks: safeParse(rawRecord.customBlocks, []),
            gridSchema: safeParse(rawRecord.gridSchema, DEFAULT_PRESET_GRID_SCHEMA),
          };

          // 立即更新内存缓存，使公网前台即刻生效，无需等待 TTL
          this.cachedPublicConfig = {
            enabled: fullConfig.enabled ?? true,
            template: fullConfig.template || 'split',
            canvasWidth: fullConfig.canvasWidth || 'wide',
            containerStyle: fullConfig.containerStyle || 'transparent',
            leftSpanRatio: fullConfig.leftSpanRatio,
            canvasParentId: fullConfig.canvasParentId || 'custom_login_canvas_page',
            themeConfig: fullConfig.themeConfig,
            customBlocks: fullConfig.customBlocks,
            gridSchema: fullConfig.gridSchema,
          };
          this.lastCacheTime = Date.now();

          ctx.body = fullConfig;
          await next();
        },

        triggerWorkflow: triggerWorkflowAction,
      },
    });

    // 开放 ACL 权限
    this.app.acl.allow('customLoginPage', 'getPublicConfig', 'public');
    this.app.acl.allow('customLoginPage', 'triggerWorkflow', 'public');
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