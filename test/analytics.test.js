// Privacy-friendly visit statistics (task 19): src/analytics.js, the Umami tag in index.html,
// the call sites in src/app.js, the service worker and the demo recorder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { track, trackingAllowed, eventPayload, deskLevel, EVENTS } from '../src/analytics.js';
import { triage } from '../src/triage.js';
import { UMAMI_SCRIPT_PATTERN } from '../scripts/demo-helpers.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const html = read('index.html');
const app = read('src/app.js');

const UMAMI_TAG = '<script defer src="https://cloud.umami.is/script.js" data-website-id="6b8fea6f-a40a-4285-90b8-f6de1798fdfd" data-domains="grimm-triage.vercel.app" data-do-not-track="true"></script>';
const ALLOWED = { 'night-complete': 'score', 'under-triage': 'step', 'desk-submit': 'level', 'lang-switch': 'lang', 'sign-in': 'provider' };

// A fake browser window that records what reaches umami.track.
function fakeWindow({ search = '', doNotTrack = null, umami = true, throws = false } = {}) {
  const calls = [];
  const scope = { location: { search }, navigator: { doNotTrack } };
  if (umami) {
    scope.umami = {
      track: (name, data) => {
        if (throws) throw new Error('umami exploded');
        calls.push([name, data]);
      },
    };
  }
  return { scope, calls };
}

// ---- track() ----

test('track() sends an allowed event to window.umami.track', () => {
  const { scope, calls } = fakeWindow();
  assert.equal(track('lang-switch', { lang: 'zh-CN' }, scope), true);
  assert.deepEqual(calls, [['lang-switch', { lang: 'zh-CN' }]]);
});

test('track() is a no-op without window.umami (script blocked or offline)', () => {
  const { scope } = fakeWindow({ umami: false });
  assert.equal(track('night-complete', { score: 900 }, scope), false);
  assert.equal(track('night-complete', { score: 900 }, { ...scope, umami: {} }), false, 'umami without track()');
  assert.equal(track('night-complete', { score: 900 }, {}), false, 'no location, navigator or umami at all');
  // Node itself has no window.umami: the default scope must not throw either.
  assert.equal(track('night-complete', { score: 900 }), false);
});

test('track() is a no-op with ?seed= in the URL (demo recordings)', () => {
  for (const search of ['?seed=87', '?seed=', '?lang=en&seed=3']) {
    const { scope, calls } = fakeWindow({ search });
    assert.equal(track('under-triage', { step: 'A' }, scope), false, search);
    assert.equal(trackingAllowed(scope), false, search);
    assert.deepEqual(calls, [], search);
  }
  assert.equal(trackingAllowed(fakeWindow({ search: '?utm_source=x' }).scope), true, 'other query strings still count');
});

test('track() is a no-op when navigator.doNotTrack is "1"', () => {
  const { scope, calls } = fakeWindow({ doNotTrack: '1' });
  assert.equal(track('desk-submit', { level: '2P' }, scope), false);
  assert.deepEqual(calls, []);
  for (const doNotTrack of ['0', null, 'unspecified']) {
    assert.equal(trackingAllowed(fakeWindow({ doNotTrack }).scope), true, String(doNotTrack));
  }
});

test('track() never throws, even when umami.track throws or the scope is hostile', () => {
  const { scope } = fakeWindow({ throws: true });
  assert.doesNotThrow(() => track('lang-switch', { lang: 'en' }, scope));
  assert.equal(track('lang-switch', { lang: 'en' }, scope), false);
  const hostile = { get location() { throw new Error('denied'); }, umami: { track() {} } };
  assert.doesNotThrow(() => track('lang-switch', { lang: 'en' }, hostile));
  assert.doesNotThrow(() => track('lang-switch', null, fakeWindow().scope));
  assert.doesNotThrow(() => track(undefined, undefined, null));
});

// ---- payloads ----

test('the event list is exactly the five documented events, one property each', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(EVENTS).map(([name, e]) => [name, e.key])), ALLOWED);
});

