const POLICY_VERSION = "PRE_SHADOW_DRIFT_CONTROL_V1";

const DRIFT_CATEGORIES = {
  MISSION_DRIFT: "MISSION_DRIFT",
  INPUT_SCOPE_DRIFT: "INPUT_SCOPE_DRIFT",
  OUTPUT_AUTHORITY_DRIFT: "OUTPUT_AUTHORITY_DRIFT",
  CONFIDENCE_DRIFT: "CONFIDENCE_DRIFT",
  ABSTENTION_DRIFT: "ABSTENTION_DRIFT",
  PERFORMANCE_DRIFT: "PERFORMANCE_DRIFT",
  PROVENANCE_DRIFT: "PROVENANCE_DRIFT",
  VERSION_DRIFT: "VERSION_DRIFT",
  SCORING_DRIFT: "SCORING_DRIFT",
  SCHEDULE_DRIFT: "SCHEDULE_DRIFT",
  DATASET_SELECTION_DRIFT: "DATASET_SELECTION_DRIFT",
  SAFETY_POLICY_DRIFT: "SAFETY_POLICY_DRIFT"
};

const CONTAINMENT_STATES = {
  NORMAL: "NORMAL",
  WARNING: "WARNING",
  DEGRADED: "DEGRADED",
  QUARANTINED: "QUARANTINED",
  HUMAN_REVIEW_REQUIRED: "HUMAN_REVIEW_REQUIRED"
};

const CRITICAL_DRIFT = new Set([
  DRIFT_CATEGORIES.MISSION_DRIFT,
  DRIFT_CATEGORIES.INPUT_SCOPE_DRIFT,
  DRIFT_CATEGORIES.OUTPUT_AUTHORITY_DRIFT,
  DRIFT_CATEGORIES.VERSION_DRIFT,
  DRIFT_CATEGORIES.SCORING_DRIFT,
  DRIFT_CATEGORIES.SCHEDULE_DRIFT,
  DRIFT_CATEGORIES.SAFETY_POLICY_DRIFT
]);

const LEDGER_STATES = new Set([
  "OPEN",
  "OBSERVING",
  "CLOSING",
  "FINALIZED",
  "SUBMITTED",
  "REJECTED",
  "QUARANTINED"
]);

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function driftResult(category, severity, containmentState, evidence, humanReviewRequired = false) {
  return {
    category,
    severity,
    containmentState,
    evidence,
    humanReviewRequired
  };
}

function detectDrift(current = {}, baseline = {}) {
  const value = safeObject(current);
  const base = safeObject(baseline);
  const findings = [];

  if (value.missionVersion && base.missionVersion && value.missionVersion !== base.missionVersion) {
    findings.push(driftResult(DRIFT_CATEGORIES.MISSION_DRIFT, "CRITICAL", CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED, "Mission version changed.", true));
  }

  if (value.unauthorizedInputClasses > 0 || value.simulatedTrustedInputs > 0 || value.generatedTrustedInputs > 0 || value.unknownSourceTrustedInputs > 0) {
    findings.push(driftResult(DRIFT_CATEGORIES.INPUT_SCOPE_DRIFT, "CRITICAL", CONTAINMENT_STATES.QUARANTINED, "Unauthorized, simulated, generated, or unknown-source trusted input detected.", true));
  }

  if (value.authorityExpansionAttempt === true || value.operatorFacingWhileShadow === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.OUTPUT_AUTHORITY_DRIFT, "CRITICAL", CONTAINMENT_STATES.QUARANTINED, "Output authority expansion attempted.", true));
  }

  if (number(value.averageConfidence) - number(base.averageConfidence) > 0.25 && number(value.accuracy) < number(base.accuracy) - 0.1) {
    findings.push(driftResult(DRIFT_CATEGORIES.CONFIDENCE_DRIFT, "HIGH", CONTAINMENT_STATES.DEGRADED, "Confidence increased while accuracy declined.", true));
  }

  if (Math.abs(number(value.abstentionRate) - number(base.abstentionRate)) > 0.3) {
    findings.push(driftResult(DRIFT_CATEGORIES.ABSTENTION_DRIFT, "MODERATE", CONTAINMENT_STATES.WARNING, "Abstention rate moved beyond threshold.", false));
  }

  if (number(base.accuracy) - number(value.accuracy) > 0.15 || number(base.calibrationScore) - number(value.calibrationScore) > 0.15) {
    findings.push(driftResult(DRIFT_CATEGORIES.PERFORMANCE_DRIFT, "HIGH", CONTAINMENT_STATES.DEGRADED, "Performance or calibration declined beyond threshold.", true));
  }

  if (number(value.provenanceViolations) > 0) {
    findings.push(driftResult(DRIFT_CATEGORIES.PROVENANCE_DRIFT, "CRITICAL", CONTAINMENT_STATES.QUARANTINED, "Provenance compliance violation detected.", true));
  }

  if (value.unknownVersion === true || value.schemaMismatch === true || value.hiddenVersionChange === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.VERSION_DRIFT, "CRITICAL", CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED, "Unknown or incompatible version detected.", true));
  }

  if (value.scoringWeightChanged === true || value.scoringRuleChanged === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.SCORING_DRIFT, "CRITICAL", CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED, "Unauthorized scoring change detected.", true));
  }

  if (value.scheduleOverrideAttempt === true || value.observedOutsideLifecycle === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.SCHEDULE_DRIFT, "CRITICAL", CONTAINMENT_STATES.QUARANTINED, "Unauthorized schedule change or observation outside lifecycle detected.", true));
  }

  if (value.datasetSelectedByBrain === true || value.failedObservationRemoved === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.DATASET_SELECTION_DRIFT, "HIGH", CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED, "Dataset selection or failed-observation ledger manipulation detected.", true));
  }

  if (value.failsafeBypassAttempt === true || value.safetyPolicyChanged === true || value.automaticPromotionAttempt === true || value.liveWriteAttempt === true) {
    findings.push(driftResult(DRIFT_CATEGORIES.SAFETY_POLICY_DRIFT, "CRITICAL", CONTAINMENT_STATES.QUARANTINED, "Safety policy, promotion, live write, or Failsafe bypass violation detected.", true));
  }

  return findings;
}

