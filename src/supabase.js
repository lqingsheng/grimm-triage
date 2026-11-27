// A small Supabase client for the optional accounts (task 22): Supabase Auth (OAuth with PKCE) and
// the REST API (PostgREST), with fetch only. No supabase-js, no bundler, no runtime dependency.
//
// Sign-in uses the OAuth authorization code flow with PKCE:
//   1. beginSignIn(provider) stores a random code verifier in localStorage and returns the
//      /auth/v1/authorize URL (Google or GitHub), with redirect_to = the page the player is on.
//   2. Supabase sends the player back to that page with ?code=... ; completeSignIn() exchanges the
//      code and the verifier at /auth/v1/token?grant_type=pkce for a session.
// PKCE keeps the tokens out of the URL: the page URL (which the Umami statistics script may see)
// only ever holds a one-time code that is useless without the verifier, and it is removed at once.
//
// Headers on every request: `apikey: <publishable key>`, and `Authorization: Bearer <user access
// token>` when a session exists, otherwise `Authorization: Bearer <publishable key>`.
//
// The session in localStorage holds only the tokens, their expiry, the user id and the provider:
// never the email or any other profile data Supabase returns.
//
// Network-facing, but every function takes its fetch, storage, crypto and clock as arguments, so
// tests run it against a mocked fetch. Nothing here throws on a network failure: requests resolve
// to { ok: false, status: 0 }.

export const SESSION_KEY = 'grimm-triage-session';
export const PKCE_KEY = 'grimm-triage-pkce';
export const PROVIDERS = ['google', 'github'];
// Refresh the access token this many seconds before it expires.
export const REFRESH_MARGIN_S = 60;
// A pending sign-in (verifier) older than this is ignored.
export const PKCE_MAX_AGE_MS = 15 * 60 * 1000;
// Query parameters Supabase Auth may add on the way back; removed from the URL after sign-in.
export const REDIRECT_PARAMS = ['code', 'error', 'error_code', 'error_description', 'state', 'sb'];

