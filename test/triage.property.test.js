// Property-based tests (fast-check). These encode the safety rules in the spec, not single examples.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { triage, OPTIONAL_VITALS } from '../src/triage.js';
import { CASES } from '../src/cases.js';
import { INTEGER_VITALS } from '../src/night.js';

const patientArb = fc.record({
  ageYears: fc.integer({ min: 9, max: 110 }),
  avpu: fc.constantFrom('A', 'V', 'P', 'U'),
  newConfusion: fc.boolean(),
  hr: fc.integer({ min: 20, max: 220 }),
  rr: fc.integer({ min: 2, max: 60 }),
  sbp: fc.integer({ min: 40, max: 240 }),
  spo2: fc.integer({ min: 50, max: 100 }),
  tempC: fc.double({ min: 30, max: 43, noNaN: true }),
  pain: fc.integer({ min: 0, max: 10 }),
  highRisk: fc.boolean(),
  needsLifesaving: fc.boolean(),
  resources: fc.integer({ min: 0, max: 6 }),
});

test('P1: level is always an integer 1..5 with at least one reason', () => {
  fc.assert(fc.property(patientArb, (p) => {
    const r = triage(p);
    return Number.isInteger(r.level) && r.level >= 1 && r.level <= 5 && r.reasons.length > 0;
  }));
});

test('P2: deterministic - same input, same output', () => {
  fc.assert(fc.property(patientArb, (p) => assert.deepEqual(triage(p), triage({ ...p }))));
});

test('P3: unresponsive or needing life-saving intervention is always level 1', () => {
  fc.assert(fc.property(patientArb, (p) => triage({ ...p, avpu: 'U' }).level === 1 && triage({ ...p, needsLifesaving: true }).level === 1));
});

test('P4: monotonic safety - adding a high-risk flag never makes triage less urgent', () => {
  fc.assert(fc.property(patientArb, (p) => triage({ ...p, highRisk: true }).level <= triage({ ...p, highRisk: false }).level));
});

test('P5: worsening SpO2 never makes triage less urgent', () => {
  fc.assert(fc.property(patientArb, fc.integer({ min: 1, max: 30 }), (p, drop) => {
    const worse = { ...p, spo2: Math.max(50, p.spo2 - drop) };
    return triage(worse).level <= triage(p).level;
  }));
});

test('P6: more expected resources never makes triage less urgent', () => {
  fc.assert(fc.property(patientArb, (p) => triage({ ...p, resources: p.resources + 1 }).level <= triage(p).level));
});

// ---- P7: pediatric danger-zone thresholds (requirement 1.8) ----
// Source: ESI Implementation Handbook v4, decision point D pediatric danger-zone vitals.
const pedsBand = (age) => (age < 0.25 ? { hr: 180, rr: 50 } : age < 3 ? { hr: 160, rr: 40 } : { hr: 140, rr: 30 });

const pediatricArb = fc.record({
  ageYears: fc.oneof(
    fc.double({ min: 0, max: 0.2499, noNaN: true }),
    fc.double({ min: 0.25, max: 2.999, noNaN: true }),
    fc.double({ min: 3, max: 8, noNaN: true }),
    fc.constantFrom(0, 0.25, 3, 8),
  ),
  avpu: fc.constantFrom('A', 'V', 'P', 'U'),
  newConfusion: fc.boolean(),
  hr: fc.integer({ min: 40, max: 240 }),
  rr: fc.integer({ min: 8, max: 80 }),
  sbp: fc.integer({ min: 40, max: 160 }),
  spo2: fc.integer({ min: 50, max: 100 }),
  tempC: fc.double({ min: 30, max: 43, noNaN: true }),
  pain: fc.integer({ min: 0, max: 10 }),
  highRisk: fc.boolean(),
  needsLifesaving: fc.boolean(),
  resources: fc.integer({ min: 0, max: 6 }),
});

test('P7a: age <= 8 uses the pediatric danger-zone band for that age, never the adult one', () => {
  fc.assert(fc.property(pediatricArb, (p) => {
    const t = pedsBand(p.ageYears);
    const expected = p.hr > t.hr || p.rr > t.rr || p.spo2 < 92;
    return triage(p).dangerZone === expected;
  }));
});

test('P7b: a stable child with 2+ resources is level 2 exactly when vitals are in the pediatric danger zone', () => {
  const stable = pediatricArb.map((p) => ({ ...p, avpu: 'A', newConfusion: false, highRisk: false, needsLifesaving: false, pain: 0, sbp: 100, spo2: Math.max(85, p.spo2), resources: Math.max(2, p.resources) }));
  fc.assert(fc.property(stable, (p) => {
    const r = triage(p);
    return r.level === (r.dangerZone ? 2 : 3);
  }));
});

