# AICC Phase O.2 Simulation Removal Audit

Audit date: 2026-06-14

Project: Market AI / AICC

Mode: Audit and planning only. No runtime behavior changed.

Required input reviewed: `docs/raw-data/O1_RAW_DATA_AUDIT.md`

## Executive Summary

O.2 result: PASS for audit completion.

AICC is not yet raw-data certified. The O.2 audit confirms that simulation, synthetic cognition, static mock market data, closed-beta fallback inputs, and hardcoded provider fallbacks remain able to influence operator-facing intelligence. The most urgent work is not broad removal in one pass; it is controlled isolation of backend market simulation and explicit replacement of silent fallbacks with unavailable, stale, market-closed, or provider-offline states.

The critical runtime risk is that simulated quote and candle data can still enter Tactical Brain and Command Center without a hard provenance block. Command Center then forwards that mixed input through Tactical, Behavioral, Failsafe, Consensus, Regime, and Narrative. Frontend cognition fallback can also synthesize market context when backend cognition fails, which can affect Behavioral Brain, Market Pulse, Global Scan, and the Command Center assessment.

O.2 does not remove simulation. It defines the exact removal, isolation, replacement, and labeling work required before AICC can pursue raw-data certification.

## Simulation Inventory

| ID | File | Function / route / env | Trigger condition | Current consumer | Intelligence outputs affected | Activation | Can run in production | Can influence brain verdict | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SIM-01 | `Backend/services/marketProviderService.js` | `FALLBACK_QUOTES` | Missing raw quote source or fallback path | Quote and candle fallbacks | Tactical, Command Center, provider signals | Silent through service fallback | Yes if backend fallback reached | Yes | REMOVE |
| SIM-02 | `Backend/services/marketProviderService.js` | `fallbackQuote()` | Alpaca error, timeout, missing provider, `simulate` query | `/api/market/quotes`, provider signals | Tactical, Command Center, Consensus, Regime, Narrative | Silent except some warnings | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-03 | `Backend/services/marketProviderService.js` | `fallbackCandles()` | Alpaca error, timeout, empty bars, missing provider, `simulate` query | `/api/market/candles`, provider signals | Tactical, Command Center, Consensus, Regime, Narrative | Silent except some warnings | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-04 | `Backend/services/marketProviderService.js` | `getQuote()` fallback branch | `quotes_down`, `provider_timeout`, `alpaca_down`, `no_provider`, Alpaca failure | Market routes, frontend provider API | Tactical, Command Center | Explicit via query or silent via failure | Yes | Yes | REPLACE_WITH_RAW_PROVIDER |
| SIM-05 | `Backend/services/marketProviderService.js` | `getHistoricalCandles()` fallback branch | `candles_down`, `provider_timeout`, `alpaca_down`, `no_provider`, empty Alpaca bars | Market routes, frontend provider API | Tactical, Command Center | Explicit via query or silent via failure | Yes | Yes | REPLACE_WITH_RAW_PROVIDER |
| SIM-06 | `Backend/services/marketProviderService.js` | `getProviderSignals()` | Signals derive from fallback quotes/candles | `/api/market/provider-signals`, AICC alerts/replay context | Command Center, Tactical page, Narrative context | Silent when upstream fallback is silent | Yes | Yes | REPLACE_WITH_RAW_PROVIDER |
| SIM-07 | `Backend/routes/marketRoutes.js` | `?simulate=` on provider status, diagnostics, quotes, candles, signals | Operator or caller passes simulate query | Frontend API consumers, manual requests | Tactical, Command Center, Failsafe | Explicit to caller, not globally gated | Yes unless production gated elsewhere | Yes | DISABLE_IN_PRODUCTION |
| SIM-08 | `Backend/services/simulatedStreamRunner.js` | simulated stream event generation | `/api/dev/stream/start` or auto-start | live ingestion, brain supervisor, runtime metrics | Cognition memory and derived intelligence | Explicit route or auto boot | Yes if dev route/env available | Yes, indirectly | ISOLATE_TO_DEVELOPMENT |
| SIM-09 | `Backend/services/streamController.js` | simulated-only active stream controller | `source: simulated`; provider streams not connected | Dev stream routes | Runtime metrics, cognition memory | Explicit route | Yes if route available | Yes, indirectly | ISOLATE_TO_DEVELOPMENT |
| SIM-10 | `Backend/server.js` | `MARKET_AI_AUTO_SIM` boot path | Env flag true | simulated stream runner | Cognition memory and derived intelligence | Environment controlled | Yes if env enabled | Yes, indirectly | DISABLE_IN_PRODUCTION |
| SIM-11 | `Backend/services/aiccSystemStatus.js` | `resolveStreamMode()` simulation labels | Market closed, after hours, provider unavailable | AICC routes, System Boot, Failsafe page | Failsafe, System status, operator trust | Automatic | Yes | Yes, via Failsafe context | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-12 | `Backend/server.js` | Legacy anomaly baseline volumes | Legacy `/api/anomalies` path | Legacy pages or external callers | Legacy signals/anomalies | Silent hardcoded baseline | Yes if route used | Requires investigation | REQUIRES_INVESTIGATION |
| SIM-13 | `FrontendReact/src/services/cognitionApi.js` | `VITE_DEMO_MODE` | Env flag true | Command Center, Market Pulse, Global Scan, Behavioral Brain, System Boot | Behavioral, Consensus, Regime, Narrative | Explicit env | Yes if deployment env set | Yes | ISOLATE_TO_DEVELOPMENT |
| SIM-14 | `FrontendReact/src/services/cognitionApi.js` | fetch-failure `getDemoResponse()` | Backend cognition request fails | Command Center, Market Pulse, Global Scan, Behavioral Brain, System Boot | Behavioral, Consensus, Regime, Narrative | Silent on fetch failure | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-15 | `FrontendReact/src/services/demoCognition.js` | synthetic cognition response factory | Demo mode or fetch failure | cognition API wrapper | Behavioral, Market Pulse, Global Scan, Command Center | Explicit or silent via wrapper | Yes through wrapper | Yes | KEEP_FOR_TESTING_ONLY |
| SIM-16 | `FrontendReact/src/services/marketProviderApi.js` | offline provider status and diagnostics | Backend provider API fetch fails | Data Streams, System Boot, Command Center, Failsafe page | Failsafe, operator provider trust | Silent on fetch failure | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-17 | `FrontendReact/src/services/aiccApi.js` | offline system status, alerts, replay fallbacks | Backend AICC API fetch fails | Failsafe Brain, Trading Journal, Replay Center, System Settings | Failsafe, replay context, operator trust | Silent on fetch failure | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-18 | `FrontendReact/src/services/marketDataService.js` | static mock watchlists, candles, stream cards, active events | Page import/runtime use | Data Streams and legacy market pages | Page-level market displays | Always local when used | Yes | Possible via operator interpretation | REPLACE_WITH_RAW_PROVIDER |
| SIM-19 | `FrontendReact/src/pages/BehavioralBrain.jsx` | closed-beta behavioral fallback object | Live behavioral inputs unavailable | Behavioral Brain page | Behavioral verdict and narrative | Labeled but still operational | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-20 | `FrontendReact/src/pages/FailsafeBrain.jsx` | closed-beta tactical/behavioral fallbacks and mock history | Live validation inputs unavailable | Failsafe Brain page | Failsafe verdict and reliability | Labeled but still operational | Yes | Yes | REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE |
| SIM-21 | `FrontendReact/src/pages/ReplayCenter.jsx` | sample trades, mistake intelligence, debrief placeholders | Direct replay access or no journal state | Replay UI and dataset visibility layers | Replay/dataset workflow only | Explicit placeholder UI | Yes | No market brain verdict directly | KEEP_AS_NON_MARKET_PLACEHOLDER |
| SIM-22 | `FrontendReact/src/pages/TradingJournal.jsx` | placeholder trade assessment and journal defaults | Empty journal or sample workflow | Journal -> Replay handoff | Replay/dataset workflow only | Explicit placeholder UI | Yes | No market brain verdict directly | KEEP_AS_NON_MARKET_PLACEHOLDER |
| SIM-23 | `Backend/data/journals/*` and backend tests | local generated/test records | Test/local filesystem use | Backend tests, local journal services | Potential historical/replay context | Development/test context | Unknown if mounted in production | Indirect only | KEEP_FOR_TESTING_ONLY |