// localStorage that never throws (private mode, blocked storage, Node tests without storage).
export function safeStorage(storage) {
  return {
    get(key) { try { return storage?.getItem(key) ?? null; } catch { return null; } },
    set(key, value) { try { storage?.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { storage?.removeItem(key); } catch { /* ignore */ } },
  };
}

export function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 64 characters from 48 random bytes: inside the 43-128 characters PKCE allows.
export function randomVerifier(cryptoImpl = globalThis.crypto) {
  return base64url(cryptoImpl.getRandomValues(new Uint8Array(48)));
}

export async function challengeFor(verifier, cryptoImpl = globalThis.crypto) {
  const digest = await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

// The page to come back to: the current URL without the sign-in parameters and without the hash.
export function redirectTarget(href) {
  const u = new URL(href);
  for (const p of REDIRECT_PARAMS) u.searchParams.delete(p);
  u.hash = '';
  return u.href;
}

// The Supabase Auth authorize URL for a provider.
export function authorizeUrl(config, { provider, redirectTo, challenge }) {
  if (!PROVIDERS.includes(provider)) throw new RangeError(`unknown provider ${provider}`);
  const u = new URL(`${config.url}/auth/v1/authorize`);
  u.searchParams.set('provider', provider);
  u.searchParams.set('redirect_to', redirectTo);
  u.searchParams.set('code_challenge', challenge);
  u.searchParams.set('code_challenge_method', 's256');
  return u.href;
}

// What the redirect back from Supabase carries: { code }, { error, description }, or null.
// Errors can arrive in the query or the hash.
export function parseRedirect(href) {
  let u;
  try { u = new URL(href); } catch { return null; }
  const hash = new URLSearchParams(u.hash.replace(/^#/, ''));
  const get = (k) => u.searchParams.get(k) ?? hash.get(k);
  const error = get('error') || get('error_code');
  if (error) return { error: String(error).slice(0, 100), description: String(get('error_description') ?? '').slice(0, 300) };
  const code = u.searchParams.get('code');
  if (code && /^[\w-]{8,200}$/.test(code)) return { code };
  return null;
}

// A token response -> the stored session, or null if it is not a usable session.
// expires_at (seconds) is preferred; expires_in is the fallback.
export function parseSession(json, nowMs, provider = null) {
  if (!json || typeof json !== 'object') return null;
  const { access_token: access, refresh_token: refresh, expires_at: at, expires_in: inS } = json;
  const userId = json.user?.id ?? json.user_id;
  if (typeof access !== 'string' || !access || typeof refresh !== 'string' || !refresh) return null;
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  let expiresAt = Number.isFinite(at) ? at : Number.isFinite(inS) ? Math.floor(nowMs / 1000) + inS : NaN;
  if (!Number.isFinite(expiresAt)) return null;
  expiresAt = Math.floor(expiresAt);
  const p = PROVIDERS.includes(provider) ? provider : PROVIDERS.includes(json.provider) ? json.provider : null;
  return { access_token: access, refresh_token: refresh, expires_at: expiresAt, user_id: userId, provider: p };
}

// A stored session string -> session or null.
export function readSession(text) {
  if (!text) return null;
  try {
    const s = JSON.parse(text);
    return parseSession({ ...s, user: { id: s.user_id } }, 0, s.provider);
  } catch { return null; }
}

// Milliseconds until the access token should be refreshed (0 = now).
export function refreshDelay(session, nowMs) {
  if (!session) return null;
  return Math.max(0, session.expires_at * 1000 - REFRESH_MARGIN_S * 1000 - nowMs);
}

export const needsRefresh = (session, nowMs) => Boolean(session) && refreshDelay(session, nowMs) === 0;

// Headers for one request.
export function authHeaders(config, session, extra = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${session ? session.access_token : config.key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// The client. `fetch`, `storage`, `crypto` and `now` are injected (browser globals by default).
export function createClient({ config, fetch: fetchImpl = globalThis.fetch?.bind(globalThis), storage = globalThis.localStorage, crypto: cryptoImpl = globalThis.crypto, now = Date.now } = {}) {
  const store = safeStorage(storage);
  let session = readSession(store.get(SESSION_KEY));
  let refreshing = null;

  const saveSession = (s) => {
    session = s;
    if (s) store.set(SESSION_KEY, JSON.stringify(s)); else store.remove(SESSION_KEY);
  };

  async function send(url, { method = 'GET', body, headers = {}, useSession = true } = {}) {
    try {
      const res = await fetchImpl(url, {
        method,
        headers: authHeaders(config, useSession ? session : null, headers),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      return { ok: res.ok, status: res.status, data, headers: res.headers };
    } catch {
      return { ok: false, status: 0, data: null };
    }
  }

  // Refresh once at a time. An invalid refresh token (400/401/403) ends the session; a network
  // failure keeps it so the next load can try again.
  function refresh() {
    if (!session) return Promise.resolve(false);
    if (refreshing) return refreshing;
    const current = session;
    refreshing = (async () => {
      const res = await send(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST', body: { refresh_token: current.refresh_token }, useSession: false,
      });
      if (res.ok) {
        const next = parseSession(res.data, now(), current.provider);
        if (next && next.user_id === current.user_id) { saveSession(next); return true; }
      }
      if ([400, 401, 403].includes(res.status)) saveSession(null);
      return false;
    })().finally(() => { refreshing = null; });
    return refreshing;
  }

  return {
    get session() { return session; },
    get userId() { return session?.user_id ?? null; },

    async beginSignIn(provider, href) {
      if (!PROVIDERS.includes(provider)) throw new RangeError(`unknown provider ${provider}`);
      const verifier = randomVerifier(cryptoImpl);
      const challenge = await challengeFor(verifier, cryptoImpl);
      store.set(PKCE_KEY, JSON.stringify({ verifier, provider, at: now() }));
      return authorizeUrl(config, { provider, redirectTo: redirectTarget(href), challenge });
    },

    // Finish a sign-in after the redirect. Returns null when the URL is not a sign-in redirect,
    // { provider } on success, or { error } on failure.
    async completeSignIn(href) {
      const r = parseRedirect(href);
      if (!r) return null;
      let pending = null;
      try { pending = JSON.parse(store.get(PKCE_KEY) ?? 'null'); } catch { pending = null; }
      store.remove(PKCE_KEY);
      if (r.error) return { error: r.error, description: r.description };
      if (!pending?.verifier || now() - pending.at > PKCE_MAX_AGE_MS) return { error: 'no_pending_sign_in' };
      const res = await send(`${config.url}/auth/v1/token?grant_type=pkce`, {
        method: 'POST', body: { auth_code: r.code, code_verifier: pending.verifier }, useSession: false,
      });
      const next = res.ok ? parseSession(res.data, now(), pending.provider) : null;
      if (!next) return { error: res.status === 0 ? 'offline' : 'exchange_failed' };
      saveSession(next);
      return { provider: next.provider };
    },

    refresh,
    refreshDelay: () => refreshDelay(session, now()),

    // Refresh first if the token is about to expire. False when there is no usable session.
    async ensureFresh() {
      if (!session) return false;
      if (needsRefresh(session, now())) await refresh();
      return Boolean(session) && !needsRefresh(session, now());
    },

    // A REST call (path under /rest/v1/). A 401 with a session refreshes once and retries once.
    async rest(path, { method = 'GET', body, prefer } = {}) {
      if (session) await this.ensureFresh();
      const headers = prefer ? { Prefer: prefer } : {};
      const url = `${config.url}/rest/v1/${path}`;
      let res = await send(url, { method, body, headers });
      if (res.status === 401 && session && (await refresh())) res = await send(url, { method, body, headers });
      return res;
    },

    rpc(name, args = {}) {
      return this.rest(`rpc/${name}`, { method: 'POST', body: args });
    },

    // Sign out on this device. The local session is cleared even if the network call fails.
    async signOut() {
      const s = session;
      saveSession(null);
      if (s) {
        await send(`${config.url}/auth/v1/logout?scope=local`, {
          method: 'POST', headers: { Authorization: `Bearer ${s.access_token}` }, useSession: false,
        });
      }
    },

    clearSession() { saveSession(null); },
  };
}
