// Demo recorder helpers (task 18, scripts/demo-helpers.mjs) and the optional ?seed= (src/night.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CASES } from '../src/cases.js';
import { triage } from '../src/triage.js';
import { seedFromSearch, mulberry32, planNight } from '../src/night.js';
import {
  DEMO_SEED, STAR_CASE, CORRECT_BEFORE_MISS, nightFor, correctLevel, pickWrongLevel, planAnswers, findSeed, pauseMs, buildTimeline,
} from '../scripts/demo-helpers.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('pickWrongLevel: always a valid level 1-5 and never the truth', () => {
  for (const truth of [1, 2, 3, 4, 5]) {
    const wrong = pickWrongLevel(truth);
    assert.ok(Number.isInteger(wrong) && wrong >= 1 && wrong <= 5, `truth ${truth}: got ${wrong}`);
    assert.notEqual(wrong, truth);
  }
});

test('pickWrongLevel: at least 2 levels less urgent whenever that exists, else the nearest wrong level', () => {
  for (const truth of [1, 2, 3]) assert.ok(pickWrongLevel(truth) - truth >= 2, `truth ${truth}`);
  assert.equal(pickWrongLevel(4), 5); // the only under-triage of ESI 4
  assert.equal(pickWrongLevel(5), 4); // ESI 5 cannot be under-triaged
  for (const truth of [1, 2, 3, 4]) assert.ok(pickWrongLevel(truth) > truth, `truth ${truth}: must be an under-triage`);
});

test('pickWrongLevel rejects anything that is not a level', () => {
  for (const bad of [0, 6, 2.5, '2', null, undefined, NaN]) assert.throws(() => pickWrongLevel(bad), RangeError);
});

test('buildTimeline: seconds from the video start, in order, with name, start and end only', () => {
  const t0 = 10_000;
  const tl = buildTimeline([
    { name: 'title-screen', startMs: 10_250, endMs: 14_500.4 },
    { name: 'triage-correct', startMs: 14_500.4, endMs: 30_001 },
  ], t0);
  assert.deepEqual(tl, [
    { name: 'title-screen', start: 0.25, end: 4.5 },
    { name: 'triage-correct', start: 4.5, end: 20.001 },
  ]);
  assert.deepEqual(buildTimeline([], t0), []);
});

test('buildTimeline rejects marks that would misalign subtitles', () => {
  const ok = { name: 'a', startMs: 100, endMs: 200 };
  assert.throws(() => buildTimeline([{ ...ok, startMs: -1 }], 0), RangeError, 'before the video');
  assert.throws(() => buildTimeline([{ ...ok, endMs: 50 }], 0), RangeError, 'ends before it starts');
  assert.throws(() => buildTimeline([ok, { name: 'b', startMs: 150, endMs: 300 }], 0), RangeError, 'overlap');
  assert.throws(() => buildTimeline([{ ...ok, name: '' }], 0), TypeError);
  assert.throws(() => buildTimeline([{ ...ok, endMs: NaN }], 0), TypeError);
  assert.throws(() => buildTimeline('x', 0), TypeError);
  assert.throws(() => buildTimeline([ok], undefined), TypeError);
});

test('pauseMs stays inside the human range and is reproducible for a seed', () => {
  const a = mulberry32(1);
  for (let i = 0; i < 500; i += 1) {
    const ms = pauseMs(a);
    assert.ok(ms >= 1500 && ms <= 3000, String(ms));
  }
  const run = () => { const r = mulberry32(9); return [1, 2, 3].map(() => pauseMs(r, 800, 1200)); };
  assert.deepEqual(run(), run());
  assert.throws(() => pauseMs(Math.random, 5, 1), RangeError);
});

test('the demo seed draws The Sandman as patient 4, after three patients of different levels', () => {
  const night = nightFor(DEMO_SEED);
  assert.equal(night[CORRECT_BEFORE_MISS].id, STAR_CASE);
  const before = night.slice(0, CORRECT_BEFORE_MISS).map(correctLevel);
  assert.equal(new Set(before).size, CORRECT_BEFORE_MISS);
  assert.equal(findSeed(), DEMO_SEED, 'DEMO_SEED is the smallest seed that fits; update it if the case bank changed');
});

test('planAnswers: correct except one under-triage of the star case, every answer from triage()', () => {
  const night = nightFor(DEMO_SEED);
  const plan = planAnswers(night);
  assert.equal(plan.length, night.length);
  plan.forEach((a, i) => {
    assert.equal(a.truth, triage(night[i].patient).level, a.id);
    if (i === CORRECT_BEFORE_MISS) {
      assert.equal(a.id, STAR_CASE);
      assert.ok(a.guess - a.truth >= 2, 'under-triaged by 2 or more');
    } else {
      assert.equal(a.guess, a.truth, a.id);
    }
  });
});

test('nightFor matches the draw app.js makes for ?seed=', () => {
  const seed = seedFromSearch(`?seed=${DEMO_SEED}`);
  assert.deepEqual(nightFor(DEMO_SEED), planNight(CASES, { random: mulberry32(seed), avoid: [] }));
});

test('seedFromSearch: a whole number only when ?seed= is present, otherwise null', () => {
  assert.equal(seedFromSearch(''), null);
  assert.equal(seedFromSearch(undefined), null);
  assert.equal(seedFromSearch('?lang=en'), null);
  assert.equal(seedFromSearch('?seed=87'), 87);
  assert.equal(seedFromSearch('?a=1&seed=0'), 0);
  assert.equal(seedFromSearch('?seed=4294967296'), 0); // wraps like mulberry32's own seed >>> 0
  for (const bad of ['?seed=', '?seed=abc', '?seed=-3', '?seed=1.5', '?seed=1e3', '?seed=12345678901']) assert.equal(seedFromSearch(bad), null, bad);
});

test('without ?seed= the app still draws with Math.random and keeps last night\'s ids', () => {
  const app = read('src/app.js');
  assert.match(app, /seed === null \? Math\.random : mulberry32\(seed\)/);
  assert.match(app, /parseLastNight\(localStorage\.getItem\(LAST_NIGHT_KEY\)\)/);
  assert.match(app, /localStorage\.setItem\(LAST_NIGHT_KEY/);
});

test('Playwright is a dev tool only: a devDependency, never loaded by the app or the service worker', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.devDependencies.playwright, 'playwright is a devDependency');
  assert.ok(!pkg.dependencies?.playwright, 'playwright must not be a runtime dependency');
  assert.equal(pkg.scripts['demo:record'], 'node scripts/record-demo.mjs');
  for (const f of ['index.html', 'sw.js', 'src/app.js']) assert.doesNotMatch(read(f), /playwright|scripts\//i, f);
  assert.match(read('.gitignore'), /^demo-output\/$/m);
});
