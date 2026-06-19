# Cross-User RLS Validation

Date: 2026-06-17

## Executive Summary

Cross-User RLS Validation: FAIL

This was a full two-operator staging re-run. Two approved staging operator credentials were entered manually in a local prompt and both authentication attempts completed without exposing credentials, tokens, cookies, user IDs, or keys.

The gate failed before row-level isolation could be proven because the configured staging Supabase project did not expose the required Phase N persistence tables. All five target tables returned `PGRST205` table-not-found responses through the anon client:

- `journal_entries`
- `replay_sessions`
- `aicc_dataset_records`
- `dataset_validations`
- `shadow_readiness`

No temporary QA records were created. No runtime code was changed. No Supabase schema or RLS policy was modified. Production was untouched.

## Two-Account Validation Status

Second approved operator account: AVAILABLE

Environment: STAGING

Validation mode:

- Manual credential entry through a visible local prompt.
- Supabase anon client only.
- No service-role frontend usage.
- No fake sessions.
- No RLS bypass.
- No production Supabase action.

## Setup Verification

Frontend staging connection: PARTIAL

Findings:

- The frontend had Supabase URL and anon key configuration.
- The validation runner used temporary process-level `VITE_ENVIRONMENT=staging` and `VITE_PERSISTENCE_ENABLED=true` flags for the local dev session only.
- The required persistence tables were not present in the configured Supabase schema cache.

Required staging setup not satisfied:

- Phase N persistence tables active in staging.
- RLS policies active on those tables.
- PostgREST schema cache exposing those tables.

## Service Ownership Audit

Inspected services:

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

Static service findings:

- Create paths derive `operator_id` from the authenticated session.
- Update payload builders remove caller-supplied `operator_id`.
- Reads, updates, and deletes scope by `operator_id`.
- Repository, history, governance, and historical validation compose from scoped persistence services.
- No frontend service-role path was found.

Static service posture: PASS

Live RLS posture: FAIL, because active staging tables were not available.

## Read Isolation

Cross-user SELECT: FAIL

Reason:

- Account A and Account B could authenticate, but no target rows could be created because the target tables were missing.
- Cross-user SELECT could not be proven blocked by RLS.

## Update Isolation

Cross-user UPDATE: FAIL

Reason:

- No target records existed.
- Cross-user UPDATE could not be proven blocked by RLS.

## Delete Isolation

Cross-user DELETE: FAIL

Reason:

- No target records existed.
- Cross-user DELETE could not be proven blocked by RLS.

## Ownership Injection Result

Ownership Injection: FAIL

Reason:

- Ownership-injection attempts require active target tables.
- Because the tables were missing, the test could not prove that RLS blocks foreign, arbitrary, null, or missing ownership assignments.

## Unauthenticated Result

Unauthenticated Access: FAIL

Reason:

- Unauthenticated table access returned table-not-found errors, not RLS-denied or zero-row policy results.
- This does not prove unauthenticated access is blocked by RLS.

## Repository, History, Governance Isolation

Repository Isolation: FAIL

Operator History Isolation: FAIL

Governance Isolation: FAIL

Historical Validation Isolation: FAIL

Reason:

- These aggregations depend on the persisted table set.
- With all target tables missing, no live cross-user aggregation isolation could be proven.

## Direct Client Bypass Audit

Direct client bypass paths found in frontend persisted services: 0

Notes:

- The frontend persisted services use the Supabase anon client.
- Backend has a service-role helper in `Backend/services/supabaseClient.js`, but this audit did not find it used by the frontend operator persistence services.
- No service-role key was printed or exposed.

## Cleanup Confirmation

Temporary QA Records Removed: YES

No temporary records were created because all target table inserts failed before persistence.

## Defects

Critical defects: 1

- The configured staging Supabase project does not expose the required Phase N persistence tables, so live RLS isolation cannot be validated.

High defects: 0

Moderate defects: 0

Low defects: 0

## Fixes

Runtime code changes: 0

No fix was applied. The required remediation is staging Supabase setup, not frontend or backend runtime code.

## Remaining Gaps

- Apply the approved Phase N persistence migration to the staging Supabase project.
- Confirm PostgREST schema cache exposes the required tables.
- Confirm RLS is enabled and active for each table.
- Re-run two-operator CREATE, SELECT, UPDATE, DELETE, ownership-injection, unauthenticated, repository, history, governance, and historical-validation tests.
- Token expiry QA remains pending.

## Final Decision

RLS Gate Decision: BLOCKED

PBT-1 Observation Logging and Versioning Design: BLOCKED

Recommended next step: RLS Remediation

Safety status:

- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Shadow Observation: OFF
- PBT-1: NOT STARTED
- Production: UNTOUCHED
