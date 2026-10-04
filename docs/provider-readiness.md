# Provider readiness — 2026-10-03

No real Firebase project ID, region approval, provider access or spend authority was supplied. Only `demo-satsuniccode` is authorized/configured locally. No billing/API/IAM/project/DNS or production deployment was changed. Never paste provider credentials into chat.

| Capability | Environment | Runtime/API | Credential mechanism | Status | Exact next step |
|---|---|---|---|---|---|
| Auth | Local demo | Firebase JS 12.19.0; email/password + anonymous | Emulator synthetic identity | IN_PROGRESS | Execute browser sign-in/account-switch tests; Google/verification/reset still pending |
| Firestore | Local demo | Admin 14.5.0 / Rules | Emulator only | IN_PROGRESS | Execute owner/negative tests and enroll/draft readback |
| RTDB | Local demo | deny default | Emulator only | IN_PROGRESS | Verify deny tests; then implement scoped server ACL and CRDT transport |
| Storage | Local demo | deny default | Emulator only | IN_PROGRESS | Verify deny tests; upload domain not implemented |
| Functions | Local demo | Functions 7.4.0; Node 22 | Emulator only | IN_PROGRESS | Browser command test; staging disabled in code until reviewed |
| App Check | None | onCall enforcement outside emulator | Approved reCAPTCHA Enterprise site setup | BLOCKED_EXTERNAL | Owner provides dedicated staging target + attestation setup; test real invalid/valid tokens |
| Gemini | None | Genkit/@genkit-ai/google-genai 1.42.0; callable Genkit wrapper compiles | Server Secret Manager; never VITE | BLOCKED_EXTERNAL | Owner selects allowed dedicated staging/project/region/API and spend budget; configure secret outside chat; implement/test quotas, assessment restrictions and cancellation before enabling |
| Code execution | None | CodeExecutionProvider; unavailable implementation only | Server-held approved provider auth | BLOCKED_EXTERNAL | Owner approves isolation/runtime/retention/cost/callback contract; implement approved adapter and hostile-code smoke |
| Email | None | Optional, not in core | Server secret, later | NOT_STARTED | Keep absent; no real emails sent |

