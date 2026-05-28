/*
 * AI Copilot narration engine for Market AI.
 * Deterministic backend explanations only; no provider calls or recommendations.
 */

const AWAITING_AI_COPILOT_NARRATION = "Awaiting AI Copilot narration.";

function text(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function evaluateAiCopilotNarration(input = {}) {
  const strategicEnvironment = input.strategicEnvironment || {};
  const adaptiveSignals = input.adaptiveSignalIntelligence || {};
  const consensus = input.crossBrainConsensus || {};
  const temporalMemory = input.temporalMemory || {};
  const liquidityPressure = input.liquidityPressure || {};
  const ecosystem = input.crossSymbolEcosystem || {};
  const replaySummary = input.replaySummary || {};
  const warnings = [];

  if (!strategicEnvironment.environment && !adaptiveSignals.signalState && !consensus.consensusState) {
    return {
      narrationState: "INSUFFICIENT_CONTEXT",
      cognitionSummary: AWAITING_AI_COPILOT_NARRATION,
      environmentSummary: AWAITING_AI_COPILOT_NARRATION,
      consensusSummary: AWAITING_AI_COPILOT_NARRATION,
      riskSummary: AWAITING_AI_COPILOT_NARRATION,
      replaySummary: AWAITING_AI_COPILOT_NARRATION,
      warnings: [],
      summary: AWAITING_AI_COPILOT_NARRATION
    };
  }

  const environment = text(strategicEnvironment.environment);
  const signalState = text(adaptiveSignals.signalState);
  const consensusState = text(consensus.consensusState);
  const temporalState = text(temporalMemory.temporalState);
  const liquidityState = text(liquidityPressure.liquidityState);
  const ecosystemState = text(ecosystem.ecosystemState);

  if (["SUPPRESSED", "UNSTABLE"].includes(signalState) || consensusState === "FAILSAFE_PRIORITY") {
    warnings.push("Operator review is warranted because cognition validation is constrained.");
  }

  let narrationState = "ACTIVE";
  if ([environment, signalState, consensusState].includes("UNKNOWN")) {
    narrationState = "LIMITED";
  }
  if (["SUPPRESSED", "UNSTABLE"].includes(signalState) || ["FRAGMENTED", "DIVERGENT"].includes(ecosystemState)) {
    narrationState = "DEGRADED";
  }

  return {
    narrationState,
    cognitionSummary: `Backend cognition is ${signalState} with ${text(adaptiveSignals.signalTrust)} trust and ${text(adaptiveSignals.coherenceLevel)} coherence.`,
    environmentSummary: `Environment is ${environment} with ${text(strategicEnvironment.stability)} stability and ${text(strategicEnvironment.summary, "limited environment detail")}.`,
    consensusSummary: `Brain consensus is ${consensusState} with ${text(consensus.agreementStrength)} agreement strength.`,
    riskSummary: `Liquidity is ${liquidityState}; ecosystem state is ${ecosystemState}; temporal memory is ${temporalState}.`,
    replaySummary: text(replaySummary.timelineSummary || replaySummary.replayFrameSummary, "Replay cognition is limited."),
    warnings,
    summary: `${narrationState} AI Copilot narration is available from backend cognition outputs.`
  };
}

module.exports = {
  AWAITING_AI_COPILOT_NARRATION,
  evaluateAiCopilotNarration
};
