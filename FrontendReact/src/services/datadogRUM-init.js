import { datadogRum } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";

const REQUIRED_DATADOG_ENV_KEYS = [
  "VITE_DD_APPLICATION_ID",
  "VITE_DD_CLIENT_TOKEN",
  "VITE_DD_SITE",
  "VITE_DD_ENV",
  "VITE_DD_VERSION",
];

function getDatadogRumConfig() {
  const env = import.meta.env || {};
  const missingKeys = REQUIRED_DATADOG_ENV_KEYS.filter((key) => !env[key]);

  if (missingKeys.length > 0) {
    return null;
  }

  return {
    applicationId: env.VITE_DD_APPLICATION_ID,
    clientToken: env.VITE_DD_CLIENT_TOKEN,
    site: env.VITE_DD_SITE,
    service: env.VITE_DD_SERVICE || "market-ai-frontend",
    env: env.VITE_DD_ENV,
    version: env.VITE_DD_VERSION,
  };
}

export function initializeDatadogRum() {
  const config = getDatadogRumConfig();

  if (!config || datadogRum.getInitConfiguration()) {
    return false;
  }

  datadogRum.init({
    ...config,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    defaultPrivacyLevel: "mask-user-input",
    plugins: [reactPlugin({ router: true })],
  });

  datadogRum.startSessionReplayRecording();

  return true;
}

initializeDatadogRum();
