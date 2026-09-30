import React from 'react';
import { Carousel, Typography } from 'antd';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

const { Title, Paragraph } = Typography;

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
  label: tExpr('Dynamic carousel'),
  hide: true,
  createModelOptions: {
    use: 'CustomCarouselBlockModel',
  },
});
