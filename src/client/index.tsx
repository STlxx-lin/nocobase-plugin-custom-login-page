import React, { useEffect, useState } from 'react';
import { Plugin, useAPIClient } from '@nocobase/client';
import { useSystemSettings, SwitchLanguage, PoweredBy } from '@nocobase/client-v2';
import { AuthenticatorsContextProvider } from '@nocobase/plugin-auth/client';
import { Outlet } from 'react-router-dom';
import { theme, Spin } from 'antd';
import { CustomLoginContainer } from '../client-v2/components/CustomLoginContainer';
import { CustomLoginConfig } from '../client-v2/types';

const LazyCustomLoginPageSettings: React.FC = (props) => {
  const Component = React.useMemo(
    () => React.lazy(() => import('../client-v2/pages/CustomLoginPageSettings').then((m) => ({ default: m.CustomLoginPageSettings }))),
    []
  );
  return (
    <React.Suspense fallback={<div style={{ padding: '60px 0', textAlign: 'center' }}><Spin size="large" /></div>}>
      <Component {...props} />
    </React.Suspense>
  );
};

const getInitialCachedConfig = (): { config: CustomLoginConfig | null; hasCached: boolean } => {
  if (typeof window === 'undefined') return { config: null, hasCached: false };
  try {
    const raw = localStorage.getItem('nocobase_custom_login_public_config_v2');
    if (!raw) return { config: null, hasCached: false };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return { config: parsed, hasCached: true };
    }
  } catch (e) {}
  return { config: null, hasCached: false };
};

const CustomAuthLayout: React.FC = () => {
  const apiClient = useAPIClient();
  const initialCache = React.useMemo(() => getInitialCachedConfig(), []);
  const [config, setConfig] = useState<CustomLoginConfig | null>(initialCache.config);
  const [loading, setLoading] = useState(!initialCache.hasCached);
  const [systemTitle, setSystemTitle] = useState<string>(() => {
    return (window as any)?.__nocobase_cached_system_title || '';
  });

  const { token } = theme.useToken();
  let hookSettingsData: any = null;
  try {
    const settings = useSystemSettings();
    hookSettingsData = settings?.data;
  } catch (e) {}

  const currentSystemTitle =
    hookSettingsData?.data?.title ||
    hookSettingsData?.title ||
    systemTitle ||
    (window as any)?.__nocobase_cached_system_title ||
    'NocoBase';

  useEffect(() => {
    let mounted = true;
    const fetchConfigAndSystem = async () => {
      try {
        const res = await apiClient.request({
          url: 'customLoginPage:getPublicConfig',
          skipAuth: true,
          skipNotify: true,
        });
        const data = res?.data?.data || res?.data;
        if (mounted && data) {
          try {
            localStorage.setItem('nocobase_custom_login_public_config_v2', JSON.stringify(data));
          } catch (e) {}
          setConfig(data);
        }
      } catch (err) {
        // 网络或接口异常时平滑静默，回退到原生登录
      } finally {
        if (mounted) setLoading(false);
      }

      // 获取系统标题（系统文本），用于原生回退状态及未配置自定义标题时的品牌展示
      try {
        const sysRes = await apiClient.request({
          url: 'systemSettings:get',
          skipAuth: true,
          skipNotify: true,
        });
        const title = sysRes?.data?.data?.title || sysRes?.data?.title;
        if (mounted && title) {
          (window as any).__nocobase_cached_system_title = title;
          setSystemTitle(title);
        }
      } catch (e) {}
    };
    fetchConfigAndSystem();
    return () => {
      mounted = false;
    };
  }, [apiClient]);

  const NativeSignIn = () => (
    <AuthenticatorsContextProvider>
      <Outlet />
    </AuthenticatorsContextProvider>
  );

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

  // 如果加载中、未配置或未开启自定义登录，降级展示原生登录页（忠实保留官方原生的系统标题、语言切换与底部版权）
  if (loading || !config || !config.enabled) {
    return (
      <div style={{ maxWidth: 320, margin: '0 auto', paddingTop: '20vh', paddingBottom: '20vh', position: 'relative' }}>
        <div style={{ position: 'fixed', top: token?.paddingLG || 24, right: token?.paddingLG || 24, color: token?.colorText }}>
          <SwitchLanguage />
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
          {currentSystemTitle}
        </h1>
        <NativeSignIn />
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            paddingBottom: token?.paddingLG || 24,
            textAlign: 'center',
            backgroundColor: token?.colorBgContainer,
          }}
        >
          <PoweredBy />
        </div>
      </div>
    );
  }

  const isMobileTarget = isMobile && Boolean(config?.enableMobileCustom);

  return (
    <CustomLoginContainer
      config={config}
      designMode={false}
      viewportMode={isMobile ? 'mobile' : 'desktop'}
      activeTarget={isMobileTarget ? 'mobile' : 'desktop'}
      originalSignInPage={NativeSignIn}
      apiClient={apiClient}
    />
  );
};

export class PluginCustomLoginPageClient extends Plugin {
  async load() {
    if (typeof window !== 'undefined') {
      (window as any).__nocobase_current_app__ = this.app;
      (window as any).__nocobase_app__ = this.app;
    }

    // 1. 注册管理后台设置中心 (Plugin Settings Manager)
    const manager = this.app?.pluginSettingsManager as any;
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
          Component: LazyCustomLoginPageSettings,
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
          Component: LazyCustomLoginPageSettings,
        });
      }
    }

    // 2. 覆盖原生 AuthLayout，实现登录页的自定义画布渲染
    this.app.addComponents({
      AuthLayout: CustomAuthLayout,
      CustomLoginContainer,
    });

    // 3. 注册 FlowEngine 模型加载器 (若宿主环境启用了 flowEngine)
    try {
      const flowEngine = (this.app as any)?.flowEngine;
      if (flowEngine && typeof flowEngine.registerModelLoaders === 'function') {
        flowEngine.registerModelLoaders({
          CustomLoginBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomLoginBlockModel),
          },
          LoginPageBlockGridModel: {
            loader: () =>
              import('../client-v2/components/LoginPageBlockGridCanvas').then((m) => m.LoginPageBlockGridModel),
          },
          SignInFormBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.SignInFormBlockModel),
          },
          CustomHeroBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomHeroBlockModel),
          },
          CustomFeaturesBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomFeaturesBlockModel),
          },
          CustomCarouselBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomCarouselBlockModel),
          },
          CustomStatsBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomStatsBlockModel),
          },
          CustomHtmlBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomHtmlBlockModel),
          },
          CustomImageBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomImageBlockModel),
          },
          CustomNoticeBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomNoticeBlockModel),
          },
          CustomPartnersBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomPartnersBlockModel),
          },
          CustomContactBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomContactBlockModel),
          },
          CustomLanguageBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomLanguageBlockModel),
          },
          CustomCountdownBlockModel: {
            loader: () => import('../client-v2/models/CustomBlocks').then((m) => m.CustomCountdownBlockModel),
          },
        });
      }
    } catch (err) {
      console.warn('[plugin-custom-login-page/client] registerModelLoaders failed:', err);
    }
  }
}

export default PluginCustomLoginPageClient;
