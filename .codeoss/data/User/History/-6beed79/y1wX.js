/**
 * 🚨 GESTOR DE ERRORES GLOBAL
 * Si algo explota en el sistema, este middleware captura los escombros
 * y envía una respuesta ordenada al cliente.
 */

const errorHandler = (err, req, res, next) => {
  console.error("🔥 [ERROR CRÍTICO SISTEMA]:");
  console.error(err.stack); // Imprime el rastro del error en la consola del servidor

  // Determinamos el código de estado (si no existe, usamos 500)
  const statusCode = err.statusCode || 500;
  
  // Mensaje para el cliente (en producción ocultamos detalles técnicos)
  const message = err.message || "Error interno del servidor.";

  res.status(statusCode).json({
    success: false,
    error: message,
    // Solo enviamos el stack trace si NO estamos en producción (seguridad)
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;