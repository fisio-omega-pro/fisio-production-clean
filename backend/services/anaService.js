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
════════════════════════════════
📊 MÓDULO: INICIO (Dashboard Principal)
════════════════════════════════
Qué es: La pantalla de control central. Muestra el estado de la clínica de un vistazo.
Qué contiene: Logo de la clínica, estado de suscripción, conexión Stripe, accesos rápidos a módulos clave, y código QR único para que los pacientes accedan a la app de la clínica.
Cómo usarlo: El código QR se puede imprimir y poner en recepción — al escanearlo el paciente instala la PWA de la clínica en su móvil en 10 segundos.
Tip clave: Si el fisio ve que Stripe aparece como "no conectado", debe ir a Pagos → Conectar Stripe para poder cobrar fianzas.

════════════════════════════════
📅 MÓDULO: AGENDA
════════════════════════════════
Qué es: El centro de operaciones diario. Gestión completa de citas.
Funciones principales:
- Vista diaria y mensual con filtro por especialista
- Crear nueva cita: clic en cualquier hueco libre → seleccionar paciente → confirmar hora y especialista
- Bloquear horarios: para vacaciones, formaciones o descansos — así Ana no ofrece esos huecos
- Colores de estado: Verde = Pagado/Confirmado | Naranja = Pendiente de pago | Rojo = Cancelada | Gris = Bloqueado
- Editar/cancelar cita: clic sobre la cita → opciones de edición
Cómo configurar huecos disponibles: Los huecos que aparecen en la agenda son los que Ana puede ofrecer a los pacientes. Si un hueco no está en la agenda, Ana no lo ofrecerá.
Tip clave: Añadir huecos disponibles a la agenda es lo primero que debe hacer el fisio para que Ana funcione correctamente.

════════════════════════════════
👥 MÓDULO: PACIENTES
════════════════════════════════
Qué es: La base de datos completa de pacientes de la clínica.
Funciones principales:
- Ver ficha completa: historial clínico, citas pasadas, notas, pagos, bonos
- Añadir paciente nuevo manualmente
- Editar historial clínico y notas de evolución
- IMPORTAR BASE DE DATOS EXISTENTE: Subir fichero CSV/Excel con todos los pacientes anteriores. FisioTool los importa automáticamente. Esto es lo primero que debe hacer un fisio nuevo.
- Ver estado de cada paciente: activo, inactivo, con bono, con deuda pendiente
Cómo importar pacientes: Ir a Pacientes → Importar → subir CSV con columnas: nombre, email, teléfono. El sistema hace el match automáticamente.
Tip clave: Una vez importados los pacientes, Ana puede detectar los inactivos y enviarles campañas de reactivación automáticas.

════════════════════════════════
🎯 MÓDULO: PROSPECCIÓN ACTIVA (Reactivación de Pacientes)
════════════════════════════════
Qué es: La funcionalidad más potente para llenar la agenda. Ana detecta pacientes inactivos y los reactiva automáticamente.
Cómo funciona:
1. Ana analiza la base de datos y detecta pacientes que llevan X semanas/meses sin cita
2. Les envía emails personalizados automáticos con huecos disponibles
3. Si tienen la app instalada (PWA), también reciben notificaciones push directas en el móvil
4. El fisio puede configurar el umbral de inactividad (ej: 8 semanas sin cita = inactivo)
5. También se pueden crear campañas manuales para toda la base de datos o segmentos
Resultado típico: 15-25 pacientes reactivados en el primer mes.
Tip clave: Cuantos más pacientes importados al sistema, más efectiva es la prospección activa.

════════════════════════════════
📱 MÓDULO: APP DE LA CLÍNICA (PWA)
════════════════════════════════
Qué es: Cada clínica tiene su propia app móvil personalizada con su nombre y logo. Sin App Store, sin coste extra.
Cómo instalarla los pacientes (2 vías):
1. BOTÓN EN EL CHAT DE ANA: Cuando el paciente chatea con Ana en el móvil, aparece un botón "Descargar app" que instala la PWA directamente en su dispositivo. Es el método principal y más fácil.
2. QR EN RECEPCIÓN: El dashboard genera un QR que el fisio puede imprimir y poner en la consulta. El paciente lo escanea con la cámara del móvil y se abre la app para instalar. Útil para captar pacientes presenciales.
Qué pueden hacer los pacientes desde la app: Reservar citas, pagar fianzas, ver bonos, recibir notificaciones push, chatear con Ana.
Funciona offline: Sí, la app funciona sin conexión para consultar información básica.
Notificaciones push: Una vez instalada la app, Ana puede enviar mensajes directos al móvil del paciente sin WhatsApp ni email.

