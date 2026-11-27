// Case bank checks for task 14: size and balance, variant ranges, openings, and an exhaustive
// check that every vital value a case can draw still gives its expectedLevel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../src/cases.js';
import { triage, PEDIATRIC_DANGER, dangerThresholds } from '../src/triage.js';
import { RANGED_VITALS, INTEGER_VITALS, splitOpening } from '../src/night.js';

const LEVELS = [1, 2, 3, 4, 5];

// Regular cases (drawn on their own): 12 per level, plus Poe the Raven, moved from ESI 3 to ESI 2
// after clinical review. Storyline cases (task 21) only arrive in pairs and are counted apart.
const PER_LEVEL_COUNT = { 1: 12, 2: 13, 3: 12, 4: 12, 5: 12 };
const STORYLINE_PER_LEVEL = { 1: 3, 2: 3, 3: 0, 4: 2, 5: 2 };

test('71 cases: 61 regular with the reviewed level spread (at least 12 per ESI level) and 10 storyline cases, unique ids', () => {
  assert.equal(CASES.length, 71);
  assert.equal(new Set(CASES.map((c) => c.id)).size, CASES.length);
  const regular = CASES.filter((c) => !c.storyline);
  assert.equal(regular.length, 61);
  for (const l of LEVELS) {
    assert.equal(regular.filter((c) => c.expectedLevel === l).length, PER_LEVEL_COUNT[l], `level ${l}`);
    assert.equal(CASES.filter((c) => c.storyline && c.expectedLevel === l).length, STORYLINE_PER_LEVEL[l], `storyline level ${l}`);
  }
});

test('Poe the Raven (staggered paracetamol overdose) is high risk, ESI 2', () => {
  const poe = CASES.find((c) => c.id === 'raven-paracetamol');
  assert.equal(poe.expectedLevel, 2);
  assert.equal(poe.patient.highRisk, true);
  assert.match(poe.teachingPoint, /nomogram/);
  assert.match(poe.zh.teachingPoint, /列线图/);
});

test('at least 12 pediatric cases, with at least 2 in every pediatric age band', () => {
  const kids = CASES.filter((c) => c.patient.ageYears <= 8);
  assert.ok(kids.length >= 12, `only ${kids.length} pediatric cases`);
  const bands = [
    (a) => a < 0.25,
    (a) => a >= 0.25 && a < 3,
    (a) => a >= 3 && a <= 8,
  ];
  for (const [i, inBand] of bands.entries()) {
    assert.ok(kids.filter((c) => inBand(c.patient.ageYears)).length >= 2, `${PEDIATRIC_DANGER[i].label}: fewer than 2 cases`);
  }
});

// The presentations asked for in task 14, each mapped to the cases that teach it.
const COVERAGE = {
  'chest pain / ACS': ['witch-chestpain'],
  sepsis: ['lich-septic-shock'],
  DKA: ['sugar-skull-dka'],
  anaphylaxis: ['werewolf-cub-anaphylaxis', 'zombie-anaphylaxis'],
  'GI bleed': ['ghoul-gi-bleed'],
  'ectopic pregnancy': ['nymph-ectopic'],
  'pre-eclampsia': ['siren-preeclampsia'],
  'suicidal ideation and agitation': ['shade-suicidal'],
  'paracetamol overdose': ['raven-paracetamol'],
  'organophosphate poisoning': ['mothman-organophosphate'],
  'elderly fall on anticoagulants': ['grimalkin-fall-anticoag'],
  'head injury': ['horseman-head-injury'],
  'renal colic': ['golem-renal-colic'],
  burns: ['dragon-keeper-burn'],
  asthma: ['wraith-asthma', 'hag-asthma-mild'],
  'febrile infant under 3 months': ['baby-bat-febrile-infant'],
  'sore throat': ['elf-strep-throat', 'echo-sore-throat'],
  rash: ['bog-witch-ivy-rash', 'mini-mummy-nappy-rash'],
  'prescription refill': ['skeleton-refill', 'ghoulberg-eye-drops'],
};

test('every requested presentation is covered', () => {
  const ids = new Set(CASES.map((c) => c.id));
  for (const [topic, list] of Object.entries(COVERAGE)) for (const id of list) assert.ok(ids.has(id), `${topic}: missing ${id}`);
  const febrile = CASES.find((c) => c.id === 'baby-bat-febrile-infant');
  assert.ok(febrile.patient.ageYears < 0.25 && febrile.variants.vitals.tempC[0] >= 38, 'febrile infant must be < 3 months with T >= 38 in every variant');
});

