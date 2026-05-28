const AWAITING_WEBSOCKET_INFRASTRUCTURE = "Awaiting websocket infrastructure.";

const channels = new Set(["operator-feed", "cognition-updates", "replay-updates"]);

function buildWebsocketInfrastructure(input = {}) {
  const connectedOperators = Number(input.connectedOperators || 0);
  const activeChannels = Array.from(input.channels || channels);

  return {
    websocketState: activeChannels.length && connectedOperators > 0 ? "ACTIVE" : activeChannels.length ? "LIMITED" : "OFFLINE",
    activeChannels,
    connectedOperators,
    streamHealth: connectedOperators > 0 ? "READY" : "STANDBY",
    warnings: [],
    summary: activeChannels.length
      ? `${activeChannels.length} websocket foundation channels configured.`
      : AWAITING_WEBSOCKET_INFRASTRUCTURE
  };
}

module.exports = {
  AWAITING_WEBSOCKET_INFRASTRUCTURE,
  buildWebsocketInfrastructure
};
