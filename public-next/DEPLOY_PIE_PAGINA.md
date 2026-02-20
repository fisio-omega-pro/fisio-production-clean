# Pie de página y rutas legales – Build y despliegue

## Qué está pasando en www.fisiotool.com

- **Falta “Devoluciones” en el footer** y **404 en /aviso-legal**: El código y el build local están bien (existen `out/aviso-legal/index.html` y `out/devolucion/index.html`). El fallo suele ser que **Vercel no está sirviendo la carpeta `out`** porque con el preset **“Next.js”** Vercel despliega como app Next.js (serverless) y puede ignorar el `outputDirectory: "out"`.

## Solución en Vercel (obligatoria)

Para que se use la exportación estática (`out/`) y se vean Aviso Legal y Devoluciones:

1. Entra en **Vercel** → tu proyecto → **Settings** → **General**.
2. En **Framework Preset** cambia de **Next.js** a **Other**.
3. Deja (o ajusta):
   - **Root Directory:** `public-next`
   - **Build Command:** `npm run build`
   - **Output Directory:** `out`
4. Guarda y ve a **Deployments** → los tres puntos del último deployment → **Redeploy** (opción “Redeploy with existing Build Cache” desmarcada si quieres build limpio).
5. Cuando termine, prueba:
   - `https://www.fisiotool.com/aviso-legal/` y `https://www.fisiotool.com/devolucion/`
   - Que en el pie aparezca “Devoluciones y reembolsos”.
   - Recarga forzada (Ctrl+F5) o ventana privada por si hay caché.

En el repo, `vercel.json` ya tiene `outputDirectory: "out"` y **rewrites** para que `/aviso-legal` y `/devolucion` (sin barra) lleven a la versión con barra. Eso solo se aplica si Vercel usa realmente la salida estática; por eso el cambio de Framework Preset a **Other** es necesario.

## Qué hay en código

- Footer: Aviso Legal, Términos, Privacidad, **Devoluciones y reembolsos**, RGPD, Cookies, Métodos de pago.
- `next.config.ts`: `output: 'export'`, `trailingSlash: true`.
- Páginas en `src/app/`: `aviso-legal`, `devolucion`, `terminos`, etc.
- Build: `npm run build` → carpeta **`out/`** con todo el sitio estático.
