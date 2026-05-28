const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  buildPersistentMemory,
  clearPersistentMemory,
  loadPersistentMemory,
  persistCognitionMemory
} = require("../services/persistentCognitionMemory");
const {
  buildPersistentMemoryEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-memory-"));
clearPersistentMemory({ baseDir });
clearLatestCognitionSnapshot();

const fallback = buildPersistentMemoryEndpoint();
assert.strictEqual(fallback.memoryState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting persistent cognition memory.");

const memory = persistCognitionMemory({
  marketEvent: { symbol: "NVDA" },
  cognition: {
    strategicEnvironment: { environment: "CAUTION" },
    confidenceProfile: { level: "LOW" },
    crossBrainConsensus: { consensusState: "PARTIAL_CONSENSUS" },
    adaptiveSignalIntelligence: { signalState: "SUPPRESSED", suppressionLevel: "HIGH", reinforcementLevel: "NONE" },
    crossSymbolEcosystem: { ecosystemState: "FRAGMENTED" },
    cognitiveDrift: { driftState: "DEGRADING" },
    replayTimeline: { replayState: "DRIFTING" }
  }
}, { baseDir, maxEntries: 3 });
assert.strictEqual(memory.memoryState, "ACTIVE");
assert(memory.memoryEntries.length >= 1);

loadPersistentMemory({ baseDir });
const reloaded = buildPersistentMemory({ baseDir });
assert.strictEqual(reloaded.memoryState, "ACTIVE");

for (let index = 0; index < 5; index += 1) {
  persistCognitionMemory({ marketEvent: { symbol: "AMD" }, cognition: { strategicEnvironment: { environment: "STABLE" } } }, { baseDir, maxEntries: 3 });
}
const rotated = buildPersistentMemory({ baseDir });
assert(["ROTATED", "ACTIVE"].includes(rotated.retentionStatus));

fs.writeFileSync(path.join(baseDir, "memory.json"), "{bad json");
const recovered = loadPersistentMemory({ baseDir });
assert(["DEGRADED", "LIMITED"].includes(recovered.memoryState));

setLatestCognitionSnapshot({ persistentMemory: memory });
const endpoint = buildPersistentMemoryEndpoint();
assert.strictEqual(endpoint.memoryState, "ACTIVE");
assert.notStrictEqual(endpoint.summary, "Awaiting persistent cognition memory.");

console.log("Persistent cognition memory test passed.");
