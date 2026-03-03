// 🎨 SERVICIO DE PLANTILLAS DE EMAIL PROFESIONALES

const generateProspectEmailTemplate = (leadInfo, angle = 'A') => {
  const safe = (v) => String(v ?? '').trim();
  const nombre = safe(leadInfo?.nombre) || '';
  const clinica = safe(leadInfo?.clinica) || '';
  const link = safe(leadInfo?.link || leadInfo?.landingUrl || 'https://fisiotool.com');
  
  // Contenido específico según ángulo
  let contenido = '';
  let asunto = '';
  let colorPrincipal = '';
  let icono = '';
  
  switch(angle) {
    case 'A': // Económico
      asunto = '💰 ¿Huecos vacíos costándote 1.000€/mes?';
      colorPrincipal = '#10B981'; // Verde éxito
      icono = '💰';
      contenido = `
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ¿Sabías que <strong style="color: #059669;">cada hueco vacío en tu agenda te cuesta entre 80-120€</strong>? 
          Con cancelaciones de última hora y pacientes que no confirman, estás perdiendo más de 
          <strong style="color: #059669;">1.000€ al mes</strong> en ingresos perdidos.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Es como tirar dinero por el ventanillo todos los días.
        </p>
        <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #065F46; font-size: 15px; margin: 0; font-weight: 600;">
            🎯 FisioTool Pro elimina estos huecos vacíos con:
          </p>
          <ul style="color: #065F46; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Confirmaciones automáticas 24h antes</li>
            <li>Recordatorios inteligentes por WhatsApp</li>
            <li>Re-llenado automático de cancelaciones</li>
            <li>Agenda optimizada para máxima ocupación</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Nuestras clínicas <strong style="color: #059669;">recuperan de 3-5 citas por semana</strong>. 
          Eso son <strong style="color: #059669;">1.200-2.000€ más al mes</strong> en ingresos que ahora estás perdiendo.
        </p>
      `;
      break;
      
    case 'B': // Tiempo
      asunto = '🏢 ¿Perdiendo 15h/semana en sincronizar sedes?';
      colorPrincipal = '#3B82F6'; // Azul
      icono = '🏢';
      contenido = `
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ¿Cuántas horas a la semana pierdes sincronizando tus sedes? Con agendas separadas, 
          dobles reservas, y pacientes que no saben en qué sede les toca, estás gastando 
          <strong style="color: #1D4ED8;">10-15 horas semanales en tareas administrativas</strong> que no generan ingresos.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Equivale a tener un empleado a tiempo completo solo para papeleo.
        </p>
        <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #1E40AF; font-size: 15px; margin: 0; font-weight: 600;">
            🎯 FisioTool Pro unifica todo en un sistema inteligente:
          </p>
          <ul style="color: #1E40AF; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Agenda centralizada para todas tus sedes</li>
            <li>Pacientes pueden elegir sede automáticamente</li>
            <li>Informes consolidados en tiempo real</li>
            <li>Acceso móvil para todo tu equipo</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Imagina abrir 2 sedes más sin duplicar trabajo. Con nuestro sistema, 
          cada nueva sede es solo "configurar y listo".
        </p>
      `;
      break;
      
    case 'C': // Fracaso
      asunto = '🆕 ¿Evitar ser del 82% que fracasa primer año?';
      colorPrincipal = '#EF4444'; // Rojo advertencia
      icono = '🆕';
      contenido = `
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ¿Sabías que <strong style="color: #DC2626;">el 82% de las clínicas de fisioterapia nuevas cierran antes del primer año</strong>? 
          La razón no es falta de pacientes, es el caos administrativo que te ahoga antes de poder crecer.
        </p>
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #991B1B; font-size: 15px; margin: 0; font-weight: 600;">
            ⚠️ Con Excel, WhatsApp y papeles:
          </p>
          <ul style="color: #991B1B; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Pierdes 40% de tiempo en administración</li>
            <li>Cometes errores en citas y cobros</li>
            <li>No tienes control real de tu negocio</li>
            <li>Los pacientes perciben desorganización</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          <strong style="color: #DC2626;">FisioTool Pro es el sistema que usan las clínicas exitosas desde el día 1</strong>: 
          agenda digital profesional, fichas clínicas completas y legales, cobros automáticos.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Evita ser parte del 82%. Empieza como un negocio, no como un caos.
        </p>
      `;
      break;
      
    default: // Seguimiento
      asunto = '⏰ ¿250€ perdidos esta semana por esperar?';
      colorPrincipal = '#F59E0B'; // Ámbar urgencia
      icono = '⏰';
      contenido = `
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Te escribí sobre los <strong style="color: #D97706;">1.000€ que estás perdiendo cada mes en huecos vacíos</strong>.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          <strong style="color: #D97706;">Mientras esperas, este mes ya has perdido otros 250€</strong>. 
          Cada día que pasa sin solucionarlo, se van <strong style="color: #D97706;">33€ más</strong> que nunca recuperarás.
        </p>
        <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #92400E; font-size: 15px; margin: 0; font-weight: 600;">
            🎯 Tengo una solución específica para ti:
          </p>
          <ul style="color: #92400E; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px;">
            <li>Análisis gratuito de tu agenda actual</li>
            <li>Plan de recuperación de huecos vacíos personalizado</li>
            <li>Proyección exacta de ingresos adicionales (1.200-2.000€/mes)</li>
            <li>Implementación en 48 horas</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Esta semana tengo <strong style="color: #D97706;">2 huecos para demostraciones</strong>. 
          Son de 15 minutos, pero en ese tiempo te mostraré exactamente cómo recuperar esos 1.000€ mensuales.
        </p>
      `;
      break;
  }
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FisioTool Pro - ${asunto}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F9FAFB;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${colorPrincipal} 0%, ${colorPrincipal}CC 100%); padding: 24px 0; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 32px; margin-right: 12px;">${icono}</span>
                <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">FisioTool Pro</h1>
            </div>
            <p style="color: white; font-size: 18px; margin: 0; opacity: 0.9;">${asunto}</p>
        </div>
    </div>
    
    <!-- Main Content -->
    <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px; background: white;">
        
        <!-- Personalization -->
        <div style="margin-bottom: 24px;">
            <p style="color: #6B7280; font-size: 16px; margin: 0;">Hola ${nombre},</p>
        </div>
        
        <!-- Main Content -->
        <div style="margin-bottom: 32px;">
            ${contenido}
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="display: inline-block; background: ${colorPrincipal}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Solicitar Demostración Gratuita
            </a>
        </div>
        
        <!-- Benefits -->
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">✅ Beneficios inmediatos:</p>
            <ul style="color: #6B7280; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>30 días de prueba gratis</li>
                <li>Si no te convence, cancelas y no pagas</li>
                <li>Sin permanencia ni compromisos</li>
                <li>Implementación en menos de 48 horas</li>
            </ul>
        </div>
        
        <!-- Opt-out -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                Si no te interesa, responde <strong style="color: #6B7280;">BAJA</strong> y no te escribiré más.
            </p>
        </div>
        
    </div>
    
    <!-- Footer -->
    <div style="background: #111827; padding: 24px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto;">
            <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 8px 0;">Ana · FisioTool Pro</p>
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
                Tu asistente inteligente para clínicas de fisioterapia
            </p>
        </div>
    </div>
    
</body>
</html>
  `;
  
  return {
    html: htmlTemplate,
    text: `
Hola ${nombre},

Soy Ana de FisioTool Pro.

${asunto}

Te invito a una demostración gratuita donde te mostraré exactamente cómo podemos ayudarte.

${link}

Si no te interesa, responde BAJA y no te escribo más.

Ana · FisioTool Pro
    `.trim(),
    subject: `FisioTool Pro: ${asunto}`
  };
};

module.exports = {
  generateProspectEmailTemplate
};
