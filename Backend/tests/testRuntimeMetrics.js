/*
 * Local diagnostic for Runtime Metrics.
 * It updates in-memory counters directly and confirms they reflect pipeline health.
 */

const assert = require("assert");
const {
  getRuntimeMetrics,
  recordBrainOutput,
  recordIngestionEvent,
  recordStreamStart,
  recordStreamStop,
  resetRuntimeMetrics
} = require("../services/runtimeMetrics");

function run() {
  resetRuntimeMetrics();

  recordIngestionEvent({ accepted: true });
  recordIngestionEvent({ accepted: false });

  recordBrainOutput({
    finalDecision: {
      actionBias: "NEUTRAL"
    },
    failsafeBrain: {
      status: "STANDBY"
    },
    shadowTraining: {
      observed: true,
      logged: false
    }
  });

  recordBrainOutput({
    finalDecision: {
      actionBias: "NO_TRADE"
    },
    failsafeBrain: {
      status: "ACTIVE"
    },
    shadowTraining: {
      observed: true,
      logged: true
    }
  });

  recordStreamStart({
    source: "simulated",
    symbol: "NVDA"
  });
  recordStreamStop();

  const metrics = getRuntimeMetrics();

  assert.strictEqual(metrics.totalEventsReceived, 2);
  assert.strictEqual(metrics.totalEventsAccepted, 1);
  assert.strictEqual(metrics.totalEventsRejected, 1);
  assert.strictEqual(metrics.totalBrainOutputs, 2);
  assert.strictEqual(metrics.totalFailsafeActivations, 1);
  assert.strictEqual(metrics.totalShadowObserved, 2);
  assert.strictEqual(metrics.totalShadowLogged, 1);
  assert.strictEqual(metrics.lastActionBias, "NO_TRADE");
  assert.strictEqual(metrics.lastFailsafeStatus, "ACTIVE");
  assert.strictEqual(metrics.activeStream, false);
  assert.strictEqual(metrics.streamSource, "simulated");
  assert.strictEqual(metrics.streamSymbol, "NVDA");

  console.log(JSON.stringify(metrics, null, 2));
  console.log("Runtime metrics test passed.");
}

run();
