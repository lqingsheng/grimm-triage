// Optional accounts (task 22): src/config.js, src/supabase.js, src/accounts.js, src/accountview.js,
// the wiring in src/app.js and index.html, the service worker and supabase/migrations/0001_accounts.sql.
// Every network call goes to a mocked fetch; nothing here talks to the real Supabase project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfig } from '../src/config.js';
import {
  authorizeUrl, redirectTarget, parseRedirect, parseSession, readSession, refreshDelay, needsRefresh, authHeaders,
  createClient, challengeFor, SESSION_KEY, PKCE_KEY, REFRESH_MARGIN_S, PKCE_MAX_AGE_MS,
} from '../src/supabase.js';
import {
  validateDisplayName, generateNickname, NICKNAME_TITLES, resultPayload, RESULT_FIELDS, NIGHT_MAX_SCORE, RESULTS_PER_DAY,
  parseQueue, enqueue, failureAction, progressStats, progressFromServer, leaderboardModel, createAccountService,
  QUEUE_KEY, HISTORY_KEY, PROFILE_KEY, QUEUE_MAX, LEADERBOARD_SIZE,
} from '../src/accounts.js';
import { accountButtonHtml, signInDialogHtml, accountDialogHtml, saveStatusHtml, progressHtml, leaderboardHtml, sparklineSvg, escapeHtml } from '../src/accountview.js';
import { t, LANGS } from '../src/i18n.js';
import { summarizeShift } from '../src/shift.js';
import { scoreGuess } from '../src/triage.js';
import { NIGHT_SIZE } from '../src/night.js';
import { CASES } from '../src/cases.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const html = read('index.html');
const app = read('src/app.js');
const sql = read('supabase/migrations/0001_accounts.sql');

const CONFIG = { enabled: true, url: 'https://example-project.supabase.co', key: 'sb_publishable_test_key' };
const EMPTY = supabaseConfig({ url: '', key: '' });
const USER = '6f1d2c3b-4a5e-4f60-8a71-92b3c4d5e6f7';
const OTHER = '0a1b2c3d-4e5f-4a6b-8c7d-8e9fa0b1c2d3';
const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);
const CJK = /[\u4e00-\u9fff]/;

// ---- test doubles ----
function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), map: m };
}

// A fetch that records every call and answers from `routes`: [method, url regex, handler or response].
function mockFetch(routes = []) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const call = { url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body ? JSON.parse(init.body) : undefined };
    calls.push(call);
    const route = routes.find(([m, re]) => m === call.method && re.test(url));
    if (!route) throw new TypeError('offline');
    const r = typeof route[2] === 'function' ? route[2](call, calls) : route[2];
    if (r === 'offline') throw new TypeError('offline');
    return { ok: r.status >= 200 && r.status < 300, status: r.status, headers: new Map(), text: async () => (r.body === undefined ? '' : JSON.stringify(r.body)) };
  };
  return { fetch, calls };
}

const tokenResponse = (extra = {}) => ({
  access_token: 'access-1', refresh_token: 'refresh-1', token_type: 'bearer', expires_in: 3600, expires_at: NOW / 1000 + 3600,
  user: { id: USER, email: 'player@example.com', user_metadata: { full_name: 'Real Name' } }, ...extra,
});
const storedSession = (over = {}) => JSON.stringify({ access_token: 'access-1', refresh_token: 'refresh-1', expires_at: NOW / 1000 + 3600, user_id: USER, provider: 'github', ...over });

// A finished night from real cases and guesses.
function night(guesses) {
  const cases = CASES.filter((c) => !c.storyline).slice(0, NIGHT_SIZE);
  return summarizeShift(cases.map((c, i) => ({ case: c, guess: guesses[i] ?? c.expectedLevel, level: c.expectedLevel })));
}
const perfect = () => night([]);

// ---- config ----

