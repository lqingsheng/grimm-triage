// Markup for the optional accounts (task 22): the header button, the sign-in and account dialogs,
// the save status in the shift report, the Progress panel and the Leaderboard. Pure: no DOM, no
// network. Every function takes `tr` (key, vars) => string from src/i18n.js.
//
// Display names come from other players, so they are always HTML-escaped. No animation anywhere.

import { NIGHT_MAX_SCORE, NAME_MAX, RECENT_SCORES } from './accounts.js';

export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const DIALOG_TITLE_ID = 'accountDialogTitle';

// Header button: "Sign in", or the player's display name (never the email).
export function accountButtonHtml(tr, { session = false, name = null } = {}) {
  if (!session) return `<button type="button" id="accountButton" class="account-btn" aria-haspopup="dialog">${tr('account.signIn')}</button>`;
  const shown = name ? escapeHtml(name) : tr('account.unnamed');
  return `<button type="button" id="accountButton" class="account-btn" aria-haspopup="dialog" aria-label="${escapeHtml(tr('account.button', { name: name ?? tr('account.unnamed') }))}"><span aria-hidden="true">👤</span> ${shown}</button>`;
}

const closeButton = (tr) => `<button type="button" class="ghost dialog-close" data-account="close">${tr('account.close')}</button>`;
const message = (text, kind = 'info') => (text ? `<p class="account-msg ${kind}" role="${kind === 'error' ? 'alert' : 'status'}">${text}</p>` : '');

// Sign-in dialog: Google and GitHub only.
export function signInDialogHtml(tr, { error = null, note = '' } = {}) {
  return `<h2 id="${DIALOG_TITLE_ID}">${tr('account.signInTitle')}</h2>
    ${message(note)}
    <p>${tr('account.signInWhy')}</p>
    ${message(error ? tr('account.signInError') : '', 'error')}
    <div class="provider-list">
      <button type="button" class="provider" data-provider="google">${tr('account.google')}</button>
      <button type="button" class="provider" data-provider="github">${tr('account.github')}</button>
    </div>
    <p class="account-note">${tr('account.redirectNote')}</p>
    <p class="account-note">${tr('account.privacy')}</p>
    ${closeButton(tr)}`;
}

// Account dialog for a signed-in player: rename, sign out, delete (with a confirm step).
export function accountDialogHtml(tr, { name = '', confirmDelete = false, note = '', noteKind = 'info', offline = false } = {}) {
  const shown = escapeHtml(name || tr('account.unnamed'));
  const del = confirmDelete
    ? `<div class="danger-zone" role="group" aria-labelledby="deleteTitle">
        <h3 id="deleteTitle">${tr('account.delete')}</h3>
        <p>${tr('account.deleteConfirmText')}</p>
        <button type="button" class="danger" data-account="delete-confirm">${tr('account.deleteConfirm')}</button>
        <button type="button" class="ghost" data-account="delete-cancel">${tr('account.deleteCancel')}</button>
      </div>`
    : `<button type="button" class="ghost danger-outline" data-account="delete">${tr('account.delete')}</button>`;
  return `<h2 id="${DIALOG_TITLE_ID}">${tr('account.signedInAs', { name: shown })}</h2>
    ${offline ? message(tr('account.offline')) : ''}
    ${message(note, noteKind)}
    <form class="name-form" data-account="rename" novalidate>
      <label><span>${tr('account.nameLabel')}</span>
        <input name="displayName" type="text" value="${escapeHtml(name)}" maxlength="${NAME_MAX * 2}" autocomplete="nickname" spellcheck="false" aria-describedby="nameHint" required></label>
      <p id="nameHint" class="account-note">${tr('account.nameHint')}</p>
      <button type="submit">${tr('account.nameSave')}</button>
    </form>
    <div class="account-actions">
      <button type="button" data-account="sign-out">${tr('account.signOut')}</button>
      ${del}
    </div>
    ${closeButton(tr)}`;
}

