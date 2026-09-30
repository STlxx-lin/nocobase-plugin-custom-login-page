import React from 'react';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { tExpr } from '../../locale';

/* ==========================================================================
   6. 自由代码 / HTML 原生区块 (CustomHtmlBlockModel)
   ========================================================================== */
export class CustomHtmlBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const html =
      props.html ||
      `<div style="text-align: center; padding: 18px 24px; color: rgba(255,255,255,0.85); font-size: 13px; background: rgba(255,255,255,0.08); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.25);">
        <span>🔒 经过权威安全认证 · 严格遵循 ISO27001 与国家等保三级安全规范</span>
      </div>`;

    const cleanHtml = sanitizeHtml(html);

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        className="custom-block-html custom-html-card"
        style={{ position: 'relative', width: '100%', margin: '12px 0' }}
      >
        <div className="custom-html-content" dangerouslySetInnerHTML={{ __html: cleanHtml }} style={{ width: '100%' }} />
      </div>
    );
  }
}

CustomHtmlBlockModel.define({
  label: tExpr('Free Code / HTML'),
  hide: true,
  createModelOptions: {
    use: 'CustomHtmlBlockModel',
  },
});
