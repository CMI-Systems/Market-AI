const AWAITING_SCALING_INFRASTRUCTURE = "Awaiting scaling infrastructure.";

function buildInfrastructureScaling(input = {}) {
  const metrics = {
    operatorLoad: Number(input.operatorLoad || 0),
    cognitionLoad: Number(input.cognitionLoad || 0),
    replayLoad: Number(input.replayLoad || 0),
    archiveLoad: Number(input.archiveLoad || 0),
    memoryPressure: Number(input.memoryPressure || 0),
    websocketPressure: Number(input.websocketPressure || 0),
    synchronizationLoad: Number(input.synchronizationLoad || 0)
  };
  const maxPressure = Math.max(...Object.values(metrics));
  let scalingState = "STABLE";
  if (maxPressure >= 90) scalingState = "CRITICAL";
  else if (maxPressure >= 70) scalingState = "HIGH_LOAD";
  else if (maxPressure >= 45) scalingState = "ELEVATED";

  return {
    scalingState,
    scalingMetrics: metrics,
    infrastructurePressure: maxPressure,
    warnings: scalingState === "CRITICAL" ? ["Infrastructure pressure is critical."] : [],
    summary: `${scalingState} infrastructure scaling posture.`
  };
}

module.exports = {
  AWAITING_SCALING_INFRASTRUCTURE,
  buildInfrastructureScaling
};
