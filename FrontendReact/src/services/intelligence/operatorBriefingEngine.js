function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function state(value, fallback = 'unknown') {
  return String(value || fallback).replace(/_/g, ' ').toLowerCase();
}

export function generateOperatorBriefing(input = {}) {
  const evidence = [];
  const warnings = [];
  const symbol = typeof input?.symbol === 'string' && input.symbol.trim() ? input.symbol.trim().toUpperCase() : 'MARKET';
  const consensus = input?.consensus?.consensusState;
  const regime = input?.regime?.regime;
  const riskContext = input?.regime?.riskContext ?? input?.failsafe?.riskEscalation;
  const reliability = input?.failsafe?.reliabilityLabel;
  let score = 45;

  // Briefing gives an operator-readable explanation without action instructions.
  if (consensus) {
    score += 15;
    evidence.push(`Briefing includes consensus state ${consensus}.`);
  } else {
    warnings.push('Consensus state is missing from operator briefing.');
  }

  if (regime) {
    score += 12;
    evidence.push(`Briefing includes regime ${regime}.`);
  }

  if (riskContext) {
    score += 10;
    evidence.push(`Briefing includes risk context ${riskContext}.`);
  }

  if (String(reliability || '').toUpperCase().includes('LOW')) {
    score -= 12;
    warnings.push('Low reliability requires a cautious briefing tone.');
  }

  const briefing = `${symbol} is being assessed in a ${state(regime, 'transition')} environment with ${state(consensus, 'elevated uncertainty')} across the intelligence stack. Risk context is ${state(riskContext)}, and reliability is ${state(reliability, 'not fully established')}.`;
  const spotlightNarrative = `Spotlight: ${symbol} currently requires attention on ${state(riskContext, 'risk context')} and ${state(regime, 'regime stability')}.`;

  return {
    briefing,
    spotlightNarrative,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
