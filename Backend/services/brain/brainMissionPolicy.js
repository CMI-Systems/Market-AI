const POLICY_VERSION = "PRE_SHADOW_MISSION_POLICY_V1";

const BRAIN_IDS = {
  TACTICAL: "TACTICAL",
  BEHAVIORAL: "BEHAVIORAL",
  FAILSAFE: "FAILSAFE"
};

const AUTHORITY_LEVELS = {
  NON_AUTHORITATIVE_OBSERVATION: "NON_AUTHORITATIVE_OBSERVATION",
  ADVISORY: "ADVISORY",
  BLOCKING_AUTHORITY: "BLOCKING_AUTHORITY"
};

const SHARED_ALLOWED_INPUTS = new Set([
  "PROVENANCE_METADATA",
  "VALIDATION_METADATA",
  "MARKET_SESSION_METADATA",
  "PROVIDER_STATUS_METADATA",
  "SYSTEM_STATUS_METADATA"
]);

const PROHIBITED_INPUTS = new Set([
  "WEBULL",
  "NEWS",
  "MACRO_DATA",
  "MARKET_BREADTH",
  "OPTIONS_DATA",
  "BROKER_ACCOUNT_DATA",
  "ORDER_DATA",
  "POSITION_DATA",
  "PROVIDER_CREDENTIAL",
  "SUPABASE_SERVICE_ROLE",
  "COOKIE",
  "SESSION_TOKEN",
  "INFERRED_PSYCHOLOGY",
  "NEW_BEHAVIORAL_TELEMETRY",
  "SIMULATED_TRUSTED_INPUT",
  "GENERATED_TRUSTED_INPUT",
  "UNKNOWN_SOURCE_TRUSTED_INPUT",
  "CROSS_OPERATOR_AGGREGATE"
]);

const PROHIBITED_OUTPUTS = new Set([
  "ORDER_EXECUTION",
  "POSITION_MODIFICATION",
  "MISSION_CHANGE",
  "OBJECTIVE_APPROVAL",
  "OBJECTIVE_ACTIVATION",
  "SCORING_RULE_CHANGE",
  "INPUT_SCOPE_EXPANSION",
  "AUTHORITY_EXPANSION",
  "WEIGHT_UPDATE",
  "RULE_MUTATION",
  "MODEL_PROMOTION",
  "PRODUCTION_DEPLOYMENT",
  "FAILSAFE_OVERRIDE"
]);

