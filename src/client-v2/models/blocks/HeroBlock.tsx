import React from 'react';
import { Typography, Tag, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

const { Title, Paragraph } = Typography;

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
  label: tExpr('Hero banner'),
  hide: true,
  createModelOptions: {
    use: 'CustomHeroBlockModel',
  },
});
