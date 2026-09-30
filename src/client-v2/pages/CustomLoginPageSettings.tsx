import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  Radio,
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  message,
  theme,
  Alert,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Divider,
  Spin,
  Segmented,
  Tag,
  Upload,
} from 'antd';
import {
  SaveOutlined,
  ToolOutlined,
  BgColorsOutlined,
  EyeOutlined,
  ReloadOutlined,
  AlertOutlined,
  DownloadOutlined,
  UploadOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useApp } from '@nocobase/client-v2';
import { useFlowEngine } from '@nocobase/flow-engine';
import { reaction } from '@formily/reactive';
import { useT } from '../locale';
import { CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY } from '../constants';
import { CustomLoginContainer } from '../components/CustomLoginContainer';
import { LoginPageBlockGridCanvasRef, DEFAULT_PRESET_GRID_SCHEMA } from '../components/LoginPageBlockGridCanvas';
import { BlockContentEditorDrawer } from '../components/BlockContentEditorDrawer';
import { CustomLoginConfig, CanvasWidthMode, ContainerStyle } from '../types';

// 精选预设主题
const THEME_PRESETS = [
  {
    key: 'tech-navy',
    name: 'Classic Tech Navy (Transparent)',
    desc: 'Deep high-end tech gradient, seamless with full-screen canvas',
    type: 'gradient' as const,
    val: 'linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%)',
    container: 'transparent' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #0a192f 0%, #203a43 100%)',
  },
  {
    key: 'minimal-light-card',
    name: 'Minimal Light Business (Light Card)',
    desc: 'Pure white modern card with subtle soft blue-gray gradient background',
    type: 'gradient' as const,
    val: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    container: 'card' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
  },
  {
    key: 'ocean-moon-card',
    name: 'Ocean Moon (Deep Blue + White Card)',
    desc: 'Calm deep ocean blue gradient background highlighting pure white card',
    type: 'gradient' as const,
    val: 'linear-gradient(135deg, #09203f 0%, #1e3c72 50%, #2a5298 100%)',
    container: 'card' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #09203f 0%, #2a5298 100%)',
  },
  {
    key: 'obsidian-dark-card',
    name: 'Obsidian Dark Cyber (Dark Card)',
    desc: 'Deep space black textured card with tech midnight aesthetics',
    type: 'gradient' as const,
    val: 'linear-gradient(135deg, #0b0f19 0%, #0f172a 50%, #1e293b 100%)',
    container: 'dark-card' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)',
  },
  {
    key: 'aurora-glass',
    name: 'Aurora Frosted Glass',
    desc: 'Cutting-edge modern stream of light with translucent frosted glass',
    type: 'gradient' as const,
    val: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    container: 'glass' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
  },
  {
    key: 'bing-daily',
    name: 'Bing Daily HD Scenery',
    desc: 'Automatically fetches daily global high-definition scenery wallpaper',
    type: 'image' as const,
    val: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
    container: 'transparent' as ContainerStyle,
    previewBg: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  },
];

const DEFAULT_CONFIG: CustomLoginConfig = {
  enabled: true,
  template: 'split',
  canvasWidth: 'wide',
  containerStyle: 'transparent',
  customBlocks: [],
  gridSchema: DEFAULT_PRESET_GRID_SCHEMA,
  themeConfig: {
    brandTitle: 'NocoBase 数字化协同平台',
    brandSubtitle: '企业级无代码应用构建与协同中心',
    brandLogo: '',
    brandPosterUrl: '',
    primaryColor: '#1677ff',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%)',
    copyright: 'Copyright © 2026 NocoBase. All rights reserved.',
    icp: '',
  },
};

