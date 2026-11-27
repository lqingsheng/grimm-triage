import { triage, scoreGuess, dangerThresholds, hypotensionThreshold } from './triage.js';
import { summarizeShift, decisionPointFor } from './shift.js';
import { lessonHtml } from './lesson.js';
import { helpButtonHtml, helpPanelHtml, countResources, parseVital, missingWarningHtml, provisionalTagHtml, OPTIONAL_VITALS, WARNING_ID } from './deskhelp.js';
import { CASES } from './cases.js';
import { portraitSvg, eyeGlowSvg } from './portraits.js';
import { dripsHtml, stainsHtml } from './haunt.js';
import { planNight, parseLastNight, seedFromSearch, mulberry32, LAST_NIGHT_KEY } from './night.js';
import { SOUND_KEY, soundOnFrom, playHaunt } from './sound.js';
import { t, levelName, caseText, translateReason, translateError, normalizeLang, STORAGE_KEY, DEFAULT_LANG } from './i18n.js';
import { track, deskLevel } from './analytics.js';
import { storylineBadgeHtml, storylineReportHtml, storylineReport, BADGE_ID as STORYLINE_BADGE_ID } from './storylines.js';
import { supabaseConfig } from './config.js';
import { createAccountService } from './accounts.js';
import { redirectTarget } from './supabase.js';
import { accountButtonHtml, signInDialogHtml, accountDialogHtml, saveStatusHtml, progressHtml, leaderboardHtml } from './accountview.js';

const $ = (s) => document.querySelector(s);

// ---- language ----
// The choice is kept in localStorage; storage can be unavailable (private mode, file://), so fail soft.
function loadLang() {
  try { return normalizeLang(localStorage.getItem(STORAGE_KEY)); } catch { return DEFAULT_LANG; }
}
function saveLang(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* not persisted, still switches */ }
}
let lang = loadLang();
const tr = (key, vars) => t(key, lang, vars);

// Badge colours (and a text colour with WCAG AA contrast on each) live in styles.css as .badge.lv1..lv5.
const badge = (lvl) => `<span class="badge lv${lvl}">${tr('level.badge', { level: lvl, name: levelName(lvl, lang) })}</span>`;
const reasonsText = (reasons) => reasons.map((r) => translateReason(r, lang)).join(tr('game.reasonSep'));

// Static text in index.html: data-i18n sets textContent, data-i18n-aria sets aria-label.
function applyStaticStrings() {
  document.documentElement.lang = lang;
  document.title = tr('doc.title');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', tr(el.dataset.i18nAria)));
  document.querySelectorAll('.lang-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function setLang(next) {
  lang = normalizeLang(next);
  saveLang(lang);
  applyStaticStrings();
  renderLevelButtons();
  renderScore();
  if (reportShown) renderReport();
  else { renderCaseCard(); renderFeedback(); renderNextButton(); }
  renderCalcResult();
  renderDeskHelp();
  if (accounts.enabled) renderAccounts();
}

document.querySelectorAll('.lang-toggle button').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    setLang(b.dataset.lang);
    track('lang-switch', { lang });
  }),
);

