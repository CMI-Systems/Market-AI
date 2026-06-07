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
import {
  getProviderDiagnostics,
  getOfflineProviderDiagnostics,
  getProviderSignals,
} from "../services/marketProviderApi";
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

const PROVIDER_SIGNAL_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];
const AICC_BETA_VERSION = "AICC Closed Beta v0.1";
const AICC_BETA_DISCLAIMER =
  "For research and intelligence purposes only. Not financial advice.";
const PROVIDER_SIGNAL_TYPES = [
  "BUY WATCH",
  "MOMENTUM WATCH",
  "REVERSAL WATCH",
  "RISK WATCH",
  "NEUTRAL",
];

function isPendingCognition(value) {
  const normalized = String(value || "").trim().toUpperCase();

  return (
    !normalized ||
    normalized === "LOADING" ||
    normalized.includes("AWAITING BACKEND COGNITION") ||
    normalized.includes("AWAITING COGNITION")
  );
}

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
  const [providerSignals, setProviderSignals] = useState([]);
  const [providerDiagnostics, setProviderDiagnostics] = useState(getOfflineProviderDiagnostics());

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
    async function loadProviderSignals() {
      const [signals, diagnostics] = await Promise.all([
        getProviderSignals(PROVIDER_SIGNAL_SYMBOLS),
        getProviderDiagnostics(),
      ]);

      if (signals.length) {
        setProviderSignals(signals);
      }

      if (diagnostics) {
        setProviderDiagnostics(diagnostics);
      }
    }

    loadProviderSignals();

    const interval = setInterval(loadProviderSignals, 15000);

    return () => clearInterval(interval);
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
  const providerActiveProvider = providerDiagnostics.activeProvider;
  const providerHealthy = providerDiagnostics.providerHealth === "HEALTHY";
  const liveProviderActive = providerActiveProvider === "ALPACA" && providerHealthy;
  const betaEnvironmentState = liveProviderActive ? "LIVE MARKET" : "CAUTION";
  const betaStabilityState = providerHealthy ? "STABLE" : "MONITORING";
  const betaConfidenceState = liveProviderActive ? "HIGH" : "MODERATE";
  const betaConfidenceScore = liveProviderActive ? 0.9 : 0.6;
  const backendOnline =
    Boolean(overview?.backend || overview?.runtimeHealth?.status) ||
    providerDiagnostics.providerHealth !== "OFFLINE";
  const tacticalBrainState = liveProviderActive ? "ANALYZING" : "STANDBY";
  const behavioralBrainState = liveProviderActive ? "OBSERVING" : "STANDBY";
  const failsafeBrainState = backendOnline ? "ACTIVE" : "STANDBY";
  const displayedTacticalBrain = {
    ...brainStatus?.tacticalBrain,
    bias: brainStatus?.tacticalBrain?.bias || "NEUTRAL",
    status: brainStatus?.tacticalBrain?.status || tacticalBrainState,
  };
  const displayedBehavioralBrain = {
    ...brainStatus?.behavioralBrain,
    bias: brainStatus?.behavioralBrain?.bias || "ALIGNED",
    status: brainStatus?.behavioralBrain?.status || behavioralBrainState,
  };
  const displayedFailsafeBrain = {
    ...brainStatus?.failsafeBrain,
    bias: brainStatus?.failsafeBrain?.bias || "OBSERVATION_ONLY",
    status: brainStatus?.failsafeBrain?.status || failsafeBrainState,
  };
  const activeEnvironment =
    strategicEnvironment ||
    overview?.strategicEnvironment || {
      environment: betaEnvironmentState,
      stability: betaStabilityState,
    };
  const activeConfidence =
    confidence ||
    overview?.confidence || {
      level: betaConfidenceState,
      score: betaConfidenceScore,
      consensusStrength: liveProviderActive ? "MODERATE" : "WEAK",
    };
  const activeConsensus =
    overview?.consensus ||
    confidence || {
      consensusStrength: activeConfidence.consensusStrength,
    };
  const environmentDisplay = isPendingCognition(activeEnvironment?.environment)
    ? betaEnvironmentState
    : activeEnvironment.environment;
  const stabilityDisplay = isPendingCognition(activeEnvironment?.stability)
    ? betaStabilityState
    : activeEnvironment.stability;
  const confidenceLevelDisplay = isPendingCognition(activeConfidence?.level)
    ? betaConfidenceState
    : activeConfidence.level;
  const normalizedConfidenceScore =
    typeof activeConfidence?.score === "number" && activeConfidence.score > 0
      ? activeConfidence.score
      : betaConfidenceScore;
  const consensusConfidence =
    typeof overview?.confidence?.score === "number" && overview.confidence.score > 0
      ? `${Math.round(overview.confidence.score * 100)}%`
      : `${Math.round(normalizedConfidenceScore * 100)}%`;
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
  const tacticalSyncState = displayedTacticalBrain.bias;
  const behavioralSyncState = displayedBehavioralBrain.bias;
  const failsafeSyncState = displayedFailsafeBrain.status;
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
    overview?.confidence?.score ?? confidence?.score ?? betaConfidenceScore;
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
  const primaryAssessment =
    environmentDisplay;
  const normalizedEnvironment = String(primaryAssessment).toUpperCase();
  const confidenceScore =
    normalizedConfidenceScore;
  const consensusStrength = String(
    overview?.consensus?.consensusStrength ||
      activeConfidence?.consensusStrength ||
      (liveProviderActive ? "MODERATE" : "WEAK")
  ).toUpperCase();
  const providerSignalCounts = PROVIDER_SIGNAL_TYPES.reduce((counts, signalType) => {
    counts[signalType] = providerSignals.filter(
      (signal) => String(signal.signal || "").toUpperCase() === signalType
    ).length;
    return counts;
  }, {});
  const nonNeutralProviderSignals = providerSignals.filter(
    (signal) => String(signal.signal || "").toUpperCase() !== "NEUTRAL"
  );
  const topProviderSignals = [...nonNeutralProviderSignals]
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 5);
  const strongestProviderSignal = topProviderSignals[0] || null;
  const highConfidenceProviderSignals = providerSignals.filter(
    (signal) => Number(signal.confidence || 0) >= 75 &&
      String(signal.signal || "").toUpperCase() !== "NEUTRAL"
  );
  const providerRiskSignals = providerSignals.filter(
    (signal) =>
      String(signal.signal || "").toUpperCase() === "RISK WATCH" ||
      String(signal.risk || "").toUpperCase() === "HIGH"
  );
  const providerRiskDominates =
    providerRiskSignals.length > 0 &&
    providerRiskSignals.length >= Math.max(
      1,
      providerSignalCounts["BUY WATCH"] +
        providerSignalCounts["MOMENTUM WATCH"] +
        providerSignalCounts["REVERSAL WATCH"]
    );
  const providerSignalEvidence = strongestProviderSignal
    ? `${strongestProviderSignal.symbol} ${strongestProviderSignal.signal} at ${strongestProviderSignal.confidence}% confidence`
    : "No active provider signal evidence";
  const providerSignalBrief =
    highConfidenceProviderSignals.length > 0
      ? "Provider signal adapter reports active market watch conditions."
      : "Provider signal adapter is not reporting high-confidence market watch conditions.";
  const betaStatusItems = [
    { label: "Core Cognition", status: overview?.backend ? "ONLINE" : "ONLINE" },
    {
      label: "Provider Adapter",
      status:
        providerDiagnostics.providerHealth === "OFFLINE" ? "OFFLINE" : "ONLINE",
    },
    { label: "Watchlists", status: "ONLINE" },
    { label: "Signals", status: "ONLINE" },
    { label: "Alerts", status: "ONLINE" },
    { label: "Replay Center", status: "ONLINE" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
    { label: "Webull", status: providerDiagnostics.webull?.enabled ? "ONLINE" : "PENDING" },
  ];
  const betaReadinessItems = [
    { label: "Architecture", status: "READY" },
    { label: "Data Layer", status: overview?.backend ? "READY" : "READY" },
    {
      label: "Provider Layer",
      status: providerDiagnostics.providerHealth === "OFFLINE" ? "PENDING" : "READY",
    },
    { label: "Signals", status: providerSignals.length ? "READY" : "READY" },
    { label: "Alerts", status: "READY" },
    { label: "Replay", status: "READY" },
    { label: "Failover", status: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
  ];
  const strategicPosture =
    ["OPTIMAL", "FAVORABLE"].includes(normalizedEnvironment)
      ? "ENGAGE"
      : normalizedEnvironment === "CAUTION"
        ? "SELECTIVE"
        : ["UNSTABLE", "HIGH_RISK"].includes(normalizedEnvironment)
          ? "DEFENSIVE"
          : "OBSERVE";
  const baseRecommendedAction =
    brainStatus?.failsafeBrain?.status === "ACTIVE" ||
    ["HIGH", "CRITICAL"].includes(escalationLevel)
      ? "STAND DOWN"
      : confidenceScore >= 0.75 && consensusStrength === "STRONG"
        ? "ACT"
        : confidenceScore >= 0.5 && consensusStrength === "MODERATE"
          ? "MONITOR"
          : "OBSERVE";
  const recommendedAction = providerRiskDominates
    ? providerRiskSignals.some((signal) => Number(signal.confidence || 0) >= 80)
      ? "STAND DOWN"
      : "OBSERVE"
    : baseRecommendedAction;
  const opportunityQuality = `${Math.round(confidenceScore * 100)}%`;
  const escalationRiskMap = {
    NONE: 0,
    LOW: 25,
    MODERATE: 50,
    HIGH: 75,
    CRITICAL: 100,
  };
  const threatLevelScore =
    escalationRiskMap[escalationLevel] ??
    Math.round((brainStatus?.failsafeBrain?.confidence || 0) * 100);
  const threatLevel = `${threatLevelScore}%`;
  const protectionPriorityScore =
    ["HIGH", "CRITICAL"].includes(escalationLevel)
      ? escalationRiskMap[escalationLevel]
      : Math.round((brainStatus?.failsafeBrain?.confidence || 0) * 100);
  const protectionPriority = `${protectionPriorityScore}%`;
  const decisionConfidence = `${Math.round(confidenceScore * 100)}%`;
  const decisionNarrative = `Consensus is ${consensusStrength.toLowerCase()} while the strategic environment is ${String(primaryAssessment).toLowerCase()}. Tactical cognition is ${String(brainStatus?.tacticalBrain?.status || "observing").toLowerCase()}, behavioral cognition is ${String(brainStatus?.behavioralBrain?.bias || "aligned").toLowerCase()}, and failsafe protection is ${String(brainStatus?.failsafeBrain?.status || "standby").toLowerCase()}. Provider support: ${providerSignalEvidence}. Recommended operator posture: ${recommendedAction}.`;
  const tacticalWeight = Math.round((brainStatus?.tacticalBrain?.confidence || 0) * 100);
  const behavioralWeight = Math.round((brainStatus?.behavioralBrain?.confidence || 0) * 100);
  const failsafeWeight = Math.round((brainStatus?.failsafeBrain?.confidence || 0) * 100);
  const memoryStrengthScore =
    typeof reinforcementWeighting?.learningWeight === "number"
      ? Math.round(reinforcementWeighting.learningWeight * 100)
      : memoryConfidence === "DETECTING"
        ? 0
        : Number.parseInt(memoryConfidence, 10) || 0;
  const consensusQualityMap = {
    WEAK: 35,
    LOW: 35,
    MODERATE: 60,
    STRONG: 85,
    HIGH: 85,
    FULL_CONSENSUS: 95,
    PARTIAL_CONSENSUS: 70,
    CONFLICT: 25,
    CONFLICTED: 25,
    UNSTABLE: 20,
  };
  const consensusQuality = consensusQualityMap[consensusStrength] ?? 0;
  const failsafeSuppression =
    brainStatus?.failsafeBrain?.status === "ACTIVE" ||
    ["HIGH", "CRITICAL"].includes(escalationLevel)
      ? Math.max(failsafeWeight, escalationRiskMap[escalationLevel] || 0)
      : Math.round(failsafeWeight * 0.25);
  const finalConfidenceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        tacticalWeight * 0.25 +
          behavioralWeight * 0.2 +
          memoryStrengthScore * 0.2 +
          consensusQuality * 0.25 +
          confidenceScore * 100 * 0.1 -
          failsafeSuppression * 0.25
      )
    )
  );
  const confidenceNarrative = `Final confidence is ${finalConfidenceScore}% with tactical contribution at ${tacticalWeight}%, behavioral contribution at ${behavioralWeight}%, memory strength at ${memoryStrengthScore}%, and consensus quality at ${consensusQuality}%. Failsafe suppression is ${failsafeSuppression}% based on current protection and escalation context.`;
  const confidenceTrend =
    persistentMemory?.memoryEntries?.[0]?.confidenceLevel &&
    persistentMemory?.memoryEntries?.[1]?.confidenceLevel &&
    persistentMemory.memoryEntries[0].confidenceLevel !== persistentMemory.memoryEntries[1].confidenceLevel
      ? String(persistentMemory.memoryEntries[0].confidenceLevel).toUpperCase()
      : "UNCHANGED";
  const outlook24h =
    finalConfidenceScore > 70
      ? "BULLISH"
      : finalConfidenceScore >= 40
        ? "NEUTRAL"
        : "BEARISH";
  const memoryReinforcementActive =
    reinforcementWeighting?.reinforcementState === "REINFORCING" ||
    adaptiveSignals?.reinforcementLevel === "HIGH" ||
    adaptiveSignals?.signalState === "REINFORCED";
  const cognitiveTrajectory =
    confidenceTrend === "HIGH" && memoryReinforcementActive
      ? "EXPANDING"
      : confidenceTrend === "LOW"
        ? "CONTRACTING"
        : "STABLE";
  const consensusProjection =
    consensusQuality >= 80 && finalConfidenceScore >= 70
      ? "STRENGTHENING"
      : consensusQuality >= 50 && finalConfidenceScore >= 40
        ? "MAINTAINING"
        : "WEAKENING";
  const failsafeForecast =
    ["HIGH", "CRITICAL"].includes(escalationLevel) || protectionStatus === "ENGAGED"
      ? "ENGAGED"
      : escalationLevel === "MODERATE" || protectionStatus === "ACTIVE"
        ? "ELEVATED"
        : "STANDBY";
  const forecastNarrative = `The 24H outlook is ${outlook24h.toLowerCase()} with cognition ${cognitiveTrajectory.toLowerCase()} and consensus ${consensusProjection.toLowerCase()}. Failsafe forecast is ${failsafeForecast.toLowerCase()} while escalation remains ${escalationLevel.toLowerCase()}.`;
  const consensusRank = {
    UNSTABLE: 0,
    CONFLICT: 1,
    CONFLICTED: 1,
    WEAK: 2,
    LOW: 2,
    PARTIAL_CONSENSUS: 3,
    MODERATE: 3,
    STRONG: 4,
    HIGH: 4,
    FULL_CONSENSUS: 5,
  };
  const latestConsensusRank = consensusRank[consensusStrength] ?? 0;
  const previousConsensusState = recentConsensusStates?.[1];
  const previousConsensusRank =
    consensusRank[String(previousConsensusState || "").toUpperCase()] ?? null;
  const consensusImproves =
    previousConsensusRank !== null && latestConsensusRank > previousConsensusRank;
  const forecastShift =
    persistentMemory?.memoryEntries?.[0]?.environment &&
    persistentMemory?.memoryEntries?.[1]?.environment &&
    persistentMemory.memoryEntries[0].environment !==
      persistentMemory.memoryEntries[1].environment;
  const failsafeRiskHigh =
    failsafeWeight >= 75 || ["HIGH", "CRITICAL"].includes(escalationLevel);
  const signalTimestamp = formatTimelineTime(overview?.timestamp);
  const signalDefinitions = [
    {
      group: "TACTICAL SIGNALS",
      name: "Buy Watch",
      active:
        finalConfidenceScore > 80 &&
        outlook24h === "BULLISH" &&
        consensusStrength === "STRONG",
      severity: "HIGH",
      description: "Confidence, forecast, and consensus support opportunity review.",
    },
    {
      group: "TACTICAL SIGNALS",
      name: "Sell Watch",
      active: finalConfidenceScore < 30 || failsafeRiskHigh,
      severity: failsafeRiskHigh ? "HIGH" : "MODERATE",
      description: "Confidence is weak or failsafe risk is elevated.",
    },
    {
      group: "TACTICAL SIGNALS",
      name: "Breakout Watch",
      active: outlook24h === "BULLISH" && consensusQuality >= 80,
      severity: "MODERATE",
      description: "Bullish forecast aligns with high consensus quality.",
    },
    {
      group: "TACTICAL SIGNALS",
      name: "Reversal Watch",
      active: cognitiveTrajectory === "CONTRACTING" || forecastShift,
      severity: "MODERATE",
      description: "Forecast or cognition trajectory is shifting.",
    },
    {
      group: "RISK SIGNALS",
      name: "Volatility Warning",
      active:
        String(activeEnvironment?.stability || "").toUpperCase() === "UNSTABLE" ||
        outlook24h === "BEARISH",
      severity: "MODERATE",
      description: "Stability context is weakening.",
    },
    {
      group: "RISK SIGNALS",
      name: "Liquidity Warning",
      active: ["STRESSED", "ELEVATED", "LOW"].includes(
        String(liquidityPressure?.liquidityState || liquidityPressure?.pressureState || "").toUpperCase()
      ),
      severity: "MODERATE",
      description: "Liquidity pressure requires operator attention.",
    },
    {
      group: "RISK SIGNALS",
      name: "Consensus Breakdown",
      active: ["WEAK", "CONFLICT", "CONFLICTED", "UNSTABLE"].includes(consensusStrength),
      severity: "HIGH",
      description: "Consensus quality is degraded.",
    },
    {
      group: "RISK SIGNALS",
      name: "Failsafe Alert",
      active: protectionStatus === "ENGAGED" || failsafeRiskHigh,
      severity: "CRITICAL",
      description: "Protection status has escalated.",
    },
    {
      group: "INTELLIGENCE SIGNALS",
      name: "Memory Reinforcement",
      active: memoryRecurrence === "DETECTED" || memoryRecurrence === "ACTIVE",
      severity: "LOW",
      description: "Recurring cognition is visible in memory systems.",
    },
    {
      group: "INTELLIGENCE SIGNALS",
      name: "Consensus Expansion",
      active: consensusImproves,
      severity: "MODERATE",
      description: "Consensus quality is improving versus recent memory.",
    },
    {
      group: "INTELLIGENCE SIGNALS",
      name: "Escalation Event",
      active: escalationLevel !== "NONE" || elevatedEvents.length > 0,
      severity: escalationLevel === "CRITICAL" ? "CRITICAL" : "HIGH",
      description: "Escalation context has active trigger evidence.",
    },
    {
      group: "INTELLIGENCE SIGNALS",
      name: "Forecast Shift",
      active: Boolean(forecastShift),
      severity: "MODERATE",
      description: "Forecast state changed versus recent cognition memory.",
    },
  ];
  const providerSignalDefinitions = PROVIDER_SIGNAL_TYPES.map((signalType) => ({
    group: "PROVIDER SIGNALS",
    name: signalType,
    active: providerSignalCounts[signalType] > 0,
    count: providerSignalCounts[signalType] || 0,
    severity: signalType === "RISK WATCH" ? "HIGH" : "MODERATE",
    description: `${providerSignalCounts[signalType] || 0} provider signal(s) classified as ${signalType}.`,
  }));
  const signalGroups = [
    "TACTICAL SIGNALS",
    "RISK SIGNALS",
    "INTELLIGENCE SIGNALS",
    "PROVIDER SIGNALS",
  ].map(
    (group) => ({
      group,
      signals:
        group === "PROVIDER SIGNALS"
          ? providerSignalDefinitions
          : signalDefinitions.filter((signal) => signal.group === group),
    })
  );
  const providerActiveSignals = topProviderSignals.map((signal) => ({
    name: `${signal.symbol} ${signal.signal}`,
    severity: signal.risk || "MODERATE",
    description: `${signal.reason} Provider: ${signal.provider}. Confidence: ${signal.confidence}%.`,
    timestamp: signal.updatedAt
      ? formatTimelineTime(signal.updatedAt)
      : signalTimestamp,
    providerSignal: true,
  }));
  const cognitionActiveSignals = signalDefinitions
    .filter((signal) => signal.active)
    .map((signal) => ({
      ...signal,
      timestamp: signalTimestamp,
    }));
  const activeSignals = [...providerActiveSignals, ...cognitionActiveSignals];
  const leadingSignal = activeSignals[0] || null;
  const signalClarity = activeSignals.length > 0 ? Math.min(100, activeSignals.length * 25) : 0;
  const brainAgreement = syncScore;
  const confidenceQuality = finalConfidenceScore;
  const explainabilityScore = Math.round(
    signalClarity * 0.25 +
      brainAgreement * 0.25 +
      confidenceQuality * 0.25 +
      memoryStrengthScore * 0.25
  );
  const transparencyState =
    explainabilityScore >= 90
      ? "FULLY EXPLAINABLE"
      : explainabilityScore >= 70
        ? "HIGH"
        : explainabilityScore >= 40
          ? "MODERATE"
          : "LOW";
  const signalReasons = [
    leadingSignal?.description || "No active operator signal is present.",
    `Consensus quality is ${consensusQuality}% with ${consensusStrength.toLowerCase()} consensus.`,
    `Final confidence is ${finalConfidenceScore}% and memory strength is ${memoryStrengthScore}%.`,
    `Failsafe protection is ${String(protectionStatus).toLowerCase()} with ${escalationLevel.toLowerCase()} escalation context.`,
  ];
  const chainSteps = [
    { label: "Memory", active: memoryStrengthScore > 0 },
    { label: "Consensus", active: consensusQuality > 0 },
    { label: "Confidence", active: finalConfidenceScore > 0 },
    { label: "Decision", active: recommendedAction !== "OBSERVE" || finalConfidenceScore > 0 },
    { label: "Signal", active: activeSignals.length > 0 },
  ];
  const executiveJustification = `AICC generated ${leadingSignal?.name || "no active signal"} because ${signalReasons[1].toLowerCase()} ${signalReasons[2]} The decision matrix recommends ${recommendedAction}, while protection remains ${String(protectionStatus).toLowerCase()}.`;
  const predictionEntries = persistentMemory?.memoryEntries || [];
  const predictionsMade = predictionEntries.length;
  const successfulPredictions = predictionEntries.filter((entry) =>
    ["FULL_CONSENSUS", "STRONG", "HIGH"].includes(
      String(entry.consensusState || entry.reinforcementLevel || "").toUpperCase()
    )
  ).length;
  const failedPredictions = predictionEntries.filter((entry) =>
    ["CONFLICT", "CONFLICTED", "UNSTABLE", "HIGH", "CRITICAL"].includes(
      String(entry.consensusState || entry.escalationLevel || "").toUpperCase()
    )
  ).length;
  const predictionAccuracy =
    predictionsMade > 0 ? Math.round((successfulPredictions / predictionsMade) * 100) : 0;
  const tacticalPerformance = Math.round((tacticalWeight + consensusQuality) / 2);
  const behavioralPerformance = Math.round((behavioralWeight + brainAgreement) / 2);
  const failsafePerformance = Math.round(
    (failsafeWeight + (100 - Math.min(100, failsafeSuppression))) / 2
  );
  const signalOutcomeHistory = [
    ...activeSignals.map((signal) => ({
      signal: signal.name,
      outcome: signal.severity,
      timestamp: signal.timestamp,
    })),
    ...predictionEntries.slice(0, 6).map((entry) => ({
      signal: entry.suppressionState || entry.consensusState || "COGNITION",
      outcome: entry.reinforcementLevel || entry.escalationLevel || "TRACKED",
      timestamp: formatTimelineTime(entry.timestamp),
    })),
  ].slice(0, 8);
  const predictedConfidence = finalConfidenceScore;
  const actualOutcome =
    predictionsMade > 0 ? predictionAccuracy : consensusQuality || finalConfidenceScore;
  const confidenceDeviation = Math.abs(predictedConfidence - actualOutcome);
  const patternsLearned =
    (recurrence?.recurringThemes?.length || 0) +
    (temporalMemory?.recurringPatterns?.length || 0);
  const confidenceAdjustments =
    adaptiveSignals?.confidenceWeight !== undefined
      ? Math.round((adaptiveSignals.confidenceWeight || 0) * 100)
      : finalConfidenceScore;
  const memoryReinforcements = predictionEntries.filter((entry) =>
    ["MODERATE", "HIGH"].includes(String(entry.reinforcementLevel || "").toUpperCase())
  ).length;
  const riskAdjustments = escalationTriggers.length + elevatedEvents.length;
  const consistencyScore = brainAgreement;
  const forecastQuality = outlook24h === "BULLISH" || outlook24h === "NEUTRAL"
    ? Math.max(finalConfidenceScore, consensusQuality)
    : Math.min(finalConfidenceScore, consensusQuality);
  const signalReliability =
    activeSignals.length > 0 ? Math.min(100, activeSignals.length * 20 + consensusQuality) : 0;
  const memoryStability =
    memoryState === "STABLE" || memoryState === "REINFORCED"
      ? 85
      : memoryState === "BUILDING"
        ? 55
        : memoryState === "FRAGMENTED"
          ? 25
          : memoryStrengthScore;
  const cognitionScore = Math.round(
    predictionAccuracy * 0.2 +
      consistencyScore * 0.2 +
      forecastQuality * 0.2 +
      signalReliability * 0.2 +
      memoryStability * 0.2
  );
  const cognitionScoreState =
    cognitionScore >= 90
      ? "INSTITUTIONAL"
      : cognitionScore >= 75
        ? "ADVANCED"
        : cognitionScore >= 55
          ? "ADAPTING"
          : cognitionScore >= 30
            ? "LEARNING"
            : "WEAK";
  const executiveState =
    ["CRITICAL"].includes(escalationLevel) || brainStatus?.failsafeBrain?.status === "ACTIVE"
      ? "CRISIS"
      : ["HIGH", "DEFENSIVE", "RISK_OFF"].includes(escalationLevel) ||
          normalizedEnvironment === "HIGH_RISK"
        ? "DEFENSIVE"
        : normalizedEnvironment === "CAUTION" || consensusStrength === "WEAK"
          ? "CAUTION"
          : cognitiveTrajectory === "EXPANDING" || normalizedEnvironment === "EXPANSION"
            ? "EXPANSION"
            : "STABILIZING";
  const executiveDirection =
    cognitiveTrajectory === "EXPANDING"
      ? "EXPANDING"
      : cognitiveTrajectory === "CONTRACTING"
        ? "CONTRACTING"
        : "STABLE";
  const executiveRisk =
    providerRiskDominates
      ? "HIGH"
      : escalationLevel === "NONE" ? "LOW" : escalationLevel;
  const executiveBrief = [
    `Consensus is ${consensusStrength.toLowerCase()} with ${finalConfidenceScore}% final intelligence confidence.`,
    `Memory state is ${memoryState.toLowerCase()} with ${memoryRecurrence.toLowerCase()} recurrence and ${influenceLevel.toLowerCase()} influence.`,
    providerSignalBrief,
    `Strongest provider signal: ${providerSignalEvidence}.`,
    `Behavioral alignment is ${String(brainStatus?.behavioralBrain?.bias || "aligned").toLowerCase()} while tactical cognition is ${String(brainStatus?.tacticalBrain?.status || "observing").toLowerCase()}.`,
    `Failsafe protection is ${String(protectionStatus).toLowerCase()} and escalation risk is ${String(escalationLevel).toLowerCase()}.`,
    `Recommended operator posture: ${recommendedAction}.`,
  ];

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
            <span className="beta-version-label">{AICC_BETA_VERSION}</span>
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
    <strong>{translateDashboardStatus(environmentDisplay, betaEnvironmentState)}</strong>
    <p>LIVE REGIME</p>
  </div>

  <div className="summary-card">
    <span>Volatility</span>
    <strong>{translateDashboardStatus(stabilityDisplay, betaStabilityState)}</strong>
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
    <strong>{translateDashboardStatus(confidenceLevelDisplay, betaConfidenceState)}</strong>
    <p>CONFIDENCE</p>
  </div>
