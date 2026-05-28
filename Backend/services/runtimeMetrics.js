/*
 * In-memory runtime metrics for the live intelligence pipeline.
 * These counters are for local health visibility only and are not persisted.
 */

const processStartedAt = Date.now();

function createEmptyMetrics() {
  return {
    totalEventsReceived: 0,
    totalEventsAccepted: 0,
    totalEventsRejected: 0,
    totalBrainOutputs: 0,
    totalFailsafeActivations: 0,
    totalLowConfidenceOutputs: 0,
    totalShadowObserved: 0,
    totalShadowLogged: 0,
    lastEventAt: null,
    lastAcceptedAt: null,
    lastRejectedAt: null,
    lastActionBias: null,
    lastFailsafeStatus: null,
    activeStream: false,
    streamSource: null,
    streamSymbol: null,
    streamStartedAt: null,
    streamStoppedAt: null
  };
}

let metrics = createEmptyMetrics();

function nowIso() {
  return new Date().toISOString();
}

function resetRuntimeMetrics() {
  metrics = createEmptyMetrics();
  return getRuntimeMetrics();
}

function recordIngestionEvent({ accepted } = {}) {
  const timestamp = nowIso();

  metrics.totalEventsReceived += 1;
  metrics.lastEventAt = timestamp;

  if (accepted) {
    metrics.totalEventsAccepted += 1;
    metrics.lastAcceptedAt = timestamp;
    return;
  }

  metrics.totalEventsRejected += 1;
  metrics.lastRejectedAt = timestamp;
}

function recordBrainOutput(brainOutput = {}) {
  const failsafeStatus = brainOutput.failsafeBrain?.status || null;
  const shadowTraining = brainOutput.shadowTraining || {};

  metrics.totalBrainOutputs += 1;
  metrics.lastActionBias = brainOutput.finalDecision?.actionBias || null;
  metrics.lastFailsafeStatus = failsafeStatus;

  if (failsafeStatus === "ACTIVE") {
    metrics.totalFailsafeActivations += 1;
  }

  if (["LOW", "AVOID"].includes(brainOutput.confidenceProfile?.level)) {
    metrics.totalLowConfidenceOutputs += 1;
  }

  if (shadowTraining.observed === true) {
    metrics.totalShadowObserved += 1;
  }

  if (shadowTraining.logged === true) {
    metrics.totalShadowLogged += 1;
  }
}

function recordStreamStart({ source, symbol } = {}) {
  metrics.activeStream = true;
  metrics.streamSource = source || null;
  metrics.streamSymbol = symbol || null;
  metrics.streamStartedAt = nowIso();
  metrics.streamStoppedAt = null;
}

function recordStreamStop() {
  metrics.activeStream = false;
  metrics.streamStoppedAt = nowIso();
}

function getRuntimeMetrics() {
  return {
    ...metrics,
    uptimeMs: Date.now() - processStartedAt
  };
}

module.exports = {
  getRuntimeMetrics,
  recordBrainOutput,
  recordIngestionEvent,
  recordStreamStart,
  recordStreamStop,
  resetRuntimeMetrics
};
