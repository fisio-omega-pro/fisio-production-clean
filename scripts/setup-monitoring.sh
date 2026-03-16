#!/bin/bash

echo "🚀 CONFIGURANDO MONITOREO PARA FISIOTOOL PRO"

# Instalar Sentry
echo "📡 Instalando Sentry..."
cd public-next
npm install @sentry/nextjs @sentry/node

# Crear configuración de Sentry
cat > sentry.client.config.js << 'EOF'
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
EOF

cat > sentry.server.config.js << 'EOF'
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
EOF

echo "✅ Monitorización configurada"
echo "📝 Próximos pasos:"
echo "1. Crear cuenta en Sentry.io"
echo "2. Reemplazar YOUR_SENTRY_DSN_HERE"
echo "3. Probar que los errores se capturen"
