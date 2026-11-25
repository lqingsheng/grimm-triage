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
4. THE SYSTEM SHALL offer at least 60 cases covering every level 12 times, with at least 12 pediatric cases, and draw 15 per night (3 per level) in shuffled order.
5. WHEN a case is under-triaged THE SYSTEM SHALL play a haunting effect (screen flicker, blood-drip) that respects reduced-motion settings.
6. WHILE a night is in progress THE SYSTEM SHALL keep one visible stain per under-triage, and clear them when a new night starts.
7. THE SYSTEM SHALL keep effect sound off until the player turns it on.
8. WHEN a night starts THE SYSTEM SHALL avoid the cases of the previous night.
9. WHEN a case appears THE SYSTEM SHALL draw its vital signs inside the case's safe ranges, AND the shift report SHALL show the vital signs the player saw.

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
