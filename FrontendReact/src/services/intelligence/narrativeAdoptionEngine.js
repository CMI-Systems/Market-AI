function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getAdoptionLevel(score) {
  if (score >= 85) return 'VERY_HIGH';
  if (score >= 70) return 'HIGH';
  if (score >= 55) return 'MODERATE';
  if (score >= 40) return 'LOW';
  return 'VERY_LOW';
}

function readNarrative(input) {
  return (
    input?.newsletterData?.dominantNarrative
    ?? input?.newsletterData?.narrative
    ?? input?.marketIntelligence?.dominantNarrative
    ?? input?.globalScan?.dominantNarrative
    ?? 'UNKNOWN_NARRATIVE'
  );
}

export function analyzeNarrativeAdoption(input = {}) {
  const evidence = [];
  const narrative = String(readNarrative(input) || 'UNKNOWN_NARRATIVE').toUpperCase().replace(/\s+/g, '_');
  const adoptionScore = toNumber(
    input?.newsletterData?.adoptionScore
    ?? input?.newsletterData?.narrativeAdoption
    ?? input?.marketIntelligence?.narrativeAdoption
    ?? input?.globalScan?.narrativeAdoption
  );
  const mentionCount = toNumber(input?.newsletterData?.mentionCount ?? input?.globalScan?.narrativeMentions);
  const breadth = toNumber(input?.newsletterData?.symbolBreadth ?? input?.marketIntelligence?.narrativeBreadth);
  let score = 35;

  // This engine measures adoption of a supplied narrative; it does not invent one.
  if (narrative === 'UNKNOWN_NARRATIVE') {
    evidence.push('No supplied narrative context is available.');
  } else {
    score += 15;
    evidence.push(`Supplied narrative context is ${narrative}.`);
  }

  if (adoptionScore !== null) {
    score = adoptionScore;
    evidence.push(`Narrative adoption score is supplied at ${adoptionScore}.`);
  } else {
    if (mentionCount !== null && mentionCount >= 5) {
      score += 20;
      evidence.push('Narrative mention count is elevated.');
    } else if (mentionCount !== null) {
      evidence.push('Narrative mention count is limited.');
    }

    if (breadth !== null && breadth >= 60) {
      score += 20;
      evidence.push('Narrative breadth is broad across symbols or groups.');
    } else if (breadth !== null) {
      evidence.push('Narrative breadth is limited.');
    }
  }

  const finalScore = clampScore(score);
  return {
    narrative,
    adoptionLevel: getAdoptionLevel(finalScore),
    score: finalScore,
    evidence,
  };
}
