/*
 * Local diagnostic for deterministic reflection prompts.
 * It verifies journal-ready prompts without storing any reflections.
 */

const assert = require("assert");
const {
  buildReflectionPrompts
} = require("../services/reflectionPromptEngine");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function prompts(overrides = {}) {
  return buildReflectionPrompts({
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "NONE",
      adjustedConfidenceLevel: "HIGH"
    },
    confidenceProfile: {
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    insightSummary: {
      statistics: {
        dominantSignalType: "MOMENTUM_CONTINUATION"
      }
    },
    alertReadiness: {
      alertReady: true
    },
    systemContext: {
      mode: "shadow-test"
    },
    ...overrides
  });
}

function assertSafePromptOutput(output) {
  assert(Array.isArray(output.prompts));
  assert(output.prompts.length > 0);

  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Reflection prompts should not contain forbidden word: ${word}`
    );
  });
}

function printPrompts(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const overactive = prompts({
    behavioralIntelligence: {
      behavioralState: "OVERACTIVE",
      riskLevel: "MODERATE"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "DOWNGRADE",
      adjustedConfidenceLevel: "MODERATE"
    }
  });
  const unstable = prompts({
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    }
  });
  const lowConfidence = prompts({
    behavioralIntelligence: {
      behavioralState: "CAUTION",
      riskLevel: "MODERATE"
    },
    confidenceProfile: {
      level: "AVOID"
    }
  });
  const disciplined = prompts();
  const suppressed = prompts({
    behavioralIntelligence: {
      behavioralState: "CAUTION",
      riskLevel: "MODERATE"
    },
    behavioralRiskAlignment: {
      riskAdjustment: "SUPPRESS",
      adjustedConfidenceLevel: "AVOID"
    }
  });

  assert.strictEqual(overactive.theme, "OVERACTIVITY");
  assert.strictEqual(overactive.priority, "MEDIUM");
  assert.strictEqual(unstable.theme, "RISK_CONTROL");
  assert.strictEqual(unstable.priority, "HIGH");
  assert.strictEqual(lowConfidence.theme, "UNCERTAINTY");
  assert.strictEqual(disciplined.theme, "DISCIPLINE");
  assert.strictEqual(suppressed.theme, "DISCIPLINE");
  assert.strictEqual(suppressed.priority, "HIGH");

  [overactive, unstable, lowConfidence, disciplined, suppressed]
    .forEach(assertSafePromptOutput);

  printPrompts("Overactive behavior", overactive);
  printPrompts("Unstable behavior", unstable);
  printPrompts("Low-confidence environment", lowConfidence);
  printPrompts("Disciplined environment", disciplined);
  printPrompts("Suppressed behavioral risk", suppressed);
  console.log("\nReflection prompt engine test passed.");
}

run();
