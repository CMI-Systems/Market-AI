/*
 * Supervises the 3-brain input boundary.
 * Raw provider payloads must be normalized before they reach this module.
 */

const {
  assertNormalizedMarketEvent
} = require("../../providers/shared/marketEvent");
const {
  analyzeTacticalMarketEvent
} = require("./tacticalBrain");
const {
  analyzeBehavioralRisk
} = require("./behavioralBrain");
const {
  runFailsafeBrain
} = require("./failsafeBrain");
const {
  observeShadowEvent
} = require("../../training/shadowTrainer");
const {
  addMemoryEvent,
  getMemoryStats,
  getRecentMemory
} = require("./brainMemory");
const {
  calculateConfidence
} = require("../confidenceEngine");
const {
  evaluateSignalIntelligence
} = require("../signalIntelligence");
const {
  buildMarketNarrative
} = require("../narrativeIntelligence");
const {
  evaluateAlertReadiness
} = require("../alertReadiness");
const {
  evaluateSignalCooldown
} = require("../signalCooldown");
const {
  logSignalEvent
} = require("../signalEventLog");
const {
  buildTimeline
} = require("../intelligenceTimeline");
const {
  buildInsightSummary
} = require("../insightSummary");
const {
  evaluateBehavioralIntelligence
} = require("../behavioralIntelligence");
const {
  evaluateBehavioralRiskAlignment
} = require("../behavioralRiskAlignment");
const {
  buildReflectionPrompts
} = require("../reflectionPromptEngine");
const {
  buildJournalDraft
} = require("../journalDraftEngine");
const {
  saveJournalDraft
} = require("../journalPersistence");
const {
  scoreMemorySignificance
} = require("../adaptiveMemoryScoring");
const {
  evaluateAnomalyIntelligence
} = require("../anomalyIntelligence");
const {
  getRuntimeMetrics
} = require("../runtimeMetrics");
const {
  evaluateRuntimeHealth
} = require("../runtimeHealthScoring");
const {
  evaluateIntelligenceConsensus
} = require("../intelligenceConsensus");
const {
  evaluateStrategicEnvironment
} = require("../strategicEnvironment");
const {
  evaluateEnvironmentalPressure
} = require("../environmentalPressure");
const {
  forecastIntelligenceStability
} = require("../intelligenceStabilityForecast");
const {
  calculateCognitiveWeights
} = require("../adaptiveCognitiveWeighting");
const {
  evaluateDynamicWatchlist
} = require("../dynamicWatchlistIntelligence");
const {
  evaluateCrossSymbolCorrelation
} = require("../crossSymbolCorrelationEngine");
const {
  mapStrategicEnvironment
} = require("../strategicEnvironmentMappingEngine");
const {
  prioritizeEcosystems
} = require("../adaptiveEcosystemPrioritization");
const {
  buildSectorHeatmap
} = require("../sectorHeatmapCognition");
const {
  detectCognitiveDrift,
  forecastStrategicEnvironment
} = require("../cognitiveDriftForecasting");
const {
  evaluateMarketStructure
} = require("../marketStructureIntelligence");
const {
  evaluateRegimeTransition
} = require("../regimeTransitionIntelligence");
const {
  evaluateInstitutionalFlow
} = require("../institutionalFlowCognition");
const {
  evaluateLiquidityPressure
} = require("../liquidityPressureIntelligence");
const {
  evaluateCrossBrainConsensus
} = require("../crossBrainConsensusEngine");
const {
  evaluateAdaptiveSignalIntelligence
} = require("../adaptiveSignalIntelligence");
const {
  evaluateTemporalMemory,
  rememberTemporalCognition
} = require("../temporalMemoryEngine");
const {
  evaluateRecurrenceIntelligence
} = require("../recurrenceIntelligence");
const {
  evaluateContextAging
} = require("../contextAgingIntelligence");
const {
  evaluateTemporalSequence
} = require("../temporalSequenceIntelligence");
const {
  evaluateEnvironmentalCausality
} = require("../environmentalCausalityEngine");
const {
  evaluateLearningGuardrails
} = require("../learningGuardrails");
const {
  evaluateAdaptiveThresholds
} = require("../adaptiveThresholdEngine");
const {
  evaluateReinforcementWeighting
} = require("../reinforcementWeightingEngine");
const {
  evaluateCognitionCalibration
} = require("../cognitionCalibrationEngine");
const {
  evaluateAiCopilotNarration
} = require("../aiCopilotNarrationEngine");
const {
  evaluateExplainabilityReasons
} = require("../explainabilityReasonEngine");
const {
  evaluatePriorityCognitionFeed
} = require("../priorityCognitionFeed");
const {
  evaluateReasoningChains
} = require("../reasoningChainBuilder");
const {
  evaluateReplayTimeline
} = require("../replayTimelineEngine");
const {
  evaluateInteractiveRegions
} = require("../interactiveRegionEngine");
const {
  persistCognitionMemory
} = require("../persistentCognitionMemory");
const {
  buildEnvironmentArchive
} = require("../environmentArchiveEngine");
const {
  buildRecurrenceIntelligence
} = require("../recurrenceIntelligenceEngine");
const {
  buildDriftEvolution
} = require("../driftEvolutionEngine");
const {
  buildReplayArchive
} = require("../replayArchiveEngine");
const {
  createStrategicSnapshot,
  saveStrategicSnapshot
} = require("../strategicSnapshot");
const {
  isClosedMarketSimulationMode
} = require("../simulationMode");
const {
  storeCognitionSnapshot
} = require("../cognitionSnapshotStore");