const CONTRACTS = Object.freeze({
  [BRAIN_IDS.TACTICAL]: Object.freeze({
    brainId: BRAIN_IDS.TACTICAL,
    missionVersion: "TACTICAL_MISSION_V1",
    missionStatement:
      "Interpret validated market structure, trend, momentum, liquidity, volatility, and related tactical conditions using only approved locked inputs.",
    allowedInputClasses: Object.freeze([
      "VALIDATED_QUOTE",
      "VALIDATED_CANDLES",
      "OHLCV",
      "SYMBOL",
      "TIMEFRAME",
      "TACTICAL_DERIVED_CONTEXT",
      ...SHARED_ALLOWED_INPUTS
    ]),
    prohibitedInputClasses: Object.freeze([...PROHIBITED_INPUTS]),
    allowedOutputClasses: Object.freeze([
      "TACTICAL_STATE",
      "CONFIDENCE_OBSERVATION",
      "ABSTENTION",
      "INSUFFICIENT_DATA",
      "WARNINGS",
      "NON_AUTHORITATIVE_OBSERVATION"
    ]),
    prohibitedOutputs: Object.freeze([...PROHIBITED_OUTPUTS]),
    authorityLevel: AUTHORITY_LEVELS.NON_AUTHORITATIVE_OBSERVATION,
    runtimeModes: Object.freeze(["DASHBOARD_MODE", "SHADOW_OBSERVATION_MODE"]),
    objectiveCategories: Object.freeze([
      "CONFIDENCE_CALIBRATION",
      "CORRECT_ABSTENTION",
      "FALSE_POSITIVE_TRACKING",
      "FALSE_NEGATIVE_TRACKING",
      "PROVENANCE_COMPLIANCE",
      "STABILITY"
    ]),
    permanentSafetyRules: Object.freeze([
      "NO_UNAUTHORIZED_INPUT_CLASSES",
      "NO_SIMULATED_OR_GENERATED_TRUSTED_INPUTS",
      "NO_UNKNOWN_SOURCE_TRUSTED_INPUTS",
      "NO_INVALID_TIMESTAMP_TRUSTED_INPUTS",
      "NO_LIVE_WRITES",
      "NO_AUTOMATIC_PROMOTION",
      "NO_MISSION_CHANGES",
      "NO_HIDDEN_VERSION_CHANGES",
      "NO_EVALUATION_HISTORY_REWRITE"
    ]),
    approvalStatus: "APPROVED",
    approvedBy: "AICC_PRE_SHADOW_GUARDRAIL_CERTIFICATION",
    approvedAt: "2026-06-16T00:00:00.000Z",
    changeControlRequirement: "HUMAN_APPROVAL_REQUIRED"
  }),
  [BRAIN_IDS.BEHAVIORAL]: Object.freeze({
    brainId: BRAIN_IDS.BEHAVIORAL,
    missionVersion: "BEHAVIORAL_MISSION_V1",
    missionStatement:
      "Evaluate operator behavior using only approved journal, replay, operator-history, and explicit behavioral evidence already present in AICC.",
    allowedInputClasses: Object.freeze([
      "JOURNAL_ENTRY",
      "REPLAY_SESSION",
      "OPERATOR_HISTORY",
      "EXPLICIT_CONFIDENCE_FIELD",
      "EXPLICIT_EMOTIONAL_STATE_FIELD",
      "PLAN_ADHERENCE_FIELD",
      "RULE_COMPLIANCE_FIELD",
      "DECISION_QUALITY_FIELD",
      "FAILSAFE_RESPONSE_FIELD",
      "LINKED_MARKET_CONTEXT",
      ...SHARED_ALLOWED_INPUTS
    ]),
    prohibitedInputClasses: Object.freeze([...PROHIBITED_INPUTS]),
    allowedOutputClasses: Object.freeze([
      "BEHAVIORAL_STATE",
      "UNKNOWN",
      "INSUFFICIENT_DATA",
      "EVIDENCE_COVERAGE",
      "WARNINGS",
      "NON_AUTHORITATIVE_OBSERVATION"
    ]),
    prohibitedOutputs: Object.freeze([...PROHIBITED_OUTPUTS, "CLINICAL_DIAGNOSIS", "UNSUPPORTED_EMOTIONAL_CLAIM", "UNSUPPORTED_BIAS_CLAIM"]),
    authorityLevel: AUTHORITY_LEVELS.NON_AUTHORITATIVE_OBSERVATION,
    runtimeModes: Object.freeze(["DASHBOARD_MODE", "SHADOW_OBSERVATION_MODE"]),
    objectiveCategories: Object.freeze([
      "EVIDENCE_COVERAGE",
      "OPERATOR_MARKET_SEPARATION",
      "UNKNOWN_USAGE",
      "UNSUPPORTED_CLAIM_ZERO_TOLERANCE",
      "DECISION_QUALITY_CONSISTENCY"
    ]),
    permanentSafetyRules: Object.freeze([
      "NO_UNAUTHORIZED_INPUT_CLASSES",
      "NO_INFERRED_PSYCHOLOGY",
      "NO_CLINICAL_DIAGNOSIS",
      "NO_CROSS_OPERATOR_MIXING",
      "NO_LIVE_WRITES",
      "NO_AUTOMATIC_PROMOTION",
      "NO_MISSION_CHANGES",
      "NO_HIDDEN_VERSION_CHANGES",
      "NO_EVALUATION_HISTORY_REWRITE"
    ]),
    approvalStatus: "APPROVED",
    approvedBy: "AICC_PRE_SHADOW_GUARDRAIL_CERTIFICATION",
    approvedAt: "2026-06-16T00:00:00.000Z",
    changeControlRequirement: "HUMAN_APPROVAL_REQUIRED"
  }),
  [BRAIN_IDS.FAILSAFE]: Object.freeze({
    brainId: BRAIN_IDS.FAILSAFE,
    missionVersion: "FAILSAFE_MISSION_V1",
    missionStatement:
      "Detect unsafe, invalid, unavailable, conflicting, inconsistent, stale, simulated, generated, or provenance-deficient conditions and preserve final blocking authority.",
    allowedInputClasses: Object.freeze([
      "PROVIDER_IDENTITY",
      "SOURCE_TYPE",
      "TIMESTAMP_VALIDITY",
      "FRESHNESS",
      "AVAILABILITY",
      "SIMULATED_GENERATED_FLAGS",
      "MARKET_SESSION",
      "VALIDATION_RESULT",
      "DATA_QUALITY_RESULT",
      "PROVENANCE_RESULT",
      "CONFLICT_RESULT",
      "CONSISTENCY_RESULT",
      "TACTICAL_STATE",
      "BEHAVIORAL_STATE",
      "CONSENSUS_STATE",
      "REGIME_STATE",
      "WARNINGS",
      "PROVIDER_BACKEND_STATUS",
      ...SHARED_ALLOWED_INPUTS
    ]),
    prohibitedInputClasses: Object.freeze([...PROHIBITED_INPUTS]),
    allowedOutputClasses: Object.freeze([
      "FAILSAFE_STATE",
      "BLOCKING_REASON",
      "RELIABILITY",
      "QUARANTINE_RECOMMENDATION",
      "HUMAN_REVIEW_REQUIRED",
      "WARNINGS"
    ]),
    prohibitedOutputs: Object.freeze([...PROHIBITED_OUTPUTS].filter((item) => item !== "FAILSAFE_OVERRIDE")),
    authorityLevel: AUTHORITY_LEVELS.BLOCKING_AUTHORITY,
    runtimeModes: Object.freeze(["DASHBOARD_MODE", "SHADOW_OBSERVATION_MODE"]),
    objectiveCategories: Object.freeze([
      "UNSAFE_INPUT_DETECTION",
      "PROVIDER_OUTAGE_CLASSIFICATION",
      "MARKET_CLOSED_PROVIDER_OFFLINE_SEPARATION",
      "INVALID_TIMESTAMP_DETECTION",
      "PROVENANCE_CONFLICT_DETECTION",
      "SIMULATED_GENERATED_REJECTION",
      "MISSED_RISK_TRACKING",
      "FALSE_BLOCK_TRACKING",
      "BLOCKING_AUTHORITY_PRESERVATION"
    ]),
    permanentSafetyRules: Object.freeze([
      "NO_UNAUTHORIZED_INPUT_CLASSES",
      "NO_SIMULATED_OR_GENERATED_TRUSTED_INPUTS",
      "NO_UNKNOWN_SOURCE_TRUSTED_INPUTS",
      "NO_INVALID_TIMESTAMP_TRUSTED_INPUTS",
      "NO_LIVE_WRITES",
      "NO_AUTOMATIC_PROMOTION",
      "NO_MISSION_CHANGES",
      "NO_HIDDEN_VERSION_CHANGES",
      "NO_EVALUATION_HISTORY_REWRITE",
      "FAILSAFE_AUTHORITY_CANNOT_BE_BYPASSED"
    ]),
    approvalStatus: "APPROVED",
    approvedBy: "AICC_PRE_SHADOW_GUARDRAIL_CERTIFICATION",
    approvedAt: "2026-06-16T00:00:00.000Z",
    changeControlRequirement: "HUMAN_APPROVAL_REQUIRED"
  })
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

function collectClasses(value, pluralKey, alternatePluralKey, singularKey) {
  if (Array.isArray(value[pluralKey])) return value[pluralKey];
  if (Array.isArray(value[alternatePluralKey])) return value[alternatePluralKey];
  if (value[singularKey]) return [value[singularKey]];
  return [];
}

function cloneContract(contract) {
  return contract ? JSON.parse(JSON.stringify(contract)) : null;
}

function getBrainMissionContract(brainId) {
  return cloneContract(CONTRACTS[normalize(brainId)]);
}

function createValidationResult(valid, status, reasons = [], warnings = []) {
  return {
    valid,
    status,
    containmentState: valid ? "NORMAL" : "HUMAN_REVIEW_REQUIRED",
    reasons,
    warnings
  };
}

function validateBrainMission(brainId, proposedConfig = {}) {
  const normalizedBrainId = normalize(brainId);
  const contract = CONTRACTS[normalizedBrainId];
  const config = safeObject(proposedConfig);
  const reasons = [];

  if (!contract) {
    return createValidationResult(false, "UNKNOWN_BRAIN", ["Unknown brain fails closed."]);
  }

  if (!config.missionVersion) {
    reasons.push("Mission version is required.");
  } else if (config.missionVersion !== contract.missionVersion) {
    reasons.push("Mission version mismatch requires human review.");
  }

  if (config.missionStatement && config.missionStatement !== contract.missionStatement) {
    reasons.push("Mission statement mutation is not authorized.");
  }

  if (normalize(config.approvedBy) === normalizedBrainId) {
    reasons.push("Brain cannot approve its own mission change.");
  }

  const requestedInputs = safeArray(config.allowedInputClasses);
  const scopeResult = requestedInputs.length
    ? validateBrainInputScope(normalizedBrainId, { inputClasses: requestedInputs })
    : null;

  if (scopeResult && !scopeResult.valid) {
    reasons.push(...scopeResult.reasons);
  }

  const requestedAuthority = config.authorityLevel || config.authority;
  if (requestedAuthority) {
    const authorityResult = validateBrainAuthority(normalizedBrainId, requestedAuthority);
    if (!authorityResult.valid) reasons.push(...authorityResult.reasons);
  }

  return createValidationResult(
    reasons.length === 0,
    reasons.length ? "HUMAN_REVIEW_REQUIRED" : "APPROVED_MISSION",
    reasons
  );
}

function validateBrainAuthority(brainId, proposedAuthority) {
  const contract = CONTRACTS[normalize(brainId)];
  if (!contract) {
    return createValidationResult(false, "UNKNOWN_BRAIN", ["Unknown brain fails closed."]);
  }

  if (proposedAuthority !== contract.authorityLevel) {
    return createValidationResult(false, "AUTHORITY_EXPANSION_BLOCKED", ["Expanded or changed authority is blocked."]);
  }

  return createValidationResult(true, "AUTHORITY_CONFIRMED");
}

function validateBrainInputScope(brainId, input = {}) {
  const contract = CONTRACTS[normalize(brainId)];
  if (!contract) {
    return createValidationResult(false, "UNKNOWN_BRAIN", ["Unknown brain fails closed."]);
  }

  const value = safeObject(input);
  const inputClasses = collectClasses(value, "inputClasses", "classes", "inputClass");
  const allowed = new Set(contract.allowedInputClasses.map(normalize));
  const prohibited = new Set(contract.prohibitedInputClasses.map(normalize));
  const reasons = [];

  if (!inputClasses.length) {
    reasons.push("At least one input class is required for scope validation.");
  }

  inputClasses.forEach((item) => {
    const normalized = normalize(item);
    if (prohibited.has(normalized)) reasons.push(`Prohibited input class ${normalized} is rejected.`);
    if (!allowed.has(normalized)) reasons.push(`Unapproved input class ${normalized} is rejected.`);
  });

  return createValidationResult(
    reasons.length === 0,
    reasons.length ? "INPUT_SCOPE_REJECTED" : "INPUT_SCOPE_APPROVED",
    [...new Set(reasons)]
  );
}

function validateBrainOutputAuthority(brainId, output = {}) {
  const contract = CONTRACTS[normalize(brainId)];
  if (!contract) {
    return createValidationResult(false, "UNKNOWN_BRAIN", ["Unknown brain fails closed."]);
  }

  const outputClasses = collectClasses(output, "outputClasses", "classes", "outputClass");
  const allowed = new Set(contract.allowedOutputClasses.map(normalize));
  const prohibited = new Set(contract.prohibitedOutputs.map(normalize));
  const reasons = [];

  if (!outputClasses.length) {
    reasons.push("At least one output class is required for authority validation.");
  }

  outputClasses.forEach((item) => {
    const normalized = normalize(item);
    if (prohibited.has(normalized)) reasons.push(`Prohibited output ${normalized} is rejected.`);
    if (!allowed.has(normalized)) reasons.push(`Unapproved output ${normalized} is rejected.`);
  });

  return createValidationResult(
    reasons.length === 0,
    reasons.length ? "OUTPUT_AUTHORITY_REJECTED" : "OUTPUT_AUTHORITY_APPROVED",
    [...new Set(reasons)]
  );
}

function getBrainMissionPolicyStatus() {
  return {
    policyVersion: POLICY_VERSION,
    status: "READY",
    contracts: Object.keys(CONTRACTS).length,
    unknownBrainFailsClosed: true,
    missionMutationBlocked: true,
    inputExpansionBlocked: true,
    authorityExpansionBlocked: true,
    selfApprovalBlocked: true,
    trainingActivated: false,
    shadowTrainerActivated: false,
    brainLearningActivated: false
  };
}

module.exports = {
  AUTHORITY_LEVELS,
  BRAIN_IDS,
  POLICY_VERSION,
  getBrainMissionContract,
  getBrainMissionPolicyStatus,
  validateBrainAuthority,
  validateBrainInputScope,
  validateBrainMission,
  validateBrainOutputAuthority
};
