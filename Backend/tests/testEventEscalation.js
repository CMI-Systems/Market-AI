/*
 * Local diagnostic for the Event Escalation Engine.
 * It checks escalation levels, triggers, elevated events, and safe language.
 */

const assert = require("assert");
const {
  evaluateEventEscalation,
  summarizeEscalationEvents
} = require("../services/eventEscalation");

const FORBIDDEN_WORDS = ["BUY", "SELL", "CALL", "PUT", "entry", "exit"];

function assertNoForbiddenWords(output) {
  const text = JSON.stringify(output);

  FORBIDDEN_WORDS.forEach((word) => {
    assert(
      !new RegExp(`\\b${word}\\b`, "i").test(text),
      `Event escalation output should not contain forbidden word: ${word}`
    );
  });
}

function baseInput(overrides = {}) {
  return {
    prioritizedInsights: [],
    anomalyIntelligence: {
      anomalyDetected: false,
      severity: "NONE"
    },
    environmentalPressure: {
      pressureLevel: "NONE",
      pressureScore: 0
    },
    intelligenceStabilityForecast: {
      trajectory: "STABLE",
      confidence: 0.82
    },
    runtimeHealth: {
      status: "HEALTHY"
    },
    strategicEnvironment: {
      environment: "FAVORABLE",
      stability: "HIGH"
    },
    intelligenceConsensus: {
      consensusStrength: "STRONG"
    },
    cognitiveTransitions: [],
    cognitiveCorrelations: [],
    ...overrides
  };
}

function printResult(label, output) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(output, null, 2));
}

function run() {
  const noEscalation = evaluateEventEscalation(baseInput());
  const moderateEscalation = evaluateEventEscalation(baseInput({
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "MEDIUM"
    },
    environmentalPressure: {
      pressureLevel: "MODERATE",
      pressureScore: 0.46
    }
  }));
  const highEscalation = evaluateEventEscalation(baseInput({
    environmentalPressure: {
      pressureLevel: "HIGH",
      pressureScore: 0.78
    },
    intelligenceStabilityForecast: {
      trajectory: "DETERIORATING",
      confidence: 0.74
    },
    cognitiveTransitions: [
      {
        transitionId: "transition-runtime-1",
        category: "runtime_health",
        severity: "HIGH",
        summary: "Runtime moved into degraded review context."
      },
      {
        transitionId: "transition-confidence-1",
        category: "confidence_structure",
        severity: "HIGH",
        summary: "Confidence structure weakened."
      }
    ]
  }));
  const criticalEscalation = evaluateEventEscalation(baseInput({
    anomalyIntelligence: {
      anomalyDetected: true,
      severity: "HIGH"
    },
    runtimeHealth: {
      status: "CRITICAL"
    },
    strategicEnvironment: {
      environment: "HIGH_RISK",
      stability: "FRAGMENTED"
    },
    environmentalPressure: {
      pressureLevel: "EXTREME",
      pressureScore: 0.96
    },
    intelligenceStabilityForecast: {
      trajectory: "FRAGMENTING",
      confidence: 0.88
    }
  }));
  const correlatedInstability = evaluateEventEscalation(baseInput({
    cognitiveCorrelations: [
      {
        correlationId: "correlation-anomaly-runtime",
        categories: ["anomaly_runtime"],
        strength: "STRONG",
        summary: "Anomaly and runtime instability are linked."
      },
      {
        correlationId: "correlation-multi-system",
        categories: ["multi_system_instability"],
        strength: "STRONG",
        summary: "Multiple instability systems are linked."
      }
    ],
    prioritizedInsights: [
      {
        id: "critical-review-1",
        priority: "CRITICAL",
        summary: "Critical review context is present."
      }
    ]
  }));
  const runtimeEscalation = evaluateEventEscalation(baseInput({
    runtimeHealth: {
      status: "DEGRADED"
    }
  }));
  const escalationSummary = summarizeEscalationEvents([
    noEscalation,
    moderateEscalation,
    highEscalation,
    criticalEscalation,
    correlatedInstability,
    runtimeEscalation
  ]);

  assert.strictEqual(noEscalation.escalationLevel, "NONE");
  assert.strictEqual(moderateEscalation.escalationLevel, "MODERATE");
  assert.strictEqual(highEscalation.escalationLevel, "HIGH");
  assert.strictEqual(criticalEscalation.escalationLevel, "CRITICAL");
  assert.strictEqual(correlatedInstability.escalationLevel, "CRITICAL");
  assert.strictEqual(runtimeEscalation.escalationLevel, "HIGH");
  assert(
    criticalEscalation.escalationTriggers.some((trigger) => {
      return trigger.type === "runtime_degradation";
    })
  );
  assert(
    correlatedInstability.escalationTriggers.some((trigger) => {
      return trigger.type === "instability_clustering";
    })
  );
  assert(
    highEscalation.elevatedEvents.some((event) => {
      return event.type === "cognitive_transition";
    })
  );
  assert.strictEqual(escalationSummary.highestEscalationLevel, "CRITICAL");
  assert(escalationSummary.totalEscalations === 6);

  [
    noEscalation,
    moderateEscalation,
    highEscalation,
    criticalEscalation,
    correlatedInstability,
    runtimeEscalation,
    escalationSummary
  ].forEach(assertNoForbiddenWords);

  printResult("No escalation", noEscalation);
  printResult("Moderate escalation", moderateEscalation);
  printResult("High escalation", highEscalation);
  printResult("Critical escalation", criticalEscalation);
  printResult("Correlated instability escalation", correlatedInstability);
  printResult("Runtime degradation escalation", runtimeEscalation);
  printResult("Escalation summary", escalationSummary);
  console.log("\nEvent escalation test passed.");
}

run();
