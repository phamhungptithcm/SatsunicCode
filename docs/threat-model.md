# Threat model checkpoint

Assets: learner drafts/enrollment, future evaluation secrets, tenant interviews, anonymous author mapping/raw salary, AI prompts/provider secrets. Actors: guest/learner, candidate/interviewer, malicious authenticated user, operator and untrusted provider callback/content.

Current boundaries: public original preview → owner Firestore → trusted callable/Admin → external provider disabled. Server derives UID; all non-local application commands blocked; no remote config path in frontend; RTDB/Storage default deny. Input unknown fields rejected, creation metadata immutable, transaction conflicts surfaced, logout remount clears private state.

Open high-risk gates: no live App Check, no approved code isolation/callbacks, no tenant membership/invite/assessment state machine, no ACL/revocation transport, no AI admission/quota/cancel/deletion/retrieval, no community moderation/anonymous projections or salary suppression, no artifact preview sandbox/retention. Dependency vulnerabilities block release. No sensitive raw payload logging is authored; Genkit flow unavailable and content telemetry must be independently audited before real inference.

Negative emulator tests target draft cross-user read/list/write, privilege/verdict tampering, oversized input, stale revision, draft/private catalog access, transport/artifact deny. Test execution status is in test-evidence; this document is not a security certification.
