const assert = require("assert");
const { buildWebsocketInfrastructure } = require("../services/websocketInfrastructure");

function run() {
  const fallback = buildWebsocketInfrastructure({ channels: [] });
  assert.strictEqual(fallback.websocketState, "OFFLINE");
  assert.strictEqual(fallback.summary, "Awaiting websocket infrastructure.");

  const limited = buildWebsocketInfrastructure();
  assert.strictEqual(limited.websocketState, "LIMITED");
  assert(limited.activeChannels.length > 0);
  assert.strictEqual(limited.streamHealth, "STANDBY");

  const active = buildWebsocketInfrastructure({
    channels: ["operator-feed", "replay-updates"],
    connectedOperators: 2
  });
  assert.strictEqual(active.websocketState, "ACTIVE");
  assert.strictEqual(active.streamHealth, "READY");

  console.log("Websocket infrastructure test passed.");
}

run();
