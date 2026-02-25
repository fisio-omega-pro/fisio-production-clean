# Blindaje de seguridad – FisioTool Pro

Resumen de las medidas aplicadas y recomendaciones para mantener un nivel de exigencia alto.

---

## 1. CORS

- **Estado:** Restringido por defecto cuando `FRONTEND_URL` está configurado: solo se aceptan orígenes derivados de esa URL (con/sin `www`).
- **Configuración:** Para permitir varios dominios (p. ej. app + preview Vercel), define `CORS_ORIGINS` en env o Secret Manager como lista separada por comas:  
  `https://www.fisiotool.com,https://fisiotool.com,https://tu-preview.vercel.app`
- **Sin restricción (solo desarrollo):** Si no hay `FRONTEND_URL` ni `CORS_ORIGINS`, se usa `*`. En producción conviene tener siempre `FRONTEND_URL` (o `CORS_ORIGINS`) definido.

---

## 2. Cabeceras de seguridad

- **Helmet** con:
  - **HSTS:** `maxAge` 1 año, `includeSubDomains`, `preload`.
  - **X-Frame-Options:** `deny` (evita que la API se embele en iframes).
  - **Referrer-Policy:** `strict-origin-when-cross-origin`.
  - **X-Content-Type-Options:** `nosniff` (cabecera adicional).
- **CSP:** Desactivada (`contentSecurityPolicy: false`) para no romper integraciones; se puede activar y ajustar si se define política explícita.

---

## 3. Contraseñas

- **Registro y recuperación de contraseña:** Validación en backend con `utils/security.js` → `validatePasswordStrength`:
  - Mínimo 8 caracteres.
  - Al menos una mayúscula, una minúscula, un número y un símbolo (`#@!$%&*()+=-[]{}` etc.).
- Las contraseñas se almacenan con **bcrypt** (hash, nunca en claro).

---

## 4. Rate limiting

- **API global:** 600 peticiones por 15 minutos por IP en `/api`.
- **Auth (anti brute-force):** 15 intentos por 15 minutos por IP en:
  - `POST /api/login`
  - `POST /api/register`
  - `POST /api/auth/forgot-password`  
  Respuesta: `{ error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." }`.

---

## 5. Sesiones y JWT

- **Token:** Verificación en cada petición a rutas protegidas (middleware `auth`).
- **Rutas públicas:** Login, registro, recuperación de contraseña, webhooks, Foundry (con `x-foundry-key`) y endpoints públicos no exigen JWT.
- **Buenas prácticas:** JWT con expiración (p. ej. 30d), secreto desde env/Secret Manager. No se envía contraseña en respuestas; en `getDashboardData` se excluye `password` del objeto clínica.

---

## 6. Logging y auditoría

- **Middleware de peticiones:** Para cada request se registra (al finalizar): método, ruta, código de estado, duración e IP. No se registran cuerpos ni tokens.
- **Errores:** Status ≥ 500 → `console.error`; ≥ 400 → `console.warn`.
- **Auditoría de negocio:** `createAuditLog` en controladores para acciones sensibles (login, alta clínica, referidos, Stripe, etc.). Los eventos se guardan en la colección `audit_logs`.

---

## 7. Base de datos (Firestore)

- Comunicación vía SDK oficial con **HTTPS**.
- Sin inyección SQL (modelo NoSQL). Validación y saneamiento de inputs en controladores; uso de `escapeHtml` en salidas a HTML/emails para mitigar XSS.

---

## 8. Otras medidas ya presentes

- **HTTPS:** Tráfico servidor–cliente y servidor–Firestore sobre HTTPS (obligatorio en producción).
- **Webhooks Stripe:** Verificación de firma con `STRIPE_WEBHOOK_SECRET`; body RAW solo en la ruta del webhook.
- **Foundry:** Acceso admin con cabecera `x-foundry-key`; clave desde Secret Manager.
- **Secrets:** Claves, JWT, Stripe, emails, etc. desde variables de entorno / Secret Manager (ver `AUDIT_SECRETS.md`).

---

## 9. Recomendaciones operativas (fuera de código)

- **DDoS:** Apoyarse en protecciones del proveedor (Cloud Run, Cloud Armor, etc.) y en el rate limiting ya aplicado.
- **Firewall / red:** Configurar reglas (IPTables, VPC, etc.) según la arquitectura en cloud.
- **Dependencias:** Revisar periódicamente con `npm audit` y actualizar paquetes con vulnerabilidades.
- **CI/CD y VCS:** Usar control de versiones y pipeline de despliegue para revisión y despliegues reproducibles.
- **Monitorización:** Usar herramientas (p. ej. Cloud Monitoring, Sentry) para errores, latencia y uso anómalo.

---

## 10. Checklist de despliegue seguro

- [ ] `FRONTEND_URL` o `CORS_ORIGINS` definidos (evitar CORS `*` en producción).
- [ ] `JWT_SECRET` fuerte y solo en Secret Manager / env.
- [ ] `STRIPE_WEBHOOK_SECRET` y clave Stripe configurados.
- [ ] Credenciales de email (ANA_MAIL, INFO_MAIL) en secretos.
- [ ] HTTPS obligatorio en el frontal y en la URL del backend.
- [ ] Rate limiting activo (por defecto en el servidor).
- [ ] Logs y auditoría revisables (Cloud Logging, `audit_logs` en Firestore).
