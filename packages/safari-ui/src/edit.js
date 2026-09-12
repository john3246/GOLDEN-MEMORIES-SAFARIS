/**
 * Optional click-to-edit attributes for the CMS preview.
 * @param {boolean} editable
 * @param {string} field
 */
export function editAttr(editable, field) {
  if (!editable || !field) return '';
  return ` data-safari-edit="${field}"`;
}

/**
 * Wrap a rendered section so the CMS can highlight / reorder it.
 * @param {string} type
 * @param {string} html
 */
export function wrapSection(type, html) {
  if (!html) return '';
  return `<div class="safari-section" data-safari-section="${type}">${html}</div>`;
}
