---
inclusion: always
---
# Structure

- `index.html` – shell, two sections (`#game`, `#calc`)
- `styles.css` – theme tokens in `:root`; level colours `--l1`..`--l5`
- `src/triage.js` – engine: `validate`, `isDangerZone`, `triage`, `scoreGuess`, `LEVEL_NAMES`, plus display-only `hypotensionThreshold` (PALS)
- `src/shift.js` – pure `summarizeShift` for the end-of-night shift report
- `src/cases.js` – monster case bank (`CASES`), each with real vitals
- `src/i18n.js` – pure English / 中文 strings table (`STRINGS[key] = { en, 'zh-CN' }`), `t()`, and translators for engine reasons and errors; case Chinese text lives in `cases.js` as `zh`, portrait labels as `labelZh`
- `src/app.js` – DOM wiring only
- `test/*.test.js` – unit and property tests
- `.kiro/specs/haunted-er-triage/` – requirements, design, tasks
