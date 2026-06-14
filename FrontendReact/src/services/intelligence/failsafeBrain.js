import { analyzeConfidenceCalibration } from './confidenceCalibrationEngine.js';
import { analyzeConflicts } from './conflictDetectionEngine.js';
import { analyzeConsistency } from './consistencyEngine.js';
import { analyzeDataIntegrity } from './dataIntegrityEngine.js';
import { analyzeRiskEscalation } from './riskEscalationEngine.js';
import { analyzeValidation } from './validationEngine.js';
import { mergeProvenance } from './provenanceValidator.js';

const FAILSAFE_STATE = {
  CONFIRMED_ENVIRONMENT: 'CONFIRMED_ENVIRONMENT',
  DEGRADED_ENVIRONMENT: 'DEGRADED_ENVIRONMENT',
  DATA_UNAVAILABLE: 'DATA_UNAVAILABLE',
  BLOCKED: 'BLOCKED',
  ELEVATED_UNCERTAINTY: 'ELEVATED_UNCERTAINTY',
  INTELLIGENCE_CONFLICT: 'INTELLIGENCE_CONFLICT',
  DATA_INTEGRITY_CONCERN: 'DATA_INTEGRITY_CONCERN',
  RISK_ESCALATION: 'RISK_ESCALATION',
  LOW_RELIABILITY_ENVIRONMENT: 'LOW_RELIABILITY_ENVIRONMENT',
  CRITICAL_VALIDATION_FAILURE: 'CRITICAL_VALIDATION_FAILURE',
};

