/*
 * Explainability reason engine for Market AI.
 * Builds deterministic reasoning chains from backend cognition state.
 */

const AWAITING_EXPLAINABILITY = "Awaiting explainability cognition.";

function addChain(chains, factor, reason, effect) {
  chains.push({ factor, reason, effect });
}

function evaluateExplainabilityReasons(input = {}) {
  const confidence = input.confidenceProfile || {};
  const adaptiveSignals = input.adaptiveSignalIntelligence || {};
  const consensus = input.crossBrainConsensus || {};
  const liquidity = input.liquidityPressure || {};
  const ecosystem = input.crossSymbolEcosystem || {};
  const regime = input.regimeTransition || {};
  const temporalSequence = input.temporalSequence || {};
  const causality = input.environmentalCausality || {};
  const warnings = [];
  const reasoningChains = [];
  const dominantFactors = [];
  const suppressionReasons = [];
  const reinforcementReasons = [];

  if (!confidence.level && !adaptiveSignals.signalState && !consensus.consensusState) {
    return {
      explainabilityState: "LIMITED",
      reasoningChains: [],
      dominantFactors: [],
      suppressionReasons: [],
      reinforcementReasons: [],
      warnings: [],
      summary: AWAITING_EXPLAINABILITY
    };
  }

  if (confidence.level === "LOW" || confidence.level === "AVOID") {
    addChain(reasoningChains, "Confidence", "Confidence profile is constrained.", "Cognition confidence is reduced.");
    dominantFactors.push("Confidence constraint");
  }

  if (["SUPPRESSED", "UNSTABLE", "CONFLICTED"].includes(adaptiveSignals.signalState)) {
    const reason = "Adaptive signal validation is constrained by backend coherence checks.";
    addChain(reasoningChains, "Suppression", reason, `${adaptiveSignals.signalState} signal validation.`);
    suppressionReasons.push(reason);
  }

  if (["REINFORCED", "ALIGNED"].includes(adaptiveSignals.signalState)) {
    const reason = "Adaptive signal validation is supported by backend coherence checks.";
    addChain(reasoningChains, "Reinforcement", reason, `${adaptiveSignals.signalState} signal validation.`);
    reinforcementReasons.push(reason);
  }

  if (["FRAGMENTED", "DIVERGENT"].includes(ecosystem.ecosystemState)) {
    addChain(reasoningChains, "Ecosystem", "Ecosystem synchronization deteriorated.", "Explainability confidence is reduced.");
    dominantFactors.push("Ecosystem divergence");
  }

  if (["PRESSURED", "FRAGMENTED"].includes(liquidity.liquidityState)) {
    addChain(reasoningChains, "Liquidity", "Liquidity pressure is elevated.", "Environmental interpretation is more cautious.");
    dominantFactors.push("Liquidity pressure");
  }

  if (["TRANSITIONAL", "UNSTABLE", "FRAGMENTED"].includes(regime.regimeState)) {
    addChain(reasoningChains, "Regime", "Regime state is changing.", "Transition reasoning is prioritized.");
    dominantFactors.push("Regime transition");
  }

  if (["ESCALATING", "UNSTABLE_SEQUENCE"].includes(temporalSequence.sequenceState)) {
    addChain(reasoningChains, "Replay", "Temporal sequence is elevated.", "Replay continuity requires attention.");
    dominantFactors.push("Temporal sequence");
  }

  if (["VOLATILE_CAUSALITY", "FRACTURED_CAUSALITY"].includes(causality.causalityState)) {
    addChain(reasoningChains, "Causality", "Environmental influence chains are unstable.", "Causality interpretation is constrained.");
    dominantFactors.push("Environmental causality");
  }

  let explainabilityState = "CLEAR";
  if (!reasoningChains.length) explainabilityState = "LIMITED";
  if (reasoningChains.length > 0 && reasoningChains.length < 3) explainabilityState = "PARTIAL";
  if (dominantFactors.length >= 4) explainabilityState = "FRAGMENTED";
  if (suppressionReasons.length && reinforcementReasons.length) {
    warnings.push("Suppression and reinforcement reasons are both present.");
  }

  return {
    explainabilityState,
    reasoningChains: reasoningChains.slice(0, 8),
    dominantFactors: dominantFactors.slice(0, 8),
    suppressionReasons,
    reinforcementReasons,
    warnings,
    summary: `${explainabilityState} explainability across ${reasoningChains.length} backend reasoning chains.`
  };
}

module.exports = {
  AWAITING_EXPLAINABILITY,
  evaluateExplainabilityReasons
};
