Plan ID/version: GOOGLE-ONE-TAP-V9
Repository intelligence gate status: DEGRADED — bounded fallback permitted by policy
Approval status: APPROVED
Approver: human user
Approval timestamp or task reference: “approved” immediately following GOOGLE-ONE-TAP-V9 plan
Approved scope: basic Spark Firebase Auth/Google-only provider/origins and local GIS→Firebase integration, tests/evidence
Constraints: no billing/IAM/Identity Platform upgrade, no client secret in frontend/source/logs, no Hosting rollout until reviewed candidate approval; real chooser human-controlled
Approved paths:
- `apps/web/src/google-one-tap.ts`
- `apps/web/src/features/Account.tsx`
- `apps/web/src/firebase.ts`
- `tests/**`
- `docs/**`

Validator requires READY despite policy allowing DEGRADED; actual state recorded truthfully.
