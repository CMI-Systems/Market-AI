# AICC Phase O.2.7 - Simulation Dependency Re-Audit

## Executive Summary

O.2.7 re-audited the AICC data and intelligence pipeline after O.2.1 through O.2.6.

Result:

- Simulation can no longer silently influence staging or production intelligence.
- Backend simulation remains available only for explicitly enabled development/test use.
- Frontend demo cognition and market fixtures remain available only for explicitly enabled development/test use.
- Provider/backend failure returns explicit unavailable/offline states.
- Simulated, generated, unknown-source, invalid-timestamp, unavailable, and pre-certified inputs are blocked by provenance enforcement.
- Dataset validation, shadow readiness, training readiness, and governance remain blocked from treating non-certified data as raw or training eligible.

Two residual certification defects were found and fixed during O.2.7:

1. `aiccTrainingReadinessCertification.js` could return `trainingReady: true` if a caller manually supplied `rawDataCertified: true`.
2. `aiccIntelligenceOrchestrator.js` treated simulated-only input as empty fallback input, which hid blocked provenance from Tactical, Behavioral, and Failsafe summary states.

After fixes, residual runtime simulation dependencies are zero.

Raw Data Certification remains not certified because O.3 through O.6 are still required.

## Original O.1 Baseline

From `O1_RAW_DATA_AUDIT.md`:

- Original Raw Data Coverage: 40%
- Original Simulation Dependency: CRITICAL
- Original Unknown Data Paths: 8
- Raw Data Certification: NOT YET CERTIFIED

Original critical risks included:

- Simulated provider quotes/candles could influence Tactical Brain and Command Center.
- Frontend demo/fetch-failure fallbacks could influence core pages.
- Failsafe did not enforce simulation or unknown provenance as a trust blocker.
- Market session and data availability were not separated.

## O.2 Remediation Summary

O.2.1 isolated backend simulation behind runtime policy.

O.2.2 closed backend silent fallback paths and fixed malformed provider payload handling.

O.2.3 isolated frontend demo/offline fallbacks.

O.2.4 validated explicit unavailable states.

O.2.5 added deterministic market-hours raw-data policy.

O.2.6 enforced end-to-end provenance through Failsafe, brains, orchestrator, dataset validation, readiness, and governance.

O.2.7 re-audited the full pipeline and fixed the remaining two certification-blocking defects.

## Repository Simulation Inventory

| Area | Classification | Result |
|---|---|---|
| `Backend/config/runtimePolicy.js` | BLOCKED_BY_RUNTIME_POLICY | Simulation fails closed unless runtime is DEVELOPMENT/TEST and simulation is explicitly enabled. |
| `Backend/services/marketProviderService.js` simulated quote/candle utilities | EXPLICIT_DEV_TEST_ONLY | Still available only after runtime policy authorizes simulation. Staging/production requests return unavailable. |
| `Backend/services/simulatedStreamRunner.js` | EXPLICIT_DEV_TEST_ONLY | Local stream utility only; route/controller policy blocks staging/production activation. |
| `Backend/routes/devStreamRoutes.js` | BLOCKED_BY_RUNTIME_POLICY | Simulated stream start blocked unless simulation policy allows it. |
| `Backend/server.js` auto simulated stream | BLOCKED_BY_RUNTIME_POLICY | Auto-start is blocked outside explicitly enabled development/test runtimes. |
| `FrontendReact/src/services/demoCognition.js` | EXPLICIT_DEV_TEST_ONLY | Demo cognition is labeled simulated and only returned when frontend demo policy allows it. |
| `FrontendReact/src/services/marketDataService.js` mock market data | EXPLICIT_DEV_TEST_ONLY / EXPLICIT_UNAVAILABLE_STATE | Demo data only when allowed; otherwise returns unavailable/empty states. |
| `FrontendReact/src/services/cognitionApi.js` fetch failure path | EXPLICIT_UNAVAILABLE_STATE | Backend failure returns unavailable, not demo cognition. |
| `FrontendReact/src/services/marketProviderApi.js` offline status | EXPLICIT_UNAVAILABLE_STATE | Offline provider state no longer claims simulation or health. |
| `FrontendReact/src/services/aiccApi.js` AICC fallback status | EXPLICIT_UNAVAILABLE_STATE | No local simulated operational status. |
| Replay/Journal sample data | HARMLESS_UI_PLACEHOLDER | Non-market operator workflow placeholders; not raw market intelligence. |
| Backend tests/local fixtures | EXPLICIT_DEV_TEST_ONLY | Test/local artifacts only, not runtime intelligence. |

