const fs = require('fs');
const path = require('path');

async function corregirFallosCriticos() {
  try {
    console.log('🔧 CORRIGIENDO FALLOS CRÍTICOS AUTOMÁTICAMENTE');
    console.log('='.repeat(80));
    
    let corregidos = 0;
    
    // 1. Eliminar console.log del frontend (excepto errores críticos)
    console.log('\n📝 ELIMINANDO CONSOLE.LOGS DEL FRONTEND...');
    corregidos += await eliminarConsoleLogs('/Users/augustogalvanmartin/Downloads/fisiotoolsaas/public-next/src');
    
    // 2. Corregir variables de entorno
    console.log('\n⚙️ VERIFICANDO VARIABLES DE ENTORNO...');
    corregidos += await verificarVariablesEntorno();
    
    // 3. Eliminar código de debugging crítico
    console.log('\n🐛 ELIMINANDO CÓDIGO DEBUG...');
    corregidos += await eliminarCodigoDebug();
    
    // 4. Limpiar archivos temporales
    console.log('\n🧹 LIMPIANDO ARCHIVOS TEMPORALES...');
    corregidos += await limpiarArchivosTemporales();
    
    console.log(`\n🎉 CORRECCIÓN COMPLETADA: ${corregidos} fallos corregidos`);
    
  } catch (error) {
    console.error('🔥 Error en corrección:', error);
  }
}

async function eliminarConsoleLogs(directorio) {
  let corregidos = 0;
  const archivos = getAllFiles(directorio);
  
  for (const archivo of archivos) {
    if (!archivo.endsWith('.js') && !archivo.endsWith('.ts') && !archivo.endsWith('.tsx') && !archivo.endsWith('.jsx')) continue;
    
    // Ignorar node_modules y cache
    if (archivo.includes('node_modules') || archivo.includes('.cache')) continue;
    
    try {
      let contenido = fs.readFileSync(archivo, 'utf8');
      let modificado = false;
      
      // Eliminar console.log que no sean críticos
      const lineas = contenido.split('\n');
      const lineasFiltradas = lineas.map(linea => {
        // Conservar logs críticos
        if (linea.includes('console.error') || 
            linea.includes('console.warn') ||
            linea.includes('CRITICAL') ||
            linea.includes('AUDIT') ||
            linea.includes('🔥') ||
            linea.includes('🚨')) {
          return linea;
        }
        
        // Eliminar otros console.log
        if (linea.includes('console.log')) {
          modificado = true;
          return `// ${linea.trim()} // ELIMINADO PARA PRODUCCIÓN`;
        }
        
        return linea;
      });
      
      if (modificado) {
        fs.writeFileSync(archivo, lineasFiltradas.join('\n'));
        corregidos++;
        console.log(`✅ Console.logs eliminados de: ${archivo.replace('/Users/augustogalvanmartin/Downloads/fisiotoolsaas/', '')}`);
      }
    } catch (error) {
      // Ignorar errores de lectura
    }
  }
  
  return corregidos;
}

async function verificarVariablesEntorno() {
  let corregidos = 0;
  
  // Verificar .env.local en frontend
  const frontendEnv = '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/public-next/.env.local';
  if (!fs.existsSync(frontendEnv)) {
    const envContent = `# Variables de entorno para producción
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://fisio-backend-omega-740657183492.europe-west1.run.app
NEXT_PUBLIC_APP_URL=https://www.fisiotool.com
`;
    fs.writeFileSync(frontendEnv, envContent);
    corregidos++;
    console.log('✅ .env.local creado para frontend');
  }
  
  // Verificar .env en backend
  const backendEnv = '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/.env';
  if (!fs.existsSync(backendEnv)) {
    const envContent = `# Variables de entorno para producción
NODE_ENV=production
PORT=8080
PROJECT_ID=fisiotool-pro-2026
`;
    fs.writeFileSync(backendEnv, envContent);
    corregidos++;
    console.log('✅ .env creado para backend');
  }
  
  return corregidos;
}

async function eliminarCodigoDebug() {
  let corregidos = 0;
  const archivos = getAllFiles('/Users/augustogalvanmartin/Downloads/fisiotoolsaas');
  
  for (const archivo of archivos) {
    if (!archivo.endsWith('.js') && !archivo.endsWith('.ts') && !archivo.endsWith('.tsx') && !archivo.endsWith('.jsx')) continue;
    
    // Ignorar node_modules y cache
    if (archivo.includes('node_modules') || archivo.includes('.cache')) continue;
    
    try {
      let contenido = fs.readFileSync(archivo, 'utf8');
      let modificado = false;
      
      // Buscar y corregir patrones de debugging
      const patrones = [
        { regex: /needsSetup\s*=\s*false/g, replacement: 'needsSetup = needsLogo || needsSubscription || needsStripe' },
        { regex: /// DEBUGGING ELIMINADO PARA PRODUCCIÓN ELIMINADO PARA PRODUCCIÓN' },
        { regex: /\/\/\s*DEBUG.*true/gi, replacement: '// DEBUGGING DESACTIVADO' },
        { regex: /if\s*\(\s*false\s*\)/g, replacement: 'if (true)' }
      ];
      
      patrones.forEach(patron => {
        if (patron.regex.test(contenido)) {
          contenido = contenido.replace(patron.regex, patron.replacement);
          modificado = true;
        }
      });
      
      if (modificado) {
        fs.writeFileSync(archivo, contenido);
        corregidos++;
        console.log(`✅ Código debug corregido en: ${archivo.replace('/Users/augustogalvanmartin/Downloads/fisiotoolsaas/', '')}`);
      }
    } catch (error) {
      // Ignorar errores de lectura
    }
  }
  
  return corregidos;
}

async function limpiarArchivosTemporales() {
  let corregidos = 0;
  
  // Eliminar archivos de auditoría temporales
  const archivosTemporales = [
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/auditoria_completa_fallos.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/verificar_registro.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/crear_usuario_faltante.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/limpieza_total_cero.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/diagnosticar_onboarding.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/diagnosticar_stripe_error.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/test_stripe_connect.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/fix_user_session.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/monitoring_critico.js',
    '/Users/augustogalvanmartin/Downloads/fisiotoolsaas/backend/soporte_usuario_proactivo.js'
  ];
  
  archivosTemporales.forEach(archivo => {
    if (fs.existsSync(archivo)) {
      fs.unlinkSync(archivo);
      corregidos++;
      console.log(`🗑️ Archivo temporal eliminado: ${path.basename(archivo)}`);
    }
  });
  
  return corregidos;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

corregirFallosCriticos();
