# ACCOUNT-CHEVRON-V12

Status: awaiting human approval. Intelligence: DEGRADED; current source checked, no protected edits yet.

Root cause: AccountMenu uses font glyph ⌄ whose baseline differs from the centered14px SVG in Community. Account popover has no enter animation; Community uses180ms ease-out opacity and -4px translateY. Account already supports click toggle, Escape, outside pointer, route close and keyboard arrows.

Scope:
- apps/web/src/components/AccountMenu.tsx: replace only decorative glyph with the exact Community14px SVG/path/stroke; aria-hidden/focusable=false; retain authenticated name/photo and button/menu accessibility.
- apps/web/src/styles.css: account caret display:block/flex-shrink:0, rotate180deg on aria-expanded=true, same180ms easing as Community; account popover uses existing community-menu-enter animation and matching8px border radius/shadow/spacing; reduced-motion disables motion. Existing navbar/footer/layout unchanged. Native button toggle retained; no hover-open or account/auth/data changes.
- tests/e2e/account-v10.spec.ts: emulator evidence for SVG center/rotation, click open/close, Escape/outside/routeclose, keyboard and reduced motion; existing acknowledged bookmark/logout checks retained. Do not run synthetic fixture against live Google mode. Use separate temporary emulator-mode test server port5174, leaving Google5173 unchanged.
- docs: approval, product review, evidence/checkpoint/final review.

Validation: typecheck/build; scoped actual emulator browser test and axe, screenshot; no production deploy/provider/billing changes. Rollback only scoped SVG/CSS changes.
