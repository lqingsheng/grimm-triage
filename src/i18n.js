// UI strings table and translation helpers for the English / 中文 toggle.
// Pure module: no DOM, no storage. src/app.js applies the strings and remembers the choice.
//
// STRINGS[key] = { en, 'zh-CN' }. Values may contain {name} placeholders filled by t(key, lang, vars).
// Chinese uses standard emergency-medicine terms (急诊分诊, 生命体征, 收缩压, 血氧饱和度, 休克 ...).
// ESI level numbers are never translated or changed.
//
// The triage engine (src/triage.js) stays English-only and unchanged: translateReason() and
// translateError() map its fixed message patterns to Chinese. test/i18n.test.js checks that every
// message the engine can produce has a translation.

export const LANGS = ['en', 'zh-CN'];
export const DEFAULT_LANG = 'en';
export const STORAGE_KEY = 'grimm-triage-lang';

export const normalizeLang = (lang) => (LANGS.includes(lang) ? lang : DEFAULT_LANG);

export const STRINGS = {
  // ---- page shell ----
  'doc.title': { en: "Grimm Triage: Night Shift at St. Grimm's ER", 'zh-CN': '格林分诊：圣格林急诊科夜班' },
  'header.title': { en: "St. Grimm's ER", 'zh-CN': '圣格林急诊科' },
  'header.subtitle': { en: 'Night Shift', 'zh-CN': '夜班' },
  'header.tag': {
    en: 'Learn real emergency triage by sorting monsters. The costume is fake. The logic is real.',
    'zh-CN': '给怪物分诊，学习真实的急诊分诊。装扮是假的，逻辑是真的。',
  },
  'nav.label': { en: 'Mode', 'zh-CN': '模式' },
  'nav.game': { en: 'Night Shift (game)', 'zh-CN': '夜班（游戏）' },
  'nav.calc': { en: 'Triage Desk (calculator)', 'zh-CN': '分诊台（计算器）' },
  'lang.label': { en: 'Language', 'zh-CN': '语言' },
  'sound.toggle': { en: 'Sound effects', 'zh-CN': '音效' },
  'skip.main': { en: 'Skip to main content', 'zh-CN': '跳到主要内容' },
  'section.game': { en: 'Night Shift game', 'zh-CN': '夜班游戏' },
  'section.calc': { en: 'Triage Desk calculator', 'zh-CN': '分诊台计算器' },
  'footer.disclaimer': {
    en: 'Educational demo only. Not a medical device. Never use for real patient care.',
    'zh-CN': '仅供教学演示，不是医疗器械。切勿用于真实患者诊疗。',
  },
  'footer.basis': {
    en: 'Based on the logic of the Emergency Severity Index (ESI) v4.',
    'zh-CN': '基于急诊严重指数（ESI）第 4 版的分诊逻辑。',
  },

  // ---- triage levels (numbers stay the same in every language) ----
  'level.1': { en: 'Resuscitation', 'zh-CN': '复苏' },
  'level.2': { en: 'Emergent', 'zh-CN': '危急' },
  'level.3': { en: 'Urgent', 'zh-CN': '紧急' },
  'level.4': { en: 'Less urgent', 'zh-CN': '次紧急' },
  'level.5': { en: 'Non-urgent', 'zh-CN': '非紧急' },
  'level.badge': { en: 'ESI {level} · {name}', 'zh-CN': 'ESI {level} 级 · {name}' },
  // Accessible name of a level button. It must contain the visible text "{level} {name}" in
  // order (WCAG 2.5.3 Label in Name), so speech-input users can say what they see.
  'level.button': { en: 'Triage level {level}: {name}', 'zh-CN': '分诊级别 {level}：{name}' },
  'level.group': { en: 'Choose a triage level', 'zh-CN': '选择分诊级别' },

  // ---- game ----
  'game.caseNo': { en: 'Patient {n} of {total}', 'zh-CN': '第 {n} 位患者，共 {total} 位' },
  'game.score': { en: 'Score {score}', 'zh-CN': '得分 {score}' },
  'game.next': { en: 'Next patient ☠️', 'zh-CN': '下一位患者 ☠️' },
  'game.toReport': { en: 'See the shift report 📜', 'zh-CN': '查看交班报告 📜' },
  'game.correct': { en: '✅ Correct!', 'zh-CN': '✅ 正确！' },
  'game.under': {
    en: '🩸 Under-triage: this monster is sicker than you thought.',
    'zh-CN': '🩸 分诊不足：这只怪物病情比你判断的更重。',
  },
  'game.over': {
    en: '🕸️ Over-triage: safe, but you used a resus bay.',
    'zh-CN': '🕸️ 分诊过度：安全，但你占用了一张抢救床。',
  },
  'game.why': { en: 'Why: {reasons}.', 'zh-CN': '依据：{reasons}。' },
  'game.reasonSep': { en: '; ', 'zh-CN': '；' },
  'feedback.label': { en: 'Triage feedback', 'zh-CN': '分诊反馈' },
  'game.points': { en: '(+{points})', 'zh-CN': '（+{points} 分）' },
  'fx.under': {
    en: '🩸 The ward lights bleed red: this patient is sicker than your call.',
    'zh-CN': '🩸 病房灯光渗出血红：这位患者比你的判断更危重。',
  },
  'fx.correct': {
    en: '🕯️ The candles flare: the right bay for this monster.',
    'zh-CN': '🕯️ 烛光骤亮：这只怪物进了正确的诊区。',
  },

  // ---- vital-sign labels on the case card ----
  'vital.avpu': { en: 'AVPU', 'zh-CN': '意识（AVPU）' },
  'vital.hr': { en: 'HR', 'zh-CN': '心率' },
  'vital.rr': { en: 'RR', 'zh-CN': '呼吸频率' },
  'vital.bp': { en: 'BP', 'zh-CN': '收缩压' },
  'vital.bpValue': { en: '{sbp} sys', 'zh-CN': '{sbp} mmHg' },
  'vital.spo2': { en: 'SpO₂', 'zh-CN': '血氧饱和度' },
  'vital.temp': { en: 'T', 'zh-CN': '体温' },
  'vital.pain': { en: 'Pain', 'zh-CN': '疼痛' },
  'vital.resources': { en: 'Resources', 'zh-CN': '资源' },

  // ---- shift report ----
  'report.over': { en: 'Shift over', 'zh-CN': '夜班结束' },
  'report.title': { en: '📜 Shift report', 'zh-CN': '📜 交班报告' },
  'report.final': { en: 'Final score <strong>{score}</strong> of {max}', 'zh-CN': '最终得分 <strong>{score}</strong> / {max}' },
  'report.correct': { en: '✅ Correct', 'zh-CN': '✅ 正确' },
  'report.under': { en: '🩸 Under-triaged', 'zh-CN': '🩸 分诊不足' },
  'report.overTriaged': { en: '🕸️ Over-triaged', 'zh-CN': '🕸️ 分诊过度' },
  'report.missed': { en: 'Missed cases', 'zh-CN': '判断失误的病例' },
  'report.seenVitals': { en: 'Vital signs you saw:', 'zh-CN': '你看到的生命体征：' },
  'report.missedLine': {
    en: '{kind}: you chose ESI {guess}, correct is {badge}',
    'zh-CN': '{kind}：你选择了 ESI {guess} 级，正确答案是 {badge}',
  },
  'report.flawless': {
    en: '🕯️ A flawless night. Every monster went to the right bay.',
    'zh-CN': '🕯️ 完美的一夜。每只怪物都进了正确的诊区。',
  },
  'report.newNight': { en: 'Start a new night 🌙', 'zh-CN': '开始新的夜班 🌙' },

  // ---- "ESI v4 in 2 minutes" lesson in the shift report (task 15, src/lesson.js) ----
  // Written in our own words as a summary of the ESI Implementation Handbook v4; no handbook text.
  'lesson.summary': { en: 'Learn ESI v4 in 2 minutes', 'zh-CN': '2 分钟学会 ESI 第 4 版' },
  'lesson.stepsTitle': { en: 'The algorithm in 4 steps', 'zh-CN': '分诊流程四步走' },
  'lesson.step': { en: 'Step {step}', 'zh-CN': '第 {step} 步' },
  'lesson.stepTag': { en: 'step {step}', 'zh-CN': '第 {step} 步' },
  'lesson.stepA.q': { en: 'Does the patient need an immediate life-saving intervention?', 'zh-CN': '患者是否需要立即实施抢救性干预？' },
  'lesson.stepA.a': { en: 'Yes: ESI 1.', 'zh-CN': '是：ESI 1 级。' },
  'lesson.stepB.q': {
    en: 'Should this patient not wait? That means a high-risk situation, new confusion, lethargy or disorientation, or severe pain or distress.',
    'zh-CN': '这位患者是否不能等待？即属于高危情况、新发意识混乱、嗜睡或定向障碍，或有剧烈疼痛或明显痛苦。',
  },
  'lesson.stepB.a': { en: 'Yes: ESI 2.', 'zh-CN': '是：ESI 2 级。' },
  'lesson.stepC.q': { en: 'How many different resources will the patient need?', 'zh-CN': '患者需要多少种不同的资源？' },
  'lesson.stepC.a': { en: 'None: ESI 5. One: ESI 4. Two or more: go on to step D.', 'zh-CN': '不需要：ESI 5 级。1 种：ESI 4 级。2 种及以上：进入第 D 步。' },
  'lesson.stepD.q': { en: 'Are the vital signs in the danger zone?', 'zh-CN': '生命体征是否处于危险区？' },
  'lesson.stepD.a': { en: 'Yes: consider ESI 2. No: ESI 3.', 'zh-CN': '是：考虑 ESI 2 级。否：ESI 3 级。' },
  'lesson.stepName.A': { en: 'life-saving intervention', 'zh-CN': '抢救性干预' },
  'lesson.stepName.B': { en: 'should not wait', 'zh-CN': '不能等待' },
  'lesson.stepName.C': { en: 'resources', 'zh-CN': '资源数量' },
  'lesson.stepName.D': { en: 'danger-zone vital signs', 'zh-CN': '危险区生命体征' },

  'lesson.resourcesTitle': { en: 'What counts as a resource', 'zh-CN': '什么算作资源' },
  'lesson.resourcesIntro': { en: 'Count each different type once, however many tests or doses of it the patient gets.', 'zh-CN': '每一类资源只计 1 次，无论同类检查或用药做了多少项。' },
  'lesson.counts': { en: 'Counts', 'zh-CN': '算作资源' },
  'lesson.counts.labs': { en: 'Laboratory tests (blood, urine)', 'zh-CN': '实验室检查（血液、尿液）' },
  'lesson.counts.ecg': { en: 'ECG', 'zh-CN': '心电图' },
  'lesson.counts.xray': { en: 'X-ray', 'zh-CN': 'X 线' },
  'lesson.counts.imaging': { en: 'CT, MRI or ultrasound', 'zh-CN': 'CT、磁共振或超声' },
  'lesson.counts.fluids': { en: 'IV fluids', 'zh-CN': '静脉补液' },
  'lesson.counts.meds': { en: 'IV, IM or nebulised medication', 'zh-CN': '静脉、肌内或雾化给药' },
  'lesson.counts.consult': { en: 'Specialty consultation', 'zh-CN': '专科会诊' },
  'lesson.counts.simple': { en: 'Simple procedure counts as 1 (for example, laceration repair or a urinary catheter)', 'zh-CN': '简单操作计 1 项（例如伤口缝合或留置导尿）' },
  'lesson.counts.complex': { en: 'Complex procedure counts as 2 (for example, procedural sedation)', 'zh-CN': '复杂操作计 2 项（例如程序化镇静）' },
  'lesson.notCounts': { en: 'Does not count', 'zh-CN': '不算资源' },
  'lesson.not.exam': { en: 'History and physical examination', 'zh-CN': '病史采集和体格检查' },
  'lesson.not.poct': { en: 'Point-of-care testing (for example, a finger-prick glucose)', 'zh-CN': '床旁快速检测（例如指尖血糖）' },
  'lesson.not.lock': { en: 'Saline lock (an IV cannula with nothing running)', 'zh-CN': '肝素帽或封管（留置针但不输液）' },
  'lesson.not.oral': { en: 'Oral medication', 'zh-CN': '口服药物' },
  'lesson.not.tetanus': { en: 'Tetanus vaccination', 'zh-CN': '破伤风疫苗接种' },
  'lesson.not.refill': { en: 'Prescription refill', 'zh-CN': '续开处方' },
  'lesson.not.wound': { en: 'Simple wound care (dressings, wound checks)', 'zh-CN': '简单伤口护理（换药、伤口检查）' },
  'lesson.not.aids': { en: 'Crutches, splints and slings', 'zh-CN': '拐杖、夹板和吊带' },
  'lesson.not.call': { en: 'A phone call to the family doctor', 'zh-CN': '给家庭医生打电话' },

  'lesson.vitalsTitle': { en: 'Danger-zone vital signs', 'zh-CN': '危险区生命体征' },
  'lesson.vitalsCaption': {
    en: 'At step D, consider ESI 2 if any one value is beyond the limit for the patient’s age.',
    'zh-CN': '在第 D 步，只要任一数值超出该年龄段的界限，就应考虑 ESI 2 级。',
  },
  'lesson.age': { en: 'Age', 'zh-CN': '年龄' },
  'lesson.hrHead': { en: 'HR (/min)', 'zh-CN': '心率（次/分）' },
  'lesson.rrHead': { en: 'RR (/min)', 'zh-CN': '呼吸频率（次/分）' },
  'lesson.spo2Head': { en: 'SpO₂', 'zh-CN': '血氧饱和度' },
  'lesson.band.adult': { en: 'Adult (over 8 years)', 'zh-CN': '成人（8 岁以上）' },
  'lesson.band.child': { en: '3 to 8 years', 'zh-CN': '3 至 8 岁' },
  'lesson.band.toddler': { en: '3 months to 3 years', 'zh-CN': '3 月龄至 3 岁' },
  'lesson.band.infant': { en: 'Under 3 months', 'zh-CN': '3 月龄以下' },
  'lesson.above': { en: '> {n}', 'zh-CN': '> {n}' },
  'lesson.belowPct': { en: '< {n}%', 'zh-CN': '< {n}%' },

  'lesson.wrongTitle': { en: 'Where your shift went wrong', 'zh-CN': '这一班错在哪里' },
  'lesson.wrongItem': { en: '{name}: {badge}, decided at step {step} ({stepName})', 'zh-CN': '{name}：{badge}，决定于第 {step} 步（{stepName}）' },
  'lesson.wrongCount': { en: '{count} of your {total} misses were at step {step}.', 'zh-CN': '你的 {total} 次失误中，有 {count} 次发生在第 {step} 步。' },
  'lesson.wrongOne': { en: 'Your one miss was at step {step}.', 'zh-CN': '你唯一的一次失误发生在第 {step} 步。' },
  'lesson.wrongNone': { en: 'No misses tonight: every case was decided at the right step.', 'zh-CN': '今晚没有失误：每个病例都在正确的步骤上作出了判断。' },

  'lesson.note': {
    en: 'The numeric level-1 cut-offs in this game (SpO2 < 85%, RR < 8, HR < 40, SBP < 70) are teaching simplifications. ESI v4 decides level 1 by the need for an immediate life-saving intervention.',
    'zh-CN': '本游戏中 1 级的数值界限（血氧饱和度 < 85%、呼吸频率 < 8、心率 < 40、收缩压 < 70）是教学上的简化。ESI 第 4 版根据是否需要立即实施抢救性干预来判定 1 级。',
  },
  'lesson.source': {
    en: 'Summarised from the ESI Implementation Handbook, version 4 (AHRQ / ENA). Educational use only.',
    'zh-CN': '摘要整理自《急诊严重指数（ESI）实施手册》第 4 版（美国医疗保健研究与质量局 / 美国急诊护士协会）。仅供教学使用。',
  },

  // ---- Triage Desk calculator ----
  'calc.age': { en: 'Age (years)', 'zh-CN': '年龄（岁）' },
  'calc.avpu': { en: 'AVPU', 'zh-CN': '意识（AVPU）' },
  'calc.avpu.A': { en: 'A', 'zh-CN': 'A 清醒' },
  'calc.avpu.V': { en: 'V', 'zh-CN': 'V 对声音有反应' },
  'calc.avpu.P': { en: 'P', 'zh-CN': 'P 对疼痛有反应' },
  'calc.avpu.U': { en: 'U', 'zh-CN': 'U 无反应' },
  'calc.hr': { en: 'HR (/min)', 'zh-CN': '心率（次/分）' },
  'calc.rr': { en: 'RR (/min)', 'zh-CN': '呼吸频率（次/分）' },
  'calc.sbp': { en: 'SBP (mmHg)', 'zh-CN': '收缩压（mmHg）' },
  'calc.spo2': { en: 'SpO₂ (%)', 'zh-CN': '血氧饱和度（%）' },
  'calc.temp': { en: 'Temp (°C)', 'zh-CN': '体温（°C）' },
  'calc.pain': { en: 'Pain (0–10)', 'zh-CN': '疼痛评分（0–10）' },
  'calc.resources': { en: 'Expected resources', 'zh-CN': '预计所需资源数' },
  'calc.newConfusion': { en: 'New confusion / lethargy', 'zh-CN': '新发意识混乱 / 嗜睡' },
  'calc.highRisk': { en: 'High-risk complaint', 'zh-CN': '高危主诉' },
  'calc.needsLifesaving': { en: 'Needs life-saving intervention now', 'zh-CN': '需要立即实施抢救性干预' },
  'calc.submit': { en: 'Summon triage level 🔮', 'zh-CN': '召唤分诊级别 🔮' },
  'calc.form': { en: 'Patient findings', 'zh-CN': '患者检查结果' },
  'calc.result': { en: 'Triage result', 'zh-CN': '分诊结果' },
  'calc.dangerZone': { en: '⚠️ Danger-zone vitals.', 'zh-CN': '⚠️ 生命体征处于危险区。' },
  'calc.error': { en: 'The spirits reject this input: {message}', 'zh-CN': '幽灵拒绝了这些输入：{message}' },
};

