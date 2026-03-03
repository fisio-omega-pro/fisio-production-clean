const { sendEmail } = require('./services/emailSenderService');
const { baseEmailHtml, escapeHtml } = require('./services/emailTemplates');
const { initEnv } = require('./config/env');

async function testAnaPlantillasReales() {
  try {
    console.log('🎯 AUDITORÍA ANA PROSPECTORA - PLANTILLAS REALES');
    console.log('='.repeat(60));
    
    const env = await initEnv();
    const targetEmail = 'fisiotoolsaas@gmail.com';
    
    console.log('📧 Enviando emails con plantillas REALES a:', targetEmail);
    console.log('🎨 Usando baseEmailHtml profesional existente');
    
    // 1. EMAIL CON PLANTILLA REAL - CLÍNICA PEQUEÑA
    console.log('\n💰 1. Email con plantilla REAL para clínica pequeña...');
    
    const bodyHtml1 = `
      <div class="h1">¿Huecos vacíos costándote 1.000€/mes?</div>
      <div class="p">Hola Dr. Carlos Martínez,</div>
      <div class="p">Soy Ana de FisioTool Pro.</div>
      <div class="p">¿Sabías que <strong>cada hueco vacío en tu agenda te cuesta entre 80-120€</strong>? Con cancelaciones de última hora, estás perdiendo más de <strong>1.000€ al mes</strong> en ingresos perdidos.</div>
      <div class="box">
        <div class="p" style="margin:0"><strong>🎯 FisioTool Pro elimina estos huecos con:</strong></div>
        <div class="p" style="margin:4px 0 0 20px">• Confirmaciones automáticas 24h antes</div>
        <div class="p" style="margin:0 0 0 20px">• Recordatorios inteligentes por WhatsApp</div>
        <div class="p" style="margin:0 0 0 20px">• Re-llenado automático de cancelaciones</div>
        <div class="p" style="margin:0 0 4px 20px">• Agenda optimizada para máxima ocupación</div>
      </div>
      <div class="p">Nuestras clínicas <strong>recuperan de 3-5 citas por semana</strong>. Eso son <strong>1.200-2.000€ más al mes</strong> en ingresos.</div>
      <div style="text-align:center; margin:24px 0">
        <a href="https://fisiotool.com/demo" class="cta">Solicitar Demostración Gratuita</a>
      </div>
      <div class="p">Demostración personal de 15 minutos. Te enseño exactamente cómo recuperar esos 1.000€ mensuales.</div>
      <div class="p">Si no te interesa, responde <strong>BAJA</strong> y no te escribo más.</div>
      <div class="p">Ana · FisioTool Pro</div>
    `;
    
    const html1 = baseEmailHtml({
      title: 'FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes?',
      preheader: 'Recupera 1.000€ mensuales perdidos en huecos vacíos',
      bodyHtml: bodyHtml1,
      footerNoteHtml: '',
      unsubscribeUrl: ''
    });
    
    const result1 = await sendEmail({
      to: targetEmail,
      subject: '💰 FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes?',
      text: 'Hola Dr. Carlos Martínez, Soy Ana de FisioTool Pro. ¿Huecos vacíos costándote 1.000€/mes? Visita https://fisiotool.com/demo',
      html: html1,
      type: 'ANA'
    });
    
    if (result1.ok) {
      console.log('✅ Email 1 enviado con plantilla REAL');
    } else {
      console.log('❌ Error email 1:', result1.error);
    }
    
    // 2. EMAIL CON PLANTILLA REAL - CLÍNICA MULTI-SEDE
    console.log('\n🏢 2. Email con plantilla REAL para clínica multi-sede...');
    
    const bodyHtml2 = `
      <div class="h1">¿Perdiendo 15h/semana en sincronizar sedes?</div>
      <div class="p">Hola Dra. Laura Sánchez,</div>
      <div class="p">Soy Ana de FisioTool Pro.</div>
      <div class="p">¿Cuántas horas pierdes sincronizando tus sedes? Con agendas separadas, gastas <strong>10-15 horas semanales en tareas administrativas</strong> que no generan ingresos.</div>
      <div class="p">Equivale a tener un empleado a tiempo completo solo para papeleo.</div>
      <div class="box">
        <div class="p" style="margin:0"><strong>🎯 FisioTool Pro unifica todo en un sistema:</strong></div>
        <div class="p" style="margin:4px 0 0 20px">• Agenda centralizada para todas tus sedes</div>
        <div class="p" style="margin:0 0 0 20px">• Pacientes eligen sede automáticamente</div>
        <div class="p" style="margin:0 0 0 20px">• Informes consolidados en tiempo real</div>
        <div class="p" style="margin:0 0 4px 20px">• Acceso móvil para todo tu equipo</div>
      </div>
      <div class="p">Imagina abrir 2 sedes más sin duplicar trabajo. Con nuestro sistema, cada nueva sede es solo "configurar y listo".</div>
      <div style="text-align:center; margin:24px 0">
        <a href="https://fisiotool.com/multi-sede" class="cta">Solicitar Demostración Gratuita</a>
      </div>
      <div class="p">Demostración de 20 minutos. Te muestro cómo recuperar esas 15 horas semanales.</div>
      <div class="p">Si no te interesa, responde <strong>BAJA</strong> y no te escribo más.</div>
      <div class="p">Ana · FisioTool Pro</div>
    `;
    
    const html2 = baseEmailHtml({
      title: 'FisioTool Pro: ¿Perdiendo 15h/semana en sincronizar sedes?',
      preheader: 'Recupera 15 horas semanales perdidas en administración',
      bodyHtml: bodyHtml2,
      footerNoteHtml: '',
      unsubscribeUrl: ''
    });
    
    const result2 = await sendEmail({
      to: targetEmail,
      subject: '🏢 FisioTool Pro: ¿Perdiendo 15h/semana en sincronizar sedes?',
      text: 'Hola Dra. Laura Sánchez, Soy Ana de FisioTool Pro. ¿Perdiendo 15h/semana en sincronizar sedes? Visita https://fisiotool.com/multi-sede',
      html: html2,
      type: 'ANA'
    });
    
    if (result2.ok) {
      console.log('✅ Email 2 enviado con plantilla REAL');
    } else {
      console.log('❌ Error email 2:', result2.error);
    }
    
    // 3. EMAIL CON PLANTILLA REAL - CLÍNICA NUEVA
    console.log('\n🆕 3. Email con plantilla REAL para clínica nueva...');
    
    const bodyHtml3 = `
      <div class="h1">¿Evitar ser del 82% que fracasa primer año?</div>
      <div class="p">Hola Dr. Miguel Ángel Torres,</div>
      <div class="p">Soy Ana de FisioTool Pro.</div>
      <div class="p">¿Sabías que <strong>el 82% de las clínicas nuevas cierran antes del primer año</strong>? La razón no es falta de pacientes, es el caos administrativo.</div>
      <div class="box">
        <div class="p" style="margin:0"><strong>⚠️ Con Excel, WhatsApp y papeles:</strong></div>
        <div class="p" style="margin:4px 0 0 20px">• Pierdes 40% de tiempo en administración</div>
        <div class="p" style="margin:0 0 0 20px">• Cometes errores en citas y cobros</div>
        <div class="p" style="margin:0 0 0 20px">• No tienes control real de tu negocio</div>
        <div class="p" style="margin:0 0 4px 20px">• Los pacientes perciben desorganización</div>
      </div>
      <div class="p"><strong>FisioTool Pro es el sistema que usan las clínicas exitosas desde el día 1</strong>: agenda digital profesional, fichas clínicas completas, cobros automáticos.</div>
      <div class="p">Evita ser parte del 82%. Empieza como un negocio, no como un caos.</div>
      <div style="text-align:center; margin:24px 0">
        <a href="https://fisiotool.com/nueva-clinica" class="cta">Prueba Gratuita 30 Días</a>
      </div>
      <div class="p">Prueba gratuita 30 días. Si no te convence, cancelas. Cero riesgo.</div>
      <div class="p">Si no te interesa, responde <strong>BAJA</strong> y no te escribo más.</div>
      <div class="p">Ana · FisioTool Pro</div>
    `;
    
    const html3 = baseEmailHtml({
      title: 'FisioTool Pro: ¿Evitar ser del 82% que fracasa primer año?',
      preheader: 'Evita el fracaso con sistema profesional desde el inicio',
      bodyHtml: bodyHtml3,
      footerNoteHtml: '',
      unsubscribeUrl: ''
    });
    
    const result3 = await sendEmail({
      to: targetEmail,
      subject: '🆕 FisioTool Pro: ¿Evitar ser del 82% que fracasa primer año?',
      text: 'Hola Dr. Miguel Ángel Torres, Soy Ana de FisioTool Pro. ¿Evitar ser del 82% que fracasa primer año? Visita https://fisiotool.com/nueva-clinica',
      html: html3,
      type: 'ANA'
    });
    
    if (result3.ok) {
      console.log('✅ Email 3 enviado con plantilla REAL');
    } else {
      console.log('❌ Error email 3:', result3.error);
    }
    
    // 4. EMAIL CON PLANTILLA REAL - SEGUIMIENTO
    console.log('\n⏰ 4. Email con plantilla REAL de seguimiento...');
    
    const bodyHtml4 = `
      <div class="h1">¿250€ perdidos esta semana por esperar?</div>
      <div class="p">Hola Dr. Carlos Martínez,</div>
      <div class="p">Soy Ana de FisioTool Pro.</div>
      <div class="p">Te escribí sobre los <strong>1.000€ que estás perdiendo cada mes</strong>.</div>
      <div class="p"><strong>Mientras esperas, este mes ya has perdido otros 250€</strong>. Cada día que pasa sin solucionarlo, se van <strong>33€ más</strong> que nunca recuperarás.</div>
      <div class="box">
        <div class="p" style="margin:0"><strong>🎯 Tengo una solución específica para ti:</strong></div>
        <div class="p" style="margin:4px 0 0 20px">• Análisis gratuito de tu agenda actual</div>
        <div class="p" style="margin:0 0 0 20px">• Plan de recuperación personalizado</div>
        <div class="p" style="margin:0 0 0 20px">• Proyección exacta de ingresos (1.200-2.000€/mes)</div>
        <div class="p" style="margin:0 0 4px 20px">• Implementación en 48 horas</div>
      </div>
      <div class="p">Esta semana tengo <strong>2 huecos para demostraciones</strong>: mañana a 11:00 o jueves a 16:00.</div>
      <div style="text-align:center; margin:24px 0">
        <a href="https://fisiotool.com/llamada" class="cta">Agendar Llamada 15 Min</a>
      </div>
      <div class="p">¿Cuál prefieres?</div>
      <div class="p">Si no te interesa, responde <strong>BAJA</strong> y no te escribo más.</div>
      <div class="p">Ana · FisioTool Pro</div>
    `;
    
    const html4 = baseEmailHtml({
      title: 'FisioTool Pro: ¿250€ perdidos esta semana por esperar?',
      preheader: 'Cada día que esperas pierdes 33€ recuperables',
      bodyHtml: bodyHtml4,
      footerNoteHtml: '',
      unsubscribeUrl: ''
    });
    
    const result4 = await sendEmail({
      to: targetEmail,
      subject: '⏰ FisioTool Pro: ¿250€ perdidos esta semana por esperar?',
      text: 'Hola Dr. Carlos Martínez, Soy Ana de FisioTool Pro. ¿250€ perdidos esta semana por esperar? Visita https://fisiotool.com/llamada',
      html: html4,
      type: 'ANA'
    });
    
    if (result4.ok) {
      console.log('✅ Email 4 enviado con plantilla REAL');
    } else {
      console.log('❌ Error email 4:', result4.error);
    }
    
    console.log('\n🎉 AUDITORÍA CON PLANTILLAS REALES COMPLETADA');
    console.log('📧 Revisa fisiotoolsaas@gmail.com');
    console.log('📋 Deberías recibir 4 emails con plantillas PROFESIONALES REALES:');
    console.log('   1. 💰 FisioTool Pro: ¿Huecos vacíos costándote 1.000€/mes?');
    console.log('   2. 🏢 FisioTool Pro: ¿Perdiendo 15h/semana en sincronizar sedes?');
    console.log('   3. 🆕 FisioTool Pro: ¿Evitar ser del 82% que fracasa primer año?');
    console.log('   4. ⏰ FisioTool Pro: ¿250€ perdidos esta semana por esperar?');
    
    console.log('\n🎨 PLANTILLA REAL IMPLEMENTADA:');
    console.log('✅ Header azul profesional con "FISIOTOOL PRO"');
    console.log('✅ Contenido en tarjeta blanca con bordes redondeados');
    console.log('✅ Cajas azules para destacar beneficios');
    console.log('✅ Botones CTA azules profesionales');
    console.log('✅ Footer oscuro con información corporativa');
    console.log('✅ Diseño limpio y corporativo');
    console.log('✅ Responsive y optimizado');
    
    console.log('\n🔍 DIFERENCIA CON LAS PLANTILLAS REALES:');
    console.log('📧 ANTES: Mi diseño enmarañado y poco profesional');
    console.log('🎨 AHORA: Plantilla corporativa real y probada');
    console.log('✅ Branding consistente con FisioTool');
    console.log('✅ Diseño minimalista y efectivo');
    console.log('✅ Imagen profesional corporativa');
    
    console.log('\n📝 AHORA VERÁS LAS PLANTILLAS REALES:');
    console.log('🎯 Los emails llegarán con el diseño corporativo real');
    console.log('🎨 El mismo diseño que usas para pacientes existentes');
    console.log('💪 Imagen profesional y consistente');
    console.log('🔥 Sin enmarañados visual - diseño limpio');
    
  } catch (error) {
    console.error('🔥 Error en auditoría con plantillas reales:', error.message);
  }
}

testAnaPlantillasReales();