## Removal Classification

| Classification | Paths | Required future action |
| --- | --- | --- |
| REMOVE | SIM-01 | Remove hardcoded quote tables from runtime provider fallback. Keep any needed constants only in test fixtures. |
| DISABLE_IN_PRODUCTION | SIM-07, SIM-10 | Block simulation query controls and auto simulation boot in production-like environments. Require explicit development-only enablement. |
| ISOLATE_TO_DEVELOPMENT | SIM-08, SIM-09, SIM-13 | Keep simulation tools only for local cockpit testing with clear dev gates and operator labels. |
| REPLACE_WITH_RAW_PROVIDER | SIM-04, SIM-05, SIM-06, SIM-18 | Use raw provider data where available; otherwise return explicit unavailable/stale/provider-offline state. |
| REPLACE_WITH_EXPLICIT_UNAVAILABLE_STATE | SIM-02, SIM-03, SIM-11, SIM-14, SIM-16, SIM-17, SIM-19, SIM-20 | Stop generating intelligence-looking substitutes. Return no-data status with provenance, warnings, and confidence caps. |
| KEEP_FOR_TESTING_ONLY | SIM-15, SIM-23 | Keep isolated from runtime and deployment data paths. |
| KEEP_AS_NON_MARKET_PLACEHOLDER | SIM-21, SIM-22 | Keep only as operator workflow placeholders, clearly separated from raw market data and future training claims. |
| REQUIRES_INVESTIGATION | SIM-12 | Verify current consumers of legacy anomaly route and replace hardcoded baselines if route remains active. |

