// Storylines (task 21): data, the draw in src/night.js, the card badge and the shift-report section.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CASES } from '../src/cases.js';
import { triage } from '../src/triage.js';
import { PORTRAITS } from '../src/portraits.js';
import { mulberry32, drawNight, planNight, addStoryline, NIGHT_SIZE, LEVELS, STORYLINE_GAP, STORYLINE_CHANCE } from '../src/night.js';
import {
  STORYLINES, storylineById, storylineIn, linkFor, badgeText, storylineBadgeHtml, storylineReport, storylineReportHtml, BADGE_ID,
} from '../src/storylines.js';

const CJK = /[\u4e00-\u9fff]/;
const LATIN_OK = new Set(['ESI', 'AVPU', 'mmHg', 'CT', 'mg', 'mL', 'cm', 'kg']);
const latinWords = (s) => (s.match(/[A-Za-z]{2,}/g) || []).filter((w) => !LATIN_OK.has(w));
const byId = new Map(CASES.map((c) => [c.id, c]));
const ids = (night) => night.map((c) => c.id);
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('five storylines, each with a title, 2 case ids and an epilogue in English and Chinese', () => {
  assert.deepEqual(STORYLINES.map((s) => s.id), ['moonlight-brawl', 'counts-toothache', 'cauldron-hut', 'mrs-pooles', 'trick-or-treat-twins']);
  for (const s of STORYLINES) {
    for (const field of ['title', 'epilogue']) {
      assert.deepEqual(Object.keys(s[field]).sort(), ['en', 'zh-CN'], `${s.id}.${field}`);
      assert.ok(s[field].en.trim().length > 0, `${s.id}.${field}.en`);
      assert.match(s[field]['zh-CN'], CJK, `${s.id}.${field} zh-CN`);
      assert.deepEqual(latinWords(s[field]['zh-CN']), [], `${s.id}: English left in ${field} zh-CN`);
    }
    assert.equal(s.cases.length, 2, s.id);
    assert.equal(storylineById(s.id), s);
  }
  assert.equal(storylineById('nope'), null);
});

test('storyline cases are ordinary cases flagged with their storyline, and belong to exactly one', () => {
  const listed = STORYLINES.flatMap((s) => s.cases);
  assert.equal(new Set(listed).size, listed.length, 'a case is in two storylines');
  for (const s of STORYLINES) {
    for (const id of s.cases) {
      const c = byId.get(id);
      assert.ok(c, `${s.id}: case ${id} is missing from src/cases.js`);
      assert.equal(c.storyline, s.id, `${id}: storyline flag`);
      assert.equal(triage(c.patient).level, c.expectedLevel, `${id}: engine level`);
      assert.ok(PORTRAITS[id], `${id}: portrait`);
      assert.ok(c.zh?.name && c.zh?.story && c.zh?.teachingPoint, `${id}: Chinese text`);
    }
  }
  const flagged = CASES.filter((c) => c.storyline).map((c) => c.id).sort();
  assert.deepEqual(flagged, [...listed].sort(), 'every flagged case is listed in a storyline');
});

test('storyline characters are new or public domain: no Luna Lycan or Count Vlad', () => {
  for (const id of STORYLINES.flatMap((s) => s.cases)) assert.doesNotMatch(byId.get(id).name, /Luna|Vlad/, id);
  assert.equal(byId.get('dracula-ludwigs').expectedLevel, 1);
  assert.equal(byId.get('ghost-twin-battery').patient.ageYears <= 8, true, 'the twins use pediatric vitals');
});

// ---- the draw ----
function checkNight(night, avoid = []) {
  assert.equal(night.length, NIGHT_SIZE);
  assert.equal(new Set(ids(night)).size, NIGHT_SIZE);
  for (const l of LEVELS) assert.equal(night.filter((c) => c.expectedLevel === l).length, 3, `level ${l}`);
  const found = storylineIn(night);
  const linked = night.filter((c) => c.storyline);
  if (!found) { assert.equal(linked.length, 0, 'a storyline case drawn alone'); return null; }
  const [i, j] = found.indexes;
  assert.equal(linked.length, 2);
  assert.ok(i >= 1, 'never patient 1');
  assert.ok(j - i - 1 >= STORYLINE_GAP[0] && j - i - 1 <= STORYLINE_GAP[1], `gap ${j - i - 1}`);
  assert.ok(!found.storyline.cases.some((id) => avoid.includes(id)), 'storyline used last night');
  return found;
}

