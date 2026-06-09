function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function label(value, fallback = 'unknown') {
  return String(value || fallback).replace(/_/g, ' ').toLowerCase();
}

export function generateIntelligenceSummary(input = {}) {
  const evidence = [];
  const warnings = [];
  const symbol = typeof input?.symbol === 'string' && input.symbol.trim() ? input.symbol.trim().toUpperCase() : 'MARKET';
  const consensusState = input?.consensus?.consensusState;
  const regime = input?.regime?.regime;
  const tacticalState = input?.tactical?.tacticalState;
  const behavioralState = input?.behavioral?.behavioralState;
  const reliability = toNumber(input?.failsafe?.reliability);
  let score = 45;

  // Summary translates existing intelligence states; it does not add a new conclusion.
  if (consensusState) {
    score += 18;
    evidence.push(`Consensus state is ${consensusState}.`);
  } else {
    warnings.push('Consensus state is unavailable for the summary.');
  }

  if (regime) {
    score += 14;
    evidence.push(`Regime classification is ${regime}.`);
  }

  if (tacticalState) {
    score += 8;
    evidence.push(`Tactical state is ${tacticalState}.`);
  }

  if (behavioralState) {
    score += 8;
    evidence.push(`Behavioral state is ${behavioralState}.`);
  }

  if (reliability !== null && reliability < 55) {
    score -= 12;
    warnings.push('Failsafe reliability is low, so the summary should be treated cautiously.');
  }

  const headline = consensusState
    ? `${symbol} Intelligence: ${label(consensusState)}`
    : `${symbol} Intelligence: limited assessment`;
  const summary = `${symbol} is currently classified as ${label(regime, 'transition')} with ${label(consensusState, 'elevated uncertainty')} across the combined intelligence stack. Tactical context reads ${label(tacticalState)}, while behavioral context reads ${label(behavioralState)}.`;

  return {
    headline,
    summary,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
