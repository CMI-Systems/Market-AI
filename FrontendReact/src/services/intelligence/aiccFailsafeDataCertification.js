import { validateProvenance } from "./provenanceValidator.js";

const CERTIFICATION_LABELS = {
  CERTIFIED: "CERTIFIED",
  CONDITIONALLY_CERTIFIED: "CONDITIONALLY_CERTIFIED",
  DEGRADED: "DEGRADED",
  FAILED: "FAILED",
  BLOCKED: "BLOCKED",
};

const BLOCKING_VALIDATION_STATUSES = new Set([
  "BLOCKED",
  "UNAVAILABLE",
  "DATA_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_OFFLINE",
  "UNKNOWN_SOURCE",
  "INVALID_TIMESTAMP",
  "INVALID_NUMERIC_DATA",
  "INVALID_OHLC",
  "SYMBOL_MISMATCH",
  "OUT_OF_ORDER",
  "DUPLICATE",
  "SIMULATED",
  "GENERATED",
  "UNSUITABLE",
]);

const LIMITED_VALIDATION_STATUSES = new Set([
  "PARTIAL_DATA",
  "STALE",
  "RAW_DELAYED",
  "RAW_CACHED",
  "MARKET_CLOSED",
]);

const BLOCKED_FAILSAFE_STATES = new Set([
  "BLOCKED",
  "DATA_UNAVAILABLE",
  "CRITICAL_VALIDATION_FAILURE",
  "LOW_RELIABILITY_ENVIRONMENT",
]);

const DEGRADED_FAILSAFE_STATES = new Set([
  "DEGRADED_ENVIRONMENT",
  "DATA_INTEGRITY_CONCERN",
  "ELEVATED_UNCERTAINTY",
  "INTELLIGENCE_CONFLICT",
  "RISK_ESCALATION",
]);

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function normalizeStatus(value, fallback = "UNKNOWN") {
  return safeString(value, fallback).toUpperCase();
}

function getCertificationLabel(score, blocked) {
  if (blocked || score === 0) return CERTIFICATION_LABELS.BLOCKED;
  if (score >= 90) return CERTIFICATION_LABELS.CERTIFIED;
  if (score >= 75) return CERTIFICATION_LABELS.CONDITIONALLY_CERTIFIED;
  if (score >= 50) return CERTIFICATION_LABELS.DEGRADED;
  return CERTIFICATION_LABELS.FAILED;
}

function getProviderIntegrity(input) {
  const providerIntegrity = safeObject(input.providerIntegrity);
  const provider = normalizeStatus(
    providerIntegrity.provider ||
      providerIntegrity.activeProvider ||
      providerIntegrity.operationalProvider ||
      providerIntegrity.providerName,
    "UNKNOWN"
  );
  const readiness = normalizeStatus(
    providerIntegrity.providerIntegrityReadiness ||
      providerIntegrity.readiness ||
      providerIntegrity.status ||
      providerIntegrity.providerReadiness,
    "UNKNOWN"
  );
  const certification = normalizeStatus(
    providerIntegrity.certification ||
      providerIntegrity.alpacaCertification ||
      providerIntegrity.providerCertification,
    "UNKNOWN"
  );
  const simulationDependency = normalizeStatus(
    providerIntegrity.simulationDependency ||
      providerIntegrity.updatedSimulationDependency,
    "UNKNOWN"
  );
  const stagingSimulation = normalizeStatus(providerIntegrity.stagingSimulation, "UNKNOWN");
  const productionSimulation = normalizeStatus(providerIntegrity.productionSimulation, "UNKNOWN");
  const providerImplemented = !["UNKNOWN", "WEBULL", "PLACEHOLDER", "NOT_IMPLEMENTED"].includes(provider);

  return {
    provider,
    readiness,
    certification,
    simulationDependency,
    stagingSimulation,
    productionSimulation,
    providerImplemented,
    passed:
      providerImplemented &&
      readiness === "READY" &&
      !["NOT_IMPLEMENTED", "PLACEHOLDER", "UNKNOWN"].includes(certification),
    conditional: certification === "CONDITIONALLY_VERIFIED",
  };
}

function getMarketDataValidation(input) {
  const validation = safeObject(input.marketDataValidation);
  const status = normalizeStatus(validation.status || validation.validationStatus, "UNKNOWN");
  const qualityScore = clampScore(safeNumber(validation.qualityScore, 0));
  const qualityLabel = normalizeStatus(validation.qualityLabel, "UNKNOWN");
  const errors = safeArray(validation.errors || validation.validationErrors);
  const warnings = safeArray(validation.warnings || validation.validationWarnings);
  const blocked = BLOCKING_VALIDATION_STATUSES.has(status) || errors.some((error) => BLOCKING_VALIDATION_STATUSES.has(normalizeStatus(error)));
  const limited = LIMITED_VALIDATION_STATUSES.has(status) || qualityLabel === "DEGRADED" || warnings.length > 0;

  return {
    status,
    qualityScore,
    qualityLabel,
    errors,
    warnings,
    blocked,
    limited,
    passed: hasObjectContent(validation) && !blocked && qualityScore >= 50,
  };
}

