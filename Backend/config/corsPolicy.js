function normalizeOrigin(value) {
  const candidate = String(value || "").trim().replace(/\/$/, "");

  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.origin !== candidate
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function buildAllowedOrigins(env = process.env) {
  const configuredOrigins = [
    env.FRONTEND_URL,
    ...(String(env.CORS_ALLOWED_ORIGINS || "").split(","))
  ];

  if (String(env.NODE_ENV || "").toLowerCase() === "development") {
    configuredOrigins.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    );
  }

  return new Set(configuredOrigins.map(normalizeOrigin).filter(Boolean));
}

function createCorsOptions(env = process.env) {
  const allowedOrigins = buildAllowedOrigins(env);

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  };
}

function createCorsGuard(env = process.env) {
  const allowedOrigins = buildAllowedOrigins(env);

  return function corsGuard(req, res, next) {
    const origin = req.headers.origin;

    if (!origin) {
      next();
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
      next();
      return;
    }

    res.status(403).json({
      ok: false,
      status: "forbidden",
      reason: "origin_not_approved",
      message: "Request origin is not approved."
    });
  };
}

module.exports = {
  buildAllowedOrigins,
  createCorsGuard,
  createCorsOptions,
  normalizeOrigin
};
