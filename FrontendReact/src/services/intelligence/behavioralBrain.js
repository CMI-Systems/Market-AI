import { analyzeConviction } from './convictionEngine.js';
import { analyzeLeadership } from './leadershipEngine.js';
import { analyzeNarrativeAdoption } from './narrativeAdoptionEngine.js';
import { analyzeParticipation } from './participationEngine.js';
import { analyzeRiskAppetite } from './riskAppetiteEngine.js';
import { analyzeRotation } from './rotationEngine.js';

const BEHAVIORAL_STATE = {
  RISK_ON_EXPANSION: 'RISK_ON_EXPANSION',
  HEALTHY_PARTICIPATION: 'HEALTHY_PARTICIPATION',
  DEFENSIVE_ROTATION: 'DEFENSIVE_ROTATION',
  SPECULATIVE_EXPANSION: 'SPECULATIVE_EXPANSION',
  RISK_AVERSION: 'RISK_AVERSION',
  NARRATIVE_DRIVEN: 'NARRATIVE_DRIVEN',
  BEHAVIORAL_EXHAUSTION: 'BEHAVIORAL_EXHAUSTION',
  TRANSITIONING_BEHAVIOR: 'TRANSITIONING_BEHAVIOR',
};

const CONFIDENCE_WEIGHTS = {
  participation: 0.25,
  leadership: 0.2,
  rotation: 0.15,
  riskAppetite: 0.2,
  narrativeAdoption: 0.1,
  conviction: 0.1,
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'VERY_HIGH';
  if (confidence >= 70) return 'HIGH';
  if (confidence >= 55) return 'MODERATE';
  if (confidence >= 40) return 'LOW';
  return 'VERY_LOW';
}

function safeEngineResult(result, defaults) {
  return {
    ...defaults,
    ...result,
    score: clampScore(Number.isFinite(Number(result?.score)) ? Number(result.score) : defaults.score),
    evidence: Array.isArray(result?.evidence) ? result.evidence : defaults.evidence,
  };
}

function runEngine(engine, input, defaults, warnings, name) {
  try {
    return safeEngineResult(engine(input), defaults);
  } catch {
    warnings.push(`${name} failed and returned a safe default.`);
    return defaults;
  }
}

function getSafeDefaults() {
  return {
    participation: {
      participation: 'WEAK_PARTICIPATION',
      institutionalParticipation: 'MODERATE_INSTITUTIONAL',
      retailParticipation: 'MODERATE_RETAIL',
      score: 35,
      evidence: ['Participation defaulted to weak because input data is unavailable.'],
    },
    leadership: {
      leadership: 'NO_CLEAR_LEADERSHIP',
      quality: 'WEAK',
      score: 35,
      evidence: ['Leadership defaulted to no clear leadership.'],
    },
    rotation: {
      rotation: 'SAFETY_ROTATION',
      score: 35,
      evidence: ['Rotation defaulted to safety rotation.'],
    },
    riskAppetite: {
      riskAppetite: 'NEUTRAL',
      intensity: 'LOW',
      score: 40,
      evidence: ['Risk appetite defaulted to neutral.'],
    },
    narrativeAdoption: {
      narrative: 'UNKNOWN_NARRATIVE',
      adoptionLevel: 'VERY_LOW',
      score: 30,
      evidence: ['Narrative adoption defaulted to unknown narrative.'],
    },
    conviction: {
      conviction: 'VERY_LOW_CONVICTION',
      score: 30,
      evidence: ['Conviction defaulted to very low conviction.'],
    },
  };
}

function calculateConfidence(engines) {
  return clampScore(
    engines.participation.score * CONFIDENCE_WEIGHTS.participation
    + engines.leadership.score * CONFIDENCE_WEIGHTS.leadership
    + engines.rotation.score * CONFIDENCE_WEIGHTS.rotation
    + engines.riskAppetite.score * CONFIDENCE_WEIGHTS.riskAppetite
    + engines.narrativeAdoption.score * CONFIDENCE_WEIGHTS.narrativeAdoption
    + engines.conviction.score * CONFIDENCE_WEIGHTS.conviction,
  );
}

function flattenEvidence(engines) {
  return [
    ...engines.participation.evidence.map((item) => `Participation: ${item}`),
    ...engines.leadership.evidence.map((item) => `Leadership: ${item}`),
    ...engines.rotation.evidence.map((item) => `Rotation: ${item}`),
    ...engines.riskAppetite.evidence.map((item) => `Risk appetite: ${item}`),
    ...engines.narrativeAdoption.evidence.map((item) => `Narrative adoption: ${item}`),
    ...engines.conviction.evidence.map((item) => `Conviction: ${item}`),
  ];
}

