#!/usr/bin/env node
// Demo recorder for the Kiroween video (task 18). Dev tool only: the app does not load this file.
//
//   npm start                                  # serves the app on http://localhost:3000
//   npm run demo:record -- --url <url>         # default http://localhost:3000, --seed defaults to DEMO_SEED
//
// Plays one seeded night of Grimm Triage in Chromium following a fixed shot list and writes
//   demo-output/demo.webm      1280x720 video of the real app (Playwright recordVideo; no audio track)
//   demo-output/timeline.json  each shot's name and start / end in seconds from the start of the video
//
// Every answer is computed here from src/triage.js and the case data (scripts/demo-helpers.mjs);
// the script checks that the app drew the same patients before it answers.
import { parseArgs } from 'node:util';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { triage } from '../src/triage.js';
import { mulberry32 } from '../src/night.js';
import { DEMO_SEED, STAR_CASE, CORRECT_BEFORE_MISS, nightFor, planAnswers, pauseMs, buildTimeline } from './demo-helpers.mjs';

const WIDTH = 1280;
const HEIGHT = 720;

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:3000' },
    seed: { type: 'string', default: String(DEMO_SEED) },
    out: { type: 'string', default: 'demo-output' },
  },
});

const seed = Number(args.seed);
if (!Number.isInteger(seed) || seed < 0) throw new RangeError(`--seed must be a whole number, got ${args.seed}`);
const outDir = path.resolve(args.out);
const rawDir = path.join(outDir, '.raw');
const appUrl = new URL(args.url);
appUrl.searchParams.set('seed', String(seed));

// ---- the plan, computed before the browser opens ----
const night = nightFor(seed);
const answers = planAnswers(night);
const missIndex = answers.findIndex((a) => a.guess !== a.truth);
if (missIndex !== CORRECT_BEFORE_MISS) {
  throw new Error(`seed ${seed}: ${STAR_CASE} must be patient ${CORRECT_BEFORE_MISS + 1} of the night (found at ${missIndex + 1}). Pick another seed with findSeed() in scripts/demo-helpers.mjs.`);
}
console.log(`Seed ${seed}. Plan:`);
answers.forEach((a, i) => console.log(`  ${String(i + 1).padStart(2)}. ${a.name.padEnd(34)} ESI ${a.truth} -> answer ${a.guess}${a.guess !== a.truth ? '  (under-triage)' : ''}`));

