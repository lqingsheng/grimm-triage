import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeShift } from '../src/shift.js';
import { triage, scoreGuess } from '../src/triage.js';
import { CASES } from '../src/cases.js';

const c = (id, level) => ({ id, name: `Monster ${id}`, emoji: '👻', teachingPoint: `Lesson ${id}`, expectedLevel: level });

test('empty night: zero everything, nothing missed', () => {
  assert.deepEqual(summarizeShift([]), { score: 0, total: 0, correct: 0, underTriage: 0, overTriage: 0, missed: [] });
});

test('counts correct, under- and over-triage and sums score with scoreGuess', () => {
  const r = summarizeShift([
    { case: c('a', 2), guess: 2, level: 2 }, // correct, 100
    { case: c('b', 1), guess: 2, level: 1 }, // under by 1, 50 - 25 = 25
    { case: c('c', 4), guess: 3, level: 4 }, // over by 1, 50
    { case: c('d', 1), guess: 5, level: 1 }, // under by 4, 0
    { case: c('e', 5), guess: 1, level: 5 }, // over by 4, 0
  ]);
  assert.equal(r.total, 5);
  assert.equal(r.correct, 1);
  assert.equal(r.underTriage, 2);
  assert.equal(r.overTriage, 2);
  assert.equal(r.score, 175);
  assert.equal(r.correct + r.underTriage + r.overTriage, r.total);
});

test('missed cases keep play order, correct level, guess, kind and teaching point', () => {
  const r = summarizeShift([
    { case: c('a', 2), guess: 2, level: 2 },
    { case: c('b', 1), guess: 3, level: 1 },
    { case: c('c', 4), guess: 2, level: 4 },
  ]);
  assert.deepEqual(r.missed, [
    { id: 'b', name: 'Monster b', emoji: '👻', guess: 3, correctLevel: 1, kind: 'under', teachingPoint: 'Lesson b' },
    { id: 'c', name: 'Monster c', emoji: '👻', guess: 2, correctLevel: 4, kind: 'over', teachingPoint: 'Lesson c' },
  ]);
});

test('a perfect night over the real case bank scores 100 per case with nothing missed', () => {
  const answers = CASES.map((k) => ({ case: k, guess: triage(k.patient).level, level: triage(k.patient).level }));
  const r = summarizeShift(answers);
  assert.equal(r.score, CASES.length * 100);
  assert.equal(r.correct, CASES.length);
  assert.equal(r.missed.length, 0);
});

test('report score equals the running HUD score for any guesses', () => {
  const answers = CASES.map((k, i) => ({ case: k, guess: (i % 5) + 1, level: triage(k.patient).level }));
  const running = answers.reduce((sum, a) => sum + scoreGuess(a.guess, a.level).points, 0);
  const r = summarizeShift(answers);
  assert.equal(r.score, running);
  for (const m of r.missed) assert.ok(m.teachingPoint.length > 0, `${m.id}: missing teaching point`);
});

test('does not mutate its input', () => {
  const answers = [{ case: c('a', 1), guess: 3, level: 1 }];
  const copy = structuredClone(answers);
  summarizeShift(answers);
  assert.deepEqual(answers, copy);
});

test('invalid input throws TypeError', () => {
  assert.throws(() => summarizeShift(null), TypeError);
  assert.throws(() => summarizeShift([{ guess: 1, level: 1 }]), TypeError);
  assert.throws(() => summarizeShift([{ case: c('a', 1), guess: 6, level: 1 }]), TypeError);
  assert.throws(() => summarizeShift([{ case: c('a', 1), guess: 1, level: 0 }]), TypeError);
});