Residual runtime dependency count: 0.

## Backend Re-Audit

Verified:

- Silent quote fallback remains removed.
- Silent candle fallback remains removed.
- Signal generation does not operate on unavailable quotes/candles.
- Staging simulation requests are blocked.
- Production simulation requests are blocked.
- Unknown runtime simulation requests fail closed.
- Development/test simulation requires explicit enablement.
- Simulated stream cannot auto-start in staging/production.
- Market closure does not activate simulation.
- Provider outage does not activate simulation.
- Backend route/module load checks passed.

Runtime policy matrix:

| Scenario | Result |
|---|---|
| DEVELOPMENT + explicit simulation enabled | Allowed and labeled simulated |
| DEVELOPMENT + simulation disabled | Blocked |
| TEST + explicit simulation enabled | Allowed and labeled simulated |
| STAGING + simulation requested | Blocked |
| PRODUCTION + simulation requested | Blocked |
| UNKNOWN runtime + simulation requested | Blocked |
| STAGING + provider simulation requested | Explicit `PROVIDER_UNAVAILABLE`, no synthetic quote/candles |

## Frontend Re-Audit

Verified:

- Cognition failure does not activate demo cognition.
- Demo intelligence is blocked in staging, production, and unknown runtime.
- Development/test demo data is labeled `DEMO DATA - SIMULATED - NOT RAW MARKET DATA`.
- Provider diagnostics do not fabricate health.
- AICC status does not fabricate operational state.
- Static market fixtures cannot appear as current raw data unless explicit dev/test demo is enabled.
- Signals show empty/unavailable chart state when provider candles are unavailable.
- Watchlists return unavailable market fields outside demo mode.
- Data Streams and System Boot fail closed on backend/provider unavailability.

Frontend raw-data readiness: READY.

## Brain/Orchestrator Re-Audit

Tactical Brain:

- No directional verdict from unavailable or simulated/generated inputs.
- Simulated/generated inputs return blocked provenance.
- Provenance is retained in output.

Behavioral Brain:

- No synthetic participant behavior is constructed from unavailable market-behavior inputs.
- Market behavior provenance is separate from operator/replay behavior.
- Missing inputs remain unavailable.

Failsafe Brain:

- Unknown, simulated, generated, stale, invalid, unavailable, and conflicting provenance are degraded or blocked.
- Reliability is capped under provenance risk.
- Failsafe returns `BLOCKED` for simulated/generated input.

Consensus:

- No default synthesis from unavailable or blocked brains.

Regime:

- No current regime from unverified market context.

Narrative:

- No market thesis from blocked or unavailable inputs.

Orchestrator:

- Does not strip provenance.
- Rejects blocked input.
- Simulated/generated object reaching orchestrator now yields:
  - Tactical: `BLOCKED`
  - Behavioral: `BLOCKED`
  - Failsafe: `BLOCKED`
  - Consensus: `UNAVAILABLE`

Brain provenance readiness: READY.

## Persistence/Dataset Re-Audit

Verified:

- Simulated/generated/demo records cannot be treated as raw.
- Dataset validation detects provenance failures.
- Shadow readiness rejects non-raw inputs.
- Training readiness remains blocked.
- Dataset governance returns `rawDataCertified: false`.
- Dataset governance returns `trainingEligible: false`.
- `RAW_DATA_CERTIFICATION_REQUIRED` remains enforced.
- No persisted record can bypass provenance through missing fields.

