# Current data model and remaining boundaries

Implemented locally: `catalog/dsa-v1` preview projection with explicit synthetic environment and CONTENT_REVIEW_REQUIRED; `users/{uid}` activePlan; `users/{uid}/enrollments/{version}` immutable enrollment identity; `users/{uid}/drafts/{revision-language-context}` owner draft. Timestamps use serverTimestamp. Catalog raw source and practice statements are original preview code, not production-reviewed publication. There are no private hidden tests in the web bundle.

Drafts: source ≤100000 chars; fixed challenge revision; language allowlist; learning context only; create revision=0, update revision=previous+1. Transaction rejects stale editor revisions; creation actor/time immutable. No draft keys shared across identities. Session remount clears private React state on account switch; Firebase browser session Auth persistence only, no code localStorage/IndexedDB persistence. Unsaved edits are warned and not labeled synced.

Enrollment: trusted callable derives actor, refuses anonymous learner enrollment, transaction verifies published emulator catalog, deterministic version identity avoids duplicate enrollment and keeps activePlan. No client verdict/progress writes. Next-action currently starts from no verified evidence; runner cannot mint evidence.

Remaining FINAL domains/ownership are retained in master section 22 and requirement matrix: learning versions/evidence, project artifacts/rubrics, community private ownership/public projection split, salary raw/aggregate split, organizations/rounds/private questions/scorecards, RTDB scoped ACL/checkpoints, grants, assistant requests/history/quota/proposals, operations/audit. None is represented as already implemented by this checkpoint. Default Rules reject all these paths.

## Production database boundary (Singapore)

Default database satsuniccode is Firestore Native STANDARD freeTier in asia-southeast1, created after owner region approval. Public dsaReferences/{slug}: original title/topic/difficulty/set flags/externalUrl/contentState REFERENCE_ONLY + source/license/hash/server metadata. This is metadata, never executable assignment/publication/accepted evidence. users/{uid}/bookmarks/{slug}: strict own bool star, schemaVersion1/changedBy/changedDate; cannot grant mastery. Existing drafts remain peak-requests only until independently reviewed assignment schemas expand.

Planned collections (not instantiated with fabricated data): assignments/versions/privateEvaluators, projects/labs/rubrics/evidence, reviewSubmissions/moderation/publicReviews, salarySubmissions/aggregates, organizations/members/cohorts, interviews/rounds/participants/documents, assistantRequests/quotaLeases, executionJobs/privateResults/auditEvents. Denied by catch-all until trusted backends/permissions/provider gates implemented. Firebase has no SQL table creation requirement; collection paths exist on real writes, do not seed fake users/results/community data to create them.
