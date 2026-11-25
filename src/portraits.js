// Original inline SVG portraits for the monster case bank, keyed by case id (see src/cases.js).
// Each portrait is hand-drawn from basic shapes on a 64 x 64 viewBox: no external files, fonts,
// images or links, so the art works offline and carries no third-party copyright.
// The candle-lit circular frame around each portrait is drawn in CSS (.portrait in styles.css).
//
// Shape: { label, labelZh, eyes, art }
//   label   - accessible description, used as the SVG's aria-label
//   labelZh - the same description in Simplified Chinese, used when the 中文 toggle is on
//   eyes    - [[x, y], [x, y]] centres of the two eyes, where eyeGlowSvg() draws the red glow
//   art   - SVG child elements only; portraitSvg() wraps them in the <svg> element

const INK = '#1d1a22';
const DUSK = '#3a3246';

export const PORTRAITS = {
  // ---------------- ESI 1 ----------------
  'ghost-unresponsive': {
    label: 'The Grey Lady: a pale grey ghost with closed eyes and a small open mouth',
    labelZh: '灰衣夫人：苍白的灰色幽灵，双眼紧闭，嘴巴微张',
    eyes: [[26, 30.5], [38, 30.5]],
    art: `<path d="M16 58V28a16 16 0 0 1 32 0v30l-5-4-5 4-6-4-6 4-5-4z" fill="#d9d4e3"/>
      <path d="M23 30q3 2 6 0M35 30q3 2 6 0" stroke="${DUSK}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="40" r="2.5" fill="${DUSK}"/>`,
  },
  'frankenstein-bradycardia': {
    label: 'Bolt-neck Frank: a green square-headed monster with neck bolts and a spark of lightning',
    labelZh: '螺栓颈弗兰克：方脑袋的绿色怪物，脖子上有螺栓，旁边闪着一道电光',
    eyes: [[26, 30], [38, 30]],
    art: `<rect x="18" y="14" width="28" height="34" rx="4" fill="#7fae6a"/>
      <rect x="18" y="12" width="28" height="9" fill="${INK}"/>
      <rect x="11" y="38" width="7" height="5" fill="#9aa0a8"/><rect x="46" y="38" width="7" height="5" fill="#9aa0a8"/>
      <circle cx="26" cy="30" r="2.5" fill="${INK}"/><circle cx="38" cy="30" r="2.5" fill="${INK}"/>
      <path d="M25 41h14" stroke="${INK}" stroke-width="2"/>
      <path d="M22 25h10M24 23v4M28 23v4" stroke="${INK}" stroke-width="1.5"/>
      <path d="M54 4l-5 8h5l-4 8" stroke="#f2c230" stroke-width="2" fill="none" stroke-linejoin="round"/>`,
  },
  'zombie-anaphylaxis': {
    label: 'Zed the Zombie: a grey-green zombie with swollen red lips and hives on his face',
    labelZh: '僵尸泽德：灰绿色的僵尸，嘴唇红肿，脸上布满荨麻疹',
    eyes: [[25, 28], [39, 28]],
    art: `<circle cx="32" cy="32" r="18" fill="#8fa77a"/>
      <circle cx="25" cy="28" r="3" fill="#f4f0e0"/><circle cx="25" cy="28" r="1.3" fill="${INK}"/>
      <path d="M36 28h6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="32" cy="41" rx="8" ry="4" fill="#d9536b"/>
      <path d="M26 41h12" stroke="#7a1f2e" stroke-width="1.5"/>
      <circle cx="20" cy="36" r="1.6" fill="#e0707f"/><circle cx="44" cy="35" r="1.6" fill="#e0707f"/>
      <circle cx="41" cy="21" r="1.4" fill="#e0707f"/><circle cx="22" cy="21" r="1.2" fill="#e0707f"/>`,
  },
  'sandman-overdose': {
    label: 'The Sandman: a sleeping figure in a blue nightcap with grains of sand drifting by',
    labelZh: '睡魔：戴蓝色睡帽的沉睡身影，身边飘着沙粒',
    eyes: [[27, 39.5], [37, 39.5]],
    art: `<circle cx="32" cy="38" r="16" fill="#c9b48a"/>
      <path d="M16 34q4-22 30-18l6 10-6-2q-14-4-30 10z" fill="#4a7bd6"/>
      <circle cx="53" cy="26" r="3" fill="#e9e4f0"/>
      <path d="M24 39q3 2 6 0M34 39q3 2 6 0" stroke="${DUSK}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="47" r="1.6" fill="${DUSK}"/>
      <path d="M44 4h6l-6 6h6" stroke="#e9e4f0" stroke-width="1.5" fill="none"/>
      <circle cx="10" cy="48" r="1" fill="#f2c230"/><circle cx="14" cy="54" r="1" fill="#f2c230"/><circle cx="54" cy="52" r="1" fill="#f2c230"/>`,
  },
  'vampire-bleed': {
    label: 'Count Vlad: a pale vampire with a high red collar, fangs and a drop of blood at his mouth',
    labelZh: '弗拉德伯爵：苍白的吸血鬼，高高的红色衣领，露出獠牙，嘴边有一滴血',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M10 60l8-20h28l8 20z" fill="#b3122e"/>
      <path d="M14 42l6-6v10zM50 42l-6-6v10z" fill="#5a0b18"/>
      <ellipse cx="32" cy="32" rx="13" ry="16" fill="#e8e2ee"/>
      <path d="M19 28q0-14 13-14t13 14l-6-4-7 6-7-6z" fill="${INK}"/>
      <circle cx="27" cy="32" r="2" fill="#b3122e"/><circle cx="37" cy="32" r="2" fill="#b3122e"/>
      <path d="M27 41q5 3 10 0" stroke="#5a0b18" stroke-width="2" fill="none"/>
      <path d="M28.5 42l1 3 1-2.6zM33.5 42.4l1 2.6 1-3z" fill="#fff"/>
      <path d="M36 44v5" stroke="#b3122e" stroke-width="2" stroke-linecap="round"/>`,
  },

  // ---------------- ESI 2 ----------------
  'mummy-dehydration': {
    label: 'Neferkare: a bandaged mummy with glowing yellow eyes and a loose bandage end',
    labelZh: '奈费尔卡拉：缠满绷带的木乃伊，眼睛发出黄光，一截绷带松脱',
    eyes: [[27, 28.5], [37, 28.5]],
    art: `<rect x="18" y="12" width="28" height="40" rx="12" fill="#e3d7b8"/>
      <path d="M18 22l28-4M18 38l28-5M20 47l24 1" stroke="#b8a77f" stroke-width="2.5"/>
      <rect x="22" y="25" width="20" height="7" rx="3.5" fill="#2a2030"/>
      <circle cx="27" cy="28.5" r="2" fill="#f2c230"/><circle cx="37" cy="28.5" r="2" fill="#f2c230"/>
      <path d="M40 50q6 4 4 10" stroke="#e3d7b8" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  },
  'witch-chestpain': {
    label: 'Agatha Hollow: a green-faced witch in a pointed hat above a cracked red heart',
    labelZh: '阿加莎·霍洛：戴尖帽的绿脸女巫，下方是一颗裂开的红心',
    eyes: [[28, 36], [36, 36]],
    art: `<path d="M22 25l9-21 11 21z" fill="#2a1838" stroke="#5a3a70" stroke-width="1"/>
      <ellipse cx="32" cy="26" rx="20" ry="4" fill="#2a1838" stroke="#5a3a70" stroke-width="1"/>
      <rect x="24" y="20" width="16" height="3" fill="#ff8a1f"/>
      <ellipse cx="32" cy="38" rx="11" ry="11" fill="#8cc084"/>
      <circle cx="28" cy="36" r="1.8" fill="${INK}"/><circle cx="36" cy="36" r="1.8" fill="${INK}"/>
      <path d="M32 37l3 5h-3" stroke="#5f8a58" stroke-width="1.5" fill="none"/>
      <path d="M28 45q4-2 8 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M32 63l-6-6a3.5 3.5 0 0 1 6-4 3.5 3.5 0 0 1 6 4z" fill="#b3122e"/>
      <path d="M32 54l-1.5 3 2 2-1 3" stroke="#0b0a10" stroke-width="1" fill="none"/>`,
  },
  'pumpkin-fever': {
    label: 'Jack O. Lantern: a glowing carved pumpkin with a bead of sweat',
    labelZh: '杰克·南瓜灯：发光的雕刻南瓜，挂着一滴汗珠',
    eyes: [[24, 32.5], [40, 32.5]],
    art: `<ellipse cx="32" cy="38" rx="22" ry="18" fill="#ff8a1f"/>
      <path d="M32 20v36M20 22q-6 16 0 32M44 22q6 16 0 32" stroke="#c9600f" stroke-width="2" fill="none"/>
      <path d="M31 21q0-8 6-10" stroke="#3fb27f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M19 35l5-7 5 7zM35 35l5-7 5 7z" fill="#ffe27a"/>
      <path d="M20 43q12 9 24 0l-4 1-2 3-3-3-3 3-3-3-3 3-2-3z" fill="#ffe27a"/>
      <path d="M54 22q3 4 0 6q-3-2 0-6z" fill="#7cc7ff"/>`,
  },
  'medusa-stroke': {
    label: 'Medusa Gorgon: a pale green face with snakes for hair and a mouth drooping on one side',
    labelZh: '美杜莎·戈耳工：淡绿色的脸，头发是一条条蛇，一侧嘴角下垂',
    eyes: [[27, 35], [37, 35]],
    art: `<path d="M20 28q-8-6-6-16M25 22q-4-10 1-17M32 20q0-10 6-15M39 22q5-10 11-13M44 28q8-6 10-15" stroke="#3fb27f" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="12" r="2.6" fill="#3fb27f"/><circle cx="26" cy="5" r="2.6" fill="#3fb27f"/><circle cx="38" cy="5" r="2.6" fill="#3fb27f"/>
      <circle cx="50" cy="9" r="2.6" fill="#3fb27f"/><circle cx="54" cy="13" r="2.6" fill="#3fb27f"/>
      <ellipse cx="32" cy="38" rx="14" ry="16" fill="#a9c79a"/>
      <circle cx="27" cy="35" r="2" fill="#f2c230"/><circle cx="37" cy="35" r="2" fill="#f2c230"/>
      <path d="M26 46q5 0 10 3" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  },
  'banshee-bronchiolitis': {
    label: 'Baby Banshee: a tiny ghost in a blue bonnet, mouth open, with wheezy breath lines',
    labelZh: '报丧女妖宝宝：戴蓝色软帽的小幽灵，张着嘴，旁边画着喘息的呼吸线',
    eyes: [[28, 36], [36, 36]],
    art: `<path d="M20 56V34a12 12 0 0 1 24 0v22l-4-3-4 3-4-3-4 3-4-3z" fill="#e6e0f0"/>
      <path d="M18 36a14 14 0 0 1 28 0" stroke="#7cc7ff" stroke-width="4" fill="none"/>
      <circle cx="28" cy="36" r="1.8" fill="${DUSK}"/><circle cx="36" cy="36" r="1.8" fill="${DUSK}"/>
      <ellipse cx="32" cy="44" rx="3" ry="4" fill="${DUSK}"/>
      <path d="M48 40q4 0 6-3M48 46q5 0 8 2" stroke="#9a92a8" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  },
  'gremlin-gastro': {
    label: 'Grizzle the Gremlin: a small green gremlin with huge pointed ears, wide eyes and a tear',
    labelZh: '小魔怪格里佐：绿色的小魔怪，长着巨大的尖耳朵，眼睛圆睁，流着一滴泪',
    eyes: [[26, 35], [38, 35]],
    art: `<path d="M20 32L4 20l10 16zM44 32l16-12-10 16z" fill="#7a9a6a"/>
      <circle cx="32" cy="37" r="14" fill="#8fae7a"/>
      <circle cx="26" cy="34" r="4" fill="#f4f0e0"/><circle cx="38" cy="34" r="4" fill="#f4f0e0"/>
      <circle cx="26" cy="35" r="2" fill="${INK}"/><circle cx="38" cy="35" r="2" fill="${INK}"/>
      <path d="M27 45q5-3 10 0" stroke="${INK}" stroke-width="1.8" fill="none"/>
      <path d="M22 39q2 3 0 5q-2-2 0-5z" fill="#7cc7ff"/>`,
  },
  'imp-appendicitis': {
    label: 'Little Imp: a red imp with yellow horns and a pointed tail, frowning in pain',
    labelZh: '小恶魔：长着黄色犄角和尖尾巴的红色小恶魔，痛得皱着眉',
    eyes: [[27, 35], [37, 35]],
    art: `<path d="M21 24l-5-14 10 8zM43 24l5-14-10 8z" fill="#f2c230"/>
      <path d="M45 48q9 3 9-6l3 2" stroke="#d9413a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="35" r="15" fill="#d9413a"/>
      <path d="M24 30l5 2M40 30l-5 2" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="27" cy="35" r="1.8" fill="${INK}"/><circle cx="37" cy="35" r="1.8" fill="${INK}"/>
      <path d="M26 44q6-4 12 0" stroke="${INK}" stroke-width="2" fill="none"/>`,
  },

  // ---------------- ESI 3 ----------------
  'goblin-abdopain': {
    label: 'Grubnik the Goblin: a green goblin with long ears, a hooked nose and two small fangs',
    labelZh: '哥布林格鲁布尼克：绿色哥布林，长耳朵，鹰钩鼻，露出两颗小尖牙',
    eyes: [[26, 30], [38, 30]],
    art: `<path d="M18 32L2 26l14 12zM46 32l16-6-14 12z" fill="#5f9a4a"/>
      <ellipse cx="32" cy="34" rx="15" ry="16" fill="#6fae55"/>
      <circle cx="26" cy="30" r="2.5" fill="#f2c230"/><circle cx="38" cy="30" r="2.5" fill="#f2c230"/>
      <path d="M32 32l-3 9h6z" fill="#4f8a3a"/>
      <path d="M24 44q8 4 16 0" stroke="${INK}" stroke-width="2" fill="none"/>
      <path d="M27 45v3M37 45v3" stroke="#f4f0e0" stroke-width="2"/>
      <circle cx="41" cy="40" r="1.5" fill="#4f8a3a"/>`,
  },
  'zombie-handbite': {
    label: 'Zelda the Zombie: a zombie with brown hair raising a swollen red hand with bite marks',
    labelZh: '僵尸塞尔达：棕色头发的僵尸，举起一只带咬痕的红肿的手',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M14 52q0-36 18-36t18 36z" fill="#4a3a2a"/>
      <ellipse cx="32" cy="34" rx="12" ry="14" fill="#9db08a"/>
      <circle cx="27" cy="32" r="2" fill="${INK}"/><circle cx="37" cy="32" r="2.6" fill="#f4f0e0"/>
      <path d="M27 42h10" stroke="${INK}" stroke-width="2"/>
      <path d="M33 22l3 4" stroke="#6a7a5a" stroke-width="1.5"/>
      <rect x="47" y="44" width="12" height="14" rx="4" fill="#d9536b"/>
      <path d="M49 44v-5M53 44v-6M57 44v-5" stroke="#d9536b" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="51" cy="50" r="1.2" fill="#5a0b18"/><circle cx="55" cy="50" r="1.2" fill="#5a0b18"/>`,
  },
  'pixie-toddler-fever': {
    label: 'Pip the Pixie: a small pixie with see-through wings, orange hair and flushed cheeks',
    labelZh: '小精灵皮普：长着透明翅膀、橙色头发、脸颊通红的小精灵',
    eyes: [[28, 38], [36, 38]],
    art: `<ellipse cx="16" cy="30" rx="9" ry="16" fill="#bfe8ff" opacity=".7" transform="rotate(-20 16 30)"/>
      <ellipse cx="48" cy="30" rx="9" ry="16" fill="#bfe8ff" opacity=".7" transform="rotate(20 48 30)"/>
      <circle cx="32" cy="37" r="12" fill="#f3d2c1"/>
      <path d="M20 34q12-18 24 0q-6-6-12-4q-6-2-12 4z" fill="#ff8a1f"/>
      <circle cx="28" cy="38" r="1.6" fill="${INK}"/><circle cx="36" cy="38" r="1.6" fill="${INK}"/>
      <circle cx="25" cy="42" r="2.2" fill="#ff6b81" opacity=".75"/><circle cx="39" cy="42" r="2.2" fill="#ff6b81" opacity=".75"/>
      <path d="M30 45q2 1 4 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M50 52l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#f2c230"/>`,
  },
  'frankie-jr-fracture': {
    label: 'Frankie Jr.: a small green monster with neck bolts and a white cast on his arm',
    labelZh: '小弗兰基：脖子上有螺栓的绿色小怪物，手臂打着白色石膏',
    eyes: [[27, 24], [37, 24]],
    art: `<rect x="20" y="12" width="24" height="26" rx="4" fill="#8fbf7a"/>
      <rect x="20" y="10" width="24" height="7" fill="${INK}"/>
      <rect x="15" y="28" width="5" height="4" fill="#9aa0a8"/><rect x="44" y="28" width="5" height="4" fill="#9aa0a8"/>
      <circle cx="27" cy="24" r="2" fill="${INK}"/><circle cx="37" cy="24" r="2" fill="${INK}"/>
      <path d="M28 32q4-2 8 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M16 60l16-16 16 16" stroke="#9a92a8" stroke-width="2.5" fill="none"/>
      <rect x="22" y="46" width="20" height="8" rx="4" fill="#e9e4f0"/>
      <rect x="40" y="46" width="5" height="8" rx="2.5" fill="#8fbf7a"/>`,
  },

  // ---------------- ESI 4 ----------------
  'werewolf-sprain': {
    label: 'Luna Lycan: a grey werewolf with pointed ears and yellow eyes',
    labelZh: '狼人露娜：灰色狼人，尖耳朵，黄眼睛',
    eyes: [[25, 31], [39, 31]],
    art: `<path d="M16 28l2-18 10 10zM48 28l-2-18-10 10z" fill="#6b6478"/>
      <path d="M14 30q0-14 18-14t18 14l-4 14-14 10-14-10z" fill="#857d93"/>
      <circle cx="25" cy="31" r="2.2" fill="#f2c230"/><circle cx="39" cy="31" r="2.2" fill="#f2c230"/>
      <path d="M26 40q6-4 12 0l-6 8z" fill="#c8c0d4"/>
      <circle cx="32" cy="41" r="2.2" fill="${INK}"/>`,
  },
  'banshee-uti': {
    label: 'Siobhan the Banshee: a pale wailing spirit with long silver hair',
    labelZh: '报丧女妖希冯：长着银色长发、正在哀嚎的苍白幽灵',
    eyes: [[28, 31], [36, 31]],
    art: `<path d="M12 58q0-46 20-46t20 46q-6-10-8-24H20q-2 14-8 24z" fill="#9aa6c0"/>
      <ellipse cx="32" cy="34" rx="10" ry="13" fill="#eef0f8"/>
      <circle cx="28" cy="31" r="1.8" fill="${DUSK}"/><circle cx="36" cy="31" r="1.8" fill="${DUSK}"/>
      <ellipse cx="32" cy="41" rx="3" ry="4.5" fill="${DUSK}"/>`,
  },
  'scarecrow-laceration': {
    label: 'Scarecrow Silas: a burlap scarecrow in a straw hat with button eyes and a small red cut',
    labelZh: '稻草人塞拉斯：戴草帽的麻布稻草人，纽扣眼睛，身上有一道小红伤口',
    eyes: [[27, 35], [37, 35]],
    art: `<path d="M20 60l4-8M44 60l-4-8M28 60l2-6M36 60l-2-6" stroke="#f2c230" stroke-width="2"/>
      <circle cx="32" cy="38" r="14" fill="#d9b77a"/>
      <path d="M21 25q0-15 11-15t11 15z" fill="#a67c3d"/>
      <ellipse cx="32" cy="25" rx="22" ry="4.5" fill="#a67c3d"/>
      <path d="M25 33l4 4M29 33l-4 4M35 33l4 4M39 33l-4 4" stroke="${INK}" stroke-width="2"/>
      <path d="M24 45h16M27 43v4M31 43v4M35 43v4" stroke="${INK}" stroke-width="1.5"/>
      <path d="M41 38l4 6" stroke="#b3122e" stroke-width="2" stroke-linecap="round"/>`,
  },

  // ---------------- ESI 5 ----------------
  'skeleton-refill': {
    label: 'Mr. Bones: a white skull with dark eye sockets next to a blue and white capsule',
    labelZh: '骨头先生：一个白色骷髅头，眼窝漆黑，旁边是一粒蓝白相间的胶囊',
    eyes: [[26, 31], [38, 31]],
    art: `<path d="M18 30a14 14 0 0 1 28 0v8l-4 2v6H22v-6l-4-2z" fill="#eee8dc"/>
      <circle cx="26" cy="31" r="4" fill="${INK}"/><circle cx="38" cy="31" r="4" fill="${INK}"/>
      <path d="M32 35l-2 4h4z" fill="${INK}"/>
      <path d="M26 42v4M30 42v4M34 42v4M38 42v4" stroke="${INK}" stroke-width="1.2"/>
      <g transform="rotate(-30 52 54)">
        <path d="M52 50.5h-4.5a3.5 3.5 0 0 0 0 7H52z" fill="#4a7bd6"/>
        <path d="M52 50.5h4.5a3.5 3.5 0 0 1 0 7H52z" fill="#e9e4f0"/>
      </g>`,
  },
  'phantom-cold': {
    label: 'The Phantom: a man in a white half-mask with a red nose and a floating music note',
    labelZh: '魅影：戴白色半边面具的男人，鼻子通红，身旁飘着一个音符',
    eyes: [[27, 32], [38, 32]],
    art: `<ellipse cx="32" cy="34" rx="13" ry="16" fill="#e6c9b3"/>
      <path d="M19 28q0-14 13-14t13 14q-4-8-13-8t-13 8z" fill="${INK}"/>
      <path d="M32 20q13 0 13 14t-13 16z" fill="#f4f0f8"/>
      <circle cx="27" cy="32" r="1.8" fill="${INK}"/><ellipse cx="38" cy="32" rx="3" ry="2" fill="${INK}"/>
      <circle cx="32" cy="38" r="2.2" fill="#e0707f"/>
      <path d="M27 44q5 2 10 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M53 10v13M53 10l5 2" stroke="#e9e4f0" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="51" cy="23" rx="3" ry="2" fill="#e9e4f0"/>`,
  },
  'gargoyle-sting': {
    label: 'Grimwald the Gargoyle: a stone-grey gargoyle with wings and horns, a wasp buzzing nearby',
    labelZh: '石像鬼格林瓦尔德：长着翅膀和犄角的石灰色石像鬼，旁边有一只嗡嗡飞的马蜂',
    eyes: [[26, 32], [38, 32]],
    art: `<path d="M16 40L2 22l8 4 2-8 8 14zM48 40l14-18-8 4-2-8-8 14z" fill="#5d5a66"/>
      <path d="M23 22l-3-10 9 7zM41 22l3-10-9 7z" fill="#7a7684"/>
      <rect x="18" y="20" width="28" height="30" rx="10" fill="#8a8694"/>
      <circle cx="26" cy="32" r="2.5" fill="#ff8a1f"/><circle cx="38" cy="32" r="2.5" fill="#ff8a1f"/>
      <path d="M25 42q7 4 14 0" stroke="#3a3644" stroke-width="2" fill="none"/>
      <ellipse cx="54" cy="52" rx="5" ry="3" fill="#f2c230"/>
      <path d="M52 49.3v5.4M55 49.2v5.6" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="53" cy="48" rx="3" ry="1.8" fill="#e9e4f0" opacity=".8"/>`,
  },

  // ---------------- Task 14: new cases ----------------
  'werewolf-cub-anaphylaxis': {
    label: 'Rowan the Werewolf Cub: a small brown wolf pup with a swollen muzzle and red hives',
    labelZh: '狼人幼崽罗恩：一只棕色小狼崽，口鼻肿胀，身上有红色荨麻疹',
    eyes: [[26, 31], [38, 31]],
    art: `<path d="M18 26l2-14 9 9zM46 26l-2-14-9 9z" fill="#8a6a4a"/>
      <circle cx="32" cy="35" r="15" fill="#a07a55"/>
      <ellipse cx="32" cy="43" rx="9" ry="7" fill="#e0a98a"/>
      <circle cx="26" cy="31" r="2" fill="${INK}"/><circle cx="38" cy="31" r="2" fill="${INK}"/>
      <circle cx="32" cy="40" r="2.2" fill="${INK}"/>
      <circle cx="21" cy="40" r="1.6" fill="#ff6b81"/><circle cx="44" cy="38" r="1.6" fill="#ff6b81"/><circle cx="41" cy="46" r="1.3" fill="#ff6b81"/>`,
  },
  'mothman-organophosphate': {
    label: 'The Mothman: a dark grey moth-winged figure with tiny pupils, drooling, in a cloud of spray',
    labelZh: '天蛾人：长着蛾翅的深灰色身影，瞳孔极小，正在流涎，周围是一团喷雾',
    eyes: [[26, 28], [38, 28]],
    art: `<path d="M30 30L6 14q-4 18 8 28zM34 30l24-16q4 18-8 28z" fill="#4a4456"/>
      <ellipse cx="32" cy="36" rx="10" ry="16" fill="#5d5868"/>
      <circle cx="26" cy="28" r="4.5" fill="#ff8a8a"/><circle cx="38" cy="28" r="4.5" fill="#ff8a8a"/>
      <circle cx="26" cy="28" r=".9" fill="${INK}"/><circle cx="38" cy="28" r=".9" fill="${INK}"/>
      <path d="M29 40q3 2 6 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M31 42v5" stroke="#bfe8ff" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="2" fill="#d9f5c8" opacity=".7"/><circle cx="55" cy="45" r="1.5" fill="#d9f5c8" opacity=".7"/><circle cx="56" cy="54" r="1.2" fill="#d9f5c8" opacity=".7"/>`,
  },
  'poltergeist-status': {
    label: 'Tiny Tremor: a small blue-white ghost baby with jagged shake lines and floating toys',
    labelZh: '小震颤：一个蓝白色的小幽灵宝宝，周围有锯齿状的抖动线条和漂浮的玩具',
    eyes: [[28, 34], [36, 34]],
    art: `<path d="M20 54V36a12 12 0 0 1 24 0v18l-4-3-4 3-4-3-4 3-4-3z" fill="#cfe0f0"/>
      <path d="M26 34h4M34 34h4" stroke="${DUSK}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="32" cy="42" rx="2.5" ry="2" fill="${DUSK}"/>
      <path d="M12 30l3 3-3 3 3 3M52 30l-3 3 3 3-3 3" stroke="#f2c230" stroke-width="1.5" fill="none"/>
      <rect x="8" y="10" width="7" height="7" rx="1.5" fill="#ff8a1f" transform="rotate(15 11.5 13.5)"/>
      <circle cx="52" cy="13" r="4" fill="#4a7bd6"/>`,
  },
  'dragon-keeper-burn': {
    label: 'Ember the Dragon Keeper: a soot-smudged keeper with singed hair, holding a tiny green dragon',
    labelZh: '驯龙人恩伯：满脸烟灰、头发烧焦的驯龙人，怀里抱着一条小绿龙',
    eyes: [[27, 28], [37, 28]],
    art: `<path d="M18 26q0-14 14-14t14 14l-3-4-3 4-3-6-3 6-3-6-3 6-3-4z" fill="#3a2a20"/>
      <circle cx="32" cy="30" r="12" fill="#e0b48f"/>
      <circle cx="27" cy="28" r="1.8" fill="${INK}"/><circle cx="37" cy="28" r="1.8" fill="${INK}"/>
      <ellipse cx="32" cy="36" rx="4" ry="2.4" fill="#4a3a34" opacity=".75"/>
      <circle cx="24" cy="33" r="2.4" fill="#5a4a44" opacity=".5"/><circle cx="41" cy="31" r="2" fill="#5a4a44" opacity=".5"/>
      <path d="M20 62q0-14 12-16 12 2 12 16z" fill="#7a4a2a"/>
      <path d="M34 54q8-8 16-3l-3 1 4 3h-5q-4 5-12 2z" fill="#3fb27f"/>
      <path d="M14 8q2 4-1 7M50 6q3 5 0 8" stroke="#9a92a8" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  },
  'nymph-ectopic': {
    label: 'Willow the Wood Nymph: a pale green nymph with leafy hair, eyes half closed, pale and clammy',
    labelZh: '林中仙子薇洛：长着树叶头发的淡绿色仙子，半闭着眼，面色苍白、皮肤湿冷',
    eyes: [[27, 33], [37, 33]],
    art: `<path d="M14 30q-2-16 18-18 20 2 18 18l-6-6-4 6-4-8-4 8-4-8-4 8-4-6z" fill="#3fb27f"/>
      <ellipse cx="32" cy="36" rx="12" ry="15" fill="#d6e8d0"/>
      <path d="M24 33q3 1.5 6 0M34 33q3 1.5 6 0" stroke="${DUSK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M28 44q4-2 8 0" stroke="${DUSK}" stroke-width="1.5" fill="none"/>
      <path d="M44 38q2 3 0 5q-2-2 0-5z" fill="#7cc7ff"/>
      <path d="M10 40q-4 6 0 10M54 40q4 6 0 10" stroke="#5f9a4a" stroke-width="2" fill="none"/>`,
  },
  'lich-septic-shock': {
    label: 'Lord Marrow the Lich: a grey skull-faced sorcerer in a gold crown, shivering, beside a glowing jar',
    labelZh: '巫妖马罗勋爵：戴金冠、骷髅脸的灰色巫师，正在发抖，身旁有一只发光的罐子',
    eyes: [[27, 31], [37, 31]],
    art: `<path d="M20 20l4-8 4 6 4-8 4 8 4-6 4 8z" fill="#f2c230"/>
      <path d="M20 30a12 12 0 0 1 24 0v8l-3 2v5H23v-5l-3-2z" fill="#c9c4bc"/>
      <circle cx="27" cy="31" r="3.4" fill="${INK}"/><circle cx="37" cy="31" r="3.4" fill="${INK}"/>
      <path d="M32 35l-2 3h4z" fill="${INK}"/>
      <path d="M14 26l-3 2 3 2M50 26l3 2-3 2" stroke="#9a92a8" stroke-width="1.5" fill="none"/>
      <path d="M12 62l6-14h28l6 14z" fill="#3a2a50"/>
      <rect x="48" y="46" width="9" height="12" rx="2" fill="#7cff9b" opacity=".55"/><rect x="49" y="43" width="7" height="3" fill="#9a92a8"/>`,
  },
  'wraith-asthma': {
    label: 'Whisper the Wraith: a hooded grey wraith with heavy-lidded eyes, holding a blue inhaler',
    labelZh: '幽魂低语：戴兜帽的灰色幽魂，眼皮沉重，手拿蓝色吸入器',
    eyes: [[27, 33], [37, 33]],
    art: `<path d="M12 60q0-48 20-48t20 48l-6-5-4 5-5-5-5 5-5-5-4 5z" fill="#5d5868"/>
      <ellipse cx="32" cy="34" rx="10" ry="12" fill="#bdb6c8"/>
      <path d="M24 33h6M34 33h6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 31q3-2 6 0M34 31q3-2 6 0" stroke="${INK}" stroke-width="1" fill="none"/>
      <ellipse cx="32" cy="41" rx="2" ry="1.5" fill="${INK}"/>
      <rect x="44" y="42" width="6" height="12" rx="2" fill="#4a7bd6"/><rect x="42" y="40" width="10" height="4" rx="1.5" fill="#e9e4f0"/>`,
  },
  'baby-bat-febrile-infant': {
    label: 'Baby Bat: a tiny pink bat baby with flushed cheeks, wrapped in a blue blanket',
    labelZh: '蝙蝠宝宝：脸颊通红的粉色小蝙蝠，裹在蓝色毯子里',
    eyes: [[28, 30], [36, 30]],
    art: `<path d="M22 28L6 20l4 10-4 6 14-2zM42 28l16-8-4 10 4 6-14-2z" fill="#5a4a60"/>
      <path d="M25 22l-2-7 6 5zM39 22l2-7-6 5z" fill="#d9a8b8"/>
      <circle cx="32" cy="30" r="11" fill="#d9a8b8"/>
      <circle cx="28" cy="30" r="1.8" fill="${INK}"/><circle cx="36" cy="30" r="1.8" fill="${INK}"/>
      <circle cx="25" cy="34" r="2.2" fill="#ff6b81" opacity=".75"/><circle cx="39" cy="34" r="2.2" fill="#ff6b81" opacity=".75"/>
      <path d="M30 36q2 1.5 4 0" stroke="${INK}" stroke-width="1.2" fill="none"/>
      <path d="M16 62q0-18 16-20 16 2 16 20z" fill="#7cc7ff"/>`,
  },
  'siren-preeclampsia': {
    label: 'Selene the Siren: a siren with flowing sea-green hair and a pregnant belly, stars flashing by her eyes',
    labelZh: '海妖塞勒涅：海绿色长发飘逸、腹部隆起的海妖，眼旁闪着星光',
    eyes: [[27, 26], [37, 26]],
    art: `<path d="M16 40q-4-28 16-28t16 28q-4-6-6-14H22q-2 8-6 14z" fill="#2f8f8a"/>
      <ellipse cx="32" cy="27" rx="9" ry="11" fill="#cfe8e0"/>
      <circle cx="27" cy="26" r="1.8" fill="${INK}"/><circle cx="37" cy="26" r="1.8" fill="${INK}"/>
      <path d="M29 32q3 1 6 0" stroke="${INK}" stroke-width="1.3" fill="none"/>
      <path d="M20 62q-2-14 6-22h12q12 6 8 22z" fill="#4a7bd6"/>
      <ellipse cx="38" cy="52" rx="8" ry="7" fill="#5a8be6"/>
      <path d="M14 18l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5zM50 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#f2c230"/>`,
  },
  'shade-suicidal': {
    label: 'Hollow the Shade: a dark shadow figure with faint grey eyes, arms wrapped round himself',
    labelZh: '幽影霍洛：一个黑色的影子人形，眼睛是淡淡的灰色，双臂抱着自己',
    eyes: [[27, 27], [37, 27]],
    art: `<path d="M16 62q-2-22 6-30a12 12 0 1 1 20 0q8 8 6 30z" fill="#2a2434"/>
      <circle cx="27" cy="27" r="2" fill="#9a92a8"/><circle cx="37" cy="27" r="2" fill="#9a92a8"/>
      <path d="M28 34q4-2 8 0" stroke="#9a92a8" stroke-width="1.3" fill="none"/>
      <path d="M18 46q14 8 28 0" stroke="#3a3246" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M10 20l3 2M54 20l-3 2M8 30h4M56 30h-4" stroke="#5a4a6a" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  'grimalkin-fall-anticoag': {
    label: 'Granny Grimalkin: an elderly witch with grey hair, round glasses and a bump on her brow, with her black cat',
    labelZh: '格里玛金奶奶：灰发、戴圆眼镜的老女巫，眉骨上有个肿包，身边是她的黑猫',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M18 30q0-16 14-16t14 16q-4-6-14-6t-14 6z" fill="#c8c0d4"/>
      <ellipse cx="32" cy="35" rx="12" ry="13" fill="#e8d6c8"/>
      <circle cx="27" cy="32" r="3.2" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="37" cy="32" r="3.2" fill="none" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="27" cy="32" r="1.3" fill="${INK}"/><circle cx="37" cy="32" r="1.3" fill="${INK}"/>
      <path d="M30.2 32h3.6" stroke="${INK}" stroke-width="1.2"/>
      <ellipse cx="38" cy="25" rx="3" ry="2" fill="#b58aa0"/>
      <path d="M28 42q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M48 62v-10a6 6 0 0 1 12 0v10zM48 47l1-5 3 4zM60 47l-1-5-3 4z" fill="${INK}"/>
      <circle cx="52" cy="51" r="1" fill="#f2c230"/><circle cx="56" cy="51" r="1" fill="#f2c230"/>`,
  },
  'sugar-skull-dka': {
    label: 'Sofia Sugar Skull: a white sugar-skull face with blue flower eyes and a sweet wrapper',
    labelZh: '糖骷髅索菲亚：白色糖骷髅脸，眼眶画着蓝色花朵，旁边有一张糖纸',
    eyes: [[26, 30], [38, 30]],
    art: `<path d="M18 30a14 14 0 0 1 28 0v8l-4 3v6H22v-6l-4-3z" fill="#f4f0f8"/>
      <circle cx="26" cy="30" r="5" fill="#7cc7ff"/><circle cx="38" cy="30" r="5" fill="#7cc7ff"/>
      <circle cx="26" cy="30" r="2" fill="${INK}"/><circle cx="38" cy="30" r="2" fill="${INK}"/>
      <path d="M32 34l-2 4h4z" fill="#ff6b81"/>
      <path d="M24 43h16M27 41v4M31 41v4M35 41v4" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="32" cy="20" r="2.5" fill="#ff8a1f"/><circle cx="27" cy="21" r="1.5" fill="#3fb27f"/><circle cx="37" cy="21" r="1.5" fill="#3fb27f"/>
      <path d="M50 52l4-3 4 3-4 3z" fill="#ff6b81"/><path d="M46 52h4M58 52h4" stroke="#f2c230" stroke-width="1.5"/>`,
  },
  'raven-paracetamol': {
    label: 'Poe the Raven: a black raven with yellow eyes, a cracked grey beak and a small white pill',
    labelZh: '渡鸦坡：一只黄眼睛的黑色渡鸦，灰色的喙上有裂纹，旁边有一粒白色小药片',
    eyes: [[27, 26], [37, 26]],
    art: `<ellipse cx="32" cy="40" rx="15" ry="17" fill="#2a2434"/>
      <circle cx="32" cy="27" r="11" fill="#3a3246"/>
      <circle cx="27" cy="26" r="2.2" fill="#f2c230"/><circle cx="37" cy="26" r="2.2" fill="#f2c230"/>
      <circle cx="27" cy="26" r="1" fill="${INK}"/><circle cx="37" cy="26" r="1" fill="${INK}"/>
      <path d="M28 31l4 9 4-9z" fill="#9a92a8"/>
      <path d="M32.5 32l-1.5 3" stroke="${INK}" stroke-width="1"/>
      <ellipse cx="52" cy="56" rx="5" ry="3" fill="#e9e4f0"/><path d="M52 53v6" stroke="#9a92a8" stroke-width="1"/>`,
  },
  'ghoul-gi-bleed': {
    label: 'Gus the Ghoul: a grey-green ghoul with sunken eyes, next to a roll of toilet paper',
    labelZh: '食尸鬼格斯：灰绿色食尸鬼，眼窝深陷，旁边有一卷卫生纸',
    eyes: [[27, 31], [37, 31]],
    art: `<ellipse cx="32" cy="33" rx="13" ry="16" fill="#8a9a7a"/>
      <ellipse cx="27" cy="31" rx="3.5" ry="3" fill="#5a6a4a"/><ellipse cx="37" cy="31" rx="3.5" ry="3" fill="#5a6a4a"/>
      <circle cx="27" cy="31" r="1.4" fill="#f4f0e0"/><circle cx="37" cy="31" r="1.4" fill="#f4f0e0"/>
      <path d="M26 42q6 3 12 0" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <path d="M22 20q4-4 6 0M36 19q4-4 6 1" stroke="#5a6a4a" stroke-width="2" fill="none"/>
      <rect x="46" y="46" width="12" height="12" rx="3" fill="#f4f0f8"/><circle cx="52" cy="52" r="2" fill="#c8c0d4"/>`,
  },
  'horseman-head-injury': {
    label: 'Sir Bram the Horseman: a knight with a dented helmet and a white bandage round his head, beside a horseshoe',
    labelZh: '骑士布拉姆：头盔凹陷、头缠白色绷带的骑士，旁边有一只马蹄铁',
    eyes: [[27, 36], [37, 36]],
    art: `<path d="M18 34q0-20 14-20t14 20z" fill="#9aa0a8"/>
      <path d="M30 14l2 4 2-4" stroke="#6a7078" stroke-width="1.5" fill="none"/>
      <rect x="18" y="30" width="28" height="18" rx="6" fill="#e0b48f"/>
      <path d="M17 29h30" stroke="#f4f0f8" stroke-width="5"/>
      <circle cx="40" cy="28" r="1.6" fill="#b3122e"/>
      <circle cx="27" cy="36" r="1.8" fill="${INK}"/><circle cx="37" cy="36" r="1.8" fill="${INK}"/>
      <path d="M28 43q4-2 8 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M48 60v-6a5 5 0 0 1 10 0v6" stroke="#9aa0a8" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  },
  'kelpie-pyelonephritis': {
    label: 'Kip the Kelpie: a young blue-green water horse with a dripping mane and flushed cheeks',
    labelZh: '水马基普：一匹蓝绿色的小水马，鬃毛滴着水，脸颊通红',
    eyes: [[26, 30], [38, 30]],
    art: `<path d="M20 22l2-10 6 7zM44 22l-2-10-6 7z" fill="#3f8fa0"/>
      <path d="M18 26q0-10 14-10t14 10v16q0 10-14 12-14-2-14-12z" fill="#5fb0c0"/>
      <ellipse cx="32" cy="46" rx="9" ry="6" fill="#8fd0dc"/>
      <circle cx="26" cy="30" r="2.2" fill="${INK}"/><circle cx="38" cy="30" r="2.2" fill="${INK}"/>
      <circle cx="29" cy="46" r="1.2" fill="${INK}"/><circle cx="35" cy="46" r="1.2" fill="${INK}"/>
      <circle cx="22" cy="37" r="2.2" fill="#ff6b81" opacity=".7"/><circle cx="42" cy="37" r="2.2" fill="#ff6b81" opacity=".7"/>
      <path d="M30 14q-4 6-2 10M36 14q2 6 0 10" stroke="#2f6f80" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M14 30q-2 4 0 6q2-2 0-6z" fill="#7cc7ff"/>`,
  },
  'hobgoblin-dehydration': {
    label: 'Nib the Hobgoblin: a small brown hobgoblin toddler in a spotted red mushroom-cap hat, with a tear',
    labelZh: '小妖精尼布：戴红色斑点蘑菇帽的棕色小妖精幼儿，流着一滴泪',
    eyes: [[27, 36], [37, 36]],
    art: `<path d="M18 34L8 30l8 8zM46 34l10-4-8 8z" fill="#9a7a5a"/>
      <circle cx="32" cy="38" r="12" fill="#b08a65"/>
      <path d="M14 30q18-24 36 0z" fill="#d9413a"/>
      <circle cx="22" cy="24" r="2" fill="#f4f0e0"/><circle cx="33" cy="17" r="2.2" fill="#f4f0e0"/><circle cx="42" cy="24" r="1.8" fill="#f4f0e0"/>
      <circle cx="27" cy="36" r="1.8" fill="${INK}"/><circle cx="37" cy="36" r="1.8" fill="${INK}"/>
      <path d="M28 45q4-2 8 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <path d="M25 39q2 3 0 5q-2-2 0-5z" fill="#7cc7ff"/>`,
  },
  'spider-hip-fracture': {
    label: 'Grandma Cobweb: an elderly spider lady with grey curls and a purple shawl, lying beside a cobweb',
    labelZh: '蛛网奶奶：一位灰色卷发、披紫色披肩的蜘蛛老奶奶，躺在一张蛛网旁',
    eyes: [[28, 28], [36, 28]],
    art: `<path d="M18 40L6 34M18 44L4 46M46 40l12-6M46 44l14 2M20 48l-8 10M44 48l8 10" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="32" cy="44" rx="15" ry="11" fill="#6a4a80"/>
      <circle cx="32" cy="28" r="10" fill="#b8a8c0"/>
      <circle cx="25" cy="20" r="3" fill="#e9e4f0"/><circle cx="31" cy="18" r="3" fill="#e9e4f0"/><circle cx="37" cy="18" r="3" fill="#e9e4f0"/><circle cx="41" cy="22" r="2.6" fill="#e9e4f0"/>
      <circle cx="28" cy="28" r="1.6" fill="${INK}"/><circle cx="36" cy="28" r="1.6" fill="${INK}"/>
      <path d="M29 33q3 2 6 0" stroke="${INK}" stroke-width="1.3" fill="none"/>
      <path d="M50 6l8 8M58 6l-8 8M54 4v12M48 10h12" stroke="#9a92a8" stroke-width=".8"/>`,
  },
  'troll-cellulitis': {
    label: 'Bruk the Bridge Troll: a big grey-green troll with tusks and a red, swollen shin',
    labelZh: '桥下巨魔布鲁克：长着獠牙的高大灰绿色巨魔，小腿红肿',
    eyes: [[26, 26], [38, 26]],
    art: `<ellipse cx="32" cy="28" rx="16" ry="14" fill="#7a8a6a"/>
      <ellipse cx="32" cy="32" rx="5" ry="4" fill="#6a7a5a"/>
      <circle cx="26" cy="26" r="2.2" fill="${INK}"/><circle cx="38" cy="26" r="2.2" fill="${INK}"/>
      <path d="M24 38q8 4 16 0" stroke="${INK}" stroke-width="1.8" fill="none"/>
      <path d="M26 38l1-5 2 4zM38 38l-1-5-2 4z" fill="#f4f0e0"/>
      <rect x="22" y="46" width="8" height="16" rx="3" fill="#7a8a6a"/><rect x="34" y="46" width="8" height="16" rx="3" fill="#d9536b"/>
      <path d="M8 58h16M40 58h16" stroke="#6b6478" stroke-width="3"/>`,
  },
  'cyclops-pneumonia': {
    label: 'Ollie the Cyclops: a pale orange cyclops with one big eye, coughing into his fist',
    labelZh: '独眼巨人奥利：一个淡橙色的独眼巨人，只有一只大眼睛，正对着拳头咳嗽',
    eyes: [[32, 28], [32, 28]],
    art: `<ellipse cx="32" cy="32" rx="15" ry="17" fill="#e0a070"/>
      <circle cx="32" cy="28" r="7" fill="#f4f0e0"/>
      <circle cx="32" cy="28" r="3.5" fill="#4a7bd6"/><circle cx="32" cy="28" r="1.6" fill="${INK}"/>
      <path d="M26 20q6-4 12 0" stroke="#8a5a3a" stroke-width="2" fill="none"/>
      <ellipse cx="32" cy="42" rx="4" ry="3" fill="#8a5a3a"/>
      <circle cx="40" cy="46" r="5" fill="#d08a60"/>
      <path d="M48 40q4-2 6 0M48 44q5 0 8 2" stroke="#9a92a8" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  },
  'hag-asthma-mild': {
    label: 'Hex the Hag: a witch with wild grey hair and a long nose, holding a broom and an inhaler',
    labelZh: '老巫婆赫克丝：灰发蓬乱、长鼻子的女巫，手拿扫帚和吸入器',
    eyes: [[27, 30], [37, 30]],
    art: `<path d="M14 36q-4-24 18-24t18 24l-5-8-3 6-4-10-3 8-3-8-4 10-3-6z" fill="#9a92a8"/>
      <ellipse cx="32" cy="34" rx="11" ry="13" fill="#b5c88a"/>
      <circle cx="27" cy="30" r="1.8" fill="${INK}"/><circle cx="37" cy="30" r="1.8" fill="${INK}"/>
      <path d="M32 31l-2 9 4-1z" fill="#8fa86a"/>
      <path d="M28 43q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M6 62L20 40" stroke="#a67c3d" stroke-width="2.5"/><path d="M4 62l4-6 4 4z" fill="#d9b77a"/>
      <rect x="46" y="46" width="6" height="11" rx="2" fill="#4a7bd6"/><rect x="44" y="44" width="10" height="4" rx="1.5" fill="#e9e4f0"/>`,
  },
  'elf-strep-throat': {
    label: 'Holly the Elf: a young elf with pointed ears and a red hat, holding her sore throat',
    labelZh: '小精灵霍莉：一个尖耳朵、戴红帽子的小精灵，捂着疼痛的喉咙',
    eyes: [[28, 34], [36, 34]],
    art: `<path d="M18 30l-8-6 10 12zM46 30l8-6-10 12z" fill="#f3d2c1"/>
      <path d="M20 28q4-22 26-20-6 4-6 12z" fill="#d9413a"/><circle cx="46" cy="8" r="3" fill="#f4f0f8"/>
      <circle cx="32" cy="36" r="12" fill="#f3d2c1"/>
      <circle cx="28" cy="34" r="1.6" fill="${INK}"/><circle cx="36" cy="34" r="1.6" fill="${INK}"/>
      <path d="M29 41q3-1.5 6 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <circle cx="25" cy="39" r="2" fill="#ff6b81" opacity=".6"/><circle cx="39" cy="39" r="2" fill="#ff6b81" opacity=".6"/>
      <path d="M24 52q8-6 16 0" stroke="#3fb27f" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  'troll-tot-pulled-elbow': {
    label: 'Tansy the Troll Tot: a small round blue troll child holding her left arm bent against her tummy',
    labelZh: '小巨魔坦西：圆滚滚的蓝色巨魔小孩，把左臂弯曲贴在肚子上',
    eyes: [[27, 26], [37, 26]],
    art: `<path d="M22 14q10-10 20 0" stroke="#ff8a1f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="26" r="11" fill="#7a9ad0"/>
      <circle cx="27" cy="26" r="1.8" fill="${INK}"/><circle cx="37" cy="26" r="1.8" fill="${INK}"/>
      <ellipse cx="32" cy="31" rx="3" ry="2" fill="#5a7ab0"/>
      <path d="M29 34q3 1.5 6 0" stroke="${INK}" stroke-width="1.3" fill="none"/>
      <ellipse cx="32" cy="50" rx="13" ry="12" fill="#7a9ad0"/>
      <path d="M44 46q-4 8-12 6" stroke="#5a7ab0" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M20 44l-8 10" stroke="#5a7ab0" stroke-width="5" stroke-linecap="round"/>`,
  },
  'gnome-coin': {
    label: 'Pebble the Gnome: a little garden gnome with a white beard and a pointed blue hat, beside a gold coin',
    labelZh: '地精佩布尔：留着白胡子、戴蓝色尖帽的花园小地精，旁边有一枚金币',
    eyes: [[28, 32], [36, 32]],
    art: `<path d="M20 28L32 4l12 24z" fill="#4a7bd6"/>
      <circle cx="32" cy="34" r="10" fill="#f3d2c1"/>
      <path d="M22 36q10 22 20 0q-4 4-10 4t-10-4z" fill="#f4f0f8"/>
      <circle cx="28" cy="32" r="1.6" fill="${INK}"/><circle cx="36" cy="32" r="1.6" fill="${INK}"/>
      <circle cx="32" cy="36" r="2.4" fill="#e0a98a"/>
      <circle cx="52" cy="52" r="6" fill="#f2c230"/><circle cx="52" cy="52" r="4" fill="none" stroke="#c9960f" stroke-width="1"/>`,
  },
  'sprite-forehead-cut': {
    label: 'Twig the Tree Sprite: a bark-brown sprite with leafy twig hair and a small cut on her forehead',
    labelZh: '树精灵特维格：树皮棕色的精灵，长着带叶的枝条头发，额头有一道小伤口',
    eyes: [[27, 34], [37, 34]],
    art: `<path d="M22 22l-6-10M28 18l-2-12M36 18l2-12M42 22l6-10" stroke="#6a4a2a" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="16" cy="11" rx="3" ry="2" fill="#3fb27f"/><ellipse cx="38" cy="6" rx="3" ry="2" fill="#3fb27f"/><ellipse cx="48" cy="11" rx="3" ry="2" fill="#3fb27f"/>
      <ellipse cx="32" cy="36" rx="12" ry="15" fill="#a67c52"/>
      <path d="M30 26l5 1" stroke="#b3122e" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="27" cy="34" r="1.8" fill="${INK}"/><circle cx="37" cy="34" r="1.8" fill="${INK}"/>
      <path d="M28 43q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M24 48q2 4 0 8M40 48q-2 4 0 8" stroke="#8a5f3a" stroke-width="1.2" fill="none"/>`,
  },
  'swamp-abscess': {
    label: 'Murk the Swamp Thing: a dripping green swamp creature with weed hair and a red lump under one arm',
    labelZh: '沼泽怪默克：浑身滴水的绿色沼泽生物，头发是水草，一侧腋下有个红色肿块',
    eyes: [[27, 28], [37, 28]],
    art: `<path d="M16 62q-4-30 6-40 10-10 20 0 10 10 6 40z" fill="#4f7a4a"/>
      <path d="M20 22q-2-8 4-12M30 16q0-8 4-10M40 18q4-6 8-6" stroke="#3a5a34" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="27" cy="28" r="2.4" fill="#f2c230"/><circle cx="37" cy="28" r="2.4" fill="#f2c230"/>
      <circle cx="27" cy="28" r="1" fill="${INK}"/><circle cx="37" cy="28" r="1" fill="${INK}"/>
      <path d="M27 37q5 2 10 0" stroke="${INK}" stroke-width="1.5" fill="none"/>
      <circle cx="45" cy="44" r="4" fill="#d9536b"/>
      <path d="M20 54v6M44 56v5" stroke="#7cc7ff" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  'pirate-vomiting': {
    label: 'Captain Barnacle: a pale green ghost pirate in a tricorn hat with an eye patch, looking seasick',
    labelZh: '巴纳克船长：戴三角帽和眼罩的淡绿色幽灵海盗，一脸晕船的样子',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M12 24q20-16 40 0-6 4-20 4t-20-4z" fill="${INK}"/>
      <path d="M28 18l4 3 4-3" stroke="#f4f0f8" stroke-width="1.5" fill="none"/>
      <path d="M18 28v24l4-3 4 3 4-3 4 3 4-3 4 3V28z" fill="#bfe0c8" opacity=".9"/>
      <circle cx="27" cy="32" r="2.6" fill="${INK}"/><path d="M18 28l16 8" stroke="${INK}" stroke-width="1"/>
      <circle cx="37" cy="32" r="1.8" fill="${INK}"/>
      <path d="M27 41q2-2 4 0t4 0 4 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M4 58q6-4 12 0t12 0 12 0 12 0 12 0" stroke="#4a7bd6" stroke-width="2" fill="none"/>`,
  },
  'satyr-nail-puncture': {
    label: 'Barnaby the Satyr: a curly-haired satyr with small horns, lifting one hoof with a nail beside it',
    labelZh: '萨堤尔巴纳比：卷发、长着小犄角的萨堤尔，抬起一只蹄子，旁边有一根钉子',
    eyes: [[27, 26], [37, 26]],
    art: `<path d="M22 16q-6-8 0-10M42 16q6-8 0-10" stroke="#c8c0a0" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="18" r="4" fill="#6a4a2a"/><circle cx="32" cy="15" r="4" fill="#6a4a2a"/><circle cx="40" cy="18" r="4" fill="#6a4a2a"/>
      <circle cx="32" cy="27" r="10" fill="#e0b48f"/>
      <circle cx="27" cy="26" r="1.7" fill="${INK}"/><circle cx="37" cy="26" r="1.7" fill="${INK}"/>
      <path d="M28 32q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M26 40v14l-4 6M38 40v10l6 4" stroke="#8a6a4a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50 46l6 10M48 47l4-2" stroke="#9aa0a8" stroke-width="2" stroke-linecap="round"/>`,
  },
  'brownie-ear-bead': {
    label: 'Bramble the Brownie: a small brown household spirit with big ears, a shiny bead in one ear',
    labelZh: '家精灵布兰布尔：一个大耳朵的棕色小家精灵，一只耳朵里有颗闪亮的珠子',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M20 30L6 22l6 14zM44 30l14-8-6 14z" fill="#9a7050"/>
      <circle cx="13" cy="28" r="2" fill="#7cc7ff"/>
      <circle cx="32" cy="34" r="13" fill="#b08060"/>
      <path d="M20 26q12-12 24 0" stroke="#6a4a2a" stroke-width="3" fill="none"/>
      <circle cx="27" cy="32" r="1.9" fill="${INK}"/><circle cx="37" cy="32" r="1.9" fill="${INK}"/>
      <path d="M28 41q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M46 52h10M51 47v10" stroke="#a67c3d" stroke-width="2"/>`,
  },
  'echo-sore-throat': {
    label: 'Echo the Ghost: a pale lilac ghost with a striped scarf and little music notes',
    labelZh: '幽灵艾可：围着条纹围巾的淡紫色幽灵，身边飘着小音符',
    eyes: [[27, 28], [37, 28]],
    art: `<path d="M16 58V28a16 16 0 0 1 32 0v30l-5-4-5 4-6-4-6 4-5-4z" fill="#d8cce8"/>
      <circle cx="27" cy="28" r="2" fill="${DUSK}"/><circle cx="37" cy="28" r="2" fill="${DUSK}"/>
      <ellipse cx="32" cy="35" rx="2.5" ry="2" fill="${DUSK}"/>
      <path d="M16 40q16 6 32 0v5q-16 6-32 0z" fill="#ff8a1f"/><path d="M24 42v5M32 43v5M40 42v5" stroke="#f4f0f8" stroke-width="2"/>
      <path d="M52 10v8M52 10l4 1" stroke="#e9e4f0" stroke-width="1.5" stroke-linecap="round"/><circle cx="51" cy="18" r="1.8" fill="#e9e4f0"/>
      <path d="M8 16v6M8 16l3 1" stroke="#e9e4f0" stroke-width="1.2" stroke-linecap="round"/><circle cx="7.2" cy="22" r="1.4" fill="#e9e4f0"/>`,
  },
  'bog-witch-ivy-rash': {
    label: 'Ivy the Bog Witch: a witch in a mossy hat with red, blotchy forearms and a sprig of ivy',
    labelZh: '沼泽女巫艾薇：戴着长满苔藓帽子的女巫，前臂红斑点点，旁边有一枝常春藤',
    eyes: [[27, 32], [37, 32]],
    art: `<path d="M20 24l10-18 12 18z" fill="#4f6a3a"/>
      <ellipse cx="32" cy="25" rx="18" ry="4" fill="#4f6a3a"/>
      <circle cx="32" cy="35" r="11" fill="#e8d6c8"/>
      <circle cx="27" cy="32" r="1.7" fill="${INK}"/><circle cx="37" cy="32" r="1.7" fill="${INK}"/>
      <path d="M28 40q4 2 8 0" stroke="${INK}" stroke-width="1.3" fill="none"/>
      <path d="M14 54l12-6M50 54l-12-6" stroke="#e8b8a8" stroke-width="5" stroke-linecap="round"/>
      <circle cx="18" cy="52" r="1.2" fill="#d9413a"/><circle cx="22" cy="50" r="1.2" fill="#d9413a"/><circle cx="44" cy="50" r="1.2" fill="#d9413a"/><circle cx="47" cy="52" r="1.2" fill="#d9413a"/>
      <path d="M52 8q-4 6 0 10M52 12l4-2M52 16l-4-1" stroke="#3fb27f" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  },
  'ghoulberg-eye-drops': {
    label: 'Dr. Ghoulberg: a grey ghoul in thick glasses and a bow tie, holding a small bottle of eye drops',
    labelZh: '古尔伯格医生：戴厚眼镜、打领结的灰色食尸鬼，手拿一小瓶滴眼液',
    eyes: [[26, 30], [38, 30]],
    art: `<ellipse cx="32" cy="32" rx="13" ry="16" fill="#a8ac9c"/>
      <circle cx="26" cy="30" r="4.5" fill="#f4f0f8" stroke="${INK}" stroke-width="1.5"/><circle cx="38" cy="30" r="4.5" fill="#f4f0f8" stroke="${INK}" stroke-width="1.5"/>
      <path d="M30.5 30h3" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="26" cy="30" r="1.6" fill="${INK}"/><circle cx="38" cy="30" r="1.6" fill="${INK}"/>
      <path d="M27 41q5 2 10 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M26 50l6 3 6-3-6-3z" fill="#b3122e"/>
      <rect x="48" y="44" width="6" height="10" rx="2" fill="#7cc7ff"/><path d="M51 40v4" stroke="#e9e4f0" stroke-width="2"/>`,
  },
  'patchwork-suture-removal': {
    label: 'Patchwork Polly: a rag doll with button eyes, yarn hair and a row of stitches across one knee',
    labelZh: '拼布波莉：纽扣眼睛、毛线头发的布娃娃，一侧膝盖上有一排缝线',
    eyes: [[27, 24], [37, 24]],
    art: `<path d="M20 22q-6 0-6 10M44 22q6 0 6 10M22 16q10-8 20 0" stroke="#ff8a1f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="24" r="11" fill="#f3d2c1"/>
      <circle cx="27" cy="24" r="2.2" fill="#4a7bd6"/><circle cx="37" cy="24" r="2.2" fill="#4a7bd6"/>
      <path d="M26 23l2 2M28 23l-2 2M36 23l2 2M38 23l-2 2" stroke="${INK}" stroke-width=".8"/>
      <path d="M28 30q4 2 8 0" stroke="#b3122e" stroke-width="1.4" fill="none"/>
      <rect x="22" y="36" width="20" height="14" rx="3" fill="#7a9ad0"/>
      <rect x="24" y="50" width="6" height="12" rx="2" fill="#f3d2c1"/><rect x="34" y="50" width="6" height="12" rx="2" fill="#f3d2c1"/>
      <path d="M33 55h8M35 53v4M37 53v4M39 53v4" stroke="${INK}" stroke-width=".8"/>`,
  },
  'woodwose-tick-bite': {
    label: 'Hunter the Woodwose: a hairy wild man of the woods with a leafy crown and a tiny tick on a leaf',
    labelZh: '林中野人亨特：头戴树叶冠、浑身毛发的林中野人，旁边一片叶子上有只小蜱虫',
    eyes: [[27, 30], [37, 30]],
    art: `<path d="M18 22l4-8 4 6 6-8 6 8 4-6 4 8z" fill="#3fb27f"/>
      <ellipse cx="32" cy="34" rx="14" ry="15" fill="#8a6a4a"/>
      <ellipse cx="32" cy="32" rx="9" ry="9" fill="#d9b48f"/>
      <circle cx="27" cy="30" r="1.8" fill="${INK}"/><circle cx="37" cy="30" r="1.8" fill="${INK}"/>
      <path d="M28 36q4 2 8 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M22 44q10 8 20 0" stroke="#6a4a2a" stroke-width="3" fill="none"/>
      <ellipse cx="52" cy="54" rx="7" ry="4" fill="#3fb27f" transform="rotate(-20 52 54)"/>
      <circle cx="52" cy="53" r="1.5" fill="${INK}"/><path d="M50 52l-1.5-1M54 52l1.5-1M50 54l-1.5 1M54 54l1.5 1" stroke="${INK}" stroke-width=".6"/>`,
  },
  'invisible-sunburn': {
    label: 'The Invisible Man: dark glasses and a hat floating above a pink, sunburnt neck, with a bright sun',
    labelZh: '隐形人：墨镜和帽子悬浮在晒得发红的脖子上方，旁边有一轮烈日',
    eyes: [[26, 30], [38, 30]],
    art: `<path d="M16 24h32M22 24q0-10 10-10t10 10" stroke="#6b6478" stroke-width="3" fill="#6b6478"/>
      <rect x="20" y="27" width="11" height="6" rx="2" fill="${INK}"/><rect x="33" y="27" width="11" height="6" rx="2" fill="${INK}"/>
      <path d="M31 30h2" stroke="${INK}" stroke-width="1.5"/>
      <path d="M26 44h12v8H26z" fill="#ff8a8a"/>
      <path d="M18 62q0-10 14-10t14 10z" fill="#ff8a8a" opacity=".85"/>
      <circle cx="54" cy="10" r="5" fill="#f2c230"/><path d="M54 1v3M54 16v3M45 10h3M60 10h3" stroke="#f2c230" stroke-width="1.5"/>`,
  },
  'tooth-fairy-cold': {
    label: 'Tilly the Tooth Fairy: a small fairy with a pink nose and a tissue, holding a tiny tooth',
    labelZh: '牙仙蒂莉：鼻子红红的小仙子，拿着纸巾和一颗小牙齿',
    eyes: [[28, 32], [36, 32]],
    art: `<ellipse cx="16" cy="32" rx="8" ry="14" fill="#e9d8ff" opacity=".75" transform="rotate(-15 16 32)"/>
      <ellipse cx="48" cy="32" rx="8" ry="14" fill="#e9d8ff" opacity=".75" transform="rotate(15 48 32)"/>
      <path d="M22 28q10-16 20 0q-4-4-10-4t-10 4z" fill="#f2c230"/>
      <circle cx="32" cy="34" r="10" fill="#f3d2c1"/>
      <circle cx="28" cy="32" r="1.6" fill="${INK}"/><circle cx="36" cy="32" r="1.6" fill="${INK}"/>
      <circle cx="32" cy="36" r="2" fill="#ff6b81"/>
      <path d="M30 40q2 1 4 0" stroke="${INK}" stroke-width="1.2" fill="none"/>
      <path d="M48 52q0-4 3-4t3 4l-1 5-2-2-2 2z" fill="#f4f0f8"/>`,
  },
  'mini-mummy-nappy-rash': {
    label: 'Mini Mummy: a tiny bandaged baby mummy with round dark eyes and a dummy',
    labelZh: '迷你木乃伊：一个缠着绷带的木乃伊小宝宝，圆圆的黑眼睛，含着奶嘴',
    eyes: [[27, 30], [37, 30]],
    art: `<circle cx="32" cy="32" r="16" fill="#e3d7b8"/>
      <path d="M17 26l30-4M16 36l32-3M19 44l26 1" stroke="#b8a77f" stroke-width="2.5"/>
      <rect x="22" y="27" width="20" height="7" rx="3.5" fill="#2a2030"/>
      <circle cx="27" cy="30.5" r="2" fill="#f4f0e0"/><circle cx="37" cy="30.5" r="2" fill="#f4f0e0"/>
      <circle cx="32" cy="41" r="3" fill="#7cc7ff"/><circle cx="32" cy="41" r="1.2" fill="#4a7bd6"/>
      <path d="M44 46q6 4 4 10" stroke="#e3d7b8" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  },
  'wisp-conjunctivitis': {
    label: 'Glim the Will-o’-the-Wisp: a small glowing blue flame with pink, sticky eyes',
    labelZh: '鬼火格林：一团发着蓝光的小火焰，眼睛发红、有分泌物',
    eyes: [[27, 34], [37, 34]],
    art: `<path d="M32 6q14 16 12 32a12 12 0 0 1-24 0q-2-10 6-18 0 8 4 10 0-12 2-24z" fill="#7cc7ff" opacity=".9"/>
      <path d="M32 22q6 8 5 16a5 5 0 0 1-10 0q0-8 5-16z" fill="#bfe8ff"/>
      <circle cx="27" cy="34" r="3" fill="#ff9aa8"/><circle cx="37" cy="34" r="3" fill="#ff9aa8"/>
      <circle cx="27" cy="34" r="1.3" fill="${INK}"/><circle cx="37" cy="34" r="1.3" fill="${INK}"/>
      <path d="M24 31l2 1M30 31l-2 1M34 31l2 1M40 31l-2 1" stroke="#f2c230" stroke-width="1"/>
      <path d="M29 42q3 1.5 6 0" stroke="${INK}" stroke-width="1.2" fill="none"/>
      <circle cx="12" cy="50" r="1.5" fill="#7cc7ff"/><circle cx="52" cy="54" r="1.2" fill="#7cc7ff"/><circle cx="48" cy="12" r="1" fill="#7cc7ff"/>`,
  },
};

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Full <svg> markup for a case id, or '' when the case has no portrait.
export function portraitSvg(id, lang = 'en') {
  const p = PORTRAITS[id];
  if (!p) return '';
  const label = lang === 'zh-CN' && p.labelZh ? p.labelZh : p.label;
  return `<svg class="portrait-art" viewBox="0 0 64 64" role="img" aria-label="${escapeAttr(label)}">${p.art}</svg>`;
}

// Decorative red eye glow drawn over the portrait during the under-triage effect (task 13).
// A separate SVG on the same 64 x 64 grid, so CSS can desaturate the portrait without greying the
// glow. Hidden from assistive technology; styles.css keeps it invisible until .fx-under.
export function eyeGlowSvg(id) {
  const p = PORTRAITS[id];
  if (!p?.eyes) return '';
  const dots = p.eyes
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" class="glow-halo"/><circle cx="${x}" cy="${y}" r="1.9" class="glow-core"/>`)
    .join('');
  return `<svg class="eye-glow" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${dots}</svg>`;
}
