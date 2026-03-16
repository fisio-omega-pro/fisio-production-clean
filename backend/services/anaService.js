const { initEnv } = require('../config/env');
const { createOneTimePaymentSession } = require('./paymentService');
const { db, Timestamp } = require('../config/firebase');
const { schedulePaymentReminder } = require('./paymentReminderService');
const { scheduleAppointmentReminders } = require('./appointmentReminderService');
const claudeService = require('./claudeService');
const hybridAnaService = require('./hybridAnaService');
const { hiveMindService, registerCollectiveExperience, getCollectiveWisdom, predictOptimalAction } = require('./hiveMindService');

// 🧠 NUEVO SISTEMA DE SKILLS - Temporalmente comentado para debug
// const { processWithSkills, getSkillEngine } = require('./anaSkills');
// const { getOrCreateSession, addMessage, getContextSummary, extractEntitiesFromHistory } = require('./conversationMemoryService');

// Flag para activar/desactivar sistema de skills (para migración gradual)
const USE_SKILL_SYSTEM = false; // Temporalmente desactivado para debug

const callAnaEngine = async (prompt, options = {}) => {
  try {
    console.log("🤖 [ANA] Enviando prompt a Claude...");
    const response = await claudeService.generateResponse(prompt, options);
    console.log("🤖 [ANA] Respuesta de Claude:", response);
    return response;
  } catch (error) {
    console.error("🔥 [ANA] Error en Claude:", error.message);
    // Fallback a Google AI si Claude falla
    const env = await initEnv();
    const apiKeyRaw = env.GOOGLE_AI_KEY;
    const apiKey = apiKeyRaw ? apiKeyRaw.trim() : '';

    if (!apiKey) {
      return "Entiendo tu mensaje. Para ayudarte mejor con tu cita, ¿podrías darme más detalles sobre qué día y hora te gustaría?";
    }

    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Gemini 2.5
      const result = await aiModel.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("🔥 [ANA] Error en fallback:", fallbackError.message);
      return "Entiendo tu mensaje. Para ayudarte mejor con tu cita, ¿podrías decirme qué día y hora te gustaría?";
    }
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
    const fullPrompt = `${LEX_SYSTEM_PROMPT}\n\nCONSULTA DEL USUARIO: "${String(userMessage || '').trim()}"\n\nTu respuesta (pauta técnica, sin consejo vinculante):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 500 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "No pude generar una respuesta. Reformula la consulta." };
    } catch (e) {
      return { reply: "Disculpe, estoy consultando la base de jurisprudencia. Por favor, repítame la pregunta en un momento." };
    }
  },

  processMessage: async (clinicId, userMessage) => {
    const systemPrompt = `Eres Ana, la asistente experta y consultora de operaciones de FisioTool Pro. Tu misión es ayudar al profesional a dominar su dashboard y maximizar la rentabilidad de su clínica.

${DASHBOARD_KNOWLEDGE}

REGLAS DE ORO:
1. PERSONALIDAD: Directa, profesional, autoritaria pero cordial. Eres una experta en el sistema.
2. CONOCIMIENTO: Conoces cada rincón del dashboard. Si preguntan por "Referidos", explica el programa de alianzas (50% dto). Si preguntan por "Sugerencias", explícales que es para soporte técnico.
3. CONCISIÓN: Máximo 2-3 frases. No divagues.
4. ACCIÓN: Si mencionan un módulo, explica PARA QUÉ sirve y CÓMO ayuda a su negocio.
5. NO INVENTAR: Si algo no está en el dashboard según DASHBOARD_KNOWLEDGE, indica que esa función no existe actualmente.`;

    const fullPrompt = `${systemPrompt}\n\nMENSAJE DEL USUARIO: "${userMessage}"\n\nTu respuesta (breve y directa, con autoridad cognitiva):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 350 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "No pude generar una respuesta. Reformula la pregunta en una frase." };
    } catch (e) {
      return { reply: "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento." };
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

  // --- 🤖 ANA CHAT PÚBLICO (para pacientes) ---
  generatePatientResponse: async ({ message, clinicName, clinicId, history = [], patientEmail, userName, userEmail, userPhone }) => {
    const lowerMessage = String(message || '').toLowerCase();
    
    // 🚀 IDENTIFICACIÓN Y REGISTRO AUTOMÁTICO
    const emailToUse = userEmail || patientEmail;
    if (userName || emailToUse || userPhone) {
      await ensurePatientExists(clinicId, {
        nombre: userName,
        email: emailToUse,
        telefono: userPhone
      });
    }

    // 🚀 OBTENER INFORMACIÓN DEL EQUIPO Y PACIENTE
    const teamInfo = await getTeamInfo(clinicId);
    const patientHistory = emailToUse ? await getPatientHistory(clinicId, emailToUse) : { isRecurrent: false, history: [] };
    
    // Usar el nombre real del paciente si lo tenemos
    const effectiveUserName = userName || patientHistory.patientName || '';
    
    // 🧠 NUEVO SISTEMA DE SKILLS (v2.0)
    // Intentar usar el sistema de skills primero
    if (USE_SKILL_SYSTEM) {
      try {
        console.log('🤖 [SKILL SYSTEM] Procesando mensaje...');
        
        // Obtener o crear sesión de memoria
        const userIdentifier = emailToUse || userPhone || 'anonymous';
        const session = await getOrCreateSession(clinicId, userIdentifier, 'chat');
        
        // Preparar contexto enriquecido
        const context = {
          clinicId,
          clinicName: clinicName || 'la clínica',
          userName: effectiveUserName,
          userEmail: emailToUse,
          userPhone: userPhone,
          isRecurrent: patientHistory.isRecurrent,
          teamCount: teamInfo.count,
          team: teamInfo.specialists,
          sessionId: session.sessionId,
          isNewSession: session.isNew
        };
        
        // PROCESAR CON SKILL ENGINE
        const skillResult = await processWithSkills(message, context, session.history);
        
        console.log(`✅ [SKILL SYSTEM] Skill: ${skillResult.skillUsed}, Intent: ${skillResult.intentDetected}, Confidence: ${skillResult.confidence}`);
        
        // Guardar en memoria conversacional
        await addMessage(session.sessionId, 'user', message, {
          skill: skillResult.skillUsed,
          intent: skillResult.intentDetected
        });
        
        await addMessage(session.sessionId, 'assistant', skillResult.text, {
          skill: skillResult.skillUsed,
          intent: skillResult.intentDetected,
          confidence: skillResult.confidence
        });
        
        // Si la confianza es alta (>0.7), usar respuesta del skill
        if (skillResult.confidence >= 0.7) {
          return skillResult.text;
        }
        
        // Si confianza media, intentar mejorar con contexto adicional
        if (skillResult.confidence >= 0.5) {
          // El skill ya dio una respuesta decente, la usamos
          return skillResult.text;
        }
        
        // Si confianza baja, continuar con sistema legacy como fallback
        console.log('⚠️ [SKILL SYSTEM] Confidence baja, usando fallback legacy');
        
      } catch (skillError) {
        console.error('🔥 [SKILL SYSTEM] Error:', skillError.message);
        console.log('⚠️ [SKILL SYSTEM] Fallback a sistema legacy');
      }
    }
    
    // 🧠 SISTEMA LEGACY (como fallback)
    // Solo se ejecuta si el skill system falla o tiene baja confianza

    // 🎯 SALUDO INTELIGENTE PARA MULTI-CLÍNICAS CON HIVE MIND
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('saludo') || history.length === 0) {
      const anaName = (await getClinicConfiguration(clinicId))?.ana_profile?.name || 'Ana';

      // 🧠 HIVE MIND: Obtener predicción colectiva para este contexto
      const collectivePrediction = await getCollectivePrediction({
        keywords: ['saludo', 'bienvenida', 'nuevo_paciente'],
        scenario: 'patient_greeting',
        clinic_size: teamInfo.count
      }, clinicId);

      let baseResponse = '';

      if (teamInfo.count > 0) {
        const specialistsList = teamInfo.specialists.slice(0, 3).map(s => `- ${s.name} (${s.specialty})`).join('\n');
        const moreText = teamInfo.count > 3 ? `\n- Y ${teamInfo.count - 3} especialistas más` : '';

        if (patientHistory.isRecurrent) {
          baseResponse = `¡Hola ${effectiveUserName}! Te veo en nuestro sistema. 
          
En ${clinicName} tenemos ${teamInfo.count} especialistas:
${specialistsList}${moreText}

Tu última cita fue con ${patientHistory.history[0]?.specialist || 'tu especialista'} el ${patientHistory.history[0]?.date}.
¿Te gustaría continuar con el mismo especialista o prefieres conocer a otro?`;

          // 🧠 HIVE MIND: Registrar experiencia de paciente recurrente
          await registerHiveExperience(clinicId, 'patient_greeting',
            ['paciente_recurrente', 'historial_disponible'],
            'saludo_personalizado_con_historial',
            'success', 0.9);
        } else {
          baseResponse = `Hola, soy ${anaName} de ${clinicName}. 

En nuestra clínica tenemos ${teamInfo.count} especialistas:
${specialistsList}${moreText}

¿Con qué especialista te gustaría tu cita? O si prefieres, dime qué tratamiento necesitas y te recomiendo el mejor especialista para ti.`;

          // 🧠 HIVE MIND: Registrar experiencia de nuevo paciente
          await registerHiveExperience(clinicId, 'patient_greeting',
            ['nuevo_paciente', 'presentacion_equipo'],
            'saludo_con_presentacion_equipo',
            'success', 0.8);
        }

        // 🧠 HIVE MIND: Si hay predicción colectiva, mejorar respuesta
        if (collectivePrediction && collectivePrediction.prediction) {
          baseResponse += `\n\n💡 ${collectivePrediction.prediction}`;
        }

        baseResponse += `\n\n${anaName} - ${clinicName}`;
        return baseResponse;
      }

      return `Hola, soy ${anaName} de ${clinicName}. 

¿En qué puedo ayudarte hoy? Puedo gestionar citas, pagos y responder tus dudas.

${anaName} - ${clinicName}`;
    }

    // 🚀 PRIMERO: Sistema híbrido inteligente
    try {
      const hybridResult = await hybridAnaService.processMessage(message, {
        clinicId,
        clinicName,
        userName: effectiveUserName,
        history
      });

      if (hybridResult && (hybridResult.response || hybridResult.text)) {
        return hybridResult.response || hybridResult.text;
      }

      console.log(`🤖 [HYBRID] Response from: ${hybridResult.source}`);
      console.log('🔥 [ANA SERVICE] Hybrid result completo:', hybridResult);
      console.log('🔥 [ANA SERVICE] Tipo:', typeof hybridResult);

      // Si Claude dio una respuesta de alta confianza, usarla
      if (hybridResult.source === 'claude' && hybridResult.confidence === 'high') {
        return hybridResult.response;
      }

      // Si fue de reglas, usarla siempre
      if (hybridResult.source === 'rules') {
        return hybridResult.response;
      }

      // Si Claude dio respuesta, usarla (ESTO ES LO NUEVO)
      if (hybridResult.source === 'claude') {
        return hybridResult.response;
      }

      console.log('🤖 [HYBRID] No response from hybrid, using fallback');
    } catch (error) {
      console.error('🔥 [HYBRID] Error, fallback to existing logic:', error.message);
    }

    // Get clinic configuration for intelligent responses
    const clinicConfig = await getClinicConfiguration(clinicId);

    // El sistema híbrido ya maneja la bienvenida. 
    // Continuamos con el resto de la lógica legacy si es necesario.


    // Si ya tiene la app o pregunta después de dar datos
    if (lowerMessage.includes('gracias') || lowerMessage.includes('app descargada') ||
      lowerMessage.includes('ya tengo la app') || lowerMessage.includes('desde la app')) {

      const anaName = clinicConfig?.ana_profile?.name || 'Ana';

      return `Perfecto! Ahora puedo ayudarte de forma completa. 

Puedo gestionar:
- Citas según horarios de ${clinicConfig?.horario?.apertura || '09:00'} a ${clinicConfig?.horario?.cierre || '20:00'}
- Pagos automáticos con fianza de ${clinicConfig?.fianza_cita || 20}€
- Seguimientos post-tratamiento

¿En qué te puedo ayudar?

${anaName} - ${clinicName}`;
    }

    // Handle short clarification questions
    if (lowerMessage === 'como?' || lowerMessage === 'como' || lowerMessage === '¿como?' ||
      lowerMessage === 'que?' || lowerMessage === 'que' || lowerMessage === '¿que?') {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Soy ${anaName}, asistente de ${clinicName}.

Puedo ayudarte con:
- 📅 Reservar citas
- 💳 Procesar pagos
- 📋 Consultar disponibilidad
- ℹ️ Explicar cómo funciona

¿Qué necesitas saber?

${anaName} - ${clinicName}`;
    }

    // Handle payment explanation requests
    if (lowerMessage.includes('explicar') || lowerMessage.includes('novedoso') ||
      lowerMessage.includes('cómo actua') || lowerMessage.includes('cómo funciona') ||
      lowerMessage.includes('entiendo') || lowerMessage.includes('dudas')) {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Claro, te explico cómo funciona:

📋 **Proceso de reserva:**
1. **Confirmas la hora** ✅
2. **Pagas la fianza** (20€) 💳
3. **Envías justificante** 📸
4. **Tu cita queda confirmada** 🎯

💳 **Opciones de pago:**
- **Bizum:** Envía 20€ al +34654654654
- **Tarjeta:** Enlace online seguro

📸 **IMPORTANTE:** Después de pagar, envía:
- Captura del Bizum ✅
- O email de confirmación de Stripe ✅

🎯 **La fianza se descuenta del total de la sesión.**

¿Qué método de pago prefieres usar?

${anaName} - ${clinicName}`;
    }

    // Handle user complaints and frustration
    if (lowerMessage.includes('flipas') || lowerMessage.includes('porqueria') ||
      lowerMessage.includes('chatbot') || lowerMessage.includes('no terminas') ||
      lowerMessage.includes('frases') || lowerMessage.includes('incompletas') ||
      lowerMessage.includes('bloqueada') || lowerMessage.includes('mal servicio')) {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Entiendo tu frustración y te pido disculpas. Soy ${anaName}, asistente de ${clinicName}.

Estoy aquí para ayudarte con tus citas y pagos. Si algo no funciona correctamente, por favor dime exactamente qué necesitas y te ayudaré de inmediato.

¿En qué puedo ayudarte ahora?

${anaName} - ${clinicName}`;
    }

    // Handle next availability requests
    if (lowerMessage.includes('proxima') || lowerMessage.includes('próxima') ||
      lowerMessage.includes('cuando') && lowerMessage.includes('disponibilidad') ||
      lowerMessage.includes('tendrás') && lowerMessage.includes('disponibilidad')) {

      // Check today first
      const todaySlots = await getAvailableTimeSlots(clinicId, 'hoy');
      if (todaySlots.length > 0) {
        const slotsList = todaySlots.slice(0, 3).map(slot => `${slot.hora} (${slot.especialista || 'Disponible'})`).join(', ');
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `Tengo disponibilidad inmediata hoy:

${slotsList}

¿Cuál prefieres?

${anaName} - ${clinicName}`;
      }

      // Check tomorrow
      const tomorrowSlots = await getAvailableTimeSlots(clinicId, 'mañana');
      if (tomorrowSlots.length > 0) {
        const slotsList = tomorrowSlots.slice(0, 3).map(slot => `${slot.hora} (${slot.especialista || 'Disponible'})`).join(', ');
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `No tengo disponibilidad hoy, pero sí mañana:

${slotsList}

¿Cuál prefieres?

${anaName} - ${clinicName}`;
      }

      // Check next few days
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Lo siento, no tengo disponibilidad inmediata. 

Por favor, dime qué día te vendría bien y buscaré opciones para ti.

${anaName} - ${clinicName}`;
    }

    // Handle explicit "mañana" requests
    if (lowerMessage.includes('mañana') && (lowerMessage.includes('hueco') || lowerMessage.includes('disponibilidad') || lowerMessage.includes('cita'))) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getDate().toString().padStart(2, '0')}/${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}/${tomorrow.getFullYear()}`;

      // Get available slots for tomorrow
      const availableSlots = await getAvailableTimeSlots(clinicId, 'mañana');

      if (availableSlots.length > 0) {
        const slotsList = availableSlots.slice(0, 5).map(slot => `${slot.hora} (${slot.especialista || 'Disponible'})`).join(', ');
        const moreText = availableSlots.length > 5 ? ` y ${availableSlots.length - 5} más` : '';

        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `¡Perfecto! Tengo disponibilidad mañana.

