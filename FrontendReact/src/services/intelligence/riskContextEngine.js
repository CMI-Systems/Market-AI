function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function analyzeRiskContext(input = {}) {
  const evidence = [];
  const warnings = [];
  const failsafeRisk = String(input?.failsafe?.riskEscalation || input?.failsafe?.failsafeState || '').toUpperCase();
  const consensusState = String(input?.consensus?.consensusState || '').toUpperCase();
  const globalRisk = toNumber(input?.globalScan?.riskScore ?? input?.marketPulse?.riskScore);
  let riskContext = 'RISK_CONTROLLED';
  let score = 72;

  // Risk context is controlled by Failsafe first, then consensus and global risk readings.
  if (failsafeRisk.includes('CRITICAL') || consensusState.includes('HIGH_RISK') || (globalRisk !== null && globalRisk >= 85)) {
    riskContext = 'RISK_CRITICAL';
    score = 25;
    warnings.push('Critical risk context is present.');
    evidence.push('Failsafe, consensus, or global scan indicates critical risk.');
  } else if (failsafeRisk.includes('HIGH_RISK') || failsafeRisk.includes('RISK_ESCALATION') || (globalRisk !== null && globalRisk >= 70)) {
    riskContext = 'RISK_ELEVATED';
    score = 42;
    warnings.push('Risk context is elevated.');
    evidence.push('Risk escalation is elevated.');
  } else if (failsafeRisk.includes('ELEVATED') || consensusState.includes('UNCERTAINTY') || (globalRisk !== null && globalRisk >= 55)) {
    riskContext = 'RISK_RISING';
    score = 58;
    evidence.push('Risk is rising but not critical.');
  } else {
    evidence.push('Risk context is controlled.');
  }

  if (!failsafeRisk && !consensusState && globalRisk === null) {
    score -= 15;
    warnings.push('Risk context inputs are limited.');
  }

  return {
    riskContext,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
