# Staging Deployment QA Checklist

Date: 2026-06-18

Environment: STAGING DEPLOYMENT PREP ONLY

Deployment: NOT RUN

Production: UNTOUCHED

Database changes: NONE

## Executive Status

Staging deployment preparation is **PARTIAL**.

Verified locally:

- Frontend production build passes.
- Staging Supabase project URL is correct.
- The configured local frontend key is a client-safe publishable key.
- `VITE_CLOSED_BETA_EMAILS` is absent from frontend source and staging example configuration.
- `ProtectedRoute` authorizes through `operator_profiles`.
- `/update-password` is outside `ProtectedRoute`.
- Password recovery sessions are redirected away from protected routes.
- No frontend service-role variable or secret-key pattern was found.
- Vercel SPA rewrite configuration is present.

Pending external verification:

- Vercel project linkage and Preview environment variables.
- Exact staging frontend hostname.
- Exact staging backend hostname.
- Supabase Auth redirect allowlist after the staging hostname is assigned.
- Real password recovery email flow after the Supabase email rate limit clears.

## Files Inspected

- `FrontendReact/package.json`
- `FrontendReact/vite.config.js`
- `FrontendReact/vercel.json`
- `FrontendReact/.env.example`
- `FrontendReact/.env.local` variable names and classifications only
- `FrontendReact/.env.staging` file presence only; ignored values were not inspected
- `FrontendReact/src/App.jsx`
- `FrontendReact/src/components/ProtectedRoute.jsx`
- `FrontendReact/src/pages/Login.jsx`
- `FrontendReact/src/pages/UpdatePassword.jsx`
- `FrontendReact/src/services/supabaseClient.js`
- `FrontendReact/src/services/operatorProfileService.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/frontendRuntimePolicy.js`
- Frontend persistence services
- `Backend/server.js`
- `Backend/RENDER_DEPLOYMENT.md`

No secret values were printed or copied into documentation.

## Build

Command:

`npm.cmd run build`

Result: PASS

Output directory: `FrontendReact/dist`

Existing warning: the main JavaScript chunk exceeds 500 kB after minification. This is not a staging deployment blocker but remains a code-splitting recommendation.

## Required Vercel Preview Variables

Set these only on the staging/Preview frontend environment:

| Variable | Required value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://ilogukxgdhqymgxpxejr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Active client-safe staging publishable key; never a service-role or secret key |
| `VITE_FRONTEND_URL` | `https://<APPROVED_STAGING_FRONTEND_HOST>` |
| `VITE_API_URL` | `https://<APPROVED_STAGING_BACKEND_HOST>` |
| `VITE_ENVIRONMENT` | `staging` |
| `VITE_PERSISTENCE_ENABLED` | `true` |
| `VITE_DEMO_MODE` | `false` |
| `VITE_TRAINING_ENABLED` | `false` |

Do not configure:

- `VITE_CLOSED_BETA_EMAILS`
- Service-role keys
- Provider secrets
- Production Supabase URL or keys
- Production backend URL

`VITE_API_URL` is mandatory for staging deployment. Missing staging configuration fails closed before a backend request; localhost fallback is restricted to explicit development.

## Vercel Configuration

Repository configuration:

- Root directory: `FrontendReact`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite: all routes resolve to `/index.html`

External Vercel Preview configuration: PENDING

Reason:

- No local `.vercel/project.json` link exists.
- Repository files do not contain deployed Preview environment values.
- The Vercel dashboard was not modified or queried during this phase.

Before deployment, compare every Preview variable against the table above and confirm no production Supabase or backend value is present.

## Required Supabase Auth URLs

Local staging URLs:

- `http://localhost:5173`
- `http://localhost:5173/update-password`

Deployed staging URLs, after assigning the stable staging hostname:

- `https://<STAGING_FRONTEND_HOST>`
- `https://<STAGING_FRONTEND_HOST>/update-password`

Set the staging Supabase Auth Site URL to the stable staging frontend origin. Add the update-password URLs to the Redirect URLs allowlist. Do not use the production frontend URL for staging recovery links.

The exact deployed URLs remain pending until `<STAGING_FRONTEND_HOST>` is known. Prefer a stable staging alias over unrestricted Vercel preview wildcards for password recovery.

## Deployment Steps

1. Create or select the Vercel staging/Preview project with root directory `FrontendReact`.
2. Confirm it is not linked to the production frontend project.
3. Set only the required staging variables above.
4. Verify the Supabase URL project reference matches staging.
5. Verify the Supabase key is publishable/anon, not secret or service-role.
6. Set `VITE_FRONTEND_URL` to the approved staging frontend HTTPS origin.
7. Set `VITE_API_URL` to the approved staging backend HTTPS origin.
8. Configure the staging backend CORS `FRONTEND_URL` and, only if needed, `CORS_ALLOWED_ORIGINS` with exact approved staging origins.
9. Build a Vercel Preview deployment without promoting it to production.
10. Record the stable staging hostname.
11. Add the exact staging root and `/update-password` URLs to staging Supabase Auth configuration.
12. Do not promote or alias the deployment to production.

## Post-Deploy QA

- Open `/login` directly; confirm no blank screen or console error.
- Open `/command-center` signed out; confirm redirect to `/login`.
- Sign in as Operator A; confirm protected access and profile-derived approval.
- Sign out; confirm protected content is cleared.
- Confirm signed-out Group A requests return 401 and do not receive provider-health or market-context data.
- Confirm an approved signed-in operator can access provider health through the existing Supabase session.
- Confirm market-context endpoints remain HTTP 503 / `not_ready` with `sourceCount: 0` and no validated-snapshot claim.
- Repeat with Operator B.
- Confirm cross-user Journal, Replay, Dataset, Validation, and Shadow Readiness isolation.
- Open `/update-password` without a recovery flow; confirm fail-closed state.
- Request a real recovery email when the rate limit permits.
- Confirm the recovery link opens the staging `/update-password` route.
- Confirm direct navigation to `/command-center` returns to password update while recovery is pending.
- Confirm password mismatch is rejected.
- Complete password update, sign out, and return to `/login`.
- Confirm old password fails and new password succeeds.
- Confirm provider, session, provenance, and unavailable states remain truthful.
- Confirm no request targets `localhost`, production Supabase, or a production backend.
- Confirm Training, Shadow Trainer, Brain Learning, and Shadow Observation remain OFF.

## Remaining Private Beta Blockers

1. Real staging recovery-email flow remains unverified because of Supabase built-in email rate limiting.
2. Vercel Preview environment values are not externally verified.
3. Exact staging frontend hostname is not yet recorded.
4. Exact staging backend HTTPS origin is not yet configured or verified.
5. Supabase Auth deployed redirect URLs cannot be finalized until the staging hostname is known.

## Gate Decision

Build output readiness: PASS

Staging deployment configuration readiness: PARTIAL

Deployment authorization: NOT GRANTED

Private Beta recommendation: HOLD until the real recovery-email flow and external staging deployment configuration pass.

## Safety State

- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Shadow Observation: OFF
- PBT-1: NOT STARTED
- Production: UNTOUCHED
