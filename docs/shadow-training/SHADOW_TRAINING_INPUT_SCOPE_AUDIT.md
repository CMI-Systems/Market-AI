# AICC Shadow Training Input-Scope and Isolation Audit

Date: 2026-06-16

## Executive Summary

Result: PASS, with readiness gaps.

The approved Shadow Training input scope is limited to existing locked AICC infrastructure. The audit found that the current frontend dataset, validation, governance, and training-readiness gates are structured to fail closed for actual training activation. No new provider, news, macro, breadth, broker-account, behavioral telemetry, or schema expansion is required for PBT-1 Shadow Observation preparation.

Two safety defects were found and fixed:

- Backend Shadow Trainer logging could append approved observations to JSONL training datasets during normal brain supervision.
- Dataset validation could return `valid: true` for an ownerless record if other quality points were sufficient.

After fixes, shadow observation remains non-authoritative and logging-disabled, backend shadow entries reject unsupported providers and simulated/generated sources, and dataset validation requires operator identity.

Readiness decision:

- PBT-1 Shadow Observation Preparation: READY_WITH_GAPS
- Offline Shadow Training Preparation: READY_WITH_GAPS
- Activation: NOT AUTHORIZED

## Approved Input Inventory

| Input class | Source | Origin | Timestamp source | Provider/source metadata | Validation dependency | Persistence status | Operator ownership | Consumers | Shadow Observation | Offline Shadow Training |
|---|---|---|---|---|---|---|---|---|---|---|
| Validated quote/snapshot | Backend provider routes, market provider service, frontend market services | Alpaca raw provider path | Provider timestamp | provider, sourceType, sessionState, validationStatus | marketDataValidator, provenanceValidator | Not raw-dataset persisted automatically | N/A until captured | Tactical, Failsafe, charts, dataset capture | APPROVED_LOCKED_INPUT | APPROVED_LOCKED_INPUT |
| Validated candles/OHLCV | Backend candle routes, chartDataService | Alpaca raw provider path | Provider bar timestamp | provider, sourceType, symbol, timeframe | marketDataValidator, chartDataService, provenanceValidator | Not raw-dataset persisted automatically | N/A until captured | Tactical, charts, dataset capture | APPROVED_LOCKED_INPUT | APPROVED_LOCKED_INPUT |
| Market session/runtime metadata | marketSessionPolicy, runtimePolicy, provider status | System policy | Policy evaluation time plus provider timestamp where applicable | sessionState, marketOpen, runtimeEnvironment | runtime/session policy | Stored only when captured in dataset metadata | Dataset owner when captured | Tactical, Failsafe, Data Streams, governance | APPROVED_SYSTEM_METADATA | APPROVED_SYSTEM_METADATA |
| Provenance metadata | provenanceValidator, chartDataService, dataset capture | Backend/frontend validation | Provider timestamp, receivedAt/dataAge where available | provider, sourceType, simulated, generated, available | provenanceValidator | Persisted in dataset market context when captured | Dataset owner | All brains, dataset validation, Failsafe | APPROVED_PROVENANCE_METADATA | APPROVED_PROVENANCE_METADATA |
| Market validation metadata | marketDataValidator, chartDataService, dataset capture | Validation layer | Provider timestamp | validationStatus, qualityLabel, errors, warnings | marketDataValidator and dataset validator | Persisted in dataset record | Dataset owner | Failsafe, dataset validation, governance | APPROVED_PROVENANCE_METADATA | APPROVED_PROVENANCE_METADATA |
| Tactical derived state | tacticalBrain | Derived from validated market context | Input/provider timestamp plus analysis timestamp | provenance propagated | tactical provenance gates | Captured only through dataset record | Dataset owner | Consensus, Failsafe, briefing, dataset capture | APPROVED_DERIVED_INPUT | APPROVED_DERIVED_INPUT |
| Behavioral market state | behavioralBrain | Derived from existing market intelligence surfaces | Source timestamps from market inputs | provenance propagated | behavioral provenance gates | Captured only through dataset record | Dataset owner | Consensus, Failsafe, briefing, dataset capture | APPROVED_DERIVED_INPUT | APPROVED_DERIVED_INPUT |
| Failsafe state | failsafeBrain | Derived from provenance, validation, provider/system, Tactical, Behavioral | Input timestamps plus analysis timestamp | provenance/conflict/warnings | Failsafe gates | Captured only through dataset record | Dataset owner | Orchestrator, governance, dataset capture | APPROVED_DERIVED_INPUT | APPROVED_DERIVED_INPUT |
| Journal evidence | journalPersistenceService | Operator-entered record | created_at/updated_at | operator_id, symbol/status | Supabase auth/RLS and service checks | Supabase draft schema/local staging only when enabled | Required | Behavioral review, dataset capture | APPROVED_OPERATOR_EVIDENCE | APPROVED_OPERATOR_EVIDENCE |
| Replay evidence | replayPersistenceService, replayBehavioralDatasetBridge | Operator replay review | created_at/updated_at and replay metadata | operator_id, replay status | Replay persistence and dataset validation | Supabase draft schema/local staging only when enabled | Required | Behavioral review, dataset capture | APPROVED_OPERATOR_EVIDENCE | APPROVED_OPERATOR_EVIDENCE |
| Operator history | operatorHistoryService | Aggregated owned journal/replay/dataset records | Source record timestamps | operator-owned source rows | Supabase/RLS and source services | Derived/read-only | Required | Behavioral review, governance | APPROVED_OPERATOR_EVIDENCE | APPROVED_OPERATOR_EVIDENCE |
| Dataset validation/readiness/governance | dataset validation, shadow readiness, governance services | Certification and governance layer | validation/readiness created_at where persisted | dataset_id, operator_id, status labels | Dataset validator, governance rules | Supabase draft schema when enabled | Required | Future queues, repository, governance | APPROVED_SYSTEM_METADATA | APPROVED_SYSTEM_METADATA |

