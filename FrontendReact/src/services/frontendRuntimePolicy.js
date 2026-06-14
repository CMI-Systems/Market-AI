const KNOWN_ENVIRONMENTS = new Set(["DEVELOPMENT", "TEST", "STAGING", "PRODUCTION"]);

export function normalizeRuntimeEnvironment(env = import.meta.env) {
  const rawEnvironment =
    env?.VITE_ENVIRONMENT || env?.MODE || env?.NODE_ENV || "";
  const normalized = String(rawEnvironment).trim().toUpperCase();

  if (normalized === "DEV" || normalized === "LOCAL") {
    return "DEVELOPMENT";
  }

  if (normalized === "STAGE") {
    return "STAGING";
  }

  if (normalized === "PROD") {
    return "PRODUCTION";
  }

  return KNOWN_ENVIRONMENTS.has(normalized) ? normalized : "UNKNOWN";
}

export function getFrontendDemoPolicy(env = import.meta.env) {
  const runtimeEnvironment = normalizeRuntimeEnvironment(env);
  const demoRequested = String(env?.VITE_DEMO_MODE || "").toLowerCase() === "true";
  const demoAllowed =
    demoRequested &&
    (runtimeEnvironment === "DEVELOPMENT" || runtimeEnvironment === "TEST");

  return {
    runtimeEnvironment,
    demoRequested,
    demoAllowed,
    demoBlocked: demoRequested && !demoAllowed,
  };
}

export function createUnavailableMetadata(reason = "BACKEND_UNAVAILABLE") {
  const { runtimeEnvironment } = getFrontendDemoPolicy();

  return {
    available: false,
    sourceType: "DATA_UNAVAILABLE",
    simulated: false,
    generated: false,
    rawDataAvailable: false,
    reason,
    environment: runtimeEnvironment,
  };
}

export function createDemoMetadata() {
  const { runtimeEnvironment } = getFrontendDemoPolicy();

  return {
    available: true,
    sourceType: "SIMULATED",
    simulated: true,
    generated: true,
    rawDataAvailable: false,
    persistenceEligible: false,
    trainingEligible: false,
    demoLabel: "DEMO DATA - SIMULATED - NOT RAW MARKET DATA",
    environment: runtimeEnvironment,
  };
}
