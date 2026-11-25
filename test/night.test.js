// Nightly draw and per-appearance variation (task 14, src/night.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../src/cases.js';
import { triage } from '../src/triage.js';
import {
  mulberry32, drawNight, instantiate, planNight, parseLastNight, drawValue, splitOpening,
  NIGHT_SIZE, PER_LEVEL, LEVELS, LAST_NIGHT_KEY,
} from '../src/night.js';

const byLevel = (night) => Object.fromEntries(LEVELS.map((l) => [l, night.filter((c) => c.expectedLevel === l).length]));

test('a night is 15 different cases, exactly 3 per ESI level', () => {
  assert.equal(NIGHT_SIZE, 15);
  for (let seed = 1; seed <= 200; seed += 1) {
    const night = drawNight(CASES, { random: mulberry32(seed) });
    assert.equal(night.length, NIGHT_SIZE);
    assert.equal(new Set(night.map((c) => c.id)).size, NIGHT_SIZE, `seed ${seed}: repeated case`);
    assert.deepEqual(byLevel(night), { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 }, `seed ${seed}`);
  }
});

test('no case from the previous night comes back the next night', () => {
  const random = mulberry32(7);
  let last = [];
  for (let night = 0; night < 100; night += 1) {
    const ids = drawNight(CASES, { random, avoid: last }).map((c) => c.id);
    for (const id of ids) assert.ok(!last.includes(id), `night ${night}: ${id} repeated`);
    last = ids;
  }
});

test('when a level has too few fresh cases, it tops up from the avoided ones', () => {
  const tiny = LEVELS.flatMap((l) => [1, 2, 3, 4].map((i) => ({ id: `l${l}-${i}`, expectedLevel: l })));
  const avoid = tiny.filter((c) => !c.id.endsWith('-4')).map((c) => c.id); // only one fresh case per level
  const night = drawNight(tiny, { random: mulberry32(3), avoid });
  assert.deepEqual(byLevel(night), { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 });
  for (const l of LEVELS) assert.ok(night.some((c) => c.id === `l${l}-4`), `level ${l}: the fresh case must be used`);
  assert.throws(() => drawNight(tiny.slice(2), { random: Math.random }), RangeError);
});

test('the same seed gives the same night, vitals and stories; different seeds differ', () => {
  const a = planNight(CASES, { random: mulberry32(42), avoid: ['ghost-unresponsive'] });
  const b = planNight(CASES, { random: mulberry32(42), avoid: ['ghost-unresponsive'] });
  assert.deepEqual(a, b);
  const nights = new Set();
  for (let seed = 1; seed <= 30; seed += 1) nights.add(drawNight(CASES, { random: mulberry32(seed) }).map((c) => c.id).join());
  assert.ok(nights.size >= 29, `only ${nights.size} different nights from 30 seeds`);
});

test('the night is shuffled, not grouped by level', () => {
  let grouped = 0;
  for (let seed = 1; seed <= 50; seed += 1) {
    const levels = drawNight(CASES, { random: mulberry32(seed) }).map((c) => c.expectedLevel);
    if (levels.join() === [...levels].sort().join()) grouped += 1;
  }
  assert.equal(grouped, 0);
});

test('every case gets drawn over enough nights (no case is unreachable)', () => {
  const seen = new Set();
  const random = mulberry32(99);
  let last = [];
  for (let n = 0; n < 60; n += 1) {
    last = drawNight(CASES, { random, avoid: last }).map((c) => c.id);
    last.forEach((id) => seen.add(id));
  }
  assert.equal(seen.size, CASES.length);
});

test('only the injected random source is used (never Math.random)', () => {
  const original = Math.random;
  Math.random = () => { throw new Error('Math.random was called'); };
  try {
    let calls = 0;
    const seeded = mulberry32(5);
    planNight(CASES, { random: () => { calls += 1; return seeded(); } });
    assert.ok(calls > NIGHT_SIZE, 'random() should drive the draw, the vitals and the openings');
  } finally {
    Math.random = original;
  }
  assert.throws(() => drawNight(CASES, {}), TypeError);
});

test('drawn vitals stay inside each case range and keep the expected level', () => {
  const random = mulberry32(11);
  for (const c of CASES) {
    for (let i = 0; i < 25; i += 1) {
      const seen = instantiate(c, random);
      for (const [key, [lo, hi]] of Object.entries(c.variants.vitals)) {
        assert.ok(seen.patient[key] >= lo && seen.patient[key] <= hi, `${c.id}.${key} = ${seen.patient[key]}`);
      }
      assert.equal(Math.round(seen.patient.tempC * 10), seen.patient.tempC * 10, 'tempC to one decimal');
      assert.equal(triage(seen.patient).level, c.expectedLevel, `${c.id}: ${JSON.stringify(seen.patient)}`);
      for (const k of ['ageYears', 'avpu', 'resources', 'highRisk', 'needsLifesaving', 'newConfusion']) assert.equal(seen.patient[k], c.patient[k]);
    }
  }
});

test('drawValue covers both ends of a range', () => {
  const lo = drawValue('hr', [100, 110], () => 0);
  const hi = drawValue('hr', [100, 110], () => 0.999999);
  assert.deepEqual([lo, hi], [100, 110]);
  assert.deepEqual([drawValue('tempC', [37.2, 37.9], () => 0), drawValue('tempC', [37.2, 37.9], () => 0.999999)], [37.2, 37.9]);
});

test('openings: each instance uses one opening, in both languages, with the rest of the story kept', () => {
  const c = CASES.find((x) => x.id === 'werewolf-sprain');
  const stories = new Set();
  const random = mulberry32(2);
  for (let i = 0; i < 60; i += 1) {
    const seen = instantiate(c, random);
    stories.add(seen.story);
    const options = [c.story.split('. ')[0] + '.', ...c.variants.openings.map((o) => o.en)];
    assert.equal(seen.story.slice(0, options[seen.variant.opening].length), options[seen.variant.opening]);
    assert.ok(seen.story.endsWith(splitOpening(c.story, 'en')[1]));
    assert.ok(seen.zh.story.endsWith(splitOpening(c.zh.story, 'zh')[1]));
    if (seen.variant.opening > 0) assert.ok(seen.zh.story.startsWith(c.variants.openings[seen.variant.opening - 1].zh));
    assert.equal(seen.zh.teachingPoint, c.zh.teachingPoint);
  }
  assert.equal(stories.size, 3, 'original opening plus 2 alternatives');
  const plain = CASES.find((x) => !x.variants.openings);
  assert.equal(instantiate(plain, mulberry32(1)).story, plain.story);
  assert.equal(c.story, CASES.find((x) => x.id === 'werewolf-sprain').story, 'the template is not modified');
});

test('last-night storage: key and tolerant parsing', () => {
  assert.equal(LAST_NIGHT_KEY, 'grimm-triage-last-night');
  assert.equal(PER_LEVEL, 3);
  assert.deepEqual(parseLastNight('["a","b"]'), ['a', 'b']);
  for (const junk of [null, undefined, '', 'not json', '{"a":1}', '42']) assert.deepEqual(parseLastNight(junk), []);
  assert.deepEqual(parseLastNight('["a",3,null,"b"]'), ['a', 'b']);
});