test('payloads contain only the allowed key; clinical fields and extra props are dropped', () => {
  const clinical = { ageYears: 45, hr: 130, rr: 30, sbp: 80, spo2: 88, tempC: 39.4, pain: 8, name: 'The Sandman', story: 'free text', avpu: 'V' };
  const valid = { 'night-complete': { score: 1150 }, 'under-triage': { step: 'D' }, 'desk-submit': { level: '2P' }, 'lang-switch': { lang: 'zh-CN' }, 'sign-in': { provider: 'github' } };
  for (const [name, props] of Object.entries(valid)) {
    const { scope, calls } = fakeWindow();
    assert.equal(track(name, { ...clinical, ...props }, scope), true, name);
    assert.equal(calls.length, 1);
    assert.deepEqual(Object.keys(calls[0][1]), [ALLOWED[name]], `${name}: only ${ALLOWED[name]} may be sent`);
    assert.deepEqual(calls[0][1], props);
  }
});

test('unknown events and invalid values are not sent at all', () => {
  const rejected = [
    ['page-view', { lang: 'en' }],
    ['toString', {}],
    ['__proto__', {}],
    ['night-complete', { score: '1150' }],
    ['night-complete', { score: 12.5 }],
    ['night-complete', {}],
    ['under-triage', { step: 'E' }],
    ['under-triage', { step: 'The Sandman' }],
    ['desk-submit', { level: 2 }],
    ['desk-submit', { level: '6' }],
    ['desk-submit', { level: '2 HR 130' }],
    ['lang-switch', { lang: 'fr' }],
    ['lang-switch', { lang: 'zh-CN; age=45' }],
    ['sign-in', { provider: 'apple' }],
    ['sign-in', { provider: 'email' }],
    ['sign-in', { provider: 'b6a7c3f0-1234-4cde-9abc-0123456789ab' }],
    ['sign-in', { provider: 'Night Nurse 4821' }],
    ['sign-in', {}],
  ];
  for (const [name, props] of rejected) {
    const { scope, calls } = fakeWindow();
    assert.equal(track(name, props, scope), false, `${name} ${JSON.stringify(props)}`);
    assert.equal(eventPayload(name, props), null);
    assert.deepEqual(calls, []);
  }
});

test('desk level is the computed ESI level, with a P suffix only when provisional', () => {
  const base = { ageYears: 45, avpu: 'A', hr: 90, rr: 16, sbp: 125, spo2: 98, tempC: 36.8, pain: 2, resources: 2, newConfusion: false, highRisk: false, needsLifesaving: false };
  assert.equal(deskLevel(triage(base)), '3');
  const provisional = triage({ ...base, hr: null, rr: null, spo2: null });
  assert.equal(provisional.provisional, true);
  assert.equal(deskLevel(provisional), '2P');
  for (const level of [1, 2, 3, 4, 5]) {
    assert.ok(EVENTS['desk-submit'].valid(deskLevel({ level })));
    assert.ok(EVENTS['desk-submit'].valid(deskLevel({ level, provisional: true })));
  }
});

// ---- call sites in src/app.js ----

