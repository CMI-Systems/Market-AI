# AICC Phase O.2.5 - Market-Hours Raw-Data Policy

## Executive Summary

O.2.5 centralizes market-session classification and separates three concepts that were previously easy to blur:

- Market session state
- Provider health
- Raw data availability

The audit found no evidence that market closure was intentionally activating backend simulation after O.2.1/O.2.2, but it did find several misleading edge cases:

- Backend unavailable/provider unavailable responses could still stamp current time onto unavailable quote/candle objects.
- System status could treat market-closed behavior and provider availability too closely.
- Stream idle state did not expose a deterministic session/data-state policy.
- Frontend Command Center could display `Market: CLOSED` when the real state was backend unavailable or unknown.
- Dataset capture did not explicitly preserve raw-data certification/training eligibility safety metadata.

These were fixed without adding a provider, hardcoding holiday calendars, enabling simulation, activating training, or changing production credentials.

Raw Data Certification remains not certified. O.2.5 establishes the market-hours policy foundation required before O.2.6 Failsafe Provenance Enforcement.

## Existing Session Sources

| Source | Classification | Files | Result |
|---|---|---|---|
| Alpaca/provider quote and candle timestamps | PROVIDER_CLOCK | `Backend/services/marketProviderService.js` | Preserved only when supplied by provider. No fabricated current timestamp for unavailable provider data. |
| Provider calendar input | PROVIDER_CALENDAR | `Backend/services/marketSessionPolicy.js` | Supported when explicitly supplied. Used for `MARKET_HOLIDAY` only when verified. |
| Backend system clock in market timezone | SYSTEM_CLOCK_DERIVED | `Backend/services/marketSessionPolicy.js` | Used only as a limited fallback for normal weekday/weekend/session-window classification. |
| Legacy market-hours helper | SYSTEM_CLOCK_DERIVED | `Backend/services/marketHours.js` | Still present, but backend status/stream/provider paths now use the centralized policy metadata. |
| Hardcoded holiday calendar | Not used | N/A | No holiday calendar was added. Holidays are not inferred from missing data. |
| Missing or malformed session data | UNKNOWN | `Backend/services/marketSessionPolicy.js` | Fails closed to `UNKNOWN_SESSION` with warnings. |

## Session-State Definitions

Supported session states:

- `PRE_MARKET`
- `REGULAR_MARKET`
- `AFTER_HOURS`
- `OVERNIGHT`
- `WEEKEND`
- `MARKET_HOLIDAY`
- `UNKNOWN_SESSION`

Policy:

- `MARKET_HOLIDAY` is only returned from verified provider calendar data.
- Weekend is derived from validated New York market timezone.
- Missing, malformed, or conflicting inputs return `UNKNOWN_SESSION`.
- Market closure is not a provider outage.
- Provider outage is not market closure.
- No session state activates simulation.

## Data-State Definitions

Supported data states:

- `RAW_LIVE`
- `RAW_DELAYED`
- `RAW_CACHED`
- `PARTIAL_DATA`
- `STALE`
- `MARKET_CLOSED`
- `PROVIDER_OFFLINE`
- `BACKEND_UNAVAILABLE`
- `DATA_UNAVAILABLE`
- `UNKNOWN`

Policy:

- Raw/cached states require truthful provider provenance and timestamps.
- Cached data retains the original provider timestamp and age.
- Simulated or generated data is not classified as raw data.
- Unavailable data must not contain current-looking provider timestamps.
- Missing raw data must produce explicit unavailable/offline/closed states.

## Provider Health Separation

Provider health is now evaluated independently from market session:

- `MARKET_CLOSED` does not imply `PROVIDER_OFFLINE`.
- `PROVIDER_OFFLINE` does not imply `MARKET_CLOSED`.
- No data during a weekend is not automatically treated as provider failure.
- Provider failure during regular market hours is reported as `PROVIDER_OFFLINE`.
- Closed-market stream idleness is reported as `MARKET_CLOSED`, not stream failure.

