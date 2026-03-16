const { initEnv } = require('../config/env');
const { createOneTimePaymentSession } = require('./paymentService');
const { db, Timestamp } = require('../config/firebase');
const { schedulePaymentReminder } = require('./paymentReminderService');
const { scheduleAppointmentReminders } = require('./appointmentReminderService');
const claudeService = require('./claudeService');
const hybridAnaService = require('./hybridAnaService');
const { hiveMindService, registerCollectiveExperience, getCollectiveWisdom, predictOptimalAction } = require('./hiveMindService');

// 🧠 NUEVO SISTEMA DE SKILLS - Importar módulos
const { processWithSkills, getSkillEngine } = require('./anaSkills');
const { getOrCreateSession, addMessage, getContextSummary, extractEntitiesFromHistory } = require('./conversationMemoryService');

// Flag para activar/desactivar sistema de skills (para migración gradual)
const USE_SKILL_SYSTEM = true;

const callAnaEngine = async (prompt, options = {}) => {
  try {
    console.log('🤖 [ANA] Enviando prompt a IA...');
    // Normalizar nombres de opciones (maxOutputTokens → maxTokens)
    const normalizedOptions = {
      ...options,
      maxTokens: options.maxTokens || options.maxOutputTokens || 1000
    };
    delete normalizedOptions.maxOutputTokens;
    const response = await claudeService.generateResponse(prompt, normalizedOptions);
    return response;
  } catch (error) {
    console.error('🔥 [ANA] Error en callAnaEngine:', error.message);
    return 'Estoy teniendo dificultades técnicas momentáneas. Por favor, inténtalo de nuevo en unos segundos.';
  }
};

const getTeamInfo = async (clinicId) => {
  try {
    const teamSnapshot = await db.collection('clinicas')
      .doc(clinicId)
      .collection('equipo')
      .where('isOwner', '==', false)
      .get();

    if (teamSnapshot.empty) {
      return { specialists: [], count: 0 };
    }

    const specialists = teamSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.nombre || 'Especialista',
        specialty: data.especialidad || 'Fisioterapia',
        avatar: data.avatarUrl || null
      };
    });

    return { specialists, count: specialists.length };
  } catch (e) {
    console.error('🔥 [ANA] Error getting team info:', e);
    return { specialists: [], count: 0 };
  }
};

// 🧠 HIVE MIND INTEGRATION - Aprendizaje Colectivo
const registerHiveExperience = async (clinicId, type, context, solution, outcome, confidence = 0.7) => {
  try {
    await registerCollectiveExperience(clinicId, {
      type,
      context: Array.isArray(context) ? context : [context],
      solution,
      outcome,
      confidence,
      impact_score: confidence > 0.8 ? 8 : 5
    });
    console.log(`🧠 [HIVE] Experiencia colectiva registrada: ${type}`);
  } catch (error) {
    console.error('🔥 [HIVE] Error registrando experiencia colectiva:', error);
  }
};

const getCollectivePrediction = async (context, clinicId) => {
  try {
    const prediction = await predictOptimalAction(context, clinicId);
    if (prediction.prediction && prediction.confidence > 0.7) {
      console.log(`🧠 [HIVE] Predicción colectiva: ${prediction.confidence}% confianza`);
      return prediction;
    }
    return null;
  } catch (error) {
    console.error('🔥 [HIVE] Error en predicción colectiva:', error);
    return null;
  }
};

const getPatientHistory = async (clinicId, patientEmail) => {
  try {
    const patientSnapshot = await db.collection('clinicas')
      .doc(clinicId)
      .collection('pacientes')
      .where('email', '==', patientEmail)
      .limit(1)
      .get();

    if (patientSnapshot.empty) {
      return { isRecurrent: false, history: [] };
    }

    const patient = patientSnapshot.docs[0].data();

    // Get appointment history
    const appointmentsSnapshot = await db.collection('clinicas')
      .doc(clinicId)
      .collection('agenda')
      .where('paciente_email', '==', patientEmail)
      .orderBy('fecha', 'desc')
      .limit(5)
      .get();

    const history = appointmentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.fecha,
        time: data.hora,
        specialist: data.especialista || 'Especialista',
        status: data.estado
      };
    });

    return {
      isRecurrent: history.length > 0,
      history,
      patientName: patient.nombre
    };
  } catch (e) {
    console.error('🔥 [ANA] Error getting patient history:', e);
    return { isRecurrent: false, history: [] };
  }
};

