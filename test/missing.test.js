// Incomplete vital signs (task 17, clinical-safety rule 7): the engine rules, input validation,
// and a deterministic, exhaustive version of property test P9 over every engine cut-off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { triage, validate, OPTIONAL_VITALS, DANGER_ZONE_VITALS, MISSING_DANGER_REASON, PEDIATRIC_DANGER, ADULT_DANGER } from '../src/triage.js';
import { decisionPointFor } from '../src/shift.js';
import { CASES } from '../src/cases.js';

const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 };
const without = (p, ...keys) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, null])) });

test('every game case has all five vital signs measured', () => {
  for (const c of CASES) {
    for (const k of OPTIONAL_VITALS) assert.ok(Number.isFinite(c.patient[k]), `${c.id}: ${k} must be measured`);
    assert.deepEqual(triage(c.patient).missing, [], c.id);
    assert.equal(triage(c.patient).provisional, false, c.id);
  }
});

test('result shape: missing lists the null vitals in a fixed order; complete input is never provisional', () => {
  assert.deepEqual(OPTIONAL_VITALS, ['hr', 'rr', 'sbp', 'spo2', 'tempC']);
  assert.deepEqual(DANGER_ZONE_VITALS, ['hr', 'rr', 'spo2']);
  const full = triage(base);
  assert.deepEqual(Object.keys(full).sort(), ['dangerZone', 'level', 'missing', 'provisional', 'reasons']);
  assert.deepEqual(full.missing, []);
  assert.equal(full.provisional, false);
  assert.deepEqual(triage(without(base, 'tempC', 'hr', 'sbp')).missing, ['hr', 'sbp', 'tempC']);
});

test('only explicit null means not measured: undefined, NaN, strings and blanks are still errors', () => {
  for (const k of OPTIONAL_VITALS) {
    assert.deepEqual(validate({ ...base, [k]: null }), [], `${k}: null is allowed`);
    for (const bad of [undefined, NaN, Infinity, '', '80']) {
      assert.throws(() => triage({ ...base, [k]: bad }), TypeError, `${k} = ${String(bad)}`);
    }
  }
  for (const k of ['ageYears', 'pain', 'resources']) assert.throws(() => triage({ ...base, [k]: null }), TypeError, `${k} stays required`);
  assert.throws(() => triage({ ...base, avpu: null }), TypeError);
  assert.throws(() => triage({ ...base, highRisk: null, avpu: 'X' }), TypeError);
});

test('rule 2: a missing value never triggers level 1 on its own; measured values still can', () => {
  for (const k of OPTIONAL_VITALS) assert.notEqual(triage(without(base, k)).level, 1, k);
  assert.notEqual(triage(without(base, ...OPTIONAL_VITALS)).level, 1, 'all five missing');
  assert.equal(triage(without({ ...base, spo2: 80 }, 'hr', 'rr')).level, 1, 'a measured SpO2 < 85 still fires');
  assert.equal(triage(without({ ...base, avpu: 'U' }, ...OPTIONAL_VITALS)).level, 1, 'AVPU U still fires');
  assert.equal(triage(without({ ...base, highRisk: true }, ...OPTIONAL_VITALS)).level, 2, 'step B still works');
  assert.equal(triage(without({ ...base, pain: 8 }, 'spo2')).level, 2);
  assert.equal(triage(without({ ...base, highRisk: true }, 'spo2')).provisional, false, 'a step B result is not provisional');
});

test('rule 3: at step D a missing HR, RR or SpO2 gives a provisional ESI 2 with the stated reason', () => {
  const two = { ...base, resources: 2 };
  assert.equal(triage(two).level, 3, 'complete and normal: ESI 3');
  for (const k of DANGER_ZONE_VITALS) {
    const r = triage(without(two, k));
    assert.equal(r.level, 2, k);
    assert.equal(r.provisional, true, k);
    assert.deepEqual(r.reasons, [MISSING_DANGER_REASON]);
    assert.equal(decisionPointFor(r), 'D', `${k}: decided at step D`);
  }
  assert.equal(MISSING_DANGER_REASON, 'danger-zone vital signs could not be checked: when in doubt, choose the more urgent level');
  // A measured danger-zone value already makes it ESI 2: that is certain, not provisional.
  const measuredDanger = triage(without({ ...two, hr: 130 }, 'spo2'));
  assert.deepEqual([measuredDanger.level, measuredDanger.provisional], [2, false]);
  assert.match(measuredDanger.reasons[0], /^2\+ resources with danger-zone vital signs/);
  // Pediatric bands apply to the values that were measured.
  assert.deepEqual([triage(without({ ...two, ageYears: 1, hr: 150 }, 'rr')).level, triage(without({ ...two, ageYears: 1, hr: 150 }, 'rr')).provisional], [2, true]);
});

