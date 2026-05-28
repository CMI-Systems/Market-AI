const fs = require("fs");
const path = require("path");
const { DEFAULT_USER_ID, DEFAULT_USERS_DIR } = require("./userProfileService");

const AWAITING_OPERATOR_MEMORY = "Awaiting operator memory.";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function memoryPath(userId = DEFAULT_USER_ID, baseDir = DEFAULT_USERS_DIR) {
  return path.join(baseDir, `${userId}.operator-memory.json`);
}

function loadOperatorMemory(userId = DEFAULT_USER_ID, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USERS_DIR;
  try {
    const file = memoryPath(userId, baseDir);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8")).interactions || [];
  } catch {
    return [];
  }
}

function recordOperatorInteraction(userId = DEFAULT_USER_ID, interaction = {}, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USERS_DIR;
  ensureDir(baseDir);
  const interactions = loadOperatorMemory(userId, { baseDir });
  interactions.push({
    timestamp: new Date().toISOString(),
    type: interaction.type || "view",
    target: interaction.target || "dashboard"
  });
  fs.writeFileSync(memoryPath(userId, baseDir), `${JSON.stringify({ interactions: interactions.slice(-200) }, null, 2)}\n`);
  return buildOperatorMemory(userId, { baseDir });
}

function buildOperatorMemory(userId = DEFAULT_USER_ID, options = {}) {
  const interactions = loadOperatorMemory(userId, options);
  const counts = interactions.reduce((next, item) => {
    const key = `${item.type}:${item.target}`;
    next[key] = (next[key] || 0) + 1;
    return next;
  }, {});
  const dominantInteractions = Object.entries(counts)
    .map(([interaction, count]) => ({ interaction, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    operatorMemoryState: interactions.length ? "ACTIVE" : "LIMITED",
    interactionPatterns: interactions.slice(-20).reverse(),
    dominantInteractions,
    warnings: [],
    summary: interactions.length
      ? `Operator memory contains ${interactions.length} interaction records.`
      : AWAITING_OPERATOR_MEMORY
  };
}

module.exports = {
  AWAITING_OPERATOR_MEMORY,
  buildOperatorMemory,
  recordOperatorInteraction
};