const DASHBOARD_KNOWLEDGE = `
- Inicio: Dashboard principal con resumen del estado de la clínica (logo, Stripe, suscripción), enlaces rápidos para pacientes y código QR.
- Agenda: Gestión de citas diaria/mensual. Permite filtros por especialista, BLOQUEAR horarios y crear NUEVAS CITAS. Colores: Verde (Pagado), Naranja (Pendiente).
- Pacientes: Base de datos completa. Añadir fichas, editar historial clínico e IMPORTAR pacientes desde CSV/Excel.
- Mis Clínicas (Sedes): Gestión de múltiples centros para planes Plus/Corporate. Permite añadir nuevas infraestructuras.
- Balance: Informes financieros avanzados, ROI, ingresos vs gastos y exportación a CSV para contabilidad.
- Bonos: Gestión de bonos de sesiones (monederos). Control de uso, saldo y fechas de caducidad.
- Equipo: Gestión de fisioterapeutas, asignación de roles y accesos de login individuales para el staff.
- Pagos: Configuración de Stripe Connect para recibir cobros con tarjeta y gestión de IBAN/Bizum.
- Referidos (Alianzas): Programa de recomendación. Si invitas a otra clínica, AMBAS recibís un 50% de descuento en la siguiente cuota mensual.
- Configurar Asistente: Personalización de Ana (nombre, foto, color y mensaje de bienvenida).
- Ajustes: Configuración global de la clínica (horarios, precios, fianza, duración de citas y Modo Multiclínica).
- Sugerencias: Canal directo de soporte técnico y reporte de tickets para mejoras en la plataforma.
`;

const LEX_SYSTEM_PROMPT = `
Eres Lex, asesor legal experto en España (fiscalidad, RGPD, laboral) para clínicas de fisioterapia.
CONTEXTO: FisioTool Pro es SaaS con datos en Firestore (eur3), facturación via Stripe, equipos en España.
MISIÓN: Responder dudas fiscales con prudencia; recordar fechas clave (Abril IRS, trimestres IVA). Nunca dar "consejo legal vinculante"; siempre sugerir revisión final por profesional, pero dar la pauta técnica correcta.
TONO: Serio, preciso, jurídico pero entendible. Responde en 2-5 frases cuando baste; si piden más detalle, amplía.
`;

// --- 🏥 CLINIC CONFIGURATION READER ---
const getClinicConfiguration = async (clinicId) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    if (!clinicDoc.exists) return null;

    const clinicData = clinicDoc.data();

    return {
      // Horarios y disponibilidad
      horario: clinicData.horario || { apertura: '09:00', cierre: '20:00' },
      diasBloqueados: clinicData.dias_bloqueados || [],
      timezone: clinicData.timezone || 'Europe/Madrid',

      // Precios y pagos (del setup original)
      precio_sesion: clinicData.config_ia?.precio || clinicData.precio_sesion || 50,
      fianza_cita: clinicData.config_ia?.fianza || clinicData.fianza_cita || 20,
      precio_bono_5: clinicData.config_ia?.precio_bono_5 || clinicData.precio_bono_5 || 225,
      metodos_pago: clinicData.metodos_pago || ['tarjeta', 'bizum', 'transferencia'],

      // Configuración de tratamientos
      duracion_cita: clinicData.duracion_cita || 45, // minutos por defecto
      tiempo_entre_citas: clinicData.tiempo_entre_citas || 15, // descanso entre citas
      limite_citas_dia: clinicData.limite_citas_dia || 12, // máximo citas por día
      tipos_tratamiento: clinicData.tipos_tratamiento || ['fisioterapia_general'],

      // Restricciones y banderas rojas
      banderas_rojas: clinicData.banderas_rojas || [],
      condiciones_especiales: clinicData.condiciones_especiales || {},

      // Configuración de bonos y servicios
      acepta_bonos: clinicData.config_ia?.acepta_bonos || false,
      modo_caza_activo: clinicData.config_ia?.modo_caza_activo || false,

      // 🤖 CONFIGURACIÓN DE ANA
      ana_profile: {
        name: clinicData.ana_name || 'Ana',
        photo_url: clinicData.ana_photo || null,
        use_clinic_logo: clinicData.ana_use_clinic_logo || false,
        custom_color: clinicData.ana_color || '#075E54',
        custom_welcome: clinicData.ana_welcome || null
      },

      // Información básica
      nombre_clinica: clinicData.nombre_clinica || clinicData.nombre || 'la clínica',
      email: clinicData.email || '',
      telefono: clinicData.telefono || ''
    };
  } catch (e) {
    console.error('🔥 [ANA] Error reading clinic config:', e);
    return null;
  }
};

