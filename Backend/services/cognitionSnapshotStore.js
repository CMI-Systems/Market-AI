const AWAITING = "Awaiting backend cognition";
const FORBIDDEN_WORD_PATTERN = /\b(BUY|SELL|CALL|PUT|entry|exit)\b/gi;
const AWAITING_WATCHLIST = "Awaiting watchlist ecosystem cognition.";
const AWAITING_ECOSYSTEM = "Awaiting cross-symbol ecosystem cognition.";
const AWAITING_ENVIRONMENT_MAP = "Awaiting strategic environment mapping cognition.";
const AWAITING_ECOSYSTEM_PRIORITY = "Awaiting adaptive ecosystem prioritization cognition.";
const AWAITING_SECTOR_HEATMAP = "Awaiting sector heatmap cognition.";
const AWAITING_COGNITIVE_DRIFT = "Awaiting cognitive drift cognition.";
const AWAITING_ENVIRONMENT_FORECAST = "Awaiting strategic environment forecast cognition.";
const AWAITING_MARKET_STRUCTURE = "Awaiting market structure cognition.";
const AWAITING_REGIME_TRANSITION = "Awaiting regime transition cognition.";
const AWAITING_INSTITUTIONAL_FLOW = "Awaiting institutional flow cognition.";
const AWAITING_LIQUIDITY_PRESSURE = "Awaiting liquidity pressure cognition.";
const AWAITING_ADAPTIVE_SIGNAL = "Awaiting adaptive signal cognition.";
const AWAITING_BRAIN_CONSENSUS = "Awaiting cross-brain consensus cognition.";
const AWAITING_TEMPORAL_MEMORY = "Awaiting temporal memory cognition.";
const AWAITING_RECURRENCE = "Awaiting recurrence cognition.";
const AWAITING_CONTEXT_AGING = "Awaiting context aging cognition.";
const AWAITING_TEMPORAL_SEQUENCE = "Awaiting temporal sequence cognition.";
const AWAITING_ENVIRONMENT_CAUSALITY = "Awaiting environmental causality cognition.";
const AWAITING_ADAPTIVE_THRESHOLDS = "Awaiting adaptive threshold cognition.";
const AWAITING_REINFORCEMENT_WEIGHTING = "Awaiting reinforcement weighting cognition.";
const AWAITING_COGNITION_CALIBRATION = "Awaiting cognition calibration.";
const AWAITING_LEARNING_GUARDRAILS = "Awaiting learning guardrail cognition.";
const AWAITING_AI_COPILOT_NARRATION = "Awaiting AI Copilot narration.";
const AWAITING_EXPLAINABILITY = "Awaiting explainability cognition.";
const AWAITING_PRIORITY_FEED = "Awaiting cognition feed.";
const AWAITING_REASONING_CHAINS = "Awaiting reasoning chains.";
const AWAITING_REPLAY_TIMELINE = "Awaiting replay timeline.";
const AWAITING_REGION_COGNITION = "Awaiting region cognition.";
const AWAITING_PERSISTENT_MEMORY = "Awaiting persistent cognition memory.";
const AWAITING_ENVIRONMENT_ARCHIVE = "Awaiting environment archive.";
const AWAITING_RECURRENCE_INTELLIGENCE = "Awaiting recurrence intelligence.";
const AWAITING_DRIFT_EVOLUTION = "Awaiting drift evolution.";
const AWAITING_REPLAY_ARCHIVE = "Awaiting replay archive.";

let latestSnapshot = null;

function safeString(value, fallback = AWAITING) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value.replace(FORBIDDEN_WORD_PATTERN, "restricted term");
}

function safeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function sanitize(value) {
  if (typeof value === "string") {
    return safeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((next, [key, item]) => {
      next[key] = sanitize(item);
      return next;
    }, {});
  }

  return value;
}

function summarizeBrain(brain = {}) {
  const rawBias = safeString(brain.bias, "UNKNOWN");
  const visualizationBias = rawBias === "NO_TRADE"
    ? "OBSERVATION_ONLY"
    : rawBias;

  return sanitize({
    status: safeString(brain.status, "UNKNOWN"),
    bias: visualizationBias,
    confidence: safeNumber(brain.confidence),
    reason: safeString(brain.reason || brain.message, AWAITING)
  });
}

function buildEscalation(cognition = {}) {
  const runtimeHealth = safeObject(cognition.runtimeHealth);
  const anomalyIntelligence = safeObject(cognition.anomalyIntelligence);
  const strategicEnvironment = safeObject(cognition.strategicEnvironment);
  const environmentalPressure = safeObject(cognition.environmentalPressure);
  const stabilityForecast = safeObject(cognition.intelligenceStabilityForecast);
  const consensus = safeObject(cognition.intelligenceConsensus);
  const triggers = [];

  if (runtimeHealth.status === "CRITICAL") {
    triggers.push("runtime_health_critical");
  }

  if (["HIGH", "CRITICAL"].includes(anomalyIntelligence.severity)) {
    triggers.push("elevated_anomaly_context");
  }

  if (strategicEnvironment.environment === "HIGH_RISK") {
    triggers.push("strategic_environment_high_risk");
  }

  if (environmentalPressure.pressureLevel === "EXTREME") {
    triggers.push("environmental_pressure_extreme");
  }

  if (stabilityForecast.trajectory === "FRAGMENTING") {
    triggers.push("stability_fragmenting");
  }

  if (consensus.consensusStrength === "CONFLICTED") {
    triggers.push("consensus_conflicted");
  }

  const escalationLevel = triggers.some((trigger) => {
    return trigger.includes("critical") || trigger.includes("extreme") || trigger.includes("fragmenting");
  })
    ? "HIGH"
    : triggers.length
      ? "MODERATE"
      : "NONE";

  return sanitize({
    escalationLevel,
    triggers,
    elevatedEvents: triggers.map((trigger) => ({
      type: trigger,
      level: escalationLevel,
      summary: "Backend cognition flagged this context for operator review."
    })),
    summary: triggers.length
      ? `${escalationLevel} escalation context is visible across backend cognition.`
      : "Escalation context is calm across available backend cognition."
  });
}

function buildReplaySummary(cognition = {}) {
  const signalEventLog = safeObject(cognition.signalEventLog);
  const strategicSnapshot = safeObject(cognition.strategicSnapshot);
  const behavioralIntelligence = safeObject(cognition.behavioralIntelligence);

  return sanitize({
    recentEvents: signalEventLog.logged
      ? [{
        type: "signal_event",
        summary: safeString(signalEventLog.reason, "Signal event was processed.")
      }]
      : [],
    recentSnapshots: strategicSnapshot.id
      ? [{
        id: strategicSnapshot.id,
        summary: safeString(strategicSnapshot.summary)
      }]
      : [],
    compressionSummary: "Replay compression endpoint pending.",
    timelineSummary: safeString(behavioralIntelligence.summary, "Timeline summary endpoint pending."),
    replayFrameSummary: "Replay frame endpoint pending."
  });
}

function summarizeAnomalies(anomalyIntelligence = {}) {
  return sanitize({
    anomalyDetected: anomalyIntelligence.anomalyDetected === true,
    severity: safeString(anomalyIntelligence.severity, "UNKNOWN"),
    anomalyTypes: safeArray(anomalyIntelligence.anomalyTypes).map(safeString),
    warnings: safeArray(anomalyIntelligence.warnings).map(safeString),
    summary: safeString(anomalyIntelligence.summary, "Awaiting anomaly cognition.")
  });
}

function summarizeWatchlist(dynamicWatchlist = {}) {
  const prioritizedSymbols = safeArray(dynamicWatchlist.prioritizedSymbols);

  if (prioritizedSymbols.length < 2) {
    return sanitize({
      watchlistPriority: "BACKGROUND",
      prioritizedSymbols: [],
      groupedContexts: [],
      warnings: [],
      observations: [],
      summary: AWAITING_WATCHLIST
    });
  }

  return sanitize({
    watchlistPriority: safeString(dynamicWatchlist.watchlistPriority, "BACKGROUND"),
    prioritizedSymbols: prioritizedSymbols.slice(0, 8).map((symbol) => {
      const item = safeObject(symbol);

      return {
        symbol: safeString(item.symbol, "UNKNOWN"),
        focus: safeString(item.focus, "BACKGROUND"),
        score: safeNumber(item.priorityScore || item.score),
        reasons: safeArray(item.reasons).slice(0, 3).map(safeString)
      };
    }),
    groupedContexts: safeArray(dynamicWatchlist.groupedContexts).slice(0, 8).map((context) => {
      const item = safeObject(context);

      return {
        label: safeString(item.label || item.group || item.environment || item.alignment, "UNKNOWN"),
        environment: safeString(item.environment, "UNKNOWN"),
        alignment: safeString(item.alignment, "UNKNOWN"),
        count: safeNumber(item.count)
      };
    }),
    warnings: safeArray(dynamicWatchlist.warnings).map(safeString),
    observations: safeArray(dynamicWatchlist.observations).map(safeString),
    summary: safeString(dynamicWatchlist.summary, AWAITING_WATCHLIST)
  });
}

