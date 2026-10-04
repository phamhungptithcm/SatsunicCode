# Slim connected stepper and linked transitions

Approval: human user explicitly requested “làm stepper thanh mành hơn và đẹp hơn animation đẹp hơn có liee kết giữ các step co transition” on 2026-10-04. Continuation of approved community UI; no backend/dependency/production scope.

Intelligence: current gate DEGRADED; use current FormStepper/CSS/callers, compiler and scoped browser evidence. Existing optional semantic-index limitation persists.

Observed: current stepper is three bordered button boxes without a connector. Form steps switch immediately and the dialog changes height with each stage. Shared hook owns step validation/focus; review and salary callers preserve inputs and backend guards.

Change: replace boxes with small circular milestones, a 1–2px connecting track and a blue progress fill. Keep 44px hit targets, readable labels, current-step semantics and completed-step navigation. Use 200ms directional transform-only content entry; preserve full text contrast and never wait for animation before input/navigation. Keep a consistent bounded frame for stepped dialogs and place short-step footer at its bottom, while long contents scroll. Leave company suggestion unchanged.

Motion contract: forward content enters from +12px, back from -12px; rail fill retargets via explicit transform transition. Content animation owns cancellation/cleanup and has no completion-state callback; rapid reversals, unmount, hidden document and preference changes cancel it. Reduced motion renders final states immediately. Browser without Web Animations uses static content. No new library, permanent will-change, fade, scale, route transition or delayed submission.

Files: community/FormStepper.tsx, community/community.css and two hook callers in Forms.tsx; proportional E2E assertions and documentation. All within existing approved paths. Risks: sticky footer/focus with a fixed bounded frame; connector alignment at mobile widths; cancellation during fast navigation. Verify VI/EN, 360/390/768/1280px, dark, popup bounds, keyboard focus, retained inputs, rail fractions, interrupted forward/back animation, reduced-motion mid-flight, unmount and real workflows. Typecheck/build; current product and final review.
