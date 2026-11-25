// Inline help for the Triage Desk judgement fields (task 16).
// Pure module: builds markup and counts resources; src/app.js inserts it and handles clicks.
//
// Each help is a button (aria-expanded, aria-controls) plus a panel under the field.
// The resource checklist reuses RESOURCE_COUNTS / RESOURCE_NOT and their strings from the
// shift-report lesson (src/lesson.js), so the desk and the lesson can never disagree.
import { RESOURCE_COUNTS, RESOURCE_NOT } from './lesson.js';
import { OPTIONAL_VITALS, PEDIATRIC_DANGER } from './triage.js';

// Field name in the form -> label string key and help content.
export const HELP_FIELDS = {
  pain: { label: 'calc.pain', id: 'help-pain' },
  resources: { label: 'calc.resources', id: 'help-resources' },
  highRisk: { label: 'calc.highRisk', id: 'help-highRisk' },
  needsLifesaving: { label: 'calc.needsLifesaving', id: 'help-needsLifesaving' },
  newConfusion: { label: 'calc.newConfusion', id: 'help-newConfusion' },
};

// A complex procedure (e.g. procedural sedation) counts as 2 resources; every other type counts 1.
export const RESOURCE_WEIGHT = { complex: 2 };

// Number of resources for the ticked types. Each type counts once, however often it is listed.
export function countResources(ticked) {
  return [...new Set(ticked)].filter((k) => RESOURCE_COUNTS.includes(k)).reduce((n, k) => n + (RESOURCE_WEIGHT[k] ?? 1), 0);
}

const HIGH_RISK_EXAMPLES = ['chest', 'stroke', 'suicidal', 'ectopic', 'torsion', 'headache', 'immuno', 'sepsis', 'overdose', 'trauma', 'assault', 'eye'];
const LIFESAVING_GROUPS = ['airway', 'electrical', 'procedures', 'circulation', 'meds'];
const PAIN_AGES = ['numeric', 'faces', 'flacc'];

export const HELP_KEYS = [
  'help.button',
  'help.pain.title', 'help.pain.ask', 'help.pain.ageTitle', ...PAIN_AGES.map((k) => `help.pain.age.${k}`), 'help.pain.look', 'help.pain.esi',
  'help.resources.title', 'help.resources.rule', 'help.resources.tick', 'help.resources.total',
  'help.highRisk.title', 'help.highRisk.what', 'help.highRisk.examples', ...HIGH_RISK_EXAMPLES.map((k) => `help.highRisk.ex.${k}`),
  'help.lifesaving.title', 'help.lifesaving.ask', ...LIFESAVING_GROUPS.map((k) => `help.lifesaving.${k}`), 'help.lifesaving.notTitle', 'help.lifesaving.not',
  'help.confusion.title', 'help.confusion.what', 'help.confusion.avpu',
];

const ul = (items) => `<ul>${items.map((s) => `<li>${s}</li>`).join('')}</ul>`;

function bodyHtml(field, tr, ticked) {
  switch (field) {
    case 'pain':
      return `<p>${tr('help.pain.ask')}</p>
        <h4>${tr('help.pain.ageTitle')}</h4>${ul(PAIN_AGES.map((k) => tr(`help.pain.age.${k}`)))}
        <p>${tr('help.pain.look')}</p><p class="help-esi">${tr('help.pain.esi')}</p>`;
    case 'resources': {
      const boxes = RESOURCE_COUNTS.map((k) => `<li><label class="chk"><input type="checkbox" data-resource="${k}"${ticked.includes(k) ? ' checked' : ''}> <span>${tr(`lesson.counts.${k}`)}</span></label></li>`).join('');
      return `<p class="help-rule">${tr('help.resources.rule')}</p>
        <p>${tr('help.resources.tick')}</p>
        <fieldset class="resource-check"><legend>${tr('lesson.counts')}</legend><ul>${boxes}</ul></fieldset>
        <p class="resource-total" aria-live="polite">${tr('help.resources.total', { count: countResources(ticked) })}</p>
        <h4>${tr('lesson.notCounts')}</h4>${ul(RESOURCE_NOT.map((k) => tr(`lesson.not.${k}`)))}
        <p class="help-missing">${tr('lesson.missingVitals')}</p>`;
    }
    case 'highRisk':
      return `<p>${tr('help.highRisk.what')}</p><h4>${tr('help.highRisk.examples')}</h4>${ul(HIGH_RISK_EXAMPLES.map((k) => tr(`help.highRisk.ex.${k}`)))}`;
    case 'needsLifesaving':
      return `<p>${tr('help.lifesaving.ask')}</p>${ul(LIFESAVING_GROUPS.map((k) => tr(`help.lifesaving.${k}`)))}
        <h4>${tr('help.lifesaving.notTitle')}</h4><p>${tr('help.lifesaving.not')}</p>`;
    case 'newConfusion':
      return `<p>${tr('help.confusion.what')}</p><p>${tr('help.confusion.avpu')}</p>`;
    default:
      throw new RangeError(`no help for ${field}`);
  }
}

