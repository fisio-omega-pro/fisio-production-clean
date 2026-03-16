#!/bin/bash

echo "🏥 HEALTH CHECK - FISIOTOOL PRO"

# URLs a verificar
FRONTEND_URL="https://www.fisiotool.com"
BACKEND_URL="https://fisio-backend-omega-740657183492.europe-west1.run.app"
HEALTH_ENDPOINT="$BACKEND_URL/api/health"

echo "🔍 Verificando salud del sistema..."
echo "📅 Fecha: $(date)"

# Health Check Frontend
echo "🌐 Verificando Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ $FRONTEND_STATUS -eq 200 ]; then
    echo "✅ Frontend OK (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend ERROR (HTTP $FRONTEND_STATUS)"
fi

# Health Check Backend
echo "🔧 Verificando Backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)
if [ $BACKEND_STATUS -eq 200 ]; then
    echo "✅ Backend OK (HTTP $BACKEND_STATUS)"
else
    echo "❌ Backend ERROR (HTTP $BACKEND_STATUS)"
fi

# Verificar endpoints críticos
echo "🔍 Verificando endpoints críticos..."

# Login endpoint
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BACKEND_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}')
if [ $LOGIN_STATUS -eq 401 ] || [ $LOGIN_STATUS -eq 400 ]; then
    echo "✅ Login endpoint OK (HTTP $LOGIN_STATUS)"
else
    echo "❌ Login endpoint ERROR (HTTP $LOGIN_STATUS)"
fi

# Dashboard endpoint
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/dashboard/data -H "Authorization: Bearer invalid-token")
if [ $DASHBOARD_STATUS -eq 403 ]; then
    echo "✅ Dashboard endpoint OK (HTTP $DASHBOARD_STATUS)"
else
    echo "❌ Dashboard endpoint ERROR (HTTP $DASHBOARD_STATUS)"
fi

# Ana Chat endpoint
ANA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BACKEND_URL/api/public/ana-chat -H "Content-Type: application/json" -d '{"message":"test","clinicId":"test"}')
if [ $ANA_STATUS -eq 404 ] || [ $ANA_STATUS -eq 400 ]; then
    echo "✅ Ana Chat endpoint OK (HTTP $ANA_STATUS)"
else
    echo "❌ Ana Chat endpoint ERROR (HTTP $ANA_STATUS)"
fi

# Resumen
echo ""
echo "📊 RESUMEN DE SALUD:"
echo "🌐 Frontend: HTTP $FRONTEND_STATUS"
echo "🔧 Backend: HTTP $BACKEND_STATUS"
echo "🔐 Login: HTTP $LOGIN_STATUS"
echo "📊 Dashboard: HTTP $DASHBOARD_STATUS"
echo "🤖 Ana Chat: HTTP $ANA_STATUS"

# Estado general
if [ $FRONTEND_STATUS -eq 200 ] && [ $BACKEND_STATUS -eq 200 ]; then
    echo ""
    echo "🎉 SISTEMA SALUDABLE"
    exit 0
else
    echo ""
    echo "⚠️ SISTEMA CON PROBLEMAS"
    exit 1
fi
