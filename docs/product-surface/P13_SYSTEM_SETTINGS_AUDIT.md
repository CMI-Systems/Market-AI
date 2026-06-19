# AICC Phase P.13 - System Settings Audit

Date: 2026-06-16

Mode: AUDIT FIRST with one targeted misleading-status fix

Result: PASS with PARTIAL System Settings product readiness.

## Executive Summary

P.13 audited `SystemSettings.jsx`, protected authentication flow, provider diagnostics, frontend runtime policy, backend runtime policy, environment config, AICC status routes, market provider routes, Supabase helpers, training/shadow readiness services, and related profile/access pages.

The current System Settings surface is display-only. It shows closed-beta status, beta readiness, and provider diagnostics, but it does not expose functional settings controls, preference persistence, provider switching, credential editing, simulation toggles, training toggles, Shadow Trainer toggles, Brain Learning toggles, refresh interval controls, risk thresholds, notification delivery controls, or reset behavior.

One confirmed misleading state was found and fixed: System Settings displayed provider fallback as `AVAILABLE` when fallback diagnostics were absent. Missing fallback diagnostics now fail closed as `DISABLED`.

No Webull activation, live trading, order execution, provider credential change, Supabase schema/RLS change, simulation reactivation, training activation, Shadow Trainer activation, Brain Learning activation, deployment setting change, or production change was made.

## Feature Inventory

| Capability | State | Evidence |
|---|---|---|
| Closed beta status display | DISPLAY_ONLY | Status cards render from AICC/provider status. |
| Beta readiness display | DISPLAY_ONLY | Readiness cards render local labels and provider availability. |
| Provider diagnostics display | DISPLAY_ONLY | Webull, Alpaca, fallback, and warning cards render diagnostics. |
| Environment display | DISPLAY_ONLY | Environment is available in status APIs; not shown as editable. |
| Webull status | DISPLAY_ONLY | Rendered as integration pending through provider display helper. |
| Alpaca status | DISPLAY_ONLY | Rendered from diagnostics; not selectable. |
| Fallback status | PARTIAL | Display-only and fixed to fail closed when missing. |
| Theme | NOT_IMPLEMENTED | No setting. |
| Appearance | NOT_IMPLEMENTED | No setting. |
| Layout | NOT_IMPLEMENTED | No setting. |
| Default symbol | NOT_IMPLEMENTED | No setting. |
| Default timeframe | NOT_IMPLEMENTED | No setting. |
| Watchlist preferences | NOT_IMPLEMENTED | No setting. |
| Chart preferences | NOT_IMPLEMENTED | No setting. |
| Refresh interval | NOT_IMPLEMENTED | No setting. |
| Polling interval | NOT_IMPLEMENTED | No setting. |
| Alert preferences | NOT_IMPLEMENTED | No setting. |
| Notification preferences | NOT_IMPLEMENTED | No setting. |
| Provider selection | NOT_IMPLEMENTED | No setting. |
| Data-source selection | NOT_IMPLEMENTED | No setting. |
| Demo mode | NOT_IMPLEMENTED | No setting. |
| Simulation mode | NOT_IMPLEMENTED | No setting. |
| Persistence toggle | NOT_IMPLEMENTED | No setting. |
| Training toggle | NOT_IMPLEMENTED | No setting. |
| Shadow Trainer toggle | NOT_IMPLEMENTED | No setting. |
| Brain Learning toggle | NOT_IMPLEMENTED | No setting. |
| Risk tolerance | NOT_IMPLEMENTED | No setting. |
| Confidence threshold | NOT_IMPLEMENTED | No setting. |
| Failsafe threshold | NOT_IMPLEMENTED | No setting. |
| Session preferences | NOT_IMPLEMENTED | No setting. |
| Operator profile settings | NOT_IMPLEMENTED | Separate Profiles page is display-only. |
| Authentication settings | NOT_IMPLEMENTED | Login/protected route exist; no settings controls. |
| Security settings | NOT_IMPLEMENTED | No settings controls. |
| API credentials | NOT_IMPLEMENTED | No frontend credential editing. |
| Supabase configuration | NOT_IMPLEMENTED | Env-defined only. |
| Export/import settings | NOT_IMPLEMENTED | No workflow. |
| Reset settings | NOT_IMPLEMENTED | No workflow. |

Settings Capabilities Identified: 37.

Complete Capabilities: 0.

Partial Capabilities: 1.

Display-Only Capabilities: 6.

Missing Capabilities: 30.

Unsafe Capabilities: 0.

## Surface Determination

System Settings Surface: DISPLAY_ONLY_SETTINGS.

The surface is not a functional settings editor. It is a protected status page with provider-readiness and closed-beta-readiness cards.

## Canonical Setting Contract

No canonical persisted setting record exists. A future setting contract should include:

```js
{
  key,
  label,
  category,
  value,
  defaultValue,
  type,
  allowedValues,
  persisted,
  persistenceType,
  operatorScoped,
  environmentScoped,
  requiresRestart,
  affectsRuntime,
  securitySensitive,
  enabled,
  source,
  lastUpdatedAt,
  warnings
}
```

