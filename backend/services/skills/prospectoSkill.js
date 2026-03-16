/**
 * 🎯 PROSPECTO SKILL - Experto en Venta y Conversión con IA Dinámica
 * 
 * Ana especializada para prospectos que quieren conocer FisioTool Pro.
 * Usa Claude/Gemini para generar respuestas naturales y conversacionales.
 * Aprende de cada interacción con HiveMind.
 */

const { Skill } = require('../anaSkillEngine');
const { registerCollectiveExperience } = require('../hiveMindService');
const claudeService = require('../claudeService');

class ProspectoSkill extends Skill {
  constructor() {
    super('prospecto', 'Experto en Ventas', 'Especialista en convertir prospectos en clientes');

    this.addIntent('whatIsFisioTool', [
      'qué es fisiotool', 'que es esto', 'de qué trata', 'qué ofrece',
      'para qué sirve', 'qué hace', 'explicame', 'cuéntame', 'como funciona',
      'ayudar', 'puede ayudar'
    ]);

    this.addIntent('pricing', [
      'precio', 'cuánto cuesta', 'cuanto vale', 'coste', 'tarifa',
      'planes', 'suscripción', 'pago', 'cuota'
    ]);

    this.addIntent('features', [
      'características', 'funciones', 'qué incluye', 'que tiene',
      'módulos', 'herramientas', 'capacidades'
    ]);

    this.addIntent('roi', [
      'rentabilidad', 'retorno', 'beneficio', 'ahorro', 'recuperar inversión',
      'vale la pena', 'merece', 'resultados'
    ]);

    this.addIntent('casosExito', [
      'casos de éxito', 'testimonios', 'clientes', 'referencias',
      'quién lo usa', 'ejemplos', 'experiencias'
    ]);

    this.addIntent('readyToRegister', [
      'quiero registrarme', 'me interesa', 'cómo empiezo', 'quiero probarlo',
      'me apunto', 'quiero más información', 'siguiente paso'
    ]);

    this.addIntent('escalarClinica', [
      'escalar', 'crecer', 'más clientes', 'nuevos clientes', 'llenar agenda',
      'huecos vacíos', 'huecos libres', 'citas vacías', 'paliar huecos',
      'recuperar pacientes', 'captar pacientes', 'aumentar citas',
      'pacientes inactivos', 'base de datos', 'antigua base de datos',
      'subir pacientes', 'importar pacientes', 'prospectar'
    ]);

    this.addIntent('appPacientes', [
      'app', 'aplicación', 'móvil', 'descargar', 'pacientes descarguen',
      'notificaciones', 'mensajes directos', 'push', 'pwa'
    ]);

    this.addIntent('seguimientoPacientes', [
      'seguimiento', 'recordatorio', 'historial', 'datos paciente',
      'leer datos', 'analizar', 'recomendar cita', 'próxima cita',
      'alta', 'paciente inactivo', 'no vuelve'
    ]);
  }

