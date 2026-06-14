# AICC Supabase Staging Deployment Plan

This plan is for staging validation only.

Do not apply the draft migration to production. Do not activate application
persistence. Do not activate training, Shadow Trainer, Training Logger, Training
Evaluator, or Model Readiness.

## Environment Requirements

- Create a separate Supabase project for AICC staging.
- Use a separate staging Supabase URL.
- Use a separate staging anon key.
- Do not use production credentials in staging.
- Do not copy production data into staging.
- Do not invite or seed production operators into staging.
- Keep service role keys out of the frontend and out of this repository.
- Configure staging frontend environment variables separately from production.

## Migration Procedure

1. Create a new staging Supabase project.
2. Enable Supabase Auth in the staging project.
3. Create test-only staging operator accounts.
4. Review `001_aicc_persistence_schema_draft.sql` before applying it in staging.
5. Apply the draft migration only to the staging Supabase project.
6. Verify all expected tables exist.
7. Verify RLS is enabled on every table.
8. Verify owner-only policies exist for select, insert, update, and delete.
9. Verify frontend auth can establish a staging session using staging URL and anon key.
10. Verify authenticated owner isolation with at least two test operators.
11. Verify audit and certification tables are inert data stores only.
12. Verify anonymous clients cannot read or write any persistence table.
13. Verify no public writes are possible.

## Validation Tests

Run all tests with two separate staging operators: Operator A and Operator B.
For each table, create records as Operator A, then verify Operator B cannot read,
update, or delete Operator A records.

### operator_profiles

- Insert own profile with `id = auth.uid()`.
- Read own profile.
- Update own display/status metadata.
- Delete own profile only in disposable staging tests.
- Verify another authenticated operator cannot access it.
- Verify anonymous access is denied.

### journal_entries

- Insert a journal entry with `operator_id = auth.uid()`.
- Read the inserted journal entry.
- Update thesis, review, reflection, tags, and status.
- Delete the journal entry.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### replay_sessions

- Insert a replay session tied to the test operator.
- Read replay intelligence and pipeline status JSON.
- Update replay status or context.
- Delete the replay session.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### aicc_dataset_records

- Insert a deterministic text dataset ID.
- Read intelligence snapshot, operator context, market context, learning targets, and warnings.
- Update status or warnings only in staging tests.
- Delete the dataset record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### dataset_validations

- Insert validation output tied to an owned dataset.
- Read quality score, label, missing fields, and warnings.
- Update status or validation notes only in staging tests.
- Delete the validation record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### shadow_readiness

- Insert readiness output tied to an owned dataset and validation.
- Read readiness score, label, priority, and brain readiness flags.
- Update status only in staging tests.
- Delete the readiness record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### shadow_queue_certifications

- Insert a certification-only result.
- Read record counts, readiness percentage, brain coverage, and warnings.
- Update status only in staging tests.
- Delete the certification record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### training_readiness_certifications

- Insert a certification-only training readiness result.
- Read readiness score, component status, reasons, and warnings.
- Update status only in staging tests.
- Delete the certification record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

### infrastructure_audits

- Insert an audit-only result.
- Read audit score, label, certification level, strengths, weaknesses, and warnings.
- Update status only in staging tests.
- Delete the audit record.
- Verify cross-user isolation.
- Verify anonymous access is denied.

## Security Validation

- Verify every owner policy uses `auth.uid()`.
- Verify `operator_profiles` policies use `id = auth.uid()`.
- Verify all other persistence tables use `operator_id = auth.uid()`.
- Verify anonymous users cannot select, insert, update, or delete records.
- Verify Operator A cannot access Operator B records.
- Verify Operator B cannot access Operator A records.
- Verify no public insert policies exist.
- Verify no public update policies exist.
- Verify no public delete policies exist.
- Verify no service role key appears in frontend code, staging env examples, or draft files.
- Verify no backend endpoint bypasses RLS for this staging test.

## Rollback Procedure

If the staging migration fails:

1. Stop all staging validation.
2. Do not attempt production rollback.
3. Destroy the disposable staging Supabase project.
4. Create a clean staging Supabase project.
5. Re-enable Auth.
6. Recreate test-only staging operators.
7. Review and fix the draft migration.
8. Reapply the revised draft migration to staging only.
9. Restart validation from the beginning.

## Production Readiness Criteria

The draft can move toward production planning only if:

- All nine tables are created in staging.
- RLS is enabled on all nine tables.
- Owner-only select, insert, update, and delete policies pass for all tables.
- `operator_profiles.id` correctly references `auth.users(id)`.
- All other tables correctly use `operator_id` ownership.
- Cross-user access is denied.
- Anonymous access is denied.
- No public writes are possible.
- No service role key is exposed to frontend code.
- No persistence bugs are found.
- No operator data leakage is observed.
- Training remains OFF.
- Shadow Trainer remains OFF.
- Application persistence remains OFF until a later approved phase.
