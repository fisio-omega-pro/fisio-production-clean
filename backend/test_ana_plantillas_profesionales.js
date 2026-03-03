const { sendEmail } = require('./services/emailSenderService');
const { anaService } = require('./services/anaService');
const { initEnv } = require('./config/env');

async function testAnaPlantillasProfesionales() {
  try {
    console.log('🎯 AUDITORÍA ANA PROSPECTORA - PLANTILLAS PROFESIONALES');
    console.log('='.repeat(70));
    
    const env = await initEnv();
    const targetEmail = 'fisiotoolsaas@gmail.com';
    
    console.log('📧 Enviando emails con plantillas profesionales a:', targetEmail);
    console.log('🤖 Usando sistema de plantillas de Ana');
    
    // 1. EMAIL CON PLANTILLA - CLÍNICA PEQUEÑA
    console.log('\n💰 1. Email con plantilla para clínica pequeña...');
    
    const leadInfo1 = {
      nombre: 'Dr. Carlos Martínez',
      clinica: 'Clínica FisioSalud',
      contexto: 'Primer contacto',
      attempts: 0,
      angle: 'A', // Enfoque económico
      link: 'https://fisiotool.com/demo'
    };
    
    let body1;
    try {
      body1 = await anaService.generateProspectEmail(leadInfo1);
    } catch (e) {
      console.log('⚠️ Usando plantilla fallback para email 1');
      body1 = `Hola Dr. Carlos Martínez,

Soy Ana de FisioTool Pro.

¿Sabías que cada hueco vacío en tu agenda te cuesta entre 80-120€? Con cancelaciones de última hora, estás perdiendo más de 1.000€ al mes.

FisioTool Pro elimina estos huecos con confirmaciones automáticas y recordatorios inteligentes. Nuestras clínicas recuperan 3-5 citas por semana.

Demostración personal de 15 minutos. Te enseño exactamente cómo recuperar esos 1.000€ mensuales.

https://fisiotool.com/demo

Si no te interesa, responde BAJA y no te escribo más.

Ana · FisioTool Pro`;
    }
    
    const result1 = await sendEmail({
      to: targetEmail,
      subject: '💰 FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes?',
      text: body1,
      type: 'ANA'
    });
    
    if (result1.ok) {
      console.log('✅ Email 1 enviado con plantilla profesional');
    } else {
      console.log('❌ Error email 1:', result1.error);
    }
    
    // 2. EMAIL CON PLANTILLA - CLÍNICA MULTI-SEDE
    console.log('\n🏢 2. Email con plantilla para clínica multi-sede...');
    
    const leadInfo2 = {
      nombre: 'Dra. Laura Sánchez',
      clinica: 'Centro de Fisioterapia Avanzada',
      contexto: 'Primer contacto',
      attempts: 0,
      angle: 'C', // Enfoque crecimiento
      link: 'https://fisiotool.com/multi-sede'
    };
    
    let body2;
    try {
      body2 = await anaService.generateProspectEmail(leadInfo2);
    } catch (e) {
      console.log('⚠️ Usando plantilla fallback para email 2');
      body2 = `Hola Dra. Laura Sánchez,

Soy Ana de FisioTool Pro.

¿Cuántas horas pierdes sincronizando tus sedes? Con agendas separadas, gastas 15 horas semanales en tareas administrativas.

FisioTool Pro unifica todo: agenda centralizada, pacientes eligen sede automáticamente, informes consolidados. Abre nuevas sedes sin duplicar trabajo.

Demostración de 20 minutos. Te muestro cómo recuperar esas 15 horas semanales.

https://fisiotool.com/multi-sede

Si no te interesa, responde BAJA y no te escribo más.

Ana · FisioTool Pro`;
    }
    
    const result2 = await sendEmail({
      to: targetEmail,
      subject: '🏢 FisioTool Pro: ¿15h/semana en sincronizar sedes?',
      text: body2,
      type: 'ANA'
    });
    
    if (result2.ok) {
      console.log('✅ Email 2 enviado con plantilla profesional');
    } else {
      console.log('❌ Error email 2:', result2.error);
    }
    
    // 3. EMAIL CON PLANTILLA - CLÍNICA NUEVA
    console.log('\n🆕 3. Email con plantilla para clínica nueva...');
    
    const leadInfo3 = {
      nombre: 'Dr. Miguel Ángel Torres',
      clinica: 'FisioVida Centro',
      contexto: 'Primer contacto',
      attempts: 0,
      angle: 'B', // Enfoque tiempo/paz mental
      link: 'https://fisiotool.com/nueva-clinica'
    };
    
    let body3;
    try {
      body3 = await anaService.generateProspectEmail(leadInfo3);
    } catch (e) {
      console.log('⚠️ Usando plantilla fallback para email 3');
      body3 = `Hola Dr. Miguel Ángel Torres,

Soy Ana de FisioTool Pro.

¿Sabías que el 82% de las clínicas nuevas cierran antes del primer año? La razón no es falta de pacientes, es el caos administrativo.

FisioTool Pro es el sistema que usan las clínicas exitosas desde el día 1: agenda digital, fichas clínicas, cobros automáticos.

Evita ser parte del 82%. Empieza como un negocio, no como un caos.

Prueba gratuita 30 días. Si no te convence, cancelas. Cero riesgo.

https://fisiotool.com/nueva-clinica

Si no te interesa, responde BAJA y no te escribo más.

Ana · FisioTool Pro`;
    }
    
    const result3 = await sendEmail({
      to: targetEmail,
      subject: '🆕 FisioTool Pro: ¿Evitar ser del 82% que fracasa?',
      text: body3,
      type: 'ANA'
    });
    
    if (result3.ok) {
      console.log('✅ Email 3 enviado con plantilla profesional');
    } else {
      console.log('❌ Error email 3:', result3.error);
    }
    
    // 4. EMAIL DE SEGUIMIENTO CON PLANTILLA
    console.log('\n🔄 4. Email de seguimiento con plantilla...');
    
    const leadInfo4 = {
      nombre: 'Dr. Carlos Martínez',
      clinica: 'Clínica FisioSalud',
      contexto: 'Seguimiento 1',
      attempts: 1,
      angle: 'A',
      link: 'https://fisiotool.com/llamada'
    };
    
    let body4;
    try {
      body4 = await anaService.generateProspectEmail(leadInfo4);
    } catch (e) {
      console.log('⚠️ Usando plantilla fallback para email 4');
      body4 = `Hola Dr. Carlos Martínez,

Soy Ana de FisioTool Pro.

Te escribí sobre los 1.000€ que estás perdiendo cada mes. Mientras esperas, este mes ya has perdido otros 250€.

Tengo una solución específica para ti: análisis gratuito de tu agenda, plan personalizado, y proyección exacta de ingresos adicionales.

Esta semana tengo 2 huecos para demostraciones: mañana a 11:00 o jueves a 16:00.

¿Cuál prefieres?

https://fisiotool.com/llamada

Si no te interesa, responde BAJA y no te escribo más.

Ana · FisioTool Pro`;
    }
    
    const result4 = await sendEmail({
      to: targetEmail,
      subject: '⏰ FisioTool Pro: ¿250€ perdidos esta semana?',
      text: body4,
      type: 'ANA'
    });
    
    if (result4.ok) {
      console.log('✅ Email 4 enviado con plantilla profesional');
    } else {
      console.log('❌ Error email 4:', result4.error);
    }
    
    console.log('\n🎉 AUDITORÍA CON PLANTILLAS COMPLETADA');
    console.log('📧 Revisa fisiotoolsaas@gmail.com');
    console.log('📋 Deberías recibir 4 emails con plantillas profesionales:');
    console.log('   1. 💰 FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes?');
    console.log('   2. 🏢 FisioTool Pro: ¿15h/semana en sincronizar sedes?');
    console.log('   3. 🆕 FisioTool Pro: ¿Evitar ser del 82% que fracasa?');
    console.log('   4. ⏰ FisioTool Pro: ¿250€ perdidos esta semana?');
    
    console.log('\n🔍 DIFERENCIAS CON PLANTILLAS PROFESIONALES:');
    console.log('✅ Asuntos consistentes: "FisioTool Pro: [pregunta]"');
    console.log('✅ Firma estandarizada: "Ana · FisioTool Pro"');
    console.log('✅ Opt-out profesional: "responde BAJA"');
    console.log('✅ Estructura coherente en todos los emails');
    console.log('✅ Links específicos por tipo de clínica');
    console.log('✅ Tono profesional pero cercano');
    
    console.log('\n🤖 SISTEMA DE LECTURA DE RESPUESTAS:');
    console.log('✅ Ana procesará tus respuestas automáticamente');
    console.log('✅ Clasificará: INTERESADO / NO INTERESADO / DUDA');
    console.log('✅ Responderá según el tipo de respuesta');
    console.log('✅ Actualizará el estado del lead');
    
    console.log('\n📝 AHORA RESPONDE A ESTOS EMAILS:');
    console.log('1. Responde "INTERESADO" al email de 💰');
    console.log('2. Responde "NO GRACIAS" al email de 🏢');
    console.log('3. Pregunta "¿Cuánto cuesta?" al email de 🆕');
    console.log('4. Responde "BAJA" al email de ⏰');
    console.log('5. Verás cómo Ana procesa cada respuesta con plantillas');
    
  } catch (error) {
    console.error('🔥 Error en auditoría con plantillas:', error.message);
  }
}

testAnaPlantillasProfesionales();
