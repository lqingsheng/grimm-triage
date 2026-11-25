# Design: Grimm Triage

## Architecture
Static single-page app. `triage.js` (pure engine) ← `app.js` (DOM) ← `index.html`. `cases.js` is data. No server.

## Engine (ESI v4 decision points)
- A: life-saving intervention / unresponsive / critical vitals → 1
- B: high risk, altered mental status, severe pain → 2
- C: count resources → 0 = 5, 1 = 4, >= 2 → check D
- D: danger-zone vitals (adult: HR > 100, RR > 20, SpO2 < 92) → 2, else 3
- Pediatric danger zones (to implement): <3 mo HR >180 RR >50; 3 mo–3 y HR >160 RR >40; 3–8 y HR >140 RR >30; SpO2 < 92 for all.
Output: `{ level, reasons[], dangerZone }`. Errors: `TypeError` with all field messages joined.

## Scoring
`scoreGuess(guess, truth)`: exact 100, ±1 = 50, else 0; under-triage subtracts 25 (floor 0). Rationale: under-triage is the clinically dangerous error.

## Game flow
Night start → plan the night → for each: render card → player picks level → reveal (badge, reasons, points, effect) → next → shift report.

**Nightly plan (task 14, `src/night.js`, pure):** `planNight(CASES, { random, avoid })` draws 3 cases per ESI level (15 per night) and shuffles them. It skips last night's ids, which `app.js` stores in localStorage under `grimm-triage-last-night`. Avoided cases come back only if a level has too few fresh ones; with 12 per level that never happens. Each drawn case is then instantiated: every ranged vital is drawn inside its `variants.vitals` range (whole numbers; temperature to 0.1 °C), and one of the story's openings is picked (its own first sentence or one of 2–3 alternatives, in both languages). One injectable `random` drives all of this; the app passes `Math.random`, and tests pass the seeded `mulberry32(seed)`.

**Score maximum:** `summarizeShift` returns `max` = 100 × cases played (1500 for a full night). The report shows each missed case's drawn vitals next to its teaching point.

## Data model (case)
`{ id, name, emoji, story, patient, expectedLevel, teachingPoint, zh, variants }` — `patient` matches the engine input (the case's typical values); `expectedLevel` is the author's intended ESI level, checked against `triage()` by a unit test. `variants.vitals` gives a `[low, high]` range for hr, rr, sbp, spo2 and tempC (and optionally pain); every value inside must give `expectedLevel` (P8). `variants.openings` lists optional `{ en, zh }` alternatives for the story's first sentence. Stories and teaching points quote thresholds, never the patient's own values.

Case bank: 60 cases, 12 per ESI level, 18 pediatric (at least 2 in each age band: < 3 months, 3 months–3 years, 3–8 years).
Portraits live in `src/portraits.js` as `PORTRAITS[id] = { label, art }` (inline SVG shapes only, `aria-label` from `label`); `test/portraits.test.js` checks every case has one.

## Haunting effects
`app.js` adds `fx-under` or `fx-correct` to `#game` after an answer and removes it on the next case; `fx-under` also puts `haunted` on `<body>` for the screen vignette. All motion is CSS keyframes. Correct answers get the candle flare (`fx-correct`).

Under-triage (`fx-under`, task 13). Decorative only (`aria-hidden`), inline CSS/SVG, no images and no gore:
- **Flicker:** a dark red overlay (`.fx-dim`) dims the panel twice in 1 s. It is an overlay, not a `filter`, so `#game` never becomes a stacking context.
- **Drips:** 12 streaks, 4–14 px wide with a glossy highlight (`DRIPS` in `src/haunt.js`). Each streak grows from the top edge, its drop falls to the bottom and a scalloped pool rises along the bottom edge. After 4 s the streaks recede to 25% opacity (0.8 s fade) so the story and vitals are readable while the player studies the feedback; the pool stays at full strength.
- **Handprint:** inline SVG on the right side, slapped on and smeared down; recedes to 25% with the drips.
- **Vignette:** fixed, full screen, dark red (`--vignette`), one pulse per second for 3 s, starting at 1.1 s after the flicker has ended, peak opacity 0.55 (`heartbeat 1s … 1.1s 3`).
- **ECG:** a trace across the top of the card, starting at 1.1 s with the heartbeat: three beats, the last one weak, then a flat line.
- **Portrait:** desaturates for about 2 s while the eyes glow red (`eyeGlowSvg()`; eye centres in `PORTRAITS[id].eyes`).
- **Escalation:** one dried stain per under-triage this night (`stainLayout(count)` in `src/haunt.js`, deterministic). Older stains grow by 14 px per later under-triage, capped at 160 px. The stains persist through the night and the shift report, and only "Start a new night" clears them.
- **Sound (optional):** OFF by default. The header "Sound effects" toggle (`aria-pressed`, stored as `grimm-triage-sound`) turns it on. `src/sound.js` synthesises three lub-dub heartbeats in step with the vignette, then a 960 Hz flatline beep, using Web Audio oscillators only (no audio files, no recordings). The master gain is 0.25 or lower, and the sound stops within 50 ms on the next case or when toggled off. The toggle is hidden when Web Audio is unavailable.

Rules:
- **Flashes (WCAG 2.3.1):** only the flicker (peaks at 0.15 and 0.55 s) and the vignette (peaks at 1.25, 2.25 and 3.25 s) change the brightness of a large area. That makes at most 2 flashes in any 1 s window. WCAG allows 3; we hold to 2 because red flashes are the riskiest kind. The vignette colour is not a "saturated red" (R/(R+G+B) < 0.8). No haunting animation loops. `test/haunt.test.js` recomputes all of this from `styles.css`.
- **Readability:** the stacking order is stains (1) < case text (2) < effects and ECG (3) < vignette (5) < level buttons, feedback and Next (6). During `fx-under` the feedback gets a near-opaque backing. Text tokens keep at least 4.5:1 contrast over `--stain`.
- **Reduced motion:** under `prefers-reduced-motion` the effect layer, vignette, ECG and eye glow are `display: none` and the portrait does not animate. The player sees only the static stains (no grow transition), the panel tint and the `.fx-note` text in the `aria-live` feedback.

## Theme tokens
`--bg --ink --blood --ecto --pumpkin --l1..--l5`. Motion only via CSS; disabled under `prefers-reduced-motion`.

## Testing strategy
- Unit tests for each decision point and every case's expected level.
- Property tests: range/explanation (P1), determinism (P2), level-1 triggers (P3), monotonic safety for high-risk (P4), SpO2 (P5), resources (P6), pediatric thresholds (P7), case variants (P8: any vitals drawn from a case's ranges give exactly its expectedLevel; if not, narrow the range, never the engine).
- Case bank (`test/cases.test.js`): size and balance, coverage of the requested presentations, range validity, openings, no quoted vital values, and a boundary grid that checks every range end and engine cut-off combination for every case (the deterministic twin of P8).
- Nightly draw (`test/night.test.js`): 3 per level, no repeats from the previous night, top-up when a level runs short, determinism with a seeded random, shuffled order, every case reachable, and no use of `Math.random`.
- Haunting effect (`test/haunt.test.js`): drip and stain layout, flash count and vignette colour parsed from `styles.css`, layer order, reduced-motion rules, eye positions, and the sound schedule run against a fake `AudioContext`.
