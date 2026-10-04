# LOCAL-AUTH-V11

Status: awaiting scoped human approval. Intelligence DEGRADED: existing CodeGraph/CocoIndex readiness is stale/unavailable; source verified with bounded reads. No application changes yet.

Observed root cause: npm run dev uses Vite development mode and Firebase demo emulators. Real public Firebase/OAuth config exists only in ignored apps/web/.env.production.local, so GIS never starts on normal development server. OAuth client currently allows localhost and localhost:5000, but neither requested port5173 origin. Existing production domains retained.

Concrete change:
- package.json + apps/web/package.json: add dev:google command running Vite --mode production --host localhost --port5173 for actual One Tap/Firebase; retain npm run dev for emulator testing. Both are explicit and documented.
- apps/web/vite.config.ts: in serve+production mode only, redirect loopback 127.0.0.1:5173 to localhost:5173 preserving path/query, using localhost canonical GIS origin. No deployment, layout/navbar/footer change, no automatic production data creation.
- OAuth web client satsuniccode: add http://localhost:5173 JavaScript origin, preserve existing origins and redirect URI; Firebase localhost already authorized. No client secrets, IAM, scopes, billing or deployment changes.
- tests: parameterize configured GIS test URL and verify canonical local redirect and real GIS200 at5173; existing emulator suite remains on default dev mode. Loading GIS does not prove Google account authentication.
- docs: local instructions, evidence, provider readiness, final review/checkpoint. Actual Google account selection is user-driven. Real-data local mode writes to production if user explicitly performs save actions; emulator mode stays isolated.

Validation: Typecheck/build/unit tests; actual localhost5173 browser entry/GIS request, 127.0.0.1 canonical redirect; no simulated Google success. Rollback: remove added OAuth origin and npm command/middleware; no data migration.