// ---- mode switch ----
// Night Shift and Triage Desk always; Progress and Leaderboard only with accounts (task 22).
const MODES = ['game', 'calc', 'progress', 'board'];
let mode = 'game';
document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => {
    mode = b.dataset.mode;
    document.querySelectorAll('nav button').forEach((x) => {
      x.classList.toggle('active', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    for (const m of MODES) $(`#${m}`).hidden = mode !== m;
    if (mode === 'progress') loadProgress();
    if (mode === 'board') loadBoard();
  }),
);

// ---- game ----
let idx = 0;
let score = 0;
let answers = []; // { case, guess, level } for the shift report
let current = null; // { guess, truth, s } once the current case is answered, so a language switch can redraw it
let reportShown = false;

// Each night: 3 cases per ESI level, none from the previous night, each with freshly drawn vitals
// and opening line (src/night.js). Last night's ids live in localStorage; if storage is blocked
// the draw simply cannot avoid them.
// With ?seed=<n> in the URL (demo recorder, task 18) the night comes from mulberry32(n) and
// ignores and leaves untouched last night's ids, so the same seed always gives the same night.
const seed = seedFromSearch(location.search);
const nightRandom = seed === null ? Math.random : mulberry32(seed);
function newNight() {
  if (seed !== null) return planNight(CASES, { random: nightRandom, avoid: [] });
  let avoid = [];
  try { avoid = parseLastNight(localStorage.getItem(LAST_NIGHT_KEY)); } catch { /* storage blocked */ }
  const night = planNight(CASES, { random: nightRandom, avoid });
  try { localStorage.setItem(LAST_NIGHT_KEY, JSON.stringify(night.map((c) => c.id))); } catch { /* not persisted */ }
  return night;
}
let nightCases = newNight();

function vitalsHtml(p) {
  // Age-appropriate danger-zone cut-offs (pediatric bands for age <= 8), plus the level-1 lows.
  // SBP uses the PALS age-based hypotension cut-off, and always flags the engine's level-1 SBP < 70
  // so a vital that made the case ESI 1 is never shown as normal.
  const th = dangerThresholds(p.ageYears);
  const lowSbp = p.sbp < hypotensionThreshold(p.ageYears) || p.sbp < 70;
  const cell = (key, val, danger) => `<div class="${danger ? 'danger' : ''}">${tr(key)} ${val}</div>`;
  return `<div class="vitals">
    ${cell('vital.avpu', p.avpu, p.avpu !== 'A')}
    ${cell('vital.hr', p.hr, p.hr > th.hr || p.hr < 40)}
    ${cell('vital.rr', p.rr, p.rr > th.rr || p.rr < 8)}
    ${cell('vital.bp', tr('vital.bpValue', { sbp: p.sbp }), lowSbp)}
    ${cell('vital.spo2', `${p.spo2}%`, p.spo2 < th.spo2)}
    ${cell('vital.temp', `${p.tempC}°C`, p.tempC >= 38.5 || p.tempC < 35)}
    ${cell('vital.pain', `${p.pain}/10`, p.pain >= 7)}
    ${cell('vital.resources', p.resources, false)}
  </div>`;
}

// ---- haunting effects ----
// CSS does all the animation (styles.css, "Haunting effects"); JS only swaps classes on the game panel
// (and .haunted on <body> for the full-screen vignette). Under prefers-reduced-motion the same classes
// give a static colour change and the static stains, and the .fx-note text in the feedback becomes
// visible instead of the motion.
const FX_CLASSES = ['fx-under', 'fx-correct'];
let stainCount = 0; // under-triages this night; each leaves a stain until "Start a new night"
let haunt = null;   // the playing sound sequence, if any

function setEffect(kind) {
  const panel = $('#game');
  panel.classList.remove(...FX_CLASSES);
  document.body.classList.remove('haunted');
  haunt?.stop();
  haunt = null;
  if (!kind) return;
  void panel.offsetWidth; // restart the CSS animation even if the same class was just removed
  panel.classList.add(`fx-${kind}`);
  if (kind === 'under') {
    document.body.classList.add('haunted');
    playSound();
  }
}

function renderStains() {
  $('#stains').innerHTML = stainsHtml(stainCount);
}

// ---- optional sound: OFF unless the player turns it on; the choice is remembered ----
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let soundOn = false;
let audio = null; // created on the first click that turns sound on (browsers need a user gesture)
try { soundOn = soundOnFrom(localStorage.getItem(SOUND_KEY)); } catch { /* storage blocked: stay off */ }

function audioContext() {
  if (!audio && AudioCtx) audio = new AudioCtx();
  if (audio?.state === 'suspended') audio.resume();
  return audio;
}

function playSound() {
  if (!soundOn) return;
  const ctx = audioContext();
  if (ctx) haunt = playHaunt(ctx);
}

function renderSoundToggle() {
  const btn = $('#soundToggle');
  btn.hidden = !AudioCtx; // no Web Audio: no sound, so no toggle
  btn.setAttribute('aria-pressed', String(soundOn));
}

$('#soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;
  try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch { /* not persisted */ }
  if (soundOn) audioContext(); // unlock audio inside this click
  else { haunt?.stop(); haunt = null; }
  renderSoundToggle();
});
const effectFor = (s) => (s.points === 100 ? 'correct' : s.underTriage ? 'under' : null);

