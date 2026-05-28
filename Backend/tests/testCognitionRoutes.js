const assert = require("assert");
const {
  buildBehavioralState,
  buildBrainStatus,
  buildConfidence,
  buildEscalationEndpoint,
  buildOverview,
  buildReplaySummaryEndpoint,
  buildStrategicEnvironment,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

const FORBIDDEN_WORD_PATTERN = /\b(BUY|SELL|CALL|PUT|entry|exit)\b/i;

function assertNoForbiddenWords(value) {
  const text = JSON.stringify(value);
  assert(
    !FORBIDDEN_WORD_PATTERN.test(text),
    `Forbidden output language found in ${text}`
  );
}

function collectEndpointResponses() {
  return [
    buildOverview(),
    buildBrainStatus(),
    buildStrategicEnvironment(),
    buildConfidence(),
    buildBehavioralState(),
    buildReplaySummaryEndpoint(),
    buildEscalationEndpoint()
  ];
}

clearLatestCognitionSnapshot();

const awaitingResponses = collectEndpointResponses();

awaitingResponses.forEach(assertNoForbiddenWords);
assert.strictEqual(buildOverview().symbol, "Awaiting backend cognition");
assert.strictEqual(buildBrainStatus().summary, "Awaiting backend cognition");

setLatestCognitionSnapshot({
  backend: "connected",
  timestamp: "2026-05-24T20:00:00.000Z",
  symbol: "NVDA",
  provider: "simulated",
  mode: "closed-market-sim",
  marketOpen: false,
  runtimeHealth: {
    status: "STABLE",
    healthScore: 0.75,
    summary: "Runtime health is stable."
  },
  strategicEnvironment: {
    environment: "CAUTION",
    stability: "LOW",
    warnings: ["Confidence quality is restrained."],
    summary: "Strategic environment warrants caution."
  },
  confidence: {
    score: 0.42,
    level: "LOW",
    components: {
      marketState: 0.4,
      regime: 0.3
    },
    warnings: ["Market state remains unknown."]
  },
  consensus: {
    consensusStrength: "WEAK",
    warnings: ["Context remains limited."],
    summary: "Consensus is weak because context remains limited."
  },
  stabilityForecast: {
    trajectory: "RECOVERING",
    confidence: 0.65,
    warnings: [],
    summary: "Stability shows early recovery characteristics."
  },
  tacticalBrain: {
    status: "OBSERVING",
    bias: "NEUTRAL",
    confidence: 0,
    reason: "Normalized market context is being observed."
  },
  behavioralBrain: {
    status: "OBSERVING",
    bias: "ALIGNED",
    confidence: 0,
    reason: "Behavioral context is limited."
  },
  failsafeBrain: {
    status: "STANDBY",
    bias: "NO_TRADE",
    confidence: 0,
    reason: "Failsafe brain is standing by."
  },
  strategicDetails: {
    pressureLevel: "MODERATE",
    pressureScore: 0.22,
    pressureSummary: "Moderate pressure is present."
  },
  behavioralState: {
    behavioralState: "UNKNOWN",
    riskLevel: "MODERATE",
    alignment: "ALIGNED",
    reflectionTheme: "UNCERTAINTY",
    journalMood: "UNCERTAIN",
    summary: "Behavioral conditions are not yet clear."
  },
  replaySummary: {
    recentEvents: [],
    recentSnapshots: [],
    compressionSummary: "Replay compression endpoint pending.",
    timelineSummary: "Timeline summary endpoint pending.",
    replayFrameSummary: "Replay frame endpoint pending."
  },
  escalation: {
    escalationLevel: "NONE",
    triggers: [],
    elevatedEvents: [],
    summary: "Escalation context is calm."
  }
});

const storedResponses = collectEndpointResponses();

storedResponses.forEach(assertNoForbiddenWords);
assert.strictEqual(buildOverview().backend, "connected");
assert.strictEqual(buildOverview().symbol, "NVDA");
assert.strictEqual(buildBrainStatus().tacticalBrain.status, "OBSERVING");
assert.strictEqual(buildStrategicEnvironment().environment, "CAUTION");
assert.strictEqual(buildConfidence().score, 0.42);
assert.strictEqual(buildBehavioralState().riskLevel, "MODERATE");
assert(Array.isArray(buildReplaySummaryEndpoint().recentEvents));
assert.strictEqual(buildEscalationEndpoint().escalationLevel, "NONE");

console.log("Cognition routes test passed.");
