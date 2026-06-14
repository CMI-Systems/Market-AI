# AICC Phase O.2.2 Backend Silent-Fallback Closure Audit

Audit date: 2026-06-14

Project: Market AI / AICC

Mode: Audit first. Backend code modified only for one confirmed residual silent fallback.

Required inputs reviewed:

- `docs/raw-data/O1_RAW_DATA_AUDIT.md`
- `docs/raw-data/O2_SIMULATION_REMOVAL_AUDIT.md`
- `docs/raw-data/O2_1_BACKEND_SIMULATION_ISOLATION.md`

## Executive Summary

O.2.2 result: PASS after one backend legacy-path fix.

The O.2.1 backend provider service and simulation policy successfully block backend simulation in staging, production, and unknown runtime modes. Market provider failures now return explicit unavailable states instead of generated quotes, generated candles, or simulated provider signals.

The O.2.2 audit found one confirmed residual silent fallback outside the O.2.1 provider service: legacy Alpaca helpers in `Backend/server.js` normalized malformed or partial latest-trade/latest-bar responses into zero-valued market records with current timestamps. That could make invalid provider payloads appear like live raw data on legacy routes such as `/api/stock/:symbol`, `/api/watchlist`, `/api/anomalies`, and `/api/summary`.

That residual path was fixed. The legacy helpers now require real provider fields and return explicit `RAW_DATA_UNAVAILABLE` metadata through route error responses when provider data is missing, malformed, partial, or timestamp-invalid.

Backend Raw-Data Readiness for silent-fallback closure: READY.

Raw Data Certification remains NOT YET CERTIFIED because frontend demo/offline fallback isolation and broader provenance enforcement remain open for O.2.3 and later phases.

## Files Inspected

Audit inputs:

- `docs/raw-data/O1_RAW_DATA_AUDIT.md`
- `docs/raw-data/O2_SIMULATION_REMOVAL_AUDIT.md`
- `docs/raw-data/O2_1_BACKEND_SIMULATION_ISOLATION.md`

Backend policy/config:

- `Backend/config/runtimePolicy.js`
- `Backend/config/environment.js`
- `Backend/config/deploymentManifest.js`
- `Backend/config/cloudDeploymentManifest.js`
- `Backend/RENDER_DEPLOYMENT.md`

Backend provider and market routes:

- `Backend/services/marketProviderService.js`
- `Backend/services/webullService.js`
- `Backend/providers/alpaca/alpacaAdapter.js`
- `Backend/providers/webull/webullAdapter.js`
- `Backend/providers/shared/marketEvent.js`
- `Backend/providers/shared/streamEnvelope.js`
- `Backend/routes/marketRoutes.js`
- `Backend/server.js`

Backend stream/status routes and services:

- `Backend/services/aiccSystemStatus.js`
- `Backend/services/streamController.js`
- `Backend/services/simulatedStreamRunner.js`
- `Backend/services/simulationMode.js`
- `Backend/routes/aiccRoutes.js`
- `Backend/routes/devStreamRoutes.js`
- `Backend/routes/apiV1Routes.js`
- `Backend/routes/cognitionRoutes.js`
- `Backend/services/aiccAlerts.js`
- `Backend/services/aiccReplay.js`

Additional backend source was searched with generated local data and `package-lock.json` excluded.

## Residual Simulation Search

Search terms included:

`simulation`, `simulated`, `simulate`, `synthetic`, `generated`, `mock`, `fake`, `placeholder`, `fallback`, `demo`, `random`, `fixture`, `seed`, `hardcoded`, `setInterval`, `Math.random`, `auto-start`, `autoStart`, `provider fallback`, and `empty-provider`.

