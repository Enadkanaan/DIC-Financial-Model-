import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Download, History, Search, X } from 'lucide-react';
import { fmtAmount, fmtDateTime, fmtSigned } from '../lib/format';
import type { ChangeLogEntry, LogSection } from '../lib/types';
import { useModelStore } from '../store/useModelStore';

type Filter = LogSection | 'All';
const SECTIONS: Filter[] = ['All', 'Budget', 'Inventory', 'Pricing', 'Category', 'Reporting'];

const SECTION_STYLE: Record<LogSection, string> = {
  Budget: 'bg-brand-50 text-brand',
  Inventory: 'bg-actual-50 text-[#00594A]',
  Pricing: 'bg-projected-50 text-skyline',
  Category: 'bg-[#EDEAE3] text-[#5C513A]',
  Reporting: 'bg-gray-100 text-gray-700',
};

const csvCell = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function exportCsv(rows: ChangeLogEntry[]) {
  const head = ['Timestamp', 'Section', 'Item', 'Field', 'Previous', 'New', 'Impact (QAR)', 'Impact basis'];
  const body = rows.map((r) => [r.at, r.section, r.subject, r.field, r.from, r.to, r.impact ?? '', r.impactBasis ?? ''].map(csvCell).join(','));
  const blob = new Blob([[head.join(','), ...body].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dic-change-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Hidden, time-stamped change list. Opened from the header button; Esc or backdrop click closes it. */
export function ChangeLogDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const log = useModelStore((s) => s.log);
  const [section, setSection] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return log.filter(
      (e) => (section === 'All' || e.section === section) && (!q || `${e.subject} ${e.field} ${e.from} ${e.to}`.toLowerCase().includes(q)),
    );
  }, [log, section, query]);

  const days = useMemo(() => {
    const m = new Map<string, ChangeLogEntry[]>();
    rows.forEach((r) => {
      const k = new Date(r.at).toDateString();
      m.set(k, [...(m.get(k) ?? []), r]);
    });
    return [...m.entries()];
  }, [rows]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Change log">
      <div className="absolute inset-0 bg-black/30 animate-fade" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[680px] flex-col bg-white shadow-2xl animate-slide">
        <div className="h-1.5 bg-brand" />
        <header className="flex items-start justify-between gap-3 border-b border-brand/15 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-brand">
              <History className="h-4 w-4" /> Change Log
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Every edit to budgets, quantities, prices, categories and the reporting period, newest first.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCsv(rows)}
              disabled={rows.length === 0}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button ref={closeRef} onClick={onClose} aria-label="Close change log" className="grid h-8 w-8 place-items-center rounded-md text-gray-500 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3">
          <select
            aria-label="Filter by section"
            value={section}
            onChange={(e) => setSection(e.target.value as Filter)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All sections' : s}
              </option>
            ))}
          </select>
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item, field or value"
              className="h-8 w-full rounded-md border border-gray-200 pl-8 pr-2 text-xs outline-none focus:border-brand"
            />
          </label>
          <span className="text-xs text-gray-500">
            <b className="num">{fmtAmount(rows.length)}</b> of <span className="num">{fmtAmount(log.length)}</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-gray-500">
              <History className="h-8 w-8 text-gray-300" />
              {log.length === 0 ? 'No changes yet. Edits made on any page will appear here.' : 'No entries match the current filters.'}
            </div>
          ) : (
            <ol>
              {days.map(([day, list]) => (
                <Fragment key={day}>
                  <li className="sticky top-0 z-10 border-y border-gray-100 bg-gray-50 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                    {new Date(list[0].at).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    <span className="font-normal normal-case text-gray-500"> · {list.length} change(s)</span>
                  </li>
                  {list.map((e) => (
                    <li key={e.id} className="border-b border-gray-100 px-5 py-3 hover:bg-gray-50/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SECTION_STYLE[e.section]}`}>{e.section}</span>
                          <span className="truncate text-[13px] font-semibold text-gray-900" title={e.subject}>{e.subject}</span>
                        </span>
                        <time className="num shrink-0 text-[11px] text-gray-500" dateTime={e.at}>{fmtDateTime(e.at)}</time>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-gray-500">{e.field}:</span>
                          <span className="num rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 line-through decoration-gray-400">{e.from}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                          <span className="num rounded px-1.5 py-0.5 font-semibold text-gray-900 ring-1 ring-gray-200">{e.to}</span>
                        </span>
                        {e.impact !== undefined && e.impact !== 0 && (
                          <span className="num font-semibold text-gray-900">
                            {fmtSigned(e.impact)} <span className="font-normal text-gray-500">QAR · {e.impactBasis}</span>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </Fragment>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}
