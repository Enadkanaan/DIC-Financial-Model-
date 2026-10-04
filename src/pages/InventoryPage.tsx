import { Fragment, useMemo, useState } from 'react';
import { AlertTriangle, Info, Search } from 'lucide-react';
import { IntegerInput } from '../components/IntegerInput';
import { Amount, CategoryDot, LegendSwatch, Panel, StatTile, StatusBadge, YearSelect } from '../components/ui';
import { asOfLabel, inProjectWindow, isActualMonth, qtyOf, viewLabel } from '../lib/calc';
import { COLORS, MONTHS, YEARS } from '../lib/config';
import { fmtAmount, fmtQAR } from '../lib/format';
import type { CategorySummary, ItemSummary, YearView } from '../lib/types';
import { useModel, useModelStore } from '../store/useModelStore';

export function InventoryPage() {
  const model = useModel();
  const asOf = useModelStore((s) => s.asOf);
  const [view, setView] = useState<YearView>(asOf.year);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  // Lines with zero contract quantity and nothing scheduled are hidden until a quantity is set on Pricing Structure.
  const activeItems = model.items.filter((r) => r.active);
  const hiddenCount = model.items.length - activeItems.length;
  const categories = model.categories.filter((c) => c.activeLines > 0);

  const rows = activeItems.filter((r) => {
    if (category !== 'All' && r.item.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || `${r.item.name} ${r.item.category}`.toLowerCase().includes(q);
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ItemSummary[]>();
    rows.forEach((r) => map.set(r.item.category, [...(map.get(r.item.category) ?? []), r]));
    return categories.filter((c) => map.has(c.name)).map((c) => [c, map.get(c.name)!] as const);
  }, [rows, categories]);

  const t = model.totals;
  const ys = view === 'all' ? null : model.years.find((y) => y.year === view)!;
  const overAllocated = activeItems.filter((r) => r.status === 'OVER-ALLOCATED');

  return (
    <>
      <section className="grid gap-4 md:grid-cols-4" key={String(view)}>
        <StatTile label={`${viewLabel(view)} scheduled value`} value={ys ? ys.eac : t.eac} />
        <StatTile label="Actual (delivered)" value={ys ? ys.actual : t.actual} color={COLORS.actual} />
        <StatTile label="Projected (planned)" value={ys ? ys.projected : t.projected} color={COLORS.projectedText} />
        <StatTile
          label={`${viewLabel(view)} budget headroom`}
          value={ys ? ys.variance : t.variance}
          color={(ys ? ys.variance : t.variance) < 0 ? COLORS.negative : COLORS.positive}
        />
      </section>

      {overAllocated.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-negative-700/20 bg-negative-50 px-4 py-3 text-sm text-negative-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <b>{overAllocated.length} line(s) scheduled beyond contract inventory:</b>{' '}
            {overAllocated.map((r) => `${r.item.name}: ${fmtAmount(-r.remainingQty)} unit(s) over, ${fmtQAR(-r.remainingValue)}`).join(' · ')}
          </p>
        </div>
      )}

      <Panel
        title={view === 'all' ? 'Delivery Quantities — Overall by Fiscal Year' : `Monthly Delivery Quantities — ${viewLabel(view)}`}
        subtitle={
          <>
            {view === 'all'
              ? 'Read-only summary of units per fiscal year. Choose a fiscal year to enter monthly quantities.'
              : `Enter whole units delivered or planned per month. Value = quantity × unit rate from Pricing Structure. Months up to ${asOfLabel(asOf)} are treated as actuals.`}
            {hiddenCount > 0 && ` ${hiddenCount} zero-quantity line(s) are hidden — set a contract quantity on Pricing Structure to bring them back.`}
          </>
        }
        actions={
          view === 'all' ? undefined : (
            <>
              <LegendSwatch color={COLORS.actual} label="Actual month" />
              <LegendSwatch color={COLORS.projected} label="Projected month" />
            </>
          )
        }
        bodyClassName=""
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
          <YearSelect value={view} onChange={setView} />
          <select
            aria-label="Category filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium"
          >
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search line item"
              className="h-8 w-56 rounded-md border border-gray-200 pl-8 pr-2 text-xs outline-none focus:border-brand"
            />
          </label>
          {view !== 'all' && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-gray-500">
              <Info className="h-3.5 w-3.5" /> Enter ↓ next row · Esc cancel · ↑/↓ ±1 (Shift ±10)
            </span>
          )}
        </div>

        {view === 'all' ? <OverallGrid grouped={grouped} empty={rows.length === 0} /> : <MonthlyGrid year={view} grouped={grouped} rows={rows} />}
      </Panel>
    </>
  );
}