test('about half of nights carry one storyline, always valid; every storyline and gap occurs', () => {
  let withStory = 0;
  const seenStories = new Set();
  const seenGaps = new Set();
  const seenFirst = new Set();
  for (let seed = 1; seed <= 400; seed += 1) {
    const found = checkNight(drawNight(CASES, { random: mulberry32(seed) }));
    if (!found) continue;
    withStory += 1;
    seenStories.add(found.storyline.id);
    seenGaps.add(found.indexes[1] - found.indexes[0] - 1);
    seenFirst.add(found.indexes[0]);
  }
  assert.equal(STORYLINE_CHANCE, 0.5);
  assert.ok(withStory > 160 && withStory < 240, `${withStory} of 400 nights had a storyline`);
  assert.equal(seenStories.size, STORYLINES.length);
  assert.deepEqual([...seenGaps].sort(), [2, 3, 4, 5]);
  assert.ok(!seenFirst.has(0));
});

test('a storyline used last night is not drawn again the next night, and other ids are avoided as before', () => {
  const random = mulberry32(21);
  let last = [];
  for (let n = 0; n < 200; n += 1) {
    const night = drawNight(CASES, { random, avoid: last });
    checkNight(night, last);
    for (const id of ids(night)) assert.ok(!last.includes(id), `night ${n}: ${id} repeated`);
    last = ids(night);
  }
});

test('with no storyline the night is the regular draw; with one, only the two replaced cases differ', () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    const regular = ids(drawNight(CASES, { random: mulberry32(seed), storylines: [] }));
    const night = drawNight(CASES, { random: mulberry32(seed) });
    const found = storylineIn(night);
    if (!found) { assert.deepEqual(ids(night), regular, `seed ${seed}`); continue; }
    const kept = ids(night).filter((id) => !found.storyline.cases.includes(id));
    const replaced = regular.filter((id) => !kept.includes(id));
    assert.deepEqual(regular.filter((id) => kept.includes(id)), kept, `seed ${seed}: order of the other patients`);
    assert.deepEqual(replaced.map((id) => byId.get(id).expectedLevel).sort(), found.storyline.cases.map((id) => byId.get(id).expectedLevel).sort());
  }
});

test('a bank without storyline cases draws exactly as before (no extra random number)', () => {
  const regular = CASES.filter((c) => !c.storyline);
  let calls = 0;
  const seeded = mulberry32(8);
  const counted = () => { calls += 1; return seeded(); };
  drawNight(regular, { random: counted });
  const withList = calls;
  calls = 0;
  const again = mulberry32(8);
  drawNight(regular, { random: () => { calls += 1; return again(); }, storylines: [] });
  assert.equal(withList, calls);
});

test('addStoryline keeps the night size and levels and rejects what it cannot place', () => {
  const night = drawNight(CASES, { random: mulberry32(3), storylines: [] });
  const pair = STORYLINES[0].cases.map((id) => byId.get(id));
  for (let s = 0; s < 50; s += 1) checkNight(addStoryline(night, pair, mulberry32(s)));
  assert.throws(() => addStoryline(night.slice(0, 7), pair, Math.random), RangeError);
  assert.throws(() => addStoryline(night, [pair[0]], Math.random), RangeError);
});

// ---- badge ----
function nightWith(storyId, seedFrom = 1) {
  for (let seed = seedFrom; seed < 5000; seed += 1) {
    const night = planNight(CASES, { random: mulberry32(seed) });
    const found = storylineIn(night);
    if (found?.storyline.id === storyId) return { night, found };
  }
  throw new Error(`no seed draws ${storyId}`);
}

test('badge: only the later linked card, with the title and the earlier patient number, in both languages', () => {
  const { night, found } = nightWith('moonlight-brawl');
  const [i, j] = found.indexes;
  assert.deepEqual(linkFor(night, j), { storyline: found.storyline, linkedTo: i + 1 });
  assert.equal(linkFor(night, i), null);
  assert.equal(badgeText(linkFor(night, j), 'en'), `Storyline “Moonlight Brawl”: same incident as patient ${i + 1}`);
  assert.equal(badgeText(linkFor(night, j), 'zh-CN'), `故事线「月下斗殴」：与第 ${i + 1} 位患者来自同一事件`);

  const html = storylineBadgeHtml(night, j, 'en');
  assert.match(html, new RegExp(`^<p class="storyline-badge" id="${BADGE_ID}">`));
  assert.match(html, /<span aria-hidden="true">🔗 <\/span>/, 'the icon is decorative');
  assert.ok(html.includes(`same incident as patient ${i + 1}</p>`));
  assert.ok(storylineBadgeHtml(night, j, 'zh-CN').includes(`与第 ${i + 1} 位患者来自同一事件`));
  for (let k = 0; k < night.length; k += 1) if (k !== j) assert.equal(storylineBadgeHtml(night, k, 'en'), '', `card ${k + 1}`);
});

