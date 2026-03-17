/**
 * 📅 AGENDA SKILL - Experto en Gestión de Citas
 * 
 * Capacidades:
 * - Verificar disponibilidad en tiempo real
 * - Sugerir horarios alternativos
 * - Procesar solicitudes de cita con fianza
 * - Manejar preferencias de especialista
 */

const { Skill } = require('../anaSkillEngine');
const { db } = require('../../config/firebase');
const { getCollectiveWisdom } = require('../hiveMindService');

class AgendaSkill extends Skill {
  constructor() {
    super('agenda', 'Gestión de Agenda', 'Experto en citas y disponibilidad');

    // Intents reconocidos
    this.addIntent('checkAvailability', [
      'tienes hueco', 'hay hora', 'disponibilidad', 'cita disponible',
      'cuando puedo venir', 'qué horarios tienes', 'hay cita',
      'quiero pedir cita', 'necesito cita', 'reservar cita'
    ], 0.9);

    this.addIntent('requestSlot', [
      'a las', 'para las', 'me gustaría', 'prefiero',
      '10:', '11:', '12:', '9:', '8:', '16:', '17:', '18:', '19:', '20:'
    ], 0.85);

    this.addIntent('changeAppointment', [
      'cambiar cita', 'modificar hora', 'mover cita', 'otro día',
      'no puedo ir', 'cancelar', 'anular'
    ], 0.85);

    this.addIntent('specialistPreference', [
      'con maría', 'con carlos', 'con ana', 'con el doctor',
      'fisio específico', 'mismo especialista', 'otro fisioterapeuta'
    ], 0.8);

    // Templates de respuesta
    this.addResponse('checkAvailability', 
      'Tengo disponibilidad {{date}}. ¿Qué horario prefieres? Tenemos de {{horarioInicio}} a {{horarioFin}}.',
      { hasSlots: true }
    );
    this.addResponse('checkAvailability', 
      'Lo siento, no tengo disponibilidad {{date}}. ¿Te gustaría ver {{alternativa}}?'
    );
    
    this.addResponse('requestSlot', 
      'Perfecto, {{hora}} el {{fecha}}. Para confirmar, necesitas pagar la fianza de {{fianza}}€. ¿Bizum o tarjeta?'
    );
    
    this.addResponse('changeAppointment',
      'Entendido. ¿Para cuándo te vendría mejor? Te busco alternativas.'
    );

    this.addResponse('specialistPreference',
      '{{especialista}} atiende {{horario}}. ¿Te va bien algún hueco suyo?'
    );
  }

  async execute(intentId, message, context, entities) {
    const clinicId = context.clinicId;
    const clinicName = context.clinicName || 'la clínica';
    
    try {
      // Obtener configuración de clínica
      const config = await this.getClinicConfig(clinicId);
      
      switch (intentId) {
        case 'checkAvailability':
          return await this.handleCheckAvailability(clinicId, config, entities, clinicName);
        
        case 'requestSlot':
          return await this.handleRequestSlot(clinicId, config, entities, message, clinicName);
        
        case 'changeAppointment':
          return await this.handleChangeAppointment(clinicId, config, entities, clinicName);
        
        case 'specialistPreference':
          return await this.handleSpecialistPreference(clinicId, config, message, clinicName);
        
        default:
          return this.fallbackResponse(clinicName, config);
      }
    } catch (error) {
      console.error('🔥 [AgendaSkill] Error:', error);
      return {
        text: `Lo siento, tuve un problema consultando la agenda. ¿Puedes llamar directamente a ${clinicName}?`,
        type: 'error',
        success: false
      };
    }
  }

