import { triage, scoreGuess, dangerThresholds, hypotensionThreshold } from './triage.js';
import { summarizeShift } from './shift.js';
import { CASES } from './cases.js';
import { portraitSvg, eyeGlowSvg } from './portraits.js';
import { dripsHtml, stainsHtml } from './haunt.js';
import { SOUND_KEY, soundOnFrom, playHaunt } from './sound.js';
import { t, levelName, caseText, translateReason, translateError, normalizeLang, STORAGE_KEY, DEFAULT_LANG } from './i18n.js';

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
}

document.querySelectorAll('.lang-toggle button').forEach((b) =>
  b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); }),
);

// ---- mode switch ----
document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((x) => {
      x.classList.toggle('active', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    $('#game').hidden = b.dataset.mode !== 'game';
    $('#calc').hidden = b.dataset.mode !== 'calc';
  }),
);

// ---- game ----
let idx = 0;
let score = 0;
let answers = []; // { case, guess, level } for the shift report
let current = null; // { guess, truth, s } once the current case is answered, so a language switch can redraw it
let reportShown = false;

// Fisher-Yates shuffle on a copy, so each night presents the cases in a new order.
function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let nightCases = shuffled(CASES);

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
  $('#caseCard').innerHTML = `<div class="card-head"><div class="portrait">${art}</div>
    <div class="who" id="caseName">${text.name}</div></div><p>${text.story}</p>${vitalsHtml(c.patient)}`;
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
  answers.push({ case: nightCases[idx], guess, level: truth.level });
  current = { guess, truth, s };
  if (s.underTriage) { stainCount += 1; renderStains(); }
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
  return `<li class="missed ${m.kind}">
    <div class="who"><span aria-hidden="true">${m.emoji}</span> ${text.name}</div>
    <div>${tr('report.missedLine', { kind, guess: m.guess, badge: badge(m.correctLevel) })}</div>
    <p class="teach">${text.teachingPoint}</p>
  </li>`;
}

function renderReport() {
  const firstShow = !reportShown;
  reportShown = true;
  const r = summarizeShift(answers);
  const max = r.total * 100;
  $('#caseNo').textContent = tr('report.over');
  $('#play').hidden = true;
  setEffect(null);
  const report = $('#shiftReport');
  report.innerHTML = `<h2 id="reportTitle" tabindex="-1">${tr('report.title')}</h2>
    <p class="final">${tr('report.final', { score: r.score, max })}</p>
    <dl class="tally">
      <div><dt>${tr('report.correct')}</dt><dd>${r.correct}</dd></div>
      <div><dt>${tr('report.under')}</dt><dd>${r.underTriage}</dd></div>
      <div><dt>${tr('report.overTriaged')}</dt><dd>${r.overTriage}</dd></div>
    </dl>
    ${r.missed.length
      ? `<h3>${tr('report.missed')}</h3><ul class="missed-list">${r.missed.map(missedHtml).join('')}</ul>`
      : `<p>${tr('report.flawless')}</p>`}
    <button id="newNight" class="ghost">${tr('report.newNight')}</button>`;
  report.hidden = false;
  if (firstShow) $('#reportTitle').focus();
  $('#newNight').addEventListener('click', startNight);
}

function startNight() {
  nightCases = shuffled(CASES);
  idx = 0;
  score = 0;
  answers = [];
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

// ---- calculator ----
let calc = null; // { result } or { error } from the last submit, so a language switch can redraw it

function renderCalcResult() {
  if (!calc) { $('#calcResult').innerHTML = ''; return; }
  if (calc.error) {
    $('#calcResult').textContent = tr('calc.error', { message: translateError(calc.error, lang) });
    return;
  }
  const r = calc.result;
  $('#calcResult').innerHTML = `${badge(r.level)}<br>${tr('game.why', { reasons: reasonsText(r.reasons) })}${r.dangerZone ? ` ${tr('calc.dangerZone')}` : ''}`;
}

$('#calcForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const num = (k) => Number(f.get(k));
  const p = {
    ageYears: num('ageYears'), avpu: f.get('avpu'), hr: num('hr'), rr: num('rr'), sbp: num('sbp'),
    spo2: num('spo2'), tempC: num('tempC'), pain: num('pain'), resources: num('resources'),
    newConfusion: f.has('newConfusion'), highRisk: f.has('highRisk'), needsLifesaving: f.has('needsLifesaving'),
  };
  try {
    calc = { result: triage(p) };
  } catch (err) {
    calc = { error: err.message };
  }
  renderCalcResult();
});

// ---- start ----
$('#drips').innerHTML = dripsHtml();
renderSoundToggle();
applyStaticStrings();
renderScore();
renderCase();
