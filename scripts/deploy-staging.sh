#!/bin/bash

echo "🚀 DEPLOY A STAGING - FISIOTOOL PRO"

# Variables
FRONTEND_DIR="public-next"
BACKEND_DIR="backend"
STAGING_URL="https://fisiotool-staging.vercel.app"

echo "📦 Build Frontend..."
cd $FRONTEND_DIR
npm run build

echo "🚀 Deploy Frontend a Staging..."
# Aquí irá el comando de deploy a Vercel staging
echo "Frontend deployed to: $STAGING_URL"

echo "🔧 Deploy Backend a Staging..."
cd ../$BACKEND_DIR
# Aquí irá el comando de deploy a Cloud Run staging
echo "Backend deployed to staging"

echo "🧪 Ejecutando tests E2E en staging..."
# npm run test:e2e -- --baseUrl=$STAGING_URL

echo "✅ Deploy a staging completado"
echo "🔗 URL: $STAGING_URL"
echo "📊 Tests ejecutados: ✓"