## Critical Runtime Paths

Critical paths are paths that can affect core intelligence, appear live to operators, or create disagreement between frontend and backend provenance.

1. Backend quote fallback can replace provider failure with simulated quotes and feed Tactical Brain.
2. Backend candle fallback can replace empty or failed provider candles with generated candles and feed Tactical Brain.
3. Provider signals can be derived from simulated quotes/candles and enter Command Center.
4. Market route `?simulate=` parameters can force simulation through production-accessible endpoints if not gated.
5. `MARKET_AI_AUTO_SIM` can start simulated streams on backend boot and feed live ingestion.
6. Simulated stream runner can populate cognition memory through backend ingestion.
7. AICC system status automatically maps closed-market and after-hours states to simulation modes.
8. Frontend cognition fetch failures can silently become demo cognition and feed Behavioral Brain, Market Pulse, Global Scan, and Command Center.
9. Frontend provider diagnostics fallback can report simulation as active and influence Failsafe context.
10. Behavioral and Failsafe closed-beta fallback inputs can produce verdicts from non-raw context.

Critical paths identified: 10.

## Backend Removal Plan

### `marketProviderService.js`

Future required behavior:

- Replace `fallbackQuote()` runtime usage with explicit `DATA_UNAVAILABLE` or `PROVIDER_OFFLINE` quote responses.
- Replace `fallbackCandles()` runtime usage with explicit empty candle responses plus `dataAvailable: false`, `sourceType: DATA_UNAVAILABLE`, and warnings.
- Remove `FALLBACK_QUOTES` from runtime provider paths. If fixtures are needed, move them to test-only data.
- `getQuote()` should return raw normalized Alpaca data when available. On provider failure, missing credentials, timeout, or `no_provider`, it should return unavailable metadata, not simulated prices.
- `getHistoricalCandles()` should return raw candles when available. Empty provider bars should remain empty and carry a no-data reason, not generated waves.
- `getProviderSignals()` should refuse to create provider signals when quote/candle provenance is not raw or delayed raw.
- Add explicit provenance fields in future implementation: `sourceType`, `provider`, `providerStatus`, `dataAvailable`, `stale`, `lastProviderTimestamp`, `fallbackUsed`, and `simulationReason`.

### `marketRoutes.js`

Future required behavior:

- Gate `?simulate=` parameters behind development-only controls.
- In production-like environments, reject simulation query values or ignore them with a clear warning.
- Document every simulation route as non-production test tooling.

### `simulatedStreamRunner.js` and `streamController.js`

Future required behavior:

- Keep simulated stream runner for local development and tests only.
- Prevent simulated stream ingestion from writing to production cognition, production-like persistence, or operator-facing raw-data certification paths.
- Require clear provenance on all stream events: `sourceType: SIMULATED`.
- Provider stream placeholders should become `PROVIDER_STREAM_NOT_CONNECTED` or `DATA_UNAVAILABLE`, not a reason to start simulation.

### `server.js` and `MARKET_AI_AUTO_SIM`

Future required behavior:

- Disable auto simulated stream startup in production-like environments.
- Treat `MARKET_AI_AUTO_SIM=true` as a local/dev-only flag.
- If production startup sees simulation enabled, system boot should surface a blocking configuration warning.