  /**
   * Verifica disponibilidad real en Firestore
   */
  async handleCheckAvailability(clinicId, config, entities, clinicName) {
    // Determinar fecha solicitada
    let requestedDate = this.parseDate(entities);
    
    // Consultar slots disponibles
    const slots = await this.getAvailableSlots(clinicId, requestedDate);
    
    if (slots.length > 0) {
      // Formatear slots para mostrar
      const slotsText = slots.slice(0, 5).map(s => s.hora).join(', ');
      const moreText = slots.length > 5 ? ` y ${slots.length - 5} más` : '';
      
      return {
        text: `Tengo disponibilidad ${requestedDate}:\n${slotsText}${moreText}\n\n¿Cuál prefieres?`,
        type: 'availability',
        success: true,
        data: { slots, date: requestedDate }
      };
    } else {
      // Buscar alternativa (mañana)
      const tomorrow = this.getTomorrow();
      const tomorrowSlots = await this.getAvailableSlots(clinicId, tomorrow);
      
      if (tomorrowSlots.length > 0) {
        const slotsText = tomorrowSlots.slice(0, 3).map(s => s.hora).join(', ');
        return {
          text: `No tengo hueco ${requestedDate}. Mañana (${tomorrow}) tengo:\n${slotsText}\n\n¿Te interesa?`,
          type: 'availability_alternative',
          success: true,
          data: { originalDate: requestedDate, alternativeDate: tomorrow, slots: tomorrowSlots }
        };
      }
      
      return {
        text: `No tengo disponibilidad ${requestedDate} ni mañana. ¿Qué día de esta semana te vendría bien?`,
        type: 'no_availability',
        success: false
      };
    }
  }

  /**
   * Procesa solicitud de slot específico
   */
  async handleRequestSlot(clinicId, config, entities, message, clinicName) {
    const time = this.extractTime(message);
    const date = this.parseDate(entities);
    
    if (!time) {
      return {
        text: `¿A qué hora te gustaría? Nuestro horario es de ${config.horario?.apertura || '09:00'} a ${config.horario?.cierre || '20:00'}.`,
        type: 'need_time',
        success: false
      };
    }

    // Verificar si el slot está disponible
    const isAvailable = await this.checkSlotAvailability(clinicId, date, time);
    
    if (isAvailable) {
      const fianza = config.fianza_cita || 20;
      return {
        text: `Perfecto, ${time} el ${date}. Para confirmar, paga la fianza de ${fianza}€:\n\n📱 Bizum: ${config.telefono || '[teléfono]'}\n💳 Tarjeta: te envío enlace\n\n¿Cómo prefieres?`,
        type: 'slot_confirmation',
        success: true,
        data: { date, time, fianza, requiresPayment: true }
      };
    } else {
      // Sugerir alternativas cercanas
      const nearbySlots = await this.getNearbySlots(clinicId, date, time);
      if (nearbySlots.length > 0) {
        const altText = nearbySlots.slice(0, 3).join(', ');
        return {
          text: `A las ${time} no tengo hueco, pero tengo:\n${altText}\n\n¿Alguno te vale?`,
          type: 'slot_alternative',
          success: false,
          data: { requestedTime: time, alternatives: nearbySlots }
        };
      }
      
      return {
        text: `A las ${time} no tengo disponibilidad. ¿Prefieres otro horario o otro día?`,
        type: 'slot_unavailable',
        success: false
      };
    }
  }

  /**
   * Maneja solicitud de cambio de cita
   */
  async handleChangeAppointment(clinicId, config, entities, clinicName) {
    return {
      text: `Entendido. Para modificar tu cita necesito que me digas:\n1. Tu nombre o email\n2. La fecha actual de la cita\n3. Cuándo prefieres moverla\n\n¿Me das esos datos?`,
      type: 'change_request',
      success: true,
      requiresData: true
    };
  }

  /**
   * Maneja preferencia de especialista
   */
  async handleSpecialistPreference(clinicId, config, message, clinicName) {
    // Extraer nombre de especialista del mensaje
    const specialistMatch = message.match(/con\s+(\w+)/i);
    const specialistName = specialistMatch ? specialistMatch[1] : null;
    
    if (specialistName) {
      // Verificar si existe y tiene disponibilidad
      const specialist = await this.getSpecialistInfo(clinicId, specialistName);
      
      if (specialist) {
        return {
          text: `${specialist.nombre} atiende ${specialist.horario || 'mañanas y tardes'}. ¿Qué día te gustaría con ${specialist.nombre}?`,
          type: 'specialist_info',
          success: true,
          data: { specialist }
        };
      }
    }
    
    // Listar equipo disponible
    const team = await this.getTeamInfo(clinicId);
    if (team.length > 0) {
      const teamList = team.slice(0, 3).map(t => `- ${t.nombre} (${t.especialidad})`).join('\n');
      return {
        text: `Nuestro equipo:\n${teamList}\n\n¿Con quién prefieres?`,
        type: 'team_list',
        success: true,
        data: { team }
      };
    }
    
    return {
      text: `Trabajamos con especialistas expertos. ¿Qué día y hora te vendría bien?`,
      type: 'generic_team',
      success: true
    };
  }

