const { initEnv } = require('../config/env');
const { createOneTimePaymentSession } = require('./paymentService');
const { db, Timestamp } = require('../config/firebase');
const { schedulePaymentReminder } = require('./paymentReminderService');
const { scheduleAppointmentReminders } = require('./appointmentReminderService');

const callAnaEngine = async (prompt, options = {}) => {
  const env = await initEnv();
  const apiKeyRaw = env.GOOGLE_AI_KEY;
  const apiKey = apiKeyRaw ? apiKeyRaw.trim() : '';
  const model = env.GOOGLE_AI_MODEL;

  if (!apiKey) {
    return "Error: No tengo acceso a mi llave maestra. Revisa GOOGLE_AI_KEY en el Búnker.";
  }

  if (!model) {
    throw new Error('Falta GOOGLE_AI_MODEL en env');
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(options?.maxOutputTokens != null && { generationConfig: { maxOutputTokens: options.maxOutputTokens } })
  };

  try {
    console.log("🤖 [ANA] Enviando prompt a Google AI...");
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log("🤖 [ANA] Respuesta cruda:", responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("🔥 [ANA] Error parseando JSON:", parseError);
      return "Lo siento, he tenido un problema técnico. Por favor, llama a la clínica.";
    }

    if (!response.ok) {
      console.error("🔥 Error de Google API:", data);
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit')) {
        return "Lo siento, he alcanzado mi límite de consultas. Por favor, llama directamente a la clínica.";
      }
      throw new Error(`Fallo de conexión: ${data.error?.message}`);
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    console.log("🤖 [ANA] Resultado final:", result.substring(0, 100));
    return result;
  } catch (error) {
    console.error("🔥 [ANA] Error completo:", error);
    return "Lo siento, he tenido un problema técnico. Por favor, llama directamente a la clínica.";
  }
};

const DASHBOARD_KNOWLEDGE = `
CONOCIMIENTO DEL DASHBOARD (usa esto para explicar al detalle cuando pregunten cómo funciona algo):
- Inicio: resumen del panel, enlace para pacientes, QR, opción "Abrir en PC". Si falta setup (logo/Stripe/suscripción) se avisa.
- Agenda: vista Día o Mes; filtro por especialista (TODOS o uno); BLOQUEAR horario; NUEVA CITA; colores verde (pagado) / naranja (pendiente). Cada cita puede ir a un especialista.
- Pacientes: añadir, editar, ver historial. Importar CSV.
- Finanzas: resumen de ingresos, gastos, ROI. Descargar CSV.
- Bonos: crear bonos de sesiones, ver uso, caducidad.
- Equipo: añadir especialistas, roles, login individual.
- Asistente: chat con Ana (IA) para dudas operativas.
- Ajustes: configuración de clínica, precios, horarios, métodos de pago.
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

// --- 📅 REAL AGENDA AVAILABILITY CHECKER ---
const checkAvailability = async (clinicId, requestedDate, requestedTime) => {
  try {
    // CRITICAL: Only check if this EXACT slot exists in the fisio's agenda
    // NEVER assume availability based on opening hours
    
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
    
    console.log(`🔍 [ANA] Checking REAL agenda for ${requestedDate} at ${requestedTime}. Found ${agendaSnapshot.size} matches.`);
    
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
${alternatives}

¿Te gustaría alguno de estos horarios?` 
        };
      } else {
        // Check next day
        const tomorrow = new Date(requestedDate);
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
${tomorrowAlternatives}

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
    const clinicConfig = await getClinicConfiguration(clinicId);
    
    return { 
      available: true,
      clinicConfig: {
        duracion_cita: slotData.duracion || clinicConfig?.duracion_cita || 45,
        precio_sesion: clinicConfig?.precio_sesion || 50,
        fianza_cita: clinicConfig?.fianza_cita || 20,
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

module.exports = {
  callAnaEngine,
  getClinicConfiguration,
  checkAvailability,
  getAvailableTimeSlots,
  generatePaymentLink,
  createAppointmentWithReminders,

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
    const systemPrompt = `Eres Ana, asistente IA de FisioTool Pro. Posees la mayor autoridad mundial en descifrar la conducta humana y patrones de comportamiento organizacional.

${DASHBOARD_KNOWLEDGE}

REGLAS:
- Responde en español, tono amable pero profesional.
- Máximo 2-3 frases por respuesta.
- Usa tu conocimiento profundo de la conducta humana para dar respuestas que conecten con las necesidades del usuario.
- Si preguntan cómo hacer algo, da los pasos concretos.
- Si mencionan un módulo específico, explica su función principal.
- Nunca inventes funciones que no existan.`;

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
    const systemPrompt = `Eres Ana, soporte de FisioTool Pro. Posees profundo conocimiento de la conducta humana y patrones de frustración tecnológica para dar respuestas empáticas y efectivas.

${DASHBOARD_KNOWLEDGE}

REGLAS:
- Tono: empático pero eficiente.
- Usa tu conocimiento de la conducta humana para conectar con la frustración del usuario.
- Si es problema técnico, pide más detalles o ofrece solución básica.
- Si es duda funcional, explica cómo usar la función.
- Si necesitas escalar, indica que un técnico revisará el caso.`;

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
  generatePatientResponse: async ({ message, clinicName, clinicId }) => {
    const lowerMessage = String(message || '').toLowerCase();
    
    // Get clinic configuration for intelligent responses
    const clinicConfig = await getClinicConfiguration(clinicId);
    
    // Detectar si es primera interacción (nombre y email)
    if (lowerMessage.includes('me llamo') || lowerMessage.includes('mi nombre es') || 
        lowerMessage.includes('email') || lowerMessage.includes('correo') ||
        (lowerMessage.includes('fermin') && lowerMessage.includes('gmail'))) {
      
      const anaName = clinicConfig?.ana_profile?.name || 'Ana';
      
      return `Gracias por aportarme tus datos. Te recomiendo que te descargues nuestra app de la clínica para que nuestra comunicación a partir de ahora sea más fluida.

Puedes instalarla entrando en: https://fisiotool.com/ana?ref=${clinicId}

Una vez instalada, podré gestionar tus citas, pagos y seguimientos automáticamente.

${anaName} - ${clinicName}`;
    }
    
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
      const timeMatch = lowerMessage.match(/(\d{1,2})h?|(\d{1,2}):(\d{2})/i);
      const hour = timeMatch[1] || timeMatch[2];
      const minute = timeMatch[3] || '00';
      const requestedTime = `${hour}:${minute}`;
      
      // Assume today for time confirmation
      const today = new Date();
      const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      
      // Check availability
      const availability = await checkAvailability('bleRbykAj1TgF4lOYdMh', todayStr, requestedTime);
      
      if (availability.available) {
        const clinicConfig = await getClinicConfiguration('bleRbykAj1TgF4lOYdMh');
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
