const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildWatchlistProfile } = require("../services/watchlistProfileEngine");

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "market-ai-watchlist-"));
const result = buildWatchlistProfile("test-user", { baseDir });

assert.strictEqual(result.watchlistState, "ACTIVE");
assert(Array.isArray(result.profile.prioritizedSymbols));
assert(result.profile.prioritizedSymbols.length >= 1);
assert(Array.isArray(result.ecosystemBias));

console.log("Watchlist profile engine test passed.");
