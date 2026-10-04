# COMMUNITY-PROGRESS-V1 — research, design and implementation proposal

Status: AWAITING_HUMAN_APPROVAL. Date: 2026-10-04 (America/Chicago).
Request: make Company Reviews, Salary Sharing and My Progress usable end to end.
Approval must identify this plan, approver, timestamp/task reference, scope and constraints in a tracked record. No application code changed by this proposal.

## Current evidence and intelligence brief

Base commit: 95d5faae2dad2b4f2520fcecebb2e8a03c77d1e9; dirty worktree preserved, including App, styles, account, roadmap, practice and toast work.
Gate initially DEGRADED. One refresh completed; CodeGraph then current/healthy, CocoIndex still stale/unhealthy. CodeGraph explore traced Shell → Pending/Progress, Progress → GoogleAction, getNextActions → requireLearner/nextActions. Critical conclusions verified against source. Generated functions/lib results excluded from implementation scope. Bounded rg/source evidence substitutes for unavailable semantic coverage; this is not a claim of complete repository analysis.

- apps/web/src/App.tsx: /companies and /salaries render Pending.
- apps/web/src/features/Progress.tsx: own activePlan subscription and callable next action, no progress management.
- functions/src/index.ts: requireLearner refuses production requests; evaluator/run/submit unavailable; nextActions receives an empty verified-progress map.
- firestore.rules: owner reads, server-only progress, community paths denied.
- docs/requirements-matrix.md AC-32–37: anonymous public review projection, moderation, replay/vote protection, salary period/tax/cohort privacy, withdraw/recompute requirements.
- docs/deployment-readiness.md records billing-off/Functions deployment restrictions and incomplete live auth. These are historical records, not refreshed cloud evidence.
- Existing test surfaces: tests/unit/domain.test.ts, tests/rules/access.test.ts, tests/e2e/learning.spec.ts, shared-layout.spec.ts, assistant-routes.spec.ts.

## Research and design decisions

Glassdoor separates contributions from published reviews and moderates before publication; public anonymity must not expose author mappings. Apply that separation, without promising absolute anonymity or verified employment:
https://www.glassdoor.com/about/trust/when-is-content-removed/
https://www.glassdoor.com/about/trust/protecting-user-anonymity/

Levels.fyi separates base, bonus and equity, and benchmarks role/location/level cohorts. Use explicit compensation components and cohorts, without copying or importing their data:
https://www.levels.fyi/offerings/data?from=home_page

Firestore Rules must authorize queries, not filter their results; Admin SDK bypasses Rules. Enforce checks inside every callable and independently in Rules:
https://firebase.google.com/docs/firestore/security/rules-query
https://firebase.google.com/docs/firestore/security/get-started

Platform: responsive bilingual web, existing white/light-gray, #163cff blue, #111c35 navy, dark theme, shared navigation and assistant. No new dashboard shell. Mockup: docs/design/community-progress-v1.html. All sample data explicitly illustrative, never production seeds.

## 1. Company Reviews

/companies: search by company; paginated directory and rating/count only from published contributions. Detail /companies/:companyId: rating distribution, reviews, filter and write action. Empty directory offers company suggestion; company names/aliases normalized and duplicates reviewed before canonical publication. No company ownership/claims introduced.

Signed-in contributor: create/edit own review, rating 1–5, employment status, role, country, year, pros/cons; preview public fields → submit for moderation → own contribution status. No names/email/contact details requested in body; confidentiality reminder. Edits unpublish old projection and return to pending. Withdrawal immediately removes projection and updates aggregates. Public IDs independent of private IDs, UID and timestamps revealing precise submission activity. User-generated text rendered as text, no HTML.

Scoped moderator: pending queue, approve/reject with reason, handle reports; authorization comes from a trusted moderator claim, never a writable user profile. Moderator provisioning remains a separate authorized operational action. Helpful votes: one per authenticated account/review, no author self-vote, deterministic private vote identity, transactional counters. Reports private and deduplicated. Rate limits and per-company contributor limits enforced server-side, idempotent request IDs with payload binding; moderation revision checks prevent stale approval/replay. Audit private, bounded, free of review body/identity in public output.

## 2. Salary Sharing

