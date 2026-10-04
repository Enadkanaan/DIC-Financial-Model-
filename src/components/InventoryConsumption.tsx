import { useMemo, useState } from 'react';
import { asOfLabel, consumedOf, consumptionOf, viewLabel, type Consumption } from '../lib/calc';
import { COLORS, YEARS } from '../lib/config';
import { fmtAmount, fmtPct, pluralUnit, safeDiv } from '../lib/format';
import type { CategorySummary, ItemSummary, YearView } from '../lib/types';
import { useModelStore } from '../store/useModelStore';
import { CountUp, useCountUp } from './CountUp';
import { CategoryDot, LegendSwatch, Panel, YearSelect } from './ui';

const PRIOR = '#C9CED6';
const REMAINING = '#EEF0F3';
const HATCH = `repeating-linear-gradient(135deg, ${COLORS.projected} 0 3px, ${COLORS.projected}66 3px 6px)`;

/** Stacked unit bar: prior years · delivered · planned · remaining (· overflow beyond contract in red). */
function UnitBar({ c, grow, height = 'h-3' }: { c: Consumption; grow: number; height?: string }) {
  const scale = Math.max(c.contract, c.prior + c.delivered + c.planned, 1);
  const w = (n: number) => `${(safeDiv(n, scale) * 100 * grow).toFixed(3)}%`;
  const contractEdge = safeDiv(c.contract, scale) * 100;
  return (
    <div className={`relative flex w-full overflow-hidden rounded ${height}`} style={{ background: REMAINING }}>
      <span className="h-full transition-[width] duration-500" style={{ width: w(c.prior), background: PRIOR }} />
      <span className="h-full transition-[width] duration-500" style={{ width: w(c.delivered), background: COLORS.actual }} />
      <span className="h-full transition-[width] duration-500" style={{ width: w(c.planned), backgroundImage: HATCH }} />
      {c.over > 0 && (
        <>
          <span className="absolute inset-y-0 right-0 opacity-30" style={{ width: `${100 - contractEdge}%`, background: COLORS.negative }} />
          <span className="absolute inset-y-[-2px] w-0.5 bg-negative-700" style={{ left: `${contractEdge}%` }} title="Contract quantity" />
        </>
      )}
    </div>
  );
}

const usedOf = (c: Consumption) => c.prior + c.delivered + c.planned;

