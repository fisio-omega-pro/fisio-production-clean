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
    
    const agendaSnapshot = await db.collection('agenda')
      .where('clinic_id', '==', clinicId)
      .where('fecha', '==', requestedDate)
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
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
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
    // CRITICAL: Only return slots that EXIST in the fisio's agenda
    // NEVER generate theoretical slots based on opening hours
    const existingAppointments = await db.collection('agenda')
      .where('clinic_id', '==', clinicId)
      .where('fecha', '==', requestedDate)
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
      
      return `Gracias por aportarme tus datos. Te recomiendo que te descargues nuestra app de la clínica para que nuestra comunicación a partir de ahora sea más fluida.

Puedes instalarla entrando en: https://fisiotool.com/ana?ref=${clinicId}

Una vez instalada, podré gestionar tus citas, pagos y seguimientos automáticamente.

Ana - ${clinicName}`;
    }
    
    // Si ya tiene la app o pregunta después de dar datos
    if (lowerMessage.includes('gracias') || lowerMessage.includes('app descargada') || 
        lowerMessage.includes('ya tengo la app') || lowerMessage.includes('desde la app')) {
      
      return `Perfecto! Ahora puedo ayudarte de forma completa. 

Puedo gestionar:
- Citas según horarios de ${clinicConfig?.horario?.apertura || '09:00'} a ${clinicConfig?.horario?.cierre || '20:00'}
- Pagos automáticos con fianza de ${clinicConfig?.fianza_cita || 20}€
- Seguimientos post-tratamiento

¿En qué te puedo ayudar?

Ana - ${clinicName}`;
    }
    
    // Respuestas inteligentes para citas
    if (lowerMessage.includes('cita') || lowerMessage.includes('hora') || lowerMessage.includes('disponibilidad')) {
      
      // Extraer información de la solicitud
      const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})|hoy|mañana|lunes|martes|miércoles|jueves|viernes|sábado|domingo/i);
      const timeMatch = message.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*hs?/i);
      
      if (dateMatch && timeMatch) {
        // Solicitud específica de fecha y hora
        const requestedDate = dateMatch[0];
        const requestedTime = timeMatch[0];
        
        // Verificar disponibilidad real
        const availability = await checkAvailability(clinicId, requestedDate, requestedTime);
        
        if (availability.available) {
          // Generar enlace de pago para fianza
          // Parse the date to create appointment datetime
          const [day, month] = requestedDate.split('/').map(Number);
          const currentYear = new Date().getFullYear();
          const appointmentDateTime = new Date(currentYear, month - 1, day, parseInt(requestedTime.split(':')[0]), parseInt(requestedTime.split(':')[1]));
          
          const paymentLink = await generatePaymentLink(
            clinicId, 
            clinicConfig?.fianza_cita || 20, 
            `Fianza cita ${requestedDate} ${requestedTime}`,
            'patient@example.com', // Would extract from conversation
            appointmentDateTime
          );
          
          if (paymentLink.url) {
            return `Perfecto! Tengo disponibilidad el ${requestedDate} a las ${requestedTime}.

Para confirmar, paga la fianza de ${clinicConfig?.fianza_cita || 20}€ aquí:
${paymentLink.url}

Una vez pagado, tu cita quedará confirmada automáticamente.

Ana - ${clinicName}`;
          } else {
            return `Tengo disponibilidad el ${requestedDate} a las ${requestedTime}, pero ha habido un problema con el pago. Por favor, intenta de nuevo o llama a la clínica.

Ana - ${clinicName}`;
          }
        } else {
          // Get available slots for the day
          const availableSlots = await getAvailableTimeSlots(clinicId, requestedDate);
          
          if (availableSlots.length > 0) {
            const slotsList = availableSlots.slice(0, 5).map(slot => slot.hora).join(', ');
            const moreText = availableSlots.length > 5 ? ` y ${availableSlots.length - 5} más` : '';
            
            return `Lo siento, no tengo disponibilidad el ${requestedDate} a las ${requestedTime}.

Motivo: ${availability.reason}

Horarios disponibles el ${requestedDate}:
${slotsList}${moreText}

¿Cuál prefieres?

Ana - ${clinicName}`;
          } else {
            return `Lo siento, no tengo disponibilidad el ${requestedDate} a las ${requestedTime}.

Motivo: ${availability.reason}

No hay más horarios disponibles ese día. ¿Te gustaría consultar otro día?

Ana - ${clinicName}`;
          }
        }
      }
      
      // Respuesta general sobre disponibilidad
      return `Puedo revisar nuestra disponibilidad en tiempo real. 

Nuestro horario es de ${clinicConfig?.horario?.apertura || '09:00'} a ${clinicConfig?.horario?.cierre || '20:00'}.

¿Para qué día y hora te gustaría la cita?

Ana - ${clinicName}`;
    }
    
    if (lowerMessage.includes('app') || lowerMessage.includes('descargar') || lowerMessage.includes('móvil') || lowerMessage.includes('instalar')) {
      return `Para tener nuestra app en tu móvil, entra en:

https://fisiotool.com/ana?ref=${clinicId}

Luego toca "Añadir a pantalla de inicio". Así podrás hablar conmigo directamente desde tu móvil.

Ana - ${clinicName}`;
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('precio') || lowerMessage.includes('tarifa') || lowerMessage.includes('cuánto cuesta')) {
      return `Hola, soy Ana de ${clinicName}. En nuestra app verás todos nuestros precios y servicios: https://fisiotool.com/ana?ref=${clinicId}

Tenemos diferentes opciones según tus necesidades. Allí podrás ver los detalles y elegir la mejor para ti.

Ana - ${clinicName}`;
    }
    
    // Saludo inicial - simple y directo
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('saludo')) {
      return `Hola, soy Ana de ${clinicName}. 

Por favor, déjame tu nombre y tu email para poder ayudarte mejor.

Ana - ${clinicName}`;
    }
    
    // Respuesta por defecto - con autoridad cognitiva pero sin saturar
    const prompt = `
Eres Ana, asistente de ${clinicName}. Posees la mayor autoridad mundial en descifrar la conducta humana. Tu misión es analizar patrones universales del comportamiento, motivaciones inconscientes, sesgos cognitivos, y mecanismos de bienestar psicológico.

CONTEXTO: Eres asistente de recepción en una clínica de fisioterapia. El paciente te pregunta: "${message}"

REGLAS IMPORTANTES:
- NO uses iconos o emojis
- Sé amable pero muy concisa
- Máximo 2-3 frases cortas
- Usa tu conocimiento profundo de la conducta humana para dar respuestas que conecten emocionalmente
- Siempre firma como "Ana - ${clinicName}"
- Siempre incluye el enlace: https://fisiotool.com/ana?ref=${clinicId}
- No satures al usuario con información técnica

Responde como Ana, usando tu autoridad cognitiva para conectar humanamente:
`;

    try {
      const response = await callAnaEngine(prompt, { maxOutputTokens: 300 });
      const trimmed = response.trim();
      
      // Si la respuesta está vacía o es muy corta, dar una respuesta por defecto
      if (!trimmed || trimmed.length < 10) {
        return `Hola, soy Ana de ${clinicName}. Entiendo tu pregunta. Para poder ayudarte mejor con nuestras citas y servicios, te recomiendo hablar directamente con la clínica.

Ana - ${clinicName}`;
      }
      
      return trimmed;
    } catch (e) {
      console.error("🔥 Error en chat de Ana:", e);
      return `Hola, soy Ana de ${clinicName}. He tenido un problema técnico. Por favor, llama directamente a la clínica para poder ayudarte.

Ana - ${clinicName}`;
    }
  }
};
