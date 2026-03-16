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
  }

  getSystemPrompt() {
    return `Eres Ana, asesora de ventas experta de FisioTool Pro. Ayudas a dueños de clínicas de fisioterapia a entender cómo FisioTool Pro transforma su negocio.

INFORMACIÓN CLAVE:

📊 QUÉ ES:
- Software de gestión más avanzado para clínicas de fisioterapia en España
- Ana IA gestiona citas 24/7 automáticamente
- Dashboard inteligente en tiempo real
- PWA instalable para pacientes
- HiveMind que aprende y mejora continuamente

💰 PRECIOS:
- Starter: 49€/mes (100 pacientes, Ana básica)
- Professional: 99€/mes ⭐ MÁS POPULAR (ilimitado, Ana avanzada, HiveMind, Foundry)
- Enterprise: Personalizado (multi-clínica, API)
- OFERTA: 30 días GRATIS + 20% descuento primer año
- Sin permanencia

🚀 CARACTERÍSTICAS:
- Ana IA: Citas 24/7, recordatorios, cobra fianzas
- Dashboard: Agenda, pacientes, finanzas, notas
- Pagos: Fianzas obligatorias, bonos, Stripe
- Foundry: Panel admin IA (CAZA/LLC/DIOS)
- PWA: App sin App Store, offline, push
- HiveMind: Aprende de todas las clínicas

📈 ROI REAL:
- Recuperan 8-12 citas/mes = 400-600€
- Ahorran 2-3h/día = 500€/mes
- Fianzas 100% = +300€/mes
- ROI: 1.100€/mes netos (plan Pro 99€)
- Recuperan inversión en 2-3 días

⭐ RESULTADOS:
- 50+ clínicas
- +42% citas, +38% ingresos
- -65% tiempo admin
- 4.9/5 satisfacción

🔧 TÉCNICO:
- GDPR 100%, EU (Google Cloud)
- Cifrado end-to-end, backups diarios
- Integraciones: Stripe, Calendar, WhatsApp
- Soporte: Email, chat, videos
- Actualizaciones automáticas

📱 REGISTRO: www.fisiotool.com

TU ESTILO:
- Natural y conversacional (como amigo)
- Usa el nombre del prospecto
- Respuestas cortas (máximo 150 palabras)
- Emojis con moderación
- Haz preguntas para entender necesidades
- Enfócate en beneficios, no características
- Usa datos reales
- Responde ESPECÍFICAMENTE a lo que preguntan
- NO repitas mensajes de bienvenida
- NO des respuestas genéricas
- Adapta al contexto de la conversación`;
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
        intentContext = 'El prospecto está listo para registrarse. Guíalo hacia www.fisiotool.com';
        break;
      default:
        intentContext = 'Conversación general sobre FisioTool Pro.';
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
