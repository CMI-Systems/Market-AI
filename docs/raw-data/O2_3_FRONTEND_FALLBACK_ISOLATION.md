# AICC Phase O.2.3 - Frontend Demo and Offline Fallback Isolation

## Executive Summary

O.2.3 isolated frontend demo, offline, placeholder, mock, synthetic, and generated market-intelligence fallbacks so they no longer silently appear as live or raw AICC intelligence.

The frontend now fails closed when backend/provider/cognition data is unavailable. Demo cognition and static market fixtures remain available only for explicit DEVELOPMENT or TEST demo mode and are labeled as simulated, not raw market data, not persistence eligible, and not training eligible.

Runtime behavior changed only in the frontend fallback layer. Backend provider logic, Supabase persistence, brain calculations, training systems, Shadow Trainer, production credentials, Vercel, and Render settings were not modified.

## Files Inspected

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
- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/components/SystemBootPanel.jsx`
- `FrontendReact/src/components/DataStreamsPanel.jsx`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketDataService.js`
- `FrontendReact/src/services/intelligence/*`
- `FrontendReact/.env.example`
- `FrontendReact/.env.staging.example`
- `docs/raw-data/O1_RAW_DATA_AUDIT.md`
- `docs/raw-data/O2_SIMULATION_REMOVAL_AUDIT.md`
- `docs/raw-data/O2_1_BACKEND_SIMULATION_ISOLATION.md`
- `docs/raw-data/O2_2_BACKEND_FALLBACK_CLOSURE_AUDIT.md`

## Frontend Fallback Inventory

| Path | Classification Before O.2.3 | O.2.3 Result |
| --- | --- | --- |
| `cognitionApi.js` fetch failure to `getDemoResponse()` | RESIDUAL_SILENT_FALLBACK | Replaced with `DATA_UNAVAILABLE` response |
| `demoCognition.js` local cognition objects | EXPLICIT_DEVELOPMENT_DEMO | Gated by frontend runtime policy and labeled simulated |
| `marketProviderApi.js` offline provider status | RESIDUAL_SILENT_FALLBACK | Replaced simulation provider with backend/data unavailable metadata |
| `aiccApi.js` offline system status | RESIDUAL_SILENT_FALLBACK | Removed fallback simulation status and local synthetic replay/alert intelligence |
| `marketDataService.js` watchlist/quote/candle/stream fixtures | RESIDUAL_SILENT_FALLBACK | Isolated to DEVELOPMENT/TEST demo mode; normal runtime returns unavailable/empty states |
| `BehavioralBrain.jsx` closed-beta behavioral fallback input | RESIDUAL_SILENT_FALLBACK | Removed synthetic participant fallback input |
| `FailsafeBrain.jsx` closed-beta tactical/behavioral fallback snapshots | RESIDUAL_SILENT_FALLBACK | Removed fallback brain snapshots and mock history synthesis |
| `CommandCenter.jsx` orchestrator input derivation | RESIDUAL_SILENT_FALLBACK | Added raw-input provenance gate before orchestrator inputs |
| `Signals.jsx` fallback simulation candles | RESIDUAL_SILENT_FALLBACK | Replaced with explicit unavailable chart state |
| `Watchlists.jsx` neutral/moderate row defaults | RESIDUAL_SILENT_FALLBACK | Replaced with unavailable/unknown defaults |
| `DataStreams.jsx` connected stream defaults | RESIDUAL_SILENT_FALLBACK | Made stream state provider-availability aware |
| `SystemBoot.jsx` hardcoded online/ready labels | RESIDUAL_SILENT_FALLBACK | Made core data labels backend/provider-availability aware |
| `SystemBootPanel.jsx`, `DataStreamsPanel.jsx` compact status labels | RESIDUAL_SILENT_FALLBACK | Made compact panels fail closed on unavailable data |
| Trading Journal and Replay Center placeholders | HARMLESS_UI_PLACEHOLDER | Preserved; non-market workflow placeholders only |

## Environment Policy

Frontend demo intelligence is allowed only when:

- Runtime environment is `DEVELOPMENT` or `TEST`.
- `VITE_DEMO_MODE=true`.
- Demo responses are labeled `SIMULATED`.
- Demo responses include `rawDataAvailable: false`.
- Demo responses include `persistenceEligible: false`.
- Demo responses include `trainingEligible: false`.
- Demo responses include the label `DEMO DATA - SIMULATED - NOT RAW MARKET DATA`.

Frontend demo intelligence is blocked in:

- `STAGING`
- `PRODUCTION`
- `UNKNOWN`

Missing or malformed runtime environment fails closed.

## Demo Cognition Changes

- Added `FrontendReact/src/services/frontendRuntimePolicy.js`.
- `cognitionApi.js` now checks frontend demo policy.
- Fetch failures return explicit unavailable responses rather than demo cognition.
- `VITE_DEMO_MODE=true` is honored only in DEVELOPMENT or TEST.
- `demoCognition.js` now marks all demo payloads as simulated, generated, not raw, not persistence eligible, and not training eligible.

Unavailable response shape includes:

```json
{
  "available": false,
  "sourceType": "DATA_UNAVAILABLE",
  "simulated": false,
  "generated": false,
  "rawDataAvailable": false,
  "reason": "BACKEND_UNAVAILABLE"
}
```

## Provider Diagnostic Changes

- Offline provider status no longer reports `activeProvider: "SIMULATION"`.
- Offline provider diagnostics no longer report fallback simulation as available.
- Offline capabilities for quotes/candles/equities are false.
- Provider health fails closed as `OFFLINE`.
- `failoverReady` is false when backend diagnostics are unavailable.
- No provider timestamp is fabricated.

## AICC Status Changes

- Offline AICC system status no longer reports `streamMode: "FALLBACK_SIMULATION"`.
- `simulationActive` is false when the backend is unavailable.
- Offline provider is `BACKEND_UNAVAILABLE`.
- Fallback alerts now state that alerts are unavailable rather than generating a synthetic signal event.
- Fallback replay now states replay is unavailable rather than generating local replay cognition.

## Brain Input Protection

- Command Center now passes empty/null raw market inputs to the orchestrator when provider/candle/quote provenance is unavailable.
- Behavioral Brain no longer creates synthetic participation, leadership, rotation, narrative adoption, or cross-asset fallback input from confidence status.
- Failsafe Brain no longer creates fallback Tactical or Behavioral snapshots when those inputs are unavailable.
- Failsafe history now uses actual alert history only.
- Signals no longer computes trend, volatility, or liquidity from fallback simulation candles.

## Static Mock Service Findings

`marketDataService.js` remains as a development/test fixture source only.

Normal runtime behavior:

- Watchlist records return unavailable market fields.
- Quotes return unavailable records.
- Candles return an empty array.
- Signal markers return an empty array.
- Stream statuses return `DATA_UNAVAILABLE`.
- Stream health values return zero.
- Active stream events return an explicit backend-unavailable event.

Development/test demo mode:

- Fixture values remain available when explicitly enabled.
- All fixture values are labeled simulated/not raw.

## Page-Level Verification

| Page | O.2.3 Result |
| --- | --- |
| Command Center | Orchestrator input gated by raw input availability |
| Tactical Brain | Existing service fallback remains safe; no new synthetic frontend fallback added |
| Behavioral Brain | Synthetic closed-beta behavioral input removed |
| Failsafe Brain | Synthetic brain snapshots and mock history removed |
| Market Pulse | No direct runtime demo substitution found |
| Global Scan | No direct runtime demo substitution found |
| Data Streams | Stream status now fails closed when provider unavailable |
| System Boot | Status/readiness labels now fail closed where tied to raw data |
| System Settings | No market-intelligence demo substitution found |
| Trading Journal | Non-market placeholder workflow preserved |
| Replay Center | Non-market placeholder workflow preserved; governance still blocks training |
| Signals | Fallback simulation candles removed from runtime |
| Watchlists | Neutral/moderate fallback market rows removed from runtime |

## Persistence/Governance Protection

- Demo data includes `persistenceEligible: false` and `trainingEligible: false`.
- Unavailable data includes `available: false`, `sourceType: "DATA_UNAVAILABLE"`, `simulated: false`, and `generated: false`.
- No Supabase schema, RLS policy, or persistence service was modified.
- Phase N governance remains responsible for blocking training with `RAW_DATA_CERTIFICATION_REQUIRED`.
- No dataset, replay, journal, validation, readiness, queue, or audit persistence behavior was changed.

## Market-Hours Behavior

Frontend policy after O.2.3:

- Pre-market: show raw/delayed/cached data only if backend supplies it; otherwise `DATA_UNAVAILABLE`.
- Regular hours: show raw/degraded data only if backend supplies it; otherwise `DATA_UNAVAILABLE` or `PROVIDER_OFFLINE`.
- After-hours: do not substitute simulation; show backend-provided state or unavailable state.
- Overnight/weekend/holiday: do not substitute simulation; show backend-provided market-closed/cached state or unavailable state.
- Provider outage: `PROVIDER_OFFLINE` or `DATA_UNAVAILABLE`.
- Backend outage: `BACKEND_UNAVAILABLE`.

No frontend path now automatically switches to simulated intelligence because markets are closed.

## Verification Matrix

| Scenario | Expected Result | Result |
| --- | --- | --- |
| DEVELOPMENT + explicit demo mode enabled | Demo allowed and clearly labeled | PASS by policy |
| DEVELOPMENT + demo disabled + backend available | Backend intelligence used | PASS by policy |
| DEVELOPMENT + demo disabled + backend unavailable | `BACKEND_UNAVAILABLE`; no demo substitution | PASS |
| STAGING + demo enabled | Demo blocked | PASS by policy |
| PRODUCTION + demo enabled | Demo blocked | PASS by policy |
| UNKNOWN environment + demo enabled | Demo blocked | PASS by policy |
| Backend unavailable | Explicit unavailable state across intelligence services | PASS |
| Provider unavailable | Provider offline/data unavailable diagnostics | PASS |
| Market closed | No automatic simulation substitution | PASS |

## Files Modified

- `FrontendReact/src/services/frontendRuntimePolicy.js`
- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketDataService.js`
- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/pages/BehavioralBrain.jsx`
- `FrontendReact/src/pages/FailsafeBrain.jsx`
- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/pages/DataStreams.jsx`
- `FrontendReact/src/pages/SystemBoot.jsx`
- `FrontendReact/src/components/SystemBootPanel.jsx`
- `FrontendReact/src/components/DataStreamsPanel.jsx`
- `docs/raw-data/O2_3_FRONTEND_FALLBACK_ISOLATION.md`

## Exact Fixes

1. Added a shared frontend runtime/demo policy.
2. Blocked demo cognition in STAGING, PRODUCTION, and UNKNOWN environments.
3. Replaced cognition fetch-failure demo fallback with explicit unavailable responses.
4. Marked demo cognition as simulated, generated, not raw, not persistence eligible, and not training eligible.
5. Replaced simulated provider offline fallbacks with backend/data unavailable metadata.
6. Replaced fallback simulation AICC status with backend/data unavailable status.
7. Removed synthetic AICC alert and replay fallback intelligence.
8. Isolated static market fixtures to explicit DEVELOPMENT/TEST demo mode.
9. Removed synthetic Behavioral Brain fallback input generation.
10. Removed synthetic Failsafe Brain fallback tactical/behavioral snapshots and mock history.
11. Added Command Center raw-input gating before orchestrator execution.
12. Replaced Signals fallback simulation candles with explicit unavailable chart state.
13. Replaced Watchlists neutral/default confidence fallback rows with unavailable/unknown rows.
14. Made Data Streams and System Boot availability-aware.
15. Updated compact panels to avoid misleading fallback provider labels.

## Remaining Frontend Simulation Paths

- `demoCognition.js` remains as explicit DEVELOPMENT/TEST demo only.
- `marketDataService.js` fixtures remain as explicit DEVELOPMENT/TEST demo only.
- UI helpers still display `SIMULATION ACTIVE` if an upstream response truthfully reports simulation.
- CSS class name `.mock-candle-chart` remains as historical styling only and does not activate mock data.

## Remaining Unknown Paths

Known remaining unknown paths: 0.

Further O.2.4 validation should test authenticated in-app pages with backend intentionally unavailable and provider intentionally unavailable.

## Risks

- Some intelligence engines still have internal safe defaults by design. O.2.3 prevents frontend synthetic market inputs, but O.2.4 should validate the operator-facing wording for each unavailable brain state.
- Protected AICC routes require login, so browser smoke checks verified protected-route redirect safety and console cleanliness rather than authenticated page rendering.
- Command Center still has non-market operational labels and public UI copy; those were preserved unless directly tied to raw market/provider status.

## O.2.3 Result

Frontend Fallback Isolation: PASS

Residual Silent Frontend Fallbacks: 0

Development/Test Demo Paths: 2

Staging/Production Demo Intelligence: BLOCKED

Backend Failure Behavior: EXPLICIT_UNAVAILABLE

Provider Diagnostic Integrity: PASS

Brain Input Protection: PASS

Frontend Raw-Data Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.2.4 Explicit Unavailable-State Validation

