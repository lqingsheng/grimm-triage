# 🕯️ Grimm Triage — Night Shift at St. Grimm's ER

Learn real emergency-department triage by sorting monsters. The costume is fake. The logic is real.

**▶ Live demo: [grimm-triage.vercel.app](https://grimm-triage.vercel.app/)**

**Kiroween 2026 · Costume Contest** · Built with [Kiro](https://kiro.dev) by an emergency physician.

> ⚠️ Educational demo only. Not a medical device. Never use for real patient care.

## What it does
- **Night Shift (game):** a vampire with a bleeding fang, a dehydrated mummy, an unresponsive ghost… pick the triage level, get instant feedback with the exact rule that fired. Under-triage costs extra, because that is the dangerous mistake in a real ED. Each night draws 15 monsters (3 per ESI level, none from the previous night), with vital signs and opening lines that vary on every replay. The bank has 71 cases: 61 regular monsters and 10 storyline patients.
- **Storylines:** on about half of nights, two patients from the same incident arrive a few patients apart, and the second card says so ("same incident as patient 10"). There are 5 storylines, such as a Moonlight Brawl between an apologetic werewolf and a vampire who insists on queueing with a stake in his chest, or a Cauldron Hut where a pulse oximeter reads normal in carbon monoxide poisoning. The shift report ends the story with a teaching point: triage the patient in front of you, not the story.
- **Triage Desk (calculator):** type vital signs and flags, get an ESI v4-style level with reasons and danger-zone warnings.
- **Accounts (optional):** sign in with Google or GitHub to save each night's score, see your progress on any device and appear on the leaderboard (top 50 by best single-night score). Guests play everything exactly as before; the Progress panel then shows the nights played on this device, and the Leaderboard is visible to everyone.

## Screenshots
| Triage board | Haunting effect (under-triage) | Shift report |
|---|---|---|
| ![Triage board: Grimwald the Gargoyle, patient 1 of 22](docs/screenshots/triage-board.png) | ![The Sandman under-triaged: blood drips and ESI 1 feedback](docs/screenshots/haunting-effect.png) | ![Shift report with score and missed cases](docs/screenshots/shift-report.png) |

## Run locally
```bash
npm install
npm test        # unit + property-based tests
npm start       # serves the static site
```

## Recording the demo
A dev-only Playwright script plays one night by itself and records the real app for the video.
```bash
npm install
npx playwright install chromium   # once
npm start                         # terminal 1: http://localhost:3000
npm run demo:record               # terminal 2; or: npm run demo:record -- --url <url> [--seed 87]
```
It opens the app with `?seed=87` (a fixed night with The Sandman as patient 4), triages three patients correctly, under-triages The Sandman so the haunting effect plays, fast-forwards through the rest of the night, shows the shift report and lesson, gets a provisional ESI 2 on the Triage Desk with HR, RR and SpO₂ missing, and switches to 中文 for 3 s. Every answer comes from `src/triage.js`, never a hard-coded list.

Output in `demo-output/` (git-ignored): `demo.webm` (1280x720, no audio track: Playwright records video only) and `timeline.json` with each shot's `name`, `start` and `end` in seconds from the start of the video, for subtitles and voice-over. Cut the `fast-forward` shot in editing. Record on a machine with Chinese and emoji fonts installed, or those characters show as boxes.

Without `?seed=` the app draws a random night exactly as before.

## Offline (PWA)
After the first visit the game and calculator work with no network: `sw.js` precaches `index.html`, `styles.css`, the manifest, icons and every file in `src/`. It can be installed to a home screen (`manifest.webmanifest`). All paths are relative, so it works at a domain root (Vercel) or in a sub-folder.

When you change any precached file, bump `CACHE_VERSION` in `sw.js`; the new worker installs a fresh cache and deletes the old one on activate. Adding a file to `src/` without listing it in `PRECACHE_URLS` fails `npm test`.

## Privacy
The live site counts visits with [Umami Cloud](https://umami.is), a privacy-friendly analytics service. It sets no cookies and stores no personal data.
- **Counted:** page views, country or region, time on site, referrer, and device, browser and OS type. Plus four anonymous game events, one small value each:

  | Event | Property | Example |
  |---|---|---|
  | `night-complete` | `score` when the shift report opens | `1150` |
  | `under-triage` | `step`: the ESI decision point (A–D) of the missed case | `D` |
  | `desk-submit` | `level`: the computed Triage Desk level, `P` when provisional | `2P` |
  | `lang-switch` | `lang` | `zh-CN` |
- **Never sent:** ages, vital signs, case or monster names, free text, or anything typed into the Triage Desk. `src/analytics.js` drops any other property and `test/analytics.test.js` checks it.
- **Not counted:** localhost and preview deploys (`data-domains`), browsers with Do Not Track on, and demo recordings (`?seed=`; the recorder also blocks the script).
- **Optional:** if the script is blocked (ad blockers, some networks) or you are offline, the app works exactly the same. The service worker never caches it.
- **Sign-in event:** one more event, `sign-in` with `provider` (`google` or `github`), after a successful sign-in. No user id, display name or email is ever sent to Umami.

### Accounts
Signing in is optional; the game never asks for it before you play. Accounts use [Supabase](https://supabase.com) (Auth and Postgres, Singapore region).
- **What the game stores:** your display name (a generated nickname such as "Night Nurse 4821" until you change it) and one row per finished night: score, number correct, under-triaged and over-triaged, whether a storyline appeared, and the time. Never the cases, vital signs or anything typed into the Triage Desk. Demo nights (`?seed=`) are never saved.
- **What Supabase Auth keeps:** the sign-in record it receives from Google or GitHub, which includes the provider account id, your email address and the name on that account. The game never reads, shows or shares the email; the browser keeps only the session tokens and your user id in `localStorage`.
- **Who can see what:** the leaderboard shows display names, best scores and nights played to everyone. Everything else is readable only by you (row level security).
- **Delete account:** Account → Delete account → confirm. It deletes your profile, your results and your Supabase Auth user.
- **Offline:** a result that cannot be saved stays on this device and is sent the next time you open the game.
- If `src/config.js` is empty, all of this is hidden and nothing is sent to Supabase.

## Accessibility
Target: WCAG 2.2 AA, in English and 中文.
- Every text colour, ESI badge and level-button outline meets AA contrast (`test/a11y.test.js` checks the theme tokens).
- One visible 3px focus ring; logical focus order: skip link → language → mode → level buttons → *Next patient* → the next patient card.
- The whole game, shift report and calculator work with the keyboard alone (Tab, Enter, Space).
- Buttons, inputs, portraits, landmarks and the `role="status"` feedback regions all have translated labels.
- Checked with axe-core 4.10.2 in headless Chromium in both languages, with and without reduced motion, across a full night of cases, the shift report and the calculator: 0 violations.

## Maintenance
- **Accounts database:** the schema is `supabase/migrations/0001_accounts.sql`. Run it once in the Supabase dashboard (SQL Editor → New query → paste → Run). It is one transaction and safe to run again. Its self-test stops it if the database would reject Chinese display names.
- **Managing users:** Supabase dashboard → **Authentication → Users** lists every account (provider, created, last sign-in). Deleting a user there also deletes their profile and results (foreign keys cascade).
- **Managing data:** **Table Editor → `profiles`** (display names) and **`results`** (one row per saved night). Players cannot edit or delete results themselves except by deleting their account.
- **Removing an offensive display name:** Table Editor → `profiles` → find the row (filter `display_name`) → edit the cell to a neutral name such as `Night Nurse 0000` → Save. Or in the SQL Editor: `update public.profiles set display_name = 'Night Nurse 0000' where display_name = '<the name>';`. To stop the player from using the account again, delete the user in Authentication → Users (this removes their results too).
- **Limits enforced by the database:** scores 0–1500 and consistent with the counts, 15 patients per night, at most 30 saved nights per player per 24 hours.
- YouTube statistics for the demo video are recorded every 3 hours by `.github/workflows/youtube-stats.yml` into `data/youtube-stats.json` on the branch `stats` ([raw JSON](https://raw.githubusercontent.com/lqingsheng/grimm-triage/stats/data/youtube-stats.json)); the API key is the repository secret `YOUTUBE_API_KEY`.

## How Kiro was used
- **Spec-driven development:** `.kiro/specs/haunted-er-triage/` (EARS requirements → design → tasks).
- **Steering:** product, tech, structure, and a file-scoped `clinical-safety.md` that loads only when the engine is edited.
- **Agent hooks:** run tests on engine change, review new monster cases for clinical coherence, costume + accessibility check on UI edits.
- **Property-based testing:** fast-check properties encode safety rules (e.g. a worse finding never makes a patient less urgent).
- _(Fill in as you build: what the spec changed vs vibe coding, any MCP or powers used.)_

## License
MIT
