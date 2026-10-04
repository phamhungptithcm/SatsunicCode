# Product Content Review — COMMUNITY-PROGRESS-V1

## Scope and evidence
Reviewed 2026-10-04: companies, reviews, salary insights, private contributions/moderation and learning progress. Vietnamese/English responsive web; existing SatsunicCode navy/blue design system, native form controls/dialogs, keyboard and reduced-motion support. Apple-specific platform contract: not applicable; web conventions apply.

Observed: real emulator callables persist private submissions; publication requires moderator claims. No sample public content shipped. Progress is explicitly self-reported. Assumption: approved role/level taxonomy fits the initial audience; owner validation remains advisable. Production OAuth/App Check and real cohorts NOT TESTED.

## Content inventory
`community-content-inventory.json` inventories 350 literal bilingual pairs with file/line. Dynamic values: company names and review bodies are contributor content rendered as React text; status/role/level/country/type labels use fixed bilingual maps; salary currency/period/year/count band are schema-bound; numbers use Intl.NumberFormat. Missing salary components remain unknown, not zero. Existing shared shell strings are outside this change.

## State coverage
| State | Evidence and meaning |
| --- | --- |
| Default/action | Directory/detail, salary filters, resume action, scoped form labels; desktop/mobile screenshots and real E2E |
| Loading/pending/disabled | Fetch indicators; locked in-flight mutation and own-draft hydration; moderation status remains pending until decision |
| Empty/no result/true zero | No companies/reviews, unavailable salary cohort, no progress; unavailable differs from reported zero |
| Success | Saved draft, awaiting moderation, persisted progress and withdrawal verified through callable readback |
| Error/recovery | Safe localized callable errors; validation retains input; revision conflict rejects stale mutation |
| Offline/stale/partial | Offline submit E2E preserves text; retry uses same receipt identity; salary release week displayed UTC |
| Unauthorized/forbidden | Google account CTA; moderator restriction; other-owner and forged-claim integration/rules rejection |
| Confirmation/destructive | Withdrawal confirmed; review edit removes prior public version until reapproved; reversible topic states |

## Data semantics and privacy
Self-reported reviews separate employment and interview ratings. Salary base normalizes guaranteed pay periods; recurring compensation includes actual bonus and annual vested equity, excluding sign-on/target bonus. Currency, gross/net, year and employment type never mix. Median/quartiles round; fixed cohorts need 10 distinct contributors. Releases require a new week and 10 changed contributors; withdrawal/edit suppresses a previously released affected cohort. Owner-scoped drafts and progress are private; public projection omits contributor identity. No VERIFIED learning claim.

## Mandatory Human Interface principles
| Principle | Status | Current evidence |
| --- | --- | --- |
| Purpose | PASSED | One primary contribution or resume action per surface |
| Agency | PASSED | Preview, draft, edit, appeal, withdraw and reversible progress |
| Responsibility | PASSED | Self-reported provenance, unknown amounts, moderation and privacy boundaries |
| Familiarity | PASSED | Existing colors/navigation, native controls and consistent stroke icons |
| Flexibility | PASSED | VI/EN, responsive 390px/1280px, keyboard and reduced motion |
| Simplicity | PASSED | Grouped compact fields, local filters, focused action footer |
| Craft | PASSED | Rendered desktop/mobile, scoped CSS, accessible names/focus and Axe checks |
| Delight | PASSED | Restrained dialog/hover motion with reduced-motion override; clear resume path |

## Platform fit and pattern checks
Web native dialog Escape/focus, visible labels, actionable links and aria-hidden decorative SVGs. No Apple-only expression copied. Writing/actions, feedback, consequential choices, contextual help, privacy/accounts and VI/EN accessibility checks PASSED within tested surfaces. RTL and screen-reader hardware NOT TESTED; no RTL locale supported.

## Gate results
Human principles, platform fit, business meaning, audience, natural tone, concision, action/state coverage, semantics/privacy, scoped Axe accessibility, localization expansion, terminology and in-context verification: PASSED for changed local surfaces. Evidence: `community-browser-results.json`, `community-company-desktop.png`, `community-mobile.png`, `progress-mobile.png`, integration/rules checks. The pre-existing DSA toast contrast failure is separate and blocks broader accessibility certification.

## Decision
Product Language Gate: PASSED for the approved local surfaces. Fixed: draft hydration race and misleading success notice when opening editor. Residual risks: long 18-topic mobile list, no device screen-reader validation, production identity/attestation not verified. No public data or production usability certified.