// ---  REAL AGENDA AVAILABILITY CHECKER ---
const checkAvailability = async (clinicId, requestedDate, requestedTime) => {
  try {
    // CRITICAL: First check if requested time is within clinic hours and NOT during break
    const clinicConfig = await getClinicConfig(clinicId);
    if (!clinicConfig || !clinicConfig.horario) {
      return {
        available: false,
        reason: 'No se pudo verificar el horario de la clínica. Por favor, contacta directamente con la clínica.'
      };
    }

    const horario = clinicConfig.horario;
    const requestedHour = parseInt(requestedTime.split(':')[0]);
    const apertura = parseInt(horario.apertura?.split(':')[0] || '8');
    const cierre = parseInt(horario.cierre?.split(':')[0] || '14');  // Fin de mañana
    const reapertura = parseInt(horario.reapertura?.split(':')[0] || '16');  // Inicio de tarde
    const cierreFinal = parseInt(horario.cierre_final?.split(':')[0] || '21');  // Cierre definitivo

    // 🚫 VERIFICACIÓN EXQUISITA: Última hora posible (cierre - 1 hora)
    const ultimaHoraManana = cierre - 1;
    const ultimaHoraTarde = cierreFinal - 1;

    // 🚫 VERIFICACIÓN EXQUISITA DEL HORARIO DE DESCANSO
    if (requestedHour >= cierre && requestedHour < reapertura) {
      return {
        available: false,
        reason: `El horario de ${requestedTime} coincide con el descanso de la clínica (${cierre}:00-${reapertura}:00). 
        
Los horarios disponibles son:
• Mañana: ${horario.apertura} - ${ultimaHoraManana}:00
• Tarde: ${horario.reapertura} - ${ultimaHoraTarde}:00

¿Te gustaría otro horario dentro del horario de atención?`
      };
    }

    // 🚫 VERIFICACIÓN EXQUISITA: Última hora de cita (no puede ser a la hora de cierre)
    if (requestedHour >= cierreFinal) {
      return {
        available: false,
        reason: `El horario de ${requestedTime} no es válido para una cita porque la clínica cierra a las ${cierreFinal}:00.
        
La última hora posible para cita es hasta las ${ultimaHoraTarde}:00.

¿Te gustaría otro horario?`
      };
    }

    // 🚫 VERIFICACIÓN EXQUISITA: Última hora de mañana (no puede ser a la hora de cierre de mañana)
    if (requestedHour >= cierre) {
      return {
        available: false,
        reason: `El horario de ${requestedTime} no es válido para una cita porque la clínica cierra por la mañana a las ${cierre}:00.
        
La última hora posible para cita por la mañana es hasta las ${ultimaHoraManana}:00.

¿Te gustaría otro horario?`
      };
    }

    // 🚫 VERIFICACIÓN DE HORARIO FUERA DE HORARIO DE ATENCIÓN
    if (requestedHour < apertura || requestedHour > cierreFinal) {
      return {
        available: false,
        reason: `El horario de ${requestedTime} está fuera del horario de atención de la clínica.

Horario de atención:
• Mañana: ${horario.apertura} - ${ultimaHoraManana}:00
• Tarde: ${horario.reapertura} - ${ultimaHoraTarde}:00

Por favor, selecciona un horario dentro de estos rangos.`
      };
    }

    // Convert "hoy" and "mañana" to actual dates
    let actualDate = requestedDate;
    if (requestedDate === 'hoy') {
      const today = new Date();
      actualDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    } else if (requestedDate === 'mañana') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      actualDate = `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;
    }

    const agendaSnapshot = await db.collection('agenda')
      .where('clinic_id', '==', clinicId)
      .where('fecha', '==', actualDate)
      .where('hora', '==', requestedTime)
      .get();

    console.log(` [ANA] Checking REAL agenda for ${requestedDate} at ${requestedTime}. Found ${agendaSnapshot.size} matches.`);

    if (agendaSnapshot.empty) {
      // Get ALL available slots for the day to offer alternatives
      const allDaySlots = await db.collection('agenda')
        .where('clinic_id', '==', clinicId)
        .where('fecha', '==', requestedDate)
        .where('estado', '==', 'disponible')
        .limit(5)
        .get();

      if (!allDaySlots.empty) {
        const alternatives = allDaySlots.docs.map(doc => doc.data().hora).join(', ');
        return {
          available: false,
          reason: `El horario ${requestedTime} no está disponible, pero tengo estos horarios libres hoy:
-${alternatives}

¿Te gustaría alguno de estos horarios?`
        };
      } else {
        // Check next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;

        const tomorrowSlots = await db.collection('agenda')
          .where('clinic_id', '==', clinicId)
          .where('fecha', '==', tomorrowStr)
          .where('estado', '==', 'disponible')
          .limit(3)
          .get();

        if (!tomorrowSlots.empty) {
          const tomorrowAlternatives = tomorrowSlots.docs.map(doc => doc.data().hora).join(', ');
          return {
            available: false,
            reason: `El horario ${requestedTime} no está disponible hoy. Para mañana (${tomorrowStr}) tengo:
-${tomorrowAlternatives}

¿Te gustaría alguno de estos horarios?`
          };
        } else {
          return {
            available: false,
            reason: `No tengo horarios disponibles para hoy ni mañana. ¿Te gustaría que consulte disponibilidad para otros días de esta semana?`
          };
        }
      }
    }

    // Check if the slot is actually available (not booked)
    const slotDoc = agendaSnapshot.docs[0];
    const slotData = slotDoc.data();

    if (slotData.estado === 'ocupado' || slotData.paciente_nombre) {
      // Get alternatives for the same day
      const allDaySlots = await db.collection('agenda')
        .where('clinic_id', '==', clinicId)
        .where('fecha', '==', requestedDate)
        .where('estado', '==', 'disponible')
        .limit(5)
        .get();

      if (!allDaySlots.empty) {
        const alternatives = allDaySlots.docs.map(doc => doc.data().hora).join(', ');
        return {
          available: false,
          reason: `El horario ${requestedTime} está ocupado por ${slotData.paciente_nombre || 'otro paciente'}, pero tengo estos horarios libres hoy:
${alternatives}

¿Te gustaría alguno de estos horarios?`
        };
      } else {
        return {
          available: false,
          reason: `El horario ${requestedTime} está ocupado. No hay más horarios disponibles hoy. ¿Te gustaría que consulte mañana?`
        };
      }
    }

    if (slotData.estado !== 'disponible' && slotData.tipo !== 'disponible') {
      return {
        available: false,
        reason: `Este horario no está disponible para reserva. Estado actual: ${slotData.estado || slotData.tipo}.`
      };
    }

    // Slot exists and is available
    const clinicData = await getClinicConfig(clinicId);

    return {
      available: true,
      clinicConfig: {
        duracion_cita: slotData.duracion || clinicData?.duracion_cita || 45,
        precio_sesion: clinicData?.precio_sesion || 50,
        fianza_cita: clinicData?.fianza_cita || 20,
        especialista: slotData.especialista || 'Disponible'
      }
    };
  } catch (e) {
    console.error('🔥 [ANA] Error checking REAL agenda availability:', e);
    return { available: false, reason: 'Error del sistema. Intenta de nuevo.' };
  }
};

// --- 🕐 GET REAL AGENDA SLOTS (NEVER GENERATE) ---
const getAvailableTimeSlots = async (clinicId, requestedDate) => {
  try {
    // CRITICAL: Get clinic config to filter break times and last hour
    const clinicConfig = await getClinicConfig(clinicId);
    if (!clinicConfig || !clinicConfig.horario) {
      console.log('🔍 [ANA] No clinic config found, returning all slots');
    }

    const horario = clinicConfig?.horario;
    const cierre = parseInt(horario?.cierre?.split(':')[0] || '14');  // Fin de mañana
    const reapertura = parseInt(horario?.reapertura?.split(':')[0] || '16');  // Inicio de tarde
    const cierreFinal = parseInt(horario?.cierre_final?.split(':')[0] || '21');  // Cierre definitivo

    // 🚫 PRECISIÓN DE RELOJERO: Últimas horas válidas para citas
    const ultimaHoraManana = cierre - 1;  // Si cierra a 14, última cita es 13
    const ultimaHoraTarde = cierreFinal - 1;  // Si cierra a 21, última cita es 20

    // Convert "hoy" and "mañana" to actual dates
    let actualDate = requestedDate;
    if (requestedDate === 'hoy') {
      const today = new Date();
      actualDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    } else if (requestedDate === 'mañana') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      actualDate = `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;
    }

    // CRITICAL: Only return slots that EXIST in the fisio's agenda
    // NEVER generate theoretical slots based on opening hours
    const existingAppointments = await db.collection('agenda')
      .where('clinic_id', '==', clinicId)
      .where('fecha', '==', actualDate)
      .get();

    console.log(`🔍 [ANA] Checking REAL agenda for ${requestedDate}. Found ${existingAppointments.size} appointments.`);

    // Return ONLY the actual slots from the agenda
    const agendaSlots = [];

    for (const doc of existingAppointments.docs) {
      const appointment = doc.data();

      // Only include slots that are marked as available in the agenda
      if (appointment.estado === 'disponible' || appointment.tipo === 'disponible') {
        // 🚫 VERIFICACIÓN EXQUISITA: Excluir horas de descanso y última hora
        const slotHour = parseInt(appointment.hora?.split(':')[0] || '0');

        // Si hay configuración de horario, verificar precision
        if (horario) {
          // 🚫 Excluir horas de descanso (14:00-16:00)
          if (slotHour >= cierre && slotHour < reapertura) {
            console.log(`🚫 [ANA] Excluding break time slot: ${appointment.hora}`);
            continue; // Saltar esta hora, está en horario de descanso
          }

          // 🚫 Excluir última hora de mañana (14:00)
          if (slotHour >= cierre) {
            console.log(`🚫 [ANA] Excluding last morning hour slot: ${appointment.hora} (clinic closes at ${cierre}:00)`);
            continue;
          }

          // 🚫 Excluir última hora de tarde (21:00)
          if (slotHour >= cierreFinal) {
            console.log(`🚫 [ANA] Excluding last evening hour slot: ${appointment.hora} (clinic closes at ${cierreFinal}:00)`);
            continue;
          }
        }

        agendaSlots.push({
          hora: appointment.hora,
          disponible: true,
          duracion: appointment.duracion || 45,
          especialista: appointment.especialista || 'Disponible'
        });
      }
    }

    console.log(`🗓️ [ANA] Found ${agendaSlots.length} REAL available slots in fisio's agenda`);

    return agendaSlots;
  } catch (e) {
    console.error('🔥 [ANA] Error reading REAL agenda:', e);
    return [];
  }
};

