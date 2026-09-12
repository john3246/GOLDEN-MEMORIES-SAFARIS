import { MONTH_NAMES, CALENDAR_YEARS, joiningSafaris } from './content.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

export function toIso(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function monthPrefix(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function tripsInMonth(year, monthIndex) {
  const startIso = toIso(year, monthIndex, 1);
  const endIso = toIso(year, monthIndex, daysInMonth(year, monthIndex));
  return joiningSafaris.filter((trip) => trip.start <= endIso && trip.end >= startIso);
}

export function monthHasDeparture(year, monthIndex) {
  return tripsInMonth(year, monthIndex).length > 0;
}

function yearHasDeparture(year) {
  return joiningSafaris.some((trip) => trip.start.startsWith(`${year}-`) || trip.end.startsWith(`${year}-`));
}

function renderYearTabs(year) {
  return `
    <div class="join-years" role="tablist" aria-label="Departure year">
      ${CALENDAR_YEARS.map((item) => {
        const current = item === year;
        const open = yearHasDeparture(item);
        return `
          <button
            type="button"
            class="join-year${current ? ' is-current' : ''}${open ? ' has-trip' : ''}"
            data-cal-year-pick="${item}"
            role="tab"
            aria-selected="${current ? 'true' : 'false'}"
          >${item}</button>
        `;
      }).join('')}
    </div>
  `;
}

function renderMonthPills(year, monthIndex) {
  return `
    <div class="join-months" role="list" aria-label="Departure month">
      ${MONTH_NAMES.map((name, index) => {
        const current = index === monthIndex;
        const open = monthHasDeparture(year, index);
        return `
          <button
            type="button"
            class="join-month${current ? ' is-current' : ''}${open ? ' has-trip' : ''}"
            data-cal-month-pick="${index}"
            aria-pressed="${current ? 'true' : 'false'}"
            aria-label="${name} ${year}${open ? ', joining safari available' : ''}"
          >${name.slice(0, 3)}</button>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Year and month filters for joining-safari departures (no day grid).
 */
export function renderCalendarMonth(year, monthIndex) {
  return `
    <div class="join-cal" data-cal-root data-cal-year="${year}" data-cal-month="${monthIndex}">
      <div class="join-cal-filters">
        ${renderYearTabs(year)}
        ${renderMonthPills(year, monthIndex)}
      </div>
    </div>
  `;
}

export function defaultSelectedIso() {
  return joiningSafaris[0]?.start || toIso(new Date().getFullYear(), new Date().getMonth(), 1);
}

export function monthFromIso(iso) {
  const [y, m] = iso.split('-').map(Number);
  return { year: y, monthIndex: m - 1 };
}

export function firstTripIsoInMonth(year, monthIndex) {
  const trips = tripsInMonth(year, monthIndex);
  if (!trips.length) return toIso(year, monthIndex, 1);
  const prefix = monthPrefix(year, monthIndex);
  return trips[0].start.startsWith(prefix) ? trips[0].start : toIso(year, monthIndex, 1);
}