const TITLES = { pain: 'help.pain.title', resources: 'help.resources.title', highRisk: 'help.highRisk.title', needsLifesaving: 'help.lifesaving.title', newConfusion: 'help.confusion.title' };

// Button that sits next to the field label.
export function helpButtonHtml(field, tr, open = false) {
  const { label, id } = HELP_FIELDS[field];
  return `<button type="button" class="help-btn" data-help="${field}" aria-expanded="${open}" aria-controls="${id}" aria-label="${tr('help.button', { field: tr(label) })}"><span aria-hidden="true">ⓘ</span></button>`;
}

// Panel under the field. Hidden unless open; a labelled region so screen readers can find it.
export function helpPanelHtml(field, tr, { open = false, ticked = [] } = {}) {
  const { id } = HELP_FIELDS[field];
  return `<div class="help-panel" id="${id}" role="region" aria-labelledby="${id}-title"${open ? '' : ' hidden'}>
    <h3 id="${id}-title">${tr(TITLES[field])}</h3>
    ${bodyHtml(field, tr, ticked)}
  </div>`;
}

// ---- Incomplete vital signs (task 17) ----
export const MISSING_REASONS = ['refused', 'agitated', 'equipment', 'failed', 'other'];
export const WARNING_ID = 'calcWarning';

// Parse one optional vital from the form: blank means not measured (null); anything else is a
// number, and a non-number is passed on as NaN so triage() reports it as an input error.
export function parseVital(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return null;
  return Number(raw);
}

// The engine's youngest band (< 3 months), so the infant line uses the same age cut-off as triage().
export const YOUNG_INFANT_MAX_AGE = PEDIATRIC_DANGER[0].maxAgeYears;

// Warning for a triage() result with missing vitals: what is missing (with the reason, if one was
// given) and what to do. '' when nothing is missing. `reasons` maps a vital key to a MISSING_REASONS value.
// Under 3 months with no temperature it adds a stronger line (clinical review, PR #12); the level
// is not changed.
export function missingWarningHtml(result, reasons, tr, ageYears = null) {
  if (!result.missing?.length) return '';
  const items = result.missing.map((k) => {
    const vital = tr(`calc.vitalName.${k}`);
    return MISSING_REASONS.includes(reasons?.[k]) ? tr('calc.missingItem', { vital, reason: tr(`calc.reasonShort.${reasons[k]}`) }) : vital;
  });
  const infant = result.missing.includes('tempC') && Number.isFinite(ageYears) && ageYears < YOUNG_INFANT_MAX_AGE
    ? `<span class="infant-temp">${tr('calc.infantTemp')}</span>` : '';
  return `<p class="missing-warning" id="${WARNING_ID}" role="note">${tr('calc.missing', { list: items.join(tr('calc.missingSep')) })} <strong>${tr('calc.missingAction')}</strong>${infant}</p>`;
}

// "Provisional" tag shown next to the level badge when step D could not be completed.
export const provisionalTagHtml = (result, tr) => (result.provisional ? ` <span class="provisional-tag">${tr('calc.provisional')}</span>` : '');

export { OPTIONAL_VITALS };