════════════════════════════════
💰 MÓDULO: BALANCE
════════════════════════════════
Qué es: Centro de control financiero de la clínica.
Qué muestra: Ingresos del mes, gastos, ROI, comparativa mensual, previsión, desglose por especialista.
Exportar para contabilidad: Balance → Exportar CSV → compatible con cualquier software de contabilidad.
Tip clave: El gráfico de ROI muestra exactamente cuánto dinero recupera el fisio gracias a las fianzas y a la reducción de no-shows.

════════════════════════════════
🎫 MÓDULO: BONOS
════════════════════════════════
Qué es: Sistema de monederos de sesiones. El paciente compra un bono (ej: 10 sesiones) y lo usa como prepago.
Cómo crear un bono: Bonos → Nuevo bono → definir número de sesiones y precio.
Cómo asignar a un paciente: Desde la ficha del paciente → Bonos → Asignar bono.
Control de saldo: El sistema descuenta automáticamente una sesión con cada cita confirmada.
Tip clave: Los bonos aumentan el LTV (valor de vida) del paciente y garantizan ingresos recurrentes.

════════════════════════════════
👨‍⚕️ MÓDULO: EQUIPO
════════════════════════════════
Qué es: Gestión del equipo de la clínica.
Funciones: Añadir fisioterapeutas, asignar especialidades, crear credenciales de acceso individuales, definir qué puede ver/hacer cada uno.
Cómo añadir un miembro: Equipo → Añadir miembro → nombre, email, especialidad → el sistema le envía credenciales automáticamente.
Permisos: Cada miembro solo ve su propia agenda por defecto. El administrador ve todo.
Tip clave: Una vez añadido el equipo, la agenda se puede filtrar por especialista y Ana puede asignar citas al especialista correcto.

════════════════════════════════
💳 MÓDULO: PAGOS
════════════════════════════════
Qué es: Configuración del sistema de cobros.
Cómo conectar Stripe: Pagos → Conectar con Stripe → seguir el proceso de verificación (5-10 min). Necesario para cobrar fianzas con tarjeta.
Bizum: Se puede configurar un número de Bizum para cobros manuales. Ana lo informará a los pacientes automáticamente.
Fianzas automáticas: Una vez Stripe conectado, Ana cobra la fianza al confirmar la cita. Si el paciente no paga, la cita no se confirma.
Impacto real: Las fianzas eliminan el 90% de los no-shows. Las clínicas recuperan 8-12 citas/mes.

════════════════════════════════
🤝 MÓDULO: REFERIDOS (Programa de Alianzas)
════════════════════════════════
Qué es: Programa de recomendación mutua entre clínicas.
Cómo funciona: Si invitas a otra clínica a registrarse en FisioTool usando tu enlace de referido, AMBAS clínicas recibís un 50% de descuento en la siguiente cuota mensual.
Sin límite: Puedes referir tantas clínicas como quieras. Cada referido activo genera descuento.
Dónde está el enlace: Referidos → copiar enlace único.

════════════════════════════════
🤖 MÓDULO: CONFIGURAR ASISTENTE (Ana)
════════════════════════════════
Qué es: Personalización completa de la asistente IA de la clínica.
Qué se puede configurar: Nombre de Ana (puede llamarse como quiera la clínica), foto de perfil, color corporativo, mensaje de bienvenida personalizado, tono de comunicación.
Otros ajustes de Ana: Horario en que Ana responde, si cobra fianza automáticamente o no, umbral de pacientes inactivos para prospección.
Tip clave: Darle un nombre y foto cercana a Ana aumenta la confianza del paciente y la tasa de respuesta.

