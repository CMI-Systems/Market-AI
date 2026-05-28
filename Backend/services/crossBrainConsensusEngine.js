/*
 * Cross-brain consensus engine for Market AI.
 * Evaluates agreement quality between backend brain outputs.
 */

const AWAITING_BRAIN_CONSENSUS = "Awaiting cross-brain consensus cognition.";

function statusOf(brain = {}) {
  return typeof brain.status === "string" ? brain.status.toUpperCase() : "UNKNOWN";
}

function confidenceOf(brain = {}) {
  return typeof brain.confidence === "number" && Number.isFinite(brain.confidence)
    ? brain.confidence
    : 0;
}

function brainName(name, brain = {}) {
  return {
    name,
    status: statusOf(brain),
    confidence: confidenceOf(brain)
  };
}

function agreementStrength(state) {
  return {
    FULL_CONSENSUS: "STRONG",
    PARTIAL_CONSENSUS: "MODERATE",
    CONFLICTED: "WEAK",
    FAILSAFE_PRIORITY: "FRAGMENTED",
    UNSTABLE: "FRAGMENTED",
    UNKNOWN: "UNKNOWN"
  }[state] || "UNKNOWN";
}

function divergenceRisk(state) {
  return {
    FULL_CONSENSUS: "LOW",
    PARTIAL_CONSENSUS: "MODERATE",
    CONFLICTED: "HIGH",
    FAILSAFE_PRIORITY: "SEVERE",
    UNSTABLE: "HIGH",
    UNKNOWN: "UNKNOWN"
  }[state] || "UNKNOWN";
}

function awaitingBrainConsensus() {
  return {
    consensusState: "UNKNOWN",
    agreementStrength: "UNKNOWN",
    divergenceRisk: "UNKNOWN",
    participatingBrains: [],
    warnings: [],
    summary: AWAITING_BRAIN_CONSENSUS
  };
}

function evaluateCrossBrainConsensus(input = {}) {
  const tactical = brainName("Tactical Brain", input.tacticalBrain);
  const behavioral = brainName("Behavioral Brain", input.behavioralBrain || input.behavioralRiskBrain);
  const failsafe = brainName("Failsafe Brain", input.failsafeBrain);
  const participatingBrains = [tactical, behavioral, failsafe];
  const statuses = participatingBrains.map((brain) => brain.status);
  const warnings = [];
  let consensusState = "UNKNOWN";

  if (statuses.every((status) => status === "UNKNOWN")) {
    return awaitingBrainConsensus();
  }

  if (failsafe.status === "ACTIVE") {
    consensusState = "FAILSAFE_PRIORITY";
    warnings.push("Failsafe brain has priority in cross-brain consensus.");
  } else if (statuses.some((status) => status === "DEGRADED")) {
    consensusState = "UNSTABLE";
    warnings.push("At least one brain is degraded.");
  } else if (tactical.status === "OBSERVING" && behavioral.status === "OBSERVING" && failsafe.status === "STANDBY") {
    consensusState = "FULL_CONSENSUS";
  } else if (statuses.filter((status) => status === "OBSERVING" || status === "STANDBY").length >= 2) {
    consensusState = "PARTIAL_CONSENSUS";
    warnings.push("Brain consensus is partial across available cognition.");
  } else {
    consensusState = "CONFLICTED";
    warnings.push("Brain states are conflicted across available cognition.");
  }

  return {
    consensusState,
    agreementStrength: agreementStrength(consensusState),
    divergenceRisk: divergenceRisk(consensusState),
    participatingBrains,
    warnings,
    summary: `${consensusState} across ${participatingBrains.length} backend brain outputs.`
  };
}

module.exports = {
  AWAITING_BRAIN_CONSENSUS,
  awaitingBrainConsensus,
  evaluateCrossBrainConsensus
};
