const assert = require("assert");
const http = require("http");
const express = require("express");
const { createGroupAReadRouter } = require("../routes/groupAReadRoutes");
const { createLocalSession } = require("../services/authenticationFoundation");

function requestJson(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ port, path, headers }, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body)
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  const app = express();
  app.use("/api", createGroupAReadRouter());
  const server = app.listen(0);
  const port = server.address().port;
  const session = createLocalSession("operator");
  const headers = { "x-market-ai-session": session.sessionId };

  try {
    const unauthorized = await requestJson(port, "/api/provider-health");
    assert.strictEqual(unauthorized.statusCode, 401);
    assert.strictEqual(unauthorized.body.ok, false);
    assert.strictEqual(unauthorized.body.reason, "unauthorized");

    const providerList = await requestJson(port, "/api/provider-health", headers);
    assert.strictEqual(providerList.statusCode, 200);
    assert.strictEqual(providerList.body.ok, true);
    assert(Array.isArray(providerList.body.data));

    const missingProvider = await requestJson(port, "/api/provider-health/not-approved-provider", headers);
    assert.strictEqual(missingProvider.statusCode, 404);
    assert.strictEqual(missingProvider.body.ok, false);
    assert.strictEqual(missingProvider.body.reason, "approved_source_missing");

    const digestList = await requestJson(port, "/api/market-context/digests", headers);
    assert.strictEqual(digestList.statusCode, 503);
    assert.strictEqual(digestList.body.ok, false);
    assert.strictEqual(digestList.body.reason, "approved_source_missing");

    const latestDigest = await requestJson(port, "/api/market-context/digests/latest?symbol=SPY", headers);
    assert.strictEqual(latestDigest.statusCode, 503);
    assert.strictEqual(latestDigest.body.ok, false);
    assert.strictEqual(latestDigest.body.reason, "approved_source_missing");

    const invalidDigest = await requestJson(port, "/api/market-context/digests/%24bad", headers);
    assert.strictEqual(invalidDigest.statusCode, 400);
    assert.strictEqual(invalidDigest.body.ok, false);
    assert.strictEqual(invalidDigest.body.reason, "invalid_filter");

    console.log("Group A read routes test passed.");
  } finally {
    server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
