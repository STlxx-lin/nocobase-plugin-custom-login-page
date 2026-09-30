import React from 'react';
import { Row, Col, Typography } from 'antd';
import { CustomLoginBlockModel, renderOfficialIcon } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

const { Title, Paragraph } = Typography;

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
        className="custom-block-features custom-features-card"
        style={{ position: 'relative', width: '100%', padding: '12px 0', overflow: 'hidden' }}
      >
        <Row gutter={[18, 18]} style={{ margin: 0 }}>
          {items.map((item: any, idx: number) => {
            const iconColor = item.color || '#69b1ff';
            const IconCmp = renderOfficialIcon(item.icon, iconColor, 22);
            return (
              <Col xs={24} sm={12} md={span} key={idx}>
                <div
                  className="custom-features-item"
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
  label: tExpr('Features matrix'),
  hide: true,
  createModelOptions: {
    use: 'CustomFeaturesBlockModel',
  },
});
