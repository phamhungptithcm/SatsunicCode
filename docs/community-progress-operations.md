# Community and progress — local operation and production boundary

The approved implementation connects `/companies`, `/companies/:id`, `/salaries`, `/progress`, `/community/contributions` and claim-gated `/community/moderation` to Firebase callables and Firestore. No production deployment was performed.

## Local use
Run `npm run emulators` in one terminal and `VITE_FIREBASE_ENV=emulator npm run dev -w apps/web -- --port 5183` in another. Emulators use demo-satsuniccode: Auth 9099, Firestore 8080 and Functions 5001. The existing Google-test server on 5173 is preserved. Test identities are synthetic emulator fixtures, never production accounts. The product retains Google sign-in; synthetic password identities exist only in tests.

Company suggestion → moderator approval → company page → private review draft/preview → submit → moderator publication. Salary submission follows the same approval workflow; public statistics remain unavailable until the privacy release conditions hold. Own contributions support revision-checked edits, appeal and withdrawal. Learning status and last real lesson/practice activity persist privately; they do not certify execution or grading.

## Data/API boundaries
`changeCommunity`, `listCommunityContributions`, `getOwnCommunityContribution`, `changeLearningProgress`, `getLearningProgress` derive actor identity from Firebase Auth. Community moderator permission is a trusted server-issued custom claim. Non-emulator calls require App Check and COMMUNITY_PROGRESS_ENABLED=true. Raw submissions, receipts, helpful votes, reports, private mappings and audit records are API-only. Rules deny client writes to public projections and learning records.

Public review IDs differ from canonical private contribution IDs. Public projections contain no owner UID/email. Reports show moderators current public review context and cannot resurrect an already withdrawn review. Request receipts bind payload and owner, with per-actor quotas; transactions enforce revision/concurrency guards. Helpful votes are unique per actor/review and forbid self-votes.

Salary cohorts are fixed company/country/role/level/currency/tax basis/year/employment buckets. At least 10 distinct approved contributors are required; counts use bands, monetary values round. A fresh release requires a new week and at least 10 distinct changed contributors. There is no scheduled release: moderation triggers evaluation. A cohort scan beyond 250 rows suppresses publication pending a future approved scalable aggregate design. Withdrawal/edit immediately suppresses affected published statistics. No currency conversion, range filtering, automatic outlier removal or individual salary rows are public.

## Verification
`npm run verify:local`: typecheck/build and 46 unit tests passed. Local emulator integration: 4 passed. Rules: 3 new plus 10 existing isolated regressions passed. Scoped browser: 5 passed, including offline retry, mobile/dark/Axe, keyboard/native dialogs, VI/EN and persisted learning resume. Broader existing browser suite: 9 passed and 4 failed; see evidence report. Temporary isolated copy of original rules tests was removed after execution; original tests unchanged.

## Production activation delta — requires separate approval
Read-only cloud check: billing disabled; Cloud Functions API SERVICE_DISABLED. Before activation, approve billing/API activation and cost budget, client App Check initialization and provider registration (`apps/web/src/firebase.ts` is outside this approved edit set), production moderator provisioning, callable flag, retention/abuse operating policy, deploy rules/indexes/functions/hosting and verify authenticated live workflows plus rollback. OAuth/live claims/attestation/deployed source equivalence remain NOT TESTED. Keep callables fail-closed until prerequisites pass. Never populate production with emulator fixtures.

Rollback: disable COMMUNITY_PROGRESS_ENABLED first; revert approved deployment to previously verified rules/functions/hosting versions. Preserve private submissions/audit history; no destructive data removal is part of rollback. Index readiness and existing rules compatibility require deployed readback. Production dashboards, alerts, log retention and spend monitoring have not been configured.

## Known limits
Repository intelligence DEGRADED: structural source/Git/compiler/tests used, optional semantic daemon unavailable. The static approval validator requires READY despite documented DEGRADED fallback; tracked human approval exists and the validator inconsistency remains disclosed. Full application release remains blocked by prior Assistant selector, Roadmap label assertion and DSA toast contrast regressions; no unrelated runtime/UI fixes were made. Build reports existing large Monaco/main chunks. No new external dependency, billing enablement, deployment, production role grant, commit or push occurred.

## Latest authorized Hosting checkpoint — 2026-10-04
After user requested production release and commit/push main, source a7ba31e was pushed and Hosting456e5bbba002024b deployed. Current receipt: docs/evidence/community-production-release.json and live browser evidence: docs/evidence/community-production-browser.json. This supersedes earlier "no production deployment" only for Hosting; functions/rules/indexes and backend activation remain unchanged and BLOCKED. Billing remains disabled, Functions API disabled. Company public directory currently receives permission denied until approved rules deploy. No real contributions or moderation fixtures created in production. Full end-to-end feature readiness remains NOT_READY.
