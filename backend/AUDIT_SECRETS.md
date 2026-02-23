# Auditoría: uso de secretos y variables sensibles

Revisión para confirmar que **no hay claves, Price IDs ni datos sensibles** usados fuera de env/Secret Manager (Google Cloud).

---

## 1. Rutas que usan Stripe

| Ruta / flujo | Origen del valor | Estado |
|--------------|------------------|--------|
| Clave API Stripe (`sk_...`) | `initEnv()` → `STRIPE_SK` / `STRIPE_SECRET_KEY` (Secret Manager) | ✅ Solo env |
| Webhook signing secret (`whsec_...`) | `initEnv()` → `STRIPE_WEBHOOK_SECRET` | ✅ Solo env |
| Price ID plan base (100€) | `getPriceIdForPlan('solo')` → `STRIPE_PRICE_SOLO` o `STRIPE_PRICE_BASE` | ✅ Solo env (fallback solo si no hay secreto) |
| Price ID team (300€) | `getPriceIdForPlan('team')` → `STRIPE_PRICE_TEAM` | ✅ Solo env |
| Price ID corporate (500€) | `getPriceIdForPlan('corporate')` → `STRIPE_PRICE_CORPORATE` | ✅ Solo env |
| Cupón referidos | `STRIPE_REFERRAL_COUPON` (fallback `REFERRAL50` si no existe) | ✅ Env con fallback no sensible |
| Crear sesión suscripción | `paymentService.createSubscriptionSession()` → todos los IDs vía `getPriceIdForPlan` | ✅ |
| Webhook Stripe | `env.STRIPE_SK`, `env.STRIPE_WEBHOOK_SECRET`; no usa el precio, solo éxito y metadatos | ✅ |
| Stripe Connect (vincular banco) | `env.STRIPE_SK`; `frontendBase` desde `env.FRONTEND_URL` | ✅ Corregido: FRONTEND_URL desde initEnv |

**Conclusión Stripe:** Toda la configuración sensible de Stripe sale de Secret Manager / variables de entorno. En producción, con Cloud Run mapeando secretos a env, los fallbacks del código no se usan.

---

## 2. Otros secretos

| Secreto | Origen | Estado |
|---------|--------|--------|
| JWT_SECRET | `initEnv()` → Secret Manager; fallback `fisiotool_master_key_2026` solo si no existe | ✅ En producción debe estar en Secret Manager |
| GOOGLE_AI_KEY / GOOGLE_AI_MODEL | `initEnv()` → Secret Manager | ✅ |
| ADMIN_FOUNDRY_KEY | `initEnv()` → Secret Manager | ✅ |
| EMAIL_USER_ANA, EMAIL_PASS_ANA, etc. | `initEnv()` → Secret Manager | ✅ |
| FRONTEND_URL | `initEnv()` → Secret Manager; fallback `https://www.fisiotool.com` solo si no existe | ✅ |
| CORS_ORIGINS | `initEnv()` → Secret Manager o env; si está vacío y hay FRONTEND_URL, CORS se restringe a ese origen (blindaje) | ✅ Ver SECURITY.md |
| ADMIN_EMAIL | `initEnv()` → Secret Manager o env; fallback `fisiotoolsaas@gmail.com` | ✅ Configurable desde Secret Manager |

---

## 3. Valores que no son secretos

- **FALLBACK_PRICE_IDS** en `paymentService.js`: solo se usan cuando no hay `STRIPE_PRICE_*` en env (p. ej. local). En Cloud Run con secretos configurados no se usan.
- **REFERRAL50**: ID de cupón de Stripe (público en Dashboard); fallback aceptable.
- **FREE_TRIAL_CAP**: límite de fisios para ofrecer 30 días gratis (env o Secret Manager); valor por defecto 50. No es secreto; configurable.
- **ADMIN_EMAIL** / **fisiotoolsaas@gmail.com**: email de contacto; ahora configurable por `ADMIN_EMAIL` en Secret Manager si se desea.

---

## 4. Cambio aplicado en esta auditoría

- **clinicController.js (Stripe Connect):** `frontendBase` ahora usa `env.FRONTEND_URL` (de initEnv) en lugar de solo `process.env.FRONTEND_URL`, para que en Cloud Run se use el valor inyectado desde Secret Manager de forma consistente.
- **env.js:** `ADMIN_EMAIL` es configurable vía `ADMIN_EMAIL` en Secret Manager o env; si no existe, se usa el valor por defecto.

---

## 5. Resumen

- **Stripe:** Clave, webhook secret y Price IDs (base, team, corporate) se leen siempre desde env/Secret Manager. El webhook no usa el precio; solo comprueba pago exitoso y metadatos.
- **Resto:** JWT, Google AI, Foundry, emails y FRONTEND_URL salen de `initEnv()` (Secret Manager / env). Con tu configuración en Google Cloud (secretos → variables de entorno en Cloud Run), no se usa ningún valor sensible hardcodeado en producción.
