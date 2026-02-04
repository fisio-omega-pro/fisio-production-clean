# RUNBOOK — Operación & Deploy (FisioTool Pro)

Este documento es un **manual operativo** para mantener el sistema estable y resolver incidentes rápido. Complementa `/.cursorrules`.

---

## 0) Mapa rápido (qué corre dónde)

- **Frontend (estático)**: Vercel (proyecto Next.js con `output: 'export'`).
  - Código: `public-next/`
  - API: siempre vía `API_BASE_URL` (`public-next/src/lib/apiBase.ts`).
- **Backend**: Cloud Run (servicio `fisio-backend-omega`, región `europe-west1`).
  - Código: `backend/`
- **DB**: Firestore.
- **Secrets**: Secret Manager (inyectados en Cloud Run como env vars).

---

## 1) Checklist post-deploy (siempre hacer)

### Backend (Cloud Run)

1. **Health**
   - `GET /diagnostics/health` → debe devolver **200** y JSON con `status: "online"`.
2. **Login básico**
   - `POST /api/login` con credenciales inválidas → **401 JSON** (no HTML).
3. **Rutas críticas**
   - Dashboard: `GET /api/dashboard/data` (con token) → **200 JSON**.
   - Foundry: `GET /api/admin/stats-globales` (con `x-foundry-key`) → **200 JSON**.

### Frontend (Vercel)

1. Comprobar que carga la landing correcta.
2. Comprobar login/dashboard.
3. Comprobar `/access` (modo audible) y que redirige a `/setup?is_blind=1`.

---

## 2) Deploy backend (Cloud Run)

### Opción A: script local (recomendado)

Desde la raíz del repo:

```bash
./deploy-cloud-run.sh
```

### Opción B: consola Cloud Run

- Cloud Run → `fisio-backend-omega` → **Deploy new revision**

**Nota**: si has añadido endpoints nuevos y ves **404** en producción, casi seguro estás sirviendo una **revisión antigua** → redeploy.

---

## 3) Deploy frontend (Vercel)

- Vercel despliega desde GitHub (push a `master`).

### Regla de oro para Next export

- No usar `fetch('/api/...')` relativo.
- Usar `API_BASE_URL` (`public-next/src/lib/apiBase.ts`).

---

## 4) Incidentes comunes (y solución rápida)

### Incidente A: Cloud Run devuelve HTML 500 en todo (incluido `/diagnostics/health`)

**Síntoma**
- Respuesta HTML tipo “500 Server Error” incluso en `/diagnostics/health`.

**Causa típica**
- Un secret inyectado como env var está en estado **DISABLED** o Cloud Run no puede leerlo.
- Cloud Run **aborta el arranque**: “Instance startup aborted … secret … DISABLED”.

**Solución**
1. Secret Manager: habilitar versión o crear nueva versión **ENABLED**.
2. Cloud Run: idealmente **no usar `latest`** en producción para secretos críticos; fijar una versión concreta.
3. Deploy new revision.

---

### Incidente B: 404 en un endpoint que “acabas de crear”

**Causa**
- Backend en producción aún no tiene el commit (revisión antigua).

**Solución**
- Redeploy Cloud Run.

---

### Incidente C: Foundry “ACCESO DENEGADO”

**Checklist**
1. Estás usando `x-foundry-key` en requests.
2. `ADMIN_FOUNDRY_KEY` existe y está habilitado.
3. Si has rotado clave, recuerda que puede ser `NUEVA,ANTIGUA` durante transición.

---

### Incidente D: Stripe “Invalid API Key provided” / “secret key must start with sk_”

**Causa**
- Key inválida o se está usando `pk_` en vez de `sk_`.

**Solución**
1. Secret Manager / Cloud Run: configurar `STRIPE_SK` o `STRIPE_SECRET_KEY` con **`sk_test_...`** o **`sk_live_...`**.
2. Redeploy Cloud Run.

---

## 5) Rotación de clave Foundry (sin downtime)

El backend acepta múltiples claves en `ADMIN_FOUNDRY_KEY` separadas por coma:

Ejemplo:

```
NUEVA_CLAVE,CLAVE_ANTIGUA
```

**Procedimiento**
1. Secret Manager: crear nueva versión con `NUEVA,ANTIGUA`.
2. Redeploy Cloud Run.
3. Verificar que Foundry entra con **NUEVA**.
4. Secret Manager: nueva versión con solo `NUEVA`.
5. Redeploy Cloud Run.

**Importante**
- `/diagnostics/env` solo acepta claves reales (no emergencia).

### Recomendación crítica (resiliencia): no usar `latest` en secretos de Foundry

Para evitar caídas por error humano (deshabilitar la versión “latest”), **pinea** la versión del secreto en Cloud Run:

- **Cloud Run** → `fisio-backend-omega` → **Edit & deploy new revision**
- Sección **Variables & Secrets**
- En `ADMIN_FOUNDRY_KEY`:
  - En vez de `versions/latest`, selecciona una **versión concreta ENABLED** (por ejemplo `versions/7`)
- Deploy.

Si rotas la clave:
- Crea una nueva versión (p. ej. v8) con `NUEVA,ANTIGUA`, pinea v8 y despliega.
- Cuando confirmes, crea v9 solo con `NUEVA`, pinea v9 y despliega.

---

## 6) Stripe — procedimiento cuando la cuenta LLC esté lista

### Variables/Secrets requeridos

- `STRIPE_SK` (o `STRIPE_SECRET_KEY`) → debe empezar por `sk_`
- `STRIPE_WEBHOOK_SECRET`

### Flujo a validar

1. `POST /api/dashboard/upgrade-plan` → devuelve URL real de checkout.
2. Completar checkout.
3. Webhook `checkout.session.completed` → Firestore:
   - `clinicas/{clinicId}.subscription_active = true`
4. Stripe Connect:
   - `POST /api/dashboard/stripe-connect` → URL onboarding
   - `POST /api/dashboard/stripe-verify` → `stripe_status=active`

---

## 7) Email / Ana (operación)

### Cron / lectura de emails

- El backend tiene cron (interval) para revisar inbox (según configuración).
- Endpoint manual (Foundry):
  - `POST /api/admin/trigger-email-check` (requiere `x-foundry-key`)

### Corporate leads

- Endpoint público:
  - `POST /api/public/corporate-lead`
- Reglas:
  - No se responde automáticamente al lead.
  - Se envía resumen + preguntas + borrador al admin.

---

## 8) Storage / Logos (pendiente)

Hay un servicio preparado:

- `backend/services/storageService.js` genera signed URLs a un bucket GCS.

Pendiente de implementar el flujo completo:
- Endpoint para pedir `uploadUrl/publicUrl`
- Subida directa del navegador a GCS
- Guardar `publicUrl` en `clinicas.logo_url`

---

## 9) PWA (Instalación)

Para soportar instalación real en navegadores:
- Implementar listener global `beforeinstallprompt` y guardar en `window.deferredPrompt`.

---

## 10) Comandos de comprobación rápidos (manual)

Reemplaza `BASE` por la URL real de Cloud Run:

```bash
BASE="https://fisio-backend-omega-740657183492.europe-west1.run.app"
curl -sS "$BASE/diagnostics/health"
```

---

## 11) Política de cambios (para mantener “verde”)

- Si una UI muestra un CTA/botón, debe existir backend y persistencia real; si no, se marca como “próximamente” o se desactiva.
- Evitar dependencias de red en build de frontend (ej. fuentes remotas).
- No deshabilitar versiones de secretos en uso en prod si Cloud Run apunta a `latest`.