test('P7c: in children, rising HR or RR never makes triage less urgent', () => {
  fc.assert(fc.property(pediatricArb, fc.integer({ min: 1, max: 60 }), (p, rise) =>
    triage({ ...p, hr: p.hr + rise }).level <= triage(p).level &&
    triage({ ...p, rr: p.rr + rise }).level <= triage(p).level));
});

test('P7d: safety properties P1, P3-P6 also hold for children', () => {
  fc.assert(fc.property(pediatricArb, fc.integer({ min: 1, max: 30 }), (p, drop) => {
    const r = triage(p);
    return Number.isInteger(r.level) && r.level >= 1 && r.level <= 5 && r.reasons.length > 0 &&
      triage({ ...p, avpu: 'U' }).level === 1 &&
      triage({ ...p, needsLifesaving: true }).level === 1 &&
      triage({ ...p, highRisk: true }).level <= r.level &&
      triage({ ...p, spo2: Math.max(50, p.spo2 - drop) }).level <= r.level &&
      triage({ ...p, resources: p.resources + 1 }).level <= r.level;
  }));
});

// ---- P8: case variants (task 14) ----
// Every case is a template: its vitals are drawn inside case.variants.vitals each time it appears.
// Any value inside those ranges must give exactly the case's expectedLevel. If this fails, narrow
// the case's range in src/cases.js; never change the engine to fit a case.
const rangeArb = (key, [lo, hi]) => (INTEGER_VITALS.includes(key)
  ? fc.integer({ min: lo, max: hi })
  : fc.integer({ min: Math.round(lo * 10), max: Math.round(hi * 10) }).map((t) => t / 10));

test('P8: any vitals drawn from a case\'s ranges give exactly its expectedLevel', () => {
  for (const c of CASES) {
    const vitalsArb = fc.record(Object.fromEntries(Object.entries(c.variants.vitals).map(([k, r]) => [k, rangeArb(k, r)])));
    fc.assert(
      fc.property(vitalsArb, (v) => triage({ ...c.patient, ...v }).level === c.expectedLevel),
      { numRuns: 200, examples: [[{ ...Object.fromEntries(Object.entries(c.variants.vitals).map(([k, [lo]]) => [k, lo])) }], [{ ...Object.fromEntries(Object.entries(c.variants.vitals).map(([k, [, hi]]) => [k, hi])) }]] },
    );
  }
});

// ---- P9: missing vital signs (task 17, clinical-safety rule 7) ----
// Removing a vital (null = not measured) never makes the level less urgent than the same patient
// with a measured value for it, for every measured value that is not itself a level-1 trigger.
// Those values are excluded on purpose: rule 2 says a missing value never triggers level 1 on its
// own, so "SpO2 80%" (ESI 1) can be more urgent than "SpO2 not measured".
const LEVEL1 = { hr: (v) => v < 40, rr: (v) => v < 8, sbp: (v) => v < 70, spo2: (v) => v < 85, tempC: () => false };
const anyAgeArb = fc.oneof(patientArb, pediatricArb);
const vitalArb = fc.constantFrom(...OPTIONAL_VITALS);
// Each other vital is missing about a quarter of the time, so combinations of gaps are covered too.
const withGapsArb = fc.record({ p: anyAgeArb, gaps: fc.record(Object.fromEntries(OPTIONAL_VITALS.map((k) => [k, fc.integer({ min: 0, max: 3 })]))) })
  .map(({ p, gaps }) => ({ ...p, ...Object.fromEntries(OPTIONAL_VITALS.filter((k) => gaps[k] === 0).map((k) => [k, null])) }));

test('P9: a missing vital is at least as urgent as any measured value that is not a level-1 trigger', () => {
  fc.assert(fc.property(withGapsArb, vitalArb, fc.integer({ min: 0, max: 260 }), fc.double({ min: 30, max: 43, noNaN: true }), (p, k, n, temp) => {
    const value = k === 'tempC' ? temp : k === 'spo2' ? Math.min(100, n) : n;
    if (LEVEL1[k](value)) return true;
    return triage({ ...p, [k]: null }).level <= triage({ ...p, [k]: value }).level;
  }), { numRuns: 2000 });
});

test('P9b: with vitals missing, P1 still holds, missing is listed exactly, and only step D results are provisional', () => {
  fc.assert(fc.property(withGapsArb, (p) => {
    const r = triage(p);
    const gaps = OPTIONAL_VITALS.filter((k) => p[k] === null);
    return Number.isInteger(r.level) && r.level >= 1 && r.level <= 5 && r.reasons.length > 0 &&
      JSON.stringify(r.missing) === JSON.stringify(gaps) &&
      (!r.provisional || (r.level === 2 && ['hr', 'rr', 'spo2'].some((k) => p[k] === null)));
  }), { numRuns: 1000 });
});