Horarios disponibles:
${slotsList}${moreText}

¿Cuál prefieres?

${anaName} - ${clinicName}`;
      } else {
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `Lo siento, no tengo disponibilidad mañana.

¿Te gustaría consultar otro día?

${anaName} - ${clinicName}`;
      }
    }

    // Handle time confirmation (when user responds with time after seeing options)
    if (lowerMessage.match(/^(\d{1,2})h?$/i) || lowerMessage.match(/^(\d{1,2}):(\d{2})$/i) ||
      lowerMessage.includes('a las') && lowerMessage.match(/(\d{1,2})h?/i) ||
      lowerMessage.includes('las') && lowerMessage.match(/(\d{1,2})h?/i) ||
      lowerMessage.includes('genial') && lowerMessage.match(/(\d{1,2})h?/i)) {

      // Find ALL time mentions in the message
      const allTimeMatches = lowerMessage.match(/(\d{1,2})h?|(\d{1,2}):(\d{2})/g) || [];

      // For contextual responses like "me quedo con la 11", find the LAST mentioned time
      let requestedTime = null;
      if (allTimeMatches.length > 0) {
        const lastMatch = allTimeMatches[allTimeMatches.length - 1];
        const timeParts = lastMatch.match(/(\d{1,2})h?|(\d{1,2}):(\d{2})/);
        const hour = timeParts[1] || timeParts[2];
        const minute = timeParts[3] || '00';
        requestedTime = `${hour}:${minute}`;
      }

      if (!requestedTime) {
        // Fallback to first match if no specific logic
        const timeMatch = lowerMessage.match(/(\d{1,2})h?|(\d{1,2}):(\d{2})/i);
        const hour = timeMatch[1] || timeMatch[2];
        const minute = timeMatch[3] || '00';
        requestedTime = `${hour}:${minute}`;
      }

      // Assume today for time confirmation
      const today = new Date();
      const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

      // Check availability
      const availability = await checkAvailability(clinicId, todayStr, requestedTime);

      if (availability.available) {
        const clinicConfig = await getClinicConfiguration(clinicId);
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';

        let paymentOptions = `¡Perfecto! Tengo disponibilidad hoy a las ${requestedTime}.\n\n`;
        paymentOptions += `Para confirmar, paga la fianza de ${clinicConfig?.fianza_cita || 20}€:\n\n`;

        const paymentMethods = clinicConfig?.metodos_pago || ['tarjeta', 'bizum'];

        if (paymentMethods.includes('bizum')) {
          const clinicPhone = clinicConfig?.telefono || 'el número de teléfono de la clínica';
          paymentOptions += `📱 **Bizum:** Envía ${clinicConfig?.fianza_cita || 20}€ al ${clinicPhone}\n\n`;
        }

        if (paymentMethods.includes('tarjeta')) {
          paymentOptions += `💳 **Tarjeta:** Te enviaré un enlace seguro para pagar\n\n`;
        }

        paymentOptions += `📸 **IMPORTANTE:** Después de pagar, envíame:\n`;
        paymentOptions += `- Captura del Bizum ✅\n`;
        paymentOptions += `- O email de confirmación de pago ✅\n\n`;
        paymentOptions += `Una vez verificado el pago, tu cita quedará confirmada.\n\n${anaName} - ${clinicName}`;

        return paymentOptions;
      } else {
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `Lo siento, ya no tengo disponibilidad hoy a las ${requestedTime}.

