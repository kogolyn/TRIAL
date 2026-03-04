export function requireSql(req, res, next) {
  if (!global.sqlReady) {
    return res.status(503).json({
      message:
        "Ambulance SQL module is not configured. Set DB_DIALECT/DB_HOST/DB_NAME/DB_USER/DB_PASSWORD and restart.",
    });
  }

  return next();
}
