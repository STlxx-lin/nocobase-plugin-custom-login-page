// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../utils/sanitizeHtml';

describe('display-only HTML sanitizer', () => {
  it.each([
    '<a href="java&#x73;cript:alert(1)">open</a>',
    '<a href="jav&#x09;ascript:alert(1)">open</a>',
    '<img src=x onerror=alert(1)>',
    '<svg><a xlink:href="javascript:alert(1)">open</a></svg>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<script>alert(1)</script><object data="x"></object><embed src="x">',
    '<form action="https://example.com"><input name="password"><button>Submit</button></form>',
  ])('removes executable markup: %s', (html) => {
    const root = document.createElement('div');
    root.innerHTML = sanitizeHtml(html);
    expect(root.querySelector('script,iframe,object,embed,svg,form,input,button')).toBeNull();
    for (const element of root.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        expect(attribute.name).not.toMatch(/^on/i);
        if (['href', 'src'].includes(attribute.name)) expect(attribute.value).not.toMatch(/javascript:/i);
      }
    }
  });

  it('preserves normal branding, styles and safe links', () => {
    const html = '<div style="color: red"><h2>Hello</h2><a href="https://example.com">Help</a><img src="/logo.png" alt="Logo"></div>';
    expect(sanitizeHtml(html)).toBe(html);
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as any)).toBe('');
  });
});
