import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STRINGS, LANGS, t, levelName, caseText, translateReason, translateError, reasonZh, errorZh, normalizeLang } from '../src/i18n.js';
import { CASES } from '../src/cases.js';
import { PORTRAITS, portraitSvg } from '../src/portraits.js';
import { triage, LEVEL_NAMES } from '../src/triage.js';
import { instantiate, mulberry32, NIGHT_SIZE } from '../src/night.js';

const CJK = /[\u4e00-\u9fff]/;
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
// Latin words allowed inside Chinese text: abbreviations and units used as-is in Chinese EDs.
const LATIN_OK = new Set(['ESI', 'AVPU', 'mmHg', 'CT', 'mg', 'mL', 'cm', 'kg']);
const latinWords = (s) => (s.match(/[A-Za-z]{2,}/g) || []).filter((w) => !LATIN_OK.has(w));
const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

test('every string key has both en and zh-CN values with the same placeholders', () => {
  assert.deepEqual(LANGS, ['en', 'zh-CN']);
  for (const [key, entry] of Object.entries(STRINGS)) {
    assert.deepEqual(Object.keys(entry).sort(), ['en', 'zh-CN'], `${key}: must have exactly en and zh-CN`);
    assert.ok(nonEmpty(entry.en), `${key}: en is empty`);
    assert.ok(nonEmpty(entry['zh-CN']), `${key}: zh-CN is empty`);
    assert.deepEqual(placeholders(entry['zh-CN']), placeholders(entry.en), `${key}: placeholders differ`);
  }
});

// Values that are only symbols or units in both languages.
const NO_CJK_NEEDED = new Set(['game.reasonSep', 'vital.bpValue', 'lesson.above', 'lesson.belowPct']);

test('Chinese strings are actually Chinese, except symbols and units', () => {
  for (const [key, entry] of Object.entries(STRINGS)) {
    if (NO_CJK_NEEDED.has(key)) continue;
    assert.match(entry['zh-CN'], CJK, `${key}: zh-CN has no Chinese text`);
  }
});

test('every data-i18n key in index.html exists in the strings table', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 20, 'expected index.html to use data-i18n');
  for (const k of keys) assert.ok(STRINGS[k], `index.html uses unknown key ${k}`);
});

test('t() fills placeholders, defaults to English and returns unknown keys as-is', () => {
  assert.equal(t('game.caseNo', 'en', { n: 2, total: NIGHT_SIZE }), 'Patient 2 of 15');
  assert.equal(t('game.caseNo', 'zh-CN', { n: 2, total: NIGHT_SIZE }), '第 2 位患者，共 15 位');
  assert.equal(t('game.score', 'xx', { score: 5 }), 'Score 5');
  assert.equal(normalizeLang(null), 'en');
  assert.equal(t('no.such.key', 'zh-CN'), 'no.such.key');
});

test('level names: English matches the engine, Chinese keeps the ESI number', () => {
  for (const l of [1, 2, 3, 4, 5]) {
    assert.equal(levelName(l, 'en'), LEVEL_NAMES[l]);
    assert.match(levelName(l, 'zh-CN'), CJK);
    assert.ok(t('level.badge', 'zh-CN', { level: l, name: levelName(l, 'zh-CN') }).includes(`ESI ${l}`));
  }
});

test('every case has Chinese name, story and teaching point', () => {
  for (const c of CASES) {
    assert.ok(c.zh, `${c.id}: missing zh block`);
    for (const f of ['name', 'story', 'teachingPoint']) {
      assert.ok(nonEmpty(c.zh[f]), `${c.id}: zh.${f} is empty`);
      assert.match(c.zh[f], CJK, `${c.id}: zh.${f} has no Chinese text`);
      assert.notEqual(c.zh[f], c[f], `${c.id}: zh.${f} is untranslated`);
      assert.deepEqual(latinWords(c.zh[f]), [], `${c.id}: English left in zh.${f}`);
    }
    assert.equal(caseText(c, 'zh-CN').story, c.zh.story);
    assert.equal(caseText(c, 'en').story, c.story);
  }
});

