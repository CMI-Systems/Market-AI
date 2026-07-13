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

const APPROVED_BETA_STATUS = "CLOSED_BETA_APPROVED";
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function localSessionIdFromRequest(req) {
  return req.headers["x-market-ai-session"] || null;
}

function bearerCredentialFromRequest(req) {
  const authorization = String(req.headers.authorization || "").trim();
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function clientKey(req) {
  return String(
    req.operatorSession?.userId ||
    localSessionIdFromRequest(req) ||
    req.ip ||
    "anonymous"
  );
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

function createAccessDeniedResponse(statusCode, reason) {
  const forbidden = statusCode === 403;

  return {
    ok: false,
    status: forbidden ? "forbidden" : "unauthorized",
    freshnessState: "unavailable",
    reason,
    message: forbidden
      ? "Approved operator access is required."
      : "Authenticated operator access is required.",
    data: null,
    warnings: ["not_ready"],
    generatedAt: new Date().toISOString()
  };
}

async function authenticateSupabaseOperator(
  accessCredential,
  supabase = require("../services/supabaseClient")
) {
  if (!supabase) {
    return {
      ok: false,
      statusCode: 503,
      reason: "authorization_unavailable"
    };
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(accessCredential);
    const user = userData?.user || null;

    if (userError || !user) {
      return {
        ok: false,
        statusCode: 401,
        reason: "invalid_session"
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("operator_profiles")
      .select("id, beta_status, beta_approved")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return {
        ok: false,
        statusCode: 503,
        reason: "authorization_unavailable"
      };
    }

    if (
      !profile ||
      profile.beta_status !== APPROVED_BETA_STATUS ||
      profile.beta_approved !== true
    ) {
      return {
        ok: false,
        statusCode: 403,
        reason: "operator_not_approved"
      };
    }

    return {
      ok: true,
      operatorRole: "operator",
      sessionState: "AUTHENTICATED",
      userId: user.id
    };
  } catch {
    return {
      ok: false,
      statusCode: 503,
      reason: "authorization_unavailable"
    };
  }
}

function createRequireOperatorSession(options = {}) {
  const authenticateOperator = options.authenticateOperator || authenticateSupabaseOperator;
  const getNodeEnv = options.getNodeEnv || (() => process.env.NODE_ENV);

  return async function requireOperatorSession(req, res, next) {
    const nodeEnv = String(getNodeEnv() || "").toLowerCase();

    if (nodeEnv === "development") {
      const session = getSessionStatus(localSessionIdFromRequest(req), {
        allowLocalDevFallback: true,
        nodeEnv
      });

      if (
        (session.authState === "LOCAL_DEV" || session.authState === "AUTHENTICATED") &&
        session.operatorRole === "operator"
      ) {
        req.operatorSession = {
          operatorRole: session.operatorRole,
          sessionState: session.sessionState,
          userId: null
        };
        next();
        return;
      }
    } else {
      const accessCredential = bearerCredentialFromRequest(req);

      if (accessCredential) {
        const authorization = await authenticateOperator(accessCredential);

        if (authorization?.ok && authorization.operatorRole === "operator") {
          req.operatorSession = {
            operatorRole: authorization.operatorRole,
            sessionState: authorization.sessionState || "AUTHENTICATED",
            userId: authorization.userId || null
          };
          next();
          return;
        }

        const statusCode = authorization?.statusCode === 403
          ? 403
          : authorization?.statusCode === 503
            ? 503
            : 401;
        const reason = authorization?.reason || "invalid_session";
        const response = createAccessDeniedResponse(statusCode, reason);
        safeLog(req, statusCode, reason);
        res.status(statusCode).json(response);
        return;
      }
    }

    const response = createAccessDeniedResponse(401, "unauthorized");
    safeLog(req, 401, "unauthorized");
    res.status(401).json(response);
  };
}

function createRateLimitGroupA() {
  const rateLimitBuckets = new Map();

  return function rateLimitGroupA(req, res, next) {
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
  };
}

function createGroupAReadRouter(options = {}) {
  const router = express.Router();

  router.use(createRequireOperatorSession(options));
  router.use(createRateLimitGroupA());

  router.get("/market-context/digests", (req, res) => {
    const result = listMarketContextDigests();
    const statusCode = result.ok ? 200 : 503;
    safeLog(req, statusCode, result.ok ? "ok" : result.reason);
    res.status(statusCode).json(result);
  });

  router.get("/provider-health", (req, res) => {
    const result = listProviderHealth();
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

  router.get("/market-context/digests/latest", (req, res) => {
    const result = getLatestMarketContextDigest({ symbol: req.query.symbol });
    const statusCode = result.reason === "invalid_filter" ? 400 : result.ok ? 200 : 503;
    safeLog(req, statusCode, result.reason || "ok", {
      filterSummary: req.query.symbol ? "symbol" : null
    });
    res.status(statusCode).json(result);
  });

  router.get("/market-context/digests/:id", (req, res) => {
    const result = getMarketContextDigestById(req.params.id);
    const statusCode = result.reason === "invalid_filter" ? 400 : result.ok ? 200 : 503;
    safeLog(req, statusCode, result.reason || "ok", {
      filterSummary: "digestId"
    });
    res.status(statusCode).json(result);
  });

  return router;
}

module.exports = {
  authenticateSupabaseOperator,
  bearerCredentialFromRequest,
  createGroupAReadRouter,
  createRequireOperatorSession
};