function determineBehavioralState(engines) {
  const { participation, leadership, rotation, riskAppetite, narrativeAdoption, conviction } = engines;

  if (conviction.conviction === 'VERY_LOW_CONVICTION' && participation.participation === 'CONTRACTING_PARTICIPATION') {
    return BEHAVIORAL_STATE.BEHAVIORAL_EXHAUSTION;
  }

  if (riskAppetite.riskAppetite === 'DEFENSIVE_RISK_OFF' || riskAppetite.riskAppetite === 'RISK_OFF') {
    return BEHAVIORAL_STATE.RISK_AVERSION;
  }

  if (['SAFETY_ROTATION', 'DEFENSIVE_ROTATION', 'BOND_ROTATION'].includes(rotation.rotation)) {
    return BEHAVIORAL_STATE.DEFENSIVE_ROTATION;
  }

  if (narrativeAdoption.adoptionLevel === 'HIGH' || narrativeAdoption.adoptionLevel === 'VERY_HIGH') {
    return BEHAVIORAL_STATE.NARRATIVE_DRIVEN;
  }

  if (
    riskAppetite.riskAppetite === 'AGGRESSIVE_RISK_ON'
    && participation.retailParticipation === 'HIGH_RETAIL'
    && conviction.score >= 70
  ) {
    return BEHAVIORAL_STATE.SPECULATIVE_EXPANSION;
  }

  if (
    riskAppetite.riskAppetite === 'RISK_ON'
    && ['BROAD_PARTICIPATION', 'EXPANDING_PARTICIPATION'].includes(participation.participation)
  ) {
    return BEHAVIORAL_STATE.RISK_ON_EXPANSION;
  }

  if (participation.participation === 'BROAD_PARTICIPATION' && leadership.quality !== 'WEAK') {
    return BEHAVIORAL_STATE.HEALTHY_PARTICIPATION;
  }

  return BEHAVIORAL_STATE.TRANSITIONING_BEHAVIOR;
}

function hasBehavioralData(input) {
  return Boolean(
    input?.marketPulse
    || input?.marketIntelligence
    || input?.globalScan
    || input?.newsletterData
    || input?.crossAssetData
  );
}

export function analyzeBehavioralState(input = {}) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const warnings = [];
  const defaults = getSafeDefaults();
  const timestamp = new Date().toISOString();
  const symbol = typeof safeInput.symbol === 'string' && safeInput.symbol.trim()
    ? safeInput.symbol.trim().toUpperCase()
    : 'MARKET';

  if (!input || typeof input !== 'object') {
    warnings.push('Input was invalid, so Behavioral Brain returned safe defaults.');
  }

  if (!hasBehavioralData(safeInput)) {
    warnings.push('Behavioral input data is empty or unavailable.');
    const engines = defaults;
    const confidence = 45;

    return {
      symbol,
      behavioralState: BEHAVIORAL_STATE.TRANSITIONING_BEHAVIOR,
      confidence,
      confidenceLabel: getConfidenceLabel(confidence),
      participation: engines.participation.participation,
      leadership: engines.leadership.leadership,
      rotation: engines.rotation.rotation,
      riskAppetite: engines.riskAppetite.riskAppetite,
      narrativeAdoption: engines.narrativeAdoption.adoptionLevel,
      conviction: engines.conviction.conviction,
      engines,
      evidence: flattenEvidence(engines),
      warnings,
      timestamp,
    };
  }

  const participation = runEngine(analyzeParticipation, safeInput, defaults.participation, warnings, 'Participation engine');
  const leadership = runEngine(analyzeLeadership, safeInput, defaults.leadership, warnings, 'Leadership engine');
  const rotation = runEngine(analyzeRotation, safeInput, defaults.rotation, warnings, 'Rotation engine');
  const riskAppetite = runEngine(
    analyzeRiskAppetite,
    { ...safeInput, participation, leadership, rotation },
    defaults.riskAppetite,
    warnings,
    'Risk appetite engine',
  );
  const narrativeAdoption = runEngine(
    analyzeNarrativeAdoption,
    safeInput,
    defaults.narrativeAdoption,
    warnings,
    'Narrative adoption engine',
  );
  const conviction = runEngine(
    analyzeConviction,
    { ...safeInput, participation, leadership, rotation, riskAppetite },
    defaults.conviction,
    warnings,
    'Conviction engine',
  );

  const engines = {
    participation,
    leadership,
    rotation,
    riskAppetite,
    narrativeAdoption,
    conviction,
  };
  const confidence = calculateConfidence(engines);

  return {
    symbol,
    behavioralState: determineBehavioralState(engines),
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    participation: engines.participation.participation,
    leadership: engines.leadership.leadership,
    rotation: engines.rotation.rotation,
    riskAppetite: engines.riskAppetite.riskAppetite,
    narrativeAdoption: engines.narrativeAdoption.adoptionLevel,
    conviction: engines.conviction.conviction,
    engines,
    evidence: flattenEvidence(engines),
    warnings,
    timestamp,
  };
}
