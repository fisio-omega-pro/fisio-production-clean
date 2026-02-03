#!/bin/bash
set -euo pipefail

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO A CLOUD RUN
# Este script despliega el backend a Cloud Run desde GitHub

PROJECT_ID="fisiotool-pro-2026"
REGION="europe-west1"
SERVICE_NAME="fisio-backend-omega"
GITHUB_REPO="fisio-omega-pro/fisio-production-clean"
BRANCH="master"

echo "🚀 Desplegando FisioTool Backend a Cloud Run..."
echo "   Proyecto: $PROJECT_ID"
echo "   Región: $REGION"
echo "   Servicio: $SERVICE_NAME"
echo ""

# Desplegar desde GitHub
gcloud run deploy "$SERVICE_NAME" \
  --project=$PROJECT_ID \
  --region=$REGION \
  --source=. \
  --allow-unauthenticated \
  --platform=managed \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --max-instances=10 \
  --min-instances=0

echo ""
echo "✅ Deploy completado!"
echo "   URL: https://$SERVICE_NAME-$PROJECT_ID.$REGION.run.app"
