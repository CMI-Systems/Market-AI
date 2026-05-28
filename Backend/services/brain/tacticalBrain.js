/*
 * Tactical Market Brain input contract.
 * This brain accepts normalized market-event.v1 objects only.
 */

const {
  assertNormalizedMarketEvent
} = require("../../providers/shared/marketEvent");
const {
  getRecentMemory
} = require("./brainMemory");
const {
  evaluateMarketState
} = require("../stateEngine");
const {
  evaluateRegime
} = require("../regimeEngine");

function createDegradedTacticalOutput(reason) {
  return {
    brain: "TACTICAL_MARKET_BRAIN",
    status: "DEGRADED",
    bias: "NO_TRADE",
    confidence: 0,
    reason
  };
}

function describeEvent(event) {
  switch (event.eventType) {
    case "trade":
      return `Normalized trade event received for ${event.symbol}.`;
    case "quote":
      return `Normalized quote event received for ${event.symbol}.`;
    case "candle":
      return `Normalized candle event received for ${event.symbol}.`;
    case "option":
      return `Normalized option event received for ${event.symbol}.`;
    default:
      return `Normalized market event received for ${event.symbol}.`;
  }
}

function analyzeTacticalMarketEvent(marketEvent) {
  try {
    const normalizedEvent = assertNormalizedMarketEvent(marketEvent);
    const recentMemory = getRecentMemory({
      symbol: normalizedEvent.symbol,
      timeframe: normalizedEvent.timeframe || "unknown"
    });
    const recentEventCount = recentMemory.length;
    const marketState = evaluateMarketState({
      recentMemory
    });
    const regime = evaluateRegime({
      marketState,
      recentMemory
    });

    // Tactical logic will expand later. For now this is an input contract gate.
    return {
      brain: "TACTICAL_MARKET_BRAIN",
      status: "OBSERVING",
      bias: "NEUTRAL",
      confidence: 0,
      reason: describeEvent(normalizedEvent),
      memoryAware: recentEventCount > 0,
      ...(recentEventCount > 0 ? { recentEventCount } : {}),
      marketState,
      regime,
      marketEvent: {
        eventType: normalizedEvent.eventType,
        symbol: normalizedEvent.symbol,
        timestamp: normalizedEvent.timestamp
      }
    };
  } catch {
    return createDegradedTacticalOutput(
      "Invalid market input rejected. Tactical analysis requires a normalized market-event.v1 object."
    );
  }
}

module.exports = {
  analyzeTacticalMarketEvent,
  createDegradedTacticalOutput
};