// --- 💳 PAYMENT LINK GENERATOR ---
const generatePaymentLink = async (clinicId, amount, concepto, patientEmail, appointmentDateTime) => {
  try {
    const clinicConfig = await getClinicConfiguration(clinicId);
    if (!clinicConfig) return null;

    // Get Stripe account ID for this clinic
    const stripeConnectDoc = await db.collection('stripe_connect_profesionales')
      .where('clinic_id', '==', clinicId)
      .limit(1)
      .get();

    if (stripeConnectDoc.empty) {
      return { error: 'Clinic not connected to Stripe' };
    }

    const stripeAccountId = stripeConnectDoc.docs[0].data().stripe_account_id;

    // Create payment session
    const paymentResult = await createOneTimePaymentSession(
      amount * 100, // Convert to cents
      stripeAccountId,
      concepto,
      { headers: { 'x-forwarded-for': 'ana-service' } }
    );

    if (paymentResult.error) {
      return { error: paymentResult.error };
    }

    // Store payment link in database for tracking
    const paymentDoc = await db.collection('payment_links').add({
      clinic_id: clinicId,
      patient_email: patientEmail,
      amount: amount,
      concepto: concepto,
      payment_url: paymentResult.url,
      status: 'enviado',
      created_at: Timestamp.now(),
      expires_at: Timestamp.fromDate(new Date(Date.now() + 12 * 60 * 60 * 1000)), // 12 hours
      appointment_datetime: Timestamp.fromDate(appointmentDateTime)
    });

    // Schedule 1-hour reminder (8-21h window)
    if (appointmentDateTime) {
      const reminderResult = await schedulePaymentReminder(
        paymentDoc.id,
        clinicId,
        patientEmail,
        appointmentDateTime,
        amount
      );

      if (reminderResult.success) {
        console.log(`🕐 [ANA] Payment reminder scheduled for ${reminderResult.reminderTime.toISOString()}`);
      }
    }

    return {
      url: paymentResult.url,
      paymentId: paymentResult.url.split('/').pop(),
      reminderScheduled: appointmentDateTime ? true : false
    };
  } catch (e) {
    console.error('🔥 [ANA] Error generating payment link:', e);
    return { error: 'Failed to generate payment link' };
  }
};

