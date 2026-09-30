import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, ConfigProvider, theme as antdTheme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

const { Title, Text } = Typography;

/* ==========================================================================
   1. 用户系统登录表单原生区块 (SignInFormBlockModel)
   ========================================================================== */
export const SIGNIN_THEMES: Record<string, {
  name: string;
  cardBg: string;
  border: string;
  boxShadow: string;
  titleColor: string;
  subtitleColor: string;
  agreementColor: string;
  isDark?: boolean;
}> = {
  glass: {
    name: '晶透毛玻璃',
    cardBg: 'rgba(255, 255, 255, 0.88)',
    border: '1px solid rgba(255, 255, 255, 0.65)',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16), 0 0 1px rgba(255, 255, 255, 0.8)',
    titleColor: '#0f172a',
    subtitleColor: '#64748b',
    agreementColor: '#94a3b8',
    isDark: false,
  },
  light: {
    name: '纯白典雅',
    cardBg: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
    titleColor: '#1e293b',
    subtitleColor: '#64748b',
    agreementColor: '#94a3b8',
    isDark: false,
  },
  obsidian: {
    name: '曜石纯黑',
    cardBg: 'linear-gradient(135deg, rgba(24, 24, 27, 0.92) 0%, rgba(9, 9, 11, 0.95) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    boxShadow: '0 24px 56px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255, 255, 255, 0.65)',
    agreementColor: 'rgba(255, 255, 255, 0.45)',
    isDark: true,
  },
  cyber: {
    name: '深空蓝夜',
    cardBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.82) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.5), 0 0 24px rgba(59, 130, 246, 0.15)',
    titleColor: '#ffffff',
    subtitleColor: '#93c5fd',
    agreementColor: 'rgba(147, 197, 253, 0.6)',
    isDark: true,
  },
  transparent: {
    name: '通透无界',
    cardBg: 'transparent',
    border: 'none',
    boxShadow: 'none',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255, 255, 255, 0.8)',
    agreementColor: 'rgba(255, 255, 255, 0.55)',
    isDark: true,
  },
};