### `aiccSystemStatus.js`

Future required behavior:

- Replace automatic `AFTER_HOURS_SIMULATION`, `MARKET_CLOSED_SIMULATION`, and `FALLBACK_SIMULATION` status with explicit market/provider states.
- Use `MARKET_CLOSED`, `AFTER_HOURS`, `PRE_MARKET`, `PROVIDER_OFFLINE`, `DATA_UNAVAILABLE`, or `RAW_DELAYED` where appropriate.
- Do not imply simulated data is a valid substitute for closed or unavailable markets.

### Legacy Backend Routes

Future required behavior:

- Audit `/api/anomalies`, `/api/summary`, `/api/watchlist`, `/api/chart/:symbol`, and `/api/stock/:symbol` for hardcoded baselines and stale raw-data assumptions.
- If these routes remain accessible, add provenance and unavailable-state behavior consistent with `/api/market/*`.

## Frontend Removal Plan

### `cognitionApi.js` and `demoCognition.js`

Future required behavior:

- Keep `VITE_DEMO_MODE` as development-only and visibly labeled when active.
- Fetch failure should return `COGNITION_UNAVAILABLE`, not demo cognition.
- Demo cognition must not feed Command Center or brain verdicts in production-like environments.
- `demoCognition.js` can remain as a test/demo fixture only.

### `marketProviderApi.js`

Future required behavior:

- Replace offline simulation provider status with `PROVIDER_OFFLINE` or `DATA_UNAVAILABLE`.
- Do not report `activeProvider: SIMULATION` as a normal fallback when backend requests fail.
- Preserve operator-facing warnings and pass provenance to Failsafe.

### `aiccApi.js`

Future required behavior:

- Backend AICC outage should return `AICC_UNAVAILABLE` or `BACKEND_OFFLINE`, not generated alerts or replay events.
- Failsafe should receive backend outage as a reliability concern, not a usable fallback intelligence source.

### `marketDataService.js`

Future required behavior:

- Replace runtime market cards, candles, watchlists, and active stream events with raw provider-backed data or explicit empty states.
- If mock data remains, isolate it behind local demo/test imports and avoid production page imports.

### Brain Pages

Future required behavior:

- `BehavioralBrain.jsx` should show `LIMITED_INPUTS` or `DATA_UNAVAILABLE` when live behavioral context is missing instead of producing a full-looking fallback verdict.
- `FailsafeBrain.jsx` should show missing validation inputs as a reliability block, not as complete fallback tactical/behavioral snapshots.
- `TacticalBrain.jsx` should cap or block tactical confidence when quote/candle provenance is missing, stale, simulated, or unknown.

### Command Center

Future required behavior:

- The orchestrator input should carry provenance for quote, candles, cognition, provider status, and page-level fallbacks.
- Market Status should display unavailable/stale/provider-offline states instead of simulated intelligence.
- Consensus, Regime, and Narrative should not present high-confidence conclusions when upstream raw-data provenance is compromised.

## Placeholder Separation

### A. Market-data simulation that must not influence intelligence

These paths must be removed, disabled, isolated, or replaced before raw-data certification:

- Backend quote and candle simulation.
- Provider signal generation from simulated inputs.
- Route-level market simulation controls in production.
- Auto simulated stream boot.
- Demo cognition in production-like paths.
- Frontend provider/AICC fallbacks that look like usable intelligence.
- Brain fallback inputs that produce verdicts from non-raw context.
- Static market cards or mock candles in runtime market pages.

### B. Harmless UI placeholders that can remain with labeling

These placeholders do not need immediate removal if they stay clearly outside raw market intelligence:

- Replay Center sample trades when opened without journal state.
- Trading Journal placeholder form copy and empty journal defaults.
- Login input placeholders.
- Static section labels such as Verdict, Status Board, Sources, and Warnings.
- Documentation examples and test fixtures that cannot affect runtime.

The rule is not "remove all placeholder text." The rule is that placeholder or simulated data must never masquerade as raw market data or produce a market intelligence verdict without explicit labeling and Failsafe restriction.

## Replacement Matrix