test('src/config.js holds the project URL and a publishable (never secret) key', () => {
  assert.equal(SUPABASE_URL, 'https://agnjopogyzhityagifwb.supabase.co');
  assert.match(SUPABASE_ANON_KEY, /^sb_publishable_/);
  assert.doesNotMatch(read('src/config.js'), /['"](?:sb_secret_|eyJ)/, 'no secret key or JWT-style service key');
  const c = supabaseConfig();
  assert.deepEqual(c, { enabled: true, url: SUPABASE_URL, key: SUPABASE_ANON_KEY });
});

test('the test-only override disables accounts when either value is empty or the URL is unsafe', () => {
  for (const o of [{ url: '', key: '' }, { url: SUPABASE_URL, key: '' }, { url: '', key: 'sb_publishable_x' }, { url: 'http://evil.example', key: 'k' }, { url: 'not a url', key: 'k' }, {}]) {
    assert.equal(supabaseConfig(o).enabled, false, JSON.stringify(o));
    assert.equal(supabaseConfig(o).url, '');
  }
  assert.equal(supabaseConfig({ url: 'http://localhost:54321/', key: 'k' }).url, 'http://localhost:54321');
});

// ---- OAuth URL builder ----

test('authorizeUrl builds the Supabase authorize URL with PKCE for Google and GitHub only', () => {
  for (const provider of ['google', 'github']) {
    const u = new URL(authorizeUrl(CONFIG, { provider, redirectTo: 'https://grimm-triage.vercel.app/?lang=zh', challenge: 'abc' }));
    assert.equal(u.origin + u.pathname, `${CONFIG.url}/auth/v1/authorize`);
    assert.equal(u.searchParams.get('provider'), provider);
    assert.equal(u.searchParams.get('redirect_to'), 'https://grimm-triage.vercel.app/?lang=zh');
    assert.equal(u.searchParams.get('code_challenge'), 'abc');
    assert.equal(u.searchParams.get('code_challenge_method'), 's256');
  }
  for (const provider of ['apple', 'email', '', undefined]) assert.throws(() => authorizeUrl(CONFIG, { provider, redirectTo: 'https://x/', challenge: 'a' }), RangeError);
});

test('redirectTarget returns to the same page without sign-in parameters or hash', () => {
  assert.equal(redirectTarget('https://grimm-triage.vercel.app/'), 'https://grimm-triage.vercel.app/');
  assert.equal(redirectTarget('http://localhost:3000/?code=abc123456&x=1#frag'), 'http://localhost:3000/?x=1');
  assert.equal(redirectTarget('https://grimm-triage-git-feat.vercel.app/index.html?error=access_denied&error_description=no'), 'https://grimm-triage-git-feat.vercel.app/index.html');
});

test('beginSignIn stores a PKCE verifier and sends its S256 challenge', async () => {
  const storage = memoryStorage();
  const { fetch, calls } = mockFetch();
  const client = createClient({ config: CONFIG, fetch, storage, crypto: webcrypto, now: () => NOW });
  const url = new URL(await client.beginSignIn('github', 'https://grimm-triage.vercel.app/?seed=3&code=old12345'));
  const pending = JSON.parse(storage.getItem(PKCE_KEY));
  assert.equal(pending.provider, 'github');
  assert.match(pending.verifier, /^[A-Za-z0-9_-]{43,128}$/);
  const expected = createHash('sha256').update(pending.verifier).digest('base64url');
  assert.equal(url.searchParams.get('code_challenge'), expected);
  assert.equal(await challengeFor(pending.verifier, webcrypto), expected);
  assert.equal(url.searchParams.get('redirect_to'), 'https://grimm-triage.vercel.app/?seed=3');
  assert.deepEqual(calls, [], 'building the URL sends nothing');
  await assert.rejects(client.beginSignIn('apple', 'https://x/'), RangeError);
});

// ---- session from the redirect ----

test('parseRedirect reads a code or an error, and ignores ordinary URLs', () => {
  assert.deepEqual(parseRedirect('https://a.app/?code=0b4c1d2e-3f40-4a5b'), { code: '0b4c1d2e-3f40-4a5b' });
  assert.deepEqual(parseRedirect('https://a.app/?error=access_denied&error_description=User+denied'), { error: 'access_denied', description: 'User denied' });
  assert.deepEqual(parseRedirect('https://a.app/#error=server_error&error_description=x'), { error: 'server_error', description: 'x' });
  for (const href of ['https://a.app/', 'https://a.app/?seed=87', 'https://a.app/?code=<script>', 'https://a.app/?code=short', 'nonsense']) {
    assert.equal(parseRedirect(href), null, href);
  }
});

test('parseSession keeps only tokens, expiry, user id and provider (never the email)', () => {
  const s = parseSession(tokenResponse(), NOW, 'google');
  assert.deepEqual(s, { access_token: 'access-1', refresh_token: 'refresh-1', expires_at: NOW / 1000 + 3600, user_id: USER, provider: 'google' });
  assert.doesNotMatch(JSON.stringify(s), /email|Real Name/);
  assert.equal(parseSession(tokenResponse({ expires_at: undefined }), NOW).expires_at, NOW / 1000 + 3600, 'expires_in fallback');
  for (const bad of [null, {}, tokenResponse({ access_token: '' }), tokenResponse({ refresh_token: 5 }), tokenResponse({ user: { id: 'x' } }), tokenResponse({ expires_at: undefined, expires_in: undefined })]) {
    assert.equal(parseSession(bad, NOW), null);
  }
  assert.equal(readSession('not json'), null);
  assert.deepEqual(readSession(storedSession()), parseSession({ ...JSON.parse(storedSession()), user: { id: USER } }, 0, 'github'));
});

test('completeSignIn exchanges the code and verifier, stores the session and forgets the verifier', async () => {
  const storage = memoryStorage({ [PKCE_KEY]: JSON.stringify({ verifier: 'v'.repeat(64), provider: 'google', at: NOW - 1000 }) });
  const { fetch, calls } = mockFetch([['POST', /\/auth\/v1\/token\?grant_type=pkce$/, { status: 200, body: tokenResponse() }]]);
  const client = createClient({ config: CONFIG, fetch, storage, now: () => NOW });
  assert.deepEqual(await client.completeSignIn('https://grimm-triage.vercel.app/?code=abcdef123456'), { provider: 'google' });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].body, { auth_code: 'abcdef123456', code_verifier: 'v'.repeat(64) });
  assert.equal(calls[0].headers.apikey, CONFIG.key);
  assert.equal(calls[0].headers.Authorization, `Bearer ${CONFIG.key}`, 'no session yet: Bearer is the publishable key');
  assert.equal(storage.getItem(PKCE_KEY), null);
  const saved = JSON.parse(storage.getItem(SESSION_KEY));
  assert.equal(saved.user_id, USER);
  assert.doesNotMatch(storage.getItem(SESSION_KEY), /email/);
  assert.equal(client.userId, USER);
});

test('completeSignIn reports errors, a missing or stale verifier, and ignores ordinary loads', async () => {
  const none = mockFetch();
  const client = createClient({ config: CONFIG, fetch: none.fetch, storage: memoryStorage(), now: () => NOW });
  assert.equal(await client.completeSignIn('https://a.app/'), null);
  assert.deepEqual(await client.completeSignIn('https://a.app/?code=abcdef123456'), { error: 'no_pending_sign_in' });
  assert.equal((await client.completeSignIn('https://a.app/?error=access_denied')).error, 'access_denied');
  const stale = createClient({ config: CONFIG, fetch: none.fetch, storage: memoryStorage({ [PKCE_KEY]: JSON.stringify({ verifier: 'v'.repeat(64), provider: 'github', at: NOW - PKCE_MAX_AGE_MS - 1 }) }), now: () => NOW });
  assert.deepEqual(await stale.completeSignIn('https://a.app/?code=abcdef123456'), { error: 'no_pending_sign_in' });
  assert.deepEqual(none.calls, []);
  const rejected = mockFetch([['POST', /grant_type=pkce/, { status: 400, body: { error: 'invalid_grant' } }]]);
  const c2 = createClient({ config: CONFIG, fetch: rejected.fetch, storage: memoryStorage({ [PKCE_KEY]: JSON.stringify({ verifier: 'v'.repeat(64), provider: 'github', at: NOW }) }), now: () => NOW });
  assert.deepEqual(await c2.completeSignIn('https://a.app/?code=abcdef123456'), { error: 'exchange_failed' });
  assert.equal(c2.session, null);
});

