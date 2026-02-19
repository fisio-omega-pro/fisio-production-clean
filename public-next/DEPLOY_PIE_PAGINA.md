# Pie de página y rutas legales – Build y despliegue

## Qué está pasando ahora en www.fisiotool.com

- **Falta “Devoluciones” en el footer:** Si en la web solo ves Privacidad Pro, Términos, RGPD, Cookies y Aviso Legal, estás viendo una **versión antigua**. En el código ya está “Devoluciones y reembolsos”; hace falta **volver a desplegar**.
- **404 en /aviso-legal:** La ruta existe en el código. El 404 suele ser porque no se ha desplegado la carpeta **`out/`** completa o el host no sirve bien las rutas. Se ha puesto **`trailingSlash: true`** en `next.config.ts` para generar `/aviso-legal/` y que el host sirva bien.

## Por qué no se ven los enlaces hasta que despliegas

El frontend (Next.js) usa **exportación estática** (`output: 'export'`). Las rutas `/aviso-legal`, `/devolucion`, etc. se generan al hacer **build**. Si no has vuelto a construir y desplegar después de los cambios, seguirás viendo la versión antigua (o 404) en la URL publicada.

## Qué se ha hecho en código

- **Solo existe la ruta `/aviso-legal`** (se eliminó la carpeta duplicada "aviso legal" con espacio).
- El footer enlaza a: `/aviso-legal`, `/terminos`, `/privacidad`, **`/devolucion`** (Devoluciones y reembolsos), `/rgpd`, `/cookies`, `/pagos`.
- Todas esas carpetas tienen `page.tsx` en `src/app/`.

## Pasos para que funcionen en producción

1. **Build del frontend**
   ```bash
   cd public-next
   npm run build
   ```
   Se generará la carpeta **`out/`** con el sitio estático (incluye `aviso-legal/index.html`, `devolucion/index.html`, etc.).

2. **Despliegue**
   - Sube el contenido de **`out/`** al sitio donde sirves el front (Vercel, Firebase Hosting, Cloud Storage + Load Balancer, etc.).
   - No hace falta “Vertex” (Vertex AI es para ML). Si te refieres a **Vercel**, allí se despliega con `vercel` o con Git. Si usas **Google Cloud**, suele ser Firebase Hosting o Cloud Run (para el backend; el front puede ser estático en un bucket).

3. **Comprobar**
   - Tras el deploy, las URLs serán con barra final: `https://www.fisiotool.com/aviso-legal/` y `https://www.fisiotool.com/devolucion/`.
   - El pie debe mostrar “Devoluciones y reembolsos” y llevarte a la página de reembolsos.
   - Haz una recarga forzada (Ctrl+F5) o prueba en ventana privada para no ver caché antigua.

Si sigues teniendo 404, confirma que en el build existan **`out/aviso-legal/index.html`** y **`out/devolucion/index.html`** y que el hosting sirve toda la carpeta **`out/`** (no solo el `index.html` de la raíz).
