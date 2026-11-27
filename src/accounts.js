// Optional accounts (task 22): display names, saved results, the offline retry queue, progress and
// the leaderboard. No DOM. The account service at the bottom talks to Supabase through
// src/supabase.js; everything above it is pure.
//
// Rules:
// - Accounts are optional. With an empty src/config.js the service is disabled: every method is a
//   no-op and nothing is ever sent.
// - A saved result is one row: score, correct, under-triaged, over-triaged, whether a storyline
//   appeared, and when the night ended. Never a case, a vital sign or free text. Seeded nights
//   (?seed=, demo recordings) are never saved.
// - A result that cannot be saved stays in localStorage and is retried on the next load. It is
//   dropped only when the database rejects it for good, and the player is told.

import { NIGHT_SIZE } from './night.js';
import { MAX_POINTS } from './shift.js';
import { createClient, safeStorage } from './supabase.js';

// The best possible night: every patient exact. The database check uses the same number (1500).
export const NIGHT_MAX_SCORE = NIGHT_SIZE * MAX_POINTS;
export const RESULTS_PER_DAY = 30;
export const LEADERBOARD_SIZE = 50;
export const RECENT_SCORES = 10;

export const QUEUE_KEY = 'grimm-triage-pending-results';
export const HISTORY_KEY = 'grimm-triage-history';
export const QUEUE_MAX = 50;
export const HISTORY_MAX = 500;

// ---- display names ----
export const NAME_MIN = 2;
export const NAME_MAX = 20;
// Letters (any script, with their combining marks), digits, spaces and hyphens.
const NAME_CHARS = /^[\p{L}\p{M}\p{Nd} -]+$/u;

export const normalizeDisplayName = (name) => String(name ?? '').normalize('NFC').trim();

// { ok: true, value } or { ok: false, error: 'length' | 'chars' }. Length counts characters
// (code points), so 夜班护士 is 4. The database applies the same rule (valid_display_name).
export function validateDisplayName(name) {
  const value = normalizeDisplayName(name);
  const length = [...value].length;
  if (length < NAME_MIN || length > NAME_MAX) return { ok: false, error: 'length' };
  if (!NAME_CHARS.test(value)) return { ok: false, error: 'chars' };
  return { ok: true, value };
}

// Spooky nicknames for a new profile, e.g. "Night Nurse 4821". Every title + " " + 4 digits is a
// valid display name (checked by the tests).
export const NICKNAME_TITLES = {
  en: ['Night Nurse', 'Crypt Porter', 'Ghoul Registrar', 'Lantern Medic', 'Midnight Intern', 'Graveyard Doc', 'Fog Paramedic', 'Bat Wing Medic'],
  'zh-CN': ['夜班护士', '墓园医生', '提灯医师', '午夜实习生', '幽灵挂号员', '守夜护工', '雾中急救员', '蝙蝠医师'],
};

export function generateNickname(random = Math.random, lang = 'en') {
  const titles = NICKNAME_TITLES[lang] ?? NICKNAME_TITLES.en;
  const title = titles[Math.floor(random() * titles.length) % titles.length];
  const number = 1000 + (Math.floor(random() * 9000) % 9000);
  return `${title} ${number}`;
}

// ---- results ----
export const RESULT_FIELDS = ['score', 'correct', 'under_triage', 'over_triage', 'storyline', 'played_at'];

const count = (n) => Number.isInteger(n) && n >= 0 && n <= NIGHT_SIZE;

// The one row saved for a finished night, or null when it must not be saved (seeded night, or a
// summary that is not a full night). `summary` is summarizeShift(); nothing else is read from it.
export function resultPayload(summary, { storyline = false, playedAt = new Date(), seeded = false } = {}) {
  if (seeded || !summary) return null;
  const row = {
    score: summary.score,
    correct: summary.correct,
    under_triage: summary.underTriage,
    over_triage: summary.overTriage,
    storyline: Boolean(storyline),
    played_at: new Date(playedAt).toISOString(),
  };
  if (!Number.isInteger(row.score) || row.score < 0 || row.score > NIGHT_MAX_SCORE) return null;
  if (![row.correct, row.under_triage, row.over_triage].every(count)) return null;
  if (row.correct + row.under_triage + row.over_triage !== NIGHT_SIZE) return null;
  return row;
}

