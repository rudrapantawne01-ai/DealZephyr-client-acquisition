/** Pure monthly operating model. Money is stored in dollars; percentages are 0–100 in the UI. */
export type Department = 'Engineering' | 'Sales' | 'Product' | 'Customer Success' | 'Operations';
export type Hire = { id: string; role: string; department: Department; startMonth: string; monthlyCost: number };
export type Assumptions = {
  name: string;
  startingMonth: string;
  startingCash: number;
  startingMRR: number;
  revenueGrowthPct: number;
  revenueDownsidePct: number;
  coreGrossMarginPct: number;
  cloudMonthly: number;
  currentHeadcount: number;
  currentPayroll: number;
  otherOpexMonthly: number;
  hires: Hire[];
  fundraiseMonth: string | null;
  fundraiseAmount: number;
};
export type MonthResult = {
  index: number; month: string; openingCash: number; fundraise: number;
  revenue: number; nonCloudCogs: number; cloud: number; grossProfit: number; grossMarginPct: number;
  payroll: number; otherOpex: number; expenses: number; netBurn: number; closingCash: number; headcount: number;
};
export type Projection = { months: MonthResult[]; runwayMonths: number | null; troughCash: number; endingCash12: number };

export function addMonths(month: string, count: number): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, m - 1 + count, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function monthDifference(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + tm - fm;
}
export function revenueForMonth(a: Assumptions, index: number): number {
  return a.startingMRR * Math.pow(1 + a.revenueGrowthPct / 100, index) * (1 - a.revenueDownsidePct / 100);
}
export function activeHires(a: Assumptions, month: string): Hire[] {
  return a.hires.filter(h => monthDifference(h.startMonth, month) >= 0);
}
export function expensesForMonth(a: Assumptions, month: string, revenue: number) {
  const nonCloudCogs = revenue * (1 - a.coreGrossMarginPct / 100);
  const payroll = a.currentPayroll + activeHires(a, month).reduce((sum, hire) => sum + hire.monthlyCost, 0);
  const expenses = nonCloudCogs + a.cloudMonthly + payroll + a.otherOpexMonthly;
  return { nonCloudCogs, payroll, expenses };
}
export function project(a: Assumptions, horizon = 36): Projection {
  let cash = a.startingCash;
  let runwayMonths: number | null = a.startingCash <= 0 && a.fundraiseMonth !== a.startingMonth ? 0 : null;
  let troughCash = cash;
  const months: MonthResult[] = [];
  for (let index = 0; index < horizon; index++) {
    const month = addMonths(a.startingMonth, index);
    const revenue = revenueForMonth(a, index);
    const { nonCloudCogs, payroll, expenses } = expensesForMonth(a, month, revenue);
    const fundraise = a.fundraiseMonth === month ? a.fundraiseAmount : 0;
    const openingCash = cash;
    const availableCash = openingCash + fundraise;
    const netBurn = expenses - revenue;
    cash = availableCash - netBurn;
    const grossProfit = revenue - nonCloudCogs - a.cloudMonthly;
    const headcount = a.currentHeadcount + activeHires(a, month).length;
    if (runwayMonths === null && availableCash > 0 && cash <= 0 && netBurn > 0) {
      runwayMonths = index + availableCash / netBurn;
    }
    troughCash = Math.min(troughCash, cash);
    months.push({ index, month, openingCash, fundraise, revenue, nonCloudCogs, cloud: a.cloudMonthly,
      grossProfit, grossMarginPct: revenue > 0 ? grossProfit / revenue * 100 : 0,
      payroll, otherOpex: a.otherOpexMonthly, expenses, netBurn, closingCash: cash, headcount });
  }
  return { months, runwayMonths, troughCash, endingCash12: months[Math.min(11, months.length - 1)]?.closingCash ?? cash };
}
export function currentPosition(a: Assumptions) {
  const noHires = { ...a, hires: [], revenueDownsidePct: 0, fundraiseMonth: null, fundraiseAmount: 0 };
  const revenue = a.startingMRR;
  const { expenses } = expensesForMonth(noHires, a.startingMonth, revenue);
  return { revenue, arr: revenue * 12, burn: expenses - revenue, expenses,
    grossMarginPct: (revenue * a.coreGrossMarginPct / 100 - a.cloudMonthly) / revenue * 100,
    headcount: a.currentHeadcount, cash: a.startingCash };
}
export function withShiftedHires(a: Assumptions, ids: string[], months: number): Assumptions {
  return { ...a, hires: a.hires.map(h => ids.includes(h.id) ? { ...h, startMonth: addMonths(h.startMonth, months) } : h) };
}
export function runwayLabel(value: number | null) { return value === null ? '36m+' : `${value.toFixed(1)}m`; }