// ---- headers and refresh timing ----

test('headers: apikey always; Bearer is the user token with a session, else the publishable key', () => {
  const s = parseSession(tokenResponse(), NOW);
  assert.deepEqual(authHeaders(CONFIG, null), { apikey: CONFIG.key, Authorization: `Bearer ${CONFIG.key}`, 'Content-Type': 'application/json' });
  assert.equal(authHeaders(CONFIG, s).Authorization, 'Bearer access-1');
  assert.equal(authHeaders(CONFIG, s).apikey, CONFIG.key);
});

test('refreshDelay: refresh 60 s before expiry, immediately when already due', () => {
  const s = { expires_at: NOW / 1000 + 3600 };
  assert.equal(REFRESH_MARGIN_S, 60);
  assert.equal(refreshDelay(s, NOW), (3600 - 60) * 1000);
  assert.equal(refreshDelay(s, NOW + 3540 * 1000), 0);
  assert.equal(refreshDelay(s, NOW + 7200 * 1000), 0);
  assert.equal(refreshDelay(null, NOW), null);
  assert.equal(needsRefresh(s, NOW), false);
  assert.equal(needsRefresh(s, NOW + 3541 * 1000), true);
  assert.equal(needsRefresh(null, NOW), false);
});

test('an expiring session is refreshed before a request, once even when asked twice', async () => {
  let clock = NOW + 3590 * 1000; // 10 s before expiry
  const { fetch, calls } = mockFetch([
    ['POST', /grant_type=refresh_token/, { status: 200, body: tokenResponse({ access_token: 'access-2', refresh_token: 'refresh-2', expires_at: NOW / 1000 + 7200 }) }],
    ['GET', /\/rest\/v1\/profiles/, { status: 200, body: [] }],
  ]);
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const client = createClient({ config: CONFIG, fetch, storage, now: () => clock });
  await Promise.all([client.refresh(), client.refresh()]);
  assert.equal(calls.filter((c) => /refresh_token/.test(c.url)).length, 1, 'single-flight refresh');
  assert.deepEqual(calls[0].body, { refresh_token: 'refresh-1' });
  assert.equal(client.session.access_token, 'access-2');
  assert.equal(JSON.parse(storage.getItem(SESSION_KEY)).refresh_token, 'refresh-2');
  clock = NOW + 7190 * 1000;
  calls.length = 0;
  await client.rest('profiles?select=display_name');
  assert.deepEqual(calls.map((c) => c.method + ' ' + new URL(c.url).pathname), ['POST /auth/v1/token', 'GET /rest/v1/profiles']);
  assert.equal(calls[1].headers.Authorization, 'Bearer access-2');
});

test('a rejected refresh token ends the session; a network failure keeps it', async () => {
  const clock = () => NOW + 3600 * 1000;
  const rejected = mockFetch([['POST', /grant_type=refresh_token/, { status: 400, body: { error: 'invalid_grant' } }]]);
  const a = createClient({ config: CONFIG, fetch: rejected.fetch, storage: memoryStorage({ [SESSION_KEY]: storedSession() }), now: clock });
  assert.equal(await a.refresh(), false);
  assert.equal(a.session, null);
  const offline = mockFetch();
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const b = createClient({ config: CONFIG, fetch: offline.fetch, storage, now: clock });
  assert.equal(await b.refresh(), false);
  assert.equal(b.session.user_id, USER);
  assert.ok(storage.getItem(SESSION_KEY));
});

test('a 401 refreshes once and retries the request once', async () => {
  let n = 0;
  const { fetch, calls } = mockFetch([
    ['GET', /\/rest\/v1\/x/, () => (++n === 1 ? { status: 401, body: {} } : { status: 200, body: [1] })],
    ['POST', /grant_type=refresh_token/, { status: 200, body: tokenResponse({ access_token: 'access-2' }) }],
  ]);
  const client = createClient({ config: CONFIG, fetch, storage: memoryStorage({ [SESSION_KEY]: storedSession() }), now: () => NOW });
  const res = await client.rest('x');
  assert.equal(res.ok, true);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].headers.Authorization, 'Bearer access-2');
});

test('sign out clears the session even when offline, and only sends the user token to logout', async () => {
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const { fetch, calls } = mockFetch();
  const client = createClient({ config: CONFIG, fetch, storage, now: () => NOW });
  await client.signOut();
  assert.equal(client.session, null);
  assert.equal(storage.getItem(SESSION_KEY), null);
  assert.match(calls[0].url, /\/auth\/v1\/logout\?scope=local$/);
  assert.equal(calls[0].headers.Authorization, 'Bearer access-1');
});

// ---- display names ----

test('display names: 2 to 20 letters, digits, spaces or hyphens in any script, trimmed', () => {
  const ok = ['Night Nurse 4821', '夜班护士 4821', '夜班', 'Zoë-Ann', 'Dr Ölçek', 'Ночная сестра', 'ممرضة الليل', 'Ab', 'a'.repeat(20), '  Trimmed Name  ', 'Ana-María 7', 'ナース 3'];
  for (const name of ok) {
    const v = validateDisplayName(name);
    assert.ok(v.ok, `${name} should be accepted`);
    assert.equal(v.value, name.trim());
  }
  const bad = [
    ['', 'length'], [' ', 'length'], ['a', 'length'], ['夜', 'length'], ['a'.repeat(21), 'length'], ['夜'.repeat(21), 'length'],
    ['<script>', 'chars'], ['Night_Nurse', 'chars'], ['night.nurse', 'chars'], ['👻👻', 'chars'], ['Nurse 👻', 'chars'],
    ['Tab\tName', 'chars'], ['New\nLine', 'chars'], ["O'Brien", 'chars'], ['a&b', 'chars'], ['@admin', 'chars'], ['Zero\u200bWidth', 'chars'],
  ];
  for (const [name, error] of bad) assert.deepEqual(validateDisplayName(name), { ok: false, error }, JSON.stringify(name));
  assert.deepEqual(validateDisplayName(null), { ok: false, error: 'length' });
});

