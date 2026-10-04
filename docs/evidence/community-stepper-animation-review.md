# Animation Review — slender community stepper

## Scope and environment
Mode: implement/review; approved continuation 2026-10-04, plan ../plans/community-stepper-motion.md. Review/salary dialogs, FormStepper.tsx, community.css and two hook callers. Same VI/EN web design language, motion intensity 2/10. Chromium desktop/mobile viewports 360/390/768/1280px, light/dark, keyboard/pointer, normal/reduced motion and localhost Firebase fixtures.

## Evidence
| Evidence | Class | Source and limitation |
| --- | --- | --- |
| Slender track and milestones | browser-observed | Current form-*-vi/en-390/1280 and dark screenshots |
| Forward/back direction | browser-observed | Native getKeyframes verifies +12px / -12px entry in community.spec.ts |
| Mid-flight interruption | browser-observed | Reverse cancels prior panel animation; preference change cancels active panel |
| Close cleanup | browser-observed | Closed DOM panel has zero active animations; fresh reopen works |
| Connected progress | browser-observed | Computed rail scale reaches 0.5 at middle step; same active labels and circles |
| Stable frame/focus | browser-observed | Dialog height preserved across steps; current title focus and footer visible |
| Real data workflow | browser-observed | Draft/edit/preview, offline retry, moderation, salary and withdrawal still pass |
| Resource ownership | source-verified | Cancel animation and remove media/visibility listeners on close, step change and unmount |
| Cost/fps/hardware | unavailable | No frame-time, battery, hardware compositor or real-device benchmark claimed |

## Findings and fixes
Old boxed nodes had no connector: replaced with 20px circles, 1.5px connecting track and an explicit transform progress fill, preserving 48px button height. Old direct swap changed dialog height: stepped dialogs use a bounded consistent frame, short-step footer fills the bottom and long content scrolls.

Review caught a test-only selector issue: getByRole excludes a closed dialog; cleanup assertion now inspects the closed DOM node and polls settled animation state. No product animation defect was hidden by relaxing thresholds. Current full scoped browser run passes.

## Decision and timing
Purpose: show ordered progress and spatial direction during a small number of form navigation actions. Fill and content entry 200ms, no delay, cubic-bezier(0.22,1,0.36,1). Badge color/shadow 160ms. Content enters from +12px forward/-12px back; previous panel hides immediately to avoid duplicate controls/validation. No opacity fade, scale or exit wait; all text remains at full contrast. No animation for initial hydration, hidden documents, unsupported Web Animations or reduced motion.

## Interruptibility, gesture and lifecycle
CSS rail retargets automatically. One native panel animation per active change; effect cleanup cancels it before replacement, close or unmount. Reduced-motion change and document visibility change cancel it immediately. No completion callback writes state; no timer/rAF loop, observer, subscription cache or permanent will-change. Media and visibility listeners are bounded and cleaned up. Input and submission never wait for animation. No gesture or pointer capture introduced.

## Accessibility
Labels/aria-current/completed markers remain alongside color/motion. Real 48px buttons with existing focus outlines; future steps remain disabled, prior steps are navigable. Active step title receives focus. Existing 44px fields, dropdown keyboard handling and consent semantics pass local Axe. Reduced motion makes the rail/badge static and omits panel motion; preference mid-flight tested. No flashing, persistent animation, parallax or pause control needed. Screen-reader hardware NOT TESTED.

## Performance and compatibility
Panel/rail use only transform. Badge color/background/shadow paints are limited to small nodes. Frame height is static, not animated; content remains scrollable. No transition-all, dependency or unbounded compositor promotion. Source fallback leaves usable static panels when Element.animate is absent. Tests run with real emulator network/auth, delayed hydration and offline retry. Safari/Firefox/device frame metrics NOT TESTED; recording frame rate is not application performance evidence.

## Final decision
Scoped motion/UI review PASSED with current typecheck/build and 5 browser workflows; parent production activation and prior broader baseline gates remain blocked. No open in-scope finding in executed checks. Tokens and cost Unavailable; memory candidates None.
