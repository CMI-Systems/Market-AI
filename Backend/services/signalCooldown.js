/*
 * In-memory cooldown gate for alert-ready signal observations.
 * It prevents the same surfaced context from repeating too frequently.
 */

const DEFAULT_COOLDOWNS = {
  HIGH: 60000,
  MEDIUM: 180000,
  LOW: 300000
};

const cooldowns = new Map();

function normalizeKeyPart(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : fallback;
}

function buildCooldownKey(input = {}) {
  const alertReadiness = input.alertReadiness || {};
  const symbol = normalizeKeyPart(input.symbol, "UNKNOWN");
  const signalType = normalizeKeyPart(
    alertReadiness.alertType || input.signalType,
    "NO_QUALITY_SIGNAL"
  );
  const priority = normalizeKeyPart(alertReadiness.priority, "NONE");

  return `${symbol}:${signalType}:${priority}`;
}

function getCooldownMs(priority) {
  return DEFAULT_COOLDOWNS[normalizeKeyPart(priority, "NONE")] || 0;
}

function createResult({
  suppressed,
  reason,
  cooldownMs,
  remainingMs,
  key
}) {
  return {
    suppressed,
    reason,
    cooldownMs,
    remainingMs,
    key
  };
}

function evaluateSignalCooldown(input = {}) {
  const alertReadiness = input.alertReadiness || {};
  const key = buildCooldownKey(input);
  const cooldownMs = getCooldownMs(alertReadiness.priority);

  if (alertReadiness.alertReady !== true) {
    return createResult({
      suppressed: false,
      reason: "alert_not_ready",
      cooldownMs,
      remainingMs: 0,
      key
    });
  }

  const now = Date.now();
  const previous = cooldowns.get(key);
  const elapsedMs = previous ? now - previous.lastSeen : cooldownMs;
  const remainingMs = Math.max(cooldownMs - elapsedMs, 0);

  if (previous && remainingMs > 0) {
    return createResult({
      suppressed: true,
      reason: "duplicate_signal_in_cooldown",
      cooldownMs,
      remainingMs,
      key
    });
  }

  cooldowns.set(key, {
    key,
    symbol: normalizeKeyPart(input.symbol, "UNKNOWN"),
    signalType: normalizeKeyPart(alertReadiness.alertType, "NO_QUALITY_SIGNAL"),
    priority: normalizeKeyPart(alertReadiness.priority, "NONE"),
    lastSeen: now
  });

  return createResult({
    suppressed: false,
    reason: "signal_allowed",
    cooldownMs,
    remainingMs: 0,
    key
  });
}

function clearSignalCooldowns() {
  cooldowns.clear();

  return {
    cleared: true,
    activeCooldowns: 0
  };
}

function getSignalCooldownStats() {
  return {
    activeCooldowns: cooldowns.size,
    cooldowns: Array.from(cooldowns.values()).map((cooldown) => ({
      key: cooldown.key,
      symbol: cooldown.symbol,
      signalType: cooldown.signalType,
      priority: cooldown.priority,
      lastSeen: new Date(cooldown.lastSeen).toISOString()
    }))
  };
}

module.exports = {
  clearSignalCooldowns,
  evaluateSignalCooldown,
  getSignalCooldownStats
};