| Current path | Future replacement | Required operator-facing state | Failsafe action |
| --- | --- | --- | --- |
| Simulated quote fallback | Raw provider quote or unavailable quote response | `PROVIDER_OFFLINE` or `DATA_UNAVAILABLE` | Data integrity degraded or compromised |
| Simulated candle fallback | Raw provider candles or empty no-data response | `DATA_UNAVAILABLE`, `STALE`, or `MARKET_CLOSED` | Tactical confidence capped; warnings required |
| Provider signals from simulated inputs | Signals only from raw/delayed raw inputs | `SIGNALS_UNAVAILABLE` | Validation weak or no validation |
| `?simulate=` production routes | Dev-only route behavior | `SIMULATION_DISABLED_IN_PRODUCTION` | Block production provenance |
| Auto simulated stream | Dev-only stream startup | `SIMULATION_DISABLED` | Prevent ingestion into certified paths |
| After-hours simulation status | Market session status | `AFTER_HOURS`, `MARKET_CLOSED`, or `RAW_DELAYED` | No simulation assumption |
| Cognition demo fetch fallback | Cognition unavailable response | `COGNITION_UNAVAILABLE` | Behavioral context degraded |
| Provider diagnostics offline simulation | Provider offline response | `PROVIDER_OFFLINE` | Reliability reduced |
| AICC fallback alerts/replay | AICC backend unavailable response | `AICC_UNAVAILABLE` | Reliability reduced |
| Static market service data | Provider-backed data or empty-state UI | `RAW_DATA_ONLY`, `UNAVAILABLE` | Block as market evidence if mock |
| Behavioral closed-beta fallback | Limited-input unavailable state | `LIMITED_BEHAVIORAL_INPUTS` | Confidence capped |
| Failsafe closed-beta fallback snapshots | Missing-validation state | `VALIDATION_INPUTS_UNAVAILABLE` | Reliability capped |

## Market-Hours Policy

Simulation must not automatically substitute for unavailable raw data in any market session.

| Session / condition | Future allowed states | Policy |
| --- | --- | --- |
| Pre-market | `RAW_LIVE`, `RAW_DELAYED`, `STALE`, `DATA_UNAVAILABLE` | Use provider data only if the provider supplies pre-market data. Otherwise show unavailable or stale state. |
| Regular market hours | `RAW_LIVE`, `RAW_DELAYED`, `STALE`, `PROVIDER_OFFLINE`, `DATA_UNAVAILABLE` | Never replace provider failure with simulation. |
| After-hours | `RAW_LIVE`, `RAW_DELAYED`, `MARKET_CLOSED`, `STALE`, `DATA_UNAVAILABLE` | Use extended-hours raw data only if verified. Otherwise mark market/session state. |
| Overnight | `MARKET_CLOSED`, `STALE`, `RAW_CACHED`, `DATA_UNAVAILABLE` | Cached data may be displayed only with freshness labeling. |
| Weekends | `MARKET_CLOSED`, `RAW_CACHED`, `STALE`, `DATA_UNAVAILABLE` | No simulated live market state. |
| Market holidays | `MARKET_CLOSED`, `RAW_CACHED`, `STALE`, `DATA_UNAVAILABLE` | Requires holiday calendar enforcement before certification. |
| Provider outage | `PROVIDER_OFFLINE`, `DATA_UNAVAILABLE`, `STALE` | Do not synthesize replacement quotes, candles, signals, or cognition. |
| Backend outage | `BACKEND_OFFLINE`, `DATA_UNAVAILABLE` | Frontend should not synthesize intelligence. |

## Failsafe Requirements

Failsafe Brain needs provenance enforcement before raw-data certification. Future implementation should detect and block or downgrade:

- `SIMULATED`
- `SYNTHETIC`
- `PLACEHOLDER`
- `HARDCODED_FALLBACK`
- `STALE`
- `UNKNOWN_SOURCE`
- `PROVIDER_OFFLINE`
- `BACKEND_OFFLINE`
- `INVALID_TIMESTAMP`
- `PARTIAL_DATA`
- `MISSING_PROVIDER_TIMESTAMP`
- `EMPTY_CANDLES`
- `MISSING_QUOTE`

Required controls:

- Add source/provenance metadata to market provider responses and orchestrator input.
- Treat simulated, synthetic, placeholder, and unknown-source data as validation failures for market verdicts.
- Cap Tactical, Behavioral, Consensus, Regime, and Narrative confidence when provenance is not raw, delayed raw, or explicitly cached.
- Surface warnings in Command Center and brain pages when raw-data provenance is compromised.
- Prevent Narrative from explaining simulated or placeholder data as if it were live market intelligence.
- Add a Failsafe state or warning for `RAW_DATA_CERTIFICATION_BLOCKED`.

