# Daily Ledger and Weekly Review Contract

Date: 2026-06-16

Implemented policy service:

- `Backend/services/brain/brainDriftControl.js`

No new persistence schema was created during this phase.

## Daily Ledger Contract

```json
{
  "ledgerId": "string",
  "brainId": "TACTICAL | BEHAVIORAL | FAILSAFE",
  "brainVersion": "string",
  "missionVersion": "string",
  "objectiveVersion": "string",
  "schemaVersion": "string",
  "date": "YYYY-MM-DD",
  "sessionWindow": "string",
  "marketSession": "string",
  "provider": "string",
  "symbolsObserved": [],
  "timeframesObserved": [],
  "datasetsProcessed": 0,
  "observationsProduced": 0,
  "abstentions": 0,
  "correctAbstentions": 0,
  "confidenceDistribution": {},
  "warnings": [],
  "failures": [],
  "safetyBlocks": [],
  "falsePositives": 0,
  "falseNegatives": 0,
  "objectiveResults": [],
  "regressions": [],
  "provenanceStatus": "string",
  "generatedAt": "ISO timestamp",
  "finalizedAt": "ISO timestamp|null",
  "status": "OPEN | OBSERVING | CLOSING | FINALIZED | SUBMITTED | REJECTED | QUARANTINED"
}
```

## Ledger Lifecycle

Allowed daily ledger states:

- OPEN
- OBSERVING
- CLOSING
- FINALIZED
- SUBMITTED
- REJECTED
- QUARANTINED

## Immutability Rules

- A finalized ledger is immutable.
- A submitted ledger is immutable.
- A rejected or quarantined ledger is terminal.
- A brain cannot delete failed records.
- A brain cannot remove failed observations.
- A brain cannot revise finalized metrics.
- Corrections require a new version and audit record.
- Missing required provenance prevents finalization.
- Incomplete ledger remains INCOMPLETE.
- Daily ledger does not activate learning.

## Weekly Review Contract

```json
{
  "reviewId": "string",
  "brainId": "TACTICAL | BEHAVIORAL | FAILSAFE",
  "brainVersion": "string",
  "missionVersion": "string",
  "weekStart": "ISO date",
  "weekEnd": "ISO date",
  "dailyLedgerIds": [],
  "sessionsObserved": 0,
  "datasetCount": 0,
  "weeklyMetrics": {},
  "priorWeekComparison": {},
  "baselineComparison": {},
  "regimePerformance": {},
  "confidenceCalibration": {},
  "abstentionAnalysis": {},
  "falsePositiveAnalysis": {},
  "falseNegativeAnalysis": {},
  "safetyViolations": [],
  "regressions": [],
  "unresolvedWeaknesses": [],
  "proposedObjectives": [],
  "reviewStatus": "GENERATING | READY_FOR_REVIEW | APPROVED | REJECTED | REQUIRES_REMEDIATION | QUARANTINED",
  "generatedAt": "ISO timestamp",
  "submittedAt": "ISO timestamp|null",
  "humanDecision": "string|null"
}
```

## Weekly Submission

Friday after regular-market close:

1. DAILY_CLOSEOUT finalizes the daily ledger.
2. WEEKLY_SUBMISSION locks finalized daily records.
3. WEEKLY_REVIEW aggregates records for human review.

## Weekend Review

Weekend review may:

- aggregate finalized records
- compare baseline
- detect regressions
- propose objectives
- prepare human review

Weekend review may not:

- promote candidates
- rewrite daily ledgers
- activate objectives
- approve goals
- modify scoring weights
- activate learning

## Objective Scoring

Scores must include balanced factors:

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

Safety violations override aggregate score.

## Proposed Objectives

Weekly review may generate proposed objectives only in PROPOSED state. Proposed objectives require human approval before activation.

## Audit History

Any correction requires:

- new ledger/review version
- reference to the prior record
- reason for correction
- human approval where final records are affected

## Validation Result

Daily Ledger Integrity: PASS at policy layer.

Weekly Review Integrity: PASS at policy layer.

Finalized Record Immutability: PASS at policy layer.

Direct scenario testing confirmed:

- finalized ledger mutation rejected
- failed-record removal rejected
- open ledger mutation allowed only when safe
- weekly auto-promotion rejected
- weekly review requires human decision
