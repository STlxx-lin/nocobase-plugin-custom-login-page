import React, { useState } from 'react';
import { CloseOutlined, SoundOutlined } from '@ant-design/icons';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

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

export const CustomNoticeInner: React.FC<{ props: any; model: any }> = ({ props, model }) => {
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
      className="custom-block-notice custom-notice-card"
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
      <div className="custom-notice-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12, zIndex: 2 }}>
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
  label: tExpr('Notice bar'),
  hide: true,
  createModelOptions: {
    use: 'CustomNoticeBlockModel',
  },
});
