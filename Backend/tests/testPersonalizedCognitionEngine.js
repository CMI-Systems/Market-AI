const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildPersonalizedCognition } = require("../services/personalizedCognitionEngine");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-cognition-prefs-"));
const result = buildPersonalizedCognition("test-user", { baseDir });

assert.strictEqual(result.cognitionPreferenceState, "ACTIVE");
assert.strictEqual(result.preferenceProfile.mode, "Analyst Mode");
assert(result.preferenceProfile.reasoningDetail);

console.log("Personalized cognition engine test passed.");
