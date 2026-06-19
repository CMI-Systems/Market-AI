# Brain Mission Contracts

Date: 2026-06-16

## Purpose

These contracts define immutable mission boundaries for the Tactical, Behavioral, and Failsafe Brains before any PBT-1 Shadow Observation or future offline Shadow Training work begins.

Implemented policy service:

- `Backend/services/brain/brainMissionPolicy.js`

Mission contracts are not mutable by a brain, frontend state, localStorage, query parameters, training output, candidate output, or runtime observation output. Any proposed change requires human approval and a new mission version.

## Tactical Mission

Brain ID: TACTICAL

Mission version: TACTICAL_MISSION_V1

Mission statement:

Interpret validated market structure, trend, momentum, liquidity, volatility, and related tactical conditions using only approved locked inputs.

Allowed input classes:

- VALIDATED_QUOTE
- VALIDATED_CANDLES
- OHLCV
- SYMBOL
- TIMEFRAME
- TACTICAL_DERIVED_CONTEXT
- PROVENANCE_METADATA
- VALIDATION_METADATA
- MARKET_SESSION_METADATA
- PROVIDER_STATUS_METADATA
- SYSTEM_STATUS_METADATA

Allowed output classes:

- TACTICAL_STATE
- CONFIDENCE_OBSERVATION
- ABSTENTION
- INSUFFICIENT_DATA
- WARNINGS
- NON_AUTHORITATIVE_OBSERVATION

Authority level:

NON_AUTHORITATIVE_OBSERVATION during PBT-1.

Permanent safety rules:

- no unauthorized input classes
- no simulated or generated trusted inputs
- no unknown-source trusted inputs
- no invalid-timestamp trusted inputs
- no live writes
- no automatic promotion
- no mission changes
- no hidden version changes
- no evaluation-history rewriting

## Behavioral Mission

Brain ID: BEHAVIORAL

Mission version: BEHAVIORAL_MISSION_V1

Mission statement:

Evaluate operator behavior using only approved journal, replay, operator-history, and explicit behavioral evidence already present in AICC.

Allowed input classes:

- JOURNAL_ENTRY
- REPLAY_SESSION
- OPERATOR_HISTORY
- EXPLICIT_CONFIDENCE_FIELD
- EXPLICIT_EMOTIONAL_STATE_FIELD
- PLAN_ADHERENCE_FIELD
- RULE_COMPLIANCE_FIELD
- DECISION_QUALITY_FIELD
- FAILSAFE_RESPONSE_FIELD
- LINKED_MARKET_CONTEXT
- PROVENANCE_METADATA
- VALIDATION_METADATA
- MARKET_SESSION_METADATA
- PROVIDER_STATUS_METADATA
- SYSTEM_STATUS_METADATA

Allowed output classes:

- BEHAVIORAL_STATE
- UNKNOWN
- INSUFFICIENT_DATA
- EVIDENCE_COVERAGE
- WARNINGS
- NON_AUTHORITATIVE_OBSERVATION

Authority level:

NON_AUTHORITATIVE_OBSERVATION during PBT-1.

Permanent safety rules:

- no inferred psychology
- no clinical diagnosis
- no unsupported emotional claims
- no unsupported bias claims
- no cross-operator mixing
- no live writes
- no automatic promotion
- no mission changes
- no hidden version changes
- no evaluation-history rewriting

## Failsafe Mission

Brain ID: FAILSAFE

Mission version: FAILSAFE_MISSION_V1

Mission statement:

Detect unsafe, invalid, unavailable, conflicting, inconsistent, stale, simulated, generated, or provenance-deficient conditions and preserve final blocking authority.

Allowed input classes:

- PROVIDER_IDENTITY
- SOURCE_TYPE
- TIMESTAMP_VALIDITY
- FRESHNESS
- AVAILABILITY
- SIMULATED_GENERATED_FLAGS
- MARKET_SESSION
- VALIDATION_RESULT
- DATA_QUALITY_RESULT
- PROVENANCE_RESULT
- CONFLICT_RESULT
- CONSISTENCY_RESULT
- TACTICAL_STATE
- BEHAVIORAL_STATE
- CONSENSUS_STATE
- REGIME_STATE
- WARNINGS
- PROVIDER_BACKEND_STATUS
- PROVENANCE_METADATA
- VALIDATION_METADATA
- MARKET_SESSION_METADATA
- PROVIDER_STATUS_METADATA
- SYSTEM_STATUS_METADATA

Allowed output classes:

- FAILSAFE_STATE
- BLOCKING_REASON
- RELIABILITY
- QUARANTINE_RECOMMENDATION
- HUMAN_REVIEW_REQUIRED
- WARNINGS

Authority level:

BLOCKING_AUTHORITY.

Permanent safety rules:

- Failsafe authority cannot be bypassed
- no simulated or generated trusted inputs
- no unknown-source trusted inputs
- no invalid-timestamp trusted inputs
- no live writes
- no automatic promotion
- no mission changes
- no hidden version changes
- no evaluation-history rewriting

## Prohibited Input Classes

All brains reject:

- WEBULL
- NEWS
- MACRO_DATA
- MARKET_BREADTH
- OPTIONS_DATA
- BROKER_ACCOUNT_DATA
- ORDER_DATA
- POSITION_DATA
- PROVIDER_CREDENTIAL
- SUPABASE_SERVICE_ROLE
- COOKIE
- SESSION_TOKEN
- INFERRED_PSYCHOLOGY
- NEW_BEHAVIORAL_TELEMETRY
- SIMULATED_TRUSTED_INPUT
- GENERATED_TRUSTED_INPUT
- UNKNOWN_SOURCE_TRUSTED_INPUT
- CROSS_OPERATOR_AGGREGATE

## Prohibited Outputs

All brains reject:

- order execution
- position modification
- mission change
- objective approval
- objective activation
- scoring-rule change
- input-scope expansion
- authority expansion
- weight update
- rule mutation
- model promotion
- production deployment
- Failsafe override
- clinical diagnosis or unsupported behavioral claims

## Change Control

Required approvals:

- mission change
- input-scope change
- output-authority change
- objective activation
- objective scoring-weight change
- schedule-policy change
- Failsafe-policy change
- schema change
- baseline replacement
- candidate promotion
- production deployment

No brain may approve any of these actions.

## Versioning

Current policy version: PRE_SHADOW_MISSION_POLICY_V1

Mission comparison across unknown or incompatible mission versions must return HUMAN_REVIEW_REQUIRED.

## Validation Result

Brain Mission Contracts: PASS.

Direct scenario testing confirmed:

- unknown brain fails closed
- mission text mutation requires human review
- new input classes are rejected
- authority expansion is blocked
- order-execution output is rejected
- self-approval is blocked
