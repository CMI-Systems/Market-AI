/*
 * Local diagnostic for test-only persistence sandboxing.
 * It proves journal, snapshot, and training writes stay under Backend/.sandbox.
 */

const assert = require("assert");
const fs = require("fs");
const {
  buildJournalDraft
} = require("../services/journalDraftEngine");
const {
  saveJournalDraft
} = require("../services/journalPersistence");
const {
  createStrategicSnapshot,
  saveStrategicSnapshot
} = require("../services/strategicSnapshot");
const {
  appendTrainingEntry
} = require("../training/trainingLogger");
const {
  clearTestSandbox,
  getSandboxDataPath,
  getSandboxTrainingPath,
  isTestSandboxEnabled,
  withTestSandbox
} = require("../services/testSandbox");

const REAL_JOURNAL_DIRECTORY = `${__dirname}\\..\\data\\journals`;
const REAL_SNAPSHOT_DIRECTORY = `${__dirname}\\..\\data\\snapshots`;
const REAL_DATASET_DIRECTORY = `${__dirname}\\..\\training\\datasets`;

function directoryState(directory, suffix) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory)
    .filter((fileName) => !suffix || fileName.endsWith(suffix))
    .sort()
    .map((fileName) => {
      const filePath = `${directory}\\${fileName}`;
      const stats = fs.statSync(filePath);

      return {
        fileName,
        size: stats.size,
        modifiedAt: stats.mtimeMs
      };
    });
}

function journalDraft() {
  return buildJournalDraft({
    symbol: "NVDA",
    reflectionPrompts: {
      theme: "DISCIPLINE",
      prompts: ["Which process condition deserves review?"],
      summary: "Reflection should remain process focused."
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "NONE"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    confidenceProfile: {
      level: "HIGH"
    },
    insightSummary: {}
  });
}

function snapshot() {
  return createStrategicSnapshot({
    marketEvent: {
      symbol: "NVDA",
      timestamp: "2026-05-22T15:00:00.000Z"
    },
    marketState: {},
    regime: {},
    confidenceProfile: {
      level: "MODERATE"
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED"
    },
    anomalyIntelligence: {
      severity: "NONE"
    },
    runtimeHealth: {
      status: "STABLE"
    },
    intelligenceConsensus: {
      consensusStrength: "MODERATE"
    },
    strategicEnvironment: {
      environment: "FAVORABLE"
    },
    adaptiveMemoryScore: {
      importance: "MEDIUM"
    }
  });
}

function trainingEntry() {
  return {
    timestamp: "2026-05-22T15:00:00.000Z",
    category: "momentum",
    provider: "unknown",
    symbol: "NVDA",
    timeframe: "1m",
    inputs: {
      marketData: {},
      indicators: {},
      brainOutputs: {},
      userContext: {}
    },
    engineOutput: {
      bias: "NEUTRAL",
      confidence: 0.5,
      reason: "Sandbox diagnostic observation."
    },
    outcome: {
      known: false,
      result: null,
      notes: ""
    },
    qualityLabel: {
      reviewed: false,
      label: "unreviewed",
      reviewerNotes: ""
    }
  };
}

function run() {
  const realStateBefore = {
    journals: directoryState(REAL_JOURNAL_DIRECTORY, ".json"),
    snapshots: directoryState(REAL_SNAPSHOT_DIRECTORY, ".json"),
    datasets: directoryState(REAL_DATASET_DIRECTORY, ".jsonl")
  };

  withTestSandbox(() => {
    clearTestSandbox();

    assert.strictEqual(isTestSandboxEnabled(), true);

    const savedJournal = saveJournalDraft(journalDraft());
    const savedSnapshot = saveStrategicSnapshot(snapshot());
    const loggedTraining = appendTrainingEntry(trainingEntry());

    assert.strictEqual(savedJournal.saved, true);
    assert.strictEqual(savedSnapshot.saved, true);
    assert.strictEqual(loggedTraining.appended, true);
    assert(savedJournal.filePath.startsWith(getSandboxDataPath("journals")));
    assert(savedSnapshot.filePath.startsWith(getSandboxDataPath("snapshots")));
    assert(loggedTraining.datasetPath.startsWith(getSandboxTrainingPath("datasets")));
    assert(fs.existsSync(savedJournal.filePath));
    assert(fs.existsSync(savedSnapshot.filePath));
    assert(fs.existsSync(loggedTraining.datasetPath));

    assert.deepStrictEqual({
      journals: directoryState(REAL_JOURNAL_DIRECTORY, ".json"),
      snapshots: directoryState(REAL_SNAPSHOT_DIRECTORY, ".json"),
      datasets: directoryState(REAL_DATASET_DIRECTORY, ".jsonl")
    }, realStateBefore);

    clearTestSandbox();
    assert.strictEqual(fs.existsSync(getSandboxDataPath()), false);
  });

  console.log("Test sandbox passed.");
}

run();