| Category | Files / examples | Classification | Finding |
| --- | --- | --- | --- |
| Runtime simulation policy | `Backend/config/runtimePolicy.js`, `Backend/config/environment.js` | BLOCKED_IN_STAGING_PRODUCTION | Simulation fails closed unless explicitly enabled in `DEVELOPMENT` or `TEST`. |
| Provider service simulation helpers | `marketProviderService.js` `simulatedQuote()`, `simulatedCandles()` | EXPLICIT_DEV_TEST_ONLY | Simulation only runs when runtime policy authorizes a simulation request. Returned data is labeled `SIMULATED`. |
| Provider unavailable path | `marketProviderService.js` `unavailableQuote()`, empty candle array, unavailable signal | EXPLICIT_UNAVAILABLE_STATE | Provider failures no longer produce generated market values. |
| Market route `simulate` query | `marketRoutes.js` | BLOCKED_IN_STAGING_PRODUCTION | Blocked before service execution when policy rejects simulation. |
| AICC status `simulate` query | `aiccRoutes.js` | BLOCKED_IN_STAGING_PRODUCTION | Blocked before status generation. |
| Simulated stream runner | `simulatedStreamRunner.js`, `streamController.js`, `devStreamRoutes.js` | EXPLICIT_DEV_TEST_ONLY | Stream simulation remains only for explicitly enabled development/test. |
| Auto simulation boot | `server.js` `autoStartSimulatedStreamIfEnabled()` | BLOCKED_IN_STAGING_PRODUCTION | Auto-start is blocked by runtime policy. |
| Webull pending quote | `webullService.js` | EXPLICIT_UNAVAILABLE_STATE | Returns `ERROR` or `NOT_IMPLEMENTED` with `rawAvailable: false`; not presented as raw. |
| Provider adapters | `providers/alpaca/*`, `providers/webull/*`, `providers/shared/*` | RAW_PROVIDER_PATH | Normalizers do not create simulated market values; missing values normalize to null in shared events. |
| Cognition placeholder endpoints | `cognitionSnapshotStore.js`, cognition services/tests | HARMLESS_STATIC_METADATA / UNKNOWN | Awaiting-cognition defaults are not backend raw market data but remain a later provenance concern. |
| Crypto/random IDs | `aiccAlerts.js`, `aiccReplay.js`, memory/journal helpers | HARMLESS_STATIC_METADATA | IDs only; not market data. |
| Backend tests | `Backend/tests/*Simulation*`, other test fallback assertions | EXPLICIT_DEV_TEST_ONLY | Test-only simulation/fallback expectations. |
| Render deployment note | `Backend/RENDER_DEPLOYMENT.md` | UNKNOWN | Documentation still mentions simulation fallback for resilience; not runtime behavior, but should be updated in a future doc pass. |
| Legacy Alpaca helpers | `server.js` `getLiveStock()`, `getLatestStockBar()` | RESIDUAL_SILENT_FALLBACK, fixed | Malformed provider data previously became zero-price/bar data with current timestamps. Fixed in O.2.2. |

Residual silent fallback count found during audit: 1.

Residual silent fallback count after fix: 0.

## Provider Failure Verification

| Scenario | Verified behavior after O.2.2 | Result |
| --- | --- | --- |
| Provider credentials missing | `/api/market/*` provider service returns `PROVIDER_UNAVAILABLE`; no generated quote/candle. | PASS |
| Provider HTTP error | Provider service catches and returns unavailable quote or empty candles; no simulation unless authorized dev/test request. | PASS |
| Provider timeout | Same as HTTP error; `provider_timeout` simulation request is blocked outside authorized dev/test. | PASS |
| Provider malformed latest trade | Legacy helper now throws `RAW_DATA_UNAVAILABLE`; route returns explicit unavailable metadata. | PASS |
| Provider malformed latest bar | Legacy helper now throws `RAW_DATA_UNAVAILABLE`; anomaly and summary routes no longer infer zero-value bars. | PASS |
| Empty quote | Provider service unavailable object or legacy route unavailable error; no zero quote presented as raw. | PASS |
| Empty candles | Provider service returns empty candle array; no generated candles. | PASS |
| Partial data | Missing numeric fields or missing timestamps in legacy helpers throw unavailable errors. | PASS |
| Invalid timestamp | Legacy helper rejects invalid provider timestamps. | PASS |
| Response cannot be normalized | Explicit unavailable/error state; no synthetic provider substitution. | PASS |

