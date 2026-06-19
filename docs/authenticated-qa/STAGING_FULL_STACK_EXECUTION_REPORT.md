# AICC Staging Full-Stack Execution Report

Date: 2026-06-19

Environment: STAGING-FIRST ONLY

Production Supabase: UNTOUCHED

Production Vercel: UNTOUCHED

Production Render: UNTOUCHED

Database modified: NO

Deployment: NOT_RUN

Training: OFF

Shadow Trainer: OFF

Brain Learning: OFF

Shadow Observation: OFF

PBT-1: NOT STARTED

## Executive Summary

Frontend and backend source were audited for staging readiness, auth safety, environment placement, Supabase integration, inactive learning/training boundaries, and secret/personal-data exposure risk.

Result: PARTIAL / HOLD FOR PRIVATE BETA.

The frontend builds successfully and the current protected-route authorization path uses `operator_profiles` through Supabase RLS rather than `VITE_CLOSED_BETA_EMAILS`. Password recovery sessions are blocked from protected routes and `/update-password` is outside `ProtectedRoute`. A missing `/system-settings` protected route alias was corrected.

The backend syntax check passed. Runtime simulation and dev stream startup remain fail-closed outside explicitly enabled development/test policy.

Remaining staging blockers:

- Real Supabase recovery-email flow still requires successful staging test after rate-limit clears.
- Supabase grants on operator-owned persistence tables remain broader than least privilege: `anon` has table-level CRUD grants on persistence tables even though RLS owner predicates are present.
- Supabase policies are scoped with `{public}` and `auth.uid()` expressions; advisors flag GraphQL discoverability and RLS initplan performance issues.
- Dataset persistence still stores `operator_email`, which is personal data and should be removed or formally justified before broader beta.
- Backend staging env naming is inconsistent with `Backend/services/supabaseClient.js`: local backend env uses different Supabase variable names than the backend Supabase client expects.
- Backend CORS relies on `FRONTEND_URL` for staging and still includes a production Vercel origin in code-level defaults.
- External Vercel Preview and Render environment settings were not modified and require manual provider-console verification.

## Files Inspected

Frontend environment and deployment:

- `FrontendReact/.env.example`
- `FrontendReact/.env.local`
- `FrontendReact/.env.staging`
- `FrontendReact/.env.staging.local`
- `FrontendReact/.env.staging.example`
- `FrontendReact/package.json`
- `FrontendReact/vercel.json`
- `FrontendReact/netlify.toml`
- `FrontendReact/vite.config.js`

Frontend auth and routing:

- `FrontendReact/src/services/supabaseClient.js`
- `FrontendReact/src/services/operatorProfileService.js`
- `FrontendReact/src/components/ProtectedRoute.jsx`
- `FrontendReact/src/pages/Login.jsx`
- `FrontendReact/src/pages/UpdatePassword.jsx`
- `FrontendReact/src/App.jsx`

Frontend API and persistence services:

- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/journalPersistenceService.js`
- `FrontendReact/src/services/replayPersistenceService.js`
- `FrontendReact/src/services/datasetPersistenceService.js`
- `FrontendReact/src/services/datasetValidationPersistenceService.js`
- `FrontendReact/src/services/shadowReadinessPersistenceService.js`
- `FrontendReact/src/services/datasetRepositoryService.js`
- `FrontendReact/src/services/operatorHistoryService.js`
- `FrontendReact/src/services/datasetGovernanceService.js`
- `FrontendReact/src/services/historicalDatasetValidationService.js`
- `FrontendReact/src/services/intelligence/`

Frontend pages and components:

- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/pages/Alerts.jsx`
- `FrontendReact/src/pages/BehavioralBrain.jsx`
- `FrontendReact/src/pages/DataStreams.jsx`
- `FrontendReact/src/pages/FailsafeBrain.jsx`
- `FrontendReact/src/pages/GlobalScan.jsx`
- `FrontendReact/src/pages/Login.jsx`
- `FrontendReact/src/pages/MarketPulse.jsx`
- `FrontendReact/src/pages/Newsletter.jsx`
- `FrontendReact/src/pages/ReplayCenter.jsx`
- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/pages/SystemBoot.jsx`
- `FrontendReact/src/pages/SystemSettings.jsx`
- `FrontendReact/src/pages/TacticalBrain.jsx`
- `FrontendReact/src/pages/TradingJournal.jsx`
- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/components/BehavioralBrainPanel.jsx`
- `FrontendReact/src/components/DataStreamsPanel.jsx`
- `FrontendReact/src/components/IntelligenceFeedPanel.jsx`
- `FrontendReact/src/components/NewsLetterPanel.jsx`
- `FrontendReact/src/components/SystemBootPanel.jsx`

