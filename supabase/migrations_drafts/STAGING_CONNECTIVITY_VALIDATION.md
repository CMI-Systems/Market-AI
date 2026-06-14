# AICC Staging Connectivity Validation

This document validates readiness to connect AICC to the separate Supabase
staging project for authentication and schema verification only.

No frontend persistence is enabled. No Supabase writes are added. No training,
Shadow Trainer, Training Logger, Training Evaluator, Model Readiness, or brain
learning is activated.

## Project Separation

- Staging project: `market-ai-staging`
- Production project: `market-ai-core`
- Staging must use its own Supabase URL.
- Staging must use its own Supabase anon key.
- Production credentials must not be used for staging.
- Production data and production operators must not be copied into staging.

## Current Frontend Config Review

`FrontendReact/src/services/supabaseClient.js` already reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The client initializes only when both values exist. If either value is missing,
the exported `supabase` client is `null`, and auth helpers return safe
unconfigured responses. No persistence writes are present in this client.

Required closed-beta auth variable:

- `VITE_CLOSED_BETA_EMAILS`

Staging documentation file added:

- `FrontendReact/.env.staging.example`

## Required Staging Environment Variables

Use placeholder format only in committed docs:

```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_CLOSED_BETA_EMAILS=operatorA@example.com,operatorB@example.com
VITE_ENVIRONMENT=staging
VITE_PERSISTENCE_ENABLED=false
VITE_TRAINING_ENABLED=false
```

## Staging Schema Verification Status

Before connecting a staging frontend environment, manually verify in
`market-ai-staging`:

- [ ] Migration applied to staging only.
- [ ] Production remains untouched.
- [ ] `operator_profiles` table exists.
- [ ] `journal_entries` table exists.
- [ ] `replay_sessions` table exists.
- [ ] `aicc_dataset_records` table exists.
- [ ] `dataset_validations` table exists.
- [ ] `shadow_readiness` table exists.
- [ ] `shadow_queue_certifications` table exists.
- [ ] `training_readiness_certifications` table exists.
- [ ] `infrastructure_audits` table exists.

## RLS And Ownership Verification

Verify in staging:

- [ ] RLS enabled on all nine tables.
- [ ] Owner-only select policies exist.
- [ ] Owner-only insert policies exist.
- [ ] Owner-only update policies exist.
- [ ] Owner-only delete policies exist.
- [ ] `operator_profiles` uses `id = auth.uid()`.
- [ ] All other tables use `operator_id = auth.uid()`.
- [ ] No public write policies exist.
- [ ] Anonymous access is denied.
- [ ] Cross-user access is denied.

## Connectivity Validation Steps

1. Create or confirm `market-ai-staging` exists.
2. Confirm `market-ai-core` is not used for this validation.
3. Confirm staging Auth is enabled.
4. Confirm staging test operators exist.
5. Configure a local staging env from `.env.staging.example` using staging-only
   values.
6. Confirm `VITE_PERSISTENCE_ENABLED=false`.
7. Confirm `VITE_TRAINING_ENABLED=false`.
8. Start the frontend against staging env only when explicitly approved.
9. Confirm login works with staging test operators.
10. Confirm closed-beta allowlist behavior works with staging emails.
11. Confirm no journal, replay, dataset, or audit records are written by the
    frontend.
12. Confirm production remains untouched.

## Manual Verification Checklist

- [ ] Staging project created: `market-ai-staging`.
- [ ] Migration applied to staging only.
- [ ] Nine tables verified.
- [ ] RLS verified.
- [ ] Owner policies verified.
- [ ] Auth session check works against staging.
- [ ] Closed-beta allowlist works with staging emails.
- [ ] Production project `market-ai-core` remains untouched.
- [ ] Frontend persistence remains OFF.
- [ ] Training remains OFF.

## Safety Notes

- Do not overwrite `.env.local`.
- Do not change production environment variables.
- Do not change Vercel environment variables.
- Do not change Render environment variables.
- Do not add service role keys.
- Do not add secrets.
- Do not connect Supabase writes.
- Do not activate persistence.
- Do not activate training.