test('badge and report have no animation; the badge is linked to the card for screen readers', () => {
  const css = read('styles.css');
  const rules = [...css.matchAll(/\.storyline-[\w-]+[^{]*\{([^}]*)\}/g)].map((m) => m[1]).join('');
  assert.ok(rules.length > 0);
  assert.doesNotMatch(rules, /animation|transition/);
  const app = read('src/app.js');
  assert.match(app, /setAttribute\('aria-describedby', STORYLINE_BADGE_ID\)/);
  assert.match(app, /removeAttribute\('aria-describedby'\)/);
});

// ---- shift report ----
const answersFor = (night, guessFor = (c) => triage(c.patient).level) =>
  night.map((c) => ({ case: c, guess: guessFor(c), level: triage(c.patient).level }));

test('report: no storyline, no section', () => {
  let night;
  for (let seed = 1; !night; seed += 1) {
    const n = planNight(CASES, { random: mulberry32(seed) });
    if (!storylineIn(n)) night = n;
  }
  assert.equal(storylineReport(answersFor(night)), null);
  assert.equal(storylineReportHtml(answersFor(night), 'en'), '');
  assert.throws(() => storylineReport('x'), TypeError);
});

test('report: storyline section with epilogue, patients and "no under-triage", in English and Chinese', () => {
  const { night, found } = nightWith('cauldron-hut');
  const [i, j] = found.indexes;
  const answers = answersFor(night);
  const r = storylineReport(answers);
  assert.equal(r.storyline.id, 'cauldron-hut');
  assert.deepEqual(r.patients.map((p) => [p.case.id, p.n, p.underTriage]), [['witch-cauldron-co', i + 1, false], ['apprentice-co-coma', j + 1, false]]);
  assert.equal(r.underTriaged, false);

  const en = storylineReportHtml(answers, 'en');
  assert.match(en, /<section class="storyline-report" aria-labelledby="storylineTitle">/);
  assert.ok(en.includes('Storyline: The Cauldron Hut</h3>'));
  assert.ok(en.includes(`Patient ${i + 1}: Hepzibah Mossbottom, 64`));
  assert.ok(en.includes(`Patient ${j + 1}: Tobias the Apprentice, 17`));
  assert.ok(en.includes('No patient in this storyline was under-triaged.'));
  assert.ok(en.includes(found.storyline.epilogue.en));
  assert.ok(en.includes('Triage the patient in front of you, not the story.'));
  assert.doesNotMatch(en, /storyline-under/);

  const zh = storylineReportHtml(answers, 'zh-CN');
  assert.ok(zh.includes('故事线：坩埚小屋</h3>'));
  assert.ok(zh.includes(`第 ${i + 1} 位患者：赫普兹巴·苔底，64 岁`));
  assert.ok(zh.includes('这条故事线里没有患者被分诊不足。'));
  assert.ok(zh.includes(found.storyline.epilogue['zh-CN']));
  assert.ok(zh.includes('尾声：'));
});

test('report: marks the under-triaged storyline patient, in English and Chinese', () => {
  const { night, found } = nightWith('trick-or-treat-twins');
  const [, j] = found.indexes;
  // The smiling twin with the button battery (ESI 2) called ESI 4: under-triage.
  const answers = answersFor(night, (c) => (c.id === 'ghost-twin-battery' ? 4 : triage(c.patient).level));
  const r = storylineReport(answers);
  assert.equal(r.underTriaged, true);
  assert.deepEqual(r.patients.map((p) => p.underTriage), [false, true]);

  const en = storylineReportHtml(answers, 'en');
  assert.ok(en.includes(`Patient ${j + 1}: Percy the Little Ghost, 5 <span class="storyline-under">🩸 under-triaged</span>`));
  assert.ok(en.includes('A patient in this storyline was under-triaged.'));
  const zh = storylineReportHtml(answers, 'zh-CN');
  assert.ok(zh.includes(`第 ${j + 1} 位患者：小幽灵珀西，5 岁 <span class="storyline-under">🩸 分诊不足</span>`));
  assert.ok(zh.includes('这条故事线里有患者被分诊不足。'));

  // Over-triage is not under-triage.
  const over = answersFor(night, (c) => (c.storyline ? 1 : triage(c.patient).level));
  assert.equal(storylineReport(over).underTriaged, false);
});
