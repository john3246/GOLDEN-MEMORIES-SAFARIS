import { safariStyles } from './gms-trips.js';

export function durationDays(label) {
  const match = String(label || '').match(/(\d+)\s*days?/i);
  return match ? Number(match[1]) : 0;
}

export function renderSafariFilters(activeStyle = '') {
  const types = safariStyles
    .map(
      (style) => `
        <label class="safari-filter-check">
          <input type="checkbox" name="style" value="${style.slug}" ${activeStyle === style.slug ? 'checked' : ''} />
          <span>${style.label}</span>
        </label>
      `
    )
    .join('');

  return `
    <aside class="safari-filters" data-safari-filters>
      <div class="safari-filters-head">
        <h3>Filter safaris</h3>
        <button type="button" class="safari-filters-clear" data-filter-clear hidden>Clear</button>
      </div>

      <div class="safari-filter-group">
        <p>Budget per person</p>
        <div class="safari-filter-labels">
          <span data-min-price-label>$0</span>
          <span data-max-price-label>$8,000+</span>
        </div>
        <input type="range" data-min-price min="0" max="8000" step="100" value="0" aria-label="Minimum budget" />
        <input type="range" data-max-price min="0" max="8000" step="100" value="8000" aria-label="Maximum budget" />
      </div>

      <div class="safari-filter-group">
        <p>Trip length</p>
        <div class="safari-filter-labels">
          <span data-min-days-label>1 day</span>
          <span data-max-days-label>15+ days</span>
        </div>
        <input type="range" data-min-days min="1" max="15" step="1" value="1" aria-label="Minimum days" />
        <input type="range" data-max-days min="1" max="15" step="1" value="15" aria-label="Maximum days" />
      </div>

      <div class="safari-filter-group">
        <p>Trip type</p>
        <div class="safari-filter-types">${types}</div>
      </div>
    </aside>
  `;
}

function money(value) {
  return `$${Number(value).toLocaleString('en-US')}${Number(value) >= 8000 ? '+' : ''}`;
}

function daysLabel(value, suffix) {
  const n = Number(value);
  if (n >= 15 && suffix === 'max') return '15+ days';
  return `${n} ${n === 1 ? 'day' : 'days'}`;
}

export function initToursFilters() {
  const root = document.querySelector('[data-safari-board]');
  if (!root) return;

  const cards = [...root.querySelectorAll('[data-tour-card]')];
  const countEl = root.querySelector('[data-filter-count]');
  const emptyEl = root.querySelector('[data-filter-empty]');
  const grid = root.querySelector('[data-safari-grid]');
  const sortEl = root.querySelector('[data-safari-sort]');
  const clearBtn = root.querySelector('[data-filter-clear]');
  const minPrice = root.querySelector('[data-min-price]');
  const maxPrice = root.querySelector('[data-max-price]');
  const minDays = root.querySelector('[data-min-days]');
  const maxDays = root.querySelector('[data-max-days]');
  const minPriceLabel = root.querySelector('[data-min-price-label]');
  const maxPriceLabel = root.querySelector('[data-max-price-label]');
  const minDaysLabel = root.querySelector('[data-min-days-label]');
  const maxDaysLabel = root.querySelector('[data-max-days-label]');
  const typeInputs = [...root.querySelectorAll('input[name="style"]')];
  const toggle = root.querySelector('[data-filter-toggle]');

  const apply = () => {
    if (Number(minPrice.value) > Number(maxPrice.value)) minPrice.value = maxPrice.value;
    if (Number(minDays.value) > Number(maxDays.value)) minDays.value = maxDays.value;

    minPriceLabel.textContent = money(minPrice.value);
    maxPriceLabel.textContent = money(maxPrice.value);
    minDaysLabel.textContent = daysLabel(minDays.value, 'min');
    maxDaysLabel.textContent = daysLabel(maxDays.value, 'max');

    const selected = typeInputs.filter((input) => input.checked).map((input) => input.value);
    const sort = sortEl?.value || 'popular';
    const loPrice = Number(minPrice.value);
    const hiPrice = Number(maxPrice.value);
    const loDays = Number(minDays.value);
    const hiDays = Number(maxDays.value);

    const visible = [];
    for (const card of cards) {
      const price = Number(card.dataset.price || 0);
      const days = Number(card.dataset.days || 0);
      const style = card.dataset.style || '';
      const priceOk = (!price && hiPrice >= 8000) || (price >= loPrice && price <= hiPrice);
      const daysOk = !days || (days >= loDays && days <= hiDays);
      const typeOk = !selected.length || selected.includes(style);
      const show = priceOk && daysOk && typeOk;
      card.hidden = !show;
      if (show) visible.push(card);
    }

    visible.sort((a, b) => {
      const pa = Number(a.dataset.price || 0);
      const pb = Number(b.dataset.price || 0);
      const da = Number(a.dataset.days || 0);
      const db = Number(b.dataset.days || 0);
      if (sort === 'price-asc') return pa - pb || da - db;
      if (sort === 'price-desc') return pb - pa || da - db;
      if (sort === 'duration-asc') return da - db || pa - pb;
      if (sort === 'duration-desc') return db - da || pa - pb;
      const fa = Number(b.dataset.featured) - Number(a.dataset.featured);
      return fa || da - db;
    });
    visible.forEach((card) => grid.appendChild(card));

    if (countEl) {
      countEl.textContent = `${visible.length} safari${visible.length === 1 ? '' : 's'} match your search`;
    }
    if (emptyEl) emptyEl.hidden = visible.length > 0;

    const dirty =
      selected.length > 0 ||
      loPrice > 0 ||
      hiPrice < 8000 ||
      loDays > 1 ||
      hiDays < 15;
    if (clearBtn) clearBtn.hidden = !dirty;
  };

  root.addEventListener('input', apply);
  root.addEventListener('change', apply);
  clearBtn?.addEventListener('click', () => {
    typeInputs.forEach((input) => {
      input.checked = false;
    });
    minPrice.value = '0';
    maxPrice.value = '8000';
    minDays.value = '1';
    maxDays.value = '15';
    if (sortEl) sortEl.value = 'popular';
    apply();
  });
  toggle?.addEventListener('click', () => {
    root.classList.toggle('filters-open');
  });

  apply();
}
