import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  Drawer,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Switch,
  InputNumber,
  Space,
  Card,
  Divider,
  message,
  Typography,
  Alert,
  ColorPicker,
  Upload,
  Tag,
  Row,
  Col,
  Dropdown,
  QRCode,
  Image,
} from 'antd';
import { IconPicker, Icon } from '@nocobase/client-v2';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  CloudServerOutlined,
  BulbOutlined,
  TeamOutlined,
  GlobalOutlined,
  StarOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  CompassOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  AuditOutlined,
  SecurityScanOutlined,
  LinkOutlined,
  UploadOutlined,
  PictureOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  CopyOutlined,
  QrcodeOutlined,
  WechatOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// 高度集成的图片配置组件（支持 URL 粘贴、本地图片上传即时转码预览、图片完整自适应展示）
export const ImageInputWithUpload: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const beforeUpload = (file: File) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange?.(result);
        message.success('本地图片已成功加载！');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div style={{ width: '100%' }}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || '粘贴图片 URL 或点击右侧上传'}
          allowClear
        />
        <Upload
          beforeUpload={beforeUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>上传本地</Button>
        </Upload>
      </Space.Compact>

      {value && (() => {
        let displayVal = value.trim();
        if (displayVal.includes('api.qrserver.com')) {
          try {
            const urlObj = new URL(displayVal);
            const dataParam = urlObj.searchParams.get('data');
            if (dataParam) {
              displayVal = decodeURIComponent(dataParam);
            }
          } catch (e) {}
        }
        const isImage =
          displayVal.startsWith('data:image/') ||
          /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(displayVal) ||
          displayVal.includes('/api/attachments/') ||
          displayVal.includes('/storage/uploads/');

        return (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 64,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {isImage ? (
                <img
                  src={displayVal}
                  alt="预览"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 120,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ background: '#ffffff', padding: 6, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <QRCode value={displayVal} size={96} bordered={false} />
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>纯前端矢量实时渲染预览</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => onChange?.('')}
                style={{ padding: 0, fontSize: 12 }}
              >
                清空内容
              </Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// 安全解析当前应用与自定义图标库选择器（优先检测并使用 @nocobase/plugin-custom-icons 增强图标库）
export const resolveCustomOrOfficialIconPicker = (): {
  Component: any;
  isCustomIcons: boolean;
  apiClient?: any;
} => {
  let app: any = null;
  let flowEngine: any = null;

  // 1. 尝试从全局应用与当前编辑模型实例获取
  if (typeof window !== 'undefined') {
    const w = window as any;
    app = w.__nocobase_current_app__ || w.__nocobase_v2_app__ || w.__nocobase_app__ || w.nocobase?.app;
    flowEngine =
      w.__nocobase_v2_flow_engine__ ||
      w.__current_editing_model__?.flowEngine ||
      w.__current_editing_model__?.context?.flowEngine;
    if (!app && flowEngine) {
      app = flowEngine.app || flowEngine.context?.app;
    }
  }

  // 2. 探测是否安装并启用了自定义图标库插件 (@nocobase/plugin-custom-icons 或 custom-icons)
  const customIconsPlugin =
    app?.pm?.get?.('@nocobase/plugin-custom-icons') ||
    app?.pm?.get?.('custom-icons') ||
    (typeof window !== 'undefined' ? (window as any).nocobase?.plugins?.['custom-icons'] : null);

  // 3. 优先级 1: plugin-custom-icons 动态注册到主应用 SchemaComponent 的 EnhancedIconPicker
  const appIconPicker = app?.getComponent?.('IconPicker') || app?.components?.['IconPicker'];

  // 4. 优先级 2: flowEngine.flowSettings 中由 plugin-custom-icons 覆盖注册的 IconPicker
  const flowSettingsPicker = flowEngine?.flowSettings?.getComponent?.('IconPicker');

  // 5. 优先级 3: 尝试从全局依赖动态探测 EnhancedIconPicker
  let devEnhancedPicker: any = null;
  if (typeof window !== 'undefined') {
    const w = window as any;
    devEnhancedPicker =
      w.__nocobase_app_dev_deps__?.['@nocobase/plugin-custom-icons']?.EnhancedIconPicker ||
      w.requirejs?.s?.contexts?._?.defined?.['@nocobase/plugin-custom-icons/client-v2']?.EnhancedIconPicker ||
      w.requirejs?.s?.contexts?._?.defined?.['@nocobase/plugin-custom-icons']?.EnhancedIconPicker;
  }

  // 6. 官方默认原生 IconPicker (从 client-v2 模块获取)
  const c2 = typeof window !== 'undefined' ? (window as any).__nocobase_app_dev_deps__?.['@nocobase/client-v2'] : null;
  const officialPicker = c2?.IconPicker || IconPicker;

  // 判定是否真正加载了自定义图标库（包含草莓图标/自定义SVG/第三方图标市场能力）
  const isCustomIcons = Boolean(
    customIconsPlugin ||
    devEnhancedPicker ||
    (appIconPicker && appIconPicker !== officialPicker) ||
    (flowSettingsPicker && flowSettingsPicker !== officialPicker)
  );

  // 优先选用自定义图标库组件，平滑降级到官方原生选择器
  const Component =
    devEnhancedPicker ||
    appIconPicker ||
    flowSettingsPicker ||
    officialPicker;

  return {
    Component,
    isCustomIcons,
    apiClient: app?.apiClient || (flowEngine as any)?.apiClient,
  };
};

// 优先使用「自定义图标 (plugin-custom-icons)」插件的增强选择器，安全回退到官方原生 IconPicker
export const CustomOrOfficialIconPicker: React.FC<{
  value?: string;
  onChange?: (val: string | null) => void;
  style?: React.CSSProperties;
}> = (props) => {
  const { Component: BaseIconPicker, isCustomIcons, apiClient } = resolveCustomOrOfficialIconPicker();

  if (BaseIconPicker) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%', ...props.style }}>
        <BaseIconPicker
          value={props.value}
          onChange={props.onChange}
          apiClient={apiClient}
        />
        {props.value && (
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              color: '#8c8c8c',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={props.value}
          >
            {props.value}
          </span>
        )}
        {isCustomIcons && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              lineHeight: '14px',
              flexShrink: 0,
            }}
            title="已优先启用「自定义图标库」增强选择器"
          >
            自定义图标库
          </span>
        )}
      </div>
    );
  }

  return (
    <Input
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      placeholder="输入图标名，如 RocketOutlined"
      allowClear
    />
  );
};

export const OfficialIconPicker = CustomOrOfficialIconPicker;

// 客服联系渠道专属图标选择器：集成 OfficialIconPicker（支持官方全量库与自定义图标插件）+ 常用联系图标快捷点击胶囊
export const ContactChannelIconPicker: React.FC<{
  value?: string;
  onChange?: (val: string | null) => void;
}> = ({ value, onChange }) => {
  const quickIcons = [
    { icon: 'PhoneOutlined', label: '电话' },
    { icon: 'MailOutlined', label: '邮箱' },
    { icon: 'WechatOutlined', label: '微信' },
    { icon: 'CustomerServiceOutlined', label: '客服' },
    { icon: 'ClockCircleOutlined', label: '时段' },
    { icon: 'LinkOutlined', label: '链接' },
    { icon: 'EnvironmentOutlined', label: '地址' },
    { icon: 'DingdingOutlined', label: '钉钉' },
    { icon: 'MessageOutlined', label: '消息' },
  ];

  return (
    <div>
      <OfficialIconPicker value={value} onChange={onChange} />
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: '20px' }}>常用快捷:</span>
        {quickIcons.map((q) => {
          const isSelected = value === q.icon;
          return (
            <Tag
              key={q.icon}
              color={isSelected ? 'blue' : undefined}
              style={{
                cursor: 'pointer',
                fontSize: 11,
                margin: 0,
                padding: '0 6px',
                borderRadius: 4,
                lineHeight: '18px',
                fontWeight: isSelected ? 600 : 400,
                background: isSelected ? undefined : '#f1f5f9',
                border: isSelected ? undefined : '1px solid #e2e8f0',
                color: isSelected ? undefined : '#475569',
              }}
              onClick={() => onChange?.(q.icon)}
            >
              {q.label}
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

// 客服支持与二维码专属可视化主题风格选择器（提供真实微缩渐变背景、边框、光晕与选中徽标）
export const CONTACT_THEMES_CONFIG = [
  {
    key: 'glass',
    name: '晶透毛玻璃',
    desc: '通透高光磨砂，与壁纸完美融合',
    bg: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: '#0f172a',
    badge: '默认推荐',
  },
  {
    key: 'cyber',
    name: '深空蓝夜',
    desc: '科技深蓝微光渐变，数字企业风范',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    border: '1px solid #3b82f6',
    color: '#ffffff',
    badge: '科技深邃',
  },
  {
    key: 'aurora',
    name: '企微极光',
    desc: '企业微信官方墨绿商务质感',
    bg: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
    border: '1px solid #10b981',
    color: '#ffffff',
    badge: '企微专属',
  },
  {
    key: 'obsidian',
    name: '曜石纯黑',
    desc: '黑曜石科技暗夜磨砂，沉稳高级',
    bg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    border: '1px solid #3f3f46',
    color: '#fafafa',
    badge: '极客暗黑',
  },
  {
    key: 'light',
    name: '纯白典雅',
    desc: '纯白高光浅阴影，适配亮色壁纸',
    bg: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#0f172a',
    badge: '浅色典雅',
  },
  {
    key: 'transparent',
    name: '通透无界',
    desc: '完全无框通透，图标文字自然悬浮',
    bg: 'transparent',
    border: '1px dashed #94a3b8',
    color: '#475569',
    badge: '极简无框',
  },
];

export const ContactThemeVisualCards: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = ({ value = 'glass', onChange }) => {
  return (
    <Row gutter={[10, 10]}>
      {CONTACT_THEMES_CONFIG.map((t) => {
        const selected = value === t.key;
        return (
          <Col span={12} key={t.key}>
            <div
              onClick={() => onChange?.(t.key)}
              style={{
                position: 'relative',
                padding: '10px 12px',
                borderRadius: 10,
                border: selected ? '2px solid #1677ff' : '1px solid #e2e8f0',
                background: selected ? '#f0f7ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                overflow: 'hidden',
                boxShadow: selected ? '0 4px 12px rgba(22, 119, 255, 0.15)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: t.bg,
                  border: t.border,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                }}
              >
                <CustomerServiceOutlined style={{ color: t.color, fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    {t.name}
                  </span>
                  <Tag
                    color={selected ? 'blue' : 'default'}
                    style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}
                  >
                    {t.badge}
                  </Tag>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: 2,
                  }}
                  title={t.desc}
                >
                  {t.desc}
                </div>
              </div>
              {selected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 20,
                    height: 20,
                    background: '#1677ff',
                    borderBottomLeftRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 10,
                  }}
                >
                  <CheckOutlined />
                </div>
              )}
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

// 专业双模颜色选择器（直观色板/吸管/预设/透明度 + 文本代码实时双向绑定）
export const ColorSelectInput: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const systemPresets = [
    {
      label: '系统推荐色',
      colors: [
        '#1677ff',
        '#52c41a',
        '#faad14',
        '#f5222d',
        '#722ed1',
        '#13c2c2',
        '#eb2f96',
        '#ffffff',
        '#000000',
        '#f3f4f6',
        '#1f2937',
        'rgba(255, 255, 255, 0.96)',
        'rgba(255, 255, 255, 0.12)',
        'rgba(0, 0, 0, 0.65)',
      ],
    },
  ];

  return (
    <Space.Compact style={{ width: '100%' }}>
      <ColorPicker
        value={value || undefined}
        allowClear
        showText
        presets={systemPresets}
        onChange={(color: any) => {
          if (!color) {
            onChange?.('');
            return;
          }
          const alpha = typeof color?.toAlpha === 'function' ? color.toAlpha() : (color?.cleared ? 0 : 1);
          onChange?.(alpha < 1 ? color.toRgbString() : color.toHexString());
        }}
      />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || '例如：#1677ff 或 rgba(...) '}
        style={{ flex: 1 }}
        allowClear
      />
    </Space.Compact>
  );
};

// 🎴 可视化卡片主题色卡选择器（带真实色块预览与选中徽标）
export const ThemeVisualRadioCards: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = ({ value = 'glass', onChange }) => {
  const themes = [
    {
      key: 'glass',
      name: '晶透毛玻璃',
      tag: '推荐',
      desc: '浅透磨砂质感，融入各类壁纸',
      previewBg: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,249,255,0.65) 100%)',
      previewBorder: '1px solid rgba(255,255,255,0.9)',
    },
    {
      key: 'light',
      name: '纯白典雅',
      tag: '经典',
      desc: '经典白底微投影，纯净商务',
      previewBg: '#ffffff',
      previewBorder: '1px solid #cbd5e1',
    },
    {
      key: 'obsidian',
      name: '曜石纯黑',
      tag: '极客',
      desc: '黑曜暗夜微光，极客科技风',
      previewBg: '#18181b',
      previewBorder: '1px solid #3f3f46',
      dark: true,
    },
    {
      key: 'cyber',
      name: '深空蓝夜',
      tag: '沉稳',
      desc: '科技深蓝紫渐变，沉稳大气',
      previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      previewBorder: '1px solid #3b82f6',
      dark: true,
    },
    {
      key: 'transparent',
      name: '通透无界',
      tag: '极简',
      desc: '无外框底色，轻灵悬浮于壁纸',
      previewBg: 'transparent',
      previewBorder: '1px dashed #94a3b8',
    },
  ];

  return (
    <Row gutter={[10, 10]} style={{ width: '100%' }}>
      {themes.map((item) => {
        const isSelected = value === item.key;
        return (
          <Col span={item.key === 'transparent' ? 24 : 12} key={item.key}>
            <div
              onClick={() => onChange?.(item.key)}
              style={{
                position: 'relative',
                padding: '9px 12px',
                borderRadius: 8,
                background: isSelected ? '#f0f7ff' : '#ffffff',
                border: isSelected ? '2px solid #1677ff' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: isSelected ? '0 2px 8px rgba(22,119,255,0.12)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              {/* 微型色块预览 */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: item.previewBg,
                  border: item.previewBorder,
                  flexShrink: 0,
                  boxShadow: item.dark ? '0 2px 6px rgba(0,0,0,0.25)' : '0 2px 4px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.key === 'transparent' && (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>透</span>
                )}
              </div>

              {/* 文本与标签 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    {item.name}
                  </span>
                  <Tag
                    bordered={false}
                    color={isSelected ? 'blue' : 'default'}
                    style={{ fontSize: 10, margin: 0, padding: '0 4px', lineHeight: '16px' }}
                  >
                    {item.tag}
                  </Tag>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: 2,
                  }}
                  title={item.desc}
                >
                  {item.desc}
                </div>
              </div>

              {/* 选中圆标 */}
              {isSelected && (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#1677ff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  <CheckOutlined />
                </div>
              )}
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

// 🎨 行内文本样式格式化器（油漆桶实心色块 + TT字号选择 + 常驻重置清除，100% 契合参考图2规范）
export const InlineTextStyleFormatter: React.FC<{
  color?: string;
  onColorChange?: (color: string) => void;
  fontSize?: number | string;
  onFontSizeChange?: (size: number | string | undefined) => void;
  fontSizeOptions?: Array<{ label: string | React.ReactNode; value: number | string }>;
  defaultSizeLabel?: string;
  height?: number | string;
  style?: React.CSSProperties;
}> = ({
  color,
  onColorChange,
  fontSize,
  onFontSizeChange,
  fontSizeOptions,
  defaultSizeLabel = '默认',
  height,
  style,
}) => {
  const systemPresets = [
    {
      label: '推荐色彩',
      colors: [
        '#1677ff',
        '#52c41a',
        '#faad14',
        '#f5222d',
        '#722ed1',
        '#13c2c2',
        '#eb2f96',
        '#ffffff',
        '#000000',
        '#1f2937',
        '#64748b',
        'rgba(255, 255, 255, 0.85)',
        'rgba(0, 0, 0, 0.65)',
      ],
    },
  ];

  const defaultOptions = [
    { label: '默认', value: '' },
    { label: '14px', value: 14 },
    { label: '16px', value: 16 },
    { label: '18px', value: 18 },
    { label: '20px', value: 20 },
    { label: '24px (标准)', value: 24 },
    { label: '28px (放大)', value: 28 },
    { label: '32px (特大)', value: 32 },
  ];

  const rawOptions = fontSizeOptions || defaultOptions;

  // 获取当前展示的字号文案（纯文本形式展示，不带箭头）
  let currentLabel = defaultSizeLabel;
  if (fontSize !== undefined && fontSize !== null && fontSize !== '') {
    const matched = rawOptions.find((o) => String(o.value) === String(fontSize));
    if (matched) {
      currentLabel = typeof matched.label === 'string' ? matched.label.split(' ')[0] : String(fontSize) + 'px';
    } else {
      currentLabel = `${fontSize}px`;
    }
  }

  // 构造 Dropdown 菜单项
  const menuItems = rawOptions.map((opt) => ({
    key: String(opt.value),
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 100 }}>
        <span>{opt.label}</span>
        {String(fontSize || '') === String(opt.value) && (
          <span style={{ color: '#1677ff', marginLeft: 8, fontSize: 12 }}>✓</span>
        )}
      </div>
    ),
  }));

  const handleMenuClick = ({ key }: { key: string }) => {
    onFontSizeChange?.(key === '' ? '' : isNaN(Number(key)) ? key : Number(key));
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        background: '#ffffff',
        border: '1px solid #d9d9d9',
        borderLeft: 'none',
        borderRadius: '0 6px 6px 0',
        height: height || 'auto',
        minHeight: 28,
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* 1. 调色单元格 [ 🪣 ■ ] (完全契合参考规范：油漆桶与色块，自适应撑满高度) */}
      <ColorPicker
        value={color || undefined}
        allowClear
        presets={systemPresets}
        style={{ height: '100%', display: 'inline-flex', alignItems: 'stretch' }}
        onChange={(c: any) => {
          if (!c) {
            onColorChange?.('');
            return;
          }
          const alpha = typeof c?.toAlpha === 'function' ? c.toAlpha() : (c?.cleared ? 0 : 1);
          onColorChange?.(alpha < 1 ? c.toRgbString() : c.toHexString());
        }}
      >
        <div
          title={color ? `当前颜色: ${color} (点击修改)` : '设置文字颜色 (默认随主题自适应，无色)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0 8px',
            height: '100%',
            alignSelf: 'stretch',
            cursor: 'pointer',
            borderRight: '1px solid #d9d9d9',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* 油漆桶 SVG 图标 (始终保持深灰，清晰可见，不被纯白/浅色选色影响隐身) */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#595959', flexShrink: 0 }}
          >
            <path d="M19 11L11 3 2.5 11.5a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" />
            <path d="M5 2l5 5" />
            <path d="M2 21h18" strokeWidth="2.4" />
            <circle cx="18" cy="16.5" r="1.5" fill={color && color !== '#ffffff' ? color : 'none'} stroke={color && color !== '#ffffff' ? 'none' : 'currentColor'} strokeWidth={1.5} />
          </svg>
          {/* 实心小色块 (有颜色时展示色彩，无色时显示标准白底红斜杠无色块) */}
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 2,
              background: color
                ? color
                : 'linear-gradient(135deg, #ffffff 0%, #ffffff 38%, #ff4d4f 38%, #ff4d4f 62%, #ffffff 62%, #ffffff 100%)',
              border: color ? '1px solid rgba(0,0,0,0.2)' : '1px solid #d9d9d9',
              boxShadow: color ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          />
        </div>
      </ColorPicker>

      {/* 2. TT 字体大小选择单元格 [ TT 默认 ] (纯文本形态，自适应撑满高度) */}
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        placement="bottomLeft"
      >
        <div
          title={`当前字号: ${currentLabel} (点击选择)`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            height: '100%',
            alignSelf: 'stretch',
            cursor: 'pointer',
            borderRight: '1px solid #d9d9d9',
            gap: 4,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* 衬线体双 T (大 T 小 T) */}
          <span
            style={{
              fontWeight: 800,
              fontFamily: 'Georgia, serif',
              fontSize: 13,
              color: '#262626',
              lineHeight: 1,
            }}
          >
            T<span style={{ fontSize: 10.5 }}>T</span>
          </span>
          {/* 字号文本 (默认显示灰色'默认') */}
          <span
            style={{
              fontSize: 12,
              color: currentLabel === '默认' ? '#8c8c8c' : '#262626',
              lineHeight: 1,
            }}
          >
            {currentLabel}
          </span>
        </div>
      </Dropdown>

      {/* 3. 常驻清除重置单元格 [ × ] (常驻展示独立一格，自适应撑满高度) */}
      <div
        title="清除并恢复默认颜色与字号"
        onClick={(e) => {
          e.stopPropagation();
          onColorChange?.('');
          onFontSizeChange?.('');
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: '100%',
          alignSelf: 'stretch',
          cursor: 'pointer',
          color: '#595959',
          fontSize: 14,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f5f5f5';
          e.currentTarget.style.color = '#ff4d4f';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#595959';
        }}
      >
        ×
      </div>
    </div>
  );
};

export interface BlockContentEditorDrawerProps {
  open: boolean;
  onClose: () => void;
  model: any;
  onSave?: () => void;
}

export const BlockContentEditorDrawer: React.FC<BlockContentEditorDrawerProps> = ({
  open,
  onClose,
  model,
  onSave,
}) => {
  const [form] = Form.useForm();
  const blockUse = model?.use || model?.schema?.use || '';

  // 获得区块的友好中文名称
  const getBlockTitle = () => {
    switch (blockUse) {
      case 'CustomHeroBlockModel':
        return '编辑品牌宣传标语 (Hero)';
      case 'CustomFeaturesBlockModel':
        return '编辑企业特性矩阵 (Features)';
      case 'CustomStatsBlockModel':
        return '编辑核心数据看板 (Stats)';
      case 'SignInFormBlockModel':
        return '编辑系统登录表单 (Sign-in Form)';
      case 'CustomCarouselBlockModel':
        return '编辑动态全景轮播 (Carousel)';
      case 'CustomHtmlBlockModel':
        return '编辑自定义 HTML 代码 (Custom HTML)';
      case 'CustomImageBlockModel':
        return '编辑宣传插画/图片 (Image)';
      case 'CustomNoticeBlockModel':
        return '编辑平台公告通知条 (Notice)';
      case 'CustomPartnersBlockModel':
        return '编辑合作伙伴 Logo 墙 (Partners)';
      case 'CustomContactBlockModel':
        return '编辑客服支持与二维码 (Contact & Support)';
      case 'CustomLanguageBlockModel':
        return '编辑多语言环境切换 (Language Switcher)';
      case 'CustomCountdownBlockModel':
        return '编辑活动倒计时看板 (Event Countdown)';
      default:
        return '编辑区块内容与属性';
    }
  };

  useEffect(() => {
    if (open && model) {
      const currentProps = { ...(model.props || {}) };
      if (blockUse === 'CustomContactBlockModel') {
        if (!Array.isArray(currentProps.contactItems) || currentProps.contactItems.length === 0) {
          currentProps.contactItems = [
            currentProps.hotline
              ? { icon: 'PhoneOutlined', label: '服务热线', value: currentProps.hotline, action: 'tel', color: '#69b1ff' }
              : { icon: 'PhoneOutlined', label: '服务热线', value: '400-888-9999', action: 'tel', color: '#69b1ff' },
            currentProps.email
              ? { icon: 'MailOutlined', label: '支持邮箱', value: currentProps.email, action: 'mailto', color: '#95de64' }
              : { icon: 'MailOutlined', label: '支持邮箱', value: 'support@nocobase.com', action: 'mailto', color: '#95de64' },
            currentProps.workTime
              ? { icon: 'ClockCircleOutlined', label: '服务时间', value: currentProps.workTime, action: 'none', color: '#ffd666' }
              : { icon: 'ClockCircleOutlined', label: '服务时间', value: '周一至周日 9:00 - 21:00', action: 'none', color: '#ffd666' },
          ];
        }
        if (currentProps.showQrCode === undefined) {
          currentProps.showQrCode = true;
        }
        if (!currentProps.themeKey) {
          currentProps.themeKey = 'glass';
        }
        if (currentProps.qrBadge === undefined) {
          currentProps.qrBadge = '企业微信';
        }
        if (!currentProps.titleColor && currentProps.textColor) {
          currentProps.titleColor = currentProps.textColor;
        }
      }
      if (blockUse === 'CustomPartnersBlockModel') {
        if (!currentProps.displayMode) {
          currentProps.displayMode = 'grid';
        }
        if (currentProps.rows === undefined) {
          currentProps.rows = currentProps.displayMode === 'marquee' ? 1 : 0;
        }
        if (currentProps.reverseDirection === undefined) {
          currentProps.reverseDirection = true;
        }
        if (currentProps.rowGap === undefined) {
          currentProps.rowGap = 14;
        }
        if (!currentProps.filterMode) {
          currentProps.filterMode = currentProps.grayscale === false ? 'original' : 'grayscale';
        }
        if (!currentProps.themeKey) {
          currentProps.themeKey = currentProps.showBorder ? 'glass' : 'transparent';
        }
        if (!currentProps.marqueeSpeed) {
          currentProps.marqueeSpeed = 'medium';
        }
        if (!currentProps.columns) {
          currentProps.columns = 4;
        }
      }
      if (blockUse === 'SignInFormBlockModel') {
        if (!currentProps.widthMode) {
          currentProps.widthMode = 'fill';
        }
        if (!currentProps.maxWidth) {
          currentProps.maxWidth = 420;
        }
        if (!currentProps.align) {
          currentProps.align = 'center';
        }
        if (currentProps.fillHeight === undefined) {
          currentProps.fillHeight = false;
        }
        if (!currentProps.themeKey) {
          currentProps.themeKey = 'glass';
        }
        if (!currentProps.paddingSize) {
          currentProps.paddingSize = 'normal';
        }
        if (currentProps.borderRadius === undefined) {
          currentProps.borderRadius = 20;
        }
        if (currentProps.showLogo === undefined) {
          currentProps.showLogo = true;
        }
        if (!currentProps.logoPosition) {
          currentProps.logoPosition = 'left';
        }
        if (!currentProps.logoHeight) {
          currentProps.logoHeight = 38;
        }
        if (currentProps.titleFontSize === undefined) {
          currentProps.titleFontSize = '';
        }
        if (currentProps.subtitleFontSize === undefined) {
          currentProps.subtitleFontSize = '';
        }
      }
      if (blockUse === 'CustomNoticeBlockModel') {
        if (!currentProps.themeKey) {
          if (currentProps.type === 'warning') currentProps.themeKey = 'amber';
          else if (currentProps.type === 'success') currentProps.themeKey = 'emerald';
          else if (currentProps.type === 'error') currentProps.themeKey = 'amber';
          else currentProps.themeKey = 'glass';
        }
        if (currentProps.showBadge === undefined) {
          currentProps.showBadge = true;
        }
        if (!currentProps.badgeText) {
          currentProps.badgeText = currentProps.themeKey === 'amber' ? '⚡ 计划维护' : currentProps.themeKey === 'emerald' ? '🛡️ 安全通报' : currentProps.themeKey === 'cyber' ? '🔥 重磅发布' : '最新公告';
        }
        if (currentProps.showIcon === undefined) {
          currentProps.showIcon = true;
        }
        if (currentProps.closable === undefined) {
          currentProps.closable = true;
        }
        if (currentProps.banner === undefined) {
          currentProps.banner = false;
        }
        if (currentProps.marquee === undefined) {
          currentProps.marquee = false;
        }
        if (!currentProps.marqueeSpeed) {
          currentProps.marqueeSpeed = 'normal';
        }
        if (!currentProps.ctaType) {
          currentProps.ctaType = currentProps.linkUrl ? 'link' : 'none';
        }
        if (!currentProps.linkText) {
          currentProps.linkText = '查看详情 →';
        }
        if (currentProps.borderRadius === undefined) {
          currentProps.borderRadius = 10;
        }
      }
      form.setFieldsValue(currentProps);
    }
  }, [open, model]);

  const handleFinish = (values: any) => {
    if (!model) return;
    try {
      if (blockUse === 'CustomContactBlockModel' && Array.isArray(values.contactItems)) {
        const phoneItem = values.contactItems.find((it: any) => it.icon === 'PhoneOutlined' || it.label?.includes('热线') || it.label?.includes('电话'));
        const mailItem = values.contactItems.find((it: any) => it.icon === 'MailOutlined' || it.label?.includes('邮') || it.action === 'mailto');
        const timeItem = values.contactItems.find((it: any) => it.icon === 'ClockCircleOutlined' || it.label?.includes('时间') || it.label?.includes('时段'));
        if (phoneItem?.value) values.hotline = phoneItem.value;
        if (mailItem?.value) values.email = mailItem.value;
        if (timeItem?.value) values.workTime = timeItem.value;
      }
      if (blockUse === 'CustomPartnersBlockModel') {
        values.grayscale = values.filterMode === 'grayscale';
        values.showBorder = values.themeKey !== 'transparent';
      }
      if (blockUse === 'CustomNoticeBlockModel') {
        if (values.themeKey === 'amber') values.type = 'warning';
        else if (values.themeKey === 'emerald') values.type = 'success';
        else if (values.themeKey === 'cyber') values.type = 'info';
        else if (values.themeKey === 'light') values.type = 'info';
        else values.type = 'info';
      }
      model.props = { ...(model.props || {}), ...values };
      if (typeof model.setProps === 'function') {
        model.setProps(values);
      }
      message.success('区块属性已更新，所见即所得实时生效！');
      onSave?.();
      onClose();
    } catch (e: any) {
      message.error('保存失败: ' + e.message);
    }
  };

  // 渲染具体区块的属性表单项
  const renderFieldsByBlockType = () => {
    switch (blockUse) {
      case 'CustomHeroBlockModel':
        return (
          <>
            <Card
              title="标语与胶囊徽标"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="showBadge" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showBadge !== curr.showBadge}
              >
                {({ getFieldValue }) => {
                  const showBadge = getFieldValue('showBadge') ?? true;
                  if (!showBadge) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        胶囊徽章已关闭，如需展示可在右上角开启
                      </div>
                    );
                  }
                  return (
                    <Row gutter={12}>
                      <Col span={14}>
                        <Form.Item label="徽章文案" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                            <Form.Item name="badge" noStyle initialValue="全新数字化协同架构">
                              <Input
                                placeholder="例如：全新数字化协同架构"
                                style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, curr) => prev.badgeColor !== curr.badgeColor}
                            >
                              {({ getFieldValue: gfv, setFieldsValue }) => (
                                <InlineTextStyleFormatter
                                  color={gfv('badgeColor')}
                                  onColorChange={(c) => setFieldsValue({ badgeColor: c })}
                                  defaultSizeLabel="默认"
                                />
                              )}
                            </Form.Item>
                            <Form.Item name="badgeColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                          </div>
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name="badgeBg" label="徽章背景色" initialValue="rgba(22, 119, 255, 0.28)" style={{ marginBottom: 0 }}>
                          <ColorSelectInput placeholder="rgba(22, 119, 255, 0.28)" />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>
            </Card>

            <Card title="主标题与说明" size="small" style={{ marginBottom: 16 }}>
              <Form.Item label="主标题内容" required style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="title" noStyle required initialValue="驱动企业数字化新未来">
                    <Input
                      placeholder="请输入主标题"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.textColor !== curr.textColor || prev.titleSize !== curr.titleSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('textColor')}
                        onColorChange={(c) => setFieldsValue({ textColor: c })}
                        fontSize={getFieldValue('titleSize')}
                        onFontSizeChange={(s) => setFieldsValue({ titleSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          {
                            label: (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontWeight: 800, fontFamily: 'serif', fontSize: 13 }}>T<span style={{ fontSize: 10 }}>T</span></span>
                                <span style={{ color: '#8c8c8c' }}>默认</span>
                              </span>
                            ),
                            value: '',
                          },
                          { label: '28px', value: 28 },
                          { label: '32px', value: 32 },
                          { label: '36px', value: 36 },
                          { label: '42px (标准)', value: 42 },
                          { label: '48px (醒目)', value: 48 },
                          { label: '56px (特大)', value: 56 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="textColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="titleSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item label="副标题说明文案" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="subtitle" noStyle initialValue="基于灵活可扩展的现代无代码与插件化体系，提供端到端企业级应用解决方案。">
                    <Input
                      placeholder="请输入副标题说明文案"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.subtitleColor !== curr.subtitleColor || prev.subtitleSize !== curr.subtitleSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('subtitleColor')}
                        onColorChange={(c) => setFieldsValue({ subtitleColor: c })}
                        fontSize={getFieldValue('subtitleSize')}
                        onFontSizeChange={(s) => setFieldsValue({ subtitleSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          {
                            label: (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontWeight: 800, fontFamily: 'serif', fontSize: 13 }}>T<span style={{ fontSize: 10 }}>T</span></span>
                                <span style={{ color: '#8c8c8c' }}>默认</span>
                              </span>
                            ),
                            value: '',
                          },
                          { label: '14px', value: 14 },
                          { label: '15px', value: 15 },
                          { label: '16px (标准)', value: 16 },
                          { label: '18px (清晰)', value: 18 },
                          { label: '20px (醒目)', value: 20 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="subtitleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="subtitleSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item name="align" label="内容对齐方式" initialValue="left" style={{ marginBottom: 0 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value="left" style={{ flex: 1, textAlign: 'center' }}>
                    <AlignLeftOutlined style={{ marginRight: 6 }} />左对齐
                  </Radio.Button>
                  <Radio.Button value="center" style={{ flex: 1, textAlign: 'center' }}>
                    <AlignCenterOutlined style={{ marginRight: 6 }} />居中对齐
                  </Radio.Button>
                  <Radio.Button value="right" style={{ flex: 1, textAlign: 'center' }}>
                    <AlignRightOutlined style={{ marginRight: 6 }} />右对齐
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Card>

            <Card
              title="行动倡议按钮 (CTA)"
              size="small"
              extra={
                <Form.Item name="showButton" noStyle valuePropName="checked" initialValue={false}>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showButton !== curr.showButton}
              >
                {({ getFieldValue }) => {
                  const showBtn = getFieldValue('showButton');
                  if (!showBtn) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        行动按钮已关闭，如需引导用户访问外部主页或文档可在右上角开启
                      </div>
                    );
                  }
                  return (
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="按钮文字" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                            <Form.Item name="buttonText" noStyle initialValue="了解平台特性">
                              <Input
                                placeholder="例如：了解平台特性"
                                style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, curr) => prev.buttonTextColor !== curr.buttonTextColor}
                            >
                              {({ getFieldValue: gfv, setFieldsValue }) => (
                                <InlineTextStyleFormatter
                                  color={gfv('buttonTextColor')}
                                  onColorChange={(c) => setFieldsValue({ buttonTextColor: c })}
                                  defaultSizeLabel="默认"
                                />
                              )}
                            </Form.Item>
                            <Form.Item name="buttonTextColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                          </div>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="buttonUrl" label="跳转链接 URL" initialValue="#" style={{ marginBottom: 0 }}>
                          <Input
                            prefix={<LinkOutlined style={{ color: '#94a3b8' }} />}
                            placeholder="https://..."
                            style={{ height: 32 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>
            </Card>
          </>
        );

      case 'CustomFeaturesBlockModel':
        return (
          <>
            <Card title="特性矩阵整体布局" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="columns" label="单行展示列数" initialValue={3} style={{ marginBottom: 14 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value={2} style={{ flex: 1, textAlign: 'center' }}>2 列并排</Radio.Button>
                  <Radio.Button value={3} style={{ flex: 1, textAlign: 'center' }}>3 列并排 (推荐)</Radio.Button>
                  <Radio.Button value={4} style={{ flex: 1, textAlign: 'center' }}>4 列并排</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="cardBg" label="卡片背景颜色/透明度" initialValue="rgba(255, 255, 255, 0.12)" style={{ marginBottom: 0 }}>
                    <ColorSelectInput placeholder="rgba(255, 255, 255, 0.12)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="textColor" label="文字基础颜色" initialValue="#ffffff" style={{ marginBottom: 0 }}>
                    <ColorSelectInput placeholder="#ffffff 或 #1f2937" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="特性卡片列表 (支持自由增删)" size="small">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`特性 #${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              删除
                            </Button>
                          ) : null
                        }
                        style={{ marginBottom: 12, backgroundColor: '#fcfcfc' }}
                      >
                        <Row gutter={12} style={{ marginBottom: 12 }}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'icon']}
                              label="图标选择"
                              initialValue="RocketOutlined"
                              style={{ marginBottom: 0 }}
                            >
                              <OfficialIconPicker />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'color']}
                              label="图标主色调"
                              initialValue="#69b1ff"
                              style={{ marginBottom: 0 }}
                            >
                              <ColorSelectInput placeholder="#69b1ff" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="特性标题"
                          required
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder="例如：敏捷极速构建" style={{ height: 32 }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'desc']}
                          label="特性描述"
                          style={{ marginBottom: 0 }}
                        >
                          <Input.TextArea rows={2} placeholder="请输入该特性的详细描述" />
                        </Form.Item>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          icon: 'RocketOutlined',
                          title: '全新业务特性',
                          desc: '基于插件化灵活扩展，实现多场景赋能。',
                          color: '#69b1ff',
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      添加新特性卡片
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'CustomStatsBlockModel':
        return (
          <>
            <Card title="核心数据指标整体设置" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="cardBg" label="卡片背景颜色" initialValue="rgba(255, 255, 255, 0.12)" style={{ marginBottom: 0 }}>
                <ColorSelectInput placeholder="例如：rgba(255, 255, 255, 0.12)" />
              </Form.Item>
            </Card>

            <Card title="数据指标项 (支持自由增删)" size="small">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`指标 #${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              删除
                            </Button>
                          ) : null
                        }
                        style={{ marginBottom: 12, backgroundColor: '#fcfcfc' }}
                      >
                        <Space style={{ width: '100%' }} direction="vertical">
                          <Form.Item label="核心数值 (如 99.99%, 500+)" required style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                noStyle
                                required
                              >
                                <Input placeholder="例如：99.99%" style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }} />
                              </Form.Item>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, curr) => {
                                  const pItem = prev?.items?.[name] || {};
                                  const cItem = curr?.items?.[name] || {};
                                  return pItem.color !== cItem.color || pItem.valueSize !== cItem.valueSize;
                                }}
                              >
                                {({ getFieldValue, setFieldsValue }) => {
                                  const items = getFieldValue('items') || [];
                                  const item = items[name] || {};
                                  return (
                                    <InlineTextStyleFormatter
                                      color={item.color}
                                      onColorChange={(c) => {
                                        const newItems = [...items];
                                        newItems[name] = { ...newItems[name], color: c };
                                        setFieldsValue({ items: newItems });
                                      }}
                                      fontSize={item.valueSize}
                                      onFontSizeChange={(s) => {
                                        const newItems = [...items];
                                        newItems[name] = { ...newItems[name], valueSize: s };
                                        setFieldsValue({ items: newItems });
                                      }}
                                      defaultSizeLabel="默认"
                                      fontSizeOptions={[
                                        { label: '默认 (32px)', value: '' },
                                        { label: '24px', value: 24 },
                                        { label: '28px', value: 28 },
                                        { label: '32px (标准)', value: 32 },
                                        { label: '36px (放大)', value: 36 },
                                        { label: '40px (特大)', value: 40 },
                                      ]}
                                    />
                                  );
                                }}
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'color']} noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                              <Form.Item {...restField} name={[name, 'valueSize']} noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                            </div>
                          </Form.Item>

                          <Form.Item label="下方说明标签" required style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                              <Form.Item
                                {...restField}
                                name={[name, 'label']}
                                noStyle
                                required
                              >
                                <Input placeholder="例如：高可用业务保障" style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }} />
                              </Form.Item>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, curr) => {
                                  const pItem = prev?.items?.[name] || {};
                                  const cItem = curr?.items?.[name] || {};
                                  return pItem.labelColor !== cItem.labelColor || pItem.labelSize !== cItem.labelSize;
                                }}
                              >
                                {({ getFieldValue, setFieldsValue }) => {
                                  const items = getFieldValue('items') || [];
                                  const item = items[name] || {};
                                  return (
                                    <InlineTextStyleFormatter
                                      color={item.labelColor}
                                      onColorChange={(c) => {
                                        const newItems = [...items];
                                        newItems[name] = { ...newItems[name], labelColor: c };
                                        setFieldsValue({ items: newItems });
                                      }}
                                      fontSize={item.labelSize}
                                      onFontSizeChange={(s) => {
                                        const newItems = [...items];
                                        newItems[name] = { ...newItems[name], labelSize: s };
                                        setFieldsValue({ items: newItems });
                                      }}
                                      defaultSizeLabel="默认"
                                      fontSizeOptions={[
                                        { label: '默认 (13px)', value: '' },
                                        { label: '12px', value: 12 },
                                        { label: '13px (标准)', value: 13 },
                                        { label: '14px (清晰)', value: 14 },
                                        { label: '15px', value: 15 },
                                        { label: '16px', value: 16 },
                                      ]}
                                    />
                                  );
                                }}
                              </Form.Item>
                              <Form.Item {...restField} name={[name, 'labelColor']} noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                              <Form.Item {...restField} name={[name, 'labelSize']} noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                            </div>
                          </Form.Item>
                        </Space>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          value: '100%',
                          label: '客户满意度',
                          color: '#52c41a',
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      添加新指标项
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'SignInFormBlockModel':
        return (
          <>
            {/* 1. 快速套用预设模版（3 列卡片化，彻底消除换行） */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#334155',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ color: '#eab308', fontSize: 14 }}>⚡</span> 快速套用登录表单模版
              </div>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div
                    onClick={() => {
                      form.setFieldsValue({
                        widthMode: 'fill',
                        align: 'center',
                        fillHeight: false,
                        showLogo: true,
                        logoPosition: 'left',
                        logoHeight: 38,
                        themeKey: 'glass',
                        borderRadius: 16,
                        paddingSize: 'normal',
                        title: '欢迎登录',
                        subtitle: '请输入您的账号密码开启高效协同',
                        loginButtonText: '登录',
                        buttonColor: '#1677ff',
                        showAgreement: false,
                      });
                      message.success('已套用【主流企业全宽 (自适应 100%)】模版');
                    }}
                    style={{
                      padding: '8px 8px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1677ff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>🏢 主流企业全宽</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>自适应 100% · 毛玻璃</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div
                    onClick={() => {
                      form.setFieldsValue({
                        widthMode: 'custom',
                        maxWidth: 420,
                        align: 'center',
                        fillHeight: false,
                        showLogo: true,
                        logoPosition: 'left',
                        logoHeight: 38,
                        themeKey: 'light',
                        borderRadius: 20,
                        paddingSize: 'normal',
                        title: '企业统一身份认证',
                        subtitle: '安全、敏捷、全链路数字协同中枢',
                        loginButtonText: '立即登录',
                        buttonColor: '#1677ff',
                        showAgreement: true,
                        agreementText: '登录即代表您已阅读并同意《企业服务协议》与《隐私政策》',
                      });
                      message.success('已套用【极简居中经典 (420px)】模版');
                    }}
                    style={{
                      padding: '8px 8px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1677ff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>💎 极简居中经典</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>420px · 纯白典雅</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div
                    onClick={() => {
                      form.setFieldsValue({
                        widthMode: 'fill',
                        align: 'center',
                        fillHeight: true,
                        showLogo: true,
                        logoPosition: 'left',
                        logoHeight: 38,
                        themeKey: 'cyber',
                        borderRadius: 20,
                        paddingSize: 'relaxed',
                        title: '数字化中枢控制台',
                        subtitle: '欢迎访问 NocoBase 核心运行节点',
                        loginButtonText: '进入控制台',
                        buttonColor: '#2563eb',
                        showAgreement: false,
                      });
                      message.success('已套用【极客深邃科技 (等高居中)】模版');
                    }}
                    style={{
                      padding: '8px 8px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1677ff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>🌌 极客深邃科技</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>等高居中 · 深空蓝夜</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 2. 身份认证体系接管提示（精致扁平横幅） */}
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 8,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#2563eb', fontSize: 16, flexShrink: 0 }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#1e40af' }}>
                    身份认证体系已由系统自动接管
                  </div>
                  <div style={{ color: '#3b82f6', fontSize: 11, lineHeight: 1.4, marginTop: 1 }}>
                    用户注册、密码找回、多登录源（Tabs）及第三方快捷登录均由系统【用户认证】插件统一驱动。
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                ghost
                size="small"
                style={{ fontSize: 12, borderRadius: 6, flexShrink: 0 }}
                icon={<LinkOutlined />}
                onClick={() => window.open('/v/admin/settings/auth/authenticators', '_blank')}
              >
                前往配置 ↗
              </Button>
            </div>

            {/* 3. 区块尺寸与自适应布局（栅格化双列紧凑排版） */}
            <Card title="区块尺寸与自适应布局" size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
              <Form.Item
                name="widthMode"
                label="宽度呈现模式"
                initialValue="fill"
                tooltip="选择自适应撑满将自动 100% 填满当前网格卡片列宽，无论在大屏或窄屏下均完美舒展"
                style={{ marginBottom: 14 }}
              >
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value="fill" style={{ flex: 1, textAlign: 'center' }}>
                    🌊 自适应撑满区块 (100% 推荐)
                  </Radio.Button>
                  <Radio.Button value="custom" style={{ flex: 1, textAlign: 'center' }}>
                    📐 限制最大宽度 (居中微调)
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.widthMode !== curr.widthMode}
              >
                {({ getFieldValue }) =>
                  getFieldValue('widthMode') === 'custom' ? (
                    <div style={{ marginBottom: 14, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                      <Form.Item
                        name="maxWidth"
                        label="卡片最大限制宽度 (px)"
                        initialValue={420}
                        style={{ marginBottom: 6 }}
                        tooltip="设置登录表单卡片在宽屏下的最大限制宽度"
                      >
                        <InputNumber min={320} max={800} step={20} style={{ width: '100%' }} addonAfter="px" />
                      </Form.Item>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>常用宽度：</span>
                        {[380, 420, 460, 520].map((w) => (
                          <Tag
                            key={w}
                            style={{ cursor: 'pointer', fontSize: 11, margin: 0 }}
                            onClick={() => form.setFieldsValue({ maxWidth: w })}
                          >
                            {w}px
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ) : null
                }
              </Form.Item>

              <Row gutter={16} style={{ marginBottom: 14 }}>
                <Col span={13}>
                  <Form.Item
                    name="align"
                    label="水平对齐方式"
                    initialValue="center"
                    style={{ marginBottom: 0 }}
                    tooltip="控制表单卡片在其所在的网格区块内的水平定位"
                  >
                    <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                      <Radio.Button value="left" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>居左对齐</Radio.Button>
                      <Radio.Button value="center" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>居中对齐</Radio.Button>
                      <Radio.Button value="right" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>居右对齐</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item
                    name="fillHeight"
                    label="纵向等高对齐"
                    valuePropName="checked"
                    initialValue={false}
                    style={{ marginBottom: 0 }}
                    tooltip="开启后卡片自动 100% 撑满整行高度并垂直居中，适合与左侧大图保持齐平"
                  >
                    <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
                      <Switch checkedChildren="等高垂直居中" unCheckedChildren="自然高度" />
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={13}>
                  <Form.Item
                    name="paddingSize"
                    label="卡片内边距 (Padding)"
                    initialValue="normal"
                    style={{ marginBottom: 0 }}
                  >
                    <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                      <Radio.Button value="compact" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>紧凑 22</Radio.Button>
                      <Radio.Button value="normal" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>标准 32</Radio.Button>
                      <Radio.Button value="relaxed" style={{ flex: 1, textAlign: 'center', padding: '0 4px', fontSize: 12 }}>宽阔 44</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item
                    name="borderRadius"
                    label="卡片圆角 (px)"
                    initialValue={20}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={0} max={36} style={{ width: '100%' }} addonAfter="px" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 4. 视觉质感与卡片主题（可视化色卡网格） */}
            <Card title="视觉质感与卡片主题" size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
              <Form.Item name="themeKey" label="卡片主题风格" initialValue="glass" style={{ marginBottom: 14 }}>
                <ThemeVisualRadioCards />
              </Form.Item>

              <Form.Item name="cardBg" label="自定义卡片背景色 (可选覆盖)" style={{ marginBottom: 0 }}>
                <ColorSelectInput placeholder="留空则跟随主题预设，如 rgba(255, 255, 255, 0.9)" />
              </Form.Item>
            </Card>

            {/* 品牌 Logo 与标题文案 */}
            <Card title="品牌 Logo 与标题文案" size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
              {/* 顶行：Logo 开关 与 高度设置并排 */}
              <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <Form.Item
                    name="showLogo"
                    label="品牌 Logo 标识"
                    valuePropName="checked"
                    initialValue={true}
                    style={{ marginBottom: 0 }}
                    tooltip="开启后将在登录表单头部呈现企业官方品牌 Logo"
                  >
                    <Switch checkedChildren="显示 Logo" unCheckedChildren="隐藏 Logo" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.showLogo !== curr.showLogo}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('showLogo') !== false ? (
                        <Form.Item
                          name="logoHeight"
                          label="展示高度"
                          initialValue={38}
                          style={{ marginBottom: 0 }}
                          tooltip="微调 Logo 的展示高度（宽度按原图比例自适应）"
                        >
                          <InputNumber min={20} max={80} step={2} style={{ width: '100%' }} addonAfter="px" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Col>
              </Row>

              {/* Logo 展开项 */}
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showLogo !== curr.showLogo}
              >
                {({ getFieldValue }) =>
                  getFieldValue('showLogo') !== false ? (
                    <div style={{ marginBottom: 14, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <Form.Item
                        name="logoPosition"
                        label="Logo 排版形态"
                        initialValue="left"
                        style={{ marginBottom: 12 }}
                        tooltip="【标题左侧同行】：图文并排居中，紧凑精致；【标题上方居中】：经典顶置居中"
                      >
                        <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                          <Radio.Button value="left" style={{ flex: 1, textAlign: 'center' }}>🏷️ 标题左侧同行 (推荐)</Radio.Button>
                          <Radio.Button value="top" style={{ flex: 1, textAlign: 'center' }}>🔝 标题上方居中</Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item
                        name="customLogoUrl"
                        label="自定义 Logo 图片 (可选)"
                        style={{ marginBottom: 0 }}
                        tooltip="留空将默认读取系统「系统设置」中的官方应用 Logo"
                      >
                        <ImageInputWithUpload placeholder="留空默认使用系统官方应用 Logo，或粘贴/上传专属图片" />
                      </Form.Item>
                    </div>
                  ) : null
                }
              </Form.Item>

              <Divider style={{ margin: '14px 0' }} />

              {/* 表单主标题与副标题 */}
              <Form.Item label="表单主标题" required style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="title" noStyle required initialValue="欢迎登录">
                    <Input
                      placeholder="例如：欢迎登录 / 统一身份认证"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.titleColor !== curr.titleColor || prev.titleFontSize !== curr.titleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('titleColor')}
                        onColorChange={(c) => setFieldsValue({ titleColor: c })}
                        fontSize={getFieldValue('titleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ titleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认', value: '' },
                          { label: '20px', value: 20 },
                          { label: '22px', value: 22 },
                          { label: '24px (标准)', value: 24 },
                          { label: '26px', value: 26 },
                          { label: '28px (醒目)', value: 28 },
                          { label: '32px (特大)', value: 32 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="titleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="titleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item label="表单副标题" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="subtitle" noStyle initialValue="请输入您的账号密码开启高效协同">
                    <Input
                      placeholder="请输入副标题说明，留空则不显示"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.subtitleColor !== curr.subtitleColor || prev.subtitleFontSize !== curr.subtitleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('subtitleColor')}
                        onColorChange={(c) => setFieldsValue({ subtitleColor: c })}
                        fontSize={getFieldValue('subtitleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ subtitleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认', value: '' },
                          { label: '12px (小号)', value: 12 },
                          { label: '13px (标准)', value: 13 },
                          { label: '14px (清晰)', value: 14 },
                          { label: '16px (醒目)', value: 16 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="subtitleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="subtitleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>
            </Card>

            {/* 登录按钮与样式 */}
            <Card title="登录按钮与样式" size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
              <Row gutter={16} align="middle">
                <Col span={14}>
                  <Form.Item name="loginButtonText" label="登录按钮文案" required initialValue="立即登录" style={{ marginBottom: 0 }}>
                    <Input placeholder="例如：立即登录 / SSO 登录" style={{ height: 32 }} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="buttonColor" label="按钮主题色" initialValue="#1677ff" style={{ marginBottom: 0 }}>
                    <ColorSelectInput placeholder="#1677ff" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 服务协议与合规声明 */}
            <Card title="服务协议与合规声明 (可选)" size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>显示底部服务协议与合规条款</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>在登录按钮下方提示用户协议与隐私指引</div>
                </div>
                <Form.Item name="showAgreement" noStyle valuePropName="checked" initialValue={false}>
                  <Switch checkedChildren="已开启" unCheckedChildren="已关闭" />
                </Form.Item>
              </div>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showAgreement !== curr.showAgreement}
              >
                {({ getFieldValue }) =>
                  getFieldValue('showAgreement') ? (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #e2e8f0' }}>
                      <Form.Item
                        name="agreementText"
                        label="协议声明文案"
                        initialValue="登录即代表您已阅读并同意《企业服务协议》与《隐私政策》"
                        style={{ marginBottom: 10 }}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="请输入协议声明文案，如：登录即代表同意《用户协议》与《隐私政策》"
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>

                      <Row gutter={12} align="middle">
                        <Col span={12}>
                          <Form.Item name="agreementColor" label="文字颜色 (可选)" style={{ marginBottom: 0 }}>
                            <ColorSelectInput placeholder="留空默认灰色" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>快捷模版：</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Tag
                              style={{ cursor: 'pointer', fontSize: 11, margin: 0 }}
                              onClick={() => form.setFieldsValue({ agreementText: '登录即代表您已阅读并同意《企业服务协议》与《隐私政策》' })}
                            >
                              标准协议
                            </Tag>
                            <Tag
                              style={{ cursor: 'pointer', fontSize: 11, margin: 0 }}
                              onClick={() => form.setFieldsValue({ agreementText: '我已阅读并同意本系统《信息安全与隐私合规须知》' })}
                            >
                              合规须知
                            </Tag>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ) : null
                }
              </Form.Item>
            </Card>
          </>
        );

      case 'CustomCarouselBlockModel':
        return (
          <>
            <Card
              title="轮播全局参数"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="autoplay" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="自动轮播" unCheckedChildren="手动切换" />
                </Form.Item>
              }
            >
              <Form.Item name="height" label="轮播画幅高度 (px)" initialValue={320} style={{ marginBottom: 0 }}>
                <InputNumber min={160} max={800} style={{ width: '100%', height: 32 }} placeholder="建议 280 ~ 420 px" />
              </Form.Item>
            </Card>

            <Card title="幻灯片海报列表 (支持图片/背景/自由增删)" size="small">
              <Form.List name="slides">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`幻灯片 #${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            >
                              删除
                            </Button>
                          ) : null
                        }
                        style={{ marginBottom: 12, backgroundColor: '#fcfcfc' }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'imageUrl']}
                          label="幻灯片背景图片 (支持上传本地 / 粘贴 URL / 选用推荐)"
                          style={{ marginBottom: 12 }}
                        >
                          <ImageInputWithUpload placeholder="粘贴图片 URL 或点击上传本地海报" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'overlayOpacity']}
                          label="图片暗色遮罩 (让上方文字更清晰)"
                          initialValue={0.35}
                          style={{ marginBottom: 12 }}
                        >
                          <Select
                            style={{ height: 32 }}
                            options={[
                              { label: '无遮罩 (0% 原图明度)', value: 0 },
                              { label: '轻度暗化 (25% 遮罩)', value: 0.25 },
                              { label: '标准暗化 (35% 推荐)', value: 0.35 },
                              { label: '适中暗化 (45%)', value: 0.45 },
                              { label: '深沉暗化 (65%)', value: 0.65 },
                            ]}
                          />
                        </Form.Item>

                        <Row gutter={12} style={{ marginBottom: 12 }}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'title']}
                              label="幻灯片主标题"
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="例如：全新数字化协同中枢" style={{ height: 32 }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'subtitle']}
                              label="幻灯片副说明"
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="例如：支持私有化部署底座" style={{ height: 32 }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'linkUrl']}
                              label="点击跳转链接 URL (可选)"
                              style={{ marginBottom: 0 }}
                            >
                              <Input prefix={<LinkOutlined style={{ color: '#94a3b8' }} />} placeholder="https://..." style={{ height: 32 }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'bg']}
                              label="无图时回退底色/渐变"
                              initialValue="linear-gradient(135deg, #1d39c4 0%, #002766 100%)"
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="例如：linear-gradient(...)" style={{ height: 32 }} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          imageUrl: '',
                          overlayOpacity: 0.35,
                          title: '全新数字化矩阵',
                          subtitle: '连接人、数据与流程的全新底座',
                          bg: 'linear-gradient(135deg, #096dd9 0%, #002766 100%)',
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      添加新幻灯片
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'CustomHtmlBlockModel':
        return (
          <Card title="HTML 代码编辑" size="small">
            <Form.Item name="html" label="HTML 源代码" required>
              <Input.TextArea
                rows={10}
                placeholder="<div>支持嵌入任意自定义 HTML、内联样式与脚本</div>"
              />
            </Form.Item>
          </Card>
        );

      case 'CustomImageBlockModel':
        return (
          <Card title="宣传插画 / 图片参数" size="small">
            <Form.Item name="url" label="图片配置 (支持本地上传 / 粘贴 URL)" required style={{ marginBottom: 14 }}>
              <ImageInputWithUpload placeholder="粘贴图片 URL 或点击上传本地海报" />
            </Form.Item>
            <Row gutter={12} style={{ marginBottom: 14 }}>
              <Col span={12}>
                <Form.Item name="height" label="图片展示高度 (px)" initialValue={360} style={{ marginBottom: 0 }}>
                  <InputNumber min={100} max={1000} style={{ width: '100%', height: 32 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="borderRadius" label="圆角半径 (px)" initialValue={16} style={{ marginBottom: 0 }}>
                  <InputNumber min={0} max={48} style={{ width: '100%', height: 32 }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="caption" label="图片说明文字 (可选)" style={{ marginBottom: 0 }}>
              <Input placeholder="图片下方的辅助说明文字" style={{ height: 32 }} />
            </Form.Item>
          </Card>
        );

      case 'CustomNoticeBlockModel':
        return (
          <>
            <Card title="⚡ 快速套用公告通知模版" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      themeKey: 'cyber',
                      showBadge: true,
                      badgeText: '🔥 重磅发布',
                      message: '【全新架构】平台 3.0 全球公测现已全面开启，体验极致性能与 AI 协同',
                      description: '已为您的团队准备好一键无缝迁移指南与专属算力礼包。',
                      marquee: true,
                      marqueeSpeed: 'normal',
                      ctaType: 'button',
                      linkText: '立即体验 🚀',
                      linkUrl: 'https://nocobase.com',
                      showIcon: true,
                      closable: true,
                      borderRadius: 12,
                    });
                    message.success('已套用【重磅版本发布/公测】预设模版');
                  }}
                >
                  🚀 重磅版本发布 (深空蓝夜)
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      themeKey: 'amber',
                      showBadge: true,
                      badgeText: '⚡ 计划维护',
                      message: '【系统维护通知】本周六凌晨 02:00-04:00 将进行机房网络割接与弹性集群扩容',
                      description: '割接期间部分接口可能出现瞬时重连，请提前保存业务数据。',
                      marquee: true,
                      marqueeSpeed: 'normal',
                      ctaType: 'link',
                      linkText: '查看维护窗口详情 →',
                      linkUrl: 'https://nocobase.com',
                      showIcon: true,
                      closable: true,
                      borderRadius: 10,
                    });
                    message.success('已套用【计划内停机维护】预设模版');
                  }}
                >
                  ⚡ 计划停机维护 (活力琥珀金)
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      themeKey: 'emerald',
                      showBadge: true,
                      badgeText: '🛡️ 安全通报',
                      message: '【安全合规通报】平台已顺利通过国家网络安全等级保护（等保三级）年度测评',
                      description: '全链路军工级加密传输与多重备份，护航企业数字化资产安全。',
                      marquee: false,
                      ctaType: 'link',
                      linkText: '查阅安全测评证书 →',
                      linkUrl: 'https://nocobase.com',
                      showIcon: true,
                      closable: true,
                      borderRadius: 10,
                    });
                    message.success('已套用【安全合规通报】预设模版');
                  }}
                >
                  🛡️ 安全合规通报 (翡翠青碧)
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      themeKey: 'glass',
                      showBadge: true,
                      badgeText: '📢 平台简讯',
                      message: '【安全建议】为防范钓鱼与撞库风险，建议管理员与核心成员开启双因子认证(2FA)',
                      description: '',
                      marquee: true,
                      marqueeSpeed: 'normal',
                      ctaType: 'button',
                      linkText: '前往配置 2FA',
                      linkUrl: 'https://nocobase.com',
                      showIcon: true,
                      closable: true,
                      borderRadius: 12,
                    });
                    message.success('已套用【平台日常简讯】预设模版');
                  }}
                >
                  📢 平台日常简讯 (晶透毛玻璃)
                </Button>
              </div>
            </Card>

            <Card title="🎨 公告主题风格与外观" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="themeKey" label="精选视觉主题" initialValue="glass">
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="glass">✨ 晶透毛玻璃</Radio.Button>
                  <Radio.Button value="amber">⚡ 活力琥珀金</Radio.Button>
                  <Radio.Button value="cyber">🌌 深空蓝夜</Radio.Button>
                  <Radio.Button value="emerald">🌿 翡翠青碧</Radio.Button>
                  <Radio.Button value="light">⚪ 极简典雅白</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="borderRadius" label="边框圆角 (px)" initialValue={10}>
                    <InputNumber min={0} max={32} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="banner" label="贴顶通栏横幅模式" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="🏷️ 前缀胶囊徽标 (Badge)"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="showBadge" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showBadge !== curr.showBadge}
              >
                {({ getFieldValue }) => {
                  const showBadge = getFieldValue('showBadge') ?? true;
                  if (!showBadge) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        前缀徽标已关闭，如需展示可在右上角开启
                      </div>
                    );
                  }
                  return (
                    <Form.Item label="徽标文字 (如 🔥重磅升级 / ⚡计划维护)" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                        <Form.Item name="badgeText" noStyle initialValue="最新公告">
                          <Input
                            placeholder="输入前缀徽标"
                            style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                          />
                        </Form.Item>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) => prev.badgeColor !== curr.badgeColor}
                        >
                          {({ getFieldValue: gfv, setFieldsValue }) => (
                            <InlineTextStyleFormatter
                              color={gfv('badgeColor')}
                              onColorChange={(c) => setFieldsValue({ badgeColor: c })}
                              defaultSizeLabel="默认"
                            />
                          )}
                        </Form.Item>
                        <Form.Item name="badgeColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                      </div>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Card>

            <Card title="📝 公告核心文案与交互" size="small" style={{ marginBottom: 16 }}>
              <Form.Item label="公告主标题" required style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="message" noStyle required initialValue="【系统公告】本周六凌晨 02:00-04:00 系统将进行计划内机房网络割接与弹性扩容维护。">
                    <Input
                      placeholder="输入公告主标题"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.messageColor !== curr.messageColor || prev.messageFontSize !== curr.messageFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('messageColor')}
                        onColorChange={(c) => setFieldsValue({ messageColor: c })}
                        fontSize={getFieldValue('messageFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ messageFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (13.5px)', value: '' },
                          { label: '12px', value: 12 },
                          { label: '13px', value: 13 },
                          { label: '14px (标准)', value: 14 },
                          { label: '15px (清晰)', value: 15 },
                          { label: '16px (醒目)', value: 16 },
                          { label: '18px (放大)', value: 18 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="messageColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="messageFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item label="详细说明 / 补充文案" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="description" noStyle>
                    <Input
                      placeholder="可选：输入更详细的说明或引导"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.descColor !== curr.descColor || prev.descFontSize !== curr.descFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('descColor')}
                        onColorChange={(c) => setFieldsValue({ descColor: c })}
                        fontSize={getFieldValue('descFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ descFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (12.5px)', value: '' },
                          { label: '11px', value: 11 },
                          { label: '12px', value: 12 },
                          { label: '13px (标准)', value: 13 },
                          { label: '14px (清晰)', value: 14 },
                          { label: '15px', value: 15 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="descColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="descFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="showIcon" label="显示喇叭/通知图标" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                    <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="closable" label="允许用户点击关闭" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                    <Switch checkedChildren="允许" unCheckedChildren="禁止" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="💫 平滑跑马灯 (Marquee)"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="marquee" noStyle valuePropName="checked" initialValue={false}>
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.marquee !== curr.marquee}
              >
                {({ getFieldValue }) => {
                  const marquee = getFieldValue('marquee');
                  if (!marquee) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        跑马灯滚动已关闭，开启后文字横向无缝循环滚动
                      </div>
                    );
                  }
                  return (
                    <Form.Item name="marqueeSpeed" label="跑马灯流转速度" initialValue="normal" style={{ marginBottom: 0 }}>
                      <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                        <Radio.Button value="slow" style={{ flex: 1, textAlign: 'center' }}>慢速 (36s)</Radio.Button>
                        <Radio.Button value="normal" style={{ flex: 1, textAlign: 'center' }}>正常 (22s)</Radio.Button>
                        <Radio.Button value="fast" style={{ flex: 1, textAlign: 'center' }}>快速 (14s)</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Card>

            <Card title="🔗 行动呼吁与详情跳转 (CTA)" size="small">
              <Form.Item name="ctaType" label="跳转形式" initialValue="link" style={{ marginBottom: 14 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value="none" style={{ flex: 1, textAlign: 'center' }}>不显示</Radio.Button>
                  <Radio.Button value="link" style={{ flex: 1, textAlign: 'center' }}>箭头文字链接</Radio.Button>
                  <Radio.Button value="button" style={{ flex: 1, textAlign: 'center' }}>微光胶囊按钮</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.ctaType !== curr.ctaType}
              >
                {({ getFieldValue }) => {
                  const ctaType = getFieldValue('ctaType') || 'link';
                  if (ctaType === 'none') {
                    return null;
                  }
                  return (
                    <Row gutter={12}>
                      <Col span={14}>
                        <Form.Item label="跳转文案" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                            <Form.Item name="linkText" noStyle initialValue="查看详情 →">
                              <Input
                                placeholder="例如：查看详情 → 或 立即体验 🚀"
                                style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, curr) => prev.linkTextColor !== curr.linkTextColor}
                            >
                              {({ getFieldValue: gfv, setFieldsValue }) => (
                                <InlineTextStyleFormatter
                                  color={gfv('linkTextColor')}
                                  onColorChange={(c) => setFieldsValue({ linkTextColor: c })}
                                  defaultSizeLabel="默认"
                                />
                              )}
                            </Form.Item>
                            <Form.Item name="linkTextColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                          </div>
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item name="linkUrl" label="详情链接 URL" style={{ marginBottom: 0 }}>
                          <Input prefix={<LinkOutlined style={{ color: '#94a3b8' }} />} placeholder="https://..." style={{ height: 32 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }}
              </Form.Item>
            </Card>
          </>
        );

      case 'CustomPartnersBlockModel':
        return (
          <>
            <Card title="⚡ 快速套用合作伙伴模版" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      title: '深受全球顶级云厂商与技术基建信赖',
                      displayMode: 'marquee',
                      rows: 2,
                      reverseDirection: true,
                      marqueeSpeed: 'medium',
                      filterMode: 'white',
                      themeKey: 'cyber',
                      items: [
                        { name: '阿里云', logo: 'https://img.alicdn.com/tfs/TB1..50X.T1gK0jSZFrXXc7HpXa-280-80.png', url: 'https://aliyun.com' },
                        { name: '腾讯云', logo: 'https://cloudcache.tencent-cloud.com/qcloud/portal/kit/images/logo.png', url: 'https://cloud.tencent.com' },
                        { name: '华为云', logo: 'https://res.vmallres.com/pimages/common/config/logo/logo_new.png', url: 'https://huaweicloud.com' },
                        { name: 'AWS 亚马逊云科技', logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png', url: 'https://aws.amazon.com' },
                        { name: 'Microsoft Azure', logo: 'https://azure.microsoft.com/svghandler/azure-logo-gray/', url: 'https://azure.microsoft.com' },
                      ],
                    });
                    message.success('已套用【全球顶级云厂商与技术基建】预设模版');
                  }}
                >
                  🌐 全球云厂商基建 (双行交错跑马灯)
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      title: '携手全球顶尖云生态与开源技术基础设施',
                      displayMode: 'marquee',
                      rows: 1,
                      reverseDirection: false,
                      marqueeSpeed: 'slow',
                      filterMode: 'grayscale',
                      themeKey: 'transparent',
                      items: [
                        { name: '阿里云', logo: 'https://img.alicdn.com/tfs/TB1..50X.T1gK0jSZFrXXc7HpXa-280-80.png', url: 'https://aliyun.com' },
                        { name: '腾讯云', logo: 'https://cloudcache.tencent-cloud.com/qcloud/portal/kit/images/logo.png', url: 'https://cloud.tencent.com' },
                        { name: '华为云', logo: 'https://res.vmallres.com/pimages/common/config/logo/logo_new.png', url: 'https://huaweicloud.com' },
                        { name: 'AWS', logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png', url: 'https://aws.amazon.com' },
                        { name: 'Microsoft Azure', logo: 'https://azure.microsoft.com/svghandler/azure-logo-gray/', url: 'https://azure.microsoft.com' },
                      ],
                    });
                    message.success('已套用【单行经典跑马灯】预设');
                  }}
                >
                  ☁️ 单行经典跑马灯 (1行)
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => {
                    form.setFieldsValue({
                      title: '服务全球 500+ 行业龙头与数字化标杆客户',
                      displayMode: 'grid',
                      columns: 4,
                      rows: 0,
                      filterMode: 'grayscale',
                      themeKey: 'glass',
                      items: [
                        { name: '招商局集团', logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg', url: '' },
                        { name: '国家电网', logo: 'https://img.alicdn.com/tfs/TB1..50X.T1gK0jSZFrXXc7HpXa-280-80.png', url: '' },
                        { name: '顺丰科技', logo: 'https://cloudcache.tencent-cloud.com/qcloud/portal/kit/images/logo.png', url: '' },
                        { name: '中国移动', logo: 'https://res.vmallres.com/pimages/common/config/logo/logo_new.png', url: '' },
                      ],
                    });
                    message.success('已套用【标杆企业与金融客户】网格预设');
                  }}
                >
                  🏛️ 标杆企业与客户案例 (网格)
                </Button>
              </div>
            </Card>

            <Card title="展示形态与流动动效" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="displayMode" label="排版呈现形态" initialValue="grid" style={{ marginBottom: 14 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value="marquee" style={{ flex: 1, textAlign: 'center' }}>🌊 无缝无限跑马灯 (大厂推荐)</Radio.Button>
                  <Radio.Button value="grid" style={{ flex: 1, textAlign: 'center' }}>🔲 经典响应式网格</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.displayMode !== curr.displayMode || prev.rows !== curr.rows}
              >
                {({ getFieldValue }) =>
                  getFieldValue('displayMode') === 'marquee' ? (
                    <>
                      <Form.Item name="rows" label="跑马灯行数量 (Rows)" initialValue={1} extra="多行模式下自动将合作伙伴分发到不同滚动轨道，带来大厂全景生态震撼感。">
                        <Radio.Group buttonStyle="solid">
                          <Radio.Button value={1}>1 行 (经典标准)</Radio.Button>
                          <Radio.Button value={2}>2 行 (双行交错推荐)</Radio.Button>
                          <Radio.Button value={3}>3 行 (三行全景矩阵)</Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      {getFieldValue('rows') > 1 && (
                        <Form.Item name="reverseDirection" label="多行交错反向流动" valuePropName="checked" initialValue={true} extra="开启后偶数行 (第 2 行) 将向相反方向流动，形成极具动感的双向交错大厂视觉效果。">
                          <Switch />
                        </Form.Item>
                      )}

                      <Form.Item name="marqueeSpeed" label="跑马灯流转速度" initialValue="medium">
                        <Radio.Group buttonStyle="solid">
                          <Radio.Button value="slow">平缓慢速 (45秒)</Radio.Button>
                          <Radio.Button value="medium">标准适中 (28秒，推荐)</Radio.Button>
                          <Radio.Button value="fast">动感快速 (18秒)</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </>
                  ) : (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="columns" label="单行展示列数" initialValue={4}>
                          <Select
                            options={[
                              { label: '3 列并排 (宽松)', value: 3 },
                              { label: '4 列并排 (标准推荐)', value: 4 },
                              { label: '6 列并排 (紧凑多伙伴)', value: 6 },
                              { label: '8 列并排 (密集展示)', value: 8 },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="rows" label="展示行数量限制" initialValue={0} extra="限制卡片最大展示行数，避免过多伙伴撑高页面。">
                          <Select
                            options={[
                              { label: '全部展示 (不限行数)', value: 0 },
                              { label: '仅展示 1 行', value: 1 },
                              { label: '展示 2 行', value: 2 },
                              { label: '展示 3 行', value: 3 },
                              { label: '展示 4 行', value: 4 },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  )
                }
              </Form.Item>
            </Card>

            <Card title="视觉质感与色彩滤镜" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="filterMode" label="Logo 色彩滤镜" initialValue="grayscale">
                <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="white">💎 统一高级纯白微光 (深色壁纸顶级推荐，Logo 统一纯白高光)</Radio>
                    <Radio value="grayscale">🎨 经典灰度微透 (默认灰度微透，鼠标悬停平滑恢复全彩)</Radio>
                    <Radio value="original">🌈 原始全彩展示 (保持原有真实色彩呈现)</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="themeKey" label="卡片主题底色" initialValue="transparent">
                <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="transparent">🎐 通透无界 (默认推荐，无外框，Logo 自然悬浮在壁纸上)</Radio>
                    <Radio value="glass">💎 晶透毛玻璃 (微白高透光磨砂 + 高光微边框)</Radio>
                    <Radio value="cyber">🌌 深空蓝夜 (深邃科技蓝紫渐变，沉稳高级)</Radio>
                    <Radio value="obsidian">🌑 曜石纯黑 (黑曜暗夜微光质感)</Radio>
                    <Radio value="light">🏢 纯白典雅 (浅色微投影，适配浅色壁纸)</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="borderRadius" label="卡片圆角 (px)" initialValue={16} style={{ marginBottom: 0 }}>
                <InputNumber min={0} max={40} style={{ width: '100%', height: 32 }} />
              </Form.Item>
            </Card>

            <Card title="顶部分组标语设置" size="small" style={{ marginBottom: 16 }}>
              <Form.Item label="顶部分组标题" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="title" noStyle initialValue="深受全球 500+ 行业标杆与创新团队信赖">
                    <Input
                      placeholder="输入标题，留空则不显示标题"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.titleColor !== curr.titleColor || prev.titleFontSize !== curr.titleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('titleColor')}
                        onColorChange={(c) => setFieldsValue({ titleColor: c })}
                        fontSize={getFieldValue('titleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ titleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (13px)', value: '' },
                          { label: '12px', value: 12 },
                          { label: '13px (标准)', value: 13 },
                          { label: '14px (清晰)', value: 14 },
                          { label: '16px (醒目)', value: 16 },
                          { label: '18px (放大)', value: 18 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="titleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="titleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  '深受全球 500+ 行业标杆与创新团队信赖',
                  '数字中国 行业龙头与标杆客户信赖之选',
                  '全球前沿技术先锋与生态伙伴',
                  '跨国企业与财富 500 强共同见证',
                ].map((text) => (
                  <Tag
                    key={text}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => form.setFieldsValue({ title: text })}
                  >
                    + {text}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card
              title="合作伙伴 Logo 列表"
              size="small"
              extra={
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  支持拖动/上下排序、本地上传、跳转链接与防裂图回退
                </span>
              }
            >
              <Form.List name="items">
                {(fields, { add, remove, move }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, idx) => (
                      <Card
                        key={key}
                        size="small"
                        title={
                          <span style={{ fontSize: 13, fontWeight: 600 }}>
                            伙伴 #{idx + 1}
                          </span>
                        }
                        extra={
                          <Space size="small">
                            {idx > 0 && (
                              <Button
                                type="text"
                                size="small"
                                icon={<ArrowUpOutlined />}
                                onClick={() => move(idx, idx - 1)}
                              />
                            )}
                            {idx < fields.length - 1 && (
                              <Button
                                type="text"
                                size="small"
                                icon={<ArrowDownOutlined />}
                                onClick={() => move(idx, idx + 1)}
                              />
                            )}
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            )}
                          </Space>
                        }
                        style={{ marginBottom: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                      >
                        <Row gutter={8}>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'name']} label="伙伴企业名称" required>
                              <Input placeholder="例如：阿里云" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'url']} label="点击跳转链接 URL (可选)">
                              <Input placeholder="https://..." />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item {...restField} name={[name, 'logo']} label="Logo 图片 (支持本地上传 / 粘贴 URL)">
                          <ImageInputWithUpload placeholder="粘贴 Logo URL 或点击右侧上传本地图片" />
                        </Form.Item>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => add({ name: '新合作伙伴', logo: '', url: '' })}
                      block
                      icon={<PlusOutlined />}
                      style={{ marginTop: 8 }}
                    >
                      添加合作伙伴 Logo
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'CustomContactBlockModel':
        return (
          <>
            <Card title="⚡ 快速套用场景预设" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[10, 10]}>
                {[
                  {
                    key: 'enterprise',
                    icon: '🏢',
                    title: '企业专席架构支持',
                    desc: '企微顾问 · 蓝夜科技 · 4 渠道预置',
                    values: {
                      title: '需要专属技术支持与架构协助？',
                      subtitle: '专属架构师顾问团队随时为您提供解答与全流程技术护航。',
                      themeKey: 'cyber',
                      layout: 'horizontal',
                      showQrCode: true,
                      qrCode: 'https://nocobase.com',
                      qrBadge: '企业微信',
                      qrCodeTip: '扫码添加专属企微架构顾问',
                      qrSize: 'medium',
                      contactItems: [
                        { icon: 'PhoneOutlined', label: '服务热线', value: '400-888-9999', action: 'tel', color: '#69b1ff' },
                        { icon: 'MailOutlined', label: '支持邮箱', value: 'support@nocobase.com', action: 'mailto', color: '#95de64' },
                        { icon: 'LinkOutlined', label: '专属工单', value: 'https://support.nocobase.com', action: 'url', color: '#b37feb' },
                        { icon: 'ClockCircleOutlined', label: '服务时间', value: '周一至周日 9:00 - 21:00', action: 'none', color: '#ffd666' },
                      ],
                    },
                  },
                  {
                    key: 'sales',
                    icon: '⚡',
                    title: 'SaaS 售前方案定制',
                    desc: '1对1演示 · 企微极光 · 咨询微信预置',
                    values: {
                      title: '售前咨询与专属方案定制',
                      subtitle: '深入了解企业商业版功能特性、私有化部署架构及专属商务报价。',
                      themeKey: 'aurora',
                      layout: 'horizontal',
                      showQrCode: true,
                      qrCode: 'https://nocobase.com/sales',
                      qrBadge: '商务微信',
                      qrCodeTip: '微信扫码预约 1 对 1 专家方案演示',
                      qrSize: 'medium',
                      contactItems: [
                        { icon: 'PhoneOutlined', label: '售前热线', value: '400-666-8888', action: 'tel', color: '#52c41a' },
                        { icon: 'MailOutlined', label: '商务邮箱', value: 'sales@nocobase.com', action: 'mailto', color: '#69b1ff' },
                        { icon: 'LinkOutlined', label: '在线预约', value: 'https://nocobase.com/demo', action: 'url', color: '#36cfc9' },
                        { icon: 'WechatOutlined', label: '顾问微信', value: 'NocoBase_VIP', action: 'copy', color: '#95de64' },
                      ],
                    },
                  },
                  {
                    key: 'ops',
                    icon: '🛠',
                    title: '7×24h 智能运维应急',
                    desc: 'SLA保障 · 曜石暗夜 · 应急热线预置',
                    values: {
                      title: '7×24小时 运维与故障应急支持',
                      subtitle: '高等级 SLA 运维响应保障体系，重大系统故障 15 分钟内极速响应。',
                      themeKey: 'obsidian',
                      layout: 'horizontal',
                      showQrCode: true,
                      qrCode: 'https://nocobase.com/status',
                      qrBadge: '应急值守',
                      qrCodeTip: '扫码快速接入应急响应协作群',
                      qrSize: 'medium',
                      contactItems: [
                        { icon: 'PhoneOutlined', label: '应急热线', value: '400-999-0000', action: 'tel', color: '#ff4d4f' },
                        { icon: 'MailOutlined', label: '告警邮箱', value: 'alert@nocobase.com', action: 'mailto', color: '#faad14' },
                        { icon: 'LinkOutlined', label: '系统状态', value: 'https://status.nocobase.com', action: 'url', color: '#69b1ff' },
                        { icon: 'ClockCircleOutlined', label: '响应时段', value: '7×24小时 全天候无休', action: 'none', color: '#ffd666' },
                      ],
                    },
                  },
                ].map((tpl) => (
                  <Col span={8} key={tpl.key}>
                    <div
                      onClick={() => {
                        form.setFieldsValue(tpl.values);
                        message.success(`已套用【${tpl.title}】预设模版`);
                      }}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1677ff';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 119, 255, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{tpl.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{tpl.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{tpl.desc}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card title="卡片主题风格与视觉质感" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="themeKey" label="主题风格预设" initialValue="glass" style={{ marginBottom: 14 }}>
                <ContactThemeVisualCards />
              </Form.Item>
              <Form.Item name="accentColor" label="主题高光与强调色 (可选覆写)" style={{ marginBottom: 0 }}>
                <ColorSelectInput placeholder="默认随主题自动搭配" />
              </Form.Item>
            </Card>

            <Card title="模块标题与排版布局" size="small" style={{ marginBottom: 16 }}>
              <Form.Item label="主标题" required style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="title" noStyle required initialValue="需要帮助与技术支持？">
                    <Input
                      placeholder="例如：需要帮助与技术支持？"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.titleColor !== curr.titleColor || prev.textColor !== curr.textColor || prev.titleFontSize !== curr.titleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('titleColor') || getFieldValue('textColor')}
                        onColorChange={(c) => setFieldsValue({ titleColor: c, textColor: c })}
                        fontSize={getFieldValue('titleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ titleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (16px)', value: '' },
                          { label: '14px', value: 14 },
                          { label: '16px (标准)', value: 16 },
                          { label: '18px (醒目)', value: 18 },
                          { label: '20px (放大)', value: 20 },
                          { label: '24px (特大)', value: 24 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="titleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="textColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="titleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item label="副标题说明" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="subtitle" noStyle initialValue="我们的架构顾问与专属服务团队随时为您提供解答与技术协助。">
                    <Input
                      placeholder="输入副标题说明"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.subtitleColor !== curr.subtitleColor || prev.subtitleFontSize !== curr.subtitleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('subtitleColor')}
                        onColorChange={(c) => setFieldsValue({ subtitleColor: c })}
                        fontSize={getFieldValue('subtitleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ subtitleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (13px)', value: '' },
                          { label: '12px (细小)', value: 12 },
                          { label: '13px (标准)', value: 13 },
                          { label: '14px (清晰)', value: 14 },
                          { label: '15px', value: 15 },
                          { label: '16px (醒目)', value: 16 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="subtitleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="subtitleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item name="layout" label="排版布局" initialValue="horizontal" style={{ marginBottom: 0 }}>
                    <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                      <Radio.Button value="horizontal" style={{ flex: 1, textAlign: 'center' }}>左右图文 (推荐)</Radio.Button>
                      <Radio.Button value="vertical" style={{ flex: 1, textAlign: 'center' }}>上下居中</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="borderRadius" label="卡片圆角 (px)" initialValue={16} style={{ marginBottom: 0 }}>
                    <InputNumber min={0} max={40} style={{ width: '100%', height: 32 }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="专属二维码设置"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="showQrCode" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) =>
                  prev.showQrCode !== curr.showQrCode ||
                  prev.qrCode !== curr.qrCode ||
                  prev.qrBadge !== curr.qrBadge ||
                  prev.qrSize !== curr.qrSize ||
                  prev.qrCodeTip !== curr.qrCodeTip
                }
              >
                {({ getFieldValue }) => {
                  const showQrCode = getFieldValue('showQrCode') ?? true;
                  if (!showQrCode) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        二维码展示已关闭，前台将以纯文本/图标列表形式呈现联系渠道
                      </div>
                    );
                  }

                  const rawCode = (getFieldValue('qrCode') || 'https://nocobase.com').trim();
                  const qrBadge = getFieldValue('qrBadge') || '企业微信';
                  const qrTip = getFieldValue('qrCodeTip') || '扫码添加专属客服企业微信';
                  const isImg =
                    rawCode.startsWith('data:image/') ||
                    /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(rawCode) ||
                    rawCode.includes('/api/attachments/') ||
                    rawCode.includes('/storage/uploads/');

                  return (
                    <>
                      {/* 实时渲染微预览看板 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: 14,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          border: '1px solid #e2e8f0',
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            padding: 8,
                            background: '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                            flexShrink: 0,
                          }}
                        >
                          {qrBadge && (
                            <div
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                background: '#1677ff',
                                color: '#ffffff',
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 8,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                zIndex: 2,
                              }}
                            >
                              {qrBadge}
                            </div>
                          )}
                          {isImg ? (
                            <Image
                              src={rawCode}
                              width={84}
                              height={84}
                              style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                              preview={{ mask: '放大查看' }}
                            />
                          ) : (
                            <div style={{ width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <QRCode value={rawCode} size={84} bordered={false} errorLevel="M" />
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                              📱 二维码实时微预览 (所见即所得)
                            </span>
                            <Tag color={isImg ? 'cyan' : 'blue'} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}>
                              {isImg ? '自定义图片' : '纯前端矢量引擎'}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, wordBreak: 'break-all' }}>
                            {qrTip}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                            模式：{isImg ? '展示本地上传海报/图片' : '实时生成高清无损矢量二维码'}
                          </div>
                        </div>
                      </div>

                      <Form.Item name="qrBadge" label="二维码角标胶囊" initialValue="企业微信" style={{ marginBottom: 8 }}>
                        <Input placeholder="例如：企业微信、微信扫码、商务咨询" style={{ height: 32 }} />
                      </Form.Item>
                      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {['企业微信', '微信扫码', '商务咨询', '技术顾问', '官方社群'].map((text) => (
                          <Tag
                            key={text}
                            color="blue"
                            style={{ cursor: 'pointer' }}
                            onClick={() => form.setFieldsValue({ qrBadge: text })}
                          >
                            + {text}
                          </Tag>
                        ))}
                      </div>

                      <Form.Item name="qrCode" label="二维码内容或图片 (支持输入网址/文本纯本地矢量生成，或上传图片)" style={{ marginBottom: 12 }}>
                        <ImageInputWithUpload placeholder="输入网址/文本自动生成二维码，或上传二维码图片" />
                      </Form.Item>

                      <div style={{ marginBottom: 14, background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 12, color: '#64748b' }}>
                            ⚡ 常用目标网址快捷填入：
                          </Text>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {[
                            { label: '🏢 公司官网', url: 'https://nocobase.com' },
                            { label: '💬 企微客服', url: 'https://work.weixin.qq.com' },
                            { label: '⚡ 售后工单', url: 'https://support.nocobase.com' },
                            { label: '🚀 预约演示', url: 'https://nocobase.com/demo' },
                          ].map((it) => (
                            <Button
                              key={it.label}
                              size="small"
                              onClick={() => {
                                form.setFieldsValue({ qrCode: it.url });
                                message.success(`已填入【${it.label}】网址`);
                              }}
                            >
                              {it.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item name="qrSize" label="二维码尺寸" initialValue="medium" style={{ marginBottom: 0 }}>
                            <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                              <Radio.Button value="small" style={{ flex: 1, textAlign: 'center' }}>小 (88px)</Radio.Button>
                              <Radio.Button value="medium" style={{ flex: 1, textAlign: 'center' }}>中 (112px)</Radio.Button>
                              <Radio.Button value="large" style={{ flex: 1, textAlign: 'center' }}>大 (136px)</Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="qrCodeTip" label="二维码下方说明" initialValue="扫码添加专属客服企业微信" style={{ marginBottom: 0 }}>
                            <Input placeholder="例如：扫码添加专属客服企业微信" style={{ height: 32 }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  );
                }}
              </Form.Item>
            </Card>

            <Card
              title="多渠道联系方式管理"
              size="small"
              extra={
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  支持拨号、发信、外链、复制等丰富交互
                </span>
              }
            >
              <Form.List name="contactItems">
                {(fields, { add, remove, move }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => {
                      const currentItem = form.getFieldValue(['contactItems', name]) || {};
                      const actionType = currentItem.action || 'none';
                      const actionTagMap: Record<string, { label: string; color: string }> = {
                        tel: { label: '拨号', color: 'blue' },
                        mailto: { label: '发信', color: 'green' },
                        url: { label: '外链', color: 'purple' },
                        copy: { label: '复制', color: 'orange' },
                        none: { label: '展示', color: 'default' },
                      };
                      const tagInfo = actionTagMap[actionType] || actionTagMap.none;

                      let valuePlaceholder = '例如：400-888-9999 或 support@example.com';
                      if (actionType === 'tel') valuePlaceholder = '输入拨号电话号码，例如：400-888-9999';
                      else if (actionType === 'mailto') valuePlaceholder = '输入接收邮箱地址，例如：support@nocobase.com';
                      else if (actionType === 'url') valuePlaceholder = '输入跳转网址，例如：https://support.nocobase.com';
                      else if (actionType === 'copy') valuePlaceholder = '输入一键复制的微信号/群号，例如：NocoBase_VIP';

                      return (
                        <div
                          key={key}
                          style={{
                            padding: 12,
                            marginBottom: 12,
                            borderRadius: 8,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>
                                渠道 #{index + 1}
                              </span>
                              {currentItem.label && (
                                <span style={{ fontSize: 12, color: '#64748b' }}>
                                  ({currentItem.label})
                                </span>
                              )}
                              <Tag color={tagInfo.color} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}>
                                {tagInfo.label}
                              </Tag>
                            </div>
                            <Space size="small">
                              {index > 0 && (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<ArrowUpOutlined />}
                                  onClick={() => move(index, index - 1)}
                                />
                              )}
                              {index < fields.length - 1 && (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<ArrowDownOutlined />}
                                  onClick={() => move(index, index + 1)}
                                />
                              )}
                              {fields.length > 1 && (
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(name)}
                                />
                              )}
                            </Space>
                          </div>

                          <Row gutter={12} style={{ marginBottom: 12 }}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'icon']}
                                label="图标选择 (支持官方库/自定义图标)"
                                initialValue="PhoneOutlined"
                                rules={[{ required: true, message: '请选择图标' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <ContactChannelIconPicker />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'color']}
                                label="图标高光色"
                                style={{ marginBottom: 0 }}
                              >
                                <ColorSelectInput placeholder="默认主题高光" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Row gutter={12} style={{ marginBottom: 12 }}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'label']}
                                label="标签名称"
                                rules={[{ required: true, message: '请输入标签' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input placeholder="如：服务热线、技术邮箱" style={{ height: 32 }} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'action']}
                                label="交互行为"
                                initialValue="none"
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  style={{ height: 32 }}
                                  options={[
                                    { label: '无动作 (纯展示)', value: 'none' },
                                    { label: '点击拨号 (tel:)', value: 'tel' },
                                    { label: '点击发信 (mailto:)', value: 'mailto' },
                                    { label: '点击打开链接 (url)', value: 'url' },
                                    { label: '点击一键复制 (copy)', value: 'copy' },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            label="内容 / 号码 / 网址"
                            rules={[{ required: true, message: '请输入内容' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder={valuePlaceholder} style={{ height: 32 }} />
                          </Form.Item>
                        </div>
                      );
                    })}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'PhoneOutlined', label: '咨询热线', value: '400-888-9999', action: 'tel', color: '#69b1ff' })}
                      >
                        + 电话热线
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'MailOutlined', label: '技术邮箱', value: 'support@nocobase.com', action: 'mailto', color: '#95de64' })}
                      >
                        + 支持邮箱
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'LinkOutlined', label: '在线工单', value: 'https://support.nocobase.com', action: 'url', color: '#b37feb' })}
                      >
                        + 网址/工单
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'WechatOutlined', label: '客服微信', value: 'NocoBase_Help', action: 'copy', color: '#52c41a' })}
                      >
                        + 客服微信 (一键复制)
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'ClockCircleOutlined', label: '服务时段', value: '周一至周日 9:00 - 21:00', action: 'none', color: '#ffd666' })}
                      >
                        + 服务时间
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => add({ icon: 'EnvironmentOutlined', label: '办公地址', value: '上海市浦东新区张江高科技园区', action: 'none', color: '#ff7875' })}
                      >
                        + 线下地址
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'CustomLanguageBlockModel':
        return (
          <>
            <Card title="外观与对齐" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="mode" label="呈现形式" initialValue="pills" style={{ marginBottom: 0 }}>
                    <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                      <Radio.Button value="pills" style={{ flex: 1, textAlign: 'center' }}>胶囊药丸 (Pills)</Radio.Button>
                      <Radio.Button value="select" style={{ flex: 1, textAlign: 'center' }}>下拉选择 (Select)</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="align" label="对齐方式" initialValue="right" style={{ marginBottom: 0 }}>
                    <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                      <Radio.Button value="left" style={{ flex: 1, textAlign: 'center' }}>居左</Radio.Button>
                      <Radio.Button value="center" style={{ flex: 1, textAlign: 'center' }}>居中</Radio.Button>
                      <Radio.Button value="right" style={{ flex: 1, textAlign: 'center' }}>居右 (推荐)</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="语言列表选项"
              size="small"
              extra={
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                  前台按此顺序依次展示切换项
                </span>
              }
            >
              <Form.List
                name="languages"
                initialValue={[
                  { label: '简体中文', value: 'zh-CN' },
                  { label: 'English', value: 'en-US' },
                  { label: '繁體中文', value: 'zh-TW' },
                  { label: '日本語', value: 'ja-JP' },
                ]}
              >
                {(fields, { add, remove }) => (
                  <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                      <span style={{ flex: 1, fontSize: 12, color: '#64748b', fontWeight: 500 }}>显示名称 (Label)</span>
                      <span style={{ flex: 1, fontSize: 12, color: '#64748b', fontWeight: 500 }}>语言代码 (Code)</span>
                      <span style={{ width: 32 }} />
                    </div>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'label']}
                          rules={[{ required: true, message: '请输入显示名称' }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input placeholder="例如：简体中文" style={{ height: 32 }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: '请输入代码' }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input placeholder="例如：zh-CN" style={{ height: 32 }} />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ height: 32, width: 32, padding: 0 }}
                          />
                        ) : (
                          <div style={{ width: 32 }} />
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#8c8c8c', alignSelf: 'center' }}>快速添加：</span>
                      {[
                        { label: '简体中文', value: 'zh-CN' },
                        { label: 'English', value: 'en-US' },
                        { label: '繁體中文', value: 'zh-TW' },
                        { label: '日本語', value: 'ja-JP' },
                        { label: '한국어', value: 'ko-KR' },
                      ].map((item) => (
                        <Tag
                          key={item.value}
                          color="blue"
                          style={{ cursor: 'pointer' }}
                          onClick={() => add(item)}
                        >
                          + {item.label}
                        </Tag>
                      ))}
                    </div>
                    <Button
                      type="dashed"
                      onClick={() => add({ label: '', value: '' })}
                      block
                      icon={<PlusOutlined />}
                      style={{ height: 32 }}
                    >
                      自定义添加语言
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </>
        );

      case 'CustomCountdownBlockModel':
        return (
          <>
            <Card title="活动标语与文案排版" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="badge" label="胶囊徽标" initialValue="🔥 架构升级盛典" style={{ marginBottom: 8 }}>
                <Input placeholder="例如：🔥 架构升级盛典" style={{ height: 32 }} />
              </Form.Item>
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['🔥 架构升级盛典', '🚀 重磅全球公测', '🎉 限时尊享体验', '⚡ 全新功能发布', '✨ 官方公测盛典'].map((text) => (
                  <Tag
                    key={text}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => form.setFieldsValue({ badge: text })}
                  >
                    + {text}
                  </Tag>
                ))}
              </div>

              <Form.Item label="活动大标题" required style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item name="title" noStyle required initialValue="NocoBase 企业数字化中枢 V3.0 全球公测">
                    <Input
                      placeholder="输入活动主标题"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.titleColor !== curr.titleColor || prev.titleFontSize !== curr.titleFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('titleColor')}
                        onColorChange={(c) => setFieldsValue({ titleColor: c })}
                        fontSize={getFieldValue('titleFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ titleFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (22px)', value: '' },
                          { label: '18px', value: 18 },
                          { label: '20px', value: 20 },
                          { label: '22px (标准)', value: 22 },
                          { label: '26px (醒目)', value: 26 },
                          { label: '30px (特大)', value: 30 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="titleColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="titleFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item label="活动宣传描述" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                  <Form.Item
                    name="description"
                    noStyle
                    initialValue="距离全新一代零代码业务引擎正式发布仅剩最后冲刺时间，立即预约获取专属体验席位！"
                  >
                    <Input
                      placeholder="输入活动宣传说明"
                      style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                    />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.descColor !== curr.descColor || prev.descFontSize !== curr.descFontSize}
                  >
                    {({ getFieldValue, setFieldsValue }) => (
                      <InlineTextStyleFormatter
                        color={getFieldValue('descColor')}
                        onColorChange={(c) => setFieldsValue({ descColor: c })}
                        fontSize={getFieldValue('descFontSize')}
                        onFontSizeChange={(s) => setFieldsValue({ descFontSize: s })}
                        defaultSizeLabel="默认"
                        fontSizeOptions={[
                          { label: '默认 (14px)', value: '' },
                          { label: '12px', value: 12 },
                          { label: '13px', value: 13 },
                          { label: '14px (标准)', value: 14 },
                          { label: '15px (清晰)', value: 15 },
                          { label: '16px (醒目)', value: 16 },
                        ]}
                      />
                    )}
                  </Form.Item>
                  <Form.Item name="descColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                  <Form.Item name="descFontSize" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                </div>
              </Form.Item>

              <Form.Item name="align" label="排版布局方式" initialValue="left" style={{ marginBottom: 0 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button value="left" style={{ flex: 1, textAlign: 'center' }}>经典左文案右按钮</Radio.Button>
                  <Radio.Button value="center" style={{ flex: 1, textAlign: 'center' }}>大气居中对称看板</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Card>

            <Card title="卡片主题与视觉质感" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="cardTheme" label="主题风格预设" initialValue="purple" style={{ marginBottom: 14 }}>
                <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="purple">🌌 星际紫夜 (科技蓝紫渐变，微光发光)</Radio>
                    <Radio value="cyan">🌊 极光青碧 (科技翡翠通透，清新灵动)</Radio>
                    <Radio value="sunset">🔥 熔岩落霞 (炽热赤金渐变，极高关注度)</Radio>
                    <Radio value="obsidian">🌑 深空曜黑 (黑曜石磨砂科技，沉稳高级)</Radio>
                    <Radio value="glass">💎 纯澈晶钻 (轻盈高透毛玻璃，与壁纸完美融合)</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="digitBg" label="翻牌器卡片背景色" initialValue="rgba(15, 23, 42, 0.55)" style={{ marginBottom: 0 }}>
                    <ColorSelectInput placeholder="例如：rgba(15, 23, 42, 0.55)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="digitColor" label="翻牌器数字颜色" initialValue="#ffffff" style={{ marginBottom: 0 }}>
                    <ColorSelectInput placeholder="例如：#ffffff 或 #67e8f9" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="倒计时时间与状态设置"
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Form.Item name="showSeconds" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="显示秒数" unCheckedChildren="隐藏秒数" />
                </Form.Item>
              }
            >
              <Form.Item
                name="targetDate"
                label="目标截止时间 (ISO 或标准时间字符串)"
                initialValue={new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')}
                help="格式：YYYY-MM-DD HH:mm:ss 或 ISO 格式"
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="例如：2026-10-01 00:00:00" style={{ height: 32 }} />
              </Form.Item>

              <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>快捷预设：</span>
                {[
                  { label: '+3天', days: 3 },
                  { label: '+7天 (一周)', days: 7 },
                  { label: '+15天 (半月)', days: 15 },
                  { label: '+30天 (一月)', days: 30 },
                ].map((item) => (
                  <Button
                    key={item.label}
                    size="small"
                    onClick={() => {
                      const d = new Date(Date.now() + item.days * 24 * 3600 * 1000);
                      const str = d.toISOString().slice(0, 19).replace('T', ' ');
                      form.setFieldsValue({ targetDate: str });
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              <Form.Item name="endNotice" label="倒计时到期后提示文案" initialValue="🎉 活动现已全面开启，欢迎体验！" style={{ marginBottom: 0 }}>
                <Input placeholder="活动结束后的提示信息" style={{ height: 32 }} />
              </Form.Item>
            </Card>

            <Card
              title="行动呼吁按钮 (CTA)"
              size="small"
              extra={
                <Form.Item name="showButton" noStyle valuePropName="checked" initialValue={true}>
                  <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                </Form.Item>
              }
            >
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.showButton !== curr.showButton}
              >
                {({ getFieldValue }) => {
                  const showButton = getFieldValue('showButton') ?? true;
                  if (!showButton) {
                    return (
                      <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
                        行动呼吁按钮已关闭，倒计时看板将不显示跳转操作按钮
                      </div>
                    );
                  }
                  return (
                    <>
                      <Form.Item label="按钮文案" style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                          <Form.Item name="buttonText" noStyle initialValue="立即预约席位">
                            <Input
                              placeholder="例如：立即预约席位 / 立即进入体验"
                              style={{ flex: 1, borderRadius: '6px 0 0 6px', height: 32 }}
                            />
                          </Form.Item>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, curr) => prev.buttonColor !== curr.buttonColor}
                          >
                            {({ getFieldValue: gfv, setFieldsValue }) => (
                              <InlineTextStyleFormatter
                                color={gfv('buttonColor') || '#1677ff'}
                                onColorChange={(c) => setFieldsValue({ buttonColor: c })}
                                defaultSizeLabel="默认"
                              />
                            )}
                          </Form.Item>
                          <Form.Item name="buttonColor" noStyle style={{ display: 'none' }}><Input type="hidden" /></Form.Item>
                        </div>
                      </Form.Item>
                      <Row gutter={12}>
                        <Col span={14}>
                          <Form.Item name="buttonUrl" label="跳转链接 URL" initialValue="https://nocobase.com" style={{ marginBottom: 0 }}>
                            <Input prefix={<LinkOutlined style={{ color: '#94a3b8' }} />} placeholder="例如：https://nocobase.com 或 /invite" style={{ height: 32 }} />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item name="buttonTarget" label="打开方式" initialValue="_blank" style={{ marginBottom: 0 }}>
                            <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                              <Radio.Button value="_blank" style={{ flex: 1, textAlign: 'center' }}>新标签</Radio.Button>
                              <Radio.Button value="_self" style={{ flex: 1, textAlign: 'center' }}>当前窗口</Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  );
                }}
              </Form.Item>
            </Card>
          </>
        );

      default:
        return (
          <Card title="通用区块参数" size="small">
            <Text type="secondary">当前区块为标准原生区块，可通过下方键值对形式调整 props 参数。</Text>
            <Form.Item name="title" label="标题" style={{ marginTop: 16 }}>
              <Input placeholder="输入标题" />
            </Form.Item>
          </Card>
        );
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <span style={{ fontWeight: 600 }}>{getBlockTitle()}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={Math.min(620, typeof window !== 'undefined' ? Math.max(540, window.innerWidth * 0.92) : 600)}
      styles={{
        body: { paddingBottom: 64, background: '#fafafa' },
        header: { borderBottom: '1px solid #f0f0f0', padding: '12px 20px' },
      }}
      extra={
        <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
          确认生效
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {renderFieldsByBlockType()}
      </Form>
    </Drawer>
  );
};

let singletonRoot: Root | null = null;
let singletonContainer: HTMLElement | null = null;

export const openBlockContentEditor = (model: any, onSave?: () => void) => {
  if (typeof window === 'undefined' || !model) return;
  (window as any).__current_editing_model__ = model;

  // 1. 优先分发自定义事件（若已有页面级抽屉监听处理，则交由其打开）
  let isHandled = false;
  const event = new CustomEvent('open-block-editor', {
    detail: {
      model,
      markHandled: () => {
        isHandled = true;
      },
    },
    cancelable: true,
  });
  window.dispatchEvent(event);

  if (isHandled) return;

  // 2. 否则通过全局单例 Root 动态挂载抽屉
  if (!singletonContainer) {
    singletonContainer = document.createElement('div');
    singletonContainer.id = 'custom-block-editor-singleton-root';
    document.body.appendChild(singletonContainer);
  }

  if (!singletonRoot) {
    singletonRoot = createRoot(singletonContainer);
  }

  const handleClose = () => {
    renderDrawer(false);
    setTimeout(() => {
      if (singletonRoot) {
        singletonRoot.unmount();
        singletonRoot = null;
      }
      if (singletonContainer && singletonContainer.parentNode) {
        singletonContainer.parentNode.removeChild(singletonContainer);
        singletonContainer = null;
      }
    }, 350);
  };

  const handleSave = () => {
    if (typeof onSave === 'function') {
      onSave();
    }
    if (typeof model?.rerender === 'function') {
      model.rerender();
    }
    if (typeof model?.refresh === 'function') {
      model.refresh();
    }
  };

  const renderDrawer = (isOpen: boolean) => {
    singletonRoot?.render(
      <BlockContentEditorDrawer
        open={isOpen}
        model={model}
        onClose={handleClose}
        onSave={handleSave}
      />
    );
  };

  renderDrawer(true);
};

if (typeof window !== 'undefined') {
  (window as any).__openBlockContentEditor__ = openBlockContentEditor;
}

export default BlockContentEditorDrawer;