test('every alternative opening is translated, and a drawn case reads in Chinese', () => {
  const random = mulberry32(4);
  for (const c of CASES) {
    for (const o of c.variants.openings ?? []) {
      assert.match(o.zh, CJK, `${c.id}: opening has no Chinese`);
      assert.deepEqual(latinWords(o.zh), [], `${c.id}: English left in "${o.zh}"`);
      assert.ok(nonEmpty(o.en), `${c.id}: empty English opening`);
    }
    for (let i = 0; i < 6; i += 1) {
      const seen = instantiate(c, random);
      assert.match(caseText(seen, 'zh-CN').story, CJK);
      assert.deepEqual(latinWords(caseText(seen, 'zh-CN').story), [], `${c.id}: drawn Chinese story`);
      assert.equal(caseText(seen, 'en').story, seen.story);
    }
  }
});

test('Chinese teaching points keep the ESI level numbers of the English text', () => {
  for (const c of CASES) {
    const en = [...c.teachingPoint.matchAll(/ESI (\d)/g)].map((m) => m[1]).sort();
    const zh = [...c.zh.teachingPoint.matchAll(/ESI (\d)/g)].map((m) => m[1]).sort();
    assert.deepEqual(zh, en, `${c.id}: ESI levels differ between en and zh`);
  }
});

test('every portrait has a Chinese accessible label', () => {
  for (const c of CASES) {
    const p = PORTRAITS[c.id];
    assert.match(p.labelZh ?? '', CJK, `${c.id}: missing labelZh`);
    assert.deepEqual(latinWords(p.labelZh), [], `${c.id}: English left in labelZh`);
    assert.ok(portraitSvg(c.id, 'zh-CN').includes(`aria-label="${p.labelZh}"`));
    assert.ok(portraitSvg(c.id).includes(`aria-label="${p.label}"`));
  }
});

// Deterministic grid that reaches every reason the engine can return, including all age bands.
function* patients() {
  const base = { ageYears: 40, avpu: 'A', newConfusion: false, hr: 80, rr: 16, sbp: 120, spo2: 98, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 };
  for (const c of CASES) yield c.patient;
  for (const ageYears of [0.1, 1, 5, 40]) {
    for (const resources of [0, 1, 2, 3]) {
      yield { ...base, ageYears, resources };
      yield { ...base, ageYears, resources, hr: 200 };
    }
  }
  yield { ...base, needsLifesaving: true, avpu: 'U', spo2: 80.5, rr: 4, hr: 30, sbp: 60 };
  for (const avpu of ['V', 'P']) yield { ...base, avpu, highRisk: true, newConfusion: true, pain: 9 };
}

test('every triage reason has a Chinese translation', () => {
  const seen = new Set();
  for (const p of patients()) {
    for (const r of triage(p).reasons) {
      const zh = reasonZh(r);
      assert.ok(zh, `no Chinese for reason "${r}"`);
      assert.match(zh, CJK);
      assert.deepEqual(latinWords(zh), [], `English left in "${zh}" (from "${r}")`);
      assert.equal(translateReason(r, 'zh-CN'), zh);
      assert.equal(translateReason(r, 'en'), r);
      seen.add(r.replace(/[\d.]+/g, '#'));
    }
  }
  assert.ok(seen.size >= 14, `grid should reach every reason pattern, saw ${seen.size}`);
});

test('every validation error has a Chinese translation', () => {
  const bad = { ageYears: NaN, avpu: 'X', hr: 'x', rr: undefined, sbp: Infinity, spo2: 101, tempC: null, pain: 11, resources: -1 };
  let message = '';
  try { triage(bad); } catch (e) { message = e.message; }
  for (const m of [...message.split('; '), 'patient must be an object', 'spo2 must be a finite number', 'pain must be a finite number', 'resources must be a finite number']) {
    assert.ok(errorZh(m), `no Chinese for error "${m}"`);
  }
  const zh = translateError(message, 'zh-CN');
  assert.deepEqual(latinWords(zh), [], `English left in "${zh}"`);
  assert.equal(translateError(message, 'en'), message);
});
