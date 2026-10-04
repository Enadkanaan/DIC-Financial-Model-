export interface ServiceItem {
  /** Internal key only — never displayed. */
  id: string;
  category: string;
  name: string;
  unit: string;
  /** QAR per unit. Integer for all user edits; source value retained where the contract defines a fractional rate. */
  unitCost: number;
  /** Contracted inventory quantity (integer). */
  contractQty: number;
  paymentBasis: string;
  scope: string;
}

/** Category colour is derived from its position, so the first five always use the solid brand palette. */
export interface CategoryDef {
  name: string;
}

/** serviceId -> year -> 12 monthly integer quantities (Jan..Dec). */
export type DeliveryPlan = Record<string, Record<string, number[]>>;

/** Last month (inclusive) treated as Actual. month is 0-based (0 = Jan). */
export interface AsOf {
  year: number;
  month: number;
}

/** A fiscal year, or 'all' for the overall (multi-year) view. */
export type YearView = number | 'all';

export type PageId = 'dashboard' | 'inventory' | 'pricing' | 'monthly';

export type LogSection = 'Budget' | 'Inventory' | 'Pricing' | 'Category' | 'Reporting';
export type ImpactBasis = 'Budget' | 'EAC' | 'Contract value';

export interface ChangeLogEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  section: LogSection;
  subject: string;
  field: string;
  from: string;
  to: string;
  /** Signed QAR effect of the change on the stated basis. */
  impact?: number;
  impactBasis?: ImpactBasis;
}

export interface ModelData {
  items: ServiceItem[];
  categories: CategoryDef[];
  deliveries: DeliveryPlan;
  budgets: Record<string, number>;
  asOf: AsOf;
}

export type InventoryStatus = 'AVAILABLE' | 'EXHAUSTED' | 'OVER-ALLOCATED' | 'NOT CONTRACTED';
export type BudgetStatus = 'WITHIN BUDGET' | 'AT LIMIT' | 'OVER BUDGET';

export interface TimelinePoint {
  year: number;
  month: number;
  label: string;
  inWindow: boolean;
  isActual: boolean;
  actual: number;
  projected: number;
  total: number;
  byCategory: Record<string, number>;
}

export interface YearSummary {
  year: number;
  budget: number;
  actual: number;
  projected: number;
  eac: number;
  variance: number;
  variancePct: number;
  actualUtilization: number;
  eacUtilization: number;
  status: BudgetStatus;
}

export interface ItemSummary {
  item: ServiceItem;
  /** False when contract qty is 0 and nothing is scheduled — hidden from every list until a quantity is set. */
  active: boolean;
  scheduledQty: number;
  deliveredQty: number;
  remainingQty: number;
  contractValue: number;
  scheduledValue: number;
  actualValue: number;
  projectedValue: number;
  remainingValue: number;
  drawdownPct: number;
  byYearQty: Record<number, number>;
  /** Units in actual (closed) months, per year. */
  byYearDeliveredQty: Record<number, number>;
  /** Units in projected (future) months, per year. */
  byYearProjectedQty: Record<number, number>;
  byYearValue: Record<number, number>;
  status: InventoryStatus;
}

export interface CategorySummary {
  name: string;
  color: string;
  activeLines: number;
  totalLines: number;
  actual: number;
  projected: number;
  eac: number;
  contractValue: number;
}

export interface ModelTotals {
  budget: number;
  actual: number;
  projected: number;
  eac: number;
  variance: number;
  variancePct: number;
  actualUtilization: number;
  eacUtilization: number;
  contractCeiling: number;
  contractDrawdownPct: number;
  remainingContractValue: number;
  contractQty: number;
  scheduledQty: number;
  deliveredQty: number;
  remainingQty: number;
  activeLines: number;
  overAllocatedLines: number;
  monthsTotal: number;
  monthsElapsed: number;
  monthsRemaining: number;
  timeElapsedPct: number;
  burnRate: number;
  requiredRunRate: number;
}

export interface ModelSummary {
  timeline: TimelinePoint[];
  years: YearSummary[];
  items: ItemSummary[];
  /** In user-defined category order. */
  categories: CategorySummary[];
  totals: ModelTotals;
}