  getSystemPrompt() {
    return `Eres Ana, asesora de ventas experta de FisioTool Pro. Eres brillante, cercana y conoces el producto al 100%. Tu misión: convertir fisioterapeutas indecisos en clientes convencidos.

════════════════════════════════
📊 QUÉ ES FISIOTOOL PRO
════════════════════════════════
El sistema de gestión más avanzado para clínicas de fisioterapia en España. No es solo software: es un socio que trabaja 24/7 para llenar tu agenda, recuperar pacientes perdidos y eliminar el trabajo administrativo.

════════════════════════════════
🎯 SUPERPODER #1 — PROSPECCIÓN ACTIVA DE PACIENTES
════════════════════════════════
Esta es la funcionalidad más potente y la que más impacta en el crecimiento:

• IMPORTACIÓN DE BASE DE DATOS: Al registrarse en FisioTool, el fisio puede subir toda su base de datos de pacientes existente (Excel, CSV). Ana los importa automáticamente.

• CAMPAÑAS DE REACTIVACIÓN: Ana detecta pacientes inactivos (ej: no vienen hace 3+ meses) y les manda emails personalizados automáticamente. Mensajes del tipo: "Hace tiempo que no te vemos, ¿cómo está tu espalda? Tienes un hueco disponible el martes a las 10h". Sin que el fisio tenga que hacer nada.

• MENSAJES DIRECTOS EN-APP: Si el paciente tiene la app de la clínica instalada (PWA), Ana puede enviarle notificaciones push y mensajes directos directamente en el móvil. Sin WhatsApp, sin intermediarios.

• OFERTAS Y PROMOCIONES: Ana puede enviar mensajes masivos a toda la base de datos o segmentos específicos. Ej: "Esta semana tenemos 5 huecos libres, los 3 primeros tienen 15% de descuento."

• RESULTADO REAL: Las clínicas recuperan 15-25 pacientes inactivos en el primer mes. Son citas que ya existían pero se habían perdido.

════════════════════════════════
🧠 SUPERPODER #2 — ANA LEE DATOS Y RECOMIENDA
════════════════════════════════
• Ana tiene acceso al historial completo de cada paciente: diagnóstico, sesiones, evolución, última visita.
• Detecta automáticamente cuándo un paciente debería volver según su tratamiento y le manda el recordatorio.
• Ejemplo real: paciente con lumbalgia crónica → Ana sabe que necesita revisión cada 6 semanas → le manda mensaje automático antes de que el dolor vuelva.
• El fisio puede pedirle a Ana que analice qué pacientes tienen más riesgo de abandono y actúe proactivamente.

════════════════════════════════
📱 SUPERPODER #3 — APP PROPIA DE LA CLÍNICA (PWA)
════════════════════════════════
• Cada clínica tiene su propia app móvil personalizada con su logo y nombre. Sin App Store, sin coste extra.
• Los pacientes la instalan desde el navegador en 10 segundos.
• Funciona offline, manda notificaciones push, permite reservar citas, ver bonos, pagar fianzas.
• Es el canal directo entre la clínica y el paciente. Sin depender de WhatsApp ni email.

════════════════════════════════
🚀 RESTO DE FUNCIONALIDADES
════════════════════════════════
• Ana IA: Gestiona citas 24/7, cobra fianzas automáticamente, manda recordatorios
• Dashboard: Agenda inteligente, historial de pacientes, finanzas, notas clínicas, equipo
• Pagos: Fianzas obligatorias (elimina no-shows), bonos de sesiones, Stripe integrado
• HiveMind: El sistema aprende de todas las clínicas y mejora continuamente
• Foundry: Panel de control avanzado para gestión y análisis del negocio
• GDPR 100%, servidores EU (Google Cloud), cifrado end-to-end

════════════════════════════════
💰 PRECIOS
════════════════════════════════
• Starter: 49€/mes — Hasta 100 pacientes, Ana básica
• Professional: 99€/mes ⭐ MÁS POPULAR — Ilimitado, Ana avanzada con prospección, HiveMind
• Enterprise: Personalizado — Multi-clínica, API, soporte dedicado
• OFERTA ACTUAL: 30 días GRATIS + 20% descuento primer año. Sin permanencia.

════════════════════════════════
📈 ROI DEMOSTRADO
════════════════════════════════
• +15-25 pacientes reactivados el primer mes (prospección activa)
• Recuperan 8-12 citas/mes por fianzas = 400-600€
• Ahorran 2-3h/día de trabajo admin = 500€/mes
• ROI total: +1.100€/mes netos con plan Pro de 99€
• Recuperan la inversión en 2-3 días
• 50+ clínicas | +42% citas | +38% ingresos | 4.9/5 satisfacción

════════════════════════════════
TU ESTILO DE VENTA
════════════════════════════════
- Conversacional y cercana, como una amiga que sabe mucho
- Usa el nombre del prospecto siempre que puedas
- Respuestas de máximo 120 palabras. Concisa y directa.
- Emojis con moderación (1-2 máximo)
- ESCUCHA primero: haz preguntas para entender su punto de dolor
- Responde ESPECÍFICAMENTE a su problema real, no des el catálogo completo
- Si mencionan huecos vacíos → habla de prospección activa y reactivación
- Si mencionan pacientes que no vuelven → habla del seguimiento inteligente
- Si preguntan por app → explica la PWA y mensajes directos
- NO repitas bienvenidas ni te presentes de nuevo si ya hay conversación
- Cierra siempre con una pregunta o con el paso siguiente concreto
- Registro en: www.fisiotool.com`;
  }

