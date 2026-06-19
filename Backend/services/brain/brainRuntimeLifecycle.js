const { resolveMarketSession, SESSION_STATES } = require("../marketSessionPolicy");

const POLICY_VERSION = "PRE_SHADOW_RUNTIME_LIFECYCLE_V1";

const RUNTIME_STATES = {
  SLEEPING: "SLEEPING",
  WARMING_UP: "WARMING_UP",
  ACTIVE_OBSERVATION: "ACTIVE_OBSERVATION",
  DAILY_CLOSEOUT: "DAILY_CLOSEOUT",
  REST_AND_DAILY_REVIEW: "REST_AND_DAILY_REVIEW",
  WEEKLY_SUBMISSION: "WEEKLY_SUBMISSION",
  WEEKLY_REVIEW: "WEEKLY_REVIEW",
  DEGRADED: "DEGRADED",
  QUARANTINED: "QUARANTINED",
  HUMAN_REVIEW_REQUIRED: "HUMAN_REVIEW_REQUIRED"
};

const ACTIONS = {
  HEALTH_CHECK: "HEALTH_CHECK",
  DIAGNOSTICS: "DIAGNOSTICS",
  CONFIGURATION_VALIDATION: "CONFIGURATION_VALIDATION",
  LEDGER_ACCESS: "LEDGER_ACCESS",
  ADMINISTRATIVE_REVIEW: "ADMINISTRATIVE_REVIEW",
  PROVIDER_VALIDATION: "PROVIDER_VALIDATION",
  SESSION_VALIDATION: "SESSION_VALIDATION",
  MISSION_CONTRACT_VALIDATION: "MISSION_CONTRACT_VALIDATION",
  OBJECTIVE_LOADING: "OBJECTIVE_LOADING",
  PRIOR_LEDGER_LOADING: "PRIOR_LEDGER_LOADING",
  PROVENANCE_CHECKS: "PROVENANCE_CHECKS",
  APPROVED_INPUT_INGESTION: "APPROVED_INPUT_INGESTION",
  NON_AUTHORITATIVE_OBSERVATION: "NON_AUTHORITATIVE_OBSERVATION",
  DAILY_LEDGER_RECORDING: "DAILY_LEDGER_RECORDING",
  OBJECTIVE_MEASUREMENT: "OBJECTIVE_MEASUREMENT",
  FINISH_IN_FLIGHT_VALIDATION: "FINISH_IN_FLIGHT_VALIDATION",
  CALCULATE_METRICS: "CALCULATE_METRICS",
  FINALIZE_LEDGER: "FINALIZE_LEDGER",
  SUBMIT_COMPLETED_RECORDS: "SUBMIT_COMPLETED_RECORDS",
  DAILY_REVIEW: "DAILY_REVIEW",
  COMPARISON: "COMPARISON",
  NEXT_SESSION_PREPARATION: "NEXT_SESSION_PREPARATION",
  SUBMIT_FINALIZED_DAILY_RECORDS: "SUBMIT_FINALIZED_DAILY_RECORDS",
  VERIFY_COMPLETENESS: "VERIFY_COMPLETENESS",
  LOCK_WEEKLY_RECORD_SET: "LOCK_WEEKLY_RECORD_SET",
  AGGREGATE_RECORDS: "AGGREGATE_RECORDS",
  COMPARE_BASELINE: "COMPARE_BASELINE",
  DETECT_REGRESSIONS: "DETECT_REGRESSIONS",
  PROPOSE_OBJECTIVES: "PROPOSE_OBJECTIVES",
  HUMAN_REVIEW: "HUMAN_REVIEW",
  LOGGING: "LOGGING",
  HUMAN_INSPECTION: "HUMAN_INSPECTION",
  MARKET_OBSERVATION: "MARKET_OBSERVATION",
  LIVE_DATASET_CAPTURE: "LIVE_DATASET_CAPTURE",
  AUTHORITATIVE_OUTPUT: "AUTHORITATIVE_OUTPUT",
  WEIGHT_UPDATE: "WEIGHT_UPDATE",
  TRAINING: "TRAINING",
  PROMOTION: "PROMOTION",
  LIVE_TRADING: "LIVE_TRADING",
  MISSION_CHANGE: "MISSION_CHANGE",
  OBJECTIVE_APPROVAL: "OBJECTIVE_APPROVAL",
  OBJECTIVE_ACTIVATION: "OBJECTIVE_ACTIVATION",
  RECORD_REWRITE: "RECORD_REWRITE",
  QUARANTINE_RELEASE: "QUARANTINE_RELEASE"
};