// One line under the score in the shift report.
export const SAVE_STATUS = ['saving', 'saved', 'queued', 'rejected', 'guest', 'seeded'];
export function saveStatusHtml(tr, saved) {
  if (!SAVE_STATUS.includes(saved)) return '';
  return `<p id="saveStatus" class="save-status ${saved}" role="status">${tr(`save.${saved}`)}</p>`;
}

// Last scores as a small inline SVG line, oldest on the left. The values are also in the
// accessible name, so the chart is never the only way to read them.
export function sparklineSvg(tr, scores, max = NIGHT_MAX_SCORE) {
  const list = scores.slice(-RECENT_SCORES);
  if (!list.length) return '';
  const w = 200;
  const h = 60;
  const pad = 5;
  const x = (i) => (list.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (list.length - 1));
  const y = (s) => h - pad - (Math.min(Math.max(s, 0), max) / max) * (h - 2 * pad);
  const points = list.map((s, i) => `${x(i).toFixed(1)},${y(s).toFixed(1)}`).join(' ');
  const label = tr('progress.chartLabel', { n: list.length, list: list.join(tr('calc.missingSep')) });
  const dots = list.map((s, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(s).toFixed(1)}" r="2.5"/>`).join('');
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeHtml(label)}" focusable="false">
    <line class="axis" x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}"/>
    <polyline points="${points}"/>${dots}</svg>`;
}

// The Progress panel. `p` is the account service's progress(), or null while loading.
export function progressHtml(tr, p) {
  const head = `<h2 id="progressTitle" tabindex="-1">${tr('progress.title')}</h2>`;
  if (!p) return `${head}<p role="status">${tr('progress.loading')}</p>`;
  const s = p.stats;
  const note = p.source === 'account'
    ? `<p class="account-note">${tr('progress.accountNote')}</p>`
    : `<p class="account-note">${tr(p.unavailable ? 'progress.unavailable' : 'progress.deviceNote')}</p>`;
  if (!s.nights) return `${head}<p>${tr('progress.none')}</p>${note}`;
  const pct = `${Math.round(s.underRate * 100)}%`;
  return `${head}
    <dl class="tally">
      <div><dt>${tr('progress.nights')}</dt><dd>${s.nights}</dd></div>
      <div><dt>${tr('progress.best')}</dt><dd>${s.best}</dd></div>
      <div><dt>${tr('progress.average')}</dt><dd>${s.average}</dd></div>
      <div><dt>${tr('progress.underRate')}</dt><dd>${pct}</dd></div>
    </dl>
    <h3>${tr('progress.recent')}</h3>
    ${sparklineSvg(tr, s.recent)}
    ${note}`;
}

// The Leaderboard. `b` is the account service's leaderboard(), or null while loading.
export function leaderboardHtml(tr, b, { signedIn = false } = {}) {
  const head = `<h2 id="boardTitle" tabindex="-1">${tr('board.title')}</h2>`;
  if (!b) return `${head}<p role="status">${tr('progress.loading')}</p>`;
  if (b.error) return `${head}<p role="alert">${tr('board.error')}</p><button type="button" class="ghost" data-board="retry">${tr('board.retry')}</button>`;
  const hint = signedIn ? '' : `<p class="account-note">${tr('board.signInHint')}</p>`;
  if (!b.top.length) return `${head}<p>${tr('board.empty')}</p>${hint}`;
  const row = (r) => `<tr${r.isMe ? ' class="me"' : ''}><td>${r.rank}</td><th scope="row">${escapeHtml(r.name)}${r.isMe ? ` <span class="you">${tr('board.you')}</span>` : ''}</th><td>${r.best}</td><td>${r.nights}</td></tr>`;
  const me = b.me ? `<p class="board-me">${tr('board.yourRankLine', { rank: b.me.rank, best: b.me.best, nights: b.me.nights })}</p>` : '';
  return `${head}
    <div class="board-wrap"><table class="board-table">
      <caption>${tr('board.caption')}</caption>
      <thead><tr><th scope="col">${tr('board.rank')}</th><th scope="col">${tr('board.name')}</th><th scope="col">${tr('board.best')}</th><th scope="col">${tr('board.nights')}</th></tr></thead>
      <tbody>${b.top.map(row).join('')}</tbody>
    </table></div>
    ${me}${hint}`;
}
