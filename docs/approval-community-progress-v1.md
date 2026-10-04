Plan ID/version: COMMUNITY-PROGRESS-V1 / visual V3
Repository intelligence gate status: DEGRADED — one refresh attempted; CocoIndex daemon write denied; bounded source/Git/compiler/emulator evidence used under repository fallback policy
Approval status: APPROVED
Approver: Human user in current chat
Approval timestamp or task reference: 2026-10-04 user message: approved let triển khai end to end, UI UX, animation, backend, firebase, ...
Approved scope: docs/plans/community-progress-v1.md including master-spec cross-check and prototype V3; end-to-end community reviews, compensation contributions/statistics and self-reported learning progress; native dialogs/icons, restrained reduced-motion-safe animations, Firebase backend/rules/indexes and tests.
Approved paths:
- `apps/web/src/features/Companies.tsx`
- `apps/web/src/features/CompanyDetail.tsx`
- `apps/web/src/features/Salaries.tsx`
- `apps/web/src/features/CommunityContributions.tsx`
- `apps/web/src/features/CommunityModeration.tsx`
- `apps/web/src/features/Progress.tsx`
- `apps/web/src/features/Lesson.tsx`
- `apps/web/src/features/Practice.tsx`
- `apps/web/src/features/ReferenceProblem.tsx`
- `apps/web/src/features/community/**`
- `apps/web/src/hooks/useLearningActivity.ts`
- `apps/web/src/App.tsx`
- `packages/contracts/src/**`
- `packages/domain/src/community.ts`
- `packages/domain/src/compensation.ts`
- `packages/domain/src/progress.ts`
- `functions/src/community.ts`
- `functions/src/progress.ts`
- `functions/src/moderation.ts`
- `functions/src/index.ts`
- `firestore.rules`
- `firestore.indexes.json`
- `tests/unit/community.test.ts`
- `tests/unit/compensation.test.ts`
- `tests/unit/progress.test.ts`
- `tests/rules/community.test.ts`
- `tests/integration/community.test.ts`
- `tests/e2e/community.spec.ts`
- `tests/e2e/progress.spec.ts`
- `docs/**`
Constraints: Preserve unrelated work. No new external dependencies, billing enablement, production role/IAM grants, deployment, destructive datafix or external messaging. Execution/assistant remain fail-closed. No fabricated public records or verified progress. Local fixtures only in demo emulator. Production activation separately gated. Native static approval validator currently requires READY even though higher repository policy permits DEGRADED; do not forge READY or weaken validator. Tracked human approval exists; disclose this tool inconsistency.


Continuation approval — 2026-10-04: Human user requested “tiếp tực review và nâng cấp form phải đẹp không đc lệch dễ xài”, then “làm stepper nếu form quá dài”, then “form nào cần có auto complete thì auto làm auto commplete dropdown, cái nào cần manula enter thì mới manual enter”. Approved UI paths already include community/**, Companies.tsx, Salaries.tsx and tests/docs. Concrete continuation plan: docs/plans/community-form-polish.md. These requests authorize scoped form alignment, three-step navigation, draft-input protection and data-backed autocomplete. Existing production/dependency/data-contract constraints persist.

Stepper-motion continuation — 2026-10-04: human user explicitly requested a thinner connected stepper and transitions between steps. Approved plan docs/plans/community-stepper-motion.md covers the existing community hook/CSS/callers/tests. Earlier production/backend/dependency constraints persist.

Continuation approval: human requested “bỏ lưu bản nháp”. Scoped plan: docs/plans/community-remove-draft.md. Remove review draft action; preserve stored records and submission validation.

Release authorization: human requested “release lên production & commit and push to main”. Plan: docs/plans/community-production-release.md. Commit/push implemented scope and limited Hosting checkpoint per existing Hosting authorization; full backend activation remains prerequisite-gated. No billing/role/data mutation inferred.

UI continuation authorization: human requested “input, button bị lệch … làm phải cân đối consistency, flow mượt mà”. Same approved community UI scope; plan docs/plans/community-directory-balance.md. New official directory import and production rules delta pending reviewed approval; no data publication authorization fabricated.

Reviewed delta approval: user selected “Duyệt triển khai danh mục production” for docs/plans/community-directory-balance.md (11 sourced companies, create-only production import and public directory rules). New logo/contact creation flow plan docs/plans/community-company-create-flow.md pending approval.

Reviewed profile delta approval: user selected “Duyệt triển khai flow mới” for docs/plans/community-company-create-flow.md. New autocomplete/profile/logo/contact flow, private upload + moderator publication and scoped tests authorized. Production billing/API/App Check activation remains separate and unapproved.

Compact shape continuation — 2026-10-04: human directly requested “làm gọn đẹp tinh tết và theo style shape hay css giống roadmap và home page đã làm”. Concrete CSS-only plan docs/plans/community-shape-refinement.md uses verified existing Home/Roadmap shapes, tokens, density; existing approved community UI and Hosting/main publication scope persists. No backend/data/dependency activation delta.

2026-10-04 official logo continuation: human instruction “dùng logo thật của các công ty để vào” authorizes logo assets and scoped public display changes under docs/plans/community-official-logos.md. Existing Hosting/main release approval persists. No production database mutation or provider activation.
