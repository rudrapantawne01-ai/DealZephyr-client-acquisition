# DealZephyr — Auralane sales demo

A focused, interactive sales asset for showing how DealZephyr models operating decisions before a founder commits. Auralane Systems is fictional and is **not** a DealZephyr client. All results are illustrative.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No credentials, database, API keys, or environment variables are required.

```bash
npm test
npm run typecheck
npm run build
```

## Demo path (under a minute)

1. Start on **Overview** and point to projected runway and the cash chart.
2. Open **Scenario Lab** and move the four hire start months to October 2026. The chart, burn, headcount, and runway update immediately.
3. Select **Revenue Downside** or **Hiring + Revenue Downside**. Show the cash difference and scenario comparison.
4. Open **Decision** to see the tradeoffs, then **Decision Brief** to show the Sprint output. Use **Print / save PDF** for a sample handout.

**Presentation mode** hides the navigation and gives quick scenario switching on screen share. Saved custom scenarios use this browser's local storage only.

## Calculation method and assumptions

The pure model lives in `src/lib/model.ts`; the fictional baseline and prepared scenarios live in `src/lib/demo-data.ts`. React components display model output and do not calculate the financial results.

- The model starts in October 2026 with $2.55M cash, $280k MRR ($3.36M ARR), 34 employees, $353.6k current monthly payroll, $134k other monthly operating expense, $22k cloud expense, and 90% core gross margin **before** cloud. This yields about 82.1% current gross margin and $257.6k current monthly net burn.
- Revenue in month *n* is starting MRR × (1 + monthly growth rate)^*n* × (1 − downside rate). Base monthly growth is 3.45%, a deliberately optimistic illustrative assumption. The downside rate is a persistent percentage reduction to the projected revenue path.
- Non-cloud delivery cost is revenue × (1 − core gross margin). Cloud cost is a separate monthly cost, so increasing cloud spend lowers effective gross margin. Monthly expenses add non-cloud delivery cost, cloud, current payroll, scheduled fully loaded hiring costs, and other operating expenses.
- Planned hires start in their selected calendar month; each adds one employee and its fully loaded cost from that month onward. Base plan starts four $9k/month roles in February, April, June, and August 2027.
- Net burn = expenses − revenue. Cash closes each month at opening cash + any scheduled fundraise − net burn. Fundraises arrive at the start of the selected month. Runway is the first point projected cash reaches zero, interpolated within that month. A later fundraise cannot undo an earlier zero-cash crossing. If cash stays positive for the 36-month projection, runway displays `36m+`.
- The base plan projects about 11.6 months of runway after scheduled hiring. The same baseline without planned hires projects about 12.8 months. The prepared downside changes this through its revenue assumption. These are calculated outputs, not fixed display values.
- “Current” ARR, MRR, cash, burn and headcount show the opening position before scheduled hires or a future downside. Scenario outputs show projected results and use a 12-month ending cash comparison.

The model is intentionally simple: no collections lag, taxes, debt, working capital, churn cohorts, bookings conversion, variable cloud scaling, or role-specific productivity. These are inputs a real 7-Day Finance Decision Sprint would validate and model using the company’s actual data. No real client data or advice is represented here.

## Main files

- `src/lib/model.ts` — calculation engine, monthly projection, zero-cash runway.
- `src/lib/demo-data.ts` — fictional baseline and saved scenario presets.
- `src/lib/model.test.ts` — calculation and scenario tests.
- `src/components/dashboard.tsx` — overview, controls, comparison, decision, presentation mode, brief.
- `src/components/charts.tsx` — responsive cash, burn, revenue/expense, and headcount charts.
- `src/app/globals.css` — screen, responsive, and print styles.

## Print

Open **Decision Brief** and choose **Print / save PDF**. The browser’s PDF destination uses the print stylesheet, sized for A4. For best color fidelity, enable background graphics in the print dialog. The fictional-data disclaimer remains on the brief.

## Optional browser smoke QA

With the local server running, `npm run smoke` checks key controls, scenario switching, presentation mode, the brief's print CSS, and mobile overflow. It requires a Chromium executable; set `CHROMIUM_PATH` if it is not at `/usr/bin/chromium`.
