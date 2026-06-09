const LEADERSHIP_MAP = {
  growth: 'GROWTH_LEADERSHIP',
  value: 'VALUE_LEADERSHIP',
  defensive: 'DEFENSIVE_LEADERSHIP',
  commodity: 'COMMODITY_LEADERSHIP',
  bond: 'BOND_LEADERSHIP',
  international: 'INTERNATIONAL_LEADERSHIP',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function collectReturns(input) {
  const sources = [
    input?.marketIntelligence?.leadership,
    input?.marketPulse?.leadership,
    input?.globalScan?.leadership,
    input?.crossAssetData?.leadership,
    input?.crossAssetData?.assetReturns,
    input?.marketIntelligence?.sectorReturns,
  ];

  return sources.reduce((returns, source) => {
    if (!source || typeof source !== 'object') return returns;
    Object.entries(source).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      const number = toNumber(value?.returnPct ?? value?.performance ?? value);
      if (number !== null) returns[normalizedKey] = number;
    });
    return returns;
  }, {});
}

export function analyzeLeadership(input = {}) {
  const evidence = [];
  const returns = collectReturns(input);
  const candidates = Object.entries(LEADERSHIP_MAP)
    .map(([key, leadership]) => ({ key, leadership, value: returns[key] }))
    .filter((candidate) => candidate.value !== undefined);

  if (!candidates.length) {
    return {
      leadership: 'NO_CLEAR_LEADERSHIP',
      quality: 'WEAK',
      score: 35,
      evidence: ['Leadership context is unavailable, so no clear leadership is assigned.'],
    };
  }

  candidates.sort((a, b) => b.value - a.value);
  const leader = candidates[0];
  const runnerUp = candidates[1];
  const separation = runnerUp ? leader.value - runnerUp.value : Math.abs(leader.value);
  const score = clampScore(45 + Math.max(0, leader.value) * 6 + Math.max(0, separation) * 8);
  const quality = score >= 75 ? 'STRONG' : score >= 55 ? 'MODERATE' : 'WEAK';

  evidence.push(`${leader.key} is the strongest available leadership group.`);
  if (runnerUp) {
    evidence.push(`Leadership separation versus ${runnerUp.key} is ${separation.toFixed(2)} percentage points.`);
  } else {
    evidence.push('Only one leadership comparison group is available.');
  }

  return {
    leadership: score < 45 ? 'NO_CLEAR_LEADERSHIP' : leader.leadership,
    quality,
    score,
    evidence,
  };
}