// ---- local lists (retry queue and this device's history) ----
function parseList(text) {
  try {
    const list = JSON.parse(text ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

// A stored row is kept only if it is still a valid full-night result with a real time.
const validRow = (r) => Boolean(r) && typeof r === 'object' && typeof r.storyline === 'boolean'
  && typeof r.played_at === 'string' && !Number.isNaN(Date.parse(r.played_at))
  && resultPayload({ score: r.score, correct: r.correct, underTriage: r.under_triage, overTriage: r.over_triage }, { playedAt: r.played_at }) !== null;

// Only the allowed fields of a row, in a fixed order.
export const pickResult = (r) => Object.fromEntries(RESULT_FIELDS.map((k) => [k, r[k]]));

// Queue entries are { userId, row }: a result waits for the account that played it.
export function parseQueue(text) {
  return parseList(text).filter((e) => e && typeof e.userId === 'string' && validRow(e.row)).map((e) => ({ userId: e.userId, row: pickResult(e.row) }));
}

export function enqueue(queue, userId, row) {
  return [...queue, { userId, row: pickResult(row) }].slice(-QUEUE_MAX);
}

export function parseHistory(text) {
  return parseList(text).filter(validRow).map(pickResult);
}

export const addToHistory = (history, row) => [...history, pickResult(row)].slice(-HISTORY_MAX);

// What to do with a failed save: 'retry' (offline, expired session, server trouble, daily limit)
// or 'drop' (the database rejected the row itself; retrying cannot help).
export function failureAction(res) {
  if (!res || res.status === 0 || res.status === 401 || res.status === 408 || res.status === 429 || res.status >= 500) return 'retry';
  if (/daily_result_limit/.test(JSON.stringify(res.data ?? ''))) return 'retry';
  return 'drop';
}

// ---- progress ----
// Stats from rows (newest last or any order; sorted by played_at here).
// { nights, best, average, underRate (0-1), recent: [last 10 scores, oldest first] }
export function progressStats(rows) {
  const list = [...rows].sort((a, b) => Date.parse(a.played_at) - Date.parse(b.played_at));
  const nights = list.length;
  if (!nights) return { nights: 0, best: null, average: null, underRate: null, recent: [] };
  const scores = list.map((r) => r.score);
  const patients = list.reduce((n, r) => n + r.correct + r.under_triage + r.over_triage, 0);
  const under = list.reduce((n, r) => n + r.under_triage, 0);
  return {
    nights,
    best: Math.max(...scores),
    average: Math.round(scores.reduce((a, b) => a + b, 0) / nights),
    underRate: patients ? under / patients : 0,
    recent: scores.slice(-RECENT_SCORES),
  };
}

// The my_progress() database function's row -> the same shape as progressStats().
export function progressFromServer(row) {
  const r = Array.isArray(row) ? row[0] : row;
  if (!r || !Number(r.nights_played)) return { nights: 0, best: null, average: null, underRate: null, recent: [] };
  const recent = (Array.isArray(r.recent_scores) ? r.recent_scores : []).map(Number).filter(Number.isFinite);
  return {
    nights: Number(r.nights_played),
    best: Number(r.best_score),
    average: Math.round(Number(r.average_score)),
    underRate: Number(r.under_rate),
    recent: recent.slice(-RECENT_SCORES),
  };
}

// ---- leaderboard ----
// leaderboard() rows -> { top: [...], me: row or null (only when outside the top 50) }.
export function leaderboardModel(rows) {
  const list = (Array.isArray(rows) ? rows : [])
    .filter((r) => r && Number.isInteger(Number(r.rank)) && typeof r.display_name === 'string')
    .map((r) => ({ rank: Number(r.rank), name: r.display_name, best: Number(r.best_score), nights: Number(r.nights_played), isMe: r.is_me === true }));
  const top = list.slice(0, LEADERBOARD_SIZE);
  const me = top.some((r) => r.isMe) ? null : list.slice(LEADERBOARD_SIZE).find((r) => r.isMe) ?? null;
  return { top, me };
}

// ---- the account service ----
// createAccountService({ config, fetch, storage, random, now, crypto })
// `config` comes from supabaseConfig(). When it is disabled the service is inert: every method
// resolves to null and fetch is never called.
export const PROFILE_KEY = 'grimm-triage-profile';

export function createAccountService({ config, fetch: fetchImpl, storage = globalThis.localStorage, random = Math.random, now = Date.now, crypto: cryptoImpl } = {}) {
  const state = { profile: null, status: 'guest' };
  if (!config?.enabled) {
    const off = async () => null;
    return {
      enabled: false, state, signedIn: false, session: null, init: off, signIn: off, signOut: off, saveNight: off,
      flushQueue: off, progress: off, leaderboard: off, rename: off, deleteAccount: off, refresh: off, refreshDelay: () => null,
    };
  }

  const store = safeStorage(storage);
  const client = createClient({ config, fetch: fetchImpl, storage, crypto: cryptoImpl, now });
  const readQueue = () => parseQueue(store.get(QUEUE_KEY));
  const writeQueue = (q) => (q.length ? store.set(QUEUE_KEY, JSON.stringify(q)) : store.remove(QUEUE_KEY));
  const setProfile = (displayName) => {
    state.profile = displayName ? { displayName } : null;
    if (displayName) store.set(PROFILE_KEY, JSON.stringify({ userId: client.userId, displayName }));
    else store.remove(PROFILE_KEY);
  };
  // The last display name seen for this account, so an offline load still shows who is signed in.
  const cachedName = () => {
    try {
      const p = JSON.parse(store.get(PROFILE_KEY) ?? 'null');
      return p && p.userId === client.userId && validateDisplayName(p.displayName).ok ? p.displayName : null;
    } catch { return null; }
  };

  // 'ok', or 'offline' when the network or server failed.
  async function loadProfile(lang, created = false) {
    const res = await client.rest(`profiles?select=display_name&id=eq.${encodeURIComponent(client.userId)}`);
    if (!res.ok || !Array.isArray(res.data)) return 'offline';
    if (res.data[0]) { setProfile(res.data[0].display_name); return 'ok'; }
    if (created) return 'offline';
    // First sign-in: create the profile with a generated spooky nickname.
    const made = await client.rest('profiles', {
      method: 'POST', body: { id: client.userId, display_name: generateNickname(random, lang) }, prefer: 'return=minimal',
    });
    return made.ok || made.status === 409 ? loadProfile(lang, true) : 'offline';
  }

  // Send this account's queued results, oldest first. Results of another account stay queued.
  // Stops at the first failure that should be retried. `last` is what happened to the newest one.
  async function flushQueue() {
    const uid = client.userId;
    if (!uid || !state.profile) return { sent: 0, dropped: 0, left: 0, last: null };
    const keep = [];
    let sent = 0;
    let dropped = 0;
    let last = null;
    let stop = false;
    for (const entry of readQueue()) {
      if (entry.userId !== uid) { keep.push(entry); continue; }
      if (stop) { keep.push(entry); last = 'kept'; continue; }
      const res = await client.rest('results', { method: 'POST', body: entry.row, prefer: 'return=minimal' });
      if (res.ok) { sent += 1; last = 'sent'; }
      else if (failureAction(res) === 'drop') { dropped += 1; last = 'dropped'; }
      else { keep.push(entry); last = 'kept'; stop = true; }
    }
    writeQueue(keep);
    return { sent, dropped, left: keep.filter((e) => e.userId === uid).length, last };
  }

  const service = {
    enabled: true,
    state,
    get signedIn() { return Boolean(client.session && state.profile); },
    get session() { return client.session; },
    refresh: () => client.refresh(),
    refreshDelay: () => client.refreshDelay(),

    // On page load: finish a sign-in redirect, refresh the session if needed, load or create the
    // profile, then send queued results. With no session and no redirect it sends nothing.
    // Returns { signedIn, signIn: null | { provider } | { error }, flushed }.
    async init(href, lang = 'en') {
      const signIn = await client.completeSignIn(href);
      if (!client.session) { setProfile(null); state.status = 'guest'; return { signedIn: false, signIn, flushed: null }; }
      await client.ensureFresh();
      if (!client.session) { setProfile(null); state.status = 'guest'; return { signedIn: false, signIn, flushed: null }; }
      if ((await loadProfile(lang)) === 'ok') {
        state.status = 'signed-in';
        return { signedIn: true, signIn, flushed: await flushQueue() };
      }
      // Offline (or Supabase unreachable): still signed in on this device; results are queued.
      state.profile = cachedName() ? { displayName: cachedName() } : null;
      state.status = 'offline';
      return { signedIn: service.signedIn, signIn, flushed: null };
    },

    // The authorize URL for a provider; the caller navigates to it.
    signIn(provider, href) {
      return client.beginSignIn(provider, href);
    },

    async signOut() {
      await client.signOut();
      setProfile(null);
      state.status = 'guest';
    },

    // A finished night: kept on this device for the guest progress panel and, for a signed-in
    // player, saved (or queued when saving fails). Never throws.
    // { saved: 'seeded' | 'invalid' | 'guest' | 'saved' | 'queued' | 'rejected' }
    async saveNight(summary, { storyline = false, seeded = false } = {}) {
      try {
        if (seeded) return { saved: 'seeded' };
        const row = resultPayload(summary, { storyline, playedAt: new Date(now()) });
        if (!row) return { saved: 'invalid' };
        store.set(HISTORY_KEY, JSON.stringify(addToHistory(parseHistory(store.get(HISTORY_KEY)), row)));
        const uid = client.userId;
        if (!uid) return { saved: 'guest' };
        // Queue first, so the result survives a closed tab or a failed request.
        writeQueue(enqueue(readQueue(), uid, row));
        if (!state.profile) return { saved: 'queued' };
        const r = await flushQueue();
        return { saved: { sent: 'saved', dropped: 'rejected' }[r.last] ?? 'queued', dropped: r.dropped };
      } catch {
        return { saved: 'queued' };
      }
    },

    flushQueue,

    // Progress for the panel: the database for a signed-in player, else this device's history.
    // { source: 'account' | 'device', stats, unavailable? }
    async progress() {
      if (service.signedIn) {
        const res = await client.rpc('my_progress');
        if (res.ok) return { source: 'account', stats: progressFromServer(res.data) };
        return { source: 'device', stats: progressStats(parseHistory(store.get(HISTORY_KEY))), unavailable: true };
      }
      return { source: 'device', stats: progressStats(parseHistory(store.get(HISTORY_KEY))) };
    },

    // { top, me } or { error: true }. Signed in or not.
    async leaderboard() {
      const res = await client.rpc('leaderboard');
      return res.ok ? leaderboardModel(res.data) : { error: true };
    },

    // { ok: true } or { ok: false, error: 'length' | 'chars' | 'network' }.
    async rename(name) {
      const v = validateDisplayName(name);
      if (!v.ok) return v;
      if (!service.signedIn) return { ok: false, error: 'network' };
      const res = await client.rest(`profiles?id=eq.${encodeURIComponent(client.userId)}`, {
        method: 'PATCH', body: { display_name: v.value }, prefer: 'return=minimal',
      });
      if (!res.ok) return { ok: false, error: res.status === 400 ? 'chars' : 'network' };
      setProfile(v.value);
      return { ok: true };
    },

    // Deletes the profile, results and auth user through delete_account(), which only ever
    // deletes the caller; then forgets the session and this account's queued results.
    async deleteAccount() {
      const uid = client.userId;
      if (!uid) return { ok: false };
      const res = await client.rpc('delete_account');
      if (!res.ok) return { ok: false };
      writeQueue(readQueue().filter((e) => e.userId !== uid));
      setProfile(null);
      client.clearSession();
      state.status = 'guest';
      return { ok: true };
    },
  };
  return service;
}