/salaries: select company/role/level/country/currency/tax basis/reporting year; show cohort median and quartiles, component definitions and sample-size band. Public API returns only approved aggregate buckets, never raw rows or ownership. Empty, suppressed, failed-load and actual zero remain distinct.

Form: base amount; monthly or annual; 12/13 pay periods for monthly entries; gross/net; currency; country; role/level; year; annual bonus and annual vested equity (optional/unknown distinct from explicit zero); one-time sign-on separate. Normalize base to annual using pay periods, keep net/gross and currencies separate; no FX conversion, no automatic gross↔net estimates. Total recurring compensation shown only with all components known; otherwise label partial. No offer letters/pay slips or salary-row public browsing.

Private submit → moderation → aggregate eligibility → revise/withdraw → recompute. Proposed privacy policy for approval: at least 10 distinct contributors per fixed cohort, broad levels/country only, no arbitrary range filters, no adjacent rollups exposing hidden cells, public count bands, rounded aggregates and weekly snapshots. Publication excludes withdrawn records; withdrawal unpublishes affected bucket immediately until a safe recompute. Recheck inference across snapshot releases, suppress changed cohorts where subtraction permits identification; if safe output cannot be established, withhold it. This reduces risk, does not guarantee anonymity. No external salary API or fabricated starting statistics. Outliers flagged for moderator review, not silently discarded.

## 3. My Progress

/progress: resume last real activity, active learning plan, saved exercises, own cloud drafts and topic checklist. /learn and /practice link into this flow without storing source in activity records. Persist explicit learning status: not started / learning / reviewed / needs review, reversible and visibly self-reported. Track last-opened topic/exercise separately; opening a page never implies completed or solved.

Read actual catalog and owned records, stable IDs/version association, server timestamps, account switching clears subscriptions/state, paginated history. No synthetic streaks, solved counts or verified mastery. Existing trusted VERIFIED records remain server-only, separate from self-reported status. nextActions must preserve verified prerequisites; a self-reported review may suggest a next reading topic but cannot unlock verified mastery. Missing evaluator appears as unavailable assessment, not zero solved. No runner implementation or arbitrary code execution within this scope.

## Data, authorization and contracts

Proposed additions (subject to approval): companies; private reviewSubmissions/ownership, moderation decisions/votes/reports; publicReviews and company aggregates; private salarySubmissions; salary aggregate snapshots; users/{uid}/learningActivity and topicStatuses. Private owner/moderator reads only; public allowlisted projections only; deny raw community collection listing. Server owns publication, moderation, counters, normalization, audit and aggregate writes. Direct client progress/verdict writes stay denied. Raw compensation and ownership never appear in public callable responses or client logs.

Callable surface: company search/suggestion, review submit/update/withdraw/vote/report, list own contributions, moderator queue/decision, salary submit/update/withdraw and public cohort lookup, record activity/update self-reported status/get progress summary. Strict Zod payloads, pagination caps/cursors, actor from auth, nonanonymous contributor, role checks, transaction invariants, resource revision and request idempotency. Separate community/progress authorization from existing requireLearner; preserve existing fail-closed execution/assistant gates. Runtime and public schema changes are explicitly within this proposed plan.

## Implementation map and sequence

1. packages/contracts/src/community.ts, progress.ts (new), index.ts exports: strict request/response schemas and versioned public projections.
2. packages/domain/src/community.ts, compensation.ts, progress.ts (new): normalization, cohort keys/suppression, status semantics, projection allowlists, recommendation logic. Keep learning.ts verified prerequisite behavior, catalog definitions unchanged.
3. functions/src/community.ts, progress.ts, moderation.ts (new), index.ts exports: authorized transactions, private/public split, idempotency, limits, moderation and aggregation. No generated lib edits. Test transport and persistence against emulators.
4. firestore.rules and firestore.indexes.json: least-privilege scoped reads, pagination/index requirements; server-only publication. Review threat model and permissions/data/API docs.
5. apps/web/src/features/Companies.tsx, CompanyDetail.tsx, Salaries.tsx, CommunityContributions.tsx, CommunityModeration.tsx (new); Progress.tsx, App.tsx, isolated community CSS, typed hooks: full user and moderation flows. Existing shell/menu/localization/toast reused, preserve ongoing WIP. Moderator route is scoped queue, not general admin console replacement.
6. Lesson.tsx, Practice.tsx, ReferenceProblem.tsx: bounded activity/resume integration; do not mark tasks solved or alter runner behavior. Roadmap links/status only if needed for approved self-reported checklist.
7. tests/unit/community.test.ts, compensation.test.ts, progress.test.ts; tests/rules/community.test.ts; tests/integration/community.test.ts; tests/e2e/community.spec.ts and progress.spec.ts (new), existing learning/layout regressions adjusted only to approved semantics.
8. docs/product-content review scoped to these modules; API/data/permissions docs; threat model, test evidence and completion report; mandatory fresh final-implementation-review cycles until pass or truthful blocked report.