const latestSymbolContexts = new Map();
const MAX_SYMBOL_CONTEXTS = 25;

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function rememberSymbolContext(symbolContext) {
  if (!symbolContext?.symbol || symbolContext.symbol === "UNKNOWN") {
    return;
  }

  latestSymbolContexts.set(symbolContext.symbol, symbolContext);

  while (latestSymbolContexts.size > MAX_SYMBOL_CONTEXTS) {
    const oldestSymbol = latestSymbolContexts.keys().next().value;
    latestSymbolContexts.delete(oldestSymbol);
  }
}

function buildSymbolContext({
  marketEvent,
  confidenceProfile,
  strategicEnvironment,
  anomalyIntelligence,
  intelligenceStabilityForecast,
  adaptiveMemoryScore,
  runtimeHealth,
  behavioralIntelligence
}) {
  return {
    symbol: marketEvent?.symbol || "UNKNOWN",
    confidenceProfile,
    strategicEnvironment,
    anomalyIntelligence,
    intelligenceStabilityForecast,
    adaptiveMemoryScore,
    runtimeHealth,
    behavioralIntelligence,
    updatedAt: new Date().toISOString()
  };
}

function getAccumulatedSymbolContexts(currentContext) {
  rememberSymbolContext(currentContext);
  return [...latestSymbolContexts.values()];
}

function createStandbyFailsafeOutput() {
  return {
    status: "STANDBY",
    bias: "NO_TRADE",
    confidence: 0,
    message: "Failsafe brain is standing by.",
    triggeredBy: [],
    safeAction: "Continue observing without failsafe intervention."
  };
}

function createFinalDecision(
  tacticalBrain,
  behavioralRiskBrain,
  failsafeBrain,
  confidenceProfile,
  signalIntelligence
) {
  const shouldAvoid = failsafeBrain.status === "ACTIVE" ||
    confidenceProfile.level === "AVOID" ||
    signalIntelligence.quality === "AVOID";

  return {
    actionBias: shouldAvoid
      ? "NO_TRADE"
      : tacticalBrain.bias,
    confidence: confidenceProfile.score,
    message: failsafeBrain.status === "ACTIVE"
      ? failsafeBrain.message
      : confidenceProfile.level === "AVOID"
        ? "Confidence profile advises observation only."
      : "Brains are observing normalized inputs.",
    tacticalStatus: tacticalBrain.status,
    behavioralStatus: behavioralRiskBrain.status
  };
}

function needsFailsafeReview(tacticalBrain, behavioralRiskBrain, failsafeReason) {
  const confidenceCollapse = [tacticalBrain, behavioralRiskBrain].some((brain) => {
    return brain.status !== "OBSERVING" &&
      (
        typeof brain.confidence !== "number" ||
        !Number.isFinite(brain.confidence) ||
        brain.confidence <= 0
      );
  });
  const severeConflict = ["BULLISH", "BEARISH"].includes(tacticalBrain.bias) &&
    behavioralRiskBrain.bias === "BLOCKED";

  return Boolean(
    failsafeReason ||
    tacticalBrain.status === "DEGRADED" ||
    behavioralRiskBrain.status === "DEGRADED" ||
    confidenceCollapse ||
    severeConflict
  );
}

