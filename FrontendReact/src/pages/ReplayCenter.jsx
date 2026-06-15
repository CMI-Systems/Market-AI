import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createAiccDatasetRecord } from "../services/intelligence/aiccDatasetCapture";
import { validateAiccDatasetRecord } from "../services/intelligence/aiccDatasetQualityValidator";
import { evaluateShadowTrainingReadiness } from "../services/intelligence/aiccShadowTrainingEvaluator";
import { analyzeBehavioralDataset } from "../services/intelligence/behavioralDatasetMonitor";
import { analyzeBehavioralPipeline } from "../services/intelligence/behavioralPipelineStatus";
import { evaluateBehavioralTrainingCandidate } from "../services/intelligence/behavioralTrainingQueue";
import { createBehavioralDatasetRecord } from "../services/intelligence/replayBehavioralDatasetBridge";
import { analyzeReplayIntelligence } from "../services/intelligence/replayIntelligenceEngine";
import { getDatasetGovernanceSummary } from "../services/datasetGovernanceService";
import { getDatasetRepositorySummary } from "../services/datasetRepositoryService";
import { getHistoricalValidationSummary } from "../services/historicalDatasetValidationService";
import { getOperatorHistorySummary } from "../services/operatorHistoryService";
import MarketPriceChart from "../components/charts/MarketPriceChart";
import { CHART_TIMEFRAMES, getValidatedChartData } from "../services/chartDataService";
import {
  createReplaySession,
  deleteReplaySession as deletePersistedReplaySession,
  getReplaySessions,
  updateReplaySession as updatePersistedReplaySession,
} from "../services/replayPersistenceService";
import "../styles/ReplayCenter.css";

const sessionVerdict = [
  { label: "Session Verdict", value: "GOOD SESSION" },
  { label: "Session Score", value: "82" },
  { label: "Execution Grade", value: "B+" },
  { label: "Behavior Grade", value: "B" },
  { label: "Discipline Grade", value: "A-" },
  { label: "Strongest Trait", value: "Discipline" },
  { label: "Weakest Trait", value: "Conviction" },
];

const operatorDebrief = [
  { label: "Primary Strength", value: "Waited for confirmation on the highest-quality setups." },
  { label: "Primary Weakness", value: "Late-session selectivity degraded after the strongest trades were complete." },
  { label: "Primary Mistake", value: "Chased the final TSLA continuation without fresh liquidity support." },
  { label: "Primary Success", value: "Protected gains by keeping risk controlled after the midday range." },
];

const sampleTrades = [
  {
    id: "trade-1",
    number: 1,
    time: "09:42 AM",
    symbol: "AAPL",
    direction: "LONG",
    result: "WIN",
    entry: "$196.20",
    exit: "$198.05",
    structure: "Breakout retest held above prior range.",
    momentum: "Expanding after opening compression.",
    liquidity: "Moderate liquidity with clean bid support.",
    volatility: "Controlled expansion.",
    relativeStrength: "Leading versus benchmark.",
    narrative: "Technology leadership remained constructive during the first hour.",
  },
  {
    id: "trade-2",
    number: 2,
    time: "10:18 AM",
    symbol: "MSFT",
    direction: "LONG",
    result: "LOSS",
    entry: "$482.40",
    exit: "$480.90",
    structure: "Failed continuation near intraday resistance.",
    momentum: "Momentum slowed after initial push.",
    liquidity: "Liquidity thinned into resistance.",
    volatility: "Elevated but orderly.",
    relativeStrength: "Market performing.",
    narrative: "Continuation attempt lacked broad confirmation.",
  },
  {
    id: "trade-3",
    number: 3,
    time: "11:07 AM",
    symbol: "NVDA",
    direction: "LONG",
    result: "WIN",
    entry: "$148.10",
    exit: "$151.30",
    structure: "Expansion from tight consolidation.",
    momentum: "Accelerating with strong follow-through.",
    liquidity: "Strong liquidity confirmation.",
    volatility: "Elevated but constructive.",
    relativeStrength: "Leading.",
    narrative: "AI semiconductor theme showed clear traction.",
  },
  {
    id: "trade-4",
    number: 4,
    time: "01:24 PM",
    symbol: "SPY",
    direction: "SHORT",
    result: "FLAT",
    entry: "$612.80",
    exit: "$612.65",
    structure: "Range rejection without breakdown confirmation.",
    momentum: "Slightly slowing.",
    liquidity: "Moderate two-sided liquidity.",
    volatility: "Compressed.",
    relativeStrength: "Market performing.",
    narrative: "Index remained balanced while leadership narrowed.",
  },
  {
    id: "trade-5",
    number: 5,
    time: "02:46 PM",
    symbol: "TSLA",
    direction: "LONG",
    result: "LOSS",
    entry: "$227.50",
    exit: "$224.90",
    structure: "Late-session breakout failed.",
    momentum: "Exhausting into entry.",
    liquidity: "Weak liquidity support after entry.",
    volatility: "Elevated.",
    relativeStrength: "Lagging.",
    narrative: "Speculative follow-through was not supported by broader risk appetite.",
  },
];

