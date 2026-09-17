import { tExpr as _tExpr, useFlowEngine } from '@nocobase/flow-engine';
// @ts-ignore
import pkg from './../../package.json';
// @ts-ignore
import zhCNJson from '../locale/zh-CN.json';

export function useT() {
  const engine = useFlowEngine();
  return (str: string, options?: any) => {
    if (engine?.context?.t) {
      const translated = engine.context.t(str, { ns: [pkg.name, 'client'], ...options });
      if (translated && translated !== str) {
        return translated;
      }
      const currentLang =
        engine?.context?.locale ||
        (typeof window !== 'undefined' &&
          ((window as any).__nocobase_locale__ || localStorage.getItem('NOCOBASE_LOCALE') || navigator.language));
      if (typeof currentLang === 'string' && currentLang.toLowerCase().includes('zh')) {
        if ((zhCNJson as any)[str]) {
          return (zhCNJson as any)[str];
        }
      }
      return translated || str;
    }
    return (zhCNJson as any)?.[str] || str;
  };
}

export function tExpr(key: string) {
  return _tExpr(key, { ns: [pkg.name, 'client'] });
}
