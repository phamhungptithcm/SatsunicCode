# Form review and upgrade — 2026-10-04

## Result and scope
Local UI continuation: Company Suggestion, Company Review and Salary Sharing forms. Approved by the three current user instructions, tracked in ../approval-community-progress-v1.md and ../plans/community-form-polish.md. No new dependency or backend contract.

Review and salary now use Context → Details/Amounts → Review/consent. Back/step navigation keeps entered values. Each step validates visible fields; missing amounts cannot advance. Private review draft can be saved without complete narrative; publication still validates all fields and consent. Company suggestion remains one page.

Autocomplete: company picker searches loaded published records, new-name/industry suggestions use those records, optional review role uses existing role taxonomy. New names/industries/custom roles remain manually enterable. Small finite choices remain native selects; currency amounts and narrative remain manual. Keyboard Arrow/Enter selects, first Escape closes the popup, and no-match status permits custom entry only where allowed. No fabricated catalog, external search or hidden public data query.

## Findings, fixes and review cycles
Cycle 1: shared label/input margins offset input/select pairs and long labels; draft lookup had a pre-paint editing gap. Fixed scoped margins, subgrid row alignment, shrinkable columns and synchronous hydration lock. Delayed 800ms owner lookup regression proves disabled → loaded → editable state and preservation of the newly typed headline.

Cycle 2: after stepper/autocomplete steering, global nav margins/padding leaked into the stepper and entry opacity reduced text contrast during fast interaction. Fixed scoped nav reset, stable text opacity with translation-only animation, and popup direction/height constrained between dialog title and footer. Selected options remain visible with keyboard scrolling. Bonus and its basis are adjacent.

Cycle 3: complete current form diff reviewed. Whitespace-only company input now produces an actionable message, and pending suggestion input is locked. No-match autocomplete has status semantics rather than an empty listbox with non-option children. Final scoped checks and native validation/consent/backend workflow pass; no known open defect in executed local checks. Review is self-review, not independent production certification.

## Evidence and limits
Current browser report: community-browser-results.json. Five browser workflows pass; the main workflow covers 24 form/locale/viewport context combinations (3 forms × 2 locales × 4 widths), details/confirm mobile and desktop screenshots, dark forms, Axe, reduced motion, 44px targets, paired alignment within 1px, dropdown bounds, custom fallback, whitespace recovery, required field blocking, retained back-navigation data, delayed hydration, offline retry and actual emulator moderation/publication/withdrawal.

Current typecheck/web/functions build pass; 46 unit tests passed during the continuation. Backend integration/rules are unchanged and retain previous 4/13 passing evidence, not a new production claim. Existing four broader baseline failures remain outside this scope. Browser checked: Chromium. Device screen-reader, hardware IME, Safari/Firefox, live identity/attestation and production NOT TESTED.

Intelligence DEGRADED: current source/Git/compiler/browser evidence used; optional semantic daemon unavailable. The READY-only static approval validator inconsistency persists; direct tracked human approval covers these UI files. Worktree is dirty with broader approved implementation and prior WIP. No commit/push/deploy.

Rendered runtime report: ../../.ai/local/community-form-task-report.txt. Scope review: PASSED once current executed checks are recorded. Overall community production delivery remains BLOCKED under the separate activation plan. Token usage, actual cost and API-equivalent cost: Unavailable. Memory candidates: None.


## Current slender-stepper continuation
A later approved UI continuation replaces boxed steps with connected milestones and adds directional transitions, consistent dialog height and cancellation/reduced-motion handling. Current typecheck/build and 5 browser workflows passed again. See community-stepper-animation-review.md; current UI runtime review is updated to the complete candidate. Production constraints remain unchanged.
