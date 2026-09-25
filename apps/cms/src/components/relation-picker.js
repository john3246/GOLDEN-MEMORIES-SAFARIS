function escapeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function selectedSet(values) {
  return new Set((values || []).map((item) => String(item)));
}

export function collectChecks(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

export function filterPickers(form) {
  form.querySelectorAll('[data-picker-filter]').forEach((input) => {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const list = form.querySelector(`[data-picker-list="${input.dataset.pickerFilter}"]`);
      list?.querySelectorAll('[data-search]').forEach((card) => {
        card.hidden = Boolean(q) && !card.dataset.search.includes(q);
      });
    });
  });
}

export function relationPicker(kind, selected, rows, emptyLabel, searchLabel = '') {
  const ids = selectedSet(selected);
  const placeholder =
    searchLabel ||
    (String(kind).includes('lodge')
      ? 'Search lodges…'
      : String(kind).includes('post') || String(kind).includes('article')
        ? 'Search articles…'
        : String(kind).includes('destination')
          ? 'Search destinations…'
          : 'Search safaris…');
  const cards = (rows || [])
    .map((row) => {
      const value = row.value;
      const checked = ids.has(value);
      return `
        <label class="cms-lodge-pick${checked ? ' is-on' : ''}" data-search="${escapeValue(`${row.title} ${row.detail} ${value}`.toLowerCase())}">
          <input type="checkbox" name="${kind}" value="${escapeValue(value)}" ${checked ? 'checked' : ''} />
          <span class="cms-lodge-pick-media">${row.image ? `<img src="${escapeValue(row.image)}" alt="" />` : ''}</span>
          <span>
            <strong>${escapeValue(row.title)}</strong>
            <small>${escapeValue(row.detail || value)}</small>
          </span>
        </label>`;
    })
    .join('');
  return `
    <div class="cms-field">
      <input class="cms-picker-search" type="search" data-picker-filter="${kind}" placeholder="${escapeValue(placeholder)}" />
    </div>
    <div class="cms-lodge-grid" data-picker-list="${kind}">${cards || `<p class="cms-muted">${emptyLabel}</p>`}</div>`;
}
