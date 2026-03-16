/**
 * 🏥 INFO CLINICA SKILL - Experto en Información de la Clínica
 * 
 * Capacidades:
 * - Horarios de apertura
 * - Ubicación y dirección
 * - Servicios y tratamientos
 * - Equipo y especialistas
 * - Preguntas frecuentes
 */

const { Skill } = require('../anaSkillEngine');
const { db } = require('../../config/firebase');

class InfoClinicaSkill extends Skill {
  constructor() {
    super('infoClinica', 'Información de Clínica', 'Experto en datos de la clínica');

    // Intents
    this.addIntent('hours', [
      'horario', 'hora abren', 'cuando abren', 'a qué hora', 'horas',
      'estáis abiertos', 'cuando cerráis', 'hasta qué hora', 'fin de semana'
    ], 0.9);

    this.addIntent('location', [
      'dónde estáis', 'dirección', 'ubicación', 'como llegar', 'donde es',
      'calle', 'direccion', 'mapa', 'localización'
    ], 0.9);

    this.addIntent('services', [
      'servicios', 'tratamientos', 'qué hacéis', 'para qué sirve', 'que haceis',
      'especialidades', 'qué problemas', 'terapias', 'fisioterapia'
    ], 0.85);

    this.addIntent('team', [
      'quién trabaja', 'fisioterapeuta', 'especialistas', 'equipo', 'profesionales',
      'con quién', 'doctor', 'staff', 'quien atiende', 'quienes son'
    ], 0.85);

    this.addIntent('contact', [
      'teléfono', 'email', 'correo', 'como contacto', 'llamar',
      'escribir', 'contactar', 'whatsapp'
    ], 0.9);

    this.addIntent('faq', [
      'primera vez', 'que llevo', 'ropa', 'duración', 'cuanto dura',
      'dolor', 'doloroso', 'preparar', 'antes de venir'
    ], 0.8);

    // Templates
    this.addResponse('hours',
      '🕐 **Horario:**\nMañana: {{apertura}} - {{cierreMañana}}\nTarde: {{reapertura}} - {{cierreTarde}}\n\n¿Qué día te viene bien?'
    );
    
    this.addResponse('location',
      '📍 **Dirección:**\n{{direccion}}\n\n{{ciudad}}, CP {{cp}}\n\n¿Necesitas indicaciones para llegar?'
    );
    
    this.addResponse('services',
      '💪 **Servicios:**\n{{servicios}}\n\n¿Qué necesitas exactamente?'
    );
    
    this.addResponse('team',
      '👨‍⚕️ **Nuestro equipo:**\n{{equipo}}\n\n¿Con quién prefieres?'
    );
    
    this.addResponse('contact',
      '📞 **Contacto:**\nTel: {{telefono}}\nEmail: {{email}}\n\nPero es más rápido por aquí 😉'
    );
    
    this.addResponse('faq',
      '❓ **Primera visita:**\n• Ropa cómoda\n• Duración: {{duracion}} min\n• Trae informes si tienes\n\n¿Algo más que necesites saber?'
    );
  }

  async execute(intentId, message, context, entities) {
    const clinicId = context.clinicId;
    const clinicName = context.clinicName || 'la clínica';
    
    try {
      const config = await this.getClinicConfig(clinicId);
      
      switch (intentId) {
        case 'hours':
          return this.handleHours(config, clinicName);
        
        case 'location':
          return this.handleLocation(config, clinicName);
        
        case 'services':
          return this.handleServices(config, clinicName);
        
        case 'team':
          return this.handleTeam(clinicId, config, clinicName);
        
        case 'contact':
          return this.handleContact(config, clinicName);
        
        case 'faq':
          return this.handleFAQ(config, clinicName);
        
        default:
          return this.fallbackResponse(config, clinicName);
      }
    } catch (error) {
      console.error('🔥 [InfoClinicaSkill] Error:', error);
      return {
        text: `Disculpa, no tengo esa información ahora. Llama a ${clinicName} directamente.`,
        type: 'error',
        success: false
      };
    }
  }

  handleHours(config, clinicName) {
    const horario = config.horario || {};
    const apertura = horario.apertura || '09:00';
    const cierre = horario.cierre || '14:00';
    const reapertura = horario.reapertura || '16:00';
    const cierreFinal = horario.cierre_final || '21:00';
    
    let respuesta = `🕐 **Horario de ${clinicName}:**\n\n`;
    respuesta += `Mañana: ${apertura} - ${cierre}\n`;
    if (reapertura && cierreFinal) {
      respuesta += `Tarde: ${reapertura} - ${cierreFinal}\n`;
    }
    
    respuesta += `\n¿Qué día y hora te viene bien?`;
    
    return {
      text: respuesta,
      type: 'hours_info',
      success: true,
      data: { horario }
    };
  }