No new external dependencies, billing enablement, production IAM/moderator grants, cloud deployment, destructive datafix, external messaging or data import authorized by this plan. Actual deployment configuration is a separate approved delta after live readiness is checked.

## Verification and acceptance

- Authenticated create → durable reload → moderation publish → guest read; pending/rejected invisible, projection has no UID/email/private mapping.
- Edit/withdraw race with moderation, duplicate request/changed payload, repeated helpful vote/self-vote, stale moderator revision, quota overflow; aggregates remain consistent.
- Owner A/B isolation and unauthorized direct SDK/API list/get/update/delete; forged moderator claim/profile denied; App Check production configuration reviewed without weakening gates.
- Salary 12/13 months and annual entries; net/gross/currency/year separation; missing vs zero; annual vested equity vs grant totals; sign-on excluded from recurring total; sample boundary 9/10, duplicate contributors, rare filters, subtraction across snapshots, outliers/revisions/withdrawal.
- Progress create/reload/reverse status, valid catalog versions, user switch/offline errors, resume correct route, verified state cannot be minted by clients or self-report, no false completion/zero.
- Mobile 390px/desktop, keyboard forms/dialogs/focus, EN/VI, dark theme, long text and axe; loading/empty/offline/error/pending/rejected/success states preserve inputs and announce actual durable outcomes.
- npm run typecheck; npm test; npm run build; emulator Rules and callable integration; npm run test:e2e scoped and shared-layout/account/roadmap/workspace regression. Fixture records isolated in demo project; no production seeds.

## Product language contract

Proposed examples: “Viết đánh giá / Write a review”; “Đang chờ duyệt / Pending review”; “Gửi thông tin thu nhập / Submit compensation”; “Chưa đủ dữ liệu để hiển thị / Not enough data to display”; “Đã xem lại · Tự ghi nhận / Reviewed · Self-reported”; “Tiếp tục học / Continue learning”. Full string/state inventory required during implementation, not claimed complete by this proposal.
Purpose: one primary action per page. Agency: preview, edit, withdraw and reverse status. Responsibility: moderated/public privacy distinction and honest data provenance. Familiarity: existing web forms/navigation. Flexibility: both locales, keyboard and mobile. Simplicity: progressive fields, cohort-safe filters. Craft: complete durable loading/error/recovery flows. Delight: easy resume and unobtrusive confirmation. All eight are design commitments; runtime product-language gate NOT_RUN until implementation/browser evidence.

## Risk, trade-offs and remaining blockers

Risk HIGH: sensitive compensation, public user content, authorization, concurrent aggregates. Fixed cohorts trade analytical flexibility for privacy; moderation delays publication; no fake initial catalog/reviews; empty real-data product remains usable through contribution/suggestion. New material policy choices require owner approval of this plan. Longer term: safe statistical privacy review, richer cohorts, authorized company claims and independently approved evaluator.

Production use is NOT_READY: source currently refuses production learner calls, documentation records Functions/billing and Google login gaps. After local implementation, verify live auth, deployment prerequisites, App Check, moderator ownership, quota/retention policy and exact candidate deployment under separate authorization. Do not enable billing or replace live integrations with mock success.

Approval request: approve COMMUNITY-PROGRESS-V1 including proposed moderation, privacy threshold/snapshot policy, self-reported learning semantics and listed schema/API changes. Implementation can then proceed with local end-to-end verification; production enablement stays separately gated.

