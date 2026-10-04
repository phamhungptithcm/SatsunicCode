# Product Content Review — SC-FINAL local + UI delta v2

Audience: learners; primary job choose track, enter Practice and understand actual progress. Platform: responsive web VI/EN, browser navigation/forms/native disclosure. Apple platform contract not applicable; human-centered principles applied. Source of truth: catalog content review flags, Firebase acknowledgements, actual provider readiness. Current in-context evidence: 5 browser tests, axe scans and screenshots in docs/evidence. No production certification.

## Inventory

Current strings are inventoried in source: App.tsx (environment/loading/pending routes), components/SiteChrome.tsx (all route labels/menu/accessibility/brand/footer), features/Homepage.tsx and Roadmap*.tsx (track preview/actions/topic states), Practice*.tsx and CodeEditor.tsx (filters/language/editor/save/pending/error/ungraded/unavailable), Progress.tsx/Lesson.tsx (next action/content), Assistant.tsx (draft/hide/send/loading/unavailable), Account.tsx (Google-only availability/logout), i18n.tsx/catalog.ts (VI/EN). These are whole messages with matching behavior; no claims of mastered skills, accepted code, live AI or published community records. Latest delta replaces email/password/register labels with One Tap, source auth target explanation and BLOCKED_EXTERNAL; adds Community/mobile menu and footer groups/credit. Screenshots and browser checks include rendered, not only string-file evidence.

| State | Applicable evidence |
| --- | --- |
| Default/action | Track CTA routes; selected graph node; mobile menu and footer real links |
| Loading/disabled | Suspense, draft saving readonly, disabled empty assistant send |
| Empty/unknown | Track not published, search no match; no invented zero metrics |
| Success | Save ack after transaction; enrollment ack; synthetic identity distinguished in tests |
| Error/recovery | Callable unavailable, provider readiness explanation; no false AI/verdict |
| Offline/partial | Preview environment banner; partial content labels; draft not synced until ack |
| Unauthorized | Own draft requires actual session; Rules deny others; real One Tap unavailable |
| Destructive | No destructive actions in scope; logout explicitly named |

Data meaning: VERIFIED mastery absent; draft save is persistence only. Missing data is unavailable, not zero. No salary units/metrics invented. Learner draft ownership enforced by Rules; account private state keyed by UID. No auth tokens displayed.

| Principle | Status for inspected local surfaces | Evidence |
| --- | --- | --- |
| Purpose | PASSED | Direct roadmap/Practice CTA; compact primary navigation |
| Agency | PASSED | Track choice, graph/list, locale/theme, editor fallback, composer minimize |
| Responsibility | PASSED | Honest preview/ungraded/unavailable/synthetic labels |
| Familiarity | PASSED | Standard web links, disclosure, forms, menu, keyboard focus |
| Flexibility | PASSED | Four viewports, VI/EN, dark/light, native fallback |
| Simplicity | PASSED | Navbar one row, grouped Community, footer routes |
| Craft | PASSED | Thin borders/alignment; axe zero violations on tested states |
| Delight | PASSED | Preserved composer draft and directly selectable roadmap topics |

Global content/assignment/AI/interview acceptance remains BLOCKED/NOT_RUN; local principle evidence does not certify missing workflows or live OAuth.

## v3 in-context review

Navbar labels/routes unchanged; small decorative icons aria-hidden. Brand glyph is local SVG. Homepage kicker now describes roadmap/practice/interviews instead of repeating branding. Footer reduces to four essential links, brand + by HunpeoLabs, copyright and original evidence tagline. Local readiness message moved intact to a visible footer aside, not removed or falsely green. Purpose/Simplicity/Craft improved through reduced chrome; Agency/Familiarity retain native controls; Responsibility preserves readiness and preview content; Flexibility retains responsive/locale/theme; Delight preserves Ask composer. No changed data meaning/authentication. Current browser evidence is regenerated for v3; global provider readiness remains blocked.