const mistakeIntelligence = [
  { type: "FOMO", frequency: 1, severity: "Moderate", impact: "Pulled entry timing forward." },
  { type: "Chasing", frequency: 2, severity: "High", impact: "Reduced reward-to-risk quality." },
  { type: "Overtrading", frequency: 0, severity: "Low", impact: "No material impact detected." },
  { type: "Early Exit", frequency: 1, severity: "Moderate", impact: "Left partial upside unrealized." },
  { type: "Late Exit", frequency: 1, severity: "Moderate", impact: "Expanded loss after failed momentum." },
  { type: "Oversizing", frequency: 0, severity: "Low", impact: "Sizing remained controlled." },
  { type: "Undersizing", frequency: 1, severity: "Low", impact: "Reduced gain capture on best setup." },
  { type: "Rule Violation", frequency: 1, severity: "High", impact: "Entered before required confirmation." },
  { type: "Narrative Ignored", frequency: 1, severity: "Moderate", impact: "Fought weakening speculative context." },
  { type: "Risk Ignored", frequency: 1, severity: "High", impact: "Held after liquidity support weakened." },
];

function ReplayCenter() {
  const location = useLocation();
  const journalEntry = location.state?.journalEntry || null;
  const [selectedTradeId, setSelectedTradeId] = useState(sampleTrades[0].id);
  const [persistedReplaySessions, setPersistedReplaySessions] = useState([]);
  const [selectedReplaySessionId, setSelectedReplaySessionId] = useState(null);
  const [replayPersistenceStatus, setReplayPersistenceStatus] = useState({
    loading: false,
    saving: false,
    deleting: false,
    message: "Replay persistence is available in staging only.",
    error: "",
  });
  const [datasetRepositorySnapshot, setDatasetRepositorySnapshot] = useState({
    loading: false,
    error: "",
    summary: {
      totalDatasets: 0,
      validDatasets: 0,
      shadowReadyDatasets: 0,
      highQualityDatasets: 0,
      moderateQualityDatasets: 0,
      lowQualityDatasets: 0,
      symbols: [],
      latestUpdatedAt: null,
    },
  });
  const [historicalValidationSnapshot, setHistoricalValidationSnapshot] = useState({
    loading: false,
    error: "",
    summary: {
      totalDatasets: 0,
      revalidatedDatasets: 0,
      consistentDatasets: 0,
      inconsistentDatasets: 0,
      consistencyRate: 0,
      highQualityDatasets: 0,
      shadowReadyDatasets: 0,
      historicalValidationStatus: "EMPTY",
    },
  });
  const [operatorHistorySnapshot, setOperatorHistorySnapshot] = useState({
    loading: false,
    error: "",
    summary: {
      totalHistoryItems: 0,
      journalEntries: 0,
      replaySessions: 0,
      datasetRecords: 0,
      datasetValidations: 0,
      shadowReadinessRecords: 0,
      latestActivityAt: null,
      historyStatus: "EMPTY",
    },
  });
  const [datasetGovernanceSnapshot, setDatasetGovernanceSnapshot] = useState({
    loading: false,
    error: "",
    summary: {
      totalDatasets: 0,
      compliantDatasets: 0,
      reviewRequiredDatasets: 0,
      restrictedDatasets: 0,
      incompleteDatasets: 0,
      activeDatasets: 0,
      archiveCandidates: 0,
      holdDatasets: 0,
      futureTrainingEligibleDatasets: 0,
      trainingBlockedDatasets: 0,
      rawDataCertified: false,
      trainingEnabled: false,
      policyVersion: "N8-v1",
      governanceStatus: "EMPTY",
      warnings: [],
    },
  });
  const [replayChartTimeframe, setReplayChartTimeframe] = useState("5Min");
  const [replayChartData, setReplayChartData] = useState({
    candles: [],
    quote: null,
    validation: null,
    provenance: null,
    loading: true,
    error: "",
  });

  const loadPersistedReplaySessions = useCallback(async () => {
    setReplayPersistenceStatus((current) => ({
      ...current,
      loading: true,
      error: "",
      message: "Loading replay sessions.",
    }));

    const result = await getReplaySessions();

    if (result.error) {
      setReplayPersistenceStatus((current) => ({
        ...current,
        loading: false,
        message: "Replay persistence unavailable.",
        error: result.error.message,
      }));
      return;
    }

    setPersistedReplaySessions(result.data || []);
    setReplayPersistenceStatus((current) => ({
      ...current,
      loading: false,
      message: result.data?.length ? "Replay sessions loaded." : "No saved replay sessions yet.",
      error: "",
    }));
  }, []);

  const loadDatasetRepositorySnapshot = useCallback(async () => {
    setDatasetRepositorySnapshot((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    const result = await getDatasetRepositorySummary();

    setDatasetRepositorySnapshot({
      loading: false,
      error: result.error?.message || "",
      summary: result.summary || {
        totalDatasets: 0,
        validDatasets: 0,
        shadowReadyDatasets: 0,
        highQualityDatasets: 0,
        moderateQualityDatasets: 0,
        lowQualityDatasets: 0,
        symbols: [],
        latestUpdatedAt: null,
      },
    });
  }, []);

  const loadHistoricalValidationSnapshot = useCallback(async () => {
    setHistoricalValidationSnapshot((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    const result = await getHistoricalValidationSummary();

    setHistoricalValidationSnapshot({
      loading: false,
      error: result.warnings?.[0] || "",
      summary: {
        totalDatasets: result.totalDatasets || 0,
        revalidatedDatasets: result.revalidatedDatasets || 0,
        consistentDatasets: result.consistentDatasets || 0,
        inconsistentDatasets: result.inconsistentDatasets || 0,
        consistencyRate: result.consistencyRate || 0,
        highQualityDatasets: result.highQualityDatasets || 0,
        shadowReadyDatasets: result.shadowReadyDatasets || 0,
        historicalValidationStatus: result.historicalValidationStatus || "EMPTY",
      },
    });
  }, []);

  const loadOperatorHistorySnapshot = useCallback(async () => {
    setOperatorHistorySnapshot((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    const result = await getOperatorHistorySummary();

    setOperatorHistorySnapshot({
      loading: false,
      error: result.warnings?.[0] || "",
      summary: {
        totalHistoryItems: result.summary?.totalHistoryItems || 0,
        journalEntries: result.summary?.journalEntries || 0,
        replaySessions: result.summary?.replaySessions || 0,
        datasetRecords: result.summary?.datasetRecords || 0,
        datasetValidations: result.summary?.datasetValidations || 0,
        shadowReadinessRecords: result.summary?.shadowReadinessRecords || 0,
        latestActivityAt: result.summary?.latestActivityAt || null,
        historyStatus: result.summary?.historyStatus || "EMPTY",
      },
    });
  }, []);

  const loadDatasetGovernanceSnapshot = useCallback(async () => {
    setDatasetGovernanceSnapshot((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    const result = await getDatasetGovernanceSummary({
      rawDataCertified: false,
      trainingEnabled: false,
      retentionDays: 365,
      policyVersion: "N8-v1",
    });

    setDatasetGovernanceSnapshot({
      loading: false,
      error: result.warnings?.[0] || "",
      summary: {
        totalDatasets: result.totalDatasets || 0,
        compliantDatasets: result.compliantDatasets || 0,
        reviewRequiredDatasets: result.reviewRequiredDatasets || 0,
        restrictedDatasets: result.restrictedDatasets || 0,
        incompleteDatasets: result.incompleteDatasets || 0,
        activeDatasets: result.activeDatasets || 0,
        archiveCandidates: result.archiveCandidates || 0,
        holdDatasets: result.holdDatasets || 0,
        futureTrainingEligibleDatasets: result.futureTrainingEligibleDatasets || 0,
        trainingBlockedDatasets: result.trainingBlockedDatasets || 0,
        rawDataCertified: result.rawDataCertified === true,
        trainingEnabled: result.trainingEnabled === true,
        policyVersion: result.policyVersion || "N8-v1",
        governanceStatus: result.governanceStatus || "EMPTY",
        warnings: result.warnings || [],
      },
    });
  }, []);

  const replayIntelligence = useMemo(
    () => analyzeReplayIntelligence(journalEntry || {}),
    [journalEntry]
  );
  const behavioralDatasetRecord = useMemo(
    () =>
      createBehavioralDatasetRecord({
        symbol: journalEntry?.symbol,
        journalEntry: journalEntry || {},
        replayIntelligence,
        sessionContext: {
          sessionVerdict: "GOOD SESSION",
          sessionScore: 82,
          executionGrade: "B+",
          behaviorGrade: "B",
          disciplineGrade: "A-",
        },
      }),
    [journalEntry, replayIntelligence]
  );
  const behavioralDatasetStatus = useMemo(
    () => analyzeBehavioralDataset(behavioralDatasetRecord),
    [behavioralDatasetRecord]
  );
  const behavioralTrainingQueueStatus = useMemo(
    () =>
      evaluateBehavioralTrainingCandidate({
        ...behavioralDatasetRecord,
        monitorContext: behavioralDatasetStatus,
      }),
    [behavioralDatasetRecord, behavioralDatasetStatus]
  );
  const behavioralPipelineStatus = useMemo(
    () =>
      analyzeBehavioralPipeline({
        record: behavioralDatasetRecord,
        datasetStatus: behavioralDatasetStatus,
        queueEvaluation: behavioralTrainingQueueStatus,
      }),
    [behavioralDatasetRecord, behavioralDatasetStatus, behavioralTrainingQueueStatus]
  );
  const aiccDatasetRecord = useMemo(
    () =>
      createAiccDatasetRecord({
        symbol: journalEntry?.symbol,
        journalEntry: journalEntry || {},
        replayIntelligence,
        datasetStatus: behavioralDatasetStatus,
        trainingQueueStatus: behavioralTrainingQueueStatus,
        pipelineStatus: behavioralPipelineStatus,
        marketContext: {
          source: "REPLAY_CENTER",
          selectedTradeId,
          behavioralTags: journalEntry?.behavioralTags || [],
        },
      }),
    [
      journalEntry,
      replayIntelligence,
      behavioralDatasetStatus,
      behavioralTrainingQueueStatus,
      behavioralPipelineStatus,
      selectedTradeId,
    ]
  );
  const aiccDatasetValidation = useMemo(
    () => validateAiccDatasetRecord(aiccDatasetRecord),
    [aiccDatasetRecord]
  );
  const shadowTrainingReadiness = useMemo(
    () => evaluateShadowTrainingReadiness(aiccDatasetRecord, aiccDatasetValidation),
    [aiccDatasetRecord, aiccDatasetValidation]
  );
  const replaySessionVerdict = useMemo(
    () =>
      sessionVerdict.map((item) => {
        if (item.label === "Strongest Trait") {
          return { ...item, value: replayIntelligence.strongestTrait };
        }
        if (item.label === "Weakest Trait") {
          return { ...item, value: replayIntelligence.weakestTrait };
        }
        return item;
      }),
    [replayIntelligence]
  );

  const selectedTrade = useMemo(
    () => sampleTrades.find((trade) => trade.id === selectedTradeId) || sampleTrades[0],
    [selectedTradeId]
  );

  useEffect(() => {
    let mounted = true;

    setReplayChartData({
      candles: [],
      quote: null,
      validation: null,
      provenance: null,
      loading: true,
      error: "",
    });

    async function loadReplayChart() {
      const result = await getValidatedChartData(selectedTrade.symbol, replayChartTimeframe, { limit: 80 });

      if (!mounted) return;

      setReplayChartData({
        candles: result.candles || [],
        quote: result.quote || null,
        validation: result.validation || null,
        provenance: result.provenance || null,
        loading: false,
        error: result.error || "",
      });
    }

    loadReplayChart();

    return () => {
      mounted = false;
    };
  }, [replayChartTimeframe, selectedTrade.symbol]);

  useEffect(() => {
    loadPersistedReplaySessions();
  }, [loadPersistedReplaySessions]);

  useEffect(() => {
    loadDatasetRepositorySnapshot();
  }, [loadDatasetRepositorySnapshot]);

  useEffect(() => {
    loadHistoricalValidationSnapshot();
  }, [loadHistoricalValidationSnapshot]);

  useEffect(() => {
    loadOperatorHistorySnapshot();
  }, [loadOperatorHistorySnapshot]);

  useEffect(() => {
    loadDatasetGovernanceSnapshot();
  }, [loadDatasetGovernanceSnapshot]);

  const buildReplaySessionPayload = () => ({
    sessionContext: {
      source: "REPLAY_CENTER",
      journalEntry: journalEntry
        ? {
            symbol: journalEntry.symbol,
            direction: journalEntry.direction,
            result: journalEntry.result,
          }
        : null,
      selectedTradeId,
      selectedTrade,
      sessionVerdict,
      operatorDebrief,
    },
    replayIntelligence,
    status: "REPLAY_REVIEWED",
  });

  const saveReplaySession = async () => {
    setReplayPersistenceStatus((current) => ({
      ...current,
      saving: true,
      error: "",
      message: selectedReplaySessionId ? "Updating replay session." : "Saving replay session.",
    }));

    const payload = buildReplaySessionPayload();
    const result = selectedReplaySessionId
      ? await updatePersistedReplaySession(selectedReplaySessionId, payload)
      : await createReplaySession(payload);

    if (result.error) {
      setReplayPersistenceStatus((current) => ({
        ...current,
        saving: false,
        message: "Replay session was not saved.",
        error: result.error.message,
      }));
      return;
    }

    if (result.data?.id) {
      setSelectedReplaySessionId(result.data.id);
    }

    setReplayPersistenceStatus((current) => ({
      ...current,
      saving: false,
      message: selectedReplaySessionId ? "Replay session updated." : "Replay session saved.",
      error: "",
    }));
    loadPersistedReplaySessions();
  };

  const loadReplaySession = (session) => {
    setSelectedReplaySessionId(session.id);
    setReplayPersistenceStatus((current) => ({
      ...current,
      message: "Saved replay session selected.",
      error: "",
    }));
  };

  const startNewReplaySession = () => {
    setSelectedReplaySessionId(null);
    setReplayPersistenceStatus((current) => ({
      ...current,
      message: "New replay session ready.",
      error: "",
    }));
  };

  const deleteSelectedReplaySession = async () => {
    if (!selectedReplaySessionId) {
      setReplayPersistenceStatus((current) => ({
        ...current,
        message: "No saved replay session selected.",
        error: "",
      }));
      return;
    }

    setReplayPersistenceStatus((current) => ({
      ...current,
      deleting: true,
      error: "",
      message: "Deleting replay session.",
    }));

    const result = await deletePersistedReplaySession(selectedReplaySessionId);

    if (result.error) {
      setReplayPersistenceStatus((current) => ({
        ...current,
        deleting: false,
        message: "Replay session was not deleted.",
        error: result.error.message,
      }));
      return;
    }

    startNewReplaySession();
    setReplayPersistenceStatus((current) => ({
      ...current,
      deleting: false,
      message: "Replay session deleted.",
      error: "",
    }));
    loadPersistedReplaySessions();
  };

  return (
    <div className="replay-center-page">
      <header className="replay-header">
        <span>Operator Intelligence Review System</span>
        <h1>REPLAY CENTER</h1>
        <p>What happened, why it happened, how the operator performed, and what improves next.</p>
      </header>

      {journalEntry && (
        <section className="replay-section replay-operator-debrief">
          <div className="replay-section-title">
            <span>Journal Context</span>
            <h2>REVIEWING JOURNAL ENTRY</h2>
          </div>

          <div className="replay-debrief-grid">
            <div className="replay-debrief-card">
              <span>Symbol</span>
              <strong>{journalEntry.symbol || "AAPL"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Direction</span>
              <strong>{journalEntry.direction || "LONG"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Result</span>
              <strong>{journalEntry.result || "WIN"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Trade Assessment</span>
              <strong>{journalEntry.tradeAssessment || "No assessment supplied."}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Behavioral Tags</span>
              <strong>{journalEntry.behavioralTags?.join(", ") || "No tags selected"}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Trade Thesis</span>
              <strong>{journalEntry.tradeThesis || "No thesis supplied."}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Execution Review</span>
              <strong>{journalEntry.executionReview || "No execution review supplied."}</strong>
            </div>
            <div className="replay-debrief-card">
              <span>Behavioral Reflection</span>
              <strong>{journalEntry.behavioralReflection || "No behavioral reflection supplied."}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="replay-section replay-session-verdict replay-operator-performance">
        <div className="replay-section-title">
          <span>01</span>
          <h2>OPERATOR PERFORMANCE</h2>
        </div>

        <div className="replay-verdict-grid">
          {replaySessionVerdict.map((item) => (
            <div className="replay-summary-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-operator-debrief">
        <div className="replay-section-title">
          <span>02</span>
          <h2>OPERATOR DEBRIEF</h2>
        </div>

        <div className="replay-debrief-grid">
          {operatorDebrief.map((item) => (
            <div className="replay-debrief-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-behavior-hero">
        <div className="replay-section-title">
          <span>03</span>
          <h2>BEHAVIORAL REVIEW</h2>
        </div>

        <div className="replay-scorecard-grid">
          {replayIntelligence.behavioralScores.map((item) => (
            <div className="replay-scorecard" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.score}</strong>
              <div className="replay-score-track">
                <i style={{ width: `${item.score}%` }}></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-top-mistakes-section">
        <div className="replay-section-title">
          <span>04</span>
          <h2>TOP MISTAKES SUMMARY</h2>
        </div>

        <div className="replay-top-mistakes-grid">
          {replayIntelligence.topMistakes.map((item, index) => (
            <div className="replay-top-mistake-card" key={item.type}>
              <span>#{index + 1} {item.type}</span>
              <div><em>Frequency</em><strong>{item.frequency}</strong></div>
              <div><em>Severity</em><strong>{item.severity}</strong></div>
              <p>{item.impact}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-review-layout">
        <div>
          <div className="replay-section-title">
            <span>05</span>
            <h2>TRADE TIMELINE</h2>
          </div>

          <div className="replay-timeline">
            {sampleTrades.map((trade) => (
              <button
                className={selectedTrade.id === trade.id ? "replay-trade-active" : ""}
                key={trade.id}
                onClick={() => setSelectedTradeId(trade.id)}
                type="button"
              >
                <span>Trade #{trade.number}</span>
                <strong>{trade.time}</strong>
                <em>{trade.symbol}</em>
                <b>{trade.direction}</b>
                <p>{trade.result}</p>
              </button>
            ))}
          </div>
        </div>

        <aside>
          <div className="replay-section-title">
            <span>06</span>
            <h2>TRADE BREAKDOWN</h2>
          </div>

          <div className="replay-breakdown-card">
            <h3>
              Trade #{selectedTrade.number} / {selectedTrade.symbol}
            </h3>

            <div className="replay-detail-grid">
              <div><span>Entry</span><strong>{selectedTrade.entry}</strong></div>
              <div><span>Exit</span><strong>{selectedTrade.exit}</strong></div>
              <div><span>Market Structure</span><strong>{selectedTrade.structure}</strong></div>
              <div><span>Momentum</span><strong>{selectedTrade.momentum}</strong></div>
              <div><span>Liquidity</span><strong>{selectedTrade.liquidity}</strong></div>
              <div><span>Volatility</span><strong>{selectedTrade.volatility}</strong></div>
              <div><span>Relative Strength</span><strong>{selectedTrade.relativeStrength}</strong></div>
              <div><span>Narrative Context</span><strong>{selectedTrade.narrative}</strong></div>
            </div>
          </div>
        </aside>
      </section>

      <section className="replay-section replay-chart-section">
        <div className="replay-section-title">
          <span>06A</span>
          <h2>REPLAY CHART CONTEXT</h2>
        </div>

        <MarketPriceChart
          title="Replay Market Context"
          symbol={selectedTrade.symbol}
          timeframe={replayChartTimeframe}
          candles={replayChartData.candles}
          quote={replayChartData.quote}
          validation={replayChartData.validation}
          provenance={replayChartData.provenance}
          loading={replayChartData.loading}
          error={replayChartData.error}
          availableSymbols={sampleTrades.map((trade) => trade.symbol)}
          availableTimeframes={CHART_TIMEFRAMES}
          onSymbolChange={(symbol) => {
            const matchingTrade = sampleTrades.find((trade) => trade.symbol === symbol);
            if (matchingTrade) setSelectedTradeId(matchingTrade.id);
          }}
          onTimeframeChange={setReplayChartTimeframe}
          height={420}
        />

        <div className="replay-debrief-grid replay-chart-note-grid">
          <div className="replay-debrief-card">
            <span>Marker Status</span>
            <strong>PARTIAL</strong>
            <p>Entry and exit markers require persisted replay timestamps and validated operator trade prices.</p>
          </div>
          <div className="replay-debrief-card">
            <span>Replay Source</span>
            <strong>{selectedTrade.symbol}</strong>
            <p>Historical provider candles are shown only when they pass chart validation.</p>
          </div>
        </div>
      </section>

      <section className="replay-section">
        <div className="replay-section-title">
          <span>07</span>
          <h2>REPLAY PERSISTENCE</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Save Status</span>
            <strong>{replayPersistenceStatus.message}</strong>
            {replayPersistenceStatus.error && <p>{replayPersistenceStatus.error}</p>}
          </div>
          <div className="replay-debrief-card">
            <span>Load Status</span>
            <strong>{replayPersistenceStatus.loading ? "LOADING" : "READY"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Selected Replay Session</span>
            <strong>{selectedReplaySessionId || "NONE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Saved Sessions</span>
            <strong>{persistedReplaySessions.length}</strong>
          </div>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Replay Actions</span>
            <button type="button" onClick={saveReplaySession} disabled={replayPersistenceStatus.saving}>
              {selectedReplaySessionId ? "Update Replay Session" : "Save Replay Session"}
            </button>
            <button type="button" onClick={startNewReplaySession}>
              New Session
            </button>
            <button
              type="button"
              onClick={deleteSelectedReplaySession}
              disabled={!selectedReplaySessionId || replayPersistenceStatus.deleting}
            >
              Delete Session
            </button>
            <button type="button" onClick={loadPersistedReplaySessions} disabled={replayPersistenceStatus.loading}>
              Refresh Sessions
            </button>
          </div>
        </div>

        <div className="replay-mistake-table">
          {persistedReplaySessions.length === 0 ? (
            <div className="replay-mistake-row">
              <div><span>Empty Replay History</span><strong>No saved replay sessions loaded.</strong></div>
              <div><span>Status</span><strong>STAGING ONLY</strong></div>
              <div><span>Persistence Scope</span><strong>replay_sessions</strong></div>
              <div><span>Training</span><strong>OFF</strong></div>
            </div>
          ) : (
            persistedReplaySessions.map((session) => (
              <div className="replay-mistake-row" key={session.id}>
                <div><span>Replay Session</span><strong>{session.id}</strong></div>
                <div><span>Status</span><strong>{session.status || "REPLAY_REVIEWED"}</strong></div>
                <div><span>Created</span><strong>{session.created_at || "UNKNOWN"}</strong></div>
                <div>
                  <span>Action</span>
                  <button type="button" onClick={() => loadReplaySession(session)}>
                    Load Session
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="replay-section">
        <div className="replay-section-title">
          <span>08</span>
          <h2>MISTAKE INTELLIGENCE</h2>
        </div>

        <div className="replay-mistake-table">
          {mistakeIntelligence.map((item) => (
            <div className="replay-mistake-row" key={item.type}>
              <div><span>Mistake Type</span><strong>{item.type}</strong></div>
              <div><span>Frequency</span><strong>{item.frequency}</strong></div>
              <div><span>Severity</span><strong>{item.severity}</strong></div>
              <div><span>Impact</span><strong>{item.impact}</strong></div>
            </div>
          ))}
        </div>
      </section>

      <section className="replay-section replay-operator-debrief">
        <div className="replay-section-title">
          <span>09</span>
          <h2>BEHAVIORAL DATASET STATUS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Dataset Ready</span>
            <strong>{behavioralDatasetStatus.datasetReady ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Readiness Score</span>
            <strong>{behavioralDatasetStatus.readinessScore}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Quality</span>
            <strong>{behavioralDatasetStatus.quality}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Positive Signals</span>
            <strong>{behavioralDatasetStatus.positiveSignals.length}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Negative Signals</span>
            <strong>{behavioralDatasetStatus.negativeSignals.length}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Risk Signals</span>
            <strong>{behavioralDatasetStatus.riskSignals.length}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Execution Signals</span>
            <strong>{behavioralDatasetStatus.executionSignals.length}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Persisted</span>
            <strong>{behavioralDatasetRecord.metadata.persisted ? "TRUE" : "FALSE"}</strong>
          </div>
        </div>
      </section>

      <section className="replay-section replay-operator-debrief">
        <div className="replay-section-title">
          <span>10</span>
          <h2>TRAINING QUEUE STATUS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Queue Eligible</span>
            <strong>{behavioralTrainingQueueStatus.queueEligible ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Queue Score</span>
            <strong>{behavioralTrainingQueueStatus.queueScore}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Queue Priority</span>
            <strong>{behavioralTrainingQueueStatus.queuePriority}</strong>
          </div>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Acceptance Reasons</span>
            <ul>
              {behavioralTrainingQueueStatus.acceptanceReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div className="replay-debrief-card">
            <span>Rejection Reasons</span>
            <ul>
              {behavioralTrainingQueueStatus.rejectionReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          {behavioralTrainingQueueStatus.warnings.length > 0 && (
            <div className="replay-debrief-card">
              <span>Warnings</span>
              <ul>
                {behavioralTrainingQueueStatus.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="replay-section replay-operator-debrief">
        <div className="replay-section-title">
          <span>11</span>
          <h2>BEHAVIORAL PIPELINE STATUS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Current Stage</span>
            <strong>{behavioralPipelineStatus.pipelineStage || "JOURNAL_CAPTURED"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Completion</span>
            <strong>{behavioralPipelineStatus.completionPercent ?? 0}%</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Next Required Action</span>
            <strong>{behavioralPipelineStatus.nextRequiredAction || "Complete replay review"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Dataset Ready</span>
            <strong>{behavioralPipelineStatus.datasetReady ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Queue Eligible</span>
            <strong>{behavioralPipelineStatus.queueEligible ? "TRUE" : "FALSE"}</strong>
          </div>
          {behavioralPipelineStatus.warnings.length > 0 && (
            <div className="replay-debrief-card">
              <span>Warnings</span>
              <ul>
                {behavioralPipelineStatus.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>12</span>
          <h2>AICC DATASET CAPTURE STATUS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Dataset ID</span>
            <strong>{aiccDatasetRecord.id}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Quality Score</span>
            <strong>{aiccDatasetValidation.qualityScore}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Quality Label</span>
            <strong>{aiccDatasetValidation.qualityLabel}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Valid</span>
            <strong>{aiccDatasetValidation.valid ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Accepted For Shadow Training</span>
            <strong>{aiccDatasetValidation.acceptedForShadowTraining ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Persisted</span>
            <strong>{aiccDatasetRecord.metadata.persisted ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Training Activated</span>
            <strong>{aiccDatasetRecord.metadata.trainingActivated ? "TRUE" : "FALSE"}</strong>
          </div>
          {aiccDatasetValidation.warnings.length > 0 && (
            <div className="replay-debrief-card">
              <span>Warnings</span>
              <ul>
                {aiccDatasetValidation.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          {aiccDatasetValidation.missingFields.length > 0 && (
            <div className="replay-debrief-card">
              <span>Missing Fields</span>
              <ul>
                {aiccDatasetValidation.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>13</span>
          <h2>SHADOW TRAINING READINESS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Ready</span>
            <strong>{shadowTrainingReadiness.shadowTrainingReady ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Readiness Score</span>
            <strong>{shadowTrainingReadiness.readinessScore}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Readiness Label</span>
            <strong>{shadowTrainingReadiness.readinessLabel}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Priority</span>
            <strong>{shadowTrainingReadiness.priority}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Tactical Ready</span>
            <strong>{shadowTrainingReadiness.tacticalReady ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Behavioral Ready</span>
            <strong>{shadowTrainingReadiness.behavioralReady ? "TRUE" : "FALSE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Failsafe Ready</span>
            <strong>{shadowTrainingReadiness.failsafeReady ? "TRUE" : "FALSE"}</strong>
          </div>
          {shadowTrainingReadiness.acceptanceReasons.length > 0 && (
            <div className="replay-debrief-card">
              <span>Acceptance Reasons</span>
              <ul>
                {shadowTrainingReadiness.acceptanceReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          {shadowTrainingReadiness.rejectionReasons.length > 0 && (
            <div className="replay-debrief-card">
              <span>Rejection Reasons</span>
              <ul>
                {shadowTrainingReadiness.rejectionReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          {shadowTrainingReadiness.warnings.length > 0 && (
            <div className="replay-debrief-card">
              <span>Warnings</span>
              <ul>
                {shadowTrainingReadiness.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>14</span>
          <h2>DATASET REPOSITORY SNAPSHOT</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Total Datasets</span>
            <strong>{datasetRepositorySnapshot.summary.totalDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Valid Datasets</span>
            <strong>{datasetRepositorySnapshot.summary.validDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Shadow Ready Datasets</span>
            <strong>{datasetRepositorySnapshot.summary.shadowReadyDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>High Quality</span>
            <strong>{datasetRepositorySnapshot.summary.highQualityDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Moderate Quality</span>
            <strong>{datasetRepositorySnapshot.summary.moderateQualityDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Low Quality</span>
            <strong>{datasetRepositorySnapshot.summary.lowQualityDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Symbols</span>
            <strong>{datasetRepositorySnapshot.summary.symbols.join(", ") || "NONE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Latest Updated</span>
            <strong>{datasetRepositorySnapshot.summary.latestUpdatedAt || "NONE"}</strong>
          </div>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Repository Status</span>
            <strong>{datasetRepositorySnapshot.loading ? "LOADING" : "READY"}</strong>
            {datasetRepositorySnapshot.error && <p>{datasetRepositorySnapshot.error}</p>}
          </div>
          <div className="replay-debrief-card">
            <span>Persistence Scope</span>
            <strong>aicc_dataset_records / dataset_validations / shadow_readiness</strong>
          </div>
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>15</span>
          <h2>HISTORICAL DATASET VALIDATION</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Total Datasets</span>
            <strong>{historicalValidationSnapshot.summary.totalDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Revalidated Datasets</span>
            <strong>{historicalValidationSnapshot.summary.revalidatedDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Consistent Datasets</span>
            <strong>{historicalValidationSnapshot.summary.consistentDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Inconsistent Datasets</span>
            <strong>{historicalValidationSnapshot.summary.inconsistentDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Consistency Rate</span>
            <strong>{historicalValidationSnapshot.summary.consistencyRate}%</strong>
          </div>
          <div className="replay-debrief-card">
            <span>High Quality</span>
            <strong>{historicalValidationSnapshot.summary.highQualityDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Shadow Ready</span>
            <strong>{historicalValidationSnapshot.summary.shadowReadyDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Status</span>
            <strong>
              {historicalValidationSnapshot.loading
                ? "LOADING"
                : historicalValidationSnapshot.summary.historicalValidationStatus}
            </strong>
            {historicalValidationSnapshot.error && <p>{historicalValidationSnapshot.error}</p>}
          </div>
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>16</span>
          <h2>OPERATOR HISTORY SNAPSHOT</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Total History Items</span>
            <strong>{operatorHistorySnapshot.summary.totalHistoryItems}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Journal Entries</span>
            <strong>{operatorHistorySnapshot.summary.journalEntries}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Replay Sessions</span>
            <strong>{operatorHistorySnapshot.summary.replaySessions}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Dataset Records</span>
            <strong>{operatorHistorySnapshot.summary.datasetRecords}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Dataset Validations</span>
            <strong>{operatorHistorySnapshot.summary.datasetValidations}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Shadow Readiness Records</span>
            <strong>{operatorHistorySnapshot.summary.shadowReadinessRecords}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Latest Activity</span>
            <strong>{operatorHistorySnapshot.summary.latestActivityAt || "NONE"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>History Status</span>
            <strong>{operatorHistorySnapshot.loading ? "LOADING" : operatorHistorySnapshot.summary.historyStatus}</strong>
            {operatorHistorySnapshot.error && <p>{operatorHistorySnapshot.error}</p>}
          </div>
        </div>
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>17</span>
          <h2>DATASET GOVERNANCE STATUS</h2>
        </div>

        <div className="replay-debrief-grid">
          <div className="replay-debrief-card">
            <span>Governance Status</span>
            <strong>
              {datasetGovernanceSnapshot.loading
                ? "LOADING"
                : datasetGovernanceSnapshot.summary.governanceStatus}
            </strong>
          </div>
          <div className="replay-debrief-card">
            <span>Total Datasets</span>
            <strong>{datasetGovernanceSnapshot.summary.totalDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Compliant</span>
            <strong>{datasetGovernanceSnapshot.summary.compliantDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Review Required</span>
            <strong>{datasetGovernanceSnapshot.summary.reviewRequiredDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Restricted</span>
            <strong>{datasetGovernanceSnapshot.summary.restrictedDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Incomplete</span>
            <strong>{datasetGovernanceSnapshot.summary.incompleteDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Active</span>
            <strong>{datasetGovernanceSnapshot.summary.activeDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Archive Candidates</span>
            <strong>{datasetGovernanceSnapshot.summary.archiveCandidates}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Hold</span>
            <strong>{datasetGovernanceSnapshot.summary.holdDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Future Training Eligible</span>
            <strong>{datasetGovernanceSnapshot.summary.futureTrainingEligibleDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Training Blocked</span>
            <strong>{datasetGovernanceSnapshot.summary.trainingBlockedDatasets}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Raw Data Certified</span>
            <strong>{datasetGovernanceSnapshot.summary.rawDataCertified ? "YES" : "NO"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Training Enabled</span>
            <strong>{datasetGovernanceSnapshot.summary.trainingEnabled ? "YES" : "NO"}</strong>
          </div>
          <div className="replay-debrief-card">
            <span>Policy Version</span>
            <strong>{datasetGovernanceSnapshot.summary.policyVersion}</strong>
          </div>
        </div>

        {datasetGovernanceSnapshot.summary.warnings.length > 0 && (
          <div className="replay-debrief-grid">
            <div className="replay-debrief-card">
              <span>Warnings</span>
              <ul>
                {datasetGovernanceSnapshot.summary.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="replay-section replay-improvement-section">
        <div className="replay-section-title">
          <span>18</span>
          <h2>MISSION FOR NEXT SESSION</h2>
        </div>

        <div className="replay-improvement-grid">
          {replayIntelligence.missionForNextSession.map((item) => (
            <div className="replay-improvement-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ReplayCenter;
