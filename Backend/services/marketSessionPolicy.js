const EASTERN_TIME_ZONE = "America/New_York";

const SESSION_STATES = {
  PRE_MARKET: "PRE_MARKET",
  REGULAR_MARKET: "REGULAR_MARKET",
  AFTER_HOURS: "AFTER_HOURS",
  OVERNIGHT: "OVERNIGHT",
  WEEKEND: "WEEKEND",
  MARKET_HOLIDAY: "MARKET_HOLIDAY",
  UNKNOWN_SESSION: "UNKNOWN_SESSION"
};

const DATA_STATES = {
  RAW_LIVE: "RAW_LIVE",
  RAW_DELAYED: "RAW_DELAYED",
  RAW_CACHED: "RAW_CACHED",
  PARTIAL_DATA: "PARTIAL_DATA",
  STALE: "STALE",
  MARKET_CLOSED: "MARKET_CLOSED",
  PROVIDER_OFFLINE: "PROVIDER_OFFLINE",
  BACKEND_UNAVAILABLE: "BACKEND_UNAVAILABLE",
  DATA_UNAVAILABLE: "DATA_UNAVAILABLE",
  UNKNOWN: "UNKNOWN"
};

const PRE_MARKET_OPEN_MINUTES = 4 * 60;
const REGULAR_OPEN_MINUTES = 9 * 60 + 30;
const REGULAR_CLOSE_MINUTES = 16 * 60;
const AFTER_HOURS_CLOSE_MINUTES = 20 * 60;
const DEFAULT_STALE_THRESHOLD_MS = 15 * 60 * 1000;

function safeDate(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEasternTimeParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    weekday: valueByType.weekday,
    hour: Number(valueByType.hour),
    minute: Number(valueByType.minute)
  };
}

function isWeekend(weekday) {
  return weekday === "Saturday" || weekday === "Sunday";
}

function normalizeSessionState(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return Object.values(SESSION_STATES).includes(normalized)
    ? normalized
    : null;
}

function normalizeDataState(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return Object.values(DATA_STATES).includes(normalized)
    ? normalized
    : null;
}

function sessionFromSystemClock(date) {
  const parts = getEasternTimeParts(date);
  const minutes = parts.hour * 60 + parts.minute;

  if (isWeekend(parts.weekday)) return SESSION_STATES.WEEKEND;
  if (minutes >= PRE_MARKET_OPEN_MINUTES && minutes < REGULAR_OPEN_MINUTES) return SESSION_STATES.PRE_MARKET;
  if (minutes >= REGULAR_OPEN_MINUTES && minutes < REGULAR_CLOSE_MINUTES) return SESSION_STATES.REGULAR_MARKET;
  if (minutes >= REGULAR_CLOSE_MINUTES && minutes < AFTER_HOURS_CLOSE_MINUTES) return SESSION_STATES.AFTER_HOURS;
  return SESSION_STATES.OVERNIGHT;
}

function resolveMarketSession(input = {}) {
  const warnings = [];
  const requestedTime = input.currentTime || input.timestamp || input.now;
  const currentDate = safeDate(requestedTime);
  const providerClock = input.providerClock && typeof input.providerClock === "object"
    ? input.providerClock
    : null;
  const providerCalendar = input.providerCalendar && typeof input.providerCalendar === "object"
    ? input.providerCalendar
    : null;

  if (requestedTime && !currentDate) {
    return {
      sessionState: SESSION_STATES.UNKNOWN_SESSION,
      marketOpen: false,
      extendedHours: false,
      source: "UNKNOWN",
      verified: false,
      currentTime: null,
      nextOpen: null,
      previousClose: null,
      warnings: ["Market session input time is malformed; session is unknown."]
    };
  }

  const effectiveDate = currentDate || new Date();

  if (providerCalendar?.isHoliday === true) {
    return {
      sessionState: SESSION_STATES.MARKET_HOLIDAY,
      marketOpen: false,
      extendedHours: false,
      source: "PROVIDER_CALENDAR",
      verified: true,
      currentTime: effectiveDate.toISOString(),
      nextOpen: providerCalendar.nextOpen || null,
      previousClose: providerCalendar.previousClose || null,
      warnings
    };
  }

  const explicitSession = normalizeSessionState(providerClock?.sessionState || providerClock?.session);
  if (explicitSession) {
    return {
      sessionState: explicitSession,
      marketOpen: providerClock.marketOpen === true || explicitSession === SESSION_STATES.REGULAR_MARKET,
      extendedHours: providerClock.extendedHours === true ||
        explicitSession === SESSION_STATES.PRE_MARKET ||
        explicitSession === SESSION_STATES.AFTER_HOURS,
      source: "PROVIDER_CLOCK",
      verified: true,
      currentTime: effectiveDate.toISOString(),
      nextOpen: providerClock.nextOpen || null,
      previousClose: providerClock.previousClose || null,
      warnings
    };
  }

  if (providerClock && providerClock.marketOpen === true) {
    return {
      sessionState: SESSION_STATES.REGULAR_MARKET,
      marketOpen: true,
      extendedHours: false,
      source: "PROVIDER_CLOCK",
      verified: true,
      currentTime: effectiveDate.toISOString(),
      nextOpen: providerClock.nextOpen || null,
      previousClose: providerClock.previousClose || null,
      warnings
    };
  }

  const sessionState = sessionFromSystemClock(effectiveDate);
  warnings.push("Market session is system-clock derived; provider clock/calendar verification is unavailable.");

  return {
    sessionState,
    marketOpen: sessionState === SESSION_STATES.REGULAR_MARKET,
    extendedHours: sessionState === SESSION_STATES.PRE_MARKET || sessionState === SESSION_STATES.AFTER_HOURS,
    source: "SYSTEM_CLOCK_DERIVED",
    verified: false,
    currentTime: effectiveDate.toISOString(),
    nextOpen: null,
    previousClose: null,
    warnings
  };
}

