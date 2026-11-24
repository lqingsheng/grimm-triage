---
inclusion: always
---
# Tech

- Plain HTML + CSS + vanilla JavaScript ES modules. No framework, no build step, no backend.
- Deploy as a static site (Vercel or GitHub Pages). Must work offline after first load (PWA is a spec task).
- `src/triage.js` is a **pure function** module: no DOM, no randomness, no dates. All UI lives in `src/app.js`.
- Tests: `node --test` for unit tests and `fast-check` for property-based tests. Run `npm test` before finishing any task.
- Accessibility: keyboard reachable buttons, `aria-live` feedback, respect `prefers-reduced-motion`, colour is never the only signal (always show the level number).
- Keep dependencies at zero for runtime; dev dependencies only for tests.
