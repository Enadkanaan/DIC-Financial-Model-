import { useMemo } from 'react';
import { Activity, Boxes, Gauge as GaugeIcon, Scale, Target, TrendingUp, Wallet } from 'lucide-react';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CountUp } from '../components/CountUp';
import { Gauge } from '../components/Gauge';
import { IntegerInput } from '../components/IntegerInput';
import { InventoryConsumption } from '../components/InventoryConsumption';
import { Amount, AnimatedAmount, CategoryDot, KpiCard, LegendSwatch, Panel, ProgressBar, StatusBadge } from '../components/ui';
import { asOfLabel } from '../lib/calc';
import { AT_LIMIT_THRESHOLD, BRAND, COLORS } from '../lib/config';
import { fmtAmount, fmtCompact, fmtPct, fmtQAR, fmtSignedPct, safeDiv } from '../lib/format';
import { useModel, useModelStore } from '../store/useModelStore';

const axisTick = { fontSize: 11, fill: '#667085' };
const tooltipStyle = { fontSize: 12, borderRadius: 6, border: '1px solid #EAECF0', boxShadow: '0 4px 12px rgba(16,24,40,.08)' };
const CHART_ANIMATION_MS = 1100;

export function DashboardPage() {
  const model = useModel();
  const asOf = useModelStore((s) => s.asOf);
  const setBudget = useModelStore((s) => s.setBudget);
  const t = model.totals;

  const varianceTone = t.variance < 0 ? 'negative' : t.eacUtilization >= AT_LIMIT_THRESHOLD ? 'warning' : 'positive';
  const shownCategories = model.categories.filter((c) => c.activeLines > 0 || c.eac > 0);
  const donutData = shownCategories.filter((c) => c.eac > 0);

  /** Cumulative S-curve across the contract window. Actual and forecast series meet at the as-of month. */
  const sCurve = useMemo(() => {
    let cum = 0;
    const pts = model.timeline.filter((p) => p.inWindow);
    const lastActualIdx = pts.reduce((acc, p, i) => (p.isActual ? i : acc), -1);
    return pts.map((p, i) => {
      cum += p.total;
      return { label: p.label, monthly: p.total, actualCum: i <= lastActualIdx ? cum : null, forecastCum: i >= lastActualIdx ? cum : null };
    });
  }, [model.timeline]);

  const annual = model.years.map((y) => ({ year: String(y.year), Actual: y.actual, Projected: y.projected, Budget: y.budget }));

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Key indicators">
        <KpiCard label="Approved Budget" value={<AnimatedAmount value={t.budget} />} icon={Wallet} sub="FY2025 – FY2029 (editable below)" />
        <KpiCard
          label="Actual Spend to Date"
          value={<AnimatedAmount value={t.actual} />}
          icon={Activity}
          accent={COLORS.actual}
          delta={{ text: <CountUp value={t.actualUtilization} format={fmtPct} />, tone: 'neutral' }}
          sub={`of budget · through ${asOfLabel(asOf)}`}
        />
        <KpiCard
          label="Projected Remaining"
          value={<AnimatedAmount value={t.projected} />}
          icon={TrendingUp}
          accent={COLORS.projected}
          sub={`${t.monthsRemaining} contract months remaining`}
        />
        <KpiCard
          label="Estimate at Completion"
          value={<AnimatedAmount value={t.eac} />}
          icon={Target}
          accent={COLORS.eac}
          delta={{ text: <CountUp value={t.eacUtilization} format={fmtPct} />, tone: varianceTone }}
          sub="of approved budget"
        />
        <KpiCard
          label="Variance (Budget − EAC)"
          value={<AnimatedAmount value={t.variance} />}
          icon={Scale}
          accent={t.variance < 0 ? COLORS.negative : COLORS.positive}
          delta={{ text: <CountUp value={t.variancePct} format={fmtSignedPct} />, tone: t.variance < 0 ? 'negative' : 'positive' }}
          sub={t.variance < 0 ? 'Adverse — over budget' : 'Favourable — under budget'}
        />
        <KpiCard
          label="Inventory Units"
          unit=""
          value={
            <>
              <AnimatedAmount value={t.scheduledQty} /> / <AnimatedAmount value={t.contractQty} />
            </>
          }
          icon={Boxes}
          accent={BRAND.charcoal}
          sub={
            <>
              <CountUp value={t.deliveredQty} format={fmtAmount} /> consumed to date
              {t.overAllocatedLines > 0 && <span className="font-semibold text-negative-700">· {t.overAllocatedLines} lines over-allocated</span>}
            </>
          }
        />
      </section>

      <Panel
        title="Budget Health"
        subtitle={`Spend measured against the approved multi-year budget. Marker shows contract time elapsed (${t.monthsElapsed} of ${t.monthsTotal} months).`}
        bodyClassName="grid gap-6 p-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <Gauge
          value={t.actualUtilization}
          label="Budget Consumed (Actual)"
          caption={`${fmtQAR(t.actual)} of ${fmtQAR(t.budget)}`}
          color={COLORS.actual}
          marker={{ value: t.timeElapsedPct, label: 'Time elapsed' }}
        />
        <Gauge
          value={t.eacUtilization}
          label="Forecast at Completion"
          caption={`EAC ${fmtQAR(t.eac)}`}
          color={COLORS.eac}
          bands={[
            [0, AT_LIMIT_THRESHOLD, COLORS.positive],
            [AT_LIMIT_THRESHOLD, 100, COLORS.warning],
          ]}
        />
        <Gauge value={t.contractDrawdownPct} label="Contract Ceiling Drawdown" caption={`${fmtQAR(t.eac)} of ${fmtQAR(t.contractCeiling)} ceiling`} color={BRAND.sea} />
        <div className="flex flex-col justify-center gap-4 border-t border-gray-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <Metric label="Average monthly burn (actual)" value={t.burnRate} />
          <Metric label="Required run-rate to exhaust budget" value={t.requiredRunRate} />
          <Metric label="Projected monthly average (remaining)" value={safeDiv(t.projected, t.monthsRemaining)} />
          <Metric label="Remaining contract value" value={t.remainingContractValue} negative={t.remainingContractValue < 0} />
        </div>
      </Panel>

      <InventoryConsumption items={model.items} categories={model.categories} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Annual Budget vs Actual & Projected"
          subtitle="Stacked spend per fiscal year against the approved annual budget"
          actions={
            <>
              <LegendSwatch color={COLORS.actual} label="Actual" />
              <LegendSwatch color={COLORS.projected} label="Projected" pattern />
              <LegendSwatch color={COLORS.budget} label="Budget" />
            </>
          }
        >
          <div className="h-[300px]">
            <ResponsiveContainer>
              <ComposedChart data={annual} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="28%">
                <defs>
                  <pattern id="projHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill={`${COLORS.projected}55`} />
                    <line x1="0" y1="0" x2="0" y2="6" stroke={COLORS.projected} strokeWidth="3" />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey="year" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtQAR(Number(v)), String(n)]} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="Actual" stackId="s" fill={COLORS.actual} maxBarSize={56} animationDuration={CHART_ANIMATION_MS} />
                <Bar dataKey="Projected" stackId="s" fill="url(#projHatch)" stroke={COLORS.projected} maxBarSize={56} animationDuration={CHART_ANIMATION_MS} />
                <Line
                  dataKey="Budget"
                  type="linear"
                  stroke={COLORS.budget}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 5, fill: '#fff', stroke: COLORS.budget, strokeWidth: 2.5 }}
                  activeDot={{ r: 6 }}
                  animationDuration={CHART_ANIMATION_MS}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Spend by Category" subtitle="Estimate at completion, all years">
          <div className="relative h-[190px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="eac" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={1} stroke="#fff" animationDuration={CHART_ANIMATION_MS}>
                  {donutData.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtQAR(Number(v)), String(n)]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">EAC</p>
                <CountUp value={t.eac} format={fmtCompact} className="text-base font-semibold" />
              </div>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {shownCategories.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <CategoryDot color={c.color} />
                <span className="flex-1 truncate text-gray-700">{c.name}</span>
                <AnimatedAmount value={c.eac} className="w-24 text-right text-gray-900" />
                <CountUp value={safeDiv(c.eac, t.eac) * 100} format={fmtPct} className="w-12 text-right text-gray-500" />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Cumulative Spend Curve"
        subtitle="Monthly spend (bars) and cumulative position (lines) against the total approved budget"
        actions={
          <>
            <LegendSwatch color={COLORS.actual} label="Cumulative actual" />
            <LegendSwatch color={COLORS.projected} label="Cumulative forecast" />
            <LegendSwatch color={COLORS.budget} label="Total budget" />
          </>
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer>
            <ComposedChart data={sCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={2} />
              <YAxis yAxisId="cum" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} width={56} />
              <YAxis yAxisId="m" orientation="right" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} width={52} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v === null ? '—' : fmtQAR(Number(v)), String(n)]} />
              <Bar yAxisId="m" dataKey="monthly" name="Monthly spend" fill="#D0D5DD" maxBarSize={10} animationDuration={CHART_ANIMATION_MS} />
              <Area yAxisId="cum" dataKey="actualCum" name="Cumulative actual" type="monotone" stroke={COLORS.actual} strokeWidth={2.5} fill={`${COLORS.actual}18`} connectNulls={false} animationDuration={CHART_ANIMATION_MS} />
              <Line yAxisId="cum" dataKey="forecastCum" name="Cumulative forecast" type="monotone" stroke={COLORS.projected} strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls={false} animationDuration={CHART_ANIMATION_MS} />
              <ReferenceLine yAxisId="cum" y={t.budget} stroke={COLORS.budget} strokeDasharray="4 4" label={{ value: `Budget ${fmtCompact(t.budget)}`, position: 'insideTopLeft', fontSize: 11, fill: COLORS.budget }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel
        title="Annual Budget Plan"
        subtitle="Set the approved budget per fiscal year. Whole QAR only; all KPIs, gauges and variances recalculate instantly and every change is recorded in the Change Log."
        bodyClassName="overflow-x-auto"
      >
        <table className="fin-table w-full min-w-[980px]">
          <thead>
            <tr>
              <th className="text-left">Fiscal year</th>
              <th className="w-44">Approved budget</th>
              <th>Actual</th>
              <th>Projected</th>
              <th>EAC</th>
              <th>Variance</th>
              <th>Var. %</th>
              <th className="w-48 text-left">Utilisation (EAC)</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {model.years.map((y) => (
              <tr key={y.year}>
                <td className="text-left font-semibold">FY{y.year}</td>
                <td className="py-1.5">
                  <IntegerInput value={y.budget} onCommit={(v) => setBudget(y.year, v)} ariaLabel={`Approved budget FY${y.year}`} grid={{ name: 'budget', row: y.year, col: 0 }} />
                </td>
                <td><Amount value={y.actual} /></td>
                <td><Amount value={y.projected} /></td>
                <td className="font-semibold"><Amount value={y.eac} /></td>
                <td><Amount value={y.variance} signed /></td>
                <td className={y.variance < 0 ? 'text-negative-700' : 'text-gray-600'}>{fmtSignedPct(y.variancePct)}</td>
                <td className="text-left">
                  <div className="flex items-center gap-2">
                    <ProgressBar pct={y.eacUtilization} color={y.eacUtilization >= AT_LIMIT_THRESHOLD ? COLORS.warning : COLORS.positive} />
                    <span className="num w-12 shrink-0 text-right text-xs text-gray-600">{fmtPct(y.eacUtilization)}</span>
                  </div>
                </td>
                <td className="text-left"><StatusBadge status={y.status} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-left">Total</td>
              <td className="pr-3"><Amount value={t.budget} /></td>
              <td><Amount value={t.actual} /></td>
              <td><Amount value={t.projected} /></td>
              <td><Amount value={t.eac} /></td>
              <td><Amount value={t.variance} signed /></td>
              <td>{fmtSignedPct(t.variancePct)}</td>
              <td className="text-left">
                <div className="flex items-center gap-2">
                  <ProgressBar pct={t.eacUtilization} color={COLORS.brand} />
                  <span className="num w-12 shrink-0 text-right text-xs">{fmtPct(t.eacUtilization)}</span>
                </div>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
        <p className="flex items-center gap-1.5 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          <GaugeIcon className="h-3.5 w-3.5" />
          Status: <b className="text-positive-700">Within budget</b> &lt; {AT_LIMIT_THRESHOLD}% · <b className="text-warning-700">At limit</b> {AT_LIMIT_THRESHOLD}–100% ·{' '}
          <b className="text-negative-700">Over budget</b> &gt; 100%. Budget vs contract ceiling difference: {fmtQAR(t.budget - t.contractCeiling)}.
        </p>
      </Panel>
    </>
  );
}

function Metric({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-0.5 text-base font-semibold ${negative ? 'text-negative-700' : 'text-gray-900'}`}>
        <AnimatedAmount value={value} prefix="QAR " />
      </p>
    </div>
  );
}
