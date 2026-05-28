/*
 * Creates websocket-ready provider envelopes without opening connections.
 * Future provider clients can emit these envelopes into adapters uniformly.
 */

function createProviderEnvelope(provider, channel, payload, metadata = {}) {
  return {
    provider,
    channel,
    payload,
    source: "stream",
    receivedAt: metadata.receivedAt || new Date().toISOString(),
    assetClass: metadata.assetClass || "unknown",
    timeframe: metadata.timeframe || "unknown"
  };
}

module.exports = {
  createProviderEnvelope
};
