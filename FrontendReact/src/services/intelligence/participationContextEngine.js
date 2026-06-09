function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function readBreadth(input) {
  const breadth = input?.marketPulse?.breadth ?? input?.globalScan?.breadth ?? {};
  const percentPositive = toNumber(breadth.percentPositive ?? breadth.positivePercent ?? breadth.advancePercent);
  const advancing = toNumber(breadth.advancing ?? breadth.advancers);
  const declining = toNumber(breadth.declining ?? breadth.decliners);

  if (percentPositive !== null) return percentPositive;
  if (advancing !== null && declining !== null && advancing + declining > 0) {
    return (advancing / (advancing + declining)) * 100;
  }
  return null;
}

export function analyzeParticipationContext(input = {}) {
  const evidence = [];
  const warnings = [];
  const behavioralParticipation = String(input?.behavioral?.participation || '').toUpperCase();
  const consensusState = String(input?.consensus?.consensusState || '').toUpperCase();
  const breadth = readBreadth(input);
  let participationContext = 'NARROW_CONFIRMATION';
  let score = 50;

  // Participation context confirms whether breadth supports the higher-level regime read.
  if (behavioralParticipation.includes('BROAD') || (breadth !== null && breadth >= 62)) {
    participationContext = 'BROAD_CONFIRMATION';
    score = 78;
    evidence.push('Participation is broad enough to confirm the environment.');
  } else if (behavioralParticipation.includes('WEAK') || (breadth !== null && breadth <= 38)) {
    participationContext = 'WEAK_CONFIRMATION';
    score = 38;
    evidence.push('Participation is weak.');
  } else {
    evidence.push('Participation is narrow or mixed.');
  }

  if (
    consensusState.includes('BULLISH')
    && (participationContext === 'WEAK_CONFIRMATION' || participationContext === 'NARROW_CONFIRMATION')
  ) {
    participationContext = 'PARTICIPATION_DIVERGENCE';
    score -= 10;
    warnings.push('Consensus is constructive while participation is not broad.');
    evidence.push('Participation diverges from constructive consensus.');
  }

  if (!behavioralParticipation && breadth === null) {
    score -= 12;
    warnings.push('Participation inputs are limited.');
  }

  return {
    participationContext,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
