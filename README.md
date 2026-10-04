# SatsunicCode by HunpeoLabs

React + TypeScript + Vite + Firebase learning/interview platform under development, implementing `SatsunicCode-Master-Prompt-FINAL.md` FINAL v1.2 only. This checkpoint is an emulator-only DSA learning slice, not a release candidate.

## Run locally

Use Node 22.12+ (Functions target Node 22), npm, Java17 for pinned Firebase CLI14. Dependencies are pinned with npm lockfile. Java21/CLI15 migration and dependency audit remediation are required before release.

```sh
npm ci
npm run build -w functions
npm run emulators
```

Once all five demo emulators are ready, in another terminal:

```sh
GCLOUD_PROJECT=demo-satsuniccode FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed
npm run dev
```

Open http://127.0.0.1:5173 . `/settings` shows Google One Tap readiness; real Google login is BLOCKED_EXTERNAL until staging OAuth configuration exists. The browser suite uses a guarded test-only synthetic emulator identity to exercise `/roadmaps/dsa`: enroll → `/progress`: continue → `/practice/peak-requests`: edit/save draft → refresh/read back. Draft saving is explicit in this checkpoint; autosave and unsaved-navigation protection remain pending. Opening Monaco uses local bundled assets, not a CDN. Sign-out/account switch clears the old UI state. Emulator data is temporary when emulators stop; persistent emulator export/import pending.

Homepage track picker changes the destination and explanation for all six disciplines. Only DSA has preview content (3 nodes, 1 lesson, 1 challenge). Five other tracks are honestly marked in preparation. Company/Salary/Projects/Interview routes are placeholders, not working workflows. No community contribution or accepted result is seeded.

Ask Satsunic composer is fixed and centered on the homepage. Hide/reopen preserves text. Sending establishes anonymous emulator identity and reaches real Functions callable, which rejects unavailable Gemini configuration. No simulated AI message/history. Code submission likewise fails unavailable without approved isolated runner.

## Validate

```sh
npm run verify:local
# Stop existing emulators first for the separate rules wrapper:
npm run test:rules
# With demo emulators running and seeded:
npm run test:e2e
```

`npm run verify` includes a fail-closed release gate and currently fails because full acceptance/provider/content/operational requirements remain unmet. A successful local build does not make this product production-ready. See `docs/test-evidence.md` and `docs/next-session.md`.

No real Firebase project/provider configuration is accepted in this checkpoint. Do not deploy, switch project IDs, use another HunpeoLabs Firebase project, enable billing/IAM or paste secrets into chat. Dedicated staging/provider setup requires owner authorization; steps are tracked in `docs/provider-readiness.md`.

Production target: `satsuniccode` (explicit `.firebaserc` production alias, no default deploy target). Registered Firebase Web App and public SDK config are prepared in ignored `apps/web/.env.production.local`; Google OAuth web client/domain verification is still blocked. `npm run dev` uses demo emulators; production build uses the explicit production config. No deploy performed. Do not run seed against production. Account login is only Google One Tap; no email/password or anonymous product login. English is default, with persisted Vietnamese/English selection.

### Current scoped production checkpoint

Live partial UI: https://satsuniccode.web.app/roadmaps/dsa . Firebase project satsuniccode, Firestore asia-southeast1, billing off.450 public reference metadata records are inventory, not450 runnable reviewed exercises. Google One Tap, sandbox and Gemini production readiness remain blocked; see docs/provider-readiness.md and docs/next-session.md. For local emulators use a dedicated writable TMPDIR and ensure its firebase/storage/blobs directory exists; do not seed emulator fixtures into production.

