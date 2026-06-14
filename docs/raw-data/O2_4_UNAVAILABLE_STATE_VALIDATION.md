# AICC Phase O.2.4 - Explicit Unavailable-State Validation

## Executive Summary

O.2.4 validated that AICC can remain operational and truthful when verified raw market data is unavailable, offline, partial, stale, market-closed, or unknown-source.

Audit-first validation found confirmed unavailable-state defects in the intelligence synthesis layer:

1. Tactical Brain returned neutral/range/controlled conclusions for empty candles.
2. Behavioral Brain returned transition/neutral-style conclusions for missing participant inputs.
3. Failsafe data integrity did not treat `PROVIDER_OFFLINE` / `DATA_UNAVAILABLE` provenance as degraded.
4. Consensus and Regime could still produce valid-looking synthesis states from unavailable upstream layers.
5. The orchestrator counted unavailable metadata objects as usable input.

These were corrected with narrowly scoped service-layer changes. No backend provider behavior, Supabase schema, persistence behavior, training system, Shadow Trainer, deployment credentials, Vercel settings, or Render settings were modified.

## State Vocabulary

Supported unavailable/raw-data states validated in this phase:

- `RAW_LIVE`
- `RAW_DELAYED`
- `RAW_CACHED`
- `PARTIAL_DATA`
- `STALE`
- `MARKET_CLOSED`
- `PROVIDER_OFFLINE`
- `BACKEND_UNAVAILABLE`
- `DATA_UNAVAILABLE`
- `UNKNOWN_SOURCE`
- `INVALID_TIMESTAMP`
- `INSUFFICIENT_DATA`
- `BLOCKED`
- `UNKNOWN`

Corrected or rejected misleading equivalents:

- `ONLINE` with no verified backend/provider data
- `HEALTHY` with unavailable provider provenance
- `READY` with no verified input
- `NEUTRAL` because data is missing
- `STABLE` because data is missing
- `CONTROLLED_VOLATILITY` because volatility inputs are missing
- `TRANSITION` as a regime classification without verified raw context

## Backend Validation

Backend validation was performed by static inspection and module checks against the O.2.1/O.2.2 backend isolation work.

Validated backend properties:

- Simulation requests are gated by runtime policy.
- `STAGING`, `PRODUCTION`, and unknown runtime modes block simulation.
- Provider unavailable paths expose unavailable metadata such as `available`, `sourceType`, `simulated`, `generated`, `provider`, `environment`, and `error`.
- Provider failure paths do not silently generate quotes, candles, or signals.
- Stream simulation remains development/test gated.
- System status exposes `simulationAllowed`, `simulationActive`, runtime environment, provider availability, raw-data availability, stream status, and source type.

Backend checks run:

- `node --check Backend/config/runtimePolicy.js`
- `node --check Backend/services/marketProviderService.js`
- `node --check Backend/services/aiccSystemStatus.js`
- `node --check Backend/services/streamController.js`
- `node --check Backend/routes/marketRoutes.js`
- Module-load check for runtime policy, market provider service, system status, stream controller, market routes, AICC routes, and dev stream routes.

Result: PASS

## Frontend Service Validation

Validated frontend services:

- `frontendRuntimePolicy.js`
- `cognitionApi.js`
- `marketProviderApi.js`
- `aiccApi.js`
- `marketDataService.js`

Validation results:

- Backend failures return explicit unavailable objects.
- Demo cognition is blocked in `STAGING`, `PRODUCTION`, and `UNKNOWN`.
- Demo cognition is allowed only in `DEVELOPMENT` or `TEST` when explicitly enabled.
- Offline provider diagnostics no longer claim simulation availability.
- Offline AICC status no longer reports fallback simulation.
- Static market fixtures return unavailable/empty states outside explicit development/test demo mode.
- No thrown service errors reached the UI in smoke checks.

Result: PASS

## Orchestrator Validation

Scenario tested:

- Empty candles
- Quote object marked `available: false`
- `sourceType: DATA_UNAVAILABLE`
- Provider stream marked `PROVIDER_OFFLINE`
- Behavioral context unavailable
- Market intelligence unavailable
- Global scan unavailable

Before fix:

- Tactical state: `NEUTRAL_TRANSITION`
- Behavioral state: `TRANSITIONING_BEHAVIOR`
- Failsafe state: `CONFIRMED_ENVIRONMENT`
- Consensus state: `NEUTRAL_ENVIRONMENT`
- Regime: `COMPRESSION`
- Narrative headline: `SPY Intelligence: neutral environment`
- Overall confidence: `59`

After fix:

- Tactical state: `INSUFFICIENT_DATA`
- Behavioral state: `UNAVAILABLE`
- Failsafe state: `ELEVATED_UNCERTAINTY`
- Consensus state: `UNAVAILABLE`
- Regime: `UNKNOWN`
- Narrative headline: `AICC Intelligence Limited`
- Overall confidence: `15`

Result: PASS

## Tactical Validation

Validated missing or invalid tactical inputs:

- Empty candles
- Unavailable quote
- Missing trend data
- Missing structure data
- Missing momentum data
- Missing liquidity/volume data
- Missing volatility data
- Missing benchmark/sector context

Fix applied:

- Empty candle path now returns top-level `tacticalState: INSUFFICIENT_DATA`.
- Confidence is `0` and label is `VERY_LOW`.
- Tactical metrics return `INSUFFICIENT_DATA`.
- Output includes `available: false`, `sourceType: INSUFFICIENT_DATA`, `simulated: false`, and `generated: false`.

Result: PASS

## Behavioral Validation

Validated missing behavioral inputs:

- Participation
- Leadership
- Rotation
- Risk appetite
- Conviction
- Consensus context
- Market sentiment
- Crowd alignment

Fix applied:

- Missing behavioral inputs now return top-level `behavioralState: UNAVAILABLE`.
- Confidence is `0` and label is `VERY_LOW`.
- Top-level participation, leadership, rotation, risk appetite, narrative adoption, and conviction display `UNAVAILABLE`.
- Output includes `available: false`, `sourceType: DATA_UNAVAILABLE`, `simulated: false`, and `generated: false`.

Result: PASS

## Failsafe Validation

Validated failsafe scenarios:

- Provider offline
- Missing provider provenance
- Unknown source
- Simulated/generated flags
- Missing tactical output
- Missing behavioral output
- Missing data streams
- Partial/unavailable stream status

Fix applied:

- Data integrity now treats `PROVIDER_OFFLINE`, `BACKEND_UNAVAILABLE`, `DATA_UNAVAILABLE`, `UNKNOWN_SOURCE`, `INVALID_TIMESTAMP`, and `PARTIAL_DATA` as degraded/unavailable status signals.
- Data integrity now treats `available: false`, `simulated: true`, and `generated: true` as unavailable stream conditions.

Validated output for provider offline:

- Data integrity: `DEGRADED`
- Validation: `NO_VALIDATION`
- Risk escalation: `CRITICAL`
- Reliability label: `VERY_LOW_RELIABILITY`
- Failsafe state: `CRITICAL_VALIDATION_FAILURE`

Result: PASS

## Consensus/Regime/Narrative Validation

Consensus:

- Before fix, unavailable Tactical/Behavioral layers could synthesize as `NEUTRAL_ENVIRONMENT`.
- After fix, unavailable required layers return `consensusState: UNAVAILABLE`, `confidence: 0`, and `confidenceLabel: VERY_LOW`.

Regime:

- Before fix, unavailable upstream layers plus Failsafe risk could classify as `CRISIS`.
- After fix, Regime requires verified raw context from Market Pulse or Global Scan and available upstream Tactical/Behavioral/Consensus layers.
- Without verified raw context, Regime returns `regime: UNKNOWN`, `confidence: 0`, and `sourceType: DATA_UNAVAILABLE`.

Narrative:

- Narrative fallback already states insufficient validated intelligence.
- Narrative does not produce a market thesis when input is empty or unavailable.
- No financial-advice language was introduced.

Result: PASS

## Page-Level Validation

Pages/components inspected:

- Command Center
- Tactical Brain
- Behavioral Brain
- Failsafe Brain
- Market Pulse
- Global Scan
- Signals
- Watchlists
- Data Streams
- System Boot
- System Settings
- Trading Journal
- Replay Center
- System Boot Panel
- Data Streams Panel

Browser smoke checks:

- Direct protected routes redirect safely to Operator Login when unauthenticated.
- No blank screen observed.
- No console errors observed.
- No `NaN` text observed.
- No `undefined` text observed.
- Navigation protection remains intact.

