/**
 * 🛠️ UTILIDADES COMPARTIDAS - NIVEL OMEGA
 * Funciones puras que aseguran la consistencia de datos en todo el sistema.
 */

// 1. Limpieza y Normalización de Teléfonos (Vital para WhatsApp/CRM)
const normalizarTelefono = (tlf) => {
  if (!tlf) return "";
  
  // Convertimos a string por seguridad si llega un número
  let limpio = String(tlf).replace(/\D/g, ''); // Elimina todo lo que no sea dígito
  
  // Lógica específica para prefijo España (34)
  // Si tiene 11 dígitos y empieza por 34, asumimos formato internacional y lo limpiamos
  // para consistencia interna.
  if (limpio.startsWith('34') && limpio.length === 11) {
    limpio = limpio.substring(2);
  }
  
  return limpio.trim();
};

// 2. Detector de Host Dinámico (Vital para redirecciones de Stripe)
// Garantiza que el dinero sepa volver a la URL correcta, sea localhost o Cloud Run.
const getDynamicHost = (req) => {
  const host = req.get('host');
  const protocol = (req.secure || req.get('x-forwarded-proto') === 'https' || host.includes('run.app')) 
    ? 'https' 
    : 'http';
    
  return `${protocol}://${host}`;
};

// 3. Generador de IDs de Referido (Formato FT-XXXXX)
const generarCodigoReferido = () => {
  return 'FT-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// 4. Generador de Slugs (URLs amigables para clínicas)
const generarSlug = (nombre) => {
  if (!nombre) return `clinica-${Date.now()}`;
  return nombre.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza caracteres raros por guiones
    .replace(/^-|-$/g, '');      // Elimina guiones al inicio o final
};

module.exports = {
  normalizarTelefono,
  getDynamicHost,
  generarCodigoReferido,
  generarSlug
};