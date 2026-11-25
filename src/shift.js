// End-of-night shift report: a pure summary of the player's answers (no DOM, no randomness).
//
// summarizeShift(answers) -> {
//   score, max, total, correct, underTriage, overTriage,
//   missed: [{ id, name, emoji, guess, correctLevel, kind: 'under' | 'over', teachingPoint, patient }]
// }
// max is the best possible score (100 per case played). `patient` is the vitals the player saw.
//
// answers = [{ case, guess, level }] in the order played, where `case` is an entry from CASES,
// `guess` is the player's level and `level` is the engine's level for that case.
// Points come from scoreGuess, so the report score always matches the running score in the HUD.
import { scoreGuess } from './triage.js';

const isLevel = (x) => Number.isInteger(x) && x >= 1 && x <= 5;
export const MAX_POINTS = scoreGuess(1, 1).points; // an exact answer

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
    summary.missed.push({ id, name, emoji, guess: a.guess, correctLevel: a.level, kind: s.underTriage ? 'under' : 'over', teachingPoint, patient });
  });

  return summary;
}
