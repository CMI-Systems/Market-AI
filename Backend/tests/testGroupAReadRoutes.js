const assert = require("assert");
const http = require("http");
const express = require("express");
const {
  authenticateSupabaseOperator,
  createGroupAReadRouter
} = require("../routes/groupAReadRoutes");
const { createLocalSession } = require("../services/authenticationFoundation");

const APPROVED_TEST_CREDENTIAL = "approved-test-session";

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

async function authenticateOperator(accessCredential) {
  if (accessCredential !== APPROVED_TEST_CREDENTIAL) {
    return {
      ok: false,
      statusCode: 401,
      reason: "invalid_session"
    };
  }

  return {
    ok: true,
    operatorRole: "operator",
    sessionState: "AUTHENTICATED",
    userId: "00000000-0000-0000-0000-000000000001"
  };
}

async function run() {
  const originalNodeEnv = process.env.NODE_ENV;
  const approvedSupabaseClient = {
    auth: {
      getUser: async (accessCredential) => ({
        data: accessCredential === APPROVED_TEST_CREDENTIAL
          ? { user: { id: "00000000-0000-0000-0000-000000000001" } }
          : { user: null },
        error: null
      })
    },
    from(table) {
      assert.strictEqual(table, "operator_profiles");
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        async maybeSingle() {
          return {
            data: {
              id: "00000000-0000-0000-0000-000000000001",
              beta_status: "CLOSED_BETA_APPROVED",
              beta_approved: true
            },
            error: null
          };
        }
      };
    }
  };
  const verifiedOperator = await authenticateSupabaseOperator(
    APPROVED_TEST_CREDENTIAL,
    approvedSupabaseClient
  );
  assert.strictEqual(verifiedOperator.ok, true);
  assert.strictEqual(verifiedOperator.operatorRole, "operator");

  const router = createGroupAReadRouter({ authenticateOperator });
  const matchingDigestListRoutes = router.stack.filter(
    (layer) => layer.route?.path === "/market-context/digests"
  );
  assert.strictEqual(matchingDigestListRoutes.length, 1);

  const app = express();
  app.use("/api", router);
  const server = app.listen(0);
  const port = server.address().port;
  const approvedHeaders = {
    Authorization: `Bearer ${APPROVED_TEST_CREDENTIAL}`
  };

  try {
    process.env.NODE_ENV = "staging";

    const unauthenticatedStaging = await requestJson(port, "/api/provider-health");
    assert.strictEqual(unauthenticatedStaging.statusCode, 401);
    assert.strictEqual(unauthenticatedStaging.body.ok, false);
    assert.strictEqual(unauthenticatedStaging.body.reason, "unauthorized");

    const localSession = createLocalSession("operator");
    const localHeaderInStaging = await requestJson(port, "/api/provider-health", {
      "x-market-ai-session": localSession.sessionId
    });
    assert.strictEqual(localHeaderInStaging.statusCode, 401);

    const invalidStagingCredential = await requestJson(port, "/api/provider-health", {
      Authorization: "Bearer invalid-test-session"
    });
    assert.strictEqual(invalidStagingCredential.statusCode, 401);
    assert.strictEqual(invalidStagingCredential.body.reason, "invalid_session");

    const providerList = await requestJson(port, "/api/provider-health", approvedHeaders);
    assert.strictEqual(providerList.statusCode, 200);
    assert.strictEqual(providerList.body.ok, true);
    assert(Array.isArray(providerList.body.data));

    const missingProvider = await requestJson(
      port,
      "/api/provider-health/not-approved-provider",
      approvedHeaders
    );
    assert.strictEqual(missingProvider.statusCode, 404);
    assert.strictEqual(missingProvider.body.ok, false);
    assert.strictEqual(missingProvider.body.reason, "approved_source_missing");

    const digestList = await requestJson(
      port,
      "/api/market-context/digests",
      approvedHeaders
    );
    assert.strictEqual(digestList.statusCode, 503);
    assert.strictEqual(digestList.body.ok, false);
    assert.strictEqual(digestList.body.status, "not_ready");
    assert.strictEqual(digestList.body.sourceCount, 0);
    assert.strictEqual(digestList.body.validatedSnapshot, false);

    const latestDigest = await requestJson(
      port,
      "/api/market-context/digests/latest?symbol=SPY",
      approvedHeaders
    );
    assert.strictEqual(latestDigest.statusCode, 503);
    assert.strictEqual(latestDigest.body.ok, false);
    assert.strictEqual(latestDigest.body.sourceCount, 0);

    const requestedId = "requested-digest-id";
    const digestById = await requestJson(
      port,
      `/api/market-context/digests/${requestedId}`,
      approvedHeaders
    );
    assert.strictEqual(digestById.statusCode, 503);
    assert.strictEqual(digestById.body.digestId, requestedId);

    const invalidDigest = await requestJson(
      port,
      "/api/market-context/digests/%24bad",
      approvedHeaders
    );
    assert.strictEqual(invalidDigest.statusCode, 400);
    assert.strictEqual(invalidDigest.body.ok, false);
    assert.strictEqual(invalidDigest.body.reason, "invalid_filter");

    process.env.NODE_ENV = "development";
    const explicitLocalDevelopment = await requestJson(port, "/api/provider-health");
    assert.strictEqual(explicitLocalDevelopment.statusCode, 200);
    assert.strictEqual(explicitLocalDevelopment.body.ok, true);

    console.log("Group A read routes test passed.");
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
