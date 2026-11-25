// Nightly case draw and per-appearance variation (task 14).
// Pure module: no DOM, no storage, no Math.random. Every function that needs chance takes a
// `random` function returning a number in [0, 1), so tests can pass a seeded source.
//
// drawNight   - picks PER_LEVEL cases for each ESI level, avoiding last night's ids, and shuffles them
// instantiate - turns a case template into what the player sees: vitals drawn inside
//               case.variants.vitals and, when the case has alternatives, one opening line
// planNight   - both of the above with the same random source

export const LEVELS = [1, 2, 3, 4, 5];
export const PER_LEVEL = 3;
export const NIGHT_SIZE = PER_LEVEL * LEVELS.length;
export const LAST_NIGHT_KEY = 'grimm-triage-last-night';

// Vitals drawn as whole numbers; tempC is drawn to one decimal place.
export const INTEGER_VITALS = ['hr', 'rr', 'sbp', 'spo2', 'pain'];
export const RANGED_VITALS = ['hr', 'rr', 'sbp', 'spo2', 'tempC'];

// Small seeded generator (mulberry32) for tests and reproducible nights.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pickIndex = (random, n) => Math.min(n - 1, Math.floor(random() * n));

// Fisher-Yates on a copy.
export function shuffle(list, random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = pickIndex(random, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Last night's ids from localStorage text. Anything malformed means "no previous night".
export function parseLastNight(stored) {
  try {
    const ids = JSON.parse(stored);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

// PER_LEVEL cases per level, shuffled. Cases in `avoid` are only used when a level has too few
// other cases; with 12 cases per level and 3 drawn, that never happens in the real bank.
export function drawNight(cases, { random, avoid = [] } = {}) {
  if (typeof random !== 'function') throw new TypeError('drawNight needs a random() function');
  const skip = new Set(avoid);
  const picked = [];
  for (const level of LEVELS) {
    const all = cases.filter((c) => c.expectedLevel === level);
    if (all.length < PER_LEVEL) throw new RangeError(`level ${level} has only ${all.length} cases`);
    const fresh = shuffle(all.filter((c) => !skip.has(c.id)), random);
    const repeats = shuffle(all.filter((c) => skip.has(c.id)), random);
    picked.push(...[...fresh, ...repeats].slice(0, PER_LEVEL));
  }
  return shuffle(picked, random);
}

// One value inside [lo, hi]: integers for most vitals, one decimal for temperature.
export function drawValue(key, [lo, hi], random) {
  if (INTEGER_VITALS.includes(key)) return lo + pickIndex(random, hi - lo + 1);
  const tenths = Math.round(lo * 10) + pickIndex(random, Math.round(hi * 10) - Math.round(lo * 10) + 1);
  return tenths / 10;
}

// First sentence and the rest. English ends a sentence with . ! or ? and a space; Chinese with 。！？.
export function splitOpening(text, lang) {
  const m = lang === 'zh' ? text.match(/^(.+?[。！？])(.+)$/su) : text.match(/^(.+?[.!?])\s+(.+)$/su);
  return m ? [m[1], m[2]] : [text, ''];
}

const joinStory = (opening, rest, lang) => (lang === 'zh' ? `${opening}${rest}` : `${opening} ${rest}`);

// What the player sees for one appearance of a case. Keeps every other field of the template.
// `variant` records the choice: opening 0 is the story's own first sentence.
export function instantiate(c, random) {
  const ranges = c.variants?.vitals ?? {};
  const patient = { ...c.patient };
  for (const key of Object.keys(ranges).sort()) patient[key] = drawValue(key, ranges[key], random);

  const openings = c.variants?.openings ?? [];
  const opening = openings.length ? pickIndex(random, openings.length + 1) : 0;
  let { story } = c;
  let zh = c.zh;
  if (opening > 0) {
    const alt = openings[opening - 1];
    story = joinStory(alt.en, splitOpening(c.story, 'en')[1], 'en');
    zh = { ...c.zh, story: joinStory(alt.zh, splitOpening(c.zh.story, 'zh')[1], 'zh') };
  }
  return { ...c, patient, story, zh, variant: { opening } };
}

export function planNight(cases, { random, avoid = [] } = {}) {
  return drawNight(cases, { random, avoid }).map((c) => instantiate(c, random));
}
