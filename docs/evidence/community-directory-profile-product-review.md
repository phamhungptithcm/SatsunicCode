# Product Content Review — directory and company profiles

2026-10-04, self-review. Approved plans: community-directory-balance.md and community-company-create-flow.md. Audience: Vietnamese/English web users finding an employer or submitting a missing company. React web conventions: labeled combobox/listbox, native file picker, dialog, keyboard focus, three-step form, Back/Continue/Preview/Send for review. Apple-derived principles are a human-centered reference; no Apple-platform compliance claim. Brand follows existing light/navy/royal-blue Home/Roadmap tokens.

## Context, inventory and data meaning

Current VI/EN literal and dynamic-label inventory: community-directory-profile-content.json. Includes changed labels, headings, hints, validation, loading, error, success, provenance, contact, consent, moderation and image accessible text. Metadata sources, source URLs and research date live in docs/research/vietnam-company-directory.json. Eleven technology employers with Vietnam operations are a curated directory, not a numerical ranking or endorsement. Country is work/operation location. No reviews, ratings, salaries, headquarters, phone numbers or corporate logos were invented for seeded entries. Industry values localized when known; unknown user entries retained as supplied.

An existing selection opens its detail page. New creation is offered only after all loaded-directory pages are exhausted and no matching option remains. Server canonical duplicate guard is authoritative. The new action is currently emulator-only because production private API activation is unavailable. Production directory browsing and official source links work independently. No standalone Suggest company button. Public profile requires a moderator decision. Public phone/address are explicitly business details; the submitter confirms accuracy, public availability and logo permission, and moderation asks for verification.

## State coverage

| State | Evidence and behavior |
| --- | --- |
| Default/action | One full-width labeled autocomplete, keyboard Enter selection; no adjacent action; three named steps. |
| Loading/pending/disabled | Stable initial directory skeleton; repeated loads keep cards; Preparing/Processing disables duplicate submission; upload callable bounded to 30 seconds. |
| Empty/no result | No-match message describes loaded data; no invented choices, zero scores or ranking; new-company choice only when whole directory known. |
| Success | Visible directory status after profile send; pending moderation explicitly stated; preview/publication verified in emulator. |
| Error/recovery | Directory retry avoids false account blame; whitespace, bad phone/URL/logo rejection; entered business values retained on retry; canonical mutation/upload IDs reused. |
| Offline/stale/partial | Existing cards preserved during reload; remaining pages suppress creation; upload/schema errors retain fields; no production-create promise. |
| Unauthorized | Public browse anonymous; contribution needs learner sign-in; private logo owner/moderator only; moderator controls trusted claims. |
| Confirmation/cleanup | Preview then consent; Back revises without submission; close discards unclaimed private upload and cleans object URLs; claimed logos cannot be removed by uploader. |

## Mandatory Human Interface principles

| Principle | Status | Current implementation evidence |
| --- | --- | --- |
| Purpose | PASSED | Find/select employer first; only missing companies enter profile flow. |
| Agency | PASSED | Keyboard selection, Back/close, optional website, visible consent; values persist across steps. |
| Responsibility | PASSED | Official provenance scoped to metadata; business contact declaration; private upload; moderator publication; production activation limitation explicit. |
| Familiarity | PASSED | Existing brand tokens, web combobox/dialog/file input, named buttons and headings. |
| Flexibility | PASSED | VI/EN first step at four widths; contact/preview mobile and desktop; dark/reduced-motion and keyboard checks. |
| Simplicity | PASSED | One search control; three short groups; one primary footer action; no draft button. |
| Craft | PASSED | Current screenshots and browser geometry/Axe; paired inputs align; file picker matches actual --surface/--line/--ink tokens; logo size fixed. |
| Delight | PASSED | Connected slim stepper, short directional movement, opaque text, focus restoration, stable loading and reduced-motion fallback. |

Accessibility and locale evidence is Chromium on localhost, not screen-reader hardware, device IME, Safari or Firefox. New public media/client CORS and real Google/App Check identity remain NOT TESTED on production. Exact validation results and screenshot references are in community-directory-profile-review.md; failed iterations are retained there. Token usage/cost unavailable. Memory candidates: None.

## Compact shape continuation

Home/Roadmap source shapes verified: 14px shells, 12px controls, thin neutral borders, royal-blue actions, 16px layout gap. Purpose/Agency/Responsibility/Familiarity/Flexibility/Simplicity/Craft/Delight remain verified by the current inventory and responsive in-context screenshots. Redundant legend numbers removed visually while connected stepper remains. Stable 600px viewport-bounded dialog, 44px targets, 16px mobile input text, keyboard/reduced-motion preserved. Active native fields remain above sticky footer on focus and resize (390/1280 direct reproducer); five current browser workflows pass. Production wording now promises only available directory selection. No draft-save action or new backend behavior.
