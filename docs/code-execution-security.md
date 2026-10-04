# Execution trust boundary

No code is run by trusted Functions, CI or browser. `UnavailableRunner` rejects every submission/status request. No public demo endpoint configured. `applyJobState` rejects terminal→running regressions and accepts duplicate same-state events. Unit tests are contract foundation, not sandbox assurance.

Future provider approval checklist: isolation beyond ordinary containers; no Firebase credentials/metadata/private network; CPU/wall/memory/process/output/filesystem limits; deny outbound network; pinned runtime versions; cleanup/cross-job leakage; authenticated callbacks or bounded polling; unknown receipt reconciliation; retention/cost and allowed environment. Trusted comparisons separate from candidate output and hidden expected bank. Hidden diagnostics must never return raw stdout/stderr.

To unblock: choose approved provider/deployment and supplied server authentication through secret management; document runtime IDs/versions and adapter contract; run hostile-code fixtures (loop/flood/network/file/cross-job), known incorrect solutions, forged callback/replay and source-hash binding. None of these sandbox tests has run yet.
