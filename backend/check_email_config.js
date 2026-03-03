const { initEnv } = require('./config/env');

async function checkEmailConfig() {
  try {
    const env = await initEnv();
    
    console.log('📧 CONFIGURACIÓN ACTUAL DE EMAILS:');
    console.log('='.repeat(50));
    console.log('INFO_MAIL:');
    console.log('  Usuario:', env.INFO_MAIL?.user);
    console.log('  Contraseña:', env.INFO_MAIL?.pass ? '***CONFIGURADA***' : 'NO CONFIGURADA');
    console.log('');
    console.log('ANA_MAIL:');
    console.log('  Usuario:', env.ANA_MAIL?.user);
    console.log('  Contraseña:', env.ANA_MAIL?.pass ? '***CONFIGURADA***' : 'NO CONFIGURADA');
    console.log('');
    console.log('ADMIN_EMAIL:', env.ADMIN_EMAIL);
    
    // Verificar si el usuario tiene caracteres problemáticos
    const infoUser = env.INFO_MAIL?.user || '';
    const hasSpecialChars = /[&%$+]/.test(infoUser);
    
    console.log('');
    console.log('🔍 ANÁLISIS DE USUARIO:');
    console.log('  Usuario INFO_MAIL:', infoUser);
    console.log('  Tiene caracteres especiales:', hasSpecialChars ? 'SÍ (puede causar problemas)' : 'NO');
    
    if (hasSpecialChars) {
      console.log('');
      console.log('⚠️  RECOMENDACIÓN:');
      console.log('  El usuario tiene caracteres que pueden causar problemas de autenticación.');
      console.log('  Se recomienda usar un usuario más simple como: info@fisiotool.com');
    }
    
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

checkEmailConfig();
