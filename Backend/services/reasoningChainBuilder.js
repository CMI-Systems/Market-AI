/*
 * Reasoning chain builder for Market AI.
 * Produces hierarchical operator-facing chains from existing backend cognition.
 */

const AWAITING_REASONING_CHAINS = "Awaiting reasoning chains.";

function addChain(chains, title, severity, steps, stabilization, confidenceImpact) {
  chains.push({
    title,
    severity,
    steps,
    stabilization,
    confidenceImpact
  });
}

function evaluateReasoningChains(input = {}) {
  const confidence = input.confidenceProfile || {};
  const adaptiveSignals = input.adaptiveSignalIntelligence || {};
  const replay = input.temporalSequence || {};
  const ecosystem = input.crossSymbolEcosystem || {};
  const consensus = input.crossBrainConsensus || {};
  const liquidity = input.liquidityPressure || {};
  const explainability = input.explainabilityReasons || {};
  const chains = [];
  const warnings = [];

  if (!confidence.level && !adaptiveSignals.signalState && !ecosystem.ecosystemState) {
    return {
      chainState: "LIMITED",
      chains: [],
      dominantChain: null,
      warnings: [],
      summary: AWAITING_REASONING_CHAINS
    };
  }

  if (["LOW", "AVOID"].includes(confidence.level)) {
    addChain(
      chains,
      "Confidence weakened",
      confidence.level === "AVOID" ? "HIGH" : "MODERATE",
      [
        "Confidence profile constrained",
        replay.sequenceState ? `Replay sequence ${replay.sequenceState}` : "Replay context limited",
        ecosystem.ecosystemState ? `Ecosystem state ${ecosystem.ecosystemState}` : "Ecosystem context limited",
        adaptiveSignals.suppressionLevel ? `Suppression level ${adaptiveSignals.suppressionLevel}` : "Suppression context limited"
      ],
      liquidity.liquidityState === "STABILIZING" ? "Liquidity stabilization is visible." : "Stabilization evidence is limited.",
      "REDUCED"
    );
  }

  if (["SUPPRESSED", "UNSTABLE", "CONFLICTED"].includes(adaptiveSignals.signalState)) {
    addChain(
      chains,
      "Suppression escalated",
      adaptiveSignals.suppressionLevel === "SEVERE" ? "HIGH" : "MODERATE",
      [
        `Adaptive state ${adaptiveSignals.signalState}`,
        `Coherence ${adaptiveSignals.coherenceLevel || "UNKNOWN"}`,
        `Consensus ${consensus.consensusState || "UNKNOWN"}`,
        `Liquidity ${liquidity.liquidityState || "UNKNOWN"}`
      ],
      "Suppression can stabilize when consensus and liquidity normalize.",
      "CONSTRAINED"
    );
  }

  if (["ESCALATING", "UNSTABLE_SEQUENCE"].includes(replay.sequenceState)) {
    addChain(
      chains,
      "Replay instability increased",
      "HIGH",
      [
        `Sequence state ${replay.sequenceState}`,
        `Progression momentum ${replay.progressionMomentum || "UNKNOWN"}`,
        `Causality ${input.environmentalCausality?.causalityState || "UNKNOWN"}`,
        "Replay continuity requires operator inspection"
      ],
      "Cooling sequence behavior would reduce replay pressure.",
      "REDUCED"
    );
  }

  if (["FRAGMENTED", "DIVERGENT"].includes(ecosystem.ecosystemState)) {
    addChain(
      chains,
      "Ecosystem synchronization fragmented",
      ecosystem.ecosystemState === "DIVERGENT" ? "HIGH" : "MODERATE",
      [
        `Ecosystem state ${ecosystem.ecosystemState}`,
        `Correlation strength ${ecosystem.correlationStrength || "UNKNOWN"}`,
        `Consensus ${consensus.consensusState || "UNKNOWN"}`,
        "Cross-symbol agreement weakened"
      ],
      "Synchronization recovery would improve confidence quality.",
      "REDUCED"
    );
  }

  if (["REINFORCED", "ALIGNED"].includes(adaptiveSignals.signalState)) {
    addChain(
      chains,
      "Reinforcement supported cognition",
      "LOW",
      [
        `Adaptive state ${adaptiveSignals.signalState}`,
        `Consensus ${consensus.consensusState || "UNKNOWN"}`,
        `Liquidity ${liquidity.liquidityState || "UNKNOWN"}`,
        "Backend coherence checks support cognition quality"
      ],
      "Current reinforcement remains advisory and does not alter backend decisions.",
      "SUPPORTED"
    );
  }

  if (["CONFLICTED", "FAILSAFE_PRIORITY", "UNSTABLE"].includes(consensus.consensusState)) {
    addChain(
      chains,
      "Consensus divergence detected",
      consensus.consensusState === "FAILSAFE_PRIORITY" ? "HIGH" : "MODERATE",
      [
        `Consensus ${consensus.consensusState}`,
        `Agreement ${consensus.agreementStrength || "UNKNOWN"}`,
        `Divergence risk ${consensus.divergenceRisk || "UNKNOWN"}`,
        "Brain agreement requires review"
      ],
      "Consensus improves when tactical, behavioral, and failsafe states converge.",
      "CONSTRAINED"
    );
  }

  if (Array.isArray(explainability.warnings) && explainability.warnings.length) {
    warnings.push(...explainability.warnings);
  }

  const dominantChain = chains.slice().sort((a, b) => {
    const rank = { HIGH: 3, MODERATE: 2, LOW: 1 };
    return (rank[b.severity] || 0) - (rank[a.severity] || 0);
  })[0] || null;
  let chainState = "STRUCTURED";
  if (!chains.length) chainState = "LIMITED";
  if (chains.length > 0 && chains.length < 3) chainState = "PARTIAL";
  if (chains.filter((chain) => chain.severity === "HIGH").length >= 3) chainState = "FRAGMENTED";

  return {
    chainState,
    chains,
    dominantChain,
    warnings,
    summary: `${chainState} reasoning chain output with ${chains.length} chains.`
  };
}

module.exports = {
  AWAITING_REASONING_CHAINS,
  evaluateReasoningChains
};
