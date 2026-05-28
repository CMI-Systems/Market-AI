const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  buildOperatorMemory,
  recordOperatorInteraction
} = require("../services/operatorMemoryLayer");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-operator-memory-"));
const fallback = buildOperatorMemory("test-user", { baseDir });
assert.strictEqual(fallback.operatorMemoryState, "LIMITED");

recordOperatorInteraction("test-user", { type: "region-view", target: "Semiconductors" }, { baseDir });
recordOperatorInteraction("test-user", { type: "replay-drilldown", target: "timeline" }, { baseDir });
const memory = buildOperatorMemory("test-user", { baseDir });

assert.strictEqual(memory.operatorMemoryState, "ACTIVE");
assert(memory.interactionPatterns.length >= 2);
assert(memory.dominantInteractions.length >= 1);

console.log("Operator memory layer test passed.");
