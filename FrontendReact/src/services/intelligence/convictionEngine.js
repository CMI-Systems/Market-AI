function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function labelConviction(score) {
  if (score >= 85) return 'VERY_HIGH_CONVICTION';
  if (score >= 70) return 'HIGH_CONVICTION';
  if (score >= 55) return 'MODERATE_CONVICTION';
  if (score >= 40) return 'LOW_CONVICTION';
  return 'VERY_LOW_CONVICTION';
}

export function analyzeConviction(input = {}) {
  const participation = input?.participation;
  const leadership = input?.leadership;
  const rotation = input?.rotation;
  const riskAppetite = input?.riskAppetite;
  const evidence = [];
  const scores = [
    participation?.score,
    leadership?.score,
    rotation?.score,
    riskAppetite?.score,
  ].filter((score) => Number.isFinite(Number(score))).map(Number);

  if (!scores.length) {
    return {
      conviction: 'VERY_LOW_CONVICTION',
      score: 30,
      evidence: ['Conviction inputs are unavailable, so conviction is low.'],
    };
  }

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  let alignmentBonus = 0;

  // Conviction rises when participation, leadership, rotation, and risk appetite point together.
  if (
    riskAppetite?.riskAppetite?.includes('RISK_ON')
    && ['BROAD_PARTICIPATION', 'EXPANDING_PARTICIPATION'].includes(participation?.participation)
    && ['GROWTH_LEADERSHIP', 'COMMODITY_LEADERSHIP'].includes(leadership?.leadership)
  ) {
    alignmentBonus = 10;
    evidence.push('Risk-on behavior is aligned across participation, leadership, and appetite.');
  } else if (
    ['RISK_OFF', 'DEFENSIVE_RISK_OFF'].includes(riskAppetite?.riskAppetite)
    && ['SAFETY_ROTATION', 'DEFENSIVE_ROTATION', 'BOND_ROTATION'].includes(rotation?.rotation)
  ) {
    alignmentBonus = 10;
    evidence.push('Risk-off behavior is aligned across rotation and appetite.');
  } else {
    evidence.push('Behavioral inputs are only partially aligned.');
  }

  const score = clampScore(averageScore + alignmentBonus);

  return {
    conviction: labelConviction(score),
    score,
    evidence,
  };
}
