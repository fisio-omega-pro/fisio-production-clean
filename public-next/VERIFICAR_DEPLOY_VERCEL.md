# Verificar por qué no se ven Aviso Legal ni Devoluciones en www.fisiotool.com

Si en la web **no funciona /aviso-legal** y **no aparece "Devoluciones y reembolsos"** en el pie, suele ser por una de estas dos cosas:

---

## 1. Vercel no está construyendo la app Next (Root Directory mal)

En el repo, la app está en la carpeta **`public-next`**. La raíz del repo tiene un `package.json` del **backend** (Node/Express), no de Next.

- **Vercel** → tu proyecto → **Settings** → **General**.
- Busca **Root Directory**.
- **Tiene que estar en:** `public-next` (y el toggle "Override" activado si aplica).
- Si está **vacío** o en otro valor, Vercel está haciendo build desde la raíz y no desde `public-next`, así que no construye la landing ni las páginas legales.

**Qué hacer:** Pon **Root Directory** = `public-next`, guarda y haz **Redeploy**.

---

## 2. El código que ves en la web no es el de tu PC (no está en Git)

Vercel construye desde el **repositorio Git** (GitHub/GitLab/Bitbucket) que tengas conectado. Si los cambios del Footer y de las páginas (aviso-legal, devolucion) **no están subidos** a ese repo, la web seguirá mostrando la versión antigua.

**Comprobar en tu PC:**

```bash
cd /Users/augustogalvanmartin/Downloads/fisiotoolsaas
git status
```

Si ves archivos modificados (por ejemplo `public-next/src/components/landing/Footer.tsx`, `public-next/src/app/aviso-legal/page.tsx`), **no están en el remoto** hasta que hagas:

```bash
git add public-next/
git add .
git commit -m "Footer con Devoluciones, rutas legales, next sin output export"
git push origin main
```

(Si tu rama se llama `master`, usa `git push origin master`.)

**Comprobar en el remoto:** Abre el repo en GitHub (o donde esté). En la rama que use Vercel para producción:

- Debe existir `public-next/src/components/landing/Footer.tsx` con el texto **"Devoluciones y reembolsos"** en el array `legal`.
- Debe existir `public-next/src/app/aviso-legal/page.tsx` y `public-next/src/app/devolucion/page.tsx`.

Si no están, los cambios no se han subido y por eso la web no cambia.

---

## 3. Comprobar que el deploy es el correcto

1. **Vercel** → **Deployments**.
2. Abre el último deployment que esté en **Production**.
3. Revisa que:
   - **Branch** sea la que tiene tus cambios (p. ej. `main`).
   - El **commit** sea el que incluye Footer + páginas legales.
   - El **build** haya terminado en verde (no fallido).

Si el último production deployment es de un commit antiguo, haz **Redeploy** del deployment correcto y asígnalo a Production.

---

## 4. Después de corregir

1. Guarda en Vercel (Root Directory = `public-next` si lo cambiaste).
2. Sube el código con `git push` si faltaba.
3. Redeploy en Vercel.
4. Prueba en **ventana privada** o con **Ctrl+Shift+R** (Cmd+Shift+R en Mac):
   - `https://www.fisiotool.com/aviso-legal/`
   - `https://www.fisiotool.com/devolucion/`
   - En la portada, bajar al pie y comprobar que aparece **"Devoluciones y reembolsos"**.

Si tras esto sigue igual, indica: qué valor tiene **Root Directory** en Vercel y si al hacer `git status` en tu PC ves cambios sin subir.
