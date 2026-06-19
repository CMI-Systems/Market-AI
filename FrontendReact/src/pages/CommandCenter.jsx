import { Fragment, useEffect, useState } from "react";
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
import { analyzeAiccIntelligence } from "../services/intelligence/aiccIntelligenceOrchestrator";
import {
  getProviderDiagnostics,
  getOfflineProviderDiagnostics,
  getProviderSignals,
} from "../services/marketProviderApi";
import { displayState } from "../services/providerDisplay";
import MarketPriceChart from "../components/charts/MarketPriceChart";
import { CHART_TIMEFRAMES, getValidatedChartData } from "../services/chartDataService";
import { Link } from "react-router-dom";
import "../styles/CommandCenter.css";

import GlobalScanPanel from "../components/GlobalScanPanel";
import NewsLetterPanel from "../components/NewsLetterPanel";
import MarketPulsePanel from "../components/MarketPulsePanel";
import DataStreamsPanel from "../components/DataStreamsPanel";
import InstitutionalAccumlationPanel from "../components/InstitutionalAccumlationPanel";
import VolatilityCompressionPanel from "../components/VolatilityCompressionPanel";
import CrisisManagementPanel from "../components/CrisisManagementPanel";
import ExpansionPanel from "../components/ExpansionPanel";

const PROVIDER_SIGNAL_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"];
const OVERVIEW_TIMEFRAMES = CHART_TIMEFRAMES;
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
  const [selectedOverviewSymbol, setSelectedOverviewSymbol] = useState("SPY");
  const [selectedOverviewTimeframe, setSelectedOverviewTimeframe] = useState("5Min");
  const [overviewCandles, setOverviewCandles] = useState([]);
  const [overviewQuote, setOverviewQuote] = useState(null);
  const [selectedSecondarySymbol, setSelectedSecondarySymbol] = useState("QQQ");
  const [selectedSecondaryTimeframe, setSelectedSecondaryTimeframe] = useState("5Min");
  const [secondaryCandles, setSecondaryCandles] = useState([]);
  const [secondaryQuote, setSecondaryQuote] = useState(null);
  const [overviewChartState, setOverviewChartState] = useState({
    loading: true,
    error: "",
    validation: null,
    provenance: null,
  });
  const [secondaryChartState, setSecondaryChartState] = useState({
    loading: true,
    error: "",
    validation: null,
    provenance: null,
  });

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
    let mounted = true;

    async function loadMarketOverview() {
      setOverviewChartState((current) => ({ ...current, loading: true, error: "" }));
      setOverviewCandles([]);
      setOverviewQuote(null);
      const result = await getValidatedChartData(selectedOverviewSymbol, selectedOverviewTimeframe, {
        limit: 80,
      });

      if (!mounted) return;

      setOverviewCandles(result.candles || []);
      setOverviewQuote(result.quote || null);
      setOverviewChartState({
        loading: false,
        error: result.error || "",
        validation: result.validation || null,
        provenance: result.provenance || null,
      });
    }

    loadMarketOverview();

    const interval = setInterval(loadMarketOverview, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedOverviewSymbol, selectedOverviewTimeframe]);

  useEffect(() => {
    let mounted = true;

    async function loadSecondaryMarketOverview() {
      setSecondaryChartState((current) => ({ ...current, loading: true, error: "" }));
      setSecondaryCandles([]);
      setSecondaryQuote(null);
      const result = await getValidatedChartData(selectedSecondarySymbol, selectedSecondaryTimeframe, {
        limit: 80,
      });

      if (!mounted) return;

      setSecondaryCandles(result.candles || []);
      setSecondaryQuote(result.quote || null);
      setSecondaryChartState({
        loading: false,
        error: result.error || "",
        validation: result.validation || null,
        provenance: result.provenance || null,
      });
    }

    loadSecondaryMarketOverview();

    const interval = setInterval(loadSecondaryMarketOverview, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedSecondarySymbol, selectedSecondaryTimeframe]);

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
  const overviewAvailable =
    overview?.available !== false && overview?.sourceType !== "DATA_UNAVAILABLE";
  const providerDataAvailable =
    providerDiagnostics?.available !== false
    && providerDiagnostics?.sourceType !== "DATA_UNAVAILABLE"
    && providerDiagnostics.providerHealth !== "OFFLINE";
  const backendOnline =
    overviewAvailable
    && (
      Boolean(overview?.backend || overview?.runtimeHealth?.status)
      || providerDataAvailable
    );
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
    bias: brainStatus?.behavioralBrain?.bias || "DATA_UNAVAILABLE",
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
  const getOverviewChangePercent = (candles, quote) => {
    const latestCandle = candles[candles.length - 1] || null;
    const firstCandle = candles[0] || null;

    if (Number.isFinite(Number(quote?.changePercent))) return Number(quote.changePercent);
    if (
      firstCandle &&
      latestCandle &&
      Number.isFinite(Number(firstCandle.open)) &&
      Number(firstCandle.open) > 0 &&
      Number.isFinite(Number(latestCandle.close))
    ) {
      return ((Number(latestCandle.close) - Number(firstCandle.open)) / Number(firstCandle.open)) * 100;
    }

    return null;
  };
  const overviewChangePercent = getOverviewChangePercent(overviewCandles, overviewQuote);
  const rawMarketInputsAvailable =
    providerDataAvailable
    && overviewQuote?.available !== false
    && overviewQuote?.sourceType !== "DATA_UNAVAILABLE"
    && overviewCandles.length > 0;
  const aiccDataStreams = [
    {
      name: "provider",
      status: providerDiagnostics.providerHealth || "UNKNOWN",
      warnings: providerDiagnostics.warnings || [],
    },
    {
      name: "webull",
      status: providerDiagnostics.webull?.status || "UNKNOWN",
      warnings: providerDiagnostics.webull?.warnings || [],
    },
    {
      name: "alpaca",
      status: providerDiagnostics.alpaca?.status || "UNKNOWN",
      warnings: providerDiagnostics.alpaca?.warnings || [],
    },
    {
      name: "fallback",
      status: providerDiagnostics.fallback?.status || "UNKNOWN",
      warnings: providerDiagnostics.fallback?.warnings || [],
    },
  ];
  const aiccMarketPulse = {
    breadth: {
      percentPositive: providerSignals.length
        ? Math.round((highConfidenceProviderSignals.length / providerSignals.length) * 100)
        : Math.round(normalizedConfidenceScore * 100),
    },
    volumeRatio: overviewCandles.some((candle) => Number(candle.volume) > 0) ? 1 : 0.75,
    volatility: liquidityPressure?.volatility === "ELEVATED" ? 65 : 35,
    riskScore: threatLevelScore,
    trendScore: Number(overviewChangePercent) >= 0 ? 65 : 42,
    history: predictionEntries.map((entry) => ({
      regime: entry.environment,
      state: entry.consensusState,
    })),
  };
  const aiccMarketIntelligence = {
    dataQuality: providerHealthy ? 82 : 48,
    leadership: {
      growth: Number(overviewChangePercent) >= 0 ? 1.5 : 0.2,
      value: 0.6,
      defensive: providerRiskDominates ? 1.4 : 0.2,
      bond: providerRiskDominates ? 1 : -0.2,
    },
    rotation: {
      riskOn: highConfidenceProviderSignals.length ? 68 : 45,
      safety: providerRiskDominates ? 72 : 40,
    },
    institutionalFlow: institutionalFlow?.flowStrength === "HIGH" ? 75 : 55,
    dominantNarrative: dominantTheme,
    narrativeAdoption: memoryStrengthScore,
    drivers: signalReasons.slice(0, 3),
    risks: failsafeForecast === "ENGAGED"
      ? ["failsafe protection elevated", "provider risk context"]
      : ["provider reliability", "consensus stability"],
  };
  const aiccGlobalScan = {
    riskScore: threatLevelScore,
    trendScore: Number(overviewChangePercent) >= 0 ? 65 : 42,
    volatility: liquidityPressure?.volatility === "ELEVATED" ? 65 : 35,
    history: predictionEntries.map((entry) => ({
      regime: entry.environment,
      state: entry.consensusState,
    })),
  };
  const aiccNewsletterData = {
    dominantNarrative: dominantTheme,
    mentionCount: priorityTimelineEvents.length,
    symbolBreadth: aiccMarketPulse.breadth.percentPositive,
    provider: overviewChartState.provenance?.provider || providerDiagnostics.activeProvider || "UNKNOWN",
    sourceType: overviewChartState.provenance?.sourceType || overviewChartState.provenance?.dataState || "DATA_UNAVAILABLE",
    available: rawMarketInputsAvailable,
    simulated: false,
    generated: false,
    timestamp: overviewChartState.provenance?.timestamp || overviewQuote?.timestamp || null,
    dataAge: overviewChartState.provenance?.dataAge ?? overviewQuote?.dataAge,
    sessionState: overviewChartState.provenance?.sessionState || overviewQuote?.sessionState || "UNKNOWN_SESSION",
    marketOpen: overviewChartState.provenance?.marketOpen ?? overviewQuote?.marketOpen ?? false,
    rawDataCertified: false,
    trainingEligible: false,
  };
  const aiccIntelligence = analyzeAiccIntelligence({
    symbol: selectedOverviewSymbol,
    candles: rawMarketInputsAvailable ? overviewCandles : [],
    quote: rawMarketInputsAvailable ? overviewQuote : null,
    marketContext: rawMarketInputsAvailable ? activeEnvironment : null,
    benchmarkCandles: rawMarketInputsAvailable ? secondaryCandles : [],
    sectorContext: rawMarketInputsAvailable ? {
      performancePct: Number.isFinite(Number(overviewChangePercent)) ? Number(overviewChangePercent) : 0,
    } : null,
    marketPulse: rawMarketInputsAvailable ? aiccMarketPulse : null,
    marketIntelligence: rawMarketInputsAvailable ? aiccMarketIntelligence : null,
    globalScan: rawMarketInputsAvailable ? aiccGlobalScan : null,
    newsletterData: rawMarketInputsAvailable ? aiccNewsletterData : null,
    crossAssetData: rawMarketInputsAvailable ? {
      assetReturns: aiccMarketIntelligence.leadership,
    } : null,
    dataStreams: aiccDataStreams,
    history: predictionEntries.map((entry) => ({
      state: entry.consensusState || entry.environment,
      regime: entry.environment,
    })),
  });
  const aiccSummary = aiccIntelligence.summary || {};
  const aiccNarrative = aiccIntelligence.narrative || {};
  const aiccTactical = aiccIntelligence.tactical || {};
  const aiccBehavioral = aiccIntelligence.behavioral || {};
  const aiccFailsafe = aiccIntelligence.failsafe || {};
  const aiccNarrativeHeadline = aiccSummary.narrativeHeadline || "AICC Intelligence Limited";
  const aiccShortNarrative =
    aiccNarrative.shortNarrative ||
    aiccNarrative.spotlightNarrative ||
    "AICC Intelligence Limited";
  const aiccKeyDrivers = Array.isArray(aiccNarrative.keyDrivers)
    ? aiccNarrative.keyDrivers.slice(0, 4)
    : ["Limited validated driver context"];
  const aiccKeyRisks = Array.isArray(aiccNarrative.keyRisks)
    ? aiccNarrative.keyRisks.slice(0, 4)
    : ["Limited validated risk context"];
  const aiccPrimaryDriver = aiccKeyDrivers[0] || "Limited validated driver context";
  const aiccPrimaryRisk = aiccKeyRisks[0] || "Limited validated risk context";
  const aiccOpportunityContext = aiccNarrative.engines?.opportunityContext || {};
  const aiccThemesGainingTraction = Array.isArray(aiccOpportunityContext.themesToMonitor)
    ? aiccOpportunityContext.themesToMonitor.slice(0, 4)
    : ["consensus stability"];
  const aiccAreasOfStrength = Array.isArray(aiccOpportunityContext.areasOfStrength)
    ? aiccOpportunityContext.areasOfStrength.slice(0, 4)
    : ["no validated area of strength yet"];
  const aiccAreasToMonitor = [
    ...aiccThemesGainingTraction,
    aiccPrimaryRisk,
  ].filter(Boolean).slice(0, 4);
  const aiccConsensusState = aiccSummary.consensusState || "ELEVATED_UNCERTAINTY";
  const aiccRegimeState = aiccSummary.regime || "TRANSITION";
  const aiccVerdict = aiccConsensusState;
  const aiccConfidenceValue = Math.max(0, Math.min(100, Number(aiccSummary.overallConfidence ?? 45)));
  const aiccReliabilityValue = Math.max(0, Math.min(100, Number(aiccFailsafe.reliability ?? 45)));
  const aiccBiasSource = `${aiccConsensusState} ${aiccRegimeState} ${aiccTactical.tacticalState || ""}`;
  const aiccMarketBias = /BEARISH|DEFENSIVE|HIGH_RISK|CRISIS|DISTRIBUTION|BREAKDOWN/i.test(aiccBiasSource)
    ? "Bearish"
    : /BULLISH|RISK_ON|EXPANSION|RECOVERY|BREAKOUT/i.test(aiccBiasSource)
      ? "Bullish"
      : "Neutral";
  const aiccRiskSource = `${aiccConsensusState} ${aiccRegimeState} ${aiccFailsafe.failsafeState || ""} ${aiccFailsafe.riskEscalation || ""}`;
  const aiccRiskEnvironment = /RISK_OFF|HIGH_RISK|CRITICAL|CRISIS|LOW_RELIABILITY|ESCALATION/i.test(aiccRiskSource)
    ? "Risk-Off"
    : /RISK_ON|EXPANSION|CONFIRMED|CONTROLLED/i.test(aiccRiskSource)
      ? "Risk-On"
      : "Neutral";
  const aiccLayerFlow = [
    { label: "TACTICAL", status: aiccTactical.tacticalState || aiccTactical.sourceType || "DATA_UNAVAILABLE" },
    { label: "BEHAVIORAL", status: aiccBehavioral.behavioralState || aiccBehavioral.sourceType || "DATA_UNAVAILABLE" },
    { label: "FAILSAFE", status: aiccFailsafe.failsafeState || aiccFailsafe.sourceType || "DATA_UNAVAILABLE" },
    { label: "CONSENSUS", status: aiccConsensusState },
    { label: "REGIME", status: aiccRegimeState },
    { label: "NARRATIVE", status: aiccNarrativeHeadline === "AICC Intelligence Limited" ? "LIMITED" : aiccNarrative.confidenceLabel || "LIMITED" },
  ];
  const aiccMarketStatusLine = `${aiccConsensusState} consensus is operating inside a ${aiccRegimeState} regime. ${aiccShortNarrative}`;
  const watchlistPreviewRows = PROVIDER_SIGNAL_SYMBOLS.map((symbol) => {
    const signal = providerSignals.find((item) => item.symbol === symbol);

    return {
      symbol,
      signal: signal?.signal || "NEUTRAL",
      confidence: signal?.confidence ?? 50,
      risk: signal?.risk || "MODERATE",
      provider: signal?.provider || providerDiagnostics.activeProvider || "ALPACA",
    };
  });
  const compactAlerts = [
    ...topProviderSignals.slice(0, 3).map((signal) => ({
      title: `${signal.symbol} ${signal.signal}`,
      detail: `${signal.confidence}% confidence | ${signal.risk}`,
    })),
    ...priorityTimelineEvents.slice(0, 2).map((event) => ({
      title: event.label,
      detail: event.time,
    })),
  ].slice(0, 4);
  const infrastructureChips = [
    { label: "Backend", value: backendOnline ? "ONLINE" : "OFFLINE" },
    { label: "Provider", value: providerHealthy ? "HEALTHY" : "DEGRADED" },
    { label: "Failover", value: providerDiagnostics.failoverReady ? "READY" : "PENDING" },
  ];
  const marketSessionLabel =
    providerDiagnostics.sessionState
    || providerDiagnostics.dataState
    || overview?.sessionState
    || (overview?.marketOpen === true ? "REGULAR_MARKET" : overview?.marketOpen === false ? "MARKET_CLOSED" : "UNKNOWN_SESSION");

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
          <Link to="/newsletter" className="nav-button">Operator Briefing</Link>
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
        <header className="command-header command-hero">
          <div className="header-title command-hero-title">
            <h1>COMMAND CENTER</h1>
            <p>Market AI Intelligence Ecosystem</p>
            <span className="beta-version-label">{AICC_BETA_VERSION}</span>

            <div className="command-hero-meta">
              <span>{formattedDate} | {formattedTime}</span>
              <span>Market: {displayState(marketSessionLabel)}</span>
              <span>Provider: {providerDiagnostics.activeProvider || "ALPACA"}</span>
              <span>Backend: {backendOnline ? "ONLINE" : "OFFLINE"}</span>
              <span>Failover: {providerDiagnostics.failoverReady ? "READY" : "PENDING"}</span>
            </div>
          </div>

          <div className="command-hero-kpis">
            <div className="summary-card hero-kpi-card">
              <span>Market Regime</span>
              <strong>{translateDashboardStatus(environmentDisplay, betaEnvironmentState)}</strong>
              <p>LIVE MARKET</p>
            </div>

            <div className="summary-card hero-kpi-card">
              <span>Volatility State</span>
              <strong>{translateDashboardStatus(stabilityDisplay, betaStabilityState)}</strong>
              <p>STABILITY</p>
            </div>

            <div className="summary-card hero-kpi-card">
              <span>Confidence Environment</span>
              <strong>{translateDashboardStatus(confidenceLevelDisplay, betaConfidenceState)}</strong>
              <p>{finalConfidenceScore}% INDEX</p>
            </div>

            <div className="summary-card hero-kpi-card">
              <span>Signal Quality</span>
              <strong>{consensusStrength === "STRONG" ? "HIGH CONVICTION" : translateDashboardStatus(activeConsensus, "HIGH CONVICTION")}</strong>
              <p>{topProviderSignals.length} ACTIVE</p>
            </div>

            <div className="summary-card hero-kpi-card">
              <span>Risk Level</span>
              <strong>{executiveRisk || "MODERATE"}</strong>
              <p>FAILSAFE</p>
            </div>
          </div>
        </header>

        <div className="command-live-strip">
          <span><i className="live-dot"></i> Global Scan Active</span>
          <span><i className="live-dot"></i> Tactical Brain Analyzing</span>
          <span><i className="live-dot"></i> Market Pulse Updating</span>
          <span><i className="live-dot"></i> Operator Briefing Internal</span>
          <span><i className="live-dot"></i> Failsafe Monitoring</span>
        </div>

        <section className="command-section executive-intelligence-section verdict-banner-section market-status-section">
          <div className="verdict-banner-header">
            <span className="mission-eyebrow">Market Status</span>
            <h2>{aiccVerdict}</h2>
            <p>{aiccMarketStatusLine}</p>
          </div>

          <div className="verdict-banner-grid">
            <div className="verdict-metric-card verdict-metric-primary">
              <span>Verdict</span>
              <strong>{aiccVerdict}</strong>
            </div>

            <div className="verdict-metric-card">
              <span>Reliability</span>
              <strong>{aiccReliabilityValue}%</strong>
            </div>

            <div className="verdict-metric-card">
              <span>Market Bias</span>
              <strong>{aiccMarketBias}</strong>
            </div>

            <div className="verdict-metric-card">
              <span>Risk State</span>
              <strong>{aiccRiskEnvironment}</strong>
            </div>
          </div>

          <div className="market-status-answer-grid">
            <div className="market-status-answer-card">
              <span>What Is Happening</span>
              <strong>{aiccVerdict}</strong>
              <p>{aiccMarketBias} bias inside a {aiccRegimeState} regime.</p>
            </div>

            <div className="market-status-answer-card">
              <span>Why</span>
              <strong>{aiccPrimaryDriver}</strong>
            </div>

            <div className="market-status-answer-card">
              <span>What To Monitor</span>
              {aiccAreasToMonitor.slice(0, 3).map((area, index) => (
                <p key={`status-monitor-${index}`}>{area}</p>
              ))}
            </div>
          </div>

          <div className="verdict-meter-grid">
            <div className="verdict-meter-card">
              <div>
                <span>Confidence Meter</span>
                <strong>{aiccConfidenceValue}%</strong>
              </div>
              <div className="verdict-meter-track">
                <i style={{ width: `${aiccConfidenceValue}%` }}></i>
              </div>
            </div>

            <div className="verdict-meter-card">
              <div>
                <span>Reliability Meter</span>
                <strong>{aiccReliabilityValue}%</strong>
              </div>
              <div className="verdict-meter-track reliability-meter-track">
                <i style={{ width: `${aiccReliabilityValue}%` }}></i>
              </div>
            </div>
          </div>
        </section>

        <section className="command-section executive-intelligence-section mission-briefing-section">
          <div className="mission-briefing-header">
            <div>
              <span className="mission-eyebrow">AICC Mission Briefing</span>
              <h2>AICC Market Assessment</h2>
              <p className="executive-subtitle">
                Stack context and operator briefing.
              </p>
            </div>
          </div>

          <div className="mission-briefing-grid">
            <div className="mission-metric-card mission-metric-card-primary">
              <span>Consensus</span>
              <strong>{aiccConsensusState}</strong>
            </div>

            <div className="mission-metric-card">
              <span>Regime</span>
              <strong>{aiccRegimeState}</strong>
            </div>

            <div className="mission-metric-card">
              <span>Tactical</span>
              <strong>{aiccTactical.tacticalState || "NEUTRAL_TRANSITION"}</strong>
            </div>

            <div className="mission-metric-card">
              <span>Behavioral</span>
              <strong>{aiccBehavioral.behavioralState || "TRANSITIONING_BEHAVIOR"}</strong>
            </div>
          </div>

          <div className="mission-briefing-body mission-briefing-body-focused">
            <div className="operator-briefing-card">
              <h3>Operator Briefing</h3>
              <p>{aiccNarrative.detailedNarrative || aiccShortNarrative}</p>
              <p>{aiccNarrative.riskNarrative || "AICC Intelligence Limited"}</p>
            </div>
          </div>
        </section>

        <section className="intelligence-flow-panel" aria-label="AICC intelligence flow">
          {aiccLayerFlow.map((layer, index, stack) => (
            <Fragment key={layer.label}>
              <div className="intelligence-flow-node">
                <span>{layer.label}</span>
                <strong>{displayState(layer.status)}</strong>
              </div>
              {index < stack.length - 1 && <b aria-hidden="true">&darr;</b>}
            </Fragment>
          ))}
        </section>

        <section className="command-section executive-intelligence-section spotlight-hero-section current-market-story-section">
          <div className="spotlight-hero-header">
            <span className="mission-eyebrow">Current Market Story</span>
            <h2>{aiccNarrativeHeadline}</h2>
          </div>

          <div className="market-story-grid">
            <div className="market-story-narrative-card">
              <span>Headline</span>
              <strong>{aiccNarrativeHeadline}</strong>
            </div>

            <div className="market-story-narrative-card">
              <span>Why It Matters</span>
              <p>{aiccNarrative.spotlightNarrative || aiccShortNarrative}</p>
            </div>

            <div className="spotlight-theme-card">
              <span>Primary Driver</span>
              <p>{aiccPrimaryDriver}</p>
            </div>

            <div className="spotlight-theme-card primary-risk-card">
              <span>Primary Risk</span>
              <p>{aiccPrimaryRisk}</p>
            </div>

            <div>
              <h3>What To Monitor</h3>
              {aiccAreasToMonitor.map((area, index) => (
                <p key={`story-monitor-${index}`}>{area}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="command-section overview-brain-section">
          <h2>AICC Intelligence Panel</h2>
          <div className="overview-brain-grid compressed-brain-grid">
            <div className="overview-brain-card compressed-brain-card">
              <div className="subsystem-card-header">
                <h3>Tactical Brain</h3>
                <span>{displayState(aiccTactical.tacticalState || aiccTactical.sourceType || "DATA_UNAVAILABLE")}</span>
              </div>
              <div className="compressed-brain-state">
                <span>State</span>
                <strong>{aiccTactical.tacticalState || "NEUTRAL_TRANSITION"}</strong>
              </div>
              <details className="brain-card-details">
                <summary>Secondary Metrics</summary>
                <div className="overview-status-list">
                  <div><span>Confidence</span><strong>{aiccTactical.confidence ?? 45}%</strong></div>
                  <div><span>Key Metrics</span><strong>{aiccTactical.trend || "NEUTRAL"} / {aiccTactical.momentum || "SLOWING"} / {aiccTactical.structure || "RANGE"}</strong></div>
                </div>
              </details>
            </div>

            <div className="overview-brain-card compressed-brain-card">
              <div className="subsystem-card-header">
                <h3>Behavioral Brain</h3>
                <span>{displayState(aiccBehavioral.behavioralState || aiccBehavioral.sourceType || "DATA_UNAVAILABLE")}</span>
              </div>
              <div className="compressed-brain-state">
                <span>State</span>
                <strong>{aiccBehavioral.behavioralState || "TRANSITIONING_BEHAVIOR"}</strong>
              </div>
              <details className="brain-card-details">
                <summary>Secondary Metrics</summary>
                <div className="overview-status-list">
                  <div><span>Confidence</span><strong>{aiccBehavioral.confidence ?? 45}%</strong></div>
                  <div><span>Key Metrics</span><strong>{aiccBehavioral.participation || "WEAK_PARTICIPATION"} / {aiccBehavioral.leadership || "NO_CLEAR_LEADERSHIP"}</strong></div>
                </div>
              </details>
            </div>

            <div className="overview-brain-card compressed-brain-card">
              <div className="subsystem-card-header">
                <h3>Failsafe Brain</h3>
                <span>{displayState(aiccFailsafe.failsafeState || aiccFailsafe.sourceType || "DATA_UNAVAILABLE")}</span>
              </div>
              <div className="compressed-brain-state">
                <span>State</span>
                <strong>{aiccFailsafe.failsafeState || "ELEVATED_UNCERTAINTY"}</strong>
              </div>
              <details className="brain-card-details">
                <summary>Secondary Metrics</summary>
                <div className="overview-status-list">
                  <div><span>Reliability</span><strong>{aiccReliabilityValue}%</strong></div>
                  <div><span>Key Metrics</span><strong>{aiccFailsafe.riskEscalation || "ELEVATED"} / {aiccFailsafe.validation || "WEAK_VALIDATION"}</strong></div>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="command-section command-overview-section">
          <h2>Charts</h2>
          <div className="command-chart-grid">
            <MarketPriceChart
              title="Primary Market Chart"
              symbol={selectedOverviewSymbol}
              timeframe={selectedOverviewTimeframe}
              candles={overviewCandles}
              quote={overviewQuote}
              validation={overviewChartState.validation}
              provenance={overviewChartState.provenance}
              loading={overviewChartState.loading}
              error={overviewChartState.error}
              availableSymbols={PROVIDER_SIGNAL_SYMBOLS}
              availableTimeframes={OVERVIEW_TIMEFRAMES}
              onSymbolChange={setSelectedOverviewSymbol}
              onTimeframeChange={setSelectedOverviewTimeframe}
              height={430}
            />

            <MarketPriceChart
              title="Secondary Market Chart"
              symbol={selectedSecondarySymbol}
              timeframe={selectedSecondaryTimeframe}
              candles={secondaryCandles}
              quote={secondaryQuote}
              validation={secondaryChartState.validation}
              provenance={secondaryChartState.provenance}
              loading={secondaryChartState.loading}
              error={secondaryChartState.error}
              availableSymbols={PROVIDER_SIGNAL_SYMBOLS}
              availableTimeframes={OVERVIEW_TIMEFRAMES}
              onSymbolChange={setSelectedSecondarySymbol}
              onTimeframeChange={setSelectedSecondaryTimeframe}
              height={430}
            />
          </div>
        </section>

        <section className="command-section overview-feed-section">
          <h2>Market Intelligence</h2>
          <div className="command-under-chart-grid">
            <div className="overview-side-card">
              <h3>Live Watchlist</h3>
              <div className="overview-watchlist">
                {watchlistPreviewRows.map((row) => (
                  <div key={row.symbol}>
                    <strong>{row.symbol}</strong>
                    <span>{row.signal}</span>
                    <em>{row.confidence}%</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-side-card">
              <h3>Alerts & Intelligence</h3>
              <div className="overview-alert-list">
                {compactAlerts.length ? (
                  compactAlerts.map((alert, index) => (
                    <div key={`${alert.title}-${index}`}>
                      <strong>{alert.title}</strong>
                      <span>{alert.detail}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <strong>NO ACTIVE ALERTS</strong>
                    <span>Provider signals stable</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overview-feed-grid">
            <div className="overview-feed-card">
              <h2>Scanner Results</h2>
              <div className="overview-signal-grid">
                {(topProviderSignals.length ? topProviderSignals : watchlistPreviewRows).slice(0, 6).map((signal) => (
                  <div className="overview-signal-card" key={`${signal.symbol}-${signal.signal}`}>
                    <span>{signal.symbol}</span>
                    <strong>{signal.signal}</strong>
                    <p>{signal.confidence ?? 50}% | {signal.risk || "MODERATE"} | {signal.provider || providerDiagnostics.activeProvider || "ALPACA"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-feed-card">
              <h2>Market Intelligence Modules</h2>
              <div className="overview-timeline-list">
                {narrativeTimeline.slice(0, 5).map((event, index) => (
                  <div key={`${event.label}-${index}`}>
                    <span>{event.time}</span>
                    <strong>{event.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="command-grid">
            <ExpansionPanel data={strategicEnvironment} />
            <CrisisManagementPanel data={strategicEnvironment} />
            <VolatilityCompressionPanel data={liquidityPressure} />
            <InstitutionalAccumlationPanel data={institutionalFlow} />
          </div>
        </section>

        <details className="command-section">
          <summary>INTELLIGENCE SOURCES</summary>
          <div className="command-grid">
            <GlobalScanPanel />
            <MarketPulsePanel
              confidence={confidence}
              liquidityPressure={liquidityPressure}
              institutionalFlow={institutionalFlow}
            />
            <NewsLetterPanel />
            <DataStreamsPanel />
          </div>
        </details>

        <section className="command-section compact-infrastructure-section">
          <div className="compact-infra-chip-row">
            {infrastructureChips.map((chip) => (
              <div className="compact-infra-chip" key={chip.label}>
                <span>{chip.label}</span>
                <strong>{chip.value}</strong>
              </div>
            ))}
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

        <footer className="aicc-beta-footer">
          <span>{AICC_BETA_VERSION}</span>
          <p>{AICC_BETA_DISCLAIMER}</p>
        </footer>
      </main>
    </div>
  );
}

export default CommandCenter;