// --- 📅 CREATE APPOINTMENT WITH REMINDERS ---
const createAppointmentWithReminders = async (clinicId, patientData, appointmentData) => {
  try {
    // Create appointment in agenda
    const appointmentDoc = await db.collection('agenda').add({
      clinic_id: clinicId,
      paciente_nombre: patientData.name,
      paciente_email: patientData.email,
      fecha: appointmentData.date,
      hora: appointmentData.time,
      estado: 'confirmada',
      especialista: appointmentData.specialist || 'Disponible',
      duracion: appointmentData.duration || 45,
      motivo: appointmentData.motivo || 'Cita programada por Ana',
      created_at: Timestamp.now()
    });

    // Schedule reminders
    const appointmentDateTime = new Date();
    const [day, month] = appointmentData.date.split('/').map(Number);
    const [hours, minutes] = appointmentData.time.split(':').map(Number);
    appointmentDateTime.setFullYear(new Date().getFullYear());
    appointmentDateTime.setMonth(month - 1);
    appointmentDateTime.setDate(day);
    appointmentDateTime.setHours(hours, minutes);

    const reminderResult = await scheduleAppointmentReminders(
      appointmentDoc.id,
      clinicId,
      patientData.email,
      patientData.name,
      appointmentDateTime,
      patientData.clinicName || 'la clínica'
    );

    console.log(`📅 [ANA] Created appointment and scheduled ${reminderResult.scheduled || 0} reminders`);

    return {
      success: true,
      appointmentId: appointmentDoc.id,
      remindersScheduled: reminderResult.success ? reminderResult.scheduled : 0
    };
  } catch (e) {
    console.error('🔥 [ANA] Error creating appointment:', e);
    return { success: false, error: e.message };
  }
};

