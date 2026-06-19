# Authenticated Product Surface QA

Date: 2026-06-17

## Executive Summary

Authenticated Product Surface QA established a real closed-beta Supabase operator session in the in-app browser and validated the current protected AICC interiors. No authentication bypass, fake session, route-protection weakening, credential exposure, training activation, Shadow Trainer activation, Brain Learning activation, Shadow Observation activation, or order-execution path was introduced.

Result: PASS WITH LIMITATIONS

The authenticated route surface rendered successfully across all current protected routes. The prior blocker `AUTHENTICATED_PRODUCT_SURFACE_QA_PENDING` is resolved for route rendering, navigation, sign-out, responsive safety, and console/runtime stability.

Remaining limitations:

- Journal and Replay persistence could not complete CRUD in this local run because frontend persistence is explicitly gated to staging and `VITE_PERSISTENCE_ENABLED=true`.
- Cross-user isolation remains PENDING because only one authorized operator account was available.
- RLS validation remains PENDING at the two-account end-to-end level; frontend services do apply operator-scoped filters.
- Session expiry was not time-forced; sign-out and post-sign-out protected-route denial were validated.

## Auth-Session Validation

Classification: PASS

Validated:

- Real authenticated session established through Supabase login UI.
- `/command-center` rendered the protected interior after sign-in.
- Operator bar and logout control were present after authentication.
- `/command-center` direct navigation worked while authenticated.
- Sign-out returned to `/login`.
- Direct protected navigation after sign-out redirected to `/login`.
- Browser back after sign-out did not restore protected content.
- Console errors during authenticated and sign-out checks: 0.

Not validated:

- Invalid credentials failure path, because Codex did not enter credentials.
- Forced token expiry, because the QA did not mutate Supabase session state or tokens.

## Operator Identity Validation

Classification: PASS

Validated:

- ProtectedRoute derives operator state from Supabase session through `getCurrentOperator(session)`.
- Journal and replay persistence services derive `operator_id` from `getAuthSession()` and reject missing sessions.
- Editable fields, query parameters, and localStorage are not used as the authenticated operator identity source in the inspected persistence services.
- No session values, cookies, JWTs, Supabase keys, or credentials were printed.

## Surface-by-Surface Results

| Surface | Route | Result | Notes |
| --- | --- | --- | --- |
| Command Center | `/`, `/command-center` | PASS | Protected interior rendered, chart and unavailable states safe, no console errors. |
| System Boot | `/system-boot` | PASS | Provider/system status rendered; unavailable diagnostics visible. |
| Global Scan | `/global-scan` | PASS | Scope and unavailable rows rendered safely; no false global multi-market evidence observed. |
| Data Streams | `/data-streams` | PASS | Page states REST/polling/snapshot limitations; no real streaming activation. |
| Operator Briefing | `/newsletter` | PASS | Internal briefing label; no external news provider claim. |
| Market Pulse | `/market-pulse` | PASS | Market state and unavailable data rendered safely. |
| Tactical Brain | `/tactical-brain` | PASS | Rendered with explicit unavailable states; no order execution. |
| Behavioral Brain | `/behavioral-brain` | PASS | Rendered without clinical claims or fabricated evidence in route QA. |
| Failsafe Brain | `/failsafe-brain` | PASS | Blocking/unavailable states visible. |
| Watchlists | `/watchlists` | PASS | Add/remove local workflow validated after fixes; missing prices no longer render as zero. |
| Alerts | `/alerts` | PASS | Rendered alert surface with no runtime errors. |
| Signals | `/signals` | PASS | Rendered safely with unavailable/blocked states. |
| Replay Center | `/replay-center` | PARTIAL | Page rendered; persistence CRUD blocked by local non-staging environment. |
| Trading Journal | `/trading-journal` | PARTIAL | Page rendered; persistence CRUD blocked by local non-staging environment. |
| Archives | `/archives` | PASS | Rendered safely. |
| Profiles | `/profiles` | PASS | Rendered safely. |
| Subscriptions | `/subscriptions` | PASS | Rendered safely. |
| System Settings | `/settings` | PASS | Display-only settings rendered; no operational activation controls observed. |

Note: `/system-settings` is not a current route in `FrontendReact/src/App.jsx`; the implemented System Settings route is `/settings`.

## Navigation Results

Classification: PASS

Validated from the authenticated Command Center sidebar:

- 18 navigation links were present and pointed to implemented current routes.
- Operator Briefing is labeled as Operator Briefing, not News.
- System Settings points to `/settings`.
- No navigation item advertised News Intelligence or Mission Planning as implemented.
- No navigation item labeled Data Streams as live streaming.

## Cross-Surface Integration

Classification: PARTIAL

Validated:

- Watchlists selected chart state rendered with explicit `DATA UNAVAILABLE` / `BACKEND UNAVAILABLE` labels.
- Global Scan and Market Pulse rendered chart contexts safely.
- Command Center integrated chart, summaries, warnings, and unavailable states without crashing.

Limitations:

- Provider backend was unavailable for market data, so validated positive-data symbol synchronization could not be confirmed.
- Stale-response overwrite behavior was not stress-tested with real provider responses.

## Console/Network Findings

Console errors: 0

Observed local provider/backend data state:

- Market data provider calls returned unavailable/offline states rather than validated quotes.
- UI surfaces preserved unavailable and blocked states.
- No visible `NaN`.
- No visible `undefined`.
- No blank protected route screens.

## Defects

| Severity | Defect | Status |
| --- | --- | --- |
| MODERATE | Watchlists rendered unavailable `null` price/change/confidence as `$0.00`, `+0.00%`, and `0%` because formatters coerced `null` through `Number(null)`. | FIXED |
| MODERATE | Watchlists static fallback rows could retain sample market values before provider failure normalization. | FIXED |
| LOW | Duplicate-symbol feedback could be overwritten or left stale by provider status messaging/removal flow. | FIXED |

## Fixes

Files modified:

- `FrontendReact/src/pages/Watchlists.jsx`

Exact fixes:

- Removed fallback price, change, volume, and confidence from static Watchlist fallback rows.
- Updated `formatPrice`, `formatChange`, `getChangeClass`, and `formatConfidence` to treat `null`, `undefined`, and empty string as unavailable before numeric coercion.
- Updated average confidence calculation to exclude unavailable confidence values before numeric coercion.
- Split operator symbol-management feedback into `symbolMessage` so duplicate/invalid feedback is not tied to provider status.
- Cleared symbol-management feedback on symbol removal.

## Remaining Gaps

- Cross-user RLS validation requires two authorized closed-beta operator accounts.
- Journal and Replay CRUD require a staging-enabled frontend environment with persistence enabled.
- Session expiry was not force-expired.
- Positive provider-data chart/symbol synchronization could not be validated because provider data was unavailable during local QA.