function getLayerState(layer, stateKeys = []) {
  const value = safeObject(layer);
  const sourceType = normalizeStatus(value.sourceType, "");
  const state = normalizeStatus(
    stateKeys.map((key) => value[key]).find((item) => safeString(item)) ||
      value.state ||
      value.status,
    "UNKNOWN"
  );

  return {
    available: value.available !== false,
    simulated: value.simulated === true,
    generated: value.generated === true,
    sourceType,
    state,
    confidence: safeNumber(value.confidence ?? value.reliability, 0),
    warnings: safeArray(value.warnings),
    blocked:
      value.available === false ||
      value.simulated === true ||
      value.generated === true ||
      BLOCKING_VALIDATION_STATUSES.has(sourceType) ||
      ["BLOCKED", "UNAVAILABLE", "INSUFFICIENT_DATA", "DATA_UNAVAILABLE", "UNKNOWN"].includes(state),
  };
}

function isConsensusBlocked(consensus) {
  const state = normalizeStatus(consensus.consensusState || consensus.synthesis, "UNKNOWN");
  return state === "UNAVAILABLE" || safeNumber(consensus.confidence, 0) <= 0;
}

function isRegimeBlocked(regime) {
  const state = normalizeStatus(regime.regime, "UNKNOWN");
  return state === "UNKNOWN" || regime.available === false;
}

function narrativeDisclosesLimitations(narrative) {
  const text = [
    narrative.headline,
    narrative.shortNarrative,
    narrative.detailedNarrative,
    ...safeArray(narrative.warnings),
  ].filter(Boolean).join(" ").toUpperCase();

  return Boolean(
    !hasObjectContent(narrative) ||
    text.includes("LIMITED") ||
    text.includes("UNAVAILABLE") ||
    text.includes("INSUFFICIENT") ||
    text.includes("VALIDATED") ||
    text.includes("DEGRADED")
  );
}

function getFailsafeState(failsafeOutput) {
  const failsafe = safeObject(failsafeOutput);
  const state = normalizeStatus(failsafe.failsafeState, "BLOCKED");
  const reliability = clampScore(safeNumber(failsafe.reliability ?? failsafe.reliabilityScore, 0));

  return {
    state,
    reliability,
    primaryRisk: safeString(failsafe.primaryRisk || failsafe.riskEscalation || failsafe.dataIntegrity, "DATA_INTEGRITY_REVIEW_REQUIRED"),
    warnings: safeArray(failsafe.warnings),
    blocked: BLOCKED_FAILSAFE_STATES.has(state),
    degraded: DEGRADED_FAILSAFE_STATES.has(state),
    confirmed: state === "CONFIRMED_ENVIRONMENT",
  };
}

function getDatasetSafety(input) {
  const datasetRecord = safeObject(input.datasetRecord);
  const datasetValidation = safeObject(input.datasetValidation);
  const governanceResult = safeObject(input.governanceResult);
  const metadata = safeObject(datasetRecord.metadata);
  const governanceBlockedReason = safeString(governanceResult.trainingBlockedReason, "");
  const rawDataCertified = metadata.rawDataCertified === true || datasetRecord.rawDataCertified === true || governanceResult.rawDataCertified === true;
  const trainingEligible = metadata.trainingEligible === true || datasetRecord.trainingEligible === true || governanceResult.futureTrainingEligible === true;
  const trainingReady = input.trainingReady === true || safeObject(input.trainingReadiness).trainingReady === true;

  return {
    datasetPresent: hasObjectContent(datasetRecord),
    datasetValidationPassed: datasetValidation.valid === true,
    rawDataCertified,
    trainingEligible,
    trainingReady,
    governanceBlockedReason,
    passed:
      !rawDataCertified &&
      !trainingEligible &&
      !trainingReady &&
      (governanceBlockedReason === "RAW_DATA_CERTIFICATION_REQUIRED" || governanceBlockedReason === ""),
  };
}

