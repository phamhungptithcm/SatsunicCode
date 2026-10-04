# ADR 002 — Provider readiness and fail-closed boundaries

No approved target project, model budget/API credential or isolated runner exists. Emulator-only app commands are implemented; deployed learner callables reject at backend before any data mutation. Assistant onCallGenkit exists and validates auth/schema, but throws unavailable before inference. Provider module not callable and not wired until transactional quota, trusted assessment restrictions, bounded context/cancellation/privacy review pass. No client direct model fallback.

Code runner interface has no eval/shell/public demo fallback. Editing-language templates do not advertise executable runtime support. CRDT evidence is an isolated real Yjs test, never described as Firebase collaboration. Default RTDB/Storage deny all resources pending scoped protocol.

This allows honest independent development without secrets/billing/production effects. It does not satisfy live AC-49/64, sandbox AC-15 or collaboration AC-19. Those blockers remain in matrix and release gate.
