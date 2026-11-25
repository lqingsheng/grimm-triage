// "ESI v4 in 2 minutes" lesson in the shift report (task 15): decision points, the danger-zone
// table built from the engine, translations, accessibility markup and placement in the report.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CASES } from '../src/cases.js';
import { triage, ADULT_DANGER, PEDIATRIC_DANGER } from '../src/triage.js';
import { decisionPointFor, stepSummary, summarizeShift, STEPS } from '../src/shift.js';
import { lessonHtml, dangerRows, RESOURCE_COUNTS, RESOURCE_NOT } from '../src/lesson.js';
import { STRINGS, LANGS, t } from '../src/i18n.js';
import { instantiate, mulberry32 } from '../src/night.js';

const badge = (l) => `<span class="badge lv${l}">ESI ${l}</span>`;
const render = (lang, opts = {}) => lessonHtml({ tr: (k, v) => t(k, lang, v), badge, ...opts });

// ---- decisionPointFor ----
// The rule that fired, read independently of decisionPointFor: which triage() reason pattern led.
const LEVEL1 = /life-saving|unresponsive|SpO2 .* < 85|RR .* < 8|HR .* < 40|SBP .* < 70/;
const LEVEL2B = /high-risk complaint|altered responsiveness|new confusion|severe pain/;
const LEVEL2D = /danger-zone vital signs/;
const RESOURCES = /resources? expected/;

function ruleThatFired({ level, reasons }) {
  if (reasons.every((r) => LEVEL1.test(r))) return 'A';
  if (reasons.every((r) => LEVEL2B.test(r))) return 'B';
  if (reasons.length === 1 && LEVEL2D.test(reasons[0])) return 'D';
  if (reasons.length === 1 && RESOURCES.test(reasons[0])) return 'C';
  throw new Error(`unexpected reasons for level ${level}: ${reasons}`);
}

test('decisionPointFor matches the rule that fired, for every case in the bank and its drawn variants', () => {
  const random = mulberry32(15);
  const seen = new Set();
  for (const c of CASES) {
    for (const patient of [c.patient, ...Array.from({ length: 10 }, () => instantiate(c, random).patient)]) {
      const r = triage(patient);
      const step = decisionPointFor(r);
      assert.equal(step, ruleThatFired(r), `${c.id}: ${r.reasons}`);
      if (r.level === 1) assert.equal(step, 'A');
      if (r.level >= 3) assert.equal(step, 'C');
      seen.add(step);
    }
  }
  assert.deepEqual([...seen].sort(), STEPS, 'the bank exercises all four decision points');
});

test('decisionPointFor separates the two ways to reach ESI 2', () => {
  const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 2 };
  assert.equal(decisionPointFor(triage({ ...base, hr: 120 })), 'D');
  assert.equal(decisionPointFor(triage({ ...base, highRisk: true })), 'B');
  assert.equal(decisionPointFor(triage({ ...base, highRisk: true, hr: 120 })), 'B', 'B is asked before D');
  assert.equal(decisionPointFor(triage({ ...base, pain: 8 })), 'B');
  assert.equal(decisionPointFor(triage({ ...base, resources: 0 })), 'C');
  assert.throws(() => decisionPointFor(null), TypeError);
  assert.throws(() => decisionPointFor({ level: 7, reasons: [] }), TypeError);
});

test('stepSummary counts misses per step; the earliest step wins a tie', () => {
  const m = (step) => ({ step });
  assert.deepEqual(stepSummary([]), { total: 0, counts: { A: 0, B: 0, C: 0, D: 0 }, top: null, topCount: 0 });
  assert.deepEqual(stepSummary([m('B'), m('C'), m('B'), m('A')]), { total: 4, counts: { A: 1, B: 2, C: 1, D: 0 }, top: 'B', topCount: 2 });
  assert.equal(stepSummary([m('C'), m('B')]).top, 'B');
  assert.equal(stepSummary([m(null)]).top, null);
});

test('summarizeShift carries each missed case step through to the report', () => {
  const answers = CASES.slice(0, 15).map((c) => {
    const r = triage(c.patient);
    return { case: c, guess: r.level === 5 ? 4 : 5, level: r.level, step: decisionPointFor(r) };
  });
  for (const m of summarizeShift(answers).missed) assert.equal(m.step, decisionPointFor(triage(CASES.find((c) => c.id === m.id).patient)));
});

