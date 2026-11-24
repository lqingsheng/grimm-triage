// Monster patients for the Night Shift game. Each case maps a spooky story to real vital signs,
// so the player learns real triage logic behind the costume.
//
// Case shape: { id, name, emoji, story, patient, expectedLevel, teachingPoint, zh }
//   patient       - engine input (see src/triage.js)
//   expectedLevel - the ESI level the case author intends; test/triage.test.js checks triage() agrees
//   teachingPoint - one short, clinically accurate lesson shown after the case
//   zh            - Simplified Chinese { name, story, teachingPoint } for the 中文 toggle (src/i18n.js);
//                   test/i18n.test.js checks every case has it
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
    teachingPoint: 'Unresponsive (AVPU U) is always ESI 1. With RR 6 and SpO2 81% she needs airway support and bag-valve-mask ventilation now.',
    zh: {
      name: '灰衣夫人，年龄不详',
      story: '被发现飘在楼梯间里。对呼唤和疼痛刺激均无反应。呼吸微弱而缓慢。',
      teachingPoint: '无反应（AVPU U）一律为 ESI 1 级。呼吸频率 6 次/分、血氧饱和度 81%，她需要立即开放气道并行球囊面罩通气。',
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
  },

  // ---------------- ESI 2: Emergent ----------------
  {
    id: 'vampire-bleed',
    name: 'Count Vlad, 547',
    emoji: '🧛',
    story: 'Fang slipped during dinner. Bleeding from the mouth will not stop. Pale (paler than usual).',
    patient: { ageYears: 547, avpu: 'A', newConfusion: false, hr: 128, rr: 24, sbp: 82, spo2: 95, tempC: 35.9, pain: 5, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Uncontrolled bleeding with HR 128 and SBP 82 (shock index about 1.6) is hemorrhagic shock: it needs immediate hemorrhage control and fluid or blood resuscitation, so it is ESI 1, not ESI 2.',
    zh: {
      name: '弗拉德伯爵，547 岁',
      story: '吃晚餐时獠牙滑了一下。口腔出血止不住。面色苍白（比平时更白）。',
      teachingPoint: '无法控制的出血伴心率 128 次/分、收缩压 82 mmHg（休克指数约 1.6）属于失血性休克：需要立即止血并进行液体或输血复苏，因此为 ESI 1 级，而不是 ESI 2 级。',
    },
  },
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
  },
  {
    id: 'pumpkin-fever',
    name: 'Jack O. Lantern, 34',
    emoji: '🎃',
    story: 'Burning up from the inside, cough for 3 days. Breathing fast, glowing a little too bright.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 118, rr: 26, sbp: 112, spo2: 91, tempC: 39.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Fever, cough, RR 26 and SpO2 91% suggest pneumonia. Danger-zone vital signs with 2 or more resources move him up to ESI 2; screen for sepsis.',
    zh: {
      name: '杰克·南瓜灯，34 岁',
      story: '从里到外烧得滚烫，咳嗽 3 天。呼吸急促，发出的光有点太亮了。',
      teachingPoint: '发热、咳嗽、呼吸频率 26 次/分、血氧饱和度 91% 提示肺炎。生命体征处于危险区且需要 2 项及以上资源，应上调至 ESI 2 级；同时进行脓毒症筛查。',
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
  },
  {
    id: 'banshee-bronchiolitis',
    name: 'Baby Banshee, 2 months',
    emoji: '👶',
    story: 'Wail has turned into a wheeze. Runny nose for 3 days, feeding poorly, breathing fast. Needs a viral swab and IV fluids.',
    patient: { ageYears: 0.17, avpu: 'A', newConfusion: false, hr: 176, rr: 58, sbp: 80, spo2: 93, tempC: 37.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Under 3 months the danger zone is HR > 180 or RR > 50. HR 176 is acceptable at this age, but RR 58 is not: ESI 2. Young infants with bronchiolitis can tire and stop breathing (apnoea).',
    zh: {
      name: '报丧女妖宝宝，2 月龄',
      story: '哭嚎变成了喘息。流涕 3 天，吃奶差，呼吸急促。需要病毒拭子检测和静脉补液。',
      teachingPoint: '3 月龄以下的危险区为心率 > 180 次/分或呼吸频率 > 50 次/分。这个年龄心率 176 次/分尚可接受，但呼吸频率 58 次/分不行：ESI 2 级。患毛细支气管炎的小婴儿可能因疲劳而出现呼吸暂停。',
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
  },
  {
    id: 'imp-appendicitis',
    name: 'Little Imp, 6',
    emoji: '😈',
    story: 'Ate a whole bag of brimstone candy. Belly pain started at the navel and moved to the right side. Vomiting, will not jump.',
    patient: { ageYears: 6, avpu: 'A', newConfusion: false, hr: 146, rr: 28, sbp: 98, spo2: 98, tempC: 38.2, pain: 6, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'For ages 3 to 8 the danger zone is HR > 140 or RR > 30. HR 146 with 2 or more resources (labs, ultrasound, IV fluids) means ESI 2. Pain moving from the navel to the right lower quadrant suggests appendicitis.',
    zh: {
      name: '小恶魔，6 岁',
      story: '吃了一整袋硫磺糖。腹痛从肚脐周围开始，后转移到右侧。呕吐，不肯跳。',
      teachingPoint: '3 至 8 岁的危险区为心率 > 140 次/分或呼吸频率 > 30 次/分。心率 146 次/分且需要 2 项及以上资源（化验、超声、静脉补液），为 ESI 2 级。疼痛由脐周转移至右下腹提示阑尾炎。',
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
  },
  {
    id: 'pixie-toddler-fever',
    name: 'Pip the Pixie, 2',
    emoji: '🧚',
    story: 'Fever and cough for 2 days, still drinking and playing between naps. Needs a chest x-ray and labs.',
    patient: { ageYears: 2, avpu: 'A', newConfusion: false, hr: 150, rr: 34, sbp: 96, spo2: 96, tempC: 38.9, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'For ages 3 months to 3 years the danger zone is HR > 160 or RR > 40. HR 150 and RR 34 would alarm you in an adult but are within range here, so ESI 3, not 2.',
    zh: {
      name: '小精灵皮普，2 岁',
      story: '发热、咳嗽 2 天，小睡间隙仍能喝水和玩耍。需要胸部 X 线和化验。',
      teachingPoint: '3 月龄至 3 岁的危险区为心率 > 160 次/分或呼吸频率 > 40 次/分。心率 150 次/分、呼吸频率 34 次/分在成人身上会令人警觉，但在这个年龄属于正常范围，因此为 ESI 3 级而非 2 级。',
    },
  },
  {
    id: 'frankie-jr-fracture',
    name: 'Frankie Jr., 5',
    emoji: '🦴',
    story: 'Fell off the castle battlements onto an outstretched hand. Wrist bent the wrong way, fingers pink and warm. Splinted, pain 5/10.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 130, rr: 26, sbp: 102, spo2: 99, tempC: 36.9, pain: 5, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 3,
    teachingPoint: 'X-ray (1) plus a reduction under procedural sedation (a complex procedure, 2) is 3 resources; the splint is not a resource. For ages 3 to 8, HR 130 and RR 26 are outside the danger zone (HR > 140, RR > 30), so ESI 3.',
    zh: {
      name: '小弗兰基，5 岁',
      story: '从城堡垛口摔下，手掌撑地。腕部向错误方向弯曲，手指红润温暖。已夹板固定，疼痛 5/10。',
      teachingPoint: 'X 线（1 项）加程序化镇静下复位（复杂操作，2 项）共 3 项资源；夹板不算资源。3 至 8 岁时心率 130 次/分、呼吸频率 26 次/分不在危险区（心率 > 140、呼吸频率 > 30），因此为 ESI 3 级。',
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
  },
];