const ALLOWED_BY_STATE = Object.freeze({
  [RUNTIME_STATES.SLEEPING]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.CONFIGURATION_VALIDATION,
    ACTIONS.LEDGER_ACCESS,
    ACTIONS.ADMINISTRATIVE_REVIEW
  ]),
  [RUNTIME_STATES.WARMING_UP]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.PROVIDER_VALIDATION,
    ACTIONS.SESSION_VALIDATION,
    ACTIONS.MISSION_CONTRACT_VALIDATION,
    ACTIONS.OBJECTIVE_LOADING,
    ACTIONS.PRIOR_LEDGER_LOADING,
    ACTIONS.PROVENANCE_CHECKS
  ]),
  [RUNTIME_STATES.ACTIVE_OBSERVATION]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.APPROVED_INPUT_INGESTION,
    ACTIONS.NON_AUTHORITATIVE_OBSERVATION,
    ACTIONS.DAILY_LEDGER_RECORDING,
    ACTIONS.OBJECTIVE_MEASUREMENT,
    ACTIONS.PROVENANCE_CHECKS
  ]),
  [RUNTIME_STATES.DAILY_CLOSEOUT]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.FINISH_IN_FLIGHT_VALIDATION,
    ACTIONS.CALCULATE_METRICS,
    ACTIONS.FINALIZE_LEDGER,
    ACTIONS.SUBMIT_COMPLETED_RECORDS
  ]),
  [RUNTIME_STATES.REST_AND_DAILY_REVIEW]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.DAILY_REVIEW,
    ACTIONS.COMPARISON,
    ACTIONS.NEXT_SESSION_PREPARATION,
    ACTIONS.LEDGER_ACCESS
  ]),
  [RUNTIME_STATES.WEEKLY_SUBMISSION]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.SUBMIT_FINALIZED_DAILY_RECORDS,
    ACTIONS.VERIFY_COMPLETENESS,
    ACTIONS.LOCK_WEEKLY_RECORD_SET
  ]),
  [RUNTIME_STATES.WEEKLY_REVIEW]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.AGGREGATE_RECORDS,
    ACTIONS.COMPARE_BASELINE,
    ACTIONS.DETECT_REGRESSIONS,
    ACTIONS.PROPOSE_OBJECTIVES,
    ACTIONS.HUMAN_REVIEW
  ]),
  [RUNTIME_STATES.DEGRADED]: Object.freeze([
    ACTIONS.HEALTH_CHECK,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.CONFIGURATION_VALIDATION,
    ACTIONS.PROVENANCE_CHECKS,
    ACTIONS.HUMAN_REVIEW
  ]),
  [RUNTIME_STATES.QUARANTINED]: Object.freeze([
    ACTIONS.LOGGING,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.HUMAN_INSPECTION,
    ACTIONS.HUMAN_REVIEW
  ]),
  [RUNTIME_STATES.HUMAN_REVIEW_REQUIRED]: Object.freeze([
    ACTIONS.LOGGING,
    ACTIONS.DIAGNOSTICS,
    ACTIONS.HUMAN_INSPECTION,
    ACTIONS.HUMAN_REVIEW
  ])
});

const UNIVERSALLY_BLOCKED = new Set([
  ACTIONS.WEIGHT_UPDATE,
  ACTIONS.TRAINING,
  ACTIONS.PROMOTION,
  ACTIONS.LIVE_TRADING,
  ACTIONS.MISSION_CHANGE,
  ACTIONS.OBJECTIVE_APPROVAL,
  ACTIONS.OBJECTIVE_ACTIVATION,
  ACTIONS.RECORD_REWRITE,
  ACTIONS.QUARANTINE_RELEASE,
  ACTIONS.AUTHORITATIVE_OUTPUT
]);

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function getEasternWeekday(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long"
  });
  return formatter.format(date);
}

function minutesUntil(currentIso, futureIso) {
  const current = new Date(currentIso).getTime();
  const future = new Date(futureIso).getTime();
  if (!Number.isFinite(current) || !Number.isFinite(future)) return null;
  return (future - current) / 60000;
}

function resolveSession(context = {}) {
  if (context.marketSession && typeof context.marketSession === "object") {
    return context.marketSession;
  }

  return resolveMarketSession({
    currentTime: context.currentTime,
    providerClock: context.providerClock,
    providerCalendar: context.providerCalendar
  });
}