Backend environment, routes, and services:

- `Backend/.env`
- `Backend/.env.example`
- `Backend/package.json`
- `Backend/RENDER_DEPLOYMENT.md`
- `Backend/server.js`
- `Backend/testSupabase.js`
- `Backend/config/environment.js`
- `Backend/config/runtimePolicy.js`
- `Backend/routes/aiccRoutes.js`
- `Backend/routes/apiV1Routes.js`
- `Backend/routes/cognitionRoutes.js`
- `Backend/routes/devStreamRoutes.js`
- `Backend/routes/marketRoutes.js`
- `Backend/services/`
- `Backend/services/brain/`
- `Backend/training/`

Supabase staging metadata:

- MCP project URL
- Public schema table inventory
- Public RLS policy inventory
- Public grants for `anon` and `authenticated`
- Trigger inventory
- Index inventory
- Supabase security and performance advisors

## Files Changed

- `FrontendReact/src/services/operatorProfileService.js`
- `FrontendReact/src/components/ProtectedRoute.jsx`
- `FrontendReact/src/App.jsx`
- `Backend/testSupabase.js`
- `docs/authenticated-qa/STAGING_FULL_STACK_EXECUTION_REPORT.md`

## Files Not Touched

- Production Supabase configuration
- Production Vercel settings
- Production Render settings
- Supabase database schema or RLS
- Training, Shadow Trainer, Brain Learning, Shadow Observation, and PBT-1 activation code
- Provider credentials
- Email or password recovery delivery settings

## FrontendReact Audit

### Environment Files Reviewed

Present:

- `FrontendReact/.env.example`
- `FrontendReact/.env.local`
- `FrontendReact/.env.staging.example`

Missing:

- `FrontendReact/.env.staging`
- `FrontendReact/.env.staging.local`

Findings:

- Frontend env variables are `VITE_` public-client variables except `BETA_MODE`, which Vite will not expose to client code unless explicitly referenced.
- `VITE_SUPABASE_URL` points to the staging Supabase project ref.
- `VITE_SUPABASE_ANON_KEY` is present as a client-side key. It was not printed.
- No frontend service-role key pattern was found.
- No SMTP secret pattern was found in frontend source/env files inspected.
- `VITE_CLOSED_BETA_EMAILS` is not used as an authorization gate.
- `VITE_API_BASE_URL` is present in example/local env files and points to a backend API URL, not Supabase or a mail URL.
- `VITE_TRAINING_ENABLED=false` is present in frontend env examples/local env names.

### Auth/Routing Status

Status: PASS_WITH_LIMITATIONS

Verified:

- `ProtectedRoute` calls `getCurrentOperator(session)`.
- `getCurrentOperator` queries `operator_profiles` by the authenticated user id.
- Access requires `beta_approved === true` and `beta_status === "CLOSED_BETA_APPROVED"`.
- Missing profile fails closed.
- Query errors fail closed.
- Inconsistent approval state fails closed.
- Signed-out users are redirected to `/login`.
- `PASSWORD_RECOVERY` sets only a boolean sessionStorage marker.
- Recovery-pending sessions redirect to `/update-password` before `operator_profiles` lookup.
- `/update-password` is outside `ProtectedRoute`.
- No client-side profile insert/update/delete path exists in the inspected frontend auth surface.

Fixes made:

- Removed operator email rendering from the protected access-pending card.
- Removed email local-part fallback from operator display name derivation.
- Added protected `/system-settings` route alias while preserving `/settings`.

Remaining limitation:

- The operator result object still contains `email` internally from the Supabase session. It is no longer rendered by `ProtectedRoute`, but any future UI must avoid exposing it.

