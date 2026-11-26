// Monster patients for the Night Shift game. Each case maps a spooky story to real vital signs,
// so the player learns real triage logic behind the costume.
//
// Case shape: { id, name, emoji, story, patient, expectedLevel, teachingPoint, zh, variants }
//   patient       - engine input (see src/triage.js): the case's typical values
//   expectedLevel - the ESI level the case author intends; test/triage.test.js checks triage() agrees
//   teachingPoint - one short, clinically accurate lesson shown after the case
//   zh            - Simplified Chinese { name, story, teachingPoint } for the 中文 toggle (src/i18n.js);
//                   test/i18n.test.js checks every case has it
//   variants      - what may change each time the case appears (task 14, src/night.js):
//     vitals   { hr, rr, sbp, spo2, tempC, pain? }: [low, high] ranges. Every value inside them must give
//              expectedLevel (property test P8 and the boundary grid in test/cases.test.js check this)
//     openings [{ en, zh }]: optional alternatives for the story's first sentence
//   storyline     - optional (task 21): the id of a storyline in src/storylines.js. Such a case is
//                   never drawn on its own; it arrives only with its partner case, in storyline order
//   Stories and teaching points never quote the patient's own vital values, because those vary;
//   they quote the thresholds instead. The shift report shows the values the player actually saw.
// Each case's SVG portrait lives in src/portraits.js under the same id (test/portraits.test.js checks this).
//
// Resource counting follows the ESI Implementation Handbook v4: labs (any number) = 1, each imaging
// modality = 1, IV fluids = 1, IV/IM/nebulised meds = 1, specialty consult = 1, simple procedure
// (e.g. laceration repair) = 1, complex procedure (e.g. procedural sedation) = 2.
// Not resources: history and exam, oral meds, prescription refills, tetanus immunisation,
// simple wound care, splints, crutches.
export const CASES = [
  // ---------------- ESI 1: Resuscitation ----------------
  {
    id: 'ghost-unresponsive',
    name: 'The Grey Lady, age unknown',
    emoji: '👻',
    story: 'Found floating in the stairwell. Does not respond to voice or pain. Faint, slow breathing.',
    patient: { ageYears: 70, avpu: 'U', newConfusion: true, hr: 44, rr: 6, sbp: 76, spo2: 81, tempC: 34.2, pain: 0, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Unresponsive (AVPU U) is always ESI 1. With RR below 8 and SpO2 below 85% she needs airway support and bag-valve-mask ventilation now.',
    zh: {
      name: '灰衣夫人，年龄不详',
      story: '被发现飘在楼梯间里。对呼唤和疼痛刺激均无反应。呼吸微弱而缓慢。',
      teachingPoint: '无反应（AVPU U）一律为 ESI 1 级。呼吸频率低于 8 次/分、血氧饱和度低于 85%，她需要立即开放气道并行球囊面罩通气。',
    },
    variants: {
      vitals: { hr: [42, 50], rr: [5, 7], sbp: [72, 84], spo2: [78, 84], tempC: [33.8, 34.8] },
      openings: [
        { en: 'Drifted in through the ambulance bay doors and sank to the floor.', zh: '从救护车通道的门飘进来，然后沉到了地上。' },
        { en: 'The night porter found her hovering motionless by the lifts.', zh: '夜班护工发现她一动不动地悬在电梯旁。' },
      ],
    },
  },
  {
    id: 'frankenstein-bradycardia',
    name: 'Bolt-neck Frank, 35',
    emoji: '🧟‍♂️',
    story: 'The lab assistant over-charged his neck bolts. Now dizzy and grey, and his heart is beating very slowly.',
    patient: { ageYears: 35, avpu: 'A', newConfusion: false, hr: 34, rr: 18, sbp: 78, spo2: 95, tempC: 36.5, pain: 2, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'HR < 40 with low blood pressure is unstable bradycardia: give atropine and prepare transcutaneous pacing immediately. That is a life-saving intervention, so ESI 1.',
    zh: {
      name: '螺栓颈弗兰克，35 岁',
      story: '实验室助手给他脖子上的螺栓充电过量。现在他头晕、面色灰白，心跳非常慢。',
      teachingPoint: '心率 < 40 次/分伴低血压属于不稳定性心动过缓：立即给予阿托品并准备经皮起搏。这是抢救性干预，因此为 ESI 1 级。',
    },
    variants: {
      vitals: { hr: [30, 38], rr: [16, 20], sbp: [72, 84], spo2: [94, 97], tempC: [36.2, 36.8] },
      openings: [
        { en: 'A thunderstorm over the castle sent one bolt too many through his neck.', zh: '城堡上空的一场雷暴，让他脖子上的螺栓多挨了一道闪电。' },
        { en: 'Collapsed at the lab bench after an overnight recharge.', zh: '通宵充电后，他瘫倒在实验台边。' },
      ],
    },
  },
  {
    id: 'zombie-anaphylaxis',
    name: 'Zed the Zombie, 31',
    emoji: '🥜',
    story: 'Ate a peanut-butter-glazed brain. Lips and tongue swelling, wheezing, hives everywhere, feels faint.',
    patient: { ageYears: 31, avpu: 'A', newConfusion: false, hr: 132, rr: 30, sbp: 68, spo2: 88, tempC: 36.9, pain: 4, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Anaphylaxis with airway swelling and hypotension: give IM epinephrine (adult 0.5 mg of 1 mg/mL) into the outer thigh straight away. Do not wait for IV access.',
    zh: {
      name: '僵尸泽德，31 岁',
      story: '吃了一个涂满花生酱的大脑。嘴唇和舌头肿胀，喘息，全身荨麻疹，感觉快要晕倒。',
      teachingPoint: '严重过敏反应伴气道水肿和低血压（过敏性休克）：立即在大腿外侧肌内注射肾上腺素（成人 0.5 mg，1 mg/mL 规格）。不要等待建立静脉通路。',
    },
    variants: {
      vitals: { hr: [124, 140], rr: [26, 34], sbp: [62, 78], spo2: [85, 90], tempC: [36.6, 37.2] },
      openings: [
        { en: 'Took one bite of a satay-sauce brain at the zombie potluck.', zh: '在僵尸聚餐上咬了一口沙爹酱大脑。' },
        { en: 'A trick-or-treater handed him a peanut cluster.', zh: '一个讨糖的孩子递给他一块花生糖。' },
      ],
    },
  },
  {
    id: 'sandman-overdose',
    name: 'The Sandman, 52',
    emoji: '😴',
    story: 'Mixed poppy dust into his own sleeping sand. Only groans to a sternal rub. Pinpoint pupils, barely breathing.',
    patient: { ageYears: 52, avpu: 'P', newConfusion: true, hr: 58, rr: 6, sbp: 104, spo2: 84, tempC: 36.1, pain: 0, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Pinpoint pupils, RR < 8 and reduced consciousness is the opioid toxidrome. Ventilate with a bag-valve-mask and give naloxone: ESI 1.',
    zh: {
      name: '睡魔，52 岁',
      story: '在自己的催眠沙里掺了罂粟粉。按压胸骨时只会呻吟。瞳孔呈针尖样，几乎没有呼吸。',
      teachingPoint: '针尖样瞳孔、呼吸频率 < 8 次/分伴意识水平下降，是阿片类药物中毒综合征。立即球囊面罩通气并给予纳洛酮：ESI 1 级。',
    },
    variants: {
      vitals: { hr: [52, 64], rr: [4, 7], sbp: [96, 112], spo2: [78, 86], tempC: [35.8, 36.4] },
      openings: [
        { en: 'His apprentice dragged him in from the dream factory.', zh: '他的学徒把他从造梦工厂拖了进来。' },
        { en: 'Found slumped over a sack of sleeping sand.', zh: '被发现瘫倒在一袋催眠沙上。' },
      ],
    },
  },
  {
    id: 'vampire-bleed',
    name: 'Count Vlad, 547',
    emoji: '🧛',
    story: 'Fang slipped during dinner. Bleeding from the mouth will not stop. Pale (paler than usual).',
    patient: { ageYears: 547, avpu: 'A', newConfusion: false, hr: 128, rr: 24, sbp: 82, spo2: 95, tempC: 35.9, pain: 5, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Uncontrolled bleeding with a fast heart rate and low blood pressure (shock index well above 1) is hemorrhagic shock: it needs immediate hemorrhage control and fluid or blood resuscitation, so it is ESI 1, not ESI 2.',
    zh: {
      name: '弗拉德伯爵，547 岁',
      story: '吃晚餐时獠牙滑了一下。口腔出血止不住。面色苍白（比平时更白）。',
      teachingPoint: '无法控制的出血伴心率快、血压低（休克指数明显大于 1）属于失血性休克：需要立即止血并进行液体或输血复苏，因此为 ESI 1 级，而不是 ESI 2 级。',
    },
    variants: {
      vitals: { hr: [120, 136], rr: [22, 28], sbp: [76, 88], spo2: [94, 97], tempC: [35.6, 36.2] },
      openings: [
        { en: 'Cracked a fang on a silver goblet.', zh: '在一只银酒杯上磕裂了獠牙。' },
        { en: 'A rival vampire knocked out his fang in a duel.', zh: '与另一只吸血鬼决斗时，獠牙被打掉了。' },
      ],
    },
  },
  {
    id: 'werewolf-cub-anaphylaxis',
    name: 'Rowan the Werewolf Cub, 4',
    emoji: '🐾',
    story: 'Shared a peanut brownie at the full-moon party. Noisy breathing, hives, a swollen face, and now floppy and pale.',
    patient: { ageYears: 4, avpu: 'V', newConfusion: true, hr: 160, rr: 40, sbp: 66, spo2: 88, tempC: 37.0, pain: 2, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Stridor, hives and floppiness after a food trigger is anaphylaxis with shock. Give IM epinephrine 0.01 mg/kg (maximum 0.5 mg) into the outer thigh at once: ESI 1.',
    zh: {
      name: '狼人幼崽罗恩，4 岁',
      story: '在满月派对上分吃了一块花生布朗尼。呼吸有杂音，荨麻疹，脸部肿胀，现在全身软弱、面色苍白。',
      teachingPoint: '进食诱因后出现喘鸣、荨麻疹和全身软弱无力，是伴休克的严重过敏反应。立即在大腿外侧肌内注射肾上腺素 0.01 mg/kg（最大 0.5 mg）：ESI 1 级。',
    },
    variants: {
      vitals: { hr: [148, 172], rr: [36, 46], sbp: [60, 72], spo2: [84, 90], tempC: [36.8, 37.4] },
      openings: [
        { en: 'Licked peanut butter off a trick-or-treat spoon.', zh: '舔了讨糖时拿到的勺子上的花生酱。' },
        { en: 'Nibbled a satay skewer at the pack barbecue.', zh: '在狼群烧烤会上啃了一串沙爹烤肉。' },
      ],
    },
  },
  {
    id: 'mothman-organophosphate',
    name: 'The Mothman, 44',
    emoji: '🦋',
    story: 'Sprayed the moonlit orchard with pesticide and breathed the mist. Drooling, sweating, eyes streaming, wheezing with bubbly secretions, tiny pupils.',
    patient: { ageYears: 44, avpu: 'A', newConfusion: false, hr: 42, rr: 30, sbp: 90, spo2: 86, tempC: 36.7, pain: 2, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Organophosphate poisoning causes a cholinergic crisis: drooling, sweating, pinpoint pupils, bronchial secretions and a slow heart rate. Give atropine, doubling the dose every 5 minutes until the chest is dry, and protect the airway: ESI 1. Staff put on protection and decontaminate the patient first.',
    zh: {
      name: '天蛾人，44 岁',
      story: '在月光下的果园喷洒农药，吸入了药雾。流涎、大汗、流泪，喘息伴大量泡沫样分泌物，瞳孔极小。',
      teachingPoint: '有机磷中毒引起胆碱能危象：流涎、大汗、瞳孔针尖样、支气管分泌物增多和心率减慢。给予阿托品，每 5 分钟剂量加倍，直至肺部分泌物消失，并保护气道：ESI 1 级。医护人员须先做好防护并为患者洗消。',
    },
    variants: {
      vitals: { hr: [36, 48], rr: [26, 34], sbp: [84, 96], spo2: [82, 89], tempC: [36.4, 37.0] },
    },
  },
  {
    id: 'poltergeist-status',
    name: 'Tiny Tremor the Poltergeist, 1',
    emoji: '🌀',
    story: 'Toys flew round the nursery, then he went stiff. Shaking all four limbs for 10 minutes and still seizing on arrival. Lips dusky, does not respond.',
    patient: { ageYears: 1, avpu: 'U', newConfusion: true, hr: 178, rr: 18, sbp: 88, spo2: 86, tempC: 38.8, pain: 0, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'A seizure lasting 5 minutes or more is status epilepticus: give a benzodiazepine now (buccal or intranasal midazolam if there is no IV line) and support the airway. A child who is still seizing is ESI 1.',
    zh: {
      name: '小震颤，1 岁',
      story: '玩具在婴儿房里乱飞，接着他全身僵直。四肢抽动已 10 分钟，到院时仍在抽搐。口唇发紫，对刺激无反应。',
      teachingPoint: '抽搐持续 5 分钟及以上即为癫痫持续状态：立即给予苯二氮䓬类药物（未建立静脉通路时可经颊或经鼻给予咪达唑仑），并支持气道。仍在抽搐的儿童为 ESI 1 级。',
    },
    variants: {
      vitals: { hr: [168, 192], rr: [12, 26], sbp: [80, 96], spo2: [82, 90], tempC: [38.2, 39.4] },
      openings: [
        { en: 'The cot rattled across the floor, then he went stiff.', zh: '婴儿床在地板上咔咔挪动，接着他全身僵直。' },
        { en: 'Every light in the house flickered, then he went stiff.', zh: '屋里的灯全都闪个不停，接着他全身僵直。' },
      ],
    },
  },
  {
    id: 'dragon-keeper-burn',
    name: 'Ember the Dragon Keeper, 38',
    emoji: '🔥',
    story: 'Pulled a baby dragon out of a burning barn. Soot around the mouth, singed nose hairs, a hoarse voice and a new high-pitched noise when breathing in.',
    patient: { ageYears: 38, avpu: 'A', newConfusion: false, hr: 120, rr: 28, sbp: 120, spo2: 90, tempC: 37.2, pain: 6, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Hoarseness and stridor after smoke in an enclosed space mean airway burns: the airway can swell shut within hours, so it needs early intubation by the most experienced operator. That is a life-saving intervention: ESI 1. Pulse oximetry can read falsely normal with carbon monoxide.',
    zh: {
      name: '驯龙人恩伯，38 岁',
      story: '从着火的谷仓里救出一条幼龙。口周有烟灰，鼻毛烧焦，声音嘶哑，吸气时出现新的高调声音。',
      teachingPoint: '在密闭空间吸入烟雾后出现声音嘶哑和喘鸣，提示气道烧伤：气道可能在数小时内肿胀闭塞，需要由最有经验的人员尽早气管插管。这是抢救性干预：ESI 1 级。一氧化碳中毒时脉搏血氧读数可能假性正常。',
    },
    variants: {
      vitals: { hr: [112, 128], rr: [24, 32], sbp: [110, 130], spo2: [86, 93], tempC: [36.8, 37.6], pain: [5, 7] },
    },
  },
  {
    id: 'nymph-ectopic',
    name: 'Willow the Wood Nymph, 27',
    emoji: '🌿',
    story: 'Sudden one-sided low belly pain, then she fainted by the pond. Her period is 7 weeks late. Pale, clammy, pain in the tip of her shoulder.',
    patient: { ageYears: 27, avpu: 'A', newConfusion: false, hr: 130, rr: 24, sbp: 78, spo2: 97, tempC: 36.4, pain: 8, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Abdominal pain and collapse in a woman of reproductive age is a ruptured ectopic pregnancy until proven otherwise. Shock here needs immediate blood and a gynaecology surgeon: ESI 1. Shoulder-tip pain suggests blood under the diaphragm.',
    zh: {
      name: '林中仙子薇洛，27 岁',
      story: '突发一侧下腹痛，随后在池塘边晕倒。月经已推迟 7 周。面色苍白、皮肤湿冷，肩尖疼痛。',
      teachingPoint: '育龄女性腹痛伴晕厥，在排除之前都应视为异位妊娠破裂。此时的休克需要立即输血并请妇科手术：ESI 1 级。肩尖痛提示膈下积血。',
    },
    variants: {
      vitals: { hr: [122, 138], rr: [22, 28], sbp: [72, 86], spo2: [95, 98], tempC: [36.0, 36.8], pain: [7, 9] },
      openings: [
        { en: 'Sudden one-sided low belly pain while dancing in the moonlit glade, then she fainted.', zh: '在月光林间空地跳舞时突发一侧下腹痛，随后晕倒。' },
        { en: 'Sudden one-sided low belly pain while gathering acorns, then she fainted.', zh: '采橡子时突发一侧下腹痛，随后晕倒。' },
      ],
    },
  },
  {
    id: 'lich-septic-shock',
    name: 'Lord Marrow the Lich, 81',
    emoji: '⚰️',
    story: 'Burning urine for 3 days, now shivering and muddled, with mottled knees. His soul jar says he cannot die, but his blood pressure disagrees.',
    patient: { ageYears: 81, avpu: 'A', newConfusion: true, hr: 126, rr: 26, sbp: 72, spo2: 93, tempC: 39.2, pain: 3, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Infection with low blood pressure, confusion and mottled skin is septic shock. Start IV fluids, take blood cultures and give antibiotics within the first hour: ESI 1.',
    zh: {
      name: '巫妖马罗勋爵，81 岁',
      story: '尿痛 3 天，现在寒战、神志模糊，膝盖出现花斑。他的灵魂罐子说他不会死，但血压不同意。',
      teachingPoint: '感染伴低血压、意识混乱和皮肤花斑，提示脓毒性休克。立即静脉补液、抽取血培养，并在第一小时内给予抗生素：ESI 1 级。',
    },
    variants: {
      vitals: { hr: [118, 134], rr: [24, 30], sbp: [64, 78], spo2: [92, 95], tempC: [38.8, 39.8] },
    },
  },
  {
    id: 'wraith-asthma',
    name: 'Whisper the Wraith, 19',
    emoji: '🌫️',
    story: 'Known asthma, used her inhaler twenty times tonight. Can only whisper single words, drowsy, chest almost silent.',
    patient: { ageYears: 19, avpu: 'V', newConfusion: true, hr: 132, rr: 32, sbp: 112, spo2: 83, tempC: 36.9, pain: 2, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'A silent chest, single words and drowsiness are signs of life-threatening asthma, even if the heart rate starts to fall. Give oxygen, back-to-back nebulised salbutamol with ipratropium, steroids and IV magnesium, and call for airway help: ESI 1.',
    zh: {
      name: '幽魂低语，19 岁',
      story: '有哮喘病史，今晚用了二十次吸入器。只能低声说出单个词，嗜睡，胸部几乎听不到呼吸音。',
      teachingPoint: '肺部几乎听不到呼吸音、只能说单个词以及嗜睡，是危及生命的哮喘征象，即使心率开始下降也不能放松。给予吸氧、连续雾化沙丁胺醇联合异丙托溴铵、糖皮质激素和静脉硫酸镁，并呼叫气道支援：ESI 1 级。',
    },
    variants: {
      vitals: { hr: [124, 140], rr: [28, 36], sbp: [104, 120], spo2: [80, 86], tempC: [36.6, 37.2] },
    },
  },

  // ---------------- ESI 2: Emergent ----------------
  {
    id: 'mummy-dehydration',
    name: 'Neferkare, 3,200',
    emoji: '🧟',
    story: 'Unwrapped too fast at the museum gala. Dizzy, dry mouth, has not had water in three millennia.',
    patient: { ageYears: 3200, avpu: 'A', newConfusion: false, hr: 108, rr: 18, sbp: 104, spo2: 97, tempC: 37.4, pain: 3, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Decision point D: an adult needing 2 or more resources with HR > 100 should be considered for ESI 2, even when he looks well.',
    zh: {
      name: '奈费尔卡拉，3200 岁',
      story: '在博物馆晚会上裹尸布被拆得太快。头晕、口干，已经三千年没喝过水了。',
      teachingPoint: '决策点 D：成人需要 2 项及以上资源且心率 > 100 次/分时，即使看起来状态良好，也应考虑 ESI 2 级。',
    },
    variants: {
      vitals: { hr: [104, 116], rr: [14, 20], sbp: [98, 112], spo2: [96, 99], tempC: [37.0, 37.6] },
      openings: [
        { en: 'Spent the night guarding a tomb in a heatwave.', zh: '在热浪中守了一整夜的古墓。' },
        { en: 'Fainted in the queue for the night-time pyramid tour.', zh: '在夜游金字塔的队伍里晕倒了。' },
      ],
    },
  },
  {
    id: 'witch-chestpain',
    name: 'Agatha Hollow, 61',
    emoji: '🧙',
    story: 'Crushing chest pain since she lifted her cauldron. Sweaty, pain spreads to the left arm.',
    patient: { ageYears: 61, avpu: 'A', newConfusion: false, hr: 96, rr: 20, sbp: 152, spo2: 96, tempC: 36.7, pain: 8, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Chest pain that could be acute coronary syndrome is high risk (ESI 2). Get a 12-lead ECG within 10 minutes of arrival.',
    zh: {
      name: '阿加莎·霍洛，61 岁',
      story: '抬起坩埚后出现压榨样胸痛。大汗淋漓，疼痛放射至左臂。',
      teachingPoint: '可能为急性冠脉综合征的胸痛属于高危情况（ESI 2 级）。到院 10 分钟内完成 12 导联心电图。',
    },
    variants: {
      vitals: { hr: [88, 106], rr: [18, 22], sbp: [140, 166], spo2: [95, 98], tempC: [36.5, 37.0], pain: [7, 9] },
      openings: [
        { en: 'Crushing chest pain began mid-flight on her broomstick.', zh: '骑扫帚飞行途中突然出现压榨样胸痛。' },
        { en: 'Crushing chest pain woke her at midnight.', zh: '午夜时分被压榨样胸痛痛醒。' },
      ],
    },
  },
  {
    id: 'pumpkin-fever',
    name: 'Jack O. Lantern, 34',
    emoji: '🎃',
    story: 'Burning up from the inside, cough for 3 days. Breathing fast, glowing a little too bright.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 118, rr: 26, sbp: 112, spo2: 91, tempC: 39.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Fever and cough with fast breathing and SpO2 below 92% suggest pneumonia. Danger-zone vital signs with 2 or more resources move him up to ESI 2; screen for sepsis.',
    zh: {
      name: '杰克·南瓜灯，34 岁',
      story: '从里到外烧得滚烫，咳嗽 3 天。呼吸急促，发出的光有点太亮了。',
      teachingPoint: '发热、咳嗽，伴呼吸急促、血氧饱和度低于 92%，提示肺炎。生命体征处于危险区且需要 2 项及以上资源，应上调至 ESI 2 级；同时进行脓毒症筛查。',
    },
    variants: {
      vitals: { hr: [112, 126], rr: [24, 30], sbp: [104, 118], spo2: [88, 91], tempC: [39.0, 40.0] },
      openings: [
        { en: 'Coughing for 3 days, and the candle inside him keeps flaring.', zh: '咳嗽 3 天，体内的蜡烛不停地往上蹿。' },
        { en: 'Hot to the touch and coughing up pumpkin seeds for 3 days.', zh: '摸上去滚烫，咳出南瓜子已经 3 天了。' },
      ],
    },
  },
  {
    id: 'medusa-stroke',
    name: 'Medusa Gorgon, 72',
    emoji: '🐍',
    story: 'Her snakes noticed first: her left arm went weak and her speech slurred 40 minutes ago.',
    patient: { ageYears: 72, avpu: 'A', newConfusion: false, hr: 84, rr: 16, sbp: 178, spo2: 97, tempC: 36.8, pain: 1, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Sudden one-sided weakness or slurred speech is a stroke until proven otherwise (ESI 2). Record the last-known-well time and activate the stroke pathway.',
    zh: {
      name: '美杜莎·戈耳工，72 岁',
      story: '她的蛇最先发现异常：40 分钟前她的左臂突然无力，说话含糊不清。',
      teachingPoint: '突发单侧肢体无力或言语含糊，在排除之前都应按卒中处理（ESI 2 级）。记录最后正常时间，并启动卒中绿色通道。',
    },
    variants: {
      vitals: { hr: [76, 92], rr: [14, 18], sbp: [164, 190], spo2: [95, 98], tempC: [36.5, 37.1] },
    },
  },
  {
    id: 'banshee-bronchiolitis',
    name: 'Baby Banshee, 2 months',
    emoji: '👶',
    story: 'Wail has turned into a wheeze. Runny nose for 3 days, feeding poorly, breathing fast. Needs a viral swab and IV fluids.',
    patient: { ageYears: 0.17, avpu: 'A', newConfusion: false, hr: 176, rr: 58, sbp: 80, spo2: 93, tempC: 37.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Under 3 months the danger zone is HR > 180 or RR > 50. Her heart rate is acceptable at this age, but her breathing rate is not: ESI 2. Young infants with bronchiolitis can tire and stop breathing (apnoea).',
    zh: {
      name: '报丧女妖宝宝，2 月龄',
      story: '哭嚎变成了喘息。流涕 3 天，吃奶差，呼吸急促。需要病毒拭子检测和静脉补液。',
      teachingPoint: '3 月龄以下的危险区为心率 > 180 次/分或呼吸频率 > 50 次/分。她的心率在这个年龄尚可接受，但呼吸频率不行：ESI 2 级。患毛细支气管炎的小婴儿可能因疲劳而出现呼吸暂停。',
    },
    variants: {
      vitals: { hr: [166, 178], rr: [54, 64], sbp: [76, 86], spo2: [92, 95], tempC: [37.2, 37.9] },
      openings: [
        { en: 'Her mother says the wailing has gone quiet and wheezy.', zh: '妈妈说她的哀嚎变得又轻又带喘鸣。' },
        { en: 'Brought in by her mother at midnight, wheezing.', zh: '半夜被妈妈抱来，一直在喘。' },
      ],
    },
  },
  {
    id: 'gremlin-gastro',
    name: 'Grizzle the Gremlin, 1',
    emoji: '🦇',
    story: 'Licked the inside of the candy cauldron. Vomiting and diarrhoea since, few wet nappies, sleepy but wakes and cries. Needs labs and IV fluids.',
    patient: { ageYears: 1, avpu: 'A', newConfusion: false, hr: 172, rr: 38, sbp: 88, spo2: 98, tempC: 37.9, pain: 3, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'From 3 months to 3 years the HR danger zone is > 160. Tachycardia is an early sign of dehydration in children; low blood pressure is a late, ominous sign.',
    zh: {
      name: '小魔怪格里佐，1 岁',
      story: '舔了糖果坩埚的内壁。此后一直呕吐、腹泻，尿布很少湿，嗜睡但能唤醒并哭闹。需要化验和静脉补液。',
      teachingPoint: '3 月龄至 3 岁的心率危险区为 > 160 次/分。心动过速是儿童脱水的早期征象；低血压是晚期的危险征象。',
    },
    variants: {
      vitals: { hr: [166, 178], rr: [32, 40], sbp: [84, 92], spo2: [97, 99], tempC: [37.5, 38.3] },
      openings: [
        { en: 'Got wet after midnight and has been sick ever since.', zh: '午夜后沾了水，之后就一直不舒服。' },
        { en: 'Snacked on the candy cauldron scrapings at the party.', zh: '在派对上偷吃了糖果坩埚底的残渣。' },
      ],
    },
  },
  {
    id: 'imp-appendicitis',
    name: 'Little Imp, 6',
    emoji: '😈',
    story: 'Ate a whole bag of brimstone candy. Belly pain started at the navel and moved to the right side. Vomiting, will not jump.',
    patient: { ageYears: 6, avpu: 'A', newConfusion: false, hr: 146, rr: 28, sbp: 98, spo2: 98, tempC: 38.2, pain: 6, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'For ages 3 to 8 the danger zone is HR > 140 or RR > 30. A heart rate above 140 with 2 or more resources (labs, ultrasound, IV fluids) means ESI 2. Pain moving from the navel to the right lower quadrant suggests appendicitis.',
    zh: {
      name: '小恶魔，6 岁',
      story: '吃了一整袋硫磺糖。腹痛从肚脐周围开始，后转移到右侧。呕吐，不肯跳。',
      teachingPoint: '3 至 8 岁的危险区为心率 > 140 次/分或呼吸频率 > 30 次/分。心率超过 140 次/分且需要 2 项及以上资源（化验、超声、静脉补液），为 ESI 2 级。疼痛由脐周转移至右下腹提示阑尾炎。',
    },
    variants: {
      vitals: { hr: [142, 154], rr: [24, 30], sbp: [94, 104], spo2: [97, 99], tempC: [37.9, 38.6], pain: [5, 6] },
      openings: [
        { en: 'Won a brimstone-candy eating contest last night.', zh: '昨晚赢了一场硫磺糖大胃王比赛。' },
        { en: 'Skipped his fire-breathing lesson with a sore belly.', zh: '因为肚子痛，翘掉了喷火课。' },
      ],
    },
  },
  {
    id: 'baby-bat-febrile-infant',
    name: 'Baby Bat, 3 weeks',
    emoji: '🍼',
    story: 'Felt hot to her parents at bedtime. Feeding a little less, otherwise looks well, pink and alert.',
    patient: { ageYears: 0.06, avpu: 'A', newConfusion: false, hr: 160, rr: 44, sbp: 76, spo2: 99, tempC: 38.4, pain: 0, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'A temperature of 38 °C or more in an infant under 3 months is high risk however well she looks, because young infants hide serious bacterial infection: ESI 2, with a full sepsis work-up.',
    zh: {
      name: '蝙蝠宝宝，3 周龄',
      story: '睡前父母摸着她发烫。吃奶稍微少了些，其他方面看起来很好，面色红润、精神清醒。',
      teachingPoint: '3 月龄以下婴儿体温 ≥ 38 °C 属于高危，无论看起来多好，因为小婴儿常掩盖严重细菌感染：ESI 2 级，并完善脓毒症评估。',
    },
    variants: {
      vitals: { hr: [148, 172], rr: [38, 50], sbp: [72, 84], spo2: [97, 100], tempC: [38.1, 38.8] },
      openings: [
        { en: 'Her little wings felt hot to her parents at bedtime.', zh: '睡前父母摸着她的小翅膀发烫。' },
        { en: 'Woke hot and fussy in her upside-down cradle.', zh: '在倒挂的摇篮里醒来，浑身发烫、哭闹不安。' },
      ],
    },
  },
  {
    id: 'siren-preeclampsia',
    name: 'Selene the Siren, 31',
    emoji: '🧜‍♀️',
    story: 'Thirty-four weeks pregnant. A pounding headache, flashing lights in her eyes and new swelling of her face and hands.',
    patient: { ageYears: 31, avpu: 'A', newConfusion: false, hr: 92, rr: 18, sbp: 168, spo2: 98, tempC: 36.9, pain: 6, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'After 20 weeks of pregnancy, high blood pressure with headache or visual disturbance is pre-eclampsia with severe features until proven otherwise: ESI 2. With the obstetric team, treat severe blood pressure promptly and give magnesium sulfate to prevent eclamptic seizures.',
    zh: {
      name: '海妖塞勒涅，31 岁',
      story: '妊娠 34 周。剧烈的搏动性头痛，眼前闪光，面部和双手新出现水肿。',
      teachingPoint: '妊娠 20 周后，高血压伴头痛或视觉异常，在排除之前都应视为重度子痫前期：ESI 2 级。应与产科团队一起及时控制重度高血压，并给予硫酸镁预防子痫抽搐。',
    },
    variants: {
      vitals: { hr: [84, 102], rr: [16, 20], sbp: [160, 180], spo2: [96, 99], tempC: [36.6, 37.2], pain: [5, 7] },
      openings: [
        { en: 'Thirty-four weeks pregnant, and she stopped singing mid-song.', zh: '妊娠 34 周，唱到一半停了下来。' },
        { en: 'Thirty-four weeks pregnant, helped in from the rocks by her sisters.', zh: '妊娠 34 周，被姐妹们从礁石上扶了进来。' },
      ],
    },
  },
  {
    id: 'shade-suicidal',
    name: 'Hollow the Shade, 22',
    emoji: '🌑',
    story: 'Pacing and shouting at the nurses, then says he wants to fade away for good. He has a plan and has given away his belongings.',
    patient: { ageYears: 22, avpu: 'A', newConfusion: false, hr: 104, rr: 18, sbp: 132, spo2: 99, tempC: 36.8, pain: 0, highRisk: true, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Suicidal thoughts with a plan, or agitation that puts the patient or staff at risk, is high risk: ESI 2. Keep him in a safe room under constant observation, remove anything that could cause harm, and try calm de-escalation before any medication.',
    zh: {
      name: '幽影霍洛，22 岁',
      story: '一边踱步一边冲护士大喊，随后说想永远消失。他已有计划，并且把自己的东西都送了人。',
      teachingPoint: '有具体计划的自杀念头，或会危及患者本人或工作人员的激越行为，属于高危：ESI 2 级。将他安置在安全房间并持续看护，移除可能造成伤害的物品，用药前先尝试冷静的言语安抚。',
    },
    variants: {
      vitals: { hr: [96, 116], rr: [16, 22], sbp: [124, 142], spo2: [97, 100], tempC: [36.5, 37.1] },
      openings: [
        { en: 'Kicked over a chair in the waiting room, then said he wants to fade away for good.', zh: '在候诊室踢翻了一把椅子，随后说想永远消失。' },
        { en: 'Brought in by friends after shouting from the bell tower, he says he wants to fade away for good.', zh: '在钟楼上大喊后被朋友们带来，他说想永远消失。' },
      ],
    },
  },
  {
    id: 'grimalkin-fall-anticoag',
    name: 'Granny Grimalkin, 84',
    emoji: '🐈‍⬛',
    story: 'Tripped over her cat on the cellar steps and hit her head. Takes apixaban for atrial fibrillation. Alert and talking, with a small bump above one eye.',
    patient: { ageYears: 84, avpu: 'A', newConfusion: false, hr: 82, rr: 16, sbp: 148, spo2: 96, tempC: 36.6, pain: 3, highRisk: true, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'A head strike while on an anticoagulant is high risk even when she looks well, because bleeding inside the skull can be slow and silent: ESI 2, with an urgent CT head.',
    zh: {
      name: '格里玛金奶奶，84 岁',
      story: '在地窖台阶上被自家的猫绊倒，撞到了头。因心房颤动服用阿哌沙班。神志清醒，能正常交谈，一侧眼眶上方有个小肿包。',
      teachingPoint: '服用抗凝药时头部受到撞击，即使看起来状况良好也属于高危，因为颅内出血可能缓慢而隐匿：ESI 2 级，需紧急头颅 CT。',
    },
    variants: {
      vitals: { hr: [70, 96], rr: [14, 18], sbp: [136, 160], spo2: [95, 98], tempC: [36.3, 36.9] },
      openings: [
        { en: 'Slipped off her broom at the doorstep and hit her head.', zh: '在门口从扫帚上滑落，撞到了头。' },
        { en: 'Fell against the cauldron while stirring and hit her head.', zh: '搅拌坩埚时摔倒，头撞在了坩埚上。' },
      ],
    },
  },
  {
    id: 'sugar-skull-dka',
    name: 'Sofia Sugar Skull, 14',
    emoji: '🍬',
    story: 'Type 1 diabetes, and her insulin pump stopped working yesterday. Vomiting, belly ache, deep sighing breaths and a fruity smell on her breath.',
    patient: { ageYears: 14, avpu: 'A', newConfusion: false, hr: 124, rr: 30, sbp: 106, spo2: 99, tempC: 37.1, pain: 4, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Vomiting, abdominal pain and deep (Kussmaul) breathing in type 1 diabetes is diabetic ketoacidosis. Labs, IV fluids and IV insulin are 3 resources, and her heart and breathing rates are in the danger zone (HR > 100, RR > 20): ESI 2.',
    zh: {
      name: '糖骷髅索菲亚，14 岁',
      story: '1 型糖尿病，胰岛素泵昨天停止工作。呕吐、腹痛，呼吸深长如叹气，呼气有烂苹果味。',
      teachingPoint: '1 型糖尿病患者出现呕吐、腹痛和深大（库斯莫尔）呼吸，提示糖尿病酮症酸中毒。化验、静脉补液和静脉胰岛素共 3 项资源，且心率和呼吸频率处于危险区（心率 > 100、呼吸频率 > 20）：ESI 2 级。',
    },
    variants: {
      vitals: { hr: [114, 134], rr: [26, 34], sbp: [98, 114], spo2: [97, 100], tempC: [36.8, 37.4], pain: [3, 5] },
      openings: [
        { en: 'Type 1 diabetes, and she skipped her insulin to eat more Halloween candy.', zh: '1 型糖尿病，为了多吃万圣节糖果没打胰岛素。' },
        { en: 'Type 1 diabetes, and she stopped her insulin during a tummy bug.', zh: '1 型糖尿病，得了肠胃炎后停用了胰岛素。' },
      ],
    },
  },

  {
    id: 'raven-paracetamol',
    name: 'Poe the Raven, 38',
    emoji: '🐦‍⬛',
    story: 'Toothache all week, so he took extra paracetamol, plus cold-and-flu sachets, for 3 days. No intent to harm himself. Mild nausea, otherwise well.',
    patient: { ageYears: 38, avpu: 'A', newConfusion: false, hr: 84, rr: 16, sbp: 126, spo2: 98, tempC: 37.0, pain: 4, highRisk: true, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'A staggered paracetamol overdose is high risk even when he looks well: the treatment nomogram cannot be used when the tablets were taken over more than one sitting, so IV acetylcysteine is started at once, without waiting for the paracetamol level. ESI 2. The liver can be failing silently.',
    zh: {
      name: '渡鸦坡，38 岁',
      story: '牙痛了一整周，于是 3 天来额外多吃了对乙酰氨基酚，还冲了感冒冲剂。没有伤害自己的意图。轻微恶心，其他方面良好。',
      teachingPoint: '分次过量服用对乙酰氨基酚属于高危，即使他看起来状况良好：药物分多次服下时无法使用治疗列线图，因此应立即开始静脉乙酰半胱氨酸，不必等待血药浓度结果。ESI 2 级。肝脏可能正在悄无声息地衰竭。',
    },
    variants: {
      vitals: { hr: [76, 94], rr: [14, 18], sbp: [118, 134], spo2: [97, 100], tempC: [36.6, 37.4], pain: [3, 5] },
      openings: [
        { en: 'A cracked beak hurt all week, so he took extra paracetamol, plus cold-and-flu sachets, for 3 days.', zh: '喙裂了一整周都在痛，于是 3 天来额外多吃了对乙酰氨基酚，还冲了感冒冲剂。' },
        { en: 'Nursing a fever for 3 days, he doubled up on paracetamol and cold-and-flu sachets.', zh: '发热 3 天，他把对乙酰氨基酚和感冒冲剂都吃了双倍。' },
      ],
    },
  },

  // ---------------- ESI 3: Urgent ----------------
  {
    id: 'goblin-abdopain',
    name: 'Grubnik the Goblin, 27',
    emoji: '👺',
    story: 'Right lower belly pain since yesterday, worse when he walks. Ate something that was still moving. Needs labs and a CT.',
    patient: { ageYears: 27, avpu: 'A', newConfusion: false, hr: 94, rr: 18, sbp: 126, spo2: 98, tempC: 37.9, pain: 6, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'Labs and a CT are 2 resources. With adult vital signs outside the danger zone and pain below 7, that is ESI 3. Re-triage if the vitals change.',
    zh: {
      name: '哥布林格鲁布尼克，27 岁',
      story: '右下腹痛从昨天开始，走路时加重。吃了一样还在动的东西。需要化验和 CT。',
      teachingPoint: '化验加 CT 是 2 项资源。成人生命体征不在危险区且疼痛评分低于 7 分，为 ESI 3 级。生命体征变化时需重新分诊。',
    },
    variants: {
      vitals: { hr: [84, 98], rr: [14, 20], sbp: [118, 134], spo2: [97, 99], tempC: [37.4, 38.2], pain: [5, 6] },
      openings: [
        { en: 'Right lower belly pain since the goblin market closed yesterday.', zh: '昨天哥布林集市收摊后开始右下腹痛。' },
        { en: 'Right lower belly pain that makes him limp on his right leg.', zh: '右下腹痛，痛得他右腿一瘸一拐。' },
      ],
    },
  },
  {
    id: 'zombie-handbite',
    name: 'Zelda the Zombie, 26',
    emoji: '🧟‍♀️',
    story: 'The night watchman’s dog bit her hand two days ago. Now red, swollen and throbbing over the knuckles.',
    patient: { ageYears: 26, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 122, spo2: 99, tempC: 37.8, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'An infected hand bite needs an x-ray (fracture, tooth fragments) and IV antibiotics: 2 resources, ESI 3 with normal vitals. Hand bites infect easily and can involve tendons and joints.',
    zh: {
      name: '僵尸塞尔达，26 岁',
      story: '两天前手被守夜人的狗咬伤。现在指关节处红肿、跳痛。',
      teachingPoint: '感染的手部咬伤需要 X 线检查（排查骨折、牙齿碎片）和静脉抗生素：2 项资源，生命体征正常时为 ESI 3 级。手部咬伤容易感染，并可累及肌腱和关节。',
    },
    variants: {
      vitals: { hr: [80, 96], rr: [14, 18], sbp: [114, 130], spo2: [98, 100], tempC: [37.4, 38.2] },
      openings: [
        { en: 'A graveyard rat bit her hand two days ago.', zh: '两天前手被墓地里的老鼠咬伤。' },
        { en: 'Her own pet hellhound nipped her knuckles two days ago.', zh: '两天前她养的地狱犬咬了她的指关节。' },
      ],
    },
  },
  {
    id: 'pixie-toddler-fever',
    name: 'Pip the Pixie, 2',
    emoji: '🧚',
    story: 'Fever and cough for 2 days, still drinking and playing between naps. Needs a chest x-ray and labs.',
    patient: { ageYears: 2, avpu: 'A', newConfusion: false, hr: 150, rr: 34, sbp: 96, spo2: 96, tempC: 38.9, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'For ages 3 months to 3 years the danger zone is HR > 160 or RR > 40. Pip’s heart and breathing rates would alarm you in an adult but are within range here, so ESI 3, not 2.',
    zh: {
      name: '小精灵皮普，2 岁',
      story: '发热、咳嗽 2 天，小睡间隙仍能喝水和玩耍。需要胸部 X 线和化验。',
      teachingPoint: '3 月龄至 3 岁的危险区为心率 > 160 次/分或呼吸频率 > 40 次/分。皮普的心率和呼吸频率在成人身上会令人警觉，但在这个年龄属于正常范围，因此为 ESI 3 级而非 2 级。',
    },
    variants: {
      vitals: { hr: [138, 156], rr: [30, 38], sbp: [92, 100], spo2: [95, 97], tempC: [38.5, 39.3] },
      openings: [
        { en: 'Wings drooping with a fever and cough for 2 days, still drinking and playing between naps.', zh: '发热、咳嗽 2 天，翅膀耷拉着，小睡间隙仍能喝水和玩耍。' },
        { en: 'Glowing warm with a fever and cough for 2 days, but still sipping nectar and playing.', zh: '发热、咳嗽 2 天，浑身发烫，但仍在小口喝花蜜、玩耍。' },
      ],
    },
  },
  {
    id: 'frankie-jr-fracture',
    name: 'Frankie Jr., 5',
    emoji: '🦴',
    story: 'Fell off the castle battlements onto an outstretched hand. Wrist bent the wrong way, fingers pink and warm. Splinted, pain moderate.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 130, rr: 26, sbp: 102, spo2: 99, tempC: 36.9, pain: 5, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 3,
    teachingPoint: 'X-ray (1) plus a reduction under procedural sedation (a complex procedure, 2) is 3 resources; the splint is not a resource. For ages 3 to 8, his heart and breathing rates are below the danger zone (HR > 140, RR > 30), so ESI 3.',
    zh: {
      name: '小弗兰基，5 岁',
      story: '从城堡垛口摔下，手掌撑地。腕部向错误方向弯曲，手指红润温暖。已夹板固定，疼痛中等。',
      teachingPoint: 'X 线（1 项）加程序性镇静下复位（复杂操作，2 项）共 3 项资源；夹板不算资源。3 至 8 岁时他的心率和呼吸频率低于危险区（心率 > 140、呼吸频率 > 30），因此为 ESI 3 级。',
    },
    variants: {
      vitals: { hr: [118, 136], rr: [22, 28], sbp: [98, 106], spo2: [98, 100], tempC: [36.6, 37.2] },
      openings: [
        { en: 'Jumped off the lab table onto an outstretched hand.', zh: '从实验台上跳下，手掌撑地。' },
        { en: 'Tripped over his father’s cables onto an outstretched hand.', zh: '被父亲的电缆绊倒，手掌撑地。' },
      ],
    },
  },
  {
    id: 'golem-renal-colic',
    name: 'Granite the Golem, 44',
    emoji: '🗿',
    story: 'Sudden, gripping pain in his left flank an hour ago, shooting down to the groin in waves. Cannot keep still, but the pain has eased a little since he arrived. No fever, passing urine.',
    patient: { ageYears: 44, avpu: 'A', newConfusion: false, hr: 90, rr: 18, sbp: 138, spo2: 98, tempC: 36.9, pain: 6, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 3,
    teachingPoint: 'Sudden one-sided flank pain spreading to the groin suggests a kidney stone. Labs, a CT and IV pain relief are 3 resources; with normal vitals and pain under 7, that is ESI 3. A fever with a stone means an infected, blocked kidney: high risk, re-triage to ESI 2.',
    zh: {
      name: '石魔格拉尼特，44 岁',
      story: '一小时前左侧腰部突发绞痛，阵阵向下放射至腹股沟。坐立不安，但到院后疼痛稍有缓解。无发热，能排尿。',
      teachingPoint: '突发一侧腰痛并向腹股沟放射，提示肾结石。化验、CT 和静脉镇痛共 3 项资源；生命体征正常且疼痛低于 7 分，为 ESI 3 级。结石伴发热提示感染性梗阻肾：属于高危，应重新分诊为 ESI 2 级。',
    },
    variants: {
      vitals: { hr: [80, 98], rr: [14, 20], sbp: [126, 148], spo2: [97, 100], tempC: [36.5, 37.3], pain: [4, 6] },
      openings: [
        { en: 'Sudden, gripping pain in his left flank while hauling stones at the quarry, shooting down to the groin in waves.', zh: '在采石场搬石头时左侧腰部突发绞痛，阵阵向下放射至腹股沟。' },
        { en: 'Woke at midnight with a gripping pain in his left flank, shooting down to the groin in waves.', zh: '半夜被左侧腰部的绞痛痛醒，疼痛阵阵向下放射至腹股沟。' },
      ],
    },
  },
  {
    id: 'ghoul-gi-bleed',
    name: 'Gus the Ghoul, 46',
    emoji: '🪦',
    story: 'Bright red blood on the paper and in the bowl after the toilet for 2 days. No dizziness, no black stools, no blood thinners.',
    patient: { ageYears: 46, avpu: 'A', newConfusion: false, hr: 84, rr: 16, sbp: 130, spo2: 98, tempC: 36.7, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'A small, bright red rectal bleed with normal vital signs needs labs and a surgical or gastroenterology review: 2 resources, ESI 3. Black stools, dizziness, a heart rate over 100 or low blood pressure would change this: re-triage straight away.',
    zh: {
      name: '食尸鬼格斯，46 岁',
      story: '2 天来便后厕纸上和马桶里有鲜红色血。无头晕，无黑便，未服用抗凝药。',
      teachingPoint: '少量鲜红色便血且生命体征正常，需要化验和外科或消化科会诊：2 项资源，ESI 3 级。若出现黑便、头晕、心率超过 100 次/分或低血压，应立即重新分诊。',
    },
    variants: {
      vitals: { hr: [74, 94], rr: [14, 18], sbp: [122, 140], spo2: [97, 100], tempC: [36.4, 37.0], pain: [1, 3] },
    },
  },
  {
    id: 'horseman-head-injury',
    name: 'Sir Bram the Horseman, 38',
    emoji: '🐴',
    story: 'Thrown from his horse in the churchyard and knocked out for under a minute. Now alert with a headache and a 4 cm scalp cut. Not on blood thinners.',
    patient: { ageYears: 38, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 134, spo2: 98, tempC: 36.7, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'A fall from a horse is a dangerous mechanism under the Canadian CT Head Rule, so after a blackout he needs a CT head, and the scalp cut needs stitches: 2 resources, ESI 3. Re-triage at once if he becomes drowsy, vomits repeatedly or has a seizure.',
    zh: {
      name: '骑士布拉姆，38 岁',
      story: '在教堂墓地被马甩下，昏迷不到一分钟。现在神志清醒，头痛，头皮有一道 4 cm 的裂伤。未服用抗凝药。',
      teachingPoint: '按照加拿大头颅 CT 规则，坠马属于危险致伤机制，因此他在短暂昏迷后需要做头颅 CT，头皮裂伤也需要缝合：2 项资源，ESI 3 级。若出现嗜睡、反复呕吐或抽搐，应立即重新分诊。',
    },
    variants: {
      vitals: { hr: [78, 98], rr: [14, 18], sbp: [124, 144], spo2: [97, 100], tempC: [36.4, 37.0], pain: [4, 6] },
      openings: [
        { en: 'His horse bolted at a jack-o’-lantern and threw him, and he was knocked out for under a minute.', zh: '他的马被南瓜灯惊到，把他甩了下来，他昏迷了不到一分钟。' },
        { en: 'Thrown over a fence while chasing a ghost and knocked out for under a minute.', zh: '追赶幽灵时被甩过篱笆，昏迷不到一分钟。' },
      ],
    },
  },
  {
    id: 'kelpie-pyelonephritis',
    name: 'Kip the Kelpie, 7',
    emoji: '💧',
    story: 'Fever, vomiting and pain in his right side and back since this morning. Stinging when he pees. Drinking a little.',
    patient: { ageYears: 7, avpu: 'A', newConfusion: false, hr: 126, rr: 24, sbp: 100, spo2: 98, tempC: 39.0, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'Fever with flank pain and urinary symptoms suggests a kidney infection. Labs plus IV fluids or antibiotics are 2 resources. For ages 3 to 8 his heart and breathing rates are under the danger zone (HR > 140, RR > 30), so ESI 3.',
    zh: {
      name: '水马基普，7 岁',
      story: '从今天早上开始发热、呕吐，右侧腰背痛。排尿时刺痛。能喝一点水。',
      teachingPoint: '发热伴腰腹痛和泌尿系症状，提示肾盂肾炎。化验加静脉补液或抗生素共 2 项资源。3 至 8 岁时他的心率和呼吸频率低于危险区（心率 > 140、呼吸频率 > 30），因此为 ESI 3 级。',
    },
    variants: {
      vitals: { hr: [116, 138], rr: [20, 28], sbp: [94, 106], spo2: [97, 100], tempC: [38.5, 39.4], pain: [4, 6] },
      openings: [
        { en: 'Came out of the loch shivering, with fever, vomiting and pain in his right side and back.', zh: '从湖里出来时打着寒战，发热、呕吐，右侧腰背痛。' },
        { en: 'Too sick to swim today: fever, vomiting and pain in his right side and back.', zh: '今天病得游不动泳：发热、呕吐，右侧腰背痛。' },
      ],
    },
  },
  {
    id: 'hobgoblin-dehydration',
    name: 'Nib the Hobgoblin, 18 months',
    emoji: '🍄',
    story: 'Vomiting and diarrhoea for a day, fewer wet nappies, but still alert and crying tears. Not keeping fluids down. Needs labs and IV fluids.',
    patient: { ageYears: 1.5, avpu: 'A', newConfusion: false, hr: 148, rr: 32, sbp: 92, spo2: 99, tempC: 37.8, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'From 3 months to 3 years the danger zone is HR > 160 or RR > 40. Nib needs 2 resources, but his vitals stay under those limits: ESI 3. If his heart rate climbs above 160 or he becomes floppy, re-triage to ESI 2.',
    zh: {
      name: '小妖精尼布，18 月龄',
      story: '呕吐、腹泻一天，尿布湿得少了，但仍然清醒，哭时有眼泪。喝下去就吐。需要化验和静脉补液。',
      teachingPoint: '3 月龄至 3 岁的危险区为心率 > 160 次/分或呼吸频率 > 40 次/分。尼布需要 2 项资源，但生命体征未超过这些界限：ESI 3 级。若心率升至 160 次/分以上或变得软弱无力，应重新分诊为 ESI 2 级。',
    },
    variants: {
      vitals: { hr: [136, 158], rr: [28, 38], sbp: [88, 98], spo2: [97, 100], tempC: [37.4, 38.2] },
      openings: [
        { en: 'Caught the nursery tummy bug: vomiting and diarrhoea for a day, but still alert and crying tears.', zh: '在托儿所染上了肠胃炎：呕吐、腹泻一天，但仍然清醒，哭时有眼泪。' },
        { en: 'Vomiting and diarrhoea since yesterday’s party, but still alert and crying tears.', zh: '从昨天的派对后开始呕吐、腹泻，但仍然清醒，哭时有眼泪。' },
      ],
    },
  },
  {
    id: 'spider-hip-fracture',
    name: 'Grandma Cobweb, 82',
    emoji: '🕸️',
    story: 'Slipped on a cobweb in her parlour and cannot stand. Her right leg is shorter and turned out. She did not hit her head and is not on blood thinners. Comfortable lying still.',
    patient: { ageYears: 82, avpu: 'A', newConfusion: false, hr: 88, rr: 18, sbp: 140, spo2: 96, tempC: 36.5, pain: 5, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 3,
    teachingPoint: 'A shortened, externally rotated leg after a fall suggests a hip fracture. X-ray, labs and IV pain relief or a nerve block are 3 resources: ESI 3 with stable vitals and pain under 7. Give pain relief early, and find out why she fell.',
    zh: {
      name: '蛛网奶奶，82 岁',
      story: '在客厅里踩到蛛网滑倒，站不起来了。右腿变短并向外旋。没有撞到头，未服用抗凝药。躺着不动时还算舒服。',
      teachingPoint: '跌倒后下肢缩短、外旋，提示髋部骨折。X 线、化验和静脉镇痛或神经阻滞共 3 项资源：生命体征稳定且疼痛低于 7 分时为 ESI 3 级。应尽早镇痛，并查找跌倒的原因。',
    },
    variants: {
      vitals: { hr: [78, 96], rr: [16, 20], sbp: [128, 152], spo2: [95, 98], tempC: [36.2, 36.8], pain: [4, 6] },
      openings: [
        { en: 'Lost her footing on her own silk thread and cannot stand.', zh: '踩在自己吐的丝上失足滑倒，站不起来了。' },
        { en: 'Fell from her rocking chair while knitting a web and cannot stand.', zh: '织网时从摇椅上摔下来，站不起来了。' },
      ],
    },
  },
  {
    id: 'troll-cellulitis',
    name: 'Bruk the Bridge Troll, 52',
    emoji: '🌉',
    story: 'Spreading redness, heat and swelling of his shin for 3 days, from a scratch on a goat horn. Fever this morning. Needs labs and IV antibiotics.',
    patient: { ageYears: 52, avpu: 'A', newConfusion: false, hr: 92, rr: 18, sbp: 136, spo2: 97, tempC: 38.2, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'Cellulitis that needs labs and IV antibiotics uses 2 resources; with heart and breathing rates under the adult danger zone, that is ESI 3. Mark the edge of the redness so the next shift can see whether it spreads.',
    zh: {
      name: '桥下巨魔布鲁克，52 岁',
      story: '小腿被山羊角划伤后，3 天来红、热、肿不断扩散。今天早上开始发热。需要化验和静脉抗生素。',
      teachingPoint: '需要化验和静脉抗生素的蜂窝织炎占用 2 项资源；心率和呼吸频率均低于成人危险区，为 ESI 3 级。用笔标出红肿边界，方便下一班观察是否扩散。',
    },
    variants: {
      vitals: { hr: [84, 98], rr: [14, 20], sbp: [126, 146], spo2: [96, 99], tempC: [37.8, 38.6], pain: [4, 6] },
      openings: [
        { en: 'Spreading redness, heat and swelling of his shin for 3 days, from a splinter off his bridge.', zh: '被桥上的木刺扎伤后，小腿 3 天来红、热、肿不断扩散。' },
        { en: 'Spreading redness, heat and swelling of his shin for 3 days, after wading through the moat.', zh: '蹚过护城河后，小腿 3 天来红、热、肿不断扩散。' },
      ],
    },
  },
  {
    id: 'cyclops-pneumonia',
    name: 'Ollie the Cyclops, 58',
    emoji: '👁️',
    story: 'Cough with green sputum and a fever for 4 days. A little short of breath on the stairs, speaking in full sentences.',
    patient: { ageYears: 58, avpu: 'A', newConfusion: false, hr: 94, rr: 18, sbp: 132, spo2: 94, tempC: 38.4, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'His heart rate, breathing rate and SpO2 all stay out of the adult danger zone (HR > 100, RR > 20, SpO2 < 92%). A chest x-ray and labs are 2 resources, so ESI 3. Re-check his vitals while he waits: pneumonia can worsen quickly.',
    zh: {
      name: '独眼巨人奥利，58 岁',
      story: '咳嗽、咳绿痰、发热 4 天。爬楼梯时稍感气短，能说完整的句子。',
      teachingPoint: '他的心率、呼吸频率和血氧饱和度都不在成人危险区内（心率 > 100、呼吸频率 > 20、血氧饱和度 < 92%）。胸部 X 线和化验共 2 项资源，因此为 ESI 3 级。候诊期间要复测生命体征：肺炎可能迅速加重。',
    },
    variants: {
      vitals: { hr: [84, 100], rr: [16, 20], sbp: [122, 142], spo2: [93, 96], tempC: [38.0, 38.8], pain: [1, 3] },
    },
  },

  // ---------------- ESI 4: Less urgent ----------------
  {
    id: 'werewolf-sprain',
    name: 'Luna Lycan, 29',
    emoji: '🐺',
    story: 'Twisted an ankle mid-transformation. Can walk with a limp. Mostly annoyed.',
    patient: { ageYears: 29, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 128, spo2: 99, tempC: 36.8, pain: 4, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'An ankle x-ray is 1 resource; a splint, crutches and oral pain relief are not. The Ottawa ankle rules tell you whether she needs the x-ray at all.',
    zh: {
      name: '狼人露娜，29 岁',
      story: '变身途中扭伤了脚踝。能跛行。主要是很恼火。',
      teachingPoint: '踝关节 X 线是 1 项资源；夹板、拐杖和口服止痛药都不算资源。渥太华踝关节规则可以判断她是否真的需要拍 X 线。',
    },
    variants: {
      vitals: { hr: [78, 96], rr: [14, 18], sbp: [118, 134], spo2: [98, 100], tempC: [36.5, 37.1], pain: [3, 5] },
      openings: [
        { en: 'Landed badly on her ankle chasing the moon’s reflection.', zh: '追逐月亮倒影时脚踝着地姿势不对。' },
        { en: 'Rolled an ankle on a loose gravestone.', zh: '在一块松动的墓碑上崴了脚。' },
      ],
    },
  },
  {
    id: 'banshee-uti',
    name: 'Siobhan the Banshee, 24',
    emoji: '😱',
    story: 'Burning when she pees and going every ten minutes, which interrupts her wailing. No fever, no back pain.',
    patient: { ageYears: 24, avpu: 'A', newConfusion: false, hr: 82, rr: 14, sbp: 118, spo2: 99, tempC: 37.1, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Labs count as one resource however many tests you send: urinalysis plus culture (and a pregnancy test) is still 1 resource, so ESI 4.',
    zh: {
      name: '报丧女妖希冯，24 岁',
      story: '排尿时有烧灼感，每十分钟就要上一次厕所，打断了她的哀嚎。无发热，无腰背痛。',
      teachingPoint: '无论送检多少项，化验只算 1 项资源：尿常规加尿培养（以及妊娠试验）仍是 1 项资源，因此为 ESI 4 级。',
    },
    variants: {
      vitals: { hr: [74, 92], rr: [12, 16], sbp: [108, 126], spo2: [98, 100], tempC: [36.8, 37.4] },
      openings: [
        { en: 'Burning when she pees, and every wail ends in a dash to the toilet.', zh: '排尿时有烧灼感，每哀嚎一声就得冲去厕所。' },
        { en: 'Burning when she pees and up every ten minutes all night.', zh: '排尿时有烧灼感，整夜每十分钟就要起来一次。' },
      ],
    },
  },
  {
    id: 'scarecrow-laceration',
    name: 'Scarecrow Silas, 45',
    emoji: '🌾',
    story: 'A crow pecked his forearm: a clean 3 cm cut, bleeding controlled with pressure. Last tetanus shot: unknown.',
    patient: { ageYears: 45, avpu: 'A', newConfusion: false, hr: 78, rr: 14, sbp: 132, spo2: 99, tempC: 36.7, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Suturing a simple laceration is 1 resource (a simple procedure). The tetanus booster is not counted as a resource, so ESI 4.',
    zh: {
      name: '稻草人塞拉斯，45 岁',
      story: '前臂被乌鸦啄伤：一条 3 cm 的整齐裂伤，压迫后出血已控制。上次破伤风疫苗接种时间不详。',
      teachingPoint: '缝合单纯裂伤是 1 项资源（简单操作）。破伤风加强针不算资源，因此为 ESI 4 级。',
    },
    variants: {
      vitals: { hr: [70, 88], rr: [12, 16], sbp: [122, 140], spo2: [98, 100], tempC: [36.4, 37.0] },
      openings: [
        { en: 'A farmer’s scythe slipped: a clean 3 cm cut on his forearm, bleeding controlled with pressure.', zh: '农夫的镰刀一滑：前臂一条 3 cm 的整齐裂伤，压迫后出血已控制。' },
        { en: 'Caught his forearm on a tin sign: a clean 3 cm cut, bleeding controlled with pressure.', zh: '前臂被铁皮招牌划伤：一条 3 cm 的整齐裂伤，压迫后出血已控制。' },
      ],
    },
  },
  {
    id: 'hag-asthma-mild',
    name: 'Hex the Hag, 36',
    emoji: '🧹',
    story: 'Known asthma, wheezy after sweeping a dusty crypt. Her inhaler helped a little. Talking in full sentences.',
    patient: { ageYears: 36, avpu: 'A', newConfusion: false, hr: 92, rr: 20, sbp: 124, spo2: 96, tempC: 36.8, pain: 1, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Mild asthma that settles with one course of nebulised salbutamol uses 1 resource (a nebulised medicine): ESI 4. Full sentences and a normal SpO2 are reassuring; re-triage if she cannot finish a sentence.',
    zh: {
      name: '老巫婆赫克丝，36 岁',
      story: '有哮喘病史，打扫满是灰尘的墓穴后开始喘。用了吸入器稍有缓解。能说完整的句子。',
      teachingPoint: '经一个疗程雾化沙丁胺醇即可缓解的轻度哮喘只占用 1 项资源（雾化药物）：ESI 4 级。能说完整句子且血氧饱和度正常令人放心；若她说不完一句话，应重新分诊。',
    },
    variants: {
      vitals: { hr: [84, 100], rr: [16, 22], sbp: [116, 132], spo2: [94, 98], tempC: [36.5, 37.1], pain: [0, 2] },
      openings: [
        { en: 'Known asthma, wheezy since the bonfire last night.', zh: '有哮喘病史，从昨晚的篝火之后开始喘。' },
        { en: 'Known asthma, wheezy since a cold settled on her chest.', zh: '有哮喘病史，感冒后一直喘。' },
      ],
    },
  },
  {
    id: 'elf-strep-throat',
    name: 'Holly the Elf, 6',
    emoji: '🧝',
    story: 'Sore throat and fever since yesterday, no cough. Tonsils swollen with white spots. Drinking and swallowing her saliva fine.',
    patient: { ageYears: 6, avpu: 'A', newConfusion: false, hr: 114, rr: 22, sbp: 100, spo2: 99, tempC: 38.5, pain: 4, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'A rapid strep test or throat swab counts as labs: 1 resource, ESI 4. Drooling, a muffled voice or difficulty breathing would point to a dangerous throat infection and need re-triage.',
    zh: {
      name: '小精灵霍莉，6 岁',
      story: '昨天开始咽痛、发热，无咳嗽。扁桃体肿大并有白点。能喝水，也能正常吞咽口水。',
      teachingPoint: '链球菌快速检测或咽拭子属于化验：1 项资源，ESI 4 级。若出现流涎、声音含糊或呼吸困难，提示危险的咽喉感染，需要重新分诊。',
    },
    variants: {
      vitals: { hr: [102, 126], rr: [20, 26], sbp: [94, 106], spo2: [98, 100], tempC: [38.1, 38.9], pain: [3, 5] },
      openings: [
        { en: 'Sore throat and fever since the school concert yesterday, no cough.', zh: '昨天学校音乐会后开始咽痛、发热，无咳嗽。' },
        { en: 'Sore throat and fever since yesterday, with strep going round the toy workshop.', zh: '昨天开始咽痛、发热，玩具作坊里正流行链球菌感染。' },
      ],
    },
  },
  {
    id: 'troll-tot-pulled-elbow',
    name: 'Tansy the Troll Tot, 3',
    emoji: '🧸',
    story: 'Her big brother swung her round by the hands. Now she will not use her left arm and holds it bent against her tummy. No swelling.',
    patient: { ageYears: 3, avpu: 'A', newConfusion: false, hr: 108, rr: 24, sbp: 96, spo2: 99, tempC: 36.8, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'A pulled elbow (radial head subluxation) after a pull on the hand is fixed with a quick reduction: a simple procedure, 1 resource, ESI 4. No x-ray is needed when the story is typical and there is no swelling.',
    zh: {
      name: '小巨魔坦西，3 岁',
      story: '哥哥拉着她的双手转圈。现在她不肯用左臂，把它弯曲贴在肚子上。没有肿胀。',
      teachingPoint: '牵拉手部后出现的牵拉肘（桡骨头半脱位）可通过快速手法复位解决：属于简单操作，1 项资源，ESI 4 级。病史典型且无肿胀时不需要拍 X 线。',
    },
    variants: {
      vitals: { hr: [96, 120], rr: [20, 28], sbp: [90, 102], spo2: [98, 100], tempC: [36.5, 37.1], pain: [2, 4] },
      openings: [
        { en: 'Her dad lifted her over a puddle by one hand.', zh: '爸爸拉着她的一只手把她提过了水坑。' },
        { en: 'She dropped to the ground while holding her mum’s hand at the crossing.', zh: '过马路时她拉着妈妈的手，突然往地上一坐。' },
      ],
    },
  },
  {
    id: 'gnome-coin',
    name: 'Pebble the Gnome, 2',
    emoji: '🪙',
    story: 'Swallowed a gold coin from the garden hoard an hour ago. Breathing easily, no drooling, happily eating a biscuit.',
    patient: { ageYears: 2, avpu: 'A', newConfusion: false, hr: 118, rr: 26, sbp: 94, spo2: 99, tempC: 36.8, pain: 0, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'A swallowed coin in a child who is breathing, swallowing and not drooling needs one x-ray to see where it is: 1 resource, ESI 4. A swallowed button battery or magnets, drooling or noisy breathing is an emergency.',
    zh: {
      name: '地精佩布尔，2 岁',
      story: '一小时前吞下了花园宝藏里的一枚金币。呼吸平顺，不流涎，正开心地吃饼干。',
      teachingPoint: '吞下硬币的孩子若呼吸正常、能吞咽且不流涎，只需拍一张 X 线确认位置：1 项资源，ESI 4 级。若吞下的是纽扣电池或磁铁，或出现流涎、呼吸有杂音，则属于急症。',
    },
    variants: {
      vitals: { hr: [106, 132], rr: [22, 30], sbp: [88, 100], spo2: [98, 100], tempC: [36.5, 37.1] },
      openings: [
        { en: 'Swallowed a lucky coin from the wishing well an hour ago.', zh: '一小时前吞下了许愿井里的一枚幸运硬币。' },
        { en: 'Swallowed a coin from his grandfather’s pocket an hour ago.', zh: '一小时前吞下了爷爷口袋里的一枚硬币。' },
      ],
    },
  },
  {
    id: 'sprite-forehead-cut',
    name: 'Twig the Tree Sprite, 8',
    emoji: '🌳',
    story: 'Bumped her forehead on a branch: a 2 cm straight cut, edges meet, bleeding stopped. No blackout, no vomiting, acting normally.',
    patient: { ageYears: 8, avpu: 'A', newConfusion: false, hr: 94, rr: 20, sbp: 104, spo2: 99, tempC: 36.8, pain: 2, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Closing a simple cut with tissue glue is a simple procedure: 1 resource, ESI 4. Check for warning signs of head injury: blackout, vomiting, drowsiness or unusual behaviour.',
    zh: {
      name: '树精灵特维格，8 岁',
      story: '额头撞到树枝：一条 2 cm 的直线伤口，创缘对合良好，出血已止。无昏迷，无呕吐，表现正常。',
      teachingPoint: '用组织胶闭合单纯伤口属于简单操作：1 项资源，ESI 4 级。同时检查头部外伤的警示征象：昏迷、呕吐、嗜睡或行为异常。',
    },
    variants: {
      vitals: { hr: [82, 106], rr: [18, 24], sbp: [98, 112], spo2: [98, 100], tempC: [36.5, 37.1], pain: [1, 3] },
      openings: [
        { en: 'Flew into a low branch: a 2 cm straight cut on her forehead, edges meet, bleeding stopped.', zh: '飞行时撞上低垂的树枝：额头一条 2 cm 的直线伤口，创缘对合良好，出血已止。' },
        { en: 'Tripped over a root onto a stone: a 2 cm straight cut on her forehead, edges meet, bleeding stopped.', zh: '被树根绊倒，额头磕在石头上：一条 2 cm 的直线伤口，创缘对合良好，出血已止。' },
      ],
    },
  },
  {
    id: 'swamp-abscess',
    name: 'Murk the Swamp Thing, 34',
    emoji: '🐸',
    story: 'A painful, soft, red lump in his armpit for 4 days, the size of a plum. No fever, feels otherwise well.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 82, rr: 14, sbp: 124, spo2: 99, tempC: 37.1, pain: 4, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Draining a simple abscess (incision and drainage) is a simple procedure: 1 resource, ESI 4. Antibiotics by mouth are not a resource.',
    zh: {
      name: '沼泽怪默克，34 岁',
      story: '腋下长了一个疼痛、柔软、发红的肿块，已经 4 天，有李子那么大。无发热，其他方面感觉良好。',
      teachingPoint: '单纯脓肿切开引流属于简单操作：1 项资源，ESI 4 级。口服抗生素不算资源。',
    },
    variants: {
      vitals: { hr: [74, 92], rr: [12, 16], sbp: [114, 132], spo2: [98, 100], tempC: [36.8, 37.4], pain: [3, 5] },
    },
  },
  {
    id: 'pirate-vomiting',
    name: 'Captain Barnacle the Ghost Pirate, 41',
    emoji: '🏴‍☠️',
    story: 'Seasick and vomiting since his ghost ship hit a storm. Keeping sips down between bouts, passing urine, belly soft.',
    patient: { ageYears: 41, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 124, spo2: 99, tempC: 36.8, pain: 2, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'An IM injection of anti-sickness medicine is 1 resource (tablets or a dissolving wafer would be none). He is not dehydrated and his belly is soft: ESI 4.',
    zh: {
      name: '幽灵海盗巴纳克船长，41 岁',
      story: '幽灵船遇上风暴后一直晕船呕吐。呕吐间隙能喝下几小口水，有排尿，腹部柔软。',
      teachingPoint: '肌内注射止吐药为 1 项资源（口服片剂或口腔崩解片则不算资源）。他没有脱水，腹部柔软：ESI 4 级。',
    },
    variants: {
      vitals: { hr: [78, 98], rr: [14, 18], sbp: [114, 132], spo2: [98, 100], tempC: [36.5, 37.1], pain: [1, 3] },
      openings: [
        { en: 'Seasick and vomiting since the ghost ship sailed through a whirlpool.', zh: '幽灵船驶过漩涡后一直晕船呕吐。' },
        { en: 'Seasick and vomiting after a rough night crossing the bay.', zh: '夜里横渡海湾一路颠簸后一直晕船呕吐。' },
      ],
    },
  },
  {
    id: 'satyr-nail-puncture',
    name: 'Barnaby the Satyr, 30',
    emoji: '🐐',
    story: 'Stepped on a nail through his sandal in the haunted barn: a small puncture wound in the sole. Walking on it, no numbness.',
    patient: { ageYears: 30, avpu: 'A', newConfusion: false, hr: 80, rr: 14, sbp: 126, spo2: 99, tempC: 36.8, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'An x-ray to look for a retained fragment is 1 resource; cleaning the wound and a tetanus booster are not, so ESI 4. Ask him to come back if the wound becomes red or swollen.',
    zh: {
      name: '萨堤尔巴纳比，30 岁',
      story: '在闹鬼的谷仓里踩到一根钉子，钉子穿透凉鞋，足底有个小刺伤。能行走，无麻木。',
      teachingPoint: '拍 X 线排查残留碎片为 1 项资源；清洗伤口和破伤风加强针不算资源，因此为 ESI 4 级。嘱他若伤口出现红肿应复诊。',
    },
    variants: {
      vitals: { hr: [72, 90], rr: [12, 16], sbp: [116, 134], spo2: [98, 100], tempC: [36.5, 37.1], pain: [2, 4] },
    },
  },
  {
    id: 'brownie-ear-bead',
    name: 'Bramble the Brownie, 5',
    emoji: '🏠',
    story: 'Pushed a shiny bead into his right ear while tidying. Ear a bit uncomfortable, hearing fine, no bleeding or discharge.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 100, rr: 22, sbp: 100, spo2: 99, tempC: 36.8, pain: 1, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Removing a foreign body from the ear is a simple procedure: 1 resource, ESI 4. A button battery in the ear or nose is different: it burns tissue and needs removal as an emergency.',
    zh: {
      name: '家精灵布兰布尔，5 岁',
      story: '整理房间时把一颗闪亮的珠子塞进了右耳。耳朵有点不舒服，听力正常，无出血或流液。',
      teachingPoint: '取出耳内异物属于简单操作：1 项资源，ESI 4 级。耳内或鼻内的纽扣电池则不同：它会灼伤组织，需要紧急取出。',
    },
    variants: {
      vitals: { hr: [88, 114], rr: [18, 24], sbp: [94, 106], spo2: [98, 100], tempC: [36.5, 37.1], pain: [0, 2] },
      openings: [
        { en: 'Hid a shiny bead in his right ear so nobody would take it.', zh: '把一颗闪亮的珠子藏进了右耳，免得被别人拿走。' },
        { en: 'Pushed a shiny bead into his right ear during story time.', zh: '讲故事时间里把一颗闪亮的珠子塞进了右耳。' },
      ],
    },
  },

  // ---------------- ESI 5: Non-urgent ----------------
  {
    id: 'skeleton-refill',
    name: 'Mr. Bones, 40',
    emoji: '💀',
    story: 'Needs a refill of his calcium tablets. Feels fine. Rattles politely.',
    patient: { ageYears: 40, avpu: 'A', newConfusion: false, hr: 72, rr: 14, sbp: 118, spo2: 99, tempC: 36.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A prescription refill uses no ED resources, so ESI 5.',
    zh: {
      name: '骨头先生，40 岁',
      story: '需要续开钙片。感觉良好。礼貌地咔哒作响。',
      teachingPoint: '续开处方不占用急诊资源，因此为 ESI 5 级。',
    },
    variants: {
      vitals: { hr: [64, 80], rr: [12, 16], sbp: [110, 126], spo2: [98, 100], tempC: [36.3, 36.9] },
      openings: [
        { en: 'Ran out of calcium tablets on a long haunting tour.', zh: '长途巡游作祟时把钙片吃完了。' },
        { en: 'His pharmacy closed at dusk, and he needs more calcium tablets.', zh: '药店黄昏就关门了，他需要再开些钙片。' },
      ],
    },
  },
  {
    id: 'phantom-cold',
    name: 'The Phantom, 33',
    emoji: '🎭',
    story: 'Runny nose, scratchy throat and a mild cough for 2 days. Worried it will ruin his opera solo. Eating and drinking fine.',
    patient: { ageYears: 33, avpu: 'A', newConfusion: false, hr: 76, rr: 14, sbp: 120, spo2: 99, tempC: 37.3, pain: 2, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A common cold with normal vital signs needs only a history and exam: 0 resources, ESI 5. Oral medicines and advice are not resources.',
    zh: {
      name: '魅影，33 岁',
      story: '流涕、咽痒、轻微咳嗽 2 天。担心会毁了他的歌剧独唱。饮食正常。',
      teachingPoint: '生命体征正常的普通感冒只需病史采集和体格检查：0 项资源，ESI 5 级。口服药物和健康指导不算资源。',
    },
    variants: {
      vitals: { hr: [68, 86], rr: [12, 16], sbp: [110, 128], spo2: [98, 100], tempC: [36.9, 37.6] },
      openings: [
        { en: 'Sneezing through rehearsals, with a scratchy throat and a mild cough for 2 days.', zh: '彩排时一直打喷嚏，咽痒、轻微咳嗽 2 天。' },
        { en: 'A stuffy nose under the mask, a scratchy throat and a mild cough for 2 days.', zh: '面具下鼻塞，咽痒、轻微咳嗽 2 天。' },
      ],
    },
  },
  {
    id: 'gargoyle-sting',
    name: 'Grimwald the Gargoyle, 412',
    emoji: '🐝',
    story: 'A wasp nest on the cathedral ledge. One sting on the hand, local swelling and itch. No lip swelling, wheeze, hives or dizziness.',
    patient: { ageYears: 412, avpu: 'A', newConfusion: false, hr: 74, rr: 14, sbp: 124, spo2: 99, tempC: 36.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A local sting reaction needs only exam, ice and oral antihistamine: ESI 5. Re-triage at once if airway, breathing or skin-wide symptoms appear, because that is anaphylaxis.',
    zh: {
      name: '石像鬼格林瓦尔德，412 岁',
      story: '大教堂檐口上有个马蜂窝。手上被蜇了一下，局部肿胀、瘙痒。无嘴唇肿胀、喘息、荨麻疹或头晕。',
      teachingPoint: '局部蜇伤反应只需检查、冰敷和口服抗组胺药：ESI 5 级。一旦出现气道、呼吸或全身皮肤症状，应立即重新分诊，因为那是严重过敏反应。',
    },
    variants: {
      vitals: { hr: [66, 82], rr: [12, 16], sbp: [114, 132], spo2: [98, 100], tempC: [36.3, 36.9] },
      openings: [
        { en: 'Swatted a wasp away from his gutter spout.', zh: '把一只马蜂从他的排水嘴边赶走。' },
        { en: 'Wasps moved in under his wing over the summer.', zh: '夏天时马蜂在他的翅膀下筑了巢。' },
      ],
    },
  },
  {
    id: 'echo-sore-throat',
    name: 'Echo the Ghost, 26',
    emoji: '🎶',
    story: 'Sore throat, runny nose and a cough for 2 days after haunting a draughty opera house. Swallowing fine, no fever, voice normal.',
    patient: { ageYears: 26, avpu: 'A', newConfusion: false, hr: 76, rr: 14, sbp: 116, spo2: 99, tempC: 37.1, pain: 3, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A sore throat with cough, runny nose and no fever is most likely viral and needs no tests (the strep score is low): 0 resources, ESI 5. Advice and oral pain relief are not resources.',
    zh: {
      name: '幽灵艾可，26 岁',
      story: '在四处漏风的歌剧院作祟后，咽痛、流涕、咳嗽 2 天。吞咽正常，无发热，声音正常。',
      teachingPoint: '咽痛伴咳嗽、流涕且无发热，最可能是病毒感染，无需检查（链球菌感染评分低）：0 项资源，ESI 5 级。健康指导和口服止痛药不算资源。',
    },
    variants: {
      vitals: { hr: [68, 86], rr: [12, 16], sbp: [108, 124], spo2: [98, 100], tempC: [36.8, 37.4], pain: [2, 4] },
      openings: [
        { en: 'Sore throat, runny nose and a cough for 2 days after wailing in the rain.', zh: '在雨中哀嚎一夜后，咽痛、流涕、咳嗽 2 天。' },
        { en: 'Sore throat, runny nose and a cough for 2 days, caught from the choir of the dead.', zh: '咽痛、流涕、咳嗽 2 天，是从亡灵合唱团那里传染的。' },
      ],
    },
  },
  {
    id: 'bog-witch-ivy-rash',
    name: 'Ivy the Bog Witch, 48',
    emoji: '🪴',
    story: 'An itchy red rash with small blisters in streaks on both forearms, two days after pulling cursed ivy off her cottage. Feels well, no swelling of the face or lips.',
    patient: { ageYears: 48, avpu: 'A', newConfusion: false, hr: 74, rr: 14, sbp: 126, spo2: 99, tempC: 36.7, pain: 1, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Contact dermatitis needs only an exam and advice (cool compresses, a steroid cream, an oral antihistamine): 0 resources, ESI 5. Prescriptions and creams are not resources.',
    zh: {
      name: '沼泽女巫艾薇，48 岁',
      story: '从小屋上扯下受诅咒的常春藤两天后，双前臂出现条状分布、伴小水疱的红色瘙痒皮疹。感觉良好，面部和嘴唇无肿胀。',
      teachingPoint: '接触性皮炎只需检查和健康指导（冷敷、外用激素药膏、口服抗组胺药）：0 项资源，ESI 5 级。开处方和药膏都不算资源。',
    },
    variants: {
      vitals: { hr: [66, 84], rr: [12, 16], sbp: [116, 134], spo2: [98, 100], tempC: [36.4, 37.0], pain: [0, 2] },
    },
  },
  {
    id: 'ghoulberg-eye-drops',
    name: 'Dr. Ghoulberg, 63',
    emoji: '👓',
    story: 'Ran out of his glaucoma eye drops and his family doctor is closed for the night. No eye pain, vision as usual.',
    patient: { ageYears: 63, avpu: 'A', newConfusion: false, hr: 72, rr: 14, sbp: 132, spo2: 98, tempC: 36.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A repeat prescription uses no ED resources: ESI 5. A painful red eye with blurred vision and haloes would be acute glaucoma, an emergency.',
    zh: {
      name: '古尔伯格医生，63 岁',
      story: '青光眼滴眼液用完了，家庭医生晚上不开门。无眼痛，视力如常。',
      teachingPoint: '续开处方不占用急诊资源：ESI 5 级。若出现眼红、眼痛伴视物模糊和虹视，则可能是急性青光眼，属于急症。',
    },
    variants: {
      vitals: { hr: [64, 82], rr: [12, 16], sbp: [122, 142], spo2: [97, 100], tempC: [36.3, 36.9] },
      openings: [
        { en: 'Dropped his last bottle of glaucoma eye drops into an open grave.', zh: '把最后一瓶青光眼滴眼液掉进了一座敞开的坟墓里。' },
        { en: 'Left his glaucoma eye drops in the crypt he was visiting.', zh: '把青光眼滴眼液落在了他去探访的墓穴里。' },
      ],
    },
  },
  {
    id: 'patchwork-suture-removal',
    name: 'Patchwork Polly, 29',
    emoji: '🪡',
    story: 'Here to have the stitches in her knee taken out, 10 days after repair. Wound clean and dry, no redness.',
    patient: { ageYears: 29, avpu: 'A', newConfusion: false, hr: 76, rr: 14, sbp: 116, spo2: 99, tempC: 36.7, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Removing stitches from a healed wound is not an ED resource: ESI 5.',
    zh: {
      name: '拼布波莉，29 岁',
      story: '来拆膝盖上的缝线，距缝合已 10 天。伤口清洁干燥，无发红。',
      teachingPoint: '为愈合良好的伤口拆线不算急诊资源：ESI 5 级。',
    },
    variants: {
      vitals: { hr: [68, 86], rr: [12, 16], sbp: [108, 124], spo2: [98, 100], tempC: [36.4, 37.0] },
      openings: [
        { en: 'Her knee stitches itch, and it is 10 days since the repair.', zh: '膝盖上的缝线发痒，距缝合已经 10 天了。' },
        { en: 'Sent by her seamstress to have the knee stitches out, 10 days after repair.', zh: '缝纫师让她来拆膝盖上的缝线，距缝合已 10 天。' },
      ],
    },
  },
  {
    id: 'woodwose-tick-bite',
    name: 'Hunter the Woodwose, 37',
    emoji: '🌲',
    story: 'Pulled a tick off his calf this evening after a night hike. No rash, no fever, feels well.',
    patient: { ageYears: 37, avpu: 'A', newConfusion: false, hr: 70, rr: 14, sbp: 124, spo2: 99, tempC: 36.7, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A tick already removed with no rash or fever needs only advice: watch for an expanding red ring (erythema migrans) or fever over the next month. 0 resources, ESI 5.',
    zh: {
      name: '林中野人亨特，37 岁',
      story: '夜间徒步后，今晚从小腿上拔下了一只蜱虫。无皮疹，无发热，感觉良好。',
      teachingPoint: '蜱虫已取下且无皮疹和发热时，只需健康指导：在接下来一个月内留意是否出现逐渐扩大的红斑（游走性红斑）或发热。0 项资源，ESI 5 级。',
    },
    variants: {
      vitals: { hr: [62, 80], rr: [12, 16], sbp: [114, 132], spo2: [98, 100], tempC: [36.4, 37.0] },
    },
  },
  {
    id: 'invisible-sunburn',
    name: 'The Invisible Man, 45',
    emoji: '🫥',
    story: 'Forgot his bandages and sunscreen on a beach day: red, sore skin on his back, no blisters. Drinking well, no fever or headache.',
    patient: { ageYears: 45, avpu: 'A', newConfusion: false, hr: 78, rr: 14, sbp: 124, spo2: 99, tempC: 37.0, pain: 3, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Superficial sunburn with no blisters, fever or dehydration needs only cooling, moisturiser and oral pain relief: 0 resources, ESI 5.',
    zh: {
      name: '隐形人，45 岁',
      story: '去海边时忘了缠绷带、涂防晒霜：背部皮肤发红疼痛，无水疱。饮水正常，无发热或头痛。',
      teachingPoint: '无水疱、无发热或脱水的浅表晒伤只需降温、保湿和口服止痛：0 项资源，ESI 5 级。',
    },
    variants: {
      vitals: { hr: [70, 88], rr: [12, 16], sbp: [114, 132], spo2: [98, 100], tempC: [36.8, 37.4], pain: [2, 4] },
      openings: [
        { en: 'Fell asleep unwrapped in the midday sun: red, sore skin on his back, no blisters.', zh: '没缠绷带就在正午的阳光下睡着了：背部皮肤发红疼痛，无水疱。' },
        { en: 'Went sunbathing to see whether he would show up: red, sore skin on his back, no blisters.', zh: '去晒日光浴，想看看自己会不会显形：背部皮肤发红疼痛，无水疱。' },
      ],
    },
  },
  {
    id: 'tooth-fairy-cold',
    name: 'Tilly the Tooth Fairy, 4',
    emoji: '🦷',
    story: 'Runny nose and a cough for 3 days. Eating, drinking and playing normally, no fever tonight.',
    patient: { ageYears: 4, avpu: 'A', newConfusion: false, hr: 100, rr: 22, sbp: 98, spo2: 99, tempC: 37.2, pain: 1, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A well child with cold symptoms, normal vital signs for her age and normal eating and play needs only an exam and advice: ESI 5. Teach the red flags: fast or hard breathing, poor drinking, drowsiness.',
    zh: {
      name: '牙仙蒂莉，4 岁',
      story: '流涕、咳嗽 3 天。饮食和玩耍正常，今晚没有发热。',
      teachingPoint: '有感冒症状的孩子若精神好、生命体征符合年龄正常范围、饮食和玩耍正常，只需检查和健康指导：ESI 5 级。教会家长识别危险信号：呼吸急促或费力、饮水差、嗜睡。',
    },
    variants: {
      vitals: { hr: [88, 112], rr: [20, 26], sbp: [92, 104], spo2: [98, 100], tempC: [36.8, 37.6], pain: [0, 1] },
      openings: [
        { en: 'Sneezing glitter and coughing for 3 days.', zh: '打喷嚏喷出亮粉、咳嗽 3 天。' },
        { en: 'Too sniffly to collect teeth, with a runny nose and a cough for 3 days.', zh: '鼻塞得没法去收牙齿，流涕、咳嗽 3 天。' },
      ],
    },
  },
  {
    id: 'mini-mummy-nappy-rash',
    name: 'Mini Mummy, 6 months',
    emoji: '🧻',
    story: 'Red, sore skin in the nappy area for 3 days, sparing the skin folds. Feeding well, plenty of wet nappies, no fever.',
    patient: { ageYears: 0.5, avpu: 'A', newConfusion: false, hr: 128, rr: 32, sbp: 86, spo2: 99, tempC: 37.0, pain: 1, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Nappy rash in a well, feeding infant needs only an exam and advice (barrier cream, frequent changes, nappy-free time): 0 resources, ESI 5. A rash with fever, or a baby who is not feeding, needs a different assessment.',
    zh: {
      name: '迷你木乃伊，6 月龄',
      story: '尿布区域皮肤发红、疼痛 3 天，皮肤褶皱处未受累。吃奶好，尿布经常湿，无发热。',
      teachingPoint: '精神好、吃奶好的婴儿出现尿布疹，只需检查和健康指导（护臀霜、勤换尿布、多让皮肤透气）：0 项资源，ESI 5 级。若皮疹伴发热，或婴儿拒奶，则需要另行评估。',
    },
    variants: {
      vitals: { hr: [116, 142], rr: [26, 36], sbp: [80, 92], spo2: [98, 100], tempC: [36.6, 37.4], pain: [0, 2] },
    },
  },
  {
    id: 'wisp-conjunctivitis',
    name: 'Glim the Will-o’-the-Wisp, 5',
    emoji: '✨',
    story: 'Sticky, pink eyes with crusty lashes this morning. Seeing fine, no eye pain, no fever, playing happily.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 98, rr: 20, sbp: 100, spo2: 99, tempC: 36.9, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Sticky conjunctivitis in a child who sees normally and has no eye pain needs only an exam and advice on cleaning: 0 resources, ESI 5. Eye pain, light sensitivity, reduced vision or swelling around the eye need urgent review.',
    zh: {
      name: '鬼火格林，5 岁',
      story: '今天早上双眼发红、有黏性分泌物，睫毛结痂。视物正常，无眼痛，无发热，玩得很开心。',
      teachingPoint: '视力正常、无眼痛的儿童出现有黏性分泌物的结膜炎，只需检查和眼部清洁指导：0 项资源，ESI 5 级。若出现眼痛、畏光、视力下降或眼周肿胀，需要紧急评估。',
    },
    variants: {
      vitals: { hr: [86, 108], rr: [18, 24], sbp: [94, 106], spo2: [98, 100], tempC: [36.6, 37.2] },
      openings: [
        { en: 'Woke with sticky, pink eyes and lashes glued together.', zh: '醒来时双眼发红、有黏性分泌物，睫毛粘在了一起。' },
        { en: 'Her glow is dim behind sticky, pink eyes this morning.', zh: '今天早上双眼发红、有黏性分泌物，连光芒都暗淡了。' },
      ],
    },
  },

  // ---------------- Storylines (task 21, src/storylines.js) ----------------
  // Pairs of patients from the same incident. Each case is flagged storyline: '<id>' and only ever
  // arrives with its partner, in the order listed in STORYLINES, so a later story may refer to the
  // earlier patient. No alternative openings: the opening sentence carries the link.
  // The humour lives in the characters and the narration, never in the illness; the clinical
  // facts and teaching points are as serious as in any other case.

  // Moonlight Brawl
  {
    id: 'werewolf-brawl-bite',
    storyline: 'moonlight-brawl',
    name: 'Wilfred the Werewolf, 34',
    emoji: '🐺',
    story: 'Terribly sorry to be a bother. A bit of a scuffle in the car park under the full moon, entirely his own fault, he says. Deep bite wounds across his left forearm, oozing but not spurting; his fingers move and feel normal. Keeps offering to mop his own blood off your floor.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 132, spo2: 98, tempC: 36.8, pain: 5, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Triage the wound, not the fight. Alert, normal vital signs, and fingers that move and feel normally: this bite needs washing out and a repair, 1 resource, so ESI 4. Bites carry a high infection risk: irrigate well, check tendons and nerves, and give tetanus cover and antibiotics.',
    zh: {
      name: '狼人威尔弗雷德，34 岁',
      story: '实在不好意思，给您添麻烦了。满月下在停车场跟人起了点小冲突，他说全怪自己。左前臂有几处很深的咬伤，在渗血但没有喷血；手指活动和感觉都正常。他一个劲儿地要自己把地板上的血擦干净。',
      teachingPoint: '要分诊的是伤口，不是那场架。意识清醒、生命体征正常、手指活动和感觉正常：这处咬伤需要彻底冲洗并缝合，1 项资源，因此为 ESI 4 级。咬伤感染风险高：要充分冲洗，检查肌腱和神经，预防破伤风并使用抗生素。',
    },
    variants: {
      vitals: { hr: [76, 98], rr: [14, 18], sbp: [122, 142], spo2: [97, 100], tempC: [36.5, 37.2], pain: [4, 6] },
    },
  },
  {
    id: 'vampire-stake-wound',
    storyline: 'moonlight-brawl',
    name: 'Sir Mortimer Fang, 318',
    emoji: '🪵',
    story: 'The other party from the car-park scuffle, with a wooden stake still in the left side of his chest. Pale, sweating and breathing fast. Insists, very politely, on waiting his turn: “The werewolf was here first, and one does not jump the queue.”',
    patient: { ageYears: 318, avpu: 'A', newConfusion: false, hr: 134, rr: 30, sbp: 78, spo2: 90, tempC: 36.0, pain: 4, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'A penetrating chest wound with a fast heart rate and low blood pressure is shock: think tension pneumothorax, cardiac tamponade or major bleeding. It needs the resuscitation room and the trauma team now, so ESI 1. Leave the impaled stake in place, and never let a calm, polite patient talk you into a lower level.',
    zh: {
      name: '莫蒂默·獠牙爵士，318 岁',
      story: '停车场那场冲突的另一方，左胸还插着一根木桩。面色苍白、满头冷汗、呼吸急促。却非常客气地坚持排队：“狼人先来的，插队可不是绅士所为。”',
      teachingPoint: '胸部穿透伤伴心率快、血压低，就是休克：要想到张力性气胸、心脏压塞或大出血。需要立即进入抢救室并启动创伤团队，因此为 ESI 1 级。插在胸口的木桩要留在原位，不要拔出；患者再冷静、再客气，也不能因此降低分诊级别。',
    },
    variants: {
      vitals: { hr: [124, 146], rr: [26, 34], sbp: [70, 86], spo2: [86, 93], tempC: [35.6, 36.4], pain: [3, 5] },
    },
  },

  // The Count's Toothache (Stoker's Dracula and Renfield)
  {
    id: 'renfield-blister',
    storyline: 'counts-toothache',
    name: 'Mr Renfield, 48',
    emoji: '🦶',
    story: 'The Count’s long-suffering assistant. A raw blister on his right heel from running the master’s errands across London all night, since the master does not do daylight. Mentions, on his way out, that the master “has a touch of toothache and does not do waiting rooms”.',
    patient: { ageYears: 48, avpu: 'A', newConfusion: false, hr: 78, rr: 14, sbp: 128, spo2: 98, tempC: 36.7, pain: 2, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'Triage the patient in front of you: a blister on a well patient needs a dressing and advice, 0 resources, ESI 5. Before he goes, give him a message for his employer: toothache with swelling of the face or neck, fever, trouble swallowing or a muffled voice needs the emergency department straight away.',
    zh: {
      name: '伦菲尔德先生，48 岁',
      story: '伯爵那位任劳任怨的助手。主人白天从不出门，他只好整夜在伦敦城里替主人跑腿，右脚后跟磨出了一个破皮的水疱。临走时顺口提了一句：主人“有点牙疼，而且主人是不坐候诊室的”。',
      teachingPoint: '分诊眼前的这位患者：生命体征正常的患者脚上磨了个水疱，只需包扎和健康指导，0 项资源，ESI 5 级。他走之前，请他给主人带句话：牙疼伴面部或颈部肿胀、发热、吞咽困难或说话含糊，必须立即来急诊。',
    },
    variants: {
      vitals: { hr: [68, 90], rr: [12, 18], sbp: [118, 138], spo2: [97, 100], tempC: [36.4, 37.1], pain: [1, 3] },
    },
  },
  {
    id: 'dracula-ludwigs',
    storyline: 'counts-toothache',
    name: 'Count Dracula, age not disclosed',
    emoji: '🦇',
    story: 'Renfield’s employer, who does not do waiting rooms, has come in after all. Sits bolt upright, leaning forward, drooling into a silk handkerchief. The floor of his mouth is swollen and board-hard beneath a rotten lower molar, and he speaks in a muffled “hot potato” voice. Feverish, refuses to lie down, and makes a high-pitched noise with every breath in. He calls it “a slight indisposition”.',
    patient: { ageYears: 480, avpu: 'A', newConfusion: false, hr: 124, rr: 28, sbp: 112, spo2: 93, tempC: 39.1, pain: 7, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Ludwig’s angina: a dental infection spreading into the floor of the mouth, which can close the airway within hours. Drooling, a muffled voice, refusing to lie flat and stridor mean the airway is already narrowing: ESI 1. Keep him sitting up, call the most experienced airway team, prepare for a difficult airway including front-of-neck access, and start IV antibiotics.',
    zh: {
      name: '德古拉伯爵，年龄保密',
      story: '那位“不坐候诊室”的主人，终究还是来了。他笔直地坐着、身体前倾，口水不停地流进一块丝绸手帕里。一颗坏掉的下磨牙下方，口底肿得硬如木板；说话含糊不清，像嘴里含着烫土豆。发热，不肯躺下，每次吸气都发出尖细的声音。他本人称之为“略感不适”。',
      teachingPoint: '路德维希咽峡炎：牙源性感染扩散到口底，数小时内就可能堵塞气道。流口水、说话含糊、不肯平躺、出现喘鸣，说明气道已经在变窄：ESI 1 级。让他保持坐位，呼叫最有经验的气道团队，按困难气道做好准备（包括颈前紧急气道），并开始静脉抗生素治疗。',
    },
    variants: {
      vitals: { hr: [116, 134], rr: [24, 32], sbp: [102, 124], spo2: [90, 95], tempC: [38.6, 39.6], pain: [6, 8] },
    },
  },

  // The Cauldron Hut (carbon monoxide)
  {
    id: 'witch-cauldron-co',
    storyline: 'cauldron-hut',
    name: 'Hepzibah Mossbottom, 64',
    emoji: '🧹',
    story: 'Has been brewing all evening in her hut with the door and shutters closed, as one does in this weather. A thumping headache, queasy, and the room “goes a bit swimmy” when she stands. Apologises for the smell of the cauldron. The pulse oximeter reads perfectly normal.',
    patient: { ageYears: 64, avpu: 'A', newConfusion: false, hr: 96, rr: 18, sbp: 134, spo2: 99, tempC: 36.8, pain: 5, highRisk: true, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Headache, nausea and dizziness after hours beside a fire in a closed room is carbon monoxide poisoning until proven otherwise: high risk, ESI 2. A pulse oximeter cannot tell carboxyhaemoglobin from oxygenated haemoglobin, so its normal reading is false comfort. Give high-flow oxygen now and measure carboxyhaemoglobin on a blood gas.',
    zh: {
      name: '赫普兹巴·苔底，64 岁',
      story: '这种天气嘛，她整晚都在小屋里熬药，门和百叶窗关得严严实实。头痛得一跳一跳的，恶心，一站起来就觉得“屋子有点晃”。还为坩埚的气味连声道歉。脉搏血氧仪的读数完全正常。',
      teachingPoint: '在门窗紧闭的屋里守着火待了几个小时，出现头痛、恶心、头晕，在排除之前都要按一氧化碳中毒处理：属于高危情况，ESI 2 级。脉搏血氧仪分不清碳氧血红蛋白和氧合血红蛋白，所以读数正常只是假象。立即给予高流量吸氧，并通过血气分析测定碳氧血红蛋白。',
    },
    variants: {
      vitals: { hr: [86, 100], rr: [16, 20], sbp: [122, 146], spo2: [97, 100], tempC: [36.5, 37.2], pain: [4, 6] },
    },
  },
  {
    id: 'apprentice-co-coma',
    storyline: 'cauldron-hut',
    name: 'Tobias the Apprentice, 17',
    emoji: '🕯️',
    story: 'From the same hut: the apprentice who stayed behind to mind the cauldron. Carried in by a neighbour, who apologises for not ringing ahead. Does not respond to voice or pain. Breathing shallowly, and the pulse oximeter still reads normal.',
    patient: { ageYears: 17, avpu: 'U', newConfusion: true, hr: 118, rr: 10, sbp: 104, spo2: 98, tempC: 36.6, pain: 0, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'Unresponsive is always ESI 1, whatever the pulse oximeter says. Secure the airway, give 100% oxygen, check carboxyhaemoglobin, blood glucose and an ECG, and discuss hyperbaric oxygen with a specialist for severe carbon monoxide poisoning. Then ask who else was in the hut.',
    zh: {
      name: '学徒托比亚斯，17 岁',
      story: '来自同一间小屋：留下来看着坩埚的那个学徒。由邻居抱进来，邻居还为没有提前打电话而道歉。对呼唤和疼痛刺激均无反应。呼吸浅，脉搏血氧仪的读数却依然正常。',
      teachingPoint: '无论脉搏血氧仪显示什么，无反应一律为 ESI 1 级。立即保护气道、给予纯氧，检查碳氧血红蛋白、血糖和心电图；严重一氧化碳中毒应与专科医生讨论是否行高压氧治疗。然后问清楚小屋里还有谁。',
    },
    variants: {
      vitals: { hr: [108, 128], rr: [9, 14], sbp: [96, 114], spo2: [96, 100], tempC: [36.2, 37.0] },
    },
  },

  // The Strange Case at Mrs Poole's (after Stevenson's Dr Jekyll, Mr Hyde and Poole)
  {
    id: 'poole-scald',
    storyline: 'mrs-pooles',
    name: 'Mrs Poole, 56',
    emoji: '🫖',
    story: 'Housekeeper to a certain doctor, and terribly sorry to bother anyone. A flask in the laboratory boiled over onto the back of her right hand: red, weeping blisters across the knuckles and fingers. “It barely tingles,” she says, holding it very still. Asks if she might have a cup of tea while she waits.',
    patient: { ageYears: 56, avpu: 'A', newConfusion: false, hr: 84, rr: 16, sbp: 136, spo2: 98, tempC: 36.8, pain: 5, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'A small partial-thickness scald (blisters) is usually simple wound care, but burns across the hand and fingers can scar and stiffen the joints, so they need the burns team’s opinion: 1 resource (specialty consult), ESI 4. Cool it under running water for 20 minutes, even now, and give pain relief.',
    zh: {
      name: '普尔太太，56 岁',
      story: '某位医生家的管家，一个劲儿地说给大家添麻烦了。实验室里一只烧瓶沸腾溢出，洒在她右手背上：指节和手指上满是发红、渗液的水疱。“就有一点点刺痛。”她说着，那只手却一动也不敢动。还问能不能边等边喝杯茶。',
      teachingPoint: '小面积浅二度烫伤（起水疱）通常只需简单伤口处理，但累及手部和手指的烧伤可能留下瘢痕、导致关节僵硬，需要烧伤科会诊：1 项资源（专科会诊），ESI 4 级。即使现在，也要用流动的凉水冲洗 20 分钟，并给予止痛。',
    },
    variants: {
      vitals: { hr: [74, 96], rr: [14, 18], sbp: [124, 146], spo2: [97, 100], tempC: [36.5, 37.1], pain: [3, 6] },
    },
  },
  {
    id: 'hyde-tincture',
    storyline: 'mrs-pooles',
    name: 'Mr Edward Hyde, age uncertain',
    emoji: '🧪',
    story: 'From the same household: brought in by Mrs Poole, who apologises on his behalf. Drank “the doctor’s tincture” an hour ago. Pacing, shouting and pulling at the drip stand, hot to the touch and drenched in sweat, with huge pupils and a racing heart. Does not know where he is.',
    patient: { ageYears: 30, avpu: 'A', newConfusion: true, hr: 138, rr: 24, sbp: 172, spo2: 96, tempC: 39.3, pain: 2, highRisk: true, needsLifesaving: false, resources: 4 },
    expectedLevel: 2,
    teachingPoint: 'Agitation, hyperthermia, sweating, dilated pupils, a fast heart rate and high blood pressure are the sympathomimetic toxidrome: high risk with new confusion, ESI 2. Sweating tells it apart from the anticholinergic toxidrome, where the skin is dry. Give benzodiazepines, cool actively, avoid prolonged physical restraint, and check glucose and an ECG. A temperature of 40 °C or more, seizures or a falling blood pressure need immediate resuscitation: ESI 1.',
    zh: {
      name: '爱德华·海德先生，年龄不详',
      story: '来自同一户人家：由普尔太太送来，她不停地替他道歉。一小时前喝了“医生的药酒”。来回踱步、大喊大叫、拽着输液架不放，摸上去滚烫、浑身大汗，瞳孔散大，心跳飞快。分不清自己身在何处。',
      teachingPoint: '躁动、高热、大汗、瞳孔散大、心率快、血压高，是拟交感神经中毒综合征：高危且新发意识混乱，ESI 2 级。有汗是它与抗胆碱能中毒综合征（皮肤干燥）的区别。给予苯二氮䓬类药物，积极降温，避免长时间身体约束，并检查血糖和心电图。体温达到 40 °C 或以上、出现抽搐或血压下降，需要立即复苏：ESI 1 级。',
    },
    variants: {
      vitals: { hr: [126, 148], rr: [20, 28], sbp: [156, 186], spo2: [94, 98], tempC: [38.8, 39.8], pain: [0, 3] },
    },
  },

  // Trick-or-Treat Twins (pediatric)
  {
    id: 'ghost-twin-sweets',
    storyline: 'trick-or-treat-twins',
    name: 'Peggy the Little Ghost, 5',
    emoji: '🍭',
    story: 'One of the trick-or-treat twins, still in her sheet. Tummy ache after eating most of a treat bag in one sitting. Bouncing round the waiting room, no vomiting, no fever, and the ache is already easing. She would like it noted that her brother ate more.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 102, rr: 22, sbp: 100, spo2: 99, tempC: 36.9, pain: 2, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A well, playful child with a soft tummy after too many sweets needs only an exam and advice: 0 resources, ESI 5. Red flags that change this: green or persistent vomiting, pain that moves to the lower right, a fever, or a child who will not walk or jump.',
    zh: {
      name: '小幽灵佩吉，5 岁',
      story: '讨糖双胞胎中的姐姐，身上还披着床单。一口气吃掉了大半袋糖，肚子疼。在候诊室里蹦来蹦去，没有呕吐、没有发热，肚子疼也已经在缓解。她郑重声明：弟弟吃得比她还多。',
      teachingPoint: '精神好、爱玩、腹部柔软的孩子，吃糖太多肚子疼，只需检查和健康指导：0 项资源，ESI 5 级。出现以下危险信号就要重新评估：呕吐物呈绿色或持续呕吐、疼痛转移到右下腹、发热，或孩子不肯走路、不肯跳。',
    },
    variants: {
      vitals: { hr: [88, 116], rr: [18, 24], sbp: [94, 106], spo2: [98, 100], tempC: [36.6, 37.3], pain: [1, 3] },
    },
  },
  {
    id: 'ghost-twin-battery',
    storyline: 'trick-or-treat-twins',
    name: 'Percy the Little Ghost, 5',
    emoji: '🔋',
    story: 'Peggy’s twin brother, from the same treat bag. Smiling, running laps of the waiting room and eating crisps. Mentions he swallowed “a shiny coin from the treat bag” about an hour ago. The bag is full of flashing novelty toys, and one is missing its battery.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 104, rr: 22, sbp: 100, spo2: 99, tempC: 36.8, pain: 0, highRisk: true, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'A swallowed button battery is high risk even in a smiling child: stuck in the oesophagus it can burn through the wall within 2 hours. ESI 2. Get an x-ray from neck to abdomen at once (a double ring or halo edge tells it from a coin), and arrange urgent removal if it is in the oesophagus. If it was swallowed within 12 hours and the child is over 1 year, poison-centre guidance is to give honey while removal is arranged.',
    zh: {
      name: '小幽灵珀西，5 岁',
      story: '佩吉的双胞胎弟弟，吃的是同一袋糖。笑嘻嘻的，绕着候诊室一圈圈地跑，还在吃薯片。他说大约一小时前吞了“糖袋里一枚亮晶晶的硬币”。袋子里装满了会闪光的小玩具，其中一个的电池不见了。',
      teachingPoint: '误吞纽扣电池，哪怕孩子笑眯眯的也属于高危：卡在食管里，2 小时内就可能烧穿食管壁。ESI 2 级。立即拍从颈部到腹部的 X 线片（双环征或“光晕”边缘可与硬币区分），若位于食管内，需紧急取出。若在 12 小时内吞下且孩子已满 1 岁，中毒控制中心建议在安排取出期间喂蜂蜜。',
    },
    variants: {
      vitals: { hr: [90, 118], rr: [18, 26], sbp: [94, 106], spo2: [98, 100], tempC: [36.5, 37.2], pain: [0, 1] },
    },
  },
];
