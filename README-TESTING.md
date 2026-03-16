# 🧪 GUIA DE TESTING - FISIOTOOL PRO

## 🚀 EJECUCIÓN RÁPIDA

### 1. Instalar dependencias de testing
```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event supertest
```

### 2. Ejecutar tests críticos
```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests en CI
npm run test:ci
```

### 3. Configurar monitorización
```bash
# Ejecutar script de configuración
./scripts/setup-monitoring.sh
```

### 4. Deploy a staging
```bash
# Deploy automático a staging
./scripts/deploy-staging.sh
```

## 📋 TESTS CRÍTICOS CREADOS

### ✅ Onboarding Flow
- Registro de usuario
- SetupWizard funcional
- Pasos obligatorios

### ✅ Ana Chat
- Respuestas correctas
- Manejo de errores
- Integración con backend

### ✅ Stripe Integration
- Creación de cuentas
- Procesamiento de pagos
- Webhooks

### ✅ Authentication
- Login/logout
- Tokens JWT
- Protección de rutas

## 🎯 CHECKLIST ANTES DE LANZAR

- [ ] Todos los tests pasan
- [ ] Cobertura > 70%
- [ ] Monitorización activa
- [ ] Deploy staging funcional
- [ ] Tests E2E pasan
- [ ] Performance aceptable
- [ ] Seguridad validada

## 🚨 FLUJO DE TRABAJO

1. **Desarrollo** → Tests unitarios
2. **Commit** → CI ejecuta tests
3. **Merge** → Deploy staging
4. **Validación** → Tests E2E
5. **Producción** → Deploy final

## 📞 SOPORTE

Si algo falla:
1. Revisar logs de CI
2. Verificar monitorización
3. Ejecutar tests localmente
4. Contactar al equipo