function createShadowEngineOutput(finalDecision) {
  return {
    bias: finalDecision.actionBias,
    confidence: finalDecision.confidence,
    reason: finalDecision.message
  };
}

function applyBehavioralRiskSuppression(alertReadiness, behavioralRiskAlignment) {
  if (behavioralRiskAlignment.riskAdjustment !== "SUPPRESS") {
    return alertReadiness;
  }

  return {
    ...alertReadiness,
    alertReady: false,
    priority: "NONE",
    warnings: [
      ...(Array.isArray(alertReadiness.warnings) ? alertReadiness.warnings : []),
      "Alert readiness is suppressed by behavioral risk alignment."
    ]
  };
}

function shouldPersistLocalArtifacts(systemContext = {}, marketEvent = {}) {
  // Closed-market simulation is for cockpit testing only. It must never write
  // journals or strategic snapshots, even if a caller passes persistence flags.
  if (isClosedMarketSimulationMode(systemContext)) {
    return false;
  }

  if (systemContext.persistLocalArtifacts === true) {
    return true;
  }

  if (
    systemContext.persistJournal === true ||
    systemContext.persistStrategicSnapshot === true
  ) {
    return true;
  }

  // Shadow and simulated streams can run for long periods, so they avoid
  // writing per-event local artifacts unless explicitly enabled above.
  const mode = typeof systemContext.mode === "string"
    ? systemContext.mode.toLowerCase()
    : "";
  const provider = typeof marketEvent.provider === "string"
    ? marketEvent.provider.toLowerCase()
    : "";

  return !mode.startsWith("shadow") && provider !== "simulated";
}

function skippedPersistenceResult(kind) {
  return {
    saved: false,
    journalId: null,
    snapshotId: null,
    reason: `${kind}_persistence_skipped_for_shadow_or_simulated_context`
  };
}

function persistJournalDraftSafely(journalDraft) {
  try {
    const saveResult = saveJournalDraft(journalDraft);

    return {
      saved: saveResult.saved === true,
      journalId: saveResult.journalId || null
    };
  } catch {
    // Local journal persistence cannot change brain decision behavior.
    return {
      saved: false,
      journalId: null
    };
  }
}

function persistStrategicSnapshotSafely(snapshotInput) {
  try {
    const snapshot = createStrategicSnapshot(snapshotInput);
    const saveResult = saveStrategicSnapshot(snapshot);

    return saveResult.saved === true
      ? {
        id: saveResult.snapshot.id,
        timestamp: saveResult.snapshot.timestamp,
        summary: saveResult.snapshot.summary
      }
      : {
        id: null,
        timestamp: null,
        summary: "Strategic snapshot was not saved."
      };
  } catch {
    // Snapshot persistence cannot change brain decision behavior.
    return {
      id: null,
      timestamp: null,
      summary: "Strategic snapshot failed safely."
    };
  }
}

function observeSupervisorShadow({
  marketEvent,
  context,
  tacticalBrain,
  behavioralRiskBrain,
  failsafeBrain,
  finalDecision
}) {
  if (isClosedMarketSimulationMode(context.systemContext)) {
    return {
      observed: true,
      logged: false,
      reason: "closed_market_sim_training_skipped"
    };
  }

  try {
    // Shadow Training accepts normalized market events only.
    const normalizedEvent = assertNormalizedMarketEvent(marketEvent);
    const shadowResult = observeShadowEvent({
      timestamp: normalizedEvent.timestamp,
      category: "momentum",
      provider: normalizedEvent.provider,
      symbol: normalizedEvent.symbol,
      timeframe: normalizedEvent.timeframe || "unknown",
      marketData: normalizedEvent,
      userContext: context.userContext,
      engineOutput: createShadowEngineOutput(finalDecision)
    }, {
      tacticalBrain,
      behavioralRiskBrain,
      failsafeBrain
    });

    return {
      observed: shadowResult.observed === true,
      logged: shadowResult.logged === true
    };
  } catch {
    // Training is an observer only. Failure cannot change brain decisions.
    return {
      observed: false,
      error: "shadow logging failed safely"
    };
  }
}

