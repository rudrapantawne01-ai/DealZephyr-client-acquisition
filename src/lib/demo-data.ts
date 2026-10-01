import { Assumptions, addMonths } from './model';

export const FICTIONAL_NOTICE = 'Auralane Systems is an illustrative fictional company used to demonstrate DealZephyr’s methodology. It is not a DealZephyr client.';
const startingMonth = '2026-10';
const baseHires: Assumptions['hires'] = [
  { id: 'hire-1', role: 'Senior Account Executive', department: 'Sales', startMonth: '2027-02', monthlyCost: 9000 },
  { id: 'hire-2', role: 'Product Engineer', department: 'Engineering', startMonth: '2027-04', monthlyCost: 9000 },
  { id: 'hire-3', role: 'Customer Success Lead', department: 'Customer Success', startMonth: '2027-06', monthlyCost: 9000 },
  { id: 'hire-4', role: 'Data Engineer', department: 'Engineering', startMonth: '2027-08', monthlyCost: 9000 },
];
export const basePlan: Assumptions = {
  name: 'Base Plan', startingMonth, startingCash: 2_550_000, startingMRR: 280_000,
  revenueGrowthPct: 3.45, revenueDownsidePct: 0, coreGrossMarginPct: 90,
  cloudMonthly: 22_000, currentHeadcount: 34, currentPayroll: 353_600,
  otherOpexMonthly: 134_000, hires: baseHires,
  fundraiseMonth: null, fundraiseAmount: 0,
};
export const scenarioPresets: Record<string, Assumptions> = {
  'Base Plan': basePlan,
  'Aggressive Hiring': { ...basePlan, name: 'Aggressive Hiring', hires: baseHires.map(h => ({ ...h, startMonth: startingMonth })) },
  'Delayed Hiring': { ...basePlan, name: 'Delayed Hiring', hires: baseHires.map((h, i) => ({ ...h, startMonth: addMonths(h.startMonth, i < 2 ? 2 : 3) })) },
  'Revenue Downside': { ...basePlan, name: 'Revenue Downside', revenueDownsidePct: 3 },
  'Hiring + Revenue Downside': { ...basePlan, name: 'Hiring + Revenue Downside', revenueDownsidePct: 8, hires: baseHires.map(h => ({ ...h, startMonth: startingMonth })) },
};
export const presetOrder = Object.keys(scenarioPresets);
export const roleSuggestions: { role: string; department: Assumptions['hires'][number]['department'] }[] = [
  { role: 'Account Executive', department: 'Sales' },
  { role: 'Product Engineer', department: 'Engineering' },
  { role: 'Customer Success Manager', department: 'Customer Success' },
  { role: 'Product Manager', department: 'Product' },
  { role: 'Finance & Operations Lead', department: 'Operations' },
];