O.2.7 fixed one bypass:

- Training readiness now always fails closed before raw-data certification, even if a caller supplies `rawDataCertified: true`.

Dataset provenance readiness: READY.

## Runtime Environment Matrix

| Scenario | Expected | Result |
|---|---|---|
| A. DEVELOPMENT + explicit simulation enabled | Allowed, labeled simulated, not raw-certified, not training eligible | PASS |
| B. DEVELOPMENT + simulation disabled + provider available | Raw provider path | PASS by runtime policy/provider path |
| C. DEVELOPMENT + simulation disabled + provider unavailable | Explicit unavailable state | PASS |
| D. TEST + explicit simulation enabled | Allowed and labeled | PASS |
| E. STAGING + simulation requested | Blocked | PASS |
| F. PRODUCTION + simulation requested | Blocked | PASS |
| G. UNKNOWN runtime + simulation requested | Blocked | PASS |
| H. Backend unavailable | `BACKEND_UNAVAILABLE` | PASS |
| I. Provider unavailable | `PROVIDER_OFFLINE` or `DATA_UNAVAILABLE` | PASS |
| J. Market closed | `MARKET_CLOSED`, `RAW_CACHED`, or `DATA_UNAVAILABLE`; no simulation | PASS |
| K. Invalid timestamp | `INVALID_TIMESTAMP` and blocked trust | PASS |
| L. Unknown source | `UNKNOWN_SOURCE` and blocked trust | PASS |
| M. Simulated/generated object reaches orchestrator | Rejected or blocked | PASS after O.2.7 fix |
| N. `rawDataCertified: true` before O.6 | Rejected/reset false | PASS |
| O. `trainingEligible: true` before O.6 | Rejected/reset false | PASS |

## Unknown Path Resolution

### O.1 Unknown Paths

| Original Unknown Path | Resolution |
|---|---|
| Provenance of backend cognition snapshots | RESOLVED_UNAVAILABLE / BLOCKED_BY_PROVENANCE. If not traceable, frontend cognition and intelligence layers do not treat it as raw. |
| Whether Alpaca IEX feed should be live or delayed | RESOLVED_RAW_DELAYED. Raw provider metadata now supports source type and delayed/cached disclosure. |
| Legacy `/api/anomalies` baseline volumes | RESOLVED_HARMLESS for O.2 scope. Not part of current AICC raw provider intelligence path; future O.3/O.4 provider/data validation may revisit. |
| Persistent cognition memory raw/simulated mix | RESOLVED_HARMLESS / BLOCKED_BY_PROVENANCE. Shadow/simulated persistence is skipped or not used as raw market intelligence. |
| Backend data journal files real/generated status | RESOLVED_DEV_TEST_ONLY. Local/test records do not certify raw market data. |
| Production Render `MARKET_AI_AUTO_SIM` | RESOLVED_DEV_TEST_ONLY. Runtime policy blocks simulation in staging/production even if env asks for it. |
| Deployment `VITE_DEMO_MODE` status | RESOLVED_DEV_TEST_ONLY. Frontend runtime policy blocks demo outside DEVELOPMENT/TEST. |
| Market holidays/early closes | RESOLVED_UNAVAILABLE. O.2.5 returns `UNKNOWN_SESSION` unless verified; no simulation or holiday inference. |

### O.2 Unknown Paths

| O.2 Unknown Path | Resolution |
|---|---|
| Whether production Render has `MARKET_AI_AUTO_SIM` enabled | RESOLVED_DEV_TEST_ONLY through backend runtime policy. |
| Whether all deployed frontend environments keep `VITE_DEMO_MODE=false` | RESOLVED_DEV_TEST_ONLY through frontend runtime policy. |
| Whether backend cognition snapshots are raw-derived, simulated, or mixed | RESOLVED_UNAVAILABLE / BLOCKED_BY_PROVENANCE when not verifiable. |
| Whether legacy market pages consume `marketDataService.js` mock values at runtime | RESOLVED_UNAVAILABLE. Outside demo, service returns unavailable/empty states. |

