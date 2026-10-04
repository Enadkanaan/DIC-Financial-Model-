import { AT_LIMIT_THRESHOLD, MONTHS, PROJECT_END, PROJECT_START, YEARS, categoryColorAt } from './config';
import { safeDiv } from './format';
import type {
  AsOf,
  BudgetStatus,
  CategorySummary,
  DeliveryPlan,
  InventoryStatus,
  ItemSummary,
  ModelData,
  ModelSummary,
  TimelinePoint,
  YearSummary,
  YearView,
} from './types';

/** Absolute month index used for all date comparisons. */
export const monthIndex = (year: number, month: number): number => year * 12 + month;

export const inProjectWindow = (year: number, month: number): boolean => {
  const i = monthIndex(year, month);
  return i >= monthIndex(PROJECT_START.year, PROJECT_START.month) && i <= monthIndex(PROJECT_END.year, PROJECT_END.month);
};

export const isActualMonth = (year: number, month: number, asOf: AsOf): boolean =>
  monthIndex(year, month) <= monthIndex(asOf.year, asOf.month);

/** All months inside the contract window, in chronological order. */
export const projectMonths = (): AsOf[] => {
  const out: AsOf[] = [];
  for (const year of YEARS) for (let month = 0; month < 12; month++) if (inProjectWindow(year, month)) out.push({ year, month });
  return out;
};

/** Default "actuals through" = last fully closed month, clamped to the contract window. */
export const defaultAsOf = (today: Date = new Date()): AsOf => {
  let i = monthIndex(today.getFullYear(), today.getMonth()) - 1;
  const lo = monthIndex(PROJECT_START.year, PROJECT_START.month) - 1;
  const hi = monthIndex(PROJECT_END.year, PROJECT_END.month);
  i = Math.min(hi, Math.max(lo, i));
  return { year: Math.floor(i / 12), month: i % 12 };
};

export const qtyOf = (d: DeliveryPlan, id: string, year: number, month: number): number => {
  const v = d[id]?.[String(year)]?.[month];
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
};

/** Total scheduled quantity of one item across all years. */
export const scheduledQtyOf = (d: DeliveryPlan, id: string): number =>
  Object.values(d[id] ?? {}).reduce((s, months) => s + months.reduce((a, q) => a + (Number.isFinite(q) ? q : 0), 0), 0);

/** Sanitises user input to a non-negative safe integer. */
export const toEntryInt = (v: number): number => {
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.min(Math.round(v), Number.MAX_SAFE_INTEGER);
};

/** Money is aggregated at full precision and rounded to fils (2 dp) once per reported figure. */
const fils = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100;

const inventoryStatus = (contractQty: number, scheduledQty: number): InventoryStatus => {
  if (contractQty === 0 && scheduledQty === 0) return 'NOT CONTRACTED';
  const remaining = contractQty - scheduledQty;
  if (remaining < 0) return 'OVER-ALLOCATED';
  if (remaining === 0) return 'EXHAUSTED';
  return 'AVAILABLE';
};

export const budgetStatus = (eac: number, budget: number): BudgetStatus => {
  if (eac > budget) return 'OVER BUDGET';
  if (budget > 0 && (eac / budget) * 100 >= AT_LIMIT_THRESHOLD) return 'AT LIMIT';
  return 'WITHIN BUDGET';
};

/**
 * Inventory consumption for one item in a view.
 * - Overall: delivered (actual) and planned (projected) across all years.
 * - Fiscal year: units drawn in earlier years, plus that year's delivered and planned units.
 * Remaining is measured against the contract quantity after everything up to the end of the view.
 */
export interface Consumption {
  contract: number;
  /** All units scheduled in years before the view (delivered + planned). */
  prior: number;
  /** Of `prior`, units actually delivered. */
  priorDelivered: number;
  delivered: number;
  planned: number;
  remaining: number;
  /** Units beyond the contract quantity (0 when within contract). */
  over: number;
}