export const CustomLoginPageSettings: React.FC = () => {
  const t = useT();
  const app = useApp();
  const flowEngine = useFlowEngine();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const canvasRef = useRef<LoginPageBlockGridCanvasRef>(null);
  const writePending = useRef(false);
  const editRevision = useRef(0);

  const [config, setConfig] = useState<CustomLoginConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'dirty' | 'error'>('saved');
  const stopObservingCanvas = useRef<(() => void) | undefined>();
  const [configKey, setConfigKey] = useState(1);
  const [designMode, setDesignMode] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // 区块专属内容编辑抽屉状态 (提升到页面顶层，杜绝嵌套渲染丢失)
  const [blockEditorOpen, setBlockEditorOpen] = useState(false);
  const [editingBlockModel, setEditingBlockModel] = useState<any>(null);

  const markDirty = React.useCallback(() => {
    editRevision.current += 1;
    setSaveStatus('dirty');
  }, []);

  // Track native drag/resize/add/remove operations as well as block property edits.
  const handleCanvasReady = React.useCallback((model: any) => {
    stopObservingCanvas.current?.();
    stopObservingCanvas.current = reaction(() => JSON.stringify(model.serialize()), markDirty);
  }, [markDirty]);
  useEffect(() => () => stopObservingCanvas.current?.(), []);

  useEffect(() => {
    if (saveStatus === 'saved') return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [saveStatus]);

  // 监听 open-block-editor 事件，在顶层稳定弹出抽屉
  useEffect(() => {
    const handleOpenBlockEditor = (e: any) => {
      if (e.detail?.model) {
        e.detail?.markHandled?.();
        setEditingBlockModel(e.detail.model);
        setBlockEditorOpen(true);
      }
    };
    window.addEventListener('open-block-editor', handleOpenBlockEditor);
    return () => {
      window.removeEventListener('open-block-editor', handleOpenBlockEditor);
    };
  }, []);

  const safeParseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val === 'object' && val !== null) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' && parsed !== null ? parsed : fallback;
      } catch (e) {
        return fallback;
      }
    }
    return fallback;
  };

  // 加载服务端配置
  const fetchConfig = async () => {
    setLoading(true);
    setLoadError(false);
    setConfigLoaded(false);
    try {
      const res = await app.apiClient.request({
        url: 'customLoginPage:getConfig',
      });
      const data = res?.data?.data || res?.data;
      if (!data || typeof data.enabled !== 'boolean') throw new Error('Invalid configuration response');
      if (data) {
        const parsedGridSchema = safeParseJson(data.gridSchema, DEFAULT_PRESET_GRID_SCHEMA);
        const parsedThemeConfig = safeParseJson(data.themeConfig, DEFAULT_CONFIG.themeConfig);
        const parsedCustomBlocks = safeParseJson(data.customBlocks, []);

        const merged: CustomLoginConfig = {
          enabled: data.enabled ?? true,
          template: data.template || 'split',
          canvasWidth: data.canvasWidth || 'wide',
          containerStyle: data.containerStyle || 'transparent',
          customBlocks: parsedCustomBlocks,
          gridSchema: parsedGridSchema,
          themeConfig: {
            ...DEFAULT_CONFIG.themeConfig,
            ...parsedThemeConfig,
          },
        };
        setConfig(merged);
        form.setFieldsValue(merged);
        setConfigKey((k) => k + 1);
        setSaveStatus('saved');
        setConfigLoaded(true);
      }
    } catch (err: any) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // 联动激活 FlowEngine 设计态
  useEffect(() => {
    try {
      if (designMode) {
        flowEngine?.flowSettings?.enable?.();
      } else {
        flowEngine?.flowSettings?.disable?.();
      }
    } catch (e) {
      // 容错
    }
  }, [designMode, flowEngine]);

  // 切换自定义登录页是否全局生效（自动持久化并给出即时反馈）
  const handleToggleEnabled = async (checked: boolean) => {
    if (!configLoaded || writePending.current) return;
    writePending.current = true;
    setSwitchLoading(true);

    try {
      await app.apiClient.request({
        url: 'customLoginPage:saveConfig',
        method: 'post',
        data: { enabled: checked },
      });
      setConfig((current) => {
        const next = { ...current, enabled: checked };
        try {
          localStorage.setItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      form.setFieldsValue({ enabled: checked });
      if (checked) {
        message.success(t('Custom login page is now enabled and in effect!'));
      } else {
        message.warning(t('Custom login page is disabled. Front-end will display native login page.'));
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || t('Failed to update status'));
    } finally {
      writePending.current = false;
      setSwitchLoading(false);
    }
  };

  // 保存全局配置
  const handleSaveGlobalConfig = async () => {
    if (writePending.current) return;
    if (!configLoaded) {
      message.warning(t('Configuration is loading, please wait before saving'));
      return;
    }
    writePending.current = true;
    setSaving(true);
    try {
      const formValues = drawerVisible ? await form.validateFields() : {};
      const serializedGrid = canvasRef.current?.serialize?.();
      if (!serializedGrid) throw new Error(t('Canvas is not ready. Please retry.'));

      const payload: CustomLoginConfig = {
        ...config,
        ...formValues,
        gridSchema: serializedGrid || config.gridSchema || DEFAULT_PRESET_GRID_SCHEMA,
        themeConfig: {
          ...config.themeConfig,
          ...(formValues.themeConfig || {}),
        },
      };

      const revision = editRevision.current;
      // The enable switch has its own partial save; appearance saves must not undo it.
      const { enabled: _enabled, ...appearance } = payload;
      await app.apiClient.request({
        url: 'customLoginPage:saveConfig',
        method: 'post',
        data: appearance,
      });

      // 同步刷新本地 SWR 缓存
      try {
        localStorage.setItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY, JSON.stringify(payload));
      } catch (e) {}

      // Edits made while the request was in flight must remain visible and unsaved.
      setSaveStatus(editRevision.current === revision ? 'saved' : 'dirty');
      message.success(t('Configuration saved successfully'));
      if (editRevision.current === revision) setDrawerVisible(false);
    } catch (err: any) {
      setSaveStatus('error');
      message.error(err?.response?.data?.message || err?.message || t('Failed to save configuration'));
    } finally {
      writePending.current = false;
      setSaving(false);
    }
  };

  // 导出配置文件
  const handleExportConfig = () => {
    try {
      const serializedGrid = canvasRef.current?.serialize?.() || config.gridSchema || DEFAULT_PRESET_GRID_SCHEMA;
      const exportData = {
        name: 'NocoBase Custom Login Page Config',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        config: {
          ...config,
          gridSchema: serializedGrid,
        },
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-login-page-config-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success(t('Configuration exported successfully'));
    } catch (err: any) {
      message.error(t('Failed to export configuration'));
    }
  };

  // 导入配置文件
  const handleImportConfig = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedConfig = parsed.config || parsed;
        if (!importedConfig || typeof importedConfig !== 'object') {
          throw new Error('Invalid config format');
        }
        const newConfig: CustomLoginConfig = {
          ...config,
          ...importedConfig,
          gridSchema: importedConfig.gridSchema || config.gridSchema || DEFAULT_PRESET_GRID_SCHEMA,
          themeConfig: {
            ...config.themeConfig,
            ...(importedConfig.themeConfig || {}),
          },
        };
        setConfig(newConfig);
        form.setFieldsValue(newConfig);
        setConfigKey((k) => k + 1);
        markDirty();
        message.success(t('Configuration imported successfully into preview. Click "Save global config" to take effect.'));
      } catch (err: any) {
        message.error(t('Invalid configuration file. Please provide a valid JSON export.'));
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 切换容器质感风格
  const handleContainerStyleChange = (containerStyle: ContainerStyle) => {
    markDirty();
    const updated = { ...config, containerStyle };
    setConfig(updated);
    form.setFieldsValue({ containerStyle });
  };

  // 切换画幅宽度
  const handleWidthChange = (canvasWidth: CanvasWidthMode) => {
    markDirty();
    const updated = { ...config, canvasWidth };
    setConfig(updated);
    form.setFieldsValue({ canvasWidth });
  };

  // 应用精选主题预设
  const handleApplyPresetTheme = (preset: typeof THEME_PRESETS[0]) => {
    markDirty();
    const updated: CustomLoginConfig = {
      ...config,
      containerStyle: preset.container,
      themeConfig: {
        ...config.themeConfig,
        backgroundType: preset.type,
        backgroundValue: preset.val,
      },
    };
    setConfig(updated);
    form.setFieldsValue({
      containerStyle: preset.container,
      themeConfig: {
        backgroundType: preset.type,
        backgroundValue: preset.val,
      },
    });
    message.success(t('Theme preset applied: {{name}}', { name: t(preset.name) }));
  };

  // 重置为经典双列预设区块
  const handleResetPreset = async () => {
    if (!configLoaded || writePending.current) return;
    const resetConfig = {
      ...config,
      gridSchema: DEFAULT_PRESET_GRID_SCHEMA,
    };
    setConfig(resetConfig);
    setConfigKey((key) => key + 1);
    markDirty();
    message.info(t('Preset restored in preview. Save global config to apply.'));
  };

  return (
    <div style={{ padding: '0 0 40px 0', minHeight: 'calc(100vh - 120px)' }}>
      {/* 顶部控制工作台 */}
      <Card
        size="small"
        bordered={false}
        style={{
          marginBottom: 16,
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          background: '#ffffff',
        }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        {/* 第一层：核心工作模式切换与全局操作动作 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            paddingBottom: 12,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* 左侧：全局生效控制开关 + 设计模式/访客实景分段切换器 + 恢复预设 */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {/* 生效控制开关 */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '3px 10px',
                borderRadius: 8,
                background: config.enabled ? '#f6ffed' : '#fffbe6',
                border: `1px solid ${config.enabled ? '#b7eb8f' : '#ffe58f'}`,
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: config.enabled ? '#389e0d' : '#d46b08' }}>
                {t('Custom sign-in page:')}
              </span>
              <Switch
                checked={config.enabled}
                loading={switchLoading}
                disabled={!configLoaded || saving}
                onChange={handleToggleEnabled}
                checkedChildren={t('In effect')}
                unCheckedChildren={t('Disabled')}
                style={{ background: config.enabled ? '#52c41a' : '#d9d9d9' }}
              />
            </div>

            <Divider type="vertical" style={{ height: 22, margin: '0 4px' }} />

            <Segmented
              value={designMode ? 'design' : 'preview'}
              onChange={(val) => setDesignMode(val === 'design')}
              options={[
                {
                  label: (
                    <Tooltip title={t('Switch to design mode (draggable layout, config gear, and add block)')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 6px', fontWeight: designMode ? 600 : 400 }}>
                        <ToolOutlined style={{ color: designMode ? '#1677ff' : undefined }} />
                        {t('Design mode')}
                      </span>
                    </Tooltip>
                  ),
                  value: 'design',
                },
                {
                  label: (
                    <Tooltip title={t('Switch to visitor preview (hide handles and borders, view 1:1 real visitor effect)')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 6px', fontWeight: !designMode ? 600 : 400 }}>
                        <EyeOutlined style={{ color: !designMode ? '#52c41a' : undefined }} />
                        {t('Visitor preview')}
                      </span>
                    </Tooltip>
                  ),
                  value: 'preview',
                },
              ]}
            />

            <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

            <Popconfirm
              title={t('Reset to classic native block preset?')}
              description={t('Will restore to official classic two-column combination (Brand slogan + Enterprise features + Sign-in form). Custom added blocks will be reset.')}
              onConfirm={handleResetPreset}
              okText={t('Confirm reset')}
              cancelText={t('Cancel')}
            >
              <Button disabled={!configLoaded || saving || switchLoading} type="text" size="small" icon={<ReloadOutlined />} style={{ color: '#64748b' }}>
                {t('Reset preset layout')}
              </Button>
            </Popconfirm>
          </div>

          {/* 右侧：导入导出、外观配置、新窗口预览、保存全局配置 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload beforeUpload={handleImportConfig} accept=".json" showUploadList={false}>
              <Tooltip title={t('Import page configuration from a JSON file')}>
                <Button icon={<UploadOutlined />} disabled={!configLoaded || saving} style={{ borderRadius: 6 }}>
                  {t('Import')}
                </Button>
              </Tooltip>
            </Upload>
            <Tooltip title={t('Export current page layout and theme configuration as JSON')}>
              <Button icon={<DownloadOutlined />} disabled={!configLoaded} onClick={handleExportConfig} style={{ borderRadius: 6 }}>
                {t('Export')}
              </Button>
            </Tooltip>
            <Button
              icon={<BgColorsOutlined />}
              disabled={!configLoaded}
              onClick={() => setDrawerVisible(true)}
              style={{ borderRadius: 6 }}
            >
              {t('Appearance & Background Settings')}
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => window.open('/signin', '_blank')}
              style={{ borderRadius: 6 }}
            >
              {t('Open sign-in page')}
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!configLoaded || switchLoading}
              onClick={handleSaveGlobalConfig}
              style={{ borderRadius: 6, boxShadow: '0 2px 6px rgba(22, 119, 255, 0.3)' }}
            >
              {t('Save global config')}
            </Button>
            <Tag aria-live="polite" color={saving ? 'processing' : saveStatus === 'error' ? 'error' : saveStatus === 'dirty' ? 'warning' : 'success'}>
              {t(!configLoaded ? 'Configuration not loaded' : saving ? 'Saving...' : saveStatus === 'dirty' ? 'Unsaved changes' : saveStatus === 'error' ? 'Save failed. Please retry.' : 'Saved')}
            </Tag>
          </div>
        </div>

        {/* 第二层：画幅范围、容器质感 与 实时状态微提示 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: 10,
          }}
        >
          {/* 左侧：画幅宽度与容器质感分段器 */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                {t('Canvas width:')}
              </span>
              <Segmented
                value={config.canvasWidth || 'wide'}
                disabled={!configLoaded}
                onChange={(val) => handleWidthChange(val as CanvasWidthMode)}
                options={[
                  { label: t('Standard (1160px)'), value: 'standard' },
                  { label: t('Wide canvas (1480px)'), value: 'wide' },
                  { label: t('100% Full screen canvas'), value: 'full' },
                ]}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                {t('Container style:')}
              </span>
              <Segmented
                value={config.containerStyle || 'transparent'}
                disabled={!configLoaded}
                onChange={(val) => handleContainerStyleChange(val as ContainerStyle)}
                options={[
                  { label: t('Transparent (Recommended)'), value: 'transparent' },
                  { label: t('Modern frosted glass'), value: 'glass' },
                  { label: t('Classic white card'), value: 'card' },
                  { label: t('Obsidian dark card'), value: 'dark-card' },
                ]}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                {t('Device viewport:')}
              </span>
              <Segmented
                value={viewportMode}
                onChange={(val) => setViewportMode(val as any)}
                options={[
                  {
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <DesktopOutlined />
                        {t('Desktop (100%)')}
                      </span>
                    ),
                    value: 'desktop',
                  },
                  {
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <TabletOutlined />
                        {t('Tablet (768px)')}
                      </span>
                    ),
                    value: 'tablet',
                  },
                  {
                    label: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <MobileOutlined />
                        {t('Mobile (375px)')}
                      </span>
                    ),
                    value: 'mobile',
                  },
                ]}
              />
            </div>
          </div>

          {/* 右侧：轻量化状态指示微胶囊（替代沉重大 Alert） */}
          <div>
            {!config.enabled ? (
              <Tag
                color="warning"
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  margin: 0,
                  lineHeight: '20px',
                  border: '1px solid #ffe58f',
                  background: '#fffbe6',
                  color: '#d46b08',
                }}
              >
                <AlertOutlined />
                <span>{t('Currently disabled: Front-end visitors will see the native system login form. Toggle switch to enable.')}</span>
              </Tag>
            ) : designMode ? (
              <Tag
                color="processing"
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  margin: 0,
                  lineHeight: '20px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                }}
              >
                <ToolOutlined />
                <span>{t('Design mode active: Drag to rearrange layout and resize, click block top-right gear to customize content')}</span>
              </Tag>
            ) : (
              <Tag
                color="success"
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  margin: 0,
                  lineHeight: '20px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  color: '#15803d',
                }}
              >
                <EyeOutlined />
                <span>{t('Visitor preview mode active: 1:1 real visitor effect without edit handles')}</span>
              </Tag>
            )}
          </div>
        </div>
      </Card>

      {/* 当自定义登录页处于未生效/停用状态时，顶部呈现醒目且优雅的安全保障通告条 */}
      {!config.enabled && (
        <Alert
          type="warning"
          showIcon
          banner
          style={{
            marginBottom: 16,
            borderRadius: 12,
            border: '1px solid #ffe58f',
            background: '#fffbe6',
          }}
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ color: '#d46b08', fontSize: 13 }}>
                {t('Custom login page is currently disabled. Front-end visitors accessing /signin will see the native system login page. You can still design and edit below; when ready, turn on the switch above to take effect.')}
              </span>
              <Button
                type="primary"
                size="small"
                loading={switchLoading}
                disabled={!configLoaded || saving}
                onClick={() => handleToggleEnabled(true)}
                style={{ borderRadius: 6, background: '#fa8c16', borderColor: '#fa8c16' }}
              >
                {t('Enable now')}
              </Button>
            </div>
          }
        />
      )}

      {/* 1:1 纯正官方原生区块设计器画布区域 */}
      <div
        className={`custom-login-viewport-wrapper is-viewport-${viewportMode}`}
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: viewportMode === 'mobile' ? 32 : viewportMode === 'tablet' ? 24 : 16,
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          position: 'relative',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          width: viewportMode === 'mobile' ? '375px' : viewportMode === 'tablet' ? '768px' : '100%',
          maxWidth: '100%',
          margin: viewportMode === 'desktop' ? '0' : '24px auto',
          boxShadow:
            viewportMode === 'mobile'
              ? '0 0 0 12px #1e293b, 0 25px 60px rgba(0, 0, 0, 0.5)'
              : viewportMode === 'tablet'
              ? '0 0 0 10px #1e293b, 0 20px 50px rgba(0, 0, 0, 0.45)'
              : '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        {loadError ? (
          <Alert
            type="error"
            showIcon
            message={t('Failed to load configuration. Editing is disabled to protect your saved page.')}
            action={<Button onClick={fetchConfig} loading={loading}>{t('Retry')}</Button>}
          />
        ) : !configLoaded ? (
          <div style={{ padding: '120px 0', textAlign: 'center' }}>
            <Spin tip={t('Syncing latest blocks and style configuration from database...')} size="large" />
          </div>
        ) : (
          <CustomLoginContainer
            key={`login-canvas-${configKey}`}
            ref={canvasRef}
            config={config}
            designMode={designMode}
            viewportMode={viewportMode}
            onModelReady={handleCanvasReady}
          />
        )}
      </div>

      {/* 外观与背景设置抽屉 */}
      <Drawer
        title={t('Sign-in Page Appearance & Brand Background')}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={520}
        extra={
          <Button type="primary" onClick={handleSaveGlobalConfig} loading={saving} disabled={!configLoaded || switchLoading}>
            {t('Confirm & Save')}
          </Button>
        }
      >
        {/* 精选主题预设一键切换 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            {t('Featured theme presets (One-click):')}
          </div>
          <Row gutter={[12, 12]}>
            {THEME_PRESETS.map((preset) => (
              <Col span={12} key={preset.key}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => handleApplyPresetTheme(preset)}
                  style={{
                    borderRadius: 10,
                    border:
                      config.themeConfig?.backgroundValue === preset.val
                        ? '2px solid #1677ff'
                        : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  bodyStyle={{ padding: 10 }}
                >
                  <div
                    style={{
                      height: 48,
                      borderRadius: 6,
                      background: preset.previewBg,
                      marginBottom: 8,
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    {t(preset.name)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {t(preset.desc)}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Form
          form={form}
          layout="vertical"
          initialValues={config}
          onValuesChange={(_, allValues) => {
            markDirty();
            setConfig((prev) => ({
              ...prev,
              ...allValues,
              themeConfig: {
                ...prev.themeConfig,
                ...(allValues.themeConfig || {}),
              },
            }));
          }}
        >
          <Form.Item name="canvasWidth" label={t('Canvas width mode')}>
            <Select
              options={[
                { label: t('Standard (1160px)'), value: 'standard' },
                { label: t('Wide canvas (1480px)'), value: 'wide' },
                { label: t('100% Full screen canvas'), value: 'full' },
              ]}
            />
          </Form.Item>

          <Form.Item name="containerStyle" label={t('Container visual style')}>
            <Select
              options={[
                { label: t('Transparent (Recommended)'), value: 'transparent' },
                { label: t('Modern frosted glass'), value: 'glass' },
                { label: t('Classic white card'), value: 'card' },
                { label: t('Obsidian dark card'), value: 'dark-card' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name={['themeConfig', 'backgroundType']}
            label={t('Background type')}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="gradient">{t('Gradient')}</Radio.Button>
              <Radio.Button value="color">{t('Solid color')}</Radio.Button>
              <Radio.Button value="image">{t('HD Wallpaper')}</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name={['themeConfig', 'backgroundValue']}
            label={t('Background value (CSS gradient, HEX color or Image URL)')}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('e.g. linear-gradient(135deg, #0a192f 0%, #172a45 50%, #203a43 100%) or https://.../bg.jpg')}
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
            message={t('License Compliance Note')}
            description={t('In compliance with the NocoBase Open Source License, official branding, names, links, version numbers, and license notices cannot be removed or altered in open-source editions. The sign-in page footer will preserve the official "Powered by NocoBase" label and website link alongside your custom copyright.')}
          />

          <Form.Item
            name={['themeConfig', 'copyright']}
            label={t('Custom Enterprise Copyright (Optional)')}
            extra={t('Will be displayed alongside the official NocoBase brand')}
          >
            <Input placeholder="Copyright © 2026 Your Company. All rights reserved." />
          </Form.Item>

          <Form.Item
            name={['themeConfig', 'icp']}
            label={t('ICP filing info')}
          >
            <Input placeholder="京ICP备xxxxxxxx号" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 专属可视化内容编辑抽屉 (提升到页面顶层，确保 100% 顺畅弹出) */}
      <BlockContentEditorDrawer
        open={blockEditorOpen}
        onClose={() => setBlockEditorOpen(false)}
        model={editingBlockModel}
        onSave={() => {
          markDirty();
          canvasRef.current?.refresh?.();
        }}
      />
    </div>
  );
};

export default CustomLoginPageSettings;
