// Triage Desk with incomplete vital signs (task 17): form markup, parsing, the warning, the
// provisional tag, translations, and the shared help / lesson line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { triage } from '../src/triage.js';
import { parseVital, missingWarningHtml, provisionalTagHtml, MISSING_REASONS, OPTIONAL_VITALS, WARNING_ID, helpPanelHtml, YOUNG_INFANT_MAX_AGE } from '../src/deskhelp.js';
import { PEDIATRIC_DANGER } from '../src/triage.js';
import { lessonHtml } from '../src/lesson.js';
import { STRINGS, LANGS, t } from '../src/i18n.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 2 };
const trFor = (lang) => (k, v) => t(k, lang, v);

test('the five vitals are optional in the form; age, AVPU, pain and resources stay required', () => {
  for (const k of OPTIONAL_VITALS) {
    const input = html.match(new RegExp(`<input name="${k}"[^>]*>`))?.[0];
    assert.ok(input, k);
    assert.doesNotMatch(input, /required/, `${k} must not be required`);
    assert.match(input, /aria-describedby="vitalsNote"/);
    const select = html.match(new RegExp(`<select name="${k}Reason" aria-labelledby="lbl-${k} why-${k}">([\\s\\S]*?)</select>`));
    assert.ok(select, `${k}: reason select named by its vital`);
    assert.deepEqual([...select[1].matchAll(/value="(\w*)"/g)].map((m) => m[1]), ['', ...MISSING_REASONS]);
    assert.ok(html.includes(`id="lbl-${k}"`) && html.includes(`id="why-${k}"`));
  }
  for (const k of ['ageYears', 'pain', 'resources']) assert.match(html.match(new RegExp(`<input name="${k}"[^>]*>`))[0], /required/, `${k} stays required`);
  assert.match(html, /<p class="vitals-note" id="vitalsNote" data-i18n="calc.vitalsNote">/);
});

test('blank means not measured; other input is passed on as a number (or NaN, an error)', () => {
  for (const blank of ['', '   ', null, undefined]) assert.equal(parseVital(blank), null);
  assert.equal(parseVital('92'), 92);
  assert.equal(parseVital('36.6'), 36.6);
  assert.ok(Number.isNaN(parseVital('abc')));
  assert.throws(() => triage({ ...base, hr: parseVital('abc') }), TypeError, 'garbage is still an error, not a missing value');
  assert.match(app, /hr: vital\('hr'\), rr: vital\('rr'\), sbp: vital\('sbp'\),\s*spo2: vital\('spo2'\), tempC: vital\('tempC'\)/);
});

