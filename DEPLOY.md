# 🚀 GUÍA DE DEPLOY PARA FISIOTOOL PRO

## Problema Actual
Cloud Run NO está desplegando automáticamente desde GitHub. Necesitas hacer deploys manuales.

## Solución Rápida (2 opciones)

### Opción 1: Desde Google Cloud Console (MÁS FÁCIL)
1. Abre: https://console.cloud.google.com/run/detail/europe-west1/fisio-backend-omega
2. Clic en "EDITAR Y DESPLEGAR NUEVA REVISIÓN"
3. Sin cambiar nada, clic en "IMPLEMENTAR"
4. Espera 2-3 minutos

### Opción 2: Desde Terminal Local (MÁS RÁPIDO)
```bash
cd /Users/augustogalvanmartin/Downloads/fisiotoolsaas
./deploy-cloud-run.sh
```

## Configurar Auto-Deploy (SOLUCIÓN PERMANENTE)

### Paso 1: Conectar GitHub a Cloud Build
1. Ve a: https://console.cloud.google.com/cloud-build/triggers
2. Clic en "CREAR ACTIVADOR"
3. Selecciona "GitHub" como fuente
4. Conecta tu repositorio: `fisio-omega-pro/fisio-production-clean`
5. Configura:
   - **Nombre**: `auto-deploy-backend`
   - **Rama**: `^master$`
   - **Tipo de compilación**: Cloud Build
   - **Ubicación**: `/cloudbuild.yaml`
6. Guarda

### Paso 2: Crear cloudbuild.yaml
Ya está incluido en el repositorio. Verifica que exista:
```bash
cat cloudbuild.yaml
```

### Paso 3: Dar permisos a Cloud Build
```bash
gcloud projects add-iam-policy-binding fisiotool-pro-2026 \
    --member=serviceAccount@cloudbuild.gserviceaccount.com \
    --role=roles/run.admin

gcloud iam service-accounts add-iam-policy-binding \
    fisiotool-pro-2026@appspot.gserviceaccount.com \
    --member=serviceAccount@cloudbuild.gserviceaccount.com \
    --role=roles/iam.serviceAccountUser
```

## Verificar que funcionó
1. Haz un cambio en README.md
2. Commit y push
3. Ve a Cloud Build: https://console.cloud.google.com/cloud-build/builds
4. Deberías ver un build en progreso
5. Espera 3-5 minutos
6. Verifica: `curl https://fisio-backend-omega-740657183492.europe-west1.run.app/`

## Troubleshooting

### "No se puede desplegar"
- Verifica que estás autenticado: `gcloud auth list`
- Verifica el proyecto: `gcloud config get-value project`

### "Permission denied"
- Ejecuta: `gcloud auth login`
- Selecciona tu cuenta de Google Cloud

### "Service not found"
- Verifica el nombre: `gcloud run services list --region=europe-west1`
