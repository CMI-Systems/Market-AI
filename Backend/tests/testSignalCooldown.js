/*
 * Local diagnostic for in-memory signal cooldown behavior.
 * It verifies duplicate suppression without sending alerts.
 */

const assert = require("assert");
const {
  clearSignalCooldowns,
  evaluateSignalCooldown,
  getSignalCooldownStats
} = require("../services/signalCooldown");

function cooldownInput(overrides = {}) {
  return {
    symbol: "NVDA",
    alertReadiness: {
      alertReady: true,
      priority: "HIGH",
      alertType: "MOMENTUM_CONTINUATION"
    },
    ...overrides
  };
}

function run() {
  clearSignalCooldowns();

  const firstHighPriority = evaluateSignalCooldown(cooldownInput());
  const duplicateHighPriority = evaluateSignalCooldown(cooldownInput());
  const differentSymbol = evaluateSignalCooldown(cooldownInput({
    symbol: "AMD"
  }));
  const differentSignalType = evaluateSignalCooldown(cooldownInput({
    alertReadiness: {
      alertReady: true,
      priority: "HIGH",
      alertType: "VOLATILITY_EXPANSION"
    }
  }));
  const notAlertReady = evaluateSignalCooldown(cooldownInput({
    alertReadiness: {
      alertReady: false,
      priority: "NONE",
      alertType: "NO_QUALITY_SIGNAL"
    }
  }));

  assert.strictEqual(firstHighPriority.suppressed, false);
  assert.strictEqual(duplicateHighPriority.suppressed, true);
  assert(duplicateHighPriority.remainingMs > 0);
  assert.strictEqual(differentSymbol.suppressed, false);
  assert.strictEqual(differentSignalType.suppressed, false);
  assert.strictEqual(notAlertReady.suppressed, false);

  console.log("\nFirst high-priority signal");
  console.log(JSON.stringify(firstHighPriority, null, 2));
  console.log("\nImmediate duplicate");
  console.log(JSON.stringify(duplicateHighPriority, null, 2));
  console.log("\nCooldown stats");
  console.log(JSON.stringify(getSignalCooldownStats(), null, 2));
  console.log("\nSignal cooldown test passed.");
}

run();