## Backend Policy

Created:

- `Backend/services/marketSessionPolicy.js`

Exports:

- `resolveMarketSession(input)`
- `classifyMarketDataState(input)`
- `evaluateMarketAvailability(input)`
- `SESSION_STATES`
- `DATA_STATES`

Backend responses now include or preserve session/data metadata where practical:

- `sessionState`
- `marketOpen`
- `extendedHours`
- `sessionSource`
- `sessionVerified`
- `currentTime`
- `nextOpen`
- `previousClose`
- `dataState`
- `dataAge`
- `sourceType`
- `simulated`
- `generated`

The policy intentionally does not create or activate simulation. Development/test simulation remains governed by the existing runtime policy from O.2.1/O.2.2.

## Stream Policy

Stream status now exposes deterministic session and data-state metadata when idle or unavailable.

Verified behavior:

- No automatic simulated stream startup.
- No generated heartbeat is presented as market data.
- Closed market can be represented as `MARKET_CLOSED`.
- Provider disconnect can be represented separately from market closure.
- Reconnect behavior returns to provider/raw paths and does not switch to simulation.

## Intelligence Policy

The market-session policy supports the existing O.2.4 intelligence constraints:

- Tactical intelligence must not treat unavailable/cached data as current live momentum.
- Behavioral intelligence must distinguish current behavior from unavailable or cached context.
- Failsafe must treat unknown, stale, simulated, generated, partial, and unavailable provenance as trust issues.
- Consensus must remain limited when upstream brains lack verified data.
- Regime must not imply a live current regime from stale prior-session data.
- Narrative must disclose when verified raw inputs are unavailable, delayed, cached, or limited.

No tactical, behavioral, failsafe, consensus, regime, or narrative calculation logic was changed in O.2.5.

## Frontend Behavior

Frontend status fallbacks now preserve explicit unavailable metadata:

- Backend unavailable states use `BACKEND_UNAVAILABLE`.
- Unknown session states use `UNKNOWN_SESSION`.
- Provider diagnostics do not report raw data availability from local fallback.
- Command Center no longer maps unknown/backend unavailable status to a misleading `Market: CLOSED` label.

Affected frontend files:

- `FrontendReact/src/services/marketProviderApi.js`
- `FrontendReact/src/services/aiccApi.js`
- `FrontendReact/src/pages/CommandCenter.jsx`

## Scenario Matrix

| Scenario | Expected | Result |
|---|---|---|
| Verified pre-market + extended-hours raw data | `PRE_MARKET` + `RAW_LIVE` or `RAW_DELAYED` | PASS: `PRE_MARKET` + `RAW_DELAYED` |
| Verified pre-market + no extended-hours feed | `PRE_MARKET` + `DATA_UNAVAILABLE` | PASS |
| Regular market + healthy provider | `REGULAR_MARKET` + `RAW_LIVE` or `RAW_DELAYED` | PASS: `REGULAR_MARKET` + `RAW_DELAYED` |
| Regular market + provider outage | `REGULAR_MARKET` + `PROVIDER_OFFLINE` | PASS |
| After-hours + verified extended-hours data | `AFTER_HOURS` + `RAW_LIVE` or `RAW_DELAYED` | PASS: `AFTER_HOURS` + `RAW_DELAYED` |
| After-hours + prior-session cached data | `AFTER_HOURS` + `RAW_CACHED` with original timestamp | PASS |
| Overnight + no feed | `OVERNIGHT` + `MARKET_CLOSED` or `DATA_UNAVAILABLE` | PASS: `MARKET_CLOSED` |
| Weekend + cached prior-session data | `WEEKEND` + `RAW_CACHED` with timestamp and age | PASS |
| Weekend + no data | `WEEKEND` + `MARKET_CLOSED` | PASS |
| Verified market holiday | `MARKET_HOLIDAY` + `MARKET_CLOSED` or `RAW_CACHED` | PASS: `MARKET_HOLIDAY` + `MARKET_CLOSED` |
| Holiday cannot be verified | `UNKNOWN_SESSION`, not `MARKET_HOLIDAY` | PASS |
| Provider reconnects | Return to raw provider state; never simulation | PASS by static stream/provider policy verification |
| Missing or malformed session data | `UNKNOWN_SESSION` + warning | PASS |

