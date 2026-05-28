/*
 * Local diagnostic for behavioral risk alignment.
 * It checks confidence posture adjustments without recommendation behavior.
 */

const assert = require("assert");
const {
  evaluateBehavioralRiskAlignment
} = require("../services/behavioralRiskAlignment");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function alignment(overrides = {}) {
  return evaluateBehavioralRiskAlignment({
    behavioralIntelligence: {
      behavioralState: "DISCIPLINED",
      riskLevel: "LOW"
    },
    confidenceProfile: {
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    alertReadiness: {
      alertReady: true,
      priority: "HIGH"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    ...overrides
  });
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Behavioral risk alignment output should not contain forbidden word: ${word}`
    );
  });
}

function printAlignment(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const disciplined = alignment();
  const overactive = alignment({
    behavioralIntelligence: {
      behavioralState: "OVERACTIVE",
      riskLevel: "MODERATE"
    }
  });
  const unstable = alignment({
    behavioralIntelligence: {
      behavioralState: "UNSTABLE",
      riskLevel: "HIGH"
    }
  });
  const highRisk = alignment({
    behavioralIntelligence: {
      behavioralState: "CAUTION",
      riskLevel: "HIGH"
    }
  });
  const failsafeActive = alignment({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  assert.strictEqual(disciplined.aligned, true);
  assert.strictEqual(disciplined.riskAdjustment, "NONE");
  assert.strictEqual(disciplined.adjustedConfidenceLevel, "HIGH");
  assert.strictEqual(overactive.riskAdjustment, "DOWNGRADE");
  assert.strictEqual(overactive.adjustedConfidenceLevel, "MODERATE");
  assert.strictEqual(unstable.riskAdjustment, "SUPPRESS");
  assert.strictEqual(unstable.adjustedConfidenceLevel, "AVOID");
  assert.strictEqual(highRisk.riskAdjustment, "SUPPRESS");
  assert.strictEqual(failsafeActive.riskAdjustment, "SUPPRESS");

  [
    disciplined,
    overactive,
    unstable,
    highRisk,
    failsafeActive
  ].forEach(assertNoForbiddenWords);

  printAlignment("Disciplined alignment", disciplined);
  printAlignment("Overactive downgrade", overactive);
  printAlignment("Unstable suppression", unstable);
  printAlignment("High-risk suppression", highRisk);
  printAlignment("Failsafe active suppression", failsafeActive);
  console.log("\nBehavioral risk alignment test passed.");
}

run();
