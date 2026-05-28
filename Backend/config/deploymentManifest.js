const { loadEnvironmentConfig } = require("./environment");

function buildDeploymentManifest(env = process.env) {
  const config = loadEnvironmentConfig(env);

  return {
    appName: "Market AI",
    version: "1.0.0",
    environment: config.nodeEnv,
    mode: config.mode,
    requiredServices: [
      "backend-api",
      "cognition-routes",
      "runtime-metrics"
    ],
    optionalServices: [
      "simulated-stream",
      "persistent-cognition-memory",
      "cognition-archive"
    ],
    readinessChecks: {
      configLoaded: true,
      persistenceEnabled: config.enablePersistence,
      cognitionArchiveEnabled: config.enableCognitionArchive,
      dataDirectoryConfigured: Boolean(config.dataDir)
    },
    warnings: config.warnings
  };
}

module.exports = {
  buildDeploymentManifest
};
