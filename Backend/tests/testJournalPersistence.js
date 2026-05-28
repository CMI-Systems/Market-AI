/*
 * Local diagnostic for JSON journal persistence.
 * It saves reflection drafts as individual local files and reads them back.
 */

const assert = require("assert");
const fs = require("fs");
const {
  buildJournalDraft
} = require("../services/journalDraftEngine");
const {
  clearJournalStorage,
  getJournalDirectory,
  getJournalDraftById,
  getJournalStats,
  getRecentJournalDrafts,
  saveJournalDraft
} = require("../services/journalPersistence");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function reflectionDraft(overrides = {}) {
  return buildJournalDraft({
    symbol: "NVDA",
    reflectionPrompts: {
      theme: "DISCIPLINE",
      prompts: ["Which process habit deserves review?"],
      summary: "Reflection should reinforce discipline and process review."
    },
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
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
    insightSummary: {
      statistics: {
        dominantRegime: "TRENDING_BULLISH"
      }
    },
    ...overrides
  });
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Persisted journal output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    clearJournalStorage();

    const focusedSave = saveJournalDraft(reflectionDraft());
    const cautiousSave = saveJournalDraft(reflectionDraft({
      symbol: "AMD",
      reflectionPrompts: {
        theme: "RISK_CONTROL",
        prompts: ["What uncertainty should remain visible in review?"],
        summary: "Reflection should focus on risk control and uncertainty."
      },
      behavioralIntelligence: {
        behavioralState: "UNSTABLE",
        riskLevel: "HIGH"
      },
      behavioralRiskAlignment: {
        riskAdjustment: "SUPPRESS"
      },
      confidenceProfile: {
        level: "AVOID"
      }
    }));
    const uncertainSave = saveJournalDraft(reflectionDraft({
      reflectionPrompts: {
        theme: "UNCERTAINTY",
        prompts: ["What clarity is still missing?"],
        summary: "Reflection should examine caution and clarity."
      },
      behavioralIntelligence: {
        behavioralState: "CAUTION",
        riskLevel: "MODERATE"
      },
      confidenceProfile: {
        level: "LOW"
      }
    }));

    const focused = getJournalDraftById(focusedSave.journalId);
    const recent = getRecentJournalDrafts({ limit: 10 });
    const nvdaOnly = getRecentJournalDrafts({ symbol: "NVDA" });
    const uncertainOnly = getRecentJournalDrafts({ mood: "UNCERTAIN" });
    const riskTagged = getRecentJournalDrafts({ tag: "risk-control" });
    const stats = getJournalStats();

    assert.strictEqual(focusedSave.saved, true);
    assert.strictEqual(cautiousSave.saved, true);
    assert.strictEqual(uncertainSave.saved, true);
    assert.strictEqual(focused.id, focusedSave.journalId);
    assert.strictEqual(recent.length, 3);
    assert.strictEqual(nvdaOnly.length, 2);
    assert.strictEqual(uncertainOnly.length, 1);
    assert.strictEqual(riskTagged.length, 1);
    assert.strictEqual(stats.totalJournals, 3);
    const journalDirectory = getJournalDirectory();

    assert(fs.existsSync(journalDirectory));
    assert(fs.existsSync(`${journalDirectory}\\${focusedSave.journalId}.json`));

    [focused, ...recent, stats].forEach(assertNoForbiddenWords);

    console.log("\nRecent journals");
    console.log(JSON.stringify(recent, null, 2));
    console.log("\nJournal stats");
    console.log(JSON.stringify(stats, null, 2));
    clearJournalStorage();
    clearTestSandbox();
    console.log("\nJournal persistence test passed.");
  });
}

run();
