import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRESET_GRID_SCHEMA,
  DEFAULT_PRESET_MOBILE_GRID_SCHEMA,
} from '../../server';
import { CustomLoginConfig } from '../types';

describe('Mobile Independent Configuration & Multi-device Distribution', () => {
  it('validates DEFAULT_PRESET_MOBILE_GRID_SCHEMA structure', () => {
    expect(DEFAULT_PRESET_MOBILE_GRID_SCHEMA).toBeDefined();
    expect(DEFAULT_PRESET_MOBILE_GRID_SCHEMA.use).toBe('LoginPageBlockGridModel');
    expect(DEFAULT_PRESET_MOBILE_GRID_SCHEMA.props.layout.rows).toHaveLength(1);

    const mainRow = DEFAULT_PRESET_MOBILE_GRID_SCHEMA.props.layout.rows[0];
    // 单列全宽居中设计
    expect(mainRow.sizes).toEqual([24]);
    expect(mainRow.cells).toHaveLength(1);
    expect(mainRow.cells[0].items).toEqual(['signin_form_block_mobile_001']);

    // 验证只有核心登录卡片，不含多列 Feature 与冗重大横幅
    const subModels = DEFAULT_PRESET_MOBILE_GRID_SCHEMA.subModels.items;
    expect(subModels).toHaveLength(1);
    expect(subModels[0].uid).toBe('signin_form_block_mobile_001');
    expect(subModels[0].use).toBe('SignInFormBlockModel');
  });

  it('correctly resolves effective gridSchema based on enableMobileCustom and target', () => {
    const config: CustomLoginConfig = {
      enabled: true,
      template: 'split',
      themeConfig: {
        brandTitle: 'Test Desktop',
        brandSubtitle: '',
        brandLogo: '',
        brandPosterUrl: '',
        primaryColor: '#1677ff',
        backgroundType: 'gradient',
        backgroundValue: '#000',
        copyright: '',
        icp: '',
      },
      customBlocks: [],
      gridSchema: DEFAULT_PRESET_GRID_SCHEMA,
      enableMobileCustom: true,
      mobileGridSchema: DEFAULT_PRESET_MOBILE_GRID_SCHEMA,
    };

    // 桌面端目标
    const desktopSchema = config.gridSchema;
    expect(desktopSchema.props.layout.rows[0].sizes).toEqual([14, 10]);

    // 移动端独立目标
    const mobileSchema = config.enableMobileCustom ? (config.mobileGridSchema || DEFAULT_PRESET_MOBILE_GRID_SCHEMA) : config.gridSchema;
    expect(mobileSchema.props.layout.rows[0].sizes).toEqual([24]);

    // 当未开启 enableMobileCustom 时，移动端目标应回退使用桌面端自适应 schema
    const adaptiveConfig: CustomLoginConfig = {
      ...config,
      enableMobileCustom: false,
    };
    const resolvedAdaptiveSchema = adaptiveConfig.enableMobileCustom
      ? (adaptiveConfig.mobileGridSchema || DEFAULT_PRESET_MOBILE_GRID_SCHEMA)
      : adaptiveConfig.gridSchema;
    expect(resolvedAdaptiveSchema).toBe(adaptiveConfig.gridSchema);
  });

  it('correctly resolves mobile theme and style overrides', () => {
    const config: CustomLoginConfig = {
      enabled: true,
      template: 'split',
      containerStyle: 'transparent',
      themeConfig: {
        brandTitle: 'NocoBase',
        brandSubtitle: 'PC Subtitle',
        brandLogo: '',
        brandPosterUrl: '',
        primaryColor: '#1677ff',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
        copyright: 'PC Copyright',
        icp: '',
      },
      customBlocks: [],
      gridSchema: DEFAULT_PRESET_GRID_SCHEMA,
      enableMobileCustom: true,
      enableMobileTheme: true,
      mobileContainerStyle: 'card',
      mobileThemeConfig: {
        backgroundType: 'image',
        backgroundValue: 'https://cdn.example.com/mobile-vertical-bg.jpg',
      },
    };

    const isMobileTarget = true;
    const effectiveThemeConfig = (isMobileTarget && config.enableMobileTheme && config.mobileThemeConfig)
      ? { ...config.themeConfig, ...config.mobileThemeConfig }
      : config.themeConfig;

    const effectiveContainerStyle = (isMobileTarget && config.enableMobileTheme && config.mobileContainerStyle)
      ? config.mobileContainerStyle
      : config.containerStyle;

    expect(effectiveThemeConfig.backgroundType).toBe('image');
    expect(effectiveThemeConfig.backgroundValue).toBe('https://cdn.example.com/mobile-vertical-bg.jpg');
    expect(effectiveThemeConfig.brandTitle).toBe('NocoBase'); // 继承自桌面端基础
    expect(effectiveContainerStyle).toBe('card');

    // 禁用移动端独立外观时，自动回退继承桌面端背景
    const inheritConfig: CustomLoginConfig = {
      ...config,
      enableMobileTheme: false,
    };
    const fallbackThemeConfig = (isMobileTarget && inheritConfig.enableMobileTheme && inheritConfig.mobileThemeConfig)
      ? { ...inheritConfig.themeConfig, ...inheritConfig.mobileThemeConfig }
      : inheritConfig.themeConfig;
    expect(fallbackThemeConfig.backgroundType).toBe('gradient');
  });
});