// 📧 Procesar emails entrantes con sistema infalible. Si leadContext existe, es un lead de CAZA: respuesta alineada (sin precio, 30 días, tono CAZA).
const processIncomingEmail = async (from, subject, body, leadContext = null) => {
  const { trainAna } = require('./anaCapabilitiesService');

  try {
    // 🧠 USAR SISTEMA INFALIBLE DE ANA
    const result = await trainAna(leadContext ? 'prospeccion' : 'soporte', body, leadContext);

    // 📧 Construir respuesta según el resultado
    let responseText = result.response;
    let shouldRespond = result.type !== 'RECHAZO' && result.type !== 'ERROR';

    // 🎯 Añadir firma profesional
    if (shouldRespond && !responseText.includes('Ana')) {
      responseText += '\n\nAna · FisioTool Pro';
    }

    // 📊 Construir análisis completo
    const analysis = {
      clasificacion: result.classification.priority === 'ALTA' ? 'URGENTE' :
        result.classification.priority === 'MEDIA' ? 'IMPORTANTE' : 'NORMAL',
      tipo: result.classification.type === 'LEAD_CALIENTE' ? 'LEAD_PROSPECTO' :
        result.classification.type === 'OBJECIÓN_PRECIO' ? 'LEAD_PROSPECTO' :
          result.classification.type === 'INDECISIÓN' ? 'LEAD_PROSPECTO' :
            result.classification.type === 'CONSULTA' ? 'SOPORTE' :
              result.classification.type === 'RECHAZO' ? 'SOPORTE' : 'SOPORTE',
      respuesta: shouldRespond ? responseText : null,
      notificar_admin: result.classification.priority === 'ALTA' || result.type === 'ERROR',
      resumen: `${result.classification.type}: ${result.followUp}`,
      followUpAction: result.followUp,
      urgency: result.urgency,
      anaCapabilities: {
        detectedType: result.classification.type,
        techniqueUsed: result.cta,
        restrictionsApplied: result.type === 'RESTRICCIÓN'
      }
    };

    console.log(`🧠 [ANA] Procesado con capacidades infalibles: ${result.classification.type} → ${result.followUp}`);

    return analysis;

  } catch (e) {
    console.error("🔥 Error procesando email con Ana infalible:", e);
    return {
      clasificacion: "NORMAL",
      tipo: "SOPORTE",
      respuesta: null,
      notificar_admin: true,
      resumen: `Email de ${from}: ${subject}`,
      followUpAction: 'SEGUIMIENTO_ESTÁNDAR',
      urgency: 'Media',
      anaCapabilities: {
        detectedType: 'ERROR',
        techniqueUsed: 'FALLBACK',
        restrictionsApplied: false
      }
    };
  }
};

const ensurePatientExists = async (clinicId, { nombre, email, telefono }) => {
  if (!email && !telefono) return null;

  try {
    const patientsRef = db.collection('clinicas').doc(clinicId).collection('pacientes');
    let patientDoc = null;

    // 1. Buscar por email
    if (email) {
      const emailSnap = await patientsRef.where('email', '==', email.toLowerCase()).limit(1).get();
      if (!emailSnap.empty) patientDoc = emailSnap.docs[0];
    }

    // 2. Si no hay por email, buscar por teléfono
    if (!patientDoc && telefono) {
      const phoneSnap = await patientsRef.where('telefono', '==', telefono).limit(1).get();
      if (!phoneSnap.empty) patientDoc = phoneSnap.docs[0];
    }

    const now = Timestamp.now();

    if (patientDoc) {
      // Actualizar último contacto
      await patientDoc.ref.update({
        last_chat_at: now,
        updated_at: now
      });
      return { id: patientDoc.id, ...patientDoc.data() };
    } else {
      // Crear nuevo paciente (Auto-registro)
      const newPatient = {
        nombre: nombre || 'Paciente Nuevo',
        email: email ? email.toLowerCase() : '',
        telefono: telefono || '',
        created_at: now,
        updated_at: now,
        last_chat_at: now,
        status: 'ACTIVE',
        tags: ['auto-registrado', 'ana-chat']
      };
      const ref = await patientsRef.add(newPatient);
      console.log(`✅ [ANA] Nuevo paciente registrado automáticamente: ${ref.id}`);
      return { id: ref.id, ...newPatient };
    }
  } catch (e) {
    console.error('🔥 [ANA] Error en ensurePatientExists:', e);
    return null;
  }
};

