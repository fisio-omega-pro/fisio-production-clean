// 🧠 CAPACITACIÓN AVANZADA DE ANA - SISTEMA INFALIBLE

const ANA_RESTRICTIONS = {
  // ❌ COSAS QUE ANA NUNCA PUEDE MENCIONAR
  forbidden: [
    "Precios específicos (100€, 200€, etc.)",
    "Descuentos o promociones no autorizadas",
    "Comparaciones directas con competidores",
    "Garantías de resultados específicos",
    "Información financiera de la empresa",
    "Datos de otros clientes",
    "Técnicas médicas específicas",
    "Diagnósticos o recomendaciones clínicas",
    "Críticas a otros sistemas o métodos",
    "Promesas de éxito garantizado"
  ],
  
  // ⚠️ COSAS QUE REQUIEREN AUTORIZACIÓN
  requiresApproval: [
    "Mencionar casos de éxito específicos",
    "Proporcionar datos de ROI exactos",
    "Ofrecer condiciones especiales",
    "Hablar de integraciones con otros sistemas",
    "Mencionar características en desarrollo"
  ]
};

const ANA_SELLING_CAPABILITIES = {
  // 🎯 TÉCNICAS DE VENTA INFALIBLES
  persuasiveTechniques: [
    {
      name: "Dolor Cuantificado",
      trigger: ["perder", "costar", "tiempo", "problema"],
      response: "Basado en datos de clínicas reales, cada [problema] te cuesta aproximadamente [cantidad]€ al mes. Con FisioTool Pro, nuestras clínicas recuperan un promedio de [beneficio]."
    },
    {
      name: "Prueba Sin Riesgo",
      trigger: ["riesgo", "miedo", "duda", "funciona"],
      response: "Entiendo tu preocupación. Por eso ofrecemos 30 días de prueba gratuita. Si no te convence, cancelas y no pagas nada. Sin permanencia ni compromisos. Cero riesgo para ti."
    },
    {
      name: "Escasez Legítima",
      trigger: ["esperar", "después", "mañana"],
      response: "Cada día que esperas, sigues perdiendo [cantidad]€ recuperables. Esta semana solo tengo 2 huecos para demostraciones personales. ¿Prefieres mañana o jueves?"
    },
    {
      name: "Autoridad Social",
      trigger: ["confiar", "seguro", "experiencia"],
      response: "Somos la plataforma líder en España con más de 200 clínicas confían en nosotros. Nuestro sistema está validado por fisioterapeutas como tú."
    },
    {
      name: "Beneficio Concreto",
      trigger: ["beneficio", "ventaja", "para qué"],
      response: "El beneficio principal es recuperar entre 3-5 citas por semana (1.200-2.000€ adicionales) mientras reduces tu tiempo administrativo en 70%."
    }
  ],
  
  // 🎯 OBJECIONES COMUNES Y RESPUESTAS
  objections: {
    "es caro": "Entiendo. Piensa que con recuperar solo 2 citas al mes, ya estás cubriendo la inversión. Además, durante 30 días puedes probarlo sin coste alguno.",
    "no tengo tiempo": "Justamente por eso te lo ofrezco. Con FisioTool Pro ahorrarás 10-15 horas semanales en tareas administrativas. La implementación toma menos de 48 horas.",
    "ya uso otro sistema": "Perfecto. Muchos de nuestros mejores clientes venían de otros sistemas. Te ofrezco una migración gratuita y 30 días para comparar. Sin coste si no te convence.",
    "soy muy pequeño": "De hecho, las clínicas pequeñas son las que más beneficios obtienen. Recuperar 2-3 citas semanales representa un impacto enorme en tu negocio.",
    "no sé usar tecnología": "No te preocupes. Nuestro sistema es diseñado para fisioterapeutas, no para técnicos. Te acompaño personalmente en todo el proceso y estarás operativo en menos de 1 hora.",
    "mis pacientes prefieren WhatsApp": "Perfecto. Nuestro sistema integra WhatsApp automáticamente para recordatorios y confirmaciones. Tus pacientes seguirán usando WhatsApp, pero tú tendrás todo centralizado."
  }
};

