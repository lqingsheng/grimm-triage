---
inclusion: always
---
# Structure

- `index.html` – shell, two sections (`#game`, `#calc`)
- `styles.css` – theme tokens in `:root`; level colours `--l1`..`--l5`
- `src/triage.js` – engine: `validate`, `isDangerZone`, `triage`, `scoreGuess`, `LEVEL_NAMES`, plus display-only `hypotensionThreshold` (PALS)
- `src/shift.js` – pure `summarizeShift` for the end-of-night shift report
- `src/cases.js` – monster case bank (`CASES`), each with real vitals
- `src/app.js` – DOM wiring only
- `test/*.test.js` – unit and property tests
- `.kiro/specs/haunted-er-triage/` – requirements, design, tasks
