const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Rounds half away from zero to an integer and removes negative zero. */
export const toInt = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  const r = Math.sign(v) * Math.round(Math.abs(v));
  return r === 0 ? 0 : r;
};

/** Integer with thousands separators; negatives shown in accounting parentheses. */
export const fmtAmount = (v: number): string => {
  const n = toInt(v);
  return n < 0 ? `(${intFmt.format(-n)})` : intFmt.format(n);
};

export const fmtQAR = (v: number): string => `QAR ${fmtAmount(v)}`;

/** Signed amount for change impacts, e.g. +319,400 / −62,748. */
export const fmtSigned = (v: number): string => {
  const n = toInt(v);
  return n > 0 ? `+${intFmt.format(n)}` : n < 0 ? `−${intFmt.format(-n)}` : '0';
};

/** Compact executive figure, e.g. 42.40M. */
export const fmtCompact = (v: number): string => {
  const a = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (a >= 1_000_000) return `${sign}${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${sign}${(a / 1_000).toFixed(1)}K`;
  return `${sign}${intFmt.format(toInt(a))}`;
};

export const fmtPct = (v: number): string => `${pctFmt.format(Number.isFinite(v) ? v : 0)}%`;

export const fmtSignedPct = (v: number): string => (v > 0 ? '+' : v < 0 ? '−' : '') + fmtPct(Math.abs(v));

export const safeDiv = (a: number, b: number): number => (b === 0 || !Number.isFinite(b) ? 0 : a / b);

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Pluralises a unit label: "hour" -> "hours", "startup per month" -> "startups per month". */
export const pluralUnit = (unit: string, n: number): string => {
  if (Math.abs(n) === 1) return unit;
  const [head, ...rest] = unit.split(' ');
  const plural = /(s|x|ch|sh)$/.test(head) ? `${head}es` : `${head}s`;
  return [plural, ...rest].join(' ');
};

const dtFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
export const fmtDateTime = (iso: string): string => dtFmt.format(new Date(iso));
