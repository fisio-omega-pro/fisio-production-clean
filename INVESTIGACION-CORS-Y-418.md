# Investigación: CORS + React #418 en registro (www.fisiotool.com)

## Resumen

Se han identificado las causas probables y una corrección estructural en el backend. No se ha cambiado el frontend hasta confirmar el despliegue.

---

## 1. Error CORS: "No 'Access-Control-Allow-Origin' header"

### Qué está pasando

El navegador envía una petición **OPTIONS** (preflight) a  
`https://fisio-backend-omega-740657183492.europe-west1.run.app/api/register`  
y la respuesta **no incluye** `Access-Control-Allow-Origin`, por eso el navegador bloquea el POST y ves "blocked by CORS policy".

### Causas posibles (en orden de probabilidad)

#### A) El servidor no llega a escuchar (la más probable)

En `backend/server.js` el flujo es:

1. Se registra el middleware CORS para OPTIONS (líneas 30-44).
2. Se llama a `initialize()`, que hace **`await initEnv()`**.
3. `initEnv()` usa **Secret Manager** (y env). Si falla o tarda mucho, `initialize()` no sigue.
4. **`app.listen()`** está **dentro** de `initialize()`, al final (línea 224).
5. Si `initEnv()` falla o no termina, **nunca se ejecuta `app.listen()`**.

Conclusión: si hay error o demora en Secret Manager / Firebase al arrancar, el contenedor **nunca pone el servidor a escuchar**. Cloud Run puede devolver 502/503 o timeout; esas respuestas no llevan cabeceras CORS, por eso el navegador dice que falta `Access-Control-Allow-Origin`.

**Comprobación:** En Cloud Run → tu servicio → **Registros (Logs)**. Busca:

- `"FALLO AL INICIAR"` o mensajes de error al arrancar.
- Errores de Firebase, Secret Manager o `initEnv`.

Si aparecen, el arranque está fallando y CORS nunca llega a responder.

#### B) La imagen desplegada no lleva el código nuevo

- El **Cloud Build** (`cloudbuild.yaml`) construye con `docker build ... .` desde la **raíz del repo** y usa el **Dockerfile** que hace `COPY backend ./backend`.
- La imagen se etiqueta con `$COMMIT_SHA`. Si el deploy usa una imagen antigua (otra etiqueta, otro branch, caché), esa imagen puede **no tener** el middleware CORS en la parte alta de `server.js`.
- Si la revisión activa en Cloud Run es de un build anterior a los cambios de CORS, OPTIONS no recibirá las cabeceras.

**Comprobación:**

- En Cloud Run → **Revisiones**: revisión activa y fecha.
- En **Cloud Build → Historial**: último build y commit que usó.
- Confirmar que ese commit incluye el bloque CORS al inicio de `server.js` (justo después de `isOriginAllowed`).

#### C) Cold start y OPTIONS

Si la instancia está en 0 y tarda en arrancar, la primera petición (OPTIONS) puede recibir **503 o timeout** antes de que el contenedor responda. Esas respuestas no llevan CORS.  
**Comprobación:** Poner **mínimo 1 instancia** (o probar dos veces seguidas); si la segunda vez funciona, el problema es cold start.

#### D) Autenticación en Cloud Run

Si el servicio tuviera **"Requerir autenticación"**, OPTIONS podría recibir **403** antes de llegar al contenedor (sin cabeceras CORS). Tu `cloudbuild.yaml` usa `--allow-unauthenticated`, así que esto solo aplica si en la consola se cambió después a "Requerir autenticación".

---

## 2. Error React #418 (hidratación)

El #418 es **"Text content does not match server-rendered HTML"**: algo que se pinta en el servidor no coincide con lo que React pinta en el cliente.

### Dónde puede estar

- **Layout raíz** (`app/layout.tsx`):  
  - `<script dangerouslySetInnerHTML={{ __html: (registerServiceWorker.toString())() }} />`  
  - Si la serialización de la función cambia entre build de servidor y cliente, podría haber diferencia (menos habitual).
  - **CookieBanner** y **GoogleAnalytics** son client components que devuelven `null` hasta después de `useEffect`; en principio no deberían provocar #418 por texto.