test('every case has a valid range for each vital sign, containing its typical value', () => {
  for (const c of CASES) {
    const v = c.variants?.vitals;
    assert.ok(v, `${c.id}: missing variants.vitals`);
    for (const key of RANGED_VITALS) assert.ok(v[key], `${c.id}: no range for ${key}`);
    for (const [key, range] of Object.entries(v)) {
      assert.ok([...RANGED_VITALS, 'pain'].includes(key), `${c.id}: unknown vital ${key}`);
      const [lo, hi] = range;
      assert.ok(range.length === 2 && lo <= hi, `${c.id}.${key}: bad range`);
      if (INTEGER_VITALS.includes(key)) assert.ok(Number.isInteger(lo) && Number.isInteger(hi), `${c.id}.${key}: whole numbers only`);
      assert.ok(lo <= c.patient[key] && c.patient[key] <= hi, `${c.id}.${key}: typical value ${c.patient[key]} outside range`);
    }
    assert.ok(v.spo2[1] <= 100 && v.spo2[0] >= 50, `${c.id}: SpO2 range`);
    if (v.pain) assert.ok(v.pain[0] >= 0 && v.pain[1] <= 10, `${c.id}: pain range`);
  }
});

test('alternative openings: 2 or 3 per case, both languages, and the story splits cleanly', () => {
  let withOpenings = 0;
  for (const c of CASES) {
    const openings = c.variants.openings;
    if (!openings) continue;
    withOpenings += 1;
    assert.ok(openings.length >= 2 && openings.length <= 3, `${c.id}: needs 2 or 3 openings`);
    assert.ok(splitOpening(c.story, 'en')[1].length > 0, `${c.id}: English story has one sentence`);
    assert.ok(splitOpening(c.zh.story, 'zh')[1].length > 0, `${c.id}: Chinese story has one sentence`);
    for (const o of openings) {
      assert.match(o.en, /[.!?]$/, `${c.id}: English opening must end a sentence`);
      assert.match(o.zh, /[。！？]$/, `${c.id}: Chinese opening must end a sentence`);
      assert.equal(splitOpening(o.en, 'en')[1], '', `${c.id}: opening must be one sentence`);
    }
  }
  assert.ok(withOpenings >= 40, `only ${withOpenings} cases have alternative openings`);
});

// Vital values vary between appearances, so the text must quote thresholds, never the patient's
// own numbers (for example "HR > 140" is fine, "HR 146" is not).
test('stories and teaching points never quote a vital value that can vary', () => {
  const en = /\b(HR|RR|SBP|BP|SpO2|SpO₂)\s+\d|\bpain \d+\/10|\d+\/min\b|\d+ mmHg/;
  const zh = /(心率|呼吸频率|收缩压|血氧饱和度|体温)\s*\d|疼痛\s*\d+\/10|\d+\s*次\/分(?!钟)/;
  for (const c of CASES) {
    for (const text of [c.story, c.teachingPoint, ...(c.variants.openings ?? []).map((o) => o.en)]) assert.doesNotMatch(text, en, `${c.id}: "${text}"`);
    for (const text of [c.zh.story, c.zh.teachingPoint, ...(c.variants.openings ?? []).map((o) => o.zh)]) {
      // "心率 > 160 次/分" and "低于 8 次/分" quote thresholds: allowed. Strip comparisons first.
      const stripped = text.replace(/([<>≥≤]|低于|高于|超过|大于|小于|升至)\s*\d+(\.\d+)?\s*(次\/分|%)?/g, '');
      assert.doesNotMatch(stripped, zh, `${c.id}: "${text}"`);
    }
  }
});

// ---- exhaustive range check (the deterministic twin of property test P8) ----
// triage() compares each vital with fixed cut-offs, so its result only changes where a vital
// crosses one. Testing each range's ends plus every cut-off (and its neighbours) inside the
// range, in every combination, covers every result the case can produce.
function cutoffs(key, ageYears) {
  const band = dangerThresholds(ageYears);
  return {
    hr: [40, band.hr], rr: [8, band.rr], sbp: [70], spo2: [85, band.spo2], pain: [7], tempC: [],
  }[key];
}

function candidates(key, [lo, hi], ageYears) {
  const step = INTEGER_VITALS.includes(key) ? 1 : 0.1;
  const values = new Set([lo, hi]);
  for (const t of cutoffs(key, ageYears)) {
    for (const v of [t - step, t, t + step]) if (v >= lo && v <= hi) values.add(Math.round(v * 10) / 10);
  }
  return [...values];
}

test('every vital combination a case can draw gives its expectedLevel (boundary grid)', () => {
  let checked = 0;
  for (const c of CASES) {
    const entries = Object.entries(c.variants.vitals).map(([key, range]) => [key, candidates(key, range, c.patient.ageYears)]);
    const walk = (i, patient) => {
      if (i === entries.length) {
        checked += 1;
        const { level } = triage(patient);
        assert.equal(level, c.expectedLevel, `${c.id}: ${JSON.stringify(patient)} gives ESI ${level}`);
        return;
      }
      const [key, values] = entries[i];
      for (const v of values) walk(i + 1, { ...patient, [key]: v });
    };
    walk(0, { ...c.patient });
  }
  assert.ok(checked > 60 * 32, `only ${checked} combinations checked`);
});
