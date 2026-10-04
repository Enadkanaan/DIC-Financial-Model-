import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { viewLabel } from '../lib/calc';
import { COLORS, SCOPE_STYLES, YEARS } from '../lib/config';
import { clamp, fmtAmount } from '../lib/format';
import type { BudgetStatus, InventoryStatus, YearView } from '../lib/types';
import { CountUp, useCountUp } from './CountUp';

/** Brand section divider: Al Adaam diamond on a thin rule, as used in the State of Qatar guidelines. */
function Diamond() {
  return <span className="inline-block h-2 w-2 shrink-0 rotate-45 bg-brand" aria-hidden />;
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-5',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand/15 px-5 py-4">
          <div>
            {title && (
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-brand">
                <Diamond />
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  unit = 'QAR',
  sub,
  icon: Icon,
  accent = COLORS.brand,
  delta,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  icon: LucideIcon;
  accent?: string;
  delta?: { text: ReactNode; tone: 'positive' | 'negative' | 'warning' | 'neutral' };
}) {
  const deltaCls = {
    positive: 'bg-positive-50 text-positive-700',
    negative: 'bg-negative-50 text-negative-700',
    warning: 'bg-warning-50 text-warning-700',
    neutral: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-card">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        {unit && <span className="text-xs font-medium text-gray-400">{unit}</span>}
        <span className="num text-[22px] font-semibold leading-none text-gray-900">{value}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {delta && <span className={`num rounded px-1.5 py-0.5 font-semibold ${deltaCls[delta.tone]}`}>{delta.text}</span>}
        {sub}
      </div>
    </div>
  );
}

/** Whole-QAR figure that counts up; negatives in accounting parentheses. */
export function AnimatedAmount({ value, prefix = '', className = '' }: { value: number; prefix?: string; className?: string }) {
  return <CountUp value={value} format={(v) => `${prefix}${fmtAmount(v)}`} className={className} />;
}

/** Compact stat tile used on secondary pages. */
export function StatTile({ label, value, color = COLORS.brand }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold" style={{ color }}>
        <AnimatedAmount value={value} prefix="QAR " />
      </p>
    </div>
  );
}

/** Fiscal-year dropdown with an Overall option. Used everywhere a year is chosen. */
export function YearSelect({
  value,
  onChange,
  includeOverall = true,
  label = 'Fiscal year',
}: {
  value: YearView;
  onChange: (v: YearView) => void;
  includeOverall?: boolean;
  label?: string;
}) {
  return (
    <label className="relative inline-flex items-center">
      <CalendarDays className="pointer-events-none absolute left-2.5 h-4 w-4 text-brand" aria-hidden />
      <select
        aria-label={label}
        value={String(value)}
        onChange={(e) => onChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        className="num h-8 cursor-pointer rounded-md border border-gray-200 bg-white pl-8 pr-2 text-xs font-semibold text-gray-900 outline-none hover:border-gray-400 focus:border-brand"
      >
        {includeOverall && <option value="all">Overall (FY{YEARS[0]}–FY{YEARS[YEARS.length - 1]})</option>}
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {viewLabel(y)}
          </option>
        ))}
      </select>
    </label>
  );
}

const STATUS_STYLES: Record<InventoryStatus | BudgetStatus, string> = {
  AVAILABLE: 'bg-positive-50 text-positive-700 ring-positive-700/20',
  EXHAUSTED: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  'OVER-ALLOCATED': 'bg-negative-50 text-negative-700 ring-negative-700/20',
  'NOT CONTRACTED': 'bg-white text-gray-400 ring-gray-300',
  'WITHIN BUDGET': 'bg-positive-50 text-positive-700 ring-positive-700/20',
  'AT LIMIT': 'bg-warning-50 text-warning-700 ring-warning-700/20',
  'OVER BUDGET': 'bg-negative-50 text-negative-700 ring-negative-700/20',
};

export function StatusBadge({ status }: { status: InventoryStatus | BudgetStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-inset ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function ScopeBadge({ scope }: { scope: string }) {
  const s = SCOPE_STYLES[scope] ?? SCOPE_STYLES['Call-off'];
  return (
    <span className="inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: s.bg, color: s.fg }}>
      {scope}
    </span>
  );
}

export function CategoryDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} aria-hidden />;
}

/** Thin horizontal utilisation bar that grows from 0 on mount; turns red above 100%. */
export function ProgressBar({ pct, color = COLORS.brand }: { pct: number; color?: string }) {
  const shown = useCountUp(pct, 1100);
  return (
    <div className="relative h-1.5 w-full rounded-full bg-gray-100">
      <div className="h-full rounded-full" style={{ width: `${clamp(shown, 0, 100)}%`, background: pct > 100 ? COLORS.negative : color }} />
    </div>
  );
}

/** Signed amount in accounting format: favourable green, adverse red in parentheses. */
export function Amount({ value, signed = false, className = '' }: { value: number; signed?: boolean; className?: string }) {
  const n = Math.round(value);
  const cls = signed ? (n < 0 ? 'text-negative-700' : n > 0 ? 'text-positive-700' : 'text-gray-500') : '';
  return <span className={`num ${cls} ${className}`}>{fmtAmount(n)}</span>;
}

export function LegendSwatch({ color, label, pattern = false }: { color: string; label: string; pattern?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={
          pattern
            ? { background: `repeating-linear-gradient(135deg, ${color} 0 2px, ${color}55 2px 5px)`, border: `1px solid ${color}` }
            : { background: color }
        }
      />
      {label}
    </span>
  );
}
