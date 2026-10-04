import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Amount, CategoryDot, LegendSwatch, Panel, StatTile, YearSelect } from '../components/ui';
import { asOfLabel, qtyOf, viewLabel } from '../lib/calc';
import { COLORS, MONTHS, YEARS } from '../lib/config';
import { fmtCompact, fmtQAR } from '../lib/format';
import type { TimelinePoint, YearView } from '../lib/types';
import { useModel, useModelStore } from '../store/useModelStore';

const axisTick = { fontSize: 11, fill: '#667085' };
const tooltipStyle = { fontSize: 12, borderRadius: 6, border: '1px solid #EAECF0' };
const ACT_BG = '#E0F3EF';
const ACT_BG_EMPTY = '#F1F9F7';
const ACT_FG = '#00594A';
const PROJ_BG = '#E5F0F5';
const PROJ_BG_EMPTY = '#F4F9FB';

/** Cell colouring: actual = Palm tint, projected = Sea tint + italic, outside contract = grey. */
const cellStyle = (p: TimelinePoint, hasValue: boolean) => {
  if (!p.inWindow) return { className: 'text-gray-300', style: { background: '#F9FAFB' } };
  if (p.isActual) return { className: 'font-medium', style: { background: hasValue ? ACT_BG : ACT_BG_EMPTY, color: ACT_FG } };
  return { className: 'italic', style: { background: hasValue ? PROJ_BG : PROJ_BG_EMPTY, color: COLORS.projectedText } };
};