function hasCertificationBypass(input, provenanceValidation, marketDataValidation, datasetSafety) {
  const providerIntegrity = safeObject(input.providerIntegrity);
  const failsafeOutput = safeObject(input.failsafeOutput);
  const bypasses = [];

  if (datasetSafety.rawDataCertified) bypasses.push("rawDataCertified true before O.6.");
  if (datasetSafety.trainingEligible) bypasses.push("trainingEligible true before raw-data certification.");
  if (datasetSafety.trainingReady) bypasses.push("trainingReady true before raw-data certification.");
  if (failsafeOutput.certified === true) bypasses.push("failsafe output asserted certified directly.");
  if (providerIntegrity.providerHealthy === true && providerIntegrity.providerAvailable === false) {
    bypasses.push("provider healthy true conflicts with unavailable provider.");
  }
  if (provenanceValidation.sourceType === "RAW_LIVE" && provenanceValidation.simulated) {
    bypasses.push("RAW_LIVE conflicts with simulated true.");
  }
  if (provenanceValidation.sourceType === "RAW_LIVE" && provenanceValidation.generated) {
    bypasses.push("RAW_LIVE conflicts with generated true.");
  }
  if (provenanceValidation.available === true && ["PROVIDER_OFFLINE", "DATA_UNAVAILABLE"].includes(provenanceValidation.sourceType)) {
    bypasses.push("available true conflicts with unavailable source type.");
  }
  if (
    provenanceValidation.timestampValid === true &&
    provenanceValidation.timestamp === null &&
    ["RAW_LIVE", "RAW_DELAYED", "RAW_CACHED", "PARTIAL_DATA", "STALE"].includes(provenanceValidation.sourceType)
  ) {
    bypasses.push("timestamp marked valid without a timestamp.");
  }
  if (marketDataValidation.qualityScore >= 90 && marketDataValidation.blocked) {
    bypasses.push("high market-data quality conflicts with critical validation failure.");
  }

  return bypasses;
}

function scoreGates(gates) {
  const entries = Object.values(gates);
  if (!entries.length) return 0;
  return clampScore((entries.filter(Boolean).length / entries.length) * 100);
}

function capScore(score, caps) {
  return caps.reduce((current, cap) => Math.min(current, cap), score);
}

