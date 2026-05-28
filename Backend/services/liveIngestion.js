/*
 * Internal intake pipe for future live market streams.
 * Stream clients must pass normalized market-event.v1 objects into this layer.
 */

const {
  assertNormalizedMarketEvent
} = require("../providers/shared/marketEvent");
const {
  superviseBrains
} = require("./brain/brainSupervisor");
const {
  recordBrainOutput,
  recordIngestionEvent
} = require("./runtimeMetrics");

function rejectedMarketEvent() {
  return {
    accepted: false,
    status: "REJECTED",
    reason: "invalid_market_event",
    brainOutput: null
  };
}

function ingestMarketEvent(input = {}) {
  try {
    // Raw provider payloads stop here until a provider adapter normalizes them.
    const marketEvent = assertNormalizedMarketEvent(input.marketEvent);
    const brainOutput = superviseBrains({
      marketEvent,
      userContext: input.userContext,
      journalContext: input.journalContext,
      systemContext: input.systemContext
    });
    recordIngestionEvent({
      accepted: true
    });
    recordBrainOutput(brainOutput);

    return {
      accepted: true,
      status: "PROCESSED",
      marketEvent,
      brainOutput
    };
  } catch {
    // Ingestion rejects unsafe inputs instead of throwing them into callers.
    recordIngestionEvent({
      accepted: false
    });
    return rejectedMarketEvent();
  }
}

module.exports = {
  ingestMarketEvent
};