Rejected input classes: Webull, unknown providers, news/headlines/sentiment, macro data, market breadth, options data, broker-account data, credentials, cookies, Supabase service-role data, inferred psychology, new behavioral telemetry, generated market records, simulated market records outside approved dev/test labels, cross-operator aggregates, placeholder behavioral evidence.

Unknown and placeholder inputs are not approved.

## Tactical Input Contract

Approved Tactical inputs:

- `symbol`
- `quote`
- `candles`
- `open`, `high`, `low`, `close`, `volume`
- `timestamp`
- `timeframe`
- trend, momentum, volatility, liquidity, relative-strength context where already derived from approved inputs
- `sessionState`
- `provider`
- `sourceType`
- `validationStatus`
- `qualityLabel`
- `available`
- stale/partial/unavailable state
- `provenance`

Findings:

- Tactical Brain blocks missing candles as `INSUFFICIENT_DATA`.
- Provenance `BLOCKED` or `DATA_UNAVAILABLE` prevents trusted directional output.
- Outputs keep `rawDataCertified: false` and `trainingEligible: false`.
- No news, Webull, broker-account, macro, breadth, or fabricated data input is approved.

## Behavioral Input Contract

Approved Behavioral inputs split into two existing categories:

- Market-behavior brain inputs: `marketPulse`, `marketIntelligence`, `globalScan`, internal briefing/newsletter data, cross-asset context already present in code.
- Operator behavioral review inputs: journal entries, replay sessions, operator history, explicit confidence/emotion/rule/plan fields where already persisted, Failsafe-response evidence, timestamps, ownership metadata, linked market context.

Findings:

- Missing market-behavior data returns `UNAVAILABLE`.
- Operator behavior must come from persisted/current operator evidence, not price action alone.
- No inferred psychology, clinical diagnosis, new telemetry, or placeholder text is approved.
- Bias detection remains not implemented unless evidence-backed in a later approved phase.

## Failsafe Input Contract

Approved Failsafe inputs:

- provider identity and source type
- timestamp validity and freshness
- availability, simulated/generated flags
- market session and market-open state
- validation/data-quality/provenance results
- conflict and consistency results
- Tactical, Behavioral, Consensus, and Regime state
- warnings/errors
- provider/backend status

Findings:

- Unknown inputs fail closed.
- Provider outage remains separate from market closure.
- Invalid timestamps, simulated/generated inputs, and unknown sources block trust.
- Future shadow outputs cannot suppress live Failsafe warnings.

## Raw Market Data Boundary

Approved raw-market flow:

Alpaca -> backend market provider service -> market-data validation -> runtime/session policy -> frontend data service -> provenance validation -> dataset capture.

Boundary result: PASS.

Confirmed:

- Alpaca remains the only operational provider.
- Webull remains NOT_IMPLEMENTED and is rejected from shadow-training readiness.
- Staging, production, and unknown runtime simulation remain blocked.
- Missing timestamps are not accepted for backend shadow readiness after fix.
- No polling snapshot is certified as real streaming.
- No generated/simulated record is approved for training readiness.

## Dataset Capture Audit

Dataset capture creates deterministic records with:

- `id`
- `operatorId`
- `operatorEmail`
- `symbol`
- `timestamp`
- `intelligenceSnapshot`
- `operatorContext`
- `marketContext`
- `marketDataValidation`
- `learningTargets`
- `metadata`
- `warnings`

Findings:

