import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triage, scoreGuess, isDangerZone, dangerThresholds } from '../src/triage.js';
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

// ---- Pediatric danger-zone thresholds (requirement 1.8, ESI v4 decision point D) ----
const kid = (ageYears, extra = {}) => ({ ...base, ageYears, hr: 100, rr: 20, resources: 2, ...extra });

test('pediatric: HR 130 in a 5-year-old is not danger zone (adult rule would say it is)', () => {
  assert.equal(isDangerZone(kid(5, { hr: 130 })), false);
  assert.equal(triage(kid(5, { hr: 130 })).level, 3);
});
test('pediatric 3-8 y: HR > 140 or RR > 30 is danger zone', () => {
  assert.equal(isDangerZone(kid(5, { hr: 140 })), false);
  assert.equal(isDangerZone(kid(5, { hr: 141 })), true);
  assert.equal(isDangerZone(kid(5, { rr: 30 })), false);
  assert.equal(isDangerZone(kid(5, { rr: 31 })), true);
  assert.equal(triage(kid(5, { hr: 141 })).level, 2);
});
test('pediatric 3 mo-3 y: HR > 160 or RR > 40 is danger zone', () => {
  assert.equal(isDangerZone(kid(1, { hr: 160 })), false);
  assert.equal(isDangerZone(kid(1, { hr: 161 })), true);
  assert.equal(isDangerZone(kid(1, { rr: 40 })), false);
  assert.equal(isDangerZone(kid(1, { rr: 41 })), true);
});
test('pediatric < 3 mo: HR > 180 or RR > 50 is danger zone', () => {
  assert.equal(isDangerZone(kid(0.1, { hr: 180 })), false);
  assert.equal(isDangerZone(kid(0.1, { hr: 181 })), true);
  assert.equal(isDangerZone(kid(0.1, { rr: 50 })), false);
  assert.equal(isDangerZone(kid(0.1, { rr: 51 })), true);
});
test('pediatric: SpO2 < 92 is danger zone at every age', () => {
  for (const age of [0.1, 1, 5, 8]) {
    assert.equal(isDangerZone(kid(age, { spo2: 91 })), true, `age ${age}`);
    assert.equal(isDangerZone(kid(age, { spo2: 92 })), false, `age ${age}`);
  }
});
test('band edges fall into the older, more sensitive band', () => {
  assert.equal(dangerThresholds(0.25).hr, 160); // exactly 3 months
  assert.equal(dangerThresholds(3).hr, 140);    // exactly 3 years
  assert.equal(dangerThresholds(8).hr, 140);    // age 8 is still pediatric
  assert.equal(dangerThresholds(8.01).hr, 100); // older than 8 uses adult thresholds
});
test('pediatric danger-zone reason names the threshold band', () => {
  const r = triage(kid(1, { hr: 170 }));
  assert.equal(r.level, 2);
  assert.match(r.reasons.join(' '), /3 months to 3 years/);
});
