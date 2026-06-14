import { useEffect, useMemo, useState } from "react";
import { getAiccAlerts, getAiccSystemStatus, getOfflineAiccSystemStatus } from "../services/aiccApi";
import {
  getOfflineProviderDiagnostics,
  getProviderDiagnostics,
} from "../services/marketProviderApi";
import { analyzeFailsafeState } from "../services/intelligence/failsafeBrain";
import "../styles/ClosedBetaPages.css";
import "../styles/FailsafeBrain.css";

function displayState(value) {
  if (!value) return "STANDBY";
  return String(value).replace(/_/g, " ");
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

  return alertHistory;
}

function buildFailsafeInput({ systemStatus, providerDiagnostics, alerts }) {
  const symbol = systemStatus?.feeds?.symbol || "SPY";
  const tacticalLive = systemStatus?.tactical || systemStatus?.tacticalBrain || null;
  const behavioralLive = systemStatus?.behavioral || systemStatus?.behavioralBrain || null;
  const usingFallbackBrains = !tacticalLive || !behavioralLive;

  return {
    input: {
      symbol,
      tactical: tacticalLive,
      behavioral: behavioralLive,
      dataStreams: buildDataStreams(systemStatus, providerDiagnostics),
      marketIntelligence: {
        dataQuality: providerDiagnostics?.providerHealth === "HEALTHY" ? 82 : 0,
        providerHealth: providerDiagnostics?.providerHealth,
        failoverReady: providerDiagnostics?.failoverReady,
        available: providerDiagnostics?.available !== false,
        sourceType: providerDiagnostics?.sourceType || "UNKNOWN",
      },
      globalScan: {
        dataQuality: systemStatus?.backend === "ONLINE" ? 78 : 0,
        available: systemStatus?.available !== false,
        sourceType: systemStatus?.sourceType || "UNKNOWN",
      },
      newsletterData: {
        alertCount: Array.isArray(alerts) ? alerts.length : 0,
        available: Array.isArray(alerts) && alerts.some((alert) => alert?.available !== false),
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
  const primaryProtectionDriver =
    evidence.find((item) => /integrity|validation|reliability|provider|consistency|calibration/i.test(item))
    || evidence[0]
    || "Failsafe driver unavailable.";
  const primaryProtectionRisk =
    warnings.find((item) => !/No failsafe warnings active/i.test(item))
    || `Primary risk context: ${displayState(failsafeAnalysis.riskEscalation)} risk escalation.`;
  const failsafeFlow = [
    { label: "DATA INTEGRITY", value: displayState(failsafeAnalysis.dataIntegrity) },
    { label: "VALIDATION", value: displayState(failsafeAnalysis.validation) },
    { label: "CONFLICT DETECTION", value: displayState(failsafeAnalysis.conflict) },
    { label: "CONSISTENCY", value: displayState(failsafeAnalysis.consistency) },
    { label: "RISK ESCALATION", value: displayState(failsafeAnalysis.riskEscalation) },
    { label: "FAILSAFE STATE", value: displayState(failsafeAnalysis.failsafeState) },
  ];

  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <h1>FAILSAFE BRAIN</h1>
        <p>Closed beta protection, failover, and risk monitor.</p>
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
      </header>

      <section className="closed-beta-panel failsafe-verdict-section">
        <div className="failsafe-section-title">
          <span>01</span>
          <h2>FAILSAFE VERDICT</h2>
        </div>

        <div className="failsafe-verdict-grid">
          <div className="failsafe-verdict-primary">
            <span>Current Failsafe Condition</span>
            <strong>{displayState(failsafeAnalysis.failsafeState)}</strong>
            <p>
              Reliability is {failsafeAnalysis.reliability}% with {displayState(failsafeAnalysis.validation).toLowerCase()} validation.
            </p>
          </div>
          <div>
            <span>Trust Level</span>
            <strong>{displayState(failsafeAnalysis.reliabilityLabel)}</strong>
          </div>
          <div>
            <span>Reliability</span>
            <strong>{failsafeAnalysis.reliability}%</strong>
          </div>
          <div>
            <span>Primary Protection Driver</span>
            <p>{primaryProtectionDriver}</p>
          </div>
          <div>
            <span>Primary Protection Risk</span>
            <p>{primaryProtectionRisk}</p>
          </div>
        </div>
      </section>

      <section className="closed-beta-panel failsafe-flow-section">
        <div className="failsafe-section-title">
          <span>02</span>
          <h2>FAILSAFE INTELLIGENCE FLOW</h2>
        </div>

        <div className="failsafe-flow-stack">
          {failsafeFlow.map((node, index) => (
            <div className="failsafe-flow-step" key={node.label}>
              <div className={`failsafe-flow-node${index === failsafeFlow.length - 1 ? " failsafe-flow-final" : ""}`}>
                <span>{node.label}</span>
                <strong>{node.value}</strong>
              </div>
              {index < failsafeFlow.length - 1 && (
                <b aria-hidden="true">&darr;</b>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="closed-beta-panel failsafe-notice-section">
        <div className="failsafe-section-title">
          <span>03</span>
          <h2>INPUT NOTICE</h2>
        </div>
        <p>
          {failsafeInput.usingFallbackBrains
            ? "Verified tactical or behavioral validation inputs are unavailable. No fallback brain conclusions are being substituted."
            : "Live tactical, behavioral, provider, and system validation inputs are active."}
        </p>
      </section>

      <section className="closed-beta-panel failsafe-status-section">
        <div className="failsafe-section-title">
          <span>04</span>
          <h2>FAILSAFE STATUS BOARD</h2>
        </div>
        <div className="failsafe-status-grid">
          <div className="closed-beta-card">
            <span>Reliability</span>
            <strong>{failsafeAnalysis.reliability}%</strong>
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
            <span>Conflict Detection</span>
            <strong>{displayState(failsafeAnalysis.conflict)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Consistency</span>
            <strong>{displayState(failsafeAnalysis.consistency)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Risk Escalation</span>
            <strong>{displayState(failsafeAnalysis.riskEscalation)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Confidence Calibration</span>
            <strong>{displayState(failsafeAnalysis.confidenceCalibration)}</strong>
          </div>
          <div className="closed-beta-card">
            <span>Provider Status</span>
            <strong>{displayState(providerDiagnostics.providerHealth)}</strong>
          </div>
        </div>
      </section>

      <section className="closed-beta-grid failsafe-support-grid">
        <div className="closed-beta-panel failsafe-support-section">
          <div className="failsafe-section-title">
            <span>05</span>
            <h2>EVIDENCE</h2>
          </div>
          <div className="closed-beta-list">
            {evidence.map((item) => (
              <div key={item}>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="closed-beta-panel failsafe-support-section">
          <div className="failsafe-section-title">
            <span>06</span>
            <h2>WARNINGS</h2>
          </div>
          <div className="closed-beta-list">
            {warnings.map((warning) => (
              <div key={warning}>
                <p>{warning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="closed-beta-panel failsafe-support-section">
        <div className="failsafe-section-title">
          <span>07</span>
          <h2>RECENT FAILSAFE ALERTS</h2>
        </div>
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
