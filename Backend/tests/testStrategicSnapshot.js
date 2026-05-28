/*
 * Local diagnostic for strategic replay snapshots.
 * It saves compact JSON snapshots and verifies retrieval and summaries.
 */

const assert = require("assert");
const fs = require("fs");
const {
  createStrategicSnapshot,
  getSnapshotDirectory,
  getRecentStrategicSnapshots,
  saveStrategicSnapshot,
  summarizeStrategicSnapshots
} = require("../services/strategicSnapshot");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function clearSnapshots() {
  const snapshotDirectory = getSnapshotDirectory();

  if (!fs.existsSync(snapshotDirectory)) {
    return;
  }

  fs.readdirSync(snapshotDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .forEach((fileName) => {
      fs.unlinkSync(`${snapshotDirectory}\\${fileName}`);
    });
}

function snapshotInput(symbol, overrides = {}) {
  return {
    marketEvent: {
      symbol,
      timestamp: "2026-05-22T14:30:00.000Z"
    },
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH",
      confidence: 0.84
    },
    confidenceProfile: {
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "NONE"
    },
    anomalyIntelligence: {
      severity: "NONE"
    },
    runtimeHealth: {
      status: "HEALTHY"
    },
    intelligenceConsensus: {
      consensusStrength: "STRONG"
    },
    strategicEnvironment: {
      environment: "OPTIMAL"
    },
    adaptiveMemoryScore: {
      importance: "HIGH"
    },
    multiSymbolContext: {
      groupBias: "BULLISH",
      alignment: "STRONG"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  };
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Strategic snapshot output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    clearSnapshots();

    const optimal = createStrategicSnapshot(snapshotInput("NVDA"));
    const caution = createStrategicSnapshot(snapshotInput("AMD", {
      confidenceProfile: { level: "LOW" },
      strategicEnvironment: { environment: "CAUTION" },
      intelligenceConsensus: { consensusStrength: "WEAK" },
      anomalyIntelligence: { severity: "MEDIUM" },
      runtimeHealth: { status: "STABLE" },
      behavioralIntelligence: { behavioralState: "CAUTION" },
      adaptiveMemoryScore: { importance: "MEDIUM" }
    }));
    const unstable = createStrategicSnapshot(snapshotInput("SPY", {
      strategicEnvironment: { environment: "UNSTABLE" },
      intelligenceConsensus: { consensusStrength: "CONFLICTED" },
      anomalyIntelligence: { severity: "HIGH" },
      runtimeHealth: { status: "DEGRADED" },
      behavioralIntelligence: { behavioralState: "UNSTABLE" }
    }));
    const highRisk = createStrategicSnapshot(snapshotInput("QQQ", {
      strategicEnvironment: { environment: "HIGH_RISK" },
      intelligenceConsensus: { consensusStrength: "CONFLICTED" },
      anomalyIntelligence: { severity: "HIGH" },
      runtimeHealth: { status: "CRITICAL" },
      behavioralIntelligence: { behavioralState: "UNSTABLE" },
      failsafeBrain: { status: "ACTIVE" }
    }));

    const saves = [optimal, caution, unstable, highRisk].map(saveStrategicSnapshot);
    const recent = getRecentStrategicSnapshots({ limit: 10 });
    const nvdaOnly = getRecentStrategicSnapshots({ symbol: "NVDA" });
    const summary = summarizeStrategicSnapshots(recent);

    saves.forEach((save) => assert.strictEqual(save.saved, true));
    assert.strictEqual(recent.length, 4);
    assert.strictEqual(nvdaOnly.length, 1);
    assert.strictEqual(summary.totalSnapshots, 4);
    assert.strictEqual(summary.environments.OPTIMAL, 1);
    assert.strictEqual(summary.environments.CAUTION, 1);
    assert.strictEqual(summary.environments.UNSTABLE, 1);
    assert.strictEqual(summary.environments.HIGH_RISK, 1);
    assert.strictEqual(summary.runtimeStatuses.CRITICAL, 1);
    assert.strictEqual(summary.anomalyDistribution.HIGH, 2);
    const snapshotDirectory = getSnapshotDirectory();

    assert(fs.existsSync(snapshotDirectory));
    assert(fs.existsSync(`${snapshotDirectory}\\${saves[0].snapshotId}.json`));

    [optimal, caution, unstable, highRisk, ...recent, summary]
      .forEach(assertNoForbiddenWords);

    console.log("\nRecent strategic snapshots");
    console.log(JSON.stringify(recent, null, 2));
    console.log("\nStrategic snapshot summary");
    console.log(JSON.stringify(summary, null, 2));
    clearSnapshots();
    clearTestSandbox();
    console.log("\nStrategic snapshot test passed.");
  });
}

run();
