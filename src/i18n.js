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
  'report.missedLine': {
    en: '{kind}: you chose ESI {guess}, correct is {badge}',
    'zh-CN': '{kind}：你选择了 ESI {guess} 级，正确答案是 {badge}',
  },
  'report.flawless': {
    en: '🕯️ A flawless night. Every monster went to the right bay.',
    'zh-CN': '🕯️ 完美的一夜。每只怪物都进了正确的诊区。',
  },
  'report.newNight': { en: 'Start a new night 🌙', 'zh-CN': '开始新的夜班 🌙' },

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
