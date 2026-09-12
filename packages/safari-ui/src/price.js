/**
 * Published safari rates are per person, usually for two travellers sharing.
 *
 * @param {unknown} amount
 * @param {string} [currency]
 */
export function formatMoney(amount, currency = 'USD') {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return '';
  const digits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  return `${currency} ${digits}`;
}

/**
 * @param {Record<string, unknown>} [safari]
 * @returns {null | {
 *   amount: number,
 *   currency: string,
 *   share: number,
 *   perPerson: string,
 *   sharing: string,
 *   card: string,
 *   hero: string,
 *   note: string,
 * }}
 */
export function safariPrice(safari = {}) {
  const amount = Number(safari.price_from ?? safari.price);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const currency = String(safari.currency || 'USD').trim() || 'USD';
  const share = Number(safari.minimum_people) >= 2 ? Number(safari.minimum_people) : 2;
  const perPerson = formatMoney(amount, currency);
  return {
    amount,
    currency,
    share,
    perPerson,
    sharing: formatMoney(amount * share, currency),
    card: `From ${perPerson} / person`,
    hero: `From ${perPerson} per person`,
    note: `Published rate for ${share} travellers sharing. Includes park fees, lodges, meals, and the private vehicle listed on this itinerary. Peak-season lodges or extra activities can change the final invoice.`,
  };
}
