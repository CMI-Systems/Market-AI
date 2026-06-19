# RLS Policy Matrix

Date: 2026-06-17

## Summary

This matrix reflects the full two-operator staging re-run and the follow-up staging persistence schema activation attempt.

The staging-ready SQL artifact contains owner-scoped policies for the required tables. The operator reported applying the migration and reloading the PostgREST schema cache in staging, but the configured frontend staging Supabase project still returned `PGRST205` for all required tables.

Observed live table status through anon-client probes after schema-cache reload:

- `PGRST205`: table not found in schema cache for all required tables.

## Matrix

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | Operator Column | Service Scoping | Direct Client Result | Final Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `journal_entries` | Staging-ready SQL prepared; not live-verified | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | `operator_id` | PASS at service boundary | `PGRST205` after cache reload | NOT_ACTIVE |
| `replay_sessions` | Staging-ready SQL prepared; not live-verified | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | `operator_id` | PASS at service boundary | `PGRST205` after cache reload | NOT_ACTIVE |
| `aicc_dataset_records` | Staging-ready SQL prepared; not live-verified | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | `operator_id` | PASS at service boundary | `PGRST205` after cache reload | NOT_ACTIVE |
| `dataset_validations` | Staging-ready SQL prepared; not live-verified | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | `operator_id` | PASS at service boundary | `PGRST205` after cache reload | NOT_ACTIVE |
| `shadow_readiness` | Staging-ready SQL prepared; not live-verified | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | Prepared `operator_id = auth.uid()` | `operator_id` | PASS at service boundary | `PGRST205` after cache reload | NOT_ACTIVE |

## Service Scoping Details

`journal_entries`:

- Creates rows with authenticated session `operator_id`.
- Reads are filtered by authenticated session `operator_id`.
- Updates and deletes require matching id and authenticated session `operator_id`.
- Explicit caller-provided foreign operator read requests are rejected.

`replay_sessions`:

- Creates rows with authenticated session `operator_id`.
- Reads are filtered by authenticated session `operator_id`.
- Updates and deletes require matching id and authenticated session `operator_id`.

`aicc_dataset_records`:

- Creates rows with authenticated session `operator_id`.
- Reads are filtered by authenticated session `operator_id`.
- Updates and deletes require matching id and authenticated session `operator_id`.
- Update payload removes caller-supplied `operator_id`.

`dataset_validations`:

- Creates rows with authenticated session `operator_id`.
- Reads are filtered by authenticated session `operator_id`.
- Updates and deletes require matching id and authenticated session `operator_id`.
- Update payload removes caller-supplied `operator_id`.

`shadow_readiness`:

- Creates rows with authenticated session `operator_id`.
- Reads are filtered by authenticated session `operator_id`.
- Updates and deletes require matching id and authenticated session `operator_id`.
- Update payload removes caller-supplied `operator_id`.

## Direct Client Result

Direct client result: FAIL

Reason:

- The direct anon client could not find any required table in the staging schema cache after the operator-reported migration application and cache reload.
- Missing tables are not evidence of RLS protection.

## Final Status

Tables evaluated: 5

Tables fully RLS-verified: 0

Tables partial: 0

Tables not active: 5

Overall RLS status: FAIL
