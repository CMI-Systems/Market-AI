const assert = require("assert");
const {
  buildAllowedOrigins,
  createCorsGuard,
  createCorsOptions,
  normalizeOrigin
} = require("../config/corsPolicy");

assert.strictEqual(normalizeOrigin("https://staging.example.invalid/"), "https://staging.example.invalid");
assert.strictEqual(normalizeOrigin("https://user:pass@example.invalid"), null);
assert.strictEqual(normalizeOrigin("not-a-url"), null);

const stagingWithoutConfig = buildAllowedOrigins({ NODE_ENV: "staging" });
assert.strictEqual(stagingWithoutConfig.size, 0);
assert.strictEqual(stagingWithoutConfig.has("http://localhost:5173"), false);

const stagingConfigured = buildAllowedOrigins({
  NODE_ENV: "staging",
  FRONTEND_URL: "https://staging.example.invalid",
  CORS_ALLOWED_ORIGINS: "https://preview.example.invalid"
});
assert.strictEqual(stagingConfigured.has("https://staging.example.invalid"), true);
assert.strictEqual(stagingConfigured.has("https://preview.example.invalid"), true);
assert.strictEqual(stagingConfigured.has("http://localhost:5173"), false);

const development = buildAllowedOrigins({ NODE_ENV: "development" });
assert.strictEqual(development.has("http://localhost:5173"), true);
assert.strictEqual(development.has("http://127.0.0.1:5173"), true);

const stagingCors = createCorsOptions({ NODE_ENV: "staging" });
stagingCors.origin("https://unapproved.example.invalid", (error, allowed) => {
  assert.strictEqual(error, null);
  assert.strictEqual(allowed, false);
});

let guardStatus = null;
let guardPayload = null;
let guardNextCalled = false;
const stagingGuard = createCorsGuard({ NODE_ENV: "staging" });
stagingGuard(
  { headers: { origin: "https://unapproved.example.invalid" } },
  {
    status(code) {
      guardStatus = code;
      return this;
    },
    json(payload) {
      guardPayload = payload;
    }
  },
  () => {
    guardNextCalled = true;
  }
);
assert.strictEqual(guardStatus, 403);
assert.strictEqual(guardPayload.reason, "origin_not_approved");
assert.strictEqual(guardNextCalled, false);

console.log("CORS policy test passed.");
