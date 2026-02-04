#!/bin/bash
set -euo pipefail

# Config por defecto (ajusta si cambias región/servicio)
PROJECT_ID="${PROJECT_ID:-fisiotool-pro-2026}"
REGION="${REGION:-europe-west1}"
SERVICE_URL="${SERVICE_URL:-https://fisio-backend-omega-740657183492.europe-west1.run.app}"

# Jobs
JOB_CAZA="${JOB_CAZA:-caza-autopilot-5m}"
SCHEDULE_CAZA="${SCHEDULE_CAZA:-*/5 * * * *}"
TIMEZONE="${TIMEZONE:-Europe/Madrid}"

# Recaptación (recomendado: 1 vez al día)
ENABLE_RECAPTACION="${ENABLE_RECAPTACION:-1}"
JOB_RECAPTACION="${JOB_RECAPTACION:-recaptacion-autopilot-daily}"
SCHEDULE_RECAPTACION="${SCHEDULE_RECAPTACION:-0 10 * * *}" # 10:00 Europe/Madrid

# Seguridad
# OJO: este header es el mismo que Foundry. Solo IAM con acceso a Scheduler podrá verlo.
FOUNDRY_KEY="${FOUNDRY_KEY:-}"

if [[ -z "$FOUNDRY_KEY" ]]; then
  echo "❌ Falta FOUNDRY_KEY. Ejemplo:"
  echo "   FOUNDRY_KEY='TU_CLAVE' ./scripts/setup-cloud-scheduler.sh"
  exit 1
fi

echo "➡️ Proyecto: $PROJECT_ID"
echo "➡️ Región:   $REGION"
echo "➡️ Service:  $SERVICE_URL"

echo ""
echo "1) Habilitando Cloud Scheduler API (idempotente)..."
gcloud services enable cloudscheduler.googleapis.com --project="$PROJECT_ID" >/dev/null

URI_CAZA="$SERVICE_URL/api/admin/run-caza-autopilot"
URI_RECAP="$SERVICE_URL/api/admin/run-recaptacion-autopilot"

echo ""
echo "2) Creando/actualizando job: $JOB_CAZA"

if gcloud scheduler jobs describe "$JOB_CAZA" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$JOB_CAZA" \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --schedule="$SCHEDULE_CAZA" \
    --time-zone="$TIMEZONE" \
    --uri="$URI_CAZA" \
    --http-method=POST \
    --headers="Content-Type=application/json,x-foundry-key=$FOUNDRY_KEY" \
    --message-body='{"maxPerRun":5}' \
    --attempt-deadline=60s
else
  gcloud scheduler jobs create http "$JOB_CAZA" \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --schedule="$SCHEDULE_CAZA" \
    --time-zone="$TIMEZONE" \
    --uri="$URI_CAZA" \
    --http-method=POST \
    --headers="Content-Type=application/json,x-foundry-key=$FOUNDRY_KEY" \
    --message-body='{"maxPerRun":5}' \
    --attempt-deadline=60s
fi

echo ""
echo "3) Ejecutando el job 1 vez (smoke test)..."
gcloud scheduler jobs run "$JOB_CAZA" --location="$REGION" --project="$PROJECT_ID" >/dev/null

if [[ "$ENABLE_RECAPTACION" == "1" ]]; then
  echo ""
  echo "4) Creando/actualizando job: $JOB_RECAPTACION (recaptación diaria)"
  if gcloud scheduler jobs describe "$JOB_RECAPTACION" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
    gcloud scheduler jobs update http "$JOB_RECAPTACION" \
      --project="$PROJECT_ID" \
      --location="$REGION" \
      --schedule="$SCHEDULE_RECAPTACION" \
      --time-zone="$TIMEZONE" \
      --uri="$URI_RECAP" \
      --http-method=POST \
      --headers="Content-Type=application/json,x-foundry-key=$FOUNDRY_KEY" \
      --message-body='{"maxClinics":10,"maxPerRun":10}' \
      --attempt-deadline=180s
  else
    gcloud scheduler jobs create http "$JOB_RECAPTACION" \
      --project="$PROJECT_ID" \
      --location="$REGION" \
      --schedule="$SCHEDULE_RECAPTACION" \
      --time-zone="$TIMEZONE" \
      --uri="$URI_RECAP" \
      --http-method=POST \
      --headers="Content-Type=application/json,x-foundry-key=$FOUNDRY_KEY" \
      --message-body='{"maxClinics":10,"maxPerRun":10}' \
      --attempt-deadline=180s
  fi

  echo ""
  echo "5) Ejecutando recaptación 1 vez (smoke test)..."
  gcloud scheduler jobs run "$JOB_RECAPTACION" --location="$REGION" --project="$PROJECT_ID" >/dev/null
fi

echo ""
echo "✅ Listo. Configuración actual:"
gcloud scheduler jobs describe "$JOB_CAZA" --location="$REGION" --project="$PROJECT_ID" \
  --format='table(name,schedule,timeZone,state,httpTarget.uri)'

if [[ "$ENABLE_RECAPTACION" == "1" ]]; then
  gcloud scheduler jobs describe "$JOB_RECAPTACION" --location="$REGION" --project="$PROJECT_ID" \
    --format='table(name,schedule,timeZone,state,httpTarget.uri)'
fi

