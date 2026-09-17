export type LoginTemplate = 'split' | 'center';
export type CanvasWidthMode = 'standard' | 'wide' | 'full';
export type ContainerStyle = 'transparent' | 'glass' | 'card' | 'dark-card';

export type CustomBlockType = 'hero' | 'features' | 'carousel' | 'html' | 'stats' | 'badges';
export type CustomBlockSlot = 'main' | 'header' | 'footer' | 'card_top' | 'card_bottom';

export interface CustomBlockStyle {
  bgType?: 'transparent' | 'glass' | 'white' | 'dark' | 'custom';
  customBgColor?: string;
  textColor?: 'light' | 'dark' | 'custom';
  customTextColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  boxShadow?: boolean;
  border?: boolean;
}

export interface CustomBlockItem {
  icon?: string;
  title?: string;
  desc?: string;
  url?: string;
}

export interface CustomBlock {
  id: string;
  type: CustomBlockType;
  slot: CustomBlockSlot;
  title?: string;
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroTag?: string;
    htmlCode?: string;
    items?: CustomBlockItem[];
    carouselImages?: { url: string; title?: string; desc?: string }[];
    statsItems?: { value: string; label: string }[];
  };
  style?: CustomBlockStyle;
  sortIndex?: number;
}

export interface ThemeConfig {
  brandTitle: string;
  brandSubtitle: string;
  brandLogo: string;
  brandPosterUrl: string;
  primaryColor: string;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  copyright: string;
  icp: string;
}

export interface CustomLoginConfig {
  enabled: boolean;
  template: LoginTemplate;
  canvasWidth?: CanvasWidthMode;
  containerStyle?: ContainerStyle;
  leftSpanRatio?: number;
  canvasParentId?: string;
  themeConfig: ThemeConfig;
  customBlocks: CustomBlock[];
  gridSchema?: any;
}
