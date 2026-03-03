console.log('📧 DEMOSTRACIÓN DE FORMATOS DE EMAIL QUE LLEGARÍAN A fisiotoolsaas@gmail.com\n');

console.log('='.repeat(80));
console.log('📝 1. SUGERENCIA DE MEJORA (formato calmado, constructivo)');
console.log('='.repeat(80));

console.log(`
ASUNTO: [SUGERENCIA PRUEBA] Nueva sugerencia de mejora recibida

PARA: fisiotoolsaas@gmail.com
DE: FisioTool Pro <info@fisiotool.com>
TIPO: INFO

CONTENIDO:
--------------------------------------------------
Se ha recibido una nueva sugerencia de mejora:

Sugerencia: "Sería genial poder tener una vista de calendario semanal con vista mensual integrada para mejor planificación de citas. Esto ayudaría a las clínicas con muchos pacientes a optimizar mejor el tiempo."

Clinica ID: test_clinic_id
Fecha: 3/3/2026, 11:03:48
Test Mode: TRUE

Este es un email de prueba para verificar el formato de llegada de sugerencias.
--------------------------------------------------

🎯 CARACTERÍSTICAS:
✅ Tono calmado y constructivo
✅ Sin urgencia aparente
✅ Enfoque en mejora del producto
✅ Para roadmap y planificación
✅ Baja prioridad de respuesta inmediata
`);

console.log('\n' + '='.repeat(80));
console.log('🚨 2. ALERTA TÉCNICA URGENTE (formato de alta prioridad)');
console.log('='.repeat(80));

console.log(`
ASUNTO: 🚨 URGENTE – Problema técnico FisioTool – Clínica Test

PARA: fisiotoolsaas@gmail.com
DE: FisioTool Pro <info@fisiotool.com>
TIPO: INFO

CONTENIDO:
--------------------------------------------------
SE HA RECIBIDO UN TICKET URGENTE DE SOPORTE TÉCNICO:

Clínica: Clínica Test
Email: test@clinica.com
Clinic ID: test_clinic_id

Mensaje del problema:
"Al intentar guardar una cita nueva, el sistema muestra error 500 y no se guarda la cita. Esto está afectando a 3 pacientes hoy. El error ocurre específicamente cuando intento asignar la cita al Dr. Juan Pérez."

Ticket ID: 1FR85lJCnqwfvHKosiA1
Fecha: 3/3/2026, 11:03:48
Tipo: técnico (URGENTE)
Test Mode: TRUE

---
Este es un email de prueba para verificar el formato de llegada de alertas técnicas.
--------------------------------------------------

🎯 CARACTERÍSTICAS:
🚨 Emoji de urgencia en asunto
🚨 Palabra "URGENTE" en mayúsculas
🚨 Impacto en pacientes mencionado
🚨 Error específico descrito
🚨 Ticket ID para seguimiento
🚨 ALTA prioridad de respuesta inmediata
`);

console.log('\n' + '='.repeat(80));
console.log('🤖 3. CONSULTA CON RESPUESTA DE ANA (formato informativo)');
console.log('='.repeat(80));

console.log(`
ASUNTO: [Consulta FisioTool] Clínica Test

PARA: fisiotoolsaas@gmail.com
DE: FisioTool Pro <info@fisiotool.com>
TIPO: INFO

CONTENIDO:
--------------------------------------------------
Clínica: Clínica Test (test@clinica.com)
Mensaje: ¿Cómo cambio la hora de cierre los viernes?

Ana ya ha enviado respuesta automática al usuario.

---
Este es un email de prueba para verificar el formato de llegada de consultas.
--------------------------------------------------

🎯 CARACTERÍSTICAS:
✅ Formato estándar de consulta
✅ Notificación de respuesta automática
✅ Prioridad media
✅ Para seguimiento de Ana
✅ Sin urgencia aparente
`);

console.log('\n' + '='.repeat(80));
console.log('📊 DIFERENCIAS CLAVE DEL SISTEMA');
console.log('='.repeat(80));

console.log(`
🎯 SUGERENCIAS:
├── Asunto: [SUGERENCIA] - Calmado
├── Prioridad: Baja (para roadmap)
├── Respuesta: No inmediata
├── Almacenamiento: BD + Email admin
└── Frecuencia: Acumulativa para revisión

🚨 ALERTAS TÉCNICAS:
├── Asunto: 🚨 URGENTE - Alta prioridad
├── Prioridad: INMEDIATA
├── Respuesta: Requerida ASAP
├── Almacenamiento: BD + Email urgente
└── Frecuencia: Eventual, crítico

🤖 CONSULTAS:
├── Asunto: [Consulta] - Estándar
├── Prioridad: Media
├── Respuesta: Ana automática + admin copy
├── Almacenamiento: BD + Email seguimiento
└── Frecuencia: Regular, soporte diario

📧 FLUJO DE RESPUESTA:
├── Sugerencias → Revisión periódica → Roadmap
├── Alertas → Respuesta inmediata → Resolución
└── Consultas → Ana responde → Seguimiento si necesario
`);

console.log('\n🎉 ¡DEMOSTRACIÓN COMPLETADA!');
console.log('📧 Los emails llegarían a fisiotoolsaas@gmail.com con estos formatos diferenciales');
console.log('🔍 El sistema prioriza automáticamente según el tipo y formato del asunto');
