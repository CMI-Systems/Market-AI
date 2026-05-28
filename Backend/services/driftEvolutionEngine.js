const AWAITING_DRIFT_EVOLUTION = "Awaiting drift evolution.";

function buildDriftEvolution(input = {}) {
  const entries = Array.isArray(input.memoryEntries) ? input.memoryEntries : [];
  if (entries.length < 3) {
    return {
      driftState: "UNKNOWN",
      driftMetrics: {},
      dominantDrift: null,
      stabilizationSignals: [],
      warnings: [],
      summary: AWAITING_DRIFT_EVOLUTION
    };
  }

  const metrics = {
    lowConfidence: entries.filter((entry) => entry.confidenceLevel === "LOW").length,
    suppression: entries.filter((entry) => ["SUPPRESSED", "UNSTABLE"].includes(entry.suppressionState)).length,
    replayFragmentation: entries.filter((entry) => ["DRIFTING", "UNSTABLE_SEQUENCE", "ESCALATING"].includes(entry.replayState)).length,
    ecosystemDeterioration: entries.filter((entry) => ["FRAGMENTED", "DIVERGENT"].includes(entry.ecosystemState)).length,
    stabilization: entries.filter((entry) => ["STABLE", "RECOVERING", "STABILIZING"].includes(entry.environment)).length,
    reinforcement: entries.filter((entry) => ["MODERATE", "HIGH"].includes(entry.reinforcementLevel)).length
  };
  const dominant = Object.entries(metrics).sort((a, b) => b[1] - a[1])[0];
  const riskTotal = metrics.suppression + metrics.replayFragmentation + metrics.ecosystemDeterioration;
  const driftState = riskTotal >= entries.length ? "DETERIORATING" : metrics.stabilization >= riskTotal ? "STABILIZING" : "EVOLVING";

  return {
    driftState,
    driftMetrics: metrics,
    dominantDrift: dominant ? { type: dominant[0], count: dominant[1] } : null,
    stabilizationSignals: metrics.stabilization ? [`${metrics.stabilization} stabilization entries retained.`] : [],
    warnings: driftState === "DETERIORATING" ? ["Persistent memory shows elevated drift pressure."] : [],
    summary: `${driftState} long-term cognition drift across ${entries.length} entries.`
  };
}

module.exports = {
  AWAITING_DRIFT_EVOLUTION,
  buildDriftEvolution
};
