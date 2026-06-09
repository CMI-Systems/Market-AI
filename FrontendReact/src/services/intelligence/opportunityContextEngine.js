function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

export function generateOpportunityContext(input = {}) {
  const evidence = [];
  const warnings = [];
  const areasOfStrength = [];
  const themesToMonitor = [];
  let score = 45;

  // Opportunity context names areas of strength and themes to monitor, not recommendations.
  if (String(input?.tactical?.trend || '').toUpperCase() === 'BULLISH') {
    addUnique(areasOfStrength, 'constructive tactical trend');
    evidence.push('Tactical trend is constructive.');
    score += 12;
  }

  if (String(input?.behavioral?.participation || '').toUpperCase().includes('BROAD')) {
    addUnique(areasOfStrength, 'broad participation');
    evidence.push('Behavioral participation is broad.');
    score += 12;
  }

  if (String(input?.consensus?.consensusState || '').toUpperCase().includes('BULLISH')) {
    addUnique(areasOfStrength, 'constructive consensus');
    evidence.push('Consensus is constructive.');
    score += 10;
  }

  if (String(input?.regime?.regime || '').toUpperCase() === 'EXPANSION') {
    addUnique(areasOfStrength, 'expansion regime');
    evidence.push('Regime is classified as expansion.');
    score += 10;
  }

  if (input?.newsletterData?.dominantNarrative) {
    addUnique(themesToMonitor, String(input.newsletterData.dominantNarrative));
    evidence.push(`Supplied narrative theme is ${input.newsletterData.dominantNarrative}.`);
  }

  if (String(input?.failsafe?.reliabilityLabel || '').toUpperCase().includes('LOW')) {
    addUnique(themesToMonitor, 'failsafe reliability');
    warnings.push('Low reliability limits opportunity context clarity.');
    score -= 15;
  }

  if (!areasOfStrength.length) {
    areasOfStrength.push('no validated area of strength yet');
    warnings.push('No clear areas of strength are currently validated.');
  }

  if (!themesToMonitor.length) {
    themesToMonitor.push('participation breadth', 'risk escalation', 'consensus stability');
  }

  return {
    opportunityContext: `Areas of strength include ${areasOfStrength.join(', ')}. Themes to monitor include ${themesToMonitor.join(', ')}.`,
    areasOfStrength,
    themesToMonitor,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
