const CLOSED_MARKET_SIM_MODE = "closed-market-sim";
const SHADOW_MODE = "shadow";

function normalizeMode(mode) {
  return typeof mode === "string"
    ? mode.trim().toLowerCase()
    : "";
}

function isClosedMarketSimulationMode(systemContext = {}) {
  return normalizeMode(systemContext.mode) === CLOSED_MARKET_SIM_MODE;
}

function isShadowMode(systemContext = {}) {
  return normalizeMode(systemContext.mode) === SHADOW_MODE;
}

module.exports = {
  CLOSED_MARKET_SIM_MODE,
  SHADOW_MODE,
  isClosedMarketSimulationMode,
  isShadowMode,
  normalizeMode
};
