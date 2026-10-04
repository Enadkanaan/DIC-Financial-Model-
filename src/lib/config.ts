import type { AsOf, PageId } from './types';

export const YEARS = [2025, 2026, 2027, 2028, 2029] as const;
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Contract delivery window (inclusive). Sep 2025 – Aug 2029 per the Delivery Input sheet. */
export const PROJECT_START: AsOf = { year: 2025, month: 8 };
export const PROJECT_END: AsOf = { year: 2029, month: 7 };

/** Budget-status threshold: forecast at or above this % of budget is flagged amber. */
export const AT_LIMIT_THRESHOLD = 97;

/** Reporting-category limits. */
export const MIN_CATEGORIES = 3;
export const MAX_CATEGORIES = 5;

/** Maximum retained change-log entries (oldest are trimmed first). */
export const LOG_LIMIT = 5000;

export const DEFAULT_NAV_ORDER: PageId[] = ['dashboard', 'inventory', 'pricing', 'monthly'];

/**
 * State of Qatar Master Brand Guidelines (Government Communications Office, gba.gco.gov.qa).
 * Primary: Al Adaam. Secondary: Skyline, Palm, Sea, Sunrise. Dune is reserved for the
 * executive-branch category and is therefore not used here.
 */
export const BRAND = {
  alAdaam: '#8A1538',
  skyline: '#0D4261',
  palm: '#009C80',
  sea: '#4194B3',
  sunrise: '#FDF39E',
  charcoal: '#333333',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const COLORS = {
  brand: BRAND.alAdaam,
  actual: BRAND.palm,
  projected: BRAND.sea,
  /** Sea fails WCAG AA for small text on white — use Skyline for projected text. */
  projectedText: BRAND.skyline,
  budget: BRAND.alAdaam,
  eac: BRAND.skyline,
  /** Functional status colours (not part of the brand palette) for adverse / caution states. */
  negative: '#B42318',
  warning: '#B54708',
  positive: BRAND.palm,
  neutral: '#667085',
  grid: '#EAECF0',
} as const;

/** First five are solid brand colours; anything beyond uses 60% tints so excess categories read as "to be merged". */
export const CATEGORY_PALETTE = [
  BRAND.skyline, BRAND.palm, BRAND.alAdaam, BRAND.sea, BRAND.charcoal,
  '#6E8EA0', '#66C4B3', '#B97388', '#8DBFD1', '#858585', '#A9B9C2', '#99D7CC',
];

export const categoryColorAt = (index: number): string => CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

export const SCOPE_STYLES: Record<string, { bg: string; fg: string }> = {
  Core: { bg: '#E7ECEF', fg: BRAND.skyline },
  'Selected Non-core': { bg: '#E6F5F2', fg: '#00715D' },
  'Call-off': { bg: '#F2F4F7', fg: '#344054' },
};
