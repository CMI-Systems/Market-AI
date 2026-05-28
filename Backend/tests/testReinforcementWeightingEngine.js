const assert = require("assert");
const {
  evaluateReinforcementWeighting
} = require("../services/reinforcementWeightingEngine");
const {
  buildReinforcementWeightingEndpoint,
  clearLatestCognitionSnapshot,
  setLatestCognitionSnapshot
} = require("../services/cognitionSnapshotStore");

function record(signalState = "ALIGNED") {
  return { signalState };
}

clearLatestCognitionSnapshot();

const fallback = buildReinforcementWeightingEndpoint();
assert.strictEqual(fallback.reinforcementState, "UNKNOWN");
assert.strictEqual(fallback.summary, "Awaiting reinforcement weighting cognition.");

const insufficient = evaluateReinforcementWeighting({ history: [record()] });
assert.strictEqual(insufficient.reinforcementState, "INSUFFICIENT_DATA");

const reinforcing = evaluateReinforcementWeighting({
  history: [record(), record(), record(), record(), record("REINFORCED"), record("ALIGNED")],
  recurrenceIntelligence: {
    recurringThemes: [
      { theme: "Repeated consensus agreement" },
      { theme: "Repeated liquidity stabilization" }
    ]
  }
});
assert.strictEqual(reinforcing.reinforcementState, "REINFORCING");
assert(reinforcing.reinforcedFactors.length >= 2);
assert(reinforcing.learningWeight >= 0 && reinforcing.learningWeight <= 1);

const weakening = evaluateReinforcementWeighting({
  history: [record("SUPPRESSED"), record("UNSTABLE"), record("SUPPRESSED"), record("SUPPRESSED")]
});
assert.strictEqual(weakening.reinforcementState, "WEAKENING");
assert(weakening.weakenedFactors.length >= 1);

setLatestCognitionSnapshot({ reinforcementWeighting: reinforcing });
const endpoint = buildReinforcementWeightingEndpoint();
assert.strictEqual(endpoint.reinforcementState, "REINFORCING");
assert(endpoint.learningWeight >= 0 && endpoint.learningWeight <= 1);
assert.notStrictEqual(endpoint.summary, "Awaiting reinforcement weighting cognition.");

console.log("Reinforcement weighting engine test passed.");
