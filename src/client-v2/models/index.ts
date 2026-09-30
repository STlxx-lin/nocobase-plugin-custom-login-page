export * from './CustomLoginBlockModel';
export * from './customBlockMenuItems';

// 导出 12 个独立原生区块组件、模型与专属主题预设
export * from './blocks/SignInFormBlock';
export * from './blocks/HeroBlock';
export * from './blocks/FeaturesBlock';
export * from './blocks/StatsBlock';
export * from './blocks/CarouselBlock';
export * from './blocks/HtmlBlock';
export * from './blocks/ImageBlock';
export * from './blocks/NoticeBlock';
export * from './blocks/PartnersBlock';
export * from './blocks/ContactBlock';
export * from './blocks/LanguageBlock';
export * from './blocks/CountdownBlock';

import { SignInFormBlockModel } from './blocks/SignInFormBlock';
import { CustomHeroBlockModel } from './blocks/HeroBlock';
import { CustomFeaturesBlockModel } from './blocks/FeaturesBlock';
import { CustomCarouselBlockModel } from './blocks/CarouselBlock';
import { CustomStatsBlockModel } from './blocks/StatsBlock';
import { CustomHtmlBlockModel } from './blocks/HtmlBlock';
import { CustomImageBlockModel } from './blocks/ImageBlock';
import { CustomNoticeBlockModel } from './blocks/NoticeBlock';
import { CustomPartnersBlockModel } from './blocks/PartnersBlock';
import { CustomContactBlockModel } from './blocks/ContactBlock';
import { CustomLanguageBlockModel } from './blocks/LanguageBlock';
import { CustomCountdownBlockModel } from './blocks/CountdownBlock';

export const ALL_CUSTOM_BLOCK_MODELS = [
  SignInFormBlockModel,
  CustomHeroBlockModel,
  CustomFeaturesBlockModel,
  CustomCarouselBlockModel,
  CustomStatsBlockModel,
  CustomHtmlBlockModel,
  CustomImageBlockModel,
  CustomNoticeBlockModel,
  CustomPartnersBlockModel,
  CustomContactBlockModel,
  CustomLanguageBlockModel,
  CustomCountdownBlockModel,
];