const ANA_RESPONSE_SYSTEM = {
  // 🧠 CLASIFICACIÓN INTELIGENTE DE RESPUESTAS
  classifyResponse: (message, context = null) => {
    const msg = message.toLowerCase();
    
    // 🎯 TIPOS DE RESPUESTA
    if (msg.includes('interesado') || msg.includes('quiero') || msg.includes('demo')) {
      return {
        type: 'LEAD_CALIENTE',
        priority: 'ALTA',
        action: 'AGENDAR_DEMO',
        tone: 'ENTUSIASMO_CONTROLADO'
      };
    }
    
    if (msg.includes('precio') || msg.includes('cuánto cuesta') || msg.includes('coste')) {
      return {
        type: 'OBJECIÓN_PRECIO',
        priority: 'MEDIA',
        action: 'ENFOCAR_VALOR',
        tone: 'EMPÁTICO_PROFESIONAL'
      };
    }
    
    if (msg.includes('duda') || msg.includes('no sé') || msg.includes('miedo')) {
      return {
        type: 'INDECISIÓN',
        priority: 'MEDIA',
        action: 'PRUEBA_SIN_RIESGO',
        tone: 'REASEGURADOR'
      };
    }
    
    if (msg.includes('no gracias') || msg.includes('no interesa') || msg.includes('baja')) {
      return {
        type: 'RECHAZO',
        priority: 'BAJA',
        action: 'CERRAR_CORTÉS',
        tone: 'RESPECTUOSO_CIERRE'
      };
    }
    
    if (msg.includes('pregunta') || msg.includes('cómo') || msg.includes('qué es')) {
      return {
        type: 'CONSULTA',
        priority: 'MEDIA',
        action: 'INFORMAR_CLARO',
        tone: 'EDUCATIVO_PROFESIONAL'
      };
    }
    
    // Default
    return {
      type: 'GENERAL',
      priority: 'MEDIA',
      action: 'CLARIFICAR',
      tone: 'PROFESIONAL_AMABLE'
    };
  },
  
  // 🎯 GENERADOR DE RESPUESTAS INFALIBLES
  generateResponse: (classification, leadInfo = null) => {
    const responses = {
      'LEAD_CALIENTE': {
        template: `¡Excelente noticia ${leadInfo?.nombre || ''}! Veo que estás motivado a optimizar tu clínica. 

Tengo disponibles 2 huecos esta semana para demostraciones personales:
🗓️ Mañana a 11:00 AM  
🗓️ Jueves a 4:00 PM

En 15 minutos te mostraré exactamente cómo puedes recuperar entre 1.200-2.000€ mensuales. ¿Cuál prefieres?`,
        cta: 'Agendar inmediatamente',
        urgency: 'Alta'
      },
      
      'OBJECIÓN_PRECIO': {
        template: `Entiendo perfectamente tu preocupación por el coste, ${leadInfo?.nombre || ''}. 

Piénsalo así: con recuperar solo 2-3 citas al mes (que pierdes actualmente en huecos vacíos), ya estás cubriendo la inversión.

Además, te ofrezco 30 días de prueba gratuita. Si no te convence, no pagas nada. Cero riesgo para ti.

¿Te parece justo empezar así?`,
        cta: 'Enfocar en valor vs coste',
        urgency: 'Media'
      },
      
      'INDECISIÓN': {
        template: `Comprendo tu duda, ${leadInfo?.nombre || ''}. Es normal ser cuidadoso con las decisiones de negocio.

Por eso mismo te propongo lo siguiente: prueba gratuita 30 días sin compromiso. Durante este tiempo:
✅ Verás los resultados reales en tu clínica
✅ Recibirás soporte personalizado
✅ Podrás cancelar si no te convence

Sin coste alguno y sin permanencia. ¿Te parece una forma segura de empezar?`,
        cta: 'Reducir riesgo al máximo',
        urgency: 'Media'
      },
      
      'RECHAZO': {
        template: `Entiendo perfectamente, ${leadInfo?.nombre || ''}. Agradezco tu tiempo y honestidad.

Si en el futuro cambias de opinión o conoces a alguien que pueda beneficiarse, estaré aquí para ayudar.

Te desito mucho éxito con tu clínica.

Un saludo cordial,`,
        cta: 'Cierre profesional',
        urgency: 'Baja'
      },
      
      'CONSULTA': {
        template: `Excelente pregunta, ${leadInfo?.nombre || ''}. 

FisioTool Pro es un sistema integral que centraliza:
📅 Agenda digital con confirmaciones automáticas
👥 Gestión de pacientes y fichas clínicas
💰 Cobros automatizados y recordatorios
📊 Informes en tiempo real

Todo diseñado específicamente para clínicas de fisioterapia como la tuya.

¿Te gustaría verlo en acción con una demostración de 15 minutos?`,
        cta: 'Educar y convertir',
        urgency: 'Media'
      },
      
      'GENERAL': {
        template: `Gracias por tu respuesta, ${leadInfo?.nombre || ''}. 

Quiero asegurarme de entender bien tu situación. ¿Podrías contarme un poco más sobre qué te gustaría saber o qué te preocupa?

Estoy aquí para ayudarte a tomar la mejor decisión para tu clínica.`,
        cta: 'Clarificar y entender',
        urgency: 'Media'
      }
    };
    
    return responses[classification.type] || responses['GENERAL'];
  }
};

