---
inclusion: always
---
# Product: Grimm Triage (Night Shift at St. Grimm's ER)

- Purpose: teach real emergency-department triage (ESI v4 five-level logic) to nursing/medical students and new ED staff, through a Halloween game where every patient is a monster.
- Hackathon: Kiroween 2026, category **Costume Contest** (haunting, polished UI where the spooky design serves the function).
- Author: an emergency physician. Clinical logic must stay correct; the costume is fake, the triage logic is real.
- Two modes: **Night Shift** (game: triage monster cases, score, explanation) and **Triage Desk** (calculator: enter vitals, get level + reasons).
- Every screen shows the disclaimer: educational only, not a medical device.
- Audience language: English UI first; Chinese (zh-CN) is a planned toggle.
- Analytics (Umami, task 19) must stay cookie-free, anonymous and optional (the app works the same when it is blocked or offline), and must never carry clinical inputs: no ages, vital signs, case names, free text or anything typed into the Triage Desk. Send events only through `src/analytics.js`, at most one allow-listed property each.