  handleLocation(config, clinicName) {
    const direccion = config.direccion || config.address || config.calle;
    const ciudad = config.ciudad || config.city || '';
    const cp = config.cp || config.postal_code || config.zip || '';
    
    if (!direccion) {
      return {
        text: `Déjame buscarte la dirección exacta de ${clinicName}. ¿Para cuándo necesitas cita?`,
        type: 'location_unknown',
        success: false
      };
    }
    
    let respuesta = `📍 **${clinicName}:**\n\n`;
    respuesta += `${direccion}\n`;
    if (ciudad) respuesta += `${ciudad}`;
    if (cp) respuesta += `, CP ${cp}`;
    respuesta += `\n\n¿Necesitas indicaciones para llegar?`;
    
    return {
      text: respuesta,
      type: 'location_info',
      success: true,
      data: { direccion, ciudad, cp }
    };
  }

  handleServices(config, clinicName) {
    const banderasRojas = config.banderas_rojas || [];
    const especialidades = config.especialidades || config.especializaciones || [];
    
    let servicios = [];
    
    // Mapear banderas rojas a servicios
    const servicioMap = {
      'accidentes_trafico': 'Rehabilitación post-accidente',
      'suelo_pelvico': 'Suelo pélvico',
      'pediatria': 'Fisioterapia pediátrica',
      'oncologico': 'Oncológico',
      'post_cirugia': 'Post-cirugía',
      'ineccioso': 'Tratamientos infecciosos'
    };
    
    banderasRojas.forEach(b => {
      if (servicioMap[b]) servicios.push(servicioMap[b]);
    });
    
    // Si no hay especialidades específicas, usar genéricas
    if (servicios.length === 0) {
      servicios = ['Fisioterapia general', 'Rehabilitación', 'Dolor muscular', 'Lesiones deportivas'];
    }
    
    const serviciosText = servicios.map(s => `• ${s}`).join('\n');
    
    return {
      text: `💪 **Servicios en ${clinicName}:**\n\n${serviciosText}\n\n¿Qué necesitas exactamente?`,
      type: 'services_info',
      success: true,
      data: { servicios }
    };
  }

  async handleTeam(clinicId, config, clinicName) {
    try {
      const teamSnapshot = await db.collection('clinicas')
        .doc(clinicId)
        .collection('equipo')
        .where('isOwner', '==', false)
        .limit(5)
        .get();
      
      if (teamSnapshot.empty) {
        return {
          text: `En ${clinicName} trabajamos con fisioterapeutas especializados. ¿Qué día te viene bien para cita?`,
          type: 'team_generic',
          success: true
        };
      }
      
      const team = teamSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          nombre: data.nombre || 'Especialista',
          especialidad: data.especialidad || 'Fisioterapia'
        };
      });
      
      const teamText = team.map(t => `• ${t.nombre} (${t.especialidad})`).join('\n');
      
      return {
        text: `👨‍⚕️ **Equipo de ${clinicName}:**\n\n${teamText}\n\n¿Con quién prefieres?`,
        type: 'team_list',
        success: true,
        data: { team }
      };
    } catch (e) {
      return {
        text: `Trabajamos con especialistas expertos en ${clinicName}. ¿Qué día te viene bien?`,
        type: 'team_generic',
        success: true
      };
    }
  }

  handleContact(config, clinicName) {
    const telefono = config.telefono || config.phone || 'consultar web';
    const email = config.email || 'consultar web';
    
    return {
      text: `📞 **Contacto ${clinicName}:**\n\nTel: ${telefono}\nEmail: ${email}\n\n💡 **Rápido:** Reserva aquí mismo conmigo 😉`,
      type: 'contact_info',
      success: true,
      data: { telefono, email }
    };
  }

  handleFAQ(config, clinicName) {
    const duracion = config.duracion_cita || 45;
    
    const respuestas = {
      primera: `❓ **Primera visita:**\n• Ropa cómoda\n• Duración: ${duracion} min\n• Trae informes médicos si tienes\n• Llega 5 min antes`,
      dolor: `💬 **¿Duele?**\nDepende del tratamiento. Trabajamos siempre dentro de tu tolerancia al dolor.`,
      ropa: `👕 **Ropa:**\nVen con ropa cómoda que permita movimiento.`,
      preparar: `📝 **Preparar:**\nSolo tu historial médico si tienes. El resto lo vemos aquí.`
    };
    
    return {
      text: respuestas.primera + '\n\n¿Algo más que necesites saber?',
      type: 'faq_answer',
      success: true,
      data: { duracion }
    };
  }

  fallbackResponse(config, clinicName) {
    return {
      text: `${clinicName} es una clínica de fisioterapia especializada.\n\n¿Sobre qué necesitas información?\n• Horarios\n• Ubicación\n• Servicios\n• Equipo`,
      type: 'info_fallback',
      success: true
    };
  }

  async getClinicConfig(clinicId) {
    try {
      const doc = await db.collection('clinicas').doc(clinicId).get();
      return doc.exists ? doc.data() : {};
    } catch (e) {
      return {};
    }
  }
}

module.exports = { InfoClinicaSkill };
