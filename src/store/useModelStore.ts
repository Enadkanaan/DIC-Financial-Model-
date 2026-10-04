import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SEED_BUDGETS, SEED_DELIVERIES, SEED_ITEMS } from '../data/seed';
import { asOfLabel, computeModel, defaultAsOf, scheduledQtyOf, toEntryInt } from '../lib/calc';
import { DEFAULT_NAV_ORDER, LOG_LIMIT, MAX_CATEGORIES, MONTHS } from '../lib/config';
import { fmtAmount } from '../lib/format';
import type { AsOf, CategoryDef, ChangeLogEntry, DeliveryPlan, ModelData, ModelSummary, PageId, ServiceItem } from '../lib/types';

/** Result of a category action: null on success, otherwise a user-facing reason. */
export type ActionResult = string | null;

interface ModelActions {
  setBudget: (year: number, value: number) => void;
  setQty: (id: string, year: number, month: number, value: number) => void;
  setUnitCost: (id: string, value: number) => void;
  setContractQty: (id: string, value: number) => void;
  setPaymentBasis: (id: string, value: string) => void;
  setItemCategory: (id: string, category: string) => void;
  addCategory: (name: string) => ActionResult;
  renameCategory: (from: string, to: string) => ActionResult;
  mergeCategory: (from: string, into: string) => ActionResult;
  deleteCategory: (name: string) => ActionResult;
  setAsOf: (asOf: AsOf) => void;
  /** Moves a sidebar page to a new position (layout preference — not a data change, so not logged). */
  moveNav: (page: PageId, toIndex: number) => void;
}

interface PersistedState extends ModelData {
  log: ChangeLogEntry[];
  navOrder: PageId[];
}

type ModelStore = PersistedState & ModelActions;

const clonePlan = (p: DeliveryPlan): DeliveryPlan =>
  Object.fromEntries(Object.entries(p).map(([id, ys]) => [id, Object.fromEntries(Object.entries(ys).map(([y, m]) => [y, [...m]]))]));

/** Unique category names in first-seen order, appended to any existing list. */
const deriveCategories = (names: string[], existing: CategoryDef[] = []): CategoryDef[] => {
  const out = existing.map((c) => ({ name: c.name }));
  for (const n of names) if (!out.some((c) => c.name === n)) out.push({ name: n });
  return out;
};

const normaliseNav = (order: unknown): PageId[] => {
  const valid = Array.isArray(order) ? order.filter((p): p is PageId => DEFAULT_NAV_ORDER.includes(p as PageId)) : [];
  const unique = [...new Set(valid)];
  return [...unique, ...DEFAULT_NAV_ORDER.filter((p) => !unique.includes(p))];
};

const initialData = (): PersistedState => {
  const items = SEED_ITEMS.map((i) => ({ ...i }));
  return {
    items,
    categories: deriveCategories(items.map((i) => i.category)),
    deliveries: clonePlan(SEED_DELIVERIES),
    budgets: { ...SEED_BUDGETS },
    asOf: defaultAsOf(),
    log: [],
    navOrder: [...DEFAULT_NAV_ORDER],
  };
};

const patchItem = (items: ServiceItem[], id: string, patch: Partial<ServiceItem>) =>
  items.map((i) => (i.id === id ? { ...i, ...patch } : i));

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type NewEntry = Omit<ChangeLogEntry, 'id' | 'at'>;
/** Prepends one entry (newest first), trimming the oldest beyond LOG_LIMIT. */
const withLog = (log: ChangeLogEntry[], entry: NewEntry): ChangeLogEntry[] =>
  [{ ...entry, id: uid(), at: new Date().toISOString() }, ...log].slice(0, LOG_LIMIT);

