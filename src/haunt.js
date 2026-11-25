// Layout data for the under-triage haunting effect (task 13).
// Pure module: no DOM, no randomness, no dates. It returns markup strings and numbers; src/app.js
// inserts them and styles.css ("Haunting effects") does all the animation.
//
// Drips: 12 streaks with varied widths. Each streak grows from the top of the game panel, then its
// drop falls to the bottom edge and joins a pool there (nothing fades out).
// Stains: one dried stain per under-triage this night. Older stains grow as more are added, so the
// panel gets visibly bloodier through a bad shift. app.js clears them at "Start a new night".

// x: left edge in % of the panel, w: width in px (4..14), len: streak length in px, d: delay in s.
export const DRIPS = [
  { x: 3, w: 6, len: 90, d: 0 },
  { x: 11, w: 12, len: 150, d: 0.3 },
  { x: 19, w: 4, len: 60, d: 0.12 },
  { x: 27, w: 9, len: 120, d: 0.45 },
  { x: 35, w: 14, len: 180, d: 0.05 },
  { x: 44, w: 5, len: 75, d: 0.38 },
  { x: 52, w: 10, len: 140, d: 0.2 },
  { x: 60, w: 7, len: 95, d: 0.55 },
  { x: 68, w: 13, len: 165, d: 0.1 },
  { x: 76, w: 4, len: 70, d: 0.42 },
  { x: 84, w: 11, len: 130, d: 0.25 },
  { x: 92, w: 8, len: 105, d: 0.6 },
];

export const dripsHtml = () =>
  DRIPS.map(({ x, w, len, d }) => `<span style="--x:${x}%;--w:${w}px;--len:${len}px;--d:${d}s"></span>`).join('');

// Stain sizes in px: a new stain starts at STAIN_BASE, grows STAIN_GROWTH for every later
// under-triage, and stops at STAIN_MAX so a disastrous night never buries the case card.
export const STAIN_BASE = 56;
export const STAIN_GROWTH = 14;
export const STAIN_MAX = 160;

const frac = (v) => v - Math.floor(v);
const round1 = (v) => Math.round(v * 10) / 10;

// Positions follow the R2 low-discrepancy sequence, so stains spread over the panel instead of
// piling up in one spot, and the same night always looks the same for the same count.
export function stainLayout(count) {
  const n = Number.isInteger(count) && count > 0 ? count : 0;
  return Array.from({ length: n }, (_, i) => {
    const size = Math.min(STAIN_BASE + STAIN_GROWTH * (n - 1 - i), STAIN_MAX);
    // Irregular blot: four border-radius percentages between 35 and 65.
    const r = [0.41, 0.67, 0.29, 0.83].map((k) => Math.round(35 + 30 * frac(0.5 + (i + 1) * k)));
    return {
      x: round1(4 + 92 * frac(0.21 + i * 0.7548776662)), // % from the left
      y: round1(4 + 92 * frac(0.63 + i * 0.5698402910)), // % from the top
      size,
      rotate: Math.round(360 * frac(i * 0.381966)),
      radius: `${r[0]}% ${100 - r[0]}% ${r[1]}% ${100 - r[1]}% / ${r[2]}% ${r[3]}% ${100 - r[3]}% ${100 - r[2]}%`,
    };
  });
}

export const stainsHtml = (count) =>
  stainLayout(count)
    .map((s) => `<span class="stain" style="left:${s.x}%;top:${s.y}%;--size:${s.size}px;--rot:${s.rotate}deg;border-radius:${s.radius}"></span>`)
    .join('');
