# PBT-1 Ownership Model Readiness

Date: 2026-06-17

## Existing Operator Ownership Model

The intended AICC persisted ownership model remains:

- Authenticated Supabase user id is the operator identity.
- Operator-owned tables use `operator_id`.
- Service create paths derive `operator_id` from the authenticated session.
- Service reads, updates, and deletes scope by `operator_id`.
- Draft SQL policies use `operator_id = auth.uid()` for owner-scoped records.

`operator_profiles` is the draft schema exception and uses `id = auth.uid()`.

## Two-Operator Re-Run Finding

Second approved staging operator account: AVAILABLE

Environment: STAGING

Result:

- The two-account runner authenticated both staging operators.
- The required Phase N persistence tables were not active in the configured staging Supabase schema cache.
- No live row ownership model could be proven because no test records could be created.

## Suitability for Future PBT-1 Records

PBT-1 Ownership Model: EXISTING_MODEL_REUSABLE_WITH_GAPS

The model is still directionally reusable for PBT-1 records, but it cannot be approved for observation logging until the active staging database implements and verifies it.

Future tables should use:

- `operator_id uuid not null references auth.users(id) on delete cascade`
- RLS enabled
- SELECT policy: `operator_id = auth.uid()`
- INSERT policy: `with check (operator_id = auth.uid())`
- UPDATE policy: `using (operator_id = auth.uid()) with check (operator_id = auth.uid())`
- DELETE policy: `using (operator_id = auth.uid())`

## Future PBT-1 Tables Covered by This Recommendation

Do not create these tables during this phase:

- `shadow_observation_runs`
- `daily_brain_ledgers`
- `weekly_brain_reviews`
- `brain_objective_records`
- `drift_events`
- `quarantine_events`

If created in a later approved phase, each must use authenticated operator ownership and live RLS validation before exposure.

## Cross-User Aggregation Prohibition

Default rule:

- Cross-operator aggregation is prohibited.

Any future aggregate dataset or evaluation that combines operators requires a separate approved aggregation policy, anonymization/privacy review, explicit consent model, and dedicated RLS design.

## Service-Layer Requirements

Future PBT-1 services must:

- Require an authenticated Supabase session.
- Derive `operator_id` internally.
- Ignore or reject caller-supplied `operator_id`.
- Scope reads by authenticated operator.
- Scope updates and deletes by authenticated operator.
- Fail closed when no session exists.
- Never use service-role behavior in frontend or user-facing paths.
- Preserve provenance and training-disabled states.
- Keep training, Shadow Trainer, Brain Learning, Shadow Observation, and PBT-1 activation off until separately approved.

## Gaps

- Required staging persistence tables are missing from the configured Supabase schema cache.
- RLS cannot be live-verified until tables exist.
- Direct client cross-user attempts cannot prove RLS blocking until records can be created.
- Token expiry QA remains pending.
- Future PBT-1 table-specific policies must be created and reviewed in a separate schema phase.

## Readiness Decision

PBT-1 Ownership Model Readiness: EXISTING_MODEL_REUSABLE_WITH_GAPS

PBT-1 Observation Logging and Versioning Design: BLOCKED until staging persistence tables and RLS are active and a two-operator re-run passes.

Safety status:

- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Shadow Observation: OFF
- PBT-1: NOT STARTED
- Production: UNTOUCHED
