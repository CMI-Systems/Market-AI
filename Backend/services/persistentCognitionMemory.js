/*
 * Persistent cognition memory for Market AI.
 * Stores lightweight backend cognition summaries across runtime sessions.
 */

const fs = require("fs");
const path = require("path");

const AWAITING_PERSISTENT_MEMORY = "Awaiting persistent cognition memory.";
const DEFAULT_MEMORY_DIR = path.join(__dirname, "..", "data", "cognition-memory");
const MEMORY_FILE = "memory.json";
const ARCHIVE_DIR = "archives";
const CORRUPT_DIR = "corrupted";
const DEFAULT_MAX_ENTRIES = 240;

let loaded = false;
let memoryEntries = [];
let memoryWarnings = [];

function safeString(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function memoryPath(baseDir = DEFAULT_MEMORY_DIR) {
  return path.join(baseDir, MEMORY_FILE);
}

function archivePath(baseDir = DEFAULT_MEMORY_DIR) {
  return path.join(baseDir, ARCHIVE_DIR);
}

function corruptPath(baseDir = DEFAULT_MEMORY_DIR) {
  return path.join(baseDir, CORRUPT_DIR);
}

function safeReadJson(filePath, baseDir = DEFAULT_MEMORY_DIR) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    ensureDir(corruptPath(baseDir));
    const target = path.join(corruptPath(baseDir), `${path.basename(filePath)}.${Date.now()}.corrupt`);
    try {
      fs.renameSync(filePath, target);
    } catch {
      // If isolation fails, startup still continues with empty memory.
    }
    memoryWarnings.push("Corrupted cognition memory was isolated during startup recovery.");
    return null;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function makeEntry(input = {}) {
  const cognition = input.cognition || {};
  const marketEvent = input.marketEvent || {};

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    symbol: safeString(marketEvent.symbol),
    environment: safeString(cognition.strategicEnvironment?.environment),
    confidenceLevel: safeString(cognition.confidenceProfile?.level),
    consensusState: safeString(cognition.crossBrainConsensus?.consensusState),
    replayState: safeString(cognition.replayTimeline?.replayState || cognition.temporalSequence?.sequenceState),
    suppressionState: safeString(cognition.adaptiveSignalIntelligence?.signalState),
    suppressionLevel: safeString(cognition.adaptiveSignalIntelligence?.suppressionLevel),
    reinforcementLevel: safeString(cognition.adaptiveSignalIntelligence?.reinforcementLevel),
    ecosystemState: safeString(cognition.crossSymbolEcosystem?.ecosystemState),
    escalationLevel: safeString(cognition.escalation?.escalationLevel),
    driftState: safeString(cognition.cognitiveDrift?.driftState),
    recurrenceState: safeString(cognition.recurrenceIntelligence?.recurrenceState)
  };
}

function loadPersistentMemory(options = {}) {
  const baseDir = options.baseDir || DEFAULT_MEMORY_DIR;
  ensureDir(baseDir);
  ensureDir(archivePath(baseDir));
  ensureDir(corruptPath(baseDir));
  const payload = safeReadJson(memoryPath(baseDir), baseDir);
  memoryEntries = Array.isArray(payload?.entries) ? payload.entries : [];
  loaded = true;

  return buildPersistentMemory({ baseDir });
}

function rotateArchive(baseDir, entries) {
  ensureDir(archivePath(baseDir));
  const file = path.join(archivePath(baseDir), `cognition-memory-${Date.now()}.json`);
  writeJson(file, {
    archivedAt: new Date().toISOString(),
    entries
  });
}

function pruneArchives(baseDir, keep = 8) {
  const dir = archivePath(baseDir);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ file, fullPath: path.join(dir, file), time: fs.statSync(path.join(dir, file)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  files.slice(keep).forEach((file) => {
    try {
      fs.unlinkSync(file.fullPath);
    } catch {
      memoryWarnings.push("Old cognition archive could not be pruned.");
    }
  });
}

function persistCognitionMemory(input = {}, options = {}) {
  const baseDir = options.baseDir || DEFAULT_MEMORY_DIR;
  const maxEntries = options.maxEntries || DEFAULT_MAX_ENTRIES;
  if (!loaded || options.forceReload) loadPersistentMemory({ baseDir });

  memoryEntries.push(makeEntry(input));
  let compressionState = "UNCOMPRESSED";
  let retentionStatus = "ACTIVE";

  if (memoryEntries.length > maxEntries) {
    rotateArchive(baseDir, memoryEntries.slice(0, memoryEntries.length - maxEntries));
    memoryEntries = memoryEntries.slice(-maxEntries);
    compressionState = "COMPRESSED";
    retentionStatus = "ROTATED";
  }

  ensureDir(baseDir);
  writeJson(memoryPath(baseDir), {
    updatedAt: new Date().toISOString(),
    entries: memoryEntries
  });
  pruneArchives(baseDir);

  return buildPersistentMemory({
    baseDir,
    compressionState,
    retentionStatus
  });
}

function buildPersistentMemory(options = {}) {
  const baseDir = options.baseDir || DEFAULT_MEMORY_DIR;
  if (!loaded && options.load !== false) loadPersistentMemory({ baseDir });
  const entries = memoryEntries.slice(-40).reverse();
  const compressionState = options.compressionState || (memoryEntries.length > 80 ? "COMPRESSED" : "UNCOMPRESSED");
  const retentionStatus = options.retentionStatus || (memoryEntries.length ? "ACTIVE" : "EMPTY");

  return {
    memoryState: memoryWarnings.length ? "DEGRADED" : memoryEntries.length ? "ACTIVE" : "LIMITED",
    memoryEntries: entries,
    retentionStatus,
    compressionState,
    warnings: memoryWarnings.slice(-5),
    summary: memoryEntries.length
      ? `Persistent cognition memory contains ${memoryEntries.length} retained entries.`
      : AWAITING_PERSISTENT_MEMORY
  };
}

function clearPersistentMemory(options = {}) {
  const baseDir = options.baseDir || DEFAULT_MEMORY_DIR;
  memoryEntries = [];
  memoryWarnings = [];
  loaded = true;
  ensureDir(baseDir);
  writeJson(memoryPath(baseDir), {
    updatedAt: new Date().toISOString(),
    entries: []
  });
}

module.exports = {
  AWAITING_PERSISTENT_MEMORY,
  DEFAULT_MEMORY_DIR,
  buildPersistentMemory,
  clearPersistentMemory,
  loadPersistentMemory,
  persistCognitionMemory
};
