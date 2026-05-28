/*
 * Local diagnostic for deterministic runtime health scoring.
 * It verifies operational health status without changing pipeline behavior.
 */

const assert = require("assert");
const {
  evaluateRuntimeHealth
} = require("../services/runtimeHealthScoring");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function metrics(overrides = {}) {
  return {
    totalEventsReceived: 20,
    totalEventsAccepted: 20,
    totalEventsRejected: 0,
    totalBrainOutputs: 20,
    totalFailsafeActivations: 0,
    totalLowConfidenceOutputs: 0,
    activeStream: true,
    streamStartedAt: "2026-05-22T14:30:00.000Z",
    ...overrides
  };
}

function memoryStatus(overrides = {}) {
  return {
    totalSymbolsTracked: 2,
    totalEventsStored: 18,
    memoryBySymbol: {
      NVDA: { "1m": 10 },
      AMD: { "1m": 8 }
    },
    ...overrides
  };
}

function streamStatus(overrides = {}) {
  return {
    active: true,
    eventsProcessed: 20,
    maxEvents: 50,
    stoppedAt: null,
    ...overrides
  };
}

function health(overrides = {}) {
  return evaluateRuntimeHealth({
    runtimeMetrics: metrics(),
    failsafeBrain: {
      status: "STANDBY"
    },
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    confidenceProfile: {
      score: 0.84,
      level: "HIGH"
    },
    streamStatus: streamStatus(),
    memoryStatus: memoryStatus(),
    ...overrides
  });
}

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Runtime health output should not contain forbidden word: ${word}`
    );
  });
}

function printHealth(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const healthy = health();
  const degraded = health({
    runtimeMetrics: metrics({
      totalEventsReceived: 10,
      totalEventsAccepted: 7,
      totalEventsRejected: 3,
      totalLowConfidenceOutputs: 4
    }),
    confidenceProfile: {
      score: 0.38,
      level: "LOW"
    },
    streamStatus: streamStatus({
      active: true,
      stoppedAt: "2026-05-22T14:31:00.000Z"
    })
  });
  const critical = health({
    runtimeMetrics: metrics({
      totalEventsReceived: 10,
      totalEventsAccepted: 3,
      totalEventsRejected: 7
    }),
    memoryStatus: {
      totalSymbolsTracked: -1,
      totalEventsStored: -1,
      memoryBySymbol: null
    }
  });
  const anomalyHeavy = health({
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "HIGH"
    },
    confidenceProfile: {
      score: 0.48,
      level: "LOW"
    }
  });
  const failsafeActive = health({
    failsafeBrain: {
      status: "ACTIVE"
    }
  });

  assert.strictEqual(healthy.status, "HEALTHY");
  assert(healthy.healthScore >= 0.8);
  assert(["DEGRADED", "UNSTABLE"].includes(degraded.status));
  assert(degraded.warnings.some((warning) => warning.includes("Stream")));
  assert(degraded.warnings.some((warning) => warning.includes("low-confidence")));
  assert.strictEqual(critical.status, "CRITICAL");
  assert(critical.warnings.some((warning) => warning.includes("ingestion")));
  assert(["DEGRADED", "STABLE"].includes(anomalyHeavy.status));
  assert(anomalyHeavy.warnings.some((warning) => warning.includes("Anomaly")));
  assert.strictEqual(failsafeActive.status, "CRITICAL");
  assert.strictEqual(failsafeActive.healthScore, 0);

  [
    healthy,
    degraded,
    critical,
    anomalyHeavy,
    failsafeActive
  ].forEach(assertNoForbiddenWords);

  printHealth("Healthy runtime", healthy);
  printHealth("Degraded runtime", degraded);
  printHealth("Critical runtime", critical);
  printHealth("Anomaly-heavy runtime", anomalyHeavy);
  printHealth("Failsafe active runtime", failsafeActive);
  console.log("\nRuntime health scoring test passed.");
}

run();
