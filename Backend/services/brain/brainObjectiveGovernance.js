const {
  BRAIN_IDS,
  validateBrainInputScope
} = require("./brainMissionPolicy");

const POLICY_VERSION = "PRE_SHADOW_OBJECTIVE_POLICY_V1";

const OBJECTIVE_STATES = new Set([
  "PROPOSED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
  "COMPLETED",
  "EXPIRED"
]);

const HUMAN_APPROVED_STATES = new Set(["APPROVED", "ACTIVE"]);

const REQUIRED_OBJECTIVE_FIELDS = [
  "objectiveId",
  "brainId",
  "title",
  "metric",
  "target",
  "minimumSampleSize",
  "measurementWindow",
  "approvedInputClasses",
  "prohibitedInputClasses",
  "safetyConstraints",
  "failureConditions",
  "scoringWeight",
  "effectiveFrom",
  "effectiveUntil",
  "version",
  "status",
  "proposedBy",
  "approvedBy",
  "approvedAt"
];

const PERMANENT_SAFETY_OBJECTIVES = Object.freeze({
  allBrains: Object.freeze([
    "zero unauthorized input classes",
    "zero simulated/generated trusted inputs",
    "zero unknown-source trusted inputs",
    "zero invalid-timestamp trusted inputs",
    "zero unauthorized live writes",
    "zero automatic promotion",
    "zero mission-contract changes",
    "zero hidden version changes",
    "zero evaluation-history rewriting"
  ]),
  [BRAIN_IDS.TACTICAL]: Object.freeze([
    "correct use of INSUFFICIENT_DATA",
    "confidence calibration",
    "false-positive tracking",
    "false-negative tracking",
    "correct abstention tracking",
    "stability across symbols, timeframes, and regimes",
    "provenance compliance"
  ]),
  [BRAIN_IDS.BEHAVIORAL]: Object.freeze([
    "unsupported emotional claims: zero",
    "unsupported bias claims: zero",
    "correct use of UNKNOWN",
    "correct use of INSUFFICIENT_DATA",
    "operator/market evidence separation",
    "no clinical diagnosis",
    "evidence coverage tracking",
    "decision-quality consistency"
  ]),
  [BRAIN_IDS.FAILSAFE]: Object.freeze([
    "unsafe-input detection",
    "provider-outage classification",
    "market-closed/provider-offline separation",
    "invalid timestamp detection",
    "provenance-conflict detection",
    "simulated/generated rejection",
    "missed-risk tracking",
    "false-block tracking",
    "blocking-authority preservation"
  ])
});

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function isKnownBrain(brainId) {
  return Object.values(BRAIN_IDS).includes(normalize(brainId));
}

function parseTime(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function result(valid, status, reasons = [], warnings = []) {
  return {
    valid,
    status,
    containmentState: valid ? "NORMAL" : "HUMAN_REVIEW_REQUIRED",
    reasons: [...new Set(reasons)],
    warnings: [...new Set(warnings)]
  };
}

function validateObjective(objective = {}, context = {}) {
  const item = safeObject(objective);
  const now = parseTime(context.currentTime || new Date().toISOString());
  const reasons = [];
  const warnings = [];

  REQUIRED_OBJECTIVE_FIELDS.forEach((field) => {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      reasons.push(`${field} is required.`);
    }
  });

  const brainId = normalize(item.brainId);
  if (!isKnownBrain(brainId)) reasons.push("Unknown objective brain fails closed.");

  const status = normalize(item.status);
  if (!OBJECTIVE_STATES.has(status)) reasons.push("Unknown objective status fails closed.");

  if (normalize(item.approvedBy) === brainId) {
    reasons.push("Brains cannot approve their own objectives.");
  }

  if (normalize(item.proposedBy) === brainId && HUMAN_APPROVED_STATES.has(status) && !item.humanApprovalEvidence) {
    reasons.push("Brain-proposed objective requires independent human approval evidence.");
  }

  const scoringWeight = Number(item.scoringWeight);
  if (!Number.isFinite(scoringWeight) || scoringWeight < 0 || scoringWeight > 1) {
    reasons.push("Scoring weight must be a finite value from 0 to 1.");
  }

  const minimumSampleSize = Number(item.minimumSampleSize);
  if (!Number.isInteger(minimumSampleSize) || minimumSampleSize <= 0) {
    reasons.push("Minimum sample size must be a positive integer.");
  }

  const effectiveFrom = parseTime(item.effectiveFrom);
  const effectiveUntil = parseTime(item.effectiveUntil);
  if (effectiveFrom === null || effectiveUntil === null || effectiveUntil <= effectiveFrom) {
    reasons.push("Objective effective dates are invalid.");
  } else if (now !== null && status === "ACTIVE" && now > effectiveUntil) {
    reasons.push("Expired objectives cannot remain active.");
  }

  const inputScope = validateBrainInputScope(brainId, {
    inputClasses: safeArray(item.approvedInputClasses)
  });
  if (!inputScope.valid) reasons.push(...inputScope.reasons);

  const prohibited = safeArray(item.prohibitedInputClasses).map(normalize);
  const approved = safeArray(item.approvedInputClasses).map(normalize);
  const conflicts = approved.filter((entry) => prohibited.includes(entry));
  if (conflicts.length) reasons.push(`Objective input classes conflict with prohibited classes: ${conflicts.join(", ")}.`);

  const safetyConstraints = safeArray(item.safetyConstraints).map(normalize);
  if (!safetyConstraints.includes("FAILSAFE_AUTHORITY_PRESERVED")) {
    reasons.push("Objective must preserve Failsafe authority.");
  }
  if (!safetyConstraints.includes("NO_SCOPE_EXPANSION")) {
    reasons.push("Objective must prohibit input-scope expansion.");
  }
  if (!safetyConstraints.includes("NO_AUTOMATIC_PROMOTION")) {
    reasons.push("Objective must prohibit automatic promotion.");
  }

  return result(reasons.length === 0, reasons.length ? "OBJECTIVE_REJECTED" : "OBJECTIVE_VALIDATED", reasons, warnings);
}

