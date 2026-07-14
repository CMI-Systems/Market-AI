const assert = require("assert");
const {
  classifyFreshness,
  validateProviderHealthDto
} = require("../services/groupAReadServiceContracts");
const {
  listProviderHealth,
  getProviderHealth
} = require("../services/providerHealthReadService");
const {
  deterministicNotReadyDigestId,
  getLatestMarketContextDigest,
  getMarketContextDigestById,
  listMarketContextDigests
} = require("../services/marketContextDigestReadService");

function assertNoForbiddenKeys(value) {
  const text = JSON.stringify(value);
  [
    "apiKey",
    "secret",
    "token",
    "credential",
    "service_role",
    "databaseUrl",
    "stack",
    "hiddenReasoning",
    "trainingEligible",
    "autonomousExecution"
  ].forEach((word) => {
    assert(!text.includes(word), `Forbidden key leaked: ${word}`);
  });
}

function run() {
  const now = Date.now();
  assert.strictEqual(classifyFreshness(new Date(now).toISOString(), now), "fresh");
  assert.strictEqual(classifyFreshness(new Date(now - 10 * 60 * 1000).toISOString(), now), "delayed");
  assert.strictEqual(classifyFreshness(new Date(now - 45 * 60 * 1000).toISOString(), now), "stale");
  assert.strictEqual(classifyFreshness(null, now), "unknown");

  const providerList = listProviderHealth({ now });
  assert.strictEqual(providerList.ok, true);
  assert(Array.isArray(providerList.data));
  assert(providerList.data.length >= 1);
  providerList.data.forEach((dto) => {
    const validation = validateProviderHealthDto(dto);
    assert.strictEqual(validation.valid, true, validation.errors.join(","));
    assertNoForbiddenKeys(dto);
  });

  const unknownProvider = getProviderHealth("not-approved-provider");
  assert.strictEqual(unknownProvider.ok, false);
  assert.strictEqual(unknownProvider.reason, "approved_source_missing");
  assertNoForbiddenKeys(unknownProvider);

  const digestList = listMarketContextDigests();
  assert.strictEqual(digestList.ok, false);
  assert.strictEqual(digestList.status, "not_ready");
  assert.strictEqual(digestList.reason, "approved_source_missing");
  assert.strictEqual(digestList.digestType, "not_ready");
  assert.strictEqual(digestList.sourceCount, 0);
  assert.strictEqual(digestList.confidence, 0);
  assert.strictEqual(digestList.validatedSnapshot, false);
  assert.strictEqual(digestList.digestId, deterministicNotReadyDigestId("SPY"));
  assert.strictEqual(listMarketContextDigests().digestId, digestList.digestId);
  assert(!JSON.stringify(digestList).toLowerCase().includes("validated market snapshot"));
  assertNoForbiddenKeys(digestList);

  const latestDigest = getLatestMarketContextDigest({ symbol: "SPY" });
  assert.strictEqual(latestDigest.ok, false);
  assert.strictEqual(latestDigest.status, "not_ready");
  assert.strictEqual(latestDigest.sourceCount, 0);
  assertNoForbiddenKeys(latestDigest);

  const requestedId = "requested-digest-id";
  const digestById = getMarketContextDigestById(requestedId);
  assert.strictEqual(digestById.ok, false);
  assert.strictEqual(digestById.status, "not_ready");
  assert.strictEqual(digestById.digestId, requestedId);
  assert.strictEqual(digestById.sourceCount, 0);
  assert.strictEqual(digestById.validatedSnapshot, false);

  const invalidDigest = getMarketContextDigestById("$bad");
  assert.strictEqual(invalidDigest.ok, false);
  assert.strictEqual(invalidDigest.reason, "invalid_filter");
  assertNoForbiddenKeys(invalidDigest);

  console.log("Group A read services test passed.");
}

run();