const cleanName = (s: string) => s.trim().replace(/\s+/g, ' ');
const sameName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      ...initialData(),

      setBudget: (year, value) =>
        set((s) => {
          const from = s.budgets[String(year)] ?? 0;
          const to = toEntryInt(value);
          if (from === to) return {};
          return {
            budgets: { ...s.budgets, [String(year)]: to },
            log: withLog(s.log, {
              section: 'Budget', subject: `FY${year}`, field: 'Approved budget',
              from: fmtAmount(from), to: fmtAmount(to), impact: to - from, impactBasis: 'Budget',
            }),
          };
        }),

      setQty: (id, year, month, value) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id);
          if (!item) return {};
          const y = String(year);
          const row = [...(s.deliveries[id]?.[y] ?? new Array<number>(12).fill(0))];
          const from = row[month] ?? 0;
          const to = toEntryInt(value);
          if (from === to) return {};
          row[month] = to;
          return {
            deliveries: { ...s.deliveries, [id]: { ...s.deliveries[id], [y]: row } },
            log: withLog(s.log, {
              section: 'Inventory', subject: item.name, field: `${MONTHS[month]} ${year} quantity`,
              from: fmtAmount(from), to: fmtAmount(to), impact: (to - from) * item.unitCost, impactBasis: 'EAC',
            }),
          };
        }),

      setUnitCost: (id, value) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id);
          const to = toEntryInt(value);
          if (!item || item.unitCost === to) return {};
          return {
            items: patchItem(s.items, id, { unitCost: to }),
            log: withLog(s.log, {
              section: 'Pricing', subject: item.name, field: 'Unit rate (QAR)',
              from: fmtAmount(item.unitCost), to: fmtAmount(to),
              impact: (to - item.unitCost) * scheduledQtyOf(s.deliveries, id), impactBasis: 'EAC',
            }),
          };
        }),

      setContractQty: (id, value) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id);
          const to = toEntryInt(value);
          if (!item || item.contractQty === to) return {};
          return {
            items: patchItem(s.items, id, { contractQty: to }),
            log: withLog(s.log, {
              section: 'Pricing', subject: item.name, field: 'Contract quantity',
              from: fmtAmount(item.contractQty), to: fmtAmount(to),
              impact: (to - item.contractQty) * item.unitCost, impactBasis: 'Contract value',
            }),
          };
        }),

      setPaymentBasis: (id, value) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id);
          const to = value.trim();
          if (!item || item.paymentBasis === to) return {};
          return {
            items: patchItem(s.items, id, { paymentBasis: to }),
            log: withLog(s.log, { section: 'Pricing', subject: item.name, field: 'Payment basis', from: item.paymentBasis, to }),
          };
        }),

      setItemCategory: (id, category) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id);
          if (!item || item.category === category || !s.categories.some((c) => c.name === category)) return {};
          return {
            items: patchItem(s.items, id, { category }),
            log: withLog(s.log, { section: 'Category', subject: item.name, field: 'Category', from: item.category, to: category }),
          };
        }),

      addCategory: (raw) => {
        const name = cleanName(raw);
        const s = get();
        if (!name) return 'Enter a category name.';
        if (s.categories.length >= MAX_CATEGORIES) return `Maximum of ${MAX_CATEGORIES} categories reached — merge or delete one first.`;
        if (s.categories.some((c) => sameName(c.name, name))) return `“${name}” already exists.`;
        set({
          categories: [...s.categories, { name }],
          log: withLog(s.log, { section: 'Category', subject: name, field: 'Category created', from: '—', to: name }),
        });
        return null;
      },

      renameCategory: (from, raw) => {
        const to = cleanName(raw);
        const s = get();
        if (!to) return 'Category name cannot be empty.';
        if (to === from) return null;
        if (s.categories.some((c) => c.name !== from && sameName(c.name, to))) return `“${to}” already exists — use Merge instead.`;
        const moved = s.items.filter((i) => i.category === from).length;
        set({
          categories: s.categories.map((c) => (c.name === from ? { name: to } : c)),
          items: s.items.map((i) => (i.category === from ? { ...i, category: to } : i)),
          log: withLog(s.log, { section: 'Category', subject: from, field: `Category renamed (${plural(moved, 'item')})`, from, to }),
        });
        return null;
      },

      mergeCategory: (from, into) => {
        const s = get();
        if (from === into) return 'Choose a different target category.';
        if (!s.categories.some((c) => c.name === into)) return 'Target category not found.';
        const moved = s.items.filter((i) => i.category === from).length;
        set({
          categories: s.categories.filter((c) => c.name !== from),
          items: s.items.map((i) => (i.category === from ? { ...i, category: into } : i)),
          log: withLog(s.log, { section: 'Category', subject: from, field: `Category merged (${plural(moved, 'item')} moved)`, from, to: into }),
        });
        return null;
      },

      deleteCategory: (name) => {
        const s = get();
        const count = s.items.filter((i) => i.category === name).length;
        if (count > 0) return `“${name}” still has ${plural(count, 'item')}. Move or merge them first.`;
        set({
          categories: s.categories.filter((c) => c.name !== name),
          log: withLog(s.log, { section: 'Category', subject: name, field: 'Category deleted', from: name, to: '—' }),
        });
        return null;
      },

      setAsOf: (asOf) =>
        set((s) => {
          if (s.asOf.year === asOf.year && s.asOf.month === asOf.month) return {};
          return {
            asOf,
            log: withLog(s.log, { section: 'Reporting', subject: 'Reporting period', field: 'Actuals through', from: asOfLabel(s.asOf), to: asOfLabel(asOf) }),
          };
        }),

      moveNav: (page, toIndex) =>
        set((s) => {
          const order = s.navOrder.filter((p) => p !== page);
          const i = Math.max(0, Math.min(order.length, toIndex));
          order.splice(i, 0, page);
          return order.join() === s.navOrder.join() ? {} : { navOrder: order };
        }),
    }),
    {
      name: 'dic-financial-model',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedState => ({
        items: s.items,
        categories: s.categories,
        deliveries: s.deliveries,
        budgets: s.budgets,
        asOf: s.asOf,
        log: s.log,
        navOrder: s.navOrder,
      }),
      /**
       * v2/v3 -> v4 keeps every saved budget, price, quantity, category, reporting month and log entry
       * exactly as entered. It only normalises the category list and adds the sidebar order.
       */
      migrate: (persisted, version) => {
        const base = initialData();
        const p = (persisted ?? {}) as Partial<PersistedState>;
        if (version < 2 || !Array.isArray(p.items)) return base;
        return {
          items: p.items,
          categories: deriveCategories(p.items.map((i) => i.category), p.categories ?? []),
          deliveries: p.deliveries ?? base.deliveries,
          budgets: p.budgets ?? base.budgets,
          asOf: p.asOf ?? base.asOf,
          log: p.log ?? [],
          navOrder: normaliseNav(p.navOrder),
        };
      },
    },
  ),
);

/** Derived, memoised financial model. Every figure on every page comes from here. */
export function useModel(): ModelSummary {
  const items = useModelStore((s) => s.items);
  const categories = useModelStore((s) => s.categories);
  const deliveries = useModelStore((s) => s.deliveries);
  const budgets = useModelStore((s) => s.budgets);
  const asOf = useModelStore((s) => s.asOf);
  return useMemo(
    () => computeModel({ items, categories, deliveries, budgets, asOf }),
    [items, categories, deliveries, budgets, asOf],
  );
}