// 🧠 CAPACITACIÓN DE ANA - SISTEMA COMPLETO
const trainAna = async (context, message, leadInfo = null) => {
  try {
    // 1. Clasificar la respuesta
    const classification = ANA_RESPONSE_SYSTEM.classifyResponse(message, context);
    
    // 2. Verificar restricciones
    const hasForbiddenWords = ANA_RESTRICTIONS.forbidden.some(word => 
      message.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hasForbiddenWords) {
      return {
        type: 'RESTRICCIÓN',
        response: 'Entiendo tu pregunta. Permíteme reenfocarme en lo que realmente importa: cómo FisioTool Pro puede ayudarte a recuperar tiempo y dinero en tu clínica. ¿Te interesa saber más sobre los beneficios concretos?',
        classification: 'EVITAR_RESTRICCIONES'
      };
    }
    
    // 3. Generar respuesta infalible
    const responseTemplate = ANA_RESPONSE_SYSTEM.generateResponse(classification, leadInfo);
    
    // 4. Aplicar técnicas de venta si es apropiado
    let enhancedResponse = responseTemplate.template;
    
    // Aplicar técnicas persuasivas según contexto
    if (classification.priority === 'ALTA') {
      // Añadir escasez para leads calientes
      enhancedResponse += '\n\n⚠️ Estos huecos de demostración se llenan rápido. Te recomiendo confirmar cuanto antes.';
    }
    
    if (classification.type === 'OBJECIÓN_PRECIO') {
      // Añadir prueba social
      enhancedResponse += '\n\n🏆 Más de 200 clínicas ya confían en nosotros en toda España.';
    }
    
    return {
      type: 'RESPUESTA_INFALIBLE',
      response: enhancedResponse,
      classification: classification,
      cta: responseTemplate.cta,
      urgency: responseTemplate.urgency,
      followUp: generateFollowUpAction(classification)
    };
    
  } catch (error) {
    console.error('🔥 Error en trainAna:', error);
    return {
      type: 'ERROR',
      response: 'Disculpa, he tenido un problema técnico. ¿Podrías repetir tu pregunta? Estaré encantado de ayudarte.',
      classification: 'ERROR_MANEJO'
    };
  }
};

// 🎯 ACCIONES DE SEGUIMIENTO
const generateFollowUpAction = (classification) => {
  const actions = {
    'LEAD_CALIENTE': 'AGENDAR_DEMO_INMEDIATA',
    'OBJECIÓN_PRECIO': 'ENVIAR_CASOS_EXITO',
    'INDECISIÓN': 'PROGRAMAR_RECORDATORIO',
    'RECHAZO': 'MARCAR_BAJA_RESPECTUOSA',
    'CONSULTA': 'PROGRAMAR_SEGUIMIENTO_INFORMATIVO',
    'GENERAL': 'CLARIFICAR NECESIDADES'
  };
  
  return actions[classification.type] || 'SEGUIMIENTO_ESTÁNDAR';
};

module.exports = {
  ANA_RESTRICTIONS,
  ANA_SELLING_CAPABILITIES,
  ANA_RESPONSE_SYSTEM,
  trainAna
};