function summarizeEcosystem(crossSymbolEcosystem = {}) {
  const synchronizedSymbols = safeArray(crossSymbolEcosystem.synchronizedSymbols);
  const divergentSymbols = safeArray(crossSymbolEcosystem.divergentSymbols);
  const ecosystemGroups = safeArray(crossSymbolEcosystem.ecosystemGroups);

  if (synchronizedSymbols.length + divergentSymbols.length < 2) {
    return sanitize({
      ecosystemState: "UNKNOWN",
      correlationStrength: "UNKNOWN",
      synchronizedSymbols: [],
      divergentSymbols: [],
      pressureClusters: [],
      ecosystemGroups: [],
      warnings: [],
      summary: AWAITING_ECOSYSTEM
    });
  }

  return sanitize({
    ecosystemState: safeString(crossSymbolEcosystem.ecosystemState, "UNKNOWN"),
    correlationStrength: safeString(crossSymbolEcosystem.correlationStrength, "UNKNOWN"),
    synchronizedSymbols: synchronizedSymbols.map(safeString),
    divergentSymbols: divergentSymbols.map(safeString),
    pressureClusters: safeArray(crossSymbolEcosystem.pressureClusters).slice(0, 8).map((cluster) => {
      const item = safeObject(cluster);

      return {
        pressureState: safeString(item.pressureState, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString),
        count: safeNumber(item.count)
      };
    }),
    ecosystemGroups: ecosystemGroups.slice(0, 8).map((group) => {
      const item = safeObject(group);

      return {
        group: safeString(item.group, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString),
        pressureState: safeString(item.pressureState, "UNKNOWN"),
        count: safeNumber(item.count)
      };
    }),
    warnings: safeArray(crossSymbolEcosystem.warnings).map(safeString),
    summary: safeString(crossSymbolEcosystem.summary, AWAITING_ECOSYSTEM)
  });
}