function getContainmentState(findings = []) {
  const values = safeArray(findings);
  if (values.some((item) => item.containmentState === CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED)) {
    return CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED;
  }
  if (values.some((item) => item.containmentState === CONTAINMENT_STATES.QUARANTINED)) {
    return CONTAINMENT_STATES.QUARANTINED;
  }
  if (values.some((item) => item.containmentState === CONTAINMENT_STATES.DEGRADED)) {
    return CONTAINMENT_STATES.DEGRADED;
  }
  if (values.some((item) => item.containmentState === CONTAINMENT_STATES.WARNING)) {
    return CONTAINMENT_STATES.WARNING;
  }
  return CONTAINMENT_STATES.NORMAL;
}

function evaluateDrift(current = {}, baseline = {}) {
  const findings = detectDrift(current, baseline);
  const containmentState = getContainmentState(findings);

  return {
    driftDetected: findings.length > 0,
    containmentState,
    findings,
    criticalFindings: findings.filter((item) => item.severity === "CRITICAL").length,
    humanReviewRequired: findings.some((item) => item.humanReviewRequired === true),
    quarantineRequired: [CONTAINMENT_STATES.QUARANTINED, CONTAINMENT_STATES.HUMAN_REVIEW_REQUIRED].includes(containmentState)
  };
}

function validateLedgerMutation(existingLedger = {}, mutation = {}) {
  const ledger = safeObject(existingLedger);
  const change = safeObject(mutation);
  const status = normalize(ledger.status);
  const reasons = [];

  if (!LEDGER_STATES.has(status)) {
    reasons.push("Unknown ledger state fails closed.");
  }

  if (["FINALIZED", "SUBMITTED", "REJECTED", "QUARANTINED"].includes(status)) {
    reasons.push("Finalized or terminal ledgers are immutable; corrections require a new version and audit record.");
  }

  if (change.deleteFailedRecords === true || change.removeFailedObservation === true) {
    reasons.push("A brain cannot delete failed records or remove failed observations.");
  }

  if (change.rewriteMetrics === true || change.rewriteEvaluationHistory === true) {
    reasons.push("Evaluation history and finalized metrics cannot be rewritten.");
  }

  if (change.missingRequiredProvenance === true) {
    reasons.push("Missing required provenance prevents ledger finalization.");
  }

  return {
    valid: reasons.length === 0,
    status: reasons.length ? "LEDGER_MUTATION_REJECTED" : "LEDGER_MUTATION_ALLOWED",
    reasons
  };
}

function validateWeeklyReview(review = {}) {
  const item = safeObject(review);
  const reasons = [];
  const warnings = [];
  const dailyLedgerIds = safeArray(item.dailyLedgerIds);

  if (!dailyLedgerIds.length) {
    warnings.push("Missing daily ledgers reduce weekly review completeness.");
  }

  if (item.promotesCandidate === true || item.automaticPromotion === true) {
    reasons.push("Weekly review cannot promote a candidate.");
  }

  if (item.rewritesDailyRecords === true) {
    reasons.push("Weekly review cannot rewrite daily records.");
  }

  if (number(item.safetyViolations) > 0 && !["REQUIRES_REMEDIATION", "QUARANTINED"].includes(normalize(item.reviewStatus))) {
    reasons.push("Safety violation forces remediation or quarantine.");
  }

  if (!item.humanDecision || normalize(item.humanDecision) === "AUTO_APPROVED") {
    reasons.push("Human decision is required.");
  }

  return {
    valid: reasons.length === 0,
    status: reasons.length ? "WEEKLY_REVIEW_REJECTED" : "WEEKLY_REVIEW_READY_FOR_HUMAN_REVIEW",
    reasons,
    warnings
  };
}

function getDriftPolicyStatus() {
  return {
    policyVersion: POLICY_VERSION,
    status: "READY",
    categories: Object.keys(DRIFT_CATEGORIES),
    criticalDriftSkipsToContainment: true,
    finalizedLedgerImmutable: true,
    weeklyPromotionBlocked: true,
    humanReviewRequiredForRelease: true,
    trainingActivated: false,
    automaticPromotionActivated: false
  };
}

module.exports = {
  CONTAINMENT_STATES,
  DRIFT_CATEGORIES,
  POLICY_VERSION,
  evaluateDrift,
  getContainmentState,
  getDriftPolicyStatus,
  validateLedgerMutation,
  validateWeeklyReview
};