// t(key, lang, vars): look up a string and fill {placeholders}. Unknown keys return the key itself,
// so a missing string is visible in the UI and caught by the browser check.
export function t(key, lang = DEFAULT_LANG, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  const text = entry[normalizeLang(lang)] ?? entry[DEFAULT_LANG];
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export const levelName = (level, lang) => t(`level.${level}`, lang);

// ---- case and portrait text ----
// Each case carries its Chinese text in cases.js as `zh: { name, story, teachingPoint }`.
export function caseText(c, lang) {
  const zh = normalizeLang(lang) === 'zh-CN' ? c.zh : null;
  return {
    name: zh?.name ?? c.name,
    story: zh?.story ?? c.story,
    teachingPoint: zh?.teachingPoint ?? c.teachingPoint,
  };
}

// ---- triage engine messages ----
// Danger-zone band labels from dangerThresholds() in src/triage.js.
const BAND_LABELS_ZH = {
  'age < 3 months': '年龄 < 3 个月',
  'age 3 months to 3 years': '3 个月至 3 岁',
  'age 3 to 8 years': '3 至 8 岁',
  'adult, age > 8 years': '成人（年龄 > 8 岁）',
};

// [pattern, Chinese builder] for every reason string triage() can return.
const REASONS_ZH = [
  [/^needs an immediate life-saving intervention$/, () => '需要立即实施抢救性干预'],
  [/^unresponsive \(AVPU = U\)$/, () => '无反应（AVPU = U）'],
  [/^SpO2 (.+)% < 85%$/, (v) => `血氧饱和度 ${v}% < 85%`],
  [/^RR (.+)\/min < 8$/, (v) => `呼吸频率 ${v} 次/分 < 8`],
  [/^HR (.+)\/min < 40$/, (v) => `心率 ${v} 次/分 < 40`],
  [/^SBP (.+) mmHg < 70$/, (v) => `收缩压 ${v} mmHg < 70`],
  [/^high-risk complaint$/, () => '高危主诉'],
  [/^altered responsiveness \(AVPU = ([VP])\)$/, (v) => `意识反应改变（AVPU = ${v}）`],
  [/^new confusion or lethargy$/, () => '新发意识混乱或嗜睡'],
  [/^severe pain (.+)\/10$/, (v) => `重度疼痛 ${v}/10`],
  [
    /^2\+ resources with danger-zone vital signs \((.+) thresholds\)$/,
    (band) => (BAND_LABELS_ZH[band] ? `需要 2 项及以上资源且生命体征处于危险区（${BAND_LABELS_ZH[band]}阈值）` : null),
  ],
  [/^no resources expected$/, () => '预计无需资源'],
  [/^1 resource expected$/, () => '预计需要 1 项资源'],
  [/^(\d+) resources expected$/, (n) => `预计需要 ${n} 项资源`],
];

// Field names used in validate() messages.
const FIELDS_ZH = {
  ageYears: '年龄', hr: '心率', rr: '呼吸频率', sbp: '收缩压', spo2: '血氧饱和度',
  tempC: '体温', pain: '疼痛评分', resources: '预计资源数',
};

// [pattern, Chinese builder] for every message validate() can return.
const ERRORS_ZH = [
  [/^patient must be an object$/, () => '患者数据必须是对象'],
  [/^avpu must be A, V, P or U$/, () => '意识（AVPU）必须是 A、V、P 或 U'],
  [/^(\w+) must be a finite number$/, (k) => (FIELDS_ZH[k] ? `${FIELDS_ZH[k]}必须是有效数字` : null)],
  [/^pain must be 0 to 10$/, () => '疼痛评分必须在 0 到 10 之间'],
  [/^spo2 must be 0 to 100$/, () => '血氧饱和度必须在 0 到 100 之间'],
  [/^resources must be >= 0$/, () => '预计资源数必须 ≥ 0'],
];

function matchTable(table, text) {
  for (const [re, build] of table) {
    const m = re.exec(text);
    if (m) {
      const out = build(...m.slice(1));
      if (out) return out;
    }
  }
  return null;
}

// Chinese for one engine reason, or null if the pattern is unknown (used by tests).
export const reasonZh = (reason) => matchTable(REASONS_ZH, reason);
// Chinese for one validate() message, or null if unknown (used by tests).
export const errorZh = (message) => matchTable(ERRORS_ZH, message);

// Translate one triage reason; falls back to the English text so nothing is ever lost.
export function translateReason(reason, lang) {
  if (normalizeLang(lang) !== 'zh-CN') return reason;
  return reasonZh(reason) ?? reason;
}

// Translate a TypeError message from triage(): validate() joins its messages with '; '.
export function translateError(message, lang) {
  if (normalizeLang(lang) !== 'zh-CN') return message;
  return message.split('; ').map((m) => errorZh(m) ?? m).join('；');
}
