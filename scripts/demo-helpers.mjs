// Pure helpers for the demo recorder (task 18, scripts/record-demo.mjs).
// No browser, no Playwright, no clock: everything here is unit-tested with node --test.
import { CASES } from '../src/cases.js';
import { triage } from '../src/triage.js';
import { planNight, mulberry32 } from '../src/night.js';

// Seed 87 draws The Sandman (ESI 1) as patient 4, after three patients of three different
// levels (ESI 4, 2 and 5). test/demo-recorder.test.js fails if a case-bank change moves him.
export const DEMO_SEED = 87;
export const STAR_CASE = 'sandman-overdose';
export const CORRECT_BEFORE_MISS = 3; // shot 2: patients 1-3 triaged correctly, shot 3: patient 4 under-triaged
// Requests the recorder aborts (Playwright glob): the Umami statistics script and anything else on its host.
export const UMAMI_SCRIPT_PATTERN = 'https://cloud.umami.is/**';

// The night the app draws for ?seed=<seed>: the same call app.js makes (avoid is empty when seeded).
export const nightFor = (seed, cases = CASES) => planNight(cases, { random: mulberry32(seed), avoid: [] });

// The engine's level for a case as the player sees it (drawn vitals included).
export const correctLevel = (c) => triage(c.patient).level;

// A wrong level for the under-triage shot. Under-triage means a less urgent, so higher, number.
// Always 1-5 and never the truth; 2 levels less urgent whenever that exists (truth 1-3).
// Truth 4 can only be under-triaged by 1 (-> 5); truth 5 cannot be under-triaged at all, so the
// only wrong answer next to it is 4.
export function pickWrongLevel(truth) {
  if (!Number.isInteger(truth) || truth < 1 || truth > 5) throw new RangeError(`truth must be a level 1 to 5, got ${truth}`);
  if (truth === 5) return 4;
  return Math.min(5, truth + 2);
}

// The answers the recorder gives, one per patient of the night: correct for every patient except
// the first appearance of `missId`, which gets pickWrongLevel(). Each entry: { id, name, truth, guess }.
export function planAnswers(night, missId = STAR_CASE) {
  let missed = false;
  return night.map((c) => {
    const truth = correctLevel(c);
    const miss = !missed && c.id === missId;
    if (miss) missed = true;
    return { id: c.id, name: c.name, truth, guess: miss ? pickWrongLevel(truth) : truth };
  });
}

// Smallest seed (from `from`) whose night has `id` at `index` and distinct levels before it.
// Used to choose DEMO_SEED; kept so it can be re-run if the case bank changes.
export function findSeed({ id = STAR_CASE, index = CORRECT_BEFORE_MISS, from = 1, to = 100000, cases = CASES } = {}) {
  for (let s = from; s <= to; s += 1) {
    const night = nightFor(s, cases);
    if (night[index]?.id !== id) continue;
    const levels = night.slice(0, index).map(correctLevel);
    if (new Set(levels).size === levels.length) return s;
  }
  return null;
}

// Human-like pause in ms, uniform in [min, max], from a random() in [0, 1).
export function pauseMs(random, min = 1500, max = 3000) {
  if (!(min >= 0 && max >= min)) throw new RangeError('need 0 <= min <= max');
  return Math.round(min + random() * (max - min));
}

const seconds = (ms) => Math.round(ms) / 1000;

// Timeline for subtitles and voice-over. `marks` are { name, startMs, endMs } in any clock;
// `videoStartMs` is the same clock's reading when the video started. Returns
// [{ name, start, end }] in seconds from the start of the video (millisecond precision), in the
// order given. Shots must have a name, not start before the video, not end before they start
// and not overlap the previous shot.
export function buildTimeline(marks, videoStartMs) {
  if (!Array.isArray(marks)) throw new TypeError('marks must be an array');
  if (!Number.isFinite(videoStartMs)) throw new TypeError('videoStartMs must be a finite number');
  let lastEnd = 0;
  return marks.map((m, i) => {
    if (!m || typeof m.name !== 'string' || !m.name) throw new TypeError(`marks[${i}] needs a name`);
    if (!Number.isFinite(m.startMs) || !Number.isFinite(m.endMs)) throw new TypeError(`${m.name}: startMs and endMs must be finite`);
    const start = seconds(m.startMs - videoStartMs);
    const end = seconds(m.endMs - videoStartMs);
    if (start < 0) throw new RangeError(`${m.name}: starts before the video`);
    if (end < start) throw new RangeError(`${m.name}: ends before it starts`);
    if (start < lastEnd) throw new RangeError(`${m.name}: overlaps the previous shot`);
    lastEnd = end;
    return { name: m.name, start, end };
  });
}