════════════════════════════════
⚙️ MÓDULO: AJUSTES
════════════════════════════════
Qué es: Configuración global de la clínica que Ana usa para operar.
Parámetros clave:
- Horario de apertura y cierre (mañana y tarde)
- Precio por sesión y precio de fianza
- Duración de cada cita (en minutos)
- Tiempo de descanso entre citas
- Métodos de pago aceptados
- Modo Multiclínica: si la clínica tiene varias sedes
Importante: Estos ajustes son los que Ana usa para informar a los pacientes. Si el precio es incorrecto aquí, Ana dará información incorrecta.

════════════════════════════════
💡 MÓDULO: SUGERENCIAS
════════════════════════════════
Qué es: Canal directo de soporte técnico y reporte de incidencias.
Para qué sirve: Reportar errores, pedir nuevas funcionalidades, consultar dudas técnicas al equipo de FisioTool.
No confundir: Sugerencias es para hablar CON FisioTool Pro (soporte). No es para gestionar la clínica.
Tiempo de respuesta: El equipo responde en menos de 24h en días laborables.

════════════════════════════════
🏢 MÓDULO: MIS CLÍNICAS (Multi-sede)
════════════════════════════════
Disponible en plan Professional y Enterprise. Permite gestionar varias sedes desde un único dashboard.
Cómo añadir sede: Mis Clínicas → Nueva sede → configurar horarios y equipo independiente para cada una.
Cada sede tiene su propia Ana, su propia agenda y su propio sistema de pagos.
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

