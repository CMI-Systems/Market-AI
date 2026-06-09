function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function textOf(...sources) {
  return sources.filter(Boolean).join(' ').toUpperCase();
}

export function analyzeConsensusSynthesis(input = {}) {
  const evidence = [];
  const warnings = [];
  const tactical = input?.tactical || {};
  const behavioral = input?.behavioral || {};
  const failsafe = input?.failsafe || {};
  const alignment = input?.alignment || {};
  const tacticalText = textOf(tactical.tacticalState, tactical.trend, tactical.structure);
  const behavioralText = textOf(behavioral.behavioralState, behavioral.riskAppetite, behavioral.rotation);
  const failsafeText = textOf(failsafe.failsafeState, failsafe.riskEscalation, failsafe.reliabilityLabel);
  let consensusState = 'ELEVATED_UNCERTAINTY';
  let score = 50;

  // Synthesis only maps existing Tactical, Behavioral, and Failsafe conclusions into one state.
  if (failsafeText.includes('CRITICAL') || failsafeText.includes('HIGH_RISK') || failsafeText.includes('LOW_RELIABILITY')) {
    consensusState = 'HIGH_RISK_ENVIRONMENT';
    score = 35;
    warnings.push('Failsafe output indicates high risk or low reliability.');
    evidence.push('Failsafe conditions dominate consensus synthesis.');
  } else if (tacticalText.includes('BEARISH') || tacticalText.includes('BREAKDOWN') || behavioralText.includes('RISK_OFF')) {
    consensusState = 'BEARISH_ENVIRONMENT';
    score = 48;
    evidence.push('Tactical or behavioral intelligence indicates bearish pressure.');
  } else if (alignment.direction === 'BULLISH' && alignment.alignment === 'STRONG_ALIGNMENT') {
    consensusState = 'STRONG_BULLISH_ENVIRONMENT';
    score = 85;
    evidence.push('Tactical, behavioral, and failsafe intelligence strongly align bullish.');
  } else if (tacticalText.includes('BULLISH') && behavioralText.includes('RISK_ON')) {
    consensusState = 'RISK_ON_EXPANSION';
    score = 76;
    evidence.push('Bullish tactical conditions align with risk-on behavior.');
  } else if (tacticalText.includes('BULLISH') && failsafeText.includes('ELEVATED')) {
    consensusState = 'BULLISH_BUT_CAUTIOUS';
    score = 66;
    evidence.push('Tactical conditions are bullish, but failsafe uncertainty tempers the read.');
  } else if (tacticalText.includes('BULLISH') && behavioralText.includes('DEFENSIVE')) {
    consensusState = 'DEFENSIVE_BULLISH';
    score = 62;
    evidence.push('Bullish tactical conditions are paired with defensive participation.');
  } else if (alignment.direction === 'NEUTRAL') {
    consensusState = 'NEUTRAL_ENVIRONMENT';
    score = 55;
    evidence.push('Available intelligence is mostly neutral.');
  } else {
    evidence.push('Available intelligence is mixed, so uncertainty remains elevated.');
  }

  return {
    synthesis: consensusState,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
