# La landing no cambia: Vercel está construyendo la carpeta equivocada

El código nuevo (vídeo 2º, sin testimonios) **sí está en el repo**, pero **Vercel está construyendo desde la raíz del repositorio**, donde no está la app Next.js. La app Next.js está dentro de la carpeta **`public-next`**.

---

## Qué hacer en Vercel (2 minutos)

1. Entra en **https://vercel.com** e inicia sesión.
2. Abre el **proyecto** que tiene el dominio www.fisiotool.com (o el que corresponda).
3. Ve a **Settings** (Configuración) del proyecto.
4. En el menú izquierdo, **General**.
5. Baja hasta **Root Directory**.
6. Ahí verás un campo. Si está **vacío** o pone otra cosa, **cámbialo a exactamente:**
   ```text
   public-next
   ```
7. Pulsa **Save**.
8. Ve a la pestaña **Deployments**, abre el menú (tres puntos) del último deployment y elige **Redeploy** (o **Redeploy** en el botón que salga). Acepta y espera a que termine el build.
9. Cuando el deployment esté en **Ready**, abre www.fisiotool.com en una ventana de incógnito (o borra caché) y comprueba: justo debajo del Hero debe estar el **vídeo de presentación** y **no** la sección de testimonios.

---

## Resumen

| Dónde | Qué poner |
|-------|-----------|
| Vercel → Proyecto → Settings → General → **Root Directory** | `public-next` |
| Luego | **Deployments** → **Redeploy** |

Sin **Root Directory = public-next**, Vercel no construye la app donde están los cambios y la landing se queda igual.