// ---- danger-zone table ----
test('the rendered table numbers equal ADULT_DANGER and PEDIATRIC_DANGER, in both languages', () => {
  const [infant, toddler, child] = PEDIATRIC_DANGER;
  const expected = [ADULT_DANGER, child, toddler, infant].map((b) => [b.hr, b.rr, b.spo2]);
  assert.deepEqual(dangerRows().map((r) => [r.hr, r.rr, r.spo2]), expected);
  for (const lang of LANGS) {
    const html = render(lang);
    const rows = [...html.matchAll(/<tr><th scope="row">[^<]+<\/th><td data-vital="hr">([^<]+)<\/td><td data-vital="rr">([^<]+)<\/td><td data-vital="spo2">([^<]+)<\/td><\/tr>/g)];
    assert.equal(rows.length, 4, `${lang}: 4 age bands`);
    const nums = rows.map((row) => row.slice(1).map((cell) => Number(cell.match(/\d+/)[0])));
    assert.deepEqual(nums, expected, `${lang}: table must match the engine`);
    for (const row of rows) {
      assert.match(row[1], /^&gt; \d+$/);
      assert.match(row[3], /^&lt; \d+%$/);
    }
  }
});

test('the lesson hard-codes no danger-zone numbers', () => {
  const src = readFileSync(new URL('../src/lesson.js', import.meta.url), 'utf8');
  for (const n of new Set([ADULT_DANGER, ...PEDIATRIC_DANGER].flatMap((b) => [b.hr, b.rr, b.spo2]))) {
    assert.doesNotMatch(src, new RegExp(`\\b${n}\\b`), `lesson.js contains ${n}`);
  }
  for (const [key, entry] of Object.entries(STRINGS)) {
    if (!key.startsWith('lesson.') || key === 'lesson.note') continue;
    for (const n of [180, 160, 140, 100, 50, 40, 30, 20, 92]) assert.doesNotMatch(entry.en, new RegExp(`\\b${n}\\b`), `${key} hard-codes ${n}`);
  }
});

// ---- strings ----
const lessonKeys = () => Object.keys(STRINGS).filter((k) => k.startsWith('lesson.'));

test('every lesson string exists in English and Chinese, and every key the lesson uses exists', () => {
  const CJK = /[\u4e00-\u9fff]/;
  assert.ok(lessonKeys().length >= 50);
  for (const k of lessonKeys()) {
    assert.ok(STRINGS[k].en?.trim(), `${k}: no English`);
    assert.ok(STRINGS[k]['zh-CN']?.trim(), `${k}: no Chinese`);
    if (!['lesson.above', 'lesson.belowPct'].includes(k)) assert.match(STRINGS[k]['zh-CN'], CJK, `${k}: Chinese is not Chinese`);
  }
  const used = [
    'lesson.summary', 'lesson.stepsTitle', 'lesson.step', 'lesson.stepTag', 'lesson.resourcesTitle', 'lesson.resourcesIntro',
    'lesson.counts', 'lesson.notCounts', 'lesson.vitalsTitle', 'lesson.vitalsCaption', 'lesson.age', 'lesson.hrHead',
    'lesson.rrHead', 'lesson.spo2Head', 'lesson.above', 'lesson.belowPct', 'lesson.wrongTitle', 'lesson.wrongItem',
    'lesson.wrongCount', 'lesson.wrongOne', 'lesson.wrongNone', 'lesson.note', 'lesson.source',
    ...STEPS.flatMap((s) => [`lesson.step${s}.q`, `lesson.step${s}.a`, `lesson.stepName.${s}`]),
    ...RESOURCE_COUNTS.map((k) => `lesson.counts.${k}`), ...RESOURCE_NOT.map((k) => `lesson.not.${k}`),
    ...dangerRows().map((r) => `lesson.band.${r.band}`),
  ];
  for (const k of used) assert.ok(STRINGS[k], `missing string ${k}`);
  for (const lang of LANGS) {
    const html = render(lang, { missed: [{ name: 'X', correctLevel: 2, step: 'B' }, { name: 'Y', correctLevel: 1, step: 'A' }] });
    assert.doesNotMatch(html, /lesson\.[\w.]+/, `${lang}: an untranslated key leaked into the markup`);
    assert.doesNotMatch(html, /\{\w+\}/, `${lang}: an unfilled placeholder`);
  }
});

