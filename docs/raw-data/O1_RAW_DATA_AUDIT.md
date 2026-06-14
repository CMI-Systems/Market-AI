# AICC Phase O.1 Raw Data Audit

Audit date: 2026-06-14

Project: Market AI / AICC

Mode: Audit only. No runtime behavior changed.

## Executive Summary

O.1 result: FAIL

AICC is not yet raw-data certified. The system has live Alpaca REST paths for equities quotes and candles, but live paths are mixed with simulation fallbacks, frontend offline fallbacks, demo cognition, static mock market data, placeholder behavioral/failsafe inputs, generated replay/journal samples, and backend cognition snapshots that are not fully traceable to raw market data.

The most important finding is that provider failure, missing provider credentials, empty Alpaca candles, after-hours system status, and frontend backend failures can all result in simulated or fallback data being displayed or passed into intelligence flows. Tactical Brain can consume simulated candles/quotes from the backend provider fallback. Command Center can feed those values into the orchestrator. Behavioral, Failsafe, Consensus, Regime, and Narrative outputs are heavily influenced by derived or placeholder context, not verified raw market datasets.

Raw Data Audit: FAIL

Raw Data Coverage: 40%

Simulation Dependency: CRITICAL

Unknown Data Paths: 8

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2 Simulation Removal Audit

## Provider Inventory

| Provider / Source | Data supplied | Runtime location | Consumer | Classification | Auth | Fallback behavior | Market-hours behavior | Failure behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alpaca REST | Latest trade, latest bar, historical bars | Backend `marketProviderService.js`, legacy routes in `server.js` | `/api/market/quotes`, `/api/market/candles`, `/api/market/provider-signals`, legacy `/api/stock`, `/api/chart`, `/api/anomalies` | RAW_LIVE or RAW_DELAYED depending Alpaca/IEX feed terms; app does not label delay explicitly | Backend env only: `ALPACA_API_KEY`, `ALPACA_SECRET_KEY`, `ALPACA_DATA_URL` / `ALPACA_BASE_URL` | Falls back to SIMULATION quotes/candles on error, empty bars, missing credentials, or simulate query | Market status is tracked separately; REST calls still run outside regular hours where provider responds | Silent fallback to simulated quote/candles in provider service |
| Webull | Intended quotes/candles/options capability metadata | Backend `webullService.js`, adapter files | Provider status and Webull health views | UNKNOWN / PLACEHOLDER | Backend env only: `WEBULL_APP_KEY`, `WEBULL_APP_SECRET`, `WEBULL_ENABLED`, `WEBULL_ENV` | Not implemented quote returns status `NOT_IMPLEMENTED` or `ERROR` with zero values | No live Webull market-hours integration | No raw Webull market data currently available |
| Backend simulation fallback | Quotes, candles, provider status, provider signals | `marketProviderService.js` | Market routes, Command Center, Tactical Brain, AICC alerts/replay | SIMULATED / HARDCODED_FALLBACK | None | Hardcoded fallback quotes and generated candle waves | Can be active during market hours if provider unavailable; can be shown as active provider `SIMULATION` | Replaces failed provider responses |
| Simulated stream runner | Trade events | `simulatedStreamRunner.js`, `streamController.js`, `/api/dev/stream/*` | Backend live ingestion, brain supervisor, runtime metrics | SIMULATED | Dev route access; no provider auth | Local stream generates deterministic fake trade events | Auto stream mode can use `shadow` during market hours or `closed-market-sim` after hours if `MARKET_AI_AUTO_SIM=true` | No live provider stream connected |
| Frontend market provider offline fallback | Provider status and diagnostics only | `marketProviderApi.js` | Data Streams, System Boot, Command Center, Failsafe page | HARDCODED_FALLBACK | None | Returns offline provider objects with active provider `SIMULATION` | Independent of market hours | Activates when backend request fails |
| Frontend cognition demo mode | Cognition overview, confidence, memory, priority feed, etc. | `cognitionApi.js`, `demoCognition.js` | Command Center, Behavioral Brain, Market Pulse, Global Scan, System Boot | SIMULATED / SYNTHETIC | Controlled by `VITE_DEMO_MODE` | Demo responses also returned on request failure even when demo mode is false | Cycles by wall-clock time | Silently substitutes demo cognition on failed fetch |
| Frontend static market data service | Watchlist quotes, candles, signals, stream statuses | `marketDataService.js` | Data Streams static cards and likely legacy chart/watchlist pages | MOCK / HARDCODED_FALLBACK | None | Always static data | No session handling | No provider dependency |
| AICC API frontend fallback | System status, alerts, replay events | `aiccApi.js` | Failsafe Brain, Trading Journal, Replay Center, System Settings | HARDCODED_FALLBACK | None | Returns fallback system/alert/replay objects when backend unavailable | No session handling | Frontend fallback masks backend outage |
| Backend cognition snapshot store | Cognition summaries and many endpoints | `cognitionSnapshotStore.js` | `/api/cognition/*`, Command Center, Market Pulse, Global Scan | PLACEHOLDER / DERIVED_FROM_INTERNAL / UNKNOWN | None | Returns awaiting/default cognition when no snapshot exists | No market-hours enforcement | Not clearly tied to raw provider events |
| Backend local journal data | Journal JSON records | `Backend/data/journals/*`, journal services | Journal/replay tests and local persistence paths | FIXTURE / LOCAL_PERSISTED_OPERATOR_DATA | Local filesystem | Large generated data set exists | Not market-hours related | Not raw market data |