Official documents checked: [callable Genkit](https://firebase.google.com/docs/functions/oncallgenkit), [Gemini model catalog](https://ai.google.dev/gemini-api/docs/models), [Yjs provider separation](https://docs.yjs.dev/getting-started/a-collaborative-editor). Runtime APIs are verified against installed TypeScript types. Model catalog currently lists stable Flash choices but project availability/data terms/quota are unknown: no production model ID selected or called. The isolated `gemini-provider.ts` is not exported as a callable and has no policy authority.

No live provider PASS. Emulator != live Firebase/Gemini/runner/App Check. No fallback to public Judge0 endpoints or browser eval. Dependency audit findings also block release (see test evidence).

## Confirmed Google One Tap scope

User confirmed Google One Tap on-page; alternate login UI removed. `apps/web/src/google-one-tap.ts` prepares official GIS → Firebase signInWithCredential and rejects demo/emulator targets. It is intentionally dormant. BLOCKED_EXTERNAL: owner must identify approved Firebase staging project, configure Google provider and public OAuth web client ID, consent screen, allowed origin/domain; then connect reviewed non-demo config and test real chooser/FedCM, dismissal/retry, token/session/authorization. Do not supply secrets in chat. Current synthetic browser identities are emulator evidence only.

## Production target owner request — satsuniccode

Verified via authenticated CLI: project satsuniccode ACTIVE. Existing WEB app list was empty; registered SatsunicCode web app 1:295420145391:web:3c6214c32e10c00acab51a successfully. Public SDK config downloaded to ignored apps/web/.env.production.local (no Admin/Gemini/OAuth secrets). .firebaserc production alias satsuniccode, local alias demo-satsuniccode. Dev remains emulator; production build explicitly uses real web config. No deploy, billing, IAM, DNS, production database write or real sign-in performed.

Read-only Auth config GET admin/v2/projects/satsuniccode/config returned HTTP404; Google provider/client/domain not verified. Do not infer enabled Auth or Google login from web-app registration. Owner action: initialize Firebase Authentication, enable Google only and provide public OAuth web client ID + authorized production domain. API Identity Platform initialization is billing-conditioned; not invoked. One Tap adapter now wired in Account only when real config+public client ID available, no email/password/popup/redirect/anonymous login. Backend remains fail-closed outside emulator; full product not production ready.

## Authorized production infra v6

Owner selected asia-southeast1 Singapore and explicitly kept billing off, authorized Hosting/Firestore deployment in available limits. Firestore API enable operation completed; list databases empty before creation; created (default) Firestore Native STANDARD in asia-southeast1 successfully, freeTier true. No existing data overwritten/migrated. Billing readback false. Functions/Genkit/managed runner production cannot be deployed on current no-billing target; keep blocked. Auth404 persists. All planned collections deny-by-default; do not create fake feature data to populate schemas.

## v6 deployed boundary

Hosting live version f9160636113d0189 verified by104 artifact hashes and read-only browser. Firestore Singapore free-tier default database, Rules/index publication and450 public reference records verified. Billing remains false. Google Auth config GET404 and current Console account unavailable: BLOCKED_EXTERNAL, owner needs authorized Auth setup/Google provider/public Web Client ID and authorized origins. Functions/Genkit/isolated production runner remain BLOCKED_EXTERNAL under billing-off choice. Production Auth, AppCheck, quota, streaming/cancellation and collaborative transport are not certified. CLI deploy succeeded; separate gcloud Hosting/Rules readback403 limits source-level audit.

V8 gestures have no provider dependency or billing impact; production hardware/browser verification and rollout pending. Existing Auth/runner/AI blockers unchanged.

V9 current read-only Console refresh: project satsuniccode now visible; Spark no-cost; Authentication Get started (not initialized). Provider permission note visible; ability to mutate Google provider not yet proven. Plan GOOGLE-ONE-TAP-V9 pending approval; no Auth initialization/provider/domain/OAuth secret access or Hosting deployment performed in this task. Public Web Client ID absent; live login still BLOCKED_EXTERNAL/NOT TESTED.

## GOOGLE-ONE-TAP-V9 current checkpoint — 2026-10-03 America/Chicago

Human approved V9. Basic Firebase Auth initialized successfully through Console on Spark. Google is sole enabled provider. Existing authorized domains localhost/satsuniccode.firebaseapp.com/satsuniccode.web.app verified. Auto-created OAuth Web client belongs to295420145391 project; added exact https://satsuniccode.web.app JavaScript origin, existing firebaseapp/local origins preserved; OAuth client saved toast observed. Audience External/In production observed without publishing-status change. Billing API readbackfalse. No IAM/Identity Platform upgrade/billing/DNS changes, no client secret read/copied. Public Client ID stored only in ignored production env and compiled public browser config. Admin Auth config/client metadata API read403 with current gcloud identity; actual UI evidence used, no fabricated API readback.

Integration: official GIS singleton bounded15s loader with retry, abort-safe pending effects/late credentials, one exchange at a time, strict satsuniccode/client-prefix guard; official Google ID credential→Firebase signInWithCredential, awaited browser-session persistence, onAuthStateChanged session. Google-only prompt/manual retry, safe dismissal/error/sign-out state and disableAutoSelect. Current official GIS docs mark use_fedcm_for_prompt deprecated/ignored; removed option and skipped/display moment dependence, no inferred prompt-display or sign-in-success. No alternate login.

Validation: verify:local passed typecheck,25 current unit tests, web/Functions builds (includes concurrent independent WIP tests). Eight adapter unit tests mock GIS/Firebase and explicitly do NOT prove live OAuth. Local production build on allowed http://localhost:5000 loaded real GIS200; actual in-app browser reported FedCM NetworkError retrieving token. Successful live Google credential exchange/Firebase sign-in/session/account switching/logout and real-user ownership workflow NOT TESTED. Do not mark full integration PASS. Final focused browser regression result recorded separately below. Existing dependency audit/full-product blockers persist. No Hosting deployment performed by V9.

Review cycles: initial typecheck blocked by concurrent CodeEditor syntax; concurrent edit repaired it, no unrelated source revert by V9. Browser regression hit dual-logo strict-selector issue; verify all existing logos complete+positive naturalWidth. An initial intrinsic-width26 expectation was incorrect (SVG intrinsic150), corrected to actual image validity. Existing unavailable copy changed concurrently; aligned test to actual VI Work-in-progress text. These changes preserve product semantics and no test skip/mock live success.

## V9 Hosting rollout — 2026-10-03 America/Chicago

Human separately approved Hosting deployment. Published live version111ec9bc1f127456 to https://satsuniccode.web.app (receipt evidence/hosting-google-one-tap-v9-release.json). Only Hosting deployed: no Functions/Rules/indexes/database writes/billing/IAM/DNS. Billing readback200/false.

Fresh preflight verify:local passed strict typecheck,25 unit tests and web/Functions build; current public SDK/client production build guarded. Postdeploy all19 candidate artifact hashes match live; anonymous public reference200/private user403. Read-only deployed browser test passed4.3s: homepage/18-node graph/drawer/workspace/axe/Google-only configured account page, GIS script present, no email/password or emulator requests, no page errors. Screenshot evidence/deployed-one-tap-v9.png is actual live account UI, not an authenticated account or Google chooser proof.

Actual in-app production GIS prompt returned FedCM NetworkError retrieving token; no account selected or credential exchange/signed-in UID/logout verified. Live login remains NOT_TESTED_SUCCESSFULLY/BLOCKED_EXTERNAL. Hosting/configuration success does not certify OAuth success, full product readiness, grader/AI/runner/collaboration. Pending user/browser-dependent next step: open live settings in supported normal browser, choose own Google account, verify actual Firebase session then sign-out. Do not replace One Tap with popup/password/anonymous fallback.


## ACCOUNT-V10 — existing shell reused
Human approved ACCOUNT-V10; latest steering restricts changes to content and the existing account slot. SiteChrome navbar/footer and Shell are reused, with no new shell/sidebar. One Tap starts after Firebase auth restoration on entry; browser/FedCM may still suppress its display. Guest Sign in link and dedicated login content removed. Actual Google profile avatar/name appear in the existing account slot; menu links to profile, existing progress, saved problems, submissions, settings and logout. Saved/submission reads are UID-scoped with existing Rules, acknowledged data only, 50-item bound, honest loading/empty/error states. Settings persist local preferences; no new profile/database schema or production writes.
Local typecheck, 25 unit tests and web/functions builds passed (verify-local-v10.txt). Initial 3 browser tests passed (5.9s): emulator account workflow and actual GIS HTTP200 on configured localhost; genuine Google OAuth remains NOT_TESTED_SUCCESSFULLY. Additional regression verification is recorded in browser-account-v10.txt. Production remains V9; V10 has not been deployed. Billing stays off. Full product NOT_READY; no fake execution/AI/verdict/provider success.

ACCOUNT-V10 final checkpoint: verify:local passed (25 unit tests, typecheck, both builds). Account browser retest2: 2PASS5.6s including keyboard-open/Escape, acknowledged bookmark, logout cleanup, dark390px axe/overflow; real GIS localhost test passed, not OAuth success. Learning regression retest: 7PASS1FAIL; remaining test waits for enrollment button on current DSA graph route, which does not expose that action. Do not mark suite/full workflow PASS. Earlier failures and corrections retained in raw logs. Final review BLOCKED (final-review-account-v10.json): real Google authentication, V10 rollout and existing enrollment integration remain unverified/incomplete.
Next exact step: resolve DSA graph enrollment entry under approved delta scope; rerun original synthetic enrollment/draft/isolation workflow. Then verify genuine Google login/logout and request V10 rollout approval. Existing navbar/footer remain reused. No billing/provider/IAM/production changes. Token/cost unavailable; memory candidates None.


## LOCAL-AUTH-V11 approved local Google testing
Human approved exact plan. Added npm run dev:google (Vite production env, loopback5173); npm run dev remains demo emulator. Serve-production middleware redirects HTML127.0.0.1:5173 to localhost5173 preserving path/query, no-store302, fixed host. Real OAuth console saved and reread http://localhost:5173; existing origins/redirect/scopes unchanged. Evidence local-google-origin-v11.jpg. No billing/IAM/deploy/schema/UI change. Server currently running real Google mode on5173.
Validation: verify:local exit0,25 unit tests,typecheck,web/functionsbuild. Configured GIS browser test against5173 passed, including actual127redirect preserving settings?local=1 and GIS200. This is configuration/SDK evidence, not successful Google authentication. Explicit account selection remains user-driven; browser/FedCM may suppress prompt. Local real mode uses real production data when users invoke saves. Full product remains NOT_READY; prior enrollment gap remains.
Next: open http://localhost:5173 in normal browser and complete One Tap account selection to verify actual session/avatar/logout. For isolated tests stop dev:google and use npm run dev with emulators. Instructions docs/local-testing.md.


## ACCOUNT-CHEVRON-V12
Human APPROVVED scoped plan. Replaced account font glyph with Community identical14px SVG; shared180ms easing, rotation180deg on open and existing community-menu-enter animation. Scoped account popover radius/shadow aligned. Existing header/footer/layout, account actions/auth/data retained. Reduced motion disables transition/animation.
Evidence: verify-account-chevron-v12.txt typecheck25unit/buildPASS; browser-account-chevron-v12.txt2PASS7.8s on separate emulator5174, leaving realGoogle5173 untouched. Browser measured avatar/caret centers <1px, open rotation, same animation, clicktoggle/outsideclose, keyboard/Escape, route navigation, reduced-motion, dark390px axe/overflow and existing saved/logout semantics. account-chevron-v12.png visually inspected, synthetic emulatoridentity notGoogleloginproof. Temporary Playwright config removed after run. No deploy. Scoped UI ready locally; full product NOT_READY and existing blockers unchanged. Token/cost unavailable; memory candidates None.