// --- 🏥 CLINIC CONFIG (alias corto usado internamente) ---
const getClinicConfig = async (clinicId) => {
  try {
    const doc = await db.collection('clinicas').doc(clinicId).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error('🔥 [ANA] Error getClinicConfig:', e.message);
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

// --- 🕐 GET REAL AVAILABLE SLOTS: genera slots teóricos - slots ocupados en 'citas' ---
const getAvailableTimeSlots = async (clinicId, requestedDate) => {
  try {
    const clinicConfig = await getClinicConfig(clinicId);
    const horario = clinicConfig?.horario;
    if (!horario) {
      console.log(`🔍 [ANA] No horario config for clinic ${clinicId}`);
      return [];
    }

    const apertura    = horario.apertura    || '09:00';
    const cierre      = horario.cierre      || '14:00';
    const reapertura  = horario.reapertura  || '16:00';
    const cierreFinal = horario.cierre_final || '20:00';
    const duracion    = clinicConfig?.duracion_cita || 60;

    // Genera todos los slots posibles en un rango horario dado la duración
    const generateSlots = (start, end) => {
      const slots = [];
      let [h, m] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const endMinutes = endH * 60 + endM;
      while (true) {
        const cur = h * 60 + m;
        if (cur + duracion > endMinutes) break;
        slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        m += duracion;
        h += Math.floor(m / 60);
        m = m % 60;
      }
      return slots;
    };

    const allSlots = [...generateSlots(apertura, cierre), ...generateSlots(reapertura, cierreFinal)];
    if (allSlots.length === 0) return [];

    // Consulta CITAS ya reservadas para ese día (colección real del dashboard)
    const bookedSnap = await db.collection('citas')
      .where('clinic_id', '==', clinicId)
      .where('fecha', '==', requestedDate)
      .get();

    const bookedHoras = new Set(bookedSnap.docs.map(doc => doc.data().hora).filter(Boolean));
    console.log(`�️ [ANA] ${requestedDate}: ${allSlots.length} slots teóricos, ${bookedHoras.size} ocupados → ${allSlots.length - bookedHoras.size} libres`);

    return allSlots
      .filter(hora => !bookedHoras.has(hora))
      .map(hora => ({ hora, disponible: true, duracion, especialista: 'Disponible' }));

  } catch (e) {
    console.error('🔥 [ANA] Error reading agenda:', e);
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

    // === FASE 2: CARGA DE CONTEXTO EN PARALELO (7 días de agenda) ===
    const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${DAY_NAMES_ES[d.getDay()]} ${dd}/${mm}`;
      return { label, date: `${dd}/${mm}/${yyyy}` };
    });

    const [cfgResult, teamResult, patHistResult, ...daySlotResults] = await Promise.allSettled([
      getClinicConfiguration(clinicId),
      getTeamInfo(clinicId),
      emailToUse ? getPatientHistory(clinicId, emailToUse) : Promise.resolve({ isRecurrent: false, history: [] }),
      ...nextDays.map(d => getAvailableTimeSlots(clinicId, d.date))
    ]);

    const config   = cfgResult.status    === 'fulfilled' ? (cfgResult.value   || {}) : {};
    const team     = teamResult.status   === 'fulfilled' ? (teamResult.value   || { count: 0, specialists: [] }) : { count: 0, specialists: [] };
    const patHist  = patHistResult.status === 'fulfilled' ? (patHistResult.value || { isRecurrent: false, history: [] }) : { isRecurrent: false, history: [] };
    const daySlots = daySlotResults.map(r => r.status === 'fulfilled' ? (r.value || []) : []);

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

    const agendaText = nextDays.map((d, i) => `  ${d.label}: ${fmtSlots(daySlots[i])}`).join('\n');

    const teamText = team.count > 0
      ? `\nEQUIPO DISPONIBLE: ${team.specialists.slice(0, 5).map(s => `${s.name}${s.specialty ? ` - ${s.specialty}` : ''}`).join(', ')}`
      : '';

    const lastAppt = patHist.history?.[0];
    const patientCtx = patHist.isRecurrent && effectiveUserName
      ? `\nPACIENTE ACTUAL: ${effectiveUserName} (recurrente). Última cita: ${lastAppt?.date || 'pasada'} con ${lastAppt?.specialist || 'el especialista'}.`
      : effectiveUserName ? `\nPACIENTE ACTUAL: ${effectiveUserName}` : '';

    const nameRule = effectiveUserName
      ? `10. OBLIGATORIO: el paciente se llama "${effectiveUserName}". Usa SIEMPRE este nombre. NUNCA uses otro nombre aunque aparezca en mensajes anteriores del historial.`
      : `10. Si el paciente no ha dado su nombre, no lo inventes.`;

    const systemPrompt = `Eres ${anaName}, asistente IA de ${actualClinicName}. Gestionas citas, resuelves dudas y atiendes a los pacientes de forma natural y humana.${patientCtx}${teamText}
DISPONIBILIDAD REAL (próximos 7 días):
${agendaText}
CONFIGURACIÓN DE LA CLÍNICA:
- Horario: ${config?.horario?.apertura || '09:00'} - ${config?.horario?.cierre_final || config?.horario?.cierre || '20:00'}
- Duración cita: ${config?.duracion_cita || 45} min
- Precio sesión: ${config?.precio_sesion || 50}€ | Fianza para reservar: ${config?.fianza_cita || 20}€
- Métodos de pago: ${(config?.metodos_pago || ['tarjeta', 'bizum']).join(' / ')}${config?.telefono ? `\n- Teléfono clínica: ${config.telefono}` : ''}
REGLAS CRÍTICAS:
1. Eres un asistente humano y natural. Habla como persona, no como bot.
2. NO te repitas ni uses frases enlatadas. Cada respuesta debe ser única al contexto.
3. NUNCA empieces con "Hola [nombre]" ni cualquier saludo si ya existe historial de conversación. Ve DIRECTO al tema del mensaje del paciente.
4. USA SOLO la disponibilidad REAL listada arriba. Nunca inventes ni supongas horarios.
5. Si un día no tiene disponibilidad, dilo y ofrece los días que SÍ tienen huecos según la lista.
6. Para confirmar cita: valida horario disponible → indica método de pago con importe exacto → espera confirmación de pago.
7. Respuestas cortas y directas (máx 4 oraciones). Sin firmas ni etiquetas al final.
8. Si el paciente es recurrente, trátalo con familiaridad natural.
9. No des diagnósticos ni consejos médicos. Para eso está el fisioterapeuta.
${nameRule}`;

    // === FASE 5: HISTORIAL CONVERSACIONAL FORMATEADO ===
    // Preferir sesión Firestore; si está vacía (timing), usar historial del frontend como fallback
    let conversationMessages = sessionHistory
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: String(msg.content || msg.text || '')
      }))
      .filter(m => m.content.trim().length > 0);

    if (conversationMessages.length === 0 && Array.isArray(history) && history.length > 0) {
      conversationMessages = history
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: String(msg.text || msg.content || '')
        }))
        .filter(m => m.content.trim().length > 0)
        .slice(-12);
    }

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
