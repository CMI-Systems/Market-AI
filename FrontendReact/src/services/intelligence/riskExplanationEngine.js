function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function addRisk(risks, evidence, warnings, label, value) {
  if (!value) return;
  const readable = String(value).replace(/_/g, ' ');
  risks.push(`${label}: ${readable}`);
  evidence.push(`${label} risk context is ${value}.`);
  if (String(value).toUpperCase().includes('HIGH') || String(value).toUpperCase().includes('CRITICAL')) {
    warnings.push(`${label} indicates elevated risk.`);
  }
}

export function generateRiskExplanation(input = {}) {
  const evidence = [];
  const warnings = [];
  const keyRisks = [];
  let score = 55;

  // Risk explanation translates failsafe, regime, and consensus risk signals.
  addRisk(keyRisks, evidence, warnings, 'Failsafe', input?.failsafe?.failsafeState);
  addRisk(keyRisks, evidence, warnings, 'Risk escalation', input?.failsafe?.riskEscalation);
  addRisk(keyRisks, evidence, warnings, 'Reliability', input?.failsafe?.reliabilityLabel);
  addRisk(keyRisks, evidence, warnings, 'Regime risk', input?.regime?.riskContext);
  addRisk(keyRisks, evidence, warnings, 'Consensus', input?.consensus?.consensusState);

  const suppliedRisks = input?.marketIntelligence?.risks ?? input?.globalScan?.risks;
  if (Array.isArray(suppliedRisks)) {
    suppliedRisks.slice(0, 4).forEach((risk) => {
      if (risk) {
        keyRisks.push(String(risk));
        evidence.push(`Supplied risk context: ${risk}.`);
      }
    });
  }

  if (!keyRisks.length) {
    keyRisks.push('Limited validated risk context');
    warnings.push('Risk context is limited.');
    score -= 15;
  }

  const highRisk = keyRisks.some((risk) => /HIGH|CRITICAL|LOW RELIABILITY|CRISIS/i.test(risk));
  if (highRisk) score -= 18;

  const explanation = highRisk
    ? 'Risk context is elevated. Areas to monitor include reliability, escalation pressure, and any divergence between intelligence layers.'
    : 'Risk context appears contained, but areas to monitor remain data reliability, participation breadth, and shifts in consensus.';

  return {
    keyRisks,
    explanation,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