module.exports = {
  // Use a temporary name for internal usage if needed, or just export it
  ensurePatientExists,
  callAnaEngine,
  getClinicConfiguration,
  checkAvailability,
  getAvailableTimeSlots,
  generatePaymentLink,
  createAppointmentWithReminders,
  processIncomingEmail,

  consultLex: async (userMessage) => {
    try {
      const reply = await claudeService.generateResponse(
        String(userMessage || '').trim(),
        { systemPrompt: LEX_SYSTEM_PROMPT, maxTokens: 500 }
      );
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || 'No pude generar una respuesta. Reformula la consulta.' };
    } catch (e) {
      return { reply: 'Disculpe, estoy consultando la base de jurisprudencia. Por favor, repítame la pregunta en un momento.' };
    }
  },

  processMessage: async (clinicId, userMessage, conversationHistory = []) => {
    const dashboardSystemPrompt = `Eres Ana, asistente experta de operaciones de FisioTool Pro. Ayudas al fisioterapeuta a dominar su dashboard y maximizar su clínica.

${DASHBOARD_KNOWLEDGE}

REGLAS:
1. Directa, profesional y cordial. Eres la experta en este sistema.
2. Conoces cada módulo. Explica PARA QUÉ sirve y CÓMO ayuda al negocio.
3. Concisa: máximo 2-3 frases por respuesta.
4. Si algo no existe en DASHBOARD_KNOWLEDGE, dilo claramente.
5. No repitas bienvenidas si ya hay conversación previa.`;

    try {
      const reply = await claudeService.generateResponse(
        String(userMessage || ''),
        {
          systemPrompt: dashboardSystemPrompt,
          conversationHistory,
          maxTokens: 400
        }
      );
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || 'No pude generar una respuesta. Reformula la pregunta.' };
    } catch (e) {
      return { reply: 'Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento.' };
    }
  },

  respondSupportTicket: async (userMessage) => {
    const systemPrompt = `Eres Ana, responsable de Soporte y Felicidad del Cliente en FisioTool Pro. 

${DASHBOARD_KNOWLEDGE}

REGLAS:
- TONO: Resolutivo, empático y experto.
- OBJETIVO: Resolver la duda técnica o funcional con precisión quirúrgica.
- Si es una incidencia técnica, confirma que el equipo de desarrollo lo revisará tras tu informe.
- Siempre usa el contexto de DASHBOARD_KNOWLEDGE para explicar funcionalidades.`;

    const fullPrompt = `${systemPrompt}\n\nCONSULTA DEL USUARIO: "${String(userMessage || '').trim()}"\n\nTu respuesta (breve, empática y para enviar por email):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 400 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "Hemos recibido tu mensaje. El equipo te responderá en breve." };
    } catch (e) {
      return { reply: "Hemos recibido tu consulta. Te responderemos por email lo antes posible." };
    }
  },

  // --- 🤖 ANA CHAT PÚBLICO (para pacientes) - Arquitectura AI-First v3 ---
  generatePatientResponse: async ({ message, clinicName, clinicId, history = [], patientEmail, userName, userEmail, userPhone }) => {
    
    // 🚀 IDENTIFICACIÓN MEJORADA - Buscar paciente existente primero
    let emailToUse = userEmail || patientEmail;
    let phoneToUse = userPhone;
    let effectiveUserName = userName;
    
    // Si tenemos email o teléfono, buscar si ya existe el paciente en Firestore
    if (emailToUse || phoneToUse) {
      try {
        const patientsRef = db.collection('clinicas').doc(clinicId).collection('pacientes');
        let existingPatient = null;
        
        // Buscar por email primero
        if (emailToUse) {
          const emailQuery = await patientsRef.where('email', '==', emailToUse).limit(1).get();
          if (!emailQuery.empty) {
            existingPatient = emailQuery.docs[0].data();
          }
        }
        
        // Si no se encontró por email, buscar por teléfono
        if (!existingPatient && phoneToUse) {
          const phoneQuery = await patientsRef.where('telefono', '==', phoneToUse).limit(1).get();
          if (!phoneQuery.empty) {
            existingPatient = phoneQuery.docs[0].data();
          }
        }
        
        // Si encontramos el paciente, usar sus datos completos
        if (existingPatient) {
          emailToUse = existingPatient.email || emailToUse;
          phoneToUse = existingPatient.telefono || phoneToUse;
          effectiveUserName = existingPatient.nombre || userName;
          console.log(`✅ [USER ID] Paciente encontrado: ${effectiveUserName} (${emailToUse})`);
        }
      } catch (error) {
        console.error('🔥 [USER ID] Error buscando paciente:', error);
      }
    }
    
    // 🚀 REGISTRO AUTOMÁTICO (solo si tenemos datos nuevos)
    if (userName || emailToUse || phoneToUse) {
      await ensurePatientExists(clinicId, {
        nombre: effectiveUserName,
        email: emailToUse,
        telefono: phoneToUse
      });
    }

    // === FASE 2: CARGA DE CONTEXTO EN PARALELO ===
    const [cfgResult, teamResult, patHistResult, todaySlotsResult, tomorrowSlotsResult] = await Promise.allSettled([
      getClinicConfiguration(clinicId),
      getTeamInfo(clinicId),
      emailToUse ? getPatientHistory(clinicId, emailToUse) : Promise.resolve({ isRecurrent: false, history: [] }),
      getAvailableTimeSlots(clinicId, 'hoy'),
      getAvailableTimeSlots(clinicId, 'mañana')
    ]);

    const config        = cfgResult.status        === 'fulfilled' ? (cfgResult.value        || {}) : {};
    const team          = teamResult.status        === 'fulfilled' ? (teamResult.value        || { count: 0, specialists: [] }) : { count: 0, specialists: [] };
    const patHist       = patHistResult.status     === 'fulfilled' ? (patHistResult.value     || { isRecurrent: false, history: [] }) : { isRecurrent: false, history: [] };
    const todaySlots    = todaySlotsResult.status  === 'fulfilled' ? (todaySlotsResult.value  || []) : [];
    const tomorrowSlots = tomorrowSlotsResult.status === 'fulfilled' ? (tomorrowSlotsResult.value || []) : [];

    if (!effectiveUserName && patHist.patientName) effectiveUserName = patHist.patientName;

    // === FASE 3: SESIÓN CONVERSACIONAL ===
    const userIdentifier = emailToUse || phoneToUse || 'anonymous';
    console.log(`🔑 [SESSION] Identificador: ${userIdentifier}`);
    const session = await getOrCreateSession(clinicId, userIdentifier, 'chat');
    const sessionHistory = (session.history || []).slice(-12);

    // === FASE 4: CONSTRUIR SYSTEM PROMPT RICO CON DATOS REALES ===
    const anaName = config?.ana_profile?.name || 'Ana';
    const actualClinicName = config?.nombre_clinica || clinicName || 'la clínica';

    const fmtSlots = (slots) => {
      if (!slots || slots.length === 0) return 'Sin disponibilidad';
      const shown = slots.slice(0, 8).map(s =>
        `${s.hora}${s.especialista && s.especialista !== 'Disponible' ? ` (${s.especialista})` : ''}`
      ).join(', ');
      return slots.length > 8 ? `${shown} y ${slots.length - 8} más` : shown;
    };

    const teamText = team.count > 0
      ? `\nEQUIPO DISPONIBLE: ${team.specialists.slice(0, 5).map(s => `${s.name}${s.specialty ? ` - ${s.specialty}` : ''}`).join(', ')}`
      : '';

    const lastAppt = patHist.history?.[0];
    const patientCtx = patHist.isRecurrent && effectiveUserName
      ? `\nPACIENTE RECURRENTE: ${effectiveUserName}. Última cita: ${lastAppt?.date || 'pasada'} con ${lastAppt?.specialist || 'el especialista'}.`
      : effectiveUserName ? `\nPACIENTE: ${effectiveUserName}` : '';

    const systemPrompt = `Eres ${anaName}, asistente IA de ${actualClinicName}. Gestionas citas, resuelves dudas y atiendes a los pacientes de forma natural y humana.${patientCtx}${teamText}
DISPONIBILIDAD REAL HOY: ${fmtSlots(todaySlots)}
DISPONIBILIDAD REAL MAÑANA: ${fmtSlots(tomorrowSlots)}
CONFIGURACIÓN DE LA CLÍNICA:
- Horario: ${config?.horario?.apertura || '09:00'} - ${config?.horario?.cierre_final || config?.horario?.cierre || '20:00'}
- Duración cita: ${config?.duracion_cita || 45} min
- Precio sesión: ${config?.precio_sesion || 50}€ | Fianza para reservar: ${config?.fianza_cita || 20}€
- Métodos de pago: ${(config?.metodos_pago || ['tarjeta', 'bizum']).join(' / ')}${config?.telefono ? `\n- Teléfono clínica: ${config.telefono}` : ''}
REGLAS CRÍTICAS:
1. Eres un asistente humano y natural. Habla como persona, no como bot.
2. NO te repitas ni uses frases enlatadas. Cada respuesta debe ser única al contexto.
3. Si ya has saludado en el historial, NO vuelvas a presentarte. Ve directamente al tema.
4. USA SOLO la disponibilidad REAL listada arriba. Nunca inventes horarios.
5. Si no hay disponibilidad hoy/mañana, dilo con franqueza y ofrece consultar otra fecha.
6. Para confirmar cita: valida horario disponible → indica método de pago con importe exacto → espera confirmación de pago.
7. Respuestas cortas y directas (máx 4 oraciones). Sin firmas ni etiquetas al final.
8. Si el paciente es recurrente, trátalo con familiaridad natural.
9. No des diagnósticos ni consejos médicos. Para eso está el fisioterapeuta.`;

    // === FASE 5: HISTORIAL CONVERSACIONAL FORMATEADO ===
    const conversationMessages = sessionHistory
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: String(msg.content || msg.text || '')
      }))
      .filter(m => m.content.trim().length > 0);

    // === FASE 6: LLAMADA Única A LA IA (Claude → Gemini fallback) ===
    let response = '';
    try {
      console.log(`🤖 [ANA PACIENTE] Llamando IA | Historial: ${conversationMessages.length} msgs | Clínica: ${actualClinicName}`);
      response = await claudeService.generateResponse(message, {
        systemPrompt,
        conversationHistory: conversationMessages,
        maxTokens: 450
      });
      console.log(`✅ [ANA PACIENTE] Respuesta generada correctamente`);
    } catch (e) {
      console.error('🔥 [ANA PACIENTE] Error IA:', e.message);
      const hr = new Date().getHours();
      const saludo = hr < 12 ? 'Buenos días' : hr < 20 ? 'Buenas tardes' : 'Buenas noches';
      response = effectiveUserName
        ? `${saludo} ${effectiveUserName}. Estoy teniendo dificultades técnicas en este momento. Por favor, inténtalo de nuevo en unos minutos.`
        : `${saludo}. Soy ${anaName} de ${actualClinicName}. Estoy teniendo dificultades técnicas. Por favor, inténtalo de nuevo en unos minutos.`;
    }

    // === FASE 7: GUARDAR EN SESIÓN CONVERSACIONAL ===
    try {
      await addMessage(session.sessionId, 'user', message, { clinicId });
      await addMessage(session.sessionId, 'assistant', response, { clinicId });
    } catch (e) {
      console.error('🔥 [ANA PACIENTE] Error guardando sesión:', e.message);
    }

    return response;
  }
};