## Route Verification

Routes audited:

- `/api/market/provider-status`
- `/api/market/provider-diagnostics`
- `/api/market/quotes`
- `/api/market/candles`
- `/api/market/provider-signals`
- `/api/aicc/system-status`
- `/api/dev/stream/start`
- `/api/dev/stream/stop`
- `/api/dev/stream/status`
- `/api/dev/metrics`
- legacy `/api/stock/:symbol`
- legacy `/api/watchlist`
- legacy `/api/chart/:symbol`
- legacy `/api/anomalies`
- legacy `/api/summary`
- `/api/v1/*` status/cognition/platform routes

Findings:

- `simulate` route parameters are blocked in staging, production, and unknown runtimes.
- Development/test simulation requires explicit authorization.
- Unknown runtime fails closed.
- Legacy Alpaca routes now reject missing/malformed provider data instead of returning zero-valued synthetic records.
- No backend route was found that silently changes source type from provider unavailable to raw/live/delayed.

## Stream Verification

| Stream area | Finding | Result |
| --- | --- | --- |
| Stream startup | `startStream({ source: "simulated" })` checks runtime policy. | PASS |
| Stream stop | Stop behavior clears active state and `simulationActive`. | PASS |
| Server boot | `MARKET_AI_AUTO_SIM` cannot start simulation unless policy allows it. | PASS |
| Market-hours logic | Market closed/after-hours states do not auto-start simulation. | PASS |
| Weekend/holiday behavior | System status reports `MARKET_CLOSED`, not market-closed simulation. | PASS |
| Provider outage | Provider outage returns unavailable; no stream substitution. | PASS |
| Reconnection behavior | No automatic reconnect-to-simulation path found. | PASS |
| System status stream source | Status reports `simulationAllowed`, `simulationActive`, `runtimeEnvironment`, `sourceType`, and availability booleans. | PASS |

## System Status Verification

Required fields verified in backend system status output:

- `runtimeEnvironment`
- `simulationAllowed`
- `simulationActive`
- `providerAvailable`
- `rawDataAvailable`
- `sourceType`
- `streamMode`

Status integrity checks:

- `simulationActive` remains false when provider data is unavailable in staging/production.
- `rawDataAvailable` remains false when provider data is missing.
- `providerAvailable` is not true solely because simulation exists.
- market-closed is represented as `MARKET_CLOSED`, not provider failure.
- unavailable provider data is represented explicitly.

## Provenance Verification

Backend market responses now consistently avoid ambiguous synthetic data in core provider paths.

| Response type | Provenance behavior | Result |
| --- | --- | --- |
| Raw Alpaca quote | `provider: ALPACA`, `sourceType: RAW_DELAYED`, `available: true`, `simulated: false`, `generated: false`. | PASS |
| Provider-unavailable quote | `provider: PROVIDER_UNAVAILABLE`, `sourceType: PROVIDER_UNAVAILABLE`, `available: false`, `simulated: false`, `generated: false`. | PASS |
| Raw candles | normalized raw provider candles; no generated candles on empty response. | PASS |
| Empty candles | empty array; no fabricated timestamps/prices. | PASS |
| Authorized dev/test simulation | `sourceType: SIMULATED`, `simulated: true`, `generated: true`. | PASS |
| Provider signals | `UNAVAILABLE` with confidence `0` when raw inputs are unavailable. | PASS |
| Legacy stock/watchlist | raw provider fields required; errors carry unavailable metadata. | PASS |
| Legacy anomaly/summary | malformed bars no longer become zero-value anomalies or no-anomaly summaries. | PASS |
| Webull pending quote | `rawAvailable: false`, `ERROR` or `NOT_IMPLEMENTED`; not labeled raw. | PASS |

