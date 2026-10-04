import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, EyeOff, FolderPlus, GitMerge, Info, Layers, Trash2 } from 'lucide-react';
import { CountUp } from '../components/CountUp';
import { IntegerInput } from '../components/IntegerInput';
import { Amount, AnimatedAmount, CategoryDot, Panel, ProgressBar, ScopeBadge } from '../components/ui';
import { COLORS, MAX_CATEGORIES, MIN_CATEGORIES, SCOPE_STYLES } from '../lib/config';
import { fmtAmount, fmtPct, fmtQAR, safeDiv } from '../lib/format';
import type { CategorySummary, ItemSummary } from '../lib/types';
import { useModel, useModelStore } from '../store/useModelStore';

export function PricingPage() {
  const model = useModel();
  const t = model.totals;
  const [showInactive, setShowInactive] = useState(false);

  const activeItems = model.items.filter((r) => r.active);
  const inactiveItems = model.items.filter((r) => !r.active);
  const colorOf = (name: string) => model.categories.find((c) => c.name === name)?.color ?? COLORS.neutral;

  const grouped = useMemo(() => {
    const map = new Map<string, ItemSummary[]>();
    activeItems.forEach((r) => map.set(r.item.category, [...(map.get(r.item.category) ?? []), r]));
    return model.categories.filter((c) => map.has(c.name)).map((c) => [c, map.get(c.name)!] as const);
  }, [activeItems, model.categories]);

  const scopes = useMemo(() => {
    const m = new Map<string, { value: number; scheduled: number; lines: number }>();
    activeItems.forEach((r) => {
      const s = m.get(r.item.scope) ?? { value: 0, scheduled: 0, lines: 0 };
      s.value += r.contractValue;
      s.scheduled += r.scheduledValue;
      s.lines += 1;
      m.set(r.item.scope, s);
    });
    return [...m.entries()];
  }, [activeItems]);

  const fractional = activeItems.filter((r) => !Number.isInteger(r.item.unitCost));
  let gridRow = 0;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Contract ceiling</p>
          <p className="mt-1 text-xl font-semibold text-brand"><AnimatedAmount value={t.contractCeiling} prefix="QAR " /></p>
          <p className="mt-1 text-xs text-gray-500">
            Approved budget {fmtQAR(t.budget)} · difference <Amount value={t.budget - t.contractCeiling} signed />
          </p>
        </div>
        {scopes.map(([scope, s]) => {
          const st = SCOPE_STYLES[scope] ?? SCOPE_STYLES['Call-off'];
          const pct = safeDiv(s.scheduled, s.value) * 100;
          return (
            <div key={scope} className="rounded-lg border border-gray-200 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{scope}</p>
                <span className="text-[11px] text-gray-500">{s.lines} lines</span>
              </div>
              <p className="mt-1 text-xl font-semibold" style={{ color: st.fg }}><AnimatedAmount value={s.value} prefix="QAR " /></p>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar pct={pct} color={st.fg} />
                <CountUp value={pct} format={fmtPct} className="w-14 shrink-0 text-right text-xs text-gray-600" />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">{fmtPct(safeDiv(s.value, t.contractCeiling) * 100)} of ceiling · scheduled drawdown</p>
            </div>
          );
        })}
      </section>

      <CategoryManager summaries={model.categories} />

      <Panel
        title="Payment Terms & Service Inventory"
        subtitle="Unit rates and contracted quantities as per the shared Payment Terms sheet. Whole numbers only; change an item's category from the Category column. Every edit is recorded in the Change Log."
        bodyClassName=""
      >
        {fractional.length > 0 && (
          <p className="flex items-start gap-2 border-b border-gray-100 bg-warning-50 px-5 py-2.5 text-xs text-warning-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {fractional
              .map(
                (r) =>
                  `${r.item.name} retains its contract-derived rate of ${r.item.unitCost.toFixed(2)} (contract value ${fmtQAR(r.contractValue)} ÷ ${fmtAmount(r.item.contractQty)}) so totals reconcile to the workbook; it displays rounded and becomes a whole number once edited.`,
              )
              .join(' ')}
          </p>
        )}
        <div className="max-h-[70vh] overflow-auto">
          <table className="fin-table w-full min-w-[1640px]">
            <PricingHead />
            <tbody>
              {grouped.map(([cat, list]) => {
                const sub = list.reduce(
                  (a, r) => ({ cv: a.cv + r.contractValue, sv: a.sv + r.scheduledValue, rv: a.rv + r.remainingValue }),
                  { cv: 0, sv: 0, rv: 0 },
                );
                return (
                  <Fragment key={cat.name}>
                    <tr className="group-row">
                      <td colSpan={12} className="text-left">
                        <span className="inline-flex items-center gap-2"><CategoryDot color={cat.color} /> {cat.name}</span>
                      </td>
                    </tr>
                    {list.map((r) => (
                      <PricingRow key={r.item.id} r={r} row={gridRow++} color={cat.color} categories={model.categories} />
                    ))}
                    <tr className="subtotal-row">
                      <td className="text-left" colSpan={5}>Subtotal — {cat.name}</td>
                      <td><Amount value={sub.cv} /></td>
                      <td colSpan={3} />
                      <td><Amount value={sub.sv} /></td>
                      <td />
                      <td><Amount value={sub.rv} signed /></td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-20">
              <tr>
                <td className="text-left" colSpan={4}>Grand total</td>
                <td>{fmtAmount(t.contractQty)}</td>
                <td><Amount value={t.contractCeiling} /></td>
                <td colSpan={3} />
                <td><Amount value={t.eac} /></td>
                <td className="text-left text-xs">{fmtPct(t.contractDrawdownPct)}</td>
                <td><Amount value={t.remainingContractValue} signed /></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {inactiveItems.length > 0 && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="flex w-full items-center gap-2 px-5 py-3 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50"
              aria-expanded={showInactive}
            >
              {showInactive ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <EyeOff className="h-3.5 w-3.5" />
              Inactive items — contract quantity 0 ({inactiveItems.length})
              <span className="font-normal text-gray-500">· hidden from every page and total until a contract quantity is entered</span>
            </button>
            {showInactive && (
              <div className="overflow-x-auto bg-gray-50/60">
                <table className="fin-table w-full min-w-[1640px] opacity-90">
                  <PricingHead />
                  <tbody>
                    {inactiveItems.map((r) => (
                      <PricingRow key={r.item.id} r={r} row={gridRow++} color={colorOf(r.item.category)} categories={model.categories} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}

function PricingHead() {
  return (
    <thead className="sticky top-0 z-20">
      <tr>
        <th className="text-left">Service / line item</th>
        <th className="w-44 text-left">Category</th>
        <th className="w-28 text-left">Unit</th>
        <th className="w-32">Unit rate (QAR)</th>
        <th className="w-28">Contract qty</th>
        <th className="w-32 bg-gray-100">Contract value</th>
        <th className="w-56 text-left">Payment basis</th>
        <th className="w-32 text-left">Scope</th>
        <th className="w-24">Sched. qty</th>
        <th className="w-32">Sched. value</th>
        <th className="w-40 text-left">Drawdown</th>
        <th className="w-32">Remaining value</th>
      </tr>
    </thead>
  );
}

function PricingRow({ r, row, color, categories }: { r: ItemSummary; row: number; color: string; categories: CategorySummary[] }) {
  const setUnitCost = useModelStore((s) => s.setUnitCost);
  const setContractQty = useModelStore((s) => s.setContractQty);
  const setPaymentBasis = useModelStore((s) => s.setPaymentBasis);
  const setItemCategory = useModelStore((s) => s.setItemCategory);

  return (
    <tr>
      <td className="min-w-[260px] whitespace-normal text-left font-medium text-gray-900">{r.item.name}</td>
      <td className="min-w-[180px] px-1 py-1 text-left">
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            <CategoryDot color={color} />
          </span>
          <select
            aria-label={`${r.item.name} category`}
            value={r.item.category}
            onChange={(e) => setItemCategory(r.item.id, e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-gray-200 bg-white pl-6 pr-1 text-[13px] text-gray-800 outline-none hover:border-gray-400 focus:border-brand"
          >
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="text-left text-gray-600">{r.item.unit}</td>
      <td className="px-1 py-1">
        <IntegerInput
          value={r.item.unitCost}
          onCommit={(v) => setUnitCost(r.item.id, v)}
          ariaLabel={`${r.item.name} unit rate`}
          grid={{ name: 'price', row, col: 0 }}
          title={Number.isInteger(r.item.unitCost) ? undefined : `Source rate ${r.item.unitCost.toFixed(4)}`}
        />
      </td>
      <td className="px-1 py-1">
        <IntegerInput value={r.item.contractQty} onCommit={(v) => setContractQty(r.item.id, v)} ariaLabel={`${r.item.name} contract quantity`} grid={{ name: 'price', row, col: 1 }} />
      </td>
      <td className="bg-gray-50 font-semibold"><Amount value={r.contractValue} /></td>
      <td className="min-w-[240px] px-1 py-1">
        <input
          aria-label={`${r.item.name} payment basis`}
          defaultValue={r.item.paymentBasis}
          onBlur={(e) => setPaymentBasis(r.item.id, e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="h-8 w-full rounded border border-transparent bg-transparent px-2 text-[13px] text-gray-700 outline-none hover:border-gray-300 focus:border-brand focus:bg-white"
        />
      </td>
      <td className="text-left"><ScopeBadge scope={r.item.scope} /></td>
      <td>{fmtAmount(r.scheduledQty)}</td>
      <td><Amount value={r.scheduledValue} /></td>
      <td className="text-left">
        {r.item.contractQty > 0 ? (
          <div className="flex items-center gap-2">
            <ProgressBar pct={r.drawdownPct} color={color} />
            <span className={`num w-14 shrink-0 text-right text-xs ${r.drawdownPct > 100 ? 'font-semibold text-negative-700' : 'text-gray-600'}`}>
              {fmtPct(r.drawdownPct)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Not contracted</span>
        )}
      </td>
      <td><Amount value={r.remainingValue} signed /></td>
    </tr>
  );
}

/** Rename, merge, add and delete reporting categories. Limit: 3–5 categories. */
function CategoryManager({ summaries }: { summaries: CategorySummary[] }) {
  const addCategory = useModelStore((s) => s.addCategory);
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'ok' } | null>(null);
  const count = summaries.length;
  const state = count > MAX_CATEGORIES ? 'over' : count < MIN_CATEGORIES ? 'under' : 'ok';
  const atMax = count >= MAX_CATEGORIES;

  const report = (err: string | null, ok: string) => setMessage(err ? { text: err, tone: 'error' } : { text: ok, tone: 'ok' });

  return (
    <Panel
      title={
        <span className="inline-flex items-center gap-2">
          <Layers className="h-4 w-4" /> Reporting Categories
          <span
            className={`num rounded px-1.5 py-0.5 text-[11px] font-bold ${
              state === 'ok' ? 'bg-positive-50 text-positive-700' : 'bg-warning-50 text-warning-700'
            }`}
          >
            {count} of {MIN_CATEGORIES}–{MAX_CATEGORIES}
            {state === 'over' ? ` · merge ${count - MAX_CATEGORIES} more` : state === 'under' ? ' · add more' : ' · on target'}
          </span>
        </span>
      }
      subtitle={`Keep ${MIN_CATEGORIES}–${MAX_CATEGORIES} categories. Merge moves all items and removes the source; rename in place; or reassign single items from the Category column below. The first five categories use the State of Qatar brand colours.`}
      actions={
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const err = addCategory(newName);
            report(err, `Category “${newName.trim()}” added.`);
            if (!err) setNewName('');
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={atMax}
            placeholder={atMax ? `Limit of ${MAX_CATEGORIES} reached` : 'New category name'}
            aria-label="New category name"
            className="h-8 w-48 rounded-md border border-gray-200 px-2 text-xs outline-none focus:border-brand disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={atMax}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      }
    >
      {state === 'over' && (
        <p className="mb-4 flex items-start gap-2 rounded-md bg-warning-50 px-3 py-2 text-xs text-warning-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {count} categories exist from the source workbook. Merge them down to {MAX_CATEGORIES} or fewer; no new categories can be added until then.
        </p>
      )}
      {message && (
        <p
          role="status"
          className={`mb-4 rounded-md px-3 py-2 text-xs font-medium ${message.tone === 'error' ? 'bg-negative-50 text-negative-700' : 'bg-positive-50 text-positive-700'}`}
        >
          {message.text}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {summaries.map((s, i) => (
          <CategoryCard key={s.name} summary={s} excess={i >= MAX_CATEGORIES} others={summaries.filter((o) => o.name !== s.name)} onResult={report} />
        ))}
      </div>
    </Panel>
  );
}

function CategoryCard({
  summary,
  excess,
  others,
  onResult,
}: {
  summary: CategorySummary;
  excess: boolean;
  others: CategorySummary[];
  onResult: (err: string | null, ok: string) => void;
}) {
  const renameCategory = useModelStore((s) => s.renameCategory);
  const mergeCategory = useModelStore((s) => s.mergeCategory);
  const deleteCategory = useModelStore((s) => s.deleteCategory);
  const [target, setTarget] = useState('');
  const { name, color, totalLines: total, activeLines: active } = summary;

  const commitRename = (el: HTMLInputElement) => {
    const next = el.value;
    if (next.trim() === name) return;
    const err = renameCategory(name, next);
    if (err) el.value = name;
    onResult(err, `Renamed “${name}” to “${next.trim()}”.`);
  };

  return (
    <div className={`flex flex-col gap-2 rounded-md border p-3 ${excess ? 'border-dashed border-warning-700/40 bg-warning-50/40' : 'border-gray-200'}`} style={{ borderTop: `3px solid ${color}` }}>
      <input
        key={name}
        aria-label={`Rename category ${name}`}
        defaultValue={name}
        onBlur={(e) => commitRename(e.currentTarget)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="h-8 w-full rounded border border-transparent bg-transparent px-1.5 text-sm font-semibold text-gray-900 outline-none hover:border-gray-300 focus:border-brand focus:bg-white"
      />
      <p className="px-1.5 text-[11px] text-gray-500">
        {active} active{total > active ? ` · ${total - active} inactive` : ''} line(s) · contract <Amount value={summary.contractValue} />
        {excess && <span className="block font-semibold text-warning-700">Over the {MAX_CATEGORIES}-category limit — merge</span>}
      </p>
      <div className="mt-auto flex items-center gap-1.5">
        <select aria-label={`Merge ${name} into`} value={target} onChange={(e) => setTarget(e.target.value)} className="h-7 min-w-0 flex-1 rounded border border-gray-200 bg-white px-1 text-[11px]">
          <option value="">Merge into…</option>
          {others.map((o) => (
            <option key={o.name} value={o.name}>
              {o.name}
            </option>
          ))}
        </select>
        <button
          disabled={!target}
          onClick={() => {
            if (!window.confirm(`Move all ${total} item(s) from “${name}” into “${target}” and remove “${name}”?`)) return;
            const into = target;
            onResult(mergeCategory(name, into), `Merged “${name}” into “${into}”.`);
            setTarget('');
          }}
          className="inline-flex h-7 items-center gap-1 rounded border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <GitMerge className="h-3.5 w-3.5" /> Merge
        </button>
        <button
          disabled={total > 0}
          onClick={() => onResult(deleteCategory(name), `Deleted “${name}”.`)}
          title={total > 0 ? 'Only empty categories can be deleted' : 'Delete category'}
          aria-label={`Delete category ${name}`}
          className="grid h-7 w-7 place-items-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-negative-50 hover:text-negative-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
