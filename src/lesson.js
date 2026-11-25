// "ESI v4 in 2 minutes": the teaching section at the end of the shift report (task 15).
// Pure module: builds markup from the strings table and the engine's own thresholds, so the
// lesson can never disagree with triage(). No DOM access; src/app.js inserts the result.
//
// lessonHtml({ tr, badge, missed, open }) -> '<details class="lesson">…</details>'
//   tr     - (key, vars) => translated string (t() bound to the current language)
//   badge  - (level) => markup for an ESI level badge
//   missed - summarizeShift(...).missed, each with `step` from decisionPointFor()
//   open   - render the <details> open (app.js: after any under-triage, or if the player opened it)
import { ADULT_DANGER, PEDIATRIC_DANGER } from './triage.js';
import { STEPS, stepSummary } from './shift.js';

// Strings that contain < or > as comparison signs are plain text: escape them for HTML.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const RESOURCE_COUNTS = ['labs', 'ecg', 'xray', 'imaging', 'fluids', 'meds', 'consult', 'simple', 'complex'];
export const RESOURCE_NOT = ['exam', 'poct', 'lock', 'oral', 'tetanus', 'refill', 'wound', 'aids', 'call'];

// Table rows, oldest band first. PEDIATRIC_DANGER is ordered youngest first: [< 3 months,
// 3 months to 3 years, 3 to 8 years].
export function dangerRows() {
  const [infant, toddler, child] = PEDIATRIC_DANGER;
  return [
    { band: 'adult', ...ADULT_DANGER },
    { band: 'child', hr: child.hr, rr: child.rr, spo2: child.spo2 },
    { band: 'toddler', hr: toddler.hr, rr: toddler.rr, spo2: toddler.spo2 },
    { band: 'infant', hr: infant.hr, rr: infant.rr, spo2: infant.spo2 },
  ];
}

const stepsHtml = (tr) => `<ol class="lesson-steps">${STEPS.map((s) => `<li>
      <span class="step-label">${tr('lesson.step', { step: s })}</span>
      <span class="step-q">${tr(`lesson.step${s}.q`)}</span>
      <span class="step-a">${tr(`lesson.step${s}.a`)}</span>
    </li>`).join('')}</ol>`;

const listHtml = (tr, prefix, keys) => `<ul>${keys.map((k) => `<li>${tr(`${prefix}.${k}`)}</li>`).join('')}</ul>`;

const tableHtml = (tr) => `<table class="danger-table">
    <caption>${tr('lesson.vitalsCaption')}</caption>
    <thead><tr><th scope="col">${tr('lesson.age')}</th><th scope="col">${tr('lesson.hrHead')}</th><th scope="col">${tr('lesson.rrHead')}</th><th scope="col">${tr('lesson.spo2Head')}</th></tr></thead>
    <tbody>${dangerRows().map((r) => `<tr><th scope="row">${tr(`lesson.band.${r.band}`)}</th><td data-vital="hr">${esc(tr('lesson.above', { n: r.hr }))}</td><td data-vital="rr">${esc(tr('lesson.above', { n: r.rr }))}</td><td data-vital="spo2">${esc(tr('lesson.belowPct', { n: r.spo2 }))}</td></tr>`).join('')}</tbody>
  </table>`;

function wrongHtml(tr, badge, missed) {
  const sum = stepSummary(missed);
  let line;
  if (sum.total === 0) line = tr('lesson.wrongNone');
  else if (sum.total === 1 && sum.top) line = tr('lesson.wrongOne', { step: sum.top });
  else if (sum.top) line = tr('lesson.wrongCount', { count: sum.topCount, total: sum.total, step: sum.top });
  else line = '';
  const items = missed.filter((m) => m.step).map((m) => `<li>${tr('lesson.wrongItem', {
    name: m.displayName ?? m.name, badge: badge(m.correctLevel), step: m.step, stepName: tr(`lesson.stepName.${m.step}`),
  })}</li>`).join('');
  return `<p class="wrong-count">${line}</p>${items ? `<ul class="wrong-list">${items}</ul>` : ''}`;
}

export function lessonHtml({ tr, badge, missed = [], open = false }) {
  return `<details class="lesson" id="lesson"${open ? ' open' : ''}>
  <summary>${tr('lesson.summary')}</summary>
  <div class="lesson-body">
    <h3 id="lessonSteps">${tr('lesson.stepsTitle')}</h3>
    ${stepsHtml(tr)}
    <h3 id="lessonResources">${tr('lesson.resourcesTitle')}</h3>
    <p>${tr('lesson.resourcesIntro')}</p>
    <div class="resource-lists">
      <div><h4>${tr('lesson.counts')}</h4>${listHtml(tr, 'lesson.counts', RESOURCE_COUNTS)}</div>
      <div><h4>${tr('lesson.notCounts')}</h4>${listHtml(tr, 'lesson.not', RESOURCE_NOT)}</div>
    </div>
    <h3 id="lessonVitals">${tr('lesson.vitalsTitle')}</h3>
    ${tableHtml(tr)}
    <h3 id="lessonWrong">${tr('lesson.wrongTitle')}</h3>
    ${wrongHtml(tr, badge, missed)}
    <p class="lesson-note">${esc(tr('lesson.note'))}</p>
    <p class="lesson-source">${tr('lesson.source')}</p>
  </div>
</details>`;
}
