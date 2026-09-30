// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('@nocobase/flow-engine', () => ({
  useFlowEngine: () => null,
  tExpr: (k: string) => k,
}));

import zhCN from '../../locale/zh-CN.json';
import enUS from '../../locale/en-US.json';
import { t } from '../locale';

function walkTsFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkTsFiles(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

describe('i18n translation completeness and coverage', () => {
  it('should have valid non-empty zh-CN and en-US dictionaries', () => {
    expect(Object.keys(zhCN).length).toBeGreaterThan(50);
    expect(Object.keys(enUS).length).toBeGreaterThan(50);
  });

  it('should have 100% translation coverage for all t() and tExpr() calls in src', () => {
    const srcDir = path.resolve(__dirname, '../../');
    const files = walkTsFiles(srcDir);
    const keys = new Set<string>();

    files.forEach(f => {
      if (f.includes('__tests__')) return;
      const content = fs.readFileSync(f, 'utf8');
      const regex = /\b(?:t|tExpr)\(\s*(['"])((?:\\.|[^\\])*?)\1/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const unescaped = match[2].replace(/\\(['"])/g, '$1');
        keys.add(unescaped);
      }
    });

    const missingInZh: string[] = [];
    const missingInEn: string[] = [];

    keys.forEach(k => {
      if (!(k in zhCN)) missingInZh.push(k);
      if (!(k in enUS)) missingInEn.push(k);
    });

    expect(missingInZh, `Missing keys in zh-CN: ${JSON.stringify(missingInZh)}`).toEqual([]);
    expect(missingInEn, `Missing keys in en-US: ${JSON.stringify(missingInEn)}`).toEqual([]);
  });

  it('standalone t() helper should properly translate or fallback', () => {
    // 模拟全局环境为 zh-CN
    (window as any).__nocobase_locale__ = 'zh-CN';
    expect(t('Custom canvas')).toBe('独立画布');
    expect(t('Adaptive')).toBe('自动适配');
    expect(t('Edit Sign-in Form')).toBe('编辑系统登录表单 (Sign-in Form)');

    // 模拟英文环境
    (window as any).__nocobase_locale__ = 'en-US';
    expect(t('Custom canvas')).toBe('Custom canvas');
    expect(t('Adaptive')).toBe('Adaptive');
    expect(t('Edit Sign-in Form')).toBe('Edit Sign-in Form');
  });
});
