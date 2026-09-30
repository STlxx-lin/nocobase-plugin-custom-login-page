import React from 'react';
import { CustomLoginBlockModel } from '../CustomLoginBlockModel';
import { tExpr } from '../../locale';

/* ==========================================================================
   7. 宣传插画 / 大图展示原生区块 (CustomImageBlockModel)
   ========================================================================== */
export class CustomImageBlockModel extends CustomLoginBlockModel {
  renderComponent(): React.ReactNode {
    const props = (this as any).props || {};
    const url = props.url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
    const height = props.height || 360;
    const borderRadius = props.borderRadius || 16;
    const caption = props.caption || '';

    return (
      <div
        ref={(el) => {
          if (el) (el as any).__customBlockModel = this;
        }}
        data-custom-block-root="true"
        style={{ position: 'relative', width: '100%', margin: '14px 0' }}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>
          <img
            src={url}
            alt={caption || 'Banner'}
            style={{
              width: '100%',
              height,
              objectFit: 'cover',
              borderRadius,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
          {caption && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.75)' }}>
              {caption}
            </div>
          )}
        </div>
      </div>
    );
  }
}

CustomImageBlockModel.define({
  label: tExpr('Illustration / Image'),
  hide: true,
  createModelOptions: {
    use: 'CustomImageBlockModel',
  },
});
