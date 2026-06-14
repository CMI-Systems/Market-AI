import { mergeProvenance } from './provenanceValidator.js';

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
  return [
    'OFFLINE',
    'ERROR',
    'FAILED',
    'DEGRADED',
    'STALE',
    'DISCONNECTED',
    'UNAVAILABLE',
    'PROVIDER_OFFLINE',
    'BACKEND_UNAVAILABLE',
    'DATA_UNAVAILABLE',
    'UNKNOWN_SOURCE',
    'INVALID_TIMESTAMP',
    'PARTIAL_DATA',
  ].includes(
    String(status || '').toUpperCase(),
  );
}

function isUnavailableStream(stream) {
  const sourceType = String(stream?.sourceType || '').toUpperCase();
  return (
    stream?.available === false
    || stream?.simulated === true
    || stream?.generated === true
    || isBadStatus(sourceType)
  );
}

export function analyzeDataIntegrity(input = {}) {
  const evidence = [];
  const warnings = [];
  const streams = normalizeStreams(input?.dataStreams);
  const provenance = input?.provenance || mergeProvenance([
    ...streams,
    input?.marketIntelligence,
    input?.globalScan,
    input?.tactical,
    input?.behavioral,
  ], { requireAll: false, timestampRequired: false });
  let score = 70;

  // Data integrity focuses on feed availability, health, staleness, and explicit stream warnings.
  if (!streams.length) {
    warnings.push('Data streams are missing.');
    evidence.push('No data stream health context is available.');
    score -= 35;
  } else {
    const healthyCount = streams.filter((stream) => isHealthyStatus(stream.status ?? stream.health ?? stream.state)).length;
    const badCount = streams.filter((stream) =>
      isBadStatus(stream.status ?? stream.health ?? stream.state) || isUnavailableStream(stream)
    ).length;
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

  if (provenance.status === 'BLOCKED') {
    score -= provenance.riskLevel === 'CRITICAL' ? 60 : 45;
    warnings.push('Critical provenance issue blocks raw-data trust.');
    evidence.push(`Provenance blocked: ${provenance.blockingReasons.join('; ') || 'untrusted source metadata'}.`);
  } else if (provenance.status === 'DATA_UNAVAILABLE') {
    score -= 35;
    warnings.push('Required provenance indicates data unavailable.');
    evidence.push('Provenance reports unavailable market data.');
  } else if (provenance.status === 'DEGRADED') {
    score -= 18;
    warnings.push('Provenance is degraded and requires limited trust.');
    evidence.push(`Provenance is degraded with source type ${provenance.sourceType}.`);
  }

  if (provenance.rawDataCertified === false) {
    evidence.push('Raw-data certification remains false pending O.6.');
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