v4 track switcher inventory: legend Choose your direction/Chọn hướng đi của bạn; six short visible discipline labels with full localized accessible names; selected title/description from real catalog; Preview/In preparation derived from content version; existing Explore roadmap/Practice actions. Native fieldset/radios preserve keyboard familiarity, checkmark adds non-color selection; locally drawn decorative SVG hidden from AT. All eight principles remain applied: direct selection/purpose, six options/agency, honest readiness/responsibility, native radios/familiarity, responsive+reduced motion/flexibility, one CTA/simplicity, icon/spacing/craft, subtle selection feedback/delight. No fake progress/data. Initial fade animation temporarily reduced contrast during axe scan; removed opacity fade, kept only slight translation with reduced-motion override.

v5 language inventory/review: English default document/metadata, persisted EN/VI choice. Localized navigation, pending routes, catalog disciplines and descriptions, difficulty labels, kickers, prerequisites, editor/helper/unavailable copy and selected track names; proper names (SatsunicCode, HunpeoLabs, Firebase, Google One Tap, Monaco) and explicit requested brand credit “by HunpeoLabs” remain names. Clearing transient messages on locale change preserves draft/source. Google-only UI explains true setup availability; no fake signed-in state. Production vs emulator banner now derives from actual config. Eight principles retain current evidence; persistence strengthens Agency/Flexibility, consistent copy improves Familiarity/Craft. Live OAuth remains untested.

## v6 current web context

Changed string/state inventory:18 localized pattern labels, set selector150/75/450, prerequisites and problem drawer, unknown progress/streak em dash, real calendar, source-reference label, original authored preview, pending solution/submission/discussion/runner notices, bookmark saved/error/auth-required state. Problem titles remain source identifiers; surrounding EN/VI content is localized. No unknown state renders fabricated zero mastery or accepted verdict.

Purpose: choose pattern then problem. Agency: native topic buttons/dialog/close, zoom and set controls. Responsibility: reference-only and unavailable states disclose actual coverage. Familiarity: standard table/tabs/keyboard dialog. Flexibility: language/theme/viewport tests. Simplicity: focused graph and right drawer. Craft: Satsunic borders/spacing plus tested contrast. Delight: direct pan/zoom and acknowledged bookmark. Current evidence: eight local browser tests and read-only live browser screenshot/axe; these principles cover implemented web states only. Full content/language review across future modules remains BLOCKED.


V7.1 approved canvas title: EN DSA Roadmap / VI Lộ trình DSA, blue outlined heading inside graph. Sidebar native details preserves reference/content availability and practice/enroll destinations. Purpose direct graph identity; Agency native disclosure; Responsibility preserves unavailable meaning; Familiarity semantic h1/details; Flexibility localized/theme styles; Simplicity removes separate header; Craft blue border/inset spacing; Delight unobstructed canvas. Current screenshot reviewed (VI desktop) and graph browser/axe test passed. Other viewports/theme disclosure not separately verified this slice.

V7.2: user-approved text-only canvas title; removed padding/border/background and explicitly inherited root Satsunic font (Inter/system fallback). Position, blue color, bilingual heading preserved. Web build exit0 and focused actual browser graph test1PASS4.0s; current screenshot visually inspected. Scope CSS only; no API/data/auth change, no new strings. Full-product readiness remains BLOCKED; not deployed. Existing eight content principles retain semantics with reduced decoration.

V7.3: human requested softer text with black glyphs/blue blurred edge. Scoped title CSS uses existing ink,opacity .88 and low-alpha2px/7px blue text glow; no box. Dark retains theme ink for legibility. Existing strings/semantics unchanged; eight-principle review retains prior scope, Craft softened typography. Web build exit0; actual graph/browser/axe test1PASS4.3s; current screenshot inspected. Local only, no deployment; whole product remains NOT_READY.

V7.4: human-approved native DSA sidebar animation. CSS260ms ease-out36px slide with180ms opacity/backdrop fade; discrete display/overlay preserve exit top-layer transition, reduced-motion disables transitions. JS/native modal Escape/focus/URL semantics unchanged; no new strings or data meaning. Agency/Familiarity preserved; Flexibility reduced motion; Craft/Delight softer transition; other principles unchanged. Web build exit0 and focused graph/open/Escape/reopen/workspace browser test1PASS9.1s. No separately measured animation-frame or reduced-motion browser evidence; implementation inspected, not full visual-motion certification. No deploy. Overall NOT_READY unchanged.

