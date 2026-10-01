export function money(value: number, decimals = 2) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(decimals)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${Math.round(abs)}`;
}
export function pct(value: number, decimals = 1) { return `${value.toFixed(decimals)}%`; }
export function monthName(iso: string, short = true) {
  const [year, month] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: short ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
}