type Groups = (readonly [CategorySummary, ItemSummary[]])[];

function GroupRow({ cat, count, cols }: { cat: CategorySummary; count: number; cols: number }) {
  return (
    <tr className="group-row">
      <td colSpan={cols} className="text-left">
        <span className="sticky left-3 inline-flex items-center gap-2">
          <CategoryDot color={cat.color} /> {cat.name}
          <span className="font-normal normal-case text-gray-500">· {count} line(s)</span>
        </span>
      </td>
    </tr>
  );
}

function ItemCell({ r }: { r: ItemSummary }) {
  return (
    <td className="sticky left-0 z-10 max-w-[256px] bg-white text-left shadow-[1px_0_0_#EAECF0]">
      <p className="truncate font-medium text-gray-900" title={r.item.name}>{r.item.name}</p>
      <p className="text-[11px] text-gray-500">per {r.item.unit}</p>
    </td>
  );
}

function MonthlyGrid({ year, grouped, rows }: { year: number; grouped: Groups; rows: ItemSummary[] }) {
  const deliveries = useModelStore((s) => s.deliveries);
  const asOf = useModelStore((s) => s.asOf);
  const setQty = useModelStore((s) => s.setQty);
  const monthMeta = MONTHS.map((_, m) => ({ inWindow: inProjectWindow(year, m), actual: isActualMonth(year, m, asOf) }));
  const colTotals = MONTHS.map((_, m) => rows.reduce((s, r) => s + qtyOf(deliveries, r.item.id, year, m) * r.item.unitCost, 0));
  const COLS = 2 + 12 + 6;
  let gridRow = 0;

  return (
    <div className="max-h-[68vh] overflow-auto">
      <table className="fin-table entry-table w-full min-w-[1620px]">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="sticky left-0 z-30 w-64 bg-gray-50 text-left shadow-[1px_0_0_#EAECF0]">Line item</th>
            <th className="w-24">Rate (QAR)</th>
            {MONTHS.map((m, i) => (
              <th key={m} className="w-[74px]">
                <div className="flex flex-col items-end gap-0.5">
                  <span>{m}</span>
                  <span
                    className="rounded px-1 text-[9px] font-bold"
                    style={
                      !monthMeta[i].inWindow
                        ? { background: '#F2F4F7', color: '#98A2B3' }
                        : monthMeta[i].actual
                          ? { background: `${COLORS.actual}1f`, color: '#00715D' }
                          : { background: `${COLORS.projected}22`, color: COLORS.projectedText }
                    }
                  >
                    {!monthMeta[i].inWindow ? 'N/A' : monthMeta[i].actual ? 'ACT' : 'FCST'}
                  </span>
                </div>
              </th>
            ))}
            <th className="w-20 bg-gray-100">FY qty</th>
            <th className="w-32 bg-gray-100">FY value</th>
            <th className="w-20">Sched. total</th>
            <th className="w-20">Contract</th>
            <th className="w-20">Balance</th>
            <th className="w-28 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([cat, list]) => (
            <Fragment key={cat.name}>
              <GroupRow cat={cat} count={list.length} cols={COLS} />
              {list.map((r) => {
                const row = gridRow++;
                return (
                  <tr key={r.item.id}>
                    <ItemCell r={r} />
                    <td className="text-gray-600"><Amount value={r.item.unitCost} /></td>
                    {MONTHS.map((m, i) => (
                      <td key={m} className="min-w-[72px] px-1 py-1">
                        <IntegerInput
                          value={qtyOf(deliveries, r.item.id, year, i)}
                          onCommit={(v) => setQty(r.item.id, year, i, v)}
                          ariaLabel={`${r.item.name} ${m} ${year} quantity`}
                          disabled={!monthMeta[i].inWindow}
                          tone={monthMeta[i].actual ? 'actual' : 'projected'}
                          grid={{ name: 'inv', row, col: i }}
                        />
                      </td>
                    ))}
                    <td className="bg-gray-50 font-semibold">{fmtAmount(r.byYearQty[year] ?? 0)}</td>
                    <td className="bg-gray-50 font-semibold"><Amount value={r.byYearValue[year] ?? 0} /></td>
                    <td>{fmtAmount(r.scheduledQty)}</td>
                    <td className="text-gray-600">{fmtAmount(r.item.contractQty)}</td>
                    <td className={r.remainingQty < 0 ? 'font-semibold text-negative-700' : ''}><Amount value={r.remainingQty} /></td>
                    <td className="text-left"><StatusBadge status={r.status} /></td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={COLS} className="py-10 text-center text-gray-500">No line items match the current filters.</td>
            </tr>
          )}
        </tbody>
        <tfoot className="sticky bottom-0 z-20">
          <tr>
            <td className="sticky left-0 z-30 bg-gray-50 text-left shadow-[1px_0_0_#EAECF0]">Value of visible lines (QAR)</td>
            <td />
            {colTotals.map((v, i) => (
              <td key={i} className="text-[12px]" style={{ color: !monthMeta[i].inWindow ? '#98A2B3' : monthMeta[i].actual ? '#00715D' : COLORS.projectedText }}>
                {monthMeta[i].inWindow ? <Amount value={v} /> : '—'}
              </td>
            ))}
            <td />
            <td><Amount value={colTotals.reduce((a, b) => a + b, 0)} /></td>
            <td colSpan={4} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function OverallGrid({ grouped, empty }: { grouped: Groups; empty: boolean }) {
  const COLS = 1 + YEARS.length + 5;
  return (
    <div className="max-h-[68vh] overflow-auto">
      <table className="fin-table w-full min-w-[1200px]">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="sticky left-0 z-30 w-64 bg-gray-50 text-left shadow-[1px_0_0_#EAECF0]">Line item</th>
            {YEARS.map((y) => (
              <th key={y}>FY{y} qty</th>
            ))}
            <th className="bg-gray-100">Total qty</th>
            <th className="bg-gray-100">Total value</th>
            <th>Contract</th>
            <th>Balance</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([cat, list]) => (
            <Fragment key={cat.name}>
              <GroupRow cat={cat} count={list.length} cols={COLS} />
              {list.map((r) => (
                <tr key={r.item.id}>
                  <ItemCell r={r} />
                  {YEARS.map((y) => (
                    <td key={y} className={r.byYearQty[y] ? 'text-gray-900' : 'text-gray-300'}>{fmtAmount(r.byYearQty[y] ?? 0)}</td>
                  ))}
                  <td className="bg-gray-50 font-semibold">{fmtAmount(r.scheduledQty)}</td>
                  <td className="bg-gray-50 font-semibold"><Amount value={r.scheduledValue} /></td>
                  <td className="text-gray-600">{fmtAmount(r.item.contractQty)}</td>
                  <td className={r.remainingQty < 0 ? 'font-semibold text-negative-700' : ''}><Amount value={r.remainingQty} /></td>
                  <td className="text-left"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </Fragment>
          ))}
          {empty && (
            <tr>
              <td colSpan={COLS} className="py-10 text-center text-gray-500">No line items match the current filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
