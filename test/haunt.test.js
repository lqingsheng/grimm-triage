// Under-triage haunting effect (task 13): layout data, flash safety, layering, reduced motion,
// eye glow and the optional synthesised sound. Static checks only; no browser needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DRIPS, dripsHtml, stainLayout, stainsHtml, STAIN_BASE, STAIN_GROWTH, STAIN_MAX } from '../src/haunt.js';
import { PORTRAITS, eyeGlowSvg } from '../src/portraits.js';
import { CASES } from '../src/cases.js';
import { SOUND_KEY, soundOnFrom, playHaunt, HAUNT_SOUND } from '../src/sound.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const css = read('styles.css');
const html = read('index.html');

// ---- CSS helpers ----
// Body of the first block that starts with `head` (brace-balanced).
function block(source, head) {
  const at = source.indexOf(head);
  assert.ok(at >= 0, `styles.css: missing ${head}`);
  let i = source.indexOf('{', at) + 1;
  const start = i;
  for (let depth = 1; depth > 0; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') depth -= 1;
  }
  return source.slice(start, i - 1);
}
// Declarations of the rule whose selector list is exactly `selector`.
function rule(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*{([^}]*)}`));
  assert.ok(m, `styles.css: missing rule ${selector}`);
  return m[1];
}
const zIndex = (selector) => Number(rule(selector).match(/z-index:\s*(-?\d+)/)?.[1]);

// Opacity keyframes -> times (fraction of one cycle) of each brightness peak.
function opacityPeaks(name) {
  const points = [];
  for (const [, stops, value] of block(css, `@keyframes ${name} `).matchAll(/([\d%,\s]+|from|to)\s*{\s*opacity:\s*([\d.]+);?\s*}/g)) {
    for (const stop of stops.split(',').map((x) => x.trim()).filter(Boolean)) {
      const pct = stop === 'from' ? 0 : stop === 'to' ? 100 : parseFloat(stop);
      points.push([pct / 100, Number(value)]);
    }
  }
  points.sort((a, b) => a[0] - b[0]);
  assert.ok(points.length >= 3, `@keyframes ${name}: expected opacity stops`);
  return points.filter(([, v], i) => i > 0 && i < points.length - 1 && v > points[i - 1][1] && v > points[i + 1][1]).map(([t]) => t);
}

// `animation: name 1s ease-out .2s 3;` -> { duration, delay, count }
function animation(selector, name) {
  const m = rule(selector).match(new RegExp(`animation:\\s*${name}\\s+([^;]+);`));
  assert.ok(m, `${selector} should run ${name}`);
  const parts = m[1].trim().split(/\s+/);
  assert.ok(!parts.includes('infinite'), `${name} must not loop forever`);
  const times = parts.filter((p) => /^[\d.]+m?s$/.test(p)).map((p) => (p.endsWith('ms') ? parseFloat(p) / 1000 : parseFloat(p)));
  const count = Number(parts.find((p) => /^\d+$/.test(p)) ?? 1);
  return { duration: times[0], delay: times[1] ?? 0, count };
}

// ---- layout data ----
test('12 drips, 4 to 14 px wide, spread across the panel', () => {
  assert.equal(DRIPS.length, 12);
  const widths = DRIPS.map((d) => d.w);
  for (const d of DRIPS) {
    assert.ok(Number.isInteger(d.w) && d.w >= 4 && d.w <= 14, `width ${d.w}`);
    assert.ok(d.x >= 0 && d.x <= 96, `x ${d.x}`);
    assert.ok(d.len > 0 && d.d >= 0 && d.d < 1);
  }
  assert.equal(Math.min(...widths), 4);
  assert.equal(Math.max(...widths), 14);
  assert.equal(new Set(DRIPS.map((d) => d.x)).size, 12, 'drips overlap');
  const spans = dripsHtml().match(/<span style="--x:[\d.]+%;--w:\d+px;--len:\d+px;--d:[\d.]+s"><\/span>/g);
  assert.equal(spans?.length, 12);
});

test('one stain per under-triage; older stains grow, capped; deterministic', () => {
  for (const bad of [0, -1, NaN, 1.5, undefined]) assert.deepEqual(stainLayout(bad), []);
  assert.equal(stainsHtml(0), '');
  for (let n = 1; n <= 22; n += 1) {
    const stains = stainLayout(n);
    assert.equal(stains.length, n);
    assert.equal(stains[n - 1].size, STAIN_BASE, 'the newest stain starts small');
    for (const s of stains) {
      assert.ok(s.x >= 4 && s.x <= 96 && s.y >= 4 && s.y <= 96, 'stain off the panel');
      assert.ok(s.size >= STAIN_BASE && s.size <= STAIN_MAX);
    }
    for (let i = 1; i < n; i += 1) assert.ok(stains[i - 1].size >= stains[i].size, 'older stains are at least as big');
    assert.equal(stainsHtml(n).match(/class="stain"/g).length, n);
  }
  assert.equal(stainLayout(2)[0].size, STAIN_BASE + STAIN_GROWTH, 'the first stain grows when a second one lands');
  assert.equal(stainLayout(22)[0].size, STAIN_MAX);
  assert.deepEqual(stainLayout(5), stainLayout(5));
  assert.deepEqual(stainLayout(5)[0].x, stainLayout(9)[0].x, 'a stain stays where it landed');
});

test('stains are cleared only by "Start a new night"', () => {
  const app = read('src/app.js');
  const resets = [...app.matchAll(/^\s+stainCount = 0;/gm)];
  assert.equal(resets.length, 1);
  const startNight = app.slice(app.indexOf('function startNight'), app.indexOf('}', app.indexOf('function startNight')));
  assert.match(startNight, /stainCount = 0;\s*renderStains\(\)/);
  assert.match(app, /if \(s\.underTriage\) { stainCount \+= 1; renderStains\(\); }/);
});

// ---- flash safety (WCAG 2.3.1) ----
// WCAG allows 3 flashes per second; we hold red effects to 2 because red flashes are the riskiest.
const FLASH_LIMIT = 2;

function largeAreaFlashes() {
  const flashes = [];
  for (const [selector, name] of [['.fx-under .fx-dim', 'flicker'], ['.haunted .vignette', 'heartbeat']]) {
    const { duration, delay, count } = animation(selector, name);
    for (let c = 0; c < count; c += 1) for (const p of opacityPeaks(name)) flashes.push(delay + duration * (c + p));
  }
  return flashes.sort((a, b) => a - b);
}

test(`large-area flashes stay at or below ${FLASH_LIMIT} in any one-second window`, () => {
  const flashes = largeAreaFlashes();
  assert.equal(flashes.length, 5, 'flicker twice + three heartbeats');
  const worst = Math.max(...flashes.map((t) => flashes.filter((u) => u >= t && u < t + 1).length));
  assert.ok(worst <= FLASH_LIMIT, `${worst} flashes in one second`);
  const flicker = animation('.fx-under .fx-dim', 'flicker');
  const beats = animation('.haunted .vignette', 'heartbeat');
  assert.ok(beats.delay >= flicker.delay + flicker.duration, 'heartbeat starts after the flicker ends');
  assert.equal(beats.duration, 1, 'one beat per second');
  assert.equal(beats.duration * beats.count, 3, 'pulses for 3 seconds');
});

test('the heartbeat vignette peaks at no more than 0.55 opacity', () => {
  const values = [...block(css, '@keyframes heartbeat ').matchAll(/opacity:\s*([\d.]+)/g)].map((m) => Number(m[1]));
  assert.ok(Math.max(...values) <= 0.55, `peak ${Math.max(...values)}`);
});

test('sound beats and the ECG start in step with the vignette heartbeat', () => {
  const beatTimes = largeAreaFlashes().slice(-3);
  for (let i = 0; i < HAUNT_SOUND.beats; i += 1) {
    assert.ok(Math.abs(HAUNT_SOUND.firstBeat + i * HAUNT_SOUND.beatPeriod - beatTimes[i]) < 1e-9, `beat ${i + 1}`);
  }
  const ecg = rule('.fx-under .ecg').match(/ecg-trace\s+([\d.]+)s\s+\w+\s+([\d.]+)s/);
  assert.equal(Number(ecg[2]), animation('.haunted .vignette', 'heartbeat').delay, 'ECG starts with the heartbeat');
  assert.ok(HAUNT_SOUND.flatlineAt > beatTimes.at(-1) + 0.4, 'flatline after the last lub-dub');
});

test('no endless animation besides the slow fog drift, and the panel flicker uses no filter', () => {
  const loops = [...css.matchAll(/animation:\s*(\w[\w-]*)[^;]*\binfinite\b/g)].map((m) => m[1]);
  assert.deepEqual(loops, ['drift']);
  assert.doesNotMatch(block(css, '@keyframes flicker '), /filter/);
});

const HEX = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const channel = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const [r, g, b] = rgb(hex).map(channel); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

test('the pulsing vignette is not a WCAG "saturated red"', () => {
  for (const name of ['vignette', 'eye-glow']) {
    const [r, g, b] = rgb(HEX(name));
    assert.ok(r / (r + g + b) < 0.8, `--${name} is saturated red`);
  }
  assert.ok(luminance(HEX('vignette')) < 0.05, 'vignette must stay dark');
});

// ---- readability ----
test('feedback, level buttons and Next sit above every effect layer', () => {
  const top = zIndex('.levels, .feedback, #nextCase');
  assert.ok(top > zIndex('.vignette'));
  assert.ok(zIndex('.vignette') > zIndex('.fx-layer'));
  assert.ok(zIndex('.fx-layer') > zIndex('.stains'));
  assert.ok(zIndex('.hud, .card, .report') > zIndex('.stains'), 'case text sits above the stains');
  assert.match(rule('.fx-under .feedback'), /background:\s*#120e1af2/, 'feedback gets a near-opaque backing');
  // A filter, transform, opacity or isolation on the panel would make it a stacking context and
  // trap the feedback under the vignette.
  for (const [, sel, body] of css.matchAll(/([^{}]*\.panel[^{}]*){([^}]*)}/g)) {
    if (sel.includes('@')) continue;
    assert.doesNotMatch(body, /\b(filter|transform|opacity|isolation|contain|will-change):/, `${sel.trim()} creates a stacking context`);
  }
});

test('drips and handprint recede to 25% after about 4 s; the pool and stains stay', () => {
  const recede = rule('.fx-under .drips, .fx-under .handprint').match(/animation:\s*recede\s+([\d.]+)s\s+[\w-]+\s+([\d.]+)s\s+forwards/);
  assert.ok(recede, 'drips and handprint need the recede animation');
  assert.ok(Number(recede[2]) >= 3.5 && Number(recede[2]) <= 4.5, `starts at ${recede[2]}s`);
  assert.match(block(css, '@keyframes recede '), /to\s*{\s*opacity:\s*\.25;\s*}/);
  assert.doesNotMatch(rule('.fx-under .pool'), /recede/);
  assert.doesNotMatch(css, /\.stains?\b[^{}]*{[^}]*recede/);
});

test('text stays AA-readable over a dried stain', () => {
  for (const fg of ['ink', 'muted', 'pumpkin', 'ecto', 'candle']) {
    const ratio = contrast(HEX(fg), HEX('stain'));
    assert.ok(ratio >= 4.5, `--${fg} on --stain is ${ratio.toFixed(2)}:1`);
  }
});

// ---- reduced motion ----
test('reduced motion keeps only static stains, the tint and the text note', () => {
  const rm = block(css, '@media (prefers-reduced-motion: reduce) {\n  .panel.fx-correct');
  assert.match(rm, /\.fx-layer, \.vignette, \.ecg, \.eye-glow\s*{\s*display:\s*none;/);
  assert.match(rm, /\.fx-under \.portrait-art\s*{?[^}]*animation:\s*none/);
  assert.match(rm, /\.stain\s*{\s*transition:\s*none;/);
  assert.doesNotMatch(rm, /\.stains?\b[^{]*{\s*display:\s*none/, 'stains must stay visible');
  assert.match(rm, /\.panel\.fx-under\s*{[^}]*background:/, 'static tint');
  assert.match(rm, /\.fx-note\s*{\s*display:\s*block;/);
});

// ---- markup ----
test('effect markup is decorative and self-contained (no images, links or scripts)', () => {
  const layer = html.slice(html.indexOf('<div class="fx-layer"'), html.indexOf('<div class="hud"'));
  assert.match(layer, /<svg class="handprint"/);
  assert.match(html, /<svg class="ecg"[^>]*aria-hidden="true"/);
  for (const part of [layer, html.match(/<svg class="ecg"[\s\S]*?<\/svg>/)[0]]) {
    assert.doesNotMatch(part, /href|url\(|https?:|<image|<img|<script|\son\w+=/i);
  }
  assert.match(html, /<div class="drips" id="drips"><\/div>/);
});

test('every portrait has two eyes inside the art, and the glow is hidden from screen readers', () => {
  for (const c of CASES) {
    const { eyes } = PORTRAITS[c.id];
    assert.equal(eyes?.length, 2, `${c.id}: needs two eye positions`);
    for (const [x, y] of eyes) assert.ok(x > 8 && x < 56 && y > 8 && y < 56, `${c.id}: eye off the face`);
    const svg = eyeGlowSvg(c.id);
    assert.match(svg, /^<svg class="eye-glow" viewBox="0 0 64 64" aria-hidden="true" focusable="false">/);
    assert.equal(svg.match(/<circle /g).length, 4);
  }
  assert.equal(eyeGlowSvg('no-such-monster'), '');
});

// ---- sound ----
test('sound is off by default and the toggle starts unpressed', () => {
  assert.equal(SOUND_KEY, 'grimm-triage-sound');
  for (const v of [null, undefined, '', 'off', 'true', 'ON']) assert.equal(soundOnFrom(v), false);
  assert.equal(soundOnFrom('on'), true);
  assert.match(html, /<button type="button" id="soundToggle"[^>]*aria-pressed="false"/);
});

// Minimal stand-in for AudioContext that records what playHaunt schedules.
function fakeAudio() {
  const log = { oscillators: [], gains: [], other: [] };
  const param = (v = 0) => {
    const p = { value: v, events: [] };
    for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime']) {
      p[m] = (val, at) => { p.events.push([m, val, at]); p.value = val; return p; };
    }
    p.cancelScheduledValues = (at) => { p.events.push(['cancel', null, at]); return p; };
    return p;
  };
  const node = (extra) => ({ connect(n) { this.to = n; return n; }, ...extra });
  const ctx = {
    currentTime: 10,
    destination: { name: 'speakers' },
    createOscillator() {
      const o = node({ type: '', frequency: param(440), starts: [], stops: [], start(t) { this.starts.push(t); }, stop(t) { this.stops.push(t); } });
      log.oscillators.push(o);
      return o;
    },
    createGain() { const g = node({ gain: param(1) }); log.gains.push(g); return g; },
  };
  for (const m of ['createBufferSource', 'createMediaElementSource', 'decodeAudioData']) ctx[m] = () => { log.other.push(m); };
  return { ctx, log };
}

test('playHaunt synthesises three lub-dub beats then a flatline beep, all oscillators', () => {
  const { ctx, log } = fakeAudio();
  const h = playHaunt(ctx);
  assert.deepEqual(log.other, [], 'no samples or audio files');
  assert.equal(log.oscillators.length, HAUNT_SOUND.beats * 2 + 1);
  assert.ok(log.oscillators.every((o) => o.type === 'sine'));
  const beatStarts = log.oscillators.slice(0, -1).map((o) => o.starts[0] - 10);
  for (let i = 0; i < HAUNT_SOUND.beats; i += 1) {
    assert.ok(Math.abs(beatStarts[i * 2] - (HAUNT_SOUND.firstBeat + i)) < 1e-9, 'one beat per second');
  }
  const flat = log.oscillators.at(-1);
  assert.equal(flat.frequency.events[0][1], HAUNT_SOUND.flatlineHz);
  assert.ok(Math.abs(flat.starts[0] - 10 - HAUNT_SOUND.flatlineAt) < 1e-9);
  assert.ok(flat.starts[0] - 10 > beatStarts.at(-1), 'flatline comes after the last beat');
  assert.equal(h.end, flat.stops[0]);
  for (const o of log.oscillators) assert.ok(o.stops.length === 1 && o.stops[0] > o.starts[0], 'every tone ends');
  const master = log.gains[0];
  assert.equal(master.to, ctx.destination);
  assert.ok(master.gain.events[0][1] <= 0.25, 'quiet master level');
});

test('stop() fades out quickly and stops every tone', () => {
  const { ctx, log } = fakeAudio();
  const h = playHaunt(ctx);
  ctx.currentTime = 11;
  h.stop();
  h.stop(); // second call is harmless
  const master = log.gains[0];
  const last = master.gain.events.at(-1);
  assert.deepEqual([last[0], last[1]], ['linearRampToValueAtTime', 0]);
  assert.ok(last[2] - 11 <= 0.05 + 1e-9);
  for (const o of log.oscillators) assert.ok(o.stops.at(-1) <= 11.06 + 1e-9);
});

test('the repo ships no audio files', () => {
  const walk = (dir) => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || e.name === 'node_modules') return [];
    return e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`];
  });
  const audio = walk('').filter((f) => /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)$/i.test(f));
  assert.deepEqual(audio, []);
  assert.doesNotMatch(read('src/sound.js'), /fetch\(|new Audio\(|\.mp3|\.wav|\.ogg/);
});
