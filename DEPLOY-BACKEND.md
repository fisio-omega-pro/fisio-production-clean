# Desplegar el backend en Cloud Run (CORS y registro)

El backend que responde en `https://fisio-backend-omega-740657183492.europe-west1.run.app` **tiene que ser una revisión construida con el código de este repositorio** para que CORS funcione desde `https://www.fisiotool.com`.

## Opción 1: Desde tu máquina con gcloud

Abre una terminal en la **raíz del proyecto** (donde está este archivo y el `Dockerfile`):

```bash
cd /Users/augustogalvanmartin/Downloads/fisiotoolsaas
gcloud run deploy fisio-backend-omega --source . --region europe-west1 --project fisiotool-pro-2026
```

- `--source .` hace que Google Cloud **construya la imagen** desde el código actual (incluye el fix de CORS en `backend/server.js`).
- Te pedirá confirmar la cuenta y el servicio. Cuando termine, la nueva revisión estará en producción.

## Opción 2: Cloud Build (repositorio conectado)

1. Sube los últimos cambios a tu repositorio (Git push).
2. En Google Cloud Console: **Cloud Build** → **Historial** (o **Triggers**).
3. Ejecuta el trigger que construye y despliega `fisio-backend-omega`.
4. Asegúrate de que ese trigger usa el mismo repositorio y la rama donde está el código actual.

## Comprobar que la nueva revisión está activa

Después del deploy, prueba de nuevo el registro en https://www.fisiotool.com/setup. Si CORS está bien, el preflight OPTIONS devolverá `Access-Control-Allow-Origin: https://www.fisiotool.com` y el registro no dará “blocked by CORS policy”.

El secreto `FRONTEND_URL` con valor `https://www.fisiotool.com` está bien para el resto del backend; el fix de CORS en código no depende de ese secreto, pero no lo quites.
