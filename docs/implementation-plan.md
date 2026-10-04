# Implementation plan SC-FINAL-M1 v1

Authorization source: user request to implement FINAL v1.2 end-to-end, beginning immediately and making reversible decisions autonomously. This is greenfield application work: no existing app, manifests, README, Firebase configuration or commits. Existing untracked governance/spec files are preserved. No claim of separately reviewed existing-system approval is made. Existing-system plan gate applies to later changes to established modules; deployment/provider provisioning remains separately restricted.

Observed: Node 25.9.0, npm 11.12.1, Java 17; fresh intelligence refresh and bounded native inventory. No reference images supplied. No target Firebase project or approved runner/Gemini credentials. New dependencies required by user stack.

Files/responsibilities: root npm workspace/strict configs; packages/domain (catalog, graph, deterministic next action, execution contracts); packages/contracts (runtime validation); functions/src (auth-derived transactional enrollment; AI fail-closed entry and provider interface); apps/web (shell/homepage/roadmap/practice/progress/account/composer); firebase rules/config (demo-only emulators, owner reads, backend writes); tests (domain, emulator rules, browser); scripts (demo-only seed/guards); docs (all requirements/evidence/blockers).

First path: demo Firebase email account → DSA catalog → enroll immutable roadmap version → active plan → read next action → practice → owner-scoped draft save/read after refresh. No accepted/mastery is generated from Run/sample/self-claim. Unavailable runner and AI yield honest errors.

Early risk probes: runner contract rejects unapproved endpoints/forged results; Yjs convergence spike with updates reordered/duplicated; Genkit and callable streaming API verified from installed SDK. Transport/whiteboard multi-user and live Gemini remain release gates until tested.

Risks: unauthorized owner changes, cross-user drafts, stale UI on account switch, offline save acknowledgements, provider quota/assessment policy. Deny default; server transitions; draft field allowlist; clear state by UID; no provider calls without approved server configuration.

Validation: strict compiler + domain negative tests + emulator Auth/Firestore/RTDB/Storage tests + independent browser contexts on demo project + responsive composer/locale/theme/keyboard checks. External integration is BLOCKED_EXTERNAL, never PASS. Rollback new files via normal reviewed Git changes; never reset unrelated WIP.
