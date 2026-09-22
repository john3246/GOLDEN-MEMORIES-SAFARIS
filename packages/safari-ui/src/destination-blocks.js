import { escapeHtml, escapeAttr } from './escape.js';

export function renderDestinationBlocks(blocks = []) {
  return (blocks || [])
    .map((block) => {
      if (block.type === 'heading' && block.text) {
        return `<h3 class="dest-block-heading">${escapeHtml(block.text)}</h3>`;
      }
      if (block.type === 'image' && block.url) {
        return `<figure class="dest-block-figure">
          <img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt || block.caption || '')}" width="1600" height="900" loading="lazy" />
          ${block.caption || block.alt ? `<figcaption>${escapeHtml(block.caption || block.alt)}</figcaption>` : ''}
        </figure>`;
      }
      if (block.type === 'table' && (block.headers?.length || block.rows?.length)) {
        const headers = (block.headers || []).map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
        const rows = (block.rows || [])
          .map((row) => `<tr>${(row || []).map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
          .join('');
        return `<figure class="dest-block-table">
          ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
          <div class="dest-table-wrap"><table>
            ${headers ? `<thead><tr>${headers}</tr></thead>` : ''}
            <tbody>${rows}</tbody>
          </table></div>
        </figure>`;
      }
      if (block.type === 'paragraph' && block.text) {
        return `<p class="mt-5 font-body text-base leading-relaxed text-ink/75">${escapeHtml(block.text)}</p>`;
      }
      return '';
    })
    .join('');
}