Current Settings cards do not satisfy this contract because they are status outputs, not settings inputs.

## Runtime Effect Audit

Functional Runtime Settings: 0.

No System Settings control changes frontend state, backend behavior, provider behavior, persistence behavior, intelligence behavior, runtime environment, or deployment configuration.

The page polls:

- `/api/aicc/system-status`
- `/api/market/provider-diagnostics`

These reads are display-only.

## Persistence Audit

Persisted Settings: 0.

No System Settings preference is persisted to Supabase, localStorage, sessionStorage, or backend storage. Environment-defined settings remain environment-defined and are not presented as user-editable.

Persistence Safety: NOT_APPLICABLE for Settings controls.

## Provider Settings Audit

Provider Settings Integrity: PASS.

Findings:

- Alpaca appears only as diagnostics/status.
- Webull remains integration pending and is not selectable as operational.
- No provider-selection control exists.
- No provider credential field exists.
- No frontend live/paper credential swap exists.
- Provider fallback display now fails closed as `DISABLED` when missing.
- Polling/snapshot status is handled elsewhere; Settings does not claim streaming.

Defect fixed:

- Missing fallback diagnostics previously displayed `AVAILABLE`; now `DISABLED`.

## Environment/Runtime Policy Audit

Environment Policy Integrity: PASS.

Backend runtime policy blocks simulation unless the process is explicitly in `DEVELOPMENT` or `TEST` and simulation is explicitly enabled. `STAGING`, `PRODUCTION`, missing, and malformed environments fail closed.

Direct policy matrix passed:

- Development without explicit simulation: BLOCKED.
- Development with explicit simulation: allowed for dev/test policy.
- Test with explicit simulation: allowed for dev/test policy.
- Staging with simulation requested: BLOCKED.
- Production with simulation requested: BLOCKED.
- Unknown/malformed runtime: BLOCKED.

No frontend Settings control can override backend runtime policy.

## Training/Learning Controls Audit

Training/Learning Safety: PASS.

No Settings control exists for:

- Training.
- Shadow Trainer.
- Brain Learning.
- Autonomous learning.
- Dataset eligibility.
- Training readiness.
- Training queue activation.

Training readiness service hardcodes `rawDataCertified` false and requires raw-data certification before readiness. Shadow readiness rejects blocked provenance and records that try to mark raw/training flags.

Training remains OFF. Shadow Trainer remains OFF. Brain Learning remains OFF.

## Persistence Toggle Audit

No Settings persistence toggle exists.

Related persistence services are environment-gated and operator-scoped:

- Journal persistence: staging-only and Supabase-authenticated.
- Replay persistence: staging-only and Supabase-authenticated.
- Dataset persistence: staging-only and Supabase-authenticated.

Settings cannot bypass authentication, RLS, service-role boundaries, or production Supabase configuration.

## Authentication/Profile Audit

Authentication/Profile Safety: PASS.

Protected routes require Supabase operator sessions. If Supabase is not configured or the operator is unauthenticated, `/settings`, `/profiles`, and `/subscriptions` redirect to `/login`.

Profile and subscription pages are display-only. No role escalation, local role override, closed-beta self-approval, password-change, or credential-management setting exists.

## Secret Exposure Audit

Secret Exposure: PASS.

Targeted credential-name search found expected references only:

- `FrontendReact/src/services/supabaseClient.js`: frontend anon Supabase env variable names.
- `FrontendReact/src/pages/Login.jsx`: UI text naming Supabase config variable names.
- `Backend/services/marketProviderService.js`: backend Alpaca env variable names.
- `Backend/services/webullService.js`: backend Webull env variable names.
- `Backend/services/supabaseClient.js`: backend Supabase service-role env variable name.
- `Backend/RENDER_DEPLOYMENT.md`: deployment variable names.

No secret values were printed or found in inspected frontend source. Provider secrets and service-role usage remain backend/environment-owned.

## Refresh/Polling Settings

Refresh/Polling Safety: NOT_IMPLEMENTED.

No operator setting controls refresh or polling intervals. `SystemSettings.jsx` reads status every 15 seconds and cleans up the interval on unmount. The interval is hardcoded and not user-editable.

## Risk/Confidence Settings

Risk/Confidence Settings: NOT_IMPLEMENTED.

No risk tolerance, confidence threshold, alert severity threshold, Failsafe threshold, or signal filtering threshold settings exist.

## Notification Settings

Notification Settings: NOT_IMPLEMENTED.

No push, email, SMS, sound, badge preference, or critical-only control exists. Unsupported delivery channels are not exposed as configurable settings.

## Appearance/Layout Settings

Appearance/Layout Settings: NOT_IMPLEMENTED.

No theme, contrast, layout, density, or reset preference exists in System Settings.

## Reset Settings Audit

Reset Safety: NOT_IMPLEMENTED.

No reset control exists. No Settings control can delete journal/replay/dataset records, sign out unexpectedly, reset provider credentials, change environment, enable simulation, or activate training.

## Settings Lifecycle

Settings Lifecycle: PARTIAL.

Implemented states are implicit:

- Initial render uses offline fallback status.
- Polling refreshes display status.
- Protected route handles unauthenticated redirects.

