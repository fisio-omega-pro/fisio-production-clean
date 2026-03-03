const { db, Timestamp } = require('./config/firebase');
const { sendEmail } = require('./services/emailSenderService');
const { initEnv } = require('./config/env');

async function testEmails() {
  try {
    console.log('🧪 Iniciando prueba de emails...');
    
    const env = await initEnv();
    const adminEmail = String(env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com').trim();
    
    console.log(`📧 Email admin: ${adminEmail}`);

    // 1. ENVIAR SUGERENCIA (mejora)
    console.log('\n📝 1. Enviando sugerencia de mejora...');
    
    const sugerenciaRef = await db.collection('sugerencias').add({
      clinic_id: 'test_clinic_id',
      mensaje: 'SUGERENCIA DE PRUEBA: Sería genial poder tener una vista de calendario semanal con vista mensual integrada para mejor planificación de citas. Esto ayudaría a las clínicas con muchos pacientes a optimizar mejor el tiempo.',
      status: 'pendiente',
      fecha: Timestamp.now(),
      test_mode: true
    });
    
    console.log(`✅ Sugerencia guardada con ID: ${sugerenciaRef.id}`);
    
    // Enviar email de sugerencia al admin
    await sendEmail({
      to: adminEmail,
      subject: '[SUGERENCIA PRUEBA] Nueva sugerencia de mejora recibida',
      text: `Se ha recibido una nueva sugerencia de mejora:

Sugerencia: "Sería genial poder tener una vista de calendario semanal con vista mensual integrada para mejor planificación de citas. Esto ayudaría a las clínicas con muchos pacientes a optimizar mejor el tiempo."

Clinica ID: test_clinic_id
Fecha: ${new Date().toLocaleString('es-ES')}
Test Mode: TRUE

Este es un email de prueba para verificar el formato de llegada de sugerencias.`,
      type: 'INFO'
    });
    
    console.log('✅ Email de sugerencia enviado al admin');

    // 2. ENVIAR TICKET DE ALERTA (problema técnico)
    console.log('\n🚨 2. Enviando ticket de alerta técnica...');
    
    const ticketRef = await db.collection('tickets').add({
      clinic_id: 'test_clinic_id',
      type: 'tecnico',
      message: 'ALERTA DE PRUEBA: Al intentar guardar una cita nueva, el sistema muestra error 500 y no se guarda la cita. Esto está afectando a 3 pacientes hoy. El error ocurre específicamente cuando intento asignar la cita al Dr. Juan Pérez.',
      email: 'test@clinica.com',
      nombre_clinica: 'Clínica Test',
      status: 'pendiente',
      created_at: Timestamp.now(),
      test_mode: true
    });
    
    console.log(`✅ Ticket técnico guardado con ID: ${ticketRef.id}`);
    
    // Enviar email URGENTE al admin
    await sendEmail({
      to: adminEmail,
      subject: '🚨 URGENTE – Problema técnico FisioTool – Clínica Test',
      text: `SE HA RECIBIDO UN TICKET URGENTE DE SOPORTE TÉCNICO:

Clínica: Clínica Test
Email: test@clinica.com
Clinic ID: test_clinic_id

Mensaje del problema:
"Al intentar guardar una cita nueva, el sistema muestra error 500 y no se guarda la cita. Esto está afectando a 3 pacientes hoy. El error ocurre específicamente cuando intento asignar la cita al Dr. Juan Pérez."

Ticket ID: ${ticketRef.id}
Fecha: ${new Date().toLocaleString('es-ES')}
Tipo: técnico (URGENTE)
Test Mode: TRUE

---
Este es un email de prueba para verificar el formato de llegada de alertas técnicas.`,
      type: 'INFO'
    });
    
    console.log('✅ Email urgente de ticket técnico enviado al admin');

    // 3. ENVIAR EMAIL DE RESPUESTA AUTOMÁTICA (simulando consulta)
    console.log('\n🤖 3. Enviando email de respuesta automática de Ana...');
    
    await sendEmail({
      to: adminEmail,
      subject: '[Consulta FisioTool] Clínica Test',
      text: `Clínica: Clínica Test (test@clinica.com)
Mensaje: ¿Cómo cambio la hora de cierre los viernes?

Ana ya ha enviado respuesta automática al usuario.

---
Este es un email de prueba para verificar el formato de llegada de consultas.`,
      type: 'INFO'
    });
    
    console.log('✅ Email de consulta enviado al admin');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('📧 Revisa tu email fisiotoolsaas@gmail.com');
    console.log('📋 Deberías recibir 3 emails con diferentes formatos:');
    console.log('   1. [SUGERENCIA PRUEBA] - Formato de mejora');
    console.log('   2. 🚨 URGENTE – Problema técnico - Formato de alerta');
    console.log('   3. [Consulta FisioTool] - Formato de consulta');
    
  } catch (error) {
    console.error('🔥 Error en prueba de emails:', error);
  }
}

// Ejecutar la prueba
testEmails();