Planning checkpoint: research/source inspection and mockup prepared; application implementation/tests NOT_RUN; final implementation review NOT_APPLICABLE to unimplemented proposal, successful product handoff BLOCKED pending approval. Token usage/cost unavailable. Memory candidates: None.

## Master specification cross-check

CocoIndex search eventually returned current-source matches in SatsunicCode-Master-Prompt-FINAL.md §§14–15; these sections were then read directly. Health discrepancy remains disclosed rather than declaring the semantic gate healthy.
Include review kind employee/interview with separate rating dimensions, coarse optional role/location/time, policy acknowledgement, private saved drafts, changes-requested and appeal/resubmission with reasons. Directory includes provenance, industry/country and salary link, no invented logos or verified badges. State machine: DRAFT → PENDING_MODERATION → PUBLISHED / REJECTED / CHANGES_REQUESTED; withdrawal removes visibility; appeals create auditable revision. Re-publication always checks revision and actor authority. Raw salary schema also captures experience band/employment type, bonus actual versus target and equity annualized versus total grant/vesting; incompatible components not added into cash totals. Public stats label self-reported/selection bias, window and outlier policy; size bands deliberately coarsen the specified sample-size display for privacy.

Directory claims and verified company responses are explicitly deferred from V1 because employer verification needs a separate operational policy and role-grant process; UI does not offer a broken claim action. They are remaining master-spec work, not certified as complete by these three V1 flows. Reviewed withdrawal must prevent new access and invalidate public projections/search/cache, while explaining that copies already read cannot be recalled. No arbitrary retention period invented: owner must approve retention before production release.

## Mockup visual revision — V2

Requested by human: match existing homepage and Roadmap style. Updated only docs/design/community-progress-v1.html. Source references: styles.css root tokens, homepage hero typography, DSA topic/canvas surfaces; SiteChrome brand mark. Reuses local satsunic-mark.svg; navy/royal blue, restrained editorial hero, compact 12–14px controls/content, 14px bordered cards, pale-blue status/topic chips, dotted learning map and mobile breakpoint. Added illustrative rating distribution; synthetic company metadata remains within explicit mockup banner. Labels retain private/public and self-reported/verified distinctions.
Static verification: HTML parsed, IDs unique, label/tab targets valid, local image exists. Rendered browser review BLOCKED: computer-use URL policy refused file: navigation and forbids workaround. User already has this local mockup open; reload is user-side. No app code change or implementation approval inferred from visual feedback. No browser/mobile/accessibility pass claimed. Existing implementation/production approval gates remain pending.

## Mockup interaction/composition revision — V3

Human asked for stronger taste, better content/form/button arrangement and icons. Scope: the same standalone HTML prototype only. Design-taste-website direction: SatsunicCode community/learning web surfaces; layout variance 4/10 (main read surface + compact contextual aside), motion 1/10 (no animation), density 6/10 (compact controls, editorial breathing room). Native dialog contribution forms replace always-visible forms. One primary action in main toolbar/result/resume context; secondary review/edit/report/open actions use consistent hand-authored 24px stroke SVGs, decorative aria-hidden, readable labels or icon-only accessible name/title, 44px hit targets. No icon package/dependency added.

Forms group context → content/components → preview. Native dialog Escape/focus behavior, input retained during page-session close/reopen. Bounded salary prototype demonstrates annual base using selected monthly pay periods, unknown vs zero, target bonus separate from known actual recurring total and one-time sign-on exclusion. Preview explicitly does not save/send data. Guest/auth/moderation/backend flows remain in the implementation plan, not claimed implemented. All synthetic company/review counts labeled illustrative.

Static checks passed: HTML parse, unique IDs, label/dialog/navigation references, existing local logo, icon-only names/tooltips; node --check on extracted script passed. No browser visual/mobile/axe/keyboard execution claimed; prior file URL browser-policy restriction remains. Product review: Purpose primary task hierarchy; Agency close/reopen and preview; Responsibility explicit non-persistence/privacy/money semantics; Familiarity native web dialog/form/select; Flexibility mobile CSS and text labels; Simplicity grouped fields and separate actions; Craft static integrity verified, runtime NOT_RUN; Delight easier resume and focused input without decorative animation. Runtime language/visual gates remain INCOMPLETE until in-context evidence available. No production or application changes. Token/cost unavailable; memory candidates None.
