# HOSTING-LATEST-2026-10-04 scoped rollout candidate

Human requested completion and production release of latest main. Existing Hosting-only rollout precedent: docs/approval-hosting-ui-2026-10-04.md. Scope: frontend Hosting project satsuniccode; do not deploy Functions, Rules, indexes, database writes, IAM, billing or activate unavailable providers. Full-product release gate stays NOT_READY.

Candidate includes latest toast/assistant/selector/motion changes and a scoped cleanup correction: route cancellation clears the owned pending Assistant toast via existing setStatus cleanup. The human reports current local UI is "tốt" (good). This is general user acceptance, not proof of each desktop/mobile/timer/dialog/accessibility scenario; no detailed results invented.

Preflight: fresh verify:local passed TypeScript, 33 unit tests and web/functions builds after correction; earlier current Rules suite passed 10 local demo tests. Production build script passed target configuration/private evaluator guards. SHA256 manifest regenerated at docs/evidence/hosting-candidate.json. Current live rollback lineage read from Hosting: version e96e28b7c6f3a763. Candidate has not been deployed. Read-only live artifact and public/private boundary checks are required after an approved rollout.

Final review cycle: BLOCKED on required current in-context UI/Product Language verification. Source cancellation correction resolves the known orphaned-pending path; pending disposal/stale dismissal covered by unit tests; route effect runtime remains NOT_RUN. Browser restriction retained without bypass. Human general acceptance is recorded, but granular UI behavior and mobile/assistive technology evidence remain missing. Scope/security/data/compatibility source review found no additional issues within bounded checks. Optional indexes DEGRADED; no complete impact claim.

Rollout command once gates permit: firebase deploy --project satsuniccode --only hosting. Verify every manifest artifact and anonymous public200/private403 using scripts/verify-hosting.mjs. Read live version and record sanitized receipt. Rollback uses previous Hosting version via Console, preserving data and Git history; rollback drill NOT_RUN. No claim of full product readiness or100% toast parity.

Progress: candidate preparation and local checks complete; detailed UI acceptance and deploy/readback remain. Tokens/cost Unavailable. Memory candidates None.
