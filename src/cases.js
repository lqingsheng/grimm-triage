// Monster patients for the Night Shift game. Each case maps a spooky story to real vital signs,
// so the player learns real triage logic behind the costume.
export const CASES = [
  {
    id: 'vampire-bleed',
    name: 'Count Vlad, 547',
    emoji: '🧛',
    story: 'Fang slipped during dinner. Bleeding from the mouth will not stop. Pale (paler than usual).',
    patient: { ageYears: 547, avpu: 'A', newConfusion: false, hr: 128, rr: 24, sbp: 82, spo2: 95, tempC: 35.9, pain: 5, highRisk: true, needsLifesaving: false, resources: 3 },
  },
  {
    id: 'mummy-dehydration',
    name: 'Neferkare, 3,200',
    emoji: '🧟',
    story: 'Unwrapped too fast at the museum gala. Dizzy, dry mouth, has not had water in three millennia.',
    patient: { ageYears: 3200, avpu: 'A', newConfusion: false, hr: 108, rr: 18, sbp: 104, spo2: 97, tempC: 37.4, pain: 3, highRisk: false, needsLifesaving: false, resources: 2 },
  },
  {
    id: 'werewolf-sprain',
    name: 'Luna Lycan, 29',
    emoji: '🐺',
    story: 'Twisted an ankle mid-transformation. Can walk with a limp. Mostly annoyed.',
    patient: { ageYears: 29, avpu: 'A', newConfusion: false, hr: 88, rr: 16, sbp: 128, spo2: 99, tempC: 36.8, pain: 4, highRisk: false, needsLifesaving: false, resources: 1 },
  },
  {
    id: 'ghost-unresponsive',
    name: 'The Grey Lady, age unknown',
    emoji: '👻',
    story: 'Found floating in the stairwell. Does not respond to voice or pain. Faint, slow breathing.',
    patient: { ageYears: 70, avpu: 'U', newConfusion: true, hr: 44, rr: 6, sbp: 76, spo2: 81, tempC: 34.2, pain: 0, highRisk: true, needsLifesaving: true, resources: 4 },
  },
  {
    id: 'witch-chestpain',
    name: 'Agatha Hollow, 61',
    emoji: '🧙',
    story: 'Crushing chest pain since she lifted her cauldron. Sweaty, pain spreads to the left arm.',
    patient: { ageYears: 61, avpu: 'A', newConfusion: false, hr: 96, rr: 20, sbp: 152, spo2: 96, tempC: 36.7, pain: 8, highRisk: true, needsLifesaving: false, resources: 3 },
  },
  {
    id: 'skeleton-refill',
    name: 'Mr. Bones, 40',
    emoji: '💀',
    story: 'Needs a refill of his calcium tablets. Feels fine. Rattles politely.',
    patient: { ageYears: 40, avpu: 'A', newConfusion: false, hr: 72, rr: 14, sbp: 118, spo2: 99, tempC: 36.6, pain: 0, highRisk: false, needsLifesaving: false, resources: 0 },
  },
  {
    id: 'pumpkin-fever',
    name: 'Jack O. Lantern, 34',
    emoji: '🎃',
    story: 'Burning up from the inside, cough for 3 days. Breathing fast, glowing a little too bright.',
    patient: { ageYears: 34, avpu: 'A', newConfusion: false, hr: 118, rr: 26, sbp: 112, spo2: 91, tempC: 39.6, pain: 3, highRisk: false, needsLifesaving: false, resources: 3 },
  },
];
