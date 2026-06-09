function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function analyzeEnvironmentClassification(input = {}) {
  const evidence = [];
  const warnings = [];
  const tacticalText = [
    input?.tactical?.tacticalState,
    input?.tactical?.trend,
    input?.tactical?.structure,
  ].filter(Boolean).join(' ').toUpperCase();
  const behavioralText = [
    input?.behavioral?.behavioralState,
    input?.behavioral?.riskAppetite,
    input?.behavioral?.participation,
  ].filter(Boolean).join(' ').toUpperCase();
  const failsafeText = [
    input?.failsafe?.failsafeState,
    input?.failsafe?.riskEscalation,
  ].filter(Boolean).join(' ').toUpperCase();
  const consensusText = String(input?.consensus?.consensusState || '').toUpperCase();
  const pulseTrend = toNumber(input?.marketPulse?.trendScore ?? input?.globalScan?.trendScore);
  let regime = 'TRANSITION';
  let score = 50;

  // Environment classification consumes all intelligence layers plus market pulse/global scan context.
  if (failsafeText.includes('CRITICAL') || failsafeText.includes('HIGH_RISK') || consensusText.includes('HIGH_RISK')) {
    regime = 'CRISIS';
    score = 82;
    warnings.push('Failsafe or consensus indicates a high-risk environment.');
    evidence.push('High-risk failsafe/consensus context classifies the regime as crisis.');
  } else if (tacticalText.includes('BULLISH') && behavioralText.includes('RISK_ON') && consensusText.includes('BULLISH')) {
    regime = 'EXPANSION';
    score = 84;
    evidence.push('Bullish tactical, risk-on behavioral, and bullish consensus conditions align.');
  } else if (tacticalText.includes('BULLISH') && behavioralText.includes('BROAD')) {
    regime = 'ACCUMULATION';
    score = 74;
    evidence.push('Constructive tactical conditions are supported by broad participation.');
  } else if (tacticalText.includes('COMPRESSION') || consensusText.includes('NEUTRAL')) {
    regime = 'COMPRESSION';
    score = 64;
    evidence.push('Compression or neutral consensus context is present.');
  } else if (tacticalText.includes('BEARISH') || behavioralText.includes('RISK_OFF') || consensusText.includes('BEARISH')) {
    regime = 'DISTRIBUTION';
    score = 68;
    evidence.push('Bearish or risk-off intelligence classifies the environment as distribution.');
  } else if (consensusText.includes('UNCERTAINTY') && pulseTrend !== null && pulseTrend > 45) {
    regime = 'RECOVERY';
    score = 58;
    evidence.push('Uncertain consensus is paired with improving pulse trend.');
  } else {
    evidence.push('Inputs are mixed, so the environment remains transitional.');
  }

  if (pulseTrend !== null) {
    score = (score + Math.max(35, Math.min(90, pulseTrend))) / 2;
    evidence.push(`Market pulse trend score is ${pulseTrend}.`);
  }

  if (!tacticalText || !behavioralText || !failsafeText || !consensusText) {
    score -= 10;
    warnings.push('One or more required intelligence layers are missing or incomplete.');
  }

  return {
    regime,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