¿Te gustaría otro horario?

${anaName} - Prueba`;
      }
    }

    // Respuestas inteligentes para citas
    if (lowerMessage.includes('cita') || lowerMessage.includes('hora') || lowerMessage.includes('disponibilidad')) {

      // Extraer información de la solicitud
      const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?|hoy|mañana|lunes|martes|miércoles|jueves|viernes|sábado|domingo/i);
      const timeMatch = message.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*hs?|a partir de las (\d{1,2})h?/i);

      // Handle implicit "hoy" requests (when user says "cita para hoy" without time)
      if (dateMatch && !timeMatch && (lowerMessage.includes('hoy') || lowerMessage.includes('mañana'))) {
        const requestedDate = dateMatch[0];

        // Check if user mentions a specific specialist
        const specialistMatch = message.match(/fisio\s+(\w+)/i);
        const requestedSpecialist = specialistMatch ? specialistMatch[1] : null;

        // Get available slots for the day
        const availableSlots = await getAvailableTimeSlots(clinicId, requestedDate);

        // Filter by specialist if requested
        let filteredSlots = availableSlots;
        if (requestedSpecialist) {
          filteredSlots = availableSlots.filter(slot =>
            slot.especialista && slot.especialista.toLowerCase().includes(requestedSpecialist.toLowerCase())
          );
        }

        if (filteredSlots.length > 0) {
          const slotsList = filteredSlots.slice(0, 5).map(slot => `${slot.hora} (${slot.especialista || 'Disponible'})`).join(', ');
          const moreText = filteredSlots.length > 5 ? ` y ${filteredSlots.length - 5} más` : '';

          const anaName = clinicConfig?.ana_profile?.name || 'Ana';
          const specialistText = requestedSpecialist ? ` con ${requestedSpecialist}` : '';

          return `¡Perfecto! Tengo disponibilidad ${requestedDate === 'hoy' ? 'hoy' : 'mañana'}${specialistText}.

