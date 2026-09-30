/**
 * 全量 12 个原生区块移动端（手机界面）全方位自适应规则生成器
 * 确保在后台 375px 模拟视口、CSS Container Queries、真实移动端媒体查询下 100% 优雅呈现
 */
export const buildMobileResponsiveRules = (scope = ''): string => `
  ${scope} .custom-login-main-viewport {
    padding: 8px 6px !important;
    align-items: flex-start !important;
  }
  ${scope} .custom-login-card-container {
    border-radius: 20px !important;
    overflow: hidden !important;
    padding: 16px 12px !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
  }
  ${scope}.custom-login-style-transparent .custom-login-card-container,
  ${scope} .custom-login-style-transparent .custom-login-card-container {
    padding: 6px 4px !important;
    border-radius: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  ${scope} [data-grid-root] > .ant-row,
  ${scope} [data-grid-root] .ant-row,
  ${scope} [data-grid-row-id] {
    flex-direction: column !important;
    display: flex !important;
    width: 100% !important;
    row-gap: 20px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  ${scope} [data-grid-column-row-id],
  ${scope} [data-grid-root] .ant-col,
  ${scope} [data-grid-root] [class*="ant-col-"] {
    display: block !important;
    flex: 0 0 100% !important;
    max-width: 100% !important;
    width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  ${scope} [data-custom-block-root]:not(.custom-block-stats):not(.custom-block-partners) .ant-row > .ant-col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    width: 100% !important;
    margin-bottom: 12px !important;
  }

  /* 1. 登录表单 SignInFormBlock */
  ${scope} .custom-signin-card,
  ${scope} [data-custom-block-root] .custom-signin-card {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding: 20px 16px !important;
    box-sizing: border-box !important;
    border-radius: 16px !important;
  }
  ${scope} .custom-signin-card .ant-btn-primary,
  ${scope} .custom-signin-card button[type="submit"] {
    height: 44px !important;
    font-size: 15px !important;
    border-radius: 10px !important;
  }

  /* 2. 品牌标语 HeroBlock */
  ${scope} .custom-block-hero .custom-hero-inner,
  ${scope} .custom-hero-card .custom-hero-inner {
    padding: 12px 6px !important;
    text-align: center !important;
  }
  ${scope} .custom-block-hero h1,
  ${scope} .custom-block-hero .ant-typography h1,
  ${scope} [data-custom-block-root].custom-block-hero h1 {
    font-size: 24px !important;
    line-height: 1.3 !important;
    margin-bottom: 8px !important;
    text-align: center !important;
    letter-spacing: -0.02em !important;
  }
  ${scope} .custom-block-hero p,
  ${scope} .custom-block-hero .ant-typography,
  ${scope} [data-custom-block-root].custom-block-hero p {
    font-size: 13px !important;
    line-height: 1.55 !important;
    margin-bottom: 12px !important;
    text-align: center !important;
  }
  ${scope} .custom-block-hero .ant-tag {
    margin-bottom: 12px !important;
    padding: 3px 10px !important;
    font-size: 11.5px !important;
  }
  ${scope} .custom-block-hero .ant-btn {
    height: 40px !important;
    font-size: 14px !important;
    padding: 0 20px !important;
  }

  /* 3. 特性矩阵 FeaturesBlock */
  ${scope} .custom-block-features,
  ${scope} .custom-features-card {
    padding: 6px 0 !important;
  }
  ${scope} .custom-block-features .custom-features-item {
    padding: 14px 16px !important;
    border-radius: 14px !important;
  }
  ${scope} .custom-block-features .custom-features-item h5 {
    font-size: 15px !important;
    margin-bottom: 6px !important;
  }
  ${scope} .custom-block-features .custom-features-item p {
    font-size: 12.5px !important;
    line-height: 1.55 !important;
  }

  /* 4. 核心数据看板 StatsBlock (2x2 规整网格与字号自适应) */
  ${scope} .custom-block-stats .custom-stats-card-inner,
  ${scope} .custom-stats-card .custom-stats-card-inner {
    padding: 16px 12px !important;
    border-radius: 14px !important;
  }
  ${scope} .custom-block-stats .custom-stats-row,
  ${scope} .custom-stats-card .custom-stats-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    margin: 0 -8px !important;
  }
  ${scope} .custom-block-stats .custom-stats-col,
  ${scope} .custom-stats-card .custom-stats-col,
  ${scope} .custom-block-stats .ant-row > .ant-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
    width: 50% !important;
    padding: 0 8px !important;
    margin-bottom: 12px !important;
  }
  ${scope} .custom-block-stats .custom-stats-value {
    font-size: 22px !important;
    line-height: 1.2 !important;
    margin-bottom: 4px !important;
  }
  ${scope} .custom-block-stats .custom-stats-label {
    font-size: 11.5px !important;
  }

  /* 5. 动态全景轮播 CarouselBlock */
  ${scope} .custom-block-carousel .custom-carousel-slide {
    height: 200px !important;
    padding: 16px 14px !important;
  }
  ${scope} .custom-block-carousel .custom-carousel-slide h2,
  ${scope} .custom-block-carousel .custom-carousel-slide .ant-typography {
    font-size: 18px !important;
    margin-bottom: 6px !important;
  }
  ${scope} .custom-block-carousel .custom-carousel-slide p {
    font-size: 12px !important;
    line-height: 1.45 !important;
    max-width: 100% !important;
  }

  /* 6. 宣传插画 / 大图 ImageBlock */
  ${scope} .custom-block-image .custom-image-content {
    max-height: 200px !important;
    height: auto !important;
    width: 100% !important;
    object-fit: cover !important;
    border-radius: 12px !important;
  }

  /* 7. 平台公告通知条 NoticeBlock */
  ${scope} .custom-block-notice.custom-notice-card,
  ${scope} .custom-notice-card {
    padding: 7px 10px !important;
    border-radius: 10px !important;
    margin: 6px 0 !important;
  }
  ${scope} .custom-block-notice .custom-notice-cta a {
    padding: 2px 8px !important;
    font-size: 11px !important;
    border-radius: 10px !important;
  }
  ${scope} .custom-block-notice span {
    font-size: 12px !important;
  }

  /* 8. 合作伙伴与客户 Logo 墙 PartnersBlock (2 列网格与跑马灯紧凑卡片) */
  ${scope} .custom-block-partners.custom-partners-card,
  ${scope} .custom-partners-card {
    padding: 16px 12px !important;
    border-radius: 14px !important;
    margin: 12px 0 !important;
  }
  ${scope} .custom-block-partners .custom-partners-grid-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    margin: 0 -6px !important;
  }
  ${scope} .custom-block-partners .custom-partners-grid-col,
  ${scope} .custom-block-partners .custom-partners-grid-row > .ant-col {
    flex: 0 0 50% !important;
    max-width: 50% !important;
    width: 50% !important;
    padding: 0 6px !important;
    margin-bottom: 10px !important;
  }
  ${scope} .custom-block-partners .custom-partners-item-card {
    min-width: 125px !important;
    height: 46px !important;
    padding: 6px 12px !important;
  }
  ${scope} .custom-block-partners .custom-partners-item-card img {
    max-height: 24px !important;
  }
  ${scope} .custom-block-partners .custom-partners-item-card span {
    font-size: 12px !important;
  }

  /* 9. 客服与支持 ContactBlock (垂直堆叠，居中二维码) */
  ${scope} .custom-block-contact.custom-contact-card,
  ${scope} .custom-contact-card {
    padding: 18px 14px !important;
    border-radius: 14px !important;
    margin: 12px 0 !important;
  }
  ${scope} .custom-block-contact .custom-contact-body {
    flex-direction: column !important;
    align-items: center !important;
    gap: 16px !important;
  }
  ${scope} .custom-block-contact .custom-contact-qr-wrapper {
    margin: 0 auto !important;
    text-align: center !important;
  }
  ${scope} .custom-block-contact .custom-contact-list {
    width: 100% !important;
    flex: none !important;
    gap: 8px !important;
  }
  ${scope} .custom-block-contact .custom-contact-item {
    padding: 8px 12px !important;
    font-size: 12.5px !important;
    border-radius: 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* 10. 活动倒计时 CountdownBlock (紧凑翻牌器不溢出) */
  ${scope} .custom-block-countdown.custom-countdown-card,
  ${scope} .custom-countdown-card {
    padding: 18px 14px !important;
    border-radius: 14px !important;
    margin: 12px 0 !important;
    text-align: center !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-digits {
    display: flex !important;
    justify-content: center !important;
    gap: 5px !important;
    width: 100% !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-number-card {
    min-width: 44px !important;
    flex: 1 1 0 !important;
    max-width: 68px !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-number-box {
    padding: 8px 4px !important;
    min-width: 42px !important;
    font-size: 20px !important;
    border-radius: 8px !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-number-label {
    font-size: 11px !important;
    margin-top: 4px !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-colon {
    font-size: 18px !important;
    margin: 0 -1px 12px -1px !important;
  }
  ${scope} .custom-block-countdown .custom-countdown-btn {
    width: 100% !important;
    height: 44px !important;
    font-size: 14px !important;
    margin-top: 10px !important;
  }

  /* 11. 多语言切换 LanguageBlock */
  ${scope} .custom-block-language,
  ${scope} .custom-language-card {
    margin: 6px 0 !important;
  }
  ${scope} .custom-block-language .custom-language-inner {
    justify-content: center !important;
    gap: 6px !important;
  }
  ${scope} .custom-block-language .ant-segmented {
    font-size: 12px !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  /* 12. 自由代码 HtmlBlock */
  ${scope} .custom-block-html,
  ${scope} .custom-html-card {
    width: 100% !important;
    margin: 8px 0 !important;
  }
  ${scope} .custom-block-html .custom-html-content {
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
  }
`;
