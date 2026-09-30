import React, { useState, useMemo } from 'react';
import { Row, Col } from 'antd';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

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
    if (filterMode === 'black') {
      return isHovered
        ? 'brightness(0) opacity(1)'
        : 'brightness(0) opacity(0.72)';
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
      className={`custom-partners-item-card custom-partners-filter-${filterMode}`}
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
          className={`custom-partners-logo-img custom-partners-filter-${filterMode}`}
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
          className="custom-partners-item-name"
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
      className="custom-block-partners custom-partners-card"
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
            className="custom-partners-title"
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
        <Row className="custom-partners-grid-row" gutter={[16, 16]} align="middle" justify="center">
          {gridVisibleItems.map((item: any, idx: number) => (
            <Col className="custom-partners-grid-col" span={span} key={idx} xs={12} sm={12} md={span}>
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
  label: tExpr('Partners logo wall'),
  hide: true,
  createModelOptions: {
    use: 'CustomPartnersBlockModel',
  },
});