test('generated nicknames are always valid, in English and Chinese', () => {
  for (const lang of LANGS) {
    for (const title of NICKNAME_TITLES[lang]) {
      for (const r of [0, 0.5, 0.999999]) {
        const name = generateNickname(() => r, lang);
        assert.ok(validateDisplayName(name).ok, name);
        assert.match(name, /^.+ \d{4}$/);
      }
      assert.ok(validateDisplayName(`${title} 9999`).ok, title);
    }
  }
  assert.match(generateNickname(() => 0, 'zh-CN'), CJK);
  assert.equal(generateNickname(() => 0, 'en'), 'Night Nurse 1000');
});

// ---- result payload ----

test('the result payload has only the allowed fields: no cases, vitals, names or free text', () => {
  const summary = night([2, 3]); // two mistakes, so the summary carries missed cases with vitals
  assert.ok(summary.missed.length > 0 && summary.missed[0].patient);
  const row = resultPayload(summary, { storyline: true, playedAt: new Date(NOW) });
  assert.deepEqual(Object.keys(row), RESULT_FIELDS);
  assert.deepEqual(RESULT_FIELDS, ['score', 'correct', 'under_triage', 'over_triage', 'storyline', 'played_at']);
  assert.equal(row.score, summary.score);
  assert.equal(row.correct + row.under_triage + row.over_triage, NIGHT_SIZE);
  assert.equal(row.played_at, '2026-11-27T12:00:00.000Z');
  assert.doesNotMatch(JSON.stringify(row), /"(?:patient|hr|rr|sbp|spo2|tempC|name|story|teachingPoint|emoji|id|missed)"/);
});

test('seeded nights and partial or impossible summaries are never saved', () => {
  assert.equal(resultPayload(perfect(), { seeded: true }), null);
  assert.equal(resultPayload({ ...perfect(), score: NIGHT_MAX_SCORE + 25 }), null);
  assert.equal(resultPayload({ ...perfect(), score: -1 }), null);
  assert.equal(resultPayload({ ...perfect(), correct: 14 }), null, 'not a full night');
  assert.equal(resultPayload(null), null);
  assert.equal(NIGHT_MAX_SCORE, 1500);
});

test('saveNight: seeded nights send nothing and are not kept on the device', async () => {
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const { fetch, calls } = mockFetch();
  const service = createAccountService({ config: CONFIG, fetch, storage, now: () => NOW });
  assert.deepEqual(await service.saveNight(perfect(), { seeded: true }), { saved: 'seeded' });
  assert.deepEqual(calls, []);
  assert.equal(storage.getItem(HISTORY_KEY), null);
  assert.equal(storage.getItem(QUEUE_KEY), null);
});

test('app.js saves only unseeded nights, after the shift report is on screen', () => {
  assert.match(app, /accounts\.saveNight\(r, \{ storyline: Boolean\(storylineReport\(answers\)\), seeded: seed !== null \}\)\.then\(/);
  assert.match(app, /if \(firstShow\) saveNight\(r\);/);
  assert.doesNotMatch(app, /await accounts\.saveNight/, 'the report never waits for saving');
});

// ---- signed-in flow with a mocked Supabase ----

function supabase({ profile = 'Night Nurse 4821', results = 'ok', progress, board } = {}) {
  const posted = [];
  const routes = [
    ['GET', /\/rest\/v1\/profiles\?select=display_name&id=eq\./, () => ({ status: 200, body: profile ? [{ display_name: profile }] : [] })],
    ['POST', /\/rest\/v1\/profiles$/, (c) => { profile = c.body.display_name; return { status: 201 }; }],
    ['PATCH', /\/rest\/v1\/profiles\?id=eq\./, (c) => (validateDisplayName(c.body.display_name).ok ? { status: 204 } : { status: 400, body: { code: '23514' } })],
    ['POST', /\/rest\/v1\/results$/, (c) => {
      const r = typeof results === 'function' ? results(c) : results;
      if (r === 'ok') { posted.push(c.body); return { status: 201 }; }
      return r;
    }],
    ['POST', /\/rest\/v1\/rpc\/my_progress$/, () => progress ?? { status: 200, body: [] }],
    ['POST', /\/rest\/v1\/rpc\/leaderboard$/, () => board ?? { status: 200, body: [] }],
    ['POST', /\/rest\/v1\/rpc\/delete_account$/, { status: 204 }],
  ];
  return { ...mockFetch(routes), posted };
}

test('first sign-in creates a profile with a generated nickname; the header shows the name, never the email', async () => {
  const sb = supabase({ profile: null });
  const storage = memoryStorage({ [PKCE_KEY]: JSON.stringify({ verifier: 'v'.repeat(64), provider: 'google', at: NOW }) });
  sb.calls.length = 0;
  const routes = mockFetch([['POST', /grant_type=pkce/, { status: 200, body: tokenResponse() }]]);
  const fetch = async (url, init) => (/grant_type=pkce/.test(url) ? routes.fetch(url, init) : sb.fetch(url, init));
  const service = createAccountService({ config: CONFIG, fetch, storage, random: () => 0, now: () => NOW });
  const res = await service.init('https://grimm-triage.vercel.app/?code=abcdef123456', 'zh-CN');
  assert.equal(res.signedIn, true);
  assert.deepEqual(res.signIn, { provider: 'google' });
  const created = sb.calls.find((c) => c.method === 'POST' && /profiles$/.test(c.url));
  assert.deepEqual(created.body, { id: USER, display_name: '夜班护士 1000' });
  assert.equal(service.state.profile.displayName, '夜班护士 1000');
  const button = accountButtonHtml((k, v) => t(k, 'en', v), { session: true, name: service.state.profile.displayName });
  assert.match(button, /夜班护士 1000/);
  assert.doesNotMatch(button + JSON.stringify([...storage.map.values()]), /player@example\.com|Real Name/);
});

test('a signed-in night is saved with only the allowed fields', async () => {
  const sb = supabase();
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage, now: () => NOW });
  await service.init('https://grimm-triage.vercel.app/');
  const res = await service.saveNight(night([3]), { storyline: true });
  assert.equal(res.saved, 'saved');
  assert.equal(sb.posted.length, 1);
  assert.deepEqual(Object.keys(sb.posted[0]), RESULT_FIELDS);
  const post = sb.calls.find((c) => /\/results$/.test(c.url));
  assert.equal(post.headers.Authorization, 'Bearer access-1');
  assert.equal(post.headers.Prefer, 'return=minimal');
  assert.equal(storage.getItem(QUEUE_KEY), null, 'nothing left in the queue');
});

