import React, { forwardRef } from 'react';
import { theme } from 'antd';
import { CustomLoginConfig } from '../types';
import { LoginPageBlockGridCanvas, LoginPageBlockGridCanvasRef } from './LoginPageBlockGridCanvas';

export interface CustomLoginContainerProps {
  config: CustomLoginConfig;
  children?: React.ReactNode;
  apiClient?: any;
  designMode?: boolean;
  onModelReady?: (model: any) => void;
  originalSignInPage?: React.ComponentType;
}

// 🛡️ 生产级错误边界保护：拦截任意自定义区块的未捕获崩溃，自动安全降级为官方原生登录，永不白屏！
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class CustomLoginErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CustomLoginContainer] 捕获到自定义登录画布未处理异常，自动启动降级保护:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallbackComponent;
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a192f', padding: 24 }}>
          <div style={{ maxWidth: 420, width: '100%', background: 'rgba(255, 255, 255, 0.96)', borderRadius: 16, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, fontSize: 12, color: '#d48806' }}>
              ⚠️ 自定义登录画布渲染异常，已自动启用系统原生登录安全保障模式。
            </div>
            {Fallback ? <Fallback /> : <div>请联系系统管理员修复自定义登录配置。</div>}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 自定义登录页统一原生区块容器
 * 100% 承载官方原生 BlockGrid 画布，支持官方原生拖拽排版与区块设计
 */
