import React from 'react';
import { BlockModel, Icon } from '@nocobase/client-v2';
import { openBlockContentEditor } from '../components/openBlockEditor';
import { tExpr } from '../locale';
import { CUSTOM_BLOCK_MENU_CHILDREN } from './customBlockMenuItems';
import {
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
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  WechatOutlined,
  DingdingOutlined,
  CopyOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  MessageOutlined,
} from '@ant-design/icons';

// 丰富的图标字典映射（兜底降级）
export const ICON_MAP: Record<string, React.ReactNode> = {
  RocketOutlined: <RocketOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
  CloudServerOutlined: <CloudServerOutlined />,
  BulbOutlined: <BulbOutlined />,
  TeamOutlined: <TeamOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  StarOutlined: <StarOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  SettingOutlined: <SettingOutlined />,
  CompassOutlined: <CompassOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  AuditOutlined: <AuditOutlined />,
  SecurityScanOutlined: <SecurityScanOutlined />,
  PhoneOutlined: <PhoneOutlined />,
  MailOutlined: <MailOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  WechatOutlined: <WechatOutlined />,
  DingdingOutlined: <DingdingOutlined />,
  CopyOutlined: <CopyOutlined />,
  LinkOutlined: <LinkOutlined />,
  EnvironmentOutlined: <EnvironmentOutlined />,
  QrcodeOutlined: <QrcodeOutlined />,
  MessageOutlined: <MessageOutlined />,
};

// 图标渲染函数：全面优先支持「自定义图标」插件（草莓/Lucide/用户SVG/复合样式）与官方 1152+ 图标
export const renderCustomOrOfficialIcon = (iconName: string, color?: string, fontSize = 28) => {
  if (!iconName) {
    return <RocketOutlined style={{ color: color || '#1677ff', fontSize }} />;
  }

  // 1. 若使用了自定义图标插件支持的 ? 复合样式，动态解析其内嵌高光色与尺寸
  let finalColor = color || '#1677ff';
  let finalSize = fontSize;
  let cleanName = iconName;

  if (typeof iconName === 'string' && iconName.includes('?')) {
    try {
      const [base, query] = iconName.split('?');
      cleanName = base;
      const params = new URLSearchParams(query);
      if (params.get('color')) {
        finalColor = params.get('color')!;
      }
      if (params.get('size')) {
        const parsedSize = parseInt(params.get('size')!, 10);
        if (!isNaN(parsedSize) && parsedSize > 0) {
          finalSize = parsedSize;
        }
      }
    } catch (e) {}
  }

  // 2. 优先使用已被自定义图标插件注入与代理的宿主 Icon 组件（支持所有自定义 SVG、草莓图标与官方图标）
  const c2 = typeof window !== 'undefined' ? (window as any).__nocobase_app_dev_deps__?.['@nocobase/client-v2'] : null;
  const DynamicIcon = c2?.Icon || Icon;

  if (DynamicIcon) {
    try {
      return (
        <DynamicIcon
          type={iconName}
          style={{ color: finalColor, fontSize: finalSize }}
        />
      );
    } catch (e) {
      // 容错重试：若原带参标识在底层未命中，使用 cleanName 再次渲染
      try {
        return (
          <DynamicIcon
            type={cleanName}
            style={{ color: finalColor, fontSize: finalSize }}
          />
        );
      } catch (e2) {}
    }
  }

  // 3. 兜底降级：如果动态渲染不可用，从静态 ICON_MAP 中寻找，或者默认火箭图标
  const FallbackIcon = ICON_MAP[cleanName] || ICON_MAP[iconName] || <RocketOutlined />;
  return <span style={{ color: finalColor, fontSize: finalSize, display: 'inline-flex', alignItems: 'center' }}>{FallbackIcon}</span>;
};

export const renderOfficialIcon = renderCustomOrOfficialIcon;

/* ==========================================================================
   登录页专属区块统一基类 (CustomLoginBlockModel)
   所有登录页定制区块均继承此基类，从而在创建区块菜单中全部分组在同一个专属菜单项/分类内
   ========================================================================== */
export class CustomLoginBlockModel extends BlockModel {
  async openFlowSettings(options?: any) {
    if (options?.stepKey === 'editBlockContent' || options?.flowKey === 'customBlockSettings') {
      openBlockContentEditor(this);
      return true;
    }
    return super.openFlowSettings(options);
  }
}

// 遵循 NocoBase 官方 FlowEngine 标准区块规范，原生注册内容配置 Flow
CustomLoginBlockModel.registerFlow({
  key: 'customBlockSettings',
  title: tExpr('Content configuration'),
  steps: {
    editBlockContent: {
      title: tExpr('Edit block content'),
      uiMode: 'drawer',
      uiSchema: {
        _content: {
          type: 'void',
        },
      },
    },
  },
});

CustomLoginBlockModel.define({
  label: tExpr('Login page blocks'),
  sort: 100,
  children: () => CUSTOM_BLOCK_MENU_CHILDREN,
});