function summarizeEnvironmentMap(strategicEnvironmentMap = {}) {
  const ecosystemRegions = safeArray(strategicEnvironmentMap.ecosystemRegions);

  if (!ecosystemRegions.length) {
    return sanitize({
      globalEnvironmentState: "UNKNOWN",
      ecosystemRegions: [],
      pressureMap: [],
      fragmentationZones: [],
      synchronizationZones: [],
      transitionSignals: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_MAP
    });
  }

  return sanitize({
    globalEnvironmentState: safeString(strategicEnvironmentMap.globalEnvironmentState, "UNKNOWN"),
    ecosystemRegions: ecosystemRegions.slice(0, 8).map((region) => {
      const item = safeObject(region);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        state: safeString(item.state, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        synchronization: safeString(item.synchronization, "UNKNOWN"),
        fragmentation: item.fragmentation === true,
        trajectory: safeString(item.trajectory, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    pressureMap: safeArray(strategicEnvironmentMap.pressureMap).slice(0, 8).map((region) => {
      const item = safeObject(region);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        state: safeString(item.state, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    fragmentationZones: safeArray(strategicEnvironmentMap.fragmentationZones).slice(0, 8).map((zone) => {
      const item = safeObject(zone);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    synchronizationZones: safeArray(strategicEnvironmentMap.synchronizationZones).slice(0, 8).map((zone) => {
      const item = safeObject(zone);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        state: safeString(item.state, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    transitionSignals: safeArray(strategicEnvironmentMap.transitionSignals).slice(0, 8).map((signal) => {
      const item = safeObject(signal);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        transition: safeString(item.transition, "UNKNOWN"),
        trajectory: safeString(item.trajectory, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    warnings: safeArray(strategicEnvironmentMap.warnings).map(safeString),
    summary: safeString(strategicEnvironmentMap.summary, AWAITING_ENVIRONMENT_MAP)
  });
}

function summarizeEcosystemPriority(adaptiveEcosystemPriority = {}) {
  const prioritizedEcosystems = safeArray(adaptiveEcosystemPriority.prioritizedEcosystems);

  if (!prioritizedEcosystems.length) {
    return sanitize({
      priorityLevel: "UNKNOWN",
      prioritizedEcosystems: [],
      priorityDrivers: [],
      suppressedEcosystems: [],
      propagationState: "UNKNOWN",
      originRegions: [],
      receivingRegions: [],
      propagationPaths: [],
      warnings: [],
      summary: AWAITING_ECOSYSTEM_PRIORITY
    });
  }

  return sanitize({
    priorityLevel: safeString(adaptiveEcosystemPriority.priorityLevel, "UNKNOWN"),
    prioritizedEcosystems: prioritizedEcosystems.slice(0, 8).map((ecosystem) => {
      const item = safeObject(ecosystem);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        priority: safeString(item.priority, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        synchronization: safeString(item.synchronization, "UNKNOWN"),
        fragmentation: item.fragmentation === true,
        trajectory: safeString(item.trajectory, "UNKNOWN"),
        drivers: safeArray(item.drivers).map(safeString)
      };
    }),
    priorityDrivers: safeArray(adaptiveEcosystemPriority.priorityDrivers).map(safeString),
    suppressedEcosystems: safeArray(adaptiveEcosystemPriority.suppressedEcosystems).map((ecosystem) => {
      const item = safeObject(ecosystem);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        reason: safeString(item.reason, AWAITING)
      };
    }),
    propagationState: safeString(adaptiveEcosystemPriority.propagationState, "UNKNOWN"),
    originRegions: safeArray(adaptiveEcosystemPriority.originRegions).map(safeString),
    receivingRegions: safeArray(adaptiveEcosystemPriority.receivingRegions).map(safeString),
    propagationPaths: safeArray(adaptiveEcosystemPriority.propagationPaths).slice(0, 8).map((path) => {
      const item = safeObject(path);

      return {
        from: safeString(item.from, "UNKNOWN"),
        to: safeString(item.to, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        pathwayState: safeString(item.pathwayState, "UNKNOWN")
      };
    }),
    warnings: safeArray(adaptiveEcosystemPriority.warnings).map(safeString),
    summary: safeString(adaptiveEcosystemPriority.summary, AWAITING_ECOSYSTEM_PRIORITY)
  });
}

function summarizeSectorHeatmap(sectorHeatmap = {}) {
  const sectors = safeArray(sectorHeatmap.sectors);

  if (!sectors.length) {
    return sanitize({
      heatmapState: "UNKNOWN",
      sectors: [],
      warnings: [],
      summary: AWAITING_SECTOR_HEATMAP
    });
  }

  return sanitize({
    heatmapState: safeString(sectorHeatmap.heatmapState, "UNKNOWN"),
    sectors: sectors.slice(0, 8).map((sector) => {
      const item = safeObject(sector);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        stability: safeString(item.stability, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        synchronization: safeString(item.synchronization, "UNKNOWN"),
        fragmentation: item.fragmentation === true,
        trajectory: safeString(item.trajectory, "UNKNOWN"),
        confidence: safeString(item.confidence, "UNKNOWN")
      };
    }),
    warnings: safeArray(sectorHeatmap.warnings).map(safeString),
    summary: safeString(sectorHeatmap.summary, AWAITING_SECTOR_HEATMAP)
  });
}

function summarizeCognitiveDrift(cognitiveDrift = {}) {
  const driftSignals = safeArray(cognitiveDrift.driftSignals);

  if (!driftSignals.length && cognitiveDrift.driftState !== "STABLE") {
    return sanitize({
      driftState: "UNKNOWN",
      driftSignals: [],
      affectedEcosystems: [],
      severity: "LOW",
      warnings: [],
      summary: AWAITING_COGNITIVE_DRIFT
    });
  }

  return sanitize({
    driftState: safeString(cognitiveDrift.driftState, "UNKNOWN"),
    driftSignals: driftSignals.slice(0, 8).map((signal) => {
      const item = safeObject(signal);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        type: safeString(item.type, "UNKNOWN"),
        detail: safeString(item.detail, AWAITING)
      };
    }),
    affectedEcosystems: safeArray(cognitiveDrift.affectedEcosystems).map(safeString),
    severity: safeString(cognitiveDrift.severity, "LOW"),
    warnings: safeArray(cognitiveDrift.warnings).map(safeString),
    summary: safeString(cognitiveDrift.summary, AWAITING_COGNITIVE_DRIFT)
  });
}

function summarizeEnvironmentForecast(environmentForecast = {}) {
  const forecasts = safeArray(environmentForecast.ecosystemForecasts);

  if (!forecasts.length) {
    return sanitize({
      forecastState: "UNKNOWN",
      confidenceTrajectory: "UNKNOWN",
      ecosystemForecasts: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_FORECAST
    });
  }

  return sanitize({
    forecastState: safeString(environmentForecast.forecastState, "UNKNOWN"),
    confidenceTrajectory: safeString(environmentForecast.confidenceTrajectory, "UNKNOWN"),
    ecosystemForecasts: forecasts.slice(0, 8).map((forecast) => {
      const item = safeObject(forecast);

      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        forecastState: safeString(item.forecastState, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        trajectory: safeString(item.trajectory, "UNKNOWN")
      };
    }),
    warnings: safeArray(environmentForecast.warnings).map(safeString),
    summary: safeString(environmentForecast.summary, AWAITING_ENVIRONMENT_FORECAST)
  });
}

function summarizeMarketStructure(marketStructure = {}) {
  if (!marketStructure.structureState) {
    return sanitize({
      structureState: "UNKNOWN",
      structureQuality: "UNKNOWN",
      affectedSymbols: [],
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_MARKET_STRUCTURE
    });
  }

  return sanitize({
    structureState: safeString(marketStructure.structureState, "UNKNOWN"),
    structureQuality: safeString(marketStructure.structureQuality, "UNKNOWN"),
    affectedSymbols: safeArray(marketStructure.affectedSymbols).map(safeString),
    affectedEcosystems: safeArray(marketStructure.affectedEcosystems).map(safeString),
    warnings: safeArray(marketStructure.warnings).map(safeString),
    summary: safeString(marketStructure.summary, AWAITING_MARKET_STRUCTURE)
  });
}

function summarizeRegimeTransition(regimeTransition = {}) {
  if (!regimeTransition.regimeState) {
    return sanitize({
      regimeState: "UNKNOWN",
      transitionState: "UNKNOWN",
      transitionRisk: "UNKNOWN",
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_REGIME_TRANSITION
    });
  }

  return sanitize({
    regimeState: safeString(regimeTransition.regimeState, "UNKNOWN"),
    transitionState: safeString(regimeTransition.transitionState, "UNKNOWN"),
    transitionRisk: safeString(regimeTransition.transitionRisk, "UNKNOWN"),
    affectedEcosystems: safeArray(regimeTransition.affectedEcosystems).map(safeString),
    warnings: safeArray(regimeTransition.warnings).map(safeString),
    summary: safeString(regimeTransition.summary, AWAITING_REGIME_TRANSITION)
  });
}

function summarizeInstitutionalFlow(institutionalFlow = {}) {
  if (!institutionalFlow.flowState) {
    return sanitize({
      flowState: "UNKNOWN",
      flowStrength: "UNKNOWN",
      synchronizedRegions: [],
      divergingRegions: [],
      flowClusters: [],
      warnings: [],
      summary: AWAITING_INSTITUTIONAL_FLOW
    });
  }

  return sanitize({
    flowState: safeString(institutionalFlow.flowState, "UNKNOWN"),
    flowStrength: safeString(institutionalFlow.flowStrength, "UNKNOWN"),
    synchronizedRegions: safeArray(institutionalFlow.synchronizedRegions).map(safeString),
    divergingRegions: safeArray(institutionalFlow.divergingRegions).map(safeString),
    flowClusters: safeArray(institutionalFlow.flowClusters).slice(0, 8).map((cluster) => {
      const item = safeObject(cluster);
      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        synchronization: safeString(item.synchronization, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    warnings: safeArray(institutionalFlow.warnings).map(safeString),
    summary: safeString(institutionalFlow.summary, AWAITING_INSTITUTIONAL_FLOW)
  });
}

function summarizeLiquidityPressure(liquidityPressure = {}) {
  if (!liquidityPressure.liquidityState) {
    return sanitize({
      liquidityState: "UNKNOWN",
      pressureState: "UNKNOWN",
      vulnerabilityLevel: "UNKNOWN",
      affectedEcosystems: [],
      pressureZones: [],
      warnings: [],
      summary: AWAITING_LIQUIDITY_PRESSURE
    });
  }

  return sanitize({
    liquidityState: safeString(liquidityPressure.liquidityState, "UNKNOWN"),
    pressureState: safeString(liquidityPressure.pressureState, "UNKNOWN"),
    vulnerabilityLevel: safeString(liquidityPressure.vulnerabilityLevel, "UNKNOWN"),
    affectedEcosystems: safeArray(liquidityPressure.affectedEcosystems).map(safeString),
    pressureZones: safeArray(liquidityPressure.pressureZones).slice(0, 8).map((zone) => {
      const item = safeObject(zone);
      return {
        ecosystem: safeString(item.ecosystem, "UNKNOWN"),
        pressure: safeString(item.pressure, "UNKNOWN"),
        vulnerability: safeString(item.vulnerability, "UNKNOWN"),
        symbols: safeArray(item.symbols).map(safeString)
      };
    }),
    warnings: safeArray(liquidityPressure.warnings).map(safeString),
    summary: safeString(liquidityPressure.summary, AWAITING_LIQUIDITY_PRESSURE)
  });
}

function summarizeCrossBrainConsensus(crossBrainConsensus = {}) {
  if (!crossBrainConsensus.consensusState) {
    return sanitize({
      consensusState: "UNKNOWN",
      agreementStrength: "UNKNOWN",
      divergenceRisk: "UNKNOWN",
      participatingBrains: [],
      warnings: [],
      summary: AWAITING_BRAIN_CONSENSUS
    });
  }

  return sanitize({
    consensusState: safeString(crossBrainConsensus.consensusState, "UNKNOWN"),
    agreementStrength: safeString(crossBrainConsensus.agreementStrength, "UNKNOWN"),
    divergenceRisk: safeString(crossBrainConsensus.divergenceRisk, "UNKNOWN"),
    participatingBrains: safeArray(crossBrainConsensus.participatingBrains).map((brain) => {
      const item = safeObject(brain);
      return {
        name: safeString(item.name, "UNKNOWN"),
        status: safeString(item.status, "UNKNOWN"),
        confidence: safeNumber(item.confidence)
      };
    }),
    warnings: safeArray(crossBrainConsensus.warnings).map(safeString),
    summary: safeString(crossBrainConsensus.summary, AWAITING_BRAIN_CONSENSUS)
  });
}

function summarizeAdaptiveSignal(adaptiveSignalIntelligence = {}) {
  if (!adaptiveSignalIntelligence.signalState) {
    return sanitize({
      signalState: "UNKNOWN",
      signalTrust: "UNKNOWN",
      suppressionLevel: "NONE",
      reinforcementLevel: "NONE",
      coherenceLevel: "UNKNOWN",
      confidenceWeight: 0,
      warnings: [],
      summary: AWAITING_ADAPTIVE_SIGNAL
    });
  }

  return sanitize({
    signalState: safeString(adaptiveSignalIntelligence.signalState, "UNKNOWN"),
    signalTrust: safeString(adaptiveSignalIntelligence.signalTrust, "UNKNOWN"),
    suppressionLevel: safeString(adaptiveSignalIntelligence.suppressionLevel, "NONE"),
    reinforcementLevel: safeString(adaptiveSignalIntelligence.reinforcementLevel, "NONE"),
    coherenceLevel: safeString(adaptiveSignalIntelligence.coherenceLevel, "UNKNOWN"),
    confidenceWeight: safeNumber(adaptiveSignalIntelligence.confidenceWeight),
    warnings: safeArray(adaptiveSignalIntelligence.warnings).map(safeString),
    summary: safeString(adaptiveSignalIntelligence.summary, AWAITING_ADAPTIVE_SIGNAL)
  });
}

function summarizeTemporalMemory(temporalMemory = {}) {
  if (!temporalMemory.temporalState) {
    return sanitize({
      temporalState: "UNKNOWN",
      memoryDepth: "UNKNOWN",
      recurringPatterns: [],
      agingContexts: [],
      longHorizonSignals: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_MEMORY
    });
  }

  const summarizePattern = (pattern) => {
    const item = safeObject(pattern);
    return {
      type: safeString(item.type, "UNKNOWN"),
      value: safeString(item.value, "UNKNOWN"),
      count: safeNumber(item.count)
    };
  };

  return sanitize({
    temporalState: safeString(temporalMemory.temporalState, "UNKNOWN"),
    memoryDepth: safeString(temporalMemory.memoryDepth, "UNKNOWN"),
    recurringPatterns: safeArray(temporalMemory.recurringPatterns).slice(0, 8).map(summarizePattern),
    agingContexts: safeArray(temporalMemory.agingContexts).map(safeString),
    longHorizonSignals: safeArray(temporalMemory.longHorizonSignals).slice(0, 8).map(summarizePattern),
    warnings: safeArray(temporalMemory.warnings).map(safeString),
    summary: safeString(temporalMemory.summary, AWAITING_TEMPORAL_MEMORY)
  });
}

function summarizeRecurrence(recurrenceIntelligence = {}) {
  if (!recurrenceIntelligence.recurrenceState) {
    return sanitize({
      recurrenceState: "UNKNOWN",
      recurrenceStrength: "UNKNOWN",
      recurringThemes: [],
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_RECURRENCE
    });
  }

  return sanitize({
    recurrenceState: safeString(recurrenceIntelligence.recurrenceState, "UNKNOWN"),
    recurrenceStrength: safeString(recurrenceIntelligence.recurrenceStrength, "UNKNOWN"),
    recurringThemes: safeArray(recurrenceIntelligence.recurringThemes).slice(0, 8).map((theme) => {
      const item = safeObject(theme);
      return {
        theme: safeString(item.theme, "UNKNOWN"),
        value: safeString(item.value, "UNKNOWN"),
        count: safeNumber(item.count)
      };
    }),
    affectedEcosystems: safeArray(recurrenceIntelligence.affectedEcosystems).map(safeString),
    warnings: safeArray(recurrenceIntelligence.warnings).map(safeString),
    summary: safeString(recurrenceIntelligence.summary, AWAITING_RECURRENCE)
  });
}

function summarizeContextAging(contextAging = {}) {
  if (!contextAging.contextAgeState) {
    return sanitize({
      contextAgeState: "UNKNOWN",
      freshnessScore: 0,
      staleContexts: [],
      warnings: [],
      summary: AWAITING_CONTEXT_AGING
    });
  }

  return sanitize({
    contextAgeState: safeString(contextAging.contextAgeState, "UNKNOWN"),
    freshnessScore: safeNumber(contextAging.freshnessScore),
    staleContexts: safeArray(contextAging.staleContexts).map(safeString),
    warnings: safeArray(contextAging.warnings).map(safeString),
    summary: safeString(contextAging.summary, AWAITING_CONTEXT_AGING)
  });
}

function summarizeTemporalSequence(temporalSequence = {}) {
  if (!temporalSequence.sequenceState) {
    return sanitize({
      sequenceState: "UNKNOWN",
      progressionMomentum: "UNKNOWN",
      sequenceConfidence: "UNKNOWN",
      activeSequences: [],
      transitionChains: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_SEQUENCE
    });
  }

  const summarizeChain = (chain) => {
    const item = safeObject(chain);
    return {
      type: safeString(item.type, "UNKNOWN"),
      from: safeString(item.from, "UNKNOWN"),
      to: safeString(item.to, "UNKNOWN"),
      count: safeNumber(item.count),
      label: safeString(item.label, "UNKNOWN")
    };
  };

  return sanitize({
    sequenceState: safeString(temporalSequence.sequenceState, "UNKNOWN"),
    progressionMomentum: safeString(temporalSequence.progressionMomentum, "UNKNOWN"),
    sequenceConfidence: safeString(temporalSequence.sequenceConfidence, "UNKNOWN"),
    activeSequences: safeArray(temporalSequence.activeSequences).slice(0, 8).map(summarizeChain),
    transitionChains: safeArray(temporalSequence.transitionChains).slice(0, 8).map(summarizeChain),
    warnings: safeArray(temporalSequence.warnings).map(safeString),
    summary: safeString(temporalSequence.summary, AWAITING_TEMPORAL_SEQUENCE)
  });
}

function summarizeEnvironmentalCausality(environmentalCausality = {}) {
  if (!environmentalCausality.causalityState) {
    return sanitize({
      causalityState: "UNKNOWN",
      dominantDrivers: [],
      influenceChains: [],
      affectedRegions: [],
      causalityConfidence: "UNKNOWN",
      warnings: [],
      summary: AWAITING_ENVIRONMENT_CAUSALITY
    });
  }

  return sanitize({
    causalityState: safeString(environmentalCausality.causalityState, "UNKNOWN"),
    dominantDrivers: safeArray(environmentalCausality.dominantDrivers).slice(0, 8).map((driver) => {
      const item = safeObject(driver);
      return {
        driver: safeString(item.driver, "UNKNOWN"),
        reason: safeString(item.reason, AWAITING_ENVIRONMENT_CAUSALITY),
        count: safeNumber(item.count)
      };
    }),
    influenceChains: safeArray(environmentalCausality.influenceChains).slice(0, 8).map((chain) => {
      const item = safeObject(chain);
      return {
        driver: safeString(item.driver, "UNKNOWN"),
        from: safeString(item.from, "UNKNOWN"),
        to: safeString(item.to, "UNKNOWN"),
        effect: safeString(item.effect, "UNKNOWN")
      };
    }),
    affectedRegions: safeArray(environmentalCausality.affectedRegions).map(safeString),
    causalityConfidence: safeString(environmentalCausality.causalityConfidence, "UNKNOWN"),
    warnings: safeArray(environmentalCausality.warnings).map(safeString),
    summary: safeString(environmentalCausality.summary, AWAITING_ENVIRONMENT_CAUSALITY)
  });
}

function summarizeAdaptiveThresholds(adaptiveThresholds = {}) {
  if (!adaptiveThresholds.thresholdState) {
    return sanitize({
      thresholdState: "UNKNOWN",
      adjustedThresholds: {},
      adjustmentReasons: [],
      warnings: [],
      summary: AWAITING_ADAPTIVE_THRESHOLDS
    });
  }

  return sanitize({
    thresholdState: safeString(adaptiveThresholds.thresholdState, "UNKNOWN"),
    adjustedThresholds: safeObject(adaptiveThresholds.adjustedThresholds),
    adjustmentReasons: safeArray(adaptiveThresholds.adjustmentReasons).map(safeString),
    warnings: safeArray(adaptiveThresholds.warnings).map(safeString),
    summary: safeString(adaptiveThresholds.summary, AWAITING_ADAPTIVE_THRESHOLDS)
  });
}

function summarizeReinforcementWeighting(reinforcementWeighting = {}) {
  if (!reinforcementWeighting.reinforcementState) {
    return sanitize({
      reinforcementState: "UNKNOWN",
      reinforcedFactors: [],
      weakenedFactors: [],
      learningWeight: 0,
      warnings: [],
      summary: AWAITING_REINFORCEMENT_WEIGHTING
    });
  }

  const summarizeFactor = (factor) => {
    const item = safeObject(factor);
    return {
      factor: safeString(item.factor, "UNKNOWN"),
      weight: safeString(item.weight, "UNKNOWN")
    };
  };

  return sanitize({
    reinforcementState: safeString(reinforcementWeighting.reinforcementState, "UNKNOWN"),
    reinforcedFactors: safeArray(reinforcementWeighting.reinforcedFactors).slice(0, 8).map(summarizeFactor),
    weakenedFactors: safeArray(reinforcementWeighting.weakenedFactors).slice(0, 8).map(summarizeFactor),
    learningWeight: safeNumber(reinforcementWeighting.learningWeight),
    warnings: safeArray(reinforcementWeighting.warnings).map(safeString),
    summary: safeString(reinforcementWeighting.summary, AWAITING_REINFORCEMENT_WEIGHTING)
  });
}

function summarizeCognitionCalibration(cognitionCalibration = {}) {
  if (!cognitionCalibration.calibrationState) {
    return sanitize({
      calibrationState: "UNKNOWN",
      confidenceCalibration: "UNKNOWN",
      suppressionCalibration: "UNKNOWN",
      consensusCalibration: "UNKNOWN",
      warnings: [],
      summary: AWAITING_COGNITION_CALIBRATION
    });
  }

  return sanitize({
    calibrationState: safeString(cognitionCalibration.calibrationState, "UNKNOWN"),
    confidenceCalibration: safeString(cognitionCalibration.confidenceCalibration, "UNKNOWN"),
    suppressionCalibration: safeString(cognitionCalibration.suppressionCalibration, "UNKNOWN"),
    consensusCalibration: safeString(cognitionCalibration.consensusCalibration, "UNKNOWN"),
    warnings: safeArray(cognitionCalibration.warnings).map(safeString),
    summary: safeString(cognitionCalibration.summary, AWAITING_COGNITION_CALIBRATION)
  });
}

function summarizeLearningGuardrails(learningGuardrails = {}) {
  if (!learningGuardrails.guardrailState) {
    return sanitize({
      learningAllowed: false,
      guardrailState: "UNKNOWN",
      blockedReasons: [],
      warnings: [],
      summary: AWAITING_LEARNING_GUARDRAILS
    });
  }

  return sanitize({
    learningAllowed: learningGuardrails.learningAllowed === true,
    guardrailState: safeString(learningGuardrails.guardrailState, "UNKNOWN"),
    blockedReasons: safeArray(learningGuardrails.blockedReasons).map(safeString),
    warnings: safeArray(learningGuardrails.warnings).map(safeString),
    summary: safeString(learningGuardrails.summary, AWAITING_LEARNING_GUARDRAILS)
  });
}

function summarizeAiCopilot(copilot = {}) {
  if (!copilot.narrationState) {
    return sanitize({
      narrationState: "UNKNOWN",
      cognitionSummary: AWAITING_AI_COPILOT_NARRATION,
      environmentSummary: AWAITING_AI_COPILOT_NARRATION,
      consensusSummary: AWAITING_AI_COPILOT_NARRATION,
      riskSummary: AWAITING_AI_COPILOT_NARRATION,
      replaySummary: AWAITING_AI_COPILOT_NARRATION,
      warnings: [],
      summary: AWAITING_AI_COPILOT_NARRATION
    });
  }

  return sanitize({
    narrationState: safeString(copilot.narrationState, "UNKNOWN"),
    cognitionSummary: safeString(copilot.cognitionSummary, AWAITING_AI_COPILOT_NARRATION),
    environmentSummary: safeString(copilot.environmentSummary, AWAITING_AI_COPILOT_NARRATION),
    consensusSummary: safeString(copilot.consensusSummary, AWAITING_AI_COPILOT_NARRATION),
    riskSummary: safeString(copilot.riskSummary, AWAITING_AI_COPILOT_NARRATION),
    replaySummary: safeString(copilot.replaySummary, AWAITING_AI_COPILOT_NARRATION),
    warnings: safeArray(copilot.warnings).map(safeString),
    summary: safeString(copilot.summary, AWAITING_AI_COPILOT_NARRATION)
  });
}

function summarizeExplainability(explainability = {}) {
  if (!explainability.explainabilityState) {
    return sanitize({
      explainabilityState: "UNKNOWN",
      reasoningChains: [],
      dominantFactors: [],
      suppressionReasons: [],
      reinforcementReasons: [],
      warnings: [],
      summary: AWAITING_EXPLAINABILITY
    });
  }

  return sanitize({
    explainabilityState: safeString(explainability.explainabilityState, "UNKNOWN"),
    reasoningChains: safeArray(explainability.reasoningChains).slice(0, 8).map((chain) => {
      const item = safeObject(chain);
      return {
        factor: safeString(item.factor, "UNKNOWN"),
        reason: safeString(item.reason, AWAITING_EXPLAINABILITY),
        effect: safeString(item.effect, "UNKNOWN")
      };
    }),
    dominantFactors: safeArray(explainability.dominantFactors).map(safeString),
    suppressionReasons: safeArray(explainability.suppressionReasons).map(safeString),
    reinforcementReasons: safeArray(explainability.reinforcementReasons).map(safeString),
    warnings: safeArray(explainability.warnings).map(safeString),
    summary: safeString(explainability.summary, AWAITING_EXPLAINABILITY)
  });
}

function summarizePriorityFeed(priorityFeed = {}) {
  if (!priorityFeed.feedState) {
    return sanitize({
      feedState: "UNKNOWN",
      events: [],
      warnings: [],
      summary: AWAITING_PRIORITY_FEED
    });
  }

  return sanitize({
    feedState: safeString(priorityFeed.feedState, "UNKNOWN"),
    events: safeArray(priorityFeed.events).slice(0, 12).map((event) => {
      const item = safeObject(event);
      return {
        type: safeString(item.type, "INFO"),
        timestamp: safeString(item.timestamp, new Date().toISOString()),
        message: safeString(item.message, AWAITING_PRIORITY_FEED),
        severity: safeString(item.severity, "LOW")
      };
    }),
    warnings: safeArray(priorityFeed.warnings).map(safeString),
    summary: safeString(priorityFeed.summary, AWAITING_PRIORITY_FEED)
  });
}

function summarizeReasoningChains(reasoningChains = {}) {
  if (!reasoningChains.chainState) {
    return sanitize({
      chainState: "UNKNOWN",
      chains: [],
      dominantChain: null,
      warnings: [],
      summary: AWAITING_REASONING_CHAINS
    });
  }

  const summarizeChain = (chain) => {
    const item = safeObject(chain);
    return {
      title: safeString(item.title, "UNKNOWN"),
      severity: safeString(item.severity, "LOW"),
      steps: safeArray(item.steps).slice(0, 8).map(safeString),
      stabilization: safeString(item.stabilization, AWAITING_REASONING_CHAINS),
      confidenceImpact: safeString(item.confidenceImpact, "UNKNOWN")
    };
  };

  return sanitize({
    chainState: safeString(reasoningChains.chainState, "UNKNOWN"),
    chains: safeArray(reasoningChains.chains).slice(0, 8).map(summarizeChain),
    dominantChain: reasoningChains.dominantChain ? summarizeChain(reasoningChains.dominantChain) : null,
    warnings: safeArray(reasoningChains.warnings).map(safeString),
    summary: safeString(reasoningChains.summary, AWAITING_REASONING_CHAINS)
  });
}

function summarizeReplayTimeline(replayTimeline = {}) {
  if (!replayTimeline.replayState) {
    return sanitize({
      replayState: "UNKNOWN",
      timeline: [],
      replaySummary: AWAITING_REPLAY_TIMELINE,
      recurrenceSignals: [],
      warnings: []
    });
  }

  return sanitize({
    replayState: safeString(replayTimeline.replayState, "UNKNOWN"),
    timeline: safeArray(replayTimeline.timeline).slice(0, 12).map((event) => {
      const item = safeObject(event);
      return {
        timestamp: safeString(item.timestamp, new Date().toISOString()),
        environment: safeString(item.environment, "UNKNOWN"),
        cognitionShift: safeString(item.cognitionShift, "UNKNOWN"),
        replayState: safeString(item.replayState, "UNKNOWN"),
        confidenceLevel: safeString(item.confidenceLevel, "UNKNOWN"),
        summary: safeString(item.summary, AWAITING_REPLAY_TIMELINE)
      };
    }),
    replaySummary: safeString(replayTimeline.replaySummary, AWAITING_REPLAY_TIMELINE),
    recurrenceSignals: safeArray(replayTimeline.recurrenceSignals).slice(0, 8).map((signal) => {
      const item = safeObject(signal);
      return {
        environment: safeString(item.environment, "UNKNOWN"),
        count: safeNumber(item.count)
      };
    }),
    warnings: safeArray(replayTimeline.warnings).map(safeString)
  });
}

function summarizeInteractiveRegions(interactiveRegions = {}) {
  if (!interactiveRegions.regionState) {
    return sanitize({
      regionState: "UNKNOWN",
      regions: [],
      synchronization: "UNKNOWN",
      driftSignals: [],
      dominantRegion: null,
      warnings: [],
      summary: AWAITING_REGION_COGNITION
    });
  }

  const summarizeRegion = (region) => {
    const item = safeObject(region);
    return {
      region: safeString(item.region, "UNKNOWN"),
      state: safeString(item.state, "UNKNOWN"),
      synchronization: safeString(item.synchronization, "UNKNOWN"),
      pressure: safeString(item.pressure, "UNKNOWN"),
      replayAlignment: safeString(item.replayAlignment, "UNKNOWN"),
      confidence: safeString(item.confidence, "UNKNOWN"),
      summary: safeString(item.summary, AWAITING_REGION_COGNITION)
    };
  };

  return sanitize({
    regionState: safeString(interactiveRegions.regionState, "UNKNOWN"),
    regions: safeArray(interactiveRegions.regions).slice(0, 8).map(summarizeRegion),
    synchronization: safeString(interactiveRegions.synchronization, "UNKNOWN"),
    driftSignals: safeArray(interactiveRegions.driftSignals).map(safeString),
    dominantRegion: interactiveRegions.dominantRegion ? summarizeRegion(interactiveRegions.dominantRegion) : null,
    warnings: safeArray(interactiveRegions.warnings).map(safeString),
    summary: safeString(interactiveRegions.summary, AWAITING_REGION_COGNITION)
  });
}

function summarizePersistentMemory(persistentMemory = {}) {
  if (!persistentMemory.memoryState) {
    return sanitize({
      memoryState: "UNKNOWN",
      memoryEntries: [],
      retentionStatus: "UNKNOWN",
      compressionState: "UNKNOWN",
      warnings: [],
      summary: AWAITING_PERSISTENT_MEMORY
    });
  }

  return sanitize({
    memoryState: safeString(persistentMemory.memoryState, "UNKNOWN"),
    memoryEntries: safeArray(persistentMemory.memoryEntries).slice(0, 20),
    retentionStatus: safeString(persistentMemory.retentionStatus, "UNKNOWN"),
    compressionState: safeString(persistentMemory.compressionState, "UNKNOWN"),
    warnings: safeArray(persistentMemory.warnings).map(safeString),
    summary: safeString(persistentMemory.summary, AWAITING_PERSISTENT_MEMORY)
  });
}

function summarizeEnvironmentArchive(environmentArchive = {}) {
  if (!environmentArchive.archiveState) {
    return sanitize({
      archiveState: "UNKNOWN",
      environmentHistory: [],
      dominantTransitions: [],
      recurrenceClusters: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_ARCHIVE
    });
  }

  return sanitize({
    archiveState: safeString(environmentArchive.archiveState, "UNKNOWN"),
    environmentHistory: safeArray(environmentArchive.environmentHistory).slice(0, 30),
    dominantTransitions: safeArray(environmentArchive.dominantTransitions).slice(0, 8),
    recurrenceClusters: safeArray(environmentArchive.recurrenceClusters).slice(0, 8),
    warnings: safeArray(environmentArchive.warnings).map(safeString),
    summary: safeString(environmentArchive.summary, AWAITING_ENVIRONMENT_ARCHIVE)
  });
}

function summarizeRecurrenceArchive(recurrenceArchive = {}) {
  if (!recurrenceArchive.recurrenceState) {
    return sanitize({
      recurrenceState: "UNKNOWN",
      recurrencePatterns: [],
      recurrenceConfidence: "UNKNOWN",
      historicalMatches: [],
      warnings: [],
      summary: AWAITING_RECURRENCE_INTELLIGENCE
    });
  }

  return sanitize({
    recurrenceState: safeString(recurrenceArchive.recurrenceState, "UNKNOWN"),
    recurrencePatterns: safeArray(recurrenceArchive.recurrencePatterns).slice(0, 10),
    recurrenceConfidence: safeString(recurrenceArchive.recurrenceConfidence, "UNKNOWN"),
    historicalMatches: safeArray(recurrenceArchive.historicalMatches).slice(0, 10),
    warnings: safeArray(recurrenceArchive.warnings).map(safeString),
    summary: safeString(recurrenceArchive.summary, AWAITING_RECURRENCE_INTELLIGENCE)
  });
}

function summarizeDriftEvolution(driftEvolution = {}) {
  if (!driftEvolution.driftState) {
    return sanitize({
      driftState: "UNKNOWN",
      driftMetrics: {},
      dominantDrift: null,
      stabilizationSignals: [],
      warnings: [],
      summary: AWAITING_DRIFT_EVOLUTION
    });
  }

  return sanitize({
    driftState: safeString(driftEvolution.driftState, "UNKNOWN"),
    driftMetrics: safeObject(driftEvolution.driftMetrics),
    dominantDrift: driftEvolution.dominantDrift ? safeObject(driftEvolution.dominantDrift) : null,
    stabilizationSignals: safeArray(driftEvolution.stabilizationSignals).map(safeString),
    warnings: safeArray(driftEvolution.warnings).map(safeString),
    summary: safeString(driftEvolution.summary, AWAITING_DRIFT_EVOLUTION)
  });
}

function summarizeReplayArchive(replayArchive = {}) {
  if (!replayArchive.replayArchiveState) {
    return sanitize({
      replayArchiveState: "UNKNOWN",
      replaySnapshots: [],
      replayIndex: [],
      compressionState: "UNKNOWN",
      warnings: [],
      summary: AWAITING_REPLAY_ARCHIVE
    });
  }

  return sanitize({
    replayArchiveState: safeString(replayArchive.replayArchiveState, "UNKNOWN"),
    replaySnapshots: safeArray(replayArchive.replaySnapshots).slice(0, 20),
    replayIndex: safeArray(replayArchive.replayIndex).slice(0, 10),
    compressionState: safeString(replayArchive.compressionState, "UNKNOWN"),
    warnings: safeArray(replayArchive.warnings).map(safeString),
    summary: safeString(replayArchive.summary, AWAITING_REPLAY_ARCHIVE)
  });
}

function createFrontendCognitionSnapshot(input = {}) {
  const cognition = safeObject(input.cognition);
  const marketEvent = safeObject(input.marketEvent);
  const systemContext = safeObject(input.systemContext);
  const runtimeHealth = safeObject(cognition.runtimeHealth);
  const strategicEnvironment = safeObject(cognition.strategicEnvironment);
  const confidenceProfile = safeObject(cognition.confidenceProfile);
  const consensus = safeObject(cognition.intelligenceConsensus);
  const stabilityForecast = safeObject(cognition.intelligenceStabilityForecast);
  const behavioralIntelligence = safeObject(cognition.behavioralIntelligence);
  const behavioralRiskAlignment = safeObject(cognition.behavioralRiskAlignment);
  const reflectionPrompts = safeObject(cognition.reflectionPrompts);
  const journalDraft = safeObject(cognition.journalDraft);
  const environmentalPressure = safeObject(cognition.environmentalPressure);
  const anomalyIntelligence = safeObject(cognition.anomalyIntelligence);
  const dynamicWatchlist = safeObject(cognition.dynamicWatchlist);
  const crossSymbolEcosystem = safeObject(cognition.crossSymbolEcosystem);
  const strategicEnvironmentMap = safeObject(cognition.strategicEnvironmentMap);
  const adaptiveEcosystemPriority = safeObject(cognition.adaptiveEcosystemPriority);
  const sectorHeatmap = safeObject(cognition.sectorHeatmap);
  const cognitiveDrift = safeObject(cognition.cognitiveDrift);
  const environmentForecast = safeObject(cognition.environmentForecast);
  const marketStructure = safeObject(cognition.marketStructure);
  const regimeTransition = safeObject(cognition.regimeTransition);
  const institutionalFlow = safeObject(cognition.institutionalFlow);
  const liquidityPressure = safeObject(cognition.liquidityPressure);
  const crossBrainConsensus = safeObject(cognition.crossBrainConsensus);
  const adaptiveSignalIntelligence = safeObject(cognition.adaptiveSignalIntelligence);
  const temporalMemory = safeObject(cognition.temporalMemory);
  const recurrenceIntelligence = safeObject(cognition.recurrenceIntelligence);
  const contextAging = safeObject(cognition.contextAging);
  const temporalSequence = safeObject(cognition.temporalSequence);
  const environmentalCausality = safeObject(cognition.environmentalCausality);
  const adaptiveThresholds = safeObject(cognition.adaptiveThresholds);
  const reinforcementWeighting = safeObject(cognition.reinforcementWeighting);
  const cognitionCalibration = safeObject(cognition.cognitionCalibration);
  const learningGuardrails = safeObject(cognition.learningGuardrails);
  const aiCopilotNarration = safeObject(cognition.aiCopilotNarration);
  const explainabilityReasons = safeObject(cognition.explainabilityReasons);
  const priorityCognitionFeed = safeObject(cognition.priorityCognitionFeed);
  const reasoningChains = safeObject(cognition.reasoningChains);
  const replayTimeline = safeObject(cognition.replayTimeline);
  const interactiveRegions = safeObject(cognition.interactiveRegions);
  const persistentMemory = safeObject(cognition.persistentMemory);
  const environmentArchive = safeObject(cognition.environmentArchive);
  const recurrenceIntelligenceArchive = safeObject(cognition.recurrenceIntelligenceArchive);
  const driftEvolution = safeObject(cognition.driftEvolution);
  const replayArchive = safeObject(cognition.replayArchive);
  const escalation = buildEscalation(cognition);

  return sanitize({
    backend: "connected",
    timestamp: new Date().toISOString(),
    symbol: safeString(marketEvent.symbol, "UNKNOWN"),
    provider: safeString(marketEvent.provider, "unknown"),
    mode: safeString(systemContext.mode, "unknown"),
    marketOpen: typeof systemContext.marketOpen === "boolean"
      ? systemContext.marketOpen
      : null,
    runtimeHealth: {
      status: safeString(runtimeHealth.status, "UNKNOWN"),
      healthScore: safeNumber(runtimeHealth.healthScore),
      summary: safeString(runtimeHealth.summary)
    },
    strategicEnvironment: {
      environment: safeString(strategicEnvironment.environment, "UNKNOWN"),
      stability: safeString(strategicEnvironment.stability, "UNKNOWN"),
      warnings: safeArray(strategicEnvironment.warnings).map(safeString),
      summary: safeString(strategicEnvironment.summary)
    },
    confidence: {
      score: safeNumber(confidenceProfile.score),
      level: safeString(confidenceProfile.level, "UNKNOWN"),
      components: safeObject(confidenceProfile.components),
      warnings: safeArray(confidenceProfile.penalties).map(safeString)
    },
    consensus: {
      consensusStrength: safeString(consensus.consensusStrength, "UNKNOWN"),
      warnings: safeArray(consensus.warnings).map(safeString),
      summary: safeString(consensus.summary)
    },
    stabilityForecast: {
      trajectory: safeString(stabilityForecast.trajectory, "UNKNOWN"),
      confidence: safeNumber(stabilityForecast.confidence),
      warnings: safeArray(stabilityForecast.warnings).map(safeString),
      summary: safeString(stabilityForecast.summary)
    },
    tacticalBrain: summarizeBrain(cognition.tacticalBrain),
    behavioralBrain: summarizeBrain(cognition.behavioralRiskBrain),
    failsafeBrain: summarizeBrain(cognition.failsafeBrain),
    strategicDetails: {
      pressureLevel: safeString(environmentalPressure.pressureLevel, "UNKNOWN"),
      pressureScore: safeNumber(environmentalPressure.pressureScore),
      pressureSummary: safeString(environmentalPressure.summary)
    },
    behavioralState: {
      behavioralState: safeString(behavioralIntelligence.behavioralState, "UNKNOWN"),
      riskLevel: safeString(behavioralIntelligence.riskLevel, "UNKNOWN"),
      alignment: behavioralRiskAlignment.aligned === true ? "ALIGNED" : "REVIEW",
      reflectionTheme: safeString(reflectionPrompts.theme, "UNKNOWN"),
      journalMood: safeString(journalDraft.mood, "UNKNOWN"),
      summary: safeString(behavioralIntelligence.summary)
    },
    replaySummary: buildReplaySummary(cognition),
    anomalies: summarizeAnomalies(anomalyIntelligence),
    watchlist: summarizeWatchlist(dynamicWatchlist),
    ecosystem: summarizeEcosystem(crossSymbolEcosystem),
    environmentMap: summarizeEnvironmentMap(strategicEnvironmentMap),
    ecosystemPriority: summarizeEcosystemPriority(adaptiveEcosystemPriority),
    sectorHeatmap: summarizeSectorHeatmap(sectorHeatmap),
    cognitiveDrift: summarizeCognitiveDrift(cognitiveDrift),
    environmentForecast: summarizeEnvironmentForecast(environmentForecast),
    marketStructure: summarizeMarketStructure(marketStructure),
    regimeTransition: summarizeRegimeTransition(regimeTransition),
    institutionalFlow: summarizeInstitutionalFlow(institutionalFlow),
    liquidityPressure: summarizeLiquidityPressure(liquidityPressure),
    brainConsensus: summarizeCrossBrainConsensus(crossBrainConsensus),
    adaptiveSignals: summarizeAdaptiveSignal(adaptiveSignalIntelligence),
    temporalMemory: summarizeTemporalMemory(temporalMemory),
    recurrence: summarizeRecurrence(recurrenceIntelligence),
    contextAging: summarizeContextAging(contextAging),
    temporalSequences: summarizeTemporalSequence(temporalSequence),
    environmentCausality: summarizeEnvironmentalCausality(environmentalCausality),
    adaptiveThresholds: summarizeAdaptiveThresholds(adaptiveThresholds),
    reinforcementWeighting: summarizeReinforcementWeighting(reinforcementWeighting),
    cognitionCalibration: summarizeCognitionCalibration(cognitionCalibration),
    learningGuardrails: summarizeLearningGuardrails(learningGuardrails),
    copilot: summarizeAiCopilot(aiCopilotNarration),
    explainability: summarizeExplainability(explainabilityReasons),
    priorityFeed: summarizePriorityFeed(priorityCognitionFeed),
    reasoningChains: summarizeReasoningChains(reasoningChains),
    replayTimeline: summarizeReplayTimeline(replayTimeline),
    interactiveRegions: summarizeInteractiveRegions(interactiveRegions),
    persistentMemory: summarizePersistentMemory(persistentMemory),
    environmentArchive: summarizeEnvironmentArchive(environmentArchive),
    recurrenceIntelligence: summarizeRecurrenceArchive(recurrenceIntelligenceArchive),
    driftEvolution: summarizeDriftEvolution(driftEvolution),
    replayArchive: summarizeReplayArchive(replayArchive),
    escalation
  });
}

function storeCognitionSnapshot(input = {}) {
  latestSnapshot = createFrontendCognitionSnapshot(input);
  return latestSnapshot;
}

function setLatestCognitionSnapshot(snapshot) {
  latestSnapshot = sanitize(snapshot);
  return latestSnapshot;
}

function clearLatestCognitionSnapshot() {
  latestSnapshot = null;
}

function getLatestCognitionSnapshot() {
  return latestSnapshot;
}

function hasLatestCognitionSnapshot() {
  return latestSnapshot !== null;
}

function awaitingResponse(shape) {
  return sanitize(shape);
}

function buildOverview(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      backend: "connected",
      timestamp: new Date().toISOString(),
      symbol: AWAITING,
      provider: AWAITING,
      mode: AWAITING,
      marketOpen: null,
      runtimeHealth: AWAITING,
      strategicEnvironment: AWAITING,
      confidence: AWAITING,
      consensus: AWAITING,
      stabilityForecast: AWAITING,
      escalation: AWAITING
    });
  }

  return sanitize({
    backend: snapshot.backend,
    timestamp: snapshot.timestamp,
    symbol: snapshot.symbol,
    provider: snapshot.provider,
    mode: snapshot.mode,
    marketOpen: snapshot.marketOpen,
    runtimeHealth: snapshot.runtimeHealth,
    strategicEnvironment: snapshot.strategicEnvironment,
    confidence: snapshot.confidence,
    consensus: snapshot.consensus,
    stabilityForecast: snapshot.stabilityForecast,
    escalation: snapshot.escalation
  });
}

function buildBrainStatus(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      tacticalBrain: AWAITING,
      behavioralBrain: AWAITING,
      failsafeBrain: AWAITING,
      summary: AWAITING
    });
  }

  return sanitize({
    tacticalBrain: snapshot.tacticalBrain,
    behavioralBrain: snapshot.behavioralBrain,
    failsafeBrain: snapshot.failsafeBrain,
    summary: "Backend brain status is available for cockpit visualization."
  });
}

function buildStrategicEnvironment(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      environment: AWAITING,
      stability: AWAITING,
      pressureLevel: AWAITING,
      trajectory: AWAITING,
      warnings: [],
      summary: AWAITING
    });
  }

  return sanitize({
    environment: snapshot.strategicEnvironment.environment,
    stability: snapshot.strategicEnvironment.stability,
    pressureLevel: snapshot.strategicDetails.pressureLevel,
    trajectory: snapshot.stabilityForecast.trajectory,
    warnings: snapshot.strategicEnvironment.warnings,
    summary: snapshot.strategicEnvironment.summary
  });
}

function buildConfidence(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      score: 0,
      level: AWAITING,
      consensusStrength: AWAITING,
      stabilityTrajectory: AWAITING,
      components: {},
      warnings: []
    });
  }

  return sanitize({
    score: snapshot.confidence.score,
    level: snapshot.confidence.level,
    consensusStrength: snapshot.consensus.consensusStrength,
    stabilityTrajectory: snapshot.stabilityForecast.trajectory,
    components: snapshot.confidence.components,
    warnings: snapshot.confidence.warnings
  });
}

function buildBehavioralState(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      behavioralState: AWAITING,
      riskLevel: AWAITING,
      alignment: AWAITING,
      reflectionTheme: AWAITING,
      journalMood: AWAITING,
      summary: AWAITING
    });
  }

  return sanitize(snapshot.behavioralState);
}

function buildReplaySummaryEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      recentEvents: [],
      recentSnapshots: [],
      compressionSummary: AWAITING,
      timelineSummary: AWAITING,
      replayFrameSummary: AWAITING
    });
  }

  return sanitize(snapshot.replaySummary);
}

function buildEscalationEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      escalationLevel: AWAITING,
      triggers: [],
      elevatedEvents: [],
      summary: AWAITING
    });
  }

  return sanitize({
    escalationLevel: snapshot.escalation.escalationLevel,
    triggers: snapshot.escalation.triggers,
    elevatedEvents: snapshot.escalation.elevatedEvents,
    summary: snapshot.escalation.summary
  });
}

function buildAnomaliesEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      anomalyDetected: false,
      severity: "UNKNOWN",
      anomalyTypes: [],
      warnings: [],
      summary: "Awaiting anomaly cognition."
    });
  }

  return summarizeAnomalies(safeObject(snapshot.anomalies));
}

function buildWatchlistEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      watchlistPriority: "BACKGROUND",
      prioritizedSymbols: [],
      groupedContexts: [],
      warnings: [],
      observations: [],
      summary: AWAITING_WATCHLIST
    });
  }

  return summarizeWatchlist(safeObject(snapshot.watchlist));
}

function buildEcosystemEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      ecosystemState: "UNKNOWN",
      correlationStrength: "UNKNOWN",
      synchronizedSymbols: [],
      divergentSymbols: [],
      pressureClusters: [],
      ecosystemGroups: [],
      warnings: [],
      summary: AWAITING_ECOSYSTEM
    });
  }

  return summarizeEcosystem(safeObject(snapshot.ecosystem));
}

function buildEnvironmentMapEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      globalEnvironmentState: "UNKNOWN",
      ecosystemRegions: [],
      pressureMap: [],
      fragmentationZones: [],
      synchronizationZones: [],
      transitionSignals: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_MAP
    });
  }

  return summarizeEnvironmentMap(safeObject(snapshot.environmentMap));
}

function buildEcosystemPriorityEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      priorityLevel: "UNKNOWN",
      prioritizedEcosystems: [],
      priorityDrivers: [],
      suppressedEcosystems: [],
      propagationState: "UNKNOWN",
      originRegions: [],
      receivingRegions: [],
      propagationPaths: [],
      warnings: [],
      summary: AWAITING_ECOSYSTEM_PRIORITY
    });
  }

  return summarizeEcosystemPriority(safeObject(snapshot.ecosystemPriority));
}

function buildSectorHeatmapEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      heatmapState: "UNKNOWN",
      sectors: [],
      warnings: [],
      summary: AWAITING_SECTOR_HEATMAP
    });
  }

  return summarizeSectorHeatmap(safeObject(snapshot.sectorHeatmap));
}

function buildCognitiveDriftEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      driftState: "UNKNOWN",
      driftSignals: [],
      affectedEcosystems: [],
      severity: "LOW",
      warnings: [],
      summary: AWAITING_COGNITIVE_DRIFT
    });
  }

  return summarizeCognitiveDrift(safeObject(snapshot.cognitiveDrift));
}

function buildEnvironmentForecastEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      forecastState: "UNKNOWN",
      confidenceTrajectory: "UNKNOWN",
      ecosystemForecasts: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_FORECAST
    });
  }

  return summarizeEnvironmentForecast(safeObject(snapshot.environmentForecast));
}

function buildMarketStructureEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      structureState: "UNKNOWN",
      structureQuality: "UNKNOWN",
      affectedSymbols: [],
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_MARKET_STRUCTURE
    });
  }

  return summarizeMarketStructure(safeObject(snapshot.marketStructure));
}

function buildRegimeTransitionEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      regimeState: "UNKNOWN",
      transitionState: "UNKNOWN",
      transitionRisk: "UNKNOWN",
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_REGIME_TRANSITION
    });
  }

  return summarizeRegimeTransition(safeObject(snapshot.regimeTransition));
}

function buildInstitutionalFlowEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      flowState: "UNKNOWN",
      flowStrength: "UNKNOWN",
      synchronizedRegions: [],
      divergingRegions: [],
      flowClusters: [],
      warnings: [],
      summary: AWAITING_INSTITUTIONAL_FLOW
    });
  }

  return summarizeInstitutionalFlow(safeObject(snapshot.institutionalFlow));
}

function buildLiquidityPressureEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      liquidityState: "UNKNOWN",
      pressureState: "UNKNOWN",
      vulnerabilityLevel: "UNKNOWN",
      affectedEcosystems: [],
      pressureZones: [],
      warnings: [],
      summary: AWAITING_LIQUIDITY_PRESSURE
    });
  }

  return summarizeLiquidityPressure(safeObject(snapshot.liquidityPressure));
}

function buildBrainConsensusEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      consensusState: "UNKNOWN",
      agreementStrength: "UNKNOWN",
      divergenceRisk: "UNKNOWN",
      participatingBrains: [],
      warnings: [],
      summary: AWAITING_BRAIN_CONSENSUS
    });
  }

  return summarizeCrossBrainConsensus(safeObject(snapshot.brainConsensus));
}

function buildAdaptiveSignalsEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      signalState: "UNKNOWN",
      signalTrust: "UNKNOWN",
      suppressionLevel: "NONE",
      reinforcementLevel: "NONE",
      coherenceLevel: "UNKNOWN",
      confidenceWeight: 0,
      warnings: [],
      summary: AWAITING_ADAPTIVE_SIGNAL
    });
  }

  return summarizeAdaptiveSignal(safeObject(snapshot.adaptiveSignals));
}

function buildTemporalMemoryEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      temporalState: "UNKNOWN",
      memoryDepth: "UNKNOWN",
      recurringPatterns: [],
      agingContexts: [],
      longHorizonSignals: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_MEMORY
    });
  }

  return summarizeTemporalMemory(safeObject(snapshot.temporalMemory));
}

function buildRecurrenceEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      recurrenceState: "UNKNOWN",
      recurrenceStrength: "UNKNOWN",
      recurringThemes: [],
      affectedEcosystems: [],
      warnings: [],
      summary: AWAITING_RECURRENCE
    });
  }

  return summarizeRecurrence(safeObject(snapshot.recurrence));
}

function buildContextAgingEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      contextAgeState: "UNKNOWN",
      freshnessScore: 0,
      staleContexts: [],
      warnings: [],
      summary: AWAITING_CONTEXT_AGING
    });
  }

  return summarizeContextAging(safeObject(snapshot.contextAging));
}

function buildTemporalSequencesEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      sequenceState: "UNKNOWN",
      progressionMomentum: "UNKNOWN",
      sequenceConfidence: "UNKNOWN",
      activeSequences: [],
      transitionChains: [],
      warnings: [],
      summary: AWAITING_TEMPORAL_SEQUENCE
    });
  }

  return summarizeTemporalSequence(safeObject(snapshot.temporalSequences));
}

function buildEnvironmentCausalityEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      causalityState: "UNKNOWN",
      dominantDrivers: [],
      influenceChains: [],
      affectedRegions: [],
      causalityConfidence: "UNKNOWN",
      warnings: [],
      summary: AWAITING_ENVIRONMENT_CAUSALITY
    });
  }

  return summarizeEnvironmentalCausality(safeObject(snapshot.environmentCausality));
}

function buildAdaptiveThresholdsEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      thresholdState: "UNKNOWN",
      adjustedThresholds: {},
      adjustmentReasons: [],
      warnings: [],
      summary: AWAITING_ADAPTIVE_THRESHOLDS
    });
  }

  return summarizeAdaptiveThresholds(safeObject(snapshot.adaptiveThresholds));
}

function buildReinforcementWeightingEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      reinforcementState: "UNKNOWN",
      reinforcedFactors: [],
      weakenedFactors: [],
      learningWeight: 0,
      warnings: [],
      summary: AWAITING_REINFORCEMENT_WEIGHTING
    });
  }

  return summarizeReinforcementWeighting(safeObject(snapshot.reinforcementWeighting));
}

function buildCognitionCalibrationEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      calibrationState: "UNKNOWN",
      confidenceCalibration: "UNKNOWN",
      suppressionCalibration: "UNKNOWN",
      consensusCalibration: "UNKNOWN",
      warnings: [],
      summary: AWAITING_COGNITION_CALIBRATION
    });
  }

  return summarizeCognitionCalibration(safeObject(snapshot.cognitionCalibration));
}

function buildLearningGuardrailsEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      learningAllowed: false,
      guardrailState: "UNKNOWN",
      blockedReasons: [],
      warnings: [],
      summary: AWAITING_LEARNING_GUARDRAILS
    });
  }

  return summarizeLearningGuardrails(safeObject(snapshot.learningGuardrails));
}

function buildCopilotEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      narrationState: "UNKNOWN",
      cognitionSummary: AWAITING_AI_COPILOT_NARRATION,
      environmentSummary: AWAITING_AI_COPILOT_NARRATION,
      consensusSummary: AWAITING_AI_COPILOT_NARRATION,
      riskSummary: AWAITING_AI_COPILOT_NARRATION,
      replaySummary: AWAITING_AI_COPILOT_NARRATION,
      warnings: [],
      summary: AWAITING_AI_COPILOT_NARRATION
    });
  }

  return summarizeAiCopilot(safeObject(snapshot.copilot));
}

function buildExplainabilityEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      explainabilityState: "UNKNOWN",
      reasoningChains: [],
      dominantFactors: [],
      suppressionReasons: [],
      reinforcementReasons: [],
      warnings: [],
      summary: AWAITING_EXPLAINABILITY
    });
  }

  return summarizeExplainability(safeObject(snapshot.explainability));
}

function buildPriorityFeedEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      feedState: "UNKNOWN",
      events: [],
      warnings: [],
      summary: AWAITING_PRIORITY_FEED
    });
  }

  return summarizePriorityFeed(safeObject(snapshot.priorityFeed));
}

function buildReasoningChainsEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      chainState: "UNKNOWN",
      chains: [],
      dominantChain: null,
      warnings: [],
      summary: AWAITING_REASONING_CHAINS
    });
  }

  return summarizeReasoningChains(safeObject(snapshot.reasoningChains));
}

function buildReplayTimelineEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      replayState: "UNKNOWN",
      timeline: [],
      replaySummary: AWAITING_REPLAY_TIMELINE,
      recurrenceSignals: [],
      warnings: []
    });
  }

  return summarizeReplayTimeline(safeObject(snapshot.replayTimeline));
}

function buildInteractiveRegionsEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      regionState: "UNKNOWN",
      regions: [],
      synchronization: "UNKNOWN",
      driftSignals: [],
      dominantRegion: null,
      warnings: [],
      summary: AWAITING_REGION_COGNITION
    });
  }

  return summarizeInteractiveRegions(safeObject(snapshot.interactiveRegions));
}

function buildPersistentMemoryEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      memoryState: "UNKNOWN",
      memoryEntries: [],
      retentionStatus: "UNKNOWN",
      compressionState: "UNKNOWN",
      warnings: [],
      summary: AWAITING_PERSISTENT_MEMORY
    });
  }

  return summarizePersistentMemory(safeObject(snapshot.persistentMemory));
}

function buildEnvironmentArchiveEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      archiveState: "UNKNOWN",
      environmentHistory: [],
      dominantTransitions: [],
      recurrenceClusters: [],
      warnings: [],
      summary: AWAITING_ENVIRONMENT_ARCHIVE
    });
  }

  return summarizeEnvironmentArchive(safeObject(snapshot.environmentArchive));
}

function buildRecurrenceIntelligenceEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      recurrenceState: "UNKNOWN",
      recurrencePatterns: [],
      recurrenceConfidence: "UNKNOWN",
      historicalMatches: [],
      warnings: [],
      summary: AWAITING_RECURRENCE_INTELLIGENCE
    });
  }

  return summarizeRecurrenceArchive(safeObject(snapshot.recurrenceIntelligence));
}

function buildDriftEvolutionEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      driftState: "UNKNOWN",
      driftMetrics: {},
      dominantDrift: null,
      stabilizationSignals: [],
      warnings: [],
      summary: AWAITING_DRIFT_EVOLUTION
    });
  }

  return summarizeDriftEvolution(safeObject(snapshot.driftEvolution));
}

function buildReplayArchiveEndpoint(snapshot = latestSnapshot) {
  if (!snapshot) {
    return awaitingResponse({
      replayArchiveState: "UNKNOWN",
      replaySnapshots: [],
      replayIndex: [],
      compressionState: "UNKNOWN",
      warnings: [],
      summary: AWAITING_REPLAY_ARCHIVE
    });
  }

  return summarizeReplayArchive(safeObject(snapshot.replayArchive));
}

module.exports = {
  AWAITING,
  buildAdaptiveThresholdsEndpoint,
  buildAdaptiveSignalsEndpoint,
  buildAnomaliesEndpoint,
  buildBehavioralState,
  buildBrainStatus,
  buildBrainConsensusEndpoint,
  buildConfidence,
  buildCognitionCalibrationEndpoint,
  buildCopilotEndpoint,
  buildCognitiveDriftEndpoint,
  buildDriftEvolutionEndpoint,
  buildEscalationEndpoint,
  buildEcosystemEndpoint,
  buildEcosystemPriorityEndpoint,
  buildEnvironmentArchiveEndpoint,
  buildEnvironmentMapEndpoint,
  buildEnvironmentForecastEndpoint,
  buildEnvironmentCausalityEndpoint,
  buildExplainabilityEndpoint,
  buildInstitutionalFlowEndpoint,
  buildLiquidityPressureEndpoint,
  buildLearningGuardrailsEndpoint,
  buildMarketStructureEndpoint,
  buildOverview,
  buildPersistentMemoryEndpoint,
  buildPriorityFeedEndpoint,
  buildReasoningChainsEndpoint,
  buildContextAgingEndpoint,
  buildRecurrenceEndpoint,
  buildRecurrenceIntelligenceEndpoint,
  buildReinforcementWeightingEndpoint,
  buildRegimeTransitionEndpoint,
  buildReplaySummaryEndpoint,
  buildReplayArchiveEndpoint,
  buildReplayTimelineEndpoint,
  buildSectorHeatmapEndpoint,
  buildStrategicEnvironment,
  buildTemporalMemoryEndpoint,
  buildTemporalSequencesEndpoint,
  buildInteractiveRegionsEndpoint,
  buildWatchlistEndpoint,
  clearLatestCognitionSnapshot,
  createFrontendCognitionSnapshot,
  getLatestCognitionSnapshot,
  hasLatestCognitionSnapshot,
  sanitize,
  setLatestCognitionSnapshot,
  storeCognitionSnapshot
};