## Simulation Inventory

High-impact runtime simulation and fallback paths:

- `Backend/services/marketProviderService.js`
  - `FALLBACK_QUOTES` hardcoded market values.
  - `fallbackQuote()` creates simulated quotes.
  - `fallbackCandles()` locally generates candles from hardcoded quotes and sine-wave logic.
  - `getQuote()` and `getHistoricalCandles()` silently fallback to simulation on Alpaca error, missing provider, timeout, empty candles, or explicit `simulate` query.
  - `getProviderSignals()` can derive signals from simulated quotes/candles.
- `Backend/routes/marketRoutes.js`
  - Exposes `simulate` query parameter on provider status, diagnostics, quotes, candles, and provider signals.
- `Backend/services/aiccSystemStatus.js`
  - `resolveStreamMode()` labels market-closed, after-hours, and provider-unavailable paths as simulation.
- `Backend/services/simulatedStreamRunner.js`
  - Generates normalized fake trade events.
- `Backend/services/streamController.js`
  - Provider streams return placeholders; only simulated stream can start.
- `Backend/server.js`
  - `MARKET_AI_AUTO_SIM` can auto-start simulated streams on boot.
  - Legacy routes use Alpaca directly but include hardcoded anomaly baseline volumes.
- `FrontendReact/src/services/cognitionApi.js`
  - `VITE_DEMO_MODE=true` forces demo cognition.
  - Fetch failure also returns demo cognition.
- `FrontendReact/src/services/demoCognition.js`
  - Generates synthetic cognition outputs from time-cycle arrays.
- `FrontendReact/src/services/marketProviderApi.js`
  - Offline provider status/diagnostics report `SIMULATION`.
- `FrontendReact/src/services/marketDataService.js`
  - Static mock watchlists, candles, stream statuses, pipeline nodes, and active events.
- `FrontendReact/src/services/aiccApi.js`
  - Fallback system status, alerts, and replay events.
- `FrontendReact/src/pages/BehavioralBrain.jsx`
  - `CLOSED_BETA_BEHAVIORAL_FALLBACK` builds behavioral input when live inputs are unavailable.
- `FrontendReact/src/pages/FailsafeBrain.jsx`
  - `CLOSED_BETA_TACTICAL_FALLBACK`, `CLOSED_BETA_BEHAVIORAL_FALLBACK`, and `buildMockHistory()`.
- `FrontendReact/src/pages/ReplayCenter.jsx`
  - Sample trades, mistake intelligence, operator debrief, and session verdict placeholders.
- `FrontendReact/src/pages/TradingJournal.jsx`
  - Placeholder journal entry and trade assessment values.

Development/test-only simulation paths:

- `Backend/tests/*Simulation*`, `Backend/tests/testSimulatedStreamRunner.js`, `Backend/tests/testMultiSymbolSimulation.js`.
- `Backend/services/testSandbox.js`.
- Many backend cognition tests use fabricated inputs. These are lower risk unless loaded into runtime data directories.

## Runtime Simulation Controls

Simulation can be enabled or reached through several independent controls:

- Backend market route query: `?simulate=alpaca_down`, `quotes_down`, `candles_down`, `provider_timeout`, or `no_provider`.
- Backend provider credential absence: if Alpaca is not configured, active provider becomes fallback simulation.
- Backend provider failure: Alpaca request errors and empty historical bars produce simulated candles.
- Backend `MARKET_AI_AUTO_SIM=true`: starts simulated stream on server boot.
- Backend market-hours status: `aiccSystemStatus` reports simulation modes outside live Alpaca regular-hours conditions.
- Frontend `VITE_DEMO_MODE=true`: cognition API returns demo cognition.
- Frontend fetch failure: cognition API returns demo cognition even when demo mode is false.
- Frontend provider API failure: market provider API returns offline simulation provider status.

