# 🕯️ Grimm Triage — Night Shift at St. Grimm's ER

Learn real emergency-department triage by sorting monsters. The costume is fake. The logic is real.

**▶ Live demo: [grimm-triage.vercel.app](https://grimm-triage.vercel.app/)**

**Kiroween 2026 · Costume Contest** · Built with [Kiro](https://kiro.dev) by an emergency physician.

> ⚠️ Educational demo only. Not a medical device. Never use for real patient care.

## What it does
- **Night Shift (game):** a vampire with a bleeding fang, a dehydrated mummy, an unresponsive ghost… pick the triage level, get instant feedback with the exact rule that fired. Under-triage costs extra, because that is the dangerous mistake in a real ED.
- **Triage Desk (calculator):** type vital signs and flags, get an ESI v4-style level with reasons and danger-zone warnings.

## Run locally
```bash
npm install
npm test        # unit + property-based tests
npm start       # serves the static site
```

## Offline (PWA)
After the first visit the game and calculator work with no network: `sw.js` precaches `index.html`, `styles.css`, the manifest, icons and every file in `src/`. It can be installed to a home screen (`manifest.webmanifest`). All paths are relative, so it works at a domain root (Vercel) or in a sub-folder.

When you change any precached file, bump `CACHE_VERSION` in `sw.js`; the new worker installs a fresh cache and deletes the old one on activate. Adding a file to `src/` without listing it in `PRECACHE_URLS` fails `npm test`.

## Accessibility
Target: WCAG 2.2 AA, in English and 中文.
- Every text colour, ESI badge and level-button outline meets AA contrast (`test/a11y.test.js` checks the theme tokens).
- One visible 3px focus ring; logical focus order: skip link → language → mode → level buttons → *Next patient* → the next patient card.
- The whole game, shift report and calculator work with the keyboard alone (Tab, Enter, Space).
- Buttons, inputs, portraits, landmarks and the `role="status"` feedback regions all have translated labels.
- Checked with axe-core 4.10.2 in headless Chromium in both languages, with and without reduced motion, across a full night of cases, the shift report and the calculator: 0 violations.

## How Kiro was used
- **Spec-driven development:** `.kiro/specs/haunted-er-triage/` (EARS requirements → design → tasks).
- **Steering:** product, tech, structure, and a file-scoped `clinical-safety.md` that loads only when the engine is edited.
- **Agent hooks:** run tests on engine change, review new monster cases for clinical coherence, costume + accessibility check on UI edits.
- **Property-based testing:** fast-check properties encode safety rules (e.g. a worse finding never makes a patient less urgent).
- _(Fill in as you build: what the spec changed vs vibe coding, any MCP or powers used.)_

## License
MIT
