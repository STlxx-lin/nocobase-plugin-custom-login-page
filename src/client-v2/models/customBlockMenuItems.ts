import { tExpr } from '../locale';

/**
 * 登录页专属区块菜单项配置定义
 * 统一分类组织，供 FlowEngine 在设计模式下展示「创建区块」下拉菜单
 */
export const CUSTOM_BLOCK_MENU_CHILDREN = [
  {
    key: 'SignInFormBlockModel',
    label: tExpr('Sign-in Form'),
    useModel: 'SignInFormBlockModel',
    createModelOptions: {
      use: 'SignInFormBlockModel',
    },
  },
  {
    key: 'CustomHeroBlockModel',
    label: tExpr('Hero banner'),
    useModel: 'CustomHeroBlockModel',
    createModelOptions: {
      use: 'CustomHeroBlockModel',
    },
  },
  {
    key: 'CustomFeaturesBlockModel',
    label: tExpr('Features matrix'),
    useModel: 'CustomFeaturesBlockModel',
    createModelOptions: {
      use: 'CustomFeaturesBlockModel',
    },
  },
  {
    key: 'CustomStatsBlockModel',
    label: tExpr('Stats dashboard'),
    useModel: 'CustomStatsBlockModel',
    createModelOptions: {
      use: 'CustomStatsBlockModel',
    },
  },
  {
    key: 'CustomCarouselBlockModel',
    label: tExpr('Dynamic carousel'),
    useModel: 'CustomCarouselBlockModel',
    createModelOptions: {
      use: 'CustomCarouselBlockModel',
    },
  },
  {
    key: 'CustomHtmlBlockModel',
    label: tExpr('Free Code / HTML'),
    useModel: 'CustomHtmlBlockModel',
    createModelOptions: {
      use: 'CustomHtmlBlockModel',
    },
  },
  {
    key: 'CustomImageBlockModel',
    label: tExpr('Illustration / Image'),
    useModel: 'CustomImageBlockModel',
    createModelOptions: {
      use: 'CustomImageBlockModel',
    },
  },
  {
    key: 'CustomNoticeBlockModel',
    label: tExpr('Notice bar'),
    useModel: 'CustomNoticeBlockModel',
    createModelOptions: {
      use: 'CustomNoticeBlockModel',
    },
  },
  {
    key: 'CustomPartnersBlockModel',
    label: tExpr('Partners logo wall'),
    useModel: 'CustomPartnersBlockModel',
    createModelOptions: {
      use: 'CustomPartnersBlockModel',
    },
  },
  {
    key: 'CustomContactBlockModel',
    label: tExpr('Contact & Support'),
    useModel: 'CustomContactBlockModel',
    createModelOptions: {
      use: 'CustomContactBlockModel',
    },
  },
  {
    key: 'CustomLanguageBlockModel',
    label: tExpr('Language Switcher'),
    useModel: 'CustomLanguageBlockModel',
    createModelOptions: {
      use: 'CustomLanguageBlockModel',
    },
  },
  {
    key: 'CustomCountdownBlockModel',
    label: tExpr('Event Countdown'),
    useModel: 'CustomCountdownBlockModel',
    createModelOptions: {
      use: 'CustomCountdownBlockModel',
    },
  },
];
