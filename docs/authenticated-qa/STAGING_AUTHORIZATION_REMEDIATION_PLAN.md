# Staging Authorization Remediation Plan

Date: 2026-06-18

Environment: STAGING ONLY

Database execution status: NOT APPLIED

Production: UNTOUCHED

## Scope

This plan hardens:

- `public.operator_profiles`
- `public.shadow_queue_certifications`
- `public.training_readiness_certifications`
- `public.infrastructure_audits`

The exact consolidated staging SQL is maintained in:

- `supabase/migrations_drafts/002_aicc_persistence_schema_staging_ready.sql`

## Current Frontend Use

`operator_profiles`:

- No current Supabase persistence call exists.
- `FrontendReact/src/services/operatorProfileService.js` derives closed-beta approval from `VITE_CLOSED_BETA_EMAILS`.
- `FrontendReact/src/components/ProtectedRoute.jsx` treats that client-readable allowlist as authorization.

Certification and audit tables:

- No current frontend service reads or writes `shadow_queue_certifications`.
- No current frontend service reads or writes `training_readiness_certifications`.
- No current frontend service reads or writes `infrastructure_audits`.

## Minimum Privileges

| Table | anon | authenticated | Administrative/service-role path |
| --- | --- | --- | --- |
| `operator_profiles` | None | SELECT only | INSERT, UPDATE, DELETE as approved |
| `shadow_queue_certifications` | None | None | SELECT, INSERT, UPDATE, DELETE as approved |
| `training_readiness_certifications` | None | None | SELECT, INSERT, UPDATE, DELETE as approved |
| `infrastructure_audits` | None | None | SELECT, INSERT, UPDATE, DELETE as approved |

`TRUNCATE`, `REFERENCES`, and `TRIGGER` are explicitly revoked from `anon` and `authenticated` on all four tables.

## RLS Policy Changes

Preserved:

- `operator_profiles_select_own` using `id = auth.uid()`.
- Owner-scoped SELECT policies on the certification and audit tables remain available for a future separately approved read-only grant.

Removed:

- `operator_profiles_insert_own`
- `operator_profiles_update_own`
- `operator_profiles_delete_own`
- Client INSERT, UPDATE, and DELETE policies on the three certification/audit tables

This prevents future broad grants from silently enabling self-approval or self-certification.

## Profile Provisioning

Selected approach: `auth.users` creation trigger.

Reasoning:

- Profile rows are created without granting client INSERT.
- New profiles default to `CLOSED_BETA_PENDING` and `beta_approved = false`.
- The trigger does not approve operators.
- No client-callable security-definer RPC is exposed.
- Existing staging users are backfilled without changing approval fields.

Approval remains an explicit administrative or service-role operation outside user-facing frontend paths.

## Updated-At Behavior

`operator_profiles_set_updated_at` uses the existing `public.aicc_set_updated_at()` function.

## Frontend Changes Required

### `FrontendReact/src/services/operatorProfileService.js`

- Remove `isClosedBetaApproved()` and all `VITE_CLOSED_BETA_EMAILS` reads.
- Make operator authorization loading asynchronous.
- Query `operator_profiles` for the authenticated session user ID.
- Select only `id`, `email`, `display_name`, `beta_status`, and `beta_approved`.
- Treat missing rows, query errors, inconsistent approval fields, and unavailable Supabase as denied access.
- Approve access only when `beta_approved === true` and `beta_status === "CLOSED_BETA_APPROVED"`.

### `FrontendReact/src/components/ProtectedRoute.jsx`

- Wait for both the Supabase session and protected profile authorization query.
- Preserve the loading state until the profile query finishes.
- Fail closed on profile errors or missing records.
- Ignore stale profile requests after auth changes or unmount.
- Clear profile-derived authorization on sign-out.

### `FrontendReact/.env.staging.example`

- Remove `VITE_CLOSED_BETA_EMAILS`.
- Retain the staging Supabase URL, publishable/anon key, environment, persistence, and training-disabled variables.

### Staging environment configuration

- Remove `VITE_CLOSED_BETA_EMAILS` from the staging frontend environment.
- Confirm `VITE_SUPABASE_URL` references staging before testing.
- Do not change production environment configuration during this phase.

`FrontendReact/src/services/supabaseClient.js` requires no structural change.

## Authorization Flow

1. Supabase Auth validates the operator session.
2. `ProtectedRoute` requests the authenticated operator's `operator_profiles` row.
3. RLS permits only `id = auth.uid()`.
4. The frontend grants route access only when both protected approval fields are approved.
5. Missing, inconsistent, or unavailable profile state denies access.
6. Administrative/service-role tooling is the only path allowed to change approval fields.

## Rollout Order

1. Apply the reviewed staging SQL remediation.
2. Confirm the auth-user provisioning trigger and profile backfill.
3. Administratively approve the existing authorized staging operators.
4. Verify authenticated SELECT returns only each operator's own profile.
5. Deploy the frontend authorization change to staging.
6. Remove the staging allowlist environment variable.
7. Run the two-operator validation matrix.

Deploying the frontend change before steps 1-4 will fail closed and lock out staging operators.

## Risks

- Incorrect administrative approval may deny valid staging access.
- Broad profile UPDATE privileges would create a self-approval path.
- Broad certification-table writes would create self-certification paths.
- A missing profile row will deny access by design.
- Using the production Supabase URL during staging validation would invalidate the test boundary.

## Rollback

Database rollback must preserve fail-closed behavior:

1. Revoke client access to the affected tables.
2. Drop `aicc_auth_user_profile_provision` if the provisioning trigger itself is defective.
3. Drop `operator_profiles_set_updated_at` only if its function compatibility is disproven.
4. Restore the prior frontend build only after confirming its target is staging.
5. Do not restore client-controlled allowlist authorization as a security rollback. Keep protected routes denied until the profile path is repaired.

## Two-Operator Validation

For approved staging operators A and B:

1. Confirm both profile rows exist and were administratively approved.
2. Confirm each operator can SELECT only their own profile.
3. Confirm cross-user profile SELECT returns zero rows.
4. Confirm INSERT, UPDATE, DELETE, and TRUNCATE are blocked for authenticated clients.
5. Confirm attempts to change `beta_approved` or `beta_status` are blocked.
6. Confirm direct client writes to certification/audit tables are blocked.
7. Confirm administrative approval updates are visible after session/profile refresh.
8. Confirm missing or inconsistent approval state denies protected-route access.
9. Confirm sign-out removes protected access.
10. Continue with the full two-operator persistence RLS matrix only after these checks pass.

## Safety State

- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Shadow Observation: OFF
- PBT-1: NOT STARTED
- Production: UNTOUCHED
