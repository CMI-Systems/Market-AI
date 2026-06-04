const regimes = ["EXPANSION", "CAUTION", "STABILIZING", "OPTIMAL"];
const consensusStates = ["MODERATE", "STRONG", "WEAK", "STRONG"];
const escalationLevels = ["NONE", "LOW", "NONE", "MODERATE"];
const feedMessages = [
  "Consensus strengthened across tactical and behavioral cognition.",
  "Memory reinforcement detected in recent market context.",
  "Liquidity pressure remains under active observation.",
  "Failsafe layer confirms protection posture remains available.",
  "Adaptive signal cognition updated operator priority.",
  "Risk acceleration monitor reports stable escalation context.",
];

function cycleIndex(length, intervalMs = 10000) {
  return Math.floor(Date.now() / intervalMs) % length;
}

function isoMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function currentState() {
  const index = cycleIndex(regimes.length);
  const consensus = consensusStates[index];
  const environment = regimes[index];
  const escalationLevel = escalationLevels[index];
  const confidenceScore = [0.68, 0.82, 0.46, 0.91][index];
  const isEscalating = escalationLevel !== "NONE";

  return {
    consensus,
    environment,
    escalationLevel,
    confidenceScore,
    index,
    isEscalating,
  };
}

function eventSeverity(index) {
  return index % 4 === 0 ? "HIGH" : index % 3 === 0 ? "MODERATE" : "LOW";
}

function priorityEvents() {
  return feedMessages.map((message, index) => ({
    type: index % 2 === 0 ? "CONSENSUS" : "MEMORY",
    timestamp: isoMinutesAgo(index * 4),
    message,
    severity: eventSeverity(index),
  }));
}

function overview() {
  const state = currentState();
  const triggers = state.isEscalating ? ["stability_monitor", "risk_acceleration"] : [];

  return {
    backend: "demo",
    timestamp: new Date().toISOString(),
    symbol: "SPY",
    provider: "demo",
    mode: "DEMO",
    marketOpen: true,
    runtimeHealth: {
      status: "HEALTHY",
      summary: "Demo runtime is serving local cognition responses.",
    },
    strategicEnvironment: {
      environment: state.environment,
      stability: state.environment === "CAUTION" ? "MONITORING" : "STABLE",
      warnings: state.isEscalating ? ["Escalation monitor is tracking elevated context."] : [],
      summary: `${state.environment} demo cognition is active for investor presentation.`,
    },
    confidence: {
      score: state.confidenceScore,
      level: state.confidenceScore >= 0.8 ? "HIGH" : state.confidenceScore >= 0.55 ? "MODERATE" : "LOW",
      consensusStrength: state.consensus,
    },
    consensus: {
      consensusStrength: state.consensus,
      summary: `${state.consensus} consensus is visible across demo cognition systems.`,
    },
    stabilityForecast: {
      trajectory: state.environment === "CAUTION" ? "MONITORING" : "STABLE",
      confidence: state.confidenceScore,
      summary: "Demo stability forecast is updating from simulated cognition cadence.",
    },
    escalation: {
      escalationLevel: state.escalationLevel,
      triggers,
      elevatedEvents: triggers.map((trigger, index) => ({
        type: trigger,
        level: state.escalationLevel,
        timestamp: isoMinutesAgo(index + 1),
        summary: "Demo escalation monitor flagged this context for review.",
      })),
      summary: state.isEscalating
        ? `${state.escalationLevel} demo escalation context is visible.`
        : "Escalation context is calm across demo cognition.",
    },
  };
}

function brainStatus() {
  const state = currentState();

  return {
    tacticalBrain: {
      status: state.consensus === "WEAK" ? "OBSERVING" : "ANALYZING",
      bias: state.environment === "CAUTION" ? "NEUTRAL" : "RISK_ON",
      confidence: state.confidenceScore,
      reason: "Demo tactical cognition is synthesizing market opportunity context.",
    },
    behavioralBrain: {
      status: "OBSERVING",
      bias: state.confidenceScore >= 0.55 ? "ALIGNED" : "CAUTION",
      confidence: Math.max(0, state.confidenceScore - 0.08),
      reason: "Demo behavioral cognition is monitoring crowd alignment.",
    },
    failsafeBrain: {
      status: state.isEscalating ? "ACTIVE" : "STANDBY",
      bias: state.isEscalating ? "RISK_OFF" : "OBSERVATION_ONLY",
      confidence: state.isEscalating ? 0.88 : 0.64,
      reason: "Demo failsafe cognition is monitoring protection status.",
    },
    summary: "Demo brain status is available for cockpit visualization.",
  };
}

