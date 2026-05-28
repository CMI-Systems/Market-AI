const API_BASE_URL = "http://localhost:3001";
const REFRESH_INTERVAL_MS = 5000;
const AWAITING_COGNITION = "Awaiting backend cognition";

const fallbackState = {
  symbol: "NVDA",
  provider: "Backend unavailable",
  streamLabel: "Inactive",
  streamDetails: "Backend stream status unavailable.",
  runtimeHealth: "Disconnected",
  marketSession: "Unknown",
  metrics: {
    eventsReceived: 0,
    accepted: 0,
    rejected: 0,
    failsafeActivations: 0,
    shadowObserved: 0,
    shadowLogged: 0,
    uptime: "Disconnected"
  }
};

const elements = {};
let previousEventsReceived = 0;
let previousTimelineSignature = "";
let copilotMode = "compact";
let retentionMode = "compact";
const expandedReasoningChains = new Set();
let selectedRegionName = "";
const previousRenderedValues = {};

// Keep DOM lookups in one place so render functions stay simple.
function cacheElements() {
  [
    "systemStatusBadge",
    "backendCard",
    "streamCard",
    "runtimeCard",
    "strategicPanel",
    "confidencePanel",
    "behavioralPanel",
    "replayPanel",
    "runtimePanel",
    "watchlistPanel",
    "watchlistPriority",
    "watchlistSummary",
    "watchlistSymbols",
    "watchlistGroups",
    "watchlistWarnings",
    "watchlistObservations",
    "ecosystemPanel",
    "ecosystemState",
    "ecosystemSummary",
    "ecosystemCorrelation",
    "ecosystemSynchronized",
    "ecosystemDivergent",
    "ecosystemPressureClusters",
    "ecosystemGroups",
    "ecosystemWarnings",
    "environmentMapPanel",
    "environmentMapState",
    "environmentMapSummary",
    "environmentHeatmap",
    "environmentPressureMap",
    "environmentSynchronizationZones",
    "environmentFragmentationZones",
    "environmentTransitionSignals",
    "environmentMapWarnings",
    "ecosystemPriorityPanel",
    "ecosystemPriorityLevel",
    "ecosystemPrioritySummary",
    "ecosystemPropagationState",
    "ecosystemPriorityList",
    "ecosystemOriginRegions",
    "ecosystemReceivingRegions",
    "ecosystemPropagationPaths",
    "ecosystemPriorityDrivers",
    "ecosystemSuppressed",
    "ecosystemPriorityWarnings",
    "sectorHeatmapPanel",
    "sectorHeatmapState",
    "sectorHeatmapSummary",
    "sectorHeatmapGrid",
    "sectorHeatmapWarnings",
    "cognitiveDriftPanel",
    "cognitiveDriftState",
    "cognitiveDriftSummary",
    "cognitiveDriftSeverity",
    "cognitiveDriftAffected",
    "cognitiveDriftSignals",
    "cognitiveDriftWarnings",
    "environmentForecastPanel",
    "environmentForecastState",
    "environmentForecastSummary",
    "forecastTrajectoryMeter",
    "forecastConfidenceTrajectory",
    "ecosystemForecasts",
    "environmentForecastWarnings",
    "marketStructurePanel",
    "marketStructureState",
    "marketStructureSummary",
    "marketStructureStrip",
    "marketStructureQuality",
    "marketStructureEcosystems",
    "marketStructureSymbols",
    "marketStructureWarnings",
    "regimeTransitionPanel",
    "regimeState",
    "regimeTransitionSummary",
    "regimeTransitionState",
    "regimeTransitionRisk",
    "regimeAffectedEcosystems",
    "regimeTransitionWarnings",
    "institutionalFlowPanel",
    "institutionalFlowState",
    "institutionalFlowSummary",
    "institutionalFlowStrip",
    "institutionalFlowStrength",
    "institutionalSynchronized",
    "institutionalDiverging",
    "institutionalFlowClusters",
    "institutionalFlowWarnings",
    "liquidityPressurePanel",
    "liquidityState",
    "liquidityPressureSummary",
    "liquidityPressureBar",
    "liquidityPressureState",
    "liquidityVulnerability",
    "liquidityAffected",
    "liquidityPressureZones",
    "liquidityPressureWarnings",
    "adaptiveSignalPanel",
    "adaptiveSignalState",
    "adaptiveSignalSummary",
    "adaptiveConfidenceWeight",
    "adaptiveSignalTrust",
    "adaptiveSuppression",
    "adaptiveReinforcement",
    "adaptiveCoherence",
    "adaptiveWeightLabel",
    "adaptiveSignalWarnings",
    "brainConsensusPanel",
    "brainConsensusState",
    "brainConsensusSummary",
    "brainAgreementStrength",
    "brainDivergenceRisk",
    "participatingBrains",
    "brainConsensusWarnings",
    "temporalMemoryPanel",
    "temporalMemoryState",
    "temporalMemorySummary",
    "memoryDepthBar",
    "memoryDepthLabel",
    "temporalPatternCount",
    "temporalRecurringPatterns",
    "temporalLongHorizon",
    "temporalMemoryWarnings",
    "recurrencePanel",
    "recurrenceState",
    "recurrenceSummary",
    "recurrenceStrength",
    "recurrenceAffected",
    "recurrenceThemes",
    "recurrenceWarnings",
    "contextAgingPanel",
    "contextAgeState",
    "contextAgingSummary",
    "contextFreshnessBar",
    "contextFreshnessScore",
    "staleContexts",
    "contextAgingWarnings",
    "temporalSequencePanel",
    "temporalSequenceState",
    "temporalSequenceSummary",
    "progressionMomentumBar",
    "progressionMomentum",
    "sequenceConfidence",
    "activeSequences",
    "transitionChains",
    "temporalSequenceWarnings",
    "environmentCausalityPanel",
    "causalityState",
    "causalitySummary",
    "causalityConfidence",
    "affectedRegions",
    "dominantDrivers",
    "influenceChains",
    "causalityWarnings",
    "adaptiveThresholdPanel",
    "thresholdState",
    "thresholdSummary",
    "adjustedThresholds",
    "thresholdReasons",
    "thresholdWarnings",
    "reinforcementPanel",
    "reinforcementState",
    "reinforcementSummary",
    "learningWeightBar",
    "learningWeightLabel",
    "reinforcedFactors",
    "weakenedFactors",
    "reinforcementWarnings",
    "calibrationPanel",
    "calibrationState",
    "calibrationSummary",
    "confidenceCalibration",
    "suppressionCalibration",
    "consensusCalibration",
    "calibrationWarnings",
    "learningGuardrailsPanel",
    "guardrailState",
    "guardrailSummary",
    "learningAllowed",
    "blockedReasons",
    "guardrailWarnings",
    "aiCopilotSection",
    "copilotCompactMode",
    "copilotAnalystMode",
    "copilotExpandedMode",
    "copilotNarrationPanel",
    "copilotNarrationState",
    "copilotCognitionSummary",
    "copilotEnvironmentSummary",
    "copilotConsensusSummary",
    "copilotRiskSummary",
    "copilotReplaySummary",
    "copilotWarnings",
    "explainabilityPanel",
    "explainabilityState",
    "explainabilitySummary",
    "dominantFactorsPanel",
    "reasoningChains",
    "suppressionReasons",
    "reinforcementReasons",
    "explainabilityWarnings",
    "priorityFeedPanel",
    "priorityFeedState",
    "priorityFeedSummary",
    "priorityFeedEvents",
    "priorityFeedWarnings",
    "operatorInteractionSection",
    "operatorStateBadge",
    "reasoningChainsPanel",
    "reasoningChainState",
    "reasoningChainSummary",
    "expandableReasoningChains",
    "reasoningChainWarnings",
    "replayTimelinePanel",
    "replayTimelineState",
    "replayTimelineSummary",
    "replayTimelineCards",
    "replayRecurrenceSignals",
    "replayTimelineWarnings",
    "interactiveRegionsPanel",
    "interactiveRegionState",
    "interactiveRegionSummary",
    "regionCards",
    "selectedRegionDetail",
    "regionDriftSignals",
    "interactiveRegionWarnings",
    "persistentMemorySection",
    "retentionCompactMode",
    "retentionBalancedMode",
    "retentionExtendedMode",
    "persistentMemoryPanel",
    "persistentMemoryState",
    "persistentMemorySummary",
    "memoryRetentionStatus",
    "memoryCompressionState",
    "memoryEntries",
    "persistentMemoryWarnings",
    "environmentArchivePanel",
    "environmentArchiveState",
    "environmentArchiveSummary",
    "environmentHistoryTimeline",
    "environmentDominantTransitions",
    "environmentRecurrenceClusters",
    "historicalRecurrencePanel",
    "historicalRecurrenceState",
    "historicalRecurrenceSummary",
    "historicalRecurrenceConfidence",
    "historicalRecurrencePatterns",
    "driftEvolutionPanel",
    "driftEvolutionState",
    "driftEvolutionSummary",
    "driftMetrics",
    "stabilizationSignals",
    "replayArchivePanel",
    "replayArchiveState",
    "replayArchiveSummary",
    "replayArchiveTimeline",
    "replayArchiveIndex",
    "productionReadinessPanel",
    "productionHealthState",
    "productionReadinessSummary",
    "productionRuntimeMode",
    "productionMemoryUsage",
    "productionPersistenceStatus",
    "productionArchiveStatus",
    "productionApiVersion",
    "productionDeploymentReadiness",
    "productionWarnings",
    "userIntelligenceSection",
    "userSessionState",
    "userViewMode",
    "cognitionDensity",
    "replayDepth",
    "ecosystemPriority",
    "preferredSymbolFocus",
    "userProfilePanel",
    "userProfileState",
    "userProfileSummary",
    "userProfileDetails",
    "watchlistProfilePanel",
    "userWatchlistState",
    "userWatchlistSummary",
    "userWatchlistSymbols",
    "userEcosystemBias",
    "cognitionPreferencesPanel",
    "cognitionPreferenceState",
    "cognitionPreferenceSummary",
    "cognitionPreferenceDetails",
    "operatorMemoryPanel",
    "operatorMemoryState",
    "operatorMemorySummary",
    "operatorDominantInteractions",
    "platformAccessSection",
    "platformTierState",
    "activePlanSummary",
    "tierPermissions",
    "entitlementSummary",
    "grantedPermissions",
    "restrictedPermissions",
    "featureGateSummary",
    "accessibleFeatures",
    "lockedFeatures",
    "platformUsageSummary",
    "platformUsageMetrics",
    "platformCapabilityMatrix",
    "distributedCognitionSection",
    "distributedCoordinatorState",
    "distributedCoordinatorSummary",
    "cognitionNodeList",
    "websocketSummary",
    "websocketChannels",
    "replaySyncSummary",
    "replaySyncConflicts",
    "scalingSummary",
    "scalingPressureBar",
    "scalingMetrics",
    "cloudTopologyCards",
    "escalationOverlay",
    "escalationBanner",
    "escalationRing",
    "anomalyOverlay",
    "anomalyState",
    "anomalySeverity",
    "anomalyTypes",
    "anomalyWarnings",
    "anomalySummary",
    "backendStatus",
    "backendMeter",
    "streamStatus",
    "streamDetails",
    "streamMeter",
    "runtimeHealth",
    "runtimeHealthMeter",
    "activeProvider",
    "currentSymbol",
    "marketSession",
    "pulseBackend",
    "pulseBackendState",
    "pulseStream",
    "pulseStreamState",
    "pulseRuntime",
    "pulseRuntimeState",
    "pulseBrains",
    "pulseBrainsState",
    "pulseShadow",
    "pulseShadowState",
    "pulseReplay",
    "pulseReplayState",
    "brainEndpointBadge",
    "strategicEndpointBadge",
    "confidenceEndpointBadge",
    "behavioralEndpointBadge",
    "replayEndpointBadge",
    "tacticalBrainCard",
    "behavioralBrainCard",
    "failsafeBrainCard",
    "tacticalBrain",
    "behavioralBrain",
    "failsafeBrain",
    "tacticalBrainReason",
    "behavioralBrainReason",
    "failsafeBrainReason",
    "tacticalBrainMeta",
    "behavioralBrainMeta",
    "failsafeBrainMeta",
    "tacticalBrainPulse",
    "behavioralBrainPulse",
    "failsafeBrainPulse",
    "brainSyncLabel",
    "brainSyncConnector",
    "environment",
    "environmentSummary",
    "stability",
    "warnings",
    "escalationLevel",
    "confidenceScore",
    "confidenceLevel",
    "consensusStrength",
    "stabilityForecast",
    "behavioralState",
    "reflectionPrompt",
    "riskLevel",
    "journalDraft",
    "timelinePreview",
    "roadmapStrategic",
    "roadmapBrain",
    "roadmapConfidence",
    "roadmapReplay",
    "roadmapBehavioral",
    "roadmapEscalation",
    "eventsReceived",
    "acceptedRejected",
    "failsafeActivations",
    "shadowObservedLogged",
    "uptime",
    "runtimeStateBadge",
    "throughputLabel",
    "runtimeHealthBarLabel",
    "runtimeHealthWideMeter",
    "streamActivityBarLabel",
    "streamActivityMeter",
    "shadowBarLabel",
    "shadowMeter",
    "confidenceMeter",
    "confidenceBarLabel"
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

// Read-only frontend calls. Backend cognition remains the source of truth.
async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return response.json();
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function asText(value, fallback = "Unknown") {
  const safeValue = firstDefined(value, fallback);

  if (safeValue && typeof safeValue === "object") {
    return String(firstDefined(
      safeValue.label,
      safeValue.status,
      safeValue.state,
      safeValue.source,
      safeValue.symbol,
      fallback
    ));
  }

  return String(safeValue);
}

function asReadableList(value, fallback = AWAITING_COGNITION) {
  if (Array.isArray(value) && value.length) {
    return value.map((item) => asText(item, fallback)).join(", ");
  }

  return asText(value, fallback);
}

function isAwaiting(value) {
  return asText(value, "").toLowerCase().includes("awaiting backend cognition");
}

function hasUsableValue(value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.values(value).some(hasUsableValue);
  }

  return !isAwaiting(value);
}

function escapeHtml(value) {
  return asText(value, AWAITING_COGNITION)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toLocaleString() : "0";
}

function padSeconds(value) {
  return String(value).padStart(2, "0");
}

function formatUptimeFromMilliseconds(value) {
  const milliseconds = Number(value);

  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return null;
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${padSeconds(seconds)}s`;
  }

  return `${minutes}m ${padSeconds(seconds)}s`;
}

function formatUptime(value, uptimeMs) {
  const formattedMs = formatUptimeFromMilliseconds(uptimeMs);
  if (formattedMs) {
    return formattedMs;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "Disconnected";
  }

  return formatUptimeFromMilliseconds(seconds * 1000) || "Disconnected";
}

function setStatus(element, label, statusClass) {
  element.textContent = asText(label);
  element.classList.remove("status-good", "status-warn", "status-bad");
  element.classList.add(statusClass);
}

function setTextTracked(key, element, value, highlightElement = element) {
  const nextValue = asText(value, AWAITING_COGNITION);

  element.textContent = nextValue;

  if (previousRenderedValues[key] !== undefined && previousRenderedValues[key] !== nextValue) {
    highlightElement.classList.remove("soft-updated");
    const scheduleFrame = window.requestAnimationFrame ||
      window.setTimeout ||
      ((callback) => callback());
    scheduleFrame(() => {
      highlightElement.classList.add("soft-updated");
    });
  }

  previousRenderedValues[key] = nextValue;
}

function clearToneClasses(element) {
  if (!element) {
    return;
  }

  element.classList.remove(
    "tone-green",
    "tone-teal",
    "tone-gold",
    "tone-orange",
    "tone-red",
    "tone-gray",
    "tone-blue",
    "severity-pulse"
  );
}

function applyTone(element, tone, shouldPulse = false) {
  if (!element) {
    return;
  }

  clearToneClasses(element);
  element.classList.add(`tone-${tone}`);

  if (shouldPulse) {
    element.classList.add("severity-pulse");
  }
}

function toneForConfidence(level) {
  const text = asText(level, "UNKNOWN").toUpperCase();

  if (text === "HIGH") return "green";
  if (text === "MODERATE") return "gold";
  if (text === "LOW") return "orange";
  if (text === "AVOID") return "red";
  return "blue";
}

function toneForEnvironment(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "OPTIMAL") return "green";
  if (text === "FAVORABLE") return "teal";
  if (text === "CAUTION") return "gold";
  if (text === "UNSTABLE") return "orange";
  if (text === "HIGH_RISK") return "red";
  return "gray";
}

function toneForStability(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "HIGH") return "green";
  if (text === "MODERATE") return "gold";
  if (text === "LOW") return "orange";
  if (text === "FRAGMENTED") return "red";
  return "gray";
}

function toneForEscalation(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "NONE") return "gray";
  if (text === "LOW") return "teal";
  if (text === "MODERATE") return "gold";
  if (text === "HIGH") return "orange";
  if (text === "CRITICAL") return "red";
  return "gray";
}

function toneForAnomaly(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "NORMAL") return "teal";
  if (text === "ELEVATED") return "gold";
  if (text === "CLUSTERED") return "orange";
  if (text === "SEVERE") return "red";
  return "gray";
}

function toneForWatchlist(value) {
  const text = asText(value, "BACKGROUND").toUpperCase();

  if (text === "HIGH_FOCUS") return "orange";
  if (text === "MODERATE_FOCUS") return "gold";
  if (text === "LOW_FOCUS") return "teal";
  return "blue";
}

function toneForEcosystem(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "SYNCHRONIZED") return "teal";
  if (text === "PARTIALLY_SYNCHRONIZED") return "gold";
  if (text === "FRAGMENTED") return "orange";
  if (text === "DIVERGENT") return "red";
  return "gray";
}

function toneForEnvironmentMap(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "STABLE") return "teal";
  if (text === "CAUTION") return "gold";
  if (text === "FRAGMENTED") return "orange";
  if (text === "ESCALATING") return "red";
  if (text === "RECOVERING") return "blue";
  return "gray";
}

function toneForEcosystemPriority(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "CRITICAL_FOCUS") return "red";
  if (text === "HIGH_FOCUS") return "orange";
  if (text === "MODERATE_FOCUS") return "gold";
  if (text === "LOW_FOCUS") return "teal";
  if (text === "BACKGROUND") return "blue";
  return "gray";
}

function toneForPropagation(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "CONTAINED") return "teal";
  if (text === "SPREADING") return "orange";
  if (text === "FRAGMENTING") return "red";
  if (text === "RECOVERING") return "blue";
  if (text === "STABLE") return "green";
  return "gray";
}

function toneForEvolution(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["STABLE", "STABILIZING"].includes(text)) return "teal";
  if (["RECOVERING"].includes(text)) return "blue";
  if (["CAUTION", "UNCERTAIN"].includes(text)) return "gold";
  if (["DEGRADING", "DETERIORATING"].includes(text)) return "orange";
  if (["FRAGMENTING", "VOLATILE"].includes(text)) return "red";
  return "gray";
}

function toneForStructure(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "COMPRESSED") return "blue";
  if (["EXPANDING", "STRENGTHENING"].includes(text)) return "teal";
  if (text === "RANGING") return "gray";
  if (text === "TRENDING") return "green";
  if (text === "WEAKENING") return "orange";
  if (text === "TRANSITIONAL") return "gold";
  return "gray";
}

function toneForRegime(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "STABLE") return "green";
  if (["CAUTION", "TRANSITIONAL"].includes(text)) return "gold";
  if (text === "UNSTABLE") return "orange";
  if (text === "RECOVERING") return "blue";
  if (text === "FRAGMENTED") return "red";
  return "gray";
}

function toneForFlow(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["ACCUMULATING", "SYNCHRONIZED"].includes(text)) return "teal";
  if (text === "DISTRIBUTING") return "orange";
  if (text === "ROTATING") return "blue";
  if (["DEFENSIVE", "TRANSITIONAL"].includes(text)) return "gold";
  if (text === "FRAGMENTED") return "red";
  return "gray";
}

function toneForLiquidity(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "BALANCED") return "green";
  if (text === "PRESSURED") return "orange";
  if (text === "COMPRESSED") return "blue";
  if (text === "RELEASING") return "teal";
  if (text === "FRAGMENTED") return "red";
  if (text === "STABILIZING") return "blue";
  return "gray";
}

function toneForAdaptiveSignal(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["ALIGNED", "REINFORCED"].includes(text)) return "teal";
  if (["SUPPRESSED", "UNSTABLE"].includes(text)) return "red";
  if (text === "CONFLICTED") return "orange";
  if (text === "TRANSITIONAL") return "gold";
  return "gray";
}

function toneForConsensus(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "FULL_CONSENSUS") return "green";
  if (text === "PARTIAL_CONSENSUS") return "gold";
  if (text === "CONFLICTED") return "orange";
  if (text === "FAILSAFE_PRIORITY") return "red";
  if (text === "UNSTABLE") return "orange";
  return "gray";
}

function toneForTemporal(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "STABLE_MEMORY") return "teal";
  if (text === "RECURRING_PATTERN") return "blue";
  if (text === "AGING_CONTEXT") return "gold";
  if (text === "VOLATILE_HISTORY") return "red";
  if (text === "INSUFFICIENT_HISTORY") return "gray";
  return "gray";
}

function toneForRecurrence(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "NO_RECURRENCE") return "gray";
  if (text === "WEAK_RECURRENCE") return "teal";
  if (text === "MODERATE_RECURRENCE") return "gold";
  if (text === "STRONG_RECURRENCE") return "green";
  return "gray";
}

function toneForContextAge(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "FRESH") return "green";
  if (text === "AGING") return "gold";
  if (text === "STALE") return "red";
  if (text === "INSUFFICIENT") return "gray";
  return "gray";
}

function toneForSequence(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "ACCELERATING") return "teal";
  if (text === "COOLING") return "blue";
  if (text === "RECOVERING") return "green";
  if (text === "ESCALATING") return "orange";
  if (text === "STABLE_SEQUENCE") return "teal";
  if (text === "UNSTABLE_SEQUENCE") return "red";
  return "gray";
}

function toneForCausality(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "STABLE_CAUSALITY") return "teal";
  if (text === "EMERGING_CAUSALITY") return "gold";
  if (text === "FRACTURED_CAUSALITY") return "orange";
  if (text === "VOLATILE_CAUSALITY") return "red";
  return "gray";
}

function toneForLearning(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["STABLE", "CALIBRATED", "CLEAR"].includes(text)) return "green";
  if (["TIGHTENING", "CALIBRATING", "ADJUSTING", "CAUTION"].includes(text)) return "gold";
  if (["LOOSENING", "BALANCING", "OBSERVING", "REINFORCING"].includes(text)) return "teal";
  if (text === "UNDER_CONFIDENT") return "blue";
  if (["OVER_CONFIDENT", "WEAKENING"].includes(text)) return "orange";
  if (["MISALIGNED", "BLOCKED"].includes(text)) return "red";
  return "gray";
}

function toneForCopilot(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["ACTIVE", "CLEAR"].includes(text)) return "teal";
  if (["LIMITED", "PARTIAL", "QUIET"].includes(text)) return "gold";
  if (["DEGRADED", "FRAGMENTED"].includes(text)) return "orange";
  if (text === "INSUFFICIENT_CONTEXT") return "gray";
  return "gray";
}

function toneForRuntime(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "HEALTHY") return "green";
  if (text === "STABLE") return "teal";
  if (text === "DEGRADED") return "gold";
  if (text === "UNSTABLE") return "orange";
  if (text === "CRITICAL") return "red";
  return "blue";
}

function toneForBehavior(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "DISCIPLINED") return "green";
  if (text === "CAUTION") return "gold";
  if (text === "OVERACTIVE") return "orange";
  if (text === "UNSTABLE") return "red";
  return "gray";
}

function toneForRisk(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (text === "LOW") return "green";
  if (text === "MODERATE") return "gold";
  if (text === "HIGH") return "red";
  return "gray";
}

function toneForBrain(brain, isFailsafe = false) {
  const status = asText(brain?.status, "UNKNOWN").toUpperCase();

  if (isFailsafe && status === "ACTIVE") return "red";
  if (isFailsafe && status === "STANDBY") return "green";
  if (status === "OBSERVING") return "teal";
  if (status === "DEGRADED") return "orange";
  if (status === "ACTIVE") return "red";
  return "gray";
}

function setBrainPulse(element, tone, urgent = false) {
  if (!element) {
    return;
  }

  element.classList.remove("pulse-calm", "pulse-watch", "pulse-urgent");

  if (urgent || tone === "red") {
    element.classList.add("pulse-urgent");
  } else if (tone === "gold" || tone === "orange") {
    element.classList.add("pulse-watch");
  } else {
    element.classList.add("pulse-calm");
  }
}

function setSyncState(state) {
  const normalized = asText(state, "STANDBY").toUpperCase();
  const className = {
    SYNCHRONIZED: "sync-synchronized",
    OBSERVING: "sync-observing",
    DEGRADED: "sync-degraded",
    "FAILSAFE PRIORITY": "sync-failsafe",
    STANDBY: "sync-standby"
  }[normalized] || "sync-standby";

  elements.brainSyncConnector.classList.remove(
    "sync-synchronized",
    "sync-observing",
    "sync-degraded",
    "sync-failsafe",
    "sync-standby"
  );
  elements.brainSyncConnector.classList.add(className);
  setTextTracked("brainSyncLabel", elements.brainSyncLabel, normalized, elements.brainSyncConnector);
}

function deriveBrainSyncState(brainStatus = {}) {
  const tactical = asText(brainStatus.tacticalBrain?.status, "UNKNOWN").toUpperCase();
  const behavioral = asText(brainStatus.behavioralBrain?.status, "UNKNOWN").toUpperCase();
  const failsafe = asText(brainStatus.failsafeBrain?.status, "UNKNOWN").toUpperCase();
  const statuses = [tactical, behavioral, failsafe];

  if (failsafe === "ACTIVE") return "FAILSAFE PRIORITY";
  if (statuses.some((status) => status === "DEGRADED")) return "DEGRADED";
  if (tactical === "OBSERVING" && behavioral === "OBSERVING" && failsafe === "STANDBY") return "SYNCHRONIZED";
  if (statuses.some((status) => status === "OBSERVING")) return "OBSERVING";
  return "STANDBY";
}

function applyEnvironmentMotion(panel, environment, trajectory) {
  panel.classList.remove(
    "environment-calm",
    "environment-caution",
    "environment-unstable",
    "environment-risk",
    "environment-recovering"
  );

  const env = asText(environment, "UNKNOWN").toUpperCase();
  const trend = asText(trajectory, "UNKNOWN").toUpperCase();

  if (trend === "RECOVERING") {
    panel.classList.add("environment-recovering");
    return;
  }

  if (env === "OPTIMAL" || env === "FAVORABLE") {
    panel.classList.add("environment-calm");
  } else if (env === "CAUTION") {
    panel.classList.add("environment-caution");
  } else if (env === "UNSTABLE") {
    panel.classList.add("environment-unstable");
  } else if (env === "HIGH_RISK") {
    panel.classList.add("environment-risk");
  }
}

function setClassByPrefix(element, prefix, suffix) {
  if (!element) {
    return;
  }

  ["none", "low", "moderate", "high", "critical", "normal", "elevated", "clustered", "severe", "unknown"].forEach((className) => {
    const fullClassName = `${prefix}${className}`;

    if (element.classList.contains?.(fullClassName) || element.classList.values) {
      element.classList.remove(fullClassName);
    }
  });
  element.classList.add(`${prefix}${suffix}`);
}

function clampPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function setMeter(meterElement, percent, tone = "good") {
  const meter = meterElement?.parentElement;

  if (!meterElement || !meter) {
    return;
  }

  meter.classList.remove("meter-warn", "meter-bad", "meter-orange", "meter-blue");

  if (tone === "warn") {
    meter.classList.add("meter-warn");
  }

  if (tone === "bad") {
    meter.classList.add("meter-bad");
  }

  if (tone === "orange") {
    meter.classList.add("meter-orange");
  }

  if (tone === "blue") {
    meter.classList.add("meter-blue");
  }

  meterElement.style.width = `${clampPercent(percent)}%`;
}

function setMeterAwaiting(meterElement, awaiting) {
  const meter = meterElement?.parentElement;

  if (!meter) {
    return;
  }

  meter.classList.toggle("awaiting-meter", awaiting);
}

function setPulse(container, labelElement, state, label) {
  if (!container || !labelElement) {
    return;
  }

  container.classList.remove("pulse-active", "pulse-standby", "pulse-offline", "pulse-awaiting");
  container.classList.add(`pulse-${state}`);
  labelElement.textContent = label;
}

function setEndpointBadgeVisible(badge, visible) {
  if (!badge) {
    return;
  }

  badge.classList.toggle("is-hidden", !visible);
}

function setRoadmapStatus(element, label, connected) {
  if (!element) {
    return;
  }

  element.textContent = `${label} endpoint ${connected ? "CONNECTED" : "pending"}`;
  element.classList.toggle("is-connected", connected);
}

function setActiveCard(card, active) {
  if (!card) {
    return;
  }

  card.classList.toggle("is-active-card", active);
}

function nearestPanel(element) {
  return typeof element?.closest === "function"
    ? element.closest(".panel")
    : element;
}

function nearestElement(element, selector) {
  return typeof element?.closest === "function"
    ? element.closest(selector)
    : element;
}

function runtimeHealthPercent(runtimeHealth) {
  const health = runtimeHealth.toLowerCase();

  if (health.includes("critical") || health.includes("fail") || health.includes("disconnect")) {
    return 8;
  }

  if (health.includes("degraded") || health.includes("unstable") || health.includes("warn")) {
    return 44;
  }

  if (health.includes("stable") || health.includes("connected")) {
    return 76;
  }

  return 58;
}

function confidencePercent(score) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return 0;
  }

  return numericScore <= 1
    ? numericScore * 100
    : numericScore;
}

function toneFromLevel(level) {
  const text = asText(level, "UNKNOWN").toUpperCase();

  if (text === "AVOID" || text === "CRITICAL") {
    return "bad";
  }

  if (text === "LOW") {
    return "orange";
  }

  if (["WEAK", "MODERATE"].includes(text)) {
    return "warn";
  }

  if (text === "UNKNOWN") {
    return "blue";
  }

  return "good";
}

function unwrapMetrics(rawMetrics) {
  return rawMetrics?.metrics || rawMetrics?.data || rawMetrics || {};
}

function unwrapStream(rawStatus) {
  const candidate = rawStatus?.status || rawStatus?.stream || rawStatus?.data || rawStatus || {};
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate
    : {};
}

function normalizeMetrics(rawMetrics) {
  const metrics = unwrapMetrics(rawMetrics);
  const counters = metrics.counters || metrics.events || {};
  const shadow = metrics.shadow || metrics.shadowMode || {};

  return {
    eventsReceived: firstDefined(metrics.totalEventsReceived, metrics.eventsReceived, metrics.received, counters.received, counters.eventsReceived, 0),
    accepted: firstDefined(metrics.totalEventsAccepted, metrics.accepted, counters.accepted, 0),
    rejected: firstDefined(metrics.totalEventsRejected, metrics.rejected, counters.rejected, 0),
    failsafeActivations: firstDefined(metrics.totalFailsafeActivations, metrics.failsafeActivations, metrics.failsafe?.activations, counters.failsafeActivations, 0),
    shadowObserved: firstDefined(metrics.totalShadowObserved, metrics.shadowObserved, shadow.observed, counters.shadowObserved, 0),
    shadowLogged: firstDefined(metrics.totalShadowLogged, metrics.shadowLogged, shadow.logged, counters.shadowLogged, 0),
    uptime: formatUptime(firstDefined(metrics.uptime, metrics.uptimeSeconds, metrics.runtime?.uptimeSeconds), metrics.uptimeMs),
    runtimeHealth: asText(firstDefined(metrics.runtimeHealth, metrics.health, metrics.status, "Connected")),
    provider: asText(firstDefined(metrics.provider, metrics.source, metrics.activeProvider, metrics.streamSource, "Backend")),
    symbol: asText(firstDefined(metrics.symbol, metrics.currentSymbol, metrics.streamSymbol, fallbackState.symbol))
  };
}

function readableMarketSession(marketOpen) {
  if (marketOpen === true) {
    return "Open";
  }

  if (marketOpen === false) {
    return "Closed";
  }

  return "Unknown";
}

function normalizeStream(rawStatus) {
  const stream = unwrapStream(rawStatus);
  const active = stream.active === true;
  const marketOpen = typeof stream.marketOpen === "boolean"
    ? stream.marketOpen
    : undefined;

  return {
    active,
    label: active ? "Active" : "Inactive",
    source: firstDefined(stream.source, stream.provider),
    provider: firstDefined(stream.provider, stream.source),
    symbol: firstDefined(stream.symbol, stream.currentSymbol),
    mode: firstDefined(stream.mode),
    marketOpen,
    marketSession: readableMarketSession(marketOpen)
  };
}

function buildStreamDetails(stream) {
  const details = [
    `source: ${asText(stream.source, "unknown")}`,
    `symbol: ${asText(stream.symbol, "unknown")}`
  ];

  if (stream.mode) {
    details.push(`mode: ${asText(stream.mode)}`);
  }

  if (typeof stream.marketOpen === "boolean") {
    details.push(`marketOpen: ${stream.marketOpen}`);
  }

  return details.join(" | ");
}

function paintMetrics(metrics) {
  elements.eventsReceived.textContent = formatNumber(metrics.eventsReceived);
  elements.acceptedRejected.textContent = `${formatNumber(metrics.accepted)} / ${formatNumber(metrics.rejected)}`;
  elements.failsafeActivations.textContent = formatNumber(metrics.failsafeActivations);
  elements.shadowObservedLogged.textContent = `${formatNumber(metrics.shadowObserved)} / ${formatNumber(metrics.shadowLogged)}`;
  elements.uptime.textContent = metrics.uptime;

  if (Number(metrics.eventsReceived) !== Number(previousEventsReceived)) {
    elements.eventsReceived.classList.remove("counter-tick");
    const scheduleFrame = window.requestAnimationFrame ||
      window.setTimeout ||
      ((callback) => callback());
    scheduleFrame(() => {
      elements.eventsReceived.classList.add("counter-tick");
    });
    previousEventsReceived = Number(metrics.eventsReceived) || 0;
  }

  const accepted = Number(metrics.accepted) || 0;
  const rejected = Number(metrics.rejected) || 0;
  const received = Number(metrics.eventsReceived) || 0;
  const throughput = received > 0
    ? Math.round((accepted / received) * 100)
    : 0;

  setTextTracked("runtimeStateBadge", elements.runtimeStateBadge, `Runtime ${metrics.runtimeHealth}`, elements.runtimeStateBadge);
  setTextTracked("throughputLabel", elements.throughputLabel, `Accepted ${throughput}% | Rejected ${formatNumber(rejected)}`, elements.throughputLabel);
  applyTone(elements.runtimeStateBadge, toneForRuntime(metrics.runtimeHealth));
}

function paintMeters(metrics, stream) {
  const healthPercent = runtimeHealthPercent(metrics.runtimeHealth);
  const healthTone = healthPercent < 25 ? "bad" : healthPercent < 55 ? "warn" : "good";
  const streamPercent = stream.active ? 100 : 14;
  const streamTone = stream.active ? "good" : "warn";
  const shadowObserved = Number(metrics.shadowObserved) || 0;
  const shadowLogged = Number(metrics.shadowLogged) || 0;
  const shadowPercent = shadowObserved > 0
    ? (shadowLogged / shadowObserved) * 100
    : 0;

  setMeter(elements.backendMeter, 100, "good");
  setMeter(elements.streamMeter, streamPercent, streamTone);
  setMeter(elements.runtimeHealthMeter, healthPercent, healthTone);
  setMeter(elements.runtimeHealthWideMeter, healthPercent, healthTone);
  setMeter(elements.streamActivityMeter, streamPercent, streamTone);
  setMeter(elements.shadowMeter, shadowPercent, shadowObserved > 0 ? "good" : "warn");
  setMeter(elements.confidenceMeter, 34, "warn");

  elements.runtimeHealthBarLabel.textContent = `${metrics.runtimeHealth} ${Math.round(healthPercent)}%`;
  elements.streamActivityBarLabel.textContent = stream.active ? "Active" : "Standby";
  elements.shadowBarLabel.textContent = `${formatNumber(shadowObserved)} / ${formatNumber(shadowLogged)}`;
  elements.confidenceBarLabel.textContent = "Awaiting backend endpoint.";
}

function paintPulse(metrics, stream) {
  const shadowObserved = Number(metrics.shadowObserved) || 0;

  setPulse(elements.pulseBackend, elements.pulseBackendState, "active", "active");
  setPulse(
    elements.pulseStream,
    elements.pulseStreamState,
    stream.active ? "active" : "standby",
    stream.active ? "active" : "standby"
  );
  setPulse(elements.pulseRuntime, elements.pulseRuntimeState, "active", "active");
  setPulse(
    elements.pulseShadow,
    elements.pulseShadowState,
    shadowObserved > 0 ? "active" : "standby",
    shadowObserved > 0 ? "active" : "standby"
  );
}

function fallbackCognitionState() {
  return {
    overview: null,
    brainStatus: null,
    strategicEnvironment: null,
    confidence: null,
    behavioralState: null,
    replaySummary: null,
    anomalies: null,
    watchlist: null,
    ecosystem: null,
    environmentMap: null,
    ecosystemPriority: null,
    sectorHeatmap: null,
    cognitiveDrift: null,
    environmentForecast: null,
    marketStructure: null,
    regimeTransition: null,
    institutionalFlow: null,
    liquidityPressure: null,
    adaptiveSignals: null,
    brainConsensus: null,
    temporalMemory: null,
    recurrence: null,
    contextAging: null,
    temporalSequences: null,
    environmentCausality: null,
    adaptiveThresholds: null,
    reinforcementWeighting: null,
    cognitionCalibration: null,
    learningGuardrails: null,
    copilot: null,
    explainability: null,
    priorityFeed: null,
    reasoningChains: null,
    replayTimeline: null,
    interactiveRegions: null,
    persistentMemory: null,
    environmentArchive: null,
    recurrenceIntelligence: null,
    driftEvolution: null,
    replayArchive: null,
    productionStatus: null,
    userProfile: null,
    userSession: null,
    userWatchlistProfile: null,
    userCognitionPreferences: null,
    operatorMemory: null,
    subscriptionTier: null,
    entitlements: null,
    platformUsage: null,
    featureGates: null,
    planManifest: null,
    distributedCoordinator: null,
    distributedNodes: null,
    websocketStatus: null,
    distributedReplaySync: null,
    distributedScaling: null,
    cloudManifest: null,
    escalation: null
  };
}

async function fetchOptionalCognition(path) {
  try {
    return await fetchJson(path);
  } catch {
    return null;
  }
}

async function loadCognitionState() {
  const [
    overview,
    brainStatus,
    strategicEnvironment,
    confidence,
    behavioralState,
    replaySummary,
    anomalies,
    watchlist,
    ecosystem,
    environmentMap,
    ecosystemPriority,
    sectorHeatmap,
    cognitiveDrift,
    environmentForecast,
    marketStructure,
    regimeTransition,
    institutionalFlow,
    liquidityPressure,
    adaptiveSignals,
    brainConsensus,
    temporalMemory,
    recurrence,
    contextAging,
    temporalSequences,
    environmentCausality,
    adaptiveThresholds,
    reinforcementWeighting,
    cognitionCalibration,
    learningGuardrails,
    copilot,
    explainability,
    priorityFeed,
    reasoningChains,
    replayTimeline,
    interactiveRegions,
    persistentMemory,
    environmentArchive,
    recurrenceIntelligence,
    driftEvolution,
    replayArchive,
    productionStatus,
    userProfile,
    userSession,
    userWatchlistProfile,
    userCognitionPreferences,
    operatorMemory,
    subscriptionTier,
    entitlements,
    platformUsage,
    featureGates,
    planManifest,
    distributedCoordinator,
    distributedNodes,
    websocketStatus,
    distributedReplaySync,
    distributedScaling,
    cloudManifest,
    escalation
  ] = await Promise.all([
    fetchOptionalCognition("/api/cognition/overview"),
    fetchOptionalCognition("/api/cognition/brain-status"),
    fetchOptionalCognition("/api/cognition/strategic-environment"),
    fetchOptionalCognition("/api/cognition/confidence"),
    fetchOptionalCognition("/api/cognition/behavioral-state"),
    fetchOptionalCognition("/api/cognition/replay-summary"),
    fetchOptionalCognition("/api/cognition/anomalies"),
    fetchOptionalCognition("/api/cognition/watchlist"),
    fetchOptionalCognition("/api/cognition/ecosystem"),
    fetchOptionalCognition("/api/cognition/environment-map"),
    fetchOptionalCognition("/api/cognition/ecosystem-priority"),
    fetchOptionalCognition("/api/cognition/sector-heatmap"),
    fetchOptionalCognition("/api/cognition/cognitive-drift"),
    fetchOptionalCognition("/api/cognition/environment-forecast"),
    fetchOptionalCognition("/api/cognition/market-structure"),
    fetchOptionalCognition("/api/cognition/regime-transition"),
    fetchOptionalCognition("/api/cognition/institutional-flow"),
    fetchOptionalCognition("/api/cognition/liquidity-pressure"),
    fetchOptionalCognition("/api/cognition/adaptive-signals"),
    fetchOptionalCognition("/api/cognition/brain-consensus"),
    fetchOptionalCognition("/api/cognition/temporal-memory"),
    fetchOptionalCognition("/api/cognition/recurrence"),
    fetchOptionalCognition("/api/cognition/context-aging"),
    fetchOptionalCognition("/api/cognition/temporal-sequences"),
    fetchOptionalCognition("/api/cognition/environment-causality"),
    fetchOptionalCognition("/api/cognition/adaptive-thresholds"),
    fetchOptionalCognition("/api/cognition/reinforcement-weighting"),
    fetchOptionalCognition("/api/cognition/cognition-calibration"),
    fetchOptionalCognition("/api/cognition/learning-guardrails"),
    fetchOptionalCognition("/api/cognition/copilot"),
    fetchOptionalCognition("/api/cognition/explainability"),
    fetchOptionalCognition("/api/cognition/priority-feed"),
    fetchOptionalCognition("/api/cognition/reasoning-chains"),
    fetchOptionalCognition("/api/cognition/replay-timeline"),
    fetchOptionalCognition("/api/cognition/interactive-regions"),
    fetchOptionalCognition("/api/cognition/persistent-memory"),
    fetchOptionalCognition("/api/cognition/environment-archive"),
    fetchOptionalCognition("/api/cognition/recurrence-intelligence"),
    fetchOptionalCognition("/api/cognition/drift-evolution"),
    fetchOptionalCognition("/api/cognition/replay-archive"),
    fetchOptionalCognition("/api/v1/system/status"),
    fetchOptionalCognition("/api/v1/user/profile"),
    fetchOptionalCognition("/api/v1/user/session-status"),
    fetchOptionalCognition("/api/v1/user/watchlist-profile"),
    fetchOptionalCognition("/api/v1/user/cognition-preferences"),
    fetchOptionalCognition("/api/v1/user/operator-memory"),
    fetchOptionalCognition("/api/v1/platform/subscription-tier"),
    fetchOptionalCognition("/api/v1/platform/entitlements"),
    fetchOptionalCognition("/api/v1/platform/usage"),
    fetchOptionalCognition("/api/v1/platform/feature-gates"),
    fetchOptionalCognition("/api/v1/platform/plan-manifest"),
    fetchOptionalCognition("/api/v1/distributed/coordinator"),
    fetchOptionalCognition("/api/v1/distributed/nodes"),
    fetchOptionalCognition("/api/v1/distributed/websocket-status"),
    fetchOptionalCognition("/api/v1/distributed/replay-sync"),
    fetchOptionalCognition("/api/v1/distributed/scaling"),
    fetchOptionalCognition("/api/v1/distributed/cloud-manifest"),
    fetchOptionalCognition("/api/cognition/escalation")
  ]);

  return {
    overview,
    brainStatus,
    strategicEnvironment,
    confidence,
    behavioralState,
    replaySummary,
    anomalies,
    watchlist,
    ecosystem,
    environmentMap,
    ecosystemPriority,
    sectorHeatmap,
    cognitiveDrift,
    environmentForecast,
    marketStructure,
    regimeTransition,
    institutionalFlow,
    liquidityPressure,
    adaptiveSignals,
    brainConsensus,
    temporalMemory,
    recurrence,
    contextAging,
    temporalSequences,
    environmentCausality,
    adaptiveThresholds,
    reinforcementWeighting,
    cognitionCalibration,
    learningGuardrails,
    copilot,
    explainability,
    priorityFeed,
    reasoningChains,
    replayTimeline,
    interactiveRegions,
    persistentMemory,
    environmentArchive,
    recurrenceIntelligence,
    driftEvolution,
    replayArchive,
    productionStatus,
    userProfile,
    userSession,
    userWatchlistProfile,
    userCognitionPreferences,
    operatorMemory,
    subscriptionTier,
    entitlements,
    platformUsage,
    featureGates,
    planManifest,
    distributedCoordinator,
    distributedNodes,
    websocketStatus,
    distributedReplaySync,
    distributedScaling,
    cloudManifest,
    escalation
  };
}

function paintBrainCard(card, labelElement, reasonElement, metaElement, pulseElement, brain, isFailsafe = false) {
  const status = asText(brain?.status, AWAITING_COGNITION);
  const reason = asText(brain?.reason, AWAITING_COGNITION);
  const confidence = firstDefined(brain?.confidence, null);
  const confidenceNote = Number.isFinite(Number(confidence))
    ? `Confidence ${Math.round(Number(confidence) * 100)}%`
    : AWAITING_COGNITION;
  const hasCognition = !isAwaiting(status);
  const tone = toneForBrain(brain, isFailsafe);
  const urgent = isFailsafe && status.toUpperCase() === "ACTIVE";

  setTextTracked(`${labelElement.id}:status`, labelElement, status, card);
  setTextTracked(`${reasonElement.id}:reason`, reasonElement, reason, card);
  setTextTracked(`${metaElement.id}:meta`, metaElement, confidenceNote, card);
  applyTone(metaElement, tone);
  setBrainPulse(pulseElement, tone, urgent);
  setActiveCard(card, hasCognition && !status.toLowerCase().includes("standby"));
}

function paintBrainStatus(brainStatus) {
  const hasCognition = hasUsableValue(brainStatus?.tacticalBrain) ||
    hasUsableValue(brainStatus?.behavioralBrain) ||
    hasUsableValue(brainStatus?.failsafeBrain);

  setEndpointBadgeVisible(elements.brainEndpointBadge, !hasCognition);
  paintBrainCard(
    elements.tacticalBrainCard,
    elements.tacticalBrain,
    elements.tacticalBrainReason,
    elements.tacticalBrainMeta,
    elements.tacticalBrainPulse,
    brainStatus?.tacticalBrain
  );
  paintBrainCard(
    elements.behavioralBrainCard,
    elements.behavioralBrain,
    elements.behavioralBrainReason,
    elements.behavioralBrainMeta,
    elements.behavioralBrainPulse,
    brainStatus?.behavioralBrain
  );
  paintBrainCard(
    elements.failsafeBrainCard,
    elements.failsafeBrain,
    elements.failsafeBrainReason,
    elements.failsafeBrainMeta,
    elements.failsafeBrainPulse,
    brainStatus?.failsafeBrain,
    true
  );

  const summary = asText(brainStatus?.summary, AWAITING_COGNITION);
  const hasPulseCognition = !isAwaiting(summary);

  setPulse(
    elements.pulseBrains,
    elements.pulseBrainsState,
    hasPulseCognition ? "active" : "standby",
    hasPulseCognition ? "active" : "awaiting"
  );
  setSyncState(hasPulseCognition ? deriveBrainSyncState(brainStatus) : "STANDBY");
}

function paintStrategicEnvironment(strategicEnvironment, escalation) {
  const environment = asText(strategicEnvironment?.environment, AWAITING_COGNITION);
  const stability = asText(strategicEnvironment?.stability, AWAITING_COGNITION);
  const pressureLevel = asText(strategicEnvironment?.pressureLevel, AWAITING_COGNITION);
  const trajectory = asText(strategicEnvironment?.trajectory, AWAITING_COGNITION);
  const warnings = asReadableList(strategicEnvironment?.warnings, AWAITING_COGNITION);
  const summary = asText(strategicEnvironment?.summary, AWAITING_COGNITION);
  const escalationLevel = asText(escalation?.escalationLevel, AWAITING_COGNITION);
  const hasStrategic = hasUsableValue(strategicEnvironment?.environment) ||
    hasUsableValue(strategicEnvironment?.summary);
  setEndpointBadgeVisible(elements.strategicEndpointBadge, !hasStrategic);

  const panel = elements.strategicPanel || nearestPanel(elements.environment);
  setTextTracked("environment", elements.environment, environment, panel);
  setTextTracked("environmentSummary", elements.environmentSummary, summary, panel);
  setTextTracked("stability", elements.stability, `Stability: ${stability} | Pressure: ${pressureLevel} | Trajectory: ${trajectory}`, panel);
  setTextTracked("warnings", elements.warnings, `Warnings: ${warnings}`, panel);
  setTextTracked("escalationLevel", elements.escalationLevel, `Escalation: ${escalationLevel}`, panel);
  applyTone(elements.environment, toneForEnvironment(environment));
  applyTone(elements.stability, toneForStability(stability));
  applyEnvironmentMotion(panel, environment, trajectory);
  applyPressureOverlay(panel, pressureLevel);
  panel.classList.toggle("instability-fracture", stability.toUpperCase() === "FRAGMENTED");
  elements.escalationLevel.classList.remove("escalation-none", "escalation-watch", "escalation-high");

  const escalationText = escalationLevel.toLowerCase();
  if (escalationText.includes("none")) {
    elements.escalationLevel.classList.add("escalation-none");
  } else if (escalationText.includes("high") || escalationText.includes("critical")) {
    elements.escalationLevel.classList.add("escalation-high");
  } else {
    elements.escalationLevel.classList.add("escalation-watch");
  }
  applyTone(
    elements.escalationLevel,
    toneForEscalation(escalationLevel),
    ["high", "critical"].includes(escalationText)
  );
  paintEscalationOverlay(escalation);
}

function applyPressureOverlay(panel, pressureLevel) {
  const pressure = asText(pressureLevel, "UNKNOWN").toUpperCase();

  panel.classList.remove("pressure-low", "pressure-moderate", "pressure-high", "pressure-severe");

  if (pressure === "LOW") {
    panel.classList.add("pressure-low");
  } else if (pressure === "MODERATE") {
    panel.classList.add("pressure-moderate");
  } else if (pressure === "HIGH") {
    panel.classList.add("pressure-high");
  } else if (pressure === "SEVERE" || pressure === "EXTREME") {
    panel.classList.add("pressure-severe");
  }
}

function paintEscalationOverlay(escalation) {
  const level = asText(escalation?.escalationLevel, "UNKNOWN").toUpperCase();
  const summary = asText(escalation?.summary, "Escalation cognition unavailable.");
  const suffix = {
    NONE: "none",
    LOW: "low",
    MODERATE: "moderate",
    HIGH: "high",
    CRITICAL: "critical"
  }[level] || "none";

  setTextTracked("escalationBanner", elements.escalationBanner, `Escalation: ${level}`, elements.escalationOverlay);
  elements.escalationOverlay.title = summary;
  elements.escalationRing.title = summary;
  setClassByPrefix(elements.escalationOverlay, "escalation-", suffix);
  applyTone(elements.escalationBanner, toneForEscalation(level), ["HIGH", "CRITICAL"].includes(level));
}

function paintConfidence(confidence) {
  const score = firstDefined(confidence?.score, null);
  const level = asText(confidence?.level, AWAITING_COGNITION);
  const consensusStrength = asText(confidence?.consensusStrength, AWAITING_COGNITION);
  const stabilityTrajectory = asText(confidence?.stabilityTrajectory, AWAITING_COGNITION);
  const percent = confidencePercent(score);
  const hasScore = Number.isFinite(Number(score)) && !isAwaiting(level);
  setEndpointBadgeVisible(elements.confidenceEndpointBadge, !hasScore && !hasUsableValue(confidence?.level));

  const panel = nearestPanel(elements.confidenceScore);
  const scoreText = hasScore
    ? `${Math.round(percent)}%`
    : "--";
  setTextTracked("confidenceScore", elements.confidenceScore, `${scoreText} ${hasScore ? level : ""}`.trim(), panel);
  setTextTracked("confidenceLevel", elements.confidenceLevel, `Confidence: ${level}`, panel);
  setTextTracked("consensusStrength", elements.consensusStrength, `Consensus: ${consensusStrength}`, panel);
  setTextTracked("stabilityForecast", elements.stabilityForecast, `Forecast: ${stabilityTrajectory}`, panel);
  setTextTracked("confidenceBarLabel", elements.confidenceBarLabel, hasScore
    ? `${level} ${Math.round(percent)}%`
    : AWAITING_COGNITION, panel);
  applyTone(nearestElement(elements.confidenceScore, ".score-card"), toneForConfidence(level));
  applyTone(elements.confidenceLevel, toneForConfidence(level));
  applyTone(elements.consensusStrength, toneForStability(consensusStrength));
  applyInstabilityMarkers({
    confidenceLevel: level,
    consensusStrength,
    stabilityTrajectory
  });

  setMeterAwaiting(elements.confidenceMeter, !hasScore);
  setMeter(elements.confidenceMeter, hasScore ? percent : 34, hasScore ? toneFromLevel(level) : "warn");
}

function applyInstabilityMarkers({ confidenceLevel, consensusStrength, stabilityTrajectory }) {
  const confidenceText = asText(confidenceLevel, "UNKNOWN").toUpperCase();
  const consensusText = asText(consensusStrength, "UNKNOWN").toUpperCase();
  const trajectoryText = asText(stabilityTrajectory, "UNKNOWN").toUpperCase();
  const unstableConfidence = ["LOW", "AVOID"].includes(confidenceText);
  const weakConsensus = ["WEAK", "CONFLICTED"].includes(consensusText);
  const deteriorating = ["DETERIORATING", "FRAGMENTING"].includes(trajectoryText);

  elements.confidencePanel.classList.toggle("instability-fracture", unstableConfidence || weakConsensus || deteriorating);
}

function paintBehavioralState(behavioralState) {
  const state = asText(behavioralState?.behavioralState, AWAITING_COGNITION);
  const riskLevel = asText(behavioralState?.riskLevel, AWAITING_COGNITION);
  const alignment = asText(behavioralState?.alignment, AWAITING_COGNITION);
  const reflectionTheme = asText(behavioralState?.reflectionTheme, AWAITING_COGNITION);
  const journalMood = asText(behavioralState?.journalMood, AWAITING_COGNITION);
  const summary = asText(behavioralState?.summary, AWAITING_COGNITION);
  const hasBehavioral = hasUsableValue(behavioralState?.behavioralState) ||
    hasUsableValue(behavioralState?.summary);

  setEndpointBadgeVisible(elements.behavioralEndpointBadge, !hasBehavioral);

  const panel = nearestPanel(elements.behavioralState);
  setTextTracked("behavioralState", elements.behavioralState, state, panel);
  setTextTracked("reflectionPrompt", elements.reflectionPrompt, summary, panel);
  setTextTracked("riskLevel", elements.riskLevel, `Risk: ${riskLevel} | Alignment: ${alignment}`, panel);
  setTextTracked("journalDraft", elements.journalDraft, `Reflection: ${reflectionTheme} | Journal mood: ${journalMood}`, panel);
  applyTone(elements.behavioralState, toneForBehavior(state));
  applyTone(elements.riskLevel, toneForRisk(riskLevel));
}

function paintReplaySummary(replaySummary) {
  const recentEvents = Array.isArray(replaySummary?.recentEvents)
    ? replaySummary.recentEvents
    : [];
  const recentSnapshots = Array.isArray(replaySummary?.recentSnapshots)
    ? replaySummary.recentSnapshots
    : [];
  const compressionSummary = asText(replaySummary?.compressionSummary, AWAITING_COGNITION);
  const timelineSummary = asText(replaySummary?.timelineSummary, AWAITING_COGNITION);
  const replayFrameSummary = asText(replaySummary?.replayFrameSummary, AWAITING_COGNITION);
  const hasReplay = recentEvents.length > 0 || recentSnapshots.length > 0 || !isAwaiting(timelineSummary);
  setEndpointBadgeVisible(elements.replayEndpointBadge, !hasReplay);

  const timelineRows = [];

  recentEvents.slice(0, 3).forEach((event, index) => {
    timelineRows.push({
      label: index === 0 ? "Newest cognition event" : `Cognition event ${index + 1}`,
      summary: asText(event.summary, "Backend event summary unavailable."),
      severity: asText(event.level || event.severity, "UNKNOWN")
    });
  });

  recentSnapshots.slice(0, 2).forEach((snapshot, index) => {
    timelineRows.push({
      label: index === 0 ? "Snapshot marker" : `Snapshot marker ${index + 1}`,
      summary: asText(snapshot.summary, "Backend snapshot summary unavailable."),
      severity: asText(snapshot.level || snapshot.severity, "UNKNOWN")
    });
  });

  if (!timelineRows.length) {
    timelineRows.push({
      label: "Replay",
      summary: isAwaiting(timelineSummary) ? "Awaiting replay cognition." : timelineSummary,
      severity: "UNKNOWN"
    });
  } else if (!isAwaiting(timelineSummary)) {
    timelineRows.push({
      label: "Confidence transition marker",
      summary: timelineSummary,
      severity: "MODERATE"
    });
  }

  timelineRows.push({
    label: "Replay frame indicator",
    summary: compressionSummary,
    severity: "UNKNOWN"
  });
  timelineRows.push({
    label: "Replay frame summary",
    summary: replayFrameSummary,
    severity: "UNKNOWN"
  });

  const nextSignature = JSON.stringify(timelineRows);
  const isNewTimeline = previousTimelineSignature && previousTimelineSignature !== nextSignature;
  previousTimelineSignature = nextSignature;

  elements.timelinePreview.innerHTML = timelineRows
    .map((row, index) => {
      const isLowConfidence = asText(row.summary, "").toLowerCase().includes("confidence") &&
        ["LOW", "AVOID", "HIGH", "CRITICAL"].includes(asText(row.severity, "").toUpperCase());
      const tone = isLowConfidence ? "orange" : toneForEscalation(row.severity);

      return `
        <li class="timeline-row ${isNewTimeline && index === 0 ? "timeline-new" : ""}">
          <b class="timeline-dot tone-${tone}"></b>
          <span class="timeline-copy">
            <strong>${escapeHtml(row.label)}</strong>
            <span>${escapeHtml(row.summary)}</span>
          </span>
        </li>
      `;
    })
    .join("");

  setPulse(
    elements.pulseReplay,
    elements.pulseReplayState,
    hasReplay ? "active" : "standby",
    hasReplay ? "active" : "awaiting"
  );
}

function anomalyStateFromBackend(anomalies) {
  const severity = asText(anomalies?.severity, "UNKNOWN").toUpperCase();

  if (anomalies?.anomalyDetected === false || severity === "NONE") return "NORMAL";
  if (severity === "LOW") return "ELEVATED";
  if (severity === "MEDIUM") return "CLUSTERED";
  if (severity === "HIGH") return "SEVERE";
  return "UNKNOWN";
}

function anomalyClassSuffix(state) {
  return {
    NORMAL: "normal",
    ELEVATED: "elevated",
    CLUSTERED: "clustered",
    SEVERE: "severe",
    UNKNOWN: "unknown"
  }[state] || "unknown";
}

function paintAnomalyOverlay(anomalies) {
  const hasAnomalyCognition = anomalies && hasUsableValue(anomalies.summary);
  const state = hasAnomalyCognition ? anomalyStateFromBackend(anomalies) : "UNKNOWN";
  const severity = hasAnomalyCognition ? asText(anomalies.severity, "UNKNOWN") : "UNKNOWN";
  const anomalyTypes = !hasAnomalyCognition
    ? "Awaiting anomaly cognition."
    : Array.isArray(anomalies.anomalyTypes) && anomalies.anomalyTypes.length
      ? anomalies.anomalyTypes.map((item) => asText(item)).join(", ")
      : "None from backend";
  const warnings = !hasAnomalyCognition
    ? "Awaiting anomaly cognition."
    : Array.isArray(anomalies.warnings) && anomalies.warnings.length
      ? anomalies.warnings.map((item) => asText(item)).join(", ")
      : "None from backend";
  const summary = hasAnomalyCognition
    ? asText(anomalies.summary, "Awaiting anomaly cognition.")
    : "Awaiting anomaly cognition.";

  setTextTracked("anomalyState", elements.anomalyState, state === "UNKNOWN" ? "Awaiting anomaly cognition." : state, elements.anomalyOverlay);
  setTextTracked("anomalySeverity", elements.anomalySeverity, `Severity: ${severity}`, elements.anomalyOverlay);
  setTextTracked("anomalyTypes", elements.anomalyTypes, `Types: ${anomalyTypes}`, elements.anomalyOverlay);
  setTextTracked("anomalyWarnings", elements.anomalyWarnings, `Warnings: ${warnings}`, elements.anomalyOverlay);
  setTextTracked("anomalySummary", elements.anomalySummary, summary, elements.anomalyOverlay);
  setClassByPrefix(elements.anomalyOverlay, "anomaly-", anomalyClassSuffix(state));
  applyTone(elements.anomalyState, toneForAnomaly(state));
}

function clearWatchlistClasses() {
  elements.watchlistPanel.classList.remove(
    "watchlist-high-focus",
    "watchlist-moderate-focus",
    "watchlist-low-focus"
  );
}

function renderSymbolPills(symbols) {
  return symbols
    .map((item) => {
      const symbol = escapeHtml(item.symbol);
      const focus = escapeHtml(item.focus || "BACKGROUND");
      return `<span class="symbol-pill">${symbol}<small>${focus}</small></span>`;
    })
    .join("");
}

function renderContextChips(groups) {
  return groups
    .map((item) => {
      const environment = escapeHtml(firstDefined(item.environment, item.label, "UNKNOWN"));
      const count = Number.isFinite(Number(item.count)) ? Number(item.count) : 0;
      return `<span class="context-chip">${environment}<small>${count} symbols</small></span>`;
    })
    .join("");
}

function paintWatchlistEcosystem(watchlist) {
  const symbols = Array.isArray(watchlist?.prioritizedSymbols)
    ? watchlist.prioritizedSymbols
    : [];
  const groups = Array.isArray(watchlist?.groupedContexts)
    ? watchlist.groupedContexts
    : [];
  const warnings = Array.isArray(watchlist?.warnings)
    ? watchlist.warnings
    : [];
  const observations = Array.isArray(watchlist?.observations)
    ? watchlist.observations
    : [];
  const hasSymbols = symbols.length > 0;
  const priority = asText(watchlist?.watchlistPriority, "BACKGROUND");
  const summary = hasSymbols
    ? asText(watchlist?.summary, "Awaiting watchlist ecosystem cognition.")
    : "Awaiting watchlist ecosystem cognition.";

  setTextTracked("watchlistPriority", elements.watchlistPriority, priority, elements.watchlistPanel);
  setTextTracked("watchlistSummary", elements.watchlistSummary, summary, elements.watchlistPanel);
  elements.watchlistSymbols.innerHTML = hasSymbols
    ? renderSymbolPills(symbols)
    : "Awaiting watchlist ecosystem cognition.";
  elements.watchlistGroups.innerHTML = hasSymbols && groups.length
    ? renderContextChips(groups)
    : hasSymbols ? "No backend context groups." : "Awaiting watchlist ecosystem cognition.";
  elements.watchlistWarnings.textContent = hasSymbols && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasSymbols ? "No backend warnings." : "Awaiting watchlist ecosystem cognition.";
  elements.watchlistObservations.textContent = hasSymbols && observations.length
    ? observations.map((item) => asText(item)).join(", ")
    : hasSymbols ? "No backend observations." : "Awaiting watchlist ecosystem cognition.";

  clearWatchlistClasses();
  if (hasSymbols) {
    const className = {
      HIGH_FOCUS: "watchlist-high-focus",
      MODERATE_FOCUS: "watchlist-moderate-focus",
      LOW_FOCUS: "watchlist-low-focus"
    }[priority.toUpperCase()];

    if (className) {
      elements.watchlistPanel.classList.add(className);
    }
  }
  applyTone(elements.watchlistPriority, hasSymbols ? toneForWatchlist(priority) : "blue");
}

function clearEcosystemClasses() {
  elements.ecosystemPanel.classList.remove(
    "ecosystem-synchronized",
    "ecosystem-partial",
    "ecosystem-fragmented",
    "ecosystem-divergent"
  );
}

function renderSimpleSymbolPills(symbols) {
  return symbols
    .map((symbol) => `<span class="symbol-pill">${escapeHtml(symbol)}</span>`)
    .join("");
}

function pressureChipClass(pressureState) {
  return {
    LOW: "pressure-chip-low",
    MODERATE: "pressure-chip-moderate",
    HIGH: "pressure-chip-high",
    SEVERE: "pressure-chip-severe"
  }[asText(pressureState, "UNKNOWN").toUpperCase()] || "pressure-chip-low";
}

function renderPressureClusters(clusters) {
  return clusters
    .map((cluster) => {
      const pressure = escapeHtml(cluster.pressureState || "UNKNOWN");
      const count = Number.isFinite(Number(cluster.count)) ? Number(cluster.count) : 0;
      const symbols = Array.isArray(cluster.symbols) ? cluster.symbols.join(", ") : "";

      return `<span class="context-chip ${pressureChipClass(cluster.pressureState)}">${pressure}<small>${count} symbols ${escapeHtml(symbols)}</small></span>`;
    })
    .join("");
}

function renderEcosystemGroups(groups) {
  return groups
    .map((group) => {
      const name = escapeHtml(group.group || "UNKNOWN");
      const pressure = escapeHtml(group.pressureState || "UNKNOWN");
      const symbols = Array.isArray(group.symbols) ? group.symbols.join(", ") : "";

      return `<span class="context-chip ${pressureChipClass(group.pressureState)}">${name}<small>${pressure} ${escapeHtml(symbols)}</small></span>`;
    })
    .join("");
}

function paintCrossSymbolEcosystem(ecosystem) {
  const synced = Array.isArray(ecosystem?.synchronizedSymbols)
    ? ecosystem.synchronizedSymbols
    : [];
  const divergent = Array.isArray(ecosystem?.divergentSymbols)
    ? ecosystem.divergentSymbols
    : [];
  const pressureClusters = Array.isArray(ecosystem?.pressureClusters)
    ? ecosystem.pressureClusters
    : [];
  const groups = Array.isArray(ecosystem?.ecosystemGroups)
    ? ecosystem.ecosystemGroups
    : [];
  const warnings = Array.isArray(ecosystem?.warnings)
    ? ecosystem.warnings
    : [];
  const hasEcosystem = synced.length + divergent.length >= 2;
  const state = hasEcosystem ? asText(ecosystem.ecosystemState, "UNKNOWN") : "UNKNOWN";
  const summary = hasEcosystem
    ? asText(ecosystem.summary, "Awaiting cross-symbol ecosystem cognition.")
    : "Awaiting cross-symbol ecosystem cognition.";

  setTextTracked("ecosystemState", elements.ecosystemState, state, elements.ecosystemPanel);
  setTextTracked("ecosystemSummary", elements.ecosystemSummary, summary, elements.ecosystemPanel);
  setTextTracked("ecosystemCorrelation", elements.ecosystemCorrelation, hasEcosystem
    ? asText(ecosystem.correlationStrength, "UNKNOWN")
    : "UNKNOWN", elements.ecosystemPanel);
  elements.ecosystemSynchronized.innerHTML = hasEcosystem && synced.length
    ? renderSimpleSymbolPills(synced)
    : "Awaiting cross-symbol ecosystem cognition.";
  elements.ecosystemDivergent.innerHTML = hasEcosystem && divergent.length
    ? renderSimpleSymbolPills(divergent)
    : hasEcosystem ? "No divergent backend symbols." : "Awaiting cross-symbol ecosystem cognition.";
  elements.ecosystemPressureClusters.innerHTML = hasEcosystem && pressureClusters.length
    ? renderPressureClusters(pressureClusters)
    : "Awaiting cross-symbol ecosystem cognition.";
  elements.ecosystemGroups.innerHTML = hasEcosystem && groups.length
    ? renderEcosystemGroups(groups)
    : "Awaiting cross-symbol ecosystem cognition.";
  elements.ecosystemWarnings.textContent = hasEcosystem && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasEcosystem ? "No backend ecosystem warnings." : "Awaiting cross-symbol ecosystem cognition.";

  clearEcosystemClasses();
  if (hasEcosystem) {
    const className = {
      SYNCHRONIZED: "ecosystem-synchronized",
      PARTIALLY_SYNCHRONIZED: "ecosystem-partial",
      FRAGMENTED: "ecosystem-fragmented",
      DIVERGENT: "ecosystem-divergent"
    }[state.toUpperCase()];

    if (className) {
      elements.ecosystemPanel.classList.add(className);
    }
  }
  applyTone(elements.ecosystemState, hasEcosystem ? toneForEcosystem(state) : "gray");
}

function clearEnvironmentMapClasses() {
  elements.environmentMapPanel.classList.remove(
    "environment-stable",
    "environment-caution-map",
    "environment-fragmented-map",
    "environment-escalating",
    "environment-recovering-map"
  );
}

function environmentMapClass(state) {
  return {
    STABLE: "environment-stable",
    CAUTION: "environment-caution-map",
    FRAGMENTED: "environment-fragmented-map",
    ESCALATING: "environment-escalating",
    RECOVERING: "environment-recovering-map"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function pressureRegionClass(pressure) {
  return {
    LOW: "region-pressure-low",
    MODERATE: "region-pressure-moderate",
    HIGH: "region-pressure-high",
    SEVERE: "region-pressure-severe"
  }[asText(pressure, "UNKNOWN").toUpperCase()] || "region-pressure-low";
}

function renderEnvironmentRegions(regions) {
  return regions
    .map((region) => {
      const ecosystem = escapeHtml(region.ecosystem || "UNKNOWN");
      const state = escapeHtml(region.state || "UNKNOWN");
      const pressure = escapeHtml(region.pressure || "UNKNOWN");
      const trajectory = escapeHtml(region.trajectory || "UNKNOWN");
      const symbols = Array.isArray(region.symbols) ? region.symbols.join(", ") : "";
      const classes = [
        "environment-region-card",
        pressureRegionClass(region.pressure),
        region.fragmentation === true ? "instability-fracture" : ""
      ].join(" ");

      return `
        <article class="${classes}">
          <strong>${ecosystem}</strong>
          <span>${state} | ${pressure}</span>
          <small>${trajectory} ${escapeHtml(symbols)}</small>
        </article>
      `;
    })
    .join("");
}

function renderEnvironmentPressureMap(items) {
  return items
    .map((item) => {
      const ecosystem = escapeHtml(item.ecosystem || "UNKNOWN");
      const pressure = escapeHtml(item.pressure || "UNKNOWN");
      const state = escapeHtml(item.state || "UNKNOWN");

      return `<span class="context-chip ${pressureChipClass(item.pressure)}">${ecosystem}<small>${pressure} ${state}</small></span>`;
    })
    .join("");
}

function renderEnvironmentZones(items, emptyText) {
  if (!items.length) {
    return emptyText;
  }

  return items
    .map((item) => {
      const ecosystem = escapeHtml(item.ecosystem || "UNKNOWN");
      const detail = escapeHtml(firstDefined(item.transition, item.state, item.pressure, "UNKNOWN"));
      const symbols = Array.isArray(item.symbols) ? item.symbols.join(", ") : "";

      return `<span class="context-chip ${pressureChipClass(item.pressure)}">${ecosystem}<small>${detail} ${escapeHtml(symbols)}</small></span>`;
    })
    .join("");
}

function paintStrategicEnvironmentMap(environmentMap) {
  const regions = Array.isArray(environmentMap?.ecosystemRegions)
    ? environmentMap.ecosystemRegions
    : [];
  const pressureMap = Array.isArray(environmentMap?.pressureMap)
    ? environmentMap.pressureMap
    : [];
  const fragmentationZones = Array.isArray(environmentMap?.fragmentationZones)
    ? environmentMap.fragmentationZones
    : [];
  const synchronizationZones = Array.isArray(environmentMap?.synchronizationZones)
    ? environmentMap.synchronizationZones
    : [];
  const transitionSignals = Array.isArray(environmentMap?.transitionSignals)
    ? environmentMap.transitionSignals
    : [];
  const warnings = Array.isArray(environmentMap?.warnings)
    ? environmentMap.warnings
    : [];
  const hasMap = regions.length > 0;
  const state = hasMap ? asText(environmentMap.globalEnvironmentState, "UNKNOWN") : "UNKNOWN";
  const summary = hasMap
    ? asText(environmentMap.summary, "Awaiting strategic environment mapping cognition.")
    : "Awaiting strategic environment mapping cognition.";

  setTextTracked("environmentMapState", elements.environmentMapState, state, elements.environmentMapPanel);
  setTextTracked("environmentMapSummary", elements.environmentMapSummary, summary, elements.environmentMapPanel);
  elements.environmentHeatmap.innerHTML = hasMap
    ? renderEnvironmentRegions(regions)
    : "<span>Awaiting strategic environment mapping cognition.</span>";
  elements.environmentPressureMap.innerHTML = hasMap && pressureMap.length
    ? renderEnvironmentPressureMap(pressureMap)
    : "Awaiting strategic environment mapping cognition.";
  elements.environmentSynchronizationZones.innerHTML = hasMap
    ? renderEnvironmentZones(synchronizationZones, "No synchronized backend regions.")
    : "Awaiting strategic environment mapping cognition.";
  elements.environmentFragmentationZones.innerHTML = hasMap
    ? renderEnvironmentZones(fragmentationZones, "No fragmentation regions.")
    : "Awaiting strategic environment mapping cognition.";
  elements.environmentTransitionSignals.innerHTML = hasMap
    ? renderEnvironmentZones(transitionSignals, "No transition signals.")
    : "Awaiting strategic environment mapping cognition.";
  elements.environmentMapWarnings.textContent = hasMap && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasMap ? "No backend environment map warnings." : "Awaiting strategic environment mapping cognition.";

  clearEnvironmentMapClasses();
  const className = hasMap ? environmentMapClass(state) : "";
  if (className) {
    elements.environmentMapPanel.classList.add(className);
  }
  applyTone(elements.environmentMapState, hasMap ? toneForEnvironmentMap(state) : "gray");
}

function priorityCardClass(priority) {
  return {
    CRITICAL_FOCUS: "priority-critical-focus",
    HIGH_FOCUS: "priority-high-focus",
    MODERATE_FOCUS: "priority-moderate-focus",
    LOW_FOCUS: "priority-low-focus"
  }[asText(priority, "UNKNOWN").toUpperCase()] || "";
}

function renderPriorityEcosystems(items) {
  return items
    .map((item) => {
      const ecosystem = escapeHtml(item.ecosystem || "UNKNOWN");
      const priority = escapeHtml(item.priority || "UNKNOWN");
      const pressure = escapeHtml(item.pressure || "UNKNOWN");
      const trajectory = escapeHtml(item.trajectory || "UNKNOWN");
      const sync = escapeHtml(item.synchronization || "UNKNOWN");

      return `
        <article class="priority-ecosystem-card ${priorityCardClass(item.priority)}">
          <strong>${ecosystem}</strong>
          <span>${priority} | ${pressure}</span>
          <small>${sync} ${trajectory}</small>
        </article>
      `;
    })
    .join("");
}

function renderRegionChips(items) {
  return items
    .map((item) => `<span class="context-chip">${escapeHtml(item)}</span>`)
    .join("");
}

function renderPropagationPaths(paths) {
  return paths
    .map((path) => {
      const from = escapeHtml(path.from || "UNKNOWN");
      const to = escapeHtml(path.to || "UNKNOWN");
      const pressure = escapeHtml(path.pressure || "UNKNOWN");

      return `<span class="context-chip ${pressureChipClass(path.pressure)}">${from}<small>to ${to} ${pressure}</small></span>`;
    })
    .join("");
}

function renderSuppressedEcosystems(items) {
  return items
    .map((item) => {
      const ecosystem = escapeHtml(item.ecosystem || "UNKNOWN");
      const reason = escapeHtml(item.reason || "Background context.");

      return `<span class="context-chip">${ecosystem}<small>${reason}</small></span>`;
    })
    .join("");
}

function clearEcosystemPriorityClasses() {
  elements.ecosystemPriorityPanel.classList.remove(
    "priority-critical-focus",
    "priority-high-focus",
    "priority-moderate-focus",
    "priority-low-focus"
  );
}

function paintAdaptiveEcosystemPriority(priority) {
  const ecosystems = Array.isArray(priority?.prioritizedEcosystems)
    ? priority.prioritizedEcosystems
    : [];
  const drivers = Array.isArray(priority?.priorityDrivers)
    ? priority.priorityDrivers
    : [];
  const suppressed = Array.isArray(priority?.suppressedEcosystems)
    ? priority.suppressedEcosystems
    : [];
  const origins = Array.isArray(priority?.originRegions)
    ? priority.originRegions
    : [];
  const receivers = Array.isArray(priority?.receivingRegions)
    ? priority.receivingRegions
    : [];
  const paths = Array.isArray(priority?.propagationPaths)
    ? priority.propagationPaths
    : [];
  const warnings = Array.isArray(priority?.warnings)
    ? priority.warnings
    : [];
  const hasPriority = ecosystems.length > 0;
  const level = hasPriority ? asText(priority.priorityLevel, "UNKNOWN") : "UNKNOWN";
  const propagation = hasPriority ? asText(priority.propagationState, "UNKNOWN") : "UNKNOWN";
  const summary = hasPriority
    ? asText(priority.summary, "Awaiting adaptive ecosystem prioritization cognition.")
    : "Awaiting adaptive ecosystem prioritization cognition.";

  setTextTracked("ecosystemPriorityLevel", elements.ecosystemPriorityLevel, level, elements.ecosystemPriorityPanel);
  setTextTracked("ecosystemPrioritySummary", elements.ecosystemPrioritySummary, summary, elements.ecosystemPriorityPanel);
  setTextTracked("ecosystemPropagationState", elements.ecosystemPropagationState, propagation, elements.ecosystemPriorityPanel);
  elements.ecosystemPriorityList.innerHTML = hasPriority
    ? renderPriorityEcosystems(ecosystems)
    : "<span>Awaiting adaptive ecosystem prioritization cognition.</span>";
  elements.ecosystemOriginRegions.innerHTML = hasPriority && origins.length
    ? renderRegionChips(origins)
    : hasPriority ? "No backend origin regions." : "Awaiting adaptive ecosystem prioritization cognition.";
  elements.ecosystemReceivingRegions.innerHTML = hasPriority && receivers.length
    ? renderRegionChips(receivers)
    : hasPriority ? "No backend receiving regions." : "Awaiting adaptive ecosystem prioritization cognition.";
  elements.ecosystemPropagationPaths.innerHTML = hasPriority && paths.length
    ? renderPropagationPaths(paths)
    : hasPriority ? "No backend propagation paths." : "Awaiting adaptive ecosystem prioritization cognition.";
  elements.ecosystemPriorityDrivers.textContent = hasPriority && drivers.length
    ? drivers.map((item) => asText(item)).join(", ")
    : hasPriority ? "No backend priority drivers." : "Awaiting adaptive ecosystem prioritization cognition.";
  elements.ecosystemSuppressed.innerHTML = hasPriority && suppressed.length
    ? renderSuppressedEcosystems(suppressed)
    : hasPriority ? "No suppressed ecosystems." : "Awaiting adaptive ecosystem prioritization cognition.";
  elements.ecosystemPriorityWarnings.textContent = hasPriority && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasPriority ? "No backend ecosystem priority warnings." : "Awaiting adaptive ecosystem prioritization cognition.";

  clearEcosystemPriorityClasses();
  const className = hasPriority ? priorityCardClass(level) : "";
  if (className) {
    elements.ecosystemPriorityPanel.classList.add(className);
  }
  elements.ecosystemPropagationState.parentElement.classList.toggle(
    "is-moving",
    ["SPREADING", "FRAGMENTING"].includes(propagation.toUpperCase())
  );
  elements.ecosystemPropagationState.parentElement.classList.toggle(
    "is-calm",
    ["RECOVERING", "STABLE", "CONTAINED"].includes(propagation.toUpperCase())
  );
  applyTone(elements.ecosystemPriorityLevel, hasPriority ? toneForEcosystemPriority(level) : "gray");
  applyTone(elements.ecosystemPropagationState, hasPriority ? toneForPropagation(propagation) : "gray");
}

function evolutionClass(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["STABLE", "STABILIZING"].includes(text)) return "evolution-stable";
  if (text === "RECOVERING") return "evolution-recovering";
  if (["CAUTION", "UNCERTAIN"].includes(text)) return "evolution-caution";
  if (["DEGRADING", "DETERIORATING"].includes(text)) return "evolution-degrading";
  if (text === "FRAGMENTING") return "evolution-fragmenting";
  if (text === "VOLATILE") return "evolution-volatile";
  return "";
}

function sectorClass(value) {
  return evolutionClass(value).replace("evolution-", "sector-");
}

function clearEvolutionClasses(element) {
  element.classList.remove(
    "evolution-stable",
    "evolution-recovering",
    "evolution-caution",
    "evolution-degrading",
    "evolution-fragmenting",
    "evolution-volatile"
  );
}

function renderSectorTiles(sectors) {
  return sectors
    .map((sector) => {
      const ecosystem = escapeHtml(sector.ecosystem || "UNKNOWN");
      const stability = escapeHtml(sector.stability || "UNKNOWN");
      const pressure = escapeHtml(sector.pressure || "UNKNOWN");
      const trajectory = escapeHtml(sector.trajectory || "UNKNOWN");
      const confidence = escapeHtml(sector.confidence || "UNKNOWN");

      return `
        <article class="sector-tile ${sectorClass(sector.stability)}">
          <strong>${ecosystem}</strong>
          <span>${stability} | ${pressure}</span>
          <small>${trajectory} confidence ${confidence}</small>
        </article>
      `;
    })
    .join("");
}

function paintSectorHeatmap(heatmap) {
  const sectors = Array.isArray(heatmap?.sectors) ? heatmap.sectors : [];
  const warnings = Array.isArray(heatmap?.warnings) ? heatmap.warnings : [];
  const hasHeatmap = sectors.length > 0;
  const state = hasHeatmap ? asText(heatmap.heatmapState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("sectorHeatmapState", elements.sectorHeatmapState, state, elements.sectorHeatmapPanel);
  setTextTracked("sectorHeatmapSummary", elements.sectorHeatmapSummary, hasHeatmap
    ? asText(heatmap.summary, "Awaiting sector heatmap cognition.")
    : "Awaiting sector heatmap cognition.", elements.sectorHeatmapPanel);
  elements.sectorHeatmapGrid.innerHTML = hasHeatmap
    ? renderSectorTiles(sectors)
    : "<span>Awaiting sector heatmap cognition.</span>";
  elements.sectorHeatmapWarnings.textContent = hasHeatmap && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasHeatmap ? "No backend sector heatmap warnings." : "Awaiting sector heatmap cognition.";

  clearEvolutionClasses(elements.sectorHeatmapPanel);
  const className = hasHeatmap ? evolutionClass(state) : "";
  if (className) elements.sectorHeatmapPanel.classList.add(className);
  applyTone(elements.sectorHeatmapState, hasHeatmap ? toneForEvolution(state) : "gray");
}

function renderDriftSignals(signals) {
  return signals
    .map((signal) => {
      const ecosystem = escapeHtml(signal.ecosystem || "UNKNOWN");
      const type = escapeHtml(signal.type || "UNKNOWN");
      return `<span class="context-chip">${ecosystem}<small>${type}</small></span>`;
    })
    .join("");
}

function paintCognitiveDrift(drift) {
  const signals = Array.isArray(drift?.driftSignals) ? drift.driftSignals : [];
  const affected = Array.isArray(drift?.affectedEcosystems) ? drift.affectedEcosystems : [];
  const warnings = Array.isArray(drift?.warnings) ? drift.warnings : [];
  const hasDrift = drift && !isAwaiting(drift.summary);
  const state = hasDrift ? asText(drift.driftState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("cognitiveDriftState", elements.cognitiveDriftState, state, elements.cognitiveDriftPanel);
  setTextTracked("cognitiveDriftSummary", elements.cognitiveDriftSummary, hasDrift
    ? asText(drift.summary, "Awaiting cognitive drift cognition.")
    : "Awaiting cognitive drift cognition.", elements.cognitiveDriftPanel);
  setTextTracked("cognitiveDriftSeverity", elements.cognitiveDriftSeverity, `Severity: ${hasDrift ? asText(drift.severity, "LOW") : "LOW"}`, elements.cognitiveDriftPanel);
  setTextTracked("cognitiveDriftAffected", elements.cognitiveDriftAffected, affected.length
    ? `Affected: ${affected.join(", ")}`
    : "Affected: Awaiting cognition.", elements.cognitiveDriftPanel);
  elements.cognitiveDriftSignals.innerHTML = hasDrift && signals.length
    ? renderDriftSignals(signals)
    : hasDrift ? "No backend drift signals." : "Awaiting cognitive drift cognition.";
  elements.cognitiveDriftWarnings.textContent = hasDrift && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasDrift ? "No backend drift warnings." : "Awaiting cognitive drift cognition.";

  clearEvolutionClasses(elements.cognitiveDriftPanel);
  const className = hasDrift ? evolutionClass(state) : "";
  if (className) elements.cognitiveDriftPanel.classList.add(className);
  applyTone(elements.cognitiveDriftState, hasDrift ? toneForEvolution(state) : "gray");
}

function forecastPercent(state) {
  return {
    STABILIZING: 82,
    RECOVERING: 68,
    UNCERTAIN: 48,
    DETERIORATING: 32,
    FRAGMENTING: 18
  }[asText(state, "UNKNOWN").toUpperCase()] || 28;
}

function renderForecasts(forecasts) {
  return forecasts
    .map((forecast) => {
      const ecosystem = escapeHtml(forecast.ecosystem || "UNKNOWN");
      const state = escapeHtml(forecast.forecastState || "UNKNOWN");
      return `<span class="context-chip">${ecosystem}<small>${state}</small></span>`;
    })
    .join("");
}

function paintEnvironmentForecast(forecast) {
  const forecasts = Array.isArray(forecast?.ecosystemForecasts) ? forecast.ecosystemForecasts : [];
  const warnings = Array.isArray(forecast?.warnings) ? forecast.warnings : [];
  const hasForecast = forecasts.length > 0;
  const state = hasForecast ? asText(forecast.forecastState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("environmentForecastState", elements.environmentForecastState, state, elements.environmentForecastPanel);
  setTextTracked("environmentForecastSummary", elements.environmentForecastSummary, hasForecast
    ? asText(forecast.summary, "Awaiting strategic environment forecast cognition.")
    : "Awaiting strategic environment forecast cognition.", elements.environmentForecastPanel);
  setTextTracked("forecastConfidenceTrajectory", elements.forecastConfidenceTrajectory, hasForecast
    ? `Confidence trajectory: ${asText(forecast.confidenceTrajectory, "UNKNOWN")}`
    : "Confidence trajectory: UNKNOWN", elements.environmentForecastPanel);
  elements.forecastTrajectoryMeter.style.width = `${forecastPercent(state)}%`;
  elements.ecosystemForecasts.innerHTML = hasForecast
    ? renderForecasts(forecasts)
    : "Awaiting strategic environment forecast cognition.";
  elements.environmentForecastWarnings.textContent = hasForecast && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasForecast ? "No backend environment forecast warnings." : "Awaiting strategic environment forecast cognition.";

  clearEvolutionClasses(elements.environmentForecastPanel);
  const className = hasForecast ? evolutionClass(state) : "";
  if (className) elements.environmentForecastPanel.classList.add(className);
  applyTone(elements.environmentForecastState, hasForecast ? toneForEvolution(state) : "gray");
}

function structureClass(state) {
  return {
    COMPRESSED: "structure-compressed",
    EXPANDING: "structure-expanding",
    RANGING: "structure-ranging",
    TRENDING: "structure-trending",
    WEAKENING: "structure-weakening",
    STRENGTHENING: "structure-strengthening",
    TRANSITIONAL: "structure-transitional"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function clearStructureClasses(element) {
  element.classList.remove(
    "structure-compressed",
    "structure-expanding",
    "structure-ranging",
    "structure-trending",
    "structure-weakening",
    "structure-strengthening",
    "structure-transitional"
  );
}

function structurePercent(state) {
  return {
    COMPRESSED: 24,
    RANGING: 38,
    TRANSITIONAL: 54,
    WEAKENING: 62,
    TRENDING: 74,
    STRENGTHENING: 82,
    EXPANDING: 92
  }[asText(state, "UNKNOWN").toUpperCase()] || 28;
}

function paintMarketStructure(structure) {
  const affectedSymbols = Array.isArray(structure?.affectedSymbols) ? structure.affectedSymbols : [];
  const affectedEcosystems = Array.isArray(structure?.affectedEcosystems) ? structure.affectedEcosystems : [];
  const warnings = Array.isArray(structure?.warnings) ? structure.warnings : [];
  const hasStructure = structure && !isAwaiting(structure.summary);
  const state = hasStructure ? asText(structure.structureState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("marketStructureState", elements.marketStructureState, state, elements.marketStructurePanel);
  setTextTracked("marketStructureSummary", elements.marketStructureSummary, hasStructure
    ? asText(structure.summary, "Awaiting market structure cognition.")
    : "Awaiting market structure cognition.", elements.marketStructurePanel);
  setTextTracked("marketStructureQuality", elements.marketStructureQuality, `Quality: ${hasStructure ? asText(structure.structureQuality, "UNKNOWN") : "UNKNOWN"}`, elements.marketStructurePanel);
  setTextTracked("marketStructureEcosystems", elements.marketStructureEcosystems, affectedEcosystems.length
    ? `Ecosystems: ${affectedEcosystems.join(", ")}`
    : "Ecosystems: Awaiting cognition.", elements.marketStructurePanel);
  elements.marketStructureStrip.style.width = `${structurePercent(state)}%`;
  elements.marketStructureSymbols.innerHTML = hasStructure && affectedSymbols.length
    ? renderSimpleSymbolPills(affectedSymbols)
    : hasStructure ? "No backend affected symbols." : "Awaiting market structure cognition.";
  elements.marketStructureWarnings.textContent = hasStructure && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasStructure ? "No backend structure warnings." : "Awaiting market structure cognition.";

  clearStructureClasses(elements.marketStructurePanel);
  const className = hasStructure ? structureClass(state) : "";
  if (className) elements.marketStructurePanel.classList.add(className);
  applyTone(elements.marketStructureState, hasStructure ? toneForStructure(state) : "gray");
}

function regimeClass(state) {
  return {
    STABLE: "regime-stable",
    CAUTION: "regime-caution",
    UNSTABLE: "regime-unstable",
    RECOVERING: "regime-recovering",
    FRAGMENTED: "regime-fragmented",
    TRANSITIONAL: "regime-transitional"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function clearRegimeClasses(element) {
  element.classList.remove(
    "regime-stable",
    "regime-caution",
    "regime-unstable",
    "regime-recovering",
    "regime-fragmented",
    "regime-transitional"
  );
}

function paintRegimeTransition(regime) {
  const affectedEcosystems = Array.isArray(regime?.affectedEcosystems) ? regime.affectedEcosystems : [];
  const warnings = Array.isArray(regime?.warnings) ? regime.warnings : [];
  const hasRegime = regime && !isAwaiting(regime.summary);
  const state = hasRegime ? asText(regime.regimeState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("regimeState", elements.regimeState, state, elements.regimeTransitionPanel);
  setTextTracked("regimeTransitionSummary", elements.regimeTransitionSummary, hasRegime
    ? asText(regime.summary, "Awaiting regime transition cognition.")
    : "Awaiting regime transition cognition.", elements.regimeTransitionPanel);
  setTextTracked("regimeTransitionState", elements.regimeTransitionState, `Transition: ${hasRegime ? asText(regime.transitionState, "UNKNOWN") : "UNKNOWN"}`, elements.regimeTransitionPanel);
  setTextTracked("regimeTransitionRisk", elements.regimeTransitionRisk, `Risk: ${hasRegime ? asText(regime.transitionRisk, "UNKNOWN") : "UNKNOWN"}`, elements.regimeTransitionPanel);
  elements.regimeAffectedEcosystems.innerHTML = hasRegime && affectedEcosystems.length
    ? renderRegionChips(affectedEcosystems)
    : hasRegime ? "No backend affected ecosystems." : "Awaiting regime transition cognition.";
  elements.regimeTransitionWarnings.textContent = hasRegime && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasRegime ? "No backend regime warnings." : "Awaiting regime transition cognition.";

  clearRegimeClasses(elements.regimeTransitionPanel);
  const className = hasRegime ? regimeClass(state) : "";
  if (className) elements.regimeTransitionPanel.classList.add(className);
  applyTone(elements.regimeState, hasRegime ? toneForRegime(state) : "gray");
  applyTone(elements.regimeTransitionRisk, hasRegime ? toneForRisk(regime.transitionRisk) : "gray");
}

function flowClass(state) {
  return {
    ACCUMULATING: "flow-accumulating",
    DISTRIBUTING: "flow-distributing",
    ROTATING: "flow-rotating",
    DEFENSIVE: "flow-defensive",
    FRAGMENTED: "flow-fragmented",
    SYNCHRONIZED: "flow-synchronized",
    TRANSITIONAL: "flow-transitional"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function liquidityClass(state) {
  return {
    BALANCED: "liquidity-balanced",
    PRESSURED: "liquidity-pressured",
    COMPRESSED: "liquidity-compressed",
    RELEASING: "liquidity-releasing",
    FRAGMENTED: "liquidity-fragmented",
    STABILIZING: "liquidity-stabilizing"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function clearInstitutionalClasses(element) {
  element.classList.remove(
    "flow-accumulating",
    "flow-distributing",
    "flow-rotating",
    "flow-defensive",
    "flow-fragmented",
    "flow-synchronized",
    "flow-transitional",
    "liquidity-balanced",
    "liquidity-pressured",
    "liquidity-compressed",
    "liquidity-releasing",
    "liquidity-fragmented",
    "liquidity-stabilizing"
  );
}

function strengthPercent(value) {
  return {
    LOW: 24,
    MODERATE: 48,
    HIGH: 72,
    SEVERE: 94
  }[asText(value, "UNKNOWN").toUpperCase()] || 28;
}

function renderFlowClusters(clusters) {
  return clusters
    .map((cluster) => {
      const ecosystem = escapeHtml(cluster.ecosystem || "UNKNOWN");
      const pressure = escapeHtml(cluster.pressure || "UNKNOWN");
      const sync = escapeHtml(cluster.synchronization || "UNKNOWN");
      return `<span class="context-chip ${pressureChipClass(cluster.pressure)}">${ecosystem}<small>${pressure} ${sync}</small></span>`;
    })
    .join("");
}

function paintInstitutionalFlow(flow) {
  const synced = Array.isArray(flow?.synchronizedRegions) ? flow.synchronizedRegions : [];
  const diverging = Array.isArray(flow?.divergingRegions) ? flow.divergingRegions : [];
  const clusters = Array.isArray(flow?.flowClusters) ? flow.flowClusters : [];
  const warnings = Array.isArray(flow?.warnings) ? flow.warnings : [];
  const hasFlow = flow && !isAwaiting(flow.summary);
  const state = hasFlow ? asText(flow.flowState, "UNKNOWN") : "UNKNOWN";
  const strength = hasFlow ? asText(flow.flowStrength, "UNKNOWN") : "UNKNOWN";

  setTextTracked("institutionalFlowState", elements.institutionalFlowState, state, elements.institutionalFlowPanel);
  setTextTracked("institutionalFlowSummary", elements.institutionalFlowSummary, hasFlow
    ? asText(flow.summary, "Awaiting institutional flow cognition.")
    : "Awaiting institutional flow cognition.", elements.institutionalFlowPanel);
  setTextTracked("institutionalFlowStrength", elements.institutionalFlowStrength, `Strength: ${strength}`, elements.institutionalFlowPanel);
  setTextTracked("institutionalSynchronized", elements.institutionalSynchronized, synced.length
    ? `Synchronized: ${synced.join(", ")}`
    : "Synchronized: Awaiting cognition.", elements.institutionalFlowPanel);
  elements.institutionalFlowStrip.style.width = `${strengthPercent(strength)}%`;
  elements.institutionalDiverging.innerHTML = hasFlow && diverging.length
    ? renderRegionChips(diverging)
    : hasFlow ? "No backend diverging regions." : "Awaiting institutional flow cognition.";
  elements.institutionalFlowClusters.innerHTML = hasFlow && clusters.length
    ? renderFlowClusters(clusters)
    : hasFlow ? "No backend flow clusters." : "Awaiting institutional flow cognition.";
  elements.institutionalFlowWarnings.textContent = hasFlow && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasFlow ? "No backend flow warnings." : "Awaiting institutional flow cognition.";

  clearInstitutionalClasses(elements.institutionalFlowPanel);
  const className = hasFlow ? flowClass(state) : "";
  if (className) elements.institutionalFlowPanel.classList.add(className);
  applyTone(elements.institutionalFlowState, hasFlow ? toneForFlow(state) : "gray");
}

function renderPressureZones(zones) {
  return zones
    .map((zone) => {
      const ecosystem = escapeHtml(zone.ecosystem || "UNKNOWN");
      const pressure = escapeHtml(zone.pressure || "UNKNOWN");
      const vulnerability = escapeHtml(zone.vulnerability || "UNKNOWN");
      return `<span class="context-chip ${pressureChipClass(zone.pressure)}">${ecosystem}<small>${pressure} ${vulnerability}</small></span>`;
    })
    .join("");
}

function paintLiquidityPressure(liquidity) {
  const affected = Array.isArray(liquidity?.affectedEcosystems) ? liquidity.affectedEcosystems : [];
  const zones = Array.isArray(liquidity?.pressureZones) ? liquidity.pressureZones : [];
  const warnings = Array.isArray(liquidity?.warnings) ? liquidity.warnings : [];
  const hasLiquidity = liquidity && !isAwaiting(liquidity.summary);
  const state = hasLiquidity ? asText(liquidity.liquidityState, "UNKNOWN") : "UNKNOWN";
  const pressure = hasLiquidity ? asText(liquidity.pressureState, "UNKNOWN") : "UNKNOWN";
  const vulnerability = hasLiquidity ? asText(liquidity.vulnerabilityLevel, "UNKNOWN") : "UNKNOWN";

  setTextTracked("liquidityState", elements.liquidityState, state, elements.liquidityPressurePanel);
  setTextTracked("liquidityPressureSummary", elements.liquidityPressureSummary, hasLiquidity
    ? asText(liquidity.summary, "Awaiting liquidity pressure cognition.")
    : "Awaiting liquidity pressure cognition.", elements.liquidityPressurePanel);
  setTextTracked("liquidityPressureState", elements.liquidityPressureState, `Pressure: ${pressure}`, elements.liquidityPressurePanel);
  setTextTracked("liquidityVulnerability", elements.liquidityVulnerability, `Vulnerability: ${vulnerability}`, elements.liquidityPressurePanel);
  elements.liquidityPressureBar.style.width = `${strengthPercent(vulnerability)}%`;
  elements.liquidityAffected.innerHTML = hasLiquidity && affected.length
    ? renderRegionChips(affected)
    : hasLiquidity ? "No backend affected ecosystems." : "Awaiting liquidity pressure cognition.";
  elements.liquidityPressureZones.innerHTML = hasLiquidity && zones.length
    ? renderPressureZones(zones)
    : hasLiquidity ? "No backend pressure zones." : "Awaiting liquidity pressure cognition.";
  elements.liquidityPressureWarnings.textContent = hasLiquidity && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasLiquidity ? "No backend liquidity warnings." : "Awaiting liquidity pressure cognition.";

  clearInstitutionalClasses(elements.liquidityPressurePanel);
  const className = hasLiquidity ? liquidityClass(state) : "";
  if (className) elements.liquidityPressurePanel.classList.add(className);
  applyTone(elements.liquidityState, hasLiquidity ? toneForLiquidity(state) : "gray");
  applyTone(elements.liquidityVulnerability, hasLiquidity ? toneForRisk(vulnerability) : "gray");
}

function adaptiveClass(state) {
  return {
    ALIGNED: "adaptive-aligned",
    SUPPRESSED: "adaptive-suppressed",
    CONFLICTED: "adaptive-conflicted",
    REINFORCED: "adaptive-reinforced",
    UNSTABLE: "adaptive-unstable",
    TRANSITIONAL: "adaptive-transitional"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function consensusClass(state) {
  return {
    FULL_CONSENSUS: "consensus-full",
    PARTIAL_CONSENSUS: "consensus-partial",
    CONFLICTED: "consensus-conflicted",
    FAILSAFE_PRIORITY: "consensus-failsafe",
    UNSTABLE: "consensus-unstable"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function clearAdaptiveClasses(element) {
  element.classList.remove(
    "adaptive-aligned",
    "adaptive-suppressed",
    "adaptive-conflicted",
    "adaptive-reinforced",
    "adaptive-unstable",
    "adaptive-transitional",
    "consensus-full",
    "consensus-partial",
    "consensus-conflicted",
    "consensus-failsafe",
    "consensus-unstable"
  );
}

function renderWarningChips(warnings) {
  return warnings
    .map((warning) => `<span class="context-chip">${escapeHtml(warning)}</span>`)
    .join("");
}

function paintAdaptiveSignalIntelligence(signal) {
  const warnings = Array.isArray(signal?.warnings) ? signal.warnings : [];
  const hasSignal = signal && !isAwaiting(signal.summary);
  const state = hasSignal ? asText(signal.signalState, "UNKNOWN") : "UNKNOWN";
  const weight = hasSignal ? clampPercent(Number(signal.confidenceWeight) * 100) : 0;

  setTextTracked("adaptiveSignalState", elements.adaptiveSignalState, state, elements.adaptiveSignalPanel);
  setTextTracked("adaptiveSignalSummary", elements.adaptiveSignalSummary, hasSignal
    ? asText(signal.summary, "Awaiting adaptive signal cognition.")
    : "Awaiting adaptive signal cognition.", elements.adaptiveSignalPanel);
  setTextTracked("adaptiveSignalTrust", elements.adaptiveSignalTrust, `Trust: ${hasSignal ? asText(signal.signalTrust, "UNKNOWN") : "UNKNOWN"}`, elements.adaptiveSignalPanel);
  setTextTracked("adaptiveSuppression", elements.adaptiveSuppression, `Suppression: ${hasSignal ? asText(signal.suppressionLevel, "NONE") : "NONE"}`, elements.adaptiveSignalPanel);
  setTextTracked("adaptiveReinforcement", elements.adaptiveReinforcement, `Reinforcement: ${hasSignal ? asText(signal.reinforcementLevel, "NONE") : "NONE"}`, elements.adaptiveSignalPanel);
  setTextTracked("adaptiveCoherence", elements.adaptiveCoherence, `Coherence: ${hasSignal ? asText(signal.coherenceLevel, "UNKNOWN") : "UNKNOWN"}`, elements.adaptiveSignalPanel);
  setTextTracked("adaptiveWeightLabel", elements.adaptiveWeightLabel, `Weight: ${Math.round(weight)}%`, elements.adaptiveSignalPanel);
  elements.adaptiveConfidenceWeight.style.width = `${weight}%`;
  elements.adaptiveSignalWarnings.innerHTML = hasSignal && warnings.length
    ? renderWarningChips(warnings)
    : hasSignal ? "No backend suppression warnings." : "Awaiting adaptive signal cognition.";

  clearAdaptiveClasses(elements.adaptiveSignalPanel);
  const className = hasSignal ? adaptiveClass(state) : "";
  if (className) elements.adaptiveSignalPanel.classList.add(className);
  applyTone(elements.adaptiveSignalState, hasSignal ? toneForAdaptiveSignal(state) : "gray");
  applyTone(elements.adaptiveSignalTrust, hasSignal ? toneForRisk(signal.signalTrust) : "gray");
}

function renderParticipatingBrains(brains) {
  return brains
    .map((brain) => {
      const name = escapeHtml(brain.name || "UNKNOWN");
      const status = escapeHtml(brain.status || "UNKNOWN");
      return `<span class="context-chip">${name}<small>${status}</small></span>`;
    })
    .join("");
}

function paintBrainConsensus(consensus) {
  const brains = Array.isArray(consensus?.participatingBrains) ? consensus.participatingBrains : [];
  const warnings = Array.isArray(consensus?.warnings) ? consensus.warnings : [];
  const hasConsensus = consensus && !isAwaiting(consensus.summary);
  const state = hasConsensus ? asText(consensus.consensusState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("brainConsensusState", elements.brainConsensusState, state, elements.brainConsensusPanel);
  setTextTracked("brainConsensusSummary", elements.brainConsensusSummary, hasConsensus
    ? asText(consensus.summary, "Awaiting cross-brain consensus cognition.")
    : "Awaiting cross-brain consensus cognition.", elements.brainConsensusPanel);
  setTextTracked("brainAgreementStrength", elements.brainAgreementStrength, `Agreement: ${hasConsensus ? asText(consensus.agreementStrength, "UNKNOWN") : "UNKNOWN"}`, elements.brainConsensusPanel);
  setTextTracked("brainDivergenceRisk", elements.brainDivergenceRisk, `Divergence: ${hasConsensus ? asText(consensus.divergenceRisk, "UNKNOWN") : "UNKNOWN"}`, elements.brainConsensusPanel);
  elements.participatingBrains.innerHTML = hasConsensus && brains.length
    ? renderParticipatingBrains(brains)
    : "Awaiting cross-brain consensus cognition.";
  elements.brainConsensusWarnings.textContent = hasConsensus && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasConsensus ? "No backend consensus warnings." : "Awaiting cross-brain consensus cognition.";

  clearAdaptiveClasses(elements.brainConsensusPanel);
  const className = hasConsensus ? consensusClass(state) : "";
  if (className) elements.brainConsensusPanel.classList.add(className);
  applyTone(elements.brainConsensusState, hasConsensus ? toneForConsensus(state) : "gray");
  applyTone(elements.brainDivergenceRisk, hasConsensus ? toneForRisk(consensus.divergenceRisk) : "gray");
}

function temporalClass(state) {
  return {
    STABLE_MEMORY: "temporal-stable",
    RECURRING_PATTERN: "temporal-recurring",
    AGING_CONTEXT: "temporal-aging",
    VOLATILE_HISTORY: "temporal-volatile",
    INSUFFICIENT_HISTORY: "temporal-insufficient"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function recurrenceClass(state) {
  return {
    NO_RECURRENCE: "recurrence-none",
    WEAK_RECURRENCE: "recurrence-weak",
    MODERATE_RECURRENCE: "recurrence-moderate",
    STRONG_RECURRENCE: "recurrence-strong"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function contextAgeClass(state) {
  return {
    FRESH: "context-fresh",
    AGING: "context-aging",
    STALE: "context-stale",
    INSUFFICIENT: "context-insufficient"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function sequenceClass(state) {
  return {
    ACCELERATING: "sequence-accelerating",
    COOLING: "sequence-cooling",
    RECOVERING: "sequence-recovering",
    ESCALATING: "sequence-escalating",
    STABLE_SEQUENCE: "sequence-stable",
    UNSTABLE_SEQUENCE: "sequence-unstable"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function causalityClass(state) {
  return {
    STABLE_CAUSALITY: "causality-stable",
    EMERGING_CAUSALITY: "causality-emerging",
    FRACTURED_CAUSALITY: "causality-fractured",
    VOLATILE_CAUSALITY: "causality-volatile"
  }[asText(state, "UNKNOWN").toUpperCase()] || "";
}

function learningClass(value) {
  const tone = toneForLearning(value);
  return `learning-${tone}`;
}

function clearLearningClasses(element) {
  element.classList.remove(
    "learning-green",
    "learning-gold",
    "learning-teal",
    "learning-blue",
    "learning-orange",
    "learning-red",
    "learning-gray"
  );
}

function clearTemporalClasses(element) {
  element.classList.remove(
    "temporal-stable",
    "temporal-recurring",
    "temporal-aging",
    "temporal-volatile",
    "temporal-insufficient",
    "recurrence-none",
    "recurrence-weak",
    "recurrence-moderate",
    "recurrence-strong",
    "context-fresh",
    "context-aging",
    "context-stale",
    "context-insufficient",
    "sequence-accelerating",
    "sequence-cooling",
    "sequence-recovering",
    "sequence-escalating",
    "sequence-stable",
    "sequence-unstable",
    "causality-stable",
    "causality-emerging",
    "causality-fractured",
    "causality-volatile"
  );
}

function memoryDepthPercent(depth) {
  return {
    LOW: 25,
    MODERATE: 50,
    HIGH: 76,
    DEEP: 100
  }[asText(depth, "UNKNOWN").toUpperCase()] || 8;
}

function levelPercent(level) {
  return {
    LOW: 25,
    MODERATE: 52,
    HIGH: 78,
    SEVERE: 100
  }[asText(level, "UNKNOWN").toUpperCase()] || 8;
}

function renderTemporalPatternChips(patterns) {
  return patterns
    .map((pattern) => {
      const type = escapeHtml(pattern.type || pattern.theme || "Context");
      const value = escapeHtml(pattern.value || "UNKNOWN");
      const count = Number.isFinite(Number(pattern.count)) ? Number(pattern.count) : 0;
      return `<span class="context-chip">${value}<small>${type} x${count}</small></span>`;
    })
    .join("");
}

function renderTextChips(items) {
  return items
    .map((item) => `<span class="context-chip">${escapeHtml(asText(item, "UNKNOWN"))}</span>`)
    .join("");
}

function paintTemporalMemory(memory) {
  const patterns = Array.isArray(memory?.recurringPatterns) ? memory.recurringPatterns : [];
  const horizon = Array.isArray(memory?.longHorizonSignals) ? memory.longHorizonSignals : [];
  const warnings = Array.isArray(memory?.warnings) ? memory.warnings : [];
  const aging = Array.isArray(memory?.agingContexts) ? memory.agingContexts : [];
  const hasMemory = memory && !isAwaiting(memory.summary);
  const state = hasMemory ? asText(memory.temporalState, "UNKNOWN") : "UNKNOWN";
  const depth = hasMemory ? asText(memory.memoryDepth, "UNKNOWN") : "UNKNOWN";

  setTextTracked("temporalMemoryState", elements.temporalMemoryState, state, elements.temporalMemoryPanel);
  setTextTracked("temporalMemorySummary", elements.temporalMemorySummary, hasMemory
    ? asText(memory.summary, "Awaiting temporal memory cognition.")
    : "Awaiting temporal memory cognition.", elements.temporalMemoryPanel);
  setTextTracked("memoryDepthLabel", elements.memoryDepthLabel, `Memory depth: ${depth}`, elements.temporalMemoryPanel);
  setTextTracked("temporalPatternCount", elements.temporalPatternCount, `Patterns: ${patterns.length}`, elements.temporalMemoryPanel);
  elements.memoryDepthBar.style.width = `${hasMemory ? memoryDepthPercent(depth) : 0}%`;
  elements.temporalRecurringPatterns.innerHTML = hasMemory && patterns.length
    ? renderTemporalPatternChips(patterns)
    : "Awaiting temporal memory cognition.";
  elements.temporalLongHorizon.innerHTML = hasMemory && horizon.length
    ? renderTemporalPatternChips(horizon)
    : hasMemory ? "No long-horizon recurrence visible." : "Awaiting temporal memory cognition.";
  elements.temporalMemoryWarnings.textContent = hasMemory && (warnings.length || aging.length)
    ? warnings.concat(aging).map((item) => asText(item)).join(", ")
    : hasMemory ? "No backend temporal warnings." : "Awaiting temporal memory cognition.";

  clearTemporalClasses(elements.temporalMemoryPanel);
  const className = hasMemory ? temporalClass(state) : "";
  if (className) elements.temporalMemoryPanel.classList.add(className);
  applyTone(elements.temporalMemoryState, hasMemory ? toneForTemporal(state) : "gray");
}

function paintRecurrence(recurrence) {
  const themes = Array.isArray(recurrence?.recurringThemes) ? recurrence.recurringThemes : [];
  const affected = Array.isArray(recurrence?.affectedEcosystems) ? recurrence.affectedEcosystems : [];
  const warnings = Array.isArray(recurrence?.warnings) ? recurrence.warnings : [];
  const hasRecurrence = recurrence && !isAwaiting(recurrence.summary);
  const state = hasRecurrence ? asText(recurrence.recurrenceState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("recurrenceState", elements.recurrenceState, state, elements.recurrencePanel);
  setTextTracked("recurrenceSummary", elements.recurrenceSummary, hasRecurrence
    ? asText(recurrence.summary, "Awaiting recurrence cognition.")
    : "Awaiting recurrence cognition.", elements.recurrencePanel);
  setTextTracked("recurrenceStrength", elements.recurrenceStrength, `Strength: ${hasRecurrence ? asText(recurrence.recurrenceStrength, "UNKNOWN") : "UNKNOWN"}`, elements.recurrencePanel);
  setTextTracked("recurrenceAffected", elements.recurrenceAffected, `Affected: ${hasRecurrence && affected.length ? affected.join(", ") : "Awaiting cognition."}`, elements.recurrencePanel);
  elements.recurrenceThemes.innerHTML = hasRecurrence && themes.length
    ? renderTemporalPatternChips(themes)
    : hasRecurrence ? "No recurring cognition themes visible." : "Awaiting recurrence cognition.";
  elements.recurrenceWarnings.textContent = hasRecurrence && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasRecurrence ? "No backend recurrence warnings." : "Awaiting recurrence cognition.";

  clearTemporalClasses(elements.recurrencePanel);
  const className = hasRecurrence ? recurrenceClass(state) : "";
  if (className) elements.recurrencePanel.classList.add(className);
  applyTone(elements.recurrenceState, hasRecurrence ? toneForRecurrence(state) : "gray");
}

function paintContextAging(contextAging) {
  const staleContexts = Array.isArray(contextAging?.staleContexts) ? contextAging.staleContexts : [];
  const warnings = Array.isArray(contextAging?.warnings) ? contextAging.warnings : [];
  const hasAging = contextAging && !isAwaiting(contextAging.summary);
  const state = hasAging ? asText(contextAging.contextAgeState, "UNKNOWN") : "UNKNOWN";
  const freshness = hasAging ? clampPercent(Number(contextAging.freshnessScore) * 100) : 0;

  setTextTracked("contextAgeState", elements.contextAgeState, state, elements.contextAgingPanel);
  setTextTracked("contextAgingSummary", elements.contextAgingSummary, hasAging
    ? asText(contextAging.summary, "Awaiting context aging cognition.")
    : "Awaiting context aging cognition.", elements.contextAgingPanel);
  setTextTracked("contextFreshnessScore", elements.contextFreshnessScore, `Freshness: ${Math.round(freshness)}%`, elements.contextAgingPanel);
  elements.contextFreshnessBar.style.width = `${freshness}%`;
  elements.staleContexts.innerHTML = hasAging && staleContexts.length
    ? renderTextChips(staleContexts)
    : hasAging ? "No stale backend contexts visible." : "Awaiting context aging cognition.";
  elements.contextAgingWarnings.textContent = hasAging && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasAging ? "No backend context aging warnings." : "Awaiting context aging cognition.";

  clearTemporalClasses(elements.contextAgingPanel);
  const className = hasAging ? contextAgeClass(state) : "";
  if (className) elements.contextAgingPanel.classList.add(className);
  applyTone(elements.contextAgeState, hasAging ? toneForContextAge(state) : "gray");
}

function renderSequenceNodes(sequences) {
  return sequences
    .map((sequence) => {
      const label = escapeHtml(sequence.label || `${sequence.from || "UNKNOWN"} to ${sequence.to || "UNKNOWN"}`);
      const type = escapeHtml(sequence.type || "sequence");
      const count = Number.isFinite(Number(sequence.count)) ? Number(sequence.count) : 0;
      return `<div class="sequence-node"><strong>${label}</strong><span>${type} x${count}</span></div>`;
    })
    .join("");
}

function renderCausalityNodes(chains) {
  return chains
    .map((chain) => {
      const driver = escapeHtml(chain.driver || "UNKNOWN");
      const flow = escapeHtml(`${chain.from || "UNKNOWN"} to ${chain.to || "UNKNOWN"}`);
      const effect = escapeHtml(chain.effect || "UNKNOWN");
      return `<div class="causality-node"><strong>${driver}</strong><span>${flow} | ${effect}</span></div>`;
    })
    .join("");
}

function paintTemporalSequences(sequence) {
  const activeSequences = Array.isArray(sequence?.activeSequences) ? sequence.activeSequences : [];
  const transitionChains = Array.isArray(sequence?.transitionChains) ? sequence.transitionChains : [];
  const warnings = Array.isArray(sequence?.warnings) ? sequence.warnings : [];
  const hasSequence = sequence && !isAwaiting(sequence.summary);
  const state = hasSequence ? asText(sequence.sequenceState, "UNKNOWN") : "UNKNOWN";
  const momentum = hasSequence ? asText(sequence.progressionMomentum, "UNKNOWN") : "UNKNOWN";

  setTextTracked("temporalSequenceState", elements.temporalSequenceState, state, elements.temporalSequencePanel);
  setTextTracked("temporalSequenceSummary", elements.temporalSequenceSummary, hasSequence
    ? asText(sequence.summary, "Awaiting temporal sequence cognition.")
    : "Awaiting temporal sequence cognition.", elements.temporalSequencePanel);
  setTextTracked("progressionMomentum", elements.progressionMomentum, `Momentum: ${momentum}`, elements.temporalSequencePanel);
  setTextTracked("sequenceConfidence", elements.sequenceConfidence, `Confidence: ${hasSequence ? asText(sequence.sequenceConfidence, "UNKNOWN") : "UNKNOWN"}`, elements.temporalSequencePanel);
  elements.progressionMomentumBar.style.width = `${hasSequence ? levelPercent(momentum) : 0}%`;
  elements.activeSequences.innerHTML = hasSequence && activeSequences.length
    ? renderSequenceNodes(activeSequences)
    : "Awaiting temporal sequence cognition.";
  elements.transitionChains.innerHTML = hasSequence && transitionChains.length
    ? renderTemporalPatternChips(transitionChains)
    : hasSequence ? "No transition chains visible." : "Awaiting temporal sequence cognition.";
  elements.temporalSequenceWarnings.textContent = hasSequence && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasSequence ? "No backend sequence warnings." : "Awaiting temporal sequence cognition.";

  clearTemporalClasses(elements.temporalSequencePanel);
  const className = hasSequence ? sequenceClass(state) : "";
  if (className) elements.temporalSequencePanel.classList.add(className);
  applyTone(elements.temporalSequenceState, hasSequence ? toneForSequence(state) : "gray");
}

function paintEnvironmentalCausality(causality) {
  const drivers = Array.isArray(causality?.dominantDrivers) ? causality.dominantDrivers : [];
  const chains = Array.isArray(causality?.influenceChains) ? causality.influenceChains : [];
  const regions = Array.isArray(causality?.affectedRegions) ? causality.affectedRegions : [];
  const warnings = Array.isArray(causality?.warnings) ? causality.warnings : [];
  const hasCausality = causality && !isAwaiting(causality.summary);
  const state = hasCausality ? asText(causality.causalityState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("causalityState", elements.causalityState, state, elements.environmentCausalityPanel);
  setTextTracked("causalitySummary", elements.causalitySummary, hasCausality
    ? asText(causality.summary, "Awaiting environmental causality cognition.")
    : "Awaiting environmental causality cognition.", elements.environmentCausalityPanel);
  setTextTracked("causalityConfidence", elements.causalityConfidence, `Causality confidence: ${hasCausality ? asText(causality.causalityConfidence, "UNKNOWN") : "UNKNOWN"}`, elements.environmentCausalityPanel);
  setTextTracked("affectedRegions", elements.affectedRegions, `Regions: ${hasCausality && regions.length ? regions.join(", ") : "Awaiting cognition."}`, elements.environmentCausalityPanel);
  elements.dominantDrivers.innerHTML = hasCausality && drivers.length
    ? drivers.map((driver) => `<span class="context-chip">${escapeHtml(driver.driver || "UNKNOWN")}<small>${escapeHtml(driver.reason || "Backend driver")} x${Number(driver.count) || 0}</small></span>`).join("")
    : "Awaiting environmental causality cognition.";
  elements.influenceChains.innerHTML = hasCausality && chains.length
    ? renderCausalityNodes(chains)
    : hasCausality ? "No influence chains visible." : "Awaiting environmental causality cognition.";
  elements.causalityWarnings.textContent = hasCausality && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasCausality ? "No backend causality warnings." : "Awaiting environmental causality cognition.";

  clearTemporalClasses(elements.environmentCausalityPanel);
  const className = hasCausality ? causalityClass(state) : "";
  if (className) elements.environmentCausalityPanel.classList.add(className);
  applyTone(elements.causalityState, hasCausality ? toneForCausality(state) : "gray");
}

function renderThresholdChips(thresholds) {
  return Object.entries(thresholds || {})
    .map(([key, value]) => `<span class="context-chip">${escapeHtml(key)}<small>${escapeHtml(asText(value, "UNKNOWN"))}</small></span>`)
    .join("");
}

function renderLearningFactors(factors) {
  return factors
    .map((factor) => `<span class="context-chip">${escapeHtml(factor.factor || "UNKNOWN")}<small>${escapeHtml(factor.weight || "UNKNOWN")}</small></span>`)
    .join("");
}

function paintLearningPanel(panel, badge, state, hasData) {
  clearLearningClasses(panel);
  const className = hasData ? learningClass(state) : "learning-gray";
  panel.classList.add(className);
  applyTone(badge, hasData ? toneForLearning(state) : "gray");
}

function paintAdaptiveThresholds(thresholds) {
  const reasons = Array.isArray(thresholds?.adjustmentReasons) ? thresholds.adjustmentReasons : [];
  const warnings = Array.isArray(thresholds?.warnings) ? thresholds.warnings : [];
  const hasThresholds = thresholds && !isAwaiting(thresholds.summary);
  const state = hasThresholds ? asText(thresholds.thresholdState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("thresholdState", elements.thresholdState, state, elements.adaptiveThresholdPanel);
  setTextTracked("thresholdSummary", elements.thresholdSummary, hasThresholds
    ? asText(thresholds.summary, "Awaiting adaptive threshold cognition.")
    : "Awaiting adaptive threshold cognition.", elements.adaptiveThresholdPanel);
  elements.adjustedThresholds.innerHTML = hasThresholds && Object.keys(thresholds.adjustedThresholds || {}).length
    ? renderThresholdChips(thresholds.adjustedThresholds)
    : "Awaiting adaptive threshold cognition.";
  elements.thresholdReasons.textContent = hasThresholds && reasons.length
    ? reasons.map((item) => asText(item)).join(", ")
    : hasThresholds ? "No threshold adjustment reasons visible." : "Awaiting adaptive threshold cognition.";
  elements.thresholdWarnings.textContent = hasThresholds && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasThresholds ? "No backend threshold warnings." : "Awaiting adaptive threshold cognition.";
  paintLearningPanel(elements.adaptiveThresholdPanel, elements.thresholdState, state, hasThresholds);
}

function paintReinforcementWeighting(weighting) {
  const reinforced = Array.isArray(weighting?.reinforcedFactors) ? weighting.reinforcedFactors : [];
  const weakened = Array.isArray(weighting?.weakenedFactors) ? weighting.weakenedFactors : [];
  const warnings = Array.isArray(weighting?.warnings) ? weighting.warnings : [];
  const hasWeighting = weighting && !isAwaiting(weighting.summary);
  const state = hasWeighting ? asText(weighting.reinforcementState, "UNKNOWN") : "UNKNOWN";
  const weight = hasWeighting ? clampPercent(Number(weighting.learningWeight) * 100) : 0;

  setTextTracked("reinforcementState", elements.reinforcementState, state, elements.reinforcementPanel);
  setTextTracked("reinforcementSummary", elements.reinforcementSummary, hasWeighting
    ? asText(weighting.summary, "Awaiting reinforcement weighting cognition.")
    : "Awaiting reinforcement weighting cognition.", elements.reinforcementPanel);
  setTextTracked("learningWeightLabel", elements.learningWeightLabel, `Learning weight: ${Math.round(weight)}%`, elements.reinforcementPanel);
  elements.learningWeightBar.style.width = `${weight}%`;
  elements.reinforcedFactors.innerHTML = hasWeighting && reinforced.length
    ? renderLearningFactors(reinforced)
    : "Awaiting reinforcement weighting cognition.";
  elements.weakenedFactors.innerHTML = hasWeighting && weakened.length
    ? renderLearningFactors(weakened)
    : hasWeighting ? "No weakened factors visible." : "Awaiting reinforcement weighting cognition.";
  elements.reinforcementWarnings.textContent = hasWeighting && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasWeighting ? "No backend reinforcement warnings." : "Awaiting reinforcement weighting cognition.";
  paintLearningPanel(elements.reinforcementPanel, elements.reinforcementState, state, hasWeighting);
}

function paintCognitionCalibration(calibration) {
  const warnings = Array.isArray(calibration?.warnings) ? calibration.warnings : [];
  const hasCalibration = calibration && !isAwaiting(calibration.summary);
  const state = hasCalibration ? asText(calibration.calibrationState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("calibrationState", elements.calibrationState, state, elements.calibrationPanel);
  setTextTracked("calibrationSummary", elements.calibrationSummary, hasCalibration
    ? asText(calibration.summary, "Awaiting cognition calibration.")
    : "Awaiting cognition calibration.", elements.calibrationPanel);
  setTextTracked("confidenceCalibration", elements.confidenceCalibration, `Confidence: ${hasCalibration ? asText(calibration.confidenceCalibration, "UNKNOWN") : "UNKNOWN"}`, elements.calibrationPanel);
  setTextTracked("suppressionCalibration", elements.suppressionCalibration, `Suppression: ${hasCalibration ? asText(calibration.suppressionCalibration, "UNKNOWN") : "UNKNOWN"}`, elements.calibrationPanel);
  setTextTracked("consensusCalibration", elements.consensusCalibration, `Consensus: ${hasCalibration ? asText(calibration.consensusCalibration, "UNKNOWN") : "UNKNOWN"}`, elements.calibrationPanel);
  elements.calibrationWarnings.textContent = hasCalibration && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasCalibration ? "No backend calibration warnings." : "Awaiting cognition calibration.";
  paintLearningPanel(elements.calibrationPanel, elements.calibrationState, state, hasCalibration);
}

function paintLearningGuardrails(guardrails) {
  const blocked = Array.isArray(guardrails?.blockedReasons) ? guardrails.blockedReasons : [];
  const warnings = Array.isArray(guardrails?.warnings) ? guardrails.warnings : [];
  const hasGuardrails = guardrails && !isAwaiting(guardrails.summary);
  const state = hasGuardrails ? asText(guardrails.guardrailState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("guardrailState", elements.guardrailState, state, elements.learningGuardrailsPanel);
  setTextTracked("guardrailSummary", elements.guardrailSummary, hasGuardrails
    ? asText(guardrails.summary, "Awaiting learning guardrail cognition.")
    : "Awaiting learning guardrail cognition.", elements.learningGuardrailsPanel);
  setTextTracked("learningAllowed", elements.learningAllowed, `Learning allowed: ${hasGuardrails ? String(guardrails.learningAllowed === true).toUpperCase() : "UNKNOWN"}`, elements.learningGuardrailsPanel);
  elements.blockedReasons.innerHTML = hasGuardrails && blocked.length
    ? renderTextChips(blocked)
    : hasGuardrails ? "No blocked reasons visible." : "Awaiting learning guardrail cognition.";
  elements.guardrailWarnings.textContent = hasGuardrails && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasGuardrails ? "No backend guardrail warnings." : "Awaiting learning guardrail cognition.";
  paintLearningPanel(elements.learningGuardrailsPanel, elements.guardrailState, state, hasGuardrails);
}

function setCopilotMode(mode) {
  copilotMode = mode;
  elements.aiCopilotSection.classList.remove("copilot-compact", "copilot-analyst", "copilot-expanded");
  elements.aiCopilotSection.classList.add(`copilot-${mode}`);
  [
    ["compact", elements.copilotCompactMode],
    ["analyst", elements.copilotAnalystMode],
    ["expanded", elements.copilotExpandedMode]
  ].forEach(([value, button]) => {
    button.classList.toggle("active", value === mode);
  });
}

function setRetentionMode(mode) {
  retentionMode = mode;
  elements.persistentMemorySection.classList.remove("retention-compact", "retention-balanced", "retention-extended");
  elements.persistentMemorySection.classList.add(`retention-${mode}`);
  [
    ["compact", elements.retentionCompactMode],
    ["balanced", elements.retentionBalancedMode],
    ["extended", elements.retentionExtendedMode]
  ].forEach(([value, button]) => {
    button.classList.toggle("active", value === mode);
  });
}

function clearCopilotPanelClasses(panel) {
  panel.classList.remove("copilot-active", "copilot-degraded");
}

function paintCopilotPanel(panel, badge, state, hasData) {
  clearCopilotPanelClasses(panel);
  if (hasData && ["ACTIVE", "CLEAR"].includes(asText(state, "UNKNOWN").toUpperCase())) {
    panel.classList.add("copilot-active");
  }
  if (hasData && ["DEGRADED", "FRAGMENTED"].includes(asText(state, "UNKNOWN").toUpperCase())) {
    panel.classList.add("copilot-degraded");
  }
  applyTone(badge, hasData ? toneForCopilot(state) : "gray");
}

function paintCopilotNarration(copilot) {
  const warnings = Array.isArray(copilot?.warnings) ? copilot.warnings : [];
  const hasCopilot = copilot && !isAwaiting(copilot.summary);
  const state = hasCopilot ? asText(copilot.narrationState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("copilotNarrationState", elements.copilotNarrationState, state, elements.copilotNarrationPanel);
  setTextTracked("copilotCognitionSummary", elements.copilotCognitionSummary, hasCopilot ? asText(copilot.cognitionSummary, "Awaiting AI Copilot narration.") : "Awaiting AI Copilot narration.", elements.copilotNarrationPanel);
  setTextTracked("copilotEnvironmentSummary", elements.copilotEnvironmentSummary, hasCopilot ? asText(copilot.environmentSummary, "Awaiting AI Copilot narration.") : "Awaiting AI Copilot narration.", elements.copilotNarrationPanel);
  setTextTracked("copilotConsensusSummary", elements.copilotConsensusSummary, hasCopilot ? asText(copilot.consensusSummary, "Awaiting AI Copilot narration.") : "Awaiting AI Copilot narration.", elements.copilotNarrationPanel);
  setTextTracked("copilotRiskSummary", elements.copilotRiskSummary, hasCopilot ? asText(copilot.riskSummary, "Awaiting AI Copilot narration.") : "Awaiting AI Copilot narration.", elements.copilotNarrationPanel);
  setTextTracked("copilotReplaySummary", elements.copilotReplaySummary, hasCopilot ? asText(copilot.replaySummary, "Awaiting AI Copilot narration.") : "Awaiting AI Copilot narration.", elements.copilotNarrationPanel);
  elements.copilotWarnings.textContent = hasCopilot && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasCopilot ? "No backend Copilot warnings." : "Awaiting AI Copilot narration.";
  paintCopilotPanel(elements.copilotNarrationPanel, elements.copilotNarrationState, state, hasCopilot);
}

function renderReasoningChains(chains) {
  return chains.map((chain) => {
    return `<div class="reasoning-chain"><strong>${escapeHtml(chain.factor || "UNKNOWN")}</strong><span>${escapeHtml(chain.reason || "Awaiting explainability cognition.")} ${escapeHtml(chain.effect || "")}</span></div>`;
  }).join("");
}

function paintExplainability(explainability) {
  const chains = Array.isArray(explainability?.reasoningChains) ? explainability.reasoningChains : [];
  const dominant = Array.isArray(explainability?.dominantFactors) ? explainability.dominantFactors : [];
  const suppression = Array.isArray(explainability?.suppressionReasons) ? explainability.suppressionReasons : [];
  const reinforcement = Array.isArray(explainability?.reinforcementReasons) ? explainability.reinforcementReasons : [];
  const warnings = Array.isArray(explainability?.warnings) ? explainability.warnings : [];
  const hasExplainability = explainability && !isAwaiting(explainability.summary);
  const state = hasExplainability ? asText(explainability.explainabilityState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("explainabilityState", elements.explainabilityState, state, elements.explainabilityPanel);
  setTextTracked("explainabilitySummary", elements.explainabilitySummary, hasExplainability ? asText(explainability.summary, "Awaiting explainability cognition.") : "Awaiting explainability cognition.", elements.explainabilityPanel);
  elements.dominantFactorsPanel.innerHTML = hasExplainability && dominant.length ? renderTextChips(dominant) : "Awaiting explainability cognition.";
  elements.reasoningChains.innerHTML = hasExplainability && chains.length ? renderReasoningChains(chains) : "Awaiting explainability cognition.";
  elements.suppressionReasons.innerHTML = hasExplainability && suppression.length ? renderTextChips(suppression) : "Awaiting explainability cognition.";
  elements.reinforcementReasons.innerHTML = hasExplainability && reinforcement.length ? renderTextChips(reinforcement) : "Awaiting explainability cognition.";
  elements.explainabilityWarnings.textContent = hasExplainability && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasExplainability ? "No backend explainability warnings." : "Awaiting explainability cognition.";
  paintCopilotPanel(elements.explainabilityPanel, elements.explainabilityState, state, hasExplainability);
}

function renderFeedEvents(events) {
  return events.map((event) => {
    const severity = asText(event.severity, "LOW").toLowerCase();
    const timestamp = escapeHtml(asText(event.timestamp, "UNKNOWN"));
    return `<div class="feed-event severity-${severity}"><strong>${escapeHtml(event.type || "INFO")}</strong><span>${timestamp}</span><p>${escapeHtml(event.message || "Awaiting cognition feed.")}</p></div>`;
  }).join("");
}

function paintPriorityFeed(feed) {
  const events = Array.isArray(feed?.events) ? feed.events : [];
  const warnings = Array.isArray(feed?.warnings) ? feed.warnings : [];
  const hasFeed = feed && !isAwaiting(feed.summary);
  const state = hasFeed ? asText(feed.feedState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("priorityFeedState", elements.priorityFeedState, state, elements.priorityFeedPanel);
  setTextTracked("priorityFeedSummary", elements.priorityFeedSummary, hasFeed ? asText(feed.summary, "Awaiting cognition feed.") : "Awaiting cognition feed.", elements.priorityFeedPanel);
  elements.priorityFeedEvents.innerHTML = hasFeed && events.length ? renderFeedEvents(events) : "Awaiting cognition feed.";
  elements.priorityFeedWarnings.textContent = hasFeed && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasFeed ? "No backend feed warnings." : "Awaiting cognition feed.";
  paintCopilotPanel(elements.priorityFeedPanel, elements.priorityFeedState, state, hasFeed);
}

function paintOperatorBadge(active) {
  setTextTracked("operatorStateBadge", elements.operatorStateBadge, active ? "ACTIVE" : "AWAITING", elements.operatorInteractionSection);
  applyTone(elements.operatorStateBadge, active ? "teal" : "gray");
}

function renderExpandableChains(chains) {
  return chains.map((chain, index) => {
    const key = `${chain.title || "chain"}-${index}`;
    const expanded = expandedReasoningChains.has(key);
    const steps = Array.isArray(chain.steps) ? chain.steps : [];
    return `
      <div class="chain-item ${expanded ? "expanded" : ""}" data-chain-key="${escapeHtml(key)}">
        <button type="button" class="chain-toggle" data-chain-key="${escapeHtml(key)}">
          <strong>${escapeHtml(chain.title || "Reasoning chain")}</strong>
          <span>${escapeHtml(chain.severity || "LOW")} | ${escapeHtml(chain.confidenceImpact || "UNKNOWN")}</span>
        </button>
        <div class="chain-body">
          ${steps.map((step) => `<div class="chain-step">${escapeHtml(step)}</div>`).join("")}
          <div class="chain-step">${escapeHtml(chain.stabilization || "Stabilization detail awaiting backend cognition.")}</div>
        </div>
      </div>
    `;
  }).join("");
}

function paintReasoningChains(chainsData) {
  const chains = Array.isArray(chainsData?.chains) ? chainsData.chains : [];
  const warnings = Array.isArray(chainsData?.warnings) ? chainsData.warnings : [];
  const hasChains = chainsData && !isAwaiting(chainsData.summary);
  const state = hasChains ? asText(chainsData.chainState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("reasoningChainState", elements.reasoningChainState, state, elements.reasoningChainsPanel);
  setTextTracked("reasoningChainSummary", elements.reasoningChainSummary, hasChains ? asText(chainsData.summary, "Awaiting reasoning chains.") : "Awaiting reasoning chains.", elements.reasoningChainsPanel);
  elements.expandableReasoningChains.innerHTML = hasChains && chains.length ? renderExpandableChains(chains) : "Awaiting reasoning chains.";
  elements.reasoningChainWarnings.textContent = hasChains && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasChains ? "No backend reasoning chain warnings." : "Awaiting reasoning chains.";
  applyTone(elements.reasoningChainState, hasChains ? toneForCopilot(state) : "gray");
}

function renderReplayTimelineCards(timeline) {
  return timeline.map((event) => {
    const replayState = asText(event.replayState, "UNKNOWN").toLowerCase();
    return `<div class="timeline-drill-card ${replayState}"><strong>${escapeHtml(event.replayState || "UNKNOWN")}</strong><span>${escapeHtml(event.timestamp || "UNKNOWN")}</span><p>${escapeHtml(event.summary || "Awaiting replay timeline.")}</p><small>${escapeHtml(event.cognitionShift || "UNKNOWN")} | ${escapeHtml(event.confidenceLevel || "UNKNOWN")}</small></div>`;
  }).join("");
}

function paintReplayTimelineDrilldown(replayTimeline) {
  const timeline = Array.isArray(replayTimeline?.timeline) ? replayTimeline.timeline : [];
  const signals = Array.isArray(replayTimeline?.recurrenceSignals) ? replayTimeline.recurrenceSignals : [];
  const warnings = Array.isArray(replayTimeline?.warnings) ? replayTimeline.warnings : [];
  const hasReplay = replayTimeline && !isAwaiting(replayTimeline.replaySummary);
  const state = hasReplay ? asText(replayTimeline.replayState, "UNKNOWN") : "UNKNOWN";

  setTextTracked("replayTimelineState", elements.replayTimelineState, state, elements.replayTimelinePanel);
  setTextTracked("replayTimelineSummary", elements.replayTimelineSummary, hasReplay ? asText(replayTimeline.replaySummary, "Awaiting replay timeline.") : "Awaiting replay timeline.", elements.replayTimelinePanel);
  elements.replayTimelineCards.innerHTML = hasReplay && timeline.length ? renderReplayTimelineCards(timeline) : "Awaiting replay timeline.";
  elements.replayRecurrenceSignals.innerHTML = hasReplay && signals.length
    ? signals.map((signal) => `<span class="context-chip">${escapeHtml(signal.environment || "UNKNOWN")}<small>x${Number(signal.count) || 0}</small></span>`).join("")
    : hasReplay ? "No recurrence markers visible." : "Awaiting replay timeline.";
  elements.replayTimelineWarnings.textContent = hasReplay && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasReplay ? "No backend replay timeline warnings." : "Awaiting replay timeline.";
  applyTone(elements.replayTimelineState, hasReplay ? toneForCopilot(state) : "gray");
}

function renderRegionCards(regions) {
  return regions.map((region) => {
    const active = selectedRegionName === region.region;
    return `<button type="button" class="region-card ${active ? "active" : ""}" data-region="${escapeHtml(region.region || "UNKNOWN")}"><strong>${escapeHtml(region.region || "UNKNOWN")}</strong><span>${escapeHtml(region.state || "UNKNOWN")} | ${escapeHtml(region.pressure || "UNKNOWN")}</span></button>`;
  }).join("");
}

function paintInteractiveRegions(regionsData) {
  const regions = Array.isArray(regionsData?.regions) ? regionsData.regions : [];
  const driftSignals = Array.isArray(regionsData?.driftSignals) ? regionsData.driftSignals : [];
  const warnings = Array.isArray(regionsData?.warnings) ? regionsData.warnings : [];
  const hasRegions = regionsData && !isAwaiting(regionsData.summary);
  const state = hasRegions ? asText(regionsData.regionState, "UNKNOWN") : "UNKNOWN";

  if (!selectedRegionName && regions.length) {
    selectedRegionName = regionsData.dominantRegion?.region || regions[0].region;
  }

  const selected = regions.find((region) => region.region === selectedRegionName) || regions[0];
  setTextTracked("interactiveRegionState", elements.interactiveRegionState, state, elements.interactiveRegionsPanel);
  setTextTracked("interactiveRegionSummary", elements.interactiveRegionSummary, hasRegions ? asText(regionsData.summary, "Awaiting region cognition.") : "Awaiting region cognition.", elements.interactiveRegionsPanel);
  elements.regionCards.innerHTML = hasRegions && regions.length ? renderRegionCards(regions) : "Awaiting region cognition.";
  elements.selectedRegionDetail.innerHTML = hasRegions && selected
    ? `<strong>${escapeHtml(selected.region)}</strong><p>${escapeHtml(selected.summary)}</p><small>Sync ${escapeHtml(selected.synchronization)} | Pressure ${escapeHtml(selected.pressure)} | Replay ${escapeHtml(selected.replayAlignment)} | Confidence ${escapeHtml(selected.confidence)}</small>`
    : "Awaiting region cognition.";
  elements.regionDriftSignals.innerHTML = hasRegions && driftSignals.length ? renderTextChips(driftSignals) : hasRegions ? "No region drift signals visible." : "Awaiting region cognition.";
  elements.interactiveRegionWarnings.textContent = hasRegions && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasRegions ? "No backend region warnings." : "Awaiting region cognition.";
  applyTone(elements.interactiveRegionState, hasRegions ? toneForCopilot(state) : "gray");
}

function renderMemoryItems(entries) {
  return entries.map((entry) => `<div class="memory-item"><strong>${escapeHtml(entry.environment || entry.replayState || "UNKNOWN")}</strong><span>${escapeHtml(entry.timestamp || "UNKNOWN")}</span><small>${escapeHtml(entry.symbol || "UNKNOWN")} | ${escapeHtml(entry.confidenceLevel || "UNKNOWN")} | ${escapeHtml(entry.ecosystemState || "UNKNOWN")}</small></div>`).join("");
}

function paintPersistentMemory(memory) {
  const entries = Array.isArray(memory?.memoryEntries) ? memory.memoryEntries : [];
  const warnings = Array.isArray(memory?.warnings) ? memory.warnings : [];
  const hasMemory = memory && !isAwaiting(memory.summary);
  const state = hasMemory ? asText(memory.memoryState, "UNKNOWN") : "UNKNOWN";
  setTextTracked("persistentMemoryState", elements.persistentMemoryState, state, elements.persistentMemoryPanel);
  setTextTracked("persistentMemorySummary", elements.persistentMemorySummary, hasMemory ? asText(memory.summary, "Awaiting persistent cognition memory.") : "Awaiting persistent cognition memory.", elements.persistentMemoryPanel);
  setTextTracked("memoryRetentionStatus", elements.memoryRetentionStatus, `Retention: ${hasMemory ? asText(memory.retentionStatus, "UNKNOWN") : "UNKNOWN"}`, elements.persistentMemoryPanel);
  setTextTracked("memoryCompressionState", elements.memoryCompressionState, `Compression: ${hasMemory ? asText(memory.compressionState, "UNKNOWN") : "UNKNOWN"}`, elements.persistentMemoryPanel);
  elements.memoryEntries.innerHTML = hasMemory && entries.length ? renderMemoryItems(entries) : "Awaiting persistent cognition memory.";
  elements.persistentMemoryWarnings.textContent = hasMemory && warnings.length ? warnings.map((item) => asText(item)).join(", ") : hasMemory ? "No backend memory warnings." : "Awaiting persistent cognition memory.";
  applyTone(elements.persistentMemoryState, hasMemory ? toneForCopilot(state) : "gray");
}

function paintEnvironmentArchive(archive) {
  const history = Array.isArray(archive?.environmentHistory) ? archive.environmentHistory : [];
  const transitions = Array.isArray(archive?.dominantTransitions) ? archive.dominantTransitions : [];
  const clusters = Array.isArray(archive?.recurrenceClusters) ? archive.recurrenceClusters : [];
  const hasArchive = archive && !isAwaiting(archive.summary);
  const state = hasArchive ? asText(archive.archiveState, "UNKNOWN") : "UNKNOWN";
  setTextTracked("environmentArchiveState", elements.environmentArchiveState, state, elements.environmentArchivePanel);
  setTextTracked("environmentArchiveSummary", elements.environmentArchiveSummary, hasArchive ? asText(archive.summary, "Awaiting environment archive.") : "Awaiting environment archive.", elements.environmentArchivePanel);
  elements.environmentHistoryTimeline.innerHTML = hasArchive && history.length ? renderMemoryItems(history) : "Awaiting environment archive.";
  elements.environmentDominantTransitions.innerHTML = hasArchive && transitions.length ? transitions.map((item) => `<span class="context-chip">${escapeHtml(item.transition || "UNKNOWN")}<small>x${Number(item.count) || 0}</small></span>`).join("") : "Awaiting environment archive.";
  elements.environmentRecurrenceClusters.innerHTML = hasArchive && clusters.length ? clusters.map((item) => `<span class="context-chip">${escapeHtml(item.environment || "UNKNOWN")}<small>x${Number(item.count) || 0}</small></span>`).join("") : "Awaiting environment archive.";
  applyTone(elements.environmentArchiveState, hasArchive ? toneForCopilot(state) : "gray");
}

function paintHistoricalRecurrence(recurrence) {
  const patterns = Array.isArray(recurrence?.recurrencePatterns) ? recurrence.recurrencePatterns : [];
  const hasRecurrence = recurrence && !isAwaiting(recurrence.summary);
  const state = hasRecurrence ? asText(recurrence.recurrenceState, "UNKNOWN") : "UNKNOWN";
  setTextTracked("historicalRecurrenceState", elements.historicalRecurrenceState, state, elements.historicalRecurrencePanel);
  setTextTracked("historicalRecurrenceSummary", elements.historicalRecurrenceSummary, hasRecurrence ? asText(recurrence.summary, "Awaiting recurrence intelligence.") : "Awaiting recurrence intelligence.", elements.historicalRecurrencePanel);
  setTextTracked("historicalRecurrenceConfidence", elements.historicalRecurrenceConfidence, `Confidence: ${hasRecurrence ? asText(recurrence.recurrenceConfidence, "UNKNOWN") : "UNKNOWN"}`, elements.historicalRecurrencePanel);
  elements.historicalRecurrencePatterns.innerHTML = hasRecurrence && patterns.length ? patterns.map((item) => `<span class="context-chip">${escapeHtml(item.pattern || "UNKNOWN")}<small>${escapeHtml(item.confidence || "UNKNOWN")} x${Number(item.frequency) || 0}</small></span>`).join("") : "Awaiting recurrence intelligence.";
  applyTone(elements.historicalRecurrenceState, hasRecurrence ? toneForCopilot(state) : "gray");
}

function paintDriftEvolution(drift) {
  const metrics = drift?.driftMetrics || {};
  const signals = Array.isArray(drift?.stabilizationSignals) ? drift.stabilizationSignals : [];
  const hasDrift = drift && !isAwaiting(drift.summary);
  const state = hasDrift ? asText(drift.driftState, "UNKNOWN") : "UNKNOWN";
  setTextTracked("driftEvolutionState", elements.driftEvolutionState, state, elements.driftEvolutionPanel);
  setTextTracked("driftEvolutionSummary", elements.driftEvolutionSummary, hasDrift ? asText(drift.summary, "Awaiting drift evolution.") : "Awaiting drift evolution.", elements.driftEvolutionPanel);
  elements.driftMetrics.innerHTML = hasDrift ? renderThresholdChips(metrics) : "Awaiting drift evolution.";
  elements.stabilizationSignals.innerHTML = hasDrift && signals.length ? renderTextChips(signals) : hasDrift ? "No stabilization signals visible." : "Awaiting drift evolution.";
  applyTone(elements.driftEvolutionState, hasDrift ? toneForCopilot(state) : "gray");
}

function paintReplayArchive(archive) {
  const snapshots = Array.isArray(archive?.replaySnapshots) ? archive.replaySnapshots : [];
  const index = Array.isArray(archive?.replayIndex) ? archive.replayIndex : [];
  const hasArchive = archive && !isAwaiting(archive.summary);
  const state = hasArchive ? asText(archive.replayArchiveState, "UNKNOWN") : "UNKNOWN";
  setTextTracked("replayArchiveState", elements.replayArchiveState, state, elements.replayArchivePanel);
  setTextTracked("replayArchiveSummary", elements.replayArchiveSummary, hasArchive ? asText(archive.summary, "Awaiting replay archive.") : "Awaiting replay archive.", elements.replayArchivePanel);
  elements.replayArchiveTimeline.innerHTML = hasArchive && snapshots.length ? renderMemoryItems(snapshots) : "Awaiting replay archive.";
  elements.replayArchiveIndex.innerHTML = hasArchive && index.length ? index.map((item) => `<span class="context-chip">${escapeHtml(item.state || "UNKNOWN")}<small>x${Number(item.count) || 0}</small></span>`).join("") : "Awaiting replay archive.";
  applyTone(elements.replayArchiveState, hasArchive ? toneForCopilot(state) : "gray");
}

function paintProductionReadiness(status) {
  const hasStatus = status && !isAwaiting(status.summary);
  const state = hasStatus ? asText(status.status, "UNKNOWN") : "UNKNOWN";
  const memory = status?.memory || {};
  const persistence = status?.persistence || {};
  const deployment = status?.deployment || {};
  const warnings = Array.isArray(status?.warnings) ? status.warnings : [];

  setTextTracked("productionHealthState", elements.productionHealthState, state, elements.productionReadinessPanel);
  setTextTracked("productionReadinessSummary", elements.productionReadinessSummary, hasStatus ? asText(status.summary, "Awaiting production readiness status.") : "Awaiting production readiness status.", elements.productionReadinessPanel);
  setTextTracked("productionRuntimeMode", elements.productionRuntimeMode, `Runtime mode: ${hasStatus ? asText(status.runtimeMode, "UNKNOWN") : "UNKNOWN"}`, elements.productionReadinessPanel);
  setTextTracked("productionMemoryUsage", elements.productionMemoryUsage, `Memory: ${Number(memory.heapUsedMb || 0)} / ${Number(memory.heapTotalMb || 0)} MB heap`, elements.productionReadinessPanel);
  setTextTracked("productionPersistenceStatus", elements.productionPersistenceStatus, `Persistence: ${hasStatus ? asText(persistence.memoryState, "UNKNOWN") : "UNKNOWN"}`, elements.productionReadinessPanel);
  setTextTracked("productionArchiveStatus", elements.productionArchiveStatus, `Archive: ${hasStatus ? asText(persistence.compressionState, "UNKNOWN") : "UNKNOWN"}`, elements.productionReadinessPanel);
  setTextTracked("productionApiVersion", elements.productionApiVersion, "API version: v1", elements.productionReadinessPanel);
  setTextTracked("productionDeploymentReadiness", elements.productionDeploymentReadiness, `Deployment readiness: ${deployment?.readinessChecks?.configLoaded ? "CONFIGURED" : "UNKNOWN"}`, elements.productionReadinessPanel);
  elements.productionWarnings.textContent = hasStatus && warnings.length
    ? warnings.map((item) => asText(item)).join(", ")
    : hasStatus ? "No backend production readiness warnings." : "Awaiting production readiness status.";
  applyTone(elements.productionHealthState, state === "HEALTHY" ? "green" : state === "DEGRADED" ? "gold" : state === "UNSTABLE" ? "red" : "gray");
}

function paintUserIntelligence(cognition) {
  const profileResult = cognition.userProfile || {};
  const session = cognition.userSession || {};
  const watchlist = cognition.userWatchlistProfile || {};
  const preferences = cognition.userCognitionPreferences || {};
  const memory = cognition.operatorMemory || {};
  const profile = profileResult.profile || {};
  const watchlistProfile = watchlist.profile || {};
  const preferenceProfile = preferences.preferenceProfile || {};
  const interactions = Array.isArray(memory.dominantInteractions) ? memory.dominantInteractions : [];

  setTextTracked("userSessionState", elements.userSessionState, asText(session.authState, "UNKNOWN"), elements.userIntelligenceSection);
  applyTone(elements.userSessionState, session.authState === "AUTHENTICATED" ? "green" : session.authState === "LOCAL_DEV" ? "teal" : "gray");

  setTextTracked("userProfileState", elements.userProfileState, asText(profileResult.profileState, "UNKNOWN"), elements.userProfilePanel);
  setTextTracked("userProfileSummary", elements.userProfileSummary, asText(profileResult.summary, "Awaiting user profile."), elements.userProfilePanel);
  elements.userProfileDetails.innerHTML = profile.username
    ? renderTextChips([profile.username, profile.operatorRole, profile.dashboardMode, profile.compressionMode])
    : "Awaiting user profile.";
  applyTone(elements.userProfileState, profileResult.profileState === "ACTIVE" ? "green" : "gray");

  setTextTracked("userWatchlistState", elements.userWatchlistState, asText(watchlist.watchlistState, "UNKNOWN"), elements.watchlistProfilePanel);
  setTextTracked("userWatchlistSummary", elements.userWatchlistSummary, asText(watchlist.summary, "Awaiting watchlist profile."), elements.watchlistProfilePanel);
  elements.userWatchlistSymbols.innerHTML = Array.isArray(watchlistProfile.prioritizedSymbols) && watchlistProfile.prioritizedSymbols.length
    ? renderTextChips(watchlistProfile.prioritizedSymbols)
    : "Awaiting watchlist profile.";
  elements.userEcosystemBias.innerHTML = Array.isArray(watchlist.ecosystemBias) && watchlist.ecosystemBias.length
    ? renderTextChips(watchlist.ecosystemBias)
    : "Awaiting watchlist profile.";
  applyTone(elements.userWatchlistState, watchlist.watchlistState === "ACTIVE" ? "green" : "gray");

  setTextTracked("cognitionPreferenceState", elements.cognitionPreferenceState, asText(preferences.cognitionPreferenceState, "UNKNOWN"), elements.cognitionPreferencesPanel);
  setTextTracked("cognitionPreferenceSummary", elements.cognitionPreferenceSummary, asText(preferences.summary, "Awaiting cognition preferences."), elements.cognitionPreferencesPanel);
  elements.cognitionPreferenceDetails.innerHTML = preferenceProfile.mode
    ? renderThresholdChips(preferenceProfile)
    : "Awaiting cognition preferences.";
  applyTone(elements.cognitionPreferenceState, preferences.cognitionPreferenceState === "ACTIVE" ? "green" : "gray");

  setTextTracked("operatorMemoryState", elements.operatorMemoryState, asText(memory.operatorMemoryState, "UNKNOWN"), elements.operatorMemoryPanel);
  setTextTracked("operatorMemorySummary", elements.operatorMemorySummary, asText(memory.summary, "Awaiting operator memory."), elements.operatorMemoryPanel);
  elements.operatorDominantInteractions.innerHTML = interactions.length
    ? interactions.map((item) => `<span class="context-chip">${escapeHtml(item.interaction || "UNKNOWN")}<small>x${Number(item.count) || 0}</small></span>`).join("")
    : "Awaiting operator memory.";
  applyTone(elements.operatorMemoryState, memory.operatorMemoryState === "ACTIVE" ? "green" : "gray");
}

function renderPermissionChips(items) {
  return items.map((item) => `<span class="context-chip">${escapeHtml(item.feature || item[0] || "UNKNOWN")}<small>${escapeHtml(item.level || item[1] || "UNKNOWN")}</small></span>`).join("");
}

function paintPlatformAccess(cognition) {
  const tier = cognition.subscriptionTier || {};
  const entitlements = cognition.entitlements || {};
  const usage = cognition.platformUsage || {};
  const gates = cognition.featureGates || {};
  const manifest = cognition.planManifest || {};
  const permissions = tier.permissions ? Object.entries(tier.permissions).map(([feature, level]) => ({ feature, level })) : [];
  const granted = Array.isArray(entitlements.grantedPermissions) ? entitlements.grantedPermissions : [];
  const restricted = Array.isArray(entitlements.restrictedPermissions) ? entitlements.restrictedPermissions : [];
  const accessible = Array.isArray(gates.accessibleFeatures) ? gates.accessibleFeatures : [];
  const locked = Array.isArray(gates.lockedFeatures) ? gates.lockedFeatures : [];
  const metrics = usage.usageMetrics || {};

  setTextTracked("platformTierState", elements.platformTierState, asText(tier.activeTier, "UNKNOWN"), elements.platformAccessSection);
  applyTone(elements.platformTierState, tier.activeTier === "ADMIN" ? "gold" : tier.activeTier === "FREE" ? "gray" : "teal");
  setTextTracked("activePlanSummary", elements.activePlanSummary, asText(tier.summary, "Awaiting subscription tier."), elements.platformAccessSection);
  elements.tierPermissions.innerHTML = permissions.length ? renderPermissionChips(permissions) : "Awaiting subscription tier.";
  setTextTracked("entitlementSummary", elements.entitlementSummary, asText(entitlements.summary, "Awaiting entitlement state."), elements.platformAccessSection);
  elements.grantedPermissions.innerHTML = granted.length ? renderPermissionChips(granted) : "Awaiting entitlement state.";
  elements.restrictedPermissions.innerHTML = restricted.length ? renderPermissionChips(restricted) : "Awaiting entitlement state.";
  setTextTracked("featureGateSummary", elements.featureGateSummary, asText(gates.summary, "Awaiting feature gate state."), elements.platformAccessSection);
  elements.accessibleFeatures.innerHTML = accessible.length ? renderPermissionChips(accessible) : "Awaiting feature gate state.";
  elements.lockedFeatures.innerHTML = locked.length
    ? locked.map((item) => `<div class="locked-feature">${escapeHtml(item.feature)} requires ${escapeHtml(item.requiredTier)}</div>`).join("")
    : "No locked features visible.";
  setTextTracked("platformUsageSummary", elements.platformUsageSummary, asText(usage.summary, "Awaiting platform usage."), elements.platformAccessSection);
  elements.platformUsageMetrics.innerHTML = Object.keys(metrics).length ? renderThresholdChips(metrics) : "Awaiting platform usage.";
  elements.platformCapabilityMatrix.innerHTML = Array.isArray(manifest.availablePlans)
    ? manifest.availablePlans.map((plan) => `<div class="capability-plan"><strong>${escapeHtml(plan)}</strong><span>${escapeHtml(manifest.cognitionCapabilities?.[plan] || "Cognition capability pending")}</span><span>${escapeHtml(manifest.replayCapabilities?.[plan] || "Replay capability pending")}</span></div>`).join("")
    : "Awaiting platform plan manifest.";
}

function toneForDistributedState(value) {
  const text = asText(value, "UNKNOWN").toUpperCase();

  if (["SYNCHRONIZED", "SYNCED", "ACTIVE", "STABLE", "HEALTHY", "FOUNDATION_READY"].includes(text)) return "teal";
  if (["PARTIAL", "LIMITED", "ELEVATED"].includes(text)) return "gold";
  if (["DEGRADED", "DESYNCHRONIZED", "CONFLICT", "HIGH_LOAD"].includes(text)) return "orange";
  if (text === "CRITICAL") return "red";
  return "gray";
}

function renderNodeCards(nodes) {
  if (!Array.isArray(nodes) || !nodes.length) {
    return "Awaiting cognition nodes.";
  }

  return nodes.map((node) => {
    const status = asText(node.status, "UNKNOWN");
    const sync = asText(node.synchronizationState, "UNKNOWN");
    const tone = toneForDistributedState(sync);
    return `
      <div class="node-card">
        <div class="node-card-head">
          <strong>${escapeHtml(node.nodeId || "cognition-node")}</strong>
          <span class="node-heartbeat tone-${tone}"></span>
        </div>
        <span>${escapeHtml(node.role || "node")} / ${escapeHtml(node.region || "local")}</span>
        <small>Status: ${escapeHtml(status)} | Sync: ${escapeHtml(sync)}</small>
        <small>Heartbeat: ${escapeHtml(node.lastHeartbeat || "UNKNOWN")}</small>
      </div>
    `;
  }).join("");
}

function renderTopologyCards(topology) {
  const entries = Object.entries(topology || {});
  if (!entries.length) {
    return "Awaiting cloud deployment manifest.";
  }

  return entries.map(([name, services]) => {
    const serviceList = Array.isArray(services) ? services : [services];
    return `
      <div class="topology-card">
        <strong>${escapeHtml(name)}</strong>
        <span>${serviceList.map((item) => escapeHtml(item)).join(", ")}</span>
      </div>
    `;
  }).join("");
}

function paintDistributedInfrastructure(cognition) {
  const coordinator = cognition.distributedCoordinator || {};
  const registry = cognition.distributedNodes || {};
  const websocket = cognition.websocketStatus || {};
  const replaySync = cognition.distributedReplaySync || {};
  const scaling = cognition.distributedScaling || {};
  const manifest = cognition.cloudManifest || {};
  const nodes = Array.isArray(registry.nodes) && registry.nodes.length
    ? registry.nodes
    : Array.isArray(coordinator.cognitionNodes) ? coordinator.cognitionNodes : [];
  const channels = Array.isArray(websocket.activeChannels) ? websocket.activeChannels : [];
  const conflicts = Array.isArray(replaySync.synchronizationConflicts) ? replaySync.synchronizationConflicts : [];
  const scalingMetrics = scaling.scalingMetrics || {};
  const pressure = clampPercent(scaling.infrastructurePressure || 0);
  const coordinatorState = asText(coordinator.coordinatorState, "UNKNOWN");

  setTextTracked("distributedCoordinatorState", elements.distributedCoordinatorState, coordinatorState, elements.distributedCognitionSection);
  setTextTracked("distributedCoordinatorSummary", elements.distributedCoordinatorSummary, asText(coordinator.summary, "Awaiting distributed cognition coordinator."), elements.distributedCognitionSection);
  elements.cognitionNodeList.innerHTML = renderNodeCards(nodes);
  applyTone(elements.distributedCoordinatorState, toneForDistributedState(coordinatorState));

  setTextTracked("websocketSummary", elements.websocketSummary, asText(websocket.summary, "Awaiting websocket infrastructure."), elements.distributedCognitionSection);
  elements.websocketChannels.innerHTML = channels.length
    ? renderTextChips(channels.concat([`Operators ${Number(websocket.connectedOperators || 0)}`, `Stream ${asText(websocket.streamHealth, "UNKNOWN")}`]))
    : "Awaiting websocket infrastructure.";

  setTextTracked("replaySyncSummary", elements.replaySyncSummary, asText(replaySync.summary, "Awaiting replay synchronization."), elements.distributedCognitionSection);
  elements.replaySyncConflicts.innerHTML = conflicts.length
    ? conflicts.map((item) => `<span class="context-chip">${escapeHtml(item.nodeId || "node")}<small>${escapeHtml(item.state || "UNKNOWN")}</small></span>`).join("")
    : replaySync.replaySyncState ? "No replay sync conflicts visible." : "Awaiting replay synchronization.";

  setTextTracked("scalingSummary", elements.scalingSummary, asText(scaling.summary, "Awaiting scaling infrastructure."), elements.distributedCognitionSection);
  elements.scalingPressureBar.style.width = `${pressure}%`;
  elements.scalingMetrics.innerHTML = Object.keys(scalingMetrics).length ? renderThresholdChips(scalingMetrics) : "Awaiting scaling infrastructure.";

  elements.cloudTopologyCards.innerHTML = renderTopologyCards(manifest.topology);
}

function paintEndpointRoadmap(cognition = fallbackCognitionState()) {
  setRoadmapStatus(elements.roadmapBrain, "Brain Status", hasUsableValue(cognition.brainStatus));
  setRoadmapStatus(elements.roadmapStrategic, "Strategic Environment", hasUsableValue(cognition.strategicEnvironment));
  setRoadmapStatus(elements.roadmapConfidence, "Confidence", hasUsableValue(cognition.confidence));
  setRoadmapStatus(elements.roadmapReplay, "Replay", hasUsableValue(cognition.replaySummary));
  setRoadmapStatus(elements.roadmapBehavioral, "Behavioral", hasUsableValue(cognition.behavioralState));
  setRoadmapStatus(elements.roadmapEscalation, "Escalation", hasUsableValue(cognition.escalation));
}

function paintCognition(cognition = fallbackCognitionState()) {
  paintBrainStatus(cognition.brainStatus);
  paintStrategicEnvironment(cognition.strategicEnvironment, cognition.escalation);
  paintConfidence(cognition.confidence);
  paintBehavioralState(cognition.behavioralState);
  paintReplaySummary(cognition.replaySummary);
  paintAnomalyOverlay(cognition.anomalies);
  paintWatchlistEcosystem(cognition.watchlist);
  paintCrossSymbolEcosystem(cognition.ecosystem);
  paintStrategicEnvironmentMap(cognition.environmentMap);
  paintAdaptiveEcosystemPriority(cognition.ecosystemPriority);
  paintSectorHeatmap(cognition.sectorHeatmap);
  paintCognitiveDrift(cognition.cognitiveDrift);
  paintEnvironmentForecast(cognition.environmentForecast);
  paintMarketStructure(cognition.marketStructure);
  paintRegimeTransition(cognition.regimeTransition);
  paintInstitutionalFlow(cognition.institutionalFlow);
  paintLiquidityPressure(cognition.liquidityPressure);
  paintAdaptiveSignalIntelligence(cognition.adaptiveSignals);
  paintBrainConsensus(cognition.brainConsensus);
  paintTemporalMemory(cognition.temporalMemory);
  paintRecurrence(cognition.recurrence);
  paintContextAging(cognition.contextAging);
  paintTemporalSequences(cognition.temporalSequences);
  paintEnvironmentalCausality(cognition.environmentCausality);
  paintAdaptiveThresholds(cognition.adaptiveThresholds);
  paintReinforcementWeighting(cognition.reinforcementWeighting);
  paintCognitionCalibration(cognition.cognitionCalibration);
  paintLearningGuardrails(cognition.learningGuardrails);
  paintCopilotNarration(cognition.copilot);
  paintExplainability(cognition.explainability);
  paintPriorityFeed(cognition.priorityFeed);
  paintReasoningChains(cognition.reasoningChains);
  paintReplayTimelineDrilldown(cognition.replayTimeline);
  paintInteractiveRegions(cognition.interactiveRegions);
  paintOperatorBadge(Boolean(cognition.reasoningChains || cognition.replayTimeline || cognition.interactiveRegions));
  paintPersistentMemory(cognition.persistentMemory);
  paintEnvironmentArchive(cognition.environmentArchive);
  paintHistoricalRecurrence(cognition.recurrenceIntelligence);
  paintDriftEvolution(cognition.driftEvolution);
  paintReplayArchive(cognition.replayArchive);
  paintProductionReadiness(cognition.productionStatus);
  paintUserIntelligence(cognition);
  paintPlatformAccess(cognition);
  paintDistributedInfrastructure(cognition);
  paintEndpointRoadmap(cognition);
}

function paintConnected(metrics, stream) {
  setStatus(elements.systemStatusBadge, "System Online", "status-good");
  setStatus(elements.backendStatus, "Connected", "status-good");
  setStatus(elements.streamStatus, stream.label, stream.active ? "status-good" : "status-warn");
  setStatus(elements.runtimeHealth, metrics.runtimeHealth, metrics.runtimeHealth.toLowerCase().includes("fail") ? "status-bad" : "status-good");
  applyTone(elements.runtimeHealth, toneForRuntime(metrics.runtimeHealth));

  elements.streamDetails.textContent = buildStreamDetails(stream);
  elements.activeProvider.textContent = asText(firstDefined(stream.provider, metrics.provider, fallbackState.provider));
  elements.currentSymbol.textContent = asText(firstDefined(stream.symbol, metrics.symbol, fallbackState.symbol));
  elements.marketSession.textContent = stream.marketSession;

  paintMetrics(metrics);
  paintMeters(metrics, stream);
  paintPulse(metrics, stream);
  setActiveCard(elements.backendCard, true);
  setActiveCard(elements.streamCard, stream.active);
  setActiveCard(elements.runtimeCard, true);
}

function paintDisconnected() {
  setStatus(elements.systemStatusBadge, "Disconnected", "status-bad");
  setStatus(elements.backendStatus, "Disconnected", "status-bad");
  setStatus(elements.streamStatus, fallbackState.streamLabel, "status-bad");
  setStatus(elements.runtimeHealth, fallbackState.runtimeHealth, "status-bad");

  elements.streamDetails.textContent = fallbackState.streamDetails;
  elements.activeProvider.textContent = fallbackState.provider;
  elements.currentSymbol.textContent = fallbackState.symbol;
  elements.marketSession.textContent = fallbackState.marketSession;

  paintMetrics(fallbackState.metrics);
  setMeter(elements.backendMeter, 0, "bad");
  setMeter(elements.streamMeter, 0, "bad");
  setMeter(elements.runtimeHealthMeter, 0, "bad");
  setMeter(elements.runtimeHealthWideMeter, 0, "bad");
  setMeter(elements.streamActivityMeter, 0, "bad");
  setMeter(elements.shadowMeter, 0, "warn");
  setMeter(elements.confidenceMeter, 34, "warn");
  elements.runtimeHealthBarLabel.textContent = "Disconnected";
  elements.streamActivityBarLabel.textContent = "Inactive";
  elements.shadowBarLabel.textContent = "0 / 0";
  elements.confidenceBarLabel.textContent = "Awaiting backend endpoint.";
  elements.runtimeStateBadge.textContent = "Runtime standby";
  elements.throughputLabel.textContent = "Throughput awaiting events";
  applyTone(elements.runtimeStateBadge, "blue");
  setPulse(elements.pulseBackend, elements.pulseBackendState, "offline", "standby");
  setPulse(elements.pulseStream, elements.pulseStreamState, "offline", "standby");
  setPulse(elements.pulseRuntime, elements.pulseRuntimeState, "offline", "standby");
  setPulse(elements.pulseShadow, elements.pulseShadowState, "standby", "standby");
  setActiveCard(elements.backendCard, false);
  setActiveCard(elements.streamCard, false);
  setActiveCard(elements.runtimeCard, false);
}

async function refreshBackendState() {
  try {
    const [metricsResponse, streamResponse, cognitionState] = await Promise.all([
      fetchJson("/api/dev/metrics"),
      fetchJson("/api/dev/stream/status"),
      loadCognitionState()
    ]);

    paintConnected(
      normalizeMetrics(metricsResponse),
      normalizeStream(streamResponse)
    );
    paintCognition(cognitionState);
  } catch (error) {
    console.warn("Market AI backend status unavailable.", error);
    paintDisconnected();
    paintCognition(fallbackCognitionState());
  }
}

function init() {
  cacheElements();
  elements.copilotCompactMode.addEventListener("click", () => setCopilotMode("compact"));
  elements.copilotAnalystMode.addEventListener("click", () => setCopilotMode("analyst"));
  elements.copilotExpandedMode.addEventListener("click", () => setCopilotMode("expanded"));
  elements.retentionCompactMode.addEventListener("click", () => setRetentionMode("compact"));
  elements.retentionBalancedMode.addEventListener("click", () => setRetentionMode("balanced"));
  elements.retentionExtendedMode.addEventListener("click", () => setRetentionMode("extended"));
  elements.expandableReasoningChains.addEventListener("click", (event) => {
    const button = event.target.closest(".chain-toggle");
    if (!button) return;
    const key = button.dataset.chainKey;
    if (expandedReasoningChains.has(key)) {
      expandedReasoningChains.delete(key);
    } else {
      expandedReasoningChains.add(key);
    }
    refreshBackendState();
  });
  elements.regionCards.addEventListener("click", (event) => {
    const card = event.target.closest(".region-card");
    if (!card) return;
    selectedRegionName = card.dataset.region;
    refreshBackendState();
  });
  setCopilotMode(copilotMode);
  setRetentionMode(retentionMode);
  paintDisconnected();
  refreshBackendState();
  window.setInterval(refreshBackendState, REFRESH_INTERVAL_MS);
}

init();
