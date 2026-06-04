import { useEffect, useState } from "react";
import {
  getAdaptiveSignals,
  getBrainStatus,
  getCognitionOverview,
  getConfidence,
  getInstitutionalFlow,
  getLiquidityPressure,
  getPersistentMemory,
  getPriorityFeed,
  getRecurrence,
  getReinforcementWeighting,
  getStrategicEnvironment,
  getTemporalMemory,
} from "../services/cognitionApi";
import {
  classifyHealth,
  translateDashboardStatus,
} from "../services/intelligenceTranslator";
import { Link } from "react-router-dom";
import "../styles/CommandCenter.css";

import SystemBootPanel from "../components/SystemBootPanel";
import GlobalScanPanel from "../components/GlobalScanPanel";
import DataStreamsPanel from "../components/DataStreamsPanel";
import NewsLetterPanel from "../components/NewsLetterPanel";
import MarketPulsePanel from "../components/MarketPulsePanel";
import SystemOnlinePanel from "../components/SystemOnlinePanel";
import BrainActivationPanel from "../components/BrainActivationPanel";
import InstitutionalAccumlationPanel from "../components/InstitutionalAccumlationPanel";
import VolatilityCompressionPanel from "../components/VolatilityCompressionPanel";
import CrisisManagementPanel from "../components/CrisisManagementPanel";
import ExpansionPanel from "../components/ExpansionPanel";
import TacticalBrainPanel from "../components/TacticalBrainPanel";
import BehavioralBrainPanel from "../components/BehavioralBrainPanel";
import FailsafeBrainPanel from "../components/FailsafeBrainPanel";
import MarketOverviewPanel from "../components/MarketOverviewPanel";
import IntelligenceFeedPanel from "../components/IntelligenceFeedPanel";

