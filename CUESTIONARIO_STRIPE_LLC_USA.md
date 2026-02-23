# Cuestionario Stripe LLC USA – FisioTool Pro

**Objetivo:** Que la persona que configuró la nueva cuenta de Stripe responda punto por punto. Con esto verificamos que todo está alineado con el código y que no habrá sorpresas en producción.

---

## 1. Claves y acceso

1. **¿Tienes la Secret Key de la cuenta (empieza por `sk_live_...` en producción o `sk_test_...` en pruebas)?**  
   - ¿Está ya guardada en Google Cloud Secret Manager como `STRIPE_SECRET_KEY` o `STRIPE_SK`?

2. **¿La clave que usamos es de modo TEST o de modo LIVE?**  
   - (En producción debería ser LIVE; en desarrollo podemos usar TEST.)

---

## 2. Productos y precios (suscripción mensual)

El código espera **tres precios recurrentes** (suscripción mensual). Cada uno tiene un **Price ID** que empieza por `price_...`.

3. **Plan Base / Solo (100 €/mes)**  
   - ¿Existe un producto con precio recurrente mensual de 100 €?  
   - ¿Cuál es el **Price ID** exacto? (ej: `price_1T2U1u4vUWb0SJ7OVu9z00oM`)

4. **Plan Team (300 €/mes)**  
   - ¿Existe un producto con precio recurrente mensual de 300 €?  
   - ¿Cuál es el **Price ID** exacto?

5. **Plan Corporate / Custom (500 €/mes)**  
   - ¿Existe un producto con precio recurrente mensual de 500 €?  
   - ¿Cuál es el **Price ID** exacto?

6. **Moneda:** ¿Esos precios están en **EUR (euros)**?

---

## 3. IVA / impuestos (Stripe Tax)

7. **¿Tienes activado “Stripe Tax” en la cuenta?**  
   - (Dashboard → Settings → Tax, o similar.)  
   - Si **no** está activado, el código ya tiene fallback y creará la sesión sin IVA automático (no fallará).

8. Si Stripe Tax **sí** está activado: **¿La cuenta está configurada para recoger IVA en la UE / España** según tu caso (registro, obligaciones, etc.)?

---

## 4. Cupón de referidos

9. **¿Existe un cupón creado en Stripe para el programa de referidos?**  
   - (Dashboard → Productos → Cupones.)

10. **¿Cuál es el ID exacto del cupón?**  
    - (Ej: `REFERRAL50`. Debe coincidir con lo que pondremos en Secret Manager como `STRIPE_REFERRAL_COUPON`.)

11. **¿Qué tipo de descuento tiene?** (porcentaje, cantidad fija, etc.)  
    - (Solo para documentar; el código solo necesita el ID del cupón.)

---

## 5. Webhook

12. **¿Está creado el endpoint de webhook en Stripe?**  
    - URL que debe tener: `https://[TU-DOMINIO-BACKEND]/api/webhooks/stripe`  
    - (Sustituir por la URL real de tu backend en Cloud Run o tu dominio.)

13. **¿Qué “Signing secret” tiene ese endpoint?**  
    - (Empieza por `whsec_...`.)  
    - ¿Está guardado en Secret Manager como `STRIPE_WEBHOOK_SECRET`?

14. **¿Qué eventos están seleccionados para ese webhook?**  
    - El código necesita al menos:  
      - `checkout.session.completed`  
      - `customer.subscription.updated`  
      - `customer.subscription.deleted`  
      - `invoice.paid`  
    - ¿Están todos marcados?

---

## 6. Stripe Connect (vincular banco del profesional / cobro cita o bono)

15. **¿Stripe Connect está habilitado en la cuenta?**  
    - (Dashboard → Connect → Settings o similar.)

16. **¿Qué tipo de cuenta Connect usáis?**  
    - El código usa cuentas **Express** (el fisio vincula su banco y recibe pagos).  
    - ¿Es Express o Standard?

17. **¿Los pagos “cobro cita / bono” (pago único al profesional) van a usar esa misma cuenta Connect?**  
    - (Sí/No. Si es sí, el flujo actual del código es compatible.)

---

## 7. URLs del frontend (éxito y cancelación)

18. **¿Cuál es la URL base del frontend en producción?**  
    - (Ej: `https://www.fisiotool.com` sin barra final.)  
    - Debe estar en Secret Manager como `FRONTEND_URL`.  
    - El código redirige a:  
      - Éxito pago suscripción: `[FRONTEND_URL]/dashboard?session_id=...`  
      - Cancelación: `[FRONTEND_URL]/setup?error=payment_cancelled`  
      - Éxito pago cita/bono: `[FRONTEND_URL]/dashboard?pago=ok`  
      - Cancelación pago cita/bono: `[FRONTEND_URL]/dashboard?pago=cancelado`

19. **¿Esa URL es la correcta para tu entorno (producción/preview)?**

---

## 8. Secret Manager (Google Cloud)

20. **Confirma que en el proyecto de Google Cloud (Secret Manager) existen y están rellenados estos secretos:**  
    - `STRIPE_SECRET_KEY` (o `STRIPE_SK`)  
    - `STRIPE_WEBHOOK_SECRET`  
    - `STRIPE_PRICE_SOLO` (Price ID del plan 100 €)  
    - `STRIPE_PRICE_TEAM` (Price ID del plan 300 €)  
    - `STRIPE_PRICE_CORPORATE` (Price ID del plan 500 €)  
    - `STRIPE_REFERRAL_COUPON` (ID del cupón de referidos, ej: REFERRAL50)  
    - `FRONTEND_URL` (URL base del frontend)  

    ¿Alguno falta o tiene otro nombre? (Si es así, indícalo.)

---

## 9. Prueba rápida (opcional pero recomendado)

21. **¿Has hecho al menos una prueba de punta a punta?**  
    - Crear cuenta en el setup → aceptar términos → ir a Stripe Checkout → completar pago de prueba (tarjeta 4242... en modo test).  
    - ¿Llega el usuario a la pasarela? ¿Tras pagar, vuelve al dashboard y se ve la suscripción activa?

22. **¿Has comprobado en Stripe → Webhooks que los eventos llegan y devuelven 200?**  
    - (Sin errores de firma ni 4xx/5xx.)

---

## Cómo usar este cuestionario

- La persona que configuró Stripe **responde cada número** (aunque sea “Sí”, “No”, “No aplica” o el valor exacto).
- Con las respuestas se puede:
  - Comprobar que los Price IDs y el cupón coinciden con lo que usa el código (o actualizar env/código).
  - Verificar webhook, Connect y URLs.
  - Confirmar que Secret Manager está completo y que la prueba de registro + pago funciona.

Si quieres, después de que te respondan puedes pegar aquí las respuestas (sin la clave secreta ni el signing secret completos) y te indico punto por punto si hay que cambiar algo en código o en Stripe.