Simulation can remain active accidentally because there is no single global simulation guard, no production hard stop, and no required raw-data provenance check before brains run. Frontend and backend can disagree: frontend cognition may use demo fallback while provider status shows another state; backend system status may report after-hours simulation while quote/candle REST paths still return raw or simulated provider data independently.

## Raw Data Flow Map

### Provider Quotes / Candles

```text
Alpaca REST
  -> Backend marketProviderService normalization
  -> /api/market/quotes or /api/market/candles
  -> Frontend marketProviderApi
  -> CommandCenter / TacticalBrain
  -> analyzeAiccIntelligence or analyzeTacticalState
  -> Tactical -> Failsafe -> Consensus -> Regime -> Narrative
```

Classification: RAW_LIVE or RAW_DELAYED when Alpaca succeeds; SIMULATED when fallback is used.

Fallback exposure: high. Failed quote/candle requests can become simulated without forcing the frontend to reject intelligence.

Freshness handling: provider timestamps and `updatedAt` exist, but there is no enforced stale threshold before intelligence use.

### Provider Signals

```text
Quotes + candles from marketProviderService
  -> generateProviderSignal()
  -> /api/market/provider-signals
  -> CommandCenter, TacticalBrain, AICC alerts/replay
```

Classification: DERIVED_FROM_RAW when quotes/candles are raw; DERIVED_FROM_SIMULATED when fallback quotes/candles are active.

### Cognition Routes

```text
Backend cognitionSnapshotStore or frontend demoCognition
  -> /api/cognition/*
  -> cognitionApi
  -> CommandCenter / MarketPulse / GlobalScan / BehavioralBrain / SystemBoot
```

Classification: PLACEHOLDER / SYNTHETIC / UNKNOWN unless a current backend snapshot has traceable raw market-event lineage.

### Simulated Stream

```text
simulatedStreamRunner
  -> normalized fake trade event
  -> liveIngestion
  -> brainSupervisor
  -> runtime metrics / cognition memory
```

Classification: SIMULATED.

### AICC Orchestrator

```text
CommandCenter provider candles/quote + derived context
  -> analyzeAiccIntelligence
  -> Tactical
  -> Behavioral
  -> Failsafe
  -> Consensus
  -> Regime
  -> Narrative
```

Classification: MIXED. Tactical can be raw or simulated. Behavioral/failsafe context is largely derived or placeholder. Consensus/regime/narrative synthesize upstream classifications.

## Brain Input Classification

| Layer | Inputs | Classification | Notes |
| --- | --- | --- | --- |
| Tactical Brain | `candles`, `quote`, optional benchmark candles and sector context | RAW_LIVE / RAW_DELAYED when Alpaca succeeds; SIMULATED when provider fallback is active; EMPTY fallback when no candles | Tactical page and Command Center use provider API outputs directly. No hard stale gate. |
| Behavioral Brain | `marketPulse`, `marketIntelligence`, `globalScan`, `newsletterData`, `crossAssetData` | DERIVED_FROM_RAW only when built from raw provider inputs; often PLACEHOLDER/SYNTHETIC | Behavioral page has closed-beta fallback data generated from cognition state, not raw participant data. |
| Failsafe Brain | Tactical, behavioral, data stream status, market intelligence, global scan, newsletter, history | DERIVED_FROM_RAW / PLACEHOLDER / HARDCODED_FALLBACK | Can detect missing/degraded/stale stream fields if provided, but simulation provenance is not enforced as fatal. |
| Consensus Engine | Tactical, behavioral, failsafe | DERIVED_FROM_UPSTREAM | No raw data source of its own. |
| Regime Engine | Tactical, behavioral, failsafe, consensus, market pulse, global scan | DERIVED_FROM_UPSTREAM / PLACEHOLDER | No independent raw regime dataset. |
| Narrative Engine | All upstream intelligence plus newsletter/global context | DERIVED_FROM_UPSTREAM / PLACEHOLDER | Explains existing intelligence; no raw provenance enforcement. |

## Page-Level Classification