Provenance Integrity: PASS.

## Intelligence Exposure Findings

| Source file | Route / path | Consumer | Risk level after O.2.2 | Can intelligence still appear valid from synthetic backend data? | Required correction |
| --- | --- | --- | --- | --- | --- |
| `marketProviderService.js` | `/api/market/quotes` | Tactical Brain, Command Center | LOW | No; provider failure returns unavailable metadata. | None for backend silent fallback. |
| `marketProviderService.js` | `/api/market/candles` | Tactical Brain, Command Center | LOW | No; provider failure returns empty candles. | Frontend unavailable-state handling remains O.2.3+. |
| `marketProviderService.js` | `/api/market/provider-signals` | Command Center, alerts, replay | LOW | No; unavailable signal confidence is 0. | None for backend silent fallback. |
| `aiccSystemStatus.js` | `/api/aicc/system-status` | Failsafe, System Boot, settings | LOW | No; simulation statuses are not auto-substituted. | Frontend copy alignment remains later. |
| `simulatedStreamRunner.js` | `/api/dev/stream/start` | Dev stream testing | LOW | Only in explicitly enabled dev/test and labeled simulated. | None. |
| `server.js` legacy Alpaca routes | `/api/stock`, `/api/watchlist`, `/api/anomalies`, `/api/summary` | Legacy market pages/external callers | LOW after fix | No; malformed provider data returns unavailable metadata. | Later route modernization/provenance consistency. |
| `cognitionSnapshotStore.js` and cognition routes | `/api/cognition/*`, `/api/v1/cognition/overview` | Command Center, Market Pulse, Global Scan | MODERATE | Not synthetic market data from backend provider, but provenance remains incomplete. | Later raw cognition provenance phase. |

## Runtime Verification Matrix

| Case | Expected | Observed | Result |
| --- | --- | --- | --- |
| A. DEVELOPMENT + explicit simulation enabled | Simulation permitted and labeled `SIMULATED`. | `simulationAllowed: true`; rejection null. | PASS |
| B. DEVELOPMENT + simulation disabled + provider available | Raw provider data. | Policy prefers raw provider path; simulation is not allowed without explicit flag. | PASS by policy/static verification |
| C. DEVELOPMENT + simulation disabled + provider unavailable | Explicit `DATA_UNAVAILABLE` or `PROVIDER_UNAVAILABLE`. | Quote `PROVIDER_UNAVAILABLE`, `available: false`, `simulated: false`, `generated: false`. | PASS |
| D. TEST + explicit simulation enabled | Simulation permitted and labeled. | `simulationAllowed: true`; simulation quote/candles labeled `SIMULATED`. | PASS |
| E. STAGING + simulation requested | `SIMULATION_NOT_ALLOWED`. | Rejection has `environment: STAGING`, `simulationAllowed: false`. | PASS |
| F. PRODUCTION + simulation requested | `SIMULATION_NOT_ALLOWED`. | Rejection has `environment: PRODUCTION`, `simulationAllowed: false`. | PASS |
| G. UNKNOWN environment + simulation requested | `SIMULATION_NOT_ALLOWED`. | Rejection has `environment: UNKNOWN`, reason `runtime_mode_missing`. | PASS |
| H. STAGING/PRODUCTION + provider failure | No synthetic fallback. | Quote unavailable, candles empty, signal unavailable, status rawDataAvailable false. | PASS |
| I. After-hours/weekend/holiday | `MARKET_CLOSED`, `RAW_DELAYED`, `RAW_CACHED`, or `DATA_UNAVAILABLE`; never automatic simulation. | Closed-market status reports `MARKET_CLOSED`, `simulationActive: false`. | PASS |

## Issues Found

### Issue 1: Legacy Alpaca helpers fabricated zero-value market records