## Implementation Sequence

These steps are future implementation sprints. They are not executed during O.2.

### O.2.1 Backend simulation isolation

- Gate `?simulate=` behavior to development/test only.
- Disable `MARKET_AI_AUTO_SIM` in production-like environments.
- Make `/api/dev/stream/*` development-only.
- Ensure simulated stream events cannot enter certified runtime paths.

### O.2.2 Silent fallback removal

- Replace quote and candle fallback generation with explicit unavailable responses.
- Remove runtime dependency on `FALLBACK_QUOTES`.
- Prevent provider signals from using non-raw inputs.

### O.2.3 Frontend demo fallback isolation

- Stop `cognitionApi.js` from returning demo cognition on fetch failure.
- Restrict `VITE_DEMO_MODE` to local/dev environments.
- Replace frontend provider/AICC offline fallbacks with unavailable states.

### O.2.4 Explicit unavailable-state implementation

- Standardize frontend states: `LOADING`, `STALE`, `UNAVAILABLE`, `PROVIDER_OFFLINE`, `BACKEND_OFFLINE`, `MARKET_CLOSED`, `RAW_DATA_ONLY`.
- Ensure pages render cleanly without simulated replacements.

### O.2.5 Market-hours raw-data policy

- Add certified handling for pre-market, regular hours, after-hours, overnight, weekends, holidays, and provider outages.
- Add holiday/early-close awareness before raw-data certification.

### O.2.6 Failsafe provenance enforcement

- Add provenance fields from backend to frontend to orchestrator.
- Teach Failsafe to hard-downgrade simulated, synthetic, placeholder, stale, partial, or unknown inputs.
- Cap confidence and reliability when provenance is compromised.

### O.2.7 Simulation dependency re-audit

- Re-run O.1/O.2 searches.
- Confirm no production intelligence path silently uses simulation.
- Confirm remaining placeholders are non-market or development-only.

## Risk Register

| Planned change | Breakage risk | Pages affected | Services affected | Expected unavailable states | Testing requirements | Rollback considerations |
| --- | --- | --- | --- | --- | --- | --- |
| Disable production `?simulate=` | Low | Provider diagnostics pages, manual calls | `marketRoutes.js`, `marketProviderService.js` | `SIMULATION_DISABLED_IN_PRODUCTION` | Route tests for dev and production envs | Re-enable only behind dev flag |
| Remove quote fallback substitution | High | Command Center, Tactical Brain, Signals, Watchlists | `marketProviderService.js`, `marketProviderApi.js` | `PROVIDER_OFFLINE`, `DATA_UNAVAILABLE` | Provider outage tests, empty quote UI tests | Restore unavailable response shape, not simulation |
| Remove candle fallback substitution | High | Command Center, Tactical Brain, chart pages | `marketProviderService.js`, chart consumers | `DATA_UNAVAILABLE`, `EMPTY_CANDLES`, `STALE` | Empty candle tests, tactical fallback tests | Roll back to no-data payload if UI fails |
| Block provider signals from non-raw data | Moderate | Command Center, Tactical Brain, AICC alerts | `getProviderSignals()` | `SIGNALS_UNAVAILABLE` | Signal route tests and Command Center fallback tests | Allow disabled signal panel, not simulated signals |
| Isolate simulated stream runner | Moderate | Dev stream dashboard, runtime metrics | `server.js`, `streamController.js`, `simulatedStreamRunner.js` | `SIMULATION_DISABLED` | Dev route tests, boot tests | Re-enable only local/test |
| Replace cognition demo fetch fallback | High | Command Center, Behavioral Brain, Market Pulse, Global Scan | `cognitionApi.js`, `demoCognition.js` | `COGNITION_UNAVAILABLE` | Backend outage UI tests | Dev-only demo flag remains |
| Replace frontend provider offline simulation | Moderate | Data Streams, System Boot, Failsafe Brain | `marketProviderApi.js` | `PROVIDER_OFFLINE` | Offline backend UI tests | Keep error-safe fallback shape |
| Replace AICC API fallback objects | Moderate | Failsafe, Journal, Replay, System Settings | `aiccApi.js` | `AICC_UNAVAILABLE`, `BACKEND_OFFLINE` | Backend outage tests | Keep minimal unavailable object |
| Compress brain fallback inputs to unavailable states | Moderate | Behavioral Brain, Failsafe Brain | Page builders and Failsafe input mapping | `LIMITED_INPUTS`, `VALIDATION_INPUTS_UNAVAILABLE` | Page rendering and confidence cap tests | Keep display, not verdict-producing fallback |
| Enforce Failsafe provenance blocks | High | All intelligence surfaces | Failsafe, orchestrator, backend provider payloads | `RAW_DATA_CERTIFICATION_BLOCKED` | End-to-end missing/simulated/stale data tests | Gradual rollout with warnings before hard block |