test('rule 4: ESI 4 and 5 do not change when vitals are missing', () => {
  for (const resources of [0, 1]) {
    const expected = resources === 0 ? 5 : 4;
    for (const k of OPTIONAL_VITALS) {
      const r = triage(without({ ...base, resources }, k));
      assert.deepEqual([r.level, r.provisional], [expected, false], `${k}, ${resources} resources`);
      assert.deepEqual(r.missing, [k]);
    }
    assert.equal(triage(without({ ...base, resources }, ...OPTIONAL_VITALS)).level, expected);
  }
});

test('rule 5: a missing SBP or temperature never changes the level, but is listed', () => {
  for (const p of [base, { ...base, resources: 1 }, { ...base, resources: 2 }, { ...base, resources: 3, hr: 120 }, { ...base, highRisk: true }, { ...base, avpu: 'U' }]) {
    for (const k of ['sbp', 'tempC']) {
      const r = triage(without(p, k));
      assert.equal(r.level, triage(p).level, `${k}: level changed for ${JSON.stringify(p)}`);
      assert.equal(r.provisional, false);
      assert.deepEqual(r.missing, [k]);
    }
  }
});

// ---- P9, deterministic twin ----
// For any patient and any vital: the result with that vital missing is at least as urgent as the
// result with any measured value for it, unless that measured value would itself trigger level 1
// (rule 2 forbids a missing value from doing that). Values tested: both sides of every engine
// cut-off for every age band, plus normal values.
const LEVEL1_CUTOFF = { hr: 40, rr: 8, sbp: 70, spo2: 85 };
const level1Trigger = (k, v) => (k === 'spo2' ? v < 85 : k === 'rr' ? v < 8 : k === 'hr' ? v < 40 : k === 'sbp' ? v < 70 : false);

function valuesFor(k) {
  const bands = [ADULT_DANGER, ...PEDIATRIC_DANGER];
  const cuts = { hr: [LEVEL1_CUTOFF.hr, ...bands.map((b) => b.hr)], rr: [LEVEL1_CUTOFF.rr, ...bands.map((b) => b.rr)], sbp: [LEVEL1_CUTOFF.sbp], spo2: [LEVEL1_CUTOFF.spo2, ...bands.map((b) => b.spo2)], tempC: [] }[k];
  const normal = { hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8 }[k];
  return [...new Set([normal, ...cuts.flatMap((c) => [c - 1, c, c + 1]), ...(k === 'tempC' ? [34, 39.5] : [])])];
}

test('P9 (exhaustive): missing is at least as urgent as every measured value that is not itself a level-1 trigger', () => {
  let checked = 0;
  for (const ageYears of [0.1, 0.25, 1, 3, 5, 8, 9, 40]) {
    for (const resources of [0, 1, 2, 3]) {
      for (const flags of [{}, { highRisk: true }, { pain: 8 }, { avpu: 'V' }, { needsLifesaving: true }]) {
        for (const k of OPTIONAL_VITALS) {
          for (const others of [{}, { hr: null }, { spo2: null }, { rr: 200 }]) {
            if (k in others) continue;
            const p = { ...base, ageYears, resources, ...flags, ...others };
            const missingLevel = triage({ ...p, [k]: null }).level;
            for (const v of valuesFor(k)) {
              if (level1Trigger(k, v)) continue;
              checked += 1;
              assert.ok(missingLevel <= triage({ ...p, [k]: v }).level, `${k} missing gives ESI ${missingLevel}, but ${k} = ${v} gives a more urgent level for ${JSON.stringify(p)}`);
            }
          }
        }
      }
    }
  }
  assert.ok(checked > 5000, `only ${checked} comparisons`);
});

test('the clinical-safety steering file has rule 7 for missing vitals', () => {
  const steering = readFileSync(new URL('../.kiro/steering/clinical-safety.md', import.meta.url), 'utf8');
  assert.match(steering, /^7\. A vital sign that was not measured \(`null`\)/m);
});