Severity: HIGH before fix.

Files:

- `Backend/server.js`

Affected paths:

- `getLiveStock()`
- `getLatestStockBar()`
- `/api/stock/:symbol`
- `/api/watchlist`
- `/api/anomalies`
- `/api/summary`

Problem:

- Missing trade price could become `0`.
- Missing bar open/high/low/close/volume could become `0`.
- Missing trade/bar timestamp could become `Date.now()`.
- Anomaly logic could treat malformed bars as zero movement or no anomaly instead of unavailable raw data.

## Exact Fixes

`Backend/server.js` now:

- Adds `requireFiniteMarketNumber()` for strict numeric provider fields.
- Adds `requireProviderTimestamp()` for strict provider timestamps.
- Adds `rawDataUnavailableResponse()` for explicit unavailable route responses.
- Requires latest trade payloads before returning `/api/stock` or watchlist records.
- Requires latest bar payloads before anomaly calculations.
- Rejects malformed/partial provider data with `RAW_DATA_UNAVAILABLE`.
- Adds provenance fields to legacy raw records where returned:
  - `provider: ALPACA`
  - `sourceType: RAW_DELAYED`
  - `available: true`
  - `simulated: false`
  - `generated: false`
- Adds unavailable metadata to legacy route failure responses:
  - `available: false`
  - `sourceType: PROVIDER_UNAVAILABLE`
  - `provider: ALPACA`
  - `simulated: false`
  - `generated: false`
  - `error: RAW_DATA_UNAVAILABLE`

No frontend files were modified.

## Remaining Backend Simulation Paths

Backend simulation remains only in isolated development/test paths:

- `Backend/config/runtimePolicy.js`
- authorized `simulate` scenarios in `Backend/services/marketProviderService.js`
- `Backend/services/simulatedStreamRunner.js`
- `Backend/services/streamController.js`
- `Backend/routes/devStreamRoutes.js`
- backend simulation tests
- local/generated `Backend/data/journals/*` files, treated as local operator/test data, not raw market provider data

Backend simulation paths remaining: 4 runtime-capable categories, all gated as development/test only.

Development/test-only paths: 4.

## Remaining Frontend Simulation Paths

Not modified in O.2.2:

- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketDataService.js`
- closed-beta fallback inputs in Behavioral/Failsafe pages
- Replay and Journal placeholders

Recommended next step remains O.2.3 Frontend Demo and Offline Fallback Isolation.

## Risk Register

| Risk | Level | Status | Notes |
| --- | --- | --- | --- |
| Synthetic backend quote/candle can influence Tactical Brain while appearing raw | LOW after O.2.2 | Closed | Provider service no longer silently generates raw-looking data. |
| Legacy routes can produce zero-value raw-looking records | LOW after fix | Closed | Strict field validation added. |
| Frontend may still convert backend unavailable responses into confusing UI | MODERATE | Open | O.2.3 scope. |
| Cognition snapshot provenance remains incomplete | MODERATE | Open | Later provenance/Failsafe work. |
| Render deployment documentation mentions simulation fallback resilience | LOW | Open | Documentation needs later update; not runtime behavior. |
| Development workflows without explicit simulation flag may fail expected sim tests | LOW | Expected | Simulation must now be explicit. |

## O.2.2 Result

Backend Silent-Fallback Audit: PASS

Residual Silent Fallbacks: 1 found, 0 remaining after fix

Backend Simulation Paths Remaining: 4

Development/Test-Only Paths: 4

Staging/Production Simulation: BLOCKED

Provider Failure Behavior: EXPLICIT_UNAVAILABLE

Provenance Integrity: PASS

Backend Raw-Data Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2.3 Frontend Demo and Offline Fallback Isolation

## Final Confirmations

Frontend unchanged: YES

Training remains OFF: YES

Shadow Trainer remains OFF: YES

Production `market-ai-core` untouched: YES
