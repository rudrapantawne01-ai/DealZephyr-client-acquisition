import { describe, expect, it } from 'vitest';
import { activeHires, addMonths, currentPosition, expensesForMonth, project, revenueForMonth } from './model';
import { basePlan, scenarioPresets } from './demo-data';

describe('Auralane operating model', () => {
  it('calculates current revenue, expenses, gross margin and burn from inputs', () => {
    const current = currentPosition(basePlan);
    expect(current.arr).toBe(3_360_000);
    expect(current.revenue).toBe(280_000);
    expect(current.expenses).toBeCloseTo(537_600);
    expect(current.burn).toBeCloseTo(257_600);
    expect(current.grossMarginPct).toBeCloseTo(82.142857, 5);
  });
  it('compounds monthly revenue and applies a downside haircut', () => {
    expect(revenueForMonth(basePlan, 0)).toBe(280_000);
    expect(revenueForMonth(basePlan, 2)).toBeCloseTo(280_000 * 1.0345 ** 2);
    const downside = { ...basePlan, revenueDownsidePct: 10 };
    expect(revenueForMonth(downside, 2)).toBeCloseTo(revenueForMonth(basePlan, 2) * .9);
  });
  it('starts hiring cost and headcount in the chosen month', () => {
    const first = basePlan.hires[0];
    expect(activeHires(basePlan, addMonths(first.startMonth, -1))).toHaveLength(0);
    expect(activeHires(basePlan, first.startMonth)).toHaveLength(1);
    const prior = expensesForMonth(basePlan, addMonths(first.startMonth, -1), 280_000);
    const after = expensesForMonth(basePlan, first.startMonth, 280_000);
    expect(after.payroll - prior.payroll).toBe(first.monthlyCost);
    expect(after.expenses - prior.expenses).toBe(first.monthlyCost);
  });
  it('rolls cash forward from opening cash, funding, revenue and expenses', () => {
    const funded = { ...basePlan, fundraiseMonth: addMonths(basePlan.startingMonth, 1), fundraiseAmount: 500_000 };
    const { months } = project(funded, 3);
    expect(months[0].closingCash).toBeCloseTo(months[0].openingCash - months[0].netBurn);
    expect(months[1].openingCash).toBeCloseTo(months[0].closingCash);
    expect(months[1].closingCash).toBeCloseTo(months[1].openingCash + 500_000 - months[1].netBurn);
    expect(months[2].openingCash).toBeCloseTo(months[1].closingCash);
  });
  it('calculates runway at the actual zero cash crossing, including part of a month', () => {
    const flat = { ...basePlan, hires: [], revenueGrowthPct: 0, startingCash: 258_000, startingMRR: 280_000 };
    const result = project(flat, 3);
    expect(result.runwayMonths).toBeCloseTo(258_000 / 257_600, 5);
    expect(result.months[1].closingCash).toBeLessThan(0);
  });
  it('treats zero opening cash as zero runway unless funding arrives immediately', () => {
    expect(project({ ...basePlan, startingCash: 0 }).runwayMonths).toBe(0);
    const fundedNow = project({ ...basePlan, startingCash: 0, fundraiseMonth: basePlan.startingMonth, fundraiseAmount: 2_000_000 });
    expect(fundedNow.runwayMonths).toBeGreaterThan(0);
  });
  it('lets hiring timing, downside and cloud cost change runway coherently', () => {
    const base = project(basePlan);
    const noHires = project({ ...basePlan, hires: [] });
    const aggressive = project(scenarioPresets['Aggressive Hiring']);
    const delayed = project(scenarioPresets['Delayed Hiring']);
    const downside = project(scenarioPresets['Revenue Downside']);
    const moreCloud = project({ ...basePlan, cloudMonthly: basePlan.cloudMonthly + 20_000 });
    expect(noHires.runwayMonths!).toBeGreaterThan(base.runwayMonths!);
    expect(delayed.runwayMonths!).toBeGreaterThan(base.runwayMonths!);
    expect(aggressive.runwayMonths!).toBeLessThan(base.runwayMonths!);
    expect(downside.runwayMonths!).toBeLessThan(base.runwayMonths!);
    expect(moreCloud.runwayMonths!).toBeLessThan(base.runwayMonths!);
    expect(moreCloud.months[0].grossMarginPct).toBeLessThan(base.months[0].grossMarginPct);
    expect(base.runwayMonths!).toBeGreaterThan(11);
    expect(base.runwayMonths!).toBeLessThan(12);
    expect(noHires.runwayMonths!).toBeGreaterThan(12);
  });
});
