// Grimm Triage engine: a pure, deterministic ESI-style (v4) five-level triage function.
// EDUCATIONAL USE ONLY. Not a medical device. Never use for real patient care.
//
// triage(patient) -> { level: 1..5, reasons: string[], dangerZone: boolean }
//
// patient = {
//   ageYears: number,
//   avpu: 'A' | 'V' | 'P' | 'U',
//   newConfusion: boolean,
//   hr: number, rr: number, sbp: number, spo2: number, tempC: number,
//   pain: 0..10,
//   highRisk: boolean,          // high-risk complaint (e.g. chest pain ? ACS, stroke signs, suicidal)
//   needsLifesaving: boolean,   // needs an immediate life-saving intervention
//   resources: 0..n             // expected number of different ED resources
// }

export const LEVEL_NAMES = {
  1: 'Resuscitation',
  2: 'Emergent',
  3: 'Urgent',
  4: 'Less urgent',
  5: 'Non-urgent',
};

// Adult danger-zone vital signs (ESI v4 decision point D, age > 8 years).
export const ADULT_DANGER = { hr: 100, rr: 20, spo2: 92 };

const finite = (x) => typeof x === 'number' && Number.isFinite(x);

export function validate(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return ['patient must be an object'];
  if (!['A', 'V', 'P', 'U'].includes(p.avpu)) errors.push('avpu must be A, V, P or U');
  for (const k of ['ageYears', 'hr', 'rr', 'sbp', 'spo2', 'tempC', 'pain', 'resources']) {
    if (!finite(p[k])) errors.push(`${k} must be a finite number`);
  }
  if (finite(p.pain) && (p.pain < 0 || p.pain > 10)) errors.push('pain must be 0 to 10');
  if (finite(p.spo2) && (p.spo2 < 0 || p.spo2 > 100)) errors.push('spo2 must be 0 to 100');
  if (finite(p.resources) && p.resources < 0) errors.push('resources must be >= 0');
  return errors;
}

export function isDangerZone(p) {
  // Starter: adult thresholds only. Pediatric thresholds are task 4 in the spec.
  return p.hr > ADULT_DANGER.hr || p.rr > ADULT_DANGER.rr || p.spo2 < ADULT_DANGER.spo2;
}

export function triage(p) {
  const errors = validate(p);
  if (errors.length) throw new TypeError(errors.join('; '));

  const reasons = [];
  const dangerZone = isDangerZone(p);

  // Decision point A: immediate life-saving intervention?
  const level1Triggers = [
    [p.needsLifesaving, 'needs an immediate life-saving intervention'],
    [p.avpu === 'U', 'unresponsive (AVPU = U)'],
    [p.spo2 < 85, `SpO2 ${p.spo2}% < 85%`],
    [p.rr < 8, `RR ${p.rr}/min < 8`],
    [p.hr < 40, `HR ${p.hr}/min < 40`],
    [p.sbp < 70, `SBP ${p.sbp} mmHg < 70`],
  ];
  for (const [hit, why] of level1Triggers) if (hit) reasons.push(why);
  if (reasons.length) return { level: 1, reasons, dangerZone };

  // Decision point B: high risk, new confusion/lethargy, or severe pain/distress?
  const level2Triggers = [
    [p.highRisk, 'high-risk complaint'],
    [p.avpu === 'V' || p.avpu === 'P', `altered responsiveness (AVPU = ${p.avpu})`],
    [p.newConfusion, 'new confusion or lethargy'],
    [p.pain >= 7, `severe pain ${p.pain}/10`],
  ];
  for (const [hit, why] of level2Triggers) if (hit) reasons.push(why);
  if (reasons.length) return { level: 2, reasons, dangerZone };

  // Decision point C: how many resources?
  if (p.resources >= 2) {
    // Decision point D: danger-zone vitals -> consider level 2.
    if (dangerZone) {
      reasons.push('2+ resources with danger-zone vital signs');
      return { level: 2, reasons, dangerZone };
    }
    reasons.push(`${p.resources} resources expected`);
    return { level: 3, reasons, dangerZone };
  }
  if (p.resources === 1) {
    reasons.push('1 resource expected');
    return { level: 4, reasons, dangerZone };
  }
  reasons.push('no resources expected');
  return { level: 5, reasons, dangerZone };
}

// Score a player's guess against the engine: exact = 100, off by one = 50, else 0.
// Under-triage (guess less urgent than truth) costs an extra 25.
export function scoreGuess(guess, truth) {
  const diff = guess - truth;
  let points = diff === 0 ? 100 : Math.abs(diff) === 1 ? 50 : 0;
  if (diff > 0) points = Math.max(0, points - 25);
  return { points, underTriage: diff > 0, overTriage: diff < 0 };
}
