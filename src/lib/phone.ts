import { toAsciiDigits } from './format';

/** Accepts 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX, with spaces/dashes and Bangla digits. Returns 01XXXXXXXXX or null. */
export function normalizeBdPhone(input: string): string | null {
  const digits = toAsciiDigits(input).replace(/[\s\-()]/g, '').replace(/^\+?88(?=01)/, '');
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}