test('the warning lists every missing vital, with its reason when given, and says to re-measure', () => {
  for (const lang of LANGS) {
    const tr = trFor(lang);
    const r = triage({ ...base, hr: null, spo2: null, tempC: null });
    const w = missingWarningHtml(r, { hr: 'refused', spo2: 'failed', tempC: '' }, tr);
    assert.match(w, new RegExp(`^<p class="missing-warning" id="${WARNING_ID}" role="note">`));
    assert.ok(w.includes(t('calc.missingItem', lang, { vital: t('calc.vitalName.hr', lang), reason: t('calc.reasonShort.refused', lang) })));
    assert.ok(w.includes(t('calc.missingItem', lang, { vital: t('calc.vitalName.spo2', lang), reason: t('calc.reasonShort.failed', lang) })));
    assert.ok(w.includes(t('calc.vitalName.tempC', lang)));
    assert.ok(w.includes(t('calc.missingAction', lang)));
    assert.doesNotMatch(w, /\([^()]*\(/, 'no nested brackets');
    assert.equal(missingWarningHtml(triage(base), {}, tr), '', 'no warning when nothing is missing');
  }
  assert.equal(STRINGS['calc.missingAction'].en, 'Measure as soon as possible and re-triage.');
  // ESI 4 and 5 keep their level but still warn (rule 4); SBP and temperature are listed (rule 5).
  for (const resources of [0, 1]) {
    const r = triage({ ...base, resources, sbp: null });
    assert.ok(missingWarningHtml(r, {}, trFor('en')).includes('systolic blood pressure'));
  }
});

test('under 3 months with no temperature: a stronger warning line, and the level does not change', () => {
  assert.equal(YOUNG_INFANT_MAX_AGE, PEDIATRIC_DANGER[0].maxAgeYears, 'same cut-off as the engine (< 3 months)');
  assert.equal(STRINGS['calc.infantTemp'].en, 'Under 3 months: measure temperature now. Fever in a young infant needs urgent assessment and is often ESI 2.');
  assert.equal(STRINGS['calc.infantTemp']['zh-CN'], '3 月龄以下：请立即测量体温。小婴儿发热需要紧急评估，常为 ESI 2 级。');
  for (const lang of LANGS) {
    const tr = trFor(lang);
    const line = t('calc.infantTemp', lang);
    for (const resources of [0, 1, 2]) {
      const infant = { ...base, ageYears: 0.1, hr: 150, rr: 40, resources };
      const missingTemp = triage({ ...infant, tempC: null });
      assert.equal(missingTemp.level, triage(infant).level, 'the level does not change');
      assert.ok(missingWarningHtml(missingTemp, {}, tr, 0.1).includes(line), `${lang}: line shown at ${resources} resources`);
    }
    // Not shown at 3 months or older, when temperature was measured, or when the age is unknown.
    assert.ok(!missingWarningHtml(triage({ ...base, ageYears: 0.25, tempC: null }), {}, tr, 0.25).includes(line), 'exactly 3 months');
    assert.ok(!missingWarningHtml(triage({ ...base, ageYears: 1, tempC: null }), {}, tr, 1).includes(line), '1 year');
    assert.ok(!missingWarningHtml(triage({ ...base, ageYears: 0.1, sbp: null }), {}, tr, 0.1).includes(line), 'temperature measured');
    assert.ok(!missingWarningHtml(triage({ ...base, ageYears: 0.1, tempC: null }), {}, tr).includes(line), 'age not passed');
  }
  assert.match(app, /missingWarningHtml\(r, calc\.reasons, tr, calc\.ageYears\)/);
  // Infants are entered in years (3 weeks = 0.06): the age field must accept fractions.
  assert.match(html.match(/<input name="ageYears"[^>]*>/)[0], /step="any"/);
  assert.match(app, /calc = \{ result: triage\(p\), reasons, ageYears: p\.ageYears \}/);
});

test('the provisional tag shows only for a provisional result', () => {
  const tr = trFor('en');
  assert.equal(provisionalTagHtml(triage({ ...base, rr: null }), tr), ' <span class="provisional-tag">Provisional</span>');
  assert.equal(provisionalTagHtml(triage({ ...base, sbp: null }), tr), '');
  assert.equal(provisionalTagHtml(triage(base), tr), '');
  assert.match(app, /\$\{badge\(r\.level\)\}\$\{provisionalTagHtml\(r, tr\)\}/);
});

test('missing inputs point at the warning with aria-describedby', () => {
  assert.match(app, /setAttribute\('aria-describedby', missing\.includes\(k\) \? `vitalsNote \$\{WARNING_ID\}` : 'vitalsNote'\)/);
  assert.equal(WARNING_ID, 'calcWarning');
});

test('every new string exists in English and Chinese', () => {
  const CJK = /[\u4e00-\u9fff]/;
  const keys = ['calc.vitalsNote', 'calc.reasonLabel', 'calc.reason.none', ...MISSING_REASONS.map((r) => `calc.reason.${r}`), ...MISSING_REASONS.map((r) => `calc.reasonShort.${r}`),
    ...OPTIONAL_VITALS.map((k) => `calc.vitalName.${k}`), 'calc.missingItem', 'calc.missingSep', 'calc.missing', 'calc.missingAction',
    'calc.provisional', 'lesson.missingVitals'];
  for (const k of keys) {
    assert.ok(STRINGS[k]?.en?.trim(), `${k}: no English`);
    assert.ok(STRINGS[k]['zh-CN']?.trim(), `${k}: no Chinese`);
    if (!['calc.missingItem', 'calc.missingSep'].includes(k)) assert.match(STRINGS[k]['zh-CN'], CJK, k);
  }
  for (const k of keys) if (k.startsWith('calc.') && !['calc.vitalName', 'calc.missing', 'calc.provisional'].some((p) => k.startsWith(p))) {
    // Static form text must be wired through data-i18n.
    if (['calc.vitalsNote', 'calc.reasonLabel'].includes(k) || k.startsWith('calc.reason.')) assert.ok(html.includes(`data-i18n="${k}"`), `${k} not used in index.html`);
  }
});

test('one shared line about missing vitals, in the desk help and in the lesson', () => {
  assert.equal(STRINGS['lesson.missingVitals'].en, 'If vital signs cannot be obtained, do not delay steps A and B; at step D, treat the patient as possibly in the danger zone until measured.');
  for (const lang of LANGS) {
    const line = t('lesson.missingVitals', lang);
    assert.ok(helpPanelHtml('resources', trFor(lang), { open: true }).includes(line), `${lang}: desk help`);
    assert.ok(lessonHtml({ tr: trFor(lang), badge: (l) => `ESI ${l}` }).includes(line), `${lang}: lesson`);
  }
});

test('styles: no animation, and the reason select fits a narrow phone', () => {
  const block = css.slice(css.indexOf('/* Incomplete vital signs (task 17)'), css.indexOf('.help-missing')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(block.length > 100);
  assert.doesNotMatch(block, /animation|transition/);
  assert.match(block, /\.vital label\.reason select \{[^}]*max-width: 100%/);
});
