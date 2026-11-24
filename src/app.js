import { triage, scoreGuess, isDangerZone, LEVEL_NAMES } from './triage.js';
import { CASES } from './cases.js';

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

function vitalsHtml(p) {
  const dz = isDangerZone(p);
  const cell = (label, val, danger) => `<div class="${danger ? 'danger' : ''}">${label} ${val}</div>`;
  return `<div class="vitals">
    ${cell('AVPU', p.avpu, p.avpu !== 'A')}
    ${cell('HR', p.hr, dz && p.hr > 100)}
    ${cell('RR', p.rr, dz && p.rr > 20)}
    ${cell('BP', `${p.sbp} sys`, p.sbp < 90)}
    ${cell('SpO₂', `${p.spo2}%`, p.spo2 < 92)}
    ${cell('T', `${p.tempC}°C`, p.tempC >= 38.5 || p.tempC < 35)}
    ${cell('Pain', `${p.pain}/10`, p.pain >= 7)}
    ${cell('Resources', p.resources, false)}
  </div>`;
}

function renderCase() {
  const c = CASES[idx];
  answered = false;
  $('#caseNo').textContent = `Patient ${idx + 1} of ${CASES.length}`;
  $('#caseCard').innerHTML = `<span class="emoji" aria-hidden="true">${c.emoji}</span>
    <div class="who">${c.name}</div><p>${c.story}</p>${vitalsHtml(c.patient)}`;
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
  const truth = triage(CASES[idx].patient);
  const s = scoreGuess(guess, truth.level);
  score += s.points;
  $('#score').textContent = `Score ${score}`;
  const verdict = s.points === 100 ? '✅ Correct!' : s.underTriage ? '🩸 Under-triage: this monster is sicker than you thought.' : '🕸️ Over-triage: safe, but you used a resus bay.';
  $('#feedback').innerHTML = `${verdict} ${badge(truth.level)}<br>Why: ${truth.reasons.join('; ')}. (+${s.points})`;
  $('#nextCase').hidden = false;
  if (idx === CASES.length - 1) $('#nextCase').textContent = 'Start a new night 🌙';
});

$('#nextCase').addEventListener('click', () => {
  if (idx === CASES.length - 1) { idx = 0; score = 0; $('#score').textContent = 'Score 0'; $('#nextCase').textContent = 'Next patient ☠️'; }
  else idx += 1;
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
