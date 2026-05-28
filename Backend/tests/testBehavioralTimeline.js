/*
 * Local diagnostic for behavioral timelines from persisted journal drafts.
 * It verifies filters and summaries using local JSON journal storage.
 */

const assert = require("assert");
const {
  buildJournalDraft
} = require("../services/journalDraftEngine");
const {
  clearJournalStorage,
  saveJournalDraft
} = require("../services/journalPersistence");
const {
  buildBehavioralTimeline,
  getBehavioralTimelineByMood,
  getBehavioralTimelineBySymbol,
  summarizeBehavioralTimeline
} = require("../services/behavioralTimeline");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function journalDraft(overrides = {}) {
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
      `Behavioral timeline output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    clearJournalStorage();

    saveJournalDraft(journalDraft());
    saveJournalDraft(journalDraft({
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
    saveJournalDraft(journalDraft({
      reflectionPrompts: {
        theme: "OVERACTIVITY",
        prompts: ["Where would added patience improve review quality?"],
        summary: "Reflection should focus on patience and activity pressure."
      },
      behavioralIntelligence: {
        behavioralState: "OVERACTIVE",
        riskLevel: "MODERATE"
      },
      behavioralRiskAlignment: {
        riskAdjustment: "DOWNGRADE"
      }
    }));

    const timeline = buildBehavioralTimeline();
    const nvdaTimeline = getBehavioralTimelineBySymbol("NVDA");
    const overactiveTimeline = getBehavioralTimelineByMood("OVERACTIVE");
    const summary = summarizeBehavioralTimeline(timeline);
    const emptySummary = summarizeBehavioralTimeline(
      buildBehavioralTimeline({ journals: [] })
    );

    assert.strictEqual(timeline.length, 3);
    assert.strictEqual(nvdaTimeline.length, 2);
    assert.strictEqual(overactiveTimeline.length, 1);
    assert.strictEqual(summary.totalEvents, 3);
    assert.strictEqual(summary.moodDistribution.OVERACTIVE, 1);
    assert.strictEqual(summary.moodDistribution.CAUTIOUS, 1);
    assert.strictEqual(summary.tagDistribution["signal-review"], 3);
    assert(summary.symbolsReviewed.includes("NVDA"));
    assert(summary.symbolsReviewed.includes("AMD"));
    assert.strictEqual(emptySummary.totalEvents, 0);
    assert.strictEqual(emptySummary.dominantMood, "NONE");

    [timeline, nvdaTimeline, overactiveTimeline, summary, emptySummary]
      .forEach(assertNoForbiddenWords);

    console.log("\nBehavioral timeline");
    console.log(JSON.stringify(timeline, null, 2));
    console.log("\nBehavioral timeline summary");
    console.log(JSON.stringify(summary, null, 2));
    clearJournalStorage();
    clearTestSandbox();
    console.log("\nBehavioral timeline test passed.");
  });
}

run();
