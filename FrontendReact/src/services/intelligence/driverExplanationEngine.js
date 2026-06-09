function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function addDriver(drivers, evidence, label, value) {
  if (!value) return;
  drivers.push(`${label}: ${String(value).replace(/_/g, ' ')}`);
  evidence.push(`${label} driver is ${value}.`);
}

export function generateDriverExplanation(input = {}) {
  const evidence = [];
  const warnings = [];
  const keyDrivers = [];
  let score = 40;

  // Drivers are pulled from supplied engine outputs only.
  addDriver(keyDrivers, evidence, 'Tactical', input?.tactical?.tacticalState);
  addDriver(keyDrivers, evidence, 'Momentum', input?.tactical?.momentum);
  addDriver(keyDrivers, evidence, 'Participation', input?.behavioral?.participation);
  addDriver(keyDrivers, evidence, 'Leadership', input?.behavioral?.leadership);
  addDriver(keyDrivers, evidence, 'Consensus', input?.consensus?.consensusState);
  addDriver(keyDrivers, evidence, 'Regime', input?.regime?.regime);

  const suppliedDrivers = input?.marketIntelligence?.drivers ?? input?.globalScan?.drivers;
  if (Array.isArray(suppliedDrivers)) {
    suppliedDrivers.slice(0, 4).forEach((driver) => {
      if (driver) {
        keyDrivers.push(String(driver));
        evidence.push(`Supplied market driver: ${driver}.`);
      }
    });
  }

  if (!keyDrivers.length) {
    warnings.push('No clear supplied drivers are available.');
    keyDrivers.push('Limited validated driver context');
  } else {
    score += Math.min(45, keyDrivers.length * 8);
  }

  const explanation = `The main areas of strength and themes gaining traction are ${keyDrivers.join('; ')}. These drivers describe the current intelligence context without implying a specific action.`;

  return {
    keyDrivers,
    explanation,
    score: clampScore(score),
    evidence,
    warnings,
  };
}
