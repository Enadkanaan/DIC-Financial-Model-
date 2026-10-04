import { useRef, useState, type KeyboardEvent } from 'react';
import { fmtAmount } from '../lib/format';

interface IntegerInputProps {
  value: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  /** Grid coordinates enable spreadsheet-style Enter navigation inside a named grid. */
  grid?: { name: string; row: number; col: number };
  tone?: 'default' | 'actual' | 'projected';
  title?: string;
}

const MAX_DIGITS = 12;
const BLOCKED_KEYS = new Set(['e', 'E', '+', '-']);

/** Keeps only characters a user may legitimately type while editing (digits, separators, one decimal point). */
const sanitiseDraft = (raw: string): string => {
  const kept = raw.replace(/[^\d.,\s]/g, '');
  const i = kept.indexOf('.');
  return (i === -1 ? kept : kept.slice(0, i + 1) + kept.slice(i + 1).replace(/\./g, '')).slice(0, 20);
};

/**
 * Normalises text to a whole-number string. Separators/spaces are removed; a decimal part is ROUNDED
 * (never concatenated), so "6,000,000.75" -> "6000001" and "1 250.4" -> "1250".
 */
export const normaliseIntegerText = (raw: string): string => {
  const cleaned = raw.replace(/[,\s]/g, '');
  if (cleaned.includes('.')) {
    const n = Number.parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? String(Math.round(n)).slice(0, MAX_DIGITS) : '';
  }
  return cleaned.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS);
};

/**
 * Whole-number entry control. Shows thousands separators at rest; opens empty for zero and fully
 * selected otherwise. Enter / Tab commit, Escape cancels, ↑/↓ step by 1 (Shift = 10), Enter moves down a grid row.
 */
export function IntegerInput({ value, onCommit, ariaLabel, disabled, className = '', grid, tone = 'default', title }: IntegerInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const cancelled = useRef(false);
  const justFocused = useRef(false);
  const ref = useRef<HTMLInputElement>(null);
  const rounded = Math.round(value);

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      setEditing(false);
      return;
    }
    const text = normaliseIntegerText(draft);
    const n = text === '' ? 0 : Number.parseInt(text, 10);
    if (Number.isSafeInteger(n) && n !== rounded) onCommit(n);
    setEditing(false);
  };

  const focusCell = (row: number, col: number) => {
    if (!grid) return;
    document
      .querySelector<HTMLInputElement>(`input[data-grid="${grid.name}"][data-row="${row}"][data-col="${col}"]:not(:disabled)`)
      ?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_KEYS.has(e.key)) {
      e.preventDefault();
    } else if (e.key === 'Escape') {
      cancelled.current = true;
      ref.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
      if (grid) focusCell(grid.row + (e.shiftKey ? -1 : 1), grid.col);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1);
      const t = normaliseIntegerText(draft);
      const cur = t === '' ? 0 : Number.parseInt(t, 10);
      setDraft(String(Math.max(0, cur + step)));
    }
  };

  const toneCls =
    tone === 'actual' ? 'bg-actual-50/60 focus:bg-white' : tone === 'projected' ? 'bg-projected-50/60 focus:bg-white' : 'bg-white';

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      data-grid={grid?.name}
      data-row={grid?.row}
      data-col={grid?.col}
      value={editing ? draft : disabled ? '' : fmtAmount(rounded)}
      onFocus={(e) => {
        justFocused.current = true;
        setEditing(true);
        setDraft(rounded > 0 ? String(rounded) : '');
        const el = e.currentTarget;
        requestAnimationFrame(() => el.select());
      }}
      onMouseUp={(e) => {
        if (justFocused.current) {
          e.preventDefault();
          justFocused.current = false;
          e.currentTarget.select();
        }
      }}
      onChange={(e) => setDraft(sanitiseDraft(e.target.value))}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={`num h-8 w-full rounded border border-gray-200 px-2 text-right text-[13px] text-gray-900 outline-none transition
        hover:border-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20
        disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-50 ${toneCls} ${className}`}
    />
  );
}
