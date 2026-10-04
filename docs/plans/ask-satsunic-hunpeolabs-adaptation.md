# ASK-SATSUNIC-005 — HunpeoLabs interaction adaptation

Status: approved by human user, current task reply “apporved”, 2026-10-04.

Source verified: HunpeoLabs components/ask-hunpeolabs.tsx, its CSS module and docs/operations/ask-hunpeolabs.md; SatsunicCode Assistant.tsx and functions/src/index.ts. Optional repository indexes are stale; use DEGRADED native source evidence. No external provider success inferred.

## Implementation scope

1. Assistant.tsx: capsule with outer focus border, consistent SVG send/close icons, native dialog with bounded height and translucent backdrop, collapse/reopen retaining draft, circular launcher. Pointer down/up outside closes panel only; Escape and restored focus. IME Enter handling retained. All labels VI/EN. Preserve existing authenticated Firebase callable and truthful unavailable state; show returned content only if actual contract supplies validated content. No invented answers.
2. Scoped assistant CSS: same capsule/panel width, royal blue #163cff, navy #111c35, light/dark surfaces, safe areas, 44px minimum buttons, visible focus. Finite open/close/hide transitions on transform/opacity or clip, reduced-motion, timer cleanup. No flashing or unsolicited periodic attention hint.
3. Focused browser coverage: idle/send/unavailable/draft preservation, collapse/reopen, backdrop pointer drag guard, Escape/focus, IME, repeated toggles/unmount, 390px/desktop/light/dark, reduced motion and axe.
4. Product content review and final review/completion evidence bound to current source.

## Boundaries

No HunpeoLabs company/founder/price knowledge copied. No dependency installation, backend/schema changes, chat persistence, auth changes, paid AI activation, cloud configuration or deployment. Existing backend unavailable behavior remains honest. Suggestions/real educational answers require a separate source-backed content/API scope; not implied by adapting UI.

## Acceptance

One outer capsule border; no textarea inner focus rectangle. Full viewport-safe panel, natural reversible transitions, icons with accessible names/tooltips. Draft survives close/hide and failed send. No late callback after unmount. Existing account and callable constraints preserved. Typecheck and focused browser checks pass; explicitly disclose local-only evidence.

## Motion parity refinement — 2026-10-04
Human explicitly requests exact HunpeoLabs animation/detail parity. Approved delta: measured WAAPI capsule masks, 360ms open/320ms close, reverse from current animation frame; capsule shrink toward 56px launcher with overlap; letter hint 5s/22s/2.8s and finite nudge, disabled for reduced motion; scroll lock and cleanup. Same two UI files plus focused tests. Backend/content boundaries unchanged.
