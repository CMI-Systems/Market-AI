# Staging Persistence Schema Activation

Date: 2026-06-17

## Executive Summary

Staging persistence schema activation is **FAIL**.

The staging-ready SQL artifact was prepared from the approved Phase N draft and the operator reported that the migration was applied in the staging Supabase SQL Editor. After a requested PostgREST schema-cache reload, the frontend-configured staging Supabase project still returned `PGRST205` for all five required persistence tables.

Because PostgREST cannot resolve the tables, own-record CRUD, ownership-injection, unauthenticated RLS, and full two-operator isolation probes cannot be meaningfully completed. This phase does **not** mark the Cross-User RLS gate as passed.

## Staging Project Confirmation

Environment target: STAGING SUPABASE ONLY

Production Supabase: UNTOUCHED

Frontend configuration source inspected:

- `FrontendReact/.env.local` variable names only

Observed frontend Supabase configuration variable names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOSED_BETA_EMAILS`

No secret values were printed.

## Migration Source

Reviewed source:

- `supabase/migrations_drafts/001_aicc_persistence_schema_draft.sql`

Prepared staging-ready artifact:

- `supabase/migrations_drafts/002_aicc_persistence_schema_staging_ready.sql`

Repository convention:

- The repository currently uses `supabase/migrations_drafts/` and does not contain an active `supabase/migrations/` workflow.
- No migration CLI or `psql` executable was available locally, so staging application was left to the approved Supabase SQL Editor workflow.

## Tables Activated

Required tables:

- `journal_entries`
- `replay_sessions`
- `aicc_dataset_records`
- `dataset_validations`
- `shadow_readiness`

Live activation result through the configured staging anon client:

| Table | PostgREST Result | Status |
| --- | --- | --- |
| `journal_entries` | `PGRST205` | NOT_VISIBLE |
| `replay_sessions` | `PGRST205` | NOT_VISIBLE |
| `aicc_dataset_records` | `PGRST205` | NOT_VISIBLE |
| `dataset_validations` | `PGRST205` | NOT_VISIBLE |
| `shadow_readiness` | `PGRST205` | NOT_VISIBLE |

Tables activated and visible through PostgREST: 0 of 5

## Columns Verified

The staging-ready SQL artifact defines the required application columns, including:

- `id`
- `operator_id`
- `created_at`
- `updated_at`
- table-specific JSONB payload columns used by the frontend persistence services

The SQL artifact includes `operator_id uuid not null` on all five tables.

Live column verification in staging: NOT_COMPLETED because the tables remain unresolved through PostgREST.

## RLS Enabled Status

The staging-ready SQL artifact enables RLS for all five required tables.

Live RLS status: NOT_VERIFIED because all tables still return `PGRST205`.

## Policy Inventory

The staging-ready SQL artifact defines owner-scoped policies for all five tables:

- SELECT: `operator_id = auth.uid()`
- INSERT: `operator_id = auth.uid()`
- UPDATE: `operator_id = auth.uid()` with ownership-preserving check
- DELETE: `operator_id = auth.uid()`

Live policy verification: NOT_COMPLETED because all required tables remain absent from the PostgREST schema cache.

## Grants

The staging-ready SQL artifact grants RLS-governed table operations to `anon` and `authenticated`.

This is intended to allow PostgREST to resolve the tables while RLS blocks unauthenticated and cross-user access. Live grant behavior could not be verified because PostgREST still reports the tables as missing.

## Indexes

The staging-ready SQL artifact defines operator-scoped indexes and relationship lookup indexes for:

- `journal_entries(operator_id)`
- `replay_sessions(operator_id)`
- `aicc_dataset_records(operator_id)`
- `dataset_validations(operator_id)`
- `shadow_readiness(operator_id)`
- dataset and journal relationship lookups where used by services

Live index verification: NOT_COMPLETED.

## PostgREST Visibility

Post-cache-reload anon-client probe result:

- `journal_entries`: `PGRST205`
- `replay_sessions`: `PGRST205`
- `aicc_dataset_records`: `PGRST205`
- `dataset_validations`: `PGRST205`
- `shadow_readiness`: `PGRST205`

PGRST205 resolution: FAIL

Likely causes to check in Supabase:

- Migration was applied to a different Supabase project than the one referenced by `FrontendReact/.env.local`.
- SQL execution failed or partially failed in the staging SQL Editor.
- Tables were created outside an exposed schema.
- PostgREST schema cache did not reload for the project used by the frontend.
- The SQL Editor session was connected to a different environment than the frontend staging URL.

## Own-Record CRUD Probe

Authenticated own-record CRUD probe: NOT_RUN

Reason:

- The required tables are still not visible through PostgREST. Running insert/select/update/delete would only repeat table-missing errors and would not validate RLS.

## Unauthenticated Probe

Unauthenticated access probe: NOT_RUN

Reason:

- Missing-table responses are not evidence of RLS protection.

## Ownership-Injection Probe

Ownership-injection probe: NOT_RUN

Reason:

- The required tables remain unresolved through PostgREST.

## Temporary Record Cleanup

Temporary probe records created: NO

Temporary QA records removed: YES

## Defects

### Critical

1. Required staging persistence tables are still not visible through PostgREST after the operator-reported migration application and schema-cache reload.

### High

None.

### Moderate

1. Local verification cannot confirm whether the SQL was applied to the same staging project used by the frontend configuration.

### Low

None.

## Fixes

1. Created a staging-ready idempotent SQL artifact based on the approved Phase N draft:
   - `supabase/migrations_drafts/002_aicc_persistence_schema_staging_ready.sql`

No runtime code was changed.

## Remaining Gaps

- Confirm in the Supabase SQL Editor that each required table exists in `public`.
- Confirm the SQL Editor project matches the frontend staging URL.
- Confirm the `public` schema is exposed through PostgREST.
- Confirm `notify pgrst, 'reload schema';` ran successfully in the same staging project.
- Rerun table visibility probes.
- After visibility resolves, run own-record CRUD, unauthenticated access, ownership-injection, and full two-operator RLS validation.

## Validation Matrix

| Scenario | Expected | Result |
| --- | --- | --- |
| A. `journal_entries` table resolution | Table exists; no `PGRST205` | FAIL |
| B. `replay_sessions` table resolution | Table exists; no `PGRST205` | FAIL |
| C. `aicc_dataset_records` table resolution | Table exists; no `PGRST205` | FAIL |
| D. `dataset_validations` table resolution | Table exists; no `PGRST205` | FAIL |
| E. `shadow_readiness` table resolution | Table exists; no `PGRST205` | FAIL |
| F. Authenticated own INSERT | Allowed | NOT_RUN |
| G. Authenticated own SELECT | Allowed | NOT_RUN |
| H. Authenticated own UPDATE | Allowed | NOT_RUN |
| I. Authenticated own DELETE | Allowed | NOT_RUN |
| J. Ownership injection | Blocked | NOT_RUN |
| K. Unauthenticated SELECT | Blocked | NOT_RUN |
| L. Unauthenticated INSERT | Blocked | NOT_RUN |
| M. Unauthenticated UPDATE | Blocked | NOT_RUN |
| N. Unauthenticated DELETE | Blocked | NOT_RUN |
| O. Temporary cleanup | No QA records remain | PASS |

## Build and Module Validation

Frontend persistence-service syntax checks: PASS

Files checked:

- `FrontendReact/src/services/journalPersistenceService.js`
- `FrontendReact/src/services/replayPersistenceService.js`
- `FrontendReact/src/services/datasetPersistenceService.js`
- `FrontendReact/src/services/datasetValidationPersistenceService.js`
- `FrontendReact/src/services/shadowReadinessPersistenceService.js`
- `FrontendReact/src/services/datasetRepositoryService.js`
- `FrontendReact/src/services/operatorHistoryService.js`
- `FrontendReact/src/services/datasetGovernanceService.js`
- `FrontendReact/src/services/historicalDatasetValidationService.js`
- `FrontendReact/src/services/supabaseClient.js`

Frontend build: PASS

Build command:

`npm.cmd run build`

Existing large chunk warning: PRESENT

The large chunk warning is not classified as a staging persistence schema failure.

## Readiness for Two-Account Rerun

RLS Re-Test Readiness: NOT_READY

Cross-User RLS Gate: REQUIRES_FULL_RERUN

The full two-operator Cross-User RLS Validation must wait until all five required tables are visible through the configured staging PostgREST endpoint.