const RELIABILITY_WEIGHTS = {
  dataIntegrity: 0.22,
  validation: 0.2,
  conflictDetection: 0.18,
  riskEscalation: 0.16,
  consistency: 0.12,
  confidenceCalibration: 0.12,
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getReliabilityLabel(reliability) {
  if (reliability >= 85) return 'VERY_HIGH_RELIABILITY';
  if (reliability >= 70) return 'HIGH_RELIABILITY';
  if (reliability >= 55) return 'MODERATE_RELIABILITY';
  if (reliability >= 40) return 'LOW_RELIABILITY';
  return 'VERY_LOW_RELIABILITY';
}

function safeEngineResult(result, defaults) {
  return {
    ...defaults,
    ...result,
    score: clampScore(Number.isFinite(Number(result?.score)) ? Number(result.score) : defaults.score),
    evidence: Array.isArray(result?.evidence) ? result.evidence : defaults.evidence,
    warnings: Array.isArray(result?.warnings) ? result.warnings : defaults.warnings,
  };
}

function runEngine(engine, input, defaults, warnings, name) {
  try {
    const result = safeEngineResult(engine(input), defaults);
    warnings.push(...result.warnings);
    return result;
  } catch {
    warnings.push(`${name} failed and returned a safe default.`);
    return defaults;
  }
}

function getSafeDefaults() {
  return {
    dataIntegrity: {
      dataIntegrity: 'DEGRADED',
      score: 40,
      evidence: ['Data integrity defaulted to degraded.'],
      warnings: ['Data integrity context is unavailable.'],
    },
    validation: {
      validation: 'WEAK_VALIDATION',
      score: 40,
      evidence: ['Validation defaulted to weak.'],
      warnings: ['Validation context is unavailable.'],
    },
    conflictDetection: {
      conflict: 'MINOR_CONFLICT',
      score: 45,
      evidence: ['Conflict detection defaulted to minor conflict.'],
      warnings: ['Conflict context is incomplete.'],
    },
    riskEscalation: {
      riskEscalation: 'ELEVATED',
      score: 45,
      evidence: ['Risk escalation defaulted to elevated.'],
      warnings: ['Risk escalation context is incomplete.'],
    },
    consistency: {
      consistency: 'INCONSISTENT',
      score: 45,
      evidence: ['Consistency defaulted to inconsistent.'],
      warnings: ['History is unavailable.'],
    },
    confidenceCalibration: {
      confidenceCalibration: 'SLIGHTLY_OVERCONFIDENT',
      score: 45,
      evidence: ['Confidence calibration defaulted to slightly overconfident.'],
      warnings: ['Confidence calibration context is incomplete.'],
    },
  };
}

function hasFailsafeInput(input) {
  return Boolean(
    input?.tactical
    || input?.behavioral
    || input?.dataStreams
    || input?.marketIntelligence
    || input?.globalScan
    || input?.newsletterData
    || input?.history
  );
}

function calculateReliability(engines) {
  return clampScore(
    engines.dataIntegrity.score * RELIABILITY_WEIGHTS.dataIntegrity
    + engines.validation.score * RELIABILITY_WEIGHTS.validation
    + engines.conflictDetection.score * RELIABILITY_WEIGHTS.conflictDetection
    + engines.riskEscalation.score * RELIABILITY_WEIGHTS.riskEscalation
    + engines.consistency.score * RELIABILITY_WEIGHTS.consistency
    + engines.confidenceCalibration.score * RELIABILITY_WEIGHTS.confidenceCalibration,
  );
}

function adjustReliabilityForProvenance(reliability, provenance) {
  if (provenance.status === 'BLOCKED') return Math.min(reliability, provenance.riskLevel === 'CRITICAL' ? 15 : 25);
  if (provenance.status === 'DATA_UNAVAILABLE') return Math.min(reliability, 30);
  if (provenance.status === 'DEGRADED') return Math.min(reliability, 55);
  return reliability;
}

function flattenEvidence(engines) {
  return [
    ...engines.dataIntegrity.evidence.map((item) => `Data integrity: ${item}`),
    ...engines.validation.evidence.map((item) => `Validation: ${item}`),
    ...engines.conflictDetection.evidence.map((item) => `Conflict detection: ${item}`),
    ...engines.riskEscalation.evidence.map((item) => `Risk escalation: ${item}`),
    ...engines.consistency.evidence.map((item) => `Consistency: ${item}`),
    ...engines.confidenceCalibration.evidence.map((item) => `Confidence calibration: ${item}`),
  ];
}

function dedupeWarnings(warnings) {
  return [...new Set(warnings.filter(Boolean))];
}

function determineFailsafeState(engines, reliability, provenance) {
  if (provenance.status === 'BLOCKED') return FAILSAFE_STATE.BLOCKED;
  if (provenance.status === 'DATA_UNAVAILABLE') return FAILSAFE_STATE.DATA_UNAVAILABLE;
  if (engines.validation.validation === 'NO_VALIDATION') return FAILSAFE_STATE.CRITICAL_VALIDATION_FAILURE;
  if (engines.riskEscalation.riskEscalation === 'CRITICAL' || engines.riskEscalation.riskEscalation === 'HIGH_RISK') {
    return FAILSAFE_STATE.RISK_ESCALATION;
  }
  if (engines.conflictDetection.conflict === 'MAJOR_CONFLICT') return FAILSAFE_STATE.INTELLIGENCE_CONFLICT;
  if (engines.dataIntegrity.dataIntegrity === 'COMPROMISED' || engines.dataIntegrity.dataIntegrity === 'DEGRADED') {
    return FAILSAFE_STATE.DATA_INTEGRITY_CONCERN;
  }
  if (reliability < 55) return FAILSAFE_STATE.LOW_RELIABILITY_ENVIRONMENT;
  if (provenance.status === 'DEGRADED') return FAILSAFE_STATE.DEGRADED_ENVIRONMENT;
  if (reliability >= 70 && engines.validation.validation !== 'WEAK_VALIDATION' && provenance.trusted) {
    return FAILSAFE_STATE.CONFIRMED_ENVIRONMENT;
  }
  return FAILSAFE_STATE.ELEVATED_UNCERTAINTY;
}

export function analyzeFailsafeState(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const warnings = [];
  const defaults = getSafeDefaults();
  const timestamp = new Date().toISOString();
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'MARKET';

  if (!input || typeof input !== 'object') {
    warnings.push('Input was invalid, so Failsafe Brain returned safe defaults.');
  }

  const streamInputs = Array.isArray(safeInput.dataStreams)
    ? safeInput.dataStreams
    : safeInput.dataStreams && typeof safeInput.dataStreams === 'object'
      ? Object.values(safeInput.dataStreams)
      : [];
  const provenance = mergeProvenance(
    [
      safeInput.tactical,
      safeInput.behavioral,
      safeInput.marketIntelligence,
      safeInput.globalScan,
      safeInput.newsletterData,
      ...streamInputs,
    ],
    { requireAll: false, timestampRequired: false },
  );

  if (!hasFailsafeInput(safeInput)) {
    warnings.push('Failsafe input data is empty or unavailable.');
    const engines = defaults;
    const reliability = 45;

    return {
      symbol,
      failsafeState: FAILSAFE_STATE.ELEVATED_UNCERTAINTY,
      reliability,
      reliabilityLabel: getReliabilityLabel(reliability),
      dataIntegrity: engines.dataIntegrity.dataIntegrity,
      validation: engines.validation.validation,
      conflict: engines.conflictDetection.conflict,
      riskEscalation: engines.riskEscalation.riskEscalation,
      consistency: engines.consistency.consistency,
      confidenceCalibration: engines.confidenceCalibration.confidenceCalibration,
      available: false,
      sourceType: 'DATA_UNAVAILABLE',
      provider: provenance.provider,
      simulated: false,
      generated: false,
      dataAge: provenance.dataAge,
      sessionState: provenance.sessionState,
      marketOpen: provenance.marketOpen,
      dataState: 'DATA_UNAVAILABLE',
      rawDataCertified: false,
      trainingEligible: false,
      provenance,
      engines,
      evidence: flattenEvidence(engines),
      warnings: dedupeWarnings([
        ...warnings,
        ...provenance.warnings,
        ...provenance.blockingReasons,
        ...Object.values(engines).flatMap((engine) => engine.warnings),
      ]),
      timestamp,
    };
  }

  const dataIntegrity = runEngine(
    analyzeDataIntegrity,
    { ...safeInput, provenance },
    defaults.dataIntegrity,
    warnings,
    'Data integrity engine',
  );
  const validation = runEngine(analyzeValidation, { ...safeInput, provenance }, defaults.validation, warnings, 'Validation engine');
  const conflictDetection = runEngine(
    analyzeConflicts,
    { ...safeInput, provenance },
    defaults.conflictDetection,
    warnings,
    'Conflict detection engine',
  );
  const riskEscalation = runEngine(
    analyzeRiskEscalation,
    { ...safeInput, dataIntegrity, validation, conflictDetection },
    defaults.riskEscalation,
    warnings,
    'Risk escalation engine',
  );
  const consistency = runEngine(
    analyzeConsistency,
    safeInput,
    defaults.consistency,
    warnings,
    'Consistency engine',
  );
  const confidenceCalibration = runEngine(
    analyzeConfidenceCalibration,
    { ...safeInput, dataIntegrity, validation, conflictDetection },
    defaults.confidenceCalibration,
    warnings,
    'Confidence calibration engine',
  );

  const engines = {
    dataIntegrity,
    validation,
    conflictDetection,
    riskEscalation,
    consistency,
    confidenceCalibration,
  };
  const reliability = adjustReliabilityForProvenance(calculateReliability(engines), provenance);

  return {
    symbol,
    failsafeState: determineFailsafeState(engines, reliability, provenance),
    reliability,
    reliabilityLabel: getReliabilityLabel(reliability),
    dataIntegrity: engines.dataIntegrity.dataIntegrity,
    validation: engines.validation.validation,
    conflict: engines.conflictDetection.conflict,
    riskEscalation: engines.riskEscalation.riskEscalation,
    consistency: engines.consistency.consistency,
    confidenceCalibration: engines.confidenceCalibration.confidenceCalibration,
    available: provenance.status !== 'BLOCKED' && provenance.status !== 'DATA_UNAVAILABLE',
    sourceType: provenance.sourceType,
    provider: provenance.provider,
    simulated: provenance.simulated,
    generated: provenance.generated,
    dataAge: provenance.dataAge,
    sessionState: provenance.sessionState,
    marketOpen: provenance.marketOpen,
    dataState: provenance.dataState,
    rawDataCertified: false,
    trainingEligible: false,
    provenance,
    engines,
    evidence: flattenEvidence(engines),
    warnings: dedupeWarnings([
      ...warnings,
      ...provenance.warnings,
      ...provenance.blockingReasons,
    ]),
    timestamp,
  };
}
