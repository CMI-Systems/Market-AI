const PARTICIPATION = {
  BROAD_PARTICIPATION: 'BROAD_PARTICIPATION',
  NARROW_PARTICIPATION: 'NARROW_PARTICIPATION',
  EXPANDING_PARTICIPATION: 'EXPANDING_PARTICIPATION',
  CONTRACTING_PARTICIPATION: 'CONTRACTING_PARTICIPATION',
  WEAK_PARTICIPATION: 'WEAK_PARTICIPATION',
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function readBreadth(input) {
  const breadth = input?.marketPulse?.breadth ?? input?.marketIntelligence?.breadth ?? {};
  const advancing = toNumber(breadth.advancing ?? breadth.advancers ?? breadth.up);
  const declining = toNumber(breadth.declining ?? breadth.decliners ?? breadth.down);
  const percentPositive = toNumber(breadth.percentPositive ?? breadth.positivePercent ?? breadth.advancePercent);

  if (percentPositive !== null) return percentPositive;
  if (advancing !== null && declining !== null && advancing + declining > 0) {
    return (advancing / (advancing + declining)) * 100;
  }
  return null;
}

function readVolumeRatio(input) {
  return toNumber(
    input?.marketPulse?.volumeRatio
    ?? input?.marketIntelligence?.volumeRatio
    ?? input?.globalScan?.volumeRatio
  );
}

function readInstitutionalSignal(input) {
  return toNumber(
    input?.marketIntelligence?.institutionalFlow
    ?? input?.marketPulse?.institutionalFlow
    ?? input?.crossAssetData?.institutionalFlow
  );
}

function readRetailSignal(input) {
  return toNumber(
    input?.marketIntelligence?.retailActivity
    ?? input?.marketPulse?.retailActivity
    ?? input?.newsletterData?.retailInterest
  );
}

export function analyzeParticipation(input = {}) {
  const evidence = [];
  const breadth = readBreadth(input);
  const volumeRatio = readVolumeRatio(input);
  const institutionalSignal = readInstitutionalSignal(input);
  const retailSignal = readRetailSignal(input);
  let score = 45;

  // Participation is anchored on breadth first, then confirmed by volume and flow proxies.
  if (breadth === null) {
    evidence.push('Breadth context is unavailable, so participation clarity is reduced.');
  } else if (breadth >= 65) {
    score += 25;
    evidence.push(`Breadth is broad with ${breadth.toFixed(1)}% positive participation.`);
  } else if (breadth >= 52) {
    score += 12;
    evidence.push(`Breadth is constructive with ${breadth.toFixed(1)}% positive participation.`);
  } else if (breadth <= 35) {
    score -= 22;
    evidence.push(`Breadth is weak with only ${breadth.toFixed(1)}% positive participation.`);
  } else {
    score -= 5;
    evidence.push(`Breadth is mixed at ${breadth.toFixed(1)}% positive participation.`);
  }

  if (volumeRatio === null) {
    evidence.push('Volume ratio is unavailable.');
  } else if (volumeRatio >= 1.2) {
    score += 15;
    evidence.push('Volume is expanding versus baseline.');
  } else if (volumeRatio <= 0.75) {
    score -= 15;
    evidence.push('Volume is contracting versus baseline.');
  } else {
    evidence.push('Volume is near baseline.');
  }

  const institutionalParticipation = institutionalSignal === null
    ? 'MODERATE_INSTITUTIONAL'
    : institutionalSignal >= 70
      ? 'HIGH_INSTITUTIONAL'
      : institutionalSignal <= 35
        ? 'LOW_INSTITUTIONAL'
        : 'MODERATE_INSTITUTIONAL';

  const retailParticipation = retailSignal === null
    ? 'MODERATE_RETAIL'
    : retailSignal >= 70
      ? 'HIGH_RETAIL'
      : retailSignal <= 35
        ? 'LOW_RETAIL'
        : 'MODERATE_RETAIL';

  evidence.push(`Institutional participation reads as ${institutionalParticipation.replace(/_/g, ' ').toLowerCase()}.`);
  evidence.push(`Retail participation reads as ${retailParticipation.replace(/_/g, ' ').toLowerCase()}.`);

  const finalScore = clampScore(score);
  let participation = PARTICIPATION.NARROW_PARTICIPATION;
  if (breadth !== null && breadth >= 65 && volumeRatio !== null && volumeRatio >= 1) {
    participation = PARTICIPATION.BROAD_PARTICIPATION;
  } else if (volumeRatio !== null && volumeRatio >= 1.2 && finalScore >= 58) {
    participation = PARTICIPATION.EXPANDING_PARTICIPATION;
  } else if (volumeRatio !== null && volumeRatio <= 0.75) {
    participation = PARTICIPATION.CONTRACTING_PARTICIPATION;
  } else if (finalScore <= 35) {
    participation = PARTICIPATION.WEAK_PARTICIPATION;
  }

  return {
    participation,
    institutionalParticipation,
    retailParticipation,
    score: finalScore,
    evidence,
  };
}