// ---- offline retry queue ----

test('offline: the result is kept on the device and sent on the next load', async () => {
  const storage = memoryStorage({ [SESSION_KEY]: storedSession(), [PROFILE_KEY]: JSON.stringify({ userId: USER, displayName: 'Night Nurse 4821' }) });
  const offline = mockFetch();
  const first = createAccountService({ config: CONFIG, fetch: offline.fetch, storage, now: () => NOW });
  const boot = await first.init('https://grimm-triage.vercel.app/');
  assert.equal(first.state.status, 'offline');
  assert.equal(boot.signedIn, true, 'still signed in on this device with the cached name');
  const res = await first.saveNight(perfect());
  assert.equal(res.saved, 'queued');
  const queue = parseQueue(storage.getItem(QUEUE_KEY));
  assert.equal(queue.length, 1);
  assert.equal(queue[0].userId, USER);
  assert.deepEqual(Object.keys(queue[0].row), RESULT_FIELDS);

  const sb = supabase();
  const second = createAccountService({ config: CONFIG, fetch: sb.fetch, storage, now: () => NOW + 60_000 });
  const again = await second.init('https://grimm-triage.vercel.app/');
  assert.deepEqual({ sent: again.flushed.sent, left: again.flushed.left }, { sent: 1, left: 0 });
  assert.equal(sb.posted[0].played_at, new Date(NOW).toISOString(), 'the original time is kept');
  assert.equal(storage.getItem(QUEUE_KEY), null);
});

test('an expired session (401 that cannot be refreshed) keeps the result queued', async () => {
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const sb = supabase({ results: { status: 401, body: {} } });
  const service = createAccountService({ config: CONFIG, fetch: async (url, init) => (/refresh_token/.test(url) ? { ok: false, status: 0, text: async () => '' } : sb.fetch(url, init)), storage, now: () => NOW });
  await service.init('https://a.app/');
  assert.equal((await service.saveNight(perfect())).saved, 'queued');
  assert.equal(parseQueue(storage.getItem(QUEUE_KEY)).length, 1);
});

test('the queue keeps other accounts\' results, stops at a retryable failure, and drops rows the database rejects', async () => {
  const row = resultPayload(perfect(), { playedAt: new Date(NOW) });
  let q = enqueue([], OTHER, row);
  q = enqueue(q, USER, { ...row, score: 1450 });
  q = enqueue(q, USER, row);
  const storage = memoryStorage({ [SESSION_KEY]: storedSession(), [QUEUE_KEY]: JSON.stringify(q) });
  const sb = supabase({ results: (c) => (c.body.score === 1450 ? { status: 400, body: { code: '23514', message: 'check violation' } } : 'ok') });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage, now: () => NOW });
  const res = await service.init('https://a.app/');
  assert.deepEqual({ sent: res.flushed.sent, dropped: res.flushed.dropped, left: res.flushed.left }, { sent: 1, dropped: 1, left: 0 });
  const left = parseQueue(storage.getItem(QUEUE_KEY));
  assert.deepEqual(left.map((e) => e.userId), [OTHER], 'the other player\'s result waits for them');

  // The daily limit is retried later, not dropped.
  const limited = supabase({ results: { status: 400, body: { code: 'P0001', message: 'daily_result_limit' } } });
  const s2 = createAccountService({ config: CONFIG, fetch: limited.fetch, storage: memoryStorage({ [SESSION_KEY]: storedSession() }), now: () => NOW });
  await s2.init('https://a.app/');
  assert.equal((await s2.saveNight(perfect())).saved, 'queued');
});

test('failureAction and parseQueue', () => {
  for (const status of [0, 401, 408, 429, 500, 503]) assert.equal(failureAction({ status }), 'retry', String(status));
  for (const status of [400, 403, 409, 422]) assert.equal(failureAction({ status, data: { code: '23514' } }), 'drop', String(status));
  assert.equal(failureAction({ status: 400, data: { message: 'daily_result_limit' } }), 'retry');
  assert.equal(failureAction(null), 'retry');
  const row = resultPayload(perfect(), { playedAt: new Date(NOW) });
  const stored = JSON.stringify([{ userId: USER, row: { ...row, hr: 140, name: 'x' } }, { userId: USER, row: { ...row, score: 99999 } }, 'junk', null, { row }]);
  const parsed = parseQueue(stored);
  assert.equal(parsed.length, 1);
  assert.deepEqual(Object.keys(parsed[0].row), RESULT_FIELDS, 'extra fields are stripped');
  assert.deepEqual(parseQueue('not json'), []);
  let q = [];
  for (let i = 0; i < QUEUE_MAX + 5; i += 1) q = enqueue(q, USER, row);
  assert.equal(q.length, QUEUE_MAX);
});

// ---- empty config: no account UI and no request ----

test('with empty config the service is inert and nothing goes to Supabase', async () => {
  assert.equal(EMPTY.enabled, false);
  const { fetch, calls } = mockFetch([['GET', /./, { status: 200, body: [] }], ['POST', /./, { status: 200, body: [] }]]);
  const storage = memoryStorage({ [SESSION_KEY]: storedSession(), [QUEUE_KEY]: JSON.stringify(enqueue([], USER, resultPayload(perfect(), { playedAt: new Date(NOW) }))) });
  const before = JSON.stringify([...storage.map]);
  const service = createAccountService({ config: EMPTY, fetch, storage, now: () => NOW });
  assert.equal(service.enabled, false);
  assert.equal(service.signedIn, false);
  for (const [name, args] of [['init', ['https://a.app/?code=abcdef123456']], ['signIn', ['google', 'https://a.app/']], ['signOut', []], ['saveNight', [perfect()]], ['flushQueue', []], ['progress', []], ['leaderboard', []], ['rename', ['Night Nurse 1']], ['deleteAccount', []], ['refresh', []]]) {
    assert.equal(await service[name](...args), null, name);
  }
  assert.equal(service.refreshDelay(), null);
  assert.deepEqual(calls, [], 'no request at all');
  assert.equal(JSON.stringify([...storage.map]), before, 'storage untouched');
});