  // ============ HELPERS ============

  async getClinicConfig(clinicId) {
    try {
      const doc = await db.collection('clinicas').doc(clinicId).get();
      return doc.exists ? doc.data() : {};
    } catch (e) {
      return {};
    }
  }

  async getAvailableSlots(clinicId, date) {
    try {
      const snapshot = await db.collection('citas')
        .where('clinic_id', '==', clinicId)
        .where('fecha', '==', date)
        .where('estado', 'not-in', ['anulada', 'no_show', 'cancelada'])
        .get();
      const ocupadas = new Set(snapshot.docs.map(d => d.data().hora));
      // Generar slots de 9:00 a 20:00 cada 45min
      const slots = [];
      for (let h = 9; h < 20; h++) {
        for (const m of ['00', '30']) {
          const hora = `${String(h).padStart(2,'0')}:${m}`;
          if (!ocupadas.has(hora)) slots.push({ hora, disponible: true });
        }
      }
      return slots;
    } catch (e) {
      console.error('Error getting slots:', e);
      return [];
    }
  }

  async checkSlotAvailability(clinicId, date, time) {
    try {
      const snapshot = await db.collection('citas')
        .where('clinic_id', '==', clinicId)
        .where('fecha', '==', date)
        .where('hora', '==', time)
        .where('estado', 'not-in', ['anulada', 'no_show', 'cancelada'])
        .limit(1)
        .get();
      return snapshot.empty; // libre si no hay citas activas a esa hora
    } catch (e) {
      return false;
    }
  }

  async getNearbySlots(clinicId, date, time, range = 2) {
    // Buscar slots +/- 2 horas
    const allSlots = await this.getAvailableSlots(clinicId, date);
    const targetHour = parseInt(time.split(':')[0]);
    
    return allSlots
      .filter(slot => {
        const slotHour = parseInt(slot.hora.split(':')[0]);
        return Math.abs(slotHour - targetHour) <= range;
      })
      .map(slot => slot.hora);
  }

  async getTeamInfo(clinicId) {
    try {
      const snapshot = await db.collection('clinicas')
        .doc(clinicId)
        .collection('equipo')
        .where('isOwner', '==', false)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      return [];
    }
  }

  async getSpecialistInfo(clinicId, name) {
    const team = await this.getTeamInfo(clinicId);
    return team.find(t => 
      t.nombre?.toLowerCase().includes(name.toLowerCase())
    );
  }

  parseDate(entities) {
    if (entities.dates?.length > 0) {
      const date = entities.dates[0].toLowerCase();
      if (date === 'hoy') return this.getToday();
      if (date === 'mañana') return this.getTomorrow();
      return entities.dates[0];
    }
    return this.getToday();
  }

  extractTime(message) {
    const match = message.match(/(\d{1,2})[:h](\d{2})?/i);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[2] || '00';
      return `${hour}:${minute}`;
    }
    
    // Match "a las X"
    const altMatch = message.match(/a\s+las?\s+(\d{1,2})/i);
    if (altMatch) {
      return `${altMatch[1].padStart(2, '0')}:00`;
    }
    
    return null;
  }

  getToday() {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  }

  getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;
  }

  fallbackResponse(clinicName, config) {
    const horarioInicio = config.horario?.apertura || '09:00';
    const horarioFin = config.horario?.cierre || '20:00';
    
    return {
      text: `Gestiono citas en ${clinicName}. Horario: ${horarioInicio}-${horarioFin}.\n\n¿Para cuándo necesitas cita?`,
      type: 'agenda_fallback',
      success: true
    };
  }
}

module.exports = { AgendaSkill };