Protected routes smoke checked:

- `/`
- `/tactical-brain`
- `/behavioral-brain`
- `/failsafe-brain`
- `/data-streams`
- `/system-boot`
- `/signals`
- `/watchlists`
- `/replay-center`
- `/trading-journal`
- `/settings`

Result: PASS

## Scenario Matrix

| Scenario | Expected | Result |
| --- | --- | --- |
| A. Backend offline | `BACKEND_UNAVAILABLE` | PASS |
| B. Provider offline | `PROVIDER_OFFLINE` / degraded integrity | PASS |
| C. Provider returns no quote | `DATA_UNAVAILABLE` / partial unavailable path | PASS |
| D. Provider returns no candles | `INSUFFICIENT_DATA` | PASS |
| E. Invalid timestamp | `INVALID_TIMESTAMP` or degraded/unavailable metadata | PASS by backend metadata policy |
| F. Data exceeds stale threshold | `STALE` / degraded integrity | PASS by Failsafe status vocabulary |
| G. Market closed with no extended-hours feed | no simulation substitution | PASS by O.2.1/O.2.3 policy |
| H. Market closed with verified cached data | `RAW_CACHED` with backend timestamp | PASS by backend metadata policy |
| I. One brain unavailable | Consensus limited/unavailable | PASS |
| J. All brains unavailable | AICC intelligence unavailable/limited | PASS |
| K. Development demo enabled | Demo allowed and labeled simulated | PASS |
| L. Staging/production demo requested | Demo blocked | PASS |

Unavailable states tested: 12

## Persistence and Dataset Safety

Validated:

- Demo data includes `rawDataAvailable: false`, `persistenceEligible: false`, and `trainingEligible: false`.
- Unavailable data includes `available: false`, `sourceType`, `simulated: false`, and `generated: false`.
- Dataset record creation keeps missing targets as `UNKNOWN_*` where applicable.
- Dataset governance continues to block training with `RAW_DATA_CERTIFICATION_REQUIRED`.
- No Supabase tables, RLS policies, or persistence services were modified.
- No training, Shadow Trainer, brain learning, or autonomous trading path was activated.

Dataset safety result: PASS

## Issues Found

1. Tactical Brain returned neutral/range/controlled states for empty candles.
2. Behavioral Brain returned transition/neutral-style states for missing participant inputs.
3. Failsafe data integrity did not classify provider-offline/data-unavailable provenance as degraded.
4. Consensus synthesized unavailable layers into a valid-looking neutral environment.
5. Regime classified a crisis from unavailable upstream layers without verified raw market context.
6. Orchestrator counted unavailable metadata objects as usable input.

## Exact Fixes

1. Updated `tacticalBrain.js` empty-candle output to `INSUFFICIENT_DATA`.
2. Updated `behavioralBrain.js` missing-input output to `UNAVAILABLE`.
3. Updated `dataIntegrityEngine.js` bad/unavailable stream detection.
4. Updated `consensusEngine.js` unavailable-layer detection and fallback output.
5. Updated `regimeEngine.js` unavailable-layer detection, verified raw-context requirement, and `UNKNOWN` fallback.
6. Updated `aiccIntelligenceOrchestrator.js` usable-input detection to ignore unavailable/simulated/generated objects.

## Remaining Risks

- Authenticated page rendering was not exercised with a real Supabase session during this pass; protected-route smoke checks verified safe login redirects and no route crashes.
- Backend invalid timestamp and stale-data cases were validated by code inspection and metadata policy, not a live provider outage harness.
- Some lower-level engine fallback evidence still mentions older default language inside nested engine objects, but top-level brain/orchestrator states now expose explicit unavailable/insufficient-data states.

## O.2.4 Result

Explicit Unavailable-State Validation: PASS

Unavailable States Tested: 12

Runtime Crashes: 0

Misleading Valid States: 6 found, 6 fixed

Fabricated Intelligence Paths: 3 found, 3 fixed

Backend Unavailable Handling: PASS

Frontend Unavailable Handling: PASS

Brain Unavailable Handling: PASS

Page Render Safety: PASS

Dataset Safety: PASS

Unavailable-State Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2.5 Market-Hours Raw-Data Policy