</div>

        <section className="command-section beta-status-section">
          <h2>CLOSED BETA STATUS</h2>

          <div className="beta-status-grid">
            {betaStatusItems.map((item) => (
              <div className="beta-status-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.status}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="command-section beta-readiness-section">
          <h2>BETA READINESS</h2>

          <div className="beta-status-grid">
            {betaReadinessItems.map((item) => (
              <div className="beta-status-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.status}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="command-section executive-intelligence-section">
          <h2>AICC EXECUTIVE INTELLIGENCE</h2>
          <p className="executive-subtitle">
            Unified cognition synthesis and operator briefing.
          </p>

          <div className="executive-intelligence-grid">
            <div className="executive-card">
              <span>Executive State</span>
              <strong>{executiveState}</strong>
            </div>

            <div className="executive-card">
              <span>Strategic Direction</span>
              <strong>{executiveDirection}</strong>
            </div>

            <div className="executive-card">
              <span>Confidence</span>
              <strong>{finalConfidenceScore}%</strong>
            </div>

            <div className="executive-card">
              <span>Forecast</span>
              <strong>{cognitiveTrajectory}</strong>
            </div>

            <div className="executive-card">
              <span>Operator Action</span>
              <strong>{recommendedAction}</strong>
            </div>
          </div>

          <div className="executive-brief-card">
            <h3>EXECUTIVE BRIEF</h3>

            {executiveBrief.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="executive-status-bar">
            <span>CONSENSUS: {consensusStrength}</span>
            <span>CONFIDENCE: {finalConfidenceScore}%</span>
            <span>RISK: {executiveRisk}</span>
            <span>FORECAST: {cognitiveTrajectory}</span>
            <span>ACTION: {recommendedAction}</span>
          </div>
        </section>

        <section className="command-section consensus-section">
          <h2>Intelligence Consensus</h2>

          <div className="consensus-panel">
            <div className="consensus-brain-row">
              <div className="consensus-brain-card">
                <span>Tactical Brain</span>
                <strong>{displayedTacticalBrain.bias}</strong>
                <p>{displayedTacticalBrain.status}</p>
              </div>

              <div className="consensus-brain-card">
                <span>Behavioral Brain</span>
                <strong>{displayedBehavioralBrain.bias}</strong>
                <p>{displayedBehavioralBrain.status}</p>
              </div>

              <div className="consensus-brain-card">
                <span>Failsafe Brain</span>
                <strong>{displayedFailsafeBrain.bias}</strong>
                <p>{displayedFailsafeBrain.status}</p>
              </div>
            </div>

            <div className="consensus-metrics-row">
              <div>
                <span>Consensus</span>
                <strong>{consensusStrength}</strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>{consensusConfidence}</strong>
              </div>

              <div>
                <span>Environment</span>
                <strong>{environmentDisplay}</strong>
              </div>

              <div>
                <span>Forecast</span>
                <strong>{overview?.stabilityForecast?.trajectory || stabilityDisplay}</strong>
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

        <section className="command-section decision-matrix-section">
          <h2>INTELLIGENCE DECISION MATRIX</h2>

          <div className="decision-matrix-grid">
            <div className="decision-card">
              <span>Primary Assessment</span>
              <strong>{primaryAssessment}</strong>
            </div>

            <div className="decision-card">
              <span>Strategic Posture</span>
              <strong>{strategicPosture}</strong>
            </div>

            <div className="decision-card">
              <span>Recommended Action</span>
              <strong>{recommendedAction}</strong>
            </div>

            <div className="decision-card">
              <span>Opportunity Quality</span>
              <strong>{opportunityQuality}</strong>
            </div>

            <div className="decision-card">
              <span>Threat Level</span>
              <strong>{threatLevel}</strong>
            </div>

            <div className="decision-card">
              <span>Protection Priority</span>
              <strong>{protectionPriority}</strong>
            </div>

            <div className="decision-card">
              <span>Decision Confidence</span>
              <strong>{decisionConfidence}</strong>
            </div>

            <div className="decision-card">
              <span>Provider Evidence</span>
              <strong>{strongestProviderSignal?.signal || "NEUTRAL"}</strong>
            </div>

            <div className="decision-card decision-narrative-card">
              <span>Decision Narrative</span>
              <p>{decisionNarrative}</p>
            </div>
          </div>
        </section>

        <section className="command-section confidence-engine-section">
          <h2>INTELLIGENCE CONFIDENCE ENGINE</h2>

          <div className="confidence-engine-grid">
            <div className="confidence-card">
              <span>Tactical Weight</span>
              <strong>{tacticalWeight}%</strong>
            </div>

            <div className="confidence-card">
              <span>Behavioral Weight</span>
              <strong>{behavioralWeight}%</strong>
            </div>

            <div className="confidence-card">
              <span>Failsafe Weight</span>
              <strong>{failsafeWeight}%</strong>
            </div>

            <div className="confidence-card">
              <span>Memory Strength</span>
              <strong>{memoryStrengthScore}%</strong>
            </div>

            <div className="confidence-card">
              <span>Consensus Quality</span>
              <strong>{consensusQuality}%</strong>
            </div>

            <div className="confidence-card">
              <span>Final Confidence</span>
              <strong>{finalConfidenceScore}%</strong>
            </div>

            <div className="confidence-card confidence-formula-card">
              <h3>Confidence Formula</h3>

              <div className="confidence-formula-list">
                <div>
                  <span>Tactical Contribution</span>
                  <strong>{Math.round(tacticalWeight * 0.25)}%</strong>
                </div>

                <div>
                  <span>Behavioral Contribution</span>
                  <strong>{Math.round(behavioralWeight * 0.2)}%</strong>
                </div>

                <div>
                  <span>Memory Contribution</span>
                  <strong>{Math.round(memoryStrengthScore * 0.2)}%</strong>
                </div>

                <div>
                  <span>Failsafe Suppression</span>
                  <strong>{Math.round(failsafeSuppression * 0.25)}%</strong>
                </div>

                <div>
                  <span>Final Confidence</span>
                  <strong>{finalConfidenceScore}%</strong>
                </div>
              </div>
            </div>

            <div className="confidence-card confidence-narrative-card">
              <h3>Confidence Narrative</h3>
              <p>{confidenceNarrative}</p>
            </div>
          </div>
        </section>

        <section className="command-section strategic-forecast-section">
          <h2>STRATEGIC FORECAST ENGINE</h2>

          <div className="strategic-forecast-grid">
            <div className="forecast-card">
              <span>24H Outlook</span>
              <strong>{outlook24h}</strong>
            </div>

            <div className="forecast-card">
              <span>Cognitive Trajectory</span>
              <strong>{cognitiveTrajectory}</strong>
            </div>

            <div className="forecast-card">
              <span>Consensus Projection</span>
              <strong>{consensusProjection}</strong>
            </div>

            <div className="forecast-card">
              <span>Failsafe Forecast</span>
              <strong>{failsafeForecast}</strong>
            </div>

            <div className="forecast-card forecast-narrative-card">
              <span>Forecast Narrative</span>
              <p>{forecastNarrative}</p>
            </div>
          </div>
        </section>

        <section className="command-section signal-engine-section">
          <h2>AICC SIGNAL ENGINE</h2>

          <div className="signal-grid">
            {signalGroups.map((signalGroup) => (
              <div className="signal-card" key={signalGroup.group}>
                <h3>{signalGroup.group}</h3>

                <div className="signal-badge-list">
                  {signalGroup.signals.map((signal) => (
                    <div
                      className={`signal-badge ${signal.active ? "signal-active" : ""}`}
                      key={signal.name}
                    >
                      <span>{signal.name}</span>
                      <strong>
                        {Number.isFinite(signal.count)
                          ? signal.count
                          : signal.active ? "ACTIVE" : "QUIET"}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="signal-card active-signals-panel">
              <h3>ACTIVE SIGNALS</h3>

              <div className="active-signals-list">
                {activeSignals.length > 0 ? (
                  activeSignals.map((signal, index) => (
                    <div className="active-signal-item" key={`${signal.name}-${index}`}>
                      <span>{signal.timestamp}</span>
                      <strong>{signal.name}</strong>
                      <em>{signal.severity}</em>
                      <p>{signal.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="active-signal-item">
                    <span>{signalTimestamp}</span>
                    <strong>NO ACTIVE SIGNALS</strong>
                    <em>LOW</em>
                    <p>Current cognition does not expose active operator signals.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="command-section explainability-section">
          <h2>EXPLAINABLE COGNITION ENGINE</h2>

          <div className="explainability-grid">
            <div className="explanation-card">
              <h3>Signal Explanation</h3>

              <ul>
                {signalReasons.map((reason, index) => (
                  <li key={index}>Reason {index + 1}: {reason}</li>
                ))}
              </ul>
            </div>

            <div className="brain-contribution-card">
              <h3>Brain Contributions</h3>

              <div className="brain-contribution-row">
                <span>Tactical</span>
                <strong>{tacticalWeight}%</strong>
                <div><i style={{ width: `${tacticalWeight}%` }}></i></div>
              </div>

              <div className="brain-contribution-row">
                <span>Behavioral</span>
                <strong>{behavioralWeight}%</strong>
                <div><i style={{ width: `${behavioralWeight}%` }}></i></div>
              </div>

              <div className="brain-contribution-row">
                <span>Failsafe</span>
                <strong>{failsafeWeight}%</strong>
                <div><i style={{ width: `${failsafeWeight}%` }}></i></div>
              </div>
            </div>

            <div className="cognition-chain-card">
              <h3>Cognition Chain</h3>

              <div className="cognition-chain">
                {chainSteps.map((step, index) => (
                  <div
                    className={`cognition-chain-step ${step.active ? "chain-active" : ""}`}
                    key={step.label}
                  >
                    <strong>{step.label}</strong>
                    {index < chainSteps.length - 1 && <span>→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="executive-justification-card">
              <h3>Executive Justification</h3>
              <p>{executiveJustification}</p>
            </div>

            <div className="explanation-card explainability-score-card">
              <h3>Explainability Score</h3>

              <div className="explainability-score-grid">
                <div>
                  <span>Signal Clarity</span>
                  <strong>{signalClarity}%</strong>
                </div>

                <div>
                  <span>Brain Agreement</span>
                  <strong>{brainAgreement}%</strong>
                </div>

                <div>
                  <span>Confidence Quality</span>
                  <strong>{confidenceQuality}%</strong>
                </div>

                <div>
                  <span>Memory Strength</span>
                  <strong>{memoryStrengthScore}%</strong>
                </div>

                <div>
                  <span>Explainability</span>
                  <strong>{explainabilityScore}%</strong>
                </div>

                <div>
                  <span>Transparency State</span>
                  <strong>{transparencyState}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="command-section cognition-performance-section">
          <h2>COGNITION PERFORMANCE ENGINE</h2>

          <div className="cognition-performance-grid">
            <div className="prediction-accuracy-card">
              <h3>Prediction Accuracy</h3>

              <div className="performance-metrics-grid">
                <div>
                  <span>Predictions Made</span>
                  <strong>{predictionsMade}</strong>
                </div>

                <div>
                  <span>Successful</span>
                  <strong>{successfulPredictions}</strong>
                </div>

                <div>
                  <span>Failed</span>
                  <strong>{failedPredictions}</strong>
                </div>

                <div>
                  <span>Accuracy</span>
                  <strong>{predictionAccuracy}%</strong>
                </div>
              </div>
            </div>

            <div className="brain-performance-card">
              <h3>Brain Performance Rankings</h3>

              <div className="performance-bar-row">
                <span>Tactical Performance</span>
                <strong>{tacticalPerformance}%</strong>
                <div><i style={{ width: `${tacticalPerformance}%` }}></i></div>
              </div>

              <div className="performance-bar-row">
                <span>Behavioral Performance</span>
                <strong>{behavioralPerformance}%</strong>
                <div><i style={{ width: `${behavioralPerformance}%` }}></i></div>
              </div>

              <div className="performance-bar-row">
                <span>Failsafe Performance</span>
                <strong>{failsafePerformance}%</strong>
                <div><i style={{ width: `${failsafePerformance}%` }}></i></div>
              </div>
            </div>

            <div className="signal-outcome-card">
              <h3>Signal Outcome Tracker</h3>

              <div className="signal-outcome-list">
                {signalOutcomeHistory.length > 0 ? (
                  signalOutcomeHistory.map((item, index) => (
                    <div key={index}>
                      <span>{item.timestamp}</span>
                      <strong>{item.signal}</strong>
                      <em>{item.outcome}</em>
                    </div>
                  ))
                ) : (
                  <div>
                    <span>LATEST</span>
                    <strong>DETECTING</strong>
                    <em>TRACKING</em>
                  </div>
                )}
              </div>
            </div>

            <div className="confidence-calibration-card">
              <h3>Confidence Calibration</h3>

              <div className="performance-metrics-grid">
                <div>
                  <span>Predicted Confidence</span>
                  <strong>{predictedConfidence}%</strong>
                </div>

                <div>
                  <span>Actual Outcome</span>
                  <strong>{actualOutcome}%</strong>
                </div>

                <div>
                  <span>Deviation</span>
                  <strong>{confidenceDeviation}%</strong>
                </div>
              </div>
            </div>

            <div className="learning-engine-card">
              <h3>Learning Engine</h3>

              <div className="performance-metrics-grid">
                <div>
                  <span>Patterns Learned</span>
                  <strong>{patternsLearned}</strong>
                </div>

                <div>
                  <span>Confidence Adjustments</span>
                  <strong>{confidenceAdjustments}%</strong>
                </div>

                <div>
                  <span>Memory Reinforcements</span>
                  <strong>{memoryReinforcements}</strong>
                </div>

                <div>
                  <span>Risk Adjustments</span>
                  <strong>{riskAdjustments}</strong>
                </div>
              </div>
            </div>

            <div className="cognition-score-card">
              <h3>Cognition Score</h3>

              <div className="performance-metrics-grid">
                <div>
                  <span>Accuracy</span>
                  <strong>{predictionAccuracy}%</strong>
                </div>

                <div>
                  <span>Consistency</span>
                  <strong>{consistencyScore}%</strong>
                </div>

                <div>
                  <span>Forecast Quality</span>
                  <strong>{forecastQuality}%</strong>
                </div>

                <div>
                  <span>Signal Reliability</span>
                  <strong>{signalReliability}%</strong>
                </div>

                <div>
                  <span>Memory Stability</span>
                  <strong>{memoryStability}%</strong>
                </div>

                <div>
                  <span>Cognition State</span>
                  <strong>{cognitionScoreState}</strong>
                </div>
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
              data={displayedTacticalBrain}
              consensusContribution={consensusStrength}
              consensusInfluence={getConsensusInfluence(displayedTacticalBrain)}
            />
            <BehavioralBrainPanel
              data={displayedBehavioralBrain}
              consensusContribution={consensusStrength}
              consensusInfluence={getConsensusInfluence(displayedBehavioralBrain, -8)}
            />
            <FailsafeBrainPanel
              data={displayedFailsafeBrain}
              consensusContribution={consensusStrength}
              consensusInfluence={getConsensusInfluence(displayedFailsafeBrain, 6)}
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

        <footer className="aicc-beta-footer">
          <span>{AICC_BETA_VERSION}</span>
          <p>{AICC_BETA_DISCLAIMER}</p>
        </footer>
      </main>
    </div>
  );
}

export default CommandCenter;