### V8 scoped product-content review
Web canvas only; inventory: EN/VI region accessible name and complete keyboard/gesture description, existing localized zoom/reset labels retained. Purpose PASSED direct graph navigation; Agency PASSED cursor/centroid anchor and reset; Responsibility PASSED no save/progress/provider claims; Familiarity PASSED wheel/pinch/native buttons; Flexibility PASSED keyboard, touch-CDP and viewport/locale browser evidence (physical trackpad/Safari NOT TESTED); Simplicity PASSED instructions in accessible description without extra visible chrome; Craft PASSED drag threshold/cancel plus axe scan; Delight PASSED direct manipulation without added synthetic inertia. Scope evidence five focused local browser tests/screenshot; no platform hardware certification.

V8: human-approved wider homepage (1440px main, balanced columns, bounded paragraph) and fixed1360px navbar. Scroll hysteresis72px/24px,240ms compact spacing/top transition, cleaned passive listener, reserved header space, reference workspace no header padding. Current typecheck/web build passed;3 focused actual browser tests passed40.6s (homepage, viewports/Monaco, navigation); added actual scroll compact/restoration and reduced-motion assertions then navigation test rerun1PASS5.0s. Desktop screenshot inspected; widths390/768/1280/1440/axe covered by existing tests. No strings/data/auth changes; Purpose/Agency/Responsibility/Familiarity preserved, Flexibility responsive/reduced motion, Simplicity balanced content, Craft spacing, Delight smooth compact nav. Scope reviewed matches plan; full-product gate remains BLOCKED. No deployment; production remains older candidate. Token/cost unavailable; memory candidates None.

V9: user-approved brand/favicon SVG copied byte-identical from Satsunic-SEO-Extension/assets/icons/mark.svg, replacing invented header glyph; decorative empty alt retains brand accessible name. HTML SVG favicon link added, no external request/dependencies/provider/data/deploy. Shared blue mark48viewBox verified. Web build exit0; navigation browser verifies favicon href,200 image/svg+xml response and loaded header image. No claim all project nav icon systems harmonized or browser tab chrome visually verified. Product semantics/eight principles unchanged; consistent Craft/Familiarity improved. Local only; full-product NOT_READY remains.

### V9 current account surface review
Changed string inventory: localized dismissed/retry cooldown notice; safe sign-out failure; existing credential error and signed-in message only bound to actual Firebase session; existing Google-only name and retry action. Concurrent unavailable WIP EN/VI retained. Web conventions, no Apple-specific controls. Purpose PASSED one Google identity flow; Agency PASSED user account chooser/retry/sign-out; Responsibility PASSED no optimistic success or cooldown promise; Familiarity PASSED provider-owned chooser; Flexibility PASSED EN/VI and explicit browser restrictions; Simplicity PASSED no alternate forms; Craft PASSED real GIS200/browser axe and unit cancellation/error coverage; Delight PASSED retained choice without auto-selection. Evidence google-one-tap-configured-v9.png and browser-results.json; live successful chooser/session/logout remains NOT TESTED, not a full-product language/provider PASS.

V9 current production in-context evidence: deployed-one-tap-v9.png and deployed-browser-results.json; source/configuration and safe unavailable semantics unchanged from scoped V9 review. Browser axe passed; actual chooser/sign-in/out remains unverified.


## ACCOUNT-V10 product content review
Changed strings/states: real profile identity/source; account menu/navigation; saved filter/loading/empty/error/limit; submission verdict/no-result; local preference/storage error; guest Google action; global safe auth failure; logout failure. Each uses paired EN/VI and current locale, English default.
Purpose: account actions and personal data. Agency: explicit bookmark acknowledgement and logout, no automatic write after authentication. Responsibility: UID ownership; no fake identity or grading. Familiarity: compact profile menu/native links. Flexibility: keyboard arrows/Escape, responsive390px, light/dark, EN/VI and reduced motion. Simplicity: existing shell reused, no new sidebar or login page. Craft: scoped colors/borders, stable-state axe passes on guest and authenticated emulator views. Delight: immediate avatar/menu access and in-place Google request.
Evidence: browser-account-v10-retest2.txt (2PASS5.6s), account-v10-menu.png visually inspected (dark390px; synthetic identity), configured GIS on localhost HTTP200. Genuine Google profile photo/account selection still NOT_TESTED_SUCCESSFULLY; private NeetCode pages not observed. Production untouched.

