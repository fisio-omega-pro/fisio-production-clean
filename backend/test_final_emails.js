const { sendEmail } = require('./services/emailSenderService');
const { initEnv } = require('./config/env');

async function testFinalEmails() {
  try {
    console.log('🧪 PRUEBA FINAL DEL SISTEMA DE EMAILS');
    console.log('='.repeat(60));
    
    const env = await initEnv();
    const adminEmail = String(env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com').trim();
    
    console.log('📧 CONFIGURACIÓN:');
    console.log('  ADMIN_EMAIL:', adminEmail);
    console.log('  INFO_MAIL user:', env.INFO_MAIL?.user);
    console.log('  INFO_MAIL pass:', env.INFO_MAIL?.pass ? '***CONFIGURADA***' : 'NO');
    console.log('  ANA_MAIL user:', env.ANA_MAIL?.user);
    console.log('  ANA_MAIL pass:', env.ANA_MAIL?.pass ? '***CONFIGURADA***' : 'NO');
    
    console.log('\n📝 1. ENVIANDO SUGERENCIA (debería usar INFO_MAIL)...');
    
    const sugerenciaResult = await sendEmail({
      to: adminEmail,
      subject: '[SUGERENCIA] Nueva idea de mejora recibida',
      text: 'SUGERENCIA DE PRUEBA: Sería genial poder tener una vista de calendario semanal con vista mensual integrada.\n\nEsta es una prueba para verificar que las sugerencias llegan correctamente.\n\nFecha: ' + new Date().toLocaleString('es-ES'),
      type: 'INFO'
    });
    
    if (sugerenciaResult.ok) {
      console.log('✅ SUGERENCIA enviada correctamente');
    } else {
      console.log('❌ Error en sugerencia:', sugerenciaResult.error);
    }
    
    console.log('\n🚨 2. ENVIANDO ALERTA TÉCNICA...');
    
    const alertaResult = await sendEmail({
      to: adminEmail,
      subject: '🚨 URGENTE – Problema técnico detectado',
      text: 'ALERTA DE PRUEBA: Error 500 al guardar citas.\n\nEsta es una prueba para verificar que las alertas técnicas llegan con formato urgente.\n\nImpacto: Afectando a 3 pacientes\n\nFecha: ' + new Date().toLocaleString('es-ES'),
      type: 'INFO'
    });
    
    if (alertaResult.ok) {
      console.log('✅ ALERTA enviada correctamente');
    } else {
      console.log('❌ Error en alerta:', alertaResult.error);
    }
    
    console.log('\n🎉 RESULTADO FINAL:');
    console.log('📧 Revisa fisiotoolsaas@gmail.com');
    console.log('📋 Deberías recibir:');
    console.log('   1. Email de prueba desde ANA (ya enviado)');
    console.log('   2. [SUGERENCIA] Nueva idea de mejora recibida');
    console.log('   3. 🚨 URGENTE – Problema técnico detectado');
    
  } catch (error) {
    console.error('🔥 Error general:', error.message);
  }
}

testFinalEmails();