## Persistence/Dataset Safety

Dataset capture now preserves safety metadata:

- `rawDataCertified: false`
- `trainingEligible: false`
- `trainingActivated: false`
- `persisted: false`

Dataset records may preserve market context fields such as:

- `sessionState`
- `marketOpen`
- `sourceType`
- `provider`
- `timestamp`
- `dataAge`
- `simulated`
- `generated`
- `available`

Phase N governance remains the training blocker through `RAW_DATA_CERTIFICATION_REQUIRED`. Cached, delayed, partial, closed-market, unknown-session, or unavailable records are not automatically treated as raw-certified.

## Issues Found

1. No centralized deterministic backend market-session policy existed.
2. Provider unavailable quote/candle normalization could use current timestamps, making unavailable data look current.
3. System status could blend market-open/provider-health/data-availability concepts.
4. Stream idle state lacked session/data-state provenance.
5. Frontend offline provider/AICC status fallbacks lacked session/data-state metadata.
6. Command Center could display closed-market wording for unknown or backend-unavailable conditions.
7. Dataset capture metadata did not explicitly mark raw certification and training eligibility as false.

## Exact Fixes

Created:

- `Backend/services/marketSessionPolicy.js`
- `docs/raw-data/O2_5_MARKET_HOURS_RAW_DATA_POLICY.md`

Modified:

- `Backend/services/marketProviderService.js`
  - Added centralized session/data-state metadata.
  - Removed current-time fallback from unavailable quote/candle timestamps.
  - Preserved provider timestamps only when provider supplies them.
  - Added explicit data/session metadata to provider status and generated signal output.

- `Backend/routes/marketRoutes.js`
  - Preserved quote provenance in provider comparison output without fabricating timestamps.

- `Backend/services/aiccSystemStatus.js`
  - Separated stream mode, provider availability, market session, and data availability.
  - Added session/data-state metadata to system status.

- `Backend/services/streamController.js`
  - Added session/data-state metadata to idle stream status.
  - Confirmed no automatic simulation startup.

- `FrontendReact/src/services/marketProviderApi.js`
  - Added explicit backend-unavailable and unknown-session metadata for offline provider status.

- `FrontendReact/src/services/aiccApi.js`
  - Added explicit backend-unavailable and unknown-session metadata for offline AICC status.

- `FrontendReact/src/pages/CommandCenter.jsx`
  - Replaced binary market open/closed header label with explicit session/data-state display.

- `FrontendReact/src/services/intelligence/aiccDatasetCapture.js`
  - Added `rawDataCertified: false` and `trainingEligible: false` metadata.

## Remaining Risks

- Provider calendar/holiday verification depends on a future or existing provider calendar input; no holiday calendar was hardcoded.
- Some frontend pages still need O.2.6/O.2.7 provenance enforcement to visibly consume all new session metadata.
- Raw Data Certification remains blocked until Failsafe provenance enforcement and re-audit are complete.
- Vite still reports the existing large chunk warning; this is not market-hours blocking.

## O.2.5 Result

Market-Hours Raw-Data Policy: PASS

Session States Validated: 7

Scenario Tests: 13

Simulation Substitution Paths: 0

Market-Closure Misclassifications Found/Fixed: 4

Provider-Health Misclassifications Found/Fixed: 2

Timestamp Integrity: PASS

Session Policy: READY

Market-Hours Raw-Data Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

## Recommended Next Step

O.2.6 Failsafe Provenance Enforcement.