## Current form continuation — 2026-10-04
Approved follow-up: responsive form polish, stepper for long forms, autocomplete where known values exist. Current shared inventory regenerated after this continuation; all new step/continue/back/search/empty/validation strings are bilingual.

Three-step review/salary forms preserve values across back/forward navigation; final publication still requires full schema validation and explicit consent. Native validation applies only to the current visible step; future steps are disabled. Owner draft lookup locks inputs before paint. Company suggestion remains one page with recovery text for whitespace-only input. Searchable company selection uses loaded published companies and preserves load-more. Optional review role uses existing taxonomy plus explicit custom entry; industry/new name permit new values. Small finite fields use native dropdowns. Amounts, headline and experience body remain manual. Empty suggestions are a status message rather than invented options; selection is never inferred from a partial query.

Purpose PASSED: three focused steps and one primary footer action. Agency PASSED: back buttons, draft save, retained values, custom entry where valid. Responsibility PASSED: preview precedes consent; known data and unknown manual entry remain explicit. Familiarity PASSED: existing colors/icons/native controls with scoped reset of global nav/label rules. Flexibility PASSED: VI/EN, keyboard listbox and Escape, 360/390/768/1280px, dark forms, reduced motion. Simplicity PASSED: suggestions instead of repeated typing; grouped bonus/basis and separate review step. Craft PASSED: paired controls align within 1px, 44px controls, measured popup bounds and current screenshots. Delight PASSED: restrained entry translation retains readable text throughout; step titles receive focus after navigation.

All eight state categories remain covered: default/current step; loading hydration/submit; no suggestions and missing salary; saved/submitted; schema/native errors; delayed lookup/offline retry; guest/moderator access; consent/withdraw. Popup options have associated labels, keyboard selection, active descendant and scoped contrast. IME composition is preserved by ignoring navigation handling while composing; native device IME NOT TESTED.

New evidence: form-*-en/vi-390/1280.png, form-*-vi-dark.png, form-role-autocomplete-mobile.png, form-review-experience/confirm-390/1280.png, form-salary-amounts/confirm-390/1280.png and scoped browser JSON. In-context Product Language Gate PASSED for these local web surfaces. Screen-reader hardware, Safari/Firefox and production remain NOT TESTED.


## Slender connected stepper continuation — 2026-10-04
No changed wording/data semantics; 350 bilingual pairs regenerated for current line references. Milestones retain labels, current-step semantics, future-step disabling and completed-step navigation. Purpose/Familiarity/Simplicity/Craft/Delight: PASSED with the smaller connected rail and bounded frame. Agency/Flexibility/Responsibility: PASSED through retained values, focus, keyboard, reduced-motion interruption and unchanged validation/consent. All eight principles verified within current local browser scope. Typography stays fully opaque during entry; movement is supplemental to visible state. Current animation review and current screenshots/browser JSON provide in-context evidence. Product Language Gate PASSED locally; no production or hardware accessibility claim.

## Remove draft action — 2026-10-04
Current web form evidence: community-remove-draft-browser.txt and regenerated form-review screenshots. Removed VI/EN Save draft and private draft success messages; changed loading to “Đang đọc đánh giá của bạn…” / “Loading your review…” and error to “Chưa đọc được đánh giá. Đóng và mở lại form để thử lại.” / “Your review could not be loaded. Close and reopen the form to retry.” Owner lookup still protects revisions and restores previous contributions. No persisted data deleted. Complete submission remains consent-gated.
Purpose PASSED: one complete review submission path. Agency PASSED: back/close remain. Responsibility PASSED: no promise of draft saving. Familiarity PASSED: standard web buttons and review terminology. Flexibility PASSED: bilingual and responsive browser audit. Simplicity PASSED: removed secondary footer action. Craft PASSED: validation and lookup recovery preserved. Delight PASSED: connected motion unchanged and no extra interruption. Browser tests cover keyboard/mobile/dark/reduced motion and submission failure/retry; typecheck passed.

## Release candidate refresh — 2026-10-04
Current inventory regenerated from current source literal pairs after draft action removal. All eight Human Interface principles remain PASSED for the local web implementation based on fresh 5 browser workflows, bilingual/mobile/dark/reduced-motion and regenerated form screenshots. Strict submission, failure retry and owner privacy semantics preserved. Production backend semantics not certified: UI error/empty states are expected until activation. This review covers UI source and local evidence only.
