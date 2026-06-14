/*
 * Runtime safety policy for simulation controls.
 * Simulation must fail closed unless the process is explicitly in development
 * or test mode and simulation has been deliberately enabled.
 */

const DEVELOPMENT = "DEVELOPMENT";
const TEST = "TEST";
const STAGING = "STAGING";
const PRODUCTION = "PRODUCTION";
const UNKNOWN = "UNKNOWN";

function boolFromEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

function normalizeRuntimeEnvironment(env = process.env) {
  const raw = env.MARKET_AI_MODE || env.NODE_ENV || "";
  const normalized = String(raw).trim().toLowerCase();

  if (!normalized) {
    return {
      runtimeEnvironment: UNKNOWN,
      rawEnvironment: null,
      valid: false,
      reason: "runtime_mode_missing"
    };
  }

  if (["development", "dev", "local"].includes(normalized)) {
    return {
      runtimeEnvironment: DEVELOPMENT,
      rawEnvironment: raw,
      valid: true,
      reason: null
    };
  }

  if (normalized === "test") {
    return {
      runtimeEnvironment: TEST,
      rawEnvironment: raw,
      valid: true,
      reason: null
    };
  }

  if (["staging", "stage"].includes(normalized)) {
    return {
      runtimeEnvironment: STAGING,
      rawEnvironment: raw,
      valid: true,
      reason: null
    };
  }

  if (["production", "prod"].includes(normalized)) {
    return {
      runtimeEnvironment: PRODUCTION,
      rawEnvironment: raw,
      valid: true,
      reason: null
    };
  }

  return {
    runtimeEnvironment: UNKNOWN,
    rawEnvironment: raw,
    valid: false,
    reason: "runtime_mode_malformed"
  };
}

function isSimulationExplicitlyEnabled(env = process.env) {
  return boolFromEnv(env.MARKET_AI_ENABLE_SIMULATION) ||
    boolFromEnv(env.MARKET_AI_ALLOW_SIMULATION) ||
    boolFromEnv(env.MARKET_AI_AUTO_SIM);
}

function getSimulationPolicy(env = process.env) {
  const runtime = normalizeRuntimeEnvironment(env);
  const simulationExplicitlyEnabled = isSimulationExplicitlyEnabled(env);
  const runtimeAllowsSimulation =
    runtime.runtimeEnvironment === DEVELOPMENT ||
    runtime.runtimeEnvironment === TEST;
  const simulationAllowed = runtimeAllowsSimulation && simulationExplicitlyEnabled;
  let blockReason = null;

  if (!runtime.valid) {
    blockReason = runtime.reason || "runtime_mode_invalid";
  } else if (!runtimeAllowsSimulation) {
    blockReason = "simulation_blocked_in_runtime_environment";
  } else if (!simulationExplicitlyEnabled) {
    blockReason = "simulation_not_explicitly_enabled";
  }

  return {
    runtimeEnvironment: runtime.runtimeEnvironment,
    rawEnvironment: runtime.rawEnvironment,
    runtimeValid: runtime.valid,
    simulationAllowed,
    simulationExplicitlyEnabled,
    simulationBlocked: !simulationAllowed,
    blockReason
  };
}

function hasSimulationRequest(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();

  return Boolean(normalized) && normalized !== "false" && normalized !== "0";
}

function buildSimulationRejection(env = process.env) {
  const policy = getSimulationPolicy(env);

  return {
    ok: false,
    code: "SIMULATION_NOT_ALLOWED",
    environment: policy.runtimeEnvironment,
    runtimeEnvironment: policy.runtimeEnvironment,
    simulationAllowed: false,
    simulated: false,
    generated: false,
    sourceType: "PROVIDER_UNAVAILABLE",
    error: "SIMULATION_NOT_ALLOWED",
    reason: policy.blockReason || "simulation_blocked",
    timestamp: new Date().toISOString()
  };
}

function rejectSimulationRequest(value, env = process.env) {
  if (!hasSimulationRequest(value)) return null;

  const policy = getSimulationPolicy(env);

  return policy.simulationAllowed ? null : buildSimulationRejection(env);
}

module.exports = {
  DEVELOPMENT,
  PRODUCTION,
  STAGING,
  TEST,
  UNKNOWN,
  buildSimulationRejection,
  getSimulationPolicy,
  hasSimulationRequest,
  normalizeRuntimeEnvironment,
  rejectSimulationRequest
};
