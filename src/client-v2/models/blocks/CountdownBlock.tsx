import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

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
    <div className="custom-countdown-number-card" style={{ textAlign: 'center', minWidth: 62 }}>
      <div
        className="custom-countdown-number-box"
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
        className="custom-countdown-number-label"
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
      className="custom-block-countdown custom-countdown-card"
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
          <div className="custom-countdown-digits" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {renderNumberCard(timeLeft.days, '天')}
            <span className="custom-countdown-colon" style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
              :
            </span>
            {renderNumberCard(timeLeft.hours, '时')}
            <span className="custom-countdown-colon" style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
              :
            </span>
            {renderNumberCard(timeLeft.minutes, '分')}
            {showSeconds && (
              <>
                <span className="custom-countdown-colon" style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', margin: '0 -2px 18px -2px' }}>
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
            className="custom-countdown-btn"
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