| Page | Market intelligence data path | Classification | Simulation/fallback exposure |
| --- | --- | --- | --- |
| CommandCenter.jsx | Provider quotes/candles/signals, cognition endpoints, derived orchestrator input | MIXED: RAW/DERIVED/SIMULATED/PLACEHOLDER | High. Simulated provider fallback and demo cognition can influence top-level assessment. |
| TacticalBrain.jsx | Provider quotes/candles/signals into Tactical service | RAW or SIMULATED | High. Backend fallback candles/quotes can become tactical verdict. |
| BehavioralBrain.jsx | Cognition endpoints plus closed-beta fallback object | PLACEHOLDER / SYNTHETIC / DERIVED | High. Participant behavior is not verified raw behavior data. |
| FailsafeBrain.jsx | AICC system status, provider diagnostics, alerts, fallback tactical/behavioral input | DERIVED / HARDCODED_FALLBACK / PLACEHOLDER | Moderate/high. It detects degradation but also uses fallback brains/history. |
| MarketPulse.jsx | Cognition endpoints | PLACEHOLDER / UNKNOWN / SYNTHETIC in demo/fetch-fail mode | High. No direct raw provider binding in page. |
| GlobalScan.jsx | Cognition endpoints | PLACEHOLDER / UNKNOWN | High. Regional/sector labels are derived from generic cognition objects, not global raw datasets. |
| DataStreams.jsx | Provider status/diagnostics plus static marketDataService stream cards | MIXED: DERIVED / MOCK | Moderate. Clearly labels simulation in some cards, but static stream metrics are mock. |
| TradingJournal.jsx | AICC replay fallback plus user-entered placeholder journal defaults | PLACEHOLDER / OPERATOR_LOCAL | Low for market intelligence, high for replay context if interpreted as market-derived. |
| ReplayCenter.jsx | Placeholder trade timeline/review plus replay intelligence generated from journal tags | PLACEHOLDER / SYNTHETIC_OPERATOR_REVIEW | Not raw market data. |
| SystemSettings.jsx | AICC system status and provider diagnostics | DERIVED / HARDCODED_FALLBACK | Moderate. Shows diagnostics but can rely on offline fallbacks. |
| SystemBoot.jsx | Cognition endpoints, provider status/diagnostics, webull health | DERIVED / HARDCODED_FALLBACK | Moderate. Indicates provider/simulation state but beta score uses fallback states. |

Additional runtime pages:

- `Watchlists.jsx` and `Signals.jsx` should be included in O.2 because they reference simulation/provider fallback states and may consume mock or provider-derived signals.

## Market-Hours Behavior

- Pre-market: `marketHours.js` marks `before_regular_hours`. `aiccSystemStatus` resolves to `AFTER_HOURS_SIMULATION` unless backend has live Alpaca during open regular hours.
- Regular market hours: live Alpaca mode is possible only if backend online, Alpaca active, provider health healthy, credentials available, and `marketHours.isOpen` true. If market is open but Alpaca is not connected, system status becomes `FALLBACK_SIMULATION`.
- After-hours: `aiccSystemStatus` reports `AFTER_HOURS_SIMULATION`.
- Overnight: same as after-hours unless weekend.
- Weekends: `aiccSystemStatus` reports `MARKET_CLOSED_SIMULATION`.
- Market holidays: `marketHours.js` has a TODO for holiday/early-close handling. Holiday status is not implemented, though `aiccSystemStatus` checks a possible `holiday` reason.
- Provider outage: provider service falls back to simulated quotes/candles/signals.
- Backend outage: frontend cognition API and AICC API return demo/offline fallbacks.

After-hours data is not inherently required to be simulated, but current system status treats after-hours as simulation unless live Alpaca regular-hours conditions are met.

## Data Freshness Findings

Tracked today:

- Provider quote `updatedAt`.
- Candle `timestamp`.
- Provider status `lastUpdate`.
- Normalized market event `timestamp` and `receivedAt`.
- Simulated stream `lastEventAt`.
- Data stream engine can inspect `ageSeconds`, `stalenessSeconds`, or `latencySeconds` if supplied.

Missing or incomplete:

- No universal stale threshold before intelligence runs.
- No hard rejection of missing/invalid timestamps in Tactical Brain inputs.
- No market session tag attached to every quote/candle.
- No provider freshness SLA per endpoint.
- No raw-vs-simulated provenance object attached to orchestrator input.
- No source confidence downgrade solely because data is simulated.
- No holiday calendar.
- No clear distinction between raw delayed and raw live provider data in frontend display.

## Failsafe Coverage

Failsafe can detect:

- Missing data streams.
- Degraded/offline/stale status if stream data includes supported status or staleness fields.
- Tactical/behavioral missing inputs.
- Directional conflicts between tactical and behavioral.
- Weak validation and degraded integrity.
- Confidence over/under calibration via its calibration engine.

Failsafe does not fully detect or block:

- Simulated data as a distinct fatal provenance class.
- Frontend demo cognition activation.
- Backend provider fallback candles as fake market data unless stream warnings include it.
- Invalid quote/candle timestamps before Tactical Brain runs.
- Empty candles once provider service replaces them with simulated candles.
- Conflicting providers beyond Webull/Alpaca status diagnostics.
- Synthetic fallback activation across all pages.

## Environment-Control Findings

Frontend env variables observed:

- `VITE_API_BASE_URL`
- `VITE_DEMO_MODE`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOSED_BETA_EMAILS`
- `VITE_ENVIRONMENT`
- `VITE_PERSISTENCE_ENABLED`
- `VITE_TRAINING_ENABLED`

Backend env variables observed:

- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `ALPACA_BASE_URL`
- `ALPACA_DATA_URL`
- `WEBULL_APP_KEY`
- `WEBULL_APP_SECRET`
- `WEBULL_ENABLED`
- `WEBULL_ENV`
- `MARKET_AI_AUTO_SIM`
- `MARKET_AI_MODE`
- `MARKET_AI_DATA_DIR`
- `MARKET_AI_LOG_LEVEL`
- `MARKET_AI_ENABLE_PERSISTENCE`
- `MARKET_AI_ENABLE_COGNITION_ARCHIVE`
- `MARKET_AI_TEST_SANDBOX`
- `MARKET_PROVIDER_DEBUG`
- `MARKET_AI_SUBSCRIPTION_TIER`
- Backend Supabase service variables exist in backend code, but O.1 did not print secret values.

Deployment references:

- `FrontendReact/vercel.json` only defines build/output/SPA rewrite.
- `Backend/RENDER_DEPLOYMENT.md` documents Alpaca, Webull, CORS, and simulation fallback.
- No backend `.env.example` was found.

## Classification Summary

RAW_LIVE / RAW_DELAYED:

- Alpaca latest trade/latest bar/historical bars when credentials and provider are healthy.
- Legacy backend `/api/stock`, `/api/chart`, `/api/anomalies` when Alpaca succeeds.

RAW_CACHED:

- No explicit market-data cache layer was verified for provider quotes/candles.

DERIVED_FROM_RAW:

- Provider signals when source quote/candles are raw.
- Tactical Brain when source quote/candles are raw.
- AICC alerts/replay provider events when source signals are raw.

SIMULATED:

- Backend fallback quotes/candles/provider signals.
- Simulated stream runner.
- AICC system status simulation modes.
- Frontend cognition demo responses.

SYNTHETIC:

- Demo cognition cycles.
- Behavioral closed-beta fallback inputs.
- Replay intelligence from behavioral tags.
- Dataset readiness/training/governance layers over synthetic replay/journal context.

PLACEHOLDER:

- Webull quote adapter pending implementation.
- Cognition snapshot store awaiting outputs.
- Trading Journal defaults.
- Replay Center sample trade timeline.
- MarketPulse/GlobalScan regional/sector labels driven by generic cognition objects.

HARDCODED_FALLBACK:

- Frontend provider offline status.
- Frontend AICC system/alerts/replay fallback.
- Backend hardcoded fallback quotes.
- Static marketDataService values.

UNKNOWN:

- Provenance of backend cognition snapshots.
- Whether Alpaca IEX feed should be presented as live or delayed in UI.
- Whether legacy `/api/anomalies` baseline volumes are calibrated to current live data.
- Whether persistent cognition memory contains raw-derived, simulated, or mixed events.
- Whether backend data journal files represent real operator events or generated test data.
- Whether production Render has `MARKET_AI_AUTO_SIM` enabled.
- Whether `VITE_DEMO_MODE` is disabled in all deployments.
- Whether market holidays/early closes are externally handled outside repo.

Unknown Data Paths: 8

## Risks

### CRITICAL

1. Simulated provider quotes/candles can influence Tactical Brain and Command Center orchestrator intelligence while the system continues producing normal-looking tactical states.
2. Frontend demo cognition can substitute for failed backend cognition and influence Behavioral, Global Scan, Market Pulse, and Command Center context.
3. Backend and frontend can disagree about simulation state because simulation controls are distributed across query params, backend env, market-hours logic, and frontend fallbacks.

### HIGH

1. Alpaca provider failure silently becomes simulation fallback in quote/candle paths.
2. Empty Alpaca bars become generated candles instead of a hard no-data state.
3. After-hours/weekend system status defaults to simulation even though raw after-hours data behavior is not explicitly certified.
4. Webull is presented as primary/pending in diagnostics but has no implemented raw quote path.
5. Failsafe does not enforce raw-data provenance before intelligence outputs are displayed.

### MODERATE

1. MarketPulse and GlobalScan use cognition abstractions with unclear raw provenance.
2. DataStreams displays static mock stream metrics from `marketDataService.js`.
3. Replay Center and Trading Journal include placeholder data that can feed future dataset layers.
4. Staleness is tracked in some structures but not enforced globally.

### LOW

1. Backend test simulations are isolated if not loaded into runtime.
2. Development stream routes are labeled development-only, though still mounted under `/api/dev`.

## Blocking Issues

- Raw provider provenance is not attached to orchestrator input or brain outputs.
- Simulation fallback can replace raw market data without a certification gate.
- No global production simulation kill switch was verified.
- No hard stale-data threshold blocks intelligence.
- Behavioral and Failsafe inputs still rely on closed-beta fallback objects.
- `VITE_DEMO_MODE` and fetch-failure demo fallback can influence core pages.
- Market-hours logic lacks holiday/early close handling.
- Failsafe does not classify `SIMULATION` as a distinct compromised data source.

## Non-Blocking Issues

- Webull readiness UI is useful but should remain clearly pending.
- Local replay/journal placeholders are acceptable for operator workflow until explicitly labeled as non-market raw data.
- Backend test fixtures are acceptable if kept isolated from runtime and persistence.
- Vite large chunk warnings are unrelated to raw-data certification.

## Files Requiring Future Changes

Likely O.2/O.3 candidates:

- `Backend/services/marketProviderService.js`
- `Backend/routes/marketRoutes.js`
- `Backend/services/aiccSystemStatus.js`
- `Backend/services/simulatedStreamRunner.js`
- `Backend/services/streamController.js`
- `Backend/server.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/marketDataService.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/intelligence/aiccIntelligenceOrchestrator.js`
- `FrontendReact/src/services/intelligence/failsafeBrain.js`
- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/pages/TacticalBrain.jsx`
- `FrontendReact/src/pages/BehavioralBrain.jsx`
- `FrontendReact/src/pages/FailsafeBrain.jsx`
- `FrontendReact/src/pages/MarketPulse.jsx`
- `FrontendReact/src/pages/GlobalScan.jsx`
- `FrontendReact/src/pages/DataStreams.jsx`
- `FrontendReact/src/pages/SystemBoot.jsx`
- `FrontendReact/src/pages/SystemSettings.jsx`
- `FrontendReact/src/pages/TradingJournal.jsx`
- `FrontendReact/src/pages/ReplayCenter.jsx`

