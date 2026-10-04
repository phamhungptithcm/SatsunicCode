# WORKSPACE-SESSION-002 — Shared account presentation

Concrete impact plan, covered by approved WORKSPACE-E2E-001 batch A account-boundary acceptance and removal of deceptive controls. User now explicitly reports authenticated workspace inconsistency.

Verified root cause: ReferenceProblem.tsx uses shared SessionProvider for draft owner, yet unconditionally renders GoogleAction. App hides SiteHeader in code workspace, removing the AccountMenu that otherwise reflects this same session. No second session store required. Intelligence DEGRADED optional indexes; bounded current source verified.

Smallest implementation: ReferenceProblem topbar renders existing AccountMenu for non-anonymous shared user. Guest GoogleAction appears only after shared Controls.ready; restoration/failed readiness must not falsely announce signed-out state. Preserve Firebase auth, browser-session persistence, provider configuration, owner keys and cloud flows. No backend/Rules/deployment changes.

Validation: emulator synthetic identity → authenticated topbar/menu, no sign-in control, refresh persistence, account navigation, logout clearing; guest sign-in action returns after readiness. Compiler and existing workspace browser regressions. This proves local shared-session rendering, not live Google OAuth or cross-origin sharing. localhost/127.0.0.1 and production origins maintain separate browser sessions.

Files: apps/web/src/features/ReferenceProblem.tsx; focused tests/e2e; task-local review/evidence. Preserve concurrent WIP.
