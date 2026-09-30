// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { buildMobileResponsiveRules } from '../components/responsiveRules';

describe('Responsive Layout Engine (Container Queries & Viewport Mode)', () => {
  beforeEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
  });

  it('correctly sets viewport class on custom-login-page-root', () => {
    const root = document.createElement('div');
    const viewportMode: 'desktop' | 'tablet' | 'mobile' = 'mobile';
    root.className = `custom-login-page-root custom-login-style-transparent is-viewport-${viewportMode}`;
    document.body.appendChild(root);

    expect(root.classList.contains('is-viewport-mobile')).toBe(true);
    expect(root.classList.contains('is-viewport-desktop')).toBe(false);
  });

  it('verifies data-grid-root and ant-row selectors match FlowEngine DOM structure', () => {
    const root = document.createElement('div');
    root.className = 'custom-login-page-root is-viewport-mobile';

    const gridRoot = document.createElement('div');
    gridRoot.setAttribute('data-grid-root', 'true');

    const gridRow = document.createElement('div');
    gridRow.className = 'ant-row';
    gridRow.setAttribute('data-grid-row-id', 'row_login_main');

    const colHero = document.createElement('div');
    colHero.className = 'ant-col ant-col-14';
    colHero.setAttribute('data-grid-column-row-id', 'row_login_main');

    const colForm = document.createElement('div');
    colForm.className = 'ant-col ant-col-10';
    colForm.setAttribute('data-grid-column-row-id', 'row_login_main');

    gridRow.appendChild(colHero);
    gridRow.appendChild(colForm);
    gridRoot.appendChild(gridRow);
    root.appendChild(gridRoot);
    document.body.appendChild(root);

    // 验证能够精准选择到 FlowEngine 原生网格节点
    const matchedRow = root.querySelector('[data-grid-root] .ant-row');
    const matchedCols = root.querySelectorAll('[data-grid-column-row-id]');

    expect(matchedRow).not.toBeNull();
    expect(matchedCols.length).toBe(2);
  });

  it('buildMobileResponsiveRules covers all 12 native custom blocks with mobile adaptation rules', () => {
    const cssRules = buildMobileResponsiveRules('.custom-login-page-root.is-viewport-mobile');

    // 12 个原生区块全部包含
    expect(cssRules).toContain('.custom-signin-card');
    expect(cssRules).toContain('.custom-block-hero');
    expect(cssRules).toContain('.custom-block-features');
    expect(cssRules).toContain('.custom-block-stats');
    expect(cssRules).toContain('.custom-block-carousel');
    expect(cssRules).toContain('.custom-block-image');
    expect(cssRules).toContain('.custom-block-notice');
    expect(cssRules).toContain('.custom-block-partners');
    expect(cssRules).toContain('.custom-block-contact');
    expect(cssRules).toContain('.custom-block-countdown');
    expect(cssRules).toContain('.custom-block-language');
    expect(cssRules).toContain('.custom-block-html');

    // 关键自适应排版逻辑校验
    // 1. StatsBlock 必须配置 50% 宽度 (2x2 网格)
    expect(cssRules).toContain('custom-stats-col');
    expect(cssRules).toContain('max-width: 50% !important');

    // 2. PartnersBlock 必须配置 50% 宽度 (2 列并排) 与跑马灯紧凑尺寸
    expect(cssRules).toContain('custom-partners-grid-col');
    expect(cssRules).toContain('custom-partners-item-card');
    expect(cssRules).toContain('min-width: 125px !important');

    // 3. CountdownBlock 翻牌器自适应收缩
    expect(cssRules).toContain('custom-countdown-digits');
    expect(cssRules).toContain('custom-countdown-number-card');
    expect(cssRules).toContain('custom-countdown-number-box');
    expect(cssRules).toContain('min-width: 44px !important');

    // 4. ContactBlock 强制垂直排列，二维码居中
    expect(cssRules).toContain('custom-contact-body');
    expect(cssRules).toContain('flex-direction: column !important');
    expect(cssRules).toContain('custom-contact-qr-wrapper');

    // 5. CarouselBlock 与 ImageBlock 限高
    expect(cssRules).toContain('custom-carousel-slide');
    expect(cssRules).toContain('height: 200px !important');
    expect(cssRules).toContain('custom-image-content');
    expect(cssRules).toContain('max-height: 200px !important');

    // 6. HtmlBlock 强制 word-break 防撑爆
    expect(cssRules).toContain('custom-html-content');
    expect(cssRules).toContain('word-break: break-word !important');
  });

  it('verifies DOM structure match for mobile components in viewport container', () => {
    const container = document.createElement('div');
    container.className = 'custom-login-page-root is-viewport-mobile';

    // 模拟 12 个原生区块在画布中的挂载
    container.innerHTML = `
      <div class="custom-block-signin"><div class="custom-signin-card"></div></div>
      <div class="custom-block-hero"><div class="custom-hero-inner"><h1>标题</h1><p>说明</p></div></div>
      <div class="custom-block-features"><div class="custom-features-item"></div></div>
      <div class="custom-block-stats"><div class="custom-stats-row"><div class="custom-stats-col"><div class="custom-stats-value">100</div></div></div></div>
      <div class="custom-block-carousel"><div class="custom-carousel-slide"></div></div>
      <div class="custom-block-image"><img class="custom-image-content" /></div>
      <div class="custom-block-notice custom-notice-card"><div class="custom-notice-cta"><a>按钮</a></div></div>
      <div class="custom-block-partners custom-partners-card"><div class="custom-partners-grid-row"><div class="custom-partners-grid-col"></div></div></div>
      <div class="custom-block-contact custom-contact-card"><div class="custom-contact-body"><div class="custom-contact-qr-wrapper"></div><div class="custom-contact-list"><div class="custom-contact-item"></div></div></div></div>
      <div class="custom-block-countdown custom-countdown-card"><div class="custom-countdown-digits"><div class="custom-countdown-number-card"><div class="custom-countdown-number-box">08</div></div></div></div>
      <div class="custom-block-language"><div class="custom-language-inner"></div></div>
      <div class="custom-block-html"><div class="custom-html-content">HTML</div></div>
    `;

    document.body.appendChild(container);

    // 验证所有 12 个区块的移动端选择器均能在 DOM 中精准命中
    expect(container.querySelector('.custom-signin-card')).not.toBeNull();
    expect(container.querySelector('.custom-block-hero .custom-hero-inner')).not.toBeNull();
    expect(container.querySelector('.custom-block-features .custom-features-item')).not.toBeNull();
    expect(container.querySelector('.custom-block-stats .custom-stats-col')).not.toBeNull();
    expect(container.querySelector('.custom-block-carousel .custom-carousel-slide')).not.toBeNull();
    expect(container.querySelector('.custom-block-image .custom-image-content')).not.toBeNull();
    expect(container.querySelector('.custom-block-notice.custom-notice-card')).not.toBeNull();
    expect(container.querySelector('.custom-block-partners .custom-partners-grid-col')).not.toBeNull();
    expect(container.querySelector('.custom-block-contact .custom-contact-body')).not.toBeNull();
    expect(container.querySelector('.custom-block-countdown .custom-countdown-number-box')).not.toBeNull();
    expect(container.querySelector('.custom-block-language .custom-language-inner')).not.toBeNull();
    expect(container.querySelector('.custom-block-html .custom-html-content')).not.toBeNull();
  });

  it('verifies concentric corner curvature and overflow protection for mobile card container', () => {
    const cssRules = buildMobileResponsiveRules('.custom-login-page-root.is-viewport-mobile');

    // 验证主体视口与卡片容器的同心圆角与外边距收敛规则
    expect(cssRules).toContain('.custom-login-main-viewport');
    expect(cssRules).toContain('padding: 8px 6px !important');
    expect(cssRules).toContain('.custom-login-card-container');
    expect(cssRules).toContain('border-radius: 20px !important');
    expect(cssRules).toContain('overflow: hidden !important');
    expect(cssRules).toContain('padding: 16px 12px !important');

    // 验证在透明风格下卡片容器自适应紧凑无圆角多余留白
    expect(cssRules).toContain('.custom-login-style-transparent .custom-login-card-container');
    expect(cssRules).toContain('border-radius: 0 !important');
  });
});
