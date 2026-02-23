# Configuración Stripe (FisioTool Pro – LLC USA)

Checklist para dejar Stripe operativo con la nueva cuenta y el webhook en Google Cloud.

---

## 1. Secret Manager (Google Cloud)

Configura estos secretos (o variables de entorno en Cloud Run):

| Secreto | Descripción | Ejemplo |
|--------|-------------|---------|
| `STRIPE_SECRET_KEY` | Clave secreta de la API (sk_live_... o sk_test_...) | sk_live_xxx |
| `STRIPE_WEBHOOK_SECRET` | Signing secret del webhook (whsec_...) | whsec_xxx |
| `STRIPE_PRICE_SOLO` o `STRIPE_PRICE_BASE` | Price ID plan base 100€ (uno u otro) | price_1T2U1u4vUWb0SJ7OVu9z00oM |
| `STRIPE_PRICE_TEAM` | Price ID plan team 300€ | price_1T2U4b4vUWb0SJ7OVbGEmZND |
| `STRIPE_PRICE_CORPORATE` | Price ID plan custom 500€ | price_1T2U5y4vUWb0SJ7OKMTpIn2t |
| `STRIPE_REFERRAL_COUPON` | ID del cupón de referidos (opcional) | REFERRAL50 |
| `FREE_TRIAL_CAP` | Número máximo de fisios para ofrecer 30 días gratis; a partir de (cap+1) solo referidos 50% o 100% (opcional) | 50 |
| `FRONTEND_URL` | URL del frontend (success/cancel) | https://www.fisiotool.com |

---

## 2. Dashboard de Stripe

### Productos y precios
- Crea (o usa) **tres productos** con precios recurrentes:
  - **Base/Solo**: 100 €/mes
  - **Team**: 300 €/mes
  - **Corporate/Custom**: 500 €/mes
- Copia los **Price ID** (price_xxx) y ponlos en Secret Manager como arriba. Así todo es configurable desde un solo lugar (Google Cloud) y no hay IDs fijos en el código. El webhook no necesita conocer el precio; solo comprueba que el pago fue exitoso y actualiza el plan desde los metadatos de la suscripción.

### Cupón de referidos
- **Productos → Cupones → Crear cupón**
- ID del cupón: p. ej. `REFERRAL50` (debe coincidir con `STRIPE_REFERRAL_COUPON`).
- Configura el descuento (%, cantidad fija, etc.) según tu lógica de referidos.

### Webhook
- **Developers → Webhooks → Añadir endpoint**
- **URL**: `https://TU_BACKEND/api/webhooks/stripe` (tu URL de Cloud Run o dominio del backend).
- **Eventos** a escuchar:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
- Guarda el **Signing secret** (whsec_...) y configúralo como `STRIPE_WEBHOOK_SECRET`.

---

## 3. Comportamiento del código

- **Registro**: Tras aceptar términos, el usuario va directo a Checkout. Si el total de clínicas inscritas es ≤ `FREE_TRIAL_CAP` (por defecto 50), la suscripción incluye trial 30 días; si no, no hay trial (solo referidos 50% o 100%). Si tu cuenta tiene **Stripe Tax** habilitado, se usa IVA automático y recogida de dirección fiscal; si no, se crea la sesión sin IVA automático (sin fallar).
- **Referidos**: Si el usuario viene por referido (código en registro) y el referente tiene `stripe_customer_id`, en plan Solo se aplica el cupón al nuevo y en `invoice.paid` se aplica cupón a la suscripción del referente.
- **Vincular banco**: `POST /api/dashboard/stripe-connect` (cuenta Express, onboarding).
- **Cobro cita/bono**: `POST /api/dashboard/cobrar-cita-bono` con body `{ "amount": 50, "concepto": "Sesión 30min" }` (amount en euros). Genera un enlace de pago que transfiere el importe a la cuenta Connect de la clínica (comisión 0).
- **Subir de plan (100€ → 300€) con prorrateo**: Si la clínica ya tiene suscripción activa (`stripe_subscription_id`), al llamar a `POST /api/dashboard/upgrade-plan` con `{ "plan": "team" }` se actualiza la suscripción con **prorrateo**: Stripe calcula el crédito por los días no usados del plan actual y cobra solo la parte proporcional del plan nuevo (ej.: a mitad de mes pagas ~100€ de ajuste, no 300€ enteros). Se genera una factura con ese importe y se devuelve la URL de pago; al pagar, el webhook `customer.subscription.updated` actualiza el plan en Firestore.

### Límite de trial (FREE_TRIAL_CAP) — lógica preventiva

El límite se aplica **antes** de crear la sesión de Checkout, no en el webhook:

1. Al registrar una clínica nueva o al abrir Checkout sin suscripción previa, el backend cuenta las clínicas en Firestore y lee `FREE_TRIAL_CAP` (env o Secret Manager).
2. Si `total_clínicas ≤ FREE_TRIAL_CAP` → la sesión de Stripe se crea **con** `trial_period_days: 30`.
3. Si `total_clínicas > FREE_TRIAL_CAP` → la sesión se crea **sin** trial; el usuario paga desde el primer mes (o 50% si viene por referido).

No hace falta escuchar `customer.subscription.created` en el webhook ni cancelar suscripciones: Stripe nunca recibe una suscripción con trial si ya se superó el límite. La base de datos usada para el conteo es la colección `clinicas` en Firestore (no hay contador aparte).

---

## 4. Verificación rápida

1. Crear cuenta de prueba en el setup → debe redirigir a Stripe Checkout.
2. Completar un pago de prueba → en el dashboard debe verse suscripción activa y en Firestore `subscription_active: true` para esa clínica.
3. En Stripe → Webhooks → ver que los eventos llegan y responden 200.