function validateGoalProposal(proposal = {}) {
  const item = safeObject(proposal);
  const reasons = [];

  ["proposalId", "brainId", "proposedGoal", "supportingEvidence", "expectedBenefit", "risks", "requiredInputs", "conflicts", "generatedAt", "status"].forEach((field) => {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      reasons.push(`${field} is required.`);
    }
  });

  const brainId = normalize(item.brainId);
  if (!isKnownBrain(brainId)) reasons.push("Unknown proposal brain fails closed.");
  if (normalize(item.status) !== "PROPOSED") reasons.push("Goal proposals must remain PROPOSED until human review.");

  const inputScope = validateBrainInputScope(brainId, {
    inputClasses: safeArray(item.requiredInputs)
  });
  if (!inputScope.valid) reasons.push(...inputScope.reasons);

  if (item.altersMission === true) reasons.push("Proposal cannot alter permanent mission.");
  if (item.altersActiveObjective === true) reasons.push("Proposal cannot alter active objectives.");
  if (item.expandsInputScope === true) reasons.push("Proposal cannot expand input scope.");
  if (item.activatesItself === true) reasons.push("Proposal cannot activate itself.");
  if (item.changesFailsafeRules === true) reasons.push("Proposal cannot change Failsafe rules.");
  if (item.changesRuntimeSchedule === true) reasons.push("Proposal cannot modify runtime schedule.");

  return result(reasons.length === 0, reasons.length ? "GOAL_PROPOSAL_REJECTED" : "GOAL_PROPOSAL_ACCEPTED_FOR_REVIEW", reasons);
}

function evaluateAntiGamingMetrics(metrics = {}) {
  const value = safeObject(metrics);
  const reasons = [];
  const warnings = [];
  const excessiveAbstention = Number(value.abstentionRate) > 0.85 && Number(value.correctAbstentionRate) < 0.7;
  const excessivePrediction = Number(value.predictionRate) > 0.9 && Number(value.calibrationScore) < 0.65;
  const confidenceInflation = Number(value.averageConfidence) > 0.8 && Number(value.accuracy) < 0.6;
  const safetyViolationCount = Number(value.safetyViolations || 0);
  const omittedSamples = Number(value.omittedDifficultSamples || 0);

  if (excessiveAbstention) warnings.push("Excessive abstention detected.");
  if (excessivePrediction) warnings.push("Excessive prediction frequency with weak calibration detected.");
  if (confidenceInflation) warnings.push("Confidence inflation detected.");
  if (omittedSamples > 0) reasons.push("Selective omission of difficult samples is prohibited.");
  if (safetyViolationCount > 0) reasons.push("Safety violations override aggregate score.");
  if (value.datasetSelectedByBrain === true) reasons.push("Brain cannot select its own evaluation dataset.");
  if (value.failedObservationRemoved === true) reasons.push("Brain cannot remove failed observations from the ledger.");

  return {
    valid: reasons.length === 0,
    status: reasons.length ? "ANTI_GAMING_REJECTED" : warnings.length ? "ANTI_GAMING_WARNING" : "ANTI_GAMING_PASS",
    scoreCap: reasons.length ? 0 : warnings.length ? 0.7 : 1,
    reasons,
    warnings
  };
}

function getPermanentSafetyObjectives(brainId) {
  const normalized = normalize(brainId);
  return {
    allBrains: [...PERMANENT_SAFETY_OBJECTIVES.allBrains],
    brainSpecific: [...(PERMANENT_SAFETY_OBJECTIVES[normalized] || [])]
  };
}

function getObjectiveGovernancePolicyStatus() {
  return {
    policyVersion: POLICY_VERSION,
    status: "READY",
    selfApprovedObjectivesBlocked: true,
    selfActivationBlocked: true,
    scoringWeightMutationBlocked: true,
    scopeExpansionBlocked: true,
    failsafeWeakeningBlocked: true,
    trainingActivated: false,
    automaticPromotionActivated: false
  };
}

module.exports = {
  OBJECTIVE_STATES: [...OBJECTIVE_STATES],
  POLICY_VERSION,
  evaluateAntiGamingMetrics,
  getObjectiveGovernancePolicyStatus,
  getPermanentSafetyObjectives,
  validateGoalProposal,
  validateObjective
};
