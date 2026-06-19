const crypto = require("crypto");
const {
  buildBrainStatus,
  buildOverview
} = require("./cognitionSnapshotStore");
const { buildAiccSystemStatus } = require("./aiccSystemStatus");
const {
  getProviderSignals,
  getProviderStatus
} = require("./marketProviderService");

const DEFAULT_ALERT_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];

function isValidTimestamp(timestamp) {
  return Number.isFinite(new Date(timestamp).getTime());
}

function createAlert({ severity, source, category, title, message, timestamp }) {
  const stableKey = [source, category, title, message].map((value) => String(value || "UNKNOWN")).join("|");

  return {
    id: `alert-${crypto.createHash("sha256").update(stableKey).digest("hex").slice(0, 16)}`,
    timestamp: isValidTimestamp(timestamp) ? timestamp : null,
    severity,
    source,
    category,
    title,
    message,
    status: "NEW",
    acknowledged: false,
    dismissed: false,
    sourceType: source,
    warnings: []
  };
}

function severityForSignal(signal) {
  if (signal.signal === "RISK WATCH" || signal.risk === "HIGH") return "WARNING";
  if (signal.confidence >= 80) return "NOTICE";
  return "INFO";
}

function isActionableProviderSignal(signal = {}) {
  const sourceType = String(signal.sourceType || signal.dataState || "").toUpperCase();
  const timestamp = signal.updatedAt || signal.timestamp;
  const blockedSourceTypes = new Set([
    "SIMULATED",
    "GENERATED",
    "UNKNOWN_SOURCE",
    "INVALID_TIMESTAMP",
    "PROVIDER_OFFLINE",
    "BACKEND_UNAVAILABLE",
    "DATA_UNAVAILABLE",
    "PROVIDER_UNAVAILABLE",
    "BLOCKED"
  ]);

  return signal.available === true &&
    signal.simulated !== true &&
    signal.generated !== true &&
    String(signal.provider || "").toUpperCase() === "ALPACA" &&
    signal.signal &&
    !["NEUTRAL", "UNAVAILABLE", "DATA_UNAVAILABLE"].includes(String(signal.signal).toUpperCase()) &&
    !blockedSourceTypes.has(sourceType) &&
    Number.isFinite(new Date(timestamp).getTime()) &&
    Number.isFinite(Number(signal.confidence));
}

async function buildAiccAlerts(options = {}) {
  const symbols = options.symbols || DEFAULT_ALERT_SYMBOLS;
  const timestamp = new Date().toISOString();
  const alerts = [];
  const [providerSignals, providerStatus] = await Promise.all([
    getProviderSignals(symbols),
    Promise.resolve(getProviderStatus())
  ]);
  const overview = buildOverview();
  const brainStatus = buildBrainStatus();
  const systemStatus = buildAiccSystemStatus({ providerStatus });
  const consensusStrength = String(
    overview?.consensus?.consensusStrength || "UNKNOWN"
  ).toUpperCase();
  const escalationLevel = String(
    overview?.escalation?.escalationLevel || "NONE"
  ).toUpperCase();
  const failsafeState = String(
    brainStatus?.failsafeBrain?.status || systemStatus.brains?.failsafe || "STANDBY"
  ).toUpperCase();

  providerSignals
    .filter(isActionableProviderSignal)
    .forEach((signal) => {
      alerts.push(createAlert({
        timestamp: signal.updatedAt || timestamp,
        severity: severityForSignal(signal),
        source: "PROVIDER_SIGNAL",
        category: signal.signal === "RISK WATCH" ? "RISK" : "SIGNAL",
        title: signal.signal,
        message: `${signal.symbol} ${String(signal.signal).toLowerCase()} conditions detected. ${signal.reason}`
      }));
    });

  if (["WEAK", "CONFLICT", "CONFLICTED", "UNSTABLE"].includes(consensusStrength)) {
    alerts.push(createAlert({
      timestamp,
      severity: "NOTICE",
      source: "COGNITION_CONSENSUS",
      category: "CONSENSUS",
      title: "Consensus Shift",
      message: `Consensus state is ${consensusStrength}. Operator review is recommended.`
    }));
  }

  if (["HIGH", "CRITICAL"].includes(escalationLevel)) {
    alerts.push(createAlert({
      timestamp,
      severity: escalationLevel === "CRITICAL" ? "CRITICAL" : "WARNING",
      source: "ESCALATION_ENGINE",
      category: "RISK",
      title: "Escalation Event",
      message: `Escalation level is ${escalationLevel}. Failsafe monitoring remains active.`
    }));
  }

  if (["ACTIVE", "ENGAGED"].includes(failsafeState)) {
    alerts.push(createAlert({
      timestamp,
      severity: "CRITICAL",
      source: "FAILSAFE_BRAIN",
      category: "FAILSAFE",
      title: "Failsafe Warning",
      message: `Failsafe brain status is ${failsafeState}. Protection posture is elevated.`
    }));
  }

  if (providerStatus.providerHealth !== "HEALTHY") {
    alerts.push(createAlert({
      timestamp: providerStatus.lastUpdate || timestamp,
      severity: "WARNING",
      source: "MARKET_PROVIDER",
      category: "PROVIDER",
      title: "Provider Degradation",
      message: `${providerStatus.activeProvider} provider health is ${providerStatus.providerHealth}.`
    }));
  }

  if (alerts.length === 0) {
    alerts.push(createAlert({
      timestamp,
      severity: "INFO",
      source: "AICC_ALERTS",
      category: "SIGNAL",
      title: "Signal Generated",
      message: "AICC alert monitor is online. No elevated alerts are active."
    }));
  }

  return alerts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

module.exports = {
  DEFAULT_ALERT_SYMBOLS,
  buildAiccAlerts
};