function temporalMemory() {
  return {
    temporalState: "RECURRING_PATTERN",
    memoryDepth: "MODERATE",
    recurringPatterns: [
      { type: "environment", value: currentState().environment, count: 3 },
      { type: "consensus", value: currentState().consensus, count: 2 },
    ],
    agingContexts: [],
    longHorizonSignals: [],
    warnings: [],
    summary: "Demo temporal memory is reinforcing recent cognition patterns.",
  };
}

function recurrence() {
  return {
    recurrenceState: "DETECTED",
    recurrenceStrength: "MODERATE",
    recurringThemes: [
      { theme: "CONSENSUS", value: "CONSENSUS BUILDING", count: 3 },
      { theme: "RISK", value: "RISK ELEVATION", count: 2 },
    ],
    affectedEcosystems: ["SPY"],
    warnings: [],
    summary: "Demo recurrence cognition detected repeated consensus and risk themes.",
  };
}

function reinforcementWeighting() {
  return {
    reinforcementState: "REINFORCING",
    reinforcedFactors: [{ factor: "CONSENSUS BUILDING", weight: "HIGH" }],
    weakenedFactors: [],
    learningWeight: 0.72,
    warnings: [],
    summary: "Demo reinforcement weighting is strengthening consensus memory.",
  };
}

function persistentMemory() {
  return {
    memoryState: "ACTIVE",
    memoryEntries: [
      {
        timestamp: isoMinutesAgo(3),
        environment: currentState().environment,
        consensusState: "FULL_CONSENSUS",
        reinforcementLevel: "HIGH",
        suppressionState: "REINFORCED",
        escalationLevel: currentState().escalationLevel,
        recurrenceState: "DETECTED",
      },
      {
        timestamp: isoMinutesAgo(8),
        environment: "STABILIZING",
        consensusState: "PARTIAL_CONSENSUS",
        reinforcementLevel: "MODERATE",
        suppressionState: "OBSERVING",
        escalationLevel: "NONE",
        recurrenceState: "DETECTED",
      },
      {
        timestamp: isoMinutesAgo(13),
        environment: "EXPANSION",
        consensusState: "FULL_CONSENSUS",
        reinforcementLevel: "HIGH",
        suppressionState: "REINFORCED",
        escalationLevel: "LOW",
        recurrenceState: "ACTIVE",
      },
    ],
    retentionStatus: "ACTIVE",
    compressionState: "UNCOMPRESSED",
    warnings: [],
    summary: "Demo persistent cognition memory contains retained presentation cycles.",
  };
}

function health() {
  return {
    status: "HEALTHY",
    uptimeMs: Date.now() % 1000000,
    memory: { heapUsedMb: 42 },
    summary: "Demo health endpoint is available.",
  };
}

export function getDemoResponse(endpoint) {
  const state = currentState();

  const responses = {
    "/api/cognition/overview": overview(),
    "/api/cognition/brain-status": brainStatus(),
    "/api/cognition/confidence": overview().confidence,
    "/api/cognition/strategic-environment": overview().strategicEnvironment,
    "/api/cognition/liquidity-pressure": {
      liquidityState: state.environment === "CAUTION" ? "STRESSED" : "HEALTHY",
      pressureState: state.environment === "CAUTION" ? "ELEVATED" : "NORMAL",
      vulnerabilityLevel: state.isEscalating ? "MODERATE" : "LOW",
      volatility: state.isEscalating ? "ELEVATED" : "NORMAL",
      status: state.isEscalating ? "MONITORING" : "STABLE",
      summary: "Demo liquidity pressure is updating from presentation cadence.",
    },
    "/api/cognition/institutional-flow": {
      flowState: state.environment === "EXPANSION" ? "ACCUMULATION" : "OBSERVING",
      flowStrength: state.consensus === "STRONG" ? "HIGH" : "MODERATE",
      confidence: state.confidenceScore,
      status: "ACTIVE",
      summary: "Demo institutional flow remains visible in cognition synthesis.",
    },
    "/api/cognition/priority-feed": {
      feedState: "ACTIVE",
      events: priorityEvents(),
      warnings: [],
      summary: "Demo priority cognition feed is rotating live intelligence events.",
    },
    "/api/health": health(),
    "/api/cognition/temporal-memory": temporalMemory(),
    "/api/cognition/recurrence": recurrence(),
    "/api/cognition/reinforcement-weighting": reinforcementWeighting(),
    "/api/cognition/persistent-memory": persistentMemory(),
    "/api/cognition/adaptive-signals": {
      signalState: "REINFORCED",
      suppressionLevel: "LOW",
      reinforcementLevel: "HIGH",
      confidenceWeight: state.confidenceScore,
      warnings: [],
      summary: "Demo adaptive signal cognition is reinforcing consensus visibility.",
    },
  };

  return responses[endpoint] || null;
}
