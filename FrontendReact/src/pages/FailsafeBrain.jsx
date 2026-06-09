import { useEffect, useMemo, useState } from "react";
import { getAiccAlerts, getAiccSystemStatus, getOfflineAiccSystemStatus } from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
} from "../services/marketProviderApi";
import { analyzeFailsafeState } from "../services/intelligence/failsafeBrain";
import "../styles/ClosedBetaPages.css";

const CLOSED_BETA_TACTICAL_FALLBACK = {
  symbol: "SPY",
  tacticalState: "NEUTRAL_TRANSITION",
  trend: "NEUTRAL",
  confidence: 45,
};

const CLOSED_BETA_BEHAVIORAL_FALLBACK = {
  symbol: "SPY",
  behavioralState: "TRANSITIONING_BEHAVIOR",
  riskAppetite: "NEUTRAL",
  confidence: 45,
};

function displayState(value) {
  if (!value) return "STANDBY";
  return String(value).replace(/_/g, " ");
}

function normalizeConfidence(value, fallback = 45) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return number <= 1 ? Math.round(number * 100) : Math.round(number);
}

function buildDataStreams(systemStatus, providerDiagnostics) {
  return [
    {
      name: "backend",
      status: systemStatus?.backend || systemStatus?.runtime || "UNKNOWN",
      warnings: systemStatus?.warnings || [],
    },
    {
      name: "provider",
      status: providerDiagnostics?.providerHealth || providerDiagnostics?.activeProvider || "UNKNOWN",
      warnings: providerDiagnostics?.warnings || [],
    },
    {
      name: "webull",
      status: providerDiagnostics?.webull?.status || "UNKNOWN",
      warnings: providerDiagnostics?.webull?.warnings || [],
    },
    {
      name: "alpaca",
      status: providerDiagnostics?.alpaca?.status || "UNKNOWN",
      warnings: providerDiagnostics?.alpaca?.warnings || [],
    },
    {
      name: "fallback",
      status: providerDiagnostics?.fallback?.status || "UNKNOWN",
      warnings: providerDiagnostics?.fallback?.warnings || [],
    },
  ];
}

function buildMockHistory(alerts, systemStatus) {
  const alertHistory = Array.isArray(alerts)
    ? alerts.slice(0, 6).map((alert) => ({
        state: ["CRITICAL", "WARNING"].includes(alert?.severity)
          ? "RISK_ESCALATION"
          : "CONFIRMED_ENVIRONMENT",
      }))
    : [];

  if (alertHistory.length >= 3) return alertHistory;

  return [
    { state: systemStatus?.brains?.failsafe === "ACTIVE" ? "RISK_ESCALATION" : "ELEVATED_UNCERTAINTY" },
    { state: "ELEVATED_UNCERTAINTY" },
    { state: "CONFIRMED_ENVIRONMENT" },
  ];
}

function buildFailsafeInput({ systemStatus, providerDiagnostics, alerts }) {
  const symbol = systemStatus?.feeds?.symbol || "SPY";
  const tacticalLive = systemStatus?.tactical || systemStatus?.tacticalBrain || null;
  const behavioralLive = systemStatus?.behavioral || systemStatus?.behavioralBrain || null;
  const usingFallbackBrains = !tacticalLive || !behavioralLive;
  const alertRiskHigh = Array.isArray(alerts)
    && alerts.some((alert) => ["WARNING", "CRITICAL"].includes(alert?.severity));

  const tactical = tacticalLive || {
    ...CLOSED_BETA_TACTICAL_FALLBACK,
    symbol,
    tacticalState: alertRiskHigh ? "HIGH_VOLATILITY_TRANSITION" : "NEUTRAL_TRANSITION",
    confidence: normalizeConfidence(systemStatus?.score, 45),
  };

  const behavioral = behavioralLive || {
    ...CLOSED_BETA_BEHAVIORAL_FALLBACK,
    symbol,
    behavioralState: alertRiskHigh ? "RISK_AVERSION" : "TRANSITIONING_BEHAVIOR",
    riskAppetite: alertRiskHigh ? "RISK_OFF" : "NEUTRAL",
    confidence: normalizeConfidence(systemStatus?.score, 45),
  };

  return {
    input: {
      symbol,
      tactical,
      behavioral,
      dataStreams: buildDataStreams(systemStatus, providerDiagnostics),
      marketIntelligence: {
        dataQuality: providerDiagnostics?.providerHealth === "HEALTHY" ? 82 : 48,
        providerHealth: providerDiagnostics?.providerHealth,
        failoverReady: providerDiagnostics?.failoverReady,
      },
      globalScan: {
        dataQuality: systemStatus?.backend === "ONLINE" ? 78 : 42,
      },
      newsletterData: {
        alertCount: Array.isArray(alerts) ? alerts.length : 0,
      },
      history: buildMockHistory(alerts, systemStatus),
    },
    usingFallbackBrains,
  };
}

