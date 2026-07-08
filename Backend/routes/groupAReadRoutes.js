const express = require("express");
const {
  getProviderHealth,
  listProviderHealth
} = require("../services/providerHealthReadService");
const {
  getLatestMarketContextDigest,
  getMarketContextDigestById,
  listMarketContextDigests
} = require("../services/marketContextDigestReadService");
const { getSessionStatus } = require("../services/authenticationFoundation");
const logger = require("../services/structuredLogger");

const router = express.Router();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitBuckets = new Map();

function sessionIdFromRequest(req) {
  return req.headers["x-market-ai-session"] || req.query.sessionId || null;
}

function clientKey(req) {
  return String(sessionIdFromRequest(req) || req.ip || "anonymous");
}

function safeLog(req, status, outcome, meta = {}) {
  logger.info("group-a-read", "Group A read-service request handled.", {
    method: req.method,
    path: req.path,
    status,
    outcome,
    filterSummary: meta.filterSummary || null,
    freshnessState: meta.freshnessState || null
  });
}

function requireOperatorSession(req, res, next) {
const sessionId = sessionIdFromRequest(req);
const session = getSessionStatus(sessionId);

const isLocalDev =
process.env.NODE_ENV !== "production" &&
session.authState === "LOCAL_DEV";

if (
!isLocalDev &&
(
!sessionId ||
session.authState !== "AUTHENTICATED" ||
session.operatorRole !== "operator"
)
) {
const response = {
ok: false,
status: "unauthorized",
freshnessState: "unavailable",
reason: "unauthorized",
message: "Authenticated operator access is required.",
data: null,
warnings: ["not_ready"],
generatedAt: new Date().toISOString()
};

safeLog(req, 401, "unauthorized");
res.status(401).json(response);
return;
}

req.operatorSession = {
operatorRole: session.operatorRole,
sessionState: session.sessionState
};

  next();
}

function rateLimitGroupA(req, res, next) {
  const now = Date.now();
  const key = clientKey(req);
  const current = rateLimitBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const response = {
      ok: false,
      status: "unavailable",
      freshnessState: "unavailable",
      reason: "rate_limited",
      message: "Group A read-service rate limit exceeded.",
      data: null,
      warnings: ["not_ready"],
      generatedAt: new Date().toISOString()
    };
    safeLog(req, 429, "rate_limited");
    res.status(429).json(response);
    return;
  }

  current.count += 1;
  next();
}

router.use(requireOperatorSession);
router.use(rateLimitGroupA);

router.get("/market-context/digests", (req, res) => {
  const result = listMarketContextDigests();
  const statusCode = result.ok ? 200 : 503;
  safeLog(req, statusCode, result.ok ? "ok" : result.reason);
  res.status(statusCode).json(result);
});

router.get("/provider-health/:provider", (req, res) => {
  const result = getProviderHealth(req.params.provider);
  safeLog(req, result.ok ? 200 : 404, result.ok ? "ok" : result.reason, {
    filterSummary: "provider"
  });
  res.status(result.ok ? 200 : 404).json(result);
});

router.get("/market-context/digests", (req, res) => {
  const result = listMarketContextDigests();
  safeLog(req, 503, result.reason);
  res.status(503).json(result);
});

router.get("/market-context/digests/latest", (req, res) => {
  const result = getLatestMarketContextDigest({ symbol: req.query.symbol });
  const statusCode = result.ok ? 200 : result.reason === "invalid_filter" ? 400 : 503;
  safeLog(req, statusCode, result.reason, {
    filterSummary: req.query.symbol ? "symbol" : null
  });
  res.status(statusCode).json(result);
});

router.get("/market-context/digests/:id", (req, res) => {
  const result = getMarketContextDigestById(req.params.id);
  const statusCode = result.ok ? 200 : result.reason === "invalid_filter" ? 400 : 503;
  safeLog(req, statusCode, result.reason, {
    filterSummary: "digestId"
  });
  res.status(statusCode).json(result);
});

module.exports = {
  createGroupAReadRouter: () => router,
  requireOperatorSession,
  rateLimitGroupA
};
