function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeStreams(dataStreams) {
  if (Array.isArray(dataStreams)) return dataStreams;
  if (dataStreams && typeof dataStreams === 'object') {
    return Object.entries(dataStreams).map(([name, value]) => ({
      name,
      ...(value && typeof value === 'object' ? value : { status: value }),
    }));
  }
  return [];
}

function isHealthyStatus(status) {
  return ['ACTIVE', 'CONNECTED', 'HEALTHY', 'OK', 'LIVE', 'STABLE'].includes(String(status || '').toUpperCase());
}

function isBadStatus(status) {
  return ['OFFLINE', 'ERROR', 'FAILED', 'DEGRADED', 'STALE', 'DISCONNECTED', 'UNAVAILABLE'].includes(
    String(status || '').toUpperCase(),
  );
}

export function analyzeDataIntegrity(input = {}) {
  const evidence = [];
  const warnings = [];
  const streams = normalizeStreams(input?.dataStreams);
  let score = 70;

  // Data integrity focuses on feed availability, health, staleness, and explicit stream warnings.
  if (!streams.length) {
    warnings.push('Data streams are missing.');
    evidence.push('No data stream health context is available.');
    score -= 35;
  } else {
    const healthyCount = streams.filter((stream) => isHealthyStatus(stream.status ?? stream.health ?? stream.state)).length;
    const badCount = streams.filter((stream) => isBadStatus(stream.status ?? stream.health ?? stream.state)).length;
    const warningCount = streams.reduce((count, stream) => {
      if (Array.isArray(stream.warnings)) return count + stream.warnings.length;
      return stream.warning ? count + 1 : count;
    }, 0);
    const staleCount = streams.filter((stream) => {
      const ageSeconds = toNumber(stream.ageSeconds ?? stream.stalenessSeconds ?? stream.latencySeconds);
      return ageSeconds !== null && ageSeconds > 120;
    }).length;

    score += healthyCount * 5;
    score -= badCount * 18;
    score -= warningCount * 8;
    score -= staleCount * 12;
    evidence.push(`${healthyCount} of ${streams.length} data streams report healthy status.`);

    if (badCount) warnings.push(`${badCount} data stream(s) report degraded or failed status.`);
    if (staleCount) warnings.push(`${staleCount} data stream(s) appear stale.`);
    if (warningCount) warnings.push(`${warningCount} stream warning(s) are present.`);
  }

  const qualityScore = toNumber(input?.marketIntelligence?.dataQuality ?? input?.globalScan?.dataQuality);
  if (qualityScore !== null) {
    score = (score + qualityScore) / 2;
    evidence.push(`External data quality score is ${qualityScore}.`);
  }

  const finalScore = clampScore(score);
  const dataIntegrity = finalScore >= 70 ? 'HEALTHY' : finalScore >= 40 ? 'DEGRADED' : 'COMPROMISED';

  return {
    dataIntegrity,
    score: finalScore,
    evidence,
    warnings,
  };
}