function superviseBrains(input = {}) {
  const context = {
    userContext: asObject(input.userContext),
    journalContext: asObject(input.journalContext),
    systemContext: asObject(input.systemContext)
  };

  let marketEvent = input.marketEvent;
  let failsafeReason = "";

  try {
    // Provider payloads are rejected here before any brain analysis runs.
    marketEvent = assertNormalizedMarketEvent(input.marketEvent);
    addMemoryEvent(marketEvent);
  } catch {
    failsafeReason = "MARKET_EVENT_VALIDATION_FAILED";
  }

  const tacticalBrain = analyzeTacticalMarketEvent(marketEvent);
  const behavioralRiskBrain = analyzeBehavioralRisk(context);
  const shouldRunFailsafe = needsFailsafeReview(
    tacticalBrain,
    behavioralRiskBrain,
    failsafeReason
  );
  const failsafeBrain = shouldRunFailsafe
    ? runFailsafeBrain({
      reason: failsafeReason,
      tacticalBrain,
      behavioralRiskBrain,
      marketEvent,
      systemContext: context.systemContext
    })
    : createStandbyFailsafeOutput();
  const recentMemory = marketEvent?.symbol
    ? getRecentMemory({
      symbol: marketEvent.symbol,
      timeframe: marketEvent.timeframe || "unknown"
    })
    : [];
  const confidenceProfile = calculateConfidence({
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    recentMemory,
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain
  });
  const signalIntelligence = evaluateSignalIntelligence({
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    recentMemory,
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain
  });
  const finalDecision = createFinalDecision(
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain,
    confidenceProfile,
    signalIntelligence
  );
  const narrativeIntelligence = buildMarketNarrative({
    symbol: marketEvent?.symbol,
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    signalIntelligence,
    behavioralRiskBrain,
    failsafeBrain
  });
  const alertReadiness = evaluateAlertReadiness({
    symbol: marketEvent?.symbol,
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    signalIntelligence,
    narrativeIntelligence,
    failsafeBrain,
    behavioralRiskBrain
  });
  const behavioralTimeline = marketEvent?.symbol
    ? buildTimeline({
      symbol: marketEvent.symbol,
      newestFirst: true,
      limit: 25
    })
    : [];
  const behavioralInsightSummary = buildInsightSummary({
    timeline: behavioralTimeline,
    symbol: marketEvent?.symbol
  });
  const behavioralIntelligence = evaluateBehavioralIntelligence({
    confidenceProfile,
    signalIntelligence,
    insightSummary: behavioralInsightSummary,
    behavioralRiskBrain,
    timeline: behavioralTimeline,
    systemContext: context.systemContext
  });
  const behavioralRiskAlignment = evaluateBehavioralRiskAlignment({
    behavioralIntelligence,
    confidenceProfile,
    signalIntelligence,
    alertReadiness,
    failsafeBrain
  });
  const adaptiveMemoryScore = scoreMemorySignificance({
    marketEvent,
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    signalIntelligence,
    alertReadiness,
    behavioralIntelligence,
    failsafeBrain
  });
  const anomalyIntelligence = evaluateAnomalyIntelligence({
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    signalIntelligence,
    behavioralIntelligence,
    adaptiveMemoryScore,
    multiSymbolContext: input.multiSymbolContext,
    failsafeBrain
  });
  const runtimeMetrics = getRuntimeMetrics();
  const runtimeHealth = evaluateRuntimeHealth({
    runtimeMetrics,
    failsafeBrain,
    anomalyIntelligence,
    confidenceProfile,
    streamStatus: input.streamStatus || {
      active: runtimeMetrics.activeStream,
      source: runtimeMetrics.streamSource,
      symbol: runtimeMetrics.streamSymbol,
      startedAt: runtimeMetrics.streamStartedAt,
      stoppedAt: runtimeMetrics.streamStoppedAt
    },
    memoryStatus: getMemoryStats()
  });
  const intelligenceConsensus = evaluateIntelligenceConsensus({
    confidenceProfile,
    signalIntelligence,
    behavioralIntelligence,
    behavioralRiskAlignment,
    anomalyIntelligence,
    multiSymbolContext: input.multiSymbolContext,
    runtimeHealth,
    failsafeBrain
  });
  const strategicEnvironment = evaluateStrategicEnvironment({
    intelligenceConsensus,
    runtimeHealth,
    anomalyIntelligence,
    confidenceProfile,
    behavioralIntelligence,
    multiSymbolContext: input.multiSymbolContext,
    adaptiveMemoryScore,
    failsafeBrain
  });
  const environmentalPressure = evaluateEnvironmentalPressure({
    strategicEnvironment,
    anomalyIntelligence,
    runtimeHealth,
    confidenceProfile,
    behavioralIntelligence,
    cognitiveDrift: input.cognitiveDrift,
    cognitiveTransitions: input.cognitiveTransitions,
    cognitiveCorrelations: input.cognitiveCorrelations,
    intelligenceConsensus
  });
  const intelligenceStabilityForecast = forecastIntelligenceStability({
    environmentalPressure,
    cognitiveDrift: input.cognitiveDrift,
    cognitiveTransitions: input.cognitiveTransitions,
    cognitiveCorrelations: input.cognitiveCorrelations,
    runtimeHealth,
    anomalyIntelligence,
    strategicEnvironment,
    intelligenceConsensus
  });
  const adaptiveCognitiveWeights = calculateCognitiveWeights({
    anomalyIntelligence,
    confidenceProfile,
    runtimeHealth,
    behavioralIntelligence,
    cognitiveDrift: input.cognitiveDrift,
    cognitiveTransitions: input.cognitiveTransitions,
    environmentalPressure,
    intelligenceConsensus,
    strategicEnvironment,
    intelligenceStabilityForecast
  });
  const symbolContexts = getAccumulatedSymbolContexts(buildSymbolContext({
    marketEvent,
    confidenceProfile,
    strategicEnvironment,
    anomalyIntelligence,
    intelligenceStabilityForecast,
    adaptiveMemoryScore,
    runtimeHealth,
    behavioralIntelligence
  }));
  const dynamicWatchlist = evaluateDynamicWatchlist({
    symbolContexts: Array.isArray(input.symbolContexts) && input.symbolContexts.length
      ? input.symbolContexts
      : symbolContexts,
    prioritizedInsights: input.prioritizedInsights,
    multiSymbolContext: input.multiSymbolContext,
    anomalyIntelligence,
    runtimeHealth,
    confidenceProfile,
    behavioralIntelligence,
    intelligenceConsensus,
    strategicEnvironment,
    environmentalPressure
  });
  const crossSymbolEcosystem = evaluateCrossSymbolCorrelation({
    symbolContexts: Array.isArray(input.symbolContexts) && input.symbolContexts.length
      ? input.symbolContexts
      : symbolContexts
  });
  const strategicEnvironmentMap = mapStrategicEnvironment({
    symbolContexts: Array.isArray(input.symbolContexts) && input.symbolContexts.length
      ? input.symbolContexts
      : symbolContexts
  });
  const adaptiveEcosystemPriority = prioritizeEcosystems({
    dynamicWatchlist,
    crossSymbolEcosystem,
    strategicEnvironmentMap,
    environmentalPressure,
    intelligenceStabilityForecast,
    anomalyIntelligence
  });
  const sectorHeatmap = buildSectorHeatmap({
    strategicEnvironmentMap
  });
  const cognitiveDrift = detectCognitiveDrift({
    strategicEnvironmentMap,
    sectorHeatmap
  });
  const environmentForecast = forecastStrategicEnvironment({
    strategicEnvironmentMap,
    cognitiveDrift
  });
  const marketStructure = evaluateMarketStructure({
    strategicEnvironmentMap,
    sectorHeatmap,
    cognitiveDrift,
    environmentForecast
  });
  const regimeTransition = evaluateRegimeTransition({
    strategicEnvironmentMap,
    cognitiveDrift,
    environmentForecast,
    marketStructure
  });
  const institutionalFlow = evaluateInstitutionalFlow({
    strategicEnvironmentMap,
    marketStructure,
    regimeTransition,
    adaptiveEcosystemPriority
  });
  const liquidityPressure = evaluateLiquidityPressure({
    strategicEnvironmentMap,
    marketStructure,
    environmentForecast,
    adaptiveEcosystemPriority,
    institutionalFlow
  });
  const crossBrainConsensus = evaluateCrossBrainConsensus({
    tacticalBrain,
    behavioralBrain: behavioralRiskBrain,
    failsafeBrain
  });
  const adaptiveSignalIntelligence = evaluateAdaptiveSignalIntelligence({
    strategicEnvironmentMap,
    crossSymbolEcosystem,
    marketStructure,
    regimeTransition,
    institutionalFlow,
    liquidityPressure,
    anomalyIntelligence,
    cognitiveDrift,
    crossBrainConsensus
  });
  const temporalHistory = rememberTemporalCognition({
    strategicEnvironment,
    confidenceProfile,
    crossBrainConsensus,
    cognitiveDrift,
    regimeTransition,
    liquidityPressure,
    anomalyIntelligence,
    crossSymbolEcosystem,
    adaptiveSignalIntelligence
  });
  const temporalMemory = evaluateTemporalMemory({
    history: temporalHistory
  });
  const recurrenceIntelligence = evaluateRecurrenceIntelligence({
    history: temporalHistory
  });
  const contextAging = evaluateContextAging({
    history: temporalHistory
  });
  const temporalSequence = evaluateTemporalSequence({
    history: temporalHistory
  });
  const environmentalCausality = evaluateEnvironmentalCausality({
    history: temporalHistory
  });
  const learningGuardrails = evaluateLearningGuardrails({
    history: temporalHistory,
    failsafeBrain,
    confidenceProfile
  });
  const adaptiveThresholds = evaluateAdaptiveThresholds({
    history: temporalHistory,
    learningGuardrails
  });
  const reinforcementWeighting = evaluateReinforcementWeighting({
    history: temporalHistory,
    recurrenceIntelligence
  });
  const cognitionCalibration = evaluateCognitionCalibration({
    history: temporalHistory
  });
  const replaySummaryForCopilot = {
    timelineSummary: behavioralTimeline.length
      ? `Replay timeline contains ${behavioralTimeline.length} recent cognition events.`
      : "Replay timeline is awaiting backend cognition.",
    replayFrameSummary: behavioralInsightSummary?.summary
  };
  const aiCopilotNarration = evaluateAiCopilotNarration({
    strategicEnvironment,
    adaptiveSignalIntelligence,
    crossBrainConsensus,
    temporalMemory,
    liquidityPressure,
    crossSymbolEcosystem,
    replaySummary: replaySummaryForCopilot
  });
  const explainabilityReasons = evaluateExplainabilityReasons({
    confidenceProfile,
    adaptiveSignalIntelligence,
    crossBrainConsensus,
    liquidityPressure,
    crossSymbolEcosystem,
    regimeTransition,
    temporalSequence,
    environmentalCausality
  });
  const priorityCognitionFeed = evaluatePriorityCognitionFeed({
    adaptiveSignalIntelligence,
    crossBrainConsensus,
    temporalMemory,
    liquidityPressure,
    environmentalCausality
  });
  const reasoningChains = evaluateReasoningChains({
    confidenceProfile,
    adaptiveSignalIntelligence,
    temporalSequence,
    crossSymbolEcosystem,
    crossBrainConsensus,
    liquidityPressure,
    environmentalCausality,
    explainabilityReasons
  });
  const replayTimeline = evaluateReplayTimeline({
    history: temporalHistory
  });
  const interactiveRegions = evaluateInteractiveRegions({
    crossSymbolEcosystem,
    strategicEnvironmentMap,
    sectorHeatmap
  });
  const shouldPersistArtifacts = !failsafeReason && shouldPersistLocalArtifacts(
    context.systemContext,
    marketEvent || {}
  );
  const strategicSnapshot = shouldPersistArtifacts
    ? persistStrategicSnapshotSafely({
      marketEvent,
      marketState: tacticalBrain.marketState,
      regime: tacticalBrain.regime,
      confidenceProfile,
      signalIntelligence,
      behavioralIntelligence,
      behavioralRiskAlignment,
      anomalyIntelligence,
      runtimeHealth,
      intelligenceConsensus,
      strategicEnvironment,
      adaptiveMemoryScore,
      multiSymbolContext: input.multiSymbolContext,
      failsafeBrain
    })
    : {
      id: null,
      timestamp: marketEvent?.timestamp || null,
      summary: "Strategic snapshot persistence skipped for shadow or simulated context.",
      reason: "strategic_snapshot_persistence_skipped_for_shadow_or_simulated_context"
    };
  const alignedAlertReadiness = applyBehavioralRiskSuppression(
    alertReadiness,
    behavioralRiskAlignment
  );
  const reflectionPrompts = buildReflectionPrompts({
    behavioralIntelligence,
    behavioralRiskAlignment,
    confidenceProfile,
    signalIntelligence,
    insightSummary: behavioralInsightSummary,
    alertReadiness: alignedAlertReadiness,
    systemContext: context.systemContext
  });
  const journalDraft = buildJournalDraft({
    symbol: marketEvent?.symbol,
    reflectionPrompts,
    behavioralIntelligence,
    behavioralRiskAlignment,
    signalIntelligence,
    confidenceProfile,
    insightSummary: behavioralInsightSummary,
    systemContext: context.systemContext
  });
  const persistedJournal = shouldPersistArtifacts
    ? persistJournalDraftSafely(journalDraft)
    : skippedPersistenceResult("journal");
  const signalCooldown = evaluateSignalCooldown({
    symbol: marketEvent?.symbol,
    alertReadiness: alignedAlertReadiness
  });
  const signalEventLog = logSignalEvent({
    symbol: marketEvent?.symbol,
    marketState: tacticalBrain.marketState,
    regime: tacticalBrain.regime,
    confidenceProfile,
    signalIntelligence,
    narrativeIntelligence,
    alertReadiness: alignedAlertReadiness,
    signalCooldown,
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain,
    timestamp: marketEvent?.timestamp
  });
  const shadowTraining = observeSupervisorShadow({
    marketEvent,
    context,
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain,
    finalDecision
  });

  const cognitionOutput = {
    tacticalBrain,
    behavioralRiskBrain,
    failsafeBrain,
    confidenceProfile,
    signalIntelligence,
    narrativeIntelligence,
    alertReadiness: alignedAlertReadiness,
    signalCooldown,
    signalEventLog,
    behavioralIntelligence,
    behavioralRiskAlignment,
    adaptiveMemoryScore,
    anomalyIntelligence,
    runtimeHealth,
    intelligenceConsensus,
    strategicEnvironment,
    environmentalPressure,
    intelligenceStabilityForecast,
    adaptiveCognitiveWeights,
    dynamicWatchlist,
    crossSymbolEcosystem,
    strategicEnvironmentMap,
    adaptiveEcosystemPriority,
    sectorHeatmap,
    cognitiveDrift,
    environmentForecast,
    marketStructure,
    regimeTransition,
    institutionalFlow,
    liquidityPressure,
    crossBrainConsensus,
    adaptiveSignalIntelligence,
    temporalMemory,
    recurrenceIntelligence,
    contextAging,
    temporalSequence,
    environmentalCausality,
    learningGuardrails,
    adaptiveThresholds,
    reinforcementWeighting,
    cognitionCalibration,
    aiCopilotNarration,
    explainabilityReasons,
    priorityCognitionFeed,
    reasoningChains,
    replayTimeline,
    interactiveRegions,
    strategicSnapshot,
    reflectionPrompts,
    journalDraft,
    persistedJournal,
    finalDecision,
    shadowTraining
  };

  try {
    const persistentMemory = persistCognitionMemory({
      marketEvent,
      cognition: cognitionOutput
    });
    const memoryEntries = persistentMemory.memoryEntries || [];
    cognitionOutput.persistentMemory = persistentMemory;
    cognitionOutput.environmentArchive = buildEnvironmentArchive({ memoryEntries });
    cognitionOutput.recurrenceIntelligenceArchive = buildRecurrenceIntelligence({ memoryEntries });
    cognitionOutput.driftEvolution = buildDriftEvolution({ memoryEntries });
    cognitionOutput.replayArchive = buildReplayArchive({ memoryEntries });
  } catch {
    cognitionOutput.persistentMemory = {
      memoryState: "DEGRADED",
      memoryEntries: [],
      retentionStatus: "UNKNOWN",
      compressionState: "UNKNOWN",
      warnings: ["Persistent cognition memory write failed safely."],
      summary: "Awaiting persistent cognition memory."
    };
    cognitionOutput.environmentArchive = buildEnvironmentArchive({ memoryEntries: [] });
    cognitionOutput.recurrenceIntelligenceArchive = buildRecurrenceIntelligence({ memoryEntries: [] });
    cognitionOutput.driftEvolution = buildDriftEvolution({ memoryEntries: [] });
    cognitionOutput.replayArchive = buildReplayArchive({ memoryEntries: [] });
  }

  try {
    // Store only a lightweight frontend-safe summary for read-only cockpit APIs.
    storeCognitionSnapshot({
      marketEvent,
      systemContext: context.systemContext,
      cognition: cognitionOutput
    });
  } catch {
    // Snapshot visibility cannot change brain decisions or ingestion behavior.
  }

  return cognitionOutput;
}

module.exports = {
  superviseBrains
};
