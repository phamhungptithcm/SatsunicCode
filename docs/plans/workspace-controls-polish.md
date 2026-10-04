# WORKSPACE-CONTROLS-003 — Control and motion polish
Status: APPROVED by human user in current task, 2026-10-03. See .ai/local/workspace-controls-approval.md.

Current source inspected after DEGRADED intelligence gate: ReferenceProblem toolbar mixes Unicode icons, default bordered buttons and redundant visual weight. AccountMenu session fix preserved. Existing draft state/undo, hints, fullscreen, language, result input and execution-unavailable behavior verified from source. Concurrent untracked worktree; preserve unrelated edits.

Concrete preview: docs/design/workspace-controls-preview.html. Own Satsunic white/light-gray/navy/royal-blue system. Compact outline SVG icons with common 24px geometry, 1.7px strokes; 9px corner control radius, balanced icon/label spacing; quiet utility controls, clear primary action. Keep native labels and focus. Animation intensity 2/10, visual intensity 3/10, density 7/10: 160ms hover/focus, 100–160ms press, 180ms tab indicator, one 220ms bookmark response. No looping/bouncing, fake loading or animation during editing/drag. Reduced motion removes transform/transitions.

Implementation files:
- New workspace/WorkspaceIcon.tsx: small static SVG icon vocabulary, decorative aria-hidden, no dependency.
- ReferenceProblem.tsx: icons for back/prev/next/expand, hints/reset/undo/editor toggle, tests chevron and Run/Submit; existing handlers and copy preserved; labels remain visible.
- workspace/CloudDraftControls.tsx: same icon geometry for sync/recovery, keep states/CAS intact.
- BookmarkButton.tsx only optional workspace-specific presentation, existing non-workspace uses unchanged.
- styles.css: scope to workspace; token colors/dark/focus/disabled; mobile wrapping and same-size targets; short CSS transform/opacity transitions.
- Focused browser test/evidence and product/final review.

No auth/provider/Rules/backend/data/runner changes, no content rewrite, no dependencies. Execution remains unavailable; Run/Submit never animate fictional work or success. Preview tab interaction only demonstrates visual state, no content switch claim. Demo account clearly sample, no real session.

Acceptance: consistent icon/button hierarchy, purposeful interruptible motion; original labels/actions/keyboard/disabled semantics preserved; light/dark 390/1440 screenshots, reduced motion, mobile bounds, axe, keyboard, draft reset/undo and sync regressions; compiler/build. Eight-principle Product Language Gate and final review required for implementation. Preview is reviewable direction, not implemented product.

## Approved user steering — compact editor toolbar
Human explicitly requested one/two rows and icon controls with hover tooltips in current task. Consolidate language/status, four utility actions and expand into same toolbar; remove redundant Draft 1 and separate range row, retaining pointer/keyboard separator. Desktop one row, mobile at most two; private cloud sync status remains separately truthful. Icon controls retain labels for assistive technology, native titles and keyboard-visible tooltips. No draft/backend/auth scope change.