const CustomLoginContainerInner = forwardRef<LoginPageBlockGridCanvasRef, CustomLoginContainerProps>(
  ({ config, designMode = false, onModelReady, originalSignInPage }, ref) => {
    const { token } = theme.useToken();

    // 挂载原生登录组件供区块模型使用
    React.useEffect(() => {
      if (originalSignInPage) {
        (window as any).__NocobaseOriginalSignInComponent = originalSignInPage;
      }
    }, [originalSignInPage]);

    if (originalSignInPage) {
      (window as any).__NocobaseOriginalSignInComponent = originalSignInPage;
    }

    const themeConfig = config?.themeConfig || {
      brandTitle: 'NocoBase',
      brandSubtitle: '',
      brandLogo: '',
      brandPosterUrl: '',
      primaryColor: '#1677ff',
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%)',
      copyright: 'Copyright © 2026 NocoBase. All rights reserved.',
      icp: '',
    };

    const canvasWidth = config?.canvasWidth || 'wide';
    const containerStyle = config?.containerStyle || 'transparent';

    // 动态计算背景样式
    const getContainerBg = (): React.CSSProperties => {
      const type = themeConfig.backgroundType || 'gradient';
      const val =
        themeConfig.backgroundValue ||
        'linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%)';

      if (type === 'image') {
        return {
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.45), rgba(10, 25, 47, 0.65)), url(${val})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        };
      }

      if (type === 'color') {
        return {
          backgroundColor: val,
        };
      }

      return {
        background: val,
      };
    };

    // 动态计算主体画幅宽度与质感外框
    const getMainContainerStyle = (): React.CSSProperties => {
      const widthMap = {
        standard: '1160px',
        wide: '1480px',
        full: '100%',
      };

      const base: React.CSSProperties = {
        width: '100%',
        maxWidth: widthMap[canvasWidth] || '1480px',
        margin: '0 auto',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
      };

      if (containerStyle === 'transparent') {
        return {
          ...base,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none',
        };
      }

      if (containerStyle === 'glass') {
        return {
          ...base,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          padding: canvasWidth === 'full' ? '24px' : '40px',
        };
      }

      if (containerStyle === 'card') {
        return {
          ...base,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          padding: canvasWidth === 'full' ? '24px' : '40px',
        };
      }

      if (containerStyle === 'dark-card') {
        return {
          ...base,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
        };
      }

      // 白曜现代大卡片 (高雅纯白现代高定)
      return {
        ...base,
        padding: '28px 24px',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
      };
    };

    // 智能计算大背景是否为浅色底，确保外层页脚版权文字清晰可读
    const isLightBackground = () => {
      const val = (themeConfig?.backgroundValue || '').toLowerCase();
      if (themeConfig?.backgroundType === 'color') {
        if (val === '#ffffff' || val === '#f1f5f9' || val === '#f8fafc' || val.startsWith('#e') || val.startsWith('#f')) {
          return true;
        }
      }
      if (val.includes('#f1f5f9') || val.includes('#f8fafc') || val.includes('#ffffff') || val.includes('#fdfbfb')) {
        return true;
      }
      return false;
    };

    const isLightBg = isLightBackground();

    // 默认页脚版权
    const renderFooter = () => (
      <div
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: isLightBg ? '#64748b' : 'rgba(255, 255, 255, 0.85)',
          textShadow: isLightBg ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.4)',
        }}
      >
        {themeConfig.copyright && <div>{themeConfig.copyright}</div>}
        {themeConfig.icp && <div style={{ marginTop: 4 }}>{themeConfig.icp}</div>}
      </div>
    );

    const isActualSignInRoute = typeof window !== 'undefined' && !designMode && (
      window.location.pathname === '/signin' ||
      window.location.pathname === '/v/signin' ||
      window.location.pathname.endsWith('/signin') ||
      window.location.pathname.startsWith('/signin/') ||
      window.location.pathname.startsWith('/v/signin/') ||
      (window.location.pathname.includes('/signin') && !window.location.pathname.includes('/settings/'))
    );

    return (
      <div
        className={`custom-login-page-root custom-login-style-${containerStyle} ${designMode ? 'is-design-mode' : 'is-preview-mode'} ${isActualSignInRoute ? 'is-actual-signin-route' : 'is-settings-canvas-route'}`}
        style={{
          minHeight: isActualSignInRoute ? '100vh' : '460px',
          height: isActualSignInRoute ? '100vh' : 'auto',
          width: isActualSignInRoute ? '100vw' : '100%',
          display: 'flex',
          flexDirection: 'column',
          position: isActualSignInRoute ? 'fixed' : 'relative',
          top: isActualSignInRoute ? 0 : undefined,
          left: isActualSignInRoute ? 0 : undefined,
          right: isActualSignInRoute ? 0 : undefined,
          bottom: isActualSignInRoute ? 0 : undefined,
          zIndex: isActualSignInRoute ? 1000 : undefined,
          overflowY: isActualSignInRoute ? 'auto' : 'visible',
          boxSizing: 'border-box',
          ...getContainerBg(),
        }}
      >
        {/* 全局 Markdown 及区块穿透样式：彻底解决卡片白底冲突与父级 320px 挤压问题 */}
        <style>{`
          /* 仅在前台实际登录路由下穿透重置父级容器，全屏铺展，绝不污染后台管理界面 */
          .custom-login-page-root.is-actual-signin-route {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            z-index: 1000 !important;
            display: flex !important;
          }
          body:has(.custom-login-page-root.is-actual-signin-route) {
            overflow: hidden !important;
          }
          /* 穿透重置祖先容器的 max-width: 320px 限制，彻底消除挤压变形 */
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> * > * > .custom-login-page-root.is-actual-signin-route),
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> * > .custom-login-page-root.is-actual-signin-route),
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> .custom-login-page-root.is-actual-signin-route),
          div:has(> * > * > .custom-login-page-root.is-actual-signin-route),
          div:has(> * > .custom-login-page-root.is-actual-signin-route),
          div:has(> .custom-login-page-root.is-actual-signin-route) {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* 隐藏原生 AuthLayout 的居中大标题与底部版权，由自定义登录页统管展示 */
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> * > * > .custom-login-page-root.is-actual-signin-route) > h1,
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> * > .custom-login-page-root.is-actual-signin-route) > h1,
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> .custom-login-page-root.is-actual-signin-route) > h1,
          body:has(.custom-login-page-root.is-actual-signin-route) > div > h1,
          body:has(.custom-login-page-root.is-actual-signin-route) > * h1:not([class]) {
            display: none !important;
          }
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> * > * > .custom-login-page-root.is-actual-signin-route) > div:has(> .nb-powered-by),
          body:has(.custom-login-page-root.is-actual-signin-route) div:has(> .custom-login-page-root.is-actual-signin-route) > div:has(> .nb-powered-by) {
            display: none !important;
          }

          /* 访客视角下绝对隐藏编辑悬浮按钮 */
          .custom-login-page-root.is-preview-mode .custom-block-edit-floating-bar,
          .custom-login-page-root:not(.is-design-mode) .custom-block-edit-floating-bar {
            display: none !important;
          }

          .custom-login-page-root .nb-block-grid {
            width: 100% !important;
          }
          /* 核心：彻底消除所有原生区块卡片的白底，透出通透背景与壁纸 */
          .custom-login-page-root .ant-card,
          .custom-login-page-root .nb-block-grid .ant-card,
          .custom-login-page-root [data-grid-root] .ant-card,
          .custom-login-page-root .ant-card.ant-card-bordered {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .custom-login-page-root .ant-card-body,
          .custom-login-page-root .nb-block-grid .ant-card-body {
            padding: 0 !important;
            background: transparent !important;
            overflow: visible !important;
            overflow-x: hidden !important;
          }
          .custom-login-page-root [data-custom-block-root] {
            overflow: visible !important;
            overflow-x: hidden !important;
          }
          /* 彻底消除任何意外出现的横向滚动条与滑块 */
          .custom-login-page-root ::-webkit-scrollbar:horizontal {
            height: 0px !important;
            display: none !important;
          }
          .custom-login-page-root * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .custom-login-style-transparent .custom-login-main-viewport,
          .custom-login-style-glass .custom-login-main-viewport {
            color: #ffffff;
          }
          .custom-login-style-transparent .nb-markdown-vditor,
          .custom-login-style-glass .nb-markdown-vditor {
            color: #ffffff !important;
          }

          /* === 白曜现代大卡片 (custom-login-style-card) 内部元素全自动高质感深色自适应 === */
          .custom-login-style-card .custom-login-main-viewport h1,
          .custom-login-style-card .custom-login-main-viewport .ant-typography h1 {
            color: #0f172a !important;
            text-shadow: none !important;
          }
          .custom-login-style-card .custom-login-main-viewport p,
          .custom-login-style-card .custom-login-main-viewport .ant-typography {
            color: #475569 !important;
            text-shadow: none !important;
          }
          .custom-login-style-card .custom-login-main-viewport .ant-tag {
            background: #eff6ff !important;
            color: #1d4ed8 !important;
            border-color: #bfdbfe !important;
            box-shadow: none !important;
          }
          /* 特性矩阵小卡片：自适应高雅浅灰底 + 细微边框 + 柔和微阴影 */
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] div[style*="background: rgba(255, 255, 255, 0.12)"],
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] div[style*="background:rgba(255, 255, 255, 0.12)"],
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] div[style*="background: rgba(255, 255, 255, 0.1)"] {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04) !important;
          }
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] h5 {
            color: #1e293b !important;
            text-shadow: none !important;
          }
          /* 原生登录表单：在大白卡片内去除突兀的纯白重叠与大阴影，转为精致微嵌 */
          .custom-login-style-card .custom-login-main-viewport .custom-signin-card,
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] div[style*="max-width: 400px"],
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] div[style*="maxWidth: 400"] {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
          }
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] h3 {
            color: #0f172a !important;
          }
          .custom-login-style-card .custom-login-main-viewport [data-custom-block-root] .ant-form-item-label > label {
            color: #334155 !important;
          }
          .custom-login-style-card .nb-markdown-vditor,
          .custom-login-style-card .nb-markdown-vditor * {
            color: #1e293b !important;
          }

          /* === 黑曜科技大卡片 (custom-login-style-dark-card) 内部深邃太空质感 === */
          .custom-login-style-dark-card .custom-login-main-viewport {
            color: #ffffff;
          }
          .custom-login-style-dark-card .nb-markdown-vditor {
            color: #ffffff !important;
          }
          .custom-login-style-dark-card .custom-login-main-viewport .custom-signin-card,
          .custom-login-style-dark-card .custom-login-main-viewport [data-custom-block-root] div[style*="max-width: 400px"],
          .custom-login-style-dark-card .custom-login-main-viewport [data-custom-block-root] div[style*="maxWidth: 400"] {
            background: rgba(30, 41, 59, 0.75) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35) !important;
          }
          .custom-login-style-dark-card .custom-login-main-viewport [data-custom-block-root] h3 {
            color: #ffffff !important;
          }
          .custom-login-style-dark-card .custom-login-main-viewport [data-custom-block-root] div[style*="background: rgba(255, 255, 255, 0.12)"],
          .custom-login-style-dark-card .custom-login-main-viewport [data-custom-block-root] div[style*="background:rgba(255, 255, 255, 0.12)"] {
            background: rgba(30, 41, 59, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          /* === 移动端与平板窄屏流式响应式自适应 === */
          @media (max-width: 768px) {
            .custom-login-page-root.is-actual-signin-route {
              -webkit-overflow-scrolling: touch;
            }
            body:has(.custom-login-page-root.is-actual-signin-route) {
              overflow-y: auto !important;
            }
            .custom-login-page-root .custom-login-main-viewport {
              padding: 16px 12px !important;
              align-items: flex-start !important;
            }
            .custom-login-page-root .nb-block-grid [class*="nb-row"],
            .custom-login-page-root .nb-block-grid .ant-row {
              flex-direction: column !important;
            }
            .custom-login-page-root .nb-block-grid [class*="nb-col"],
            .custom-login-page-root .nb-block-grid .ant-col {
              width: 100% !important;
              max-width: 100% !important;
              flex: 0 0 100% !important;
            }
            .custom-login-page-root [data-custom-block-root] {
              margin-bottom: 16px !important;
            }
          }
        `}</style>

        {/* 主体原生区块网格画布区域 */}
        <div
          className="custom-login-main-viewport"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: canvasWidth === 'full' ? '24px 20px' : '36px 16px',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          <div style={getMainContainerStyle()}>
            <LoginPageBlockGridCanvas
              ref={ref}
              gridSchema={config.gridSchema}
              designMode={designMode}
              onModelReady={onModelReady}
              originalSignInComponent={originalSignInPage}
            />
          </div>
        </div>

        {/* 底部版权 */}
        {renderFooter()}
      </div>
    );
  }
);

CustomLoginContainerInner.displayName = 'CustomLoginContainerInner';

export const CustomLoginContainer = forwardRef<LoginPageBlockGridCanvasRef, CustomLoginContainerProps>(
  (props, ref) => {
    return (
      <CustomLoginErrorBoundary fallbackComponent={props.originalSignInPage}>
        <CustomLoginContainerInner {...props} ref={ref} />
      </CustomLoginErrorBoundary>
    );
  }
);

CustomLoginContainer.displayName = 'CustomLoginContainer';
export default CustomLoginContainer;