Review: BLOCKED for production readiness and real OAuth evidence; local scoped implementation verified. Memory candidates: None. Token usage/cost: unavailable.


## ACCOUNT-CHEVRON-V12
Human APPROVVED scoped plan. Replaced account font glyph with Community identical14px SVG; shared180ms easing, rotation180deg on open and existing community-menu-enter animation. Scoped account popover radius/shadow aligned. Existing header/footer/layout, account actions/auth/data retained. Reduced motion disables transition/animation.
Evidence: verify-account-chevron-v12.txt typecheck25unit/buildPASS; browser-account-chevron-v12.txt2PASS7.8s on separate emulator5174, leaving realGoogle5173 untouched. Browser measured avatar/caret centers <1px, open rotation, same animation, clicktoggle/outsideclose, keyboard/Escape, route navigation, reduced-motion, dark390px axe/overflow and existing saved/logout semantics. account-chevron-v12.png visually inspected, synthetic emulatoridentity notGoogleloginproof. Temporary Playwright config removed after run. No deploy. Scoped UI ready locally; full product NOT_READY and existing blockers unchanged. Token/cost unavailable; memory candidates None.

V12 strings unchanged. Purpose/Agency/Responsibility retain real account actions and data; Familiarity shares Community caret/motion; Flexibility keyboard/reduced motion/mobile; Simplicity reuses existing shell; Craft centers icon; Delight consistent180ms feedback. Current emulator browser/axe/screenshot evidence above.


REMOVE-NOTE-V13: human requested exact screenshot paragraph deletion. Removed both EN/VI muted note after DSA topic table; table Preview status/auth/action/layout/navbar/footer unchanged. Web build exit0 (evidence/remove-roadmap-note-v13.txt). Source verified exact removed strings absent; no new behavioral test needed for reversible paragraph deletion. Product principles unchanged except Simplicity removes redundant copy; Responsibility retains per-row actual Preview availability. No deploy; full-product NOT_READY unchanged. Scoped final review PASS (source and build); browser removal not separately tested. Memory candidates None; token/cost unavailable.


SIDEBAR-OUTSIDE-V14: exact user request implemented using native dialog target/bounding rectangle; backdrop click calls existing close() and clears topic URL. Inside clicks preserved; Escape retained. Browser1PASS4.1s actual local5174 (inside click/backdrop/URL/reopen/Escape), web buildPASS. Scope UI action only, no strings/layout/auth/provider/deploy. Product Agency improved, Familiarity native dismissal, Flexibility retained keyboard; other principles unchanged. Scoped final reviewPASS; full product NOT_READY. Runtime CLI unavailable, file-based evidence sidebar-outside-v14.txt/build. Token/cost unavailable; memory candidates None. Temporary test config removed.


LAYOUT-CLEANUP-V15: removed pictured progress explanation/activity note/About details in both locales; actual unknown progress/streak values retained. Enrollment action preserved in existing summary card. Shell conditionally renders existing SiteHeader/Footer everywhere except /practice/:challengeSlug. First browser run exposed old CSS hiding DSA footer; removed that selector and retested. Final actual browser1PASS3.9s covers18routes,2workspace routes, list return and removed content. Typecheck25unit/buildPASS; final CSS web buildPASS. No layout redesign/auth/provider/data/deployment change. Product Purpose/Agency preserved enrollment; Responsibility retains unknown values/Preview status; Familiarity/Simplicity shared chrome; Flexibility routes and locales; Craft/Delight consistent navigation. Source and actual browser evidence final scoped reviewPASS. FullproductNOT_READY unchanged. Temporary config removed; memory candidatesNone/token-cost unavailable.