function renderScore() {
  $('#score').textContent = tr('game.score', { score });
}

function renderCaseCard() {
  const c = nightCases[idx];
  const text = caseText(c, lang);
  $('#caseNo').textContent = tr('game.caseNo', { n: idx + 1, total: nightCases.length });
  const svg = portraitSvg(c.id, lang);
  const art = svg ? svg + eyeGlowSvg(c.id) : `<span class="emoji" aria-hidden="true">${c.emoji}</span>`;
  // The later patient of a storyline (task 21) carries a small static badge naming the earlier one;
  // the card's description points at it so screen readers announce the link with the patient.
  const link = storylineBadgeHtml(nightCases, idx, lang);
  $('#caseCard').innerHTML = `<div class="card-head"><div class="portrait">${art}</div>
    <div class="who" id="caseName">${text.name}</div></div>${link}<p>${text.story}</p>${vitalsHtml(c.patient)}`;
  if (link) $('#caseCard').setAttribute('aria-describedby', STORYLINE_BADGE_ID);
  else $('#caseCard').removeAttribute('aria-describedby');
}

function renderFeedback() {
  if (!current) { $('#feedback').innerHTML = ''; return; }
  const { truth, s } = current;
  const verdict = s.points === 100 ? tr('game.correct') : s.underTriage ? tr('game.under') : tr('game.over');
  const fx = effectFor(s);
  const note = fx ? `<p class="fx-note">${tr(`fx.${fx}`)}</p>` : '';
  $('#feedback').innerHTML = `${verdict} ${badge(truth.level)}<br>${tr('game.why', { reasons: reasonsText(truth.reasons) })} ${tr('game.points', { points: s.points })}${note}`;
}

function renderNextButton() {
  $('#nextCase').hidden = !current;
  $('#nextCase').textContent = tr(idx === nightCases.length - 1 ? 'game.toReport' : 'game.next');
}

function renderCase() {
  current = null;
  setEffect(null);
  renderLevelButtons();
  renderCaseCard();
  renderFeedback();
  renderNextButton();
}

// Once a case is answered the level buttons stay focusable but report aria-disabled, so screen
// reader users hear that the choice is locked until the next patient.
function renderLevelButtons() {
  $('#levelButtons').innerHTML = [1, 2, 3, 4, 5]
    .map((l) => `<button type="button" data-level="${l}"${current ? ' aria-disabled="true"' : ''} aria-label="${tr('level.button', { level: l, name: levelName(l, lang) })}">${l}<br><small>${levelName(l, lang)}</small></button>`)
    .join('');
}

$('#levelButtons').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-level]');
  if (!btn || current) return;
  const guess = Number(btn.dataset.level);
  const truth = triage(nightCases[idx].patient);
  const s = scoreGuess(guess, truth.level);
  score += s.points;
  answers.push({ case: nightCases[idx], guess, level: truth.level, step: decisionPointFor(truth) });
  current = { guess, truth, s };
  if (s.underTriage) { stainCount += 1; renderStains(); }
  // Statistics: only the ESI step (A-D) of the missed case, never the case or its vitals.
  if (s.underTriage) track('under-triage', { step: decisionPointFor(truth) });
  renderScore();
  renderFeedback();
  setEffect(effectFor(s));
  renderLevelButtons();
  renderNextButton();
  // Keyboard flow: the role="status" feedback is announced, and Enter/Space goes straight on.
  $('#nextCase').focus();
});

