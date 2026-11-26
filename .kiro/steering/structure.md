---
inclusion: always
---
# Structure

- `index.html` – shell, two sections (`#game`, `#calc`)
- `styles.css` – theme tokens in `:root`; level colours `--l1`..`--l5`
- `src/triage.js` – engine: `validate`, `isDangerZone`, `triage`, `scoreGuess`, `LEVEL_NAMES`, plus display-only `hypotensionThreshold` (PALS); HR, RR, SBP, SpO2 and temperature may be `null` (not measured), see clinical-safety rule 7
- `src/shift.js` – pure `summarizeShift` for the end-of-night shift report, plus `decisionPointFor` (triage result → ESI step A–D) and `stepSummary`
- `src/deskhelp.js` – pure inline-help markup for the Triage Desk judgement fields, and `countResources` for the resource checklist (reuses the lesson's resource lists)
- `src/lesson.js` – pure "ESI v4 in 2 minutes" lesson markup for the shift report, built from the engine's danger-zone thresholds
- `src/cases.js` – monster case bank (`CASES`, 61 templates), each with real vitals and `variants` (vital ranges, alternative openings)
- `src/night.js` – pure nightly draw: `planNight`, `drawNight`, `instantiate`, seeded `mulberry32`
- `src/i18n.js` – pure English / 中文 strings table (`STRINGS[key] = { en, 'zh-CN' }`), `t()`, and translators for engine reasons and errors; case Chinese text lives in `cases.js` as `zh`, portrait labels as `labelZh`
- `src/haunt.js` – pure layout data for the under-triage effect: `DRIPS`, `stainLayout(count)`, markup helpers
- `src/sound.js` – optional Web Audio heartbeat + flatline (`playHaunt(ctx)`), off by default; no audio files
- `src/analytics.js` – optional, cookie-free Umami events: `track(name, props)` with an allow-list of four events, one property each; no-op without `window.umami`, with `?seed=` or Do Not Track
- `src/app.js` – DOM wiring only
- `manifest.webmanifest`, `icons/` – PWA manifest and original icon set (SVG + PNG)
- `sw.js` – service worker: versioned precache of the shell and every `src/` file (bump `CACHE_VERSION` when any precached file changes)
- `scripts/record-demo.mjs` – dev-only Playwright demo recorder (`npm run demo:record`); its pure helpers live in `scripts/demo-helpers.mjs`. Never imported by the app or `sw.js`
- `test/*.test.js` – unit and property tests
- `.kiro/specs/haunted-er-triage/` – requirements, design, tasks
