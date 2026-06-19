# Brain Drift Detection and Containment

Date: 2026-06-16

Implemented policy service:

- `Backend/services/brain/brainDriftControl.js`

## Drift Categories

| Category | Detection rule | Severity | Baseline | Warning threshold | Quarantine threshold | Human review |
|---|---|---|---|---|---|---|
| MISSION_DRIFT | Mission version or mission text changes | CRITICAL | approved mission contract | any mismatch | any mismatch | required |
| INPUT_SCOPE_DRIFT | Unauthorized/simulated/generated/unknown trusted input | CRITICAL | approved input classes | any warning input | any trusted violation | required |
| OUTPUT_AUTHORITY_DRIFT | Authority expansion or operator-facing shadow output | CRITICAL | authority contract | any attempt | any attempt | required |
| CONFIDENCE_DRIFT | confidence rises while accuracy falls | HIGH | prior/baseline calibration | >25 point confidence rise with accuracy decline | repeated high severity | required |
| ABSTENTION_DRIFT | abstention rate changes materially | MODERATE | prior abstention distribution | >30 point move | coupled with safety regression | conditional |
| PERFORMANCE_DRIFT | accuracy/calibration decline | HIGH | prior/baseline performance | >15 point drop | repeated decline | required |
| PROVENANCE_DRIFT | provenance violation count > 0 | CRITICAL | provenance compliance objective | any violation | any violation | required |
| VERSION_DRIFT | unknown version, schema mismatch, hidden version change | CRITICAL | version registry | any missing/unknown version | any mismatch | required |
| SCORING_DRIFT | scoring weights/rules changed | CRITICAL | objective policy | any unauthorized change | any change | required |
| SCHEDULE_DRIFT | observation outside lifecycle or schedule override | CRITICAL | lifecycle policy | any attempt | any attempt | required |
| DATASET_SELECTION_DRIFT | brain-selected dataset or failed sample removal | HIGH | evaluation dataset governance | any attempt | any attempt | required |
| SAFETY_POLICY_DRIFT | Failsafe bypass, safety-policy change, live write, promotion | CRITICAL | Failsafe and safety policy | any attempt | any attempt | required |

## Containment States

NORMAL:

No material drift.

WARNING:

Minor deviation. Observation may continue with warnings.

DEGRADED:

Output confidence or authority is reduced. Human review may be required before normal state restoration.

QUARANTINED:

No operator-facing contribution is permitted. Training, promotion, authority, and live writes are blocked.

HUMAN_REVIEW_REQUIRED:

No state restoration without explicit human approval.

## Quarantine Policy

Critical drift skips directly to QUARANTINED or HUMAN_REVIEW_REQUIRED.

Critical examples:

- mission contract violation
- unauthorized input class
- live write attempt
- automatic promotion attempt
- Failsafe bypass attempt
- evaluation-history rewrite
- unknown version
- schema mismatch
- simulated/generated trusted input
- unauthorized schedule change

## Release Policy

Quarantine release requires human approval. No brain, weekly review, objective score, or candidate output may release quarantine automatically.

## Failsafe Authority

Failsafe authority is preserved by policy:

- Tactical cannot override Failsafe.
- Behavioral cannot override Failsafe.
- Consensus cannot override Failsafe.
- Regime cannot override Failsafe.
- Narrative cannot hide Failsafe state.
- Weekly review cannot downgrade critical Failsafe violations.
- Objective scoring cannot reward bypassing Failsafe.
- Quarantine cannot be released automatically.

## Baseline and Version Integrity

Future comparisons must include:

- brain version
- mission version
- objective version
- schema version
- configuration version
- evaluation version
- code commit/version
- dataset version

No daily or weekly score may be compared across incompatible versions without explicit compatibility handling. Unknown or missing versions reduce readiness or block comparison.

## Validation Result

Drift Detection: READY.

Automatic Containment: READY for policy validation, not wired to active brain execution.

Quarantine Enforcement: PASS at policy layer.

Direct scenario testing confirmed:

- mission drift causes human review
- unauthorized input drift quarantines
- Failsafe bypass drift quarantines
- finalized ledger mutation is rejected
- weekly auto-promotion is rejected
