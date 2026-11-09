const taka = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ৳ 2,450 — Bangladeshi grouping (en-IN gives 1,00,000 style lakh grouping). */
export const formatTaka = (n: number) => `৳ ${taka.format(Math.round(n))}`;

/** DD/MM/YYYY in Asia/Dhaka */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
