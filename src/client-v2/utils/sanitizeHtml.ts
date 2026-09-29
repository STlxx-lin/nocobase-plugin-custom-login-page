import DOMPurify from 'dompurify';

/** Display-only HTML. Authentication and embedded applications use their own blocks. */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || !html || !DOMPurify.isSupported) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'option', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['srcdoc'],
    RETURN_TRUSTED_TYPE: false,
  });
}