export const NativeSignInRenderer: React.FC<{ model: any; theme?: any }> = ({ model, theme }) => {
  const isDesignMode = (window as any).__customLoginDesignMode;
  const OriginalSignIn = (window as any).__NocobaseOriginalSignInComponent;
  const props = model?.props || {};
  const buttonColor = props.buttonColor || '#1677ff';
  const loginButtonText = props.loginButtonText || '登录';
  const showAgreement = props.showAgreement ?? false;
  const agreementText = props.agreementText || '登录即代表您已同意《服务协议》与《隐私保护指引》';
  const isDark = theme?.isDark ?? false;

  // 1. 如果是在前台真实访问（非后台设计态），且系统原生登录组件就绪，直接渲染官方原生组件！
  if (!isDesignMode && OriginalSignIn) {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: buttonColor || '#1677ff',
            colorBgContainer: isDark ? 'rgba(30, 41, 59, 0.75)' : '#ffffff',
            colorText: isDark ? '#ffffff' : undefined,
            colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : undefined,
            colorBorder: isDark ? 'rgba(255, 255, 255, 0.18)' : undefined,
          },
        }}
      >
        <div className="nocobase-native-signin-embed" style={{ width: '100%' }}>
          <OriginalSignIn />
          {showAgreement && agreementText && (
            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                fontSize: 12,
                color: props.agreementColor || theme?.agreementColor || (isDark ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af'),
                lineHeight: 1.5,
              }}
            >
              {agreementText}
            </div>
          )}
        </div>
      </ConfigProvider>
    );
  }

  // 2. 后台设计预览态：动态读取系统真实用户认证插件状态（拒绝假数据/假开关）
  const [authStatus, setAuthStatus] = useState<{
    allowSignUp: boolean;
    enableResetPassword: boolean;
    authenticators: any[];
  }>({
    allowSignUp: true, // 默认初始回退
    enableResetPassword: true,
    authenticators: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAuthStatus = async () => {
      try {
        const apiClient = (window as any).__nocobase_v2_app__?.apiClient;
        if (apiClient) {
          const res = await apiClient.request({ url: 'authenticators:publicList' });
          const list = res?.data?.data || [];
          if (isMounted && Array.isArray(list)) {
            const hasSignUp = list.some((item: any) => item?.options?.allowSignUp === true);
            const hasReset = list.some((item: any) => item?.options?.enableResetPassword === true);
            setAuthStatus({
              allowSignUp: hasSignUp,
              enableResetPassword: hasReset,
              authenticators: list,
            });
          }
        }
      } catch (e) {
        // 忽略异常，保持默认
      }
    };
    fetchAuthStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const inputBg = isDark ? 'rgba(255, 255, 255, 0.08)' : undefined;
  const inputColor = isDark ? '#ffffff' : undefined;

  return (
    <Form layout="vertical" size="large" requiredMark={false} style={{ width: '100%' }}>
      <Form.Item style={{ marginBottom: 16 }}>
        <Input
          prefix={<UserOutlined style={{ color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#9ca3af' }} />}
          placeholder="用户名 / 手机号 / 邮箱"
          style={{
            borderRadius: 10,
            backgroundColor: inputBg,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : undefined,
            color: inputColor,
          }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 20 }}>
        <Input.Password
          prefix={<LockOutlined style={{ color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#9ca3af' }} />}
          placeholder="密码"
          style={{
            borderRadius: 10,
            backgroundColor: inputBg,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : undefined,
            color: inputColor,
          }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 14 }}>
        <Button
          type="primary"
          block
          style={{
            height: 46,
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            backgroundColor: buttonColor,
            borderColor: buttonColor,
            boxShadow: `0 6px 18px ${buttonColor}45`,
          }}
        >
          {loginButtonText}
        </Button>
      </Form.Item>

      {(authStatus.allowSignUp || authStatus.enableResetPassword) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 10 }}>
          {authStatus.allowSignUp ? (
            <span style={{ color: buttonColor, cursor: 'pointer', fontWeight: 500 }}>注册新账号</span>
          ) : <span />}
          {authStatus.enableResetPassword && (
            <span style={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#6b7280', cursor: 'pointer' }}>忘记密码？</span>
          )}
        </div>
      )}

      {showAgreement && agreementText && (
        <div
          style={{
            marginTop: 18,
            textAlign: 'center',
            fontSize: 12,
            color: props.agreementColor || theme?.agreementColor || '#9ca3af',
            lineHeight: 1.5,
          }}
        >
          {agreementText}
        </div>
      )}
    </Form>
  );
};

export const SignInFormHeader: React.FC<{
  title?: string;
  titleColor?: string;
  titleFontSize?: number | string;
  subtitle?: string;
  subtitleColor?: string;
  subtitleFontSize?: number | string;
  showLogo?: boolean;
  customLogoUrl?: string;
  logoPosition?: 'left' | 'top';
  logoHeight?: number;
}> = ({
  title,
  titleColor,
  titleFontSize,
  subtitle,
  subtitleColor,
  subtitleFontSize,
  showLogo = true,
  customLogoUrl,
  logoPosition = 'left',
  logoHeight = 38,
}) => {
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    return (window as any)?.__nocobase_cached_system_logo || null;
  });
  const [systemTitle, setSystemTitle] = useState<string>(() => {
    return (window as any)?.__nocobase_cached_system_title || '';
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (systemLogo && systemTitle) return;
    let isMounted = true;
    const fetchLogoAndTitle = async () => {
      try {
        const app = (window as any)?.__nocobase_v2_app__ || (window as any)?.__nocobase_app__;
        let logoUrl = '';
        let sysTitle = '';
        if (app?.apiClient) {
          const res = await app.apiClient.request({ url: 'systemSettings:get' });
          logoUrl = res?.data?.data?.logo?.url || res?.data?.data?.logo?.preview || '';
          sysTitle = res?.data?.data?.title || res?.data?.title || '';
        }
        if (!logoUrl || !sysTitle) {
          const resp = await fetch('/api/systemSettings:get');
          const json = await resp.json();
          if (!logoUrl) {
            logoUrl = json?.data?.logo?.url || json?.data?.logo?.preview || '';
          }
          if (!sysTitle) {
            sysTitle = json?.data?.title || '';
          }
        }
        if (isMounted) {
          if (logoUrl) {
            (window as any).__nocobase_cached_system_logo = logoUrl;
            setSystemLogo(logoUrl);
          }
          if (sysTitle) {
            (window as any).__nocobase_cached_system_title = sysTitle;
            setSystemTitle(sysTitle);
          }
        }
      } catch (e) {
        // 静默忽略
      }
    };
    fetchLogoAndTitle();
    return () => {
      isMounted = false;
    };
  }, [systemLogo, systemTitle]);

  const activeLogo = customLogoUrl || systemLogo;
  const shouldRenderLogo = showLogo && !!activeLogo && !imgError;
  const displayTitle = title !== undefined && title !== '' ? title : (systemTitle || '欢迎登录');

  const LogoImg = shouldRenderLogo ? (
    <img
      src={activeLogo}
      alt="Logo"
      onError={() => setImgError(true)}
      style={{
        height: logoHeight,
        maxWidth: 160,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        transition: 'all 0.3s ease',
      }}
    />
  ) : null;

  return (
    <div style={{ marginBottom: 24, textAlign: 'center' }}>
      {logoPosition === 'top' && shouldRenderLogo && (
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
          {LogoImg}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {logoPosition === 'left' && shouldRenderLogo && LogoImg}
        {displayTitle && (
          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 700,
              color: titleColor,
              fontSize: titleFontSize ? (typeof titleFontSize === 'number' ? `${titleFontSize}px` : titleFontSize) : undefined,
              lineHeight: 1.3,
            }}
          >
            {displayTitle}
          </Title>
        )}
      </div>

      {subtitle && (
        <Text
          style={{
            fontSize: subtitleFontSize ? (typeof subtitleFontSize === 'number' ? `${subtitleFontSize}px` : subtitleFontSize) : 13,
            marginTop: 6,
            display: 'block',
            color: subtitleColor,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </Text>
      )}
    </div>
  );
};

export class SignInFormBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const title = props.title !== undefined ? props.title : '欢迎登录';
    const subtitle = props.subtitle !== undefined ? props.subtitle : '请输入您的账号密码开启高效协同';

    // 主题解析：兼顾历史 cardBg 自定义
    const themeKey = props.themeKey || 'glass';
    const theme = SIGNIN_THEMES[themeKey] || SIGNIN_THEMES.glass;
    const cardBg = props.cardBg || theme.cardBg;
    const border = themeKey === 'transparent' ? 'none' : (props.border || theme.border);
    const boxShadow = themeKey === 'transparent' ? 'none' : (props.boxShadow || theme.boxShadow);
    const titleColor = props.titleColor || theme.titleColor;
    const subtitleColor = props.subtitleColor || theme.subtitleColor;
    const borderRadius = props.borderRadius !== undefined ? props.borderRadius : 20;

    // 核心：自适应区块大小控制
    const widthMode = props.widthMode || 'fill'; // 'fill' (自适应撑满区块 100%) | 'custom' (自定义最大宽度)
    const maxWidth = widthMode === 'fill' ? '100%' : (props.maxWidth ? `${props.maxWidth}px` : '420px');
    const align = props.align || 'center'; // 'left' | 'center' | 'right'
    const fillHeight = props.fillHeight ?? false; // 纵向等高自适应开关

    // Logo 属性解析
    const showLogo = props.showLogo ?? true;
    const customLogoUrl = props.customLogoUrl || '';
    const logoPosition = props.logoPosition || 'left';
    const logoHeight = props.logoHeight || 38;

    // 对齐方式转换
    let margin = '0 auto';
    if (align === 'left') margin = '0 auto 0 0';
    if (align === 'right') margin = '0 0 0 auto';

    // 内边距档位
    const PADDING_MAP: Record<string, string> = {
      compact: '22px 20px',
      normal: '32px 28px',
      relaxed: '44px 36px',
    };
    const padding = PADDING_MAP[props.paddingSize || 'normal'] || '32px 28px';

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        className="custom-block-signin custom-signin-card-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: fillHeight ? '100%' : 'auto',
          display: fillHeight ? 'flex' : 'block',
          flexDirection: fillHeight ? 'column' : undefined,
          justifyContent: fillHeight ? 'center' : undefined,
        }}
      >
        <div
          className="custom-signin-card"
          style={{
            width: '100%',
            maxWidth,
            margin,
            padding,
            borderRadius,
            backgroundColor: cardBg,
            background: cardBg,
            backdropFilter: cardBg.includes('rgba') || cardBg.includes('blur') ? 'blur(20px)' : undefined,
            WebkitBackdropFilter: cardBg.includes('rgba') || cardBg.includes('blur') ? 'blur(20px)' : undefined,
            boxShadow,
            border,
            boxSizing: 'border-box',
            height: fillHeight ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {/* 表单头部 Logo 与标题区域 */}
          <SignInFormHeader
            title={title}
            titleColor={titleColor}
            titleFontSize={props.titleFontSize}
            subtitle={subtitle}
            subtitleColor={subtitleColor}
            subtitleFontSize={props.subtitleFontSize}
            showLogo={showLogo}
            customLogoUrl={customLogoUrl}
            logoPosition={logoPosition}
            logoHeight={logoHeight}
          />

          {/* 渲染原生登录区域 */}
          <NativeSignInRenderer model={this} theme={theme} />
        </div>
      </div>
    );
  }
}

SignInFormBlockModel.define({
  label: tExpr('Sign-in Form'),
  hide: true,
  createModelOptions: {
    use: 'SignInFormBlockModel',
  },
});