function missedHtml(m) {
  const c = CASES.find((x) => x.id === m.id);
  const text = c ? caseText(c, lang) : { name: m.name, teachingPoint: m.teachingPoint };
  const kind = m.kind === 'under' ? tr('report.under') : tr('report.overTriaged');
  // The vitals this player saw for this case (they vary each appearance), so the lesson matches.
  const step = m.step ? ` <span class="step-tag">${tr('lesson.stepTag', { step: m.step })}</span>` : '';
  return `<li class="missed ${m.kind}">
    <div class="who"><span aria-hidden="true">${m.emoji}</span> ${text.name}</div>
    <div>${tr('report.missedLine', { kind, guess: m.guess, badge: badge(m.correctLevel) })}${step}</div>
    <p class="seen">${tr('report.seenVitals')}</p>${vitalsHtml(m.patient)}
    <p class="teach">${text.teachingPoint}</p>
  </li>`;
}

// The lesson opens by itself after any under-triage. Once shown, a language switch keeps whatever
// open or closed state the player left it in.
function lessonOpen(r, firstShow) {
  if (firstShow) return r.underTriage > 0;
  return $('#lesson')?.open ?? r.underTriage > 0;
}

function renderReport() {
  const firstShow = !reportShown;
  reportShown = true;
  const r = summarizeShift(answers);
  const open = lessonOpen(r, firstShow);
  if (firstShow) saveNight(r);
  const missed = r.missed.map((m) => {
    const c = CASES.find((x) => x.id === m.id);
    return { ...m, displayName: c ? caseText(c, lang).name : m.name };
  });
  $('#caseNo').textContent = tr('report.over');
  $('#play').hidden = true;
  setEffect(null);
  const report = $('#shiftReport');
  report.innerHTML = `<h2 id="reportTitle" tabindex="-1">${tr('report.title')}</h2>
    <p class="final">${tr('report.final', { score: r.score, max: r.max })}</p>
    ${accounts.enabled ? saveStatusHtml(tr, saveState) : ''}
    <dl class="tally">
      <div><dt>${tr('report.correct')}</dt><dd>${r.correct}</dd></div>
      <div><dt>${tr('report.under')}</dt><dd>${r.underTriage}</dd></div>
      <div><dt>${tr('report.overTriaged')}</dt><dd>${r.overTriage}</dd></div>
    </dl>
    ${r.missed.length
      ? `<h3>${tr('report.missed')}</h3><ul class="missed-list">${r.missed.map(missedHtml).join('')}</ul>`
      : `<p>${tr('report.flawless')}</p>`}
    ${storylineReportHtml(answers, lang)}
    ${lessonHtml({ tr, badge, missed, open })}
    <button id="newNight" class="ghost">${tr('report.newNight')}</button>`;
  report.hidden = false;
  if (firstShow) {
    $('#reportTitle').focus();
    track('night-complete', { score: r.score });
  }
  $('#newNight').addEventListener('click', startNight);
}

function startNight() {
  nightCases = newNight();
  idx = 0;
  score = 0;
  answers = [];
  saveState = null;
  stainCount = 0;
  renderStains();
  reportShown = false;
  renderScore();
  $('#shiftReport').hidden = true;
  $('#shiftReport').innerHTML = '';
  $('#play').hidden = false;
  renderCase();
  $('#caseCard').focus();
}

$('#nextCase').addEventListener('click', () => {
  if (idx === nightCases.length - 1) { renderReport(); return; }
  idx += 1;
  renderCase();
  // The Next button hides itself, so move focus to the new patient (named "Patient n of N, name");
  // Tab then reaches the level buttons.
  $('#caseCard').focus();
});

// ---- Triage Desk inline help (task 16) ----
// Each judgement field gets an ⓘ button and a panel under it (src/deskhelp.js builds the markup).
// The resource checklist fills the number field; the number stays editable.
const helpOpen = new Set();
let ticked = [];

