/*
 * Local diagnostic for dynamic watchlist intelligence.
 * It validates symbol ranking, context grouping, summaries, and safe language.
 */

const assert = require("assert");
const {
  evaluateDynamicWatchlist,
  groupWatchlistContexts,
  prioritizeWatchlistSymbols,
  summarizeDynamicWatchlist
} = require("../services/dynamicWatchlistIntelligence");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Dynamic watchlist output should not contain forbidden word: ${word}`
    );
  });
}

function symbolContext(symbol, overrides = {}) {
  return {
    symbol,
    marketState: {
      directionalBias: "NEUTRAL"
    },
    regime: {
      type: "RANGING",
      confidence: 0.5
    },
    confidenceProfile: {
      level: "MODERATE",
      score: 0.62
    },
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    adaptiveMemoryScore: {
      importance: "LOW",
      score: 0.28
    },
    strategicEnvironment: {
      environment: "FAVORABLE",
      stability: "MODERATE"
    },
    intelligenceStabilityForecast: {
      trajectory: "STABLE",
      confidence: 0.72
    },
    ...overrides
  };
}

function printResult(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const symbolContexts = [
    symbolContext("MSFT", {
      confidenceProfile: { level: "HIGH", score: 0.86 },
      strategicEnvironment: { environment: "OPTIMAL", stability: "HIGH" },
      adaptiveMemoryScore: { importance: "LOW", score: 0.22 }
    }),
    symbolContext("NVDA", {
      confidenceProfile: { level: "LOW", score: 0.32 },
      anomalyIntelligence: {
        anomalyDetected: true,
        severity: "HIGH"
      },
      adaptiveMemoryScore: {
        importance: "HIGH",
        score: 0.91
      },
      strategicEnvironment: {
        environment: "HIGH_RISK",
        stability: "LOW"
      },
      intelligenceStabilityForecast: {
        trajectory: "DETERIORATING",
        confidence: 0.8
      }
    }),
    symbolContext("TSLA", {
      confidenceProfile: { level: "LOW", score: 0.28 },
      anomalyIntelligence: {
        anomalyDetected: true,
        severity: "MEDIUM"
      },
      strategicEnvironment: {
        environment: "UNSTABLE",
        stability: "FRAGMENTED"
      },
      intelligenceStabilityForecast: {
        trajectory: "FRAGMENTING",
        confidence: 0.78
      }
    }),
    symbolContext("SPY", {
      confidenceProfile: { level: "MODERATE", score: 0.58 },
      anomalyIntelligence: {
        anomalyDetected: false,
        severity: "NONE"
      },
      strategicEnvironment: {
        environment: "CAUTION",
        stability: "MODERATE"
      },
      intelligenceStabilityForecast: {
        trajectory: "STABILIZING",
        confidence: 0.66
      }
    }),
    symbolContext("AMD", {
      confidenceProfile: { level: "MODERATE", score: 0.6 },
      anomalyIntelligence: {
        anomalyDetected: true,
        severity: "LOW"
      },
      adaptiveMemoryScore: {
        importance: "MEDIUM",
        score: 0.52
      },
      strategicEnvironment: {
        environment: "CAUTION",
        stability: "MODERATE"
      },
      intelligenceStabilityForecast: {
        trajectory: "RECOVERING",
        confidence: 0.59
      }
    })
  ];
  const prioritizedInsights = [
    {
      id: "insight-nvda",
      symbol: "NVDA",
      priority: "HIGH",
      summary: "NVDA has elevated anomaly context."
    },
    {
      id: "insight-tsla",
      symbol: "TSLA",
      priority: "MEDIUM",
      summary: "TSLA has fragmented strategic context."
    }
  ];
  const input = {
    symbolContexts,
    prioritizedInsights,
    strategicEnvironment: {
      environment: "CAUTION",
      stability: "FRAGMENTED"
    },
    intelligenceConsensus: {
      consensusStrength: "CONFLICTED"
    },
    environmentalPressure: {
      pressureLevel: "HIGH",
      pressureScore: 0.78
    }
  };
  const prioritized = prioritizeWatchlistSymbols(input);
  const grouped = groupWatchlistContexts(input);
  const evaluated = evaluateDynamicWatchlist(input);
  const summary = summarizeDynamicWatchlist({
    ...input,
    prioritizedSymbols: prioritized,
    groupedContexts: grouped
  });
  const empty = evaluateDynamicWatchlist({
    symbolContexts: []
  });

  assert.strictEqual(prioritized[0].symbol, "NVDA");
  assert.strictEqual(prioritized[0].focus, "HIGH_FOCUS");
  assert(prioritized.find((item) => item.symbol === "MSFT"));
  assert(
    prioritized.findIndex((item) => item.symbol === "NVDA") <
      prioritized.findIndex((item) => item.symbol === "MSFT")
  );
  assert(grouped.length >= 4);
  assert.strictEqual(evaluated.watchlistPriority, "HIGH_FOCUS");
  assert(evaluated.warnings.some((warning) => warning.includes("pressure")));
  assert(evaluated.warnings.some((warning) => warning.includes("conflicted")));
  assert(summary.highestPrioritySymbols.includes("NVDA"));
  assert(summary.totalSymbols === symbolContexts.length);
  assert.strictEqual(empty.watchlistPriority, "BACKGROUND");
  assert(empty.warnings.length > 0);

  [
    prioritized,
    grouped,
    evaluated,
    summary,
    empty
  ].forEach(assertNoForbiddenWords);

  printResult("Prioritized watchlist symbols", prioritized);
  printResult("Grouped watchlist contexts", grouped);
  printResult("Dynamic watchlist evaluation", evaluated);
  printResult("Dynamic watchlist summary", summary);
  console.log("\nDynamic watchlist intelligence test passed.");
}

run();
