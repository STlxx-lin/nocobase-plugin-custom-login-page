import React, { useEffect, useState } from 'react';
import { Plugin, useApp } from '@nocobase/client-v2';
import { CustomLoginContainer } from './components/CustomLoginContainer';
import { CustomLoginConfig } from './types';
import { useT } from './locale';
import { CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY } from './constants';
export { CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY };

const getInitialCachedConfig = (): { config: CustomLoginConfig | null; hasCached: boolean } => {
  if (typeof window === 'undefined') return { config: null, hasCached: false };
  try {
    const raw = localStorage.getItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY);
    if (!raw) return { config: null, hasCached: false };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { config: parsed, hasCached: true };
    }
  } catch (e) {}
  return { config: null, hasCached: false };
};

// 登录页包装组件
const EnhancedSignInPage: React.FC<{ originalSignInPage: React.ComponentType }> = ({
  originalSignInPage: OriginalSignInPage,
}) => {
  const t = useT();
  const app = useApp();
  const initialCache = React.useMemo(() => getInitialCachedConfig(), []);
  const [config, setConfig] = useState<CustomLoginConfig | null>(initialCache.config);
  const [loading, setLoading] = useState(!initialCache.hasCached);

  const safeParseJson = (val: any, fallback: any) => {
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

  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      try {
        let data: any = null;
        // 1. 优先使用 app.apiClient 官方标准请求客户端
        try {
          if (app?.apiClient) {
            const res = await app.apiClient.request({
              url: 'customLoginPage:getPublicConfig',
              skipAuth: true,
              skipNotify: true,
            });
            data = res?.data?.data || res?.data;
          }
        } catch (apiErr) {}

        // 2. 备用安全 fetch 请求（兼容极端代理环境）
        if (!data) {
          try {
            const publicPath = (window as any)?.__nocobase_public_path__ || '';
            const prefix = publicPath ? (publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath) : '';
            const resp = await fetch(`${prefix}/api/customLoginPage:getPublicConfig`);
            if (resp.ok) {
              const json = await resp.json();
              data = json?.data || json;
            }
          } catch (fetchErr) {}
        }

        if (mounted && data) {
          const formattedConfig: CustomLoginConfig = {
            enabled: data.enabled ?? true,
            template: data.template || 'split',
            canvasWidth: data.canvasWidth || 'wide',
            containerStyle: data.containerStyle || 'transparent',
            customBlocks: safeParseJson(data.customBlocks, []),
            gridSchema: safeParseJson(data.gridSchema, null),
            themeConfig: safeParseJson(data.themeConfig, {}),
            enableMobileCustom: Boolean(data.enableMobileCustom),
            mobileGridSchema: safeParseJson(data.mobileGridSchema, null),
            enableMobileTheme: Boolean(data.enableMobileTheme),
            mobileThemeConfig: safeParseJson(data.mobileThemeConfig, {}),
            mobileContainerStyle: data.mobileContainerStyle || 'transparent',
          };

          // SWR 写入最新配置缓存
          try {
            localStorage.setItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY, JSON.stringify(formattedConfig));
          } catch (e) {}

          setConfig(formattedConfig);
        }
      } catch (err) {
        // 接口未就绪或未启用
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadConfig();
    return () => {
      mounted = false;
    };
  }, [app]);

  // 智能双重判定（视口宽度 <= 768px 或 移动端设备 UA），支持窗口变动自适应响应
  const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    const isNarrow = window.innerWidth <= 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isNarrow || isMobileUA;
  };

  const [isMobile, setIsMobile] = useState<boolean>(() => checkIsMobile());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载中占位（仅首次无任何本地缓存时显示柔和居中指示，避免硬编码深蓝全屏导致的闪烁）
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ color: '#475569', fontSize: 15, fontWeight: 500 }}>{t('Loading sign-in page...')}</div>
      </div>
    );
  }

  // 若未启用自定义，直接渲染原生
  if (!config || !config.enabled) {
    return <OriginalSignInPage />;
  }

  const isMobileTarget = isMobile && Boolean(config.enableMobileCustom);

  return (
    <CustomLoginContainer
      config={config}
      designMode={false}
      viewportMode={isMobile ? 'mobile' : 'desktop'}
      activeTarget={isMobileTarget ? 'mobile' : 'desktop'}
      originalSignInPage={OriginalSignInPage}
    />
  );
};