export function InventoryConsumption({ items, categories }: { items: ItemSummary[]; categories: CategorySummary[] }) {
  const asOf = useModelStore((s) => s.asOf);
  const [selected, setSelected] = useState<string>('all');
  const [view, setView] = useState<YearView>('all');
  const grow = useCountUp(1, 1100);

  const active = items.filter((r) => r.active && r.item.contractQty > 0);
  const grouped = useMemo(
    () => categories.map((c) => ({ cat: c, list: active.filter((r) => r.item.category === c.name) })).filter((g) => g.list.length > 0),
    [categories, active],
  );
  const current = selected === 'all' ? null : active.find((r) => r.item.id === selected) ?? null;

  return (
    <Panel
      title="Inventory vs Consumed"
      subtitle={`Contracted units against units consumed (delivered through ${asOfLabel(asOf)}) and planned. Bars are scaled per item because units differ.`}
      actions={
        <>
          <select
            aria-label="Inventory item"
            value={current ? current.item.id : 'all'}
            onChange={(e) => setSelected(e.target.value)}
            className="h-8 max-w-[280px] cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-900 outline-none hover:border-gray-400 focus:border-brand"
          >
            <option value="all">All items ({active.length})</option>
            {grouped.map(({ cat, list }) => (
              <optgroup key={cat.name} label={cat.name}>
                {list.map((r) => (
                  <option key={r.item.id} value={r.item.id}>
                    {r.item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <YearSelect value={view} onChange={setView} />
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {view !== 'all' && <LegendSwatch color={PRIOR} label="Earlier years (consumed + planned)" />}
        <LegendSwatch color={COLORS.actual} label={`Consumed${view === 'all' ? '' : ` in ${viewLabel(view)}`}`} />
        <LegendSwatch color={COLORS.projected} label={`Planned${view === 'all' ? '' : ` in ${viewLabel(view)}`}`} pattern />
        <LegendSwatch color="#D0D5DD" label="Remaining inventory" />
        <LegendSwatch color={COLORS.negative} label="Beyond contract" />
      </div>

      {current ? <ItemDetail r={current} view={view} grow={grow} color={categories.find((c) => c.name === current.item.category)?.color ?? COLORS.neutral} /> : (
        <div className="space-y-5">
          {grouped.map(({ cat, list }) => (
            <div key={cat.name}>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                <CategoryDot color={cat.color} /> {cat.name}
              </p>
              <ul className="space-y-2.5">
                {list.map((r) => {
                  const c = consumptionOf(r, view);
                  const consumed = consumedOf(c);
                  return (
                    <li key={r.item.id}>
                      <button onClick={() => setSelected(r.item.id)} className="group grid w-full grid-cols-12 items-center gap-3 rounded text-left hover:bg-gray-50">
                        <span className="col-span-12 truncate text-[13px] font-medium text-gray-900 group-hover:text-brand md:col-span-3" title={r.item.name}>
                          {r.item.name}
                        </span>
                        <span className="col-span-8 md:col-span-6">
                          <UnitBar c={c} grow={grow} />
                        </span>
                        <span className="num col-span-4 text-right text-xs text-gray-600 md:col-span-3">
                          <b className="text-gray-900">{fmtAmount(consumed)}</b> / {fmtAmount(c.contract)} {pluralUnit(r.item.unit, c.contract)}
                          <span className={`ml-1.5 font-semibold ${c.over > 0 ? 'text-negative-700' : 'text-gray-500'}`}>
                            {fmtPct(safeDiv(usedOf(c), c.contract) * 100)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="text-[11px] text-gray-500">
            Figures show units consumed / contracted; the percentage includes planned units. Select an item for its year-by-year breakdown.
          </p>
        </div>
      )}
    </Panel>
  );
}

function ItemDetail({ r, view, grow, color }: { r: ItemSummary; view: YearView; grow: number; color: string }) {
  const c = consumptionOf(r, view);
  const unit = r.item.unit;
  const consumed = consumedOf(c);
  const maxYear = Math.max(1, ...YEARS.map((y) => r.byYearQty[y] ?? 0));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <CategoryDot color={color} /> {r.item.category} · {viewLabel(view)}
        </p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          <CountUp value={consumed} format={fmtAmount} />
          <span className="ml-2 text-base font-normal text-gray-500">
            of {fmtAmount(c.contract)} {pluralUnit(unit, c.contract)} consumed
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {fmtAmount(usedOf(c))} scheduled to date incl. planned{view === 'all' ? '' : ` through ${viewLabel(view)}`} · {fmtPct(safeDiv(usedOf(c), c.contract) * 100)} of contract
        </p>
        <div className="mt-4">
          <UnitBar c={c} grow={grow} height="h-5" />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {view !== 'all' && <Stat label={`Earlier years (${fmtAmount(c.priorDelivered)} consumed)`} value={c.prior} unit={unit} swatch={PRIOR} />}
          <Stat label={view === 'all' ? 'Consumed' : `Consumed ${viewLabel(view)}`} value={c.delivered} unit={unit} swatch={COLORS.actual} />
          <Stat label={view === 'all' ? 'Planned' : `Planned ${viewLabel(view)}`} value={c.planned} unit={unit} swatch={COLORS.projected} />
          {c.over > 0 ? (
            <Stat label="Beyond contract" value={c.over} unit={unit} swatch={COLORS.negative} />
          ) : (
            <Stat label="Remaining" value={c.remaining} unit={unit} swatch="#D0D5DD" />
          )}
        </dl>
      </div>

      <div className="lg:col-span-3">
        <p className="mb-3 text-xs font-semibold text-gray-500">Units by fiscal year ({pluralUnit(unit, 2)})</p>
        <div className="flex h-48 items-end gap-4 border-b border-gray-200 px-2">
          {YEARS.map((y) => {
            const d = r.byYearDeliveredQty[y] ?? 0;
            const p = r.byYearProjectedQty[y] ?? 0;
            const dim = view !== 'all' && view !== y;
            return (
              <div key={y} className={`flex flex-1 flex-col items-center gap-1 transition-opacity ${dim ? 'opacity-35' : ''}`}>
                <span className="num text-[11px] font-semibold text-gray-700">{fmtAmount(d + p)}</span>
                <div className="flex w-full max-w-[56px] flex-col-reverse overflow-hidden rounded-t" style={{ height: `${(safeDiv(d + p, maxYear) * 150 * grow).toFixed(2)}px` }}>
                  <span style={{ height: `${safeDiv(d, d + p) * 100}%`, background: COLORS.actual }} />
                  <span style={{ height: `${safeDiv(p, d + p) * 100}%`, backgroundImage: HATCH }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-4 px-2">
          {YEARS.map((y) => (
            <span key={y} className={`flex-1 text-center text-[11px] font-semibold ${view === y ? 'text-brand' : 'text-gray-500'}`}>
              FY{y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, swatch }: { label: string; value: number; unit: string; swatch: string }) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
      <dt className="flex items-center gap-1.5 text-gray-500">
        <span className="h-2 w-2 rounded-sm" style={{ background: swatch }} /> {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-gray-900">
        <CountUp value={value} format={fmtAmount} /> <span className="text-xs font-normal text-gray-500">{pluralUnit(unit, value)}</span>
      </dd>
    </div>
  );
}

