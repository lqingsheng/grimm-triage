// Storylines (task 21): two linked patients from the same incident who arrive in the same night.
// Pure module: no DOM, no storage, no randomness. The draw lives in src/night.js (drawNight).
//
// Storyline shape: { id, title: { en, 'zh-CN' }, cases: [firstId, secondId], epilogue: { en, 'zh-CN' } }
//   cases    - 2 case ids, in the order they arrive. Both live in src/cases.js like any case, flagged
//              storyline: '<id>', and are never drawn on their own.
//   epilogue - the teaching point shown in the shift report when the storyline appeared.
//
// Teaching point of every storyline: triage the patient in front of you, not the story. One
// incident can produce very different acuity, and a cluster can reveal a hidden cause.
import { scoreGuess } from './triage.js';
import { t, caseText, normalizeLang } from './i18n.js';

export const STORYLINES = [
  {
    id: 'moonlight-brawl',
    title: { en: 'Moonlight Brawl', 'zh-CN': '月下斗殴' },
    cases: ['werewolf-brawl-bite', 'vampire-stake-wound'],
    epilogue: {
      en: 'One scuffle, two very different patients: the bitten werewolf needed a few stitches, and the polite vampire was in shock. Good manners never set the triage level.',
      'zh-CN': '同一场斗殴，两位病情天差地别的患者：被咬的狼人缝几针就好，彬彬有礼的吸血鬼却已经休克。礼貌再周到，也不能决定分诊级别。',
    },
  },
  {
    id: 'counts-toothache',
    title: { en: 'The Count’s Toothache', 'zh-CN': '伯爵的牙疼' },
    cases: ['renfield-blister', 'dracula-ludwigs'],
    epilogue: {
      en: 'The toothache mentioned in passing became an airway emergency. A muffled “hot potato” voice plus drooling is an airway emergency: call the most experienced airway help early and keep the patient sitting up.',
      'zh-CN': '随口一提的牙疼，最后成了气道急症。说话含糊像“嘴里含着烫土豆”，再加上流口水，就是气道急症：尽早呼叫最有经验的气道团队，并让患者保持坐位。',
    },
  },
  {
    id: 'cauldron-hut',
    title: { en: 'The Cauldron Hut', 'zh-CN': '坩埚小屋' },
    cases: ['witch-cauldron-co', 'apprentice-co-coma'],
    epilogue: {
      en: 'Two patients from one closed hut, and the pulse oximeter read normal for both. A cluster of headaches from one place means think carbon monoxide: give high-flow oxygen, measure carboxyhaemoglobin and ask who else is still there.',
      'zh-CN': '两位患者来自同一间门窗紧闭的小屋，脉搏血氧仪读数却都正常。同一个地方冒出好几个头痛的人，就要想到一氧化碳中毒：给予高流量吸氧，测碳氧血红蛋白，并问清楚屋里还有谁。',
    },
  },
  {
    id: 'mrs-pooles',
    title: { en: 'The Strange Case at Mrs Poole’s', 'zh-CN': '普尔太太家的怪事' },
    cases: ['poole-scald', 'hyde-tincture'],
    epilogue: {
      en: 'The scalded hand was the small injury from a much bigger problem in that laboratory. Hyperthermia plus agitation is a danger sign, not just bad manners: sedate safely, cool actively and watch for seizures.',
      'zh-CN': '烫伤的手，只是那间实验室里一个大麻烦带出来的小伤。高热加躁动是危险信号，不只是脾气坏：安全镇静、积极降温，并警惕抽搐。',
    },
  },
  {
    id: 'trick-or-treat-twins',
    title: { en: 'Trick-or-Treat Twins', 'zh-CN': '讨糖双胞胎' },
    cases: ['ghost-twin-sweets', 'ghost-twin-battery'],
    epilogue: {
      en: 'Same night, same treat bag, very different emergencies. A swallowed button battery is an emergency even in a smiling child: x-ray at once, and ask about every battery-powered toy in the bag.',
      'zh-CN': '同一个晚上、同一袋糖，紧急程度却天差地别。误吞纽扣电池，哪怕孩子笑眯眯的也是急症：立即拍 X 线片，并问清楚糖袋里每一件带电池的玩具。',
    },
  },
];