  async execute(intent, entities, context) {
    const { userName, userEmail, conversationHistory = [] } = context;
    const message = entities.message || '';

    const systemPrompt = this.getSystemPrompt();
    
    let intentContext = '';
    switch (intent) {
      case 'whatIsFisioTool':
        intentContext = 'El prospecto quiere saber qué es FisioTool Pro y cómo funciona.';
        break;
      case 'pricing':
        intentContext = 'El prospecto pregunta por precios y planes.';
        break;
      case 'features':
        intentContext = 'El prospecto quiere conocer características y funciones.';
        break;
      case 'roi':
        intentContext = 'El prospecto quiere entender el retorno de inversión.';
        break;
      case 'casosExito':
        intentContext = 'El prospecto quiere ver casos de éxito y testimonios.';
        break;
      case 'readyToRegister':
        intentContext = 'El prospecto está listo para registrarse. Guíalo hacia www.fisiotool.com con entusiasmo y claridad.';
        break;
      case 'escalarClinica':
        intentContext = 'El prospecto quiere escalar su clínica, llenar huecos vacíos o recuperar pacientes inactivos. RESPONDE explicando la prospección activa: importación de base de datos existente, campañas de reactivación automáticas por email, mensajes directos en-app. Esto es exactamente lo que necesita.';
        break;
      case 'appPacientes':
        intentContext = 'El prospecto pregunta por la app para pacientes. Explica la PWA: app propia de la clínica sin App Store, mensajes directos, notificaciones push, reservas y pagos desde el móvil.';
        break;
      case 'seguimientoPacientes':
        intentContext = 'El prospecto quiere saber cómo Ana hace seguimiento de pacientes. Explica que Ana lee el historial clínico, detecta cuándo debe volver un paciente según su tratamiento, y manda recordatorios automáticos antes de que el dolor vuelva.';
        break;
      default:
        intentContext = 'Conversación general. Escucha, identifica el punto de dolor del prospecto y conecta con la funcionalidad más relevante para su situación.';
    }

    const userPrompt = `${intentContext}

Mensaje del prospecto${userName ? ` (${userName})` : ''}: "${message}"

Responde de forma natural, conversacional y específica a su pregunta. Máximo 150 palabras.`;

    let response = '';
    let outcome = 'informado';

    try {
      console.log(`🤖 [PROSPECTO] Generando respuesta | Historial: ${conversationHistory.length} msgs`);
      // claudeService ya maneja fallback a Gemini internamente
      response = await claudeService.generateResponse(userPrompt, {
        systemPrompt,
        conversationHistory,
        maxTokens: 300
      });
      console.log('✅ [PROSPECTO] Respuesta generada');
      outcome = this.determineOutcome(intent, response);
    } catch (aiError) {
      console.error('🔥 [PROSPECTO] Error IA:', aiError.message);
      response = this.getFallbackResponse(intent, userName);
      outcome = 'fallback_usado';
    }

    try {
      await registerCollectiveExperience('global_prospects', {
        type: 'prospecto_interaction',
        context: [intent, message],
        solution: response.substring(0, 200),
        outcome: outcome,
        confidence: 0.9,
        impact_score: intent === 'readyToRegister' ? 10 : 7
      });
    } catch (error) {
      console.error('🔥 [PROSPECTO] Error registrando en HiveMind:', error);
    }

    return {
      text: response,
      confidence: 0.95,
      metadata: {
        outcome,
        intent,
        aiUsed: response.includes('FisioTool') ? 'claude_or_gemini' : 'fallback'
      }
    };
  }

  determineOutcome(intent, response) {
    if (intent === 'readyToRegister' || response.toLowerCase().includes('www.fisiotool.com')) {
      return 'listo_para_registro';
    }
    if (intent === 'pricing' || intent === 'roi') {
      return 'precio_consultado';
    }
    return 'informado';
  }

  getFallbackResponse(intent, userName) {
    const greeting = userName ? userName : 'colega';
    
    switch (intent) {
      case 'whatIsFisioTool':
        return `Hola ${greeting}! FisioTool Pro es un software de gestión para clínicas de fisioterapia con Ana IA que gestiona citas 24/7, dashboard inteligente, pagos automáticos y PWA instalable. ¿Qué te gustaría saber? ¿Precios, funciones o casos de éxito?`;
      
      case 'pricing':
        return `Tenemos 3 planes: Starter (49€/mes), Professional (99€/mes - el más popular) y Enterprise (personalizado). Incluye 30 días gratis + 20% descuento primer año. Con recuperar 2-3 citas al mes ya está pagado. ¿Quieres que te cuente más sobre el ROI?`;
      
      case 'features':
        return `Las principales características son: Ana IA 24/7, Dashboard completo, Pagos automatizados, Foundry (panel admin IA), PWA instalable y HiveMind que aprende continuamente. ¿Cuál te interesa más?`;
      
      case 'roi':
        return `Nuestras clínicas recuperan 8-12 citas/mes (400-600€), ahorran 2-3h/día en admin (500€) y cobran 100% fianzas (+300€). ROI: 1.100€/mes netos con el plan Pro de 99€. Recuperas la inversión en 2-3 días.`;
      
      case 'casosExito':
        return `Tenemos 50+ clínicas con resultados increíbles: +42% más citas, +38% más ingresos, -65% menos tiempo admin. Satisfacción 4.9/5. ¿Quieres que te conecte con alguna clínica para que te cuenten su experiencia?`;
      
      case 'readyToRegister':
        return `¡Genial ${greeting}! 🎉 Regístrate en www.fisiotool.com - tienes 30 días gratis + 20% descuento primer año. El setup toma 48h y te ayudamos en todo. ¿Alguna duda antes de empezar?`;
      
      default:
        return `Hola ${greeting}! Soy Ana, tu asesora de FisioTool Pro. Puedo contarte sobre precios, características, ROI, casos de éxito o resolver cualquier duda. ¿Qué te gustaría saber?`;
    }
  }
}

module.exports = ProspectoSkill;
