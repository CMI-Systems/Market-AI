const crypto = require("crypto");
const { buildAiccAlerts } = require("./aiccAlerts");
const { buildAiccSystemStatus } = require("./aiccSystemStatus");
const {
  buildBrainStatus,
  buildOverview
} = require("./cognitionSnapshotStore");
const {
  getProviderSignals,
  getProviderStatus
} = require("./marketProviderService");

const DEFAULT_REPLAY_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];

function buildCognitionContext({ overview, systemStatus }) {
  return {
    consensus: String(overview?.consensus?.consensusStrength || "UNKNOWN").toUpperCase(),
    environment: String(
      overview?.strategicEnvironment?.environment || systemStatus.environment || "UNKNOWN"
    ).toUpperCase(),
    decision: systemStatus.mode === "LIVE_ANALYSIS" ? "MONITOR" : "OBSERVE",
    escalation: String(overview?.escalation?.escalationLevel || "NONE").toUpperCase()
  };
}

function createReplayEvent({
  type,
  symbol,
  title,
  summary,
  confidence,
  risk,
  source,
  cognition,
  timestamp
}) {
  return {
    id: crypto.randomUUID(),
    timestamp: timestamp || new Date().toISOString(),
    type,
    symbol: symbol || null,
    title,
    summary,
    confidence: Number.isFinite(Number(confidence)) ? Number(confidence) : null,
    risk: risk || "LOW",
    source,
    cognition
  };
}

async function buildAiccReplay(options = {}) {
  const symbols = options.symbols || DEFAULT_REPLAY_SYMBOLS;
  const timestamp = new Date().toISOString();
  const [providerSignals, alerts, providerStatus] = await Promise.all([
    getProviderSignals(symbols),
    buildAiccAlerts({ symbols }),
    Promise.resolve(getProviderStatus())
  ]);
  const overview = buildOverview();
  const brainStatus = buildBrainStatus();
  const systemStatus = buildAiccSystemStatus({ providerStatus });
  const cognition = buildCognitionContext({ overview, systemStatus });
  const replay = [];

  providerSignals.forEach((signal) => {
    replay.push(createReplayEvent({
      timestamp: signal.updatedAt || timestamp,
      type: "SIGNAL",
      symbol: signal.symbol,
      title: signal.signal,
      summary: `Provider signal adapter detected ${String(signal.signal).toLowerCase()} conditions. ${signal.reason}`,
      confidence: signal.confidence,
      risk: signal.risk,
      source: `${signal.provider} SIGNAL ADAPTER`,
      cognition
    }));
  });

  alerts.forEach((alert) => {
    replay.push(createReplayEvent({
      timestamp: alert.timestamp,
      type: "ALERT",
      symbol: null,
      title: alert.title,
      summary: alert.message,
      confidence: null,
      risk: alert.severity === "CRITICAL" ? "HIGH" : alert.severity,
      source: alert.source,
      cognition
    }));
  });

  replay.push(createReplayEvent({
    timestamp: overview.timestamp || timestamp,
    type: "CONSENSUS",
    title: "Consensus Snapshot",
    summary: `Consensus state is ${cognition.consensus} within ${cognition.environment} environment.`,
    confidence: systemStatus.score,
    risk: cognition.escalation === "NONE" ? "LOW" : cognition.escalation,
    source: "AICC CONSENSUS ENGINE",
    cognition
  }));

  replay.push(createReplayEvent({
    timestamp,
    type: "EXECUTIVE",
    title: "Executive Decision",
    summary: `AICC executive posture is ${cognition.decision} while provider mode is ${systemStatus.mode}.`,
    confidence: systemStatus.score,
    risk: systemStatus.stability === "STABLE" ? "LOW" : "MODERATE",
    source: "AICC EXECUTIVE INTELLIGENCE",
    cognition
  }));

  replay.push(createReplayEvent({
    timestamp: providerStatus.lastUpdate || timestamp,
    type: "PROVIDER",
    title: "Provider Status",
    summary: `${providerStatus.activeProvider} active. Primary provider ${providerStatus.primaryProvider}. Health ${providerStatus.providerHealth}.`,
    confidence: systemStatus.score,
    risk: providerStatus.providerHealth === "HEALTHY" ? "LOW" : "MODERATE",
    source: "MARKET PROVIDER ADAPTER",
    cognition
  }));

  replay.push(createReplayEvent({
    timestamp,
    type: "FAILSAFE",
    title: "Failsafe State",
    summary: `Failsafe brain is ${brainStatus?.failsafeBrain?.status || systemStatus.brains?.failsafe || "STANDBY"}.`,
    confidence: Math.round((brainStatus?.failsafeBrain?.confidence || 0) * 100),
    risk: systemStatus.brains?.failsafe === "MONITORING" ? "LOW" : "MODERATE",
    source: "FAILSAFE BRAIN",
    cognition
  }));

  return replay.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

module.exports = {
  DEFAULT_REPLAY_SYMBOLS,
  buildAiccReplay
};