test('with empty config no account UI renders: every account element in index.html starts hidden', () => {
  const tags = [...html.matchAll(/<[a-z]+\b[^>]*data-account-feature[^>]*>/g)].map((m) => m[0]);
  assert.ok(tags.length >= 5, 'slot, notice, two nav buttons and the footer line');
  for (const tag of tags) assert.match(tag, /\shidden(\s|>)/, `${tag} must start hidden`);
  for (const id of ['progress', 'board']) assert.match(html, new RegExp(`<section id="${id}"[^>]*\\shidden>`));
  assert.match(html, /<dialog id="accountDialog"[^>]*><\/dialog>/, 'the dialog is empty and closed');
  assert.match(html, /<span id="accountSlot"[^>]*><\/span>/, 'no account button in the markup');
  assert.doesNotMatch(html, /(?:src|href)="[^"]*supabase/i, 'index.html loads nothing from Supabase');
});

test('app.js mounts accounts only when the config is set, and guards every account render', () => {
  assert.match(app, /const accounts = createAccountService\(\{ config: supabaseConfig\(\) \}\);/);
  assert.equal([...app.matchAll(/\bmountAccounts\(\);/g)].length, 1, 'called once');
  assert.match(app, /if \(accounts\.enabled\) mountAccounts\(\);/);
  const unhide = [...app.matchAll(/querySelectorAll\('\[data-account-feature\]'\)/g)];
  assert.equal(unhide.length, 1, 'one place unhides account elements');
  const mount = app.indexOf('async function mountAccounts()');
  assert.ok(unhide[0].index > mount && unhide[0].index < app.indexOf('\n}\n', mount), 'and it is inside mountAccounts()');
  assert.match(app, /if \(accounts\.enabled\) renderAccounts\(\);/);
  assert.match(app, /\$\{accounts\.enabled \? saveStatusHtml\(tr, saveState\) : ''\}/);
  assert.match(app, /async function loadProgress\(\) \{\n  if \(!accounts\.enabled\) return;/);
  assert.match(app, /async function loadBoard\(\) \{\n  if \(!accounts\.enabled\) return;/);
  assert.match(app, /function saveNight\(r\) \{\n  if \(!accounts\.enabled\) return;/);
});

// ---- rendering in both languages ----

const trFor = (lang) => (key, vars) => t(key, lang, vars);
const renderedKeys = (s) => [...s.matchAll(/\b(account|save|progress|board)\.[\w.]+/g)].map((m) => m[0]);

test('leaderboard renders the top 50 and the player\'s own rank outside it, in English and Chinese', async () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({ rank: i + 1, display_name: i === 3 ? '<img src=x onerror=alert(1)>' : `Ghoul ${i}`, best_score: 1500 - i * 25, nights_played: 3, is_me: false }));
  rows.push({ rank: 73, display_name: '夜班护士 4821', best_score: 300, nights_played: 12, is_me: true });
  const sb = supabase({ board: { status: 200, body: rows } });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage: memoryStorage(), now: () => NOW });
  const model = await service.leaderboard();
  assert.equal(sb.calls.length, 1);
  assert.equal(sb.calls[0].headers.Authorization, `Bearer ${CONFIG.key}`, 'visible to signed-out players');
  assert.equal(model.top.length, LEADERBOARD_SIZE);
  assert.deepEqual(model.me, { rank: 73, name: '夜班护士 4821', best: 300, nights: 12, isMe: true });
  for (const lang of LANGS) {
    const out = leaderboardHtml(trFor(lang), model, { signedIn: true });
    assert.deepEqual(renderedKeys(out), [], `${lang}: untranslated key`);
    assert.equal((out.match(/<tr>/g) ?? []).length, 51, 'a header row and 50 player rows');
    assert.match(out, /<th scope="col">/);
    assert.match(out, /<caption>/);
    assert.ok(out.includes(t('board.yourRankLine', lang, { rank: 73, best: 300, nights: 12 })));
    assert.doesNotMatch(out, /<img/, 'display names are escaped');
    assert.ok(out.includes('&lt;img src=x onerror=alert(1)&gt;'));
    if (lang === 'zh-CN') assert.match(out, /排行榜/);
  }
  const inTop = leaderboardModel([{ rank: 1, display_name: 'Me', best_score: 1500, nights_played: 1, is_me: true }]);
  assert.equal(inTop.me, null);
  assert.match(leaderboardHtml(trFor('en'), inTop), /class="me"/);
  assert.match(leaderboardHtml(trFor('zh-CN'), { top: [], me: null }), /还没有成绩/);
  const failed = createAccountService({ config: CONFIG, fetch: mockFetch().fetch, storage: memoryStorage(), now: () => NOW });
  const err = await failed.leaderboard();
  assert.deepEqual(err, { error: true });
  for (const lang of LANGS) assert.match(leaderboardHtml(trFor(lang), err), /role="alert"[\s\S]*data-board="retry"/);
});

test('progress renders account stats and the last 10 scores as an inline SVG, in English and Chinese', async () => {
  const sb = supabase({ progress: { status: 200, body: [{ nights_played: 12, best_score: 1450, average_score: 1012.5, under_rate: 0.0667, recent_scores: [900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1450] }] } });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage: memoryStorage({ [SESSION_KEY]: storedSession() }), now: () => NOW });
  await service.init('https://a.app/');
  const p = await service.progress();
  assert.equal(p.source, 'account');
  assert.deepEqual(p.stats, { nights: 12, best: 1450, average: 1013, underRate: 0.0667, recent: [900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1450] });
  for (const lang of LANGS) {
    const out = progressHtml(trFor(lang), p);
    assert.deepEqual(renderedKeys(out), [], `${lang}: untranslated key`);
    assert.match(out, /<svg class="sparkline"[^>]*role="img"[^>]*aria-label="[^"]*1450"/);
    assert.equal((out.match(/<circle /g) ?? []).length, 10);
    assert.match(out, />7%</);
    assert.ok(out.includes(t('progress.accountNote', lang)));
    assert.doesNotMatch(out, /animation|transition|<script|https?:/);
  }
  assert.match(progressHtml(trFor('zh-CN'), p), /最高分/);
});

