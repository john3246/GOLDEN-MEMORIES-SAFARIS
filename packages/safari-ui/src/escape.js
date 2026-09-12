/**
 * Escape text interpolated into HTML. CMS content is trusted-but-untrusted.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeAttr(value) {
  return escapeHtml(value);
}

/**
 * @param {string} text
 * @returns {string}
 */
export function paragraphs(text) {
  const blocks = String(text ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (!blocks.length) return '';
  return blocks.map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`).join('');
}