export class PluginCustomLoginPageClientV2 extends Plugin {
  async load() {
    if (typeof window !== 'undefined') {
      (window as any).__nocobase_current_app__ = this.app;
      (window as any).__nocobase_v2_app__ = this.app;
      (window as any).__nocobase_v2_flow_engine__ = this.flowEngine;
    }

    // 1. 注册官方原生 BlockModel 到 FlowEngine (按规范使用 registerModelLoaders 懒加载)
    try {
      this.flowEngine?.registerModelLoaders?.({
        CustomLoginBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomLoginBlockModel),
        },
        LoginPageBlockGridModel: {
          loader: () => import('./components/LoginPageBlockGridCanvas').then((m) => m.LoginPageBlockGridModel),
        },
        SignInFormBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.SignInFormBlockModel),
        },
        CustomHeroBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomHeroBlockModel),
        },
        CustomFeaturesBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomFeaturesBlockModel),
        },
        CustomCarouselBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomCarouselBlockModel),
        },
        CustomStatsBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomStatsBlockModel),
        },
        CustomHtmlBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomHtmlBlockModel),
        },
        CustomImageBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomImageBlockModel),
        },
        CustomNoticeBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomNoticeBlockModel),
        },
        CustomPartnersBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomPartnersBlockModel),
        },
        CustomContactBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomContactBlockModel),
        },
        CustomLanguageBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomLanguageBlockModel),
        },
        CustomCountdownBlockModel: {
          loader: () => import('./models/CustomBlocks').then((m) => m.CustomCountdownBlockModel),
        },
      });
    } catch (e) {
      console.warn('注册 FlowEngine 自定义区块模型异常:', e);
    }

    // 2. 注册管理设置页面 (按规范使用 componentLoader 懒加载)
    const manager = (this.app as any).pluginSettingsManager;
    if (manager) {
      const title = this.t('Custom Login Page');
      const icon = 'LayoutOutlined';
      const menuKey = 'custom-login-page';
      const pageName = `${menuKey}.index`;

      if (typeof manager.addMenuItem === 'function' && typeof manager.addPageTabItem === 'function') {
        manager.addMenuItem({
          key: menuKey,
          title,
          icon,
          aclSnippet: 'pm',
        });

        manager.addPageTabItem({
          menuKey,
          key: 'index',
          title,
          icon,
          aclSnippet: 'pm',
          componentLoader: () => import('./pages/CustomLoginPageSettings').then((m) => m.CustomLoginPageSettings),
        });

        const pluginNames = [
          this.options?.name,
          this.options?.packageName,
          'custom-login-page',
          '@nocobase/plugin-custom-login-page',
        ].filter(Boolean);

        [...new Set(pluginNames)].forEach((pName) => {
          manager.setPluginSettingsLink?.(pName, pageName);
        });
      } else if (typeof manager.add === 'function') {
        manager.add(menuKey, {
          title,
          icon,
          aclSnippet: 'pm',
          componentLoader: () => import('./pages/CustomLoginPageSettings').then((m) => m.CustomLoginPageSettings),
        });
      }
    }

    // 3. 增强 /signin 路由：无缝包裹原生 SignInPage
    try {
      const authRoute: any = this.router.get('auth.signin');
      if (authRoute) {
        if (typeof authRoute.componentLoader === 'function') {
          const rawLoader = authRoute.componentLoader;
          authRoute.componentLoader = async () => {
            const originalModule = await rawLoader();
            const RawComponent = (originalModule && originalModule.default) || originalModule;
            return {
              default: () => <EnhancedSignInPage originalSignInPage={RawComponent} />,
            };
          };
        } else if (authRoute.Component) {
          const RawComponent = authRoute.Component;
          authRoute.Component = () => <EnhancedSignInPage originalSignInPage={RawComponent} />;
        }
      }
    } catch (e) {
      // 路由若尚未挂载，保证不阻塞应用加载
    }
  }
}

export default PluginCustomLoginPageClientV2;