## O.2 Simulation Removal Recommendations

1. Add a single raw-data provenance contract:
   - `sourceType`: `RAW_LIVE`, `RAW_DELAYED`, `RAW_CACHED`, `SIMULATED`, `PLACEHOLDER`, `UNKNOWN`
   - `provider`
   - `providerTimestamp`
   - `receivedAt`
   - `ageSeconds`
   - `marketSession`
   - `fallbackUsed`
   - `simulationReason`
2. Remove silent simulation substitution from provider quote/candle routes. Return explicit degraded/no-data responses instead.
3. Keep simulation only behind an explicit development flag and never under production defaults.
4. Make frontend demo fallback opt-in only; fetch failure should return unavailable state, not demo cognition.
5. Require Failsafe to mark simulated or unknown provenance as compromised or restricted.
6. Block Tactical Brain confidence above LOW when candles are simulated, stale, or missing.
7. Add stale-data thresholds for quotes, candles, provider status, and cognition snapshots.
8. Implement holiday/early-close calendar or label market session as unknown.
9. Separate Replay/Journal placeholder data from market-data-derived dataset capture.
10. Document provider delay status for Alpaca feed usage.

## Final O.1 Result

Raw Data Audit: FAIL

Raw Data Coverage: 40%

Simulation Dependency: CRITICAL

Unknown Data Paths: 8

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2 Simulation Removal Audit

O.1 did not remove simulation, disable fallbacks, change provider behavior, alter brain outputs, activate training, activate Shadow Trainer, or change production configuration.
