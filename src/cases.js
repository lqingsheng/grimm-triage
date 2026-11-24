// Monster patients for the Night Shift game. Each case maps a spooky story to real vital signs,
// so the player learns real triage logic behind the costume.
//
// Case shape: { id, name, emoji, story, patient, expectedLevel, teachingPoint }
//   patient       - engine input (see src/triage.js)
//   expectedLevel - the ESI level the case author intends; test/triage.test.js checks triage() agrees
//   teachingPoint - one short, clinically accurate lesson shown after the case
// Each case's SVG portrait lives in src/portraits.js under the same id (test/portraits.test.js checks this).
//
// Resource counting follows the ESI Implementation Handbook v4: labs (any number) = 1, each imaging
// modality = 1, IV fluids = 1, IV/IM/nebulised meds = 1, specialty consult = 1, simple procedure
// (e.g. laceration repair) = 1, complex procedure (e.g. procedural sedation) = 1.
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
  },
  {
    id: 'frankenstein-bradycardia',
    name: 'Bolt-neck Frank, 35',
    emoji: '🧟‍♂️',
    story: 'The lab assistant over-charged his neck bolts. Now dizzy and grey, and his heart is beating very slowly.',
    patient: { ageYears: 35, avpu: 'A', newConfusion: false, hr: 34, rr: 18, sbp: 78, spo2: 95, tempC: 36.5, pain: 2, highRisk: true, needsLifesaving: true, resources: 4 },
    expectedLevel: 1,
    teachingPoint: 'HR < 40 with low blood pressure is unstable bradycardia: give atropine and prepare transcutaneous pacing immediately. That is a life-saving intervention, so ESI 1.',
  },
  {
    id: 'zombie-anaphylaxis',
    name: 'Zed the Zombie, 31',
    emoji: '🥜',
    story: 'Ate a peanut-butter-glazed brain. Lips and tongue swelling, wheezing, hives everywhere, feels faint.',
    patient: { ageYears: 31, avpu: 'A', newConfusion: false, hr: 132, rr: 30, sbp: 68, spo2: 88, tempC: 36.9, pain: 4, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Anaphylaxis with airway swelling and hypotension: give IM epinephrine (adult 0.5 mg of 1 mg/mL) into the outer thigh straight away. Do not wait for IV access.',
  },
  {
    id: 'sandman-overdose',
    name: 'The Sandman, 52',
    emoji: '😴',
    story: 'Mixed poppy dust into his own sleeping sand. Only groans to a sternal rub. Pinpoint pupils, barely breathing.',
    patient: { ageYears: 52, avpu: 'P', newConfusion: true, hr: 58, rr: 6, sbp: 104, spo2: 84, tempC: 36.1, pain: 0, highRisk: true, needsLifesaving: true, resources: 3 },
    expectedLevel: 1,
    teachingPoint: 'Pinpoint pupils, RR < 8 and reduced consciousness is the opioid toxidrome. Ventilate with a bag-valve-mask and give naloxone: ESI 1.',
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
  },
  {
    id: 'mummy-dehydration',
    name: 'Neferkare, 3,200',
    emoji: '🧟',
    story: 'Unwrapped too fast at the museum gala. Dizzy, dry mouth, has not had water in three millennia.',
    patient: { ageYears: 3200, avpu: 'A', newConfusion: false, hr: 108, rr: 18, sbp: 104, spo2: 97, tempC: 37.4, pain: 3, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Decision point D: an adult needing 2 or more resources with HR > 100 should be considered for ESI 2, even when he looks well.',
  },
  {
    id: 'witch-chestpain',
    name: 'Agatha Hollow, 61',
    emoji: '🧙',
    story: 'Crushing chest pain since she lifted her cauldron. Sweaty, pain spreads to the left arm.',
    patient: { ageYears: 61, avpu: 'A', newConfusion: false, hr: 96, rr: 20, sbp: 152, spo2: 96, tempC: 36.7, pain: 8, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Chest pain that could be acute coronary syndrome is high risk (ESI 2). Get a 12-lead ECG within 10 minutes of arrival.',
  },
  {
    id: 'pumpkin-fever',
    name: 'Jack O. Lantern, 34',
    emoji: '🎃',
    story: 'Burning up from the inside, cough for 3 days. Breathing fast, glowing a little too bright.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 118, rr: 26, sbp: 112, spo2: 91, tempC: 39.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Fever, cough, RR 26 and SpO2 91% suggest pneumonia. Danger-zone vital signs with 2 or more resources move him up to ESI 2; screen for sepsis.',
  },
  {
    id: 'medusa-stroke',
    name: 'Medusa Gorgon, 72',
    emoji: '🐍',
    story: 'Her snakes noticed first: her left arm went weak and her speech slurred 40 minutes ago.',
    patient: { ageYears: 72, avpu: 'A', newConfusion: false, hr: 84, rr: 16, sbp: 178, spo2: 97, tempC: 36.8, pain: 1, highRisk: true, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'Sudden one-sided weakness or slurred speech is a stroke until proven otherwise (ESI 2). Record the last-known-well time and activate the stroke pathway.',
  },
  {
    id: 'banshee-bronchiolitis',
    name: 'Baby Banshee, 2 months',
    emoji: '👶',
    story: 'Wail has turned into a wheeze. Runny nose for 3 days, feeding poorly, breathing fast. Needs a viral swab and IV fluids.',
    patient: { ageYears: 0.17, avpu: 'A', newConfusion: false, hr: 176, rr: 58, sbp: 80, spo2: 93, tempC: 37.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'Under 3 months the danger zone is HR > 180 or RR > 50. HR 176 is acceptable at this age, but RR 58 is not: ESI 2. Young infants with bronchiolitis can tire and stop breathing (apnoea).',
  },
  {
    id: 'gremlin-gastro',
    name: 'Grizzle the Gremlin, 1',
    emoji: '🦇',
    story: 'Licked the inside of the candy cauldron. Vomiting and diarrhoea since, few wet nappies, sleepy but wakes and cries. Needs labs and IV fluids.',
    patient: { ageYears: 1, avpu: 'A', newConfusion: false, hr: 172, rr: 38, sbp: 88, spo2: 98, tempC: 37.9, pain: 3, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 2,
    teachingPoint: 'From 3 months to 3 years the HR danger zone is > 160. Tachycardia is an early sign of dehydration in children; low blood pressure is a late, ominous sign.',
  },
  {
    id: 'imp-appendicitis',
    name: 'Little Imp, 6',
    emoji: '😈',
    story: 'Ate a whole bag of brimstone candy. Belly pain started at the navel and moved to the right side. Vomiting, will not jump.',
    patient: { ageYears: 6, avpu: 'A', newConfusion: false, hr: 146, rr: 28, sbp: 98, spo2: 98, tempC: 38.2, pain: 6, highRisk: false, needsLifesaving: false, resources: 3 },
    expectedLevel: 2,
    teachingPoint: 'For ages 3 to 8 the danger zone is HR > 140 or RR > 30. HR 146 with 2 or more resources (labs, ultrasound, IV fluids) means ESI 2. Pain moving from the navel to the right lower quadrant suggests appendicitis.',
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
  },
  {
    id: 'zombie-handbite',
    name: 'Zelda the Zombie, 26',
    emoji: '🧟‍♀️',
    story: 'The night watchman’s dog bit her hand two days ago. Now red, swollen and throbbing over the knuckles.',
    patient: { ageYears: 26, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 122, spo2: 99, tempC: 37.8, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'An infected hand bite needs an x-ray (fracture, tooth fragments) and IV antibiotics: 2 resources, ESI 3 with normal vitals. Hand bites infect easily and can involve tendons and joints.',
  },
  {
    id: 'pixie-toddler-fever',
    name: 'Pip the Pixie, 2',
    emoji: '🧚',
    story: 'Fever and cough for 2 days, still drinking and playing between naps. Needs a chest x-ray and labs.',
    patient: { ageYears: 2, avpu: 'A', newConfusion: false, hr: 150, rr: 34, sbp: 96, spo2: 96, tempC: 38.9, pain: 2, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'For ages 3 months to 3 years the danger zone is HR > 160 or RR > 40. HR 150 and RR 34 would alarm you in an adult but are within range here, so ESI 3, not 2.',
  },
  {
    id: 'frankie-jr-fracture',
    name: 'Frankie Jr., 5',
    emoji: '🦴',
    story: 'Fell off the castle battlements onto an outstretched hand. Wrist bent the wrong way, fingers pink and warm. Splinted, pain 5/10.',
    patient: { ageYears: 5, avpu: 'A', newConfusion: false, hr: 130, rr: 26, sbp: 102, spo2: 99, tempC: 36.9, pain: 5, highRisk: false, needsLifesaving: false, resources: 2 },
    expectedLevel: 3,
    teachingPoint: 'X-ray plus a reduction under procedural sedation is 2 resources; the splint is not a resource. For ages 3 to 8, HR 130 and RR 26 are outside the danger zone (HR > 140, RR > 30), so ESI 3.',
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
  },
  {
    id: 'banshee-uti',
    name: 'Siobhan the Banshee, 24',
    emoji: '😱',
    story: 'Burning when she pees and going every ten minutes, which interrupts her wailing. No fever, no back pain.',
    patient: { ageYears: 24, avpu: 'A', newConfusion: false, hr: 82, rr: 14, sbp: 118, spo2: 99, tempC: 37.1, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Labs count as one resource however many tests you send: urinalysis plus culture (and a pregnancy test) is still 1 resource, so ESI 4.',
  },
  {
    id: 'scarecrow-laceration',
    name: 'Scarecrow Silas, 45',
    emoji: '🌾',
    story: 'A crow pecked his forearm: a clean 3 cm cut, bleeding controlled with pressure. Last tetanus shot: unknown.',
    patient: { ageYears: 45, avpu: 'A', newConfusion: false, hr: 78, rr: 14, sbp: 132, spo2: 99, tempC: 36.7, pain: 3, highRisk: false, needsLifesaving: false, resources: 1 },
    expectedLevel: 4,
    teachingPoint: 'Suturing a simple laceration is 1 resource (a simple procedure). The tetanus booster is not counted as a resource, so ESI 4.',
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
  },
  {
    id: 'phantom-cold',
    name: 'The Phantom, 33',
    emoji: '🎭',
    story: 'Runny nose, scratchy throat and a mild cough for 2 days. Worried it will ruin his opera solo. Eating and drinking fine.',
    patient: { ageYears: 33, avpu: 'A', newConfusion: false, hr: 76, rr: 14, sbp: 120, spo2: 99, tempC: 37.3, pain: 2, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A common cold with normal vital signs needs only a history and exam: 0 resources, ESI 5. Oral medicines and advice are not resources.',
  },
  {
    id: 'gargoyle-sting',
    name: 'Grimwald the Gargoyle, 412',
    emoji: '🐝',
    story: 'A wasp nest on the cathedral ledge. One sting on the hand, local swelling and itch. No lip swelling, wheeze, hives or dizziness.',
    patient: { ageYears: 412, avpu: 'A', newConfusion: false, hr: 74, rr: 14, sbp: 124, spo2: 99, tempC: 36.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 0 },
    expectedLevel: 5,
    teachingPoint: 'A local sting reaction needs only exam, ice and oral antihistamine: ESI 5. Re-triage at once if airway, breathing or skin-wide symptoms appear, because that is anaphylaxis.',
  },
];
