function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function confidence(value) {
  const number = toNumber(value?.confidence ?? value?.score);
  if (number === null) return null;
  return number <= 1 ? number * 100 : number;
}

export function analyzeRiskEscalation(input = {}) {
  const evidence = [];
  const warnings = [];
  const tactical = input?.tactical;
  const behavioral = input?.behavioral;
  const conflictDetection = input?.conflictDetection;
  const validation = input?.validation;
  const dataIntegrity = input?.dataIntegrity;
  let score = 85;

  // Risk escalation rises when conflicts, validation failures, data concerns, or extreme states are present.
  if (conflictDetection?.conflict === 'MAJOR_CONFLICT') {
    score -= 35;
    warnings.push('Major intelligence conflict escalates risk.');
    evidence.push('Major conflict detected across intelligence layers.');
  } else if (conflictDetection?.conflict === 'MINOR_CONFLICT') {
    score -= 15;
    warnings.push('Minor intelligence conflict raises uncertainty.');
    evidence.push('Minor conflict detected across intelligence layers.');
  } else {
    evidence.push('No major intelligence conflict is present.');
  }

  if (validation?.validation === 'NO_VALIDATION' || validation?.validation === 'WEAK_VALIDATION') {
    score -= 22;
    warnings.push('Weak validation escalates failsafe risk.');
    evidence.push('Validation quality is weak.');
  }

  if (dataIntegrity?.dataIntegrity === 'COMPROMISED') {
    score -= 30;
    warnings.push('Compromised data integrity escalates failsafe risk.');
    evidence.push('Data integrity is compromised.');
  } else if (dataIntegrity?.dataIntegrity === 'DEGRADED') {
    score -= 15;
    warnings.push('Degraded data integrity raises failsafe risk.');
    evidence.push('Data integrity is degraded.');
  }

  const tacticalState = String(tactical?.tacticalState || '').toUpperCase();
  if (tacticalState.includes('HIGH_VOLATILITY') || tacticalState.includes('STRUCTURAL_FAILURE')) {
    score -= 15;
    warnings.push('Tactical state indicates elevated market stress.');
    evidence.push(`Tactical state is ${tacticalState}.`);
  }

  const behavioralState = String(behavioral?.behavioralState || '').toUpperCase();
  if (behavioralState.includes('RISK_AVERSION') || behavioralState.includes('EXHAUSTION')) {
    score -= 12;
    warnings.push('Behavioral state indicates elevated participant stress.');
    evidence.push(`Behavioral state is ${behavioralState}.`);
  }

  const tacticalConfidence = confidence(tactical);
  const behavioralConfidence = confidence(behavioral);
  if (tacticalConfidence !== null && behavioralConfidence !== null && tacticalConfidence >= 80 && behavioralConfidence >= 80) {
    score += 5;
    evidence.push('High tactical and behavioral confidence modestly reduce escalation risk.');
  }

  const finalScore = clampScore(score);
  const riskEscalation = finalScore >= 75
    ? 'NORMAL'
    : finalScore >= 55
      ? 'ELEVATED'
      : finalScore >= 30
        ? 'HIGH_RISK'
        : 'CRITICAL';

  return {
    riskEscalation,
    score: finalScore,
    evidence,
    warnings,
  };
}
