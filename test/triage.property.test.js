// Property-based tests (fast-check). These encode the safety rules in the spec, not single examples.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { triage } from '../src/triage.js';

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