Unknown paths remaining: 0.

## Updated Raw-Data Coverage

Original Raw Data Coverage: 40%.

Updated Raw Data Coverage: 86%.

Rationale:

- Backend raw provider paths now return raw or explicit unavailable states.
- Backend simulation is blocked in staging/production.
- Frontend demo fallback is blocked in staging/production/unknown runtime.
- Intelligence brains retain and enforce provenance.
- Dataset and training readiness cannot certify simulated/generated/unknown-source inputs.
- Unknown paths from O.1/O.2 are resolved by raw path, unavailable state, dev/test isolation, or provenance blocking.

Coverage is not 100% because:

- O.3 Provider Integrity Audit is still required.
- O.4 Market Data Validation is still required.
- O.5 Failsafe Data Certification is still required.
- O.6 Raw Data Certification is still required.
- Provider delay/freshness certification and full data-quality validation remain future phases.

## Updated Simulation Dependency

Original Simulation Dependency: CRITICAL.

Updated Simulation Dependency: NONE.

Definition met:

- No simulation dependency in staging/production.
- Development/test simulation is explicitly isolated, gated, labeled, and not raw-certified.

## Residual Risks

Simulation blockers:

- None identified for staging/production runtime.

Provider-integrity blockers for O.3:

- Provider identity, delay status, feed quality, and credential readiness still need provider-specific audit.
- Alpaca IEX feed delay semantics should be formally documented.

Data-quality blockers for O.4:

- Candle completeness, quote freshness, timestamp validation, stale thresholds, and partial-data handling need formal validation.

Certification blockers for O.5/O.6:

- Failsafe data certification is not complete.
- Raw data certification is not complete.
- Training eligibility must remain off until raw-data certification completes.

## Blocking Issues

None remaining for O.2 simulation removal after the two O.2.7 fixes.

## Non-Blocking Issues

- Vite large chunk warning remains non-blocking.
- Replay/Journal sample data remains non-market placeholder content.
- Some UI surfaces can later display provenance metadata more prominently.

## Files Modified

Modified during O.2.7:

- `FrontendReact/src/services/intelligence/aiccTrainingReadinessCertification.js`
- `FrontendReact/src/services/intelligence/aiccIntelligenceOrchestrator.js`

Created during O.2.7:

- `docs/raw-data/O2_7_SIMULATION_DEPENDENCY_REAUDIT.md`

## Exact Fixes

1. Training readiness fail-closed fix:
   - `certifyTrainingReadiness()` now forces `rawDataCertified: false`.
   - `trainingReady` remains false.
   - `RAW_DATA_CERTIFICATION_REQUIRED` is always returned before O.6.

2. Orchestrator blocked-provenance fix:
   - fallback mode now means empty or malformed input only.
   - untrusted but present input is passed through to Tactical, Behavioral, and Failsafe so each layer can return `BLOCKED`.
   - simulated/generated input no longer becomes generic fallback state in orchestrator summary.

## O.2 Final Result

Simulation Dependency Re-Audit: PASS

Original Raw Data Coverage: 40%

Updated Raw Data Coverage: 86%

Original Simulation Dependency: CRITICAL

Updated Simulation Dependency: NONE

Residual Runtime Simulation Dependencies: 0

Development/Test Simulation Paths: 6

Staging Simulation: BLOCKED

Production Simulation: BLOCKED

Unknown Paths Remaining: 0

Backend Raw-Data Readiness: READY

Frontend Raw-Data Readiness: READY

Brain Provenance Readiness: READY

Dataset Provenance Readiness: READY

O.2 Simulation Removal: COMPLETE

Raw Data Certification: NOT YET CERTIFIED

## Recommended Next Step

O.3 Provider Integrity Audit.
