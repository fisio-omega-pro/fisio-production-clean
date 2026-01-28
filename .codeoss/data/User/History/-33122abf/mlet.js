/**
 * 🛡️ MIDDLEWARE DE AUTENTICACIÓN (JWT)
 * Verifica que quien llama a la API tiene una llave digital válida.
 * Protege la soberanía de los datos de cada clínica.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const verifyToken = (req, res, next) => {
  // 1. Buscamos el token en la cabecera "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn(`🚫 [AUTH] Acceso denegado: IP ${req.ip} intentó entrar sin token.`);
    return res.status(401).json({ error: "Acceso no autorizado. Identifíquese." });
  }

  // 2. Verificamos la firma digital del token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(`❌ [AUTH] Token inválido o caducado: ${err.message}`);
      return res.status(403).json({ error: "Sesión expirada o inválida." });
    }

    // 3. INYECCIÓN DE IDENTIDAD:
    // Si el token es válido, extraemos el ID de la clínica y lo pegamos a la petición (req).
    // A partir de aquí, el resto del sistema sabe exactamente qué clínica es.
    req.clinicId = decoded.clinicId;
    
    next(); // Permiso concedido, pase al siguiente nivel.
  });
};

module.exports = verifyToken;