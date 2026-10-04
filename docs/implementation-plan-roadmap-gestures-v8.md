# ROADMAP-GESTURES-V8 — pending approval

Task: user request for natural multi-point trackpad/mouse chart navigation, 2026-10-03 America/Chicago. Status AWAITING_PLAN_APPROVAL. V7 header plan remains independently pending; no assumed approval or production deployment.

Observed source: DsaRoadmap uses one pan ref and independent zoom/offset state. It ignores gestures starting on nodes, lacks wheel/pinch handlers, does not track multiple pointer IDs or lost capture, and zoom buttons change scale around origin. Canvas already has touch-action:none. No database/auth impact.

Intelligence DEGRADED: stale CodeGraph/index, CocoIndex health failure; bounded DsaRoadmap/CSS/test reads. All uncommitted work preserved.

Implementation scope: new useGraphViewport hook encapsulates atomic {x,y,scale}, nonpassive wheel listener scoped to canvas, RAF-coalesced movement; DsaRoadmap consumes handlers and viewport; CSS scoped cursor/user-select/overscroll/focus only; regression tests and current evidence docs. No new dependency, provider, backend, rules or production write.

Interaction contract:
- Two-finger trackpad scrolling pans X/Y; browser pinch emits ctrl+wheel and zooms at gesture point (also support WebKit gesture events where provided, avoid double application).
- Wheel alone pans vertically; Shift+wheel pans horizontally; Ctrl/Command+wheel zooms at cursor. Do not guess mouse vs trackpad from unreliable delta thresholds. Mouse drag background pans; middle-button drag also pans; primary-click node still opens drawer.
- Touchscreen one-finger drag, two-pointer pinch plus centroid translation. Starting on node can become a drag; threshold suppresses only ensuing drag click, not keyboard activation.
- Maintain point under cursor/centroid during zoom; bounded scale0.3–1.6, normalized wheel deltaMode pixel/line/page, reset/fit control, no inertia added beyond native trackpad momentum. Pointer cancel/lost capture/unmount cleanup, no stale gesture jump after finger lifted.
- Native +/- remain usable and zoom at canvas center. Keyboard focused canvas: arrows pan, +/- zoom,0 reset; ignore input/select/dialog shortcuts. Localized short accessible interaction instructions. Respect native page gestures outside canvas.

Tests: point-anchor/bounds math; browser wheel pan, ctrl-wheel anchor, pointer pinch, transitions2→1, cancellation, drag vs node click, keyboard/control consistency, no page zoom interception outside canvas; Safari/browser validation where available. Physical trackpad testing must be labelled NOT TESTED unless actual hardware input observed (synthetic events alone insufficient). Typecheck/build and existing DSA drawer/browser regressions. No production deploy until reviewed candidate authorization.

Reviewable interaction prototype: docs/design/roadmap-gestures-v8.html. Static local independent design artifact; no provider calls, product persistence, auth or deployed app modifications. Review visual and interaction contract before protected implementation.
