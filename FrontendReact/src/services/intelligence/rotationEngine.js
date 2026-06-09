const ROTATION_MAP = {
  growth: 'GROWTH_ROTATION',
  value: 'VALUE_ROTATION',
  defensive: 'DEFENSIVE_ROTATION',
  bond: 'BOND_ROTATION',
  commodity: 'COMMODITY_ROTATION',
  international: 'INTERNATIONAL_ROTATION',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeRotationKey(key) {
  return String(key).replace(/[_\s-]/g, '').toLowerCase();
}

function collectRotation(input) {
  const sources = [
    input?.marketPulse?.rotation,
    input?.marketIntelligence?.rotation,
    input?.globalScan?.rotation,
    input?.crossAssetData?.rotation,
    input?.crossAssetData?.assetReturns,
  ];

  return sources.reduce((rotation, source) => {
    if (!source || typeof source !== 'object') return rotation;
    Object.entries(source).forEach(([key, value]) => {
      const number = toNumber(value?.flowScore ?? value?.returnPct ?? value?.changePct ?? value);
      if (number !== null) rotation[normalizeRotationKey(key)] = number;
    });
    return rotation;
  }, {});
}

export function analyzeRotation(input = {}) {
  const evidence = [];
  const rotation = collectRotation(input);
  const riskOnScore = toNumber(rotation.riskon);
  const safetyScore = toNumber(rotation.safety ?? rotation.riskoff);

  // Rotation is read from explicit flow groups first, with risk/safety as higher-level overrides.
  if (riskOnScore !== null && riskOnScore >= 65) {
    evidence.push('Risk-on rotation score is elevated.');
    return { rotation: 'RISK_ROTATION', score: clampScore(riskOnScore), evidence };
  }

  if (safetyScore !== null && safetyScore >= 65) {
    evidence.push('Safety rotation score is elevated.');
    return { rotation: 'SAFETY_ROTATION', score: clampScore(safetyScore), evidence };
  }

  const candidates = Object.entries(ROTATION_MAP)
    .map(([key, label]) => ({ key, label, value: rotation[key] }))
    .filter((candidate) => candidate.value !== undefined);

  if (!candidates.length) {
    evidence.push('Rotation context is unavailable, defaulting to safety rotation.');
    return { rotation: 'SAFETY_ROTATION', score: 35, evidence };
  }

  candidates.sort((a, b) => b.value - a.value);
  const leader = candidates[0];
  const runnerUp = candidates[1];
  const separation = runnerUp ? leader.value - runnerUp.value : Math.abs(leader.value);
  const score = clampScore(45 + Math.max(0, leader.value) * 5 + Math.max(0, separation) * 6);

  evidence.push(`${leader.key} has the strongest rotation reading.`);
  if (runnerUp) evidence.push(`Rotation separation versus ${runnerUp.key} is ${separation.toFixed(2)} points.`);

  return {
    rotation: leader.label,
    score,
    evidence,
  };
}