export const storylineById = (id) => STORYLINES.find((s) => s.id === id) ?? null;

// The storyline in a night, if any: { storyline, indexes: [i, j] } with i < j (0-based), or null.
// A storyline counts only when all its cases are in the night.
export function storylineIn(night, storylines = STORYLINES) {
  for (const s of storylines) {
    const indexes = s.cases.map((id) => night.findIndex((c) => c?.id === id));
    if (indexes.every((i) => i >= 0)) return { storyline: s, indexes };
  }
  return null;
}

// For the card at night[index]: the earlier patient from the same incident, or null.
// Returns { storyline, linkedTo } where linkedTo is that earlier patient's 1-based number.
// Only the later card of a storyline gets a link; the first one is a patient like any other.
export function linkFor(night, index, storylines = STORYLINES) {
  const found = storylineIn(night, storylines);
  if (!found) return null;
  const pos = found.indexes.indexOf(index);
  if (pos < 1) return null;
  return { storyline: found.storyline, linkedTo: found.indexes[pos - 1] + 1 };
}

export const BADGE_ID = 'storylineBadge';
const pick = (text, lang) => text[normalizeLang(lang)] ?? text.en;

// Visible text of the storyline badge, also its accessible text (no icon-only meaning).
export function badgeText(link, lang) {
  return t('storyline.badge', lang, { title: pick(link.storyline.title, lang), n: link.linkedTo });
}

// Badge markup for the card at night[index], or '' when it is not a linked card. Static: no animation.
export function storylineBadgeHtml(night, index, lang) {
  const link = linkFor(night, index);
  if (!link) return '';
  return `<p class="storyline-badge" id="${BADGE_ID}"><span aria-hidden="true">🔗 </span>${badgeText(link, lang)}</p>`;
}

// Shift-report summary for the storyline of a night, from the answers in the order played
// ({ case, guess, level }, as for summarizeShift). Returns null when no storyline appeared, else
// { storyline, patients: [{ case, n, underTriage }], underTriaged } where n is the 1-based patient
// number and underTriaged is true when any of its patients was under-triaged.
export function storylineReport(answers, storylines = STORYLINES) {
  if (!Array.isArray(answers)) throw new TypeError('answers must be an array');
  const found = storylineIn(answers.map((a) => a?.case), storylines);
  if (!found) return null;
  const patients = found.indexes.map((i) => {
    const a = answers[i];
    return { case: a.case, n: i + 1, underTriage: scoreGuess(a.guess, a.level).underTriage };
  });
  return { storyline: found.storyline, patients, underTriaged: patients.some((p) => p.underTriage) };
}

// The Storyline section of the shift report, or '' when no storyline appeared. Static markup.
export function storylineReportHtml(answers, lang) {
  const r = storylineReport(answers);
  if (!r) return '';
  const tr = (key, vars) => t(key, lang, vars);
  const items = r.patients.map((p) => {
    const tag = p.underTriage ? ` <span class="storyline-under">${tr('storyline.report.underTag')}</span>` : '';
    return `<li>${tr('storyline.report.patient', { n: p.n, name: caseText(p.case, lang).name })}${tag}</li>`;
  }).join('');
  return `<section class="storyline-report" aria-labelledby="storylineTitle">
    <h3 id="storylineTitle"><span aria-hidden="true">📖 </span>${tr('storyline.report.heading', { title: pick(r.storyline.title, lang) })}</h3>
    <ul class="storyline-patients">${items}</ul>
    <p class="storyline-verdict">${tr(r.underTriaged ? 'storyline.report.anyUnder' : 'storyline.report.noneUnder')}</p>
    <p class="storyline-epilogue"><strong>${tr('storyline.report.epilogue')}</strong> ${pick(r.storyline.epilogue, lang)}</p>
    <p class="storyline-rule">${tr('storyline.report.rule')}</p>
  </section>`;
}
