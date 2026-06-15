const CERTIFICATION_LABELS = {
  RAW_DATA_CERTIFIED: "RAW_DATA_CERTIFIED",
  CONDITIONALLY_RAW_DATA_CERTIFIED: "CONDITIONALLY_RAW_DATA_CERTIFIED",
  NEAR_CERTIFICATION: "NEAR_CERTIFICATION",
  DEGRADED: "DEGRADED",
  FAILED: "FAILED",
  BLOCKED: "BLOCKED",
};

const DECISIONS = {
  RAW_DATA_CERTIFIED: "RAW_DATA_CERTIFIED",
  CONDITIONALLY_RAW_DATA_CERTIFIED: "CONDITIONALLY_RAW_DATA_CERTIFIED",
  NOT_CERTIFIED: "NOT_CERTIFIED",
  BLOCKED: "BLOCKED",
};

const WEIGHTS = {
  simulationRemoval: 15,
  providerIntegrity: 15,
  marketDataValidation: 20,
  failsafeDataCertification: 20,
  provenanceIntegrity: 10,
  intelligenceSafety: 10,
  datasetTrainingSafety: 5,
  productionIsolation: 5,
};

const SUPPORTED_OPERATIONAL_PROVIDERS = new Set(["ALPACA"]);

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

function normalize(value, fallback = "UNKNOWN") {
  return safeString(value, fallback).toUpperCase();
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function pass(value) {
  return value === true || normalize(value) === "PASS" || normalize(value) === "READY";
}

function getLabel(score, blocked, conditional) {
  if (blocked || score === 0) return CERTIFICATION_LABELS.BLOCKED;
  if (score >= 95 && !conditional) return CERTIFICATION_LABELS.RAW_DATA_CERTIFIED;
  if (score >= 90) return CERTIFICATION_LABELS.CONDITIONALLY_RAW_DATA_CERTIFIED;
  if (score >= 75) return CERTIFICATION_LABELS.NEAR_CERTIFICATION;
  if (score >= 50) return CERTIFICATION_LABELS.DEGRADED;
  return CERTIFICATION_LABELS.FAILED;
}

function getDecision(label) {
  if (label === CERTIFICATION_LABELS.RAW_DATA_CERTIFIED) return DECISIONS.RAW_DATA_CERTIFIED;
  if (label === CERTIFICATION_LABELS.CONDITIONALLY_RAW_DATA_CERTIFIED) return DECISIONS.CONDITIONALLY_RAW_DATA_CERTIFIED;
  if (label === CERTIFICATION_LABELS.BLOCKED) return DECISIONS.BLOCKED;
  return DECISIONS.NOT_CERTIFIED;
}

function fallbackResult() {
  return {
    rawDataCertified: false,
    certificationScore: 0,
    certificationLabel: CERTIFICATION_LABELS.BLOCKED,
    certificationDecision: DECISIONS.BLOCKED,
    simulationRemovalPassed: false,
    providerIntegrityPassed: false,
    marketDataValidationPassed: false,
    failsafeDataCertificationPassed: false,
    provenanceIntegrityPassed: false,
    timestampIntegrityPassed: false,
    freshnessEnforcementPassed: false,
    numericalIntegrityPassed: false,
    marketSessionPolicyPassed: false,
    unavailableStateHandlingPassed: false,
    intelligenceSafetyPassed: false,
    datasetSafetyPassed: false,
    trainingSafetyPassed: false,
    productionIsolationPassed: false,
    operationalProviders: [],
    conditionalProviders: [],
    incompleteProviders: [],
    blockingReasons: ["Raw-data certification input is missing."],
    certificationWarnings: [],
    remainingRisks: ["Certification cannot run without prior audit evidence."],
    privateBetaRawDataGate: "FAIL",
  };
}

function getSimulationAudit(input) {
  const audit = safeObject(input.simulationAudit);
  const residual = safeNumber(firstDefined(
    audit.residualRuntimeSimulationDependencies,
    audit.residualSimulationDependencies,
    audit.residualDependencies
  ), Number.NaN);
  const unknownPaths = safeNumber(firstDefined(audit.unknownPathsRemaining, audit.unknownTrustPaths), 0);
  const dependency = normalize(firstDefined(audit.simulationDependency, audit.updatedSimulationDependency), "UNKNOWN");
  const staging = normalize(audit.stagingSimulation, "UNKNOWN");
  const production = normalize(audit.productionSimulation, "UNKNOWN");
  const backendReady = normalize(audit.backendRawDataReadiness, "UNKNOWN");
  const frontendReady = normalize(audit.frontendRawDataReadiness, "UNKNOWN");
  const brainReady = normalize(audit.brainProvenanceReadiness, "UNKNOWN");
  const datasetReady = normalize(audit.datasetProvenanceReadiness, "UNKNOWN");
  const unknownRuntimeFailsClosed = audit.unknownRuntimeFailsClosed === true;
  const developmentTestSimulationGated = audit.developmentTestSimulationGated === true;

  return {
    residual,
    unknownPaths,
    dependency,
    staging,
    production,
    backendReady,
    frontendReady,
    brainReady,
    datasetReady,
    unknownRuntimeFailsClosed,
    developmentTestSimulationGated,
    passed:
      residual === 0 &&
      dependency === "NONE" &&
      staging === "BLOCKED" &&
      production === "BLOCKED" &&
      backendReady === "READY" &&
      frontendReady === "READY" &&
      brainReady === "READY" &&
      datasetReady === "READY" &&
      unknownRuntimeFailsClosed &&
      developmentTestSimulationGated,
  };
}

function normalizeProviderList(value) {
  return safeArray(value).map((item) => normalize(typeof item === "string" ? item : item?.provider || item?.name)).filter(Boolean);
}

function getProviderIntegrity(input) {
  const provider = safeObject(input.providerIntegrity);
  const readiness = normalize(firstDefined(provider.providerIntegrityReadiness, provider.readiness, provider.status), "UNKNOWN");
  const alpacaCertification = normalize(firstDefined(provider.alpacaCertification, provider.certification), "UNKNOWN");
  const webullCertification = normalize(provider.webullCertification, "NOT_IMPLEMENTED");
  const operationalProviders = normalizeProviderList(provider.operationalProviders).length
    ? normalizeProviderList(provider.operationalProviders)
    : normalize(firstDefined(provider.provider, provider.operationalProvider), "UNKNOWN") !== "UNKNOWN"
      ? [normalize(firstDefined(provider.provider, provider.operationalProvider))]
      : [];
  const conditionalProviders = normalizeProviderList(provider.conditionalProviders).length
    ? normalizeProviderList(provider.conditionalProviders)
    : alpacaCertification === "CONDITIONALLY_VERIFIED"
      ? ["ALPACA"]
      : [];
  const incompleteProviders = normalizeProviderList(provider.incompleteProviders).length
    ? normalizeProviderList(provider.incompleteProviders)
    : webullCertification === "NOT_IMPLEMENTED"
      ? ["WEBULL"]
      : [];
  const providerLimitationsDisclosed = provider.providerLimitationsDisclosed === true;
  const unsupportedCapabilitiesNotClaimed = provider.unsupportedCapabilitiesNotClaimed === true;
  const placeholderProvidersBlocked = provider.placeholderProvidersBlocked === true;
  const frontendBackendClaimsMatch = provider.frontendBackendClaimsMatch === true;
  const allProvidersSupported = operationalProviders.every((item) => SUPPORTED_OPERATIONAL_PROVIDERS.has(item));

  return {
    readiness,
    alpacaCertification,
    webullCertification,
    operationalProviders,
    conditionalProviders,
    incompleteProviders,
    conditional: conditionalProviders.length > 0,
    passed:
      readiness === "READY" &&
      operationalProviders.length > 0 &&
      allProvidersSupported &&
      !operationalProviders.includes("WEBULL") &&
      webullCertification === "NOT_IMPLEMENTED" &&
      placeholderProvidersBlocked &&
      providerLimitationsDisclosed &&
      unsupportedCapabilitiesNotClaimed &&
      frontendBackendClaimsMatch,
  };
}

function getMarketDataValidation(input) {
  const validation = safeObject(input.marketDataValidation);
  const defectsRemaining = safeNumber(validation.validationDefectsRemaining, Number.NaN);
  const gateNames = [
    "quoteValidation",
    "tradeValidation",
    "candleValidation",
    "seriesValidation",
    "timestampIntegrity",
    "freshnessEnforcement",
    "numericalIntegrity",
    "symbolIntegrity",
    "partialDataHandling",
    "staleDataHandling",
    "intelligenceSuitability",
    "datasetValidationIntegration",
  ];
  const gates = Object.fromEntries(gateNames.map((name) => [name, pass(validation[name])]));

  return {
    readiness: normalize(validation.marketDataValidationReadiness || validation.readiness, "UNKNOWN"),
    defectsRemaining,
    gates,
    passed:
      normalize(validation.marketDataValidationReadiness || validation.readiness, "UNKNOWN") === "READY" &&
      defectsRemaining === 0 &&
      Object.values(gates).every(Boolean),
  };
}

function getFailsafeCertification(input) {
  const certification = safeObject(input.failsafeDataCertification);
  const defectsRemaining = safeNumber(certification.certificationDefectsRemaining, Number.NaN);
  const score = safeNumber(certification.certificationScore, 0);
  const label = normalize(certification.certificationLabel, "UNKNOWN");
  const allowedLabel = label === "CERTIFIED" || label === "CONDITIONALLY_CERTIFIED";
  const gates = [
    "providerIntegrityGate",
    "provenanceIntegrityGate",
    "marketDataValidationGate",
    "timestampFreshnessGate",
    "simulationIsolationGate",
    "unavailableStateGate",
    "intelligenceBlockingGate",
    "datasetSafetyGate",
    "trainingSafetyGate",
    "certificationBypassProtection",
  ];
  const allGatesPass = gates.every((name) => pass(certification[name]));

  return {
    score,
    label,
    defectsRemaining,
    conditional: label === "CONDITIONALLY_CERTIFIED",
    passed:
      normalize(certification.failsafeDataCertification || certification.result, "UNKNOWN") === "PASS" &&
      defectsRemaining === 0 &&
      score >= 75 &&
      allowedLabel &&
      allGatesPass,
  };
}

function getProvenanceIntegrity(input) {
  const provenance = safeObject(input.provenanceValidation);
  const criticalConflicts = safeNumber(provenance.criticalConflictsRemaining, 0);
  const unknownTrustPaths = safeNumber(firstDefined(provenance.unknownSourceTrustPaths, provenance.unknownTrustPaths), 0);
  const simulatedTrustPaths = safeNumber(firstDefined(provenance.simulatedGeneratedTrustPaths, provenance.simulatedOrGeneratedTrustPaths), 0);
  const explicitPass = pass(provenance.provenanceIntegrity) || provenance.provenanceIntegrityPassed === true;

  return {
    criticalConflicts,
    unknownTrustPaths,
    simulatedTrustPaths,
    passed:
      hasObjectContent(provenance) &&
      criticalConflicts === 0 &&
      unknownTrustPaths === 0 &&
      simulatedTrustPaths === 0 &&
      explicitPass,
  };
}

function getRuntimeEnvironment(input) {
  const runtime = safeObject(input.runtimeEnvironment);
  const hasRuntimeEvidence = hasObjectContent(runtime);

  return {
    marketSessionPolicyPassed: hasRuntimeEvidence && (runtime.marketSessionPolicyPassed === true || pass(runtime.marketSessionPolicy)),
    unavailableStateHandlingPassed: hasRuntimeEvidence && (runtime.unavailableStateHandlingPassed === true || pass(runtime.unavailableStateHandling)),
    intelligenceSafetyPassed: hasRuntimeEvidence && (runtime.intelligenceSafetyPassed === true || pass(runtime.intelligenceSafety)),
    productionIsolationPassed:
      hasRuntimeEvidence &&
      (runtime.productionIsolationPassed === true || pass(runtime.productionIsolation)) &&
      runtime.providerCredentialsChanged !== true &&
      runtime.vercelSettingsChanged !== true &&
      runtime.renderSettingsChanged !== true &&
      runtime.supabaseSchemaChanged !== true &&
      runtime.tradingActionsExecuted !== true &&
      runtime.positionsModified !== true &&
      runtime.serviceRoleExposed !== true,
    trainingSafetyPassed:
      hasRuntimeEvidence &&
      normalize(runtime.trainingStatus, "OFF") === "OFF" &&
      normalize(runtime.shadowTrainerStatus, "OFF") === "OFF" &&
      normalize(runtime.brainLearningStatus, "OFF") === "OFF",
  };
}

function getDatasetAndTrainingSafety(input) {
  const governance = safeObject(input.datasetGovernance);
  const training = safeObject(input.trainingReadiness);
  const hasGovernanceEvidence = hasObjectContent(governance);
  const hasTrainingEvidence = hasObjectContent(training);
  const rawDataCertified = governance.rawDataCertified === true;
  const trainingEligible = governance.trainingEligible === true || governance.futureTrainingEligible === true;
  const trainingReady = training.trainingReady === true;
  const trainingEnabled = training.trainingEnabled === true;

  return {
    datasetSafetyPassed:
      hasGovernanceEvidence &&
      governance.datasetSafetyPassed === true &&
      governance.rawDataCertified === false &&
      governance.trainingEligible === false &&
      governance.futureTrainingEligible === false &&
      normalize(governance.trainingBlockedReason, "RAW_DATA_CERTIFICATION_REQUIRED") === "RAW_DATA_CERTIFICATION_REQUIRED",
    trainingSafetyPassed:
      hasTrainingEvidence &&
      training.trainingReady === false &&
      training.trainingEnabled === false &&
      trainingEligible === false &&
      normalize(training.trainingStatus, "OFF") === "OFF",
  };
}

function scoreComponent(passed, weight, ratio = 1) {
  return passed ? weight * Math.max(0, Math.min(1, ratio)) : 0;
}

export function certifyAiccRawData(input = {}) {
  const safeInput = safeObject(input);
  if (!hasObjectContent(safeInput)) return fallbackResult();

  const simulation = getSimulationAudit(safeInput);
  const provider = getProviderIntegrity(safeInput);
  const marketData = getMarketDataValidation(safeInput);
  const failsafe = getFailsafeCertification(safeInput);
  const provenance = getProvenanceIntegrity(safeInput);
  const runtime = getRuntimeEnvironment(safeInput);
  const datasetTraining = getDatasetAndTrainingSafety(safeInput);

  const simulationRemovalPassed = simulation.passed;
  const providerIntegrityPassed = provider.passed;
  const marketDataValidationPassed = marketData.passed;
  const failsafeDataCertificationPassed = failsafe.passed;
  const provenanceIntegrityPassed = provenance.passed;
  const timestampIntegrityPassed = marketData.gates.timestampIntegrity === true;
  const freshnessEnforcementPassed = marketData.gates.freshnessEnforcement === true;
  const numericalIntegrityPassed = marketData.gates.numericalIntegrity === true;
  const marketSessionPolicyPassed = runtime.marketSessionPolicyPassed;
  const unavailableStateHandlingPassed = runtime.unavailableStateHandlingPassed;
  const intelligenceSafetyPassed = runtime.intelligenceSafetyPassed;
  const datasetSafetyPassed = datasetTraining.datasetSafetyPassed;
  const trainingSafetyPassed = datasetTraining.trainingSafetyPassed && runtime.trainingSafetyPassed;
  const productionIsolationPassed = runtime.productionIsolationPassed;

  const gates = {
    simulationRemovalPassed,
    providerIntegrityPassed,
    marketDataValidationPassed,
    failsafeDataCertificationPassed,
    provenanceIntegrityPassed,
    timestampIntegrityPassed,
    freshnessEnforcementPassed,
    numericalIntegrityPassed,
    marketSessionPolicyPassed,
    unavailableStateHandlingPassed,
    intelligenceSafetyPassed,
    datasetSafetyPassed,
    trainingSafetyPassed,
    productionIsolationPassed,
  };

  const blockingReasons = Object.entries(gates)
    .filter(([, passed]) => !passed)
    .map(([name]) => `${name} failed.`);
  const criticalGateFailed = blockingReasons.length > 0;
  const certificationWarnings = [];
  const remainingRisks = [];

  if (provider.conditional) {
    certificationWarnings.push("Operational provider remains conditionally verified.");
    remainingRisks.push("Alpaca is conditionally verified, so final certification is limited to supported Private Beta capability boundaries.");
  }

  if (provider.incompleteProviders.length) {
    certificationWarnings.push(`Incomplete providers remain uncertified: ${provider.incompleteProviders.join(", ")}.`);
  }

  if (failsafe.conditional) {
    certificationWarnings.push("Failsafe data certification remains conditionally certified.");
  }

  const rawScore =
    scoreComponent(simulationRemovalPassed, WEIGHTS.simulationRemoval) +
    scoreComponent(providerIntegrityPassed, WEIGHTS.providerIntegrity, provider.conditional ? 0.85 : 1) +
    scoreComponent(marketDataValidationPassed, WEIGHTS.marketDataValidation) +
    scoreComponent(failsafeDataCertificationPassed, WEIGHTS.failsafeDataCertification, Math.max(0, Math.min(1, failsafe.score / 100))) +
    scoreComponent(provenanceIntegrityPassed, WEIGHTS.provenanceIntegrity) +
    scoreComponent(intelligenceSafetyPassed, WEIGHTS.intelligenceSafety) +
    scoreComponent(datasetSafetyPassed && trainingSafetyPassed, WEIGHTS.datasetTrainingSafety) +
    scoreComponent(productionIsolationPassed, WEIGHTS.productionIsolation);

  const cappedScore = criticalGateFailed
    ? Math.min(rawScore, 49)
    : provider.conditional || failsafe.conditional
      ? Math.min(rawScore, 94)
      : rawScore;
  const certificationScore = clampScore(cappedScore);
  const certificationLabel = getLabel(certificationScore, criticalGateFailed, provider.conditional || failsafe.conditional);
  const certificationDecision = getDecision(certificationLabel);
  const rawDataCertified = certificationDecision === DECISIONS.RAW_DATA_CERTIFIED ||
    certificationDecision === DECISIONS.CONDITIONALLY_RAW_DATA_CERTIFIED;

  return {
    rawDataCertified,
    certificationScore,
    certificationLabel,
    certificationDecision,
    ...gates,
    operationalProviders: provider.operationalProviders,
    conditionalProviders: provider.conditionalProviders,
    incompleteProviders: provider.incompleteProviders,
    blockingReasons: [...new Set(blockingReasons)],
    certificationWarnings: [...new Set(certificationWarnings)],
    remainingRisks: [...new Set(remainingRisks)],
    mandatoryGatesPassed: Object.values(gates).filter(Boolean).length,
    mandatoryGatesTotal: Object.values(gates).length,
    residualRuntimeSimulationDependencies: simulation.residual,
    unknownTrustPaths: provenance.unknownTrustPaths,
    validationDefectsRemaining: marketData.defectsRemaining,
    failsafeCertificationDefectsRemaining: failsafe.defectsRemaining,
    certifiedDataTypes: ["Alpaca REST quotes", "Alpaca latest trades when returned by quote path", "Alpaca historical/intraday bars and candles", "Provider status", "Market-session handling", "Tactical analysis from validated quote/candle inputs"],
    unsupportedCapabilities: ["Webull data", "Real provider streaming", "Options data", "News data", "Macro data", "Global-market data", "Market breadth data"],
    privateBetaRawDataGate: rawDataCertified ? "PASS" : "FAIL",
    trainingStatus: "OFF",
    shadowTrainerStatus: "OFF",
    brainLearningStatus: "OFF",
  };
}
