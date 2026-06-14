# AICC Phase O.2.6 - Failsafe Provenance Enforcement

## Executive Summary

O.2.6 adds canonical provenance validation to the frontend intelligence layer and enforces the rule:

No provenance = no trust.

The audit found real enforcement gaps:

- Provenance fields existed across backend/frontend responses, but no single validator enforced them.
- Tactical and Behavioral outputs could complete without carrying canonical provenance forward.
- Failsafe measured data-stream health and validation presence, but did not consistently block confidence when provenance was simulated, generated, unknown, invalid, unavailable, or pre-certified.
- Consensus, Regime, and Narrative could still consume blocked upstream layers unless each layer exposed blocked state consistently.
- Dataset validation and shadow readiness could still be scored from context quality even when provenance/training flags were invalid.

Fixes were made only at the affected intelligence and governance boundaries. No backend provider behavior, Supabase schema, RLS, production configuration, training, Shadow Trainer, queue processor, or brain-learning path was activated.

Raw Data Certification remains not certified.

## Provenance Contract

Created canonical validator:

- `FrontendReact/src/services/intelligence/provenanceValidator.js`

Canonical provenance object:

```js
{
  sourceType,
  provider,
  available,
  simulated,
  generated,
  timestamp,
  dataAge,
  environment,
  sessionState,
  marketOpen,
  dataState,
  rawDataCertified,
  trainingEligible,
  warnings
}
```

Exports:

- `validateProvenance(input, options)`
- `normalizeProvenance(input)`
- `mergeProvenance(inputs, options)`
- `getProvenanceRisk(provenance)`
- `isTrustedRawInput(provenance, options)`

Result shape:

```js
{
  valid,
  trusted,
  status,
  sourceType,
  provider,
  available,
  simulated,
  generated,
  timestampValid,
  freshnessStatus,
  sessionStatus,
  rawDataCertified,
  trainingEligible,
  riskLevel,
  blockingReasons,
  warnings
}
```

## Trust Rules

Runtime trusted input requires:

- `available === true`
- `simulated !== true`
- `generated !== true`
- known provider for raw/source-bearing states
- recognized `sourceType`
- valid timestamp when required
- data within freshness threshold
- no critical source conflict
- no pre-O.6 `rawDataCertified: true`
- no pre-certification `trainingEligible: true`

Important distinction:

- Runtime trust does not equal raw-data certification.
- Before O.6, `rawDataCertified` is always normalized to `false`.
- Before raw-data certification, `trainingEligible` is always normalized to `false`.

## Source-Type Enforcement

| Source Type | Enforcement |
|---|---|
| `RAW_LIVE` | Trusted only with known provider, availability, valid fresh timestamp, and non-simulated/non-generated metadata. |
| `RAW_DELAYED` | Trusted with degraded status and disclosure. |
| `RAW_CACHED` | Degraded/limited only with original timestamp and explicit `dataAge`; missing age blocks. |
| `PARTIAL_DATA` | Degraded with warnings; cannot drive full-confidence verdicts. |
| `STALE` | Degraded/high risk; disclosed as stale. |
| `MARKET_CLOSED` | Not an integrity failure by itself, but not live raw market data. |
| `PROVIDER_OFFLINE` | Data unavailable; not trusted. |
| `BACKEND_UNAVAILABLE` | Data unavailable; not trusted. |
| `DATA_UNAVAILABLE` | Data unavailable; not trusted. |
| `UNKNOWN_SOURCE` | Blocked. |
| `INVALID_TIMESTAMP` | Blocked. |
| `SIMULATED` | Blocked, not raw-certified, not training eligible. |
| `GENERATED` | Blocked, not raw-certified, not training eligible. |
| `UNKNOWN` | Blocked. |

## Failsafe Enforcement

Modified:

- `FrontendReact/src/services/intelligence/failsafeBrain.js`
- `FrontendReact/src/services/intelligence/dataIntegrityEngine.js`
- `FrontendReact/src/services/intelligence/validationEngine.js`
- `FrontendReact/src/services/intelligence/conflictDetectionEngine.js`

Failsafe now:

- evaluates merged provenance across tactical, behavioral, data streams, market intelligence, global scan, and newsletter context
- returns `BLOCKED` for simulated/generated/unknown-source/invalid-timestamp/critical provenance conflicts
- returns `DATA_UNAVAILABLE` for unavailable provider/backend/source paths
- caps reliability to 15 for critical provenance blocks
- caps reliability to 30 for data unavailable
- caps reliability to 55 for degraded provenance
- only permits `CONFIRMED_ENVIRONMENT` when provenance is trusted
- includes provenance fields in its output
- keeps `rawDataCertified: false`
- keeps `trainingEligible: false`