- **Página `/setup`**:  
  - Ahora se usa `dynamic(OnboardingEpic, { ssr: false })`, así que el formulario **no** se renderiza en el servidor.  
  - Si en producción Vercel sigue sirviendo un **bundle antiguo** (sin `dynamic`/sin `ssr: false`), el servidor podría seguir renderizando el formulario y entonces sí podría haber desajuste (por ejemplo por `window`, `localStorage` o query params).
- **Hash del chunk** (`4bd1b696-096d35a2bd1da3af.js`):  
  - Es el bundle minificado de Next; el hash cambia en cada build. Si el error sigue apareciendo con el mismo hash después de un deploy, el deploy no está sirviendo el código nuevo.

Conclusión: lo más coherente con un #418 que persiste es que **en producción** (www.fisiotool.com) **sigue activo un build anterior** (sin `dynamic`/sin `ssr: false` en `/setup` o con otra diferencia de render servidor/cliente).

**Comprobación en Vercel:**

- Último deploy de la rama que sirve www.fisiotool.com.
- Que ese deploy incluya los cambios de `app/setup/page.tsx` (dynamic + OnboardingEpic con `ssr: false`).

---

## 3. Cambio recomendado en el backend (ya aplicado en el código)

Para que **OPTIONS siempre tenga cabeceras CORS** aunque `initEnv()` falle o tarde:

1. **Dejar el middleware CORS para OPTIONS** al principio de `server.js` (como ahora).
2. **Llamar a `app.listen()` justo después** de ese middleware, **sin esperar** a `initialize()`.
3. **En el callback de `listen()`**, llamar a `initialize({ listen: false })` para que añada el resto de rutas y middleware pero **no** vuelva a llamar a `app.listen()`.

Así el servidor empieza a escuchar en cuanto arranca el proceso y las OPTIONS son respondidas por nuestro middleware CORS aunque Secret Manager o Firebase fallen más tarde.

**Cambio aplicado en `backend/server.js`:** al final del archivo se llama a `app.listen(PORT, ...)` **antes** de `initialize()`. Dentro del callback de `listen()` se ejecuta `initialize({ listen: false })` para cargar rutas y el resto del middleware sin volver a abrir el puerto. Así OPTIONS siempre es respondido por el middleware CORS registrado al inicio.

---

## 4. Checklist para ti

1. **Backend**
   - [ ] Desplegar la versión que incluye **listen antes de initEnv** (y el CORS al inicio).
   - [ ] Revisar **logs de Cloud Run** al arrancar; comprobar si hay "FALLO AL INICIAR" o errores de Secret Manager/Firebase.
   - [ ] Comprobar que el servicio está **"Permitir tráfico no autenticado"** (o equivalente).
   - [ ] (Opcional) Poner **mínimo 1 instancia** para evitar cold start en la primera petición.

2. **Frontend**
   - [ ] Confirmar en Vercel que el **último deploy** es el que tiene `dynamic(..., { ssr: false })` en `/setup`.
   - [ ] Hacer un deploy limpio si hace falta (redeploy desde la rama correcta) para descartar caché o build viejo.

3. **Prueba**
   - Abrir https://www.fisiotool.com/setup (mejor en ventana de incógnito o sin caché).
   - En DevTools → **Red**: lanzar el registro y comprobar la petición **OPTIONS** a `.../api/register`: debe ser **204** y llevar `Access-Control-Allow-Origin: https://www.fisiotool.com`.
   - Si OPTIONS ya responde bien y el #418 sigue, el siguiente paso es aislar el nodo que falla (por ejemplo con build de desarrollo o temporalmente `suppressHydrationWarning` en el layout).

---

## 5. Referencias

- [Cloud Run: CORS preflight / authentication](https://issuetracker.google.com/issues/361387319)
- [React 418 - Hydration text mismatch](https://react.dev/errors/418)
- `backend/server.js`: líneas 29-44 (CORS OPTIONS), 236-239 (arranque).
- `cloudbuild.yaml`: build y deploy de la imagen.
- `Dockerfile`: contexto de build y `COPY backend`.
