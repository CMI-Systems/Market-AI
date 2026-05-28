/*
 * Local diagnostic for deterministic behavioral intelligence.
 * It checks timeline-driven conditions without changing live decisions.
 */

const assert = require("assert");
const {
  evaluateBehavioralIntelligence
} = require("../services/behavioralIntelligence");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function timelineItem(overrides = {}) {
  return {
    timestamp: "2026-05-22T19:00:00.000Z",
    symbol: "NVDA",
    signalType: "MOMENTUM_CONTINUATION",
    quality: "HIGH",
    confidence: 0.84,
    regimeType: "TRENDING_BULLISH",
    alertReady: true,
    suppressed: false,
    headline: "NVDA: Momentum continuation context",
    summary: "NVDA shows momentum continuation context.",
    warnings: [],
    ...overrides
  };
}

function insightSummary(overrides = {}) {
  return {
    statistics: {
      totalSignals: 4,
      dominantSignalType: "MOMENTUM_CONTINUATION",
      dominantRegime: "TRENDING_BULLISH",
      averageConfidence: 0.82,
      suppressedSignals: 0,
      alertReadySignals: 4
    },
    ...overrides
  };
}

function behavioralInput(overrides = {}) {
  return {
    confidenceProfile: {
      score: 0.84,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    insightSummary: insightSummary(),
    behavioralRiskBrain: {
      riskLevel: "LOW"
    },
    timeline: [
      timelineItem(),
      timelineItem({ timestamp: "2026-05-22T19:01:00.000Z" }),
      timelineItem({ timestamp: "2026-05-22T19:02:00.000Z" }),
      timelineItem({ timestamp: "2026-05-22T19:03:00.000Z" })
    ],
    systemContext: {
      mode: "shadow-test"
    },
    ...overrides
  };
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Behavioral intelligence output should not contain forbidden word: ${word}`
    );
  });
}

function printBehavior(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const disciplined = evaluateBehavioralIntelligence(behavioralInput());
  const overactive = evaluateBehavioralIntelligence(behavioralInput({
    timeline: Array.from({ length: 8 }, (_, index) => timelineItem({
      timestamp: `2026-05-22T19:${String(index).padStart(2, "0")}:00.000Z`
    })),
    insightSummary: insightSummary({
      statistics: {
        totalSignals: 8,
        dominantSignalType: "MOMENTUM_CONTINUATION",
        dominantRegime: "TRENDING_BULLISH",
        averageConfidence: 0.78,
        suppressedSignals: 1,
        alertReadySignals: 8
      }
    })
  }));
  const unstable = evaluateBehavioralIntelligence(behavioralInput({
    timeline: [
      timelineItem({
        signalType: "REVERSAL_WARNING",
        confidence: 0.61,
        regimeType: "REVERSAL_RISK"
      }),
      timelineItem({
        signalType: "REVERSAL_WARNING",
        confidence: 0.58,
        regimeType: "HIGH_VOLATILITY"
      }),
      timelineItem({
        signalType: "VOLATILITY_EXPANSION",
        confidence: 0.63,
        regimeType: "HIGH_VOLATILITY"
      })
    ],
    insightSummary: insightSummary({
      statistics: {
        totalSignals: 3,
        dominantSignalType: "VOLATILITY_EXPANSION",
        dominantRegime: "HIGH_VOLATILITY",
        averageConfidence: 0.6067,
        suppressedSignals: 0,
        alertReadySignals: 3
      }
    })
  }));
  const lowConfidenceChop = evaluateBehavioralIntelligence(behavioralInput({
    confidenceProfile: {
      score: 0.38,
      level: "LOW"
    },
    signalIntelligence: {
      signalType: "LOW_CONFIDENCE_CHOP",
      quality: "LOW"
    },
    timeline: [
      timelineItem({ signalType: "LOW_CONFIDENCE_CHOP", confidence: 0.32 }),
      timelineItem({ signalType: "LOW_CONFIDENCE_CHOP", confidence: 0.41 }),
      timelineItem({ signalType: "LOW_CONFIDENCE_CHOP", confidence: 0.48 })
    ],
    insightSummary: insightSummary({
      statistics: {
        totalSignals: 3,
        dominantSignalType: "LOW_CONFIDENCE_CHOP",
        dominantRegime: "CHOPPY",
        averageConfidence: 0.4033,
        suppressedSignals: 0,
        alertReadySignals: 0
      }
    })
  }));
  const insufficientTimeline = evaluateBehavioralIntelligence(behavioralInput({
    timeline: [],
    insightSummary: insightSummary({
      statistics: {
        totalSignals: 0,
        dominantSignalType: "NONE",
        dominantRegime: "NONE",
        averageConfidence: 0,
        suppressedSignals: 0,
        alertReadySignals: 0
      }
    })
  }));

  assert.strictEqual(disciplined.behavioralState, "DISCIPLINED");
  assert.strictEqual(overactive.behavioralState, "OVERACTIVE");
  assert.strictEqual(unstable.behavioralState, "UNSTABLE");
  assert.strictEqual(unstable.riskLevel, "HIGH");
  assert.strictEqual(lowConfidenceChop.behavioralState, "CAUTION");
  assert.strictEqual(insufficientTimeline.behavioralState, "UNKNOWN");

  [
    disciplined,
    overactive,
    unstable,
    lowConfidenceChop,
    insufficientTimeline
  ].forEach(assertNoForbiddenWords);

  printBehavior("Disciplined environment", disciplined);
  printBehavior("Overactive signal history", overactive);
  printBehavior("Unstable reversal-heavy history", unstable);
  printBehavior("Low-confidence chop", lowConfidenceChop);
  printBehavior("Insufficient timeline data", insufficientTimeline);
  console.log("\nBehavioral intelligence test passed.");
}

run();
