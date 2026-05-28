const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  buildUsageTracking,
  recordUsageEvent
} = require("../services/usageTrackingEngine");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-usage-"));
const fallback = buildUsageTracking({ baseDir });
assert.strictEqual(fallback.usageState, "LIMITED");

recordUsageEvent({ type: "replay-interaction", target: "timeline" }, { baseDir });
recordUsageEvent({ type: "reasoning-expansion", target: "chain" }, { baseDir });
const usage = buildUsageTracking({ baseDir });
assert.strictEqual(usage.usageState, "ACTIVE");
assert.strictEqual(usage.usageMetrics["replay-interaction"], 1);
assert(usage.operatorPatterns.length >= 1);

console.log("Usage tracking engine test passed.");
