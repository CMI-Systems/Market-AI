function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getIntensity(score) {
  if (score >= 85) return 'VERY_HIGH';
  if (score >= 70) return 'HIGH';
  if (score >= 55) return 'MODERATE';
  if (score >= 40) return 'LOW';
  return 'VERY_LOW';
}

export function analyzeRiskAppetite(input = {}) {
  const participation = input?.participation;
  const leadership = input?.leadership;
  const rotation = input?.rotation;
  const evidence = [];
  let score = 50;

  // Risk appetite derives from participant breadth, leadership type, and rotation direction.
  if (participation?.participation === 'BROAD_PARTICIPATION' || participation?.participation === 'EXPANDING_PARTICIPATION') {
    score += 18;
    evidence.push('Participation is broad or expanding, supporting risk appetite.');
  } else if (participation?.participation === 'WEAK_PARTICIPATION' || participation?.participation === 'CONTRACTING_PARTICIPATION') {
    score -= 18;
    evidence.push('Participation is weak or contracting, reducing risk appetite.');
  } else {
    evidence.push('Participation is mixed or narrow.');
  }

  if (leadership?.leadership === 'GROWTH_LEADERSHIP' || leadership?.leadership === 'COMMODITY_LEADERSHIP') {
    score += 14;
    evidence.push('Leadership is tilted toward risk-seeking groups.');
  } else if (leadership?.leadership === 'DEFENSIVE_LEADERSHIP' || leadership?.leadership === 'BOND_LEADERSHIP') {
    score -= 16;
    evidence.push('Leadership is defensive or bond-led.');
  } else {
    evidence.push('Leadership does not strongly confirm risk appetite.');
  }

  if (rotation?.rotation === 'RISK_ROTATION' || rotation?.rotation === 'GROWTH_ROTATION') {
    score += 18;
    evidence.push('Rotation is moving toward risk assets.');
  } else if (rotation?.rotation === 'SAFETY_ROTATION' || rotation?.rotation === 'DEFENSIVE_ROTATION' || rotation?.rotation === 'BOND_ROTATION') {
    score -= 18;
    evidence.push('Rotation is moving toward safety assets.');
  } else {
    evidence.push('Rotation is not strongly risk-on or risk-off.');
  }

  const finalScore = clampScore(score);
  const riskAppetite = finalScore >= 85
    ? 'AGGRESSIVE_RISK_ON'
    : finalScore >= 65
      ? 'RISK_ON'
      : finalScore >= 45
        ? 'NEUTRAL'
        : finalScore >= 25
          ? 'RISK_OFF'
          : 'DEFENSIVE_RISK_OFF';

  return {
    riskAppetite,
    intensity: getIntensity(finalScore),
    score: finalScore,
    evidence,
  };
}
