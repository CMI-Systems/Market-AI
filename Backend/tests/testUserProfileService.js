const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  getUserProfile,
  saveUserProfile
} = require("../services/userProfileService");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-users-"));
const result = getUserProfile("test-user", { baseDir });

assert.strictEqual(result.profileState, "ACTIVE");
assert.strictEqual(result.profile.username, "Local Operator");
assert(fs.existsSync(path.join(baseDir, "test-user.profile.json")));

const saved = saveUserProfile({
  ...result.profile,
  username: "Research Operator"
}, { baseDir });
assert.strictEqual(saved.username, "Research Operator");

const reloaded = getUserProfile("test-user", { baseDir });
assert.strictEqual(reloaded.profile.username, "Research Operator");
assert(!JSON.stringify(reloaded).toLowerCase().includes("secret"));

console.log("User profile service test passed.");
