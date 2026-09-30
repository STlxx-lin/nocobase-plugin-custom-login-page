import React, { useState } from 'react';
import { Segmented, Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

/* ==========================================================================
   11. 多语言快捷切换原生区块 (CustomLanguageBlockModel)
   ========================================================================== */
export const LanguageSwitcherInner: React.FC<{ model: any }> = ({ model }) => {
  const props = model?.props || {};
  const mode = props.mode || 'pills'; // 'pills' | 'select'
  const align = props.align || 'right'; // 'left' | 'center' | 'right'
  const languages = Array.isArray(props.languages) && props.languages.length > 0
    ? props.languages
    : [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en-US' },
        { label: '繁體中文', value: 'zh-TW' },
        { label: '日本語', value: 'ja-JP' },
      ];

  // 读取当前系统语言
  const getCurrentLang = () => {
    try {
      const stored = localStorage.getItem('NOCOBASE_LOCALE') || localStorage.getItem('locale');
      if (stored) return stored;
    } catch (e) {}
    return 'zh-CN';
  };

  const [currentLang, setCurrentLang] = useState<string>(getCurrentLang());

  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang);
    try {
      localStorage.setItem('NOCOBASE_LOCALE', newLang);
      localStorage.setItem('locale', newLang);
      // 调用 NocoBase 全局切换
      const app = (window as any).__nocobase_v2_app__ || (window as any).nocobase;
      if (app?.i18n?.changeLanguage) {
        app.i18n.changeLanguage(newLang);
      } else {
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
        alignItems: 'center',
        gap: 8,
        width: '100%',
      }}
    >
      <GlobalOutlined style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 16 }} />
      {mode === 'pills' ? (
        <Segmented
          options={languages.map((l: any) => ({ label: l.label, value: l.value }))}
          value={currentLang}
          onChange={(val) => handleLanguageChange(val as string)}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: 8,
          }}
        />
      ) : (
        <Select
          size="small"
          value={currentLang}
          onChange={handleLanguageChange}
          style={{ width: 120 }}
          options={languages}
        />
      )}
    </div>
  );
};

export class CustomLanguageBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '8px 0' }}
      >
        <LanguageSwitcherInner model={this} />
      </div>
    );
  }
}

CustomLanguageBlockModel.define({
  label: tExpr('Language Switcher'),
  hide: true,
  createModelOptions: {
    use: 'CustomLanguageBlockModel',
  },
});
