// Privacy-friendly visit statistics (task 19). Umami Cloud's script in index.html counts page
// views itself (no cookies, no personal data); this module sends the few anonymous game events.
//
// Rules (see .kiro/steering/product.md):
// - Optional: if the Umami script is blocked or offline, window.umami is missing and track() does
//   nothing. It never throws, so the app works exactly the same without it.
// - Off for demo recordings (?seed= in the URL) and when the browser sends Do Not Track.
// - Each event carries at most one small property, checked against an allow-list. Ages, vital
//   signs, case names, free text and anything typed into the Triage Desk are never sent, and
//   neither is any account data (user id, display name or email).
//
// Pure apart from reading `scope` (globalThis in the browser), so tests can pass a fake window.

import { LANGS } from './i18n.js';

// Event name -> its one allowed property and a check for the value.
export const EVENTS = {
  'night-complete': { key: 'score', valid: (v) => Number.isInteger(v) && Math.abs(v) <= 10000 },
  'under-triage': { key: 'step', valid: (v) => typeof v === 'string' && /^[A-D]$/.test(v) },
  'desk-submit': { key: 'level', valid: (v) => typeof v === 'string' && /^[1-5]P?$/.test(v) },
  'lang-switch': { key: 'lang', valid: (v) => LANGS.includes(v) },
  // Optional accounts (task 22): only which provider was used. Never a user id, name or email.
  'sign-in': { key: 'provider', valid: (v) => v === 'google' || v === 'github' },
};

// Triage Desk level as sent: "2", or "2P" when the result is provisional (missing vitals).
export const deskLevel = (result) => `${result.level}${result.provisional ? 'P' : ''}`;

// False for demo recordings (?seed=) and when the browser asks not to be tracked.
export function trackingAllowed(scope = globalThis) {
  try {
    if (new URLSearchParams(scope.location?.search ?? '').has('seed')) return false;
    if (scope.navigator?.doNotTrack === '1') return false;
    return true;
  } catch {
    return false;
  }
}

// The payload for an event: only its allowed property, or null if the event or value is not allowed.
export function eventPayload(name, props) {
  const spec = Object.hasOwn(EVENTS, name) ? EVENTS[name] : null;
  if (!spec || !props || !spec.valid(props[spec.key])) return null;
  return { [spec.key]: props[spec.key] };
}

// Send one custom event if Umami is loaded and tracking is allowed. Returns true if it was sent.
export function track(name, props, scope = globalThis) {
  try {
    if (!trackingAllowed(scope)) return false;
    const umami = scope.umami;
    if (!umami || typeof umami.track !== 'function') return false;
    const payload = eventPayload(name, props);
    if (!payload) return false;
    umami.track(name, payload);
    return true;
  } catch {
    return false;
  }
}
