# Current access matrix

| Resource/action | Guest | Own learner | Other learner | Server |
|---|---|---|---|---|
| Published emulator catalog read | Yes | Yes | Yes | Yes |
| Draft/private catalog read | No | No | No | Yes |
| users/{uid}/drafts read/write/list | No | Own only + strict creation/revision fields | Deny | Admin bypass must enforce actor |
| enrollments read | No | Own only | Deny | Yes |
| enrollment/activePlan write | Deny | Callable only, non-anonymous | Deny | Auth-derived transaction; local admission |
| progress/verdict/evidence writes | Deny | Deny | Deny | No evaluator implemented |
| RTDB room/presence read/write | Deny | Deny | Deny | Not implemented |
| Storage artifact read/write | Deny | Deny | Deny | Not implemented |
| assistant callable | Anonymous auth allowed | Auth allowed | Own identity only | Returns unavailable; no data/inference |
| raw salary/reviews/ownership/questions/scorecards/history | Deny | Deny | Deny | Domain authorization not implemented |

Rules tests executed negative ownership/list/privilege/verdict/revision and three-surface default denial. This is not the complete FINAL role/resource matrix: org owner/admin/recruiter/interviewer/candidate/content roles/moderator/privacy operator remain NOT_STARTED; no global `isAdmin` grant exists.