export function MonthlyPage() {
  const model = useModel();
  const deliveries = useModelStore((s) => s.deliveries);
  const asOf = useModelStore((s) => s.asOf);
  const [view, setView] = useState<YearView>(asOf.year);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const visibleCategories = model.categories.filter((c) => c.activeLines > 0);
  const points = view === 'all' ? model.timeline.filter((p) => p.inWindow) : model.timeline.filter((p) => p.year === view);
  const ys = view === 'all' ? null : model.years.find((y) => y.year === view)!;
  const t = model.totals;

  const chartData = useMemo(() => {
    let cum = 0;
    return points.map((p) => {
      cum += p.total;
      return { label: view === 'all' ? p.label : MONTHS[p.month], Actual: p.actual, Projected: p.projected, Cumulative: cum };
    });
  }, [points, view]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <YearSelect value={view} onChange={setView} />
        <div className="flex flex-wrap items-center gap-4 rounded-md border border-gray-200 bg-white px-3 py-2">
          <LegendSwatch color={COLORS.actual} label={`Actual (through ${asOfLabel(asOf)})`} />
          <LegendSwatch color={COLORS.projected} label="Projected" pattern />
          <LegendSwatch color="#D0D5DD" label="Outside contract window" />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-5" key={String(view)}>
        <StatTile label="Approved budget" value={ys ? ys.budget : t.budget} color={COLORS.brand} />
        <StatTile label="Actual" value={ys ? ys.actual : t.actual} color={COLORS.actual} />
        <StatTile label="Projected" value={ys ? ys.projected : t.projected} color={COLORS.projectedText} />
        <StatTile label="EAC" value={ys ? ys.eac : t.eac} color={COLORS.eac} />
        <StatTile label="Variance" value={ys ? ys.variance : t.variance} color={(ys ? ys.variance : t.variance) < 0 ? COLORS.negative : COLORS.positive} />
      </section>

      <Panel
        title={view === 'all' ? 'Monthly Spend — Overall Contract Window' : `Monthly Spend — ${viewLabel(view)}`}
        subtitle="Bars show monthly value split by actual and projected; the line tracks cumulative spend for the period."
      >
        <div className="h-[320px]">
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <pattern id="projHatchM" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill={`${COLORS.projected}55`} />
                  <line x1="0" y1="0" x2="0" y2="6" stroke={COLORS.projected} strokeWidth="3" />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={view === 'all' ? 2 : 0} />
              <YAxis yAxisId="m" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} width={56} />
              <YAxis yAxisId="c" orientation="right" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} width={56} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtQAR(Number(v)), String(n)]} cursor={{ fill: '#F9FAFB' }} />
              <Bar yAxisId="m" dataKey="Actual" stackId="s" fill={COLORS.actual} maxBarSize={view === 'all' ? 14 : 40} animationDuration={1100} />
              <Bar yAxisId="m" dataKey="Projected" stackId="s" fill="url(#projHatchM)" stroke={COLORS.projected} maxBarSize={view === 'all' ? 14 : 40} animationDuration={1100} />
              <Line yAxisId="c" dataKey="Cumulative" type="monotone" stroke={COLORS.eac} strokeWidth={2} dot={false} animationDuration={1100} />
              <ReferenceLine
                yAxisId="c"
                y={ys ? ys.budget : t.budget}
                stroke={COLORS.budget}
                strokeDasharray="4 4"
                label={{ value: `${ys ? 'FY' : 'Total'} budget ${fmtCompact(ys ? ys.budget : t.budget)}`, position: 'insideTopLeft', fontSize: 11, fill: COLORS.budget }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {view === 'all' ? (
        <AllYearsMatrix />
      ) : (
        <Panel title={`Monthly Matrix — ${viewLabel(view)}`} subtitle="Category totals; expand a category to see line-item detail. Amounts in QAR." bodyClassName="">
          <div className="overflow-x-auto">
            <table className="fin-table w-full min-w-[1500px]">
              <thead>
                <tr>
                  <th className="w-72 text-left">Category / line item</th>
                  {points.map((p) => (
                    <th key={p.month} style={{ color: !p.inWindow ? '#98A2B3' : p.isActual ? ACT_FG : COLORS.projectedText }}>
                      {MONTHS[p.month]}
                      <span className="block text-[9px] font-bold">{!p.inWindow ? 'N/A' : p.isActual ? 'ACT' : 'FCST'}</span>
                    </th>
                  ))}
                  <th className="bg-gray-100" style={{ color: ACT_FG }}>FY actual</th>
                  <th className="bg-gray-100" style={{ color: COLORS.projectedText }}>FY projected</th>
                  <th className="bg-gray-100">FY total</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((c) => {
                  const open = !!expanded[c.name];
                  const catItems = model.items.filter((r) => r.active && r.item.category === c.name);
                  const vals = points.map((p) => p.byCategory[c.name] ?? 0);
                  const act = points.reduce((s, p, i) => s + (p.isActual ? vals[i] : 0), 0);
                  const proj = points.reduce((s, p, i) => s + (p.isActual ? 0 : vals[i]), 0);
                  return (
                    <Fragment key={c.name}>
                      <tr className="cursor-pointer hover:bg-gray-50" onClick={() => setExpanded((e) => ({ ...e, [c.name]: !open }))}>
                        <td className="text-left font-semibold">
                          <span className="inline-flex items-center gap-2">
                            {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                            <CategoryDot color={c.color} /> {c.name}
                            <span className="text-[11px] font-normal text-gray-400">({catItems.length})</span>
                          </span>
                        </td>
                        {points.map((p, i) => {
                          const s = cellStyle(p, vals[i] !== 0);
                          return (
                            <td key={p.month} className={s.className} style={s.style}>
                              {p.inWindow ? (vals[i] ? <Amount value={vals[i]} /> : '–') : ''}
                            </td>
                          );
                        })}
                        <td className="bg-gray-50"><Amount value={act} /></td>
                        <td className="bg-gray-50 italic"><Amount value={proj} /></td>
                        <td className="bg-gray-50 font-semibold"><Amount value={act + proj} /></td>
                      </tr>
                      {open &&
                        catItems.map((r) => {
                          const iv = points.map((p) => qtyOf(deliveries, r.item.id, p.year, p.month) * r.item.unitCost);
                          const ia = points.reduce((s, p, i) => s + (p.isActual ? iv[i] : 0), 0);
                          const ip = points.reduce((s, p, i) => s + (p.isActual ? 0 : iv[i]), 0);
                          return (
                            <tr key={r.item.id} className="text-[12px]">
                              <td className="max-w-[288px] truncate pl-10 text-left text-gray-600" title={r.item.name}>{r.item.name}</td>
                              {points.map((p, i) => {
                                const s = cellStyle(p, iv[i] !== 0);
                                return (
                                  <td key={p.month} className={s.className} style={{ ...s.style, opacity: 0.9 }}>
                                    {p.inWindow ? (iv[i] ? <Amount value={iv[i]} /> : '') : ''}
                                  </td>
                                );
                              })}
                              <td className="bg-gray-50"><Amount value={ia} /></td>
                              <td className="bg-gray-50 italic"><Amount value={ip} /></td>
                              <td className="bg-gray-50"><Amount value={ia + ip} /></td>
                            </tr>
                          );
                        })}
                    </Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <MatrixFooter points={points} budget={ys!.budget} actual={ys!.actual} projected={ys!.projected} />
              </tfoot>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
}

function MatrixFooter({ points, budget, actual, projected }: { points: TimelinePoint[]; budget: number; actual: number; projected: number }) {
  let cum = 0;
  const cums = points.map((p) => (cum += p.total));
  return (
    <>
      <tr>
        <td className="text-left">Monthly total</td>
        {points.map((p) => {
          const s = cellStyle(p, p.total !== 0);
          return (
            <td key={p.month} className={s.className} style={s.style}>
              {p.inWindow ? <Amount value={p.total} /> : ''}
            </td>
          );
        })}
        <td><Amount value={actual} /></td>
        <td className="italic"><Amount value={projected} /></td>
        <td><Amount value={actual + projected} /></td>
      </tr>
      <tr className="text-gray-600">
        <td className="text-left font-medium">Cumulative</td>
        {points.map((p, i) => (
          <td key={p.month} className="font-normal">{p.inWindow ? <Amount value={cums[i]} /> : ''}</td>
        ))}
        <td colSpan={3} />
      </tr>
      <tr className="text-gray-600">
        <td className="text-left font-medium">Budget remaining</td>
        {points.map((p, i) => (
          <td key={p.month} className="font-normal">{p.inWindow ? <Amount value={budget - cums[i]} signed /> : ''}</td>
        ))}
        <td colSpan={2} />
        <td><Amount value={budget - actual - projected} signed /></td>
      </tr>
    </>
  );
}

function AllYearsMatrix() {
  const model = useModel();
  const visibleCategories = model.categories.filter((c) => c.activeLines > 0);
  return (
    <Panel title="Category × Fiscal Year" subtitle="Each year shows actual and projected spend separately. Amounts in QAR." bodyClassName="overflow-x-auto">
      <table className="fin-table w-full min-w-[1400px]">
        <thead>
          <tr>
            <th rowSpan={2} className="w-56 text-left">Category</th>
            {YEARS.map((y) => (
              <th key={y} colSpan={2} className="border-l border-gray-200 text-center">FY{y}</th>
            ))}
            <th colSpan={3} className="border-l border-gray-200 bg-gray-100 text-center">Overall</th>
          </tr>
          <tr>
            {YEARS.map((y) => (
              <Fragment key={y}>
                <th className="border-l border-gray-200" style={{ color: ACT_FG }}>Actual</th>
                <th style={{ color: COLORS.projectedText }}>Projected</th>
              </Fragment>
            ))}
            <th className="border-l border-gray-200 bg-gray-100" style={{ color: ACT_FG }}>Actual</th>
            <th className="bg-gray-100" style={{ color: COLORS.projectedText }}>Projected</th>
            <th className="bg-gray-100">EAC</th>
          </tr>
        </thead>
        <tbody>
          {visibleCategories.map((c) => (
            <tr key={c.name}>
              <td className="text-left font-semibold">
                <span className="inline-flex items-center gap-2"><CategoryDot color={c.color} /> {c.name}</span>
              </td>
              {YEARS.map((y) => {
                const pts = model.timeline.filter((p) => p.year === y);
                const a = pts.reduce((s, p) => s + (p.isActual ? p.byCategory[c.name] ?? 0 : 0), 0);
                const pr = pts.reduce((s, p) => s + (p.isActual ? 0 : p.byCategory[c.name] ?? 0), 0);
                return (
                  <Fragment key={y}>
                    <td className="border-l border-gray-100" style={{ background: a ? ACT_BG : undefined, color: ACT_FG }}>{a ? <Amount value={a} /> : '–'}</td>
                    <td className="italic" style={{ background: pr ? PROJ_BG : undefined, color: COLORS.projectedText }}>{pr ? <Amount value={pr} /> : '–'}</td>
                  </Fragment>
                );
              })}
              <td className="border-l border-gray-100 bg-gray-50"><Amount value={c.actual} /></td>
              <td className="bg-gray-50 italic"><Amount value={c.projected} /></td>
              <td className="bg-gray-50 font-semibold"><Amount value={c.eac} /></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="text-left">Total</td>
            {model.years.map((y) => (
              <Fragment key={y.year}>
                <td className="border-l border-gray-200"><Amount value={y.actual} /></td>
                <td className="italic"><Amount value={y.projected} /></td>
              </Fragment>
            ))}
            <td className="border-l border-gray-200"><Amount value={model.totals.actual} /></td>
            <td className="italic"><Amount value={model.totals.projected} /></td>
            <td><Amount value={model.totals.eac} /></td>
          </tr>
          <tr className="text-gray-600">
            <td className="text-left font-medium">Approved budget</td>
            {model.years.map((y) => (
              <td key={y.year} colSpan={2} className="border-l border-gray-200 text-center font-normal"><Amount value={y.budget} /></td>
            ))}
            <td colSpan={2} className="border-l border-gray-200" />
            <td><Amount value={model.totals.budget} /></td>
          </tr>
          <tr className="text-gray-600">
            <td className="text-left font-medium">Variance (Budget − EAC)</td>
            {model.years.map((y) => (
              <td key={y.year} colSpan={2} className="border-l border-gray-200 text-center"><Amount value={y.variance} signed /></td>
            ))}
            <td colSpan={2} className="border-l border-gray-200" />
            <td><Amount value={model.totals.variance} signed /></td>
          </tr>
        </tfoot>
      </table>
    </Panel>
  );
}