function renderDeskHelp() {
  document.querySelectorAll('#calcForm .field').forEach((el) => {
    const field = el.dataset.field;
    el.querySelectorAll('.help-btn, .help-panel').forEach((n) => n.remove());
    const open = helpOpen.has(field);
    el.querySelector('label').insertAdjacentHTML('afterend', helpButtonHtml(field, tr, open) + helpPanelHtml(field, tr, { open, ticked }));
    el.classList.toggle('help-open', open);
  });
}

function toggleHelp(field, open = !helpOpen.has(field)) {
  if (open) helpOpen.add(field); else helpOpen.delete(field);
  const el = document.querySelector(`#calcForm .field[data-field="${field}"]`);
  el.classList.toggle('help-open', open);
  el.querySelector('.help-btn').setAttribute('aria-expanded', String(open));
  el.querySelector('.help-panel').hidden = !open;
}

$('#calcForm').addEventListener('click', (e) => {
  const btn = e.target.closest('.help-btn');
  if (btn) toggleHelp(btn.dataset.help);
});

$('#calcForm').addEventListener('change', (e) => {
  const box = e.target.closest('input[data-resource]');
  if (!box) return;
  ticked = [...document.querySelectorAll('#calcForm input[data-resource]:checked')].map((b) => b.dataset.resource);
  const count = countResources(ticked);
  $('#calcForm input[name="resources"]').value = count;
  box.closest('.help-panel').querySelector('.resource-total').textContent = tr('help.resources.total', { count });
});

// Escape inside an open panel closes it and returns focus to its button.
$('#calcForm').addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const panel = e.target.closest('.help-panel');
  if (!panel) return;
  const field = panel.closest('.field').dataset.field;
  toggleHelp(field, false);
  panel.closest('.field').querySelector('.help-btn').focus();
});

// ---- calculator ----
let calc = null; // { result, reasons } or { error } from the last submit, so a language switch can redraw it

// A missing vital's input points at the warning (aria-describedby), so focusing it reads the warning.
function describeMissing(missing = []) {
  for (const k of OPTIONAL_VITALS) {
    const input = $(`#calcForm input[name="${k}"]`);
    input.setAttribute('aria-describedby', missing.includes(k) ? `vitalsNote ${WARNING_ID}` : 'vitalsNote');
  }
}

function renderCalcResult() {
  if (!calc) { $('#calcResult').innerHTML = ''; describeMissing(); return; }
  if (calc.error) {
    $('#calcResult').textContent = tr('calc.error', { message: translateError(calc.error, lang) });
    describeMissing();
    return;
  }
  const r = calc.result;
  $('#calcResult').innerHTML = `${badge(r.level)}${provisionalTagHtml(r, tr)}<br>${tr('game.why', { reasons: reasonsText(r.reasons) })}${r.dangerZone ? ` ${tr('calc.dangerZone')}` : ''}${missingWarningHtml(r, calc.reasons, tr, calc.ageYears)}`;
  describeMissing(r.missing);
}

$('#calcForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const num = (k) => Number(f.get(k));
  // HR, RR, SBP, SpO2 and temperature may be blank: blank means not measured (null).
  const vital = (k) => parseVital(f.get(k));
  const p = {
    ageYears: num('ageYears'), avpu: f.get('avpu'), hr: vital('hr'), rr: vital('rr'), sbp: vital('sbp'),
    spo2: vital('spo2'), tempC: vital('tempC'), pain: num('pain'), resources: num('resources'),
    newConfusion: f.has('newConfusion'), highRisk: f.has('highRisk'), needsLifesaving: f.has('needsLifesaving'),
  };
  const reasons = Object.fromEntries(OPTIONAL_VITALS.map((k) => [k, f.get(`${k}Reason`) || '']));
  try {
    calc = { result: triage(p), reasons, ageYears: p.ageYears };
  } catch (err) {
    calc = { error: err.message };
  }
  renderCalcResult();
  // Only the computed level is sent (e.g. "2P"), never the age, vitals or anything typed here.
  if (calc.result) track('desk-submit', { level: deskLevel(calc.result) });
});

