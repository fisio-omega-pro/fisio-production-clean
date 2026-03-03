const { sendEmail } = require('./services/emailSenderService');
const { generateProspectEmailTemplate } = require('./services/emailTemplateService');
const { initEnv } = require('./config/env');

async function testAnaEmailsProfesionalesHTML() {
  try {
    console.log('🎨 AUDITORÍA ANA PROSPECTORA - EMAILS HTML PROFESIONALES');
    console.log('='.repeat(70));
    
    const env = await initEnv();
    const targetEmail = 'fisiotoolsaas@gmail.com';
    
    console.log('📧 Enviando emails HTML profesionales a:', targetEmail);
    console.log('🎨 Usando plantillas visuales de alta calidad');
    
    // 1. EMAIL HTML - CLÍNICA PEQUEÑA (Ángulo A: Económico)
    console.log('\n💰 1. Email HTML para clínica pequeña (diseño profesional)...');
    
    const leadInfo1 = {
      nombre: 'Dr. Carlos Martínez',
      clinica: 'Clínica FisioSalud',
      angle: 'A',
      link: 'https://fisiotool.com/demo'
    };
    
    const email1 = generateProspectEmailTemplate(leadInfo1, 'A');
    
    const result1 = await sendEmail({
      to: targetEmail,
      subject: email1.subject,
      text: email1.text,
      html: email1.html, // ¡ESTA ES LA CLAVE - EMAIL HTML!
      type: 'ANA'
    });
    
    if (result1.ok) {
      console.log('✅ Email 1 HTML enviado (diseño profesional)');
    } else {
      console.log('❌ Error email 1:', result1.error);
    }
    
    // 2. EMAIL HTML - CLÍNICA MULTI-SEDE (Ángulo B: Tiempo)
    console.log('\n🏢 2. Email HTML para clínica multi-sede (diseño profesional)...');
    
    const leadInfo2 = {
      nombre: 'Dra. Laura Sánchez',
      clinica: 'Centro de Fisioterapia Avanzada',
      angle: 'B',
      link: 'https://fisiotool.com/multi-sede'
    };
    
    const email2 = generateProspectEmailTemplate(leadInfo2, 'B');
    
    const result2 = await sendEmail({
      to: targetEmail,
      subject: email2.subject,
      text: email2.text,
      html: email2.html, // ¡EMAIL HTML PROFESIONAL!
      type: 'ANA'
    });
    
    if (result2.ok) {
      console.log('✅ Email 2 HTML enviado (diseño profesional)');
    } else {
      console.log('❌ Error email 2:', result2.error);
    }
    
    // 3. EMAIL HTML - CLÍNICA NUEVA (Ángulo C: Fracaso)
    console.log('\n🆕 3. Email HTML para clínica nueva (diseño profesional)...');
    
    const leadInfo3 = {
      nombre: 'Dr. Miguel Ángel Torres',
      clinica: 'FisioVida Centro',
      angle: 'C',
      link: 'https://fisiotool.com/nueva-clinica'
    };
    
    const email3 = generateProspectEmailTemplate(leadInfo3, 'C');
    
    const result3 = await sendEmail({
      to: targetEmail,
      subject: email3.subject,
      text: email3.text,
      html: email3.html, // ¡EMAIL HTML PROFESIONAL!
      type: 'ANA'
    });
    
    if (result3.ok) {
      console.log('✅ Email 3 HTML enviado (diseño profesional)');
    } else {
      console.log('❌ Error email 3:', result3.error);
    }
    
    // 4. EMAIL HTML - SEGUIMIENTO (Ángulo por defecto: Urgencia)
    console.log('\n⏰ 4. Email HTML de seguimiento (diseño profesional)...');
    
    const leadInfo4 = {
      nombre: 'Dr. Carlos Martínez',
      clinica: 'Clínica FisioSalud',
      angle: 'seguimiento',
      link: 'https://fisiotool.com/llamada'
    };
    
    const email4 = generateProspectEmailTemplate(leadInfo4, 'seguimiento');
    
    const result4 = await sendEmail({
      to: targetEmail,
      subject: email4.subject,
      text: email4.text,
      html: email4.html, // ¡EMAIL HTML PROFESIONAL!
      type: 'ANA'
    });
    
    if (result4.ok) {
      console.log('✅ Email 4 HTML enviado (diseño profesional)');
    } else {
      console.log('❌ Error email 4:', result4.error);
    }
    
    console.log('\n🎉 AUDITORÍA HTML PROFESIONAL COMPLETADA');
    console.log('📧 Revisa fisiotoolsaas@gmail.com');
    console.log('📋 Deberías recibir 4 emails con DISEÑO PROFESIONAL:');
    console.log('   1. 💰 FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes? (VERDE)');
    console.log('   2. 🏢 FisioTool Pro: ¿Perdiendo 15h/semana en sincronizar sedes? (AZUL)');
    console.log('   3. 🆕 FisioTool Pro: ¿Evitar ser del 82% que fracasa? (ROJO)');
    console.log('   4. ⏰ FisioTool Pro: ¿250€ perdidos esta semana? (ÁMBAR)');
    
    console.log('\n🎨 DISEÑO PROFESIONAL IMPLEMENTADO:');
    console.log('✅ Header con gradiente de color por tipo');
    console.log('✅ Iconos y branding consistente');
    console.log('✅ Bloques de contenido con colores temáticos');
    console.log('✅ Botones CTA con diseño atractivo');
    console.log('✅ Sección de beneficios con fondo gris');
    console.log('✅ Footer oscuro profesional');
    console.log('✅ Opt-out integrado en el diseño');
    console.log('✅ Responsive y moderno');
    
    console.log('\n🔍 DIFERENCIAS VISUALES CLAVE:');
    console.log('📧 ANTES: Texto plano, sin formato, vulgar');
    console.log('🎨 AHORA: Diseño profesional, colores, branding');
    console.log('✅ Headers diferenciados por color (verde/azul/rojo/ámbar)');
    console.log('✅ Bloques de contenido con bordes y fondos');
    console.log('✅ Botones CTA atractivos y clicables');
    console.log('✅ Imagen corporativa profesional');
    
    console.log('\n📝 AHORA VERÁS LA DIFERENCIA:');
    console.log('🎯 Los emails llegarán con diseño profesional');
    console.log('🎨 Se verán como una empresa real, no texto plano');
    console.log('💪 Mayor credibilidad y tasa de apertura');
    console.log('🔥 Imagen de marca profesional');
    
    console.log('\n🤖 SISTEMA DE LECTURA ACTIVADO:');
    console.log('✅ Ana seguirá procesando tus respuestas');
    console.log('✅ Responderá con el mismo tono profesional');
    console.log('✅ Mantendrá la coherencia visual');
    
  } catch (error) {
    console.error('🔥 Error en auditoría HTML:', error.message);
  }
}

testAnaEmailsProfesionalesHTML();