function getDataAge(timestamp, currentTime) {
  if (!timestamp) return null;
  const dataTime = new Date(timestamp).getTime();
  const current = new Date(currentTime).getTime();

  if (!Number.isFinite(dataTime) || !Number.isFinite(current)) return null;
  return Math.max(0, current - dataTime);
}

function isClosedSession(sessionState) {
  return [
    SESSION_STATES.OVERNIGHT,
    SESSION_STATES.WEEKEND,
    SESSION_STATES.MARKET_HOLIDAY
  ].includes(sessionState);
}

function classifyMarketDataState(input = {}) {
  const session = input.session || resolveMarketSession(input);
  const warnings = [...(Array.isArray(session.warnings) ? session.warnings : [])];
  const sourceType = String(input.sourceType || "").toUpperCase();
  const provider = String(input.provider || "").toUpperCase();
  const timestamp = input.timestamp || input.updatedAt || null;
  const dataAge = getDataAge(timestamp, input.currentTime || session.currentTime);
  const staleThresholdMs = Number.isFinite(Number(input.staleThresholdMs))
    ? Number(input.staleThresholdMs)
    : DEFAULT_STALE_THRESHOLD_MS;
  const explicitState = normalizeDataState(input.dataState);

  if (explicitState) {
    return { dataState: explicitState, dataAge, warnings };
  }

  if (input.simulated === true || input.generated === true || sourceType === "SIMULATED") {
    warnings.push("Simulated or generated market data is not raw market data.");
    return { dataState: DATA_STATES.DATA_UNAVAILABLE, dataAge, warnings };
  }

  if (input.backendAvailable === false || sourceType === DATA_STATES.BACKEND_UNAVAILABLE) {
    return { dataState: DATA_STATES.BACKEND_UNAVAILABLE, dataAge, warnings };
  }

  const providerExplicitlyUnavailable =
    provider === "PROVIDER_UNAVAILABLE" ||
    sourceType === "PROVIDER_UNAVAILABLE" ||
    sourceType === DATA_STATES.PROVIDER_OFFLINE;

  if (providerExplicitlyUnavailable || (input.providerAvailable === false && session.marketOpen)) {
    return {
      dataState: session.marketOpen ? DATA_STATES.PROVIDER_OFFLINE : DATA_STATES.DATA_UNAVAILABLE,
      dataAge,
      warnings
    };
  }

  if (input.available === false) {
    return {
      dataState: isClosedSession(session.sessionState) ? DATA_STATES.MARKET_CLOSED : DATA_STATES.DATA_UNAVAILABLE,
      dataAge,
      warnings
    };
  }

  if (!timestamp && input.available === true) {
    warnings.push("Available market data is missing a verified provider timestamp.");
    return { dataState: DATA_STATES.UNKNOWN, dataAge, warnings };
  }

  if (dataAge !== null && dataAge > staleThresholdMs) {
    return {
      dataState: isClosedSession(session.sessionState) || sourceType === DATA_STATES.RAW_CACHED
        ? DATA_STATES.RAW_CACHED
        : DATA_STATES.STALE,
      dataAge,
      warnings
    };
  }

  if (sourceType === DATA_STATES.RAW_LIVE || sourceType === DATA_STATES.RAW_DELAYED || sourceType === DATA_STATES.RAW_CACHED) {
    return { dataState: sourceType, dataAge, warnings };
  }

  if (sourceType === DATA_STATES.PARTIAL_DATA) {
    return { dataState: DATA_STATES.PARTIAL_DATA, dataAge, warnings };
  }

  if (session.marketOpen && input.available === true) {
    return { dataState: DATA_STATES.RAW_DELAYED, dataAge, warnings };
  }

  if (isClosedSession(session.sessionState)) {
    return { dataState: DATA_STATES.MARKET_CLOSED, dataAge, warnings };
  }

  return { dataState: DATA_STATES.UNKNOWN, dataAge, warnings };
}

function evaluateMarketAvailability(input = {}) {
  const session = resolveMarketSession(input);
  const data = classifyMarketDataState({ ...input, session });

  return {
    ...session,
    dataState: data.dataState,
    dataAge: data.dataAge,
    provider: input.provider || null,
    available: input.available === true && ![
      DATA_STATES.BACKEND_UNAVAILABLE,
      DATA_STATES.PROVIDER_OFFLINE,
      DATA_STATES.DATA_UNAVAILABLE,
      DATA_STATES.MARKET_CLOSED,
      DATA_STATES.UNKNOWN
    ].includes(data.dataState),
    sourceType: input.sourceType || data.dataState,
    simulated: input.simulated === true,
    generated: input.generated === true,
    environment: input.environment || null,
    warnings: [...session.warnings, ...data.warnings.filter((warning) => !session.warnings.includes(warning))]
  };
}

module.exports = {
  DATA_STATES,
  SESSION_STATES,
  classifyMarketDataState,
  evaluateMarketAvailability,
  resolveMarketSession
};