// Choosing a "not measured" reason clears that vital; typing a value clears the reason.
$('#calcForm').addEventListener('change', (e) => {
  const select = e.target.closest('select[name$="Reason"]');
  if (select && select.value) $(`#calcForm input[name="${select.name.replace(/Reason$/, '')}"]`).value = '';
});
$('#calcForm').addEventListener('input', (e) => {
  const input = e.target.closest('.vital input');
  if (input && input.value !== '') $(`#calcForm select[name="${input.name}Reason"]`).value = '';
});

// ---- optional accounts (task 22) ----
// Everything here runs only when src/config.js has both Supabase values (accounts.enabled). With an
// empty config the service is inert, mountAccounts() never runs, the [data-account-feature]
// elements stay hidden and nothing is sent to Supabase: the app behaves exactly as before.
// Guests never see a prompt that blocks play; signing in is offered only from the header button.
const accounts = createAccountService({ config: supabaseConfig() });
let saveState = null;      // the shift report's save line: 'saving' | 'saved' | 'queued' | ...
let dialog = null;         // null, { view: 'sign-in', error?, note? } or { view: 'account', ... }
let progressData = null;   // last progress() result, null while loading
let boardData = null;      // last leaderboard() result, null while loading
let refreshTimer = null;

function renderAccountButton() {
  const name = accounts.state.profile?.displayName ?? null;
  $('#accountSlot').innerHTML = accountButtonHtml(tr, { session: Boolean(accounts.session), name });
}

function renderDialog() {
  if (!dialog) return;
  const d = $('#accountDialog');
  d.innerHTML = dialog.view === 'sign-in'
    ? signInDialogHtml(tr, dialog)
    : accountDialogHtml(tr, { ...dialog, name: accounts.state.profile?.displayName ?? '', offline: accounts.state.status === 'offline' });
}

function openDialog(next) {
  dialog = next;
  renderDialog();
  const d = $('#accountDialog');
  if (!d.open) d.showModal();
}

function renderSaveStatus() {
  const el = $('#saveStatus');
  if (!el) return;
  const html = saveStatusHtml(tr, saveState);
  if (!html) { el.remove(); return; }
  // Update in place so the role="status" region announces the change.
  el.className = `save-status ${saveState}`;
  el.textContent = tr(`save.${saveState}`);
}

function renderProgress() {
  $('#progress').innerHTML = progressHtml(tr, progressData);
}

function renderBoard() {
  $('#board').innerHTML = leaderboardHtml(tr, boardData, { signedIn: accounts.signedIn });
}

function renderAccounts() {
  renderAccountButton();
  renderDialog();
  renderSaveStatus();
  if (mode === 'progress') renderProgress();
  if (mode === 'board') renderBoard();
}

function notice(text) {
  const el = $('#accountNotice');
  el.textContent = text;
  el.hidden = !text;
}

async function loadProgress() {
  if (!accounts.enabled) return;
  progressData = null;
  renderProgress();
  progressData = await accounts.progress();
  if (mode === 'progress') renderProgress();
}

async function loadBoard() {
  if (!accounts.enabled) return;
  boardData = null;
  renderBoard();
  boardData = await accounts.leaderboard();
  if (mode === 'board') renderBoard();
}

// A finished night. Seeded nights (?seed=) are never saved. The report is already on screen and
// never waits for this.
function saveNight(r) {
  if (!accounts.enabled) return;
  saveState = seed !== null ? 'seeded' : accounts.session ? 'saving' : 'guest';
  const night = answers;
  accounts.saveNight(r, { storyline: Boolean(storylineReport(answers)), seeded: seed !== null }).then((res) => {
    if (res?.dropped) notice(tr('account.dropped', { count: res.dropped }));
    if (answers !== night) return; // a new night has started meanwhile
    if (seed === null && res?.saved !== 'invalid') saveState = res?.saved ?? 'queued';
    renderSaveStatus();
  });
}

