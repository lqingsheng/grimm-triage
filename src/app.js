import { triage, scoreGuess, dangerThresholds, hypotensionThreshold, LEVEL_NAMES } from './triage.js';
import { summarizeShift } from './shift.js';
import { CASES } from './cases.js';
import { portraitSvg } from './portraits.js';

const $ = (s) => document.querySelector(s);
const COLORS = { 1: 'var(--l1)', 2: 'var(--l2)', 3: 'var(--l3)', 4: 'var(--l4)', 5: 'var(--l5)' };
const badge = (lvl) => `<span class="badge" style="background:${COLORS[lvl]}">ESI ${lvl} · ${LEVEL_NAMES[lvl]}</span>`;

// ---- mode switch ----
document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('active', x === b));
    $('#game').hidden = b.dataset.mode !== 'game';
    $('#calc').hidden = b.dataset.mode !== 'calc';
  }),
);

// ---- game ----
let idx = 0;
let score = 0;
let answered = false;
let answers = []; // { case, guess, level } for the shift report

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
  const t = dangerThresholds(p.ageYears);
  const lowSbp = p.sbp < hypotensionThreshold(p.ageYears) || p.sbp < 70;
  const cell = (label, val, danger) => `<div class="${danger ? 'danger' : ''}">${label} ${val}</div>`;
  return `<div class="vitals">
    ${cell('AVPU', p.avpu, p.avpu !== 'A')}
    ${cell('HR', p.hr, p.hr > t.hr || p.hr < 40)}
    ${cell('RR', p.rr, p.rr > t.rr || p.rr < 8)}
    ${cell('BP', `${p.sbp} sys`, lowSbp)}
    ${cell('SpO₂', `${p.spo2}%`, p.spo2 < t.spo2)}
    ${cell('T', `${p.tempC}°C`, p.tempC >= 38.5 || p.tempC < 35)}
    ${cell('Pain', `${p.pain}/10`, p.pain >= 7)}
    ${cell('Resources', p.resources, false)}
  </div>`;
}

// ---- haunting effects ----
// CSS does all the animation (styles.css, "Haunting effects"); JS only swaps classes on the game panel.
// Under prefers-reduced-motion the same classes give a static colour change, and the .fx-note text
// in the feedback becomes visible instead of the motion.
const FX_CLASSES = ['fx-under', 'fx-correct'];
const FX_NOTES = {
  under: '🩸 The ward lights bleed red: this patient is sicker than your call.',
  correct: '🕯 The candles flare: the right bay for this monster.',
};
function setEffect(kind) {
  const panel = $('#game');
  panel.classList.remove(...FX_CLASSES);
  if (!kind) return;
  void panel.offsetWidth; // restart the CSS animation even if the same class was just removed
  panel.classList.add(`fx-${kind}`);
}

function renderCase() {
  const c = nightCases[idx];
  answered = false;
  setEffect(null);
  $('#caseNo').textContent = `Patient ${idx + 1} of ${nightCases.length}`;
  const art = portraitSvg(c.id) || `<span class="emoji" aria-hidden="true">${c.emoji}</span>`;
  $('#caseCard').innerHTML = `<div class="card-head"><div class="portrait">${art}</div>
    <div class="who">${c.name}</div></div><p>${c.story}</p>${vitalsHtml(c.patient)}`;
  $('#feedback').innerHTML = '';
  $('#nextCase').hidden = true;
}

$('#levelButtons').innerHTML = [1, 2, 3, 4, 5]
  .map((l) => `<button data-level="${l}" aria-label="Triage level ${l}, ${LEVEL_NAMES[l]}">${l}<br><small>${LEVEL_NAMES[l]}</small></button>`)
  .join('');

$('#levelButtons').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-level]');
  if (!btn || answered) return;
  answered = true;
  const guess = Number(btn.dataset.level);
  const truth = triage(nightCases[idx].patient);
  const s = scoreGuess(guess, truth.level);
  score += s.points;
  answers.push({ case: nightCases[idx], guess, level: truth.level });
  $('#score').textContent = `Score ${score}`;
  const verdict = s.points === 100 ? '✅ Correct!' : s.underTriage ? '🩸 Under-triage: this monster is sicker than you thought.' : '🕸️ Over-triage: safe, but you used a resus bay.';
  const fx = s.points === 100 ? 'correct' : s.underTriage ? 'under' : null;
  const note = fx ? `<p class="fx-note">${FX_NOTES[fx]}</p>` : '';
  $('#feedback').innerHTML = `${verdict} ${badge(truth.level)}<br>Why: ${truth.reasons.join('; ')}. (+${s.points})${note}`;
  setEffect(fx);
  $('#nextCase').hidden = false;
  if (idx === nightCases.length - 1) $('#nextCase').textContent = 'See the shift report 📜';
});

function missedHtml(m) {
  const kind = m.kind === 'under'
    ? '🩸 Under-triaged'
    : '🕸️ Over-triaged';
  return `<li class="missed ${m.kind}">
    <div class="who"><span aria-hidden="true">${m.emoji}</span> ${m.name}</div>
    <div>${kind}: you chose ESI ${m.guess}, correct is ${badge(m.correctLevel)}</div>
    <p class="teach">${m.teachingPoint}</p>
  </li>`;
}

function renderReport() {
  const r = summarizeShift(answers);
  const max = r.total * 100;
  $('#caseNo').textContent = 'Shift over';
  $('#play').hidden = true;
  setEffect(null);
  const report = $('#shiftReport');
  report.innerHTML = `<h2 id="reportTitle" tabindex="-1">📜 Shift report</h2>
    <p class="final">Final score <strong>${r.score}</strong> of ${max}</p>
    <dl class="tally">
      <div><dt>✅ Correct</dt><dd>${r.correct}</dd></div>
      <div><dt>🩸 Under-triaged</dt><dd>${r.underTriage}</dd></div>
      <div><dt>🕸️ Over-triaged</dt><dd>${r.overTriage}</dd></div>
    </dl>
    ${r.missed.length
      ? `<h3>Missed cases</h3><ul class="missed-list">${r.missed.map(missedHtml).join('')}</ul>`
      : '<p>🕯️ A flawless night. Every monster went to the right bay.</p>'}
    <button id="newNight" class="ghost">Start a new night 🌙</button>`;
  report.hidden = false;
  $('#reportTitle').focus();
  $('#newNight').addEventListener('click', startNight);
}

function startNight() {
  nightCases = shuffled(CASES);
  idx = 0;
  score = 0;
  answers = [];
  $('#score').textContent = 'Score 0';
  $('#nextCase').textContent = 'Next patient ☠️';
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
});

renderCase();

// ---- calculator ----
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
    const r = triage(p);
    $('#calcResult').innerHTML = `${badge(r.level)}<br>Why: ${r.reasons.join('; ')}.${r.dangerZone ? ' ⚠️ Danger-zone vitals.' : ''}`;
  } catch (err) {
    $('#calcResult').textContent = `The spirits reject this input: ${err.message}`;
  }
});