### API Client Status

Status: PARTIAL

Verified:

- `aiccApi.js` and `marketProviderApi.js` use `VITE_API_BASE_URL` with a local fallback.
- `cognitionApi.js` uses `VITE_API_BASE_URL` without a localhost fallback and returns explicit unavailable metadata when backend access fails.
- Network failures in the inspected API clients resolve to unavailable/offline states rather than crashes.
- No frontend service-role key usage was found.

Limitations:

- In deployed staging, `VITE_API_BASE_URL` must be set. Otherwise `aiccApi.js` and `marketProviderApi.js` fall back to `http://localhost:3001`, which is invalid from Vercel/Preview.
- Some frontend offline status constants still label legacy provider relationships such as `WEBULL_PENDING`; this is display-level wording and should remain clearly NOT_IMPLEMENTED.

### UI/Product Surface Status

Status: PARTIAL

Verified:

- `App.jsx` protects all product routes except `/login` and `/update-password`.
- Current product routes include Command Center, Tactical Brain, Behavioral Brain, Failsafe Brain, Trading Journal, Replay Center, Watchlists, Signals, Alerts, Market Pulse, Global Scan, Data Streams, Operator Briefing, System Boot, Archives, Profiles, Subscriptions, and System Settings.
- `/system-settings` now exists as a protected alias.
- `DataStreams` surfaces `POLLING_ONLY` / simulation-blocked-style status rather than a real streaming claim in inspected text paths.
- Replay/Training readiness UI reads training status as disabled and does not activate training.

Limitations:

- Authenticated visual QA was not rerun in this phase.
- Dataset capture/persistence still carries `operatorEmail` / `operator_email`.
- Full ESLint remains blocked by pre-existing lint issues across pages unrelated to this task.

### Build/Lint Status

Targeted lint for modified frontend files:

PASS

Command:

`npx.cmd eslint src/App.jsx src/components/ProtectedRoute.jsx src/services/operatorProfileService.js`

Full frontend lint:

FAIL, pre-existing repo lint debt. `npm run lint -- <paths>` still executes `eslint .` due the package script, so unrelated errors are included.

Frontend build:

PASS

Command:

`npm.cmd run build`

Warning:

- Existing large chunk warning: main JS bundle is larger than 500 kB after minification. This is not a security finding, but code-splitting remains recommended.

### Frontend Security Findings

Moderate defects fixed:

- Pending protected-route state rendered operator email.
- Display-name fallback derived a visible operator label from the email local-part.
- `/system-settings` route was missing despite being part of the audited protected surface.

Remaining findings:

- `operator_email` is still written by dataset persistence.
- `VITE_API_BASE_URL` fallback can silently target localhost if staging env is missing.
- Actual Vercel Preview environment variables were not inspected through Vercel; provider-console verification is still manual.

