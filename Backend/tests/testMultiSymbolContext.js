/*
 * Local diagnostic for watchlist-like multi-symbol context awareness.
 * It checks group bias, alignment, rankings, and safe low-data behavior.
 */

const assert = require("assert");
const {
  evaluateMultiSymbolContext
} = require("../services/multiSymbolContext");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function symbolContext(symbol, overrides = {}) {
  return {
    symbol,
    marketState: {
      directionalBias: "BULLISH"
    },
    regime: {
      type: "TRENDING_BULLISH"
    },
    confidenceProfile: {
      score: 0.82,
      level: "HIGH"
    },
    signalIntelligence: {
      signalType: "MOMENTUM_CONTINUATION",
      quality: "HIGH"
    },
    adaptiveMemoryScore: {
      score: 0.88,
      importance: "HIGH"
    },
    ...overrides
  };
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Multi-symbol context output should not contain forbidden word: ${word}`
    );
  });
}

function printContext(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const bullishAligned = evaluateMultiSymbolContext({
    symbolContexts: [
      symbolContext("NVDA"),
      symbolContext("AMD", {
        confidenceProfile: { score: 0.74, level: "MODERATE" },
        adaptiveMemoryScore: { score: 0.63, importance: "MEDIUM" }
      }),
      symbolContext("AVGO", {
        confidenceProfile: { score: 0.79, level: "HIGH" }
      })
    ]
  });
  const bearishAligned = evaluateMultiSymbolContext({
    symbolContexts: [
      symbolContext("TSLA", {
        marketState: { directionalBias: "BEARISH" },
        regime: { type: "TRENDING_BEARISH" }
      }),
      symbolContext("RIVN", {
        marketState: { directionalBias: "BEARISH" },
        regime: { type: "TRENDING_BEARISH" },
        confidenceProfile: { score: 0.69, level: "MODERATE" }
      }),
      symbolContext("LCID", {
        marketState: { directionalBias: "BEARISH" },
        regime: { type: "TRENDING_BEARISH" },
        confidenceProfile: { score: 0.77, level: "HIGH" }
      })
    ]
  });
  const mixedConflict = evaluateMultiSymbolContext({
    symbolContexts: [
      symbolContext("NVDA"),
      symbolContext("SPY", {
        marketState: { directionalBias: "BEARISH" },
        regime: { type: "TRENDING_BEARISH" },
        confidenceProfile: { score: 0.81, level: "HIGH" }
      }),
      symbolContext("QQQ", {
        marketState: { directionalBias: "NEUTRAL" },
        regime: { type: "CHOPPY" },
        confidenceProfile: { score: 0.41, level: "LOW" },
        signalIntelligence: { signalType: "LOW_CONFIDENCE_CHOP", quality: "LOW" },
        adaptiveMemoryScore: { score: 0.16, importance: "LOW" }
      })
    ]
  });
  const lowConfidence = evaluateMultiSymbolContext({
    symbolContexts: [
      symbolContext("IWM", {
        marketState: { directionalBias: "NEUTRAL" },
        regime: { type: "TRANSITIONAL" },
        confidenceProfile: { score: 0, level: "AVOID" },
        signalIntelligence: { signalType: "NO_QUALITY_SIGNAL", quality: "AVOID" },
        adaptiveMemoryScore: { score: 0, importance: "IGNORE" }
      }),
      symbolContext("DIA", {
        marketState: { directionalBias: "NEUTRAL" },
        regime: { type: "CHOPPY" },
        confidenceProfile: { score: 0.18, level: "AVOID" },
        signalIntelligence: { signalType: "NO_QUALITY_SIGNAL", quality: "AVOID" },
        adaptiveMemoryScore: { score: 0.05, importance: "IGNORE" }
      })
    ]
  });
  const insufficientData = evaluateMultiSymbolContext({
    symbolContexts: [symbolContext("META")]
  });

  assert.strictEqual(bullishAligned.groupBias, "BULLISH");
  assert.strictEqual(bullishAligned.alignment, "STRONG");
  assert.strictEqual(bearishAligned.groupBias, "BEARISH");
  assert.strictEqual(bearishAligned.alignment, "STRONG");
  assert.strictEqual(mixedConflict.groupBias, "MIXED");
  assert.strictEqual(mixedConflict.alignment, "CONFLICTED");
  assert.strictEqual(lowConfidence.groupBias, "NEUTRAL");
  assert(lowConfidence.warnings.some((warning) => warning.includes("Avoid")));
  assert.strictEqual(insufficientData.groupBias, "UNKNOWN");
  assert.strictEqual(insufficientData.alignment, "UNKNOWN");
  assert(insufficientData.warnings.length > 0);
  assert(bullishAligned.strongestSymbols.includes("NVDA"));
  assert(lowConfidence.weakestSymbols.includes("IWM"));

  [
    bullishAligned,
    bearishAligned,
    mixedConflict,
    lowConfidence,
    insufficientData
  ].forEach(assertNoForbiddenWords);

  printContext("Bullish aligned group", bullishAligned);
  printContext("Bearish aligned group", bearishAligned);
  printContext("Mixed conflicted group", mixedConflict);
  printContext("Low-confidence group", lowConfidence);
  printContext("Insufficient data", insufficientData);
  console.log("\nMulti-symbol context test passed.");
}

run();
