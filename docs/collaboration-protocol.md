# Collaboration checkpoint

Actual evidence currently limited to in-memory Yjs CRDT test: independent documents simultaneously insert/delete, apply duplicate state updates, converge, and reconstruct a late joiner. No browser multi-user transport, RTDB ACL, presence, whiteboard, persistence/compaction/revocation latency has been verified.

RTDB currently denies all reads/writes. Target protocol: server-established scoped org/session/round/document ACL + short-lived lease/epoch; immutable update envelope authenticated by Firebase UID; bounded update sizes; stable file identity; checkpoint plus bounded append stream; no full-text last-write-wins. Presence via connection/onDisconnect separate from durable code and canvas. Private notes/scorecards separate from opaque CRDT bytes.

Close target: revoke RTDB writes first, determine accepted update cutoff, persist checkpoint, finalize artifacts/Firestore round state, reconcile partial failures fail-closed. Reopen requires fresh epoch. Expiry enforced on access, not TTL. Board adapter must handle element identity, tombstones/delete-vs-update and undo with independent tests.

Next step: implement local two-identity scoped RTDB transport and run 2–4 independent browser contexts for convergence/reconnect/revocation/checkpoint, then whiteboard. AC-19–29 remain NOT_STARTED/IN_PROGRESS until that evidence exists.