test('guests see the same panel from this device\'s history, with the sign-in note', async () => {
  const storage = memoryStorage();
  const service = createAccountService({ config: CONFIG, fetch: mockFetch().fetch, storage, now: () => NOW });
  assert.equal((await service.saveNight(night([3, 4]))).saved, 'guest');
  assert.equal((await service.saveNight(perfect())).saved, 'guest');
  const p = await service.progress();
  assert.equal(p.source, 'device');
  assert.equal(p.stats.nights, 2);
  assert.equal(p.stats.best, 1500);
  assert.deepEqual(p.stats.recent, [night([3, 4]).score, 1500]);
  for (const lang of LANGS) {
    const out = progressHtml(trFor(lang), p);
    assert.ok(out.includes(t('progress.deviceNote', lang)));
    assert.deepEqual(renderedKeys(out), []);
  }
  for (const lang of LANGS) assert.ok(progressHtml(trFor(lang), { source: 'device', stats: progressStats([]) }).includes(t('progress.none', lang)));
});

test('progressStats and progressFromServer agree on the shape', () => {
  const rows = [
    { score: 1000, correct: 9, under_triage: 3, over_triage: 3, storyline: false, played_at: '2026-11-02T00:00:00Z' },
    { score: 1500, correct: 15, under_triage: 0, over_triage: 0, storyline: true, played_at: '2026-11-03T00:00:00Z' },
    { score: 500, correct: 3, under_triage: 6, over_triage: 6, storyline: false, played_at: '2026-11-01T00:00:00Z' },
  ];
  assert.deepEqual(progressStats(rows), { nights: 3, best: 1500, average: 1000, underRate: 9 / 45, recent: [500, 1000, 1500] });
  assert.deepEqual(progressFromServer([]), progressStats([]));
  assert.deepEqual(Object.keys(progressFromServer([{ nights_played: 1, best_score: 1, average_score: 1, under_rate: 0, recent_scores: [1] }])), Object.keys(progressStats(rows)));
});

test('dialogs, buttons and the save line render in both languages without raw keys', () => {
  for (const lang of LANGS) {
    const tr = trFor(lang);
    const parts = [
      accountButtonHtml(tr), accountButtonHtml(tr, { session: true, name: 'A<b>' }), accountButtonHtml(tr, { session: true }),
      signInDialogHtml(tr), signInDialogHtml(tr, { error: true, note: tr('account.deleted') }),
      accountDialogHtml(tr, { name: 'Night Nurse 1', confirmDelete: true, note: tr('account.nameSaved'), offline: true }), accountDialogHtml(tr, { name: '夜班' }),
      ...['saving', 'saved', 'queued', 'rejected', 'guest', 'seeded'].map((s) => saveStatusHtml(tr, s)),
    ];
    for (const p of parts) assert.deepEqual(renderedKeys(p), [], `${lang}: ${p.slice(0, 80)}`);
    const signIn = signInDialogHtml(tr);
    assert.deepEqual([...signIn.matchAll(/data-provider="(\w+)"/g)].map((m) => m[1]), ['google', 'github'], 'Google and GitHub only');
    assert.doesNotMatch(signIn, /apple|password|email"/i);
    for (const [tag] of parts.join('').matchAll(/<button\b[^>]*>/g)) assert.match(tag, /type="(button|submit)"/, tag);
    assert.doesNotMatch(accountButtonHtml(tr, { session: true, name: 'A<b>' }), /<b>/);
  }
  assert.equal(saveStatusHtml(trFor('en'), 'unknown'), '');
  const confirm = accountDialogHtml(trFor('en'), { name: 'x', confirmDelete: true });
  assert.match(confirm, /data-account="delete-confirm"/);
  assert.doesNotMatch(accountDialogHtml(trFor('en'), { name: 'x' }), /delete-confirm/, 'delete needs the confirm step');
  assert.equal(escapeHtml(`<"'&>`), '&lt;&quot;&#39;&amp;&gt;');
  assert.equal(sparklineSvg(trFor('en'), []), '');
});

test('rename validates first and only sends valid names; delete calls only delete_account()', async () => {
  const sb = supabase();
  const storage = memoryStorage({ [SESSION_KEY]: storedSession(), [QUEUE_KEY]: JSON.stringify(enqueue(enqueue([], USER, resultPayload(perfect(), { playedAt: new Date(NOW) })), OTHER, resultPayload(perfect(), { playedAt: new Date(NOW) }))) });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage, now: () => NOW });
  await service.init('https://a.app/');
  sb.calls.length = 0;
  assert.deepEqual(await service.rename('<b>'), { ok: false, error: 'chars' });
  assert.deepEqual(await service.rename('x'), { ok: false, error: 'length' });
  assert.deepEqual(sb.calls, []);
  assert.deepEqual(await service.rename('  护士长 7  '), { ok: true });
  assert.deepEqual(sb.calls[0].body, { display_name: '护士长 7' });
  sb.calls.length = 0;
  assert.deepEqual(await service.deleteAccount(), { ok: true });
  assert.deepEqual(sb.calls.map((c) => [c.method, new URL(c.url).pathname, c.body]), [['POST', '/rest/v1/rpc/delete_account', {}]]);
  assert.equal(service.session, null);
  assert.equal(storage.getItem(SESSION_KEY), null);
  assert.deepEqual(parseQueue(storage.getItem(QUEUE_KEY)).map((e) => e.userId), [OTHER]);
});

