/*
 * Local strategic snapshot persistence for replayable intelligence review.
 * Snapshots keep compact system-state records without changing decisions.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  getSandboxDataPath,
  isTestSandboxEnabled
} = require("./testSandbox");

const SNAPSHOT_DIRECTORY = path.join(__dirname, "..", "data", "snapshots");
let idCounter = 0;

function getSnapshotDirectory() {
  return isTestSandboxEnabled()
    ? getSandboxDataPath("snapshots")
    : SNAPSHOT_DIRECTORY;
}

function ensureSnapshotDirectory() {
  const snapshotDirectory = getSnapshotDirectory();

  fs.mkdirSync(snapshotDirectory, { recursive: true });
  return snapshotDirectory;
}

function safeString(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeTimestamp(value) {
  const parsed = value ? new Date(value) : new Date();

  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function createSnapshotId() {
  idCounter += 1;

  return `snapshot-${Date.now()}-${idCounter}-${crypto.randomBytes(4).toString("hex")}`;
}

function snapshotPath(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id || "")) {
    return null;
  }

  return path.join(getSnapshotDirectory(), `${id}.json`);
}

function buildSnapshotSummary(snapshot) {
  return `${snapshot.symbol} strategic snapshot: ${snapshot.strategicEnvironment} environment, ${snapshot.consensusStrength} consensus, ${snapshot.runtimeStatus} runtime.`;
}

function createStrategicSnapshot(input = {}) {
  const marketEvent = safeObject(input.marketEvent);
  const snapshot = {
    id: createSnapshotId(),
    timestamp: safeTimestamp(marketEvent.timestamp),
    symbol: safeString(marketEvent.symbol),
    marketState: safeObject(input.marketState),
    regime: safeObject(input.regime),
    confidenceLevel: safeString(input.confidenceProfile?.level),
    strategicEnvironment: safeString(input.strategicEnvironment?.environment),
    consensusStrength: safeString(input.intelligenceConsensus?.consensusStrength),
    anomalySeverity: safeString(input.anomalyIntelligence?.severity, "NONE"),
    runtimeStatus: safeString(input.runtimeHealth?.status),
    behavioralState: safeString(input.behavioralIntelligence?.behavioralState),
    memoryImportance: safeString(input.adaptiveMemoryScore?.importance, "IGNORE"),
    summary: ""
  };

  snapshot.summary = buildSnapshotSummary(snapshot);
  return snapshot;
}

function readSnapshotFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function listSnapshotFiles() {
  const snapshotDirectory = getSnapshotDirectory();

  if (!fs.existsSync(snapshotDirectory)) {
    return [];
  }

  return fs.readdirSync(snapshotDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => path.join(snapshotDirectory, fileName));
}

function saveStrategicSnapshot(snapshot = {}) {
  ensureSnapshotDirectory();
  const savedSnapshot = snapshot.id
    ? snapshot
    : createStrategicSnapshot(snapshot);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = attempt === 0
      ? savedSnapshot.id
      : createSnapshotId();
    const filePath = snapshotPath(id);
    const nextSnapshot = {
      ...savedSnapshot,
      id
    };

    try {
      // wx avoids overwriting any existing snapshot file.
      fs.writeFileSync(filePath, JSON.stringify(nextSnapshot, null, 2), {
        encoding: "utf8",
        flag: "wx"
      });

      return {
        saved: true,
        snapshotId: id,
        snapshot: nextSnapshot,
        filePath
      };
    } catch (error) {
      if (error.code !== "EEXIST" || attempt === 2) {
        return {
          saved: false,
          snapshotId: null,
          error: "strategic_snapshot_save_failed"
        };
      }
    }
  }

  return {
    saved: false,
    snapshotId: null,
    error: "strategic_snapshot_save_failed"
  };
}

function getRecentStrategicSnapshots(options = {}) {
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : Number.MAX_SAFE_INTEGER;
  const symbol = safeString(options.symbol, "").toUpperCase();

  return listSnapshotFiles()
    .map(readSnapshotFile)
    .filter(Boolean)
    .filter((snapshot) => {
      return !symbol || snapshot.symbol?.toUpperCase() === symbol;
    })
    .sort((first, second) => {
      return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
    })
    .slice(0, limit);
}

function countBy(snapshots, field) {
  return snapshots.reduce((counts, snapshot) => {
    const key = snapshot[field] || "UNKNOWN";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function buildSummaryObservations(snapshots) {
  if (!snapshots.length) {
    return ["No strategic snapshots are available for replay review."];
  }

  return [
    `${snapshots.length} strategic snapshots are available for replay review.`,
    `${new Set(snapshots.map((snapshot) => snapshot.symbol)).size} symbols appear in snapshot history.`
  ];
}

function summarizeStrategicSnapshots(snapshots) {
  const recentSnapshots = Array.isArray(snapshots)
    ? snapshots
    : getRecentStrategicSnapshots();

  return {
    totalSnapshots: recentSnapshots.length,
    environments: countBy(recentSnapshots, "strategicEnvironment"),
    runtimeStatuses: countBy(recentSnapshots, "runtimeStatus"),
    anomalyDistribution: countBy(recentSnapshots, "anomalySeverity"),
    symbols: countBy(recentSnapshots, "symbol"),
    observations: buildSummaryObservations(recentSnapshots)
  };
}

module.exports = {
  SNAPSHOT_DIRECTORY,
  createStrategicSnapshot,
  getSnapshotDirectory,
  getRecentStrategicSnapshots,
  saveStrategicSnapshot,
  summarizeStrategicSnapshots
};
