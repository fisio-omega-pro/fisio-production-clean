#!/bin/bash

echo "🚀 DEPLOY A PRODUCCIÓN - FISIOTOOL PRO"

# Variables
FRONTEND_DIR="public-next"
BACKEND_DIR="backend"
PRODUCTION_URL="https://www.fisiotool.com"

echo "🔥 INICIANDO DEPLOY A PRODUCCIÓN"
echo "📅 Fecha: $(date)"
echo "🌍 URL: $PRODUCTION_URL"

# Validación
echo "🔍 Validando entorno..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Directorio frontend no encontrado"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Directorio backend no encontrado"
    exit 1
fi

# Tests
echo "🧪 Ejecutando tests..."
npm run test:ci
if [ $? -ne 0 ]; then
    echo "❌ Error: Tests unitarios fallaron"
    exit 1
fi

echo "🌐 Ejecutando tests E2E..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Tests E2E fallaron (continuando)"
fi

# Build Frontend
echo "📦 Build Frontend..."
cd $FRONTEND_DIR
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build frontend falló"
    exit 1
fi

# Deploy Frontend
echo "🚀 Deploy Frontend a Vercel..."
npx vercel --prod
if [ $? -ne 0 ]; then
    echo "❌ Error: Deploy frontend falló"
    exit 1
fi

# Deploy Backend
echo "🚀 Deploy Backend a Cloud Run..."
cd ../$BACKEND_DIR
gcloud run deploy fisiotool-backend \
    --source . \
    --region europe-west1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300s \
    --concurrency 80 \
    --max-instances 100
if [ $? -ne 0 ]; then
    echo "❌ Error: Deploy backend falló"
    exit 1
fi

# Health Check
echo "🧪 Health Check..."
sleep 30
curl -f $PRODUCTION_URL/api/health
if [ $? -ne 0 ]; then
    echo "❌ Error: Health check falló"
    exit 1
fi

# Success
echo "✅ DEPLOY A PRODUCCIÓN COMPLETADO"
echo "🌍 URL: $PRODUCTION_URL"
echo "📅 Fecha: $(date)"
echo "🎉 ¡FisioTool Pro está en producción!"

# Notificación
echo "📧 Enviando notificación..."
# Aquí iría tu sistema de notificaciones

echo "🎯 Deploy finalizado exitosamente"