function getBrainRuntimeState(context = {}) {
  if (context.quarantined === true) return RUNTIME_STATES.QUARANTINED;
  if (context.humanReviewRequired === true) return RUNTIME_STATES.HUMAN_REVIEW_REQUIRED;
  if (context.degraded === true) return RUNTIME_STATES.DEGRADED;

  const session = resolveSession(context);
  const sessionState = normalize(session.sessionState);
  const currentTime = session.currentTime || context.currentTime;
  const currentDate = new Date(currentTime || Date.now());
  const weekday = Number.isFinite(currentDate.getTime()) ? getEasternWeekday(currentDate) : null;
  const beforeNextOpenMinutes = session.nextOpen
    ? minutesUntil(currentTime, session.nextOpen)
    : null;

  if (sessionState === SESSION_STATES.UNKNOWN_SESSION) {
    return RUNTIME_STATES.SLEEPING;
  }

  if (
    beforeNextOpenMinutes !== null &&
    beforeNextOpenMinutes > 0 &&
    beforeNextOpenMinutes <= 60
  ) {
    return RUNTIME_STATES.WARMING_UP;
  }

  if ([SESSION_STATES.PRE_MARKET, SESSION_STATES.REGULAR_MARKET].includes(sessionState)) {
    return RUNTIME_STATES.ACTIVE_OBSERVATION;
  }

  if (weekday === "Friday" && [SESSION_STATES.AFTER_HOURS, SESSION_STATES.OVERNIGHT].includes(sessionState)) {
    if (context.dailyLedgerFinalized !== true) return RUNTIME_STATES.DAILY_CLOSEOUT;
    if (context.weeklySubmitted !== true) return RUNTIME_STATES.WEEKLY_SUBMISSION;
    return RUNTIME_STATES.WEEKLY_REVIEW;
  }

  if (sessionState === SESSION_STATES.WEEKEND) {
    return RUNTIME_STATES.WEEKLY_REVIEW;
  }

  if (sessionState === SESSION_STATES.MARKET_HOLIDAY) {
    return RUNTIME_STATES.REST_AND_DAILY_REVIEW;
  }

  if ([SESSION_STATES.AFTER_HOURS, SESSION_STATES.OVERNIGHT].includes(sessionState)) {
    return RUNTIME_STATES.REST_AND_DAILY_REVIEW;
  }

  return RUNTIME_STATES.SLEEPING;
}

function getAllowedBrainActions(state) {
  return [...(ALLOWED_BY_STATE[normalize(state)] || [])];
}

function validateBrainAction(state, action) {
  const normalizedState = normalize(state);
  const normalizedAction = normalize(action);

  if (!ALLOWED_BY_STATE[normalizedState]) {
    return {
      valid: false,
      status: "UNKNOWN_STATE_BLOCKED",
      reasons: ["Unknown lifecycle state fails closed."]
    };
  }

  if (UNIVERSALLY_BLOCKED.has(normalizedAction)) {
    return {
      valid: false,
      status: "ACTION_BLOCKED",
      reasons: [`${normalizedAction} is blocked in all pre-shadow lifecycle states.`]
    };
  }

  const allowed = new Set(ALLOWED_BY_STATE[normalizedState]);
  const valid = allowed.has(normalizedAction);

  return {
    valid,
    status: valid ? "ACTION_ALLOWED" : "ACTION_BLOCKED",
    reasons: valid ? [] : [`${normalizedAction} is not allowed during ${normalizedState}.`]
  };
}

function getNextLifecycleTransition(context = {}) {
  const session = resolveSession(context);
  const state = getBrainRuntimeState({ ...context, marketSession: session });

  return {
    currentState: state,
    calendarAuthority: session.source || "UNKNOWN",
    sessionVerified: session.verified === true,
    currentTime: session.currentTime || null,
    nextOpen: session.nextOpen || null,
    previousClose: session.previousClose || null,
    warnings: session.warnings || []
  };
}

function getLifecyclePolicyStatus() {
  return {
    policyVersion: POLICY_VERSION,
    status: "READY_WITH_GAPS",
    backendState: "ALWAYS_ON",
    calendarAuthority: "marketSessionPolicy",
    providerCalendarSupported: true,
    systemClockFallback: true,
    observationFailsClosedOnUnknownSession: true,
    trainingAllowed: false,
    promotionAllowed: false,
    liveTradingAllowed: false,
    gaps: [
      "Provider holiday and early-close calendar must be supplied for verified schedule transitions.",
      "No process manager or host restart policy is installed by this service."
    ]
  };
}

module.exports = {
  ACTIONS,
  POLICY_VERSION,
  RUNTIME_STATES,
  getAllowedBrainActions,
  getBrainRuntimeState,
  getLifecyclePolicyStatus,
  getNextLifecycleTransition,
  validateBrainAction
};