### Required Frontend Env Variables

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_AUTH_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_ENVIRONMENT=staging`
- `VITE_PERSISTENCE_ENABLED=true`
- `VITE_TRAINING_ENABLED=false`

### Deprecated Frontend Variables

- `VITE_CLOSED_BETA_EMAILS`: deprecated; must not be used as an authorization gate.

## Backend Audit

### Environment Files Reviewed

Present:

- `Backend/.env`

Missing:

- `Backend/.env.example`

Findings:

- Backend env contains server-side provider/Supabase/OpenAI variable names. Values were not printed.
- Staging Supabase URL is present under a project-url style variable name.
- `Backend/services/supabaseClient.js` expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Local backend env variable names do not currently align with the backend Supabase client expectation.
- Backend `.env.example` is missing, so staging/Render variable placement is not documented in-repo.

### Route Security Status

Status: PARTIAL

Verified:

- `/api/dev/stream/start` checks `getSimulationPolicy()` and returns `403` when simulation is not explicitly allowed in development/test.
- `/api/market/*` routes reject blocked `simulate` query attempts.
- Health/status endpoints do not print secrets in inspected code.
- API errors generally return status codes or unavailable-state payloads rather than raw credentials.

Limitations:

- Backend routes are mostly open diagnostic/market-data routes and do not validate a Supabase user session.
- `/api/v1/*` exposes diagnostic/product-status surfaces without route auth middleware.
- CORS default allowlist includes localhost origins and a production Vercel origin; staging-specific frontend origin must be supplied through `FRONTEND_URL`.

### Service Security Status

Status: PARTIAL

Verified:

- Runtime simulation policy blocks simulation in STAGING, PRODUCTION, and UNKNOWN environments.
- Auto simulated stream startup is blocked unless runtime policy allows it.
- Brain mission/objective/runtime guardrail services are passive policy services and do not activate training.
- Shadow Trainer logging returns disabled/readiness status unless approved activation is present.
- Structured logger redacts secret-like keys in object/string logs.

Limitations:

- `Backend/services/supabaseClient.js` uses a service-role-style key and must remain server-only.
- Backend Supabase service is not used by runtime routes found in this audit, but its env variable names are not staging-compatible with current local backend env.
- `Backend/RENDER_DEPLOYMENT.md` still says simulation fallback remains available, which conflicts with the current fail-closed runtime policy language.

### Supabase Integration Status

Status: PARTIAL

Verified through MCP:

- Connected Supabase project URL is `https://ilogukxgdhqymgxpxejr.supabase.co`.
- Required staging persistence tables are present.
- `operator_profiles` exists, has 2 rows, and RLS is enabled.
- `journal_entries`, `replay_sessions`, `aicc_dataset_records`, `dataset_validations`, and `shadow_readiness` exist and have RLS enabled.
- Owner-scoped RLS policies exist using `id = auth.uid()` for `operator_profiles` and `operator_id = auth.uid()` for operator-owned records.
- Updated-at triggers are present for `operator_profiles`, journal, replay, datasets, validations, and shadow readiness.
- Reference owner guard triggers are present for replay, dataset, and shadow readiness relationships.

Remaining Supabase findings:

- `anon` has table-level `SELECT`, `INSERT`, `UPDATE`, and `DELETE` grants on `journal_entries`, `replay_sessions`, `aicc_dataset_records`, `dataset_validations`, and `shadow_readiness`. RLS should block unauthenticated rows, but least-privilege grants are still too broad.
- Policies are reported with roles `{public}` instead of explicitly scoped `TO authenticated`.
- Supabase security advisors report GraphQL discoverability for multiple operator-owned tables due role grants.
- Supabase security advisors report mutable function search paths for `public.aicc_set_updated_at()` and ownership assertion functions.
- Supabase performance advisors report `auth.uid()` initplan warnings in RLS policies and missing covering indexes for several certification/audit tables.
- `operator_profiles` authenticated SELECT is expected for authorization, but it should remain own-row-only through RLS.

### CORS Status

Status: PARTIAL

Current backend code allows:

- `http://localhost:5173`
- `http://localhost:3000`
- one production Vercel origin
- `FRONTEND_URL` when configured
- no-origin requests

Staging requirement:

- Set `FRONTEND_URL` to the exact staging frontend origin in the staging Render/backend environment.
- Confirm staging backend does not unintentionally mix production frontend origins in staging-only deployments.

### Training/Shadow/Brain/PBT Flags

Status: PASS

Verified:

- `VITE_TRAINING_ENABLED=false` in frontend env examples/local names.
- Runtime simulation policy blocks staging/production/unknown simulation.
- Dev stream route cannot start simulated stream outside explicitly enabled development/test.
- No route was found that starts Training, Shadow Trainer, Brain Learning, Shadow Observation, or PBT-1.

### Backend Build/Test Status

Backend `npm test`:

NOT_RUN. Package script is a placeholder that exits with failure by design.

Backend syntax/module check:

PASS

Command:

`node --check` over backend JS files excluding dependencies/data/training datasets.

Result:

125 backend JS files checked successfully.

### Backend Security Findings

Defects fixed:

- `Backend/testSupabase.js` printed raw Supabase URL and returned row data if run. It now prints only configured YES/NO status and an aggregate count result, without row dumps or secret values.

Remaining findings:

- Missing `Backend/.env.example`.
- Backend Supabase env names are inconsistent with `services/supabaseClient.js`.
- Backend default CORS list includes production Vercel origin in code.
- Backend diagnostic routes are unauthenticated and should be treated as internal/staging-only unless intentionally public.
- `RENDER_DEPLOYMENT.md` needs updating to remove stale simulation fallback wording.

### Required Backend Env Variables

Required for backend runtime:

- `PORT`
- `NODE_ENV=staging`
- `MARKET_AI_MODE=staging`
- `MARKET_AI_AUTO_SIM=false`
- `FRONTEND_URL`
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `ALPACA_DATA_URL`
- `WEBULL_ENABLED=false`
- `WEBULL_ENV=paper`

Required only if backend Supabase admin diagnostics/services are intentionally used:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not expose backend secrets through frontend `VITE_` variables.

## Environment Variable Placement Matrix

| Location | Allowed contents | Must not contain | Notes |
|---|---|---|---|
| `FrontendReact/.env.example` | Public placeholders for `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_AUTH_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`, staging flags | service-role keys, provider secrets, SMTP secrets, passwords, operator emails | Safe template only. |
| `FrontendReact/.env.local` | Local staging public Vite values only | service-role keys, provider secrets, SMTP secrets, passwords, operator emails | Values were not printed; current names point to staging Supabase. |
| `FrontendReact/.env.staging` | Staging public Vite values for deploy simulation | service-role keys, provider secrets, SMTP secrets, passwords, operator emails | Missing locally. |
| `FrontendReact/.env.staging.local` | Local override for staging public Vite values | service-role keys, provider secrets, SMTP secrets, passwords, operator emails | Missing locally. |
| `Backend/.env.example` | Placeholder server env names only | real secret values | Missing; should be created before handoff. |
| `Backend/.env` | Server-only secrets and runtime config | frontend-public values unless intentionally duplicated as non-secret URLs | Values were not printed; do not commit. |

## Supabase Staging Audit Result

Result: PARTIAL / LEAST-PRIVILEGE GRANTS APPLIED

Present and correct:

- Staging project connection confirmed.
- Tables present.
- RLS enabled on inspected staging tables.
- Owner predicates present.
- Updated-at triggers present for active persistence tables.
- Relationship owner guard triggers present for critical dataset relationships.
- Staging least-privilege grant remediation was applied on 2026-06-19.
- `anon` forbidden privilege count is now 0 across the required AICC persistence/admin tables.
- `authenticated` forbidden `TRUNCATE`, `REFERENCES`, and `TRIGGER` privilege count is 0.
- `operator_profiles` authenticated SELECT grant is present.
- `operator_profiles` authenticated write grant count is 0.
- Certification/admin client grant count is 0.
- Approved operator profile count remains 2.

Not staging-hardening-complete:

- Policies use `{public}` role scope.
- Function search paths are mutable.
- GraphQL table discoverability warnings exist.
- RLS initplan performance warnings exist.
- Some certification/audit table indexes are missing.

### Least Privilege Remediation Status

Status: APPLIED_TO_STAGING

SQL file:

- `supabase/migrations_drafts/003_staging_least_privilege_grants.sql`

Database changes applied to staging:

- Revoked `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER` on required AICC tables from `anon` and `authenticated`.
- Re-granted `SELECT` only on `public.operator_profiles` to `authenticated`.
- Re-granted `SELECT`, `INSERT`, `UPDATE`, and `DELETE` only on `journal_entries`, `replay_sessions`, `aicc_dataset_records`, `dataset_validations`, and `shadow_readiness` to `authenticated`.
- No grants restored for `shadow_queue_certifications`, `training_readiness_certifications`, or `infrastructure_audits`.

Grants before remediation:

- `anon` grants: 20
- `authenticated` grants: 21
- `anon` forbidden grants: 20
- `authenticated` forbidden admin grants: 0
- `operator_profiles` authenticated write grants: 0
- certification/admin client grants: 0

Grants after remediation:

- `anon` forbidden privilege count: 0
- `authenticated` forbidden `TRUNCATE` / `REFERENCES` / `TRIGGER` count: 0
- `operator_profiles` authenticated SELECT grant count: 1
- `operator_profiles` authenticated write grant count: 0
- certification/admin client grant count: 0
- persistence-table authenticated CRUD grant count: 20

RLS verification after remediation:

- Required tables checked: 9
- RLS enabled tables: 9
- Owner SELECT policy present for `operator_profiles`: yes
- Owner SELECT policy present for `journal_entries`: yes
- Owner SELECT policy present for `replay_sessions`: yes
- Owner SELECT policy present for `aicc_dataset_records`: yes
- Owner SELECT policy present for `dataset_validations`: yes
- Owner SELECT policy present for `shadow_readiness`: yes

RLS matrix rerun result:

PARTIAL. Metadata and grant/RLS verification passed. Full two-operator client-path RLS validation still requires real Operator A and Operator B sessions and was not rerun in this remediation step.

## Vercel Preview Audit Result

Result: PARTIAL / MANUAL VERIFICATION REQUIRED

Repository-level:

- `FrontendReact/vercel.json` builds `npm run build`, outputs `dist`, and rewrites to `index.html`.
- No production Vercel settings were modified.

Manual provider-console verification still required:

- Confirm Vercel Preview env uses staging `VITE_SUPABASE_URL`.
- Confirm Preview uses only anon/publishable Supabase key.
- Confirm Preview has no service-role keys.
- Confirm `VITE_API_BASE_URL` points to approved staging backend.
- Confirm production Supabase URL is not present in Preview env.

## Render Backend Audit Result

Result: PARTIAL / MANUAL VERIFICATION REQUIRED

Repository-level:

- `Backend/RENDER_DEPLOYMENT.md` documents backend root, build, start, and health endpoint.
- Staging CORS requires exact `FRONTEND_URL` configuration.

Manual provider-console verification still required:

- Confirm staging Render service uses `NODE_ENV=staging` and `MARKET_AI_MODE=staging`.
- Confirm `MARKET_AI_AUTO_SIM=false`.
- Confirm no production Supabase URL/credentials are in staging Render.
- Confirm no frontend `VITE_` secrets are mirrored into backend.
- Confirm backend CORS includes staging frontend origin and does not rely on localhost for deployed Preview.

## Security Findings

Critical:

- 0 confirmed runtime critical defects.

High:

- Real password recovery-email QA remains blocked by Supabase email rate limit; Private Beta auth recovery path is not fully proven.

Moderate:

- Dataset persistence writes `operator_email`.
- Backend Supabase env names are inconsistent with the backend Supabase client.
- Backend CORS defaults include a production frontend origin and require staging `FRONTEND_URL` to be configured correctly.
- External Vercel/Render envs were not directly verified.
- Backend diagnostic API surfaces are unauthenticated.
- `Backend/.env.example` is missing.

Low:

- Existing large frontend chunk warning.
- Full ESLint is blocked by pre-existing lint issues outside the changed files.
- `RENDER_DEPLOYMENT.md` contains stale simulation fallback wording.

## Exact Fixes Applied

1. `FrontendReact/src/services/operatorProfileService.js`
   - Removed email-derived display-name fallback.
   - Default display name is now `Authenticated Operator`.

2. `FrontendReact/src/components/ProtectedRoute.jsx`
   - Replaced pending-access `Operator Email` display with non-identifying `Operator Session` status.

3. `FrontendReact/src/App.jsx`
   - Added protected `/system-settings` alias.

4. `Backend/testSupabase.js`
   - Removed raw URL print.
   - Removed full row dump.
   - Replaced raw error dump with sanitized error code.
   - Uses aggregate `operator_profiles` count check only.

5. `supabase/migrations_drafts/003_staging_least_privilege_grants.sql`
   - Created staging-only SQL remediation artifact.
   - Applied the non-destructive grant remediation to staging.

## Validation Results

Frontend targeted lint:

PASS

Frontend full lint:

FAIL, due pre-existing unrelated lint errors.

Frontend build:

PASS, with large chunk warning.

Backend syntax:

PASS.

Supabase MCP metadata:

PASS for staging connection and schema visibility; PARTIAL for grants/advisors.

Smoke test:

NOT_RUN. No dev server/browser smoke was requested or required for this report, and no deployment was performed.

Authenticated visual QA:

NOT_RUN in this phase.

## RLS Client-Path Rerun Status

Status: DEPLOYED TWO-OPERATOR AUTH/CORS/BROWSER QA PASS

Latest deployed manual QA status:

- Operator A deployed login: PASS
- Operator B deployed login: PASS
- Both operators cycled through all major app tabs: PASS
- Console errors observed: 0
- Network errors observed: 0
- Backend CORS: PASS
- Render backend health endpoint: PASS
- Vercel Preview frontend to Render backend connectivity: PASS
- Supabase staging auth/profile gate: PASS
- 304 cached backend endpoint responses: ACCEPTABLE / PASS
- 200 responses for system-status and provider-status: PASS

Staging metadata recheck on 2026-06-19:

- `anon` forbidden privilege count: 0
- `authenticated` forbidden admin privilege count: 0
- `operator_profiles` authenticated write grants: 0
- certification/admin client grants: 0
- RLS enabled tables: 9
- approved operator profiles: 2
- temporary journal QA rows: 0
- temporary replay QA rows: 0
- temporary dataset QA rows: 0
- temporary validation QA rows: 0
- temporary shadow-readiness QA rows: 0

Operator A result:

PASS for deployed login and major-tab browser traversal. No console or network errors were observed.

Operator B result:

PASS for deployed login and major-tab browser traversal. No console or network errors were observed.

Anon result:

METADATA_PASS. Table-level `anon` grants are absent. Client-path anon SELECT/INSERT/UPDATE/DELETE attempts still need to be exercised through the same validation harness or browser client path used for the two-operator rerun.

Admin/cert table result:

METADATA_PASS. `shadow_queue_certifications`, `training_readiness_certifications`, and `infrastructure_audits` have no `anon` or `authenticated` client grants. Client-path denial still needs to be exercised with real authenticated sessions.

Cleanup result:

PASS for metadata scan. No temporary QA rows matching `RLS_QA_TEMP` remain in the active persistence tables.

Scope note:

This deployed QA confirms two approved operators can authenticate through the deployed staging frontend, pass the `operator_profiles` profile gate, traverse the major protected surfaces, and reach the Render backend through the Vercel Preview frontend without observed browser console or network failures. It does not replace the deeper row-mutation RLS harness for cross-user CRUD attempts on every persisted table.

### Updated Deployed QA Status Table

| Check | Result |
|---|---|
| Operator A deployed login | PASS |
| Operator B deployed login | PASS |
| Major app tab traversal by both operators | PASS |
| Console errors | PASS, 0 observed |
| Network errors | PASS, 0 observed |
| Backend CORS | PASS |
| Render backend health endpoint | PASS |
| Vercel Preview to Render backend connectivity | PASS |
| Supabase staging auth/profile gate | PASS |
| Cached backend 304 responses | ACCEPTABLE / PASS |
| `system-status` 200 responses | PASS |
| `provider-status` 200 responses | PASS |
| Temporary QA row cleanup metadata scan | PASS |

## Remaining Blockers

1. Complete real password recovery email flow QA after Supabase rate-limit clears.

2. Remove or formally remediate dataset `operator_email` persistence.

3. Align backend environment variable names with `Backend/services/supabaseClient.js`.

4. Optional Supabase advisor hardening:
   - Fix mutable function `search_path` warnings.
   - Convert `auth.uid()` policies to `(select auth.uid())` where appropriate for RLS performance.

## Private Beta Readiness Verdict

HOLD

Reason:

The app is buildable and core staging auth logic is materially improved. Supabase least-privilege grants have been remediated in staging. The deployed two-operator auth/CORS/browser QA gate is now PASS. Private Beta remains HOLD until the real password recovery email flow passes, dataset `operator_email` persistence is remediated, backend environment variable naming is aligned, and optional Supabase advisor hardening is evaluated.

## Manual Next Steps

1. Complete real password recovery email QA.
2. Remove or formally remediate dataset `operator_email` persistence.
3. Align backend Supabase environment variable names.
4. Decide whether to perform optional Supabase advisor hardening before Private Beta.

Recommended next step:

Password Recovery Email Flow QA.
