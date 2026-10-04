# Current callable contracts

- `enrollRoadmap({trackSlug:'dsa',roadmapVersion:'dsa-v1',requestId:UUID})`: authenticated non-anonymous actor; emulator-only admission; strict unknown-field rejection; catalog published prerequisite. Transaction creates one version-scoped enrollment and sets activePlan. Retry is idempotent for this single supported version; does not promise provider exactly-once semantics.
- `getNextActions({})`: same actor gate; own activePlan read; returns up to three deterministic prerequisite eligible actions. It cannot claim accepted evidence. No personal context is sent to Gemini.
- `createSubmission`: actor gate then `unavailable`; no queued job, execution, verdict, quota charge or evidence. Future immutable hash/runtime/evaluation contracts in master 12/23 remain required.
- `sendAssistantMessage`: installed onCallGenkit + authenticated authPolicy; strict bounded schema; unavailable flow. No model call or stored history. Reusable input/event contracts exist; stream schema is not yet application-event streaming in a live service.

Firestore client writes: owner-only draft transaction; immutable creation metadata; monotonic revision. Conflict/error never produces synced acknowledgement. Other writes denied.

All other commands in FINAL section 23 are NOT_STARTED; do not interpret route placeholders as implemented services. Staging commands explicitly disabled until authorization/App Check/provider review. Error category shown without raw sensitive exception data.
