# 🚀 CI/CD Pipeline - FisioTool Pro

## 📋 Descripción

Pipeline completo de Integración Continua y Despliegue Continuo para FisioTool Pro con testing automatizado, despliegue seguro y monitorización.

## 🔄 Flujo de Trabajo

### **🌿 Branch `develop`**
```
📥 Push → 🧪 Tests → 🔍 Lint → 🚀 Deploy Staging → 🧪 Health Check
```

### **🎯 Branch `master`**
```
📥 Push → 🧪 Tests → 🔍 Lint → 🛡️ Security → 🚀 Deploy Production → 📊 Report
```

## 🧪 Tests Automatizados

### **Unit Tests**
```bash
npm run test:ci          # Tests con cobertura
npm run test:coverage    # Reporte detallado
```

### **E2E Tests**
```bash
npm run test:e2e         # Tests en múltiples navegadores
npm run test:e2e:ui      # UI interactiva
npx playwright show-report  # Reporte visual
```

## 🚀 Despliegue Automático

### **Staging (develop)**
- URL: `https://fisiotool-staging.vercel.app`
- Despliegue automático en cada push
- Tests de salud automáticos

### **Producción (master)**
- URL: `https://www.fisiotool.com`
- Despliegue automático con aprobación
- Monitorización continua

## 🛡️ Seguridad

### **Scans Automáticos**
```bash
npm audit               # Vulnerabilidades npm
snyk test              # Análisis de dependencias
```

### **Secretos Configurados**
- `VERCEL_TOKEN` - Token de Vercel
- `VERCEL_ORG_ID` - ID de organización
- `VERCEL_PROJECT_ID` - ID de proyecto
- `SNYK_TOKEN` - Token de Snyk
- `SLACK_WEBHOOK` - Notificaciones

## 📊 Monitorización

### **Health Check**
```bash
./scripts/health-check.sh    # Verificación completa
```

### **Endpoints Monitoreados**
- ✅ Frontend (200)
- ✅ Backend Health (200)
- ✅ Login (401/400)
- ✅ Dashboard (403)
- ✅ Ana Chat (404/400)

## 🚀 Scripts de Despliegue

### **Producción**
```bash
./scripts/deploy-production.sh    # Deploy completo
```

### **Staging**
```bash
./scripts/deploy-staging.sh       # Deploy a staging
```

## 📋 Checklist Pre-Deploy

- [ ] Todos los tests pasan
- [ ] Cobertura > 70%
- [ ] Sin vulnerabilidades críticas
- [ ] Health check OK
- [ ] Backup actualizado

## 🔄 Rollback Automático

Si el health check falla:
```bash
# Rollback automático activado
# Deploy anterior restaurado
# Notificación enviada
```

## 📊 Reportes

### **CI/CD Summary**
- GitHub Actions summary
- Codecov coverage
- Playwright HTML report
- Security scan results

### **Notificaciones**
- Slack: `#deployments`
- Email: Equipo de desarrollo
- Dashboard: Estado en tiempo real

## 🛠️ Configuración Local

### **Variables de Entorno**
```bash
cp .env.example .env
# Configurar variables locales
```

### **Setup Inicial**
```bash
npm install
npx playwright install
npm run test:ci
```

## 🚨 Troubleshooting

### **Tests Fallan**
```bash
npm run test:watch    # Debug interactivo
npm run test:coverage # Ver cobertura
```

### **Deploy Falla**
```bash
./scripts/health-check.sh    # Verificar sistema
npm run build               # Verificar build
```

### **E2E Tests Fallan**
```bash
npx playwright test --project=chromium  # Un navegador
npx playwright test --headed           # Modo visible
```

## 📞 Soporte

- 📧 Email: dev@fisiotool.com
- 💬 Slack: #fisiotool-dev
- 📱 Teléfono: Emergencias 24/7

---

**🎯 Este pipeline garantiza calidad, seguridad y fiabilidad en cada despliegue.**
