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
Night start → shuffle cases → for each: render card → player picks level → reveal (badge, reasons, points, effect) → next → shift report.

## Data model (case)
`{ id, name, emoji, story, patient, expectedLevel, teachingPoint }` — `patient` matches the engine input; `expectedLevel` is the author's intended ESI level, checked against `triage()` by a unit test.

## Theme tokens
`--bg --ink --blood --ecto --pumpkin --l1..--l5`. Motion only via CSS; disabled under `prefers-reduced-motion`.

## Testing strategy
- Unit tests for each decision point and every case's expected level.
- Property tests: range/explanation (P1), determinism (P2), level-1 triggers (P3), monotonic safety for high-risk (P4), SpO2 (P5), resources (P6). Add P7 for pediatric thresholds.
