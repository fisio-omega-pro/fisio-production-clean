/**
 * 🛡️ MIDDLEWARE DE AUTENTICACIÓN (JWT)
 * Verifica la identidad digital del fisio antes de dejarle pasar al Dashboard.
 */
const jwt = require('jsonwebtoken');
const { initEnv } = require('../config/env');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    // Cargamos la clave maestra desde la caja fuerte
    const env = await initEnv();
    
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.warn(`🚫 [AUTH] Token inválido: ${err.message}`);
        return res.status(403).json({ error: "Credenciales caducadas. Por favor, haz login de nuevo." });
      }
      
      // Inyectamos la identidad en la petición
      req.clinicId = decoded.clinicId;
      next();
    });

  } catch (error) {
    console.error("🔥 [AUTH] Error crítico de seguridad:", error);
    res.status(500).json({ error: "Error interno de seguridad." });
  }
};

module.exports = verifyToken;