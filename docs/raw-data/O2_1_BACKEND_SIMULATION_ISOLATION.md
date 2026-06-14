# AICC Phase O.2.1 Backend Simulation Isolation

Implementation date: 2026-06-14

Project: Market AI / AICC

Mode: Backend isolation only. Frontend behavior unchanged.

Required inputs reviewed:

- `docs/raw-data/O1_RAW_DATA_AUDIT.md`
- `docs/raw-data/O2_SIMULATION_REMOVAL_AUDIT.md`

## Summary

O.2.1 isolates backend simulation so staging and production-like runtime modes can no longer silently substitute generated quotes, generated candles, or simulated streams for failed raw provider data.

Simulation remains available for explicitly enabled development/test use only. If raw provider data is unavailable in staging, production, or unknown runtime modes, backend market paths now return explicit unavailable states or empty raw-data results rather than synthetic market prices.

Raw Data Certification remains NOT CERTIFIED because frontend demo/fallback paths and broader provenance enforcement are still scheduled for later O.2.x phases.

## Files Changed

- `Backend/config/runtimePolicy.js`
- `Backend/config/environment.js`
- `Backend/services/marketProviderService.js`
- `Backend/routes/marketRoutes.js`
- `Backend/routes/aiccRoutes.js`
- `Backend/services/aiccSystemStatus.js`
- `Backend/services/streamController.js`
- `Backend/services/simulatedStreamRunner.js`
- `Backend/routes/devStreamRoutes.js`
- `Backend/server.js`
- `docs/raw-data/O2_1_BACKEND_SIMULATION_ISOLATION.md`

## Runtime-Mode Policy

Supported runtime classifications:

- `DEVELOPMENT`
- `TEST`
- `STAGING`
- `PRODUCTION`
- `UNKNOWN`

Simulation is allowed only when all conditions are true:

- Runtime mode resolves to `DEVELOPMENT` or `TEST`.
- Simulation is explicitly enabled with a backend simulation env flag such as `MARKET_AI_ENABLE_SIMULATION=true`, `MARKET_AI_ALLOW_SIMULATION=true`, or `MARKET_AI_AUTO_SIM=true`.
- The request or process is explicitly marked simulated.
- Returned data is labeled with simulation metadata.

Simulation is blocked in:

- `STAGING`
- `PRODUCTION`
- `UNKNOWN`
- missing runtime mode
- malformed runtime mode
- development/test when simulation is not explicitly enabled

The runtime policy fails closed.

## Simulation Gating

Backend route simulation requests now return deterministic rejection when blocked:

```json
{
  "ok": false,
  "code": "SIMULATION_NOT_ALLOWED",
  "environment": "STAGING",
  "simulationAllowed": false,
  "simulated": false,
  "generated": false,
  "sourceType": "PROVIDER_UNAVAILABLE",
  "error": "SIMULATION_NOT_ALLOWED"
}
```

Restricted route paths:

- `/api/market/provider-status?simulate=...`
- `/api/market/provider-diagnostics?simulate=...`
- `/api/market/quotes?simulate=...`
- `/api/market/candles?simulate=...`
- `/api/market/provider-signals?simulate=...`
- `/api/aicc/system-status?simulate=...`
- `/api/dev/stream/start`

## Provider Failure Behavior

Provider quote behavior:

- Raw Alpaca quote succeeds: returns normalized provider data with `sourceType: RAW_DELAYED`.
- Provider unavailable or Alpaca request fails: returns explicit unavailable quote object.
- Simulation requested and allowed in development/test: returns clearly labeled `SIMULATED` quote.
- Simulation requested in staging/production/unknown: route rejects request or service returns unavailable metadata.

Unavailable quote shape includes:

- `available: false`
- `provider: PROVIDER_UNAVAILABLE`
- `sourceType: PROVIDER_UNAVAILABLE`
- `simulated: false`
- `generated: false`
- `error: RAW_DATA_UNAVAILABLE`
- `environment`

Provider candle behavior:

- Raw Alpaca candles succeed: returns normalized candles with raw-provider metadata.
- Raw provider returns empty bars or request fails: returns an empty candle array.
- Simulation requested and allowed in development/test: returns clearly labeled `SIMULATED` candles.
- Simulation requested in staging/production/unknown: route rejects request or service returns an empty candle array.

Provider signal behavior:

- Signals generate only when quote and candle data are available.
- If quote/candles are unavailable, the backend returns an explicit `UNAVAILABLE` provider signal with `confidence: 0`, `signalType: DATA_UNAVAILABLE`, and `sourceType: PROVIDER_UNAVAILABLE`.

## Route Restrictions

Market routes now reject blocked `simulate` query parameters before reaching provider services.

Simulation rejection is deterministic and does not create simulated responses.

Development/test simulation still requires explicit enablement. It cannot be triggered by provider failure alone.

## Stream Startup Restrictions

Automatic stream startup:

- `MARKET_AI_AUTO_SIM` is now checked against runtime simulation policy.
- Auto simulated streams are blocked in staging, production, unknown, missing, or malformed runtime modes.
- Provider outages, after-hours, overnight, weekends, and holidays do not automatically start simulation.

Dev stream route:

- `/api/dev/stream/start` returns `SIMULATION_NOT_ALLOWED` unless runtime policy allows simulation.
- Started simulated streams carry metadata: `sourceType: SIMULATED`, `simulated: true`, `generated: true`, `runtimeEnvironment`, and `simulationAllowed`.
- Stopped streams clear `simulationActive`.

## System Status Integration

Backend AICC system status now reports:

- `simulationAllowed`
- `simulationActive`
- `runtimeEnvironment`
- `providerAvailable`
- `rawDataAvailable`
- `sourceType`

System status no longer automatically reports provider outage, market closed, or after-hours states as simulation.

Replacement states:

- provider unavailable during market hours: `PROVIDER_OFFLINE`
- weekend/holiday: `MARKET_CLOSED`
- after-hours: `AFTER_HOURS`
- live raw provider during open market: `LIVE_ALPACA`

## Provenance Metadata

Backend market responses now include or preserve provenance metadata where practical:

- `sourceType`
- `source`
- `provider`
- `simulated`
- `generated`
- `timestamp`
- `updatedAt`
- `environment`
- `available`
- `error`

Allowed source types introduced or preserved:

- `RAW_DELAYED`
- `SIMULATED`
- `PROVIDER_UNAVAILABLE`
- `RAW_CACHED`

The backend does not fabricate provider timestamps for unavailable data.

## Verification Results

### A. DEVELOPMENT + explicit simulation enabled

Result: PASS

Observed:

- `simulationAllowed: true`
- quote simulation returns `provider: SIMULATION`
- quote/candle source type is `SIMULATED`
- generated data is labeled `generated: true`
- simulated stream can start only under authorized development/test policy

### B. DEVELOPMENT + simulation disabled + provider available

Result: PASS by policy

Observed:

- simulation policy returns `simulationAllowed: false` when no explicit simulation flag exists.
- raw provider response remains the preferred path when provider credentials are available.

### C. DEVELOPMENT + simulation disabled + provider unavailable

Result: PASS

Expected backend behavior:

- explicit `RAW_DATA_UNAVAILABLE` quote
- no generated candle array
- provider signal `UNAVAILABLE`

### D. STAGING + simulation requested

Result: PASS

Observed:

- `SIMULATION_NOT_ALLOWED`
- `environment: STAGING`
- `simulationAllowed: false`

### E. PRODUCTION + simulation requested

Result: PASS

Observed:

- `SIMULATION_NOT_ALLOWED`
- `environment: PRODUCTION`
- `simulationAllowed: false`

### F. STAGING/PRODUCTION + provider unavailable

Result: PASS

Observed staging provider failure output:

- quote: `provider: PROVIDER_UNAVAILABLE`
- quote: `available: false`
- quote: `sourceType: PROVIDER_UNAVAILABLE`
- quote: `simulated: false`
- candles: empty array
- provider status: `rawDataAvailable: false`
- provider status: `simulationActive: false`
- signal: `UNAVAILABLE`
- signal confidence: `0`

### G. After-hours/weekend/provider outage

Result: PASS

Observed:

- backend system status reports `MARKET_CLOSED` during weekend/closed-market check.
- `simulationActive: false`
- `simulationAllowed: false` in staging/production-like modes.
- no automatic simulation substitution occurs from system status.

## Remaining Backend Simulation Paths

Still present by design for isolated development/testing:

- `Backend/services/simulatedStreamRunner.js`
- `Backend/services/streamController.js`
- `/api/dev/stream/*`
- authorized `simulate` scenarios in development/test only
- test fixtures and backend simulation tests

Still requiring later raw-data certification work:

- legacy anomaly baseline route in `Backend/server.js`
- broader cognition snapshot provenance
- raw/delayed provider labeling by Alpaca subscription/feed terms
- holiday/early-close market-hours certification

## Remaining Frontend Simulation Paths

Not modified in O.2.1:

- `FrontendReact/src/services/cognitionApi.js`
- `FrontendReact/src/services/demoCognition.js`
- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/services/marketDataService.js`
- closed-beta fallback inputs in Behavioral and Failsafe pages
- Replay and Journal placeholders

These are scheduled for later O.2.x phases.

## Known Risks

- Frontend code may still interpret empty candle arrays or unavailable quotes through existing fallback UI until frontend phases are completed.
- Provider compare diagnostics now surface unavailable quotes more honestly, but UI copy may still need later alignment.
- Development workflows that relied on simulation without an explicit env flag must now set a simulation enable flag.
- System status no longer reports after-hours as simulation, which may change operator-facing backend status labels once frontend consumes the new metadata.

## Rollback Notes

If a backend runtime issue appears:

1. Prefer restoring explicit unavailable response compatibility rather than restoring generated quote/candle fallbacks.
2. Keep production/staging simulation blocking intact.
3. If local development stream testing is blocked unexpectedly, set a development/test runtime plus explicit simulation flag instead of weakening the policy.
4. Do not re-enable silent provider substitution in staging or production.

## O.2.1 Result

Backend Simulation Isolation: PASS

Backend staging simulation blocked: YES

Backend production simulation blocked: YES

Provider failure silently creates market data: NO

Automatic simulated stream startup in staging/production: BLOCKED

Frontend behavior changed: NO

Training: OFF

Shadow Trainer: OFF

Production `market-ai-core`: UNTOUCHED

Raw Data Certification: NOT CERTIFIED
