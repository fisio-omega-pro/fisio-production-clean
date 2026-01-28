const errorHandler = (err, req, res, next) => {
  console.error("🔥 [ERROR CRÍTICO]", err);
  const status = err.statusCode || 500;
  const message = err.message || "Error interno del servidor.";
  res.status(status).json({ error: message, success: false });
};

module.exports = errorHandler;