- Capture defaults `rawDataCertified` and `trainingEligible` to false.
- Capture preserves operator identity when supplied.
- Capture keeps market context and validation summaries.
- Missing tactical, behavioral, failsafe, replay/operator context is warning-producing.
- Dataset version is currently `metadata.version: M1`.
- Full run/version logging is partial.

## Dataset Schema Lock

Decision: SCHEMA_LOCKED_WITH_GAPS.

Approved fields:

- Dataset identity: `id`, `operatorId`, `operatorEmail`, `symbol`, `timestamp`
- Intelligence: `intelligenceSnapshot`
- Operator evidence: `operatorContext`
- Market context: `marketContext`
- Validation summary: `marketDataValidation`
- Learning target labels: `learningTargets`
- Metadata: `source`, `datasetType`, `version`, `persisted`, `trainingActivated`, `rawDataCertified`, `trainingEligible`, quality labels
- Warnings: `warnings`

Required fields:

- owner/operator identity
- symbol
- market context with valid provenance
- market-data validation
- tactical, behavioral, and failsafe targets for shadow-training consideration
- operator/replay context for shadow-training consideration

Rejected fields:

- credentials, tokens, cookies, service-role keys
- broker account/buying-power/order fields
- Webull data
- news/macro/breadth/options inputs
- inferred psychological or clinical fields
- generated/simulated market records as certified input

Gaps:

- No formal migration-applied schema version table.
- Dataset schema version is an `M1` metadata value, not a separately governed compatibility registry.
- No run-level shadow observation schema exists yet.

Any new field requires a separate approved schema-change phase.

## Dataset Validation Audit

Result: PASS after fix.

Validation checks:

- operator identity
- symbol integrity
- tactical/behavioral/failsafe target presence
- replay/operator context
- market context
- provenance status
- market-data validation status
- training activation false
- forced `rawDataCertified` and `trainingEligible` booleans blocked

Fix applied:

- Dataset validation now requires operator identity for `valid: true`.

## Historical Validation Audit

Result: PASS.

`historicalDatasetValidationService` recalculates dataset validation and shadow readiness, compares stored validation/readiness to recalculated state, flags changed validation/readiness, handles empty repositories safely, and does not auto-promote historical records.

## Governance Audit

Result: PASS.

Governance supports:

- owner status: OWNED, OWNERSHIP_MISSING, OWNERSHIP_MISMATCH
- completeness status
- validation status
- shadow-readiness status
- review-required status
- retention class
- future training eligibility
- explicit blocked reasons

Default training block before activation:

- RAW_DATA_CERTIFICATION_REQUIRED
- TRAINING_DISABLED
- SHADOW_TRAINER_DISABLED by runtime policy/fix
- BRAIN_LEARNING_DISABLED

Raw Data Certification alone does not activate training because `trainingEnabled` is normalized false and `certifyTrainingReadiness` hard-codes `rawDataCertified` false.

## Training Eligibility Gate

Result: PASS.

Direct matrix results:

- forced `rawDataCertified: true` -> BLOCKED
- forced `trainingEligible: true` -> BLOCKED
- empty/ownerless dataset -> not valid, not shadow-ready
- simulated dataset -> invalid
- generated dataset -> invalid
- unknown provider -> invalid
- cross-operator dataset -> OWNERSHIP_MISMATCH, not eligible
- complete approved dataset -> valid and shadow-ready candidate only
- training readiness -> false
- governance default -> RAW_DATA_CERTIFICATION_REQUIRED

No localStorage, sessionStorage, query parameter, or UI-only setting was found that can activate training.

## Observation/Training Separation

Result: PASS after fix.

PBT-1 Shadow Observation:

- Uses approved live validated inputs.
- Can produce diagnostic non-authoritative observations.
- Does not change weights, rules, provider data, Command Center verdicts, Signals, Alerts, Consensus, or Regime.
- Logging is disabled until an approved future activation phase.

Offline Shadow Training:

- Must use stored approved datasets.
- Must run outside live request paths.
- Must produce candidate/evaluation artifacts only.
- Cannot auto-promote, deploy, or replace active brain logic.

## Live Brain Isolation

Result: PASS after fix.

The backend supervisor still computes read-only cognition and non-authoritative shadow metadata, but Shadow Trainer dataset logging was disabled. No path was found that overwrites Tactical, Behavioral, Failsafe, Consensus, Regime, Narrative logic, active imports, provider data, production deployment settings, or model versions.

## Queue Infrastructure

Classification: READINESS_ONLY.

Current queue/readiness services evaluate dataset readiness and certification state. They do not execute training, update weights, promote candidates, or deploy models. Queue persistence exists only as a draft schema and service layer for controlled staging validation.

## Logging/Reproducibility

Classification: PARTIAL.

Available:

- dataset ID
- dataset metadata version `M1`
- validation/readiness labels and scores
- provider/symbol/timeframe in market context where captured
- warnings/rejection reasons
- operator ownership in persistence services

Missing:

- formal run ID for PBT-1 observations
- code commit/version capture
- brain version registry
- configuration version registry
- evaluation version registry
- immutable observation log schema

## Versioning

Classification: PARTIAL.

| Version type | Status |
|---|---|
| Dataset version | PARTIAL (`metadata.version: M1`) |
| Schema version | PARTIAL (draft schema plus governance policy, no applied registry) |
| Brain version | NOT_IMPLEMENTED |
| Candidate/model version | NOT_IMPLEMENTED |
| Code commit/version | NOT_IMPLEMENTED in dataset records |
| Configuration version | NOT_IMPLEMENTED |
| Evaluation version | NOT_IMPLEMENTED |

## Cross-Operator Isolation

Result: PASS.

Services use authenticated operator IDs and `.eq("operator_id", operatorId)` filters for journal, replay, dataset records, dataset validations, shadow readiness, and operator history. The draft Supabase schema includes owner-scoped RLS policies for all persistence tables. No cross-operator aggregation policy exists; therefore cross-operator training datasets remain rejected.

## Security Audit

Result: PASS.

No dataset capture or shadow readiness path was found that captures provider secrets, Supabase service-role keys, cookies, browser tokens, or credentials. Environment and secret values were not printed.

## Activation Search

Result: PASS after fix.

Counts after fixes:

- Training activation paths: 0
- Shadow Trainer activation paths: 0
- Brain Learning activation paths: 0
- Automatic promotion paths: 0

Backend `shadowTrainer` remains importable for evaluation-only diagnostics but no longer appends JSONL entries. Frontend training readiness remains false.

## Scenario Matrix

| Scenario | Result |
|---|---|
| Valid approved raw dataset | Valid and accepted for shadow-training consideration; not training-enabled |
| Empty dataset | Incomplete/blocked |
| Simulated dataset | Blocked |
| Generated dataset | Blocked |
| Unknown provider | Blocked |
| Invalid timestamp | Blocked by validator/evaluator |
| Stale dataset | Degraded or blocked according to provenance freshness |
| Missing provenance | Blocked |
| Missing operator ownership | Invalid after fix |
| Manually supplied `trainingEligible: true` | Blocked |
| Manually supplied `rawDataCertified: true` | Blocked |
| Cross-operator records | Ownership mismatch, not eligible |
| Placeholder behavioral evidence | Not approved as evidence |
| Empty behavioral evidence | Insufficient data/unknown |
| Shadow output entering live Command Center | No authoritative path approved |
| Automatic candidate promotion | No path found |
| Training activation environment flag | No frontend readiness activation; backend training logger disabled |
| Staging simulation attempt | SIMULATION_NOT_ALLOWED |
| Production simulation attempt | SIMULATION_NOT_ALLOWED |

## Defects Found

Critical: 1

- Backend Shadow Trainer could append approved observations to training JSONL files from the supervisor shadow observer path.

High: 1

- Dataset validator could mark an ownerless record `valid: true` based on score alone.

## Exact Fixes

- `Backend/training/shadowTrainer.js`
  - Removed active training logger import.
  - Disabled JSONL append behavior in `observeShadowEvent`.
  - Preserved observation/evaluation metadata with explicit disabled reason.
  - Removed `webull` as an accepted provider normalization target.
  - Stopped substituting missing timestamps with current time.

- `Backend/training/trainingEvaluator.js`
  - Added approved-provider gate for Alpaca only.
  - Added simulated/generated/blocked source-type rejection.

- `FrontendReact/src/services/intelligence/aiccDatasetQualityValidator.js`
  - Required operator identity for `valid: true`.

## Remaining Gaps

1. PBT-1 observation persistence path is not implemented.
2. Logging/reproducibility is partial.
3. Versioning is partial.
4. Queue infrastructure is readiness-only.
5. Offline Shadow Training runner is not implemented.
6. Brain/model/candidate promotion controls are documentation and absence-based, not a formal promotion subsystem.
7. Cross-operator aggregation policy is absent and must remain blocked.
8. Authenticated product-surface visual QA remains pending from Phase P.

## Readiness Decision

Shadow Training Input-Scope and Isolation Audit: PASS.

PBT-1 Shadow Observation Preparation: READY_WITH_GAPS.

Offline Shadow Training Preparation: READY_WITH_GAPS.

Neither Shadow Trainer activation nor Brain Learning activation is authorized.

## Recommended Next Step

PBT-1 Shadow Observation Preparation, gated by Authenticated Product Surface QA and a separate approved observation-logging design.
