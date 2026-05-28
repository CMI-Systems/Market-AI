const EASTERN_TIME_ZONE = "America/New_York";
const MARKET_OPEN_MINUTES = 9 * 60 + 30;
const MARKET_CLOSE_MINUTES = 16 * 60;

function getEasternTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    weekday: valueByType.weekday,
    hour: Number(valueByType.hour),
    minute: Number(valueByType.minute)
  };
}

function isWeekend(weekday) {
  return weekday === "Saturday" || weekday === "Sunday";
}

function getMarketHoursStatus(date = new Date()) {
  const easternTime = getEasternTimeParts(date);
  const minutesSinceMidnight = easternTime.hour * 60 + easternTime.minute;

  // TODO: Add U.S. market holiday and early-close handling when the app has a holiday calendar.
  if (isWeekend(easternTime.weekday)) {
    return {
      isOpen: false,
      reason: "weekend",
      timeZone: EASTERN_TIME_ZONE
    };
  }

  if (minutesSinceMidnight < MARKET_OPEN_MINUTES) {
    return {
      isOpen: false,
      reason: "before_regular_hours",
      timeZone: EASTERN_TIME_ZONE
    };
  }

  if (minutesSinceMidnight >= MARKET_CLOSE_MINUTES) {
    return {
      isOpen: false,
      reason: "after_regular_hours",
      timeZone: EASTERN_TIME_ZONE
    };
  }

  return {
    isOpen: true,
    reason: "regular_market_hours",
    timeZone: EASTERN_TIME_ZONE
  };
}

function isMarketOpenNow(date = new Date()) {
  return getMarketHoursStatus(date).isOpen;
}

module.exports = {
  isMarketOpenNow,
  getMarketHoursStatus
};
