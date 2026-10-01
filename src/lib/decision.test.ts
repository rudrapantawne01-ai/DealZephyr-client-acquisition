import { describe, expect, it } from 'vitest';
import { basePlan, scenarioPresets } from './demo-data';
import { evaluateDecision } from './decision';
import { money } from './format';
import { runwayLabel } from './model';

describe('illustrative decision guidance', () => {
  it('uses calculated hiring consequences in the base recommendation', () => {
    const view = evaluateDecision(basePlan);
    expect(view.recommendedKey).toBe('B');
    expect(view.recommendation).toContain(runwayLabel(view.options[0].projection.runwayMonths));
    expect(view.recommendation).toContain(money(-view.options[0].projection.endingCash12));
  });
  it('responds to a combined downside with the selected cash and runway results', () => {
    const view = evaluateDecision(scenarioPresets['Hiring + Revenue Downside']);
    expect(view.recommendedKey).toBe('C');
    expect(view.recommendation).toContain(runwayLabel(view.selected.runwayMonths));
    expect(view.recommendation).toContain(money(-view.selected.endingCash12));
    expect(view.recommendation).toContain(runwayLabel(view.options[2].projection.runwayMonths));
  });
  it('changes the hiring recommendation when cash is tighter without a revenue miss', () => {
    const view = evaluateDecision({ ...basePlan, startingCash: 1_900_000 });
    expect(view.recommendedKey).toBe('C');
    expect(view.recommendation).toContain(runwayLabel(view.selected.runwayMonths));
    expect(view.recommendation).toContain(runwayLabel(view.options[2].projection.runwayMonths));
  });
  it('handles a plan with no scheduled hires', () => {
    const view = evaluateDecision({ ...basePlan, hires: [] });
    expect(view.recommendedKey).toBeNull();
    expect(view.recommendation).toContain('Add a role');
  });
});
