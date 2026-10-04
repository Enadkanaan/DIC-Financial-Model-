# DIC Financial Model — Multi-Year Budget & Inventory Dashboard (v4)

React 18 · TypeScript (strict) · Zustand · Tailwind CSS · Recharts · Lucide

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle in /dist
```

## Pages (sidebar order is user-defined: Menu → Reorder)
| Route | Purpose |
|---|---|
| `#/dashboard` | KPIs, gauges, **Inventory vs Consumed** (item + year selectable), annual & cumulative charts, editable annual budget |
| `#/inventory` | Monthly quantity entry per fiscal year; **Overall** shows a read-only per-year summary |
| `#/pricing` | Category manager (3–5 categories) + Payment Terms with a per-item Category selector |
| `#/monthly` | Actual (Palm) vs projected (Sea, hatched/italic) by month; Overall = category × year |

**Change log:** header button (count + last-change timestamp) opens a slide-over list with section filter, search and CSV export.

## v4 behaviour
- Years are chosen from a dropdown everywhere, including **Overall**.
- Categories limited to **3–5**; adding is blocked at 5. Source data starts with 10 — merge them down.
- Zero-quantity items stay hidden from every list and chart until a quantity is entered.
- No reset; data, formulas and v2/v3 edits are migrated unchanged. Menu order is saved but not logged (layout, not data).
- Brand: State of Qatar Master Brand Guidelines (gba.gco.gov.qa) — Al Adaam primary; Skyline, Palm, Sea secondary;
  Lusail typeface with Calibri fallback. Lusail is government-licensed and not bundled; it is used when installed.
  Red/amber are kept only as functional status colours.

## Calculation rules (unchanged)
Line value = monthly quantity × unit rate. EAC = actual + projected. Variance = Budget − EAC.
Consumed = units in months up to **Actuals through**; planned = later months; remaining = contract − scheduled.
