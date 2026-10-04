# Architecture checkpoint

React/Vite app → Firebase client read/owner draft Rules; sensitive enrollment → callable Functions → Admin Firestore transaction. Shared schemas in packages/contracts (Zod3-compatible surface), pure catalog/graph/next-action/runner contracts in packages/domain. Original trusted author reference stored in content/private, never imported into web.

Only local `demo-satsuniccode` endpoints are configured. No remote env fallback. Backend non-local writes currently refuse readiness. Public preview bundled in web is explicitly not content-approved production publication. Current persistent business data stays in Firestore emulator; ephemeral UI draft/chat memory cleared on account scope changes. Browser session auth, no private persistent code cache.

Ask: React → Firebase onCallGenkit → currently unavailable. Isolated Gemini SDK provider (Genkit + googleAI generateStream) exists, not reachable/exported. Quota/reservation/idempotency/assessment/cancellation/retrieval/history are mandatory future boundaries before activation. No direct frontend model.

Runner: orchestration contract only, unavailable adapter; no eval/Function/vm/child_process/shell evaluation of learner data. CRDT: actual Yjs unit spike; RTDB transport/canvas and durable Firestore checkpoint not implemented; default-deny surfaces.

Read master sections 3/22/23 for complete intended resources/contracts; matrix preserves all remaining scope. Existing-system changes outside approved FINAL/user design delta require concrete impact review; no new infrastructure/paid services/deployment is implied by local code.
