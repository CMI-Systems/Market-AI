/*
 * Local diagnostic for cognitive identity persistence.
 * It stores process-focused identity summaries under the test sandbox.
 */

const assert = require("assert");
const fs = require("fs");
const {
  buildCognitiveIdentity,
  clearCognitiveIdentity,
  getCognitiveIdentity,
  getIdentityDirectory,
  saveCognitiveIdentity,
  summarizeCognitiveIdentity
} = require("../services/cognitiveIdentity");
const {
  clearTestSandbox,
  withTestSandbox
} = require("../services/testSandbox");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Cognitive identity output should not contain forbidden word: ${word}`
    );
  });
}

function run() {
  withTestSandbox(() => {
    clearTestSandbox();
    clearCognitiveIdentity();

    const behavioralTimeline = [
      {
        id: "behavior-1",
        timestamp: "2026-05-22T14:00:00.000Z",
        symbol: "NVDA",
        mood: "FOCUSED",
        tags: ["discipline", "signal-review"],
        summary: "NVDA process review remained focused."
      },
      {
        id: "behavior-2",
        timestamp: "2026-05-22T14:05:00.000Z",
        symbol: "NVDA",
        mood: "OVERACTIVE",
        tags: ["patience", "overactivity"],
        summary: "NVDA review noted activity pressure."
      }
    ];
    const journals = [
      {
        id: "journal-1",
        symbol: "NVDA",
        mood: "CAUTIOUS",
        tags: ["risk-control", "uncertainty"],
        prompts: ["What uncertainty should remain visible?"],
        summary: "Reflection focused on risk control."
      },
      {
        id: "journal-2",
        symbol: "AMD",
        mood: "FOCUSED",
        tags: ["discipline", "confidence"],
        prompts: ["Which process habit stayed consistent?"],
        summary: "Reflection reinforced discipline."
      }
    ];
    const cognitivePatterns = [
      {
        patternId: "unstable-environment",
        category: "environment",
        strength: "STRONG"
      },
      {
        patternId: "confidence-degradation",
        category: "confidence",
        strength: "MODERATE"
      }
    ];
    const cognitiveDrift = {
      driftDetected: true,
      severity: "MODERATE",
      driftCategories: ["confidence_decay"]
    };
    const reflectionPrompts = {
      theme: "RISK_CONTROL",
      prompts: ["What condition deserves added caution?"]
    };
    const insightSummary = {
      statistics: {
        dominantRegime: "CHOPPY"
      }
    };

    const identity = buildCognitiveIdentity({
      behavioralTimeline,
      journals,
      insightSummary,
      cognitivePatterns,
      cognitiveDrift,
      reflectionPrompts
    });
    const saveResult = saveCognitiveIdentity(identity);
    const retrieved = getCognitiveIdentity();
    const summary = summarizeCognitiveIdentity(retrieved);

    assert(identity.id);
    assert.strictEqual(identity.behavioralProfile.reflectionStyle, "risk-aware");
    assert(identity.behavioralProfile.behavioralTendencies.length > 0);
    assert(identity.strategicProfile.recurringWarnings.includes("confidence_pattern"));
    assert(identity.strategicProfile.recurringWarnings.includes("confidence_decay"));
    assert(identity.developmentProfile.strengths.includes("risk-control awareness"));
    assert(identity.developmentProfile.growthAreas.includes("patience under activity pressure"));
    assert.strictEqual(saveResult.saved, true);
    assert(fs.existsSync(saveResult.filePath));
    assert.strictEqual(retrieved.id, saveResult.identityId);
    assert.strictEqual(summary.exists, true);
    assert.strictEqual(summary.reflectionStyle, "risk-aware");
    assert(fs.existsSync(getIdentityDirectory()));

    clearCognitiveIdentity();
    const emptySummary = summarizeCognitiveIdentity();
    assert.strictEqual(emptySummary.exists, false);

    [
      identity,
      saveResult,
      retrieved,
      summary,
      emptySummary
    ].forEach(assertNoForbiddenWords);

    console.log("\nCognitive identity");
    console.log(JSON.stringify(identity, null, 2));
    console.log("\nCognitive identity summary");
    console.log(JSON.stringify(summary, null, 2));
    clearTestSandbox();
    console.log("\nCognitive identity test passed.");
  });
}

run();