## Files Requiring Future Modification

Backend:

- `Backend/services/marketProviderService.js`
- `Backend/routes/marketRoutes.js`
- `Backend/services/aiccSystemStatus.js`
- `Backend/services/simulatedStreamRunner.js`
- `Backend/services/streamController.js`
- `Backend/routes/devStreamRoutes.js`
- `Backend/server.js`
- `Backend/config/environment.js`
- `Backend/services/marketHours.js`
- `Backend/services/brain/brainSupervisor.js`
- `Backend/RENDER_DEPLOYMENT.md`

Frontend:

- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketDataService.js`
- `FrontendReact/src/services/intelligence/aiccIntelligenceOrchestrator.js`
- `FrontendReact/src/services/intelligence/failsafeBrain.js`
- `FrontendReact/src/services/intelligence/dataIntegrityEngine.js`
- `FrontendReact/src/services/intelligence/validationEngine.js`
- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/pages/TacticalBrain.jsx`
- `FrontendReact/src/pages/BehavioralBrain.jsx`
- `FrontendReact/src/pages/FailsafeBrain.jsx`
- `FrontendReact/src/pages/MarketPulse.jsx`
- `FrontendReact/src/pages/GlobalScan.jsx`
- `FrontendReact/src/pages/DataStreams.jsx`
- `FrontendReact/src/pages/SystemBoot.jsx`
- `FrontendReact/src/pages/SystemSettings.jsx`
- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/pages/TradingJournal.jsx`
- `FrontendReact/src/pages/ReplayCenter.jsx`
- `FrontendReact/.env.example`
- `FrontendReact/.env.staging.example`

Documentation / deployment:

- `docs/raw-data/O1_RAW_DATA_AUDIT.md`
- `docs/raw-data/O2_SIMULATION_REMOVAL_AUDIT.md`
- Deployment environment documentation for Render and frontend hosting.

## O.2 Certification Result

Simulation Removal Audit: PASS

Simulation Paths Identified: 23

Critical Paths: 10

Paths Requiring Removal: 3

Paths Requiring Raw Replacement: 7

Development-Only Paths: 5

Unknown Paths Remaining: 4

Runtime Behavior Modified: NO

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2.1 Backend Simulation Isolation

### Unknown Paths Remaining

1. Whether production Render has `MARKET_AI_AUTO_SIM` enabled.
2. Whether all deployed frontend environments keep `VITE_DEMO_MODE=false`.
3. Whether backend cognition snapshots in persistent/local memory are raw-derived, simulated, or mixed.
4. Whether all legacy market pages still consume `marketDataService.js` mock values at runtime.

## Recommended O.2.1 Implementation Sprint

Goal: isolate backend simulation so no production-like runtime can accidentally invoke simulated provider data or simulated streams.

Recommended scope:

1. Add a backend helper that determines whether simulation controls are allowed for the current environment.
2. Gate `?simulate=` in `marketRoutes.js` and return an explicit blocked simulation response in production-like environments.
3. Gate `/api/dev/stream/*` or ensure it cannot start simulated ingestion outside local development.
4. Prevent `MARKET_AI_AUTO_SIM` from starting simulated streams in production-like environments.
5. Preserve local test/dev simulation for controlled development only.
6. Add route/service tests proving production simulation controls are blocked and development controls still work.

Out of scope for O.2.1:

- Removing quote/candle fallback generation.
- Replacing frontend demo cognition.
- Rewriting Failsafe provenance enforcement.
- Changing provider selection or Alpaca credentials.
- Activating persistence, training, or Shadow Trainer.

## Final Notes

This document is a removal plan, not an implementation. Runtime behavior remains unchanged. Simulation, fallback, demo, and placeholder paths identified here still exist until future O.2.x implementation phases remove, isolate, or replace them.

Training remains OFF.

Shadow Trainer remains OFF.

Production `market-ai-core` remains untouched.
