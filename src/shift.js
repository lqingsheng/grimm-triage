// End-of-night shift report: a pure summary of the player's answers (no DOM, no randomness).
//
// summarizeShift(answers) -> {
//   score, max, total, correct, underTriage, overTriage,
//   missed: [{ id, name, emoji, guess, correctLevel, kind: 'under' | 'over', teachingPoint, patient, step }]
// }
// max is the best possible score (100 per case played). `patient` is the vitals the player saw.
// `step` is the ESI decision point that decided the correct level (decisionPointFor), or null.
//
// answers = [{ case, guess, level, step? }] in the order played, where `case` is an entry from CASES,
// `guess` is the player's level, `level` is the engine's level for that case and `step` is
// decisionPointFor(triage(case.patient)).
// Points come from scoreGuess, so the report score always matches the running score in the HUD.
import { scoreGuess } from './triage.js';

const isLevel = (x) => Number.isInteger(x) && x >= 1 && x <= 5;
export const MAX_POINTS = scoreGuess(1, 1).points; // an exact answer

// ESI v4 decision points, in the order the algorithm asks them.
export const STEPS = ['A', 'B', 'C', 'D'];

// Reason text that triage() gives when decision point D makes a case ESI 2: danger-zone vitals,
// or (Triage Desk only) a missing HR, RR or SpO2 that leaves the danger zone unchecked.
const DANGER_ZONE_REASON = /^2\+ resources with danger-zone vital signs|^danger-zone vital signs could not be checked/;

// Which decision point decided a triage() result:
//   ESI 1 -> A (life-saving intervention); ESI 2 -> D if danger-zone vitals (measured, or missing and
//   so unchecked) with 2+ resources made it so, otherwise B (high risk, confusion/lethargy, severe pain or distress); ESI 3-5 -> C (resources).
// triage() returns at the first point that fires, so its reasons only ever come from one point.
export function decisionPointFor(result) {
  if (!result || !isLevel(result.level) || !Array.isArray(result.reasons)) throw new TypeError('decisionPointFor needs a triage() result');
  if (result.level === 1) return 'A';
  if (result.level === 2) return result.reasons.some((r) => DANGER_ZONE_REASON.test(r)) ? 'D' : 'B';
  return 'C';
}

// "Where your shift went wrong": misses per decision point, and the step with the most misses
// (the earliest step wins a tie). Misses without a step are counted in total but not in counts.
export function stepSummary(missed) {
  const counts = Object.fromEntries(STEPS.map((s) => [s, 0]));
  for (const m of missed) if (STEPS.includes(m.step)) counts[m.step] += 1;
  const top = STEPS.reduce((best, s) => (counts[s] > (best ? counts[best] : 0) ? s : best), null);
  return { total: missed.length, counts, top, topCount: top ? counts[top] : 0 };
}

export function summarizeShift(answers) {
  if (!Array.isArray(answers)) throw new TypeError('answers must be an array');
  const summary = { score: 0, max: answers.length * MAX_POINTS, total: answers.length, correct: 0, underTriage: 0, overTriage: 0, missed: [] };

  answers.forEach((a, i) => {
    if (!a || !a.case) throw new TypeError(`answers[${i}].case is required`);
    if (!isLevel(a.guess)) throw new TypeError(`answers[${i}].guess must be a level 1 to 5`);
    if (!isLevel(a.level)) throw new TypeError(`answers[${i}].level must be a level 1 to 5`);

    const s = scoreGuess(a.guess, a.level);
    summary.score += s.points;
    if (!s.underTriage && !s.overTriage) {
      summary.correct += 1;
      return;
    }
    if (s.underTriage) summary.underTriage += 1;
    else summary.overTriage += 1;
    const { id, name, emoji, teachingPoint, patient } = a.case;
    const step = STEPS.includes(a.step) ? a.step : null;
    summary.missed.push({ id, name, emoji, guess: a.guess, correctLevel: a.level, kind: s.underTriage ? 'under' : 'over', teachingPoint, patient, step });
  });

  return summary;
}