test('every request goes to the configured project only', async () => {
  const sb = supabase();
  const storage = memoryStorage({ [SESSION_KEY]: storedSession() });
  const service = createAccountService({ config: CONFIG, fetch: sb.fetch, storage, now: () => NOW });
  await service.init('https://a.app/');
  await service.saveNight(perfect());
  await service.progress();
  await service.leaderboard();
  await service.rename('Night Nurse 2');
  await service.signOut();
  assert.ok(sb.calls.length >= 6);
  for (const c of sb.calls) assert.ok(c.url.startsWith(`${CONFIG.url}/`), c.url);
});

// ---- analytics, service worker ----

test('the sign-in event carries only the provider', () => {
  assert.match(app, /track\('sign-in', \{ provider: res\.signIn\.provider \}\)/);
  assert.doesNotMatch(app, /track\([^)]*(?:userId|user_id|displayName|display_name|email)/);
});

test('the service worker precaches the account modules and never handles Supabase requests', () => {
  const listeners = {};
  const opened = [];
  const self = { location: new URL('https://grimm-triage.vercel.app/sw.js'), addEventListener: (type, fn) => { listeners[type] = fn; } };
  const context = vm.createContext({ self, caches: { open: async (n) => { opened.push(n); return {}; } }, URL, Promise, Request: class {} });
  vm.runInContext(read('sw.js'), context);
  const precache = vm.runInContext('PRECACHE_URLS', context);
  for (const f of ['src/config.js', 'src/supabase.js', 'src/accounts.js', 'src/accountview.js']) assert.ok(precache.includes(f), f);
  assert.equal(vm.runInContext('CACHE_VERSION', context), 'v10');
  for (const url of [`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, `${SUPABASE_URL}/rest/v1/results`, `${SUPABASE_URL}/rest/v1/rpc/leaderboard`, `${SUPABASE_URL}/auth/v1/authorize?provider=google`]) {
    for (const method of ['GET', 'POST']) {
      let responded = false;
      listeners.fetch({ request: { method, mode: 'cors', url }, respondWith: () => { responded = true; } });
      assert.equal(responded, false, `${method} ${url}`);
    }
  }
  assert.deepEqual(opened, []);
});

// ---- the migration (static checks; it is run by hand in the Supabase SQL editor) ----

const created = [...sql.matchAll(/create table if not exists (public\.\w+)/gi)].map((m) => m[1]);

test('the migration enables row level security on every table it creates', () => {
  assert.deepEqual(created, ['public.profiles', 'public.results']);
  for (const table of created) {
    assert.match(sql, new RegExp(`alter table ${table.replace('.', '\\.')} enable row level security;`), `${table}: RLS`);
    assert.match(sql, new RegExp(`revoke all on table ${table.replace('.', '\\.')} from anon, authenticated;`), `${table}: privileges reset`);
  }
  assert.doesNotMatch(sql, /grant [^;]* on table [^;]* to [^;]*\banon\b/i, 'signed-out visitors get no table access');
  assert.doesNotMatch(sql, /disable row level security|create (or replace )?view/i);
  assert.match(sql, /^begin;$/m);
  assert.match(sql, /^commit;$/m);
});

test('the migration\'s limits match the game constants', () => {
  assert.equal(NIGHT_MAX_SCORE, 1500);
  assert.match(sql, new RegExp(`check \\(score between 0 and ${NIGHT_MAX_SCORE}\\)`));
  for (const col of ['correct', 'under_triage', 'over_triage']) assert.match(sql, new RegExp(`${col} between 0 and ${NIGHT_SIZE}\\b`));
  assert.match(sql, new RegExp(`\\) >= ${RESULTS_PER_DAY} then`));
  assert.match(sql, /char_length\(name\) between 2 and 20/);
  // The score consistency checks follow scoreGuess(): 100 exact, 50 over by one, 25 under by one.
  assert.deepEqual([scoreGuess(3, 3).points, scoreGuess(2, 3).points, scoreGuess(4, 3).points, scoreGuess(5, 3).points, scoreGuess(1, 3).points], [100, 50, 25, 0, 0]);
  assert.match(sql, /score >= 100 \* correct and score <= 100 \* correct \+ 50 \* over_triage \+ 25 \* under_triage/);
  assert.match(sql, /score % 25 = 0/);
  // Every real night passes those checks.
  for (const guesses of [[], [1, 1, 1], [5, 5, 5, 5], [2, 4, 1, 5, 3, 2, 4, 1, 5, 3, 2, 4, 1, 5, 3]]) {
    const r = resultPayload(night(guesses), { playedAt: new Date(NOW) });
    assert.ok(r.score >= 100 * r.correct && r.score <= 100 * r.correct + 50 * r.over_triage + 25 * r.under_triage && r.score % 25 === 0, JSON.stringify(r));
  }
});

test('the migration\'s functions: fixed search_path, delete_account only deletes the caller, the leaderboard exposes only public fields', () => {
  const fns = [...sql.matchAll(/create or replace function (public\.\w+)\(([^)]*)\)([\s\S]*?)\$\$/g)];
  assert.ok(fns.length >= 6);
  for (const [, name, , head] of fns) assert.match(head, /set search_path = ''/, `${name}: search_path`);
  const del = sql.match(/create or replace function public\.delete_account\(\)[\s\S]*?\n\$\$;/)[0];
  assert.match(del, /uid uuid := auth\.uid\(\);/);
  assert.match(del, /delete from auth\.users where id = uid;/);
  assert.equal([...del.matchAll(/delete from/g)].length, 3);
  assert.match(sql, /grant execute on function public\.delete_account\(\) to authenticated;/);
  const board = sql.match(/create or replace function public\.leaderboard\(\)\s*returns table \(([\s\S]*?)\)\s*language/)[1];
  assert.deepEqual(board.split(',').map((c) => c.trim().split(/\s+/)[0]), ['rank', 'display_name', 'best_score', 'nights_played', 'is_me']);
  assert.match(sql, /where k\.pos <= 50 or k\.is_me/);
  assert.match(sql, /grant execute on function public\.leaderboard\(\) to anon, authenticated;/);
  assert.match(sql, /create index if not exists results_user_score_idx on public\.results \(user_id, score desc\);/);
  assert.match(sql, /before insert on public\.results/);
  assert.match(sql, /assert public\.valid_display_name\('夜班护士 4821'\)/, 'self-test for Chinese names');
});
