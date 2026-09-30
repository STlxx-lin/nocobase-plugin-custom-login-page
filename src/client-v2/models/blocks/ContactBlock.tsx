import React from 'react';
import { Image, QRCode, message } from 'antd';
import {
  CustomerServiceOutlined,
  CopyOutlined,
  LinkOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { CustomLoginBlockModel, renderCustomOrOfficialIcon } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

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
      className="custom-block-contact custom-contact-card"
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
        className="custom-contact-body"
        style={{
          display: 'flex',
          flexDirection: layout === 'vertical' ? 'column' : 'row',
          alignItems: layout === 'vertical' ? 'center' : 'center',
          gap: layout === 'vertical' ? 20 : 24,
        }}
      >
        {/* 二维码区域 */}
        {showQrCode && rawQrCode && (
          <div className="custom-contact-qr-wrapper" style={{ textAlign: 'center', flexShrink: 0 }}>
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
          className="custom-contact-list"
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
                className="custom-contact-item"
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
  label: tExpr('Contact & Support'),
  hide: true,
  createModelOptions: {
    use: 'CustomContactBlockModel',
  },
});
