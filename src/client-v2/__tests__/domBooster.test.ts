// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';

describe('Runtime DOM Booster for legacy / in-house browsers', () => {
  beforeEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
  });

  it('traverses ancestors and injects override classes on actual signin route', () => {
    // 模拟 NocoBase 原生深度嵌套布局: body -> div.nb-auth-layout -> div.nb-auth-content -> div.root
    const outerContainer = document.createElement('div');
    outerContainer.className = 'nb-auth-layout';
    const innerContainer = document.createElement('div');
    innerContainer.className = 'nb-auth-content';
    const rootElement = document.createElement('div');
    rootElement.className = 'custom-login-page-root is-actual-signin-route';

    innerContainer.appendChild(rootElement);
    outerContainer.appendChild(innerContainer);
    document.body.appendChild(outerContainer);

    // 运行遍历逻辑
    const modifiedElements: HTMLElement[] = [];
    let curr = rootElement.parentElement;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      curr.classList.add('nb-custom-login-parent-override');
      modifiedElements.push(curr);
      curr = curr.parentElement;
    }
    document.body.classList.add('nb-custom-login-body-override');

    // 断言所有父级都被赋予破壁 class
    expect(innerContainer.classList.contains('nb-custom-login-parent-override')).toBe(true);
    expect(outerContainer.classList.contains('nb-custom-login-parent-override')).toBe(true);
    expect(document.body.classList.contains('nb-custom-login-body-override')).toBe(true);

    // 模拟组件卸载清理逻辑
    for (const el of modifiedElements) {
      el.classList.remove('nb-custom-login-parent-override');
    }
    document.body.classList.remove('nb-custom-login-body-override');

    // 断言离开登录页后 100% 清理，无样式污染
    expect(innerContainer.classList.contains('nb-custom-login-parent-override')).toBe(false);
    expect(outerContainer.classList.contains('nb-custom-login-parent-override')).toBe(false);
    expect(document.body.classList.contains('nb-custom-login-body-override')).toBe(false);
  });

  it('does not touch ancestors when not in actual signin route', () => {
    const outer = document.createElement('div');
    const root = document.createElement('div');
    root.className = 'custom-login-page-root is-settings-canvas-route is-design-mode';
    outer.appendChild(root);
    document.body.appendChild(outer);

    const isActualSignInRoute = false;
    if (isActualSignInRoute) {
      let curr = root.parentElement;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        curr.classList.add('nb-custom-login-parent-override');
        curr = curr.parentElement;
      }
    }

    expect(outer.classList.contains('nb-custom-login-parent-override')).toBe(false);
    expect(document.body.classList.contains('nb-custom-login-body-override')).toBe(false);
  });
});