export function certifyFailsafeDataIntegrity(input = {}) {
  const safeInput = safeObject(input);
  const warnings = [];
  const blockingReasons = [];
  const certificationReasons = [];

  const providerIntegrity = getProviderIntegrity(safeInput);
  const provenanceValidation = hasObjectContent(safeInput.provenanceValidation)
    ? safeObject(safeInput.provenanceValidation)
    : validateProvenance(safeInput.marketDataValidation || safeInput.providerIntegrity || {}, { timestampRequired: false });
  const marketDataValidation = getMarketDataValidation(safeInput);
  const tactical = getLayerState(safeInput.tacticalOutput, ["tacticalState"]);
  const behavioral = getLayerState(safeInput.behavioralOutput, ["behavioralState"]);
  const failsafe = getFailsafeState(safeInput.failsafeOutput);
  const consensus = safeObject(safeInput.consensusOutput);
  const regime = safeObject(safeInput.regimeOutput);
  const narrative = safeObject(safeInput.narrativeOutput);
  const datasetSafety = getDatasetSafety(safeInput);
  const bypasses = hasCertificationBypass(safeInput, provenanceValidation, marketDataValidation, datasetSafety);

  const simulationIsolationPassed =
    providerIntegrity.simulationDependency === "NONE" &&
    providerIntegrity.stagingSimulation === "BLOCKED" &&
    providerIntegrity.productionSimulation === "BLOCKED";

  const provenanceIntegrityPassed =
    provenanceValidation.valid === true &&
    provenanceValidation.status !== "BLOCKED" &&
    provenanceValidation.status !== "DATA_UNAVAILABLE" &&
    provenanceValidation.simulated !== true &&
    provenanceValidation.generated !== true &&
    normalizeStatus(provenanceValidation.provider, "UNKNOWN") !== "UNKNOWN";

  const timestampIntegrityPassed =
    provenanceValidation.timestampValid !== false &&
    marketDataValidation.status !== "INVALID_TIMESTAMP" &&
    !marketDataValidation.errors.includes("INVALID_TIMESTAMP");

  const freshnessPassed =
    provenanceValidation.freshnessStatus !== "STALE" &&
    marketDataValidation.status !== "STALE";

  const numericalIntegrityPassed =
    !marketDataValidation.errors.some((error) => ["INVALID_NUMERIC_DATA", "INVALID_OHLC"].includes(normalizeStatus(error))) &&
    !["INVALID_NUMERIC_DATA", "INVALID_OHLC"].includes(marketDataValidation.status);

  const sessionIntegrityPassed =
    !["UNKNOWN_SESSION", "UNKNOWN"].includes(normalizeStatus(provenanceValidation.sessionState, "UNKNOWN_SESSION")) ||
    ["MARKET_CLOSED", "RAW_CACHED", "RAW_DELAYED"].includes(provenanceValidation.sourceType);

  const unavailableStatePassed =
    provenanceValidation.available !== false ||
    (failsafe.state === "DATA_UNAVAILABLE" || failsafe.state === "BLOCKED");

  const intelligenceBlockingPassed =
    (!tactical.blocked || isConsensusBlocked(consensus)) &&
    (!behavioral.blocked || isConsensusBlocked(consensus)) &&
    (!failsafe.blocked || isConsensusBlocked(consensus)) &&
    (!isRegimeBlocked(regime) || narrativeDisclosesLimitations(narrative));

  const datasetSafetyPassed = datasetSafety.passed;
  const trainingSafetyPassed = !datasetSafety.trainingEligible && !datasetSafety.trainingReady;
  const certificationBypassProtectionPassed = bypasses.length === 0;

  const gates = {
    providerIntegrityPassed: providerIntegrity.passed,
    provenanceIntegrityPassed,
    marketDataValidationPassed: marketDataValidation.passed,
    timestampIntegrityPassed,
    freshnessPassed,
    numericalIntegrityPassed,
    sessionIntegrityPassed,
    simulationIsolationPassed,
    unavailableStatePassed,
    intelligenceBlockingPassed,
    datasetSafetyPassed,
    trainingSafetyPassed,
    certificationBypassProtectionPassed,
  };

  Object.entries(gates).forEach(([gate, passed]) => {
    if (passed) {
      certificationReasons.push(`${gate} passed.`);
    } else {
      blockingReasons.push(`${gate} failed.`);
    }
  });

  if (providerIntegrity.conditional) warnings.push("Operational provider remains conditionally verified.");
  if (marketDataValidation.limited) warnings.push("Market data is valid only with degraded or limited-use disclosure.");
  if (failsafe.degraded) warnings.push("Failsafe output is degraded and requires limited trust.");
  warnings.push(...marketDataValidation.warnings);
  warnings.push(...safeArray(provenanceValidation.warnings));
  warnings.push(...failsafe.warnings);
  warnings.push(...bypasses);

  const criticalBlocked = Boolean(
    !simulationIsolationPassed ||
    !providerIntegrity.passed ||
    !provenanceIntegrityPassed ||
    marketDataValidation.blocked ||
    !timestampIntegrityPassed ||
    !numericalIntegrityPassed ||
    !datasetSafetyPassed ||
    !trainingSafetyPassed ||
    !certificationBypassProtectionPassed
  );
  const caps = [];

  if (criticalBlocked) caps.push(49);
  if (providerIntegrity.conditional) caps.push(89);
  if (marketDataValidation.limited) caps.push(74);
  if (!freshnessPassed) caps.push(74);
  if (!sessionIntegrityPassed) caps.push(74);
  if (failsafe.degraded) caps.push(74);
  if (failsafe.blocked) caps.push(49);
  if (tactical.blocked || behavioral.blocked || isConsensusBlocked(consensus) || isRegimeBlocked(regime)) caps.push(74);

  const certificationScore = capScore(scoreGates(gates), caps);
  const certificationLabel = getCertificationLabel(certificationScore, criticalBlocked);
  const certified = certificationScore >= 75 && !criticalBlocked;
  const reliabilityScore = failsafe.confirmed
    ? Math.min(failsafe.reliability || certificationScore, certificationScore)
    : Math.min(failsafe.reliability || certificationScore, certificationScore);
  const failsafeState = criticalBlocked
    ? "BLOCKED"
    : failsafe.state === "CONFIRMED_ENVIRONMENT" && certificationScore < 90
      ? "DEGRADED_ENVIRONMENT"
      : failsafe.state;

  return {
    certified,
    certificationScore,
    certificationLabel,
    ...gates,
    failsafeState,
    reliabilityScore,
    primaryRisk: criticalBlocked
      ? blockingReasons[0] || "DATA_INTEGRITY_CERTIFICATION_BLOCKED"
      : failsafe.primaryRisk,
    blockingReasons: [...new Set(blockingReasons)],
    certificationReasons: [...new Set(certificationReasons)],
    warnings: [...new Set(warnings.filter(Boolean))],
    provider: providerIntegrity.provider,
    providerCertification: providerIntegrity.certification,
    marketDataValidationStatus: marketDataValidation.status,
    marketDataQualityScore: marketDataValidation.qualityScore,
    provenanceStatus: provenanceValidation.status || "UNKNOWN",
    rawDataCertified: false,
    trainingEligible: false,
  };
}
