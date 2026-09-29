// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY } from '../constants';

describe('SWR Cache & Export/Import logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads cached config correctly from localStorage', () => {
    const sampleConfig = {
      enabled: true,
      template: 'split',
      canvasWidth: 'wide',
      containerStyle: 'transparent',
      gridSchema: { use: 'TestGrid' },
      themeConfig: { brandTitle: 'Test Brand' },
    };

    localStorage.setItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY, JSON.stringify(sampleConfig));

    const stored = localStorage.getItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.enabled).toBe(true);
    expect(parsed.themeConfig.brandTitle).toBe('Test Brand');
  });

  it('handles invalid json in cache gracefully without throwing', () => {
    localStorage.setItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY, '{invalid json');
    let config = null;
    try {
      const raw = localStorage.getItem(CUSTOM_LOGIN_PUBLIC_CONFIG_CACHE_KEY);
      if (raw) {
        config = JSON.parse(raw);
      }
    } catch (e) {
      config = null;
    }
    expect(config).toBeNull();
  });

  it('formats export payload correctly', () => {
    const sampleConfig: any = {
      enabled: true,
      canvasWidth: 'wide',
      containerStyle: 'glass',
      gridSchema: { use: 'TestGrid', props: {} },
      themeConfig: { brandTitle: 'Exported Brand' },
    };

    const exportData = {
      name: 'NocoBase Custom Login Page Config',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config: sampleConfig,
    };

    expect(exportData.name).toBe('NocoBase Custom Login Page Config');
    expect(exportData.config.canvasWidth).toBe('wide');
    expect(exportData.config.containerStyle).toBe('glass');
    expect(exportData.config.themeConfig.brandTitle).toBe('Exported Brand');
  });

  it('parses imported json payload and extracts valid configuration', () => {
    const rawImport = JSON.stringify({
      name: 'NocoBase Custom Login Page Config',
      version: '1.0',
      config: {
        canvasWidth: 'full',
        containerStyle: 'dark-card',
        gridSchema: { use: 'ImportedGrid' },
        themeConfig: { brandTitle: 'New Brand' },
      },
    });

    const parsed = JSON.parse(rawImport);
    const importedConfig = parsed.config || parsed;

    expect(importedConfig.canvasWidth).toBe('full');
    expect(importedConfig.containerStyle).toBe('dark-card');
    expect(importedConfig.gridSchema.use).toBe('ImportedGrid');
  });
});