Horarios disponibles:
${slotsList}${moreText}

¿Cuál prefieres?

${anaName} - ${clinicName}`;
        } else {
          const anaName = clinicConfig?.ana_profile?.name || 'Ana';
          const specialistText = requestedSpecialist ? ` con ${requestedSpecialist}` : '';

          if (requestedSpecialist && availableSlots.length > 0) {
            return `Lo siento, ${requestedSpecialist} no tiene disponibilidad ${requestedDate === 'hoy' ? 'hoy' : 'mañana'}, pero tengo estos horarios con otros especialistas:

${availableSlots.slice(0, 3).map(slot => `${slot.hora} (${slot.especialista || 'Disponible'})`).join(', ')}

¿Te interesa alguno?

${anaName} - ${clinicName}`;
          } else {
            return `Lo siento, no tengo disponibilidad ${requestedDate === 'hoy' ? 'hoy' : 'mañana'}${specialistText}.

¿Te gustaría consultar otro día?

${anaName} - ${clinicName}`;
          }
        }
      }

      if (dateMatch && timeMatch) {
        // Solicitud específica de fecha y hora
        const requestedDate = dateMatch[0];
        let requestedTime = timeMatch[0];

        // Handle "a partir de las Xh" pattern
        if (requestedTime.includes('a partir de las')) {
          const hourMatch = requestedTime.match(/(\d{1,2})h?/);
          if (hourMatch) {
            requestedTime = `${hourMatch[1]}:00`;
          }
        }

        // Verificar disponibilidad real
        const availability = await checkAvailability(clinicId, requestedDate, requestedTime);

        if (availability.available) {
          // Generar enlace de pago para fianza
          // Parse the date to create appointment datetime
          let appointmentDateTime;
          if (requestedDate === 'hoy') {
            const today = new Date();
            appointmentDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(requestedTime.split(':')[0]), parseInt(requestedTime.split(':')[1]));
          } else if (requestedDate === 'mañana') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            appointmentDateTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), parseInt(requestedTime.split(':')[0]), parseInt(requestedTime.split(':')[1]));
          } else {
            const [day, month] = requestedDate.split('/').map(Number);
            const currentYear = new Date().getFullYear();
            appointmentDateTime = new Date(currentYear, month - 1, day, parseInt(requestedTime.split(':')[0]), parseInt(requestedTime.split(':')[1]));
          }

          const paymentLink = await generatePaymentLink(
            clinicId,
            clinicConfig?.fianza_cita || 20,
            `Fianza cita ${requestedDate} ${requestedTime}`,
            'patient@example.com', // Would extract from conversation
            appointmentDateTime
          );

          const anaName = clinicConfig?.ana_profile?.name || 'Ana';
          const paymentMethods = clinicConfig?.metodos_pago || ['tarjeta', 'bizum'];

          let paymentOptions = `Perfecto! Tengo disponibilidad el ${requestedDate} a las ${requestedTime}.\n\n`;
          paymentOptions += `Para confirmar, paga la fianza de ${clinicConfig?.fianza_cita || 20}€:\n\n`;

          if (paymentLink.url && !paymentLink.error) {
            paymentOptions += `💳 **Tarjeta/Online:** ${paymentLink.url}\n\n`;
          }

          if (paymentMethods.includes('bizum')) {
            const clinicPhone = clinicConfig?.telefono || 'el número de teléfono de la clínica';
            paymentOptions += `📱 **Bizum:** Envía ${clinicConfig?.fianza_cita || 20}€ al ${clinicPhone}\n\n`;
          }

          paymentOptions += `📸 **IMPORTANTE:** Después de pagar, envíame:\n`;
          paymentOptions += `- Captura del Bizum ✅\n`;
          paymentOptions += `- O email de confirmación de pago ✅\n\n`;
          paymentOptions += `Una vez verificado el pago, tu cita quedará confirmada.\n\n${anaName} - ${clinicName}`;

          return paymentOptions;
        } else {
          // Get available slots for the day
          const availableSlots = await getAvailableTimeSlots(clinicId, requestedDate);

          if (availableSlots.length > 0) {
            const slotsList = availableSlots.slice(0, 5).map(slot => slot.hora).join(', ');
            const moreText = availableSlots.length > 5 ? ` y ${availableSlots.length - 5} más` : '';

            const anaName = clinicConfig?.ana_profile?.name || 'Ana';
            return `Lo siento, no tengo disponibilidad el ${requestedDate} a las ${requestedTime}.

