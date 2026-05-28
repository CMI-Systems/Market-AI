/*
 * Deterministic reflection prompts for future journal workflows.
 * It creates professional self-review prompts without storing reflections.
 */

function classifyReflectionTheme(input = {}) {
  const behavioralState = input.behavioralIntelligence?.behavioralState;
  const riskAdjustment = input.behavioralRiskAlignment?.riskAdjustment;
  const confidenceLevel = input.confidenceProfile?.level;

  if (behavioralState === "OVERACTIVE") {
    return "OVERACTIVITY";
  }

  if (behavioralState === "UNSTABLE") {
    return "RISK_CONTROL";
  }

  if (riskAdjustment === "SUPPRESS") {
    return "DISCIPLINE";
  }

  if (["LOW", "AVOID"].includes(confidenceLevel)) {
    return "UNCERTAINTY";
  }

  if (behavioralState === "DISCIPLINED") {
    return "DISCIPLINE";
  }

  if (input.signalIntelligence?.signalType === "LOW_CONFIDENCE_CHOP") {
    return "PATIENCE";
  }

  if (confidenceLevel === "HIGH") {
    return "CONFIDENCE";
  }

  return "GENERAL";
}

function buildPrompts(theme, input = {}) {
  switch (theme) {
    case "OVERACTIVITY":
      return [
        "What evidence shows that recent activity remained process-driven rather than reactive?",
        "Where would added patience improve the quality of the next review cycle?",
        "Which signals deserved attention, and which simply increased activity pressure?"
      ];
    case "RISK_CONTROL":
      return [
        "What uncertainty or instability should be acknowledged before interpreting the current context?",
        "How did recent warning patterns affect discipline and risk awareness?",
        "What condition would indicate that review should remain more cautious?"
      ];
    case "DISCIPLINE":
      if (input.behavioralRiskAlignment?.riskAdjustment === "SUPPRESS") {
        return [
          "What behavior pattern made additional risk awareness appropriate in this context?",
          "Which process rule helps preserve discipline when confidence posture is reduced?",
          "What should be reviewed before treating the next signal context as meaningful?"
        ];
      }

      return [
        "Which process habits supported consistent interpretation in this review period?",
        "What should remain consistent if market conditions become less clear?",
        "Which observation best confirms that discipline stayed aligned with context?"
      ];
    case "UNCERTAINTY":
      return [
        "What uncertainty is most important to name in the current confidence environment?",
        "How can caution stay visible while the market context remains less clear?",
        "Which recent observation reduced clarity rather than improving it?"
      ];
    case "PATIENCE":
      return [
        "What would patience look like while directional clarity remains limited?",
        "Which context clues suggest that waiting for stronger structure matters?",
        "How can review stay selective during choppy conditions?"
      ];
    case "CONFIDENCE":
      return [
        "What evidence supports the current confidence posture?",
        "Which warning would reduce confidence if conditions shift?",
        "How can confidence remain tied to process rather than urgency?"
      ];
    default:
      return [
        "What recent observation deserves the most careful review?",
        "Which condition most affected discipline and confidence in this context?",
        "What should remain visible in the next process review?"
      ];
  }
}

function getPriority(theme, input = {}) {
  if (
    input.behavioralRiskAlignment?.riskAdjustment === "SUPPRESS" ||
    input.behavioralIntelligence?.behavioralState === "UNSTABLE"
  ) {
    return "HIGH";
  }

  if (
    theme === "OVERACTIVITY" ||
    theme === "UNCERTAINTY" ||
    input.confidenceProfile?.level === "LOW"
  ) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildReflectionSummary(input = {}) {
  const theme = input.theme || classifyReflectionTheme(input);

  switch (theme) {
    case "OVERACTIVITY":
      return "Reflection should focus on patience, selectivity, and activity pressure.";
    case "RISK_CONTROL":
      return "Reflection should focus on risk control and uncertainty under unstable conditions.";
    case "DISCIPLINE":
      return "Reflection should reinforce discipline, process consistency, and risk awareness.";
    case "UNCERTAINTY":
      return "Reflection should examine caution and clarity in a lower-confidence environment.";
    case "PATIENCE":
      return "Reflection should emphasize patience while market context remains less clear.";
    case "CONFIDENCE":
      return "Reflection should review how confidence stays connected to evidence and process.";
    default:
      return "Reflection should review recent context, discipline, and decision quality.";
  }
}

function buildReflectionPrompts(input = {}) {
  const theme = classifyReflectionTheme(input);

  return {
    theme,
    prompts: buildPrompts(theme, input),
    summary: buildReflectionSummary({
      ...input,
      theme
    }),
    priority: getPriority(theme, input)
  };
}

module.exports = {
  buildReflectionPrompts,
  buildReflectionSummary,
  classifyReflectionTheme
};
