# Por qué no ves los cambios en la web (PC y móviles)

## Resumen en una frase

**Los cambios del vídeo de presentación y la eliminación de testimonios solo están en tu PC. No se han subido al repositorio Git que usa Vercel (y Cloud Run), así que cada despliegue sigue usando el código antiguo.**

---

## 1. Qué está pasando

- **En tu ordenador (Cursor):**  
  - `public-next/src/app/page.tsx` tiene el bloque **VideoPresentacion** como 2º y **no** usa TestimonialsGallery.  
  - Existe `public-next/src/components/landing/VideoPresentacion.tsx` (vídeo YouTube `sRyEgLpWQjA`).  
  - `TestimonialsGallery.tsx` está borrado.

- **En el repositorio remoto (origin/master, lo que usa Vercel/Cloud Build):**  
  - Sigue el **código antiguo**: `page.tsx` con TestimonialsGallery, el archivo TestimonialsGallery.tsx existe, y no existe VideoPresentacion.tsx.

Cuando Vercel (o Cloud Build) hace deploy, **clona el repo remoto** y construye desde ahí. Como ahí no están tus cambios, la web que ves en PC y móviles es la versión antigua.

---

## 2. Cloud Run vs Vercel

- **Cloud Run**  
  - El `Dockerfile` solo copia el **backend** (`backend/`) y ejecuta `node backend/server.js`.  
  - En la ruta `/` el backend solo responde `"FISIOTOOL PRO ONLINE"`.  
  - **Cloud Run no sirve la landing de Next.js** (Hero, vídeo, testimonios, etc.).  
  - La “web” que ves con la landing completa **no** viene de Cloud Run.

- **Vercel**  
  - Es quien sirve la **landing** (Next.js).  
  - Para que sea la app de `public-next`, en Vercel el **Root Directory** debe ser **`public-next`**.  
  - Aun así, Vercel construye a partir del **código que está en Git**. Si ese código no incluye tus cambios, seguirás viendo la versión antigua.

Por tanto: aunque hagas “repo” (deploy) en Cloud Run y en Vercel, si el código desplegado es el del remoto **sin** tus cambios, la web se ve igual.

---

## 3. Qué hacer para que se vean los cambios

Tienes que **incluir tus cambios en Git y subirlos al remoto**, y luego **volver a desplegar** en Vercel (y, si aplica, en Cloud Run).

### Paso 1: Subir los cambios al repo (Git)

Desde la raíz del proyecto (`fisiotoolsaas`):

```bash
cd /Users/augustogalvanmartin/Downloads/fisiotoolsaas

# Añadir los archivos de la landing
git add public-next/src/app/page.tsx
git add public-next/src/components/landing/VideoPresentacion.tsx
git rm public-next/src/components/landing/TestimonialsGallery.tsx

# Commit
git commit -m "landing: bloque 2 vídeo presentación (YouTube sRyEgLpWQjA), quitar testimonios"

# Subir al remoto (GitHub/GitLab/Bitbucket)
git push origin master
```

(Si tu rama principal se llama `main`, cambia `master` por `main` en el último comando.)

### Paso 2: Volver a desplegar en Vercel

- Si Vercel está conectado al repo, suele hacer **deploy automático** al hacer `git push`.  
- Si no, en el dashboard de Vercel: **Deployments** → **Redeploy** del último deployment (o “Redeploy” en el que corresponda).

### Paso 3: Comprobar Root Directory en Vercel

- En el proyecto de Vercel: **Settings** → **General** → **Root Directory**.  
- Debe estar en **`public-next`** (no vacío ni `public-next_reparado`).  
- Si lo cambias, guarda y haz un nuevo deploy.

### Paso 4: Caché del navegador

Después del deploy, en PC y móviles haz una **recarga forzada** (o borra caché):

- PC: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac).  
- Móvil: en el navegador, “Borrar caché” o “Recargar sin caché” si la opción existe.

---

## 4. Comprobación rápida

- **Antes del push:** en GitHub (o tu Git) no debe existir `VideoPresentacion.tsx` y `page.tsx` debe seguir con TestimonialsGallery.  
- **Después del push y redeploy:** en el repo debe aparecer `VideoPresentacion.tsx`, `page.tsx` con VideoPresentacion como 2º bloque, y TestimonialsGallery eliminado.  
- Al abrir la URL de Vercel (en PC o móvil), la landing debe mostrar el **vídeo de presentación** como segundo bloque y **sin** la sección de testimonios.

---

## Resumen

| Dónde              | Qué pasa                                                                 |
|--------------------|--------------------------------------------------------------------------|
| Tu PC (Cursor)     | Código nuevo: vídeo 2º bloque, sin testimonios.                         |
| Repo remoto (Git)  | Código viejo: testimonios, sin VideoPresentacion.                      |
| Vercel / Cloud Run | Construyen desde el repo remoto → siguen sirviendo el código viejo.     |
| Solución           | `git add` + `git commit` + `git push`, luego redeploy y recargar sin caché. |

Si quieres, en el siguiente paso podemos revisar juntos el resultado del `git status` después de que hagas el commit y el push.
