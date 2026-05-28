/*
 * Local diagnostic for in-memory journal draft objects.
 * It verifies structured drafts without persistence or journal UI wiring.
 */

const assert = require("assert");
const {
  buildJournalDraft
} = require("../services/journalDraftEngine");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function draft(overrides = {}) {
  return buildJournalDraft({
    symbol: "NVDA",
    reflectionPrompts: {
      theme: "DISCIPLINE",
      prompts: [
        "Which process habit stayed consistent?",
        "What deserves review before the next context shift?"
      ],
      summary: "Reflection should reinforce discipline and process consistency.",
      priority: "LOW"
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
    systemContext: {
      mode: "shadow-test"
    },
    ...overrides
  });
}

function assertSafeDraft(output) {
  assert.strictEqual(output.draftType, "REFLECTION");
  assert(Array.isArray(output.tags));
  assert(output.tags.length > 0);
  assert(Array.isArray(output.prompts));
  assert(output.prompts.length > 0);
  assert(!Number.isNaN(Date.parse(output.createdAt)));

  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Journal draft output should not contain forbidden word: ${word}`
    );
  });
}

function printDraft(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const overactive = draft({
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
  });
  const unstable = draft({
    reflectionPrompts: {
      theme: "RISK_CONTROL",
      prompts: ["What instability should remain visible in review?"],
      summary: "Reflection should focus on risk control and uncertainty."
    },
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "SUPPRESS"
    }
  });
  const disciplined = draft();
  const lowConfidence = draft({
    reflectionPrompts: {
      theme: "UNCERTAINTY",
      prompts: ["What uncertainty is most important to name?"],
      summary: "Reflection should examine caution and clarity."
    },
    behavioralIntelligence: {
      behavioralState: "CAUTION",
      riskLevel: "MODERATE"
    },
    confidenceProfile: {
      level: "AVOID"
    }
  });

  assert.strictEqual(overactive.mood, "OVERACTIVE");
  assert(overactive.tags.includes("overactivity"));
  assert(overactive.tags.includes("patience"));
  assert.strictEqual(unstable.mood, "CAUTIOUS");
  assert(unstable.tags.includes("risk-control"));
  assert.strictEqual(disciplined.mood, "FOCUSED");
  assert(disciplined.prompts.includes("Which process habit stayed consistent?"));
  assert.strictEqual(lowConfidence.mood, "UNCERTAIN");
  assert(lowConfidence.tags.includes("uncertainty"));

  [overactive, unstable, disciplined, lowConfidence].forEach(assertSafeDraft);

  printDraft("Overactive draft", overactive);
  printDraft("Unstable cautious draft", unstable);
  printDraft("Disciplined draft", disciplined);
  printDraft("Low-confidence draft", lowConfidence);
  console.log("\nJournal draft engine test passed.");
}

run();
