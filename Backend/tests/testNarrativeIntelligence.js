/*
 * Local diagnostic for template-based narrative intelligence.
 * It checks narrative scenarios and blocks recommendation vocabulary.
 */

const assert = require("assert");
const {
  buildMarketNarrative
} = require("../services/narrativeIntelligence");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function narrative(overrides = {}) {
  return buildMarketNarrative({
    symbol: "NVDA",
    marketState: {
      momentum: "ACCELERATING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "TRENDING_BULLISH"
    },
    confidenceProfile: {
      score: 0.85,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      warnings: []
    },
    behavioralRiskBrain: {
      riskLevel: "LOW"
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
      `Narrative output should not contain forbidden word: ${word}`
    );
  });
}

function printNarrative(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const momentum = narrative();
  const volatility = narrative({
    signalIntelligence: {
      signalType: "VOLATILITY_EXPANSION",
      warnings: []
    }
  });
  const compression = narrative({
    marketState: {
      momentum: "STABLE",
      volatility: "NORMAL",
      directionalBias: "NEUTRAL",
      compression: "COMPRESSED"
    },
    regime: {
      type: "BREAKOUT_ATTEMPT"
    },
    signalIntelligence: {
      signalType: "COMPRESSION_BREAKOUT_SETUP",
      warnings: ["Expansion remains unconfirmed."]
    }
  });
  const reversal = narrative({
    marketState: {
      momentum: "REVERSING",
      volatility: "NORMAL",
      directionalBias: "BULLISH",
      compression: "NORMAL"
    },
    regime: {
      type: "REVERSAL_RISK"
    },
    signalIntelligence: {
      signalType: "REVERSAL_WARNING",
      warnings: ["Context may be changing."]
    }
  });
  const chop = narrative({
    confidenceProfile: {
      score: 0.4,
      level: "LOW"
    },
    regime: {
      type: "CHOPPY"
    },
    signalIntelligence: {
      signalType: "LOW_CONFIDENCE_CHOP",
      warnings: ["Directional quality is limited."]
    }
  });
  const failsafe = narrative({
    confidenceProfile: {
      score: 0,
      level: "AVOID"
    },
    signalIntelligence: {
      signalType: "NO_QUALITY_SIGNAL",
      warnings: ["Failsafe brain is active."]
    },
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  [momentum, volatility, compression, reversal, chop, failsafe]
    .forEach(assertNoForbiddenWords);

  printNarrative("Momentum continuation", momentum);
  printNarrative("Volatility expansion", volatility);
  printNarrative("Compression setup", compression);
  printNarrative("Reversal warning", reversal);
  printNarrative("Choppy low confidence", chop);
  printNarrative("Failsafe active", failsafe);
  console.log("\nNarrative intelligence test passed.");
}

run();