export const consumptionOf = (s: ItemSummary, view: YearView): Consumption => {
  const contract = s.item.contractQty;
  let prior = 0;
  let priorDelivered = 0;
  let delivered = 0;
  let planned = 0;
  for (const y of YEARS) {
    const d = s.byYearDeliveredQty[y] ?? 0;
    const p = s.byYearProjectedQty[y] ?? 0;
    if (view === 'all' || y === view) {
      delivered += d;
      planned += p;
    } else if (y < view) {
      prior += d + p;
      priorDelivered += d;
    }
  }
  const used = prior + delivered + planned;
  return { contract, prior, priorDelivered, delivered, planned, remaining: Math.max(0, contract - used), over: Math.max(0, used - contract) };
};

export function computeModel(data: ModelData): ModelSummary {
  const { items, categories, deliveries, budgets, asOf } = data;
  const firstYear = YEARS[0];

  const timeline: TimelinePoint[] = [];
  for (const year of YEARS) {
    for (let month = 0; month < 12; month++) {
      timeline.push({
        year,
        month,
        label: `${MONTHS[month]} ${String(year).slice(2)}`,
        inWindow: inProjectWindow(year, month),
        isActual: isActualMonth(year, month, asOf),
        actual: 0,
        projected: 0,
        total: 0,
        byCategory: {},
      });
    }
  }
  const tl = (year: number, month: number) => timeline[(year - firstYear) * 12 + month];

  const yearActual: Record<number, number> = {};
  const yearProjected: Record<number, number> = {};
  for (const y of YEARS) {
    yearActual[y] = 0;
    yearProjected[y] = 0;
  }

  // Categories in user-defined order; colour follows position so the first five use the solid brand palette.
  const catMap = new Map<string, CategorySummary>();
  const addCat = (name: string) =>
    catMap.set(name, { name, color: categoryColorAt(catMap.size), activeLines: 0, totalLines: 0, actual: 0, projected: 0, eac: 0, contractValue: 0 });
  categories.forEach((c) => addCat(c.name));

  const itemSummaries: ItemSummary[] = items.map((item) => {
    let scheduledQty = 0;
    let deliveredQty = 0;
    let actualValue = 0;
    let projectedValue = 0;
    const byYearQty: Record<number, number> = {};
    const byYearDeliveredQty: Record<number, number> = {};
    const byYearProjectedQty: Record<number, number> = {};
    const byYearValue: Record<number, number> = {};

    for (const year of YEARS) {
      let yq = 0;
      let yd = 0;
      let yv = 0;
      for (let month = 0; month < 12; month++) {
        const q = qtyOf(deliveries, item.id, year, month);
        if (q === 0) continue;
        const amount = q * item.unitCost;
        const point = tl(year, month);
        yq += q;
        yv += amount;
        if (point.isActual) {
          point.actual += amount;
          actualValue += amount;
          deliveredQty += q;
          yd += q;
          yearActual[year] += amount;
        } else {
          point.projected += amount;
          projectedValue += amount;
          yearProjected[year] += amount;
        }
        point.byCategory[item.category] = (point.byCategory[item.category] ?? 0) + amount;
      }
      byYearQty[year] = yq;
      byYearDeliveredQty[year] = yd;
      byYearProjectedQty[year] = yq - yd;
      byYearValue[year] = fils(yv);
      scheduledQty += yq;
    }

    const contractValue = item.contractQty * item.unitCost;
    const scheduledValue = actualValue + projectedValue;
    const active = item.contractQty > 0 || scheduledQty > 0;

    if (!catMap.has(item.category)) addCat(item.category);
    const cat = catMap.get(item.category)!;
    cat.totalLines += 1;
    if (active) cat.activeLines += 1;
    cat.actual += actualValue;
    cat.projected += projectedValue;
    cat.eac += scheduledValue;
    cat.contractValue += contractValue;

    return {
      item,
      active,
      scheduledQty,
      deliveredQty,
      remainingQty: item.contractQty - scheduledQty,
      contractValue: fils(contractValue),
      scheduledValue: fils(scheduledValue),
      actualValue: fils(actualValue),
      projectedValue: fils(projectedValue),
      remainingValue: fils(contractValue - scheduledValue),
      drawdownPct: safeDiv(scheduledValue, contractValue) * 100,
      byYearQty,
      byYearDeliveredQty,
      byYearProjectedQty,
      byYearValue,
      status: inventoryStatus(item.contractQty, scheduledQty),
    };
  });

  for (const p of timeline) {
    p.actual = fils(p.actual);
    p.projected = fils(p.projected);
    p.total = fils(p.actual + p.projected);
  }

  const years: YearSummary[] = YEARS.map((year) => {
    const budget = budgets[String(year)] ?? 0;
    const actual = fils(yearActual[year]);
    const projected = fils(yearProjected[year]);
    const eac = fils(actual + projected);
    const variance = fils(budget - eac);
    return {
      year,
      budget,
      actual,
      projected,
      eac,
      variance,
      variancePct: safeDiv(variance, budget) * 100,
      actualUtilization: safeDiv(actual, budget) * 100,
      eacUtilization: safeDiv(eac, budget) * 100,
      status: budgetStatus(eac, budget),
    };
  });

  const sum = (f: (y: YearSummary) => number) => fils(years.reduce((s, y) => s + f(y), 0));
  const budget = sum((y) => y.budget);
  const actual = sum((y) => y.actual);
  const projected = sum((y) => y.projected);
  const eac = fils(actual + projected);
  const variance = fils(budget - eac);

  const contractCeiling = fils(items.reduce((s, i) => s + i.contractQty * i.unitCost, 0));
  const contractQty = items.reduce((s, i) => s + i.contractQty, 0);
  const scheduledQty = itemSummaries.reduce((s, i) => s + i.scheduledQty, 0);
  const deliveredQty = itemSummaries.reduce((s, i) => s + i.deliveredQty, 0);

  const windowMonths = timeline.filter((p) => p.inWindow);
  const monthsTotal = windowMonths.length;
  const monthsElapsed = windowMonths.filter((p) => p.isActual).length;
  const monthsRemaining = monthsTotal - monthsElapsed;

  const categorySummaries = [...catMap.values()].map((c) => ({
    ...c,
    actual: fils(c.actual),
    projected: fils(c.projected),
    eac: fils(c.eac),
    contractValue: fils(c.contractValue),
  }));

  return {
    timeline,
    years,
    items: itemSummaries,
    categories: categorySummaries,
    totals: {
      budget,
      actual,
      projected,
      eac,
      variance,
      variancePct: safeDiv(variance, budget) * 100,
      actualUtilization: safeDiv(actual, budget) * 100,
      eacUtilization: safeDiv(eac, budget) * 100,
      contractCeiling,
      contractDrawdownPct: safeDiv(eac, contractCeiling) * 100,
      remainingContractValue: fils(contractCeiling - eac),
      contractQty,
      scheduledQty,
      deliveredQty,
      remainingQty: contractQty - scheduledQty,
      activeLines: itemSummaries.filter((i) => i.active).length,
      overAllocatedLines: itemSummaries.filter((i) => i.status === 'OVER-ALLOCATED').length,
      monthsTotal,
      monthsElapsed,
      monthsRemaining,
      timeElapsedPct: safeDiv(monthsElapsed, monthsTotal) * 100,
      burnRate: fils(safeDiv(actual, monthsElapsed)),
      requiredRunRate: fils(safeDiv(Math.max(0, budget - actual), monthsRemaining)),
    },
  };
}

export const asOfLabel = (a: AsOf): string => `${MONTHS[a.month]} ${a.year}`;
export const viewLabel = (v: YearView): string => (v === 'all' ? 'Overall' : `FY${v}`);

/** Units actually consumed (delivered) up to the end of the view. */
export const consumedOf = (c: Consumption): number => c.priorDelivered + c.delivered;
