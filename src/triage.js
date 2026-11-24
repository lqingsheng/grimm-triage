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

// Pediatric danger-zone vital signs (ESI v4 decision point D, age <= 8 years).
// Source: ESI Implementation Handbook v4 (AHRQ / ENA), decision point D danger-zone vitals table:
//   < 3 months: HR > 180, RR > 50;  3 months - 3 years: HR > 160, RR > 40;
//   3 - 8 years: HR > 140, RR > 30;  SpO2 < 92% at every age.
// Band edges (exactly 3 months, exactly 3 years) fall into the older band, which has the lower,
// more sensitive thresholds: when in doubt, choose the more urgent reading.
export const PEDIATRIC_DANGER = [
  { maxAgeYears: 0.25, label: 'age < 3 months', hr: 180, rr: 50, spo2: 92 },
  { maxAgeYears: 3, label: 'age 3 months to 3 years', hr: 160, rr: 40, spo2: 92 },
  { maxAgeYears: 8, label: 'age 3 to 8 years', hr: 140, rr: 30, spo2: 92 },
];

// Danger-zone thresholds for a given age in years: the pediatric band for age <= 8, else adult.
export function dangerThresholds(ageYears) {
  const [infant, toddler, child] = PEDIATRIC_DANGER;
  if (ageYears < infant.maxAgeYears) return infant;
  if (ageYears < toddler.maxAgeYears) return toddler;
  if (ageYears <= child.maxAgeYears) return child;
  return { label: 'adult, age > 8 years', ...ADULT_DANGER };
}

// Age-based hypotension cut-off for systolic BP, used ONLY to highlight vitals in the UI.
// It does not feed triage(): the level-1 SBP rule (< 70) is unchanged.
// Source: AHA Pediatric Advanced Life Support (PALS) Provider Manual, definition of hypotension:
//   term neonates 0-28 days: SBP < 60;  infants 1-12 months: SBP < 70;
//   children 1-10 years: SBP < 70 + (2 x age in years);  over 10 years: SBP < 90.
// "Age in years" is completed years (e.g. 2.5 y -> 2 -> SBP < 74), as the formula is usually applied.
// Day 28 counts as neonatal and age 1 and age 10 use the formula, matching the published bands;
// the formula gives 90 at age 10, so the bands join without a jump.
const DAYS_PER_YEAR = 365.25;
export function hypotensionThreshold(ageYears) {
  if (ageYears * DAYS_PER_YEAR <= 28) return 60;
  if (ageYears < 1) return 70;
  if (ageYears <= 10) return 70 + 2 * Math.floor(ageYears);
  return 90;
}

export function isDangerZone(p) {
  const t = dangerThresholds(p.ageYears);
  return p.hr > t.hr || p.rr > t.rr || p.spo2 < t.spo2;
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
      reasons.push(`2+ resources with danger-zone vital signs (${dangerThresholds(p.ageYears).label} thresholds)`);
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
