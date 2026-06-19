const baseBehavioralScores = [
  { label: "Patience", score: 78 },
  { label: "Discipline", score: 84 },
  { label: "Conviction", score: 72 },
  { label: "Risk Management", score: 80 },
  { label: "Execution Quality", score: 76 },
  { label: "Emotional Stability", score: 88 },
];

const tagScoreAdjustments = {
  Patient: { Patience: 10, "Emotional Stability": 4 },
  Disciplined: { Discipline: 10, "Execution Quality": 4 },
  Impulsive: { Patience: -12, Discipline: -8, "Emotional Stability": -6 },
  Hesitant: { Conviction: -10, "Execution Quality": -4 },
  Overconfident: { "Risk Management": -10, Discipline: -5 },
  "Risk-Aware": { "Risk Management": 10, Discipline: 4 },
  FOMO: { Patience: -10, Discipline: -6, "Risk Management": -4 },
  "Rule Break": { Discipline: -12, "Execution Quality": -8, "Risk Management": -6 },
};

const tagTraitScores = {
  Patient: { Patience: 2, Discipline: 1 },
  Disciplined: { Discipline: 3, "Execution Quality": 1 },
  Impulsive: { Patience: -3, Discipline: -1 },
  Hesitant: { Conviction: -3 },
  Overconfident: { "Risk Management": -3, Discipline: -1 },
  "Risk-Aware": { "Risk Management": 3, Discipline: 1 },
  FOMO: { Patience: -2, "Emotional Stability": -1 },
  "Rule Break": { Discipline: -3, "Execution Quality": -2 },
};

const tagMistakeMap = {
  FOMO: { type: "FOMO", frequency: 1, severity: "High", impact: "Urgency pulled decision timing forward." },
  Impulsive: { type: "Chasing", frequency: 1, severity: "High", impact: "Action bias reduced setup quality." },
  "Rule Break": { type: "Rule Violation", frequency: 1, severity: "High", impact: "Execution drifted away from the planned rules." },
  Overconfident: { type: "Risk Ignored", frequency: 1, severity: "High", impact: "Confidence exceeded available confirmation." },
  Hesitant: { type: "Late Exit", frequency: 1, severity: "Moderate", impact: "Decision delay weakened exit quality." },
};

const tagMissionMap = {
  FOMO: {
    focus: "Entry patience",
    behavioral: "Pause before acting on urgency.",
    execution: "Wait for confirmation before entry.",
    risk: "Reduce size when urgency is elevated.",
  },
  Impulsive: {
    focus: "Impulse control",
    behavioral: "Use a deliberate pre-entry checklist.",
    execution: "Require structure and momentum alignment.",
    risk: "Avoid adding exposure after a rushed decision.",
  },
  "Rule Break": {
    focus: "Rule compliance",
    behavioral: "Stop when a planned rule is bypassed.",
    execution: "Document the rule before taking the trade.",
    risk: "Treat rule breaks as automatic risk reduction events.",
  },
  Overconfident: {
    focus: "Confidence calibration",
    behavioral: "Challenge certainty before increasing exposure.",
    execution: "Require a second confirmation signal.",
    risk: "Cap position size after winning streaks.",
  },
  Hesitant: {
    focus: "Conviction and decisiveness",
    behavioral: "Define the decision point before price reaches it.",
    execution: "Use a planned trigger instead of reacting late.",
    risk: "Honor invalidation quickly when the setup changes.",
  },
};

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function getTags(input) {
  return Array.isArray(input?.behavioralTags) ? input.behavioralTags : [];
}

function hasMeaningfulOperatorEvidence(input, tags) {
  return Boolean(
    tags.length
    || String(input?.behavioralReflection || "").trim().length >= 12
    || String(input?.executionReview || "").trim().length >= 12
    || String(input?.tradeThesis || input?.thesis || "").trim().length >= 12
  );
}

function deriveBehavioralScores(tags) {
  if (!tags.length) return [];

  return baseBehavioralScores.map((item) => {
    const adjustment = tags.reduce(
      (total, tag) => total + (tagScoreAdjustments[tag]?.[item.label] || 0),
      0
    );

    return {
      ...item,
      score: clampScore(item.score + adjustment),
    };
  });
}

function deriveTraits(tags) {
  if (!tags.length) {
    return {
      strongestTrait: "UNKNOWN",
      weakestTrait: "UNKNOWN",
    };
  }

  const scores = baseBehavioralScores.reduce((accumulator, item) => ({
    ...accumulator,
    [item.label]: 0,
  }), {});

  tags.forEach((tag) => {
    Object.entries(tagTraitScores[tag] || {}).forEach(([trait, value]) => {
      scores[trait] = (scores[trait] || 0) + value;
    });
  });

  const strongest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "Discipline";
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] || "Conviction";

  return {
    strongestTrait: strongest,
    weakestTrait: weakest,
  };
}

function deriveTopMistakes(tags) {
  const mapped = tags.map((tag) => tagMistakeMap[tag]).filter(Boolean);
  return mapped.slice(0, 3);
}

function deriveMission(tags) {
  const firstMappedTag = tags.find((tag) => tagMissionMap[tag]);
  const mission = tagMissionMap[firstMappedTag];

  if (!mission) return [];

  return [
    { label: "Primary Focus", value: mission.focus },
    { label: "Behavioral Goal", value: mission.behavioral },
    { label: "Execution Goal", value: mission.execution },
    { label: "Risk Goal", value: mission.risk },
  ];
}

export function analyzeReplayIntelligence(input = {}) {
  const tags = getTags(input);
  const hasEvidence = hasMeaningfulOperatorEvidence(input, tags);

  if (!hasEvidence) {
    return {
      status: "INSUFFICIENT_DATA",
      evidenceCount: 0,
      strongestTrait: "UNKNOWN",
      weakestTrait: "UNKNOWN",
      behavioralScores: [],
      topMistakes: [],
      missionForNextSession: [],
      warnings: ["Persisted or explicit operator behavioral evidence is required before replay intelligence can evaluate behavior."],
    };
  }

  const traits = deriveTraits(tags);

  return {
    status: tags.length ? "PARTIAL_REVIEW" : "INSUFFICIENT_TAG_DATA",
    evidenceCount: tags.length,
    strongestTrait: traits.strongestTrait,
    weakestTrait: traits.weakestTrait,
    behavioralScores: deriveBehavioralScores(tags),
    topMistakes: deriveTopMistakes(tags),
    missionForNextSession: deriveMission(tags),
    warnings: tags.length ? [] : ["Behavioral tags are required before traits, mistakes, or missions can be inferred."],
  };
}
