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
  'footer.analytics': {
    en: 'Anonymous, cookie-free visit statistics (Umami).',
    'zh-CN': '匿名、无 Cookie 的访问统计（Umami）。',
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

  // ---- storylines (task 21, src/storylines.js): titles and epilogues live in STORYLINES ----
  'storyline.badge': {
    en: 'Storyline “{title}”: same incident as patient {n}',
    'zh-CN': '故事线「{title}」：与第 {n} 位患者来自同一事件',
  },
  'storyline.report.heading': { en: 'Storyline: {title}', 'zh-CN': '故事线：{title}' },
  'storyline.report.patient': { en: 'Patient {n}: {name}', 'zh-CN': '第 {n} 位患者：{name}' },
  'storyline.report.underTag': { en: '🩸 under-triaged', 'zh-CN': '🩸 分诊不足' },
  'storyline.report.anyUnder': {
    en: '🩸 A patient in this storyline was under-triaged.',
    'zh-CN': '🩸 这条故事线里有患者被分诊不足。',
  },
  'storyline.report.noneUnder': {
    en: '✅ No patient in this storyline was under-triaged.',
    'zh-CN': '✅ 这条故事线里没有患者被分诊不足。',
  },
  'storyline.report.epilogue': { en: 'Epilogue:', 'zh-CN': '尾声：' },
  'storyline.report.rule': {
    en: 'Triage the patient in front of you, not the story. One incident can produce very different acuity, and a cluster of patients can reveal a hidden cause.',
    'zh-CN': '分诊眼前的患者，而不是背后的故事。同一起事件可能带来轻重悬殊的病情，而一批相似的患者也可能揭示隐藏的病因。',
  },

  // ---- "ESI v4 in 2 minutes" lesson in the shift report (task 15, src/lesson.js) ----
  // Written in our own words as a summary of the ESI Implementation Handbook v4; no handbook text.
  'lesson.summary': { en: 'Learn ESI v4 in 2 minutes', 'zh-CN': '2 分钟学会 ESI 第 4 版' },
  'lesson.stepsTitle': { en: 'The algorithm in 4 steps', 'zh-CN': '分诊流程四步走' },
  'lesson.step': { en: 'Step {step}', 'zh-CN': '第 {step} 步' },
  'lesson.stepTag': { en: 'step {step}', 'zh-CN': '第 {step} 步' },
  'lesson.stepA.q': { en: 'Does the patient need an immediate life-saving intervention?', 'zh-CN': '患者是否需要立即实施抢救性干预？' },
  'lesson.stepA.a': { en: 'Yes: ESI 1.', 'zh-CN': '是：ESI 1 级。' },
  'lesson.stepB.q': {
    en: 'Is this a patient who should not wait? That means a high-risk situation, new confusion, lethargy or disorientation, or severe pain or distress.',
    'zh-CN': '这位患者是否不能等待？即属于高危情况、新发意识混乱、嗜睡或定向障碍，或有剧烈疼痛或明显痛苦。',
  },
  'lesson.stepB.a': { en: 'Yes: ESI 2.', 'zh-CN': '是：ESI 2 级。' },
  'lesson.stepC.q': { en: 'How many different resources will the patient need?', 'zh-CN': '患者需要多少种不同的资源？' },
  'lesson.stepC.a': { en: 'None: ESI 5. One: ESI 4. Two or more: go on to step D.', 'zh-CN': '不需要：ESI 5 级。1 种：ESI 4 级。2 种及以上：进入第 D 步。' },
  'lesson.stepD.q': { en: 'Are the vital signs in the danger zone?', 'zh-CN': '生命体征是否处于危险区？' },
  'lesson.stepD.a': { en: 'Yes: consider ESI 2. No: ESI 3. This game always assigns ESI 2.', 'zh-CN': '是：考虑 ESI 2 级。否：ESI 3 级。本游戏一律判为 ESI 2 级。' },
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
  'lesson.counts.complex': { en: 'Complex procedure counts as 2 (for example, procedural sedation)', 'zh-CN': '复杂操作计 2 项（例如程序性镇静）' },
  'lesson.notCounts': { en: 'Does not count', 'zh-CN': '不算资源' },
  'lesson.not.exam': { en: 'History and physical examination', 'zh-CN': '病史采集和体格检查' },
  'lesson.not.poct': { en: 'Point-of-care testing (for example, a finger-prick glucose)', 'zh-CN': '床旁快速检测（例如指尖血糖）' },
  'lesson.not.lock': { en: 'Saline lock (an IV cannula with nothing running)', 'zh-CN': '静脉留置针封管（不输液）' },
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
  // ---- Triage Desk inline help (task 16, src/deskhelp.js). Our own words; no handbook text or figures. ----
  'help.button': { en: 'Help: {field}', 'zh-CN': '帮助：{field}' },
  'help.close': { en: 'Close help', 'zh-CN': '关闭帮助' },

  'help.pain.title': { en: 'Scoring pain', 'zh-CN': '如何评估疼痛' },
  'help.pain.ask': {
    en: 'Ask: “0 is no pain, 10 is the worst pain you can imagine.” 1 to 3 is mild, 4 to 6 moderate, 7 to 10 severe.',
    'zh-CN': '询问患者：“0 表示不痛，10 表示你能想象到的最剧烈的疼痛。”1 至 3 分为轻度，4 至 6 分为中度，7 至 10 分为重度。',
  },
  'help.pain.ageTitle': { en: 'Choose the scale by age', 'zh-CN': '按年龄选择量表' },
  'help.pain.age.numeric': { en: 'Adults and children aged about 8 and older: the 0 to 10 number scale.', 'zh-CN': '成人及约 8 岁以上儿童：0 至 10 数字评分。' },
  'help.pain.age.faces': { en: 'Children aged about 3 to 7: a faces scale, from a face with no hurt to a face that hurts worst. The child points to the face that matches.', 'zh-CN': '约 3 至 7 岁儿童：面部表情量表，从“不痛”的脸到“最痛”的脸，让孩子指出与自己感受相符的那张脸。' },
  'help.pain.age.flacc': { en: 'Infants, toddlers and anyone who cannot tell you: score behaviour instead. Face, legs, activity, cry and consolability are each scored 0 to 2, for a total of 0 to 10 (the FLACC scale, validated for about 2 months to 7 years).', 'zh-CN': '婴幼儿及无法表达的患者：改为评估行为。面部表情、双腿、活动、哭闹和可安抚程度各计 0 至 2 分，总分 0 至 10 分（FLACC 量表，适用于约 2 月龄至 7 岁）。' },
  'help.pain.look': { en: 'Record the patient’s own rating, and look at the patient too: if the vital signs or behaviour do not match the number, note it.', 'zh-CN': '记录患者自己给出的分数，同时观察患者：若生命体征或行为与分数不符，应记录下来。' },
  'help.pain.esi': { en: 'ESI v4: severe pain or distress (7 or more) means consider ESI 2 at step B. This game always assigns ESI 2 at 7 or more.', 'zh-CN': 'ESI 第 4 版：剧烈疼痛或明显痛苦（7 分及以上）时，在第 B 步考虑 ESI 2 级。本游戏在 7 分及以上时一律判为 ESI 2 级。' },

  'help.resources.title': { en: 'Counting resources', 'zh-CN': '如何计算资源' },
  'help.resources.rule': { en: 'Count different types of resources, not tests: a blood count and electrolytes are one resource (labs).', 'zh-CN': '按资源的种类计数，而不是按检查项目计数：血常规加电解质只算 1 项资源（化验）。' },
  'help.resources.tick': { en: 'Tick what this patient will need. The number above fills in for you, and you can still change it.', 'zh-CN': '勾选这位患者需要的项目，上方的数字会自动填写，你仍可手动修改。' },
  'help.resources.total': { en: 'Ticked: {count}', 'zh-CN': '已勾选：{count} 项' },

  'help.highRisk.title': { en: 'High-risk complaint', 'zh-CN': '高危主诉' },
  'help.highRisk.what': {
    en: 'A situation where waiting could cost a life, a limb or an organ, even if the patient looks well. Ask yourself: would I give my last open bed to this patient?',
    'zh-CN': '即使患者看起来状况良好，延误也可能危及生命、肢体或器官的情况。问问自己：我会把最后一张空床给这位患者吗？',
  },
  'help.highRisk.examples': { en: 'Examples', 'zh-CN': '举例' },
  'help.highRisk.ex.chest': { en: 'Chest pain that could be acute coronary syndrome or aortic dissection', 'zh-CN': '可能为急性冠脉综合征或主动脉夹层的胸痛' },
  'help.highRisk.ex.stroke': { en: 'Signs of stroke', 'zh-CN': '卒中征象' },
  'help.highRisk.ex.suicidal': { en: 'Thoughts of suicide or of harming others', 'zh-CN': '有自杀或伤害他人的念头' },
  'help.highRisk.ex.ectopic': { en: 'Possible ectopic pregnancy', 'zh-CN': '疑似异位妊娠' },
  'help.highRisk.ex.torsion': { en: 'Possible testicular torsion', 'zh-CN': '疑似睾丸扭转' },
  'help.highRisk.ex.headache': { en: 'Sudden, severe headache', 'zh-CN': '突发剧烈头痛' },
  'help.highRisk.ex.immuno': { en: 'Fever in a patient with weak immunity (for example, on chemotherapy)', 'zh-CN': '免疫力低下患者（例如正在化疗）出现发热' },
  'help.highRisk.ex.sepsis': { en: 'Suspected sepsis', 'zh-CN': '疑似脓毒症' },
  'help.highRisk.ex.overdose': { en: 'A significant overdose or poisoning', 'zh-CN': '严重的药物过量或中毒' },
  'help.highRisk.ex.trauma': { en: 'A major trauma mechanism', 'zh-CN': '高能量创伤机制' },
  'help.highRisk.ex.assault': { en: 'Possible sexual assault', 'zh-CN': '可能遭受性侵犯' },
  'help.highRisk.ex.eye': { en: 'An eye injury that could threaten sight', 'zh-CN': '可能危及视力的眼外伤' },

  'help.lifesaving.title': { en: 'Immediate life-saving intervention', 'zh-CN': '立即抢救性干预' },
  'help.lifesaving.ask': { en: 'Does the patient need one of these right now?', 'zh-CN': '患者现在是否需要以下任一项？' },
  'help.lifesaving.airway': { en: 'Airway and breathing: bag-valve-mask ventilation, intubation, a surgical airway, emergency CPAP or BiPAP', 'zh-CN': '气道与呼吸：球囊面罩通气、气管插管、外科气道、紧急无创正压通气（CPAP 或 BiPAP）' },
  'help.lifesaving.electrical': { en: 'Electrical: defibrillation, emergency cardioversion, external pacing', 'zh-CN': '电治疗：除颤、紧急电复律、体外起搏' },
  'help.lifesaving.procedures': { en: 'Procedures: needle decompression of the chest, pericardiocentesis', 'zh-CN': '操作：胸腔穿刺针减压、心包穿刺' },
  'help.lifesaving.circulation': { en: 'Circulation: major IV fluid resuscitation, blood transfusion, control of major bleeding', 'zh-CN': '循环：大量静脉液体复苏、输血、控制大出血' },
  'help.lifesaving.meds': { en: 'Medicines: naloxone, IV glucose (D50 in adults, D10 in children), atropine, adenosine, vasopressors', 'zh-CN': '药物：纳洛酮、静脉葡萄糖（成人 50%、儿童 10%）、阿托品、腺苷、血管活性药物' },
  'help.lifesaving.notTitle': { en: 'Not life-saving on their own', 'zh-CN': '单独使用时不算抢救性干预' },
  'help.lifesaving.not': {
    en: 'Oxygen by mask or nasal cannula, a cardiac monitor, an ECG, labs, IV access, a nebuliser, IV fluids at a maintenance rate.',
    'zh-CN': '面罩或鼻导管吸氧、心电监护、心电图、化验、建立静脉通路、雾化、维持速度的静脉补液。',
  },

  'help.confusion.title': { en: 'New confusion or lethargy', 'zh-CN': '新发意识混乱或嗜睡' },
  'help.confusion.what': {
    en: 'New confusion, lethargy (sleepy and hard to keep awake) or disorientation compared with the patient’s usual state. Ask family or carers what is normal for this patient.',
    'zh-CN': '与患者平时的状态相比，新出现的意识混乱、嗜睡（昏昏欲睡、难以保持清醒）或定向障碍。向家属或照护者了解患者平时的状态。',
  },
  'help.confusion.avpu': { en: 'A patient who responds only to voice or to pain belongs in the AVPU field.', 'zh-CN': '只对声音或疼痛刺激有反应的患者，请在意识（AVPU）一栏中记录。' },

  // ---- Incomplete vital signs on the Triage Desk (task 17) ----
  'calc.vitalsNote': {
    en: 'HR, RR, SBP, SpO₂ and temperature may be left blank if they could not be measured.',
    'zh-CN': '心率、呼吸频率、收缩压、血氧饱和度和体温如无法测量，可以留空。',
  },
  'calc.reasonLabel': { en: 'If not measured: why?', 'zh-CN': '未测量的原因' },
  'calc.reason.none': { en: 'Reason (optional)', 'zh-CN': '原因（可选）' },
  'calc.reason.refused': { en: 'Patient refused', 'zh-CN': '患者拒绝' },
  'calc.reason.agitated': { en: 'Agitated or uncooperative', 'zh-CN': '躁动或不配合' },
  'calc.reason.equipment': { en: 'No equipment', 'zh-CN': '没有设备' },
  'calc.reason.failed': { en: 'Measurement failed (for example, cold hands for SpO₂)', 'zh-CN': '测量失败（例如手冷测不出血氧）' },
  'calc.reason.other': { en: 'Other', 'zh-CN': '其他原因' },
  // Short forms for the result warning, e.g. "SpO₂ (measurement failed)".
  'calc.reasonShort.refused': { en: 'patient refused', 'zh-CN': '患者拒绝' },
  'calc.reasonShort.agitated': { en: 'agitated or uncooperative', 'zh-CN': '躁动或不配合' },
  'calc.reasonShort.equipment': { en: 'no equipment', 'zh-CN': '没有设备' },
  'calc.reasonShort.failed': { en: 'measurement failed', 'zh-CN': '测量失败' },
  'calc.reasonShort.other': { en: 'other reason', 'zh-CN': '其他原因' },
  'calc.vitalName.hr': { en: 'heart rate', 'zh-CN': '心率' },
  'calc.vitalName.rr': { en: 'respiratory rate', 'zh-CN': '呼吸频率' },
  'calc.vitalName.sbp': { en: 'systolic blood pressure', 'zh-CN': '收缩压' },
  'calc.vitalName.spo2': { en: 'SpO₂', 'zh-CN': '血氧饱和度' },
  'calc.vitalName.tempC': { en: 'temperature', 'zh-CN': '体温' },
  'calc.missingItem': { en: '{vital} ({reason})', 'zh-CN': '{vital}（{reason}）' },
  'calc.missingSep': { en: ', ', 'zh-CN': '、' },
  'calc.missing': { en: '⚠ Not measured: {list}.', 'zh-CN': '⚠ 未测量：{list}。' },
  'calc.missingAction': { en: 'Measure as soon as possible and re-triage.', 'zh-CN': '请尽快测量并重新分诊。' },
  'calc.provisional': { en: 'Provisional', 'zh-CN': '暂定' },
  'calc.infantTemp': {
    en: 'Under 3 months: measure temperature now. Fever in a young infant needs urgent assessment and is often ESI 2.',
    'zh-CN': '3 月龄以下：请立即测量体温。小婴儿发热需要紧急评估，常为 ESI 2 级。',
  },
  'lesson.missingVitals': {
    en: 'If vital signs cannot be obtained, do not delay steps A and B; at step D, treat the patient as possibly in the danger zone until measured.',
    'zh-CN': '如果无法获得生命体征，不要因此延误第 A 步和第 B 步；在第 D 步，测量之前应将患者视为可能处于危险区。',
  },
  'calc.dangerZone': { en: '⚠️ Danger-zone vitals.', 'zh-CN': '⚠️ 生命体征处于危险区。' },
  'calc.error': { en: 'The spirits reject this input: {message}', 'zh-CN': '幽灵拒绝了这些输入：{message}' },

  // ---- optional accounts (task 22, src/accountview.js). Hidden when src/config.js is empty. ----
  'footer.accounts': {
    en: 'Signing in is optional. The game stores only your display name and game results; Supabase Auth keeps the sign-in record from Google or GitHub (account id, email address, name), which the game never shows or shares.',
    'zh-CN': '登录是可选的。游戏只保存你的显示名称和游戏成绩；Supabase 登录服务保存来自 Google 或 GitHub 的登录记录（账户编号、电子邮箱、姓名），游戏从不显示或分享这些信息。',
  },
  'nav.progress': { en: 'Progress', 'zh-CN': '我的进度' },
  'nav.board': { en: 'Leaderboard', 'zh-CN': '排行榜' },
  'section.progress': { en: 'Your progress', 'zh-CN': '你的进度' },
  'section.board': { en: 'Leaderboard', 'zh-CN': '排行榜' },
  'account.signIn': { en: 'Sign in', 'zh-CN': '登录' },
  'account.button': { en: 'Account: {name}', 'zh-CN': '账户：{name}' },
  'account.unnamed': { en: 'Your account', 'zh-CN': '你的账户' },
  'account.dialog': { en: 'Account', 'zh-CN': '账户' },
  'account.close': { en: 'Close', 'zh-CN': '关闭' },
  'account.signInTitle': { en: 'Sign in to keep your results', 'zh-CN': '登录以保存你的成绩' },
  'account.signInWhy': {
    en: 'Optional. Signing in saves your night scores, shows your progress on any device and puts your best night on the leaderboard. Everything else works without it.',
    'zh-CN': '登录是可选的。登录后会保存你的夜班得分，在任何设备上显示你的进度，并让你的最佳夜班成绩登上排行榜。不登录也能使用其他所有功能。',
  },
  'account.google': { en: 'Continue with Google', 'zh-CN': '使用 Google 账户继续' },
  'account.github': { en: 'Continue with GitHub', 'zh-CN': '使用 GitHub 账户继续' },
  'account.redirectNote': {
    en: 'You will go to Google or GitHub and come back to this page. A night in progress starts again.',
    'zh-CN': '你将跳转到 Google 或 GitHub，然后回到本页面。正在进行的夜班会重新开始。',
  },
  'account.privacy': {
    en: 'The game stores your display name and your night results (score and counts, never the cases). Your email address is never shown.',
    'zh-CN': '游戏会保存你的显示名称和夜班成绩（得分和各项计数，从不保存病例）。你的电子邮箱从不显示。',
  },
  'account.signInError': { en: 'Sign-in did not finish. Please try again.', 'zh-CN': '登录未完成，请重试。' },
  'account.signedInAs': { en: 'Signed in as {name}', 'zh-CN': '已登录：{name}' },
  'account.offline': {
    en: 'Offline: your results are kept on this device and saved when you are back online.',
    'zh-CN': '当前离线：你的成绩会先保存在本设备上，恢复联网后再上传。',
  },
  'account.nameLabel': { en: 'Display name', 'zh-CN': '显示名称' },
  'account.nameHint': {
    en: '2 to 20 characters: letters in any language, numbers, spaces and hyphens. Shown on the leaderboard.',
    'zh-CN': '2 至 20 个字符：任何语言的文字、数字、空格和连字符。会显示在排行榜上。',
  },
  'account.nameSave': { en: 'Save name', 'zh-CN': '保存名称' },
  'account.nameSaved': { en: 'Name saved.', 'zh-CN': '名称已保存。' },
  'account.nameError.length': { en: 'Use 2 to 20 characters.', 'zh-CN': '请使用 2 至 20 个字符。' },
  'account.nameError.chars': {
    en: 'Use only letters, numbers, spaces and hyphens.',
    'zh-CN': '只能使用文字、数字、空格和连字符。',
  },
  'account.nameError.network': { en: 'Could not save the name. Check your connection and try again.', 'zh-CN': '名称未能保存。请检查网络连接后重试。' },
  'account.signOut': { en: 'Sign out', 'zh-CN': '退出登录' },
  'account.delete': { en: 'Delete account', 'zh-CN': '删除账户' },
  'account.deleteConfirmText': {
    en: 'This permanently deletes your profile, all your saved results and your sign-in. It cannot be undone.',
    'zh-CN': '这将永久删除你的个人资料、所有已保存的成绩和登录账户，且无法恢复。',
  },
  'account.deleteConfirm': { en: 'Yes, delete everything', 'zh-CN': '确认，全部删除' },
  'account.deleteCancel': { en: 'Keep my account', 'zh-CN': '保留我的账户' },
  'account.deleted': { en: 'Your account has been deleted.', 'zh-CN': '你的账户已删除。' },
  'account.deleteFailed': {
    en: 'Could not delete the account. Check your connection and try again.',
    'zh-CN': '未能删除账户。请检查网络连接后重试。',
  },
  'account.dropped': {
    en: 'Saved results rejected by the server and removed from this device: {count}.',
    'zh-CN': '被服务器拒绝并已从本设备移除的成绩：{count} 条。',
  },
  'save.saving': { en: 'Saving your result…', 'zh-CN': '正在保存你的成绩…' },
  'save.saved': { en: '✅ Saved to your account.', 'zh-CN': '✅ 已保存到你的账户。' },
  'save.queued': {
    en: 'Not saved yet: kept on this device and retried the next time you open the game.',
    'zh-CN': '尚未保存：已保留在本设备上，下次打开游戏时会重试。',
  },
  'save.rejected': { en: 'This result could not be saved: the server rejected it.', 'zh-CN': '这次成绩未能保存：服务器拒绝了它。' },
  'save.guest': { en: 'Sign in to keep your results across devices.', 'zh-CN': '登录后可以在不同设备间保留成绩。' },
  'save.seeded': { en: 'Demo night (fixed seed): not saved.', 'zh-CN': '演示夜班（固定种子）：不保存。' },
  'progress.title': { en: '📈 Your progress', 'zh-CN': '📈 你的进度' },
  'progress.loading': { en: 'Loading…', 'zh-CN': '加载中…' },
  'progress.nights': { en: 'Nights played', 'zh-CN': '已完成夜班' },
  'progress.best': { en: 'Best score', 'zh-CN': '最高分' },
  'progress.average': { en: 'Average score', 'zh-CN': '平均分' },
  'progress.underRate': { en: 'Under-triage rate', 'zh-CN': '分诊不足率' },
  'progress.recent': { en: 'Recent scores (up to 10)', 'zh-CN': '最近得分（最多 10 次）' },
  'progress.chartLabel': { en: 'Last {n} scores, oldest first: {list}', 'zh-CN': '最近 {n} 次得分（从早到晚）：{list}' },
  'progress.none': { en: 'No nights finished yet. Finish a night shift to see your progress here.', 'zh-CN': '还没有完成任何夜班。完成一个夜班后，就能在这里看到你的进度。' },
  'progress.deviceNote': {
    en: 'These are the nights played on this device. Sign in to keep your progress across devices.',
    'zh-CN': '这些是在本设备上完成的夜班。登录后可以在不同设备间保留进度。',
  },
  'progress.accountNote': { en: 'From your account, the same on every device.', 'zh-CN': '来自你的账户，所有设备上都一样。' },
  'progress.unavailable': {
    en: 'Your account progress cannot be loaded right now, so this shows the nights played on this device.',
    'zh-CN': '目前无法加载你的账户进度，因此这里显示的是在本设备上完成的夜班。',
  },
  'board.title': { en: '🏆 Leaderboard', 'zh-CN': '🏆 排行榜' },
  'board.caption': { en: 'Top 50 players by best single-night score', 'zh-CN': '按单个夜班最高分排名的前 50 名玩家' },
  'board.rank': { en: 'Rank', 'zh-CN': '名次' },
  'board.name': { en: 'Player', 'zh-CN': '玩家' },
  'board.best': { en: 'Best score', 'zh-CN': '最高分' },
  'board.nights': { en: 'Nights played', 'zh-CN': '夜班数' },
  'board.you': { en: '(you)', 'zh-CN': '（你）' },
  'board.yourRankLine': {
    en: 'Your rank: {rank} (best score {best}, {nights} nights played).',
    'zh-CN': '你的名次：第 {rank} 名（最高分 {best}，已完成 {nights} 个夜班）。',
  },
  'board.empty': { en: 'No scores yet. Finish a night while signed in to be the first.', 'zh-CN': '还没有成绩。登录后完成一个夜班，就能成为第一名。' },
  'board.error': {
    en: 'The leaderboard could not be loaded. Check your connection and try again.',
    'zh-CN': '排行榜未能加载。请检查网络连接后重试。',
  },
  'board.retry': { en: 'Try again', 'zh-CN': '重试' },
  'board.signInHint': { en: 'Sign in to put your best night on the board.', 'zh-CN': '登录后，你的最佳夜班成绩就能上榜。' },
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
  [/^danger-zone vital signs could not be checked: when in doubt, choose the more urgent level$/, () => '无法核查危险区生命体征：拿不准时，选择更紧急的级别'],
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
