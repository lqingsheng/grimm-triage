# 🕯️ Grimm Triage — Night Shift at St. Grimm's ER

Learn real emergency-department triage by sorting monsters. The costume is fake. The logic is real.

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

## How Kiro was used
- **Spec-driven development:** `.kiro/specs/haunted-er-triage/` (EARS requirements → design → tasks).
- **Steering:** product, tech, structure, and a file-scoped `clinical-safety.md` that loads only when the engine is edited.
- **Agent hooks:** run tests on engine change, review new monster cases for clinical coherence, costume + accessibility check on UI edits.
- **Property-based testing:** fast-check properties encode safety rules (e.g. a worse finding never makes a patient less urgent).
- _(Fill in as you build: what the spec changed vs vibe coding, any MCP or powers used.)_

## License
MIT