test('src/app.js sends only the five events, each with its one allowed property', () => {
  const calls = [...app.matchAll(/\btrack\(\s*'([^']+)'\s*,\s*\{([^}]*)\}\s*\)/g)];
  assert.equal([...app.matchAll(/\btrack\(/g)].length, calls.length, 'every track() call uses a literal event name and object');
  assert.deepEqual(calls.map((m) => m[1]).sort(), Object.keys(ALLOWED).sort(), 'each event is sent from exactly one place');
  for (const [, name, body] of calls) {
    const keys = body.split(',').map((p) => p.split(':')[0].trim()).filter(Boolean);
    assert.deepEqual(keys, [ALLOWED[name]], `${name} sends ${keys.join(', ')}`);
  }
  assert.match(app, /track\('desk-submit', \{ level: deskLevel\(calc\.result\) \}\)/, 'desk-submit sends only the computed level');
  assert.doesNotMatch(app, /umami/, 'app.js goes through src/analytics.js, never window.umami directly');
  // Task 22: the sign-in event carries only the provider from the redirect, never account data.
  assert.match(app, /track\('sign-in', \{ provider: res\.signIn\.provider \}\)/);
});

// ---- index.html ----

test('index.html loads the Umami script exactly as specified, in <head>', () => {
  const head = html.slice(0, html.indexOf('</head>'));
  assert.equal(head.split(UMAMI_TAG).length - 1, 1, 'the Umami tag must appear once in <head>');
  assert.equal(html.split('cloud.umami.is').length - 1, 1, 'no second Umami tag elsewhere');
});

test('index.html loads no other third-party script or resource', () => {
  for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
    const src = tag.match(/\bsrc="([^"]*)"/)?.[1];
    if (src === undefined || !/^(?:[a-z]+:)?\/\//i.test(src)) continue; // inline or same-origin
    assert.equal(src, 'https://cloud.umami.is/script.js', `third-party script not allowed: ${src}`);
  }
  const external = [...html.matchAll(/\b(?:src|href|data)="((?:[a-z]+:)?\/\/[^"]*)"/gi)].map((m) => m[1]);
  assert.deepEqual(external, ['https://cloud.umami.is/script.js'], 'only the Umami script may come from another origin');
  assert.doesNotMatch(html, /\bimport\s*\(\s*['"]https?:|@import\s+url\(\s*['"]?https?:/i);
});

// The one exception is src/supabase.js (task 22), which calls only the configured Supabase project
// through its injected fetch; test/accounts.test.js checks every URL it requests.
test('no file in src/ injects a script or calls another origin', () => {
  for (const file of readdirSync(new URL('src/', root))) {
    const code = read(`src/${file}`);
    assert.doesNotMatch(code, /createElement\(\s*['"]script['"]\s*\)/, `${file} injects a script`);
    if (file === 'supabase.js') {
      assert.doesNotMatch(code, /\b(?:sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(/, `${file} uses another transport`);
      assert.doesNotMatch(code, /https?:\/\//, `${file} must not hard-code an origin; it uses config.url`);
      continue;
    }
    assert.doesNotMatch(code, /\b(?:fetch|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(/, `${file} makes a network request`);
    assert.doesNotMatch(code, /\bimport\s*\(?\s*['"]https?:/, `${file} imports from another origin`);
  }
});

test('the footer notes the statistics in English and Chinese', () => {
  assert.match(html, /<span data-i18n="footer\.analytics">Anonymous, cookie-free visit statistics \(Umami\)\.<\/span>/);
});

// ---- service worker and demo recorder ----

test('the service worker never handles or caches the Umami script', async () => {
  const listeners = {};
  const opened = [];
  const self = { location: new URL('https://grimm-triage.vercel.app/sw.js'), addEventListener: (type, fn) => { listeners[type] = fn; } };
  const context = vm.createContext({ self, caches: { open: async (n) => { opened.push(n); return {}; } }, URL, Promise, Request: class {} });
  vm.runInContext(read('sw.js'), context);
  for (const url of ['https://cloud.umami.is/script.js', 'https://cloud.umami.is/api/send']) {
    for (const method of ['GET', 'POST']) {
      let responded = false;
      listeners.fetch({ request: { method, mode: 'no-cors', url }, respondWith: () => { responded = true; } });
      assert.equal(responded, false, `${method} ${url} must be left to the browser`);
    }
  }
  assert.deepEqual(opened, []);
  assert.equal(vm.runInContext('CACHE_VERSION', context), 'v10'); // v8 in task 19, v9 in task 21, v10 in task 22
  assert.ok(!vm.runInContext('PRECACHE_URLS', context).some((u) => /umami|https?:/.test(u)));
});

test('the demo recorder blocks the Umami script', () => {
  assert.ok(UMAMI_SCRIPT_PATTERN.startsWith('https://cloud.umami.is/'));
  assert.match(read('scripts/record-demo.mjs'), /context\.route\(UMAMI_SCRIPT_PATTERN, \(route\) => route\.abort\(\)\)/);
});