// Refresh the access token shortly before it expires. If a refresh fails while offline, try again
// in a minute instead of in a tight loop.
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  const delay = accounts.refreshDelay();
  if (delay === null) return;
  refreshTimer = setTimeout(async () => {
    const ok = await accounts.refresh();
    renderAccountButton();
    if (ok || !accounts.session) scheduleRefresh();
    else refreshTimer = setTimeout(scheduleRefresh, 60_000);
  }, Math.min(delay, 2 ** 31 - 1));
}

async function mountAccounts() {
  document.querySelectorAll('[data-account-feature]').forEach((el) => { el.hidden = el.id === 'accountNotice'; });
  renderAccountButton();
  const res = await accounts.init(location.href, lang);
  if (res?.signIn) {
    // Remove ?code= (or the error) from the address bar and history.
    history.replaceState(history.state, '', redirectTarget(location.href));
    if (res.signIn.provider) track('sign-in', { provider: res.signIn.provider });
    else if (res.signIn.error !== 'no_pending_sign_in') openDialog({ view: 'sign-in', error: true });
  }
  if (res?.flushed?.dropped) notice(tr('account.dropped', { count: res.flushed.dropped }));
  renderAccounts();
  scheduleRefresh();
}

function afterAccountChange() {
  renderAccountButton();
  scheduleRefresh();
  if (mode === 'progress') loadProgress();
  if (mode === 'board') loadBoard();
}

$('#accountSlot').addEventListener('click', (e) => {
  if (!e.target.closest('#accountButton')) return;
  openDialog(accounts.session ? { view: 'account' } : { view: 'sign-in' });
});

$('#accountDialog').addEventListener('close', () => {
  dialog = null;
  $('#accountButton')?.focus();
});

$('#accountDialog').addEventListener('click', async (e) => {
  const d = $('#accountDialog');
  const provider = e.target.closest('button[data-provider]')?.dataset.provider;
  if (provider) {
    d.querySelectorAll('button[data-provider]').forEach((b) => { b.disabled = true; });
    try {
      location.assign(await accounts.signIn(provider, location.href));
    } catch {
      openDialog({ view: 'sign-in', error: true });
    }
    return;
  }
  const action = e.target.closest('button[data-account]')?.dataset.account;
  if (action === 'close') d.close();
  if (action === 'sign-out') {
    await accounts.signOut();
    d.close();
    afterAccountChange();
  }
  if (action === 'delete' || action === 'delete-cancel') {
    openDialog({ view: 'account', confirmDelete: action === 'delete' });
    d.querySelector(action === 'delete' ? '[data-account="delete-confirm"]' : '[data-account="delete"]')?.focus();
  }
  if (action === 'delete-confirm') {
    const r = await accounts.deleteAccount();
    if (r?.ok) {
      openDialog({ view: 'sign-in', note: tr('account.deleted') });
      afterAccountChange();
    } else {
      openDialog({ view: 'account', note: tr('account.deleteFailed'), noteKind: 'error' });
    }
  }
});

$('#accountDialog').addEventListener('submit', async (e) => {
  const form = e.target.closest('form[data-account="rename"]');
  if (!form) return;
  e.preventDefault();
  const r = await accounts.rename(new FormData(form).get('displayName'));
  openDialog(r?.ok
    ? { view: 'account', note: tr('account.nameSaved') }
    : { view: 'account', note: tr(`account.nameError.${r?.error ?? 'network'}`), noteKind: 'error' });
  renderAccountButton();
  $('#accountDialog input[name="displayName"]')?.focus();
});

$('#board').addEventListener('click', (e) => {
  if (e.target.closest('[data-board="retry"]')) loadBoard();
});

// ---- start ----
$('#drips').innerHTML = dripsHtml();
renderSoundToggle();
applyStaticStrings();
renderDeskHelp();
renderScore();
renderCase();
if (accounts.enabled) mountAccounts();
