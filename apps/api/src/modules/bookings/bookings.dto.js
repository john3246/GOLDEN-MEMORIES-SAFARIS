function toCount(value, fallback = 0, max = 20) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(max, Math.floor(n));
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return String(value)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, age] = line.split('|').map((part) => part.trim());
          return { name, age };
        });
    }
  }
  return [];
}

export function parseChildDetails(body = {}, childrenCount) {
  let raw = body.childDetails || body.childrenDetails || body.child_details;
  raw = asList(raw);
  if (!raw.length) {
    const count = childrenCount || 12;
    for (let i = 0; i < count; i += 1) {
      const name = body[`childName_${i}`] ?? body[`child[${i}][name]`];
      const age = body[`childAge_${i}`] ?? body[`child[${i}][age]`];
      if (name || age || age === 0) raw.push({ name, age });
    }
  }
  const limit = childrenCount != null ? childrenCount : raw.length;
  return raw.slice(0, limit).map((item, index) => {
    const ageRaw = item?.age;
    const ageNum = ageRaw === '' || ageRaw == null ? null : Number(ageRaw);
    return {
      name: String(item?.name || item?.fullName || '').trim(),
      age: Number.isFinite(ageNum) ? ageNum : '',
      index,
    };
  });
}

export function normalizeParty(body = {}) {
  const hasAdults = body.adults != null && body.adults !== '';
  const hasChildren = body.children != null && body.children !== '';
  const children = toCount(body.children ?? body.childCount ?? 0, 0, 12);
  let adults = Math.max(1, toCount(body.adults ?? body.adultCount, 1, 20));
  if (!hasAdults && !hasChildren) {
    adults = Math.max(1, toCount(body.travellers || body.partySize, adults, 32));
  }
  const childDetails = parseChildDetails(body, children);
  return { adults, children, childDetails, travellers: adults + children };
}

export function partySummary(booking = {}) {
  const adults = Number(booking.adults || 0);
  const children = Number(booking.children || 0);
  const parts = [];
  if (adults) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children) parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  return parts.join(', ') || String(booking.travellers || '');
}

export function childDetailsSummary(booking = {}) {
  const details = Array.isArray(booking.childDetails) ? booking.childDetails : [];
  return details
    .map((item, index) => {
      const name = String(item?.name || '').trim() || `Child ${index + 1}`;
      const age = item?.age;
      if (age === '' || age == null) return name;
      return `${name}, age ${age}`;
    })
    .join('; ');
}
