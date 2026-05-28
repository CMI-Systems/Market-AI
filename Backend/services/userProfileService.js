const fs = require("fs");
const path = require("path");

const AWAITING_USER_PROFILE = "Awaiting user profile.";
const DEFAULT_USERS_DIR = path.join(__dirname, "..", "data", "users");
const DEFAULT_USER_ID = "local-operator";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function profilePath(userId = DEFAULT_USER_ID, baseDir = DEFAULT_USERS_DIR) {
  return path.join(baseDir, `${userId}.profile.json`);
}

function defaultProfile(userId = DEFAULT_USER_ID) {
  const now = new Date().toISOString();
  return {
    userId,
    username: "Local Operator",
    operatorRole: "operator",
    cognitionPreferences: { mode: "Analyst Mode", density: "BALANCED" },
    replayPreferences: { depth: "BALANCED" },
    environmentPreferences: { focus: "GLOBAL" },
    dashboardMode: "Analyst Mode",
    compressionMode: "Balanced retention",
    preferredEcosystems: ["Broad Market", "Mega Caps", "Semiconductors"],
    watchlistProfile: { prioritizedSymbols: ["NVDA", "AMD", "MSFT", "QQQ", "SPY"] },
    retentionPreferences: { mode: "Balanced retention" },
    createdAt: now,
    updatedAt: now
  };
}

function safeReadProfile(userId = DEFAULT_USER_ID, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USERS_DIR;
  try {
    const file = profilePath(userId, baseDir);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function saveUserProfile(profile, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USERS_DIR;
  ensureDir(baseDir);
  const next = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(profilePath(next.userId || DEFAULT_USER_ID, baseDir), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

function getUserProfile(userId = DEFAULT_USER_ID, options = {}) {
  const baseDir = options.baseDir || DEFAULT_USERS_DIR;
  ensureDir(baseDir);
  const existing = safeReadProfile(userId, { baseDir });
  const profile = existing || saveUserProfile(defaultProfile(userId), { baseDir });

  return {
    profileState: profile ? "ACTIVE" : "INITIALIZING",
    profile,
    warnings: existing ? [] : ["Local operator profile initialized with safe defaults."],
    summary: profile ? `User profile loaded for ${profile.username}.` : AWAITING_USER_PROFILE
  };
}

module.exports = {
  AWAITING_USER_PROFILE,
  DEFAULT_USER_ID,
  DEFAULT_USERS_DIR,
  defaultProfile,
  getUserProfile,
  saveUserProfile
};
