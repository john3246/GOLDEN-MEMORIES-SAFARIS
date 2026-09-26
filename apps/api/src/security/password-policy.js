/**
 * Staff password rules. Long passphrases beat complexity rules, so we ask for
 * length plus a mix, and block obvious choices.
 */
const COMMON = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'iloveyou',
  'admin123',
  'welcome1',
  'safari123',
  'tanzania1',
  '1234gms',
]);

export function passwordProblems(password, { email = '', name = '' } = {}) {
  const value = String(password || '');
  const problems = [];
  if (value.length < 10) problems.push('Password must be at least 10 characters');
  if (value.length > 200) problems.push('Password is too long');
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  if (classes < 3) problems.push('Use at least three of: lowercase, uppercase, numbers, symbols');
  const lower = value.toLowerCase();
  if (COMMON.has(lower)) problems.push('That password is too common');
  const local = String(email).split('@')[0].toLowerCase();
  if (local.length >= 4 && lower.includes(local)) problems.push('Password must not contain your email name');
  const first = String(name).split(/\s+/)[0]?.toLowerCase() || '';
  if (first.length >= 4 && lower.includes(first)) problems.push('Password must not contain your name');
  return problems;
}