// ---- preflight: Playwright installed, app reachable ----
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm install && npx playwright install chromium');
  process.exit(1);
}
try {
  const res = await fetch(appUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (err) {
  console.error(`Cannot reach ${args.url} (${err.message}). Start the app first with: npm start`);
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(rawDir, { recursive: true });

const browser = await chromium.launch();
const marks = [];
let videoStart;
try {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    locale: 'en-US',
    reducedMotion: 'no-preference',
    serviceWorkers: 'block', // record the files being served now, never a cached copy
    recordVideo: { dir: rawDir, size: { width: WIDTH, height: HEIGHT } },
  });
  const page = await context.newPage();
  videoStart = performance.now(); // the video starts with the page

  // Pauses come from their own seeded source, so two runs with the same seed have the same rhythm.
  const random = mulberry32(seed ^ 0x5eed);
  const pause = (min = 1500, max = 3000) => page.waitForTimeout(pauseMs(random, min, max));
  const shot = async (name, fn) => {
    const startMs = performance.now();
    console.log(`Shot: ${name}`);
    await fn();
    marks.push({ name, startMs, endMs: performance.now() });
  };
  const scrollTo = async (selector, block = 'center') => {
    await page.locator(selector).first().evaluate((el, b) => el.scrollIntoView({ behavior: 'smooth', block: b }), block);
    await page.waitForTimeout(700);
  };
  const typeSlowly = (selector, text) => page.locator(selector).pressSequentially(text, { delay: 180 });
  const clearSlowly = async (selector) => {
    const input = page.locator(selector);
    await input.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.waitForTimeout(250);
    await page.keyboard.press('Backspace');
    if ((await input.inputValue()) !== '') await input.fill('');
  };
  // The app must show the patient the plan expects, or every answer after it would be wrong.
  const expectPatient = async (i) => {
    const { name } = answers[i];
    try {
      await page.waitForFunction((n) => document.querySelector('#caseName')?.textContent === n, name, { timeout: 5000 });
    } catch {
      const shown = await page.locator('#caseName').textContent();
      throw new Error(`patient ${i + 1}: expected "${name}", the app shows "${shown}". Is ?seed= supported by the app at ${args.url}?`);
    }
  };
  const answer = async (i, { read = true } = {}) => {
    await expectPatient(i);
    const button = page.locator(`#levelButtons button[data-level="${answers[i].guess}"]`);
    if (read) { await pause(); await button.hover(); await pause(600, 1000); }
    await button.click();
  };
  const next = () => page.locator('#nextCase').click();

  await page.goto(appUrl.href, { waitUntil: 'load' });

  await shot('title-screen', async () => {
    const english = page.locator('.lang-toggle button[data-lang="en"]');
    if ((await english.getAttribute('aria-pressed')) !== 'true') await english.click();
    await pause(2500, 3000);
    const sound = page.locator('#soundToggle');
    if (await sound.isVisible()) {
      if ((await sound.getAttribute('aria-pressed')) !== 'true') await sound.click();
      await pause();
    } else {
      console.warn('  No Web Audio in this browser: the sound toggle is hidden.');
    }
    await page.locator('nav button[data-mode="game"]').click();
    await page.locator('#caseCard').focus();
    await pause();
  });

  await shot('triage-correct', async () => {
    for (let i = 0; i < CORRECT_BEFORE_MISS; i += 1) {
      await answer(i);
      await page.locator('#game.fx-correct').waitFor({ timeout: 3000 });
      await pause(2000, 3000);
      await next();
    }
  });

  await shot('under-triage-haunting', async () => {
    await answer(missIndex);
    await page.locator('#game.fx-under').waitFor({ timeout: 3000 });
    await page.waitForTimeout(3500); // the heartbeat vignette runs for 3 s
    await pause();
    await next();
  });

  // No skip button in the app: answer the rest of the night quickly and correctly. Cut this shot.
  await shot('fast-forward', async () => {
    for (let i = missIndex + 1; i < answers.length; i += 1) {
      await answer(i, { read: false });
      await page.waitForTimeout(300);
      await next();
    }
  });

  await shot('shift-report-lesson', async () => {
    await page.locator('#shiftReport').waitFor({ state: 'visible' });
    await scrollTo('#reportTitle', 'start');
    await pause(2500, 3000);
    await scrollTo('.missed-list .missed .step-tag');
    await pause(2500, 3000);
    const lesson = page.locator('#lesson');
    await scrollTo('#lesson > summary', 'start');
    if (!(await lesson.evaluate((d) => d.open))) await page.locator('#lesson > summary').click();
    await pause();
    await scrollTo('#lesson .wrong-list');
    await pause(2500, 3000);
  });

  await shot('triage-desk-provisional', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(700);
    await page.locator('nav button[data-mode="calc"]').click();
    await pause();
    await scrollTo('.field[data-field="resources"]');
    await page.locator('.field[data-field="resources"] .help-btn').click();
    await pause();
    for (const resource of ['labs', 'xray']) {
      const box = page.locator(`#calcForm input[data-resource="${resource}"]`);
      await box.scrollIntoViewIfNeeded();
      await box.check();
      await pause(800, 1200);
    }
    await pause();
    for (const vital of ['hr', 'rr', 'spo2']) {
      await scrollTo(`#calcForm input[name="${vital}"]`);
      await clearSlowly(`#calcForm input[name="${vital}"]`);
      await pause(800, 1200);
    }
    await scrollTo('#calcForm input[name="resources"]');
    await clearSlowly('#calcForm input[name="resources"]');
    await typeSlowly('#calcForm input[name="resources"]', '2');
    await pause(800, 1200);

    // What the engine says for the form as it now stands; the app must show the same.
    const form = await page.locator('#calcForm').evaluate((f) => Object.fromEntries(new FormData(f)));
    const vital = (k) => (form[k] === '' ? null : Number(form[k]));
    const expected = triage({
      ageYears: Number(form.ageYears), avpu: form.avpu, hr: vital('hr'), rr: vital('rr'), sbp: vital('sbp'),
      spo2: vital('spo2'), tempC: vital('tempC'), pain: Number(form.pain), resources: Number(form.resources),
      newConfusion: 'newConfusion' in form, highRisk: 'highRisk' in form, needsLifesaving: 'needsLifesaving' in form,
    });
    if (expected.level !== 2 || !expected.provisional) throw new Error(`Triage Desk: expected a provisional ESI 2, the engine gives ${JSON.stringify(expected)}`);

    await scrollTo('#calcForm button[type="submit"]');
    await page.locator('#calcForm button[type="submit"]').click();
    await page.locator(`#calcResult .badge.lv${expected.level}`).waitFor();
    await page.locator('#calcResult .provisional-tag').waitFor();
    await page.locator('#calcResult .missing-warning').waitFor();
    await scrollTo('#calcResult');
    await pause(2500, 3000);
  });

  await shot('language-switch', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(700);
    await page.locator('.lang-toggle button[data-lang="zh-CN"]').click();
    await page.waitForTimeout(3000);
    await page.locator('.lang-toggle button[data-lang="en"]').click();
    await pause(1500, 2000);
  });

  const video = page.video();
  await page.close();
  await video.saveAs(path.join(outDir, 'demo.webm'));
  await video.delete();
  await context.close();
} finally {
  await browser.close();
}
await rm(rawDir, { recursive: true, force: true });

const timeline = {
  video: 'demo.webm',
  width: WIDTH,
  height: HEIGHT,
  seed,
  shots: buildTimeline(marks, videoStart),
};
await writeFile(path.join(outDir, 'timeline.json'), `${JSON.stringify(timeline, null, 2)}\n`);
console.log(`Wrote ${path.join(args.out, 'demo.webm')} and ${path.join(args.out, 'timeline.json')}`);
for (const s of timeline.shots) console.log(`  ${s.start.toFixed(2).padStart(7)}-${s.end.toFixed(2).padStart(7)} s  ${s.name}`);
