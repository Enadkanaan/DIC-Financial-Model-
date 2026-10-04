import { useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Check,
  ClipboardList,
  GripVertical,
  History,
  Landmark,
  LayoutDashboard,
  ListOrdered,
  Tags,
} from 'lucide-react';
import { asOfLabel, projectMonths } from '../lib/calc';
import { fmtDateTime } from '../lib/format';
import type { PageId } from '../lib/types';
import { useModelStore } from '../store/useModelStore';
import { ChangeLogDrawer } from './ChangeLogDrawer';

export const PAGES: Record<PageId, { label: string; description: string; icon: typeof LayoutDashboard }> = {
  dashboard: { label: 'Dashboard', description: 'KPIs, gauges & consumption', icon: LayoutDashboard },
  inventory: { label: 'Inventory Entry', description: 'Monthly delivery quantities', icon: ClipboardList },
  pricing: { label: 'Pricing Structure', description: 'Rates, quantities & categories', icon: Tags },
  monthly: { label: 'Monthly Overview', description: 'Actual vs projected by month', icon: CalendarRange },
};

export function Layout({ page, onNavigate, children }: { page: PageId; onNavigate: (p: PageId) => void; children: ReactNode }) {
  const asOf = useModelStore((s) => s.asOf);
  const setAsOf = useModelStore((s) => s.setAsOf);
  const log = useModelStore((s) => s.log);
  const navOrder = useModelStore((s) => s.navOrder);
  const moveNav = useModelStore((s) => s.moveNav);
  const [arranging, setArranging] = useState(false);
  const [dragging, setDragging] = useState<PageId | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const months = projectMonths();
  const current = PAGES[page];

  return (
    <div className="min-h-screen bg-canvas text-gray-900">
      <div className="h-1.5 bg-brand" />
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
          <div className="flex items-center gap-2.5 border-b border-brand/15 px-5 py-5">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-brand text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-brand">DIC Finance</p>
              <p className="text-[11px] text-gray-500">Budget & Inventory Control</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 pb-1 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Menu</p>
            <button
              onClick={() => setArranging((v) => !v)}
              aria-pressed={arranging}
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition ${
                arranging ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {arranging ? <Check className="h-3.5 w-3.5" /> : <ListOrdered className="h-3.5 w-3.5" />}
              {arranging ? 'Done' : 'Reorder'}
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 pb-3" aria-label="Primary">
            {navOrder.map((id, index) => {
              const { label, description, icon: Icon } = PAGES[id];
              const active = id === page;
              return (
                <div
                  key={id}
                  draggable={arranging}
                  onDragStart={(e) => {
                    setDragging(id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!arranging || !dragging) return;
                    e.preventDefault();
                    if (dragging !== id) moveNav(dragging, index);
                  }}
                  onDragEnd={() => setDragging(null)}
                  className={`group flex items-center gap-1 rounded-md transition ${
                    arranging ? 'cursor-grab border border-dashed border-gray-300 bg-gray-50' : ''
                  } ${dragging === id ? 'opacity-50' : ''}`}
                >
                  {arranging && <GripVertical className="ml-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />}
                  <button
                    onClick={() => !arranging && onNavigate(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-w-0 flex-1 items-start gap-3 rounded-md px-3 py-2.5 text-left transition ${
                      active && !arranging ? 'bg-brand-50 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold">{label}</span>
                      <span className="block truncate text-[11px] text-gray-500">{description}</span>
                    </span>
                  </button>
                  {arranging && (
                    <span className="flex flex-col pr-1">
                      <button
                        aria-label={`Move ${label} up`}
                        disabled={index === 0}
                        onClick={() => moveNav(id, index - 1)}
                        className="rounded p-0.5 text-gray-500 hover:bg-white hover:text-brand disabled:opacity-25"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        aria-label={`Move ${label} down`}
                        disabled={index === navOrder.length - 1}
                        onClick={() => moveNav(id, index + 1)}
                        className="rounded p-0.5 text-gray-500 hover:bg-white hover:text-brand disabled:opacity-25"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
            {arranging && <p className="px-2 pt-1 text-[11px] text-gray-500">Drag items or use the arrows. The order is saved automatically.</p>}
          </nav>

          <div className="border-t border-brand/15 p-4 text-[11px] leading-relaxed text-gray-500">
            Contract window Sep 2025 – Aug 2029
            <br />
            Source: DIC Delivery & Billing workbook
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">DIC Programs · Multi-Year Financial Model</p>
                <h1 className="text-lg font-bold text-gray-900">{current.label}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs">
                  <span className="font-semibold text-gray-500">Actuals through</span>
                  <select
                    className="num cursor-pointer bg-transparent font-semibold text-gray-900 outline-none"
                    value={`${asOf.year}-${asOf.month}`}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split('-').map(Number);
                      setAsOf({ year: y, month: m });
                    }}
                  >
                    {months.map((m) => (
                      <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                        {asOfLabel(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600">All figures in QAR</span>
                <button
                  onClick={() => setLogOpen(true)}
                  aria-haspopup="dialog"
                  className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white"
                  title={log[0] ? `Last change ${fmtDateTime(log[0].at)}` : 'No changes yet'}
                >
                  <History className="h-3.5 w-3.5" />
                  Change log
                  <span className="num rounded-full bg-brand px-1.5 text-[10px] text-white">{log.length}</span>
                  {log[0] && <span className="num hidden font-normal opacity-80 xl:inline">· last {fmtDateTime(log[0].at)}</span>}
                </button>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-3 py-2 lg:hidden" aria-label="Primary mobile">
              {navOrder.map((id) => {
                const { label, icon: Icon } = PAGES[id];
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                      id === page ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="mx-auto max-w-[1680px] space-y-6 px-5 py-6 md:px-8">{children}</main>
        </div>
      </div>
      <ChangeLogDrawer open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
