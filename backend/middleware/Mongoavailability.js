export function requireMongo(req, res, next) {
  if (!global.mongoReady) {
    return res.status(503).json({
      message:
        "Ambulance MongoDB module is not configured. Set MONGO_URI and restart.",
    });
  }

  return next();
}

// Backward-compatible export for existing imports.
export const requireSql = requireMongo;
