const fs = require("fs");
const path = require("path");

const AWAITING_PLATFORM_USAGE = "Awaiting platform usage.";
const DEFAULT_USAGE_DIR = path.join(__dirname, "..", "data", "platform-usage");
const USAGE_FILE = "usage.json";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function usagePath(baseDir = DEFAULT_USAGE_DIR) {
  return path.join(baseDir, USAGE_FILE);
}

function loadUsage(baseDir = DEFAULT_USAGE_DIR) {
  try {
    const file = usagePath(baseDir);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8")).events || [];
  } catch {
    return [];
  }
}

function recordUsageEvent(event = {}, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USAGE_DIR;
  ensureDir(baseDir);
  const events = loadUsage(baseDir);
  events.push({
    timestamp: new Date().toISOString(),
    type: event.type || "cognition-request",
    target: event.target || "platform",
    durationMs: Number(event.durationMs || 0)
  });
  fs.writeFileSync(usagePath(baseDir), `${JSON.stringify({ events: events.slice(-500) }, null, 2)}\n`);
  return buildUsageTracking({ baseDir });
}

function buildUsageTracking(options = {}) {
  const events = loadUsage(options.baseDir || DEFAULT_USAGE_DIR);
  if (!events.length) {
    return {
      usageState: "LIMITED",
      usageMetrics: {},
      operatorPatterns: [],
      warnings: [],
      summary: AWAITING_PLATFORM_USAGE
    };
  }

  const usageMetrics = events.reduce((next, event) => {
    next[event.type] = (next[event.type] || 0) + 1;
    return next;
  }, {});

  return {
    usageState: events.length > 250 ? "COMPRESSED" : "ACTIVE",
    usageMetrics,
    operatorPatterns: Object.entries(usageMetrics)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    warnings: [],
    summary: `Platform usage contains ${events.length} tracked events.`
  };
}

module.exports = {
  AWAITING_PLATFORM_USAGE,
  DEFAULT_USAGE_DIR,
  buildUsageTracking,
  recordUsageEvent
};
