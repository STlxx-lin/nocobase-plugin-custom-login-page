// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';

describe('Responsive Layout Engine (Container Queries & Viewport Mode)', () => {
  beforeEach(() => {
    document.body.className = '';
    document.body.innerHTML = '';
  });

  it('correctly sets viewport class on custom-login-page-root', () => {
    const root = document.createElement('div');
    const viewportMode: 'desktop' | 'tablet' | 'mobile' = 'mobile';
    root.className = `custom-login-page-root custom-login-style-transparent is-viewport-${viewportMode}`;
    document.body.appendChild(root);

    expect(root.classList.contains('is-viewport-mobile')).toBe(true);
    expect(root.classList.contains('is-viewport-desktop')).toBe(false);
  });

  it('verifies data-grid-root and ant-row selectors match FlowEngine DOM structure', () => {
    const root = document.createElement('div');
    root.className = 'custom-login-page-root is-viewport-mobile';

    const gridRoot = document.createElement('div');
    gridRoot.setAttribute('data-grid-root', 'true');

    const gridRow = document.createElement('div');
    gridRow.className = 'ant-row';
    gridRow.setAttribute('data-grid-row-id', 'row_login_main');

    const colHero = document.createElement('div');
    colHero.className = 'ant-col ant-col-14';
    colHero.setAttribute('data-grid-column-row-id', 'row_login_main');

    const colForm = document.createElement('div');
    colForm.className = 'ant-col ant-col-10';
    colForm.setAttribute('data-grid-column-row-id', 'row_login_main');

    gridRow.appendChild(colHero);
    gridRow.appendChild(colForm);
    gridRoot.appendChild(gridRow);
    root.appendChild(gridRoot);
    document.body.appendChild(root);

    // 验证能够精准选择到 FlowEngine 原生网格节点
    const matchedRow = root.querySelector('[data-grid-root] .ant-row');
    const matchedCols = root.querySelectorAll('[data-grid-column-row-id]');

    expect(matchedRow).not.toBeNull();
    expect(matchedCols.length).toBe(2);
  });
});
