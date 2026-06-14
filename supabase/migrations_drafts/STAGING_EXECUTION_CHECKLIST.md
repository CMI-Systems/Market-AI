# AICC Staging Migration Execution Checklist

This checklist is for applying the AICC persistence schema draft to a separate
Supabase staging project only.

Do not run this migration in production. Do not activate application
persistence. Do not activate training, Shadow Trainer, Training Logger, Training
Evaluator, Model Readiness, or brain learning.

## 1. Pre-Execution Requirements

- [ ] Confirm a separate Supabase staging project exists.
- [ ] Confirm the staging project is not production.
- [ ] Confirm no production data is used.
- [ ] Confirm no production `service_role` key is used.
- [ ] Confirm the staging URL and staging anon key are separate from production.
- [ ] Confirm backup/export is not needed because staging starts empty.
- [ ] Confirm `001_aicc_persistence_schema_draft.sql` passed N.3 safety review.
- [ ] Confirm `STAGING_DEPLOYMENT_PLAN.md` passed N.4 review.
- [ ] Confirm persistence remains OFF in the live application.
- [ ] Confirm training remains OFF in the live application.

## 2. Supabase Dashboard Steps

- [ ] Open the staging Supabase project.
- [ ] Confirm the project name, URL, and environment are staging-only.
- [ ] Navigate to SQL Editor.
- [ ] Open `supabase/migrations_drafts/001_aicc_persistence_schema_draft.sql`.
- [ ] Copy the full SQL draft contents.
- [ ] Paste into the staging SQL Editor.
- [ ] Review the SQL before execution.
- [ ] Confirm the SQL comments still state `DRAFT ONLY`.
- [ ] Confirm the SQL comments still state `NO TRAINING ACTIVATION`.
- [ ] Run only in staging.
- [ ] Do not run in production.

## 3. Post-Migration Table Verification

Verify each table exists in the staging project:

- [ ] `operator_profiles`
- [ ] `journal_entries`
- [ ] `replay_sessions`
- [ ] `aicc_dataset_records`
- [ ] `dataset_validations`
- [ ] `shadow_readiness`
- [ ] `shadow_queue_certifications`
- [ ] `training_readiness_certifications`
- [ ] `infrastructure_audits`

## 4. RLS Verification

For each table, verify:

- [ ] RLS is enabled.
- [ ] Owner-only select policy exists.
- [ ] Owner-only insert policy exists.
- [ ] Owner-only update policy exists.
- [ ] Owner-only delete policy exists.
- [ ] No public write policy exists.
- [ ] No anonymous access policy exists.

Tables to verify:

- [ ] `operator_profiles`
- [ ] `journal_entries`
- [ ] `replay_sessions`
- [ ] `aicc_dataset_records`
- [ ] `dataset_validations`
- [ ] `shadow_readiness`
- [ ] `shadow_queue_certifications`
- [ ] `training_readiness_certifications`
- [ ] `infrastructure_audits`

## 5. Auth Test Requirements

Create or use test-only staging accounts:

- [ ] Staging Operator A.
- [ ] Staging Operator B.

Verify:

- [ ] Operator A can access own records.
- [ ] Operator B can access own records.
- [ ] Operator A cannot access Operator B records.
- [ ] Operator B cannot access Operator A records.
- [ ] Anonymous user cannot access records.

## 6. Data Safety Tests

Use dummy records only:

- [ ] Insert fake journal entry.
- [ ] Insert fake replay session.
- [ ] Insert fake dataset record.
- [ ] Insert fake validation result.
- [ ] Insert fake readiness result.

Data restrictions:

- [ ] Do not use real operator records.
- [ ] Do not use production records.
- [ ] Do not use live trading data.
- [ ] Do not use sensitive behavioral reflections.
- [ ] Remove dummy data after test completion if the staging project will be reused.

## 7. Training Safety Verification

Confirm:

- [ ] No training activated.
- [ ] No Shadow Trainer activated.
- [ ] No model writes occurred.
- [ ] No training logs were created.
- [ ] No brain mutation occurred.
- [ ] Readiness flags are informational only.
- [ ] Queue structures are inert and not processed.
- [ ] Certification tables are audit-only.

## 8. Failure Handling

If migration fails:

- [ ] Capture the exact error message.
- [ ] Capture the failed SQL statement.
- [ ] Do not retry blindly.
- [ ] Inspect the failed statement.
- [ ] Update the draft only after review.
- [ ] Do not patch production.
- [ ] Destroy and recreate staging if necessary.
- [ ] Re-run validation from the beginning after any draft change.

## 9. Approval Gate

Do not proceed to production planning until:

- [ ] All table checks pass.
- [ ] All RLS checks pass.
- [ ] All auth isolation checks pass.
- [ ] All dummy data checks pass.
- [ ] Security review passes.
- [ ] No public writes are possible.
- [ ] No anonymous access is possible.
- [ ] No service role key is exposed.
- [ ] User explicitly approves production planning.

## 10. Final Signoff

- [ ] Staging project confirmed.
- [ ] Migration applied to staging only.
- [ ] Tables verified.
- [ ] RLS verified.
- [ ] Auth isolation verified.
- [ ] Dummy data tested.
- [ ] Training safety verified.
- [ ] Production remains untouched.
