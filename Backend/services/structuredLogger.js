/*
 * Safe structured logger for Market AI production infrastructure.
 * Avoid passing secrets to this logger; payloads are sanitized defensively.
 */

const { loadEnvironmentConfig } = require("../config/environment");

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99
};

function sanitize(value) {
  if (typeof value === "string") {
    return value.replace(/(api[_-]?key|secret|token|password)=?[^\s,}]*/gi, "$1=[redacted]");
  }

  if (Array.isArray(value)) return value.map(sanitize);

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((next, [key, item]) => {
      if (/api[_-]?key|secret|token|password/i.test(key)) {
        next[key] = "[redacted]";
      } else {
        next[key] = sanitize(item);
      }
      return next;
    }, {});
  }

  return value;
}

function shouldLog(level, config = loadEnvironmentConfig()) {
  return LEVELS[level] >= LEVELS[config.logLevel || "info"];
}

function log(level, component, message, meta = {}) {
  const config = loadEnvironmentConfig();
  if (!shouldLog(level, config)) return;

  const line = {
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
    meta: sanitize(meta)
  };

  const output = JSON.stringify(line);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
}

module.exports = {
  debug: (component, message, meta) => log("debug", component, message, meta),
  error: (component, message, meta) => log("error", component, message, meta),
  info: (component, message, meta) => log("info", component, message, meta),
  sanitize,
  warn: (component, message, meta) => log("warn", component, message, meta)
};
