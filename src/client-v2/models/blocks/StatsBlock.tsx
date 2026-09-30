import React from 'react';
import { Row, Col } from 'antd';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

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
  label: tExpr('Stats dashboard'),
  hide: true,
  createModelOptions: {
    use: 'CustomStatsBlockModel',
  },
});
