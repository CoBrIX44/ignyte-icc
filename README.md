# PitchUp

A women-first cricket development prototype. Record cricket sessions, understand your entered plan, and share selected milestones through a fictional club. All seeded people, activity, and club content are explicitly demo data. No real pilot, partnership, or team contribution is claimed.

## Run locally

Requires Node 20.19+ or 22.12+ (tested with Node 24).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. The API runs on port 3001. Both bind to localhost. For a built local preview, run `npm run build` then `npm start` and open http://127.0.0.1:3001.

## What works

- Cricket-specific logging for bowling, batting, fielding, strength, and recovery.
- Data persists in `data/pitchup.json`; the server reads it again after restart.
- Weekly counts, daily activity chart, separate bowling totals, and editable personal goals.
- Deterministic plan comparison, explicitly labelled rule-based. No AI inference or health prediction.
- Private-by-default sessions and private reflections.
- Independent coach-measurement access and public/club milestone publication.
- Server-side response projection: public viewers cannot fetch private records or export them; demo coaches only get opted-in measurements, never private notes.
- Simulated coach review, local cheers, one plan-based challenge, reporting/hiding posts, export, and deletion.
- English interface and an optional Hindi short training summary (not full localization).
- Mobile layout, labelled form controls, keyboard-accessible native dialogs, and reduced-motion support.

## Deliberate boundaries

This is a single-athlete, local demonstration. Anyone using this local app can switch demo perspectives. It is **not production authentication**, a real multi-user social network, or a secure place for sensitive athlete information. Reports are saved locally; there is no real moderation team. No private location is collected. Titles and metadata can reveal personal information; the sharing preview names the fields being published.

No LLM integration, injury assessment, readiness scoring, automatic workload progression, live data feeds, real coaches, real clubs, or validated performance improvement is claimed. Numeric input caps are input-sanity limits, not medically safe workload thresholds. User-entered plans are not validated prescriptions. Missing activity is unknown, not evidence of rest.

Fonts are self-hosted with their package licences. No activity data or font request is sent to an external service during normal use.

## Verification

```sh
npm test
npm run build
npm run test:e2e
```

The browser check requires a Playwright Chromium installation and `npm run dev` running. It tests persistence, publication/revocation, privacy projections, validation, coach review, mobile overflow, and browser errors. API tests use a separate temporary data directory and do not modify the app's local demo records. Browser tests remove the session they create.

## Before a real deployment

Replace the perspective switch with real authentication and organization membership checks; add per-user storage, authorization tests, audit and retention controls, moderation operations, and consent processes. Conduct women-led usability research and have qualified cricket professionals review any coaching logic. Re-check the competition rules before publishing the repository or submitting. Never turn fictional demo activity into a traction claim.
