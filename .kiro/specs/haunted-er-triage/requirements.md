# Requirements: Grimm Triage

## Introduction
A spooky, educational web app that teaches five-level ED triage. Players triage monster patients whose stories map to real vital signs; a calculator mode applies the same engine to typed-in values.

## Requirement 1: Triage engine
**User story:** As a learner, I want a correct, explainable triage level so that I learn the real decision points.
1. WHEN a patient object is valid THE SYSTEM SHALL return a level from 1 to 5 and at least one reason.
2. WHEN AVPU is U, OR the patient needs an immediate life-saving intervention, OR SpO2 < 85, OR RR < 8, OR HR < 40, OR SBP < 70 THE SYSTEM SHALL return level 1.
3. WHEN none of requirement 1.2 applies AND (a high-risk complaint, AVPU V or P, new confusion, or pain >= 7) THE SYSTEM SHALL return level 2.
4. WHEN 2 or more resources are expected AND vitals are in the danger zone THE SYSTEM SHALL return level 2; otherwise level 3.
5. WHEN exactly 1 resource is expected THE SYSTEM SHALL return level 4; WHEN 0, level 5.
6. IF any input is missing or out of range THEN THE SYSTEM SHALL throw a TypeError naming the field.
7. THE SYSTEM SHALL never return a less urgent level when a finding is made worse (monotonic safety).
8. WHEN age <= 8 THE SYSTEM SHALL use pediatric danger-zone thresholds.

## Requirement 2: Night Shift game
**User story:** As a student, I want to triage monsters and get instant feedback so that practice is fun.
1. THE SYSTEM SHALL show one monster at a time with story, emoji/art and vital signs, flagging abnormal vitals.
2. WHEN the player picks a level THE SYSTEM SHALL reveal the correct level, the reasons, and points (exact 100, off by one 50, under-triage −25 extra).
3. THE SYSTEM SHALL show a shift report at the end: score, number of under- and over-triages, and the cases missed.
4. THE SYSTEM SHALL offer at least 60 cases covering every level at least 12 times, with at least 12 pediatric cases, and draw 15 per night (3 per level) in shuffled order.
5. WHEN a case is under-triaged THE SYSTEM SHALL play a haunting effect (screen flicker, blood-drip) that respects reduced-motion settings.
6. WHILE a night is in progress THE SYSTEM SHALL keep one visible stain per under-triage, and clear them when a new night starts.
7. THE SYSTEM SHALL keep effect sound off until the player turns it on.
8. WHEN a night starts THE SYSTEM SHALL avoid the cases of the previous night.
9. WHEN a case appears THE SYSTEM SHALL draw its vital signs inside the case's safe ranges, AND the shift report SHALL show the vital signs the player saw.
10. THE SYSTEM SHALL show an "ESI v4 in 2 minutes" lesson in the shift report, below the missed cases, as a collapsible section that is closed by default AND open WHEN the night had at least one under-triage. The lesson SHALL contain the four decision points (A–D), what does and does not count as a resource, a danger-zone vital-sign table built from the engine's thresholds, the decision point behind each missed case with a one-line count, a note that the numeric level-1 cut-offs are teaching simplifications, and its source. It SHALL be fully translated, keyboard and screen-reader accessible, free of animation, readable at 360 px, and never covered by the haunting stains.
11. THE SYSTEM SHALL offer inline help on the Triage Desk for the judgement fields (pain score, expected resources, high-risk complaint, need for an immediate life-saving intervention, new confusion or lethargy): a help button next to each field opens a short panel under it. The expected-resources help SHALL include a checklist that fills the number field, built from the same resource lists as the shift-report lesson. The help SHALL be fully translated, keyboard and screen-reader accessible, free of animation, readable at 360 px, available offline, and free of copyrighted figures or handbook text.
12. WHEN heart rate, respiratory rate, systolic blood pressure, SpO2 or temperature is not measured on the Triage Desk THE SYSTEM SHALL accept it as missing, with an optional reason (refused, agitated or uncooperative, no equipment, measurement failed, other), AND SHALL apply decision points A and B to the measured values only, never let a missing value trigger level 1 on its own, return a provisional ESI 2 at decision point D when HR, RR or SpO2 is missing, and show a warning that lists every missing vital sign with "Measure as soon as possible and re-triage." The game's cases SHALL always have all five vital signs.
13. THE SYSTEM SHALL include a developer-only demo recorder, `scripts/record-demo.mjs`, run with `npm run demo:record -- --url <url>` (default `http://localhost:3000`, served by `npm start`), that plays one night of the real app by itself in Playwright Chromium and records a 1280x720 video (`recordVideo`, English UI, sound toggle on, reduced motion off) to `demo-output/demo.webm`, following a fixed shot list with human-like pauses of about 1.5 to 3 s and slow typing: (1) the title screen, then the night shift starts; (2) three patients triaged correctly; (3) one patient under-triaged by 2 or more levels so the haunting effect plays; (4) the shift report with the "Learn ESI v4" lesson open, pausing on the missed case and its step tag; (5) the Triage Desk with the expected-resources help open and two resources ticked, HR, RR and SpO2 cleared, resources set to 2, and the provisional ESI 2 result and warning; (6) the UI in Chinese for 3 s, then English again. Every answer SHALL be computed by the script from the triage engine and the case data, never hard-coded. WHEN the page URL has `?seed=<whole number>` THE SYSTEM SHALL draw that seed's night (seeded draw, ignoring and not saving the previous night) so the recording is deterministic; WHEN it has no seed THE SYSTEM SHALL behave exactly as before. The recorder SHALL write `demo-output/timeline.json` with each shot's name and start and end time in seconds from the start of the video. Playwright SHALL be a dev dependency only, never loaded by the app or the service worker, and `demo-output/` SHALL be git-ignored.

## Requirement 3: Triage Desk calculator
1. THE SYSTEM SHALL accept age, AVPU, HR, RR, SBP, SpO2, temperature, pain, expected resources and three flags.
2. WHEN submitted THE SYSTEM SHALL show the level badge, reasons and a danger-zone warning.
3. IF input is invalid THEN THE SYSTEM SHALL show a friendly error without crashing.

## Requirement 4: Costume (UI)
1. THE SYSTEM SHALL use a coherent haunted-hospital theme: fog, candlelight, level colours, monster art.
2. THE SYSTEM SHALL meet WCAG AA contrast for text and be fully keyboard operable.
3. THE SYSTEM SHALL work on phones (>= 360 px wide) and desktops.

## Requirement 5: Safety and language
1. THE SYSTEM SHALL show the disclaimer "Educational demo only. Not a medical device." on every screen.
2. THE SYSTEM SHALL offer an English / 中文 toggle for all UI text.
3. THE SYSTEM SHALL work offline after first load (PWA).
