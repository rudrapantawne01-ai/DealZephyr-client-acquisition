import { Assumptions, addMonths, project, runwayLabel } from './model';
import { basePlan } from './demo-data';
import { money, pct } from './format';

/** Deterministic demo guidance derived from the same projections used by the charts. */
export function evaluateDecision(assumptions: Assumptions) {
  const selected = project(assumptions);
  const base = project(basePlan);
  const hires = assumptions.hires;
  const options = [
    { key: 'A', title: 'Hire immediately', assumptions: { ...assumptions, hires: hires.map(h => ({ ...h, startMonth: assumptions.startingMonth })) } },
    { key: 'B', title: 'Stagger over 90 days', assumptions: { ...assumptions, hires: hires.map((h, i) => ({ ...h, startMonth: addMonths(assumptions.startingMonth, i % 4) })) } },
    { key: 'C', title: 'Delay non-critical roles', assumptions: { ...assumptions, hires: hires.map((h, i) => ({ ...h, startMonth: addMonths(assumptions.startingMonth, i < 2 ? 2 : 6 + i - 2) })) } },
  ].map(option => ({ ...option, projection: project(option.assumptions) }));

  const immediate = options[0].projection;
  const shortRunway = selected.runwayMonths !== null && selected.runwayMonths < 10.5;
  const largeFundingGap = selected.endingCash12 < -250_000;
  const materialDownside = assumptions.revenueDownsidePct >= 5;
  const recommendedKey = hires.length === 0 ? null : shortRunway || largeFundingGap || materialDownside ? 'C' : 'B';
  const recommended = options.find(option => option.key === recommendedKey);
  const selectedCashSentence = selected.endingCash12 < 0
    ? `a ${money(-selected.endingCash12)} funding gap at month 12`
    : `${money(selected.endingCash12)} cash at month 12`;
  const cashSentence = (cash: number) => cash < 0
    ? `a ${money(-cash)} funding gap at month 12`
    : `${money(cash)} cash at month 12`;

  let recommendation: string;
  if (!recommended) {
    recommendation = 'No hires are currently scheduled. Add a role to compare hiring timing and its cash impact.';
  } else if (recommendedKey === 'C') {
    recommendation = `${assumptions.revenueDownsidePct > 0 ? `With a ${pct(assumptions.revenueDownsidePct, 0)} revenue downside, ` : 'Under the selected plan, '}modeled runway is ${runwayLabel(selected.runwayMonths)} with ${selectedCashSentence}. Delaying later roles projects ${runwayLabel(recommended.projection.runwayMonths)} of runway and ${cashSentence(recommended.projection.endingCash12)}. Recheck revenue before making those offers.`;
  } else {
    recommendation = `Hiring all ${hires.length} roles immediately projects ${runwayLabel(immediate.runwayMonths)} of runway and ${cashSentence(immediate.endingCash12)}. Staggering the starts projects ${runwayLabel(recommended.projection.runwayMonths)} and ${cashSentence(recommended.projection.endingCash12)}, while still adding capacity.`;
  }
  const summary = `At ${money(assumptions.startingCash)} in cash, the selected plan projects ${runwayLabel(selected.runwayMonths)} of runway and ${selectedCashSentence}. Hiring dates, revenue and delivery costs drive this result month by month.`;
  const risks = assumptions.revenueDownsidePct > 0
    ? `The ${pct(assumptions.revenueDownsidePct, 0)} revenue downside is already reflected; a deeper or longer miss would shorten the cash window further. Hiring productivity and cloud spend may also differ from plan.`
    : 'Revenue growth may arrive later than planned. Hiring productivity may lag, and cloud spend may rise with usage.';
  const changeConditions = 'Updated bookings, actual offer dates and compensation, cloud usage, or a confirmed fundraise would change this recommendation. Re-run the model before committing later hires.';
  return { selected, base, options, recommendedKey, recommendation, summary, risks, changeConditions };
}
