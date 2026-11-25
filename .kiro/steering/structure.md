---
inclusion: always
---
# Structure

- `index.html` – shell, two sections (`#game`, `#calc`)
- `styles.css` – theme tokens in `:root`; level colours `--l1`..`--l5`
- `src/triage.js` – engine: `validate`, `isDangerZone`, `triage`, `scoreGuess`, `LEVEL_NAMES`, plus display-only `hypotensionThreshold` (PALS)
- `src/shift.js` – pure `summarizeShift` for the end-of-night shift report
- `src/cases.js` – monster case bank (`CASES`, 60 templates), each with real vitals and `variants` (vital ranges, alternative openings)
- `src/night.js` – pure nightly draw: `planNight`, `drawNight`, `instantiate`, seeded `mulberry32`
- `src/i18n.js` – pure English / 中文 strings table (`STRINGS[key] = { en, 'zh-CN' }`), `t()`, and translators for engine reasons and errors; case Chinese text lives in `cases.js` as `zh`, portrait labels as `labelZh`
- `src/haunt.js` – pure layout data for the under-triage effect: `DRIPS`, `stainLayout(count)`, markup helpers
- `src/sound.js` – optional Web Audio heartbeat + flatline (`playHaunt(ctx)`), off by default; no audio files
- `src/app.js` – DOM wiring only
- `manifest.webmanifest`, `icons/` – PWA manifest and original icon set (SVG + PNG)
- `sw.js` – service worker: versioned precache of the shell and every `src/` file (bump `CACHE_VERSION` when any precached file changes)
- `test/*.test.js` – unit and property tests
- `.kiro/specs/haunted-er-triage/` – requirements, design, tasks