function FailsafeBrain() {
  const [systemStatus, setSystemStatus] = useState(getOfflineAiccSystemStatus());
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadFailsafeBrain() {
      const [systemData, diagnosticsData, alertsData] = await Promise.all([
        getAiccSystemStatus(),
        getProviderDiagnostics(),
        getAiccAlerts(),
      ]);

      setSystemStatus(systemData);
      setProviderDiagnostics(diagnosticsData);
      setAlerts(alertsData);
    }

    loadFailsafeBrain();

    const interval = setInterval(loadFailsafeBrain, 15000);

    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter((alert) =>
    ["WARNING", "CRITICAL"].includes(alert.severity)
  );
  const escalationState = systemStatus?.escalation?.escalationLevel || "NONE";
  const failsafeInput = useMemo(
    () => buildFailsafeInput({ systemStatus, providerDiagnostics, alerts }),
    [systemStatus, providerDiagnostics, alerts]
  );
  const failsafeAnalysis = useMemo(
    () => analyzeFailsafeState(failsafeInput.input),
    [failsafeInput]
  );
  const evidence = failsafeAnalysis.evidence?.length
    ? failsafeAnalysis.evidence
    : ["Failsafe Brain is waiting for validation inputs."];
  const warnings = failsafeAnalysis.warnings?.length
    ? failsafeAnalysis.warnings
    : ["No failsafe warnings active."];

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>FAILSAFE BRAIN</h1>
        <p>Closed beta protection, failover, and risk monitor.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Failsafe State</span>
          <strong>{displayState(failsafeAnalysis.failsafeState)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Reliability</span>
          <strong>{failsafeAnalysis.reliability}% {displayState(failsafeAnalysis.reliabilityLabel)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Data Integrity</span>
          <strong>{displayState(failsafeAnalysis.dataIntegrity)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Validation</span>
          <strong>{displayState(failsafeAnalysis.validation)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Conflict</span>
          <strong>{displayState(failsafeAnalysis.conflict)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Risk Escalation</span>
          <strong>{displayState(failsafeAnalysis.riskEscalation)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Consistency</span>
          <strong>{displayState(failsafeAnalysis.consistency)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Confidence Calibration</span>
          <strong>{displayState(failsafeAnalysis.confidenceCalibration)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Health</span>
          <strong>{displayState(providerDiagnostics.providerHealth)}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Risk Level</span>
          <strong>{criticalAlerts.length ? "ELEVATED" : "LOW"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Failover Ready</span>
          <strong>{providerDiagnostics.failoverReady ? "READY" : "PENDING"}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Active Alerts</span>
          <strong>{alerts.length}</strong>
        </div>
        <div className="closed-beta-card">
          <span>Escalation State</span>
          <strong>{displayState(escalationState)}</strong>
        </div>
      </section>

      {failsafeInput.usingFallbackBrains && (
        <section className="closed-beta-panel">
          <h2>Input Notice</h2>
          <p>Closed-beta validation inputs are active. Tactical and behavioral validation snapshots are using safe fallback conclusions.</p>
        </section>
      )}

      <section className="closed-beta-panel">
        <h2>Protection Summary</h2>
        <p>
          Failsafe reliability is {displayState(failsafeAnalysis.reliabilityLabel).toLowerCase()} with
          provider health at {displayState(providerDiagnostics.providerHealth).toLowerCase()} and
          fallback status {displayState(providerDiagnostics.fallback?.status || "AVAILABLE").toLowerCase()}.
        </p>
      </section>

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Evidence</h2>
          <div className="closed-beta-list">
            {evidence.map((item) => (
              <div key={item}>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Warnings</h2>
          <div className="closed-beta-list">
            {warnings.map((warning) => (
              <div key={warning}>
                <p>{warning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="closed-beta-panel">
        <h2>Recent Failsafe Alerts</h2>
        <div className="closed-beta-list">
          {alerts.slice(0, 6).map((alert) => (
            <article key={alert.id}>
              <span>{alert.severity}</span>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FailsafeBrain;
