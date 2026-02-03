const jwt = require('jsonwebtoken');
const { initEnv } = require('../config/env');

const verifyToken = async (req, res, next) => {
  // 🛡️ REPARACIÓN CRÍTICA: Dejar pasar peticiones de control (Preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  // ✅ Permitir rutas Foundry (usan x-foundry-key)
  if (req.path.startsWith('/admin/')) {
    return next();
  }
  // ✅ Permitir rutas públicas de auth (recuperación contraseña, etc.)
  if (req.path.startsWith('/auth/')) {
    return next();
  }
  // ✅ Permitir rutas públicas (formularios landing, etc.)
  if (req.path.startsWith('/public/')) {
    return next();
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.warn(`🚫 [AUTH] Bloqueado: No hay token en ${req.path}`);
      return res.status(401).json({ error: "No autorizado" });
    }

    const env = await initEnv();
    
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido" });
      }
      req.clinicId = decoded.clinicId;
      next();
    });

  } catch (error) {
    res.status(500).json({ error: "Fallo de seguridad" });
  }
};

module.exports = verifyToken;
