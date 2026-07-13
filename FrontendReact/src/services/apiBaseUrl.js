const runtimeEnvironment = String(
  import.meta.env.VITE_ENVIRONMENT ||
  import.meta.env.VITE_MODE ||
  import.meta.env.MODE ||
  ""
).toLowerCase();

export const isExplicitLocalDevelopment =
  import.meta.env.DEV === true && runtimeEnvironment === "development";

const configuredApiBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();

export const API_BASE_URL = (
  configuredApiBaseUrl ||
  (isExplicitLocalDevelopment ? "http://localhost:3001" : "")
).replace(/\/$/, "");

export function buildApiUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new Error("Backend API URL is not configured for this environment.");
  }

  return `${API_BASE_URL}${endpoint}`;
}
