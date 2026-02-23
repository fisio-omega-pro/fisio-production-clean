# Verificación respuestas Stripe LLC USA

Resumen de la revisión de las respuestas del cuestionario frente al código actual.

---

## ✅ Lo que está correcto (no tocar)

| Área | Estado |
|------|--------|
| **Clave y webhook secret** | STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en Secret Manager ✓ |
| **Price IDs** | Los tres coinciden con el código (base, team, corporate) ✓ |
| **Cupón referidos** | REFERRAL50, 50%, una vez ✓ (código usa STRIPE_REFERRAL_COUPON, por defecto REFERRAL50) |
| **Connect** | Plataforma, cuentas Express, comisión 0 ✓ |
| **Stripe Tax** | Activado + registro UE/OSS ✓ (el código usa automatic_tax con fallback si fallara) |
| **Precios “Impuestos excluidos”** | Compatible con Stripe Tax (Stripe calcula IVA en checkout) ✓ |

---

## 🔴 Ajustes obligatorios en Stripe Dashboard

### 1. URL del webhook (crítico)

**Configuración actual (incorrecta):**  
`https://fisio-backend-omega-740657183492.europe-west1.run.app/webhook`

**URL que debe tener el endpoint en Stripe:**  
`https://fisio-backend-omega-740657183492.europe-west1.run.app/api/webhooks/stripe`

El backend solo atiende el webhook en la ruta **`/api/webhooks/stripe`**. Con `/webhook` Stripe no llega al handler y los eventos no se procesan (no se activan suscripciones ni referidos).

**Qué hacer:** En Stripe → Developers → Webhooks → tu endpoint → **Actualizar la URL** a la de arriba. Si creas un endpoint nuevo, usa esa URL y el mismo Signing secret (o copia el nuevo a Secret Manager como STRIPE_WEBHOOK_SECRET).

---

### 2. Eventos del webhook (crítico)

**Configuración actual:**  
Solo indicado: `invoice.paid` y `customer.subscription.created`.

**Eventos que el código usa y que deben estar suscritos:**

| Evento | Uso en el código |
|--------|-------------------|
| **checkout.session.completed** | Al completar el pago en Checkout: se marca la clínica como suscrita y se guardan `stripe_customer_id` y `stripe_subscription_id`. **Sin este evento, tras pagar no se activa la suscripción en la app.** |
| **invoice.paid** | Aplicar cupón de referidos al referente cuando un referido paga. |
| **customer.subscription.updated** | Reflejar cambios de estado (p. ej. de trialing a active, cancelación programada). |
| **customer.subscription.deleted** | Marcar la clínica como no suscrita cuando se cancela. |

**Qué hacer:** En el mismo endpoint de webhook en Stripe, en “Eventos para enviar”, añadir al menos:

- **checkout.session.completed**
- **customer.subscription.updated**
- **customer.subscription.deleted**

(Mantener **invoice.paid** y, si quieres, **customer.subscription.created**; el código no depende de `.created` pero no molesta.)

---

## Resumen de acciones

1. **Stripe Dashboard → Webhooks:**  
   - Cambiar la URL del endpoint a:  
     `https://fisio-backend-omega-740657183492.europe-west1.run.app/api/webhooks/stripe`
2. **Mismo endpoint → Eventos:**  
   - Incluir: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted` (y opcionalmente `customer.subscription.created`).
3. **Secret Manager:**  
   - No hace falta cambiar nada si STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, Price IDs y STRIPE_REFERRAL_COUPON están ya como en el cuestionario.

Con la URL y los eventos corregidos, la configuración Stripe LLC USA queda alineada al 100% con el código y puede usarse en desarrollo/producción sin errores de conectividad o eventos faltantes.
