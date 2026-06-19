# Brain Objective Governance Policy

Date: 2026-06-16

## Purpose

This policy prevents brains from creating, approving, activating, extending, scoring, or gaming their own objectives during PBT-1 preparation, future Shadow Observation, future offline Shadow Training, PBT-2 Assisted Intelligence, and later beta phases.

Implemented policy service:

- `Backend/services/brain/brainObjectiveGovernance.js`

## Objective Contract

```json
{
  "objectiveId": "string",
  "brainId": "TACTICAL | BEHAVIORAL | FAILSAFE",
  "title": "string",
  "metric": "string",
  "target": "number|string",
  "minimumSampleSize": "positive integer",
  "measurementWindow": "string",
  "approvedInputClasses": [],
  "prohibitedInputClasses": [],
  "safetyConstraints": [],
  "failureConditions": [],
  "scoringWeight": "0..1",
  "effectiveFrom": "ISO timestamp",
  "effectiveUntil": "ISO timestamp",
  "version": "string",
  "status": "PROPOSED | UNDER_REVIEW | APPROVED | ACTIVE | SUSPENDED | REJECTED | COMPLETED | EXPIRED",
  "proposedBy": "string",
  "approvedBy": "human approver",
  "approvedAt": "ISO timestamp"
}
```

## Objective Lifecycle

Allowed states:

- PROPOSED
- UNDER_REVIEW
- APPROVED
- ACTIVE
- SUSPENDED
- REJECTED
- COMPLETED
- EXPIRED

Rules:

- Brains may propose objectives.
- Brains may not approve objectives.
- Brains may not activate objectives.
- Brains may not alter scoring weights.
- Brains may not extend objective dates.
- Human approval evidence is required before APPROVED or ACTIVE state.
- Unknown objectives fail closed.
- Expired objectives cannot remain ACTIVE.
- Objectives cannot expand locked data scope.
- Objectives cannot weaken Failsafe rules.

## Approval Process

Human approval is required for:

- objective activation
- scoring-weight changes
- objective effective-date changes
- input-scope changes
- schema changes
- Failsafe-policy changes
- authority expansion
- candidate promotion
- quarantine release

No brain may approve any of these actions.

## Anti-Gaming Metrics

Balanced evaluation factors:

- accuracy
- calibration
- correct abstention
- false positives
- false negatives
- evidence coverage
- provenance compliance
- stability
- consistency
- safety-rule compliance
- unsupported-claim count
- blocking accuracy
- regression rate

Controls implemented in policy:

- excessive abstention warning
- excessive prediction frequency warning when calibration is weak
- confidence inflation warning
- dataset cherry-picking rejection
- failed-observation removal rejection
- safety violation score override
- high aggregate score cannot override critical failure

## Permanent Safety Objectives

All brains:

- zero unauthorized input classes
- zero simulated/generated trusted inputs
- zero unknown-source trusted inputs
- zero invalid-timestamp trusted inputs
- zero unauthorized live writes
- zero automatic promotion
- zero mission-contract changes
- zero hidden version changes
- zero evaluation-history rewriting

Tactical:

- correct use of INSUFFICIENT_DATA
- confidence calibration
- false-positive tracking
- false-negative tracking
- correct abstention tracking
- stability across symbols, timeframes, and regimes
- provenance compliance

Behavioral:

- unsupported emotional claims: zero
- unsupported bias claims: zero
- correct use of UNKNOWN
- correct use of INSUFFICIENT_DATA
- operator/market evidence separation
- no clinical diagnosis
- evidence coverage tracking
- decision-quality consistency

Failsafe:

- unsafe-input detection
- provider-outage classification
- market-closed/provider-offline separation
- invalid timestamp detection
- provenance-conflict detection
- simulated/generated rejection
- missed-risk tracking
- false-block tracking
- blocking-authority preservation

## Proposed-Goal Restrictions

Goal proposal contract:

```json
{
  "proposalId": "string",
  "brainId": "string",
  "proposedGoal": "string",
  "supportingEvidence": "string",
  "expectedBenefit": "string",
  "risks": "string",
  "requiredInputs": [],
  "conflicts": [],
  "generatedAt": "ISO timestamp",
  "status": "PROPOSED"
}
```

Restrictions:

- Proposal cannot alter active objectives.
- Proposal cannot alter permanent mission.
- Proposal cannot expand input scope.
- Proposal cannot activate itself.
- Proposal cannot change Failsafe rules.
- Proposal cannot modify runtime schedule.
- Proposal cannot be used until approved.

## Validation Result

Objective Governance: PASS.

Direct scenario testing confirmed:

- approved human objective validates
- self-approved objective is rejected
- expired ACTIVE objective is rejected
- scoring weight manipulation is rejected
- NEWS input expansion is rejected
- unsafe goal proposal is rejected
- anti-gaming penalties detect excessive abstention and safety violations