Added Failsafe states:

- `DEGRADED_ENVIRONMENT`
- `DATA_UNAVAILABLE`
- `BLOCKED`

## Tactical/Behavioral Provenance

Modified:

- `FrontendReact/src/services/intelligence/tacticalBrain.js`
- `FrontendReact/src/services/intelligence/behavioralBrain.js`

Tactical output now preserves:

- source type
- provider
- availability
- simulated/generated flags
- data age
- session state
- market-open state
- data state
- canonical provenance object
- raw-data certification false
- training eligibility false

Tactical blocks analysis when candle/quote provenance is blocked or unavailable.

Behavioral output now preserves the same provenance fields for market-behavior inputs. Behavioral market assessment is blocked when market-behavior provenance is unavailable or untrusted. This keeps operator/replay behavior separate from market-behavior provenance.

## Orchestrator Enforcement

Modified:

- `FrontendReact/src/services/intelligence/aiccIntelligenceOrchestrator.js`

The orchestrator now:

- validates raw input provenance before running the stack
- blocks full-stack synthesis if raw input provenance is blocked or unavailable
- passes provenance into Failsafe
- returns top-level `provenance`
- preserves warnings from provenance blocking reasons

Execution order remains:

Tactical -> Behavioral -> Failsafe -> Consensus -> Regime -> Narrative.

## Consensus/Regime/Narrative Enforcement

Modified:

- `FrontendReact/src/services/intelligence/consensusEngine.js`
- `FrontendReact/src/services/intelligence/regimeEngine.js`
- `FrontendReact/src/services/intelligence/narrativeEngine.js`

Consensus now refuses blocked or unavailable tactical/behavioral/failsafe layers.

Regime now returns `UNKNOWN` when upstream provenance blocks required intelligence context.

Narrative now returns `AICC Intelligence Limited` instead of creating a market story from blocked, unavailable, simulated, generated, invalid-timestamp, or unknown-source layers.

## Conflict Detection

Modified:

- `FrontendReact/src/services/intelligence/conflictDetectionEngine.js`

Detected conflicts include:

- `RAW_LIVE` plus simulated/generated metadata
- simulated/generated input
- unknown-source input
- invalid timestamp
- unavailable source with valid-looking values
- raw certification asserted before O.6
- training eligibility asserted before certification

Critical provenance conflicts produce major confidence pressure and drive Failsafe toward `BLOCKED`.

## Dataset/Persistence Enforcement

Modified:

- `FrontendReact/src/services/intelligence/aiccDatasetQualityValidator.js`
- `FrontendReact/src/services/intelligence/aiccShadowTrainingEvaluator.js`
- `FrontendReact/src/services/intelligence/aiccTrainingReadinessCertification.js`
- `FrontendReact/src/services/datasetGovernanceService.js`

Dataset validation now rejects or flags:

- simulated market context
- generated market context
- unavailable market context
- unknown source
- invalid timestamp
- misleading source combinations
- `rawDataCertified: true` before O.6
- `trainingEligible: true` before certification

Shadow readiness now remains false when dataset provenance is blocked.

Training readiness now requires raw-data certification and returns `trainingReady: false` with `RAW_DATA_CERTIFICATION_REQUIRED` before O.6.

Dataset governance now fails closed:

- `rawDataCertified: false`
- `trainingEnabled: false`
- `trainingBlockedReason: RAW_DATA_CERTIFICATION_REQUIRED`

No persistence behavior was added or changed in O.2.6.

## Scenario Matrix

| Scenario | Expected | Result |
|---|---|---|
| A. Verified `RAW_LIVE` input | Trusted for runtime; raw-certified false | PASS: `CONFIRMED`, trusted true, raw-certified false |
| B. `RAW_DELAYED` input | Trusted with limitation and disclosure | PASS: `DEGRADED`, trusted true |
| C. `RAW_CACHED` with timestamp and age | Degraded/limited, never live | PASS: `DEGRADED`, trusted false |
| D. `PARTIAL_DATA` | Degraded, limited confidence, warnings | PASS |
| E. `STALE` | Degraded/high risk | PASS |
| F. `PROVIDER_OFFLINE` | Data unavailable or blocked | PASS: `DATA_UNAVAILABLE` |
| G. `BACKEND_UNAVAILABLE` | Data unavailable or blocked | PASS: `DATA_UNAVAILABLE` |
| H. `UNKNOWN_SOURCE` | Blocked | PASS |
| I. Invalid timestamp | Blocked | PASS: `BLOCKED`, critical |
| J. `simulated: true` | Blocked, not certified, not eligible | PASS |
| K. `generated: true` | Blocked, not certified, not eligible | PASS |
| L. `RAW_LIVE` + simulated conflict | Blocked, critical | PASS |
| M. `RAW_CACHED` without `dataAge` | Review required or blocked | PASS: `BLOCKED` |
| N. `rawDataCertified: true` before O.6 | Rejected/reset false with critical warning | PASS |
| O. `trainingEligible: true` before certification | Rejected/reset false with critical warning | PASS |
| P. One brain trusted, one blocked | Consensus unavailable or limited | PASS: Consensus `UNAVAILABLE`, Regime `UNKNOWN`, Narrative limited |
| Q. All layers trusted for runtime | Failsafe may confirm; certification false | PASS: Failsafe `CONFIRMED_ENVIRONMENT`, raw-certified false |

## Page-Level Validation

Validated protected routes with local dev server:

- Command Center
- Tactical Brain
- Behavioral Brain
- Failsafe Brain
- Market Pulse
- Global Scan
- Data Streams
- Replay Center

Results:

- No runtime crash
- No console errors
- No `NaN`
- No visible `undefined`
- Auth-protected pages redirected safely to Login
- Command Center rendered directly under current route configuration

## Issues Found

1. No centralized frontend provenance validator existed.
2. Tactical and Behavioral outputs did not consistently carry canonical provenance.
3. Failsafe reliability could remain too high when provenance was incomplete or blocked.
4. Validation counted object presence even when provenance was blocked.
5. Conflict detection did not consider critical provenance contradictions.
6. Consensus, Regime, and Narrative needed stricter blocked-layer vocabulary.
7. Dataset validation could accept high-context records even when provenance/training flags were invalid.
8. Shadow/training readiness needed raw-data certification enforcement.
9. Dataset governance options could theoretically be passed as certified/enabled before Phase O certification.

## Exact Fixes

Created:

- `FrontendReact/src/services/intelligence/provenanceValidator.js`
- `docs/raw-data/O2_6_FAILSAFE_PROVENANCE_ENFORCEMENT.md`

Modified:

- `FrontendReact/src/services/intelligence/tacticalBrain.js`
- `FrontendReact/src/services/intelligence/behavioralBrain.js`
- `FrontendReact/src/services/intelligence/failsafeBrain.js`
- `FrontendReact/src/services/intelligence/dataIntegrityEngine.js`
- `FrontendReact/src/services/intelligence/validationEngine.js`
- `FrontendReact/src/services/intelligence/conflictDetectionEngine.js`
- `FrontendReact/src/services/intelligence/aiccIntelligenceOrchestrator.js`
- `FrontendReact/src/services/intelligence/consensusEngine.js`
- `FrontendReact/src/services/intelligence/regimeEngine.js`
- `FrontendReact/src/services/intelligence/narrativeEngine.js`
- `FrontendReact/src/services/intelligence/aiccDatasetQualityValidator.js`
- `FrontendReact/src/services/intelligence/aiccShadowTrainingEvaluator.js`
- `FrontendReact/src/services/intelligence/aiccTrainingReadinessCertification.js`
- `FrontendReact/src/services/datasetGovernanceService.js`

## Remaining Risks

- Some page-level UI surfaces can be improved in later phases to display the full provenance object more visibly.
- Backend provenance fields depend on O.2.1/O.2.5 metadata being present in provider responses.
- Raw Data Certification remains blocked until O.2.7 re-audit and later certification phases.
- Command Center route accessibility was observed under the current auth routing setup; it was not changed in O.2.6 because the phase scope is provenance enforcement.

## O.2.6 Result

Failsafe Provenance Enforcement: PASS

Provenance Scenarios Tested: 17

Critical Conflicts Detected: 5

Critical Conflicts Remaining: 0

Unknown-Source Trust Paths: 0

Invalid-Timestamp Trust Paths: 0

Simulated/Generated Trust Paths: 0

Failsafe Provenance Integrity: PASS

Brain Provenance Integrity: PASS

Dataset Provenance Integrity: PASS

Training Eligibility Enforcement: PASS

Provenance Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

## Recommended Next Step

O.2.7 Simulation Dependency Re-Audit.