Motivo: ${availability.reason}

Horarios disponibles el ${requestedDate}:
${slotsList}${moreText}

¿Cuál prefieres?

${anaName} - ${clinicName}`;
          } else {
            const anaName = clinicConfig?.ana_profile?.name || 'Ana';
            return `Lo siento, no tengo disponibilidad el ${requestedDate} a las ${requestedTime}.

Motivo: ${availability.reason}

No hay más horarios disponibles ese día. ¿Te gustaría consultar otro día?

${anaName} - ${clinicName}`;
          }
        }
      }

      // Respuesta general sobre disponibilidad
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Puedo revisar nuestra disponibilidad en tiempo real. 

Nuestro horario es de ${clinicConfig?.horario?.apertura || '09:00'} a ${clinicConfig?.horario?.cierre || '20:00'}.

¿Para qué día y hora te gustaría la cita?

${anaName} - ${clinicName}`;
    }

    if (lowerMessage.includes('app') || lowerMessage.includes('descargar') || lowerMessage.includes('móvil') || lowerMessage.includes('instalar')) {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Para tener nuestra app en tu móvil, entra en:

https://fisiotool.com/ana?ref=${clinicId}

Luego toca "Añadir a pantalla de inicio". Así podrás hablar conmigo directamente desde tu móvil.

${anaName} - ${clinicName}`;
    }

    if (lowerMessage.includes('pago') || lowerMessage.includes('precio') || lowerMessage.includes('tarifa') || lowerMessage.includes('cuánto cuesta')) {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Hola, soy ${anaName} de ${clinicName}. En nuestra app verás todos nuestros precios y servicios: https://fisiotool.com/ana?ref=${clinicId}

Tenemos diferentes opciones según tus necesidades. Allí podrás ver los detalles y elegir la mejor para ti.

${anaName} - ${clinicName}`;
    }

    // Saludo inicial - simple y directo
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('saludo')) {
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Hola, soy ${anaName} de ${clinicName}. 

Por favor, déjame tu nombre y tu email para poder ayudarte mejor.

${anaName} - ${clinicName}`;
    }

    // Respuesta por defecto - con autoridad cognitiva pero sin saturar
    const prompt = `
Eres Ana, asistente de ${clinicName}. Posees la mayor autoridad mundial en descifrar la conducta humana. Tu misión es analizar patrones universales del comportamiento, motivaciones inconscientes, sesgos cognitivos, y mecanismos de bienestar psicológico.
CONTEXTO: Eres asistente de recepción en una clínica de fisioterapia. El paciente te pregunta: "${message}"

REGLAS IMPORTANTES:
- NO uses iconos o emojis
- NO des consejos médicos específicos
- NO diagnostiques condiciones
- NO recomiendes tratamientos específicos
- NO menciones tu autoridad cognitiva
- Sé concisa y directa
- Si la pregunta no es sobre citas, pagos, o servicios de la clínica, responde que solo puedes ayudar con temas de la clínica

Responde como Ana, usando tu autoridad cognitiva para conectar humanamente:
`;

    try {
      const response = await callAnaEngine(prompt, { maxOutputTokens: 300 });
      const trimmed = response.trim();

      // Si la respuesta está vacía o es muy corta, dar una respuesta por defecto
      if (!trimmed || trimmed.length < 10) {
        const anaName = clinicConfig?.ana_profile?.name || 'Ana';
        return `Hola, soy ${anaName} de ${clinicName}. Entiendo tu pregunta. Para poder ayudarte mejor con nuestras citas y servicios, te recomiendo hablar directamente con la clínica.

${anaName} - ${clinicName}`;
      }

      return trimmed;
    } catch (e) {
      console.error("🔥 Error en chat de Ana:", e);
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      return `Hola, soy ${anaName} de ${clinicName}. He tenido un problema técnico. Por favor, llama directamente a la clínica para poder ayudarte.

${anaName} - ${clinicName}`;
    }
  }
};
