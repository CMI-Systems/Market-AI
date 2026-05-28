const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  buildNodeRegistry,
  heartbeatNode,
  registerNode
} = require("../services/cognitionNodeRegistry");

function run() {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-nodes-"));

  const empty = buildNodeRegistry({ baseDir, initialize: false });
  assert.strictEqual(empty.nodeState, "UNKNOWN");

  const registered = registerNode({
    nodeId: "node-a",
    role: "coordinator",
    region: "local-test",
    synchronizationState: "SYNCHRONIZED"
  }, { baseDir });
  assert.strictEqual(registered.nodeId, "node-a");

  const heartbeat = heartbeatNode("node-a", { baseDir });
  assert.strictEqual(heartbeat.nodeId, "node-a");
  assert(heartbeat.lastHeartbeat);

  const registry = buildNodeRegistry({ baseDir });
  assert.strictEqual(registry.nodeState, "ACTIVE");
  assert.strictEqual(registry.nodes.length, 1);

  fs.writeFileSync(path.join(baseDir, "nodes.json"), "{broken json");
  const recovered = buildNodeRegistry({ baseDir });
  assert.strictEqual(recovered.nodeState, "ACTIVE");
  assert(fs.existsSync(path.join(baseDir, "corrupted")));

  console.log("Cognition node registry test passed.");
}

run();
