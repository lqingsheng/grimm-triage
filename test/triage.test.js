import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triage, scoreGuess } from '../src/triage.js';
import { CASES } from '../src/cases.js';

const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 };

test('stable patient with no resources is level 5', () => assert.equal(triage(base).level, 5));
test('one resource is level 4', () => assert.equal(triage({ ...base, resources: 1 }).level, 4));
test('two resources with normal vitals is level 3', () => assert.equal(triage({ ...base, resources: 2 }).level, 3));
test('two resources with danger-zone HR is level 2', () => assert.equal(triage({ ...base, resources: 2, hr: 120 }).level, 2));
test('high-risk complaint is level 2', () => assert.equal(triage({ ...base, highRisk: true }).level, 2));
test('severe pain is level 2', () => assert.equal(triage({ ...base, pain: 8 }).level, 2));
test('unresponsive is level 1', () => assert.equal(triage({ ...base, avpu: 'U' }).level, 1));
test('SpO2 80 is level 1', () => assert.equal(triage({ ...base, spo2: 80 }).level, 1));
test('invalid input throws', () => assert.throws(() => triage({ ...base, avpu: 'X' }), TypeError));

test('monster cases resolve to the intended levels', () => {
  const expected = { 'vampire-bleed': 2, 'mummy-dehydration': 2, 'werewolf-sprain': 4, 'ghost-unresponsive': 1, 'witch-chestpain': 2, 'skeleton-refill': 5, 'pumpkin-fever': 2 };
  for (const c of CASES) assert.equal(triage(c.patient).level, expected[c.id], c.id);
});

test('scoring penalises under-triage more than over-triage', () => {
  assert.equal(scoreGuess(2, 2).points, 100);
  assert.equal(scoreGuess(1, 2).points, 50);
  assert.equal(scoreGuess(3, 2).points, 25);
});