function CommandCenter() {
  const [time, setTime] = useState(new Date());
  const [overview, setOverview] = useState(null);
  const [brainStatus, setBrainStatus] = useState(null);
  const [strategicEnvironment, setStrategicEnvironment] = useState(null);
  const [liquidityPressure, setLiquidityPressure] = useState(null);
  const [institutionalFlow, setInstitutionalFlow] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [temporalMemory, setTemporalMemory] = useState(null);
  const [recurrence, setRecurrence] = useState(null);
  const [reinforcementWeighting, setReinforcementWeighting] = useState(null);
  const [persistentMemory, setPersistentMemory] = useState(null);
  const [adaptiveSignals, setAdaptiveSignals] = useState(null);
  const [priorityFeed, setPriorityFeed] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  async function loadData() {
    const data = await getCognitionOverview();

    if (data) {
      setOverview(data);
    }
  }

  loadData();
}, []);

  useEffect(() => {
  async function loadBrainStatus() {
    const data = await getBrainStatus();
    setBrainStatus(data);
  }

  loadBrainStatus();
}, []);

  useEffect(() => {
  async function loadCognitionModules() {
    const [
      strategicData,
      liquidityData,
      flowData,
      confidenceData,
      temporalData,
      recurrenceData,
      reinforcementData,
      persistentData,
      adaptiveSignalData,
      priorityFeedData
    ] = await Promise.all([
      getStrategicEnvironment(),
      getLiquidityPressure(),
      getInstitutionalFlow(),
      getConfidence(),
      getTemporalMemory(),
      getRecurrence(),
      getReinforcementWeighting(),
      getPersistentMemory(),
      getAdaptiveSignals(),
      getPriorityFeed()
    ]);

    if (strategicData) setStrategicEnvironment(strategicData);
    if (liquidityData) setLiquidityPressure(liquidityData);
    if (flowData) setInstitutionalFlow(flowData);
    if (confidenceData) setConfidence(confidenceData);
    if (temporalData) setTemporalMemory(temporalData);
    if (recurrenceData) setRecurrence(recurrenceData);
    if (reinforcementData) setReinforcementWeighting(reinforcementData);
    if (persistentData) setPersistentMemory(persistentData);
    if (adaptiveSignalData) setAdaptiveSignals(adaptiveSignalData);
    if (priorityFeedData) setPriorityFeed(priorityFeedData);
  }

  loadCognitionModules();

  const interval = setInterval(loadCognitionModules, 10000);

  return () => clearInterval(interval);
}, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const activeEnvironment =
    strategicEnvironment || overview?.strategicEnvironment || null;
  const activeConfidence = confidence || overview?.confidence || null;
  const activeConsensus = overview?.consensus || confidence || null;
  const consensusConfidence = overview?.confidence?.score
    ? `${Math.round(overview.confidence.score * 100)}%`
    : "LOADING";
  const getAlignmentGroup = (value) => {
    const normalized = String(value || "").toUpperCase();

    if (
      [
        "ALIGNED",
        "BULLISH",
        "EXPANSION",
        "OPTIMAL",
        "RISK_ON",
        "STRONG",
      ].includes(normalized)
    ) {
      return "aligned";
    }

    if (
      [
        "BEARISH",
        "CAUTION",
        "CRITICAL",
        "DEFENSIVE",
        "RISK_OFF",
        "WARNING",
      ].includes(normalized)
    ) {
      return "conflicted";
    }

    return "neutral";
  };
  const tacticalSyncState = brainStatus?.tacticalBrain?.bias || "NEUTRAL";
  const behavioralSyncState = brainStatus?.behavioralBrain?.bias || "ALIGNED";
  const failsafeSyncState = brainStatus?.failsafeBrain?.status || "STANDBY";
  const alignmentGroups = [
    getAlignmentGroup(tacticalSyncState),
    getAlignmentGroup(behavioralSyncState),
    getAlignmentGroup(failsafeSyncState),
  ];
  const uniqueAlignmentGroups = new Set(alignmentGroups);
  const hasAlignmentConflict =
    uniqueAlignmentGroups.has("aligned") && uniqueAlignmentGroups.has("conflicted");
  const syncScore = hasAlignmentConflict
    ? 25
    : uniqueAlignmentGroups.size === 1
      ? 100
      : uniqueAlignmentGroups.size === 2
        ? 75
        : 50;
  const syncStatus =
    syncScore >= 100
      ? "FULL_ALIGNMENT"
      : syncScore >= 75
        ? "PARTIAL_ALIGNMENT"
        : syncScore >= 50
          ? "MIXED_ALIGNMENT"
          : "CONFLICTED";
  const syncColorClass =
    syncScore >= 80
      ? "sync-green"
      : syncScore >= 50
        ? "sync-yellow"
        : "sync-red";
  const consensusBaseScore =
    overview?.confidence?.score ?? confidence?.score ?? 0;
  const getConsensusInfluence = (brainData, modifier = 0) =>
    Math.max(
      0,
      Math.min(
        100,
        Math.round(((brainData?.confidence ?? consensusBaseScore) || 0) * 100) +
          modifier
      )
    );
  const latestMemoryEntry = persistentMemory?.memoryEntries?.[0] || null;
  const memoryDepthValue =
    persistentMemory?.memoryEntries?.length ??
    temporalMemory?.recurringPatterns?.length ??
    "DETECTING";
  const normalizeMemoryImportance = (value) => {
    const normalized = String(value || "").toUpperCase();

    if (["HIGH", "SEVERE", "STRONG"].includes(normalized)) return "HIGH";
    if (["MODERATE", "MEDIUM", "DETECTED"].includes(normalized)) return "MODERATE";
    if (["LOW", "WEAK", "QUIET"].includes(normalized)) return "LOW";

    return "DETECTING";
  };
  const normalizeMemoryState = () => {
    const reinforcementState = String(
      reinforcementWeighting?.reinforcementState || ""
    ).toUpperCase();
    const temporalState = String(temporalMemory?.temporalState || "").toUpperCase();
    const persistentState = String(persistentMemory?.memoryState || "").toUpperCase();
    const stabilityTrajectory = String(
      overview?.stabilityForecast?.trajectory || ""
    ).toUpperCase();

    if (reinforcementState === "REINFORCING") return "REINFORCED";
    if (stabilityTrajectory === "FRAGMENTING") return "FRAGMENTED";
    if (["ACTIVE", "RECURRING_PATTERN"].includes(persistentState) || temporalState === "RECURRING_PATTERN") {
      return "STABLE";
    }
    if (["OBSERVING", "BALANCING", "LIMITED"].includes(reinforcementState) || persistentState === "LIMITED") {
      return "BUILDING";
    }

    return "DETECTING";
  };
  const normalizeRecurrence = (value) => {
    const normalized = String(value || "").toUpperCase();

    if (["STRONG", "ACTIVE", "STRONG_RECURRENCE"].includes(normalized)) return "ACTIVE";
    if (["DETECTED", "MODERATE_RECURRENCE"].includes(normalized)) return "DETECTED";
    if (["QUIET", "NONE", "UNKNOWN"].includes(normalized)) return "NONE";

    return "DETECTING";
  };
  const formatMemoryTimestamp = (timestamp) => {
    if (!timestamp) return "UNAVAILABLE";

    const time = new Date(timestamp).getTime();
    if (Number.isNaN(time)) return "UNAVAILABLE";

    const elapsedMs = Date.now() - time;
    const minutes = Math.max(0, Math.round(elapsedMs / 60000));

    if (minutes < 1) return "NOW";
    if (minutes < 60) return `${minutes}M AGO`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}H AGO`;

    return `${Math.round(hours / 24)}D AGO`;
  };
  const memoryImportance = normalizeMemoryImportance(
    recurrence?.recurrenceStrength ||
      temporalMemory?.memoryDepth ||
      overview?.stabilityForecast?.trajectory
  );
  const memoryState = normalizeMemoryState();
  const memoryRecurrence = normalizeRecurrence(recurrence?.recurrenceState);
  const memoryConfidence =
    typeof overview?.stabilityForecast?.confidence === "number"
      ? `${Math.round(overview.stabilityForecast.confidence * 100)}%`
      : "DETECTING";
  const dominantTheme =
    recurrence?.recurringThemes?.[0]?.value ||
    recurrence?.recurringThemes?.[0]?.theme ||
    reinforcementWeighting?.reinforcedFactors?.[0]?.factor ||
    latestMemoryEntry?.environment ||
    "DETECTING";
  const influenceLevel =
    typeof reinforcementWeighting?.learningWeight === "number"
      ? `${Math.round(reinforcementWeighting.learningWeight * 100)}%`
      : reinforcementWeighting?.reinforcementState || "DETECTING";
  const memorySummary =
    temporalMemory?.summary ||
    recurrence?.summary ||
    reinforcementWeighting?.summary ||
    persistentMemory?.summary ||
    "DETECTING";
  const memoryObservations = [
    ...(temporalMemory?.warnings || []),
    ...(recurrence?.warnings || []),
    ...(reinforcementWeighting?.warnings || []),
    ...(persistentMemory?.warnings || []),
  ];
  const escalationData = overview?.escalation || null;
  const escalationLevel = escalationData?.escalationLevel || "NONE";
  const escalationTriggers = Array.isArray(escalationData?.triggers)
    ? escalationData.triggers
    : [];
  const elevatedEvents = Array.isArray(escalationData?.elevatedEvents)
    ? escalationData.elevatedEvents
    : [];
  const protectionStatus =
    brainStatus?.failsafeBrain?.status === "ACTIVE"
      ? "ENGAGED"
      : brainStatus?.failsafeBrain?.status || "STANDBY";
  const riskState =
    escalationLevel === "CRITICAL"
      ? "CRITICAL"
      : escalationLevel === "HIGH"
        ? "ELEVATED"
        : escalationLevel === "MODERATE" || escalationLevel === "LOW"
          ? "MONITORING"
          : "CALM";
  const eventLoad =
    elevatedEvents.length >= 5
      ? "HIGH"
      : elevatedEvents.length >= 2
        ? "MODERATE"
        : "LOW";
  const escalationSummary = escalationData?.summary || "DETECTING";
  const formatTimelineTime = (timestamp) => {
    if (!timestamp) return "LATEST";

    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return "LATEST";

    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const recentConsensusStates =
    persistentMemory?.memoryEntries
      ?.map((entry) => entry.consensusState)
      .filter((state) => state && state !== "UNKNOWN")
      .slice(0, 5) || [];
  const consensusTimeline =
    recentConsensusStates.length > 0
      ? recentConsensusStates
      : [overview?.consensus?.consensusStrength].filter(Boolean);
  const memoryTimelineEvents = [
    ...(persistentMemory?.memoryEntries || [])
      .filter((entry) => entry.timestamp && entry.reinforcementLevel && entry.reinforcementLevel !== "UNKNOWN")
      .slice(0, 5)
      .map((entry) => ({
        time: formatTimelineTime(entry.timestamp),
        label: `Reinforcement ${entry.reinforcementLevel}`,
      })),
    ...(recurrence?.recurringThemes || []).slice(0, 3).map((theme) => ({
      time: "LATEST",
      label: `Recurrence ${theme.value || theme.theme}`,
    })),
    adaptiveSignals?.signalState
      ? {
          time: "LATEST",
          label: `Adaptive Signal ${adaptiveSignals.signalState}`,
        }
      : null,
  ].filter(Boolean);
  const escalationTimelineEvents = [
    ...elevatedEvents.slice(0, 5).map((event) => ({
      time: formatTimelineTime(event.timestamp),
      label: event.type || event.summary || "Escalation Event",
    })),
    ...escalationTriggers.slice(0, 5).map((trigger) => ({
      time: "LATEST",
      label: `Trigger ${trigger}`,
    })),
    brainStatus?.failsafeBrain?.status
      ? {
          time: "LATEST",
          label: `Protection ${brainStatus.failsafeBrain.status}`,
        }
      : null,
  ].filter(Boolean);
  const priorityTimelineEvents =
    priorityFeed?.events
      ?.filter((event) => event.timestamp && event.message)
      .slice(0, 5)
      .map((event) => ({
        time: formatTimelineTime(event.timestamp),
        label: event.message,
      })) || [];
  const latestSnapshotTimeline = [
    overview?.consensus?.consensusStrength
      ? {
          time: formatTimelineTime(overview?.timestamp),
          label: `Consensus ${overview.consensus.consensusStrength}`,
        }
      : null,
    reinforcementWeighting?.reinforcementState
      ? {
          time: formatTimelineTime(overview?.timestamp),
          label: `Memory ${reinforcementWeighting.reinforcementState}`,
        }
      : null,
    adaptiveSignals?.signalState
      ? {
          time: formatTimelineTime(overview?.timestamp),
          label: `Signal ${adaptiveSignals.signalState}`,
        }
      : null,
    overview?.escalation?.escalationLevel
      ? {
          time: formatTimelineTime(overview?.timestamp),
          label: `Escalation ${overview.escalation.escalationLevel}`,
        }
      : null,
  ].filter(Boolean);
  const narrativeTimeline =
    priorityTimelineEvents.length > 0
      ? priorityTimelineEvents
      : latestSnapshotTimeline;

  return (
    <div className="command-layout">
      <aside className="command-sidebar">
        <div className="sidebar-brand">
          <h2>CMI</h2>
          <span>SYSTEMS</span>
        </div>

        <nav className="sidebar-nav">
          <p>Core Systems</p>
          <Link to="/" className="nav-button active">Command Center</Link>
          <Link to="/system-boot" className="nav-button">System Boot</Link>
          <Link to="/global-scan" className="nav-button">Global Scan</Link>
          <Link to="/data-streams" className="nav-button">Data Streams</Link>
          <Link to="/newsletter" className="nav-button">Newsletter</Link>
          <Link to="/market-pulse" className="nav-button">Market Pulse</Link>

          <p>Intelligence Brains</p>
          <Link to="/tactical-brain" className="nav-button">Tactical Brain</Link>
          <Link to="/behavioral-brain" className="nav-button">Behavioral Brain</Link>
          <Link to="/failsafe-brain" className="nav-button">Failsafe Brain</Link>

          <p>Tools</p>
          <Link to="/watchlists" className="nav-button">Watchlists</Link>
          <Link to="/alerts" className="nav-button">Alerts</Link>
          <Link to="/signals" className="nav-button">Signals</Link>
          <Link to="/replay-center" className="nav-button">Replay Center</Link>
          <Link to="/trading-journal" className="nav-button">Trading Journal</Link>
          <Link to="/archives" className="nav-button">Archives</Link>

          <p>Profile & Settings</p>
          <Link to="/profiles" className="nav-button">Profiles</Link>
          <Link to="/subscriptions" className="nav-button">Subscriptions</Link>
          <Link to="/settings" className="nav-button">System Settings</Link>
        </nav>
      </aside>

      <main className="command-center">
        <header className="command-header">
          <div className="header-title">
            <h1>COMMAND CENTER</h1>
            <p>Market AI Intelligence Ecosystem</p>
          </div>

          <div className="command-status-bar">
            <div className="status-card clock-card">
              <span>{formattedDate}</span>
              <strong>{formattedTime}</strong>
            </div>

            <div className="status-card">
              <span>System Status</span>
              <strong>Operational</strong>
            </div>

            <div className="status-card">
              <span>Market Status</span>
              <strong>{overview?.marketOpen ? "Open" : "Closed"}</strong>
            </div>

            <div className="status-card">
              <span>Brain Network</span>
              <strong>Online</strong>
            </div>
          </div>
        </header>

        <div className="command-live-strip">
          <span><i className="live-dot"></i> Global Scan Active</span>
          <span><i className="live-dot"></i> Tactical Brain Analyzing</span>
          <span><i className="live-dot"></i> Market Pulse Updating</span>
          <span><i className="live-dot"></i> Newsletter Processing</span>
          <span><i className="live-dot"></i> Failsafe Monitoring</span>
        </div>

          <div className="intelligence-summary-row">
  <div className="summary-card">
    <span>Market Regime</span>
    <strong>{translateDashboardStatus(activeEnvironment, "DETECTING")}</strong>
    <p>LIVE REGIME</p>
  </div>

  <div className="summary-card">
    <span>Volatility</span>
    <strong>{translateDashboardStatus(activeEnvironment?.stability || activeEnvironment, "DETECTING")}</strong>
    <p>STABILITY</p>
  </div>

  <div className="summary-card">
    <span>Market Breadth</span>
    <strong>{translateDashboardStatus(activeConsensus, "DETECTING")}</strong>
    <p>CONSENSUS</p>
  </div>

  <div className="summary-card">
    <span>System Health</span>
    <strong>{classifyHealth(overview?.runtimeHealth)}</strong>
    <p>RUNTIME</p>
  </div>

  <div className="summary-card">
    <span>Risk Level</span>
    <strong>{translateDashboardStatus(activeConfidence, "DETECTING")}</strong>
    <p>CONFIDENCE</p>
  </div>
</div>

        <section className="command-section consensus-section">
          <h2>Intelligence Consensus</h2>

          <div className="consensus-panel">
            <div className="consensus-brain-row">
              <div className="consensus-brain-card">
                <span>Tactical Brain</span>
                <strong>{brainStatus?.tacticalBrain?.bias || "NEUTRAL"}</strong>
                <p>{brainStatus?.tacticalBrain?.status || "OBSERVING"}</p>
              </div>

              <div className="consensus-brain-card">
                <span>Behavioral Brain</span>
                <strong>{brainStatus?.behavioralBrain?.bias || "ALIGNED"}</strong>
                <p>{brainStatus?.behavioralBrain?.status || "OBSERVING"}</p>
              </div>

              <div className="consensus-brain-card">
                <span>Failsafe Brain</span>
                <strong>{brainStatus?.failsafeBrain?.bias || "OBSERVATION_ONLY"}</strong>
                <p>{brainStatus?.failsafeBrain?.status || "STANDBY"}</p>
              </div>
            </div>

            <div className="consensus-metrics-row">
              <div>
                <span>Consensus</span>
                <strong>{overview?.consensus?.consensusStrength || "LOADING"}</strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>{consensusConfidence}</strong>
              </div>

              <div>
                <span>Environment</span>
                <strong>{overview?.strategicEnvironment?.environment || "LOADING"}</strong>
              </div>

              <div>
                <span>Forecast</span>
                <strong>{overview?.stabilityForecast?.trajectory || "LOADING"}</strong>
              </div>

              <div>
                <span>Escalation</span>
                <strong>{overview?.escalation?.escalationLevel || "NONE"}</strong>
              </div>
            </div>

            <p className="consensus-summary">
              {overview?.consensus?.summary ||
                overview?.strategicEnvironment?.summary ||
                "Awaiting consensus cognition."}
            </p>
          </div>
        </section>

        <section className="command-section adaptive-memory-section">
          <h2>ADAPTIVE MEMORY INTELLIGENCE</h2>

          <div className="adaptive-memory-grid">
            <div className="adaptive-memory-card">
              <h3>Memory Overview</h3>

              <div className="adaptive-memory-metrics">
                <div>
                  <span>Importance</span>
                  <strong>{memoryImportance}</strong>
                </div>

                <div>
                  <span>Depth</span>
                  <strong>{memoryDepthValue}</strong>
                </div>

                <div>
                  <span>State</span>
                  <strong>{memoryState}</strong>
                </div>

                <div>
                  <span>Confidence</span>
                  <strong>{memoryConfidence}</strong>
                </div>
              </div>
            </div>

            <div className="adaptive-memory-card">
              <h3>Memory Dynamics</h3>

              <div className="adaptive-memory-metrics">
                <div>
                  <span>Recurrence</span>
                  <strong>{memoryRecurrence}</strong>
                </div>

                <div>
                  <span>Last Reinforcement</span>
                  <strong>{formatMemoryTimestamp(latestMemoryEntry?.timestamp)}</strong>
                </div>

                <div>
                  <span>Dominant Theme</span>
                  <strong>{dominantTheme}</strong>
                </div>

                <div>
                  <span>Influence Level</span>
                  <strong>{influenceLevel}</strong>
                </div>
              </div>
            </div>

            <div className="adaptive-memory-card adaptive-memory-narrative">
              <h3>Memory Narrative</h3>
              <p>{memorySummary}</p>

              {memoryObservations.length > 0 && (
                <ul>
                  {memoryObservations.slice(0, 3).map((observation, index) => (
                    <li key={index}>{observation}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="command-section escalation-section">
          <h2>ESCALATION INTELLIGENCE</h2>

          <div className="escalation-grid">
            <div className="escalation-card">
              <h3>Escalation Risk</h3>

              <div className="escalation-metrics">
                <div>
                  <span>Escalation Level</span>
                  <strong>{escalationLevel}</strong>
                </div>

                <div>
                  <span>Trigger Count</span>
                  <strong>{escalationTriggers.length}</strong>
                </div>
              </div>
            </div>

            <div className="escalation-card">
              <h3>Protection Layer</h3>

              <div className="escalation-metrics">
                <div>
                  <span>Protection Status</span>
                  <strong>{protectionStatus}</strong>
                </div>

                <div>
                  <span>Risk State</span>
                  <strong>{riskState}</strong>
                </div>
              </div>
            </div>

            <div className="escalation-card">
              <h3>Event Pressure</h3>

              <div className="escalation-metrics">
                <div>
                  <span>Event Load</span>
                  <strong>{eventLoad}</strong>
                </div>

                <div>
                  <span>Runtime Health</span>
                  <strong>{classifyHealth(overview?.runtimeHealth)}</strong>
                </div>
              </div>
            </div>

            <div className="escalation-card escalation-narrative">
              <h3>Narrative Summary</h3>
              <p>{escalationSummary}</p>
            </div>
          </div>
        </section>

        <section className="command-section cognitive-timeline-section">
          <h2>COGNITIVE TIMELINE</h2>

          <div className="cognitive-timeline-grid">
            <div className="cognitive-timeline-card">
              <h3>Recent Consensus States</h3>

              <div className="timeline-list">
                {consensusTimeline.length > 0 ? (
                  consensusTimeline.map((state, index) => (
                    <div key={index} className="timeline-item">
                      <strong>{state}</strong>
                    </div>
                  ))
                ) : (
                  <div className="timeline-item">
                    <strong>DETECTING</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="cognitive-timeline-card">
              <h3>Memory Reinforcement Timeline</h3>

              <div className="timeline-list">
                {memoryTimelineEvents.length > 0 ? (
                  memoryTimelineEvents.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <span>{event.time}</span>
                      <strong>{event.label}</strong>
                    </div>
                  ))
                ) : (
                  <div className="timeline-item">
                    <span>LATEST</span>
                    <strong>DETECTING</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="cognitive-timeline-card">
              <h3>Escalation Timeline</h3>

              <div className="timeline-list">
                {escalationTimelineEvents.length > 0 ? (
                  escalationTimelineEvents.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <span>{event.time}</span>
                      <strong>{event.label}</strong>
                    </div>
                  ))
                ) : (
                  <div className="timeline-item">
                    <span>LATEST</span>
                    <strong>DETECTING</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="cognitive-timeline-card">
              <h3>Narrative Evolution</h3>

              <div className="timeline-list">
                {narrativeTimeline.length > 0 ? (
                  narrativeTimeline.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <span>{event.time}</span>
                      <strong>{event.label}</strong>
                    </div>
                  ))
                ) : (
                  <div className="timeline-item">
                    <span>LATEST</span>
                    <strong>DETECTING</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="command-section">
          <h2>Market Overview</h2>
          <div className="command-grid">
            <MarketOverviewPanel />
            <IntelligenceFeedPanel />
          </div>
        </section>

        <section className="command-section">
          <h2>Market Intelligence</h2>
          <div className="command-grid">
            <GlobalScanPanel />
            <MarketPulsePanel
              confidence={confidence}
              liquidityPressure={liquidityPressure}
              institutionalFlow={institutionalFlow}
            />
            <DataStreamsPanel />
            <NewsLetterPanel />
          </div>
        </section>

        <section className="command-section">
          <h2>Three Brain Intelligence Core</h2>
          <div className={`brain-sync-panel ${syncColorClass}`}>
            <h3>THREE BRAIN SYNCHRONIZATION</h3>

            <div className="brain-sync-row">
              <span>TACTICAL: {tacticalSyncState}</span>
              <span>BEHAVIORAL: {behavioralSyncState}</span>
              <span>FAILSAFE: {failsafeSyncState}</span>
            </div>

            <div className="brain-sync-score-row">
              <strong>SYNC SCORE: {syncScore}%</strong>
              <strong>STATUS: {syncStatus}</strong>
            </div>
          </div>

          <div className="command-grid brain-grid">
            <TacticalBrainPanel
              data={brainStatus?.tacticalBrain}
              consensusContribution={overview?.consensus?.consensusStrength || "LOADING"}
              consensusInfluence={getConsensusInfluence(brainStatus?.tacticalBrain)}
            />
            <BehavioralBrainPanel
              data={brainStatus?.behavioralBrain}
              consensusContribution={overview?.consensus?.consensusStrength || "LOADING"}
              consensusInfluence={getConsensusInfluence(brainStatus?.behavioralBrain, -8)}
            />
            <FailsafeBrainPanel
              data={brainStatus?.failsafeBrain}
              consensusContribution={overview?.consensus?.consensusStrength || "LOADING"}
              consensusInfluence={getConsensusInfluence(brainStatus?.failsafeBrain, 6)}
              escalationLevel={overview?.escalation?.escalationLevel || "NONE"}
            />
          </div>
        </section>

        <section className="command-section">
          <h2>Autonomous Intelligence Systems</h2>
          <div className="command-grid">
            <SystemBootPanel />
            <BrainActivationPanel />
            <SystemOnlinePanel />
          </div>
        </section>

        <section className="command-section">
          <h2>Market Regime Intelligence</h2>
          <div className="command-grid">
            <ExpansionPanel data={strategicEnvironment} />
            <CrisisManagementPanel data={strategicEnvironment} />
            <VolatilityCompressionPanel data={liquidityPressure} />
            <InstitutionalAccumlationPanel data={institutionalFlow} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default CommandCenter;
