function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function directionFromTactical(tactical) {
  const text = [
    tactical?.tacticalState,
    tactical?.trend,
    tactical?.structure,
  ].filter(Boolean).join(' ').toUpperCase();

  if (text.includes('BEARISH') || text.includes('BREAKDOWN') || text.includes('FAILURE')) return 'BEARISH';
  if (text.includes('BULLISH') || text.includes('BREAKOUT')) return 'BULLISH';
  return 'NEUTRAL';
}

function directionFromBehavioral(behavioral) {
  const text = [
    behavioral?.behavioralState,
    behavioral?.riskAppetite,
    behavioral?.rotation,
  ].filter(Boolean).join(' ').toUpperCase();

  if (text.includes('RISK_AVERSION') || text.includes('RISK_OFF') || text.includes('DEFENSIVE') || text.includes('SAFETY')) {
    return 'BEARISH';
  }
  if (text.includes('RISK_ON') || text.includes('SPECULATIVE') || text.includes('EXPANSION')) return 'BULLISH';
  return 'NEUTRAL';
}

export function analyzeConflicts(input = {}) {
  const evidence = [];
  const warnings = [];
  const tactical = input?.tactical;
  const behavioral = input?.behavioral;
  const provenance = input?.provenance;
  let score = 90;

  // Conflict detection compares directional conclusions across intelligence layers.
  if (!tactical || typeof tactical !== 'object') {
    score -= 20;
    warnings.push('Tactical intelligence is missing, reducing conflict clarity.');
    evidence.push('Tactical side of conflict check is unavailable.');
  }

  if (!behavioral || typeof behavioral !== 'object') {
    score -= 20;
    warnings.push('Behavioral intelligence is missing, reducing conflict clarity.');
    evidence.push('Behavioral side of conflict check is unavailable.');
  }

  const tacticalDirection = directionFromTactical(tactical);
  const behavioralDirection = directionFromBehavioral(behavioral);

  if (tacticalDirection !== 'NEUTRAL' && behavioralDirection !== 'NEUTRAL' && tacticalDirection !== behavioralDirection) {
    score -= 45;
    warnings.push('Tactical and behavioral conclusions are directionally opposed.');
    evidence.push(`Tactical reads ${tacticalDirection}, while behavioral reads ${behavioralDirection}.`);
  } else if (tacticalDirection === 'NEUTRAL' || behavioralDirection === 'NEUTRAL') {
    score -= 12;
    evidence.push('One intelligence layer is neutral, so alignment is only partial.');
  } else {
    evidence.push(`Tactical and behavioral directions align as ${tacticalDirection}.`);
  }

  const tacticalState = String(tactical?.tacticalState || '').toUpperCase();
  const behavioralState = String(behavioral?.behavioralState || '').toUpperCase();
  if (tacticalState.includes('HIGH_VOLATILITY') && behavioralState.includes('SPECULATIVE')) {
    score -= 18;
    warnings.push('Speculative behavior is present during high volatility.');
    evidence.push('High-volatility tactical context conflicts with speculative behavioral expansion.');
  }

  if (provenance?.status === 'BLOCKED' || provenance?.riskLevel === 'CRITICAL') {
    score -= 55;
    warnings.push('Critical provenance conflict is present.');
    evidence.push(`Provenance conflict blocks trust: ${(provenance.blockingReasons || []).join('; ') || 'untrusted source metadata'}.`);
  }

  const finalScore = clampScore(score);
  const conflict = finalScore >= 75 ? 'NO_CONFLICT' : finalScore >= 55 ? 'MINOR_CONFLICT' : 'MAJOR_CONFLICT';

  return {
    conflict,
    score: finalScore,
    evidence,
    warnings,
  };
}