test('the note and source line say what the task asks for', () => {
  assert.equal(STRINGS['lesson.summary'].en, 'Learn ESI v4 in 2 minutes');
  assert.equal(STRINGS['lesson.note'].en, 'The numeric level-1 cut-offs in this game (SpO2 < 85%, RR < 8, HR < 40, SBP < 70) are teaching simplifications. ESI v4 decides level 1 by the need for an immediate life-saving intervention.');
  assert.equal(STRINGS['lesson.source'].en, 'Summarised from the ESI Implementation Handbook, version 4 (AHRQ / ENA). Educational use only.');
  // The note's numbers must match the engine's level-1 rules.
  const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 };
  for (const [k, cut] of [['spo2', 85], ['rr', 8], ['hr', 40], ['sbp', 70]]) {
    assert.equal(triage({ ...base, [k]: cut - 1 }).level, 1, `${k} ${cut - 1}`);
    assert.notEqual(triage({ ...base, [k]: cut }).level, 1, `${k} ${cut}`);
  }
});

// ---- markup and accessibility ----
test('lesson markup: collapsible details, ordered steps, lists, a captioned table with scoped headers, no animation', () => {
  const html = render('en');
  assert.match(html, /^<details class="lesson" id="lesson">\s*<summary>Learn ESI v4 in 2 minutes<\/summary>/);
  assert.doesNotMatch(html, /<details[^>]* open/, 'closed by default');
  assert.match(render('en', { open: true }), /^<details class="lesson" id="lesson" open>/);
  assert.equal((html.match(/<h3 /g) ?? []).length, 4, 'four section headings');
  assert.equal((html.match(/<h4>/g) ?? []).length, 2, 'two resource list headings');
  assert.match(html, /<ol class="lesson-steps">(\s*<li>[\s\S]*?<\/li>){4}<\/ol>/);
  for (const s of STEPS) assert.ok(html.includes(`Step ${s}`), `step ${s}`);
  assert.equal((html.match(/<ul>/g) ?? []).length, 2);
  assert.match(html, /<table class="danger-table">\s*<caption>/);
  assert.equal((html.match(/<th scope="col">/g) ?? []).length, 4);
  assert.equal((html.match(/<th scope="row">/g) ?? []).length, 4);
  assert.doesNotMatch(html, /style=|<script|on\w+=/);
  // No stray < or > in text: every < starts a tag.
  assert.doesNotMatch(html.replace(/<\/?[a-z][^>]*>/g, ''), /[<>]/, 'unescaped < or > in the lesson text');

  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const lessonCss = css.slice(css.indexOf('/* "ESI v4 in 2 minutes"'), css.indexOf('@media (max-width: 400px)')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(lessonCss.length > 100);
  assert.doesNotMatch(lessonCss, /animation|transition/, 'the lesson never animates');
  assert.match(lessonCss, /\.lesson \{[^}]*background: var\(--btn-bg\)/, 'opaque card');
  // Sits inside .report (z-index 2), above the stains (z-index 1).
  const z = (sel) => Number(css.match(new RegExp(`${sel.replace(/[.,]/g, (c) => `\\${c}`)}\\s*{[^}]*z-index:\\s*(\\d+)`))?.[1]);
  assert.ok(z('.hud, .card, .report') > z('.stains'));
});

test('where your shift went wrong: per-case step and the one-line count', () => {
  const missed = [
    { name: 'Agatha', correctLevel: 2, step: 'B' },
    { name: 'Medusa', correctLevel: 2, step: 'B' },
    { name: 'Vlad', correctLevel: 1, step: 'A' },
    { name: 'Selene', correctLevel: 2, step: 'B' },
  ];
  const en = render('en', { missed });
  assert.ok(en.includes('3 of your 4 misses were at step B.'));
  assert.ok(en.includes('Vlad: <span class="badge lv1">ESI 1</span>, decided at step A (life-saving intervention)'));
  assert.ok(render('zh-CN', { missed }).includes('你的 4 次失误中，有 3 次发生在第 B 步。'));
  assert.ok(render('en', { missed: missed.slice(2, 3) }).includes('Your one miss was at step A.'));
  assert.ok(render('en').includes('No misses tonight'));
});

test('the report places the lesson below the missed cases and above "Start a new night", open after an under-triage', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const report = app.slice(app.indexOf('function renderReport'), app.indexOf('function startNight'));
  const missedAt = report.indexOf("tr('report.missed')");
  const lessonAt = report.indexOf('lessonHtml(');
  const newNightAt = report.indexOf('id="newNight"');
  assert.ok(missedAt > 0 && missedAt < lessonAt && lessonAt < newNightAt, 'order: missed cases, lesson, new night');
  assert.match(app, /if \(firstShow\) return r\.underTriage > 0;/);
  assert.match(app, /step: decisionPointFor\(truth\)/);
  assert.match(app, /class="step-tag">\$\{tr\('lesson\.stepTag'/);
});
