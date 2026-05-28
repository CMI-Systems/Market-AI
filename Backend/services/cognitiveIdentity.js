/*
 * Local cognitive identity profiles for trader-development context.
 * This stores process-focused summaries only, without sensitive personal data.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  getSandboxDataPath,
  isTestSandboxEnabled
} = require("./testSandbox");

const IDENTITY_DIRECTORY = path.join(__dirname, "..", "data", "identity");
const CURRENT_IDENTITY_FILE = "current-identity.json";

function getIdentityDirectory() {
  return isTestSandboxEnabled()
    ? getSandboxDataPath("identity")
    : IDENTITY_DIRECTORY;
}

function ensureIdentityDirectory() {
  const identityDirectory = getIdentityDirectory();

  fs.mkdirSync(identityDirectory, { recursive: true });
  return identityDirectory;
}

function identityPath() {
  return path.join(getIdentityDirectory(), CURRENT_IDENTITY_FILE);
}

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function safeStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim())
    : [];
}

function countValues(items, field) {
  return items.reduce((counts, item) => {
    const value = item[field] || "UNKNOWN";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function countTags(items) {
  return items.reduce((counts, item) => {
    safeStringArray(item.tags).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, {});
}

function dominantKeys(distribution, fallback = "UNKNOWN") {
  const entries = Object.entries(distribution);
  const topCount = Math.max(0, ...entries.map(([, count]) => count));

  if (!topCount) {
    return [fallback];
  }

  return entries
    .filter(([, count]) => count === topCount)
    .map(([key]) => key)
    .sort();
}

function unique(values) {
  return [...new Set(values.filter((value) => {
    return typeof value === "string" && value.trim();
  }))];
}

function buildBehavioralTendencies(timeline, journals) {
  const tendencies = [];
  const combined = [...timeline, ...journals];
  const moods = countValues(combined, "mood");
  const tags = countTags(combined);

  if ((moods.OVERACTIVE || 0) > 0) {
    tendencies.push("Reviews activity pressure and patience conditions.");
  }

  if ((moods.CAUTIOUS || 0) > 0 || (moods.UNCERTAIN || 0) > 0) {
    tendencies.push("Reviews uncertainty and caution during lower-clarity conditions.");
  }

  if ((moods.FOCUSED || 0) > 0 || (moods.CALM || 0) > 0) {
    tendencies.push("Shows process consistency during stable review periods.");
  }

  if ((tags["risk-control"] || 0) > 0) {
    tendencies.push("Keeps risk-control themes visible in reflection history.");
  }

  return tendencies.length
    ? unique(tendencies)
    : ["Behavioral tendencies are still forming from limited review history."];
}

function classifyReflectionStyle(reflectionPrompts = {}, journals = []) {
  const theme = reflectionPrompts.theme;
  const tags = countTags(journals);

  if (theme === "RISK_CONTROL" || tags["risk-control"]) {
    return "risk-aware";
  }

  if (theme === "OVERACTIVITY" || tags.overactivity) {
    return "patience-focused";
  }

  if (theme === "DISCIPLINE" || tags.discipline) {
    return "process-focused";
  }

  if (theme === "UNCERTAINTY" || tags.uncertainty) {
    return "uncertainty-aware";
  }

  return "developing";
}

function recurringEnvironments(insightSummary = {}, cognitivePatterns = []) {
  const environments = [];
  const dominantRegime = insightSummary.statistics?.dominantRegime;

  if (dominantRegime) {
    environments.push(dominantRegime);
  }

  safeArray(cognitivePatterns)
    .filter((pattern) => pattern.category === "environment" || pattern.category === "strategic")
    .forEach((pattern) => environments.push(pattern.patternId || pattern.category));

  return unique(environments).length
    ? unique(environments)
    : ["UNKNOWN"];
}

function recurringWarnings(cognitivePatterns = [], cognitiveDrift = {}) {
  const warnings = [];

  safeArray(cognitivePatterns).forEach((pattern) => {
    if (["anomaly", "runtime", "consensus", "confidence"].includes(pattern.category)) {
      warnings.push(`${pattern.category}_pattern`);
    }
  });

  safeStringArray(cognitiveDrift.driftCategories).forEach((category) => {
    warnings.push(category);
  });

  return unique(warnings);
}

function stabilityTendencies(cognitiveDrift = {}, cognitivePatterns = []) {
  const tendencies = [];

  if (cognitiveDrift.driftDetected) {
    tendencies.push("Tracks deterioration and drift markers over time.");
  }

  if (safeArray(cognitivePatterns).some((pattern) => pattern.strength === "STRONG")) {
    tendencies.push("Recurring intelligence patterns are visible for review.");
  }

  return tendencies.length
    ? tendencies
    : ["Stability tendencies are still developing from available context."];
}

function developmentStrengths(timeline, journals) {
  const tags = countTags([...timeline, ...journals]);
  const strengths = [];

  if (tags.discipline) strengths.push("discipline review");
  if (tags["risk-control"]) strengths.push("risk-control awareness");
  if (tags.confidence) strengths.push("confidence calibration");
  if (tags["signal-review"]) strengths.push("signal review consistency");

  return strengths.length ? unique(strengths) : ["process review foundation"];
}

function developmentGrowthAreas(timeline, journals, cognitiveDrift = {}) {
  const combined = [...timeline, ...journals];
  const moods = countValues(combined, "mood");
  const tags = countTags(combined);
  const growthAreas = [];

  if (moods.OVERACTIVE || tags.overactivity) {
    growthAreas.push("patience under activity pressure");
  }

  if (moods.UNCERTAIN || tags.uncertainty) {
    growthAreas.push("clarity during uncertain conditions");
  }

  if (cognitiveDrift.driftDetected) {
    growthAreas.push("recognizing drift before it compounds");
  }

  return growthAreas.length ? unique(growthAreas) : ["continued process consistency"];
}

function consistencySignals(timeline, journals, reflectionPrompts = {}) {
  const signals = [];

  if (timeline.length || journals.length) {
    signals.push(`${timeline.length + journals.length} review events are available.`);
  }

  if (safeStringArray(reflectionPrompts.prompts).length) {
    signals.push("Reflection prompts are available for process review.");
  }

  return signals.length ? signals : ["Consistency signals are limited so far."];
}

function buildIdentitySummary(identity = {}) {
  const reflectionStyle = identity.behavioralProfile?.reflectionStyle || "developing";
  const strengths = safeStringArray(identity.developmentProfile?.strengths);

  return `Cognitive identity profile emphasizes ${reflectionStyle} reflection with ${strengths.length} development strength markers.`;
}

function buildCognitiveIdentity(input = {}) {
  const now = new Date().toISOString();
  const timeline = safeArray(input.behavioralTimeline);
  const journals = safeArray(input.journals);
  const cognitivePatterns = safeArray(input.cognitivePatterns);
  const cognitiveDrift = input.cognitiveDrift || {};
  const reflectionPrompts = input.reflectionPrompts || {};
  const moodDistribution = countValues([...timeline, ...journals], "mood");
  const tagDistribution = countTags([...timeline, ...journals]);
  const identity = {
    id: `identity-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    createdAt: now,
    updatedAt: now,
    behavioralProfile: {
      dominantMood: dominantKeys(moodDistribution)[0],
      dominantTags: dominantKeys(tagDistribution, "none"),
      behavioralTendencies: buildBehavioralTendencies(timeline, journals),
      reflectionStyle: classifyReflectionStyle(reflectionPrompts, journals)
    },
    strategicProfile: {
      recurringEnvironments: recurringEnvironments(input.insightSummary, cognitivePatterns),
      recurringWarnings: recurringWarnings(cognitivePatterns, cognitiveDrift),
      stabilityTendencies: stabilityTendencies(cognitiveDrift, cognitivePatterns)
    },
    developmentProfile: {
      strengths: developmentStrengths(timeline, journals),
      growthAreas: developmentGrowthAreas(timeline, journals, cognitiveDrift),
      consistencySignals: consistencySignals(timeline, journals, reflectionPrompts)
    },
    summary: ""
  };

  identity.summary = buildIdentitySummary(identity);
  return identity;
}

function saveCognitiveIdentity(identity = {}) {
  ensureIdentityDirectory();
  const existing = getCognitiveIdentity();
  const now = new Date().toISOString();
  const savedIdentity = {
    ...identity,
    id: identity.id || existing?.id || `identity-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    createdAt: identity.createdAt || existing?.createdAt || now,
    updatedAt: now
  };
  savedIdentity.summary = savedIdentity.summary || buildIdentitySummary(savedIdentity);

  fs.writeFileSync(identityPath(), JSON.stringify(savedIdentity, null, 2), {
    encoding: "utf8",
    flag: "w"
  });

  return {
    saved: true,
    identityId: savedIdentity.id,
    identity: savedIdentity,
    filePath: identityPath()
  };
}

function getCognitiveIdentity() {
  const filePath = identityPath();

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function summarizeCognitiveIdentity(identity = getCognitiveIdentity()) {
  if (!identity) {
    return {
      exists: false,
      summary: "No cognitive identity profile is available yet.",
      dominantMood: "UNKNOWN",
      reflectionStyle: "developing"
    };
  }

  return {
    exists: true,
    identityId: identity.id,
    dominantMood: identity.behavioralProfile?.dominantMood || "UNKNOWN",
    reflectionStyle: identity.behavioralProfile?.reflectionStyle || "developing",
    strengths: safeStringArray(identity.developmentProfile?.strengths),
    growthAreas: safeStringArray(identity.developmentProfile?.growthAreas),
    summary: identity.summary || buildIdentitySummary(identity)
  };
}

function clearCognitiveIdentity() {
  const filePath = identityPath();

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return {
    cleared: true
  };
}

module.exports = {
  IDENTITY_DIRECTORY,
  buildCognitiveIdentity,
  clearCognitiveIdentity,
  getCognitiveIdentity,
  getIdentityDirectory,
  saveCognitiveIdentity,
  summarizeCognitiveIdentity
};