Not implemented:

- `SAVING`
- `SAVED`
- `SAVE_FAILED`
- `INVALID_VALUE`
- `RESTART_REQUIRED`
- Setting-level `DISABLED`
- Setting-level `BLOCKED`

## Operator Workflow

Operator Workflow: PARTIAL.

Supported:

1. Open System Settings.
2. View closed-beta status.
3. View beta readiness.
4. View provider diagnostics.
5. Understand Webull is pending.
6. Remain protected behind login.

Not supported:

- Change a safe preference.
- Save preference.
- Reload and restore setting.
- Reset preferences.
- Edit provider settings.
- Configure notifications.
- Configure refresh/polling.
- Configure risk/confidence thresholds.

## UI State Integrity

UI State Integrity: PASS for display-only Settings.

No setting appears enabled because no setting controls exist. Provider fallback now fails closed as `DISABLED` when diagnostics are absent.

## Responsive Findings

Responsive Safety: PASS for protected-route smoke.

The unauthenticated `/settings`, `/profiles`, and `/subscriptions` route smoke mounted and redirected safely to login without blank screens, console errors, visible `NaN`, or visible `undefined`.

Authenticated visual QA remains pending until a valid Supabase operator session is available.

## Accessibility Findings

Accessibility: PARTIAL.

The Settings page uses text labels and status values, but it does not include explicit setting-control semantics because no controls exist. Future controls need labels, disabled reasons, field-associated errors, focus order validation, and non-color-only status labels.

## Performance Findings

Performance Safety: PASS.

System Settings creates one 15-second polling interval and clears it on unmount. No duplicate subscription, repeated save loop, or stale save-response path exists.

## Scenario Matrix

| Scenario | Expected | Result |
|---|---|---|
| Valid safe preference change | `SAVED` and restored | NOT_IMPLEMENTED. |
| Invalid setting value | `INVALID_VALUE` | NOT_IMPLEMENTED. |
| Unknown setting key | Rejected or ignored safely | PASS by absence; no setting apply path exists. |
| Webull selection attempt | `NOT_IMPLEMENTED` or `BLOCKED` | PASS; no selector exists and Webull displays pending. |
| Simulation enable in development without explicit policy | BLOCKED | PASS, runtime matrix. |
| Simulation enable in staging | BLOCKED | PASS, runtime matrix. |
| Simulation enable in production | BLOCKED | PASS, runtime matrix. |
| Training enable attempt | BLOCKED | PASS by absence and readiness gates. |
| Shadow Trainer enable attempt | BLOCKED | PASS by absence and readiness gates. |
| Brain Learning enable attempt | BLOCKED | PASS by absence. |
| Persistence enable without authentication | BLOCKED | PASS by absence; persistence services require auth. |
| Invalid polling interval | Rejected | NOT_IMPLEMENTED. |
| Provider offline | Status unavailable, no fake healthy label | PASS. |
| Reset preferences | Only documented preferences reset | NOT_IMPLEMENTED. |
| Reload page | Restoration matches persistence | PASS by absence; no persisted settings. |
| Mobile viewport | No broken layout | PARTIAL; protected-route smoke passed, authenticated visual QA pending. |

## Defects Found

1. `SystemSettings.jsx` displayed fallback provider status as `AVAILABLE` when `providerDiagnostics.fallback.status` was absent.

Severity: Moderate.

Risk: Could imply a fallback provider path exists when diagnostics were missing.

## Exact Fixes

1. `FrontendReact/src/pages/SystemSettings.jsx`
   - Changed missing fallback status from `AVAILABLE` to `DISABLED`.

Runtime code changes were limited to this display-state fix.

## Remaining Gaps

- No functional settings editor exists.
- No settings persistence exists.
- No operator-scoped preferences exist.
- No safe preference change/reload workflow exists.
- No theme/layout settings exist.
- No refresh/polling settings exist.
- No notification settings exist.
- No risk/confidence settings exist.
- No reset workflow exists.
- Authenticated Settings visual QA remains pending until a valid Supabase operator session is available.

## Feature Classification

System Settings Product Readiness: PARTIAL.

Feature classification: DISPLAY_ONLY_SETTINGS.

The surface is safe and protected, but it is not a complete product settings workflow.

## Validation Results

Direct checks:

- Runtime simulation policy matrix: PASS.
- Backend settings-related module load: PASS.
- Credential-name search: PASS, expected variable names only.

Frontend build:

- `npm.cmd run build`: PASS with existing Vite chunk-size warning.

Protected route smoke:

- `/settings` redirected unauthenticated access to `/login`.
- `/profiles` redirected unauthenticated access to `/login`.
- `/subscriptions` redirected unauthenticated access to `/login`.
- Root mounted.
- Blank screen: false.
- Console errors: 0.
- Visible `NaN`: false.
- Visible `undefined`: false.

Smoke Test: PASS.

The local Vite server used for smoke testing was stopped after validation.

## P.13 Result

P.13 Result: PASS.

System Settings is safe as a protected display-only status surface, but it is not ready as a functional settings surface.

## Recommended P.14 Step

P.14 Mobile and Responsive Audit.
