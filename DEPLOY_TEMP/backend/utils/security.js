/**
 * Validación de fortaleza de contraseña (alineada con frontend y buenas prácticas).
 * Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.
 */
function validatePasswordStrength(password) {
  const p = String(password || '');
  if (p.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  if (!/[A-Z]/.test(p)) return { ok: false, error: 'Debe incluir al menos una letra mayúscula' };
  if (!/[a-z]/.test(p)) return { ok: false, error: 'Debe incluir al menos una letra minúscula' };
  if (!/[0-9]/.test(p)) return { ok: false, error: 'Debe incluir al menos un número' };
  if (!/[#@!$%&*()+=\-[\]{};':"\\|,.<>/?]/.test(p)) return { ok: false, error: 'Debe incluir al menos un símbolo (#@!$%&* etc.)' };
  return { ok: true };
}

/**
 * Sanitiza una cadena para evitar XSS en salida HTML (uso en emails o respuestas que se rendericen).
 */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { validatePasswordStrength, escapeHtml };
