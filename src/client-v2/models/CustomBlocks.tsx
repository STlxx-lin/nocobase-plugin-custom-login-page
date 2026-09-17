import React, { useState, useEffect, useMemo } from 'react';
import { BlockModel, Icon } from '@nocobase/client-v2';
import { openBlockContentEditor } from '../components/BlockContentEditorDrawer';
import { tExpr, useT } from '../locale';
import { Carousel, Row, Col, Typography, Tag, Card, Form, Input, Button, Space, Divider, Alert, Segmented, Select, Statistic, Image, Tooltip, message, QRCode } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  CloudServerOutlined,
  BulbOutlined,
  TeamOutlined,
  GlobalOutlined,
  StarOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  CompassOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  AuditOutlined,
  SecurityScanOutlined,
  ArrowRightOutlined,
  WechatOutlined,
  DingdingOutlined,
  GithubOutlined,
  EditOutlined,
  NotificationOutlined,
  PhoneOutlined,
  MailOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  RightOutlined,
  CopyOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  MessageOutlined,
  CloseOutlined,
  SoundOutlined,
  AlertOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 丰富的图标字典映射（兜底降级）
export const ICON_MAP: Record<string, React.ReactNode> = {
  RocketOutlined: <RocketOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
  CloudServerOutlined: <CloudServerOutlined />,
  BulbOutlined: <BulbOutlined />,
  TeamOutlined: <TeamOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  StarOutlined: <StarOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  SettingOutlined: <SettingOutlined />,
  CompassOutlined: <CompassOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  AuditOutlined: <AuditOutlined />,
  SecurityScanOutlined: <SecurityScanOutlined />,
  PhoneOutlined: <PhoneOutlined />,
  MailOutlined: <MailOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  WechatOutlined: <WechatOutlined />,
  DingdingOutlined: <DingdingOutlined />,
  CopyOutlined: <CopyOutlined />,
  LinkOutlined: <LinkOutlined />,
  EnvironmentOutlined: <EnvironmentOutlined />,
  QrcodeOutlined: <QrcodeOutlined />,
  MessageOutlined: <MessageOutlined />,
};

// 图标渲染函数：全面优先支持「自定义图标」插件（草莓/Lucide/用户SVG/复合样式）与官方 1152+ 图标
export const renderCustomOrOfficialIcon = (iconName: string, color?: string, fontSize = 28) => {
  if (!iconName) {
    return <RocketOutlined style={{ color: color || '#1677ff', fontSize }} />;
  }

  // 1. 若使用了自定义图标插件支持的 ? 复合样式，动态解析其内嵌高光色与尺寸
  let finalColor = color || '#1677ff';
  let finalSize = fontSize;
  let cleanName = iconName;

  if (typeof iconName === 'string' && iconName.includes('?')) {
    try {
      const [base, query] = iconName.split('?');
      cleanName = base;
      const params = new URLSearchParams(query);
      if (params.get('color')) {
        finalColor = params.get('color')!;
      }
      if (params.get('size')) {
        const parsedSize = parseInt(params.get('size')!, 10);
        if (!isNaN(parsedSize) && parsedSize > 0) {
          finalSize = parsedSize;
        }
      }
    } catch (e) {}
  }

  // 2. 优先使用已被自定义图标插件注入与代理的宿主 Icon 组件（支持所有自定义 SVG、草莓图标与官方图标）
  const c2 = typeof window !== 'undefined' ? (window as any).__nocobase_app_dev_deps__?.['@nocobase/client-v2'] : null;
  const DynamicIcon = c2?.Icon || Icon;

  if (DynamicIcon) {
    try {
      return (
        <DynamicIcon
          type={iconName}
          style={{ color: finalColor, fontSize: finalSize }}
        />
      );
    } catch (e) {
      // 容错重试：若原带参标识在底层未命中，使用 cleanName 再次渲染
      try {
        return (
          <DynamicIcon
            type={cleanName}
            style={{ color: finalColor, fontSize: finalSize }}
          />
        );
      } catch (e2) {}
    }
  }

  // 3. 兜底降级：如果动态渲染不可用，从静态 ICON_MAP 中寻找，或者默认火箭图标
  const FallbackIcon = ICON_MAP[cleanName] || ICON_MAP[iconName] || <RocketOutlined />;
  return <span style={{ color: finalColor, fontSize: finalSize, display: 'inline-flex', alignItems: 'center' }}>{FallbackIcon}</span>;
};

export const renderOfficialIcon = renderCustomOrOfficialIcon;

// 区块配置按钮全面归置于右上角菜单「区块高度」下方（遵循用户设计要求，保持卡片自身视觉纯粹无遮挡）
const renderBlockEditButton = (_model: any) => null;

/* ==========================================================================
   0. 登录页专属区块统一基类 (CustomLoginBlockModel)
   所有登录页定制区块均继承此基类，从而在创建区块菜单中全部分组在同一个专属菜单项/分类内
   ========================================================================== */
export class CustomLoginBlockModel extends BlockModel {
  async openFlowSettings(options?: any) {
    if (options?.stepKey === 'editBlockContent' || options?.flowKey === 'customBlockSettings') {
      openBlockContentEditor(this);
      return true;
    }
    return super.openFlowSettings(options);
  }
}

// 遵循 NocoBase 官方 FlowEngine 标准区块规范，原生注册内容配置 Flow
CustomLoginBlockModel.registerFlow({
  key: 'customBlockSettings',
  title: tExpr('Content configuration'),
  steps: {
    editBlockContent: {
      title: tExpr('Edit block content'),
      uiMode: 'drawer',
      uiSchema: {
        _content: {
          type: 'void',
        },
      },
    },
  },
});

CustomLoginBlockModel.define({
  label: tExpr('Login page blocks'),
  sort: 100,
  children: () => [
    {
      key: 'SignInFormBlockModel',
      label: tExpr('Sign-in Form'),
      useModel: 'SignInFormBlockModel',
      createModelOptions: {
        use: 'SignInFormBlockModel',
      },
    },
    {
      key: 'CustomHeroBlockModel',
      label: tExpr('Hero banner'),
      useModel: 'CustomHeroBlockModel',
      createModelOptions: {
        use: 'CustomHeroBlockModel',
      },
    },
    {
      key: 'CustomFeaturesBlockModel',
      label: tExpr('Features matrix'),
      useModel: 'CustomFeaturesBlockModel',
      createModelOptions: {
        use: 'CustomFeaturesBlockModel',
      },
    },
    {
      key: 'CustomStatsBlockModel',
      label: tExpr('Stats dashboard'),
      useModel: 'CustomStatsBlockModel',
      createModelOptions: {
        use: 'CustomStatsBlockModel',
      },
    },
    {
      key: 'CustomCarouselBlockModel',
      label: tExpr('Dynamic carousel'),
      useModel: 'CustomCarouselBlockModel',
      createModelOptions: {
        use: 'CustomCarouselBlockModel',
      },
    },
    {
      key: 'CustomHtmlBlockModel',
      label: tExpr('Free Code / HTML'),
      useModel: 'CustomHtmlBlockModel',
      createModelOptions: {
        use: 'CustomHtmlBlockModel',
      },
    },
    {
      key: 'CustomImageBlockModel',
      label: tExpr('Illustration / Image'),
      useModel: 'CustomImageBlockModel',
      createModelOptions: {
        use: 'CustomImageBlockModel',
      },
    },
    {
      key: 'CustomNoticeBlockModel',
      label: tExpr('Notice bar'),
      useModel: 'CustomNoticeBlockModel',
      createModelOptions: {
        use: 'CustomNoticeBlockModel',
      },
    },
    {
      key: 'CustomPartnersBlockModel',
      label: tExpr('Partners logo wall'),
      useModel: 'CustomPartnersBlockModel',
      createModelOptions: {
        use: 'CustomPartnersBlockModel',
      },
    },
    {
      key: 'CustomContactBlockModel',
      label: tExpr('Contact & Support'),
      useModel: 'CustomContactBlockModel',
      createModelOptions: {
        use: 'CustomContactBlockModel',
      },
    },
    {
      key: 'CustomLanguageBlockModel',
      label: tExpr('Language Switcher'),
      useModel: 'CustomLanguageBlockModel',
      createModelOptions: {
        use: 'CustomLanguageBlockModel',
      },
    },
    {
      key: 'CustomCountdownBlockModel',
      label: tExpr('Event Countdown'),
      useModel: 'CustomCountdownBlockModel',
      createModelOptions: {
        use: 'CustomCountdownBlockModel',
      },
    },
  ],
});

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
      <div className="nocobase-native-signin-embed" style={{ width: '100%' }}>
        <OriginalSignIn />
        {showAgreement && agreementText && (
          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: 12,
              color: props.agreementColor || theme?.agreementColor || '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            {agreementText}
          </div>
        )}
      </div>
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
  const inputBorder = isDark ? '1px solid rgba(255, 255, 255, 0.18)' : undefined;
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
        style={{
          position: 'relative',
          width: '100%',
          height: fillHeight ? '100%' : 'auto',
          display: fillHeight ? 'flex' : 'block',
          flexDirection: fillHeight ? 'column' : undefined,
          justifyContent: fillHeight ? 'center' : undefined,
        }}
      >
        {renderBlockEditButton(this)}
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
  label: tExpr('系统登录表单 (Sign-in Form)'),
  hide: true,
  createModelOptions: {
    use: 'SignInFormBlockModel',
  },
});

/* ==========================================================================
   2. 品牌宣传标语原生区块 (CustomHeroBlockModel)
   ========================================================================== */
export class CustomHeroBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const showBadge = props.showBadge ?? true;
    const badge = props.badge || '全新数字化协同架构';
    const badgeBg = props.badgeBg || 'rgba(22, 119, 255, 0.28)';
    const badgeColor = props.badgeColor || '#69b1ff';

    const title = props.title || '驱动企业数字化新未来';
    const titleSize = props.titleSize || 42;
    const textColor = props.textColor || '#ffffff';
    const subtitle =
      props.subtitle || '基于灵活可扩展的现代无代码与插件化体系，提供端到端企业级应用解决方案。';
    const subtitleColor = props.subtitleColor || 'rgba(255, 255, 255, 0.88)';
    const align = props.align || 'left';

    const showButton = props.showButton ?? false;
    const buttonText = props.buttonText || '了解平台特性';
    const buttonUrl = props.buttonUrl || '#';

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%' }}
      >
        {renderBlockEditButton(this)}
        <div
          style={{
            padding: '24px 12px',
            textAlign: align,
            color: textColor,
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {showBadge && badge && (
            <Tag
              style={{
                marginBottom: 18,
                padding: '6px 16px',
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: badgeBg,
                color: badgeColor,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              }}
            >
              ✦ {badge}
            </Tag>
          )}

          <Title
            level={1}
            style={{
              color: textColor,
              fontSize: props.titleSize ? (typeof props.titleSize === 'number' ? `${props.titleSize}px` : props.titleSize) : `clamp(26px, 3.5vw, ${titleSize}px)`,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 16,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
            }}
          >
            {title}
          </Title>

          <Paragraph
            style={{
              color: subtitleColor,
              fontSize: props.subtitleSize ? (typeof props.subtitleSize === 'number' ? `${props.subtitleSize}px` : props.subtitleSize) : 'clamp(14px, 1.25vw, 17px)',
              lineHeight: 1.7,
              maxWidth: align === 'center' ? 760 : 640,
              margin: align === 'center' ? '0 auto 20px auto' : '0 0 20px 0',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            {subtitle}
          </Paragraph>

          {showButton && (
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                style={{
                  borderRadius: 10,
                  height: 44,
                  padding: '0 24px',
                  fontWeight: 600,
                  color: props.buttonTextColor || '#ffffff',
                  background: 'linear-gradient(135deg, #1677ff 0%, #36cfc9 100%)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(22, 119, 255, 0.35)',
                }}
                onClick={() => {
                  if (buttonUrl && buttonUrl !== '#') window.open(buttonUrl, '_blank');
                }}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

CustomHeroBlockModel.define({
  label: tExpr('品牌宣传标语 (Hero)'),
  hide: true,
  createModelOptions: {
    use: 'CustomHeroBlockModel',
  },
});

/* ==========================================================================
   3. 企业特性矩阵原生区块 (CustomFeaturesBlockModel)
   ========================================================================== */
export class CustomFeaturesBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const columns = props.columns || 3;
    const cardBg = props.cardBg || 'rgba(255, 255, 255, 0.12)';
    const textColor = props.textColor || '#ffffff';
    const items = props.items || [
      {
        icon: 'RocketOutlined',
        title: '敏捷极速构建',
        desc: '无需复杂全栈开发，分钟级搭建企业业务协同中枢与数据流转看板。',
        color: '#69b1ff',
      },
      {
        icon: 'SafetyCertificateOutlined',
        title: '金融级权限控制',
        desc: '支持原子级字段权限、行级过滤与多角色灵活权限策略隔离。',
        color: '#52c41a',
      },
      {
        icon: 'ThunderboltOutlined',
        title: '自动化流程引擎',
        desc: '全链路可视化任务编排与定时作业，大幅释放团队日常运转效能。',
        color: '#faad14',
      },
    ];

    const span = Math.floor(24 / columns);

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', padding: '12px 0', overflow: 'hidden' }}
      >
        {renderBlockEditButton(this)}
        <Row gutter={[18, 18]} style={{ margin: 0 }}>
          {items.map((item: any, idx: number) => {
            const iconColor = item.color || '#69b1ff';
            const IconCmp = renderOfficialIcon(item.icon, iconColor, 22);
            return (
              <Col xs={24} sm={12} md={span} key={idx}>
                <div
                  style={{
                    height: '100%',
                    padding: 22,
                    borderRadius: 16,
                    background: cardBg,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: textColor,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${iconColor}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: iconColor,
                      marginBottom: 16,
                    }}
                  >
                    {IconCmp}
                  </div>
                  <Title
                    level={5}
                    style={{
                      color: textColor,
                      marginBottom: 8,
                      fontWeight: 700,
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {item.title}
                  </Title>
                  <Paragraph
                    style={{
                      color: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.82)' : textColor,
                      fontSize: 13,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </Paragraph>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
}

CustomFeaturesBlockModel.define({
  label: tExpr('企业特性矩阵 (Features)'),
  hide: true,
  createModelOptions: {
    use: 'CustomFeaturesBlockModel',
  },
});

/* ==========================================================================
   4. 核心数据看板原生区块 (CustomStatsBlockModel)
   ========================================================================== */
export class CustomStatsBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const cardBg = props.cardBg || 'rgba(255, 255, 255, 0.12)';
    const items = props.items || [
      { value: '99.99%', label: '高可用业务保障', color: '#69b1ff' },
      { value: '500+', label: '生态能力扩展库', color: '#52c41a' },
      { value: '100W+', label: '企业流程高效流转', color: '#faad14' },
      { value: '0 代码', label: '开箱即用极速交付', color: '#ff7875' },
    ];

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '14px 0' }}
      >
        {renderBlockEditButton(this)}
        <div
          style={{
            padding: '24px 28px',
            borderRadius: 18,
            background: cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Row gutter={[24, 16]} justify="space-around" align="middle">
            {items.map((it: any, idx: number) => (
              <Col key={idx} xs={12} sm={6} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: it.valueSize ? (typeof it.valueSize === 'number' ? `${it.valueSize}px` : it.valueSize) : 'clamp(24px, 2.6vw, 36px)',
                    fontWeight: 800,
                    color: it.color || '#ffffff',
                    lineHeight: 1.2,
                    marginBottom: 6,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {it.value}
                </div>
                <div
                  style={{
                    color: it.labelColor || 'rgba(255, 255, 255, 0.85)',
                    fontSize: it.labelSize ? (typeof it.labelSize === 'number' ? `${it.labelSize}px` : it.labelSize) : 13,
                    fontWeight: 500,
                  }}
                >
                  {it.label}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }
}

CustomStatsBlockModel.define({
  label: tExpr('核心数据看板 (Stats)'),
  hide: true,
  createModelOptions: {
    use: 'CustomStatsBlockModel',
  },
});

/* ==========================================================================
   5. 动态全景轮播原生区块 (CustomCarouselBlockModel)
   ========================================================================== */
export class CustomCarouselBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const height = props.height || 320;
    const autoplay = props.autoplay ?? true;
    const slides = props.slides || [
      {
        title: '全新数据协同中枢',
        subtitle: '支持私有化部署、高可用的企业级数字化底座',
        bg: 'linear-gradient(135deg, #1d39c4 0%, #002766 100%)',
      },
      {
        title: '自动化业务流程加速',
        subtitle: '全场景工作流驱动，实现跨系统秒级互联互通',
        bg: 'linear-gradient(135deg, #08979c 0%, #003a8c 100%)',
      },
      {
        title: '企业级安全与审计保障',
        subtitle: '多角色细粒度 ACL 与全程操作轨迹追溯',
        bg: 'linear-gradient(135deg, #531dab 0%, #120338 100%)',
      },
    ];

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '14px 0' }}
      >
        {renderBlockEditButton(this)}
        <div style={{ borderRadius: 16, overflow: 'hidden', width: '100%', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2)' }}>
          <Carousel autoplay={autoplay} effect="fade">
            {slides.map((slide: any, idx: number) => {
              const hasImage = !!slide.imageUrl;
              const overlay = slide.overlayOpacity !== undefined ? slide.overlayOpacity : (hasImage ? 0.35 : 0);
              const bgStyle = hasImage
                ? `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(${slide.imageUrl}) center/cover no-repeat`
                : (slide.bg || 'linear-gradient(135deg, #1d39c4 0%, #002766 100%)');

              return (
                <div key={idx}>
                  <div
                    style={{
                      height,
                      background: bgStyle,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '24px 36px',
                      boxSizing: 'border-box',
                      cursor: slide.linkUrl ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => {
                      if (slide.linkUrl) {
                        window.open(slide.linkUrl, '_blank');
                      }
                    }}
                  >
                    {slide.title && (
                      <Title
                        level={2}
                        style={{
                          color: '#ffffff',
                          margin: '0 0 12px 0',
                          fontWeight: 700,
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.65)',
                        }}
                      >
                        {slide.title}
                      </Title>
                    )}
                    {slide.subtitle && (
                      <Paragraph
                        style={{
                          color: 'rgba(255, 255, 255, 0.92)',
                          fontSize: 16,
                          maxWidth: 640,
                          textShadow: '0 1px 6px rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        {slide.subtitle}
                      </Paragraph>
                    )}
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    );
  }
}

CustomCarouselBlockModel.define({
  label: tExpr('动态全景轮播 (Carousel)'),
  hide: true,
  createModelOptions: {
    use: 'CustomCarouselBlockModel',
  },
});

/* ==========================================================================
   6. 自由代码 / HTML 原生区块 (CustomHtmlBlockModel)
   ========================================================================== */
// XSS 安全过滤清洗器：有效阻断恶意脚本注入与内联事件劫持，同时放行合规展示样式与结构
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^>\s]+/gi, '')
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*javascript:[^>\s]+/gi, '$1="#"');
};

export class CustomHtmlBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const html =
      props.html ||
      `<div style="text-align: center; padding: 18px 24px; color: rgba(255,255,255,0.85); font-size: 13px; background: rgba(255,255,255,0.08); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.25);">
        <span>🔒 经过权威安全认证 · 严格遵循 ISO27001 与国家等保三级安全规范</span>
      </div>`;

    const cleanHtml = sanitizeHtml(html);

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '12px 0' }}
      >
        {renderBlockEditButton(this)}
        <div dangerouslySetInnerHTML={{ __html: cleanHtml }} style={{ width: '100%' }} />
      </div>
    );
  }
}

CustomHtmlBlockModel.define({
  label: tExpr('Free Code / HTML'),
  hide: true,
  createModelOptions: {
    use: 'CustomHtmlBlockModel',
  },
});

/* ==========================================================================
   7. 宣传插画 / 大图展示原生区块 (CustomImageBlockModel)
   ========================================================================== */
export class CustomImageBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const url = props.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
    const height = props.height || 360;
    const borderRadius = props.borderRadius || 16;
    const caption = props.caption || '';

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '14px 0' }}
      >
        {renderBlockEditButton(this)}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <img
            src={url}
            alt={caption || 'Banner'}
            style={{
              width: '100%',
              height,
              objectFit: 'cover',
              borderRadius,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
          {caption && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.75)' }}>
              {caption}
            </div>
          )}
        </div>
      </div>
    );
  }
}

CustomImageBlockModel.define({
  label: tExpr('宣传插画 / 图片展示 (Image)'),
  hide: true,
  createModelOptions: {
    use: 'CustomImageBlockModel',
  },
});

/* ==========================================================================
   8. 平台公告通知条原生区块 (CustomNoticeBlockModel)
   ========================================================================== */

export const NOTICE_THEMES: Record<string, {
  name: string;
  badgeBg: string;
  badgeColor: string;
  iconColor: string;
  bg: string;
  border: string;
  boxShadow: string;
  textColor: string;
  descColor: string;
  ctaBg?: string;
  ctaColor?: string;
  ctaBorder?: string;
}> = {
  glass: {
    name: '晶透毛玻璃 (Glass)',
    badgeBg: 'linear-gradient(135deg, #1677ff 0%, #36cfc9 100%)',
    badgeColor: '#ffffff',
    iconColor: '#1677ff',
    bg: 'rgba(255, 255, 255, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.65)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
    textColor: '#1f2937',
    descColor: '#4b5563',
    ctaBg: 'rgba(22, 119, 255, 0.08)',
    ctaColor: '#1677ff',
    ctaBorder: '1px solid rgba(22, 119, 255, 0.25)',
  },
  amber: {
    name: '活力琥珀金 (Amber)',
    badgeBg: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
    badgeColor: '#ffffff',
    iconColor: '#d46b08',
    bg: 'linear-gradient(90deg, rgba(255, 251, 230, 0.94) 0%, rgba(255, 247, 230, 0.88) 100%)',
    border: '1px solid rgba(250, 173, 20, 0.45)',
    boxShadow: '0 8px 24px rgba(250, 140, 22, 0.12)',
    textColor: '#873800',
    descColor: 'rgba(135, 56, 0, 0.85)',
    ctaBg: '#fa8c16',
    ctaColor: '#ffffff',
    ctaBorder: 'none',
  },
  cyber: {
    name: '深空蓝夜 (Cyber)',
    badgeBg: 'linear-gradient(135deg, #00f0ff 0%, #0072ff 100%)',
    badgeColor: '#0a192f',
    iconColor: '#00f0ff',
    bg: 'linear-gradient(90deg, rgba(10, 25, 47, 0.92) 0%, rgba(15, 34, 64, 0.88) 100%)',
    border: '1px solid rgba(0, 240, 255, 0.35)',
    boxShadow: '0 8px 28px rgba(0, 240, 255, 0.15)',
    textColor: '#e6f7ff',
    descColor: 'rgba(230, 247, 255, 0.78)',
    ctaBg: 'rgba(0, 240, 255, 0.15)',
    ctaColor: '#00f0ff',
    ctaBorder: '1px solid rgba(0, 240, 255, 0.5)',
  },
  emerald: {
    name: '翡翠青碧 (Emerald)',
    badgeBg: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    badgeColor: '#ffffff',
    iconColor: '#389e0d',
    bg: 'linear-gradient(90deg, rgba(246, 255, 237, 0.94) 0%, rgba(235, 248, 225, 0.88) 100%)',
    border: '1px solid rgba(82, 196, 26, 0.4)',
    boxShadow: '0 8px 24px rgba(82, 196, 26, 0.12)',
    textColor: '#135200',
    descColor: 'rgba(19, 82, 0, 0.85)',
    ctaBg: '#52c41a',
    ctaColor: '#ffffff',
    ctaBorder: 'none',
  },
  light: {
    name: '极简典雅白 (Light)',
    badgeBg: '#f0f2f5',
    badgeColor: '#1f2937',
    iconColor: '#595959',
    bg: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
    textColor: '#111827',
    descColor: '#4b5563',
    ctaBg: '#f3f4f6',
    ctaColor: '#111827',
    ctaBorder: '1px solid #d1d5db',
  },
};

const CustomNoticeInner: React.FC<{ props: any; model: any }> = ({ props, model }) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const themeKey = props.themeKey || (props.type === 'warning' ? 'amber' : props.type === 'success' ? 'emerald' : props.type === 'error' ? 'amber' : 'glass');
  const theme = NOTICE_THEMES[themeKey] || NOTICE_THEMES.glass;

  const showBadge = props.showBadge ?? true;
  const badgeText = props.badgeText || (themeKey === 'amber' ? '⚡ 计划维护' : themeKey === 'emerald' ? '🛡️ 安全通报' : themeKey === 'cyber' ? '🔥 重磅发布' : '最新公告');
  const badgeColor = props.badgeColor;

  const showIcon = props.showIcon ?? true;
  const closable = props.closable ?? true;
  const banner = props.banner ?? false;
  const marquee = props.marquee ?? false;
  const marqueeSpeed = props.marqueeSpeed || 'normal'; // 'slow' | 'normal' | 'fast'
  const speedSec = marqueeSpeed === 'fast' ? 14 : marqueeSpeed === 'slow' ? 36 : 22;

  const messageText = props.message || '【系统公告】本周六凌晨 02:00-04:00 系统将进行计划内机房网络割接与弹性扩容维护。';
  const description = props.description || '';
  const borderRadius = banner ? 0 : (props.borderRadius ?? 10);

  const ctaType = props.ctaType || (props.linkUrl ? 'link' : 'none');
  const linkText = props.linkText || '查看详情 →';
  const linkUrl = props.linkUrl || '';

  const renderTextContent = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: marquee ? 'nowrap' : 'normal' }}>
      <span
        style={{
          fontWeight: 600,
          fontSize: props.messageFontSize ? (typeof props.messageFontSize === 'number' ? `${props.messageFontSize}px` : props.messageFontSize) : 13.5,
          color: props.messageColor || theme.textColor,
          letterSpacing: '0.2px',
        }}
      >
        {messageText}
      </span>
      {description && (
        <span
          style={{
            fontSize: props.descFontSize ? (typeof props.descFontSize === 'number' ? `${props.descFontSize}px` : props.descFontSize) : 12.5,
            color: props.descColor || theme.descColor,
          }}
        >
          {description}
        </span>
      )}
    </div>
  );

  return (
    <div
      ref={(el) => {
        if (el) (el as any).__customBlockModel = model;
      }}
      data-custom-block-root="true"
      className="custom-notice-card"
      style={{
        position: 'relative',
        width: '100%',
        margin: '10px 0',
        borderRadius: borderRadius,
        background: props.customBg || theme.bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: theme.border,
        boxShadow: theme.boxShadow,
        padding: banner ? '10px 20px' : '9px 16px',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>{`
        @keyframes customNoticeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .custom-notice-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* 左侧区域：图标 + 徽章 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 10, zIndex: 2 }}>
        {showIcon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.iconColor,
              fontSize: 16,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
            }}
          >
            <SoundOutlined />
          </span>
        )}
        {showBadge && badgeText && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 9px',
              borderRadius: 12,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.3px',
              background: badgeColor || theme.badgeBg,
              color: theme.badgeColor,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* 中间核心公告内容：真实平滑跑马灯支持 */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        {marquee ? (
          <div
            className="custom-notice-track"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'max-content',
              animation: `customNoticeScroll ${speedSec}s linear infinite`,
              cursor: 'default',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', paddingRight: 64 }}>
              {renderTextContent}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', paddingRight: 64 }}>
              {renderTextContent}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {renderTextContent}
          </div>
        )}
      </div>

      {/* 右侧操作区：行动呼吁 CTA 与关闭按钮 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12, zIndex: 2 }}>
        {linkUrl && ctaType !== 'none' && (
          ctaType === 'button' ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 600,
                background: theme.ctaBg || '#1677ff',
                color: props.linkTextColor || theme.ctaColor || '#ffffff',
                border: theme.ctaBorder || 'none',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.filter = 'brightness(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              {linkText}
            </a>
          ) : (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12.5,
                fontWeight: 600,
                color: props.linkTextColor || theme.iconColor || '#1677ff',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {linkText}
            </a>
          )
        )}

        {closable && (
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label="关闭通知"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.descColor,
              opacity: 0.65,
              fontSize: 14,
              padding: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.65';
            }}
          >
            <CloseOutlined />
          </button>
        )}
      </div>
    </div>
  );
};

export class CustomNoticeBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    return <CustomNoticeInner props={props} model={this} />;
  }
}

CustomNoticeBlockModel.define({
  label: tExpr('平台公告通知条 (Notice)'),
  hide: true,
  createModelOptions: {
    use: 'CustomNoticeBlockModel',
  },
});

/* ==========================================================================
   9. 合作伙伴与客户案例 Logo 墙原生区块 (CustomPartnersBlockModel)
   ========================================================================== */

export const PARTNERS_THEMES: Record<string, {
  name: string;
  cardBg: string;
  border: string;
  boxShadow: string;
  titleColor: string;
  itemBg: string;
  itemBorder: string;
  itemHoverBg: string;
}> = {
  transparent: {
    name: '通透无界',
    cardBg: 'transparent',
    border: 'none',
    boxShadow: 'none',
    titleColor: 'rgba(255, 255, 255, 0.75)',
    itemBg: 'rgba(255, 255, 255, 0.05)',
    itemBorder: '1px solid rgba(255, 255, 255, 0.1)',
    itemHoverBg: 'rgba(255, 255, 255, 0.15)',
  },
  glass: {
    name: '晶透毛玻璃',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    titleColor: '#ffffff',
    itemBg: 'rgba(255, 255, 255, 0.06)',
    itemBorder: '1px solid rgba(255, 255, 255, 0.12)',
    itemHoverBg: 'rgba(255, 255, 255, 0.18)',
  },
  cyber: {
    name: '深空蓝夜',
    cardBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 58, 138, 0.75) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)',
    titleColor: '#93c5fd',
    itemBg: 'rgba(15, 23, 42, 0.5)',
    itemBorder: '1px solid rgba(59, 130, 246, 0.2)',
    itemHoverBg: 'rgba(30, 58, 138, 0.6)',
  },
  obsidian: {
    name: '曜石纯黑',
    cardBg: 'linear-gradient(135deg, rgba(24, 24, 27, 0.92) 0%, rgba(9, 9, 11, 0.95) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    titleColor: '#d4d4d8',
    itemBg: 'rgba(39, 39, 42, 0.5)',
    itemBorder: '1px solid rgba(255, 255, 255, 0.08)',
    itemHoverBg: 'rgba(63, 63, 70, 0.6)',
  },
  light: {
    name: '纯白典雅',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    titleColor: '#334155',
    itemBg: '#f8fafc',
    itemBorder: '1px solid #e2e8f0',
    itemHoverBg: '#f1f5f9',
  },
};

export const PartnerItemCard: React.FC<{
  item: any;
  idx: number;
  theme: any;
  filterMode: string;
  minWidth?: number;
}> = ({ item, idx, theme, filterMode, minWidth }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 计算不同滤镜模式下的样式
  const getFilterStyle = () => {
    if (filterMode === 'white') {
      return isHovered
        ? 'brightness(0) invert(1) opacity(1) drop-shadow(0 0 5px rgba(255,255,255,0.7))'
        : 'brightness(0) invert(1) opacity(0.72)';
    }
    if (filterMode === 'grayscale') {
      return isHovered
        ? 'grayscale(0%) opacity(1)'
        : 'grayscale(100%) opacity(0.65)';
    }
    return isHovered ? 'opacity(1)' : 'opacity(0.85)';
  };

  return (
    <div
      key={idx}
      style={{
        height: 54,
        minWidth: minWidth || undefined,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 20px',
        borderRadius: 10,
        background: isHovered ? theme.itemHoverBg : theme.itemBg,
        border: isHovered ? `1px solid rgba(255, 255, 255, 0.25)` : theme.itemBorder,
        boxShadow: isHovered ? '0 6px 20px rgba(0, 0, 0, 0.15)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        cursor: item.url ? 'pointer' : 'default',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
      }}
    >
      {item.logo && !imgError ? (
        <img
          src={item.logo}
          alt={item.name || `Partner ${idx + 1}`}
          onError={() => setImgError(true)}
          style={{
            maxHeight: 34,
            maxWidth: '100%',
            objectFit: 'contain',
            filter: getFilterStyle(),
            transition: 'filter 0.25s ease, opacity 0.25s ease',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            color: theme.titleColor,
            fontWeight: 600,
            fontSize: 13.5,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
          }}
        >
          {item.name || '合作伙伴'}
        </span>
      )}
    </div>
  );
};

export const PartnersInner: React.FC<{ model: any }> = ({ model }) => {
  const props = model?.props || {};
  const themeKey = props.themeKey || (props.showBorder ? 'glass' : 'transparent');
  const theme = PARTNERS_THEMES[themeKey] || PARTNERS_THEMES.transparent;

  const title = props.title !== undefined ? props.title : '深受全球 500+ 行业标杆与创新团队信赖';
  const displayMode = props.displayMode || 'grid'; // 'grid' | 'marquee'
  const marqueeSpeed = props.marqueeSpeed || 'medium'; // 'slow' | 'medium' | 'fast'
  const columns = props.columns || 4; // 3 | 4 | 6 | 8
  const customTitleColor = props.titleColor || theme.titleColor;
  const borderRadius = props.borderRadius !== undefined ? props.borderRadius : 16;
  const rows = Number(props.rows) || (displayMode === 'marquee' ? 1 : 0);
  const reverseDirection = props.reverseDirection !== false;
  const rowGap = props.rowGap !== undefined ? Number(props.rowGap) : 14;

  // 滤镜模式解析，保证旧配置 grayscale 兼容
  let filterMode = props.filterMode;
  if (!filterMode) {
    filterMode = props.grayscale === false ? 'original' : 'grayscale';
  }

  const items = Array.isArray(props.items) && props.items.length > 0
    ? props.items
    : [
        { name: 'Alibaba Cloud', logo: 'https://img.alicdn.com/tfs/TB1..50X.T1gK0jSZFrXXc7HpXa-280-80.png', url: 'https://www.aliyun.com' },
        { name: 'Tencent Cloud', logo: 'https://cloudcache.tencent-cloud.com/qcloud/portal/kit/images/logo.png', url: 'https://cloud.tencent.com' },
        { name: 'Huawei Cloud', logo: 'https://res.vmallres.com/pimages/common/config/logo/logo_new.png', url: 'https://www.huaweicloud.com' },
        { name: 'Ant Group', logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg', url: 'https://www.antgroup.com' },
      ];

  const span = 24 / columns;

  // 多行跑马灯数据智能分流与无限倍增计算
  const marqueeRowsList = useMemo(() => {
    if (displayMode !== 'marquee') return [];
    const rCount = Math.max(1, Math.min(3, rows));
    const groups: any[][] = Array.from({ length: rCount }, () => []);
    if (!Array.isArray(items) || items.length === 0) return groups;

    items.forEach((item: any, idx: number) => {
      groups[idx % rCount].push(item);
    });

    // 兜底：若某行暂无 item，拷贝全局 items
    groups.forEach((grp, idx) => {
      if (grp.length === 0) {
        groups[idx] = [...items];
      }
    });

    // 为每行计算智能倍增（保证单组至少 12 个项，填满超宽屏且无缝相接）
    return groups.map((grpItems) => {
      const targetMinCount = 12;
      const repeatTimes = Math.max(1, Math.ceil(targetMinCount / grpItems.length));
      const list: any[] = [];
      for (let r = 0; r < repeatTimes; r++) {
        for (let i = 0; i < grpItems.length; i++) {
          list.push(grpItems[i]);
        }
      }
      return list;
    });
  }, [items, rows, displayMode]);

  // 根据单组长度与速度档位计算流速
  const getDuration = (grpLength: number) => {
    const totalGroupWidth = grpLength * 190;
    const PIXELS_PER_SECOND: Record<string, number> = {
      slow: 45,
      medium: 70,
      fast: 110,
    };
    const speed = PIXELS_PER_SECOND[marqueeSpeed] || 70;
    return Math.max(10, Math.round(totalGroupWidth / speed));
  };

  // 网格模式下行数截取
  const gridVisibleItems = useMemo(() => {
    if (displayMode === 'grid' && rows > 0) {
      return items.slice(0, rows * columns);
    }
    return items;
  }, [items, displayMode, rows, columns]);

  return (
    <div
      className="custom-partners-card"
      style={{
        background: theme.cardBg,
        borderRadius,
        border: theme.border,
        backdropFilter: theme.cardBg.includes('rgba') || theme.cardBg.includes('blur') ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: theme.cardBg.includes('rgba') || theme.cardBg.includes('blur') ? 'blur(12px)' : undefined,
        boxShadow: theme.boxShadow,
        padding: '24px 28px',
        margin: '20px 0',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* 跑马灯专用 CSS 动画规则：正向与反向无缝位移 */}
      <style>{`
        @keyframes customPartnersMarqueeScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        @keyframes customPartnersMarqueeScrollReverse {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .custom-partners-marquee-row:hover .custom-partners-marquee-group {
          animation-play-state: paused !important;
        }
      `}</style>

      {title && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span
            style={{
              fontSize: props.titleFontSize ? (typeof props.titleFontSize === 'number' ? `${props.titleFontSize}px` : props.titleFontSize) : 13,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: customTitleColor,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>
      )}

      {displayMode === 'marquee' ? (
        /* 多行/单行对称式工业级无缝无限横向滚动跑马灯 */
        <div
          className="custom-partners-marquee-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: rowGap,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {marqueeRowsList.map((rowGroupItems, rowIndex) => {
            const isReverse = reverseDirection && rowIndex % 2 === 1;
            const animName = isReverse ? 'customPartnersMarqueeScrollReverse' : 'customPartnersMarqueeScroll';
            const duration = getDuration(rowGroupItems.length);

            return (
              <div
                key={`row_${rowIndex}`}
                className="custom-partners-marquee-row"
                style={{
                  overflow: 'hidden',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                  padding: '4px 0',
                }}
              >
                {/* 第 1 组 */}
                <div
                  className="custom-partners-marquee-group"
                  style={{
                    display: 'flex',
                    flexShrink: 0,
                    alignItems: 'center',
                    gap: 20,
                    paddingRight: 20,
                    animation: `${animName} ${duration}s linear infinite`,
                    willChange: 'transform',
                  }}
                >
                  {rowGroupItems.map((item: any, idx: number) => (
                    <PartnerItemCard
                      key={`r${rowIndex}_g1_${idx}`}
                      item={item}
                      idx={idx}
                      theme={theme}
                      filterMode={filterMode}
                      minWidth={170}
                    />
                  ))}
                </div>

                {/* 第 2 组 (完全对称克隆组，首尾分秒无差衔接) */}
                <div
                  className="custom-partners-marquee-group"
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    flexShrink: 0,
                    alignItems: 'center',
                    gap: 20,
                    paddingRight: 20,
                    animation: `${animName} ${duration}s linear infinite`,
                    willChange: 'transform',
                  }}
                >
                  {rowGroupItems.map((item: any, idx: number) => (
                    <PartnerItemCard
                      key={`r${rowIndex}_g2_${idx}`}
                      item={item}
                      idx={idx}
                      theme={theme}
                      filterMode={filterMode}
                      minWidth={170}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 经典响应式网格平铺模式 (支持行数截取) */
        <Row gutter={[16, 16]} align="middle" justify="center">
          {gridVisibleItems.map((item: any, idx: number) => (
            <Col span={span} key={idx} xs={12} sm={12} md={span}>
              <PartnerItemCard
                item={item}
                idx={idx}
                theme={theme}
                filterMode={filterMode}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export class CustomPartnersBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '16px 0' }}
      >
        <PartnersInner model={this} />
      </div>
    );
  }
}

CustomPartnersBlockModel.define({
  label: tExpr('合作伙伴 Logo 墙 (Partners)'),
  hide: true,
  createModelOptions: {
    use: 'CustomPartnersBlockModel',
  },
});

/* ==========================================================================
   10. 客服支持与二维码原生区块 (CustomContactBlockModel)
   ========================================================================== */

export const CONTACT_THEMES: Record<string, {
  name: string;
  cardBg: string;
  border: string;
  boxShadow: string;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
  itemBg: string;
  itemBorder: string;
  qrBg: string;
}> = {
  glass: {
    name: '晶透毛玻璃',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255, 255, 255, 0.75)',
    accentColor: '#1677ff',
    badgeBg: 'rgba(22, 119, 255, 0.2)',
    badgeColor: '#69b1ff',
    itemBg: 'rgba(255, 255, 255, 0.06)',
    itemBorder: '1px solid rgba(255, 255, 255, 0.1)',
    qrBg: '#ffffff',
  },
  cyber: {
    name: '深空蓝夜',
    cardBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.8) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.45), 0 0 20px rgba(59, 130, 246, 0.15)',
    titleColor: '#ffffff',
    subtitleColor: '#93c5fd',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    badgeColor: '#7dd3fc',
    itemBg: 'rgba(15, 23, 42, 0.45)',
    itemBorder: '1px solid rgba(59, 130, 246, 0.2)',
    qrBg: '#ffffff',
  },
  aurora: {
    name: '企微极光',
    cardBg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(15, 23, 42, 0.88) 100%)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    boxShadow: '0 12px 36px rgba(6, 78, 59, 0.35), 0 0 16px rgba(16, 185, 129, 0.15)',
    titleColor: '#ffffff',
    subtitleColor: '#a7f3d0',
    accentColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeColor: '#6ee7b7',
    itemBg: 'rgba(6, 78, 59, 0.3)',
    itemBorder: '1px solid rgba(16, 185, 129, 0.2)',
    qrBg: '#ffffff',
  },
  obsidian: {
    name: '曜石纯黑',
    cardBg: 'linear-gradient(135deg, rgba(24, 24, 27, 0.94) 0%, rgba(9, 9, 11, 0.96) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    titleColor: '#fafafa',
    subtitleColor: '#a1a1aa',
    accentColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeColor: '#fbbf24',
    itemBg: 'rgba(39, 39, 42, 0.55)',
    itemBorder: '1px solid rgba(255, 255, 255, 0.08)',
    qrBg: '#ffffff',
  },
  light: {
    name: '纯白典雅',
    cardBg: 'rgba(255, 255, 255, 0.94)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
    titleColor: '#0f172a',
    subtitleColor: '#64748b',
    accentColor: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.1)',
    badgeColor: '#2563eb',
    itemBg: '#f8fafc',
    itemBorder: '1px solid #e2e8f0',
    qrBg: '#ffffff',
  },
  transparent: {
    name: '通透无界',
    cardBg: 'transparent',
    border: 'none',
    boxShadow: 'none',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255, 255, 255, 0.75)',
    accentColor: '#1677ff',
    badgeBg: 'rgba(22, 119, 255, 0.2)',
    badgeColor: '#69b1ff',
    itemBg: 'transparent',
    itemBorder: 'none',
    qrBg: '#ffffff',
  },
};

export const ContactSupportInner: React.FC<{ model: any }> = ({ model }) => {
  const props = model?.props || {};
  const themeKey = props.themeKey || 'glass';
  const theme = CONTACT_THEMES[themeKey] || CONTACT_THEMES.glass;

  const title = props.title || '需要帮助与技术支持？';
  const subtitle = props.subtitle || '我们的架构顾问与专属服务团队随时为您提供解答与技术协助。';
  const showQrCode = props.showQrCode !== false;
  const rawQrCode = props.qrCode || 'https://nocobase.com';
  // 解析二维码展示类型：如果是真实图片 URL 则渲染 Image，如果是文本/链接或历史 qrserver 外链，则使用原生 QRCode 本地矢量渲染
  const resolveQrInfo = (raw: string) => {
    if (!raw) return { isImage: false, value: 'https://nocobase.com' };
    let val = raw.trim();
    if (val.includes('api.qrserver.com')) {
      try {
        const urlObj = new URL(val);
        const dataParam = urlObj.searchParams.get('data');
        if (dataParam) {
          val = decodeURIComponent(dataParam);
        }
      } catch (e) {
        // fallback
      }
    }
    const isImage =
      val.startsWith('data:image/') ||
      /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(val) ||
      val.includes('/api/attachments/') ||
      val.includes('/storage/uploads/');
    return { isImage, value: val };
  };

  const qrInfo = resolveQrInfo(rawQrCode);
  const qrCodeTip = props.qrCodeTip || '扫码添加专属客服企业微信';
  const qrBadge = props.qrBadge !== undefined ? props.qrBadge : '企业微信';
  const qrSizeKey = props.qrSize || 'medium';
  const layout = props.layout || 'horizontal'; // 'horizontal' | 'vertical'
  const borderRadius = props.borderRadius !== undefined ? props.borderRadius : 16;
  const customTitleColor = props.titleColor || props.textColor || theme.titleColor;
  const customSubtitleColor = props.subtitleColor || theme.subtitleColor;
  const customAccentColor = props.accentColor || theme.accentColor;

  // 二维码尺寸定义
  const QR_SIZE_MAP: Record<string, number> = {
    small: 88,
    medium: 112,
    large: 136,
  };
  const qrDimension = QR_SIZE_MAP[qrSizeKey] || 112;

  // 向后兼容联系渠道列表解析
  const contactItems: Array<any> = Array.isArray(props.contactItems) && props.contactItems.length > 0
    ? props.contactItems
    : [
        props.hotline
          ? { icon: 'PhoneOutlined', label: '服务热线', value: props.hotline, action: 'tel', color: '#69b1ff' }
          : { icon: 'PhoneOutlined', label: '服务热线', value: '400-888-9999', action: 'tel', color: '#69b1ff' },
        props.email
          ? { icon: 'MailOutlined', label: '支持邮箱', value: props.email, action: 'mailto', color: '#95de64' }
          : { icon: 'MailOutlined', label: '支持邮箱', value: 'support@nocobase.com', action: 'mailto', color: '#95de64' },
        props.workTime
          ? { icon: 'ClockCircleOutlined', label: '服务时间', value: props.workTime, action: 'none', color: '#ffd666' }
          : { icon: 'ClockCircleOutlined', label: '服务时间', value: '周一至周日 9:00 - 21:00', action: 'none', color: '#ffd666' },
      ];

  const handleAction = (item: any) => {
    if (!item?.value) return;
    const action = item.action || 'none';
    if (action === 'tel') {
      window.location.href = `tel:${item.value}`;
    } else if (action === 'mailto') {
      window.location.href = `mailto:${item.value}`;
    } else if (action === 'url') {
      window.open(item.value, '_blank', 'noopener,noreferrer');
    } else if (action === 'copy') {
      try {
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(item.value);
          message.success(`已复制: ${item.value}`);
        } else {
          const input = document.createElement('input');
          input.value = item.value;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          message.success(`已复制: ${item.value}`);
        }
      } catch (e) {
        message.info(item.value);
      }
    }
  };

  const getActionBadge = (action: string) => {
    if (action === 'copy') {
      return (
        <span style={{ fontSize: 11, opacity: 0.75, display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
          <CopyOutlined /> 复制
        </span>
      );
    }
    if (action === 'url') {
      return (
        <span style={{ fontSize: 11, opacity: 0.75, display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
          <LinkOutlined /> 访问
        </span>
      );
    }
    if (action === 'tel') {
      return (
        <span style={{ fontSize: 11, opacity: 0.75, display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
          <PhoneOutlined /> 拨打
        </span>
      );
    }
    if (action === 'mailto') {
      return (
        <span style={{ fontSize: 11, opacity: 0.75, display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
          <MailOutlined /> 发信
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className="custom-contact-card"
      style={{
        background: theme.cardBg,
        borderRadius,
        border: theme.border,
        backdropFilter: theme.cardBg.includes('rgba') || theme.cardBg.includes('blur') ? 'blur(16px)' : undefined,
        WebkitBackdropFilter: theme.cardBg.includes('rgba') || theme.cardBg.includes('blur') ? 'blur(16px)' : undefined,
        boxShadow: theme.boxShadow,
        padding: '24px 28px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 头部标题区 */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: props.titleFontSize ? (typeof props.titleFontSize === 'number' ? `${props.titleFontSize}px` : props.titleFontSize) : 16,
            fontWeight: 700,
            color: customTitleColor,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: theme.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: customAccentColor,
              fontSize: 18,
            }}
          >
            <CustomerServiceOutlined />
          </div>
          <span>{title}</span>
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: props.subtitleFontSize ? (typeof props.subtitleFontSize === 'number' ? `${props.subtitleFontSize}px` : props.subtitleFontSize) : 13,
              color: customSubtitleColor,
              marginTop: 6,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* 主体区：左右或上下排列 */}
      <div
        style={{
          display: 'flex',
          flexDirection: layout === 'vertical' ? 'column' : 'row',
          alignItems: layout === 'vertical' ? 'center' : 'center',
          gap: layout === 'vertical' ? 20 : 24,
        }}
      >
        {/* 二维码区域 */}
        {showQrCode && rawQrCode && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div
              style={{
                position: 'relative',
                padding: 10,
                background: theme.qrBg,
                borderRadius: 14,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
                display: 'inline-block',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              className="custom-contact-qr-box"
            >
              {qrBadge && (
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: customAccentColor,
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 10,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    zIndex: 2,
                    letterSpacing: 0.5,
                  }}
                >
                  {qrBadge}
                </div>
              )}
              {qrInfo.isImage ? (
                <Image
                  src={qrInfo.value}
                  alt="Support QR Code"
                  width={qrDimension}
                  height={qrDimension}
                  style={{
                    width: qrDimension,
                    height: qrDimension,
                    display: 'block',
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                  preview={{
                    mask: (
                      <div style={{ fontSize: 11, color: '#ffffff', fontWeight: 500 }}>
                        点击放大
                      </div>
                    ),
                  }}
                />
              ) : (
                <div
                  style={{
                    width: qrDimension,
                    height: qrDimension,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <QRCode
                    value={qrInfo.value}
                    size={qrDimension}
                    bordered={false}
                    errorLevel="M"
                  />
                </div>
              )}
            </div>
            {qrCodeTip && (
              <div
                style={{
                  fontSize: 12,
                  color: theme.subtitleColor,
                  marginTop: 8,
                  fontWeight: 500,
                  maxWidth: qrDimension + 32,
                  lineHeight: 1.4,
                  wordBreak: 'break-all',
                }}
              >
                {qrCodeTip}
              </div>
            )}
          </div>
        )}

        {/* 联系方式列表 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            width: '100%',
          }}
        >
          {contactItems.map((item, idx) => {
            const isClickable = item.action && item.action !== 'none';
            const itemColor = item.color || customAccentColor;
            return (
              <div
                key={idx}
                onClick={() => isClickable && handleAction(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 14px',
                  borderRadius: 10,
                  background: theme.itemBg,
                  border: theme.itemBorder,
                  color: theme.titleColor,
                  fontSize: 13.5,
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  userSelect: isClickable ? 'none' : 'text',
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = 'translateX(3px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = theme.itemBg;
                  }
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${itemColor}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: itemColor,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {renderCustomOrOfficialIcon(item.icon, itemColor, 15)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  {item.label && (
                    <span style={{ fontSize: 11, color: theme.subtitleColor, lineHeight: 1.2 }}>
                      {item.label}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: theme.titleColor,
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                {getActionBadge(item.action)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export class CustomContactBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '16px 0' }}
      >
        <ContactSupportInner model={this} />
      </div>
    );
  }
}

CustomContactBlockModel.define({
  label: tExpr('客服支持与二维码 (Contact & Support)'),
  hide: true,
  createModelOptions: {
    use: 'CustomContactBlockModel',
  },
});

/* ==========================================================================
   11. 多语言快捷切换原生区块 (CustomLanguageBlockModel)
   ========================================================================== */
export const LanguageSwitcherInner: React.FC<{ model: any }> = ({ model }) => {
  const props = model?.props || {};
  const mode = props.mode || 'pills'; // 'pills' | 'select'
  const align = props.align || 'right'; // 'left' | 'center' | 'right'
  const languages = Array.isArray(props.languages) && props.languages.length > 0
    ? props.languages
    : [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
        { label: '繁體中文', value: 'zh-TW' },
        { label: '日本語', value: 'ja-JP' },
      ];

  // 读取当前系统语言
  const getCurrentLang = () => {
    try {
      const stored = localStorage.getItem('NOCOBASE_LOCALE') || localStorage.getItem('locale');
      if (stored) return stored;
    } catch (e) {}
    return 'zh-CN';
  };

  const [currentLang, setCurrentLang] = useState<string>(getCurrentLang());

  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang);
    try {
      localStorage.setItem('NOCOBASE_LOCALE', newLang);
      localStorage.setItem('locale', newLang);
      // 调用 NocoBase 全局切换
      const app = (window as any).__nocobase_v2_app__ || (window as any).nocobase;
      if (app?.i18n?.changeLanguage) {
        app.i18n.changeLanguage(newLang);
      } else {
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
        alignItems: 'center',
        gap: 8,
        width: '100%',
      }}
    >
      <GlobalOutlined style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 16 }} />
      {mode === 'pills' ? (
        <Segmented
          options={languages.map((l: any) => ({ label: l.label, value: l.value }))}
          value={currentLang}
          onChange={(val) => handleLanguageChange(val as string)}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: 8,
          }}
        />
      ) : (
        <Select
          size="small"
          value={currentLang}
          onChange={handleLanguageChange}
          style={{ width: 120 }}
          options={languages}
        />
      )}
    </div>
  );
};

export class CustomLanguageBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '8px 0' }}
      >
        <LanguageSwitcherInner model={this} />
      </div>
    );
  }
}

CustomLanguageBlockModel.define({
  label: tExpr('Language Switcher'),
  hide: true,
  createModelOptions: {
    use: 'CustomLanguageBlockModel',
  },
});

/* ==========================================================================
   12. 活动宣传与倒计时原生区块 (CustomCountdownBlockModel)
   ========================================================================== */

export const COUNTDOWN_THEMES: Record<string, {
  name: string;
  background: string;
  border: string;
  glow: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  defaultBtnColor: string;
  digitBg: string;
  digitColor: string;
}> = {
  purple: {
    name: '🌌 星际紫夜 (科技蓝紫)',
    background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.28) 0%, rgba(114, 46, 209, 0.32) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.24)',
    glow: '0 16px 40px rgba(114, 46, 209, 0.22)',
    badgeBg: 'rgba(59, 130, 246, 0.25)',
    badgeColor: '#bfdbfe',
    badgeBorder: 'rgba(147, 197, 253, 0.35)',
    defaultBtnColor: '#1677ff',
    digitBg: 'rgba(15, 23, 42, 0.55)',
    digitColor: '#ffffff',
  },
  cyan: {
    name: '🌊 极光青碧 (科技翡翠)',
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.28) 0%, rgba(16, 185, 129, 0.26) 100%)',
    border: '1px solid rgba(167, 243, 208, 0.28)',
    glow: '0 16px 40px rgba(6, 182, 212, 0.20)',
    badgeBg: 'rgba(6, 182, 212, 0.22)',
    badgeColor: '#a5f3fc',
    badgeBorder: 'rgba(103, 232, 249, 0.35)',
    defaultBtnColor: '#0891b2',
    digitBg: 'rgba(4, 47, 46, 0.55)',
    digitColor: '#67e8f9',
  },
  sunset: {
    name: '🔥 熔岩落霞 (炽热赤金)',
    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.30) 0%, rgba(239, 68, 68, 0.28) 100%)',
    border: '1px solid rgba(254, 215, 170, 0.28)',
    glow: '0 16px 40px rgba(249, 115, 22, 0.22)',
    badgeBg: 'rgba(249, 115, 22, 0.25)',
    badgeColor: '#fed7aa',
    badgeBorder: 'rgba(253, 186, 116, 0.35)',
    defaultBtnColor: '#f97316',
    digitBg: 'rgba(67, 20, 7, 0.55)',
    digitColor: '#ffedd5',
  },
  obsidian: {
    name: '🌑 深空曜黑 (磨砂科技)',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.82) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    glow: '0 16px 40px rgba(0, 0, 0, 0.45)',
    badgeBg: 'rgba(255, 255, 255, 0.12)',
    badgeColor: '#f1f5f9',
    badgeBorder: 'rgba(255, 255, 255, 0.22)',
    defaultBtnColor: '#3b82f6',
    digitBg: 'rgba(2, 6, 23, 0.7)',
    digitColor: '#38bdf8',
  },
  glass: {
    name: '💎 纯澈晶钻 (高透毛玻璃)',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.32)',
    glow: '0 16px 40px rgba(0, 0, 0, 0.12)',
    badgeBg: 'rgba(255, 255, 255, 0.22)',
    badgeColor: '#ffffff',
    badgeBorder: 'rgba(255, 255, 255, 0.4)',
    defaultBtnColor: '#1677ff',
    digitBg: 'rgba(0, 0, 0, 0.32)',
    digitColor: '#ffffff',
  },
};

export const CountdownInner: React.FC<{ model: any }> = ({ model }) => {
  const props = model?.props || {};
  const themeKey = props.cardTheme || 'purple';
  const theme = COUNTDOWN_THEMES[themeKey] || COUNTDOWN_THEMES.purple;

  const badge = props.badge || '🔥 架构升级盛典';
  const badgeColor = props.badgeColor || theme.badgeColor;
  const badgeBg = props.badgeBg || theme.badgeBg;
  const badgeBorder = props.badgeBorder || theme.badgeBorder;

  const title = props.title || 'NocoBase 企业数字化中枢 V3.0 全球公测';
  const titleColor = props.titleColor || '#ffffff';
  const description = props.description || '距离全新一代零代码业务引擎正式发布仅剩最后冲刺时间，立即预约获取专属体验席位！';
  const descColor = props.descColor || 'rgba(255, 255, 255, 0.85)';

  const targetDate = props.targetDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const align = props.align || 'left'; // 'left' | 'center'
  const isCenter = align === 'center';

  const showButton = props.showButton ?? true;
  const buttonText = props.buttonText || '立即预约席位';
  const buttonUrl = props.buttonUrl || '';
  const buttonColor = props.buttonColor || theme.defaultBtnColor;
  const buttonTarget = props.buttonTarget || '_blank';

  const digitBg = props.digitBg || theme.digitBg;
  const digitColor = props.digitColor || theme.digitColor;
  const showSeconds = props.showSeconds ?? true;
  const endNotice = props.endNotice || '🎉 活动现已全面开启，欢迎体验！';

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isEnded: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const renderNumberCard = (num: number, label: string, isSec = false) => (
    <div style={{ textAlign: 'center', minWidth: 62 }}>
      <div
        style={{
          position: 'relative',
          background: digitBg,
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 12,
          padding: '12px 14px',
          minWidth: 58,
          fontSize: 26,
          fontWeight: 800,
          color: digitColor,
          lineHeight: 1.1,
          boxShadow: isSec
            ? 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 14px rgba(0, 0, 0, 0.35)'
            : 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.28)',
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, monospace",
          letterSpacing: '-0.02em',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* 微拟物翻牌器上下微光折痕 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            background: 'rgba(0, 0, 0, 0.28)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
        {String(num).padStart(2, '0')}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.78)',
          marginTop: 6,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: props.customBg || theme.background,
        borderRadius: 20,
        border: theme.border,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: theme.glow,
        padding: '30px 34px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        textAlign: isCenter ? 'center' : 'left',
      }}
    >
      {/* 顶部微光光晕条 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* 胶囊徽标 */}
      {badge && (
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeBorder}`,
              borderRadius: 24,
              padding: '4px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '0.02em',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* 活动大标题 */}
      <div
        style={{
          fontSize: props.titleFontSize ? (typeof props.titleFontSize === 'number' ? `${props.titleFontSize}px` : props.titleFontSize) : 22,
          fontWeight: 800,
          color: titleColor,
          marginBottom: 10,
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {title}
      </div>

      {/* 活动描述说明 */}
      {description && (
        <div
          style={{
            fontSize: props.descFontSize ? (typeof props.descFontSize === 'number' ? `${props.descFontSize}px` : props.descFontSize) : 14,
            color: descColor,
            marginBottom: 24,
            lineHeight: 1.68,
            maxWidth: isCenter ? 680 : 640,
            margin: isCenter ? '0 auto 24px auto' : '0 0 24px 0',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          {description}
        </div>
      )}

      {/* 倒计时主控面板与行动按钮区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter ? 'center' : 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {timeLeft.isEnded ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 20px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              fontSize: 15,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {endNotice}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {renderNumberCard(timeLeft.days, '天')}
            <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
              :
            </span>
            {renderNumberCard(timeLeft.hours, '时')}
            <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
              :
            </span>
            {renderNumberCard(timeLeft.minutes, '分')}
            {showSeconds && (
              <>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
                  :
                </span>
                {renderNumberCard(timeLeft.seconds, '秒', true)}
              </>
            )}
          </div>
        )}

        {/* 行动按钮 */}
        {showButton && buttonText && (
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: buttonColor,
              borderColor: buttonColor,
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              padding: '0 28px',
              height: 48,
              boxShadow: `0 8px 24px ${buttonColor}55`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.25s ease',
            }}
            onClick={() => {
              if (!buttonUrl) return;
              if (buttonTarget === '_self') {
                window.location.href = buttonUrl;
              } else {
                window.open(buttonUrl, '_blank');
              }
            }}
          >
            <span>{buttonText}</span>
            <RightOutlined style={{ fontSize: 13, transition: 'transform 0.2s ease' }} />
          </Button>
        )}
      </div>
    </div>
  );
};

export class CustomCountdownBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '16px 0' }}
      >
        <CountdownInner model={this} />
      </div>
    );
  }
}

CustomCountdownBlockModel.define({
  label: tExpr('Event Countdown'),
  hide: true,
  createModelOptions: {
    use: 'CustomCountdownBlockModel',
  },
});

// 统一为所有派生区块模型注册官方原生菜单配置项
const ALL_CUSTOM_BLOCK_MODELS = [
  SignInFormBlockModel,
  CustomHeroBlockModel,
  CustomFeaturesBlockModel,
  CustomCarouselBlockModel,
  CustomStatsBlockModel,
  CustomHtmlBlockModel,
  CustomImageBlockModel,
  CustomNoticeBlockModel,
  CustomPartnersBlockModel,
  CustomContactBlockModel,
  CustomLanguageBlockModel,
  CustomCountdownBlockModel,
];

