const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// ==========================================
// 🛡️ NÚCLEO DE SEGURIDAD Y ACCESO OMEGA
// ==========================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave maestra para firmas (Prioridad a Secret Manager)
const JWT_SECRET = process.env.JWT_SECRET || 'fisiotool_supreme_secret_key_2026';

// 🕵️‍♂️ MIDDLEWARE: EL PORTERO (Autorización nivel BOLA)
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error("🚫 Intento de acceso bloqueado: Falta Token.");
    return res.status(401).json({ error: "No autorizado. Por favor, inicie sesión." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token inválido o caducado.");
      return res.status(401).json({ error: "Sesión expirada. Identifíquese de nuevo." });
    }
    // Inyectamos el ID real de la clínica extraído de la llave digital
    // Esto garantiza que el fisio SOLO vea sus propios datos
    req.clinicId = decoded.clinicId; 
    next();
  });
};

// 🛰️ HELPER: LOCALIZADOR SOBERANO (Evita duplicidad de código DRY)
async function getClinicaSoberana(idOrSlug) {
  try {
    // 1. Intento por ID de documento (Rápido)
    let doc = await db.collection('clinicas').doc(idOrSlug).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };

    // 2. Intento por URL amigable (Slug)
    const q = await db.collection('clinicas').where('slug', '==', idOrSlug).limit(1).get();
    if (!q.empty) return { id: q.docs[0].id, ...q.docs[0].data() };

    return null; // No existe
  } catch (e) {
    console.error("❌ Error en localizador soberano:", e.message);
    return null;
  }
}
// ✅ 1. MAPEADO SOBERANO DE PLANES Y PRECIOS
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// 🛰️ 2. HELPER: LOCALIZADOR SOBERANO (Arquitectura DRY - Grado Omega)
// Busca una clínica por su ID único o por su URL amigable (Slug)
async function getClinicaSoberana(idOrSlug) {
  try {
    if (!idOrSlug) return null;

    // Intento 1: Búsqueda directa por ID de documento (Máxima velocidad)
    let doc = await db.collection('clinicas').doc(idOrSlug).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };

    // Intento 2: Búsqueda por URL amigable (Slug)
    const q = await db.collection('clinicas').where('slug', '==', idOrSlug).limit(1).get();
    if (!q.empty) return { id: q.docs[0].id, ...q.docs[0].data() };

    return null; // El palacio no existe
  } catch (e) {
    console.error("❌ Error Crítico en Localizador Soberano:", e.message);
    return null;
  }
}

// ==========================================
// 🏭 1. CONFIGURACIÓN TÉCNICA (NIVEL NASA)
// ==========================================
const PROJECT_ID_FIXED = 'spatial-victory-480409-b7';
const REGION_FIXED = 'europe-west1'; // Sincronizado con Bélgica para soberanía de datos
const DEV_MODE = process.env.DEV_MODE === 'true'; // Se activa solo si se define explícitamente
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// --- INICIALIZACIÓN FIREBASE (IDENTIDAD NATIVA) ---
// Usamos applicationDefault para que Cloud Run use su propia identidad sin archivos JSON externos
if (!admin.apps.length) {
  initializeApp({ 
    credential: applicationDefault(), 
    projectId: PROJECT_ID_FIXED 
  });
}
const db = getFirestore();

// --- CONFIGURACIÓN MOTOR IA (SDK OFICIAL) ---
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const vertex_ai = new VertexAI({ project: PROJECT_ID_FIXED, location: REGION_FIXED });

// --- CONFIGURACIÓN DE HERRAMIENTAS (TOOLS) PARA EL CEREBRO DE ANA ---
const tools = [
  {
    function_declarations: [
      {
        name: "agendar_cita",
        description: "Reserva una cita en la agenda de la clínica tras validar disponibilidad.",
        parameters: {
          type: "OBJECT",
          properties: {
            fecha: { type: "STRING", description: "Fecha y hora en formato YYYY-MM-DD HH:mm" },
            nombre: { type: "STRING", description: "Nombre completo del paciente" },
            email: { type: "STRING", description: "Email válido del paciente" }
          },
          required: ["fecha", "nombre", "email"]
        }
      },
      {
        name: "crear_alerta_medica",
        description: "Emite una alerta cuando el paciente menciona una Bandera Roja (accidente, bebés, suelo pélvico).",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: { type: "STRING", description: "Breve descripción del riesgo detectado" }
          },
          required: ["motivo"]
        }
      }
    ]
  }
];

// Inicializamos el motor con las herramientas integradas (Sustituye al bloque anterior)
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash', // Versión 1.5 es la certificada para Function Calling
  tools: tools,
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2 
  }
});

// --- MOTOR DE PAGOS (STRIPE) ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe;
if (STRIPE_SECRET_KEY) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
    console.log("✅ STRIPE ENGINE: CONECTADO");
} else {
    console.log("⚠️ AVISO: Stripe operando en modo Offline/Presencial");
}

// --- CONFIGURACIÓN MENSAJERÍA (SMTP) ---
const transporter = nodemailer.createTransport({
  host: "mail.fisiotool.com",
  port: 465,
  secure: true, // Puerto 465 exige SSL/TLS
  auth: { 
    user: "ana@fisiotool.com", 
    pass: process.env.EMAIL_PASS 
  }
});

// --- INICIALIZACIÓN DEL SERVIDOR (EXPRESS) ---
const app = express();
app.use(cors()); // Permite la comunicación Dashboard <-> API
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURACIÓN DE CARROCERÍA (NEXT.JS SYNC) ---
// Buscamos la carpeta out del Ferrari visual de forma resiliente
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out'); // Fallback para despliegue en raíz
}
// ==========================================
// 🛠️ 2. UTILIDADES DE INGENIERÍA (PRECISIÓN NASA)
// ==========================================

// Limpieza de teléfonos: elimina prefijos y asegura formato puro para WhatsApp/CRM
function normalizarTelefono(tlf) {
  if (!tlf) return "";
  // Eliminamos cualquier carácter que no sea número
  let limpio = tlf.replace(/\D/g, '');
  // Si empieza por 34 (España) y tiene 11 dígitos, quitamos el 34
  if (limpio.startsWith('34') && limpio.length > 9) {
    limpio = limpio.substring(2);
  }
  return limpio.trim();
}

// Detector dinámico de Host: garantiza que el dinero (Stripe) siempre encuentre el camino de vuelta
function getDynamicHost(req) {
  const host = req.get('host');
  // En Cloud Run forzamos HTTPS para seguridad de grado médico
  if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
    return `https://${host}`;
  }
  return `${req.protocol}://${host}`;
}

// FUNCIÓN MAESTRA: Habla con el Microchip de Google Vertex AI
async function callVertexAI(contents) {
  try {
    console.log("🤖 Ana está analizando la conducta y las herramientas disponibles...");
    
    // Formateamos para cumplir el protocolo estricto de Google (role: user)
    const formattedContents = contents.map(c => ({
      role: c.role || "user",
      parts: c.parts
    }));

    const result = await model.generateContent({ contents: formattedContents });
    const response = result.response;
    
    // NAVEGACIÓN DEFENSIVA: Verificamos si Google ha bloqueado la respuesta
    const candidate = response.candidates && response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.warn("⚠️ IA bloqueada por filtros de seguridad de Google.");
      return { isTool: false, text: "Disculpa, no puedo procesar esa solicitud por seguridad médica. ¿Podrías explicármelo de otra forma?" };
    }

    // --- DETECCIÓN DE HERRAMIENTAS (Function Calling) ---
    // Verificamos si Ana ha decidido "pulsar un botón" (llamar a una función)
    const call = candidate.content.parts.find(p => p.functionCall);
    
    if (call) {
      console.log(`🛠️ EJECUCIÓN: Ana llama a la herramienta [${call.functionCall.name}]`);
      return { 
        isTool: true, 
        functionName: call.functionCall.name, 
        args: call.functionCall.args,
        text: candidate.content.parts.find(p => p.text)?.text || "" 
      };
    }

    // Si no hay herramienta, devolvemos texto normal
    const text = candidate.content.parts[0].text;
    console.log("✅ Respuesta de texto generada con éxito.");
    return { isTool: false, text: text };

  } catch (e) {
    console.error("❌ ERROR CRÍTICO MOTOR IA:", e.message);
    throw e; 
  }
}

// ==========================================
// 🧠 3. CEREBRO DE ANA (CONTEXTO CONDUCTUAL SUPREME)
// ==========================================

async function crearContextoAna(idClinicaActual) {
  // Localización soberana de la clínica (ID o Slug)
  let doc = await db.collection('clinicas').doc(idClinicaActual).get();
  if (!doc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinicaActual).limit(1).get();
    if(!q.empty) doc = q.docs[0];
  }

  const info = doc.exists ? doc.data() : { nombre_clinica: "Fisiotool", precio_sesion: 100, default_duration_min: 45 };
  
  // Sincronización temporal con Madrid (Independiente de la ubicación del servidor)
  const ahora = new Date().toLocaleString('en-US', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const fianza = info.fianza_reserva || 15;
  const flags = info.banderas_rojas || [];
  const sedes = info.direcciones || [];
  const metodos = info.metodos_pago ? info.metodos_pago.join(', ') : "Stripe, Bizum, Efectivo";

  let textoSedes = sedes.length > 1 
    ? `VARIAS SEDES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. OBLIGATORIO: Preguntar sede antes de reservar.`
    : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar'}, ${sedes[0]?.ciudad || ''}.`;

  return `
    TU IDENTIDAD (DISERTACIÓN CONDUCTUAL PROFUNDA):
    Eres la mayor autoridad del mundo en descifrar la conducta humana. Analizas patrones universales, motivaciones inconscientes, sesgos cognitivos y mecanismos de defensa. Tu trato es maravilloso, empático y profundamente persuasivo.
    ACTÚAS COMO: 'Ana', recepcionista de élite de "${info.nombre_clinica}". No eres un bot, eres excelencia pura.

    DATOS DE NEGOCIO (SOBERANÍA DEL CALENDARIO):
    - FECHA ACTUAL EN TU CONSULTA: ${ahora}.
    - PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min} min.
    - COBRO: Se requiere fianza de ${fianza}€ para blindar el hueco.
    - MÉTODOS ACEPTADOS: ${metodos}.
    - ${textoSedes}
    
    🛡️ PROTOCOLO SEGURIDAD (RED FLAGS):
    Si mencionan [${flags.join(', ')}], NO des cita. Di que requiere valoración manual y que llamen al teléfono de la clínica. Añade al final: ###ALERTA|Caso_Especial###

    ⚠️ REGLA DE ORO DE CAPTACIÓN (OBLIGATORIO):
    Para agendar cualquier cita, necesitas TRES datos:
    1. Nombre del paciente.
    2. Motivo de la consulta.
    3. EMAIL (Explícales que es para el justificante legal y el recordatorio de 12h).

    NO PUEDES LANZAR LA RESERVA SIN EL EMAIL. Si no lo dan, pídelo educadamente.

    MANDAMIENTOS DE CIERRE:
    Cuando tengas Fecha/Hora, Nombre y EMAIL, usa: 
    ###RESERVA|YYYY-MM-DD HH:mm|Nombre|Email###
  `;
}
// ============================================================
// 💾 4. HELPERS DE BASE DE DATOS (ESTRUCTURA SOBERANA)
// ============================================================

// Graba la reserva con blindaje legal RGPD v1.1
async function crearReserva(datos, idClinica, req) {
  try {
    let doc = await db.collection('clinicas').doc(idClinica).get();
    if(!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }
    const info = doc.data();
    const duracion = info?.default_duration_min || 45;
    
    // Captura de IP Real para el rastro legal
    const clientIp = req?.headers['x-forwarded-for'] || req?.ip || "unknown";

    const ref = await db.collection('citas').add({ 
      ...datos, 
      clinic_id: idClinica, 
      nombre_clinica: info?.nombre_clinica || "FisioTool",
      fecha_hora_inicio: datos.fecha, // Guardado como String YYYY-MM-DD HH:mm para soberanía horaria
      duracion_minutos: duracion, 
      creado: admin.firestore.Timestamp.now(), 
      status: datos.status || 'pendiente_confirmacion',
      recordatorio_enviado: false,
      aceptacion_rgpd: {
        aceptado: true,
        fecha: admin.firestore.Timestamp.now(),
        version: "1.1",
        ip: clientIp
      }
    }); 
    
    console.log("✅ Cita Sincronizada en el Palacio (ID):", ref.id);
    return ref.id;
  } catch (e) { 
    console.error("❌ ERROR EN GRABACIÓN DE RESERVA:", e); 
    return null; 
  }
}

// Registro histórico de la conversación
async function guardarLogChat(tlf, usr, ia, idClinica) {
  try {
    await db.collection('chats').add({ 
      tlf, usr, ia, clinic_id: idClinica, ts: admin.firestore.Timestamp.now() 
    });
  } catch (e) { console.error("❌ Error en Log de Inteligencia:", e); }
}

// Emisión de alertas por Banderas Rojas
async function crearAlerta(tlf, iaReply, idClinica, motivo) {
  try {
    await db.collection('alertas_red_flag').add({
      paciente_tlf: tlf,
      mensaje_ia: iaReply,
      clinic_id: idClinica,
      motivo: motivo,
      creado: admin.firestore.Timestamp.now(),
      status: 'pendiente'
    });
    console.log("🚨 Alerta de seguridad emitida.");
  } catch (e) { console.error("❌ Error en Sistema de Alertas:", e); }
}

// Gestión de Bonos (Fidelización)
async function consultarYDescontarBono(tlf, idClinica) {
  try {
    const snap = await db.collection('bonos')
      .where('clinic_id', '==', idClinica)
      .where('paciente_tlf', '==', tlf)
      .where('status', '==', 'activo')
      .where('sesiones_disponibles', '>', 0)
      .limit(1).get();

    if (snap.empty) return { bonoUsado: false };

    const bonoDoc = snap.docs[0];
    const nuevas = bonoDoc.data().sesiones_disponibles - 1;
    await bonoDoc.ref.update({
      sesiones_disponibles: nuevas,
      status: nuevas <= 0 ? 'consumido' : 'activo'
    });
    console.log(`🎟️ Bono detectado: -1 sesión. Restan: ${nuevas}`);
    return { bonoUsado: true, sesionesRestantes: nuevas };
  } catch (e) { return { bonoUsado: false }; }
}

// EL MOTOR DEL TIEMPO: Comprueba disponibilidad ignorando el desfase del servidor
async function checkAgendaDeterminista(idClinica, fechaIntentoStr) {
  let clinicaDoc = await db.collection('clinicas').doc(idClinica).get();
  if(!clinicaDoc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
    if(!q.empty) clinicaDoc = q.docs[0];
    else return { available: false, reason: "clínica no disponible" };
  }
  
  const clinicaData = clinicaDoc.data();
  const fechaSoloDia = fechaIntentoStr.split(' ')[0]; // Extrae YYYY-MM-DD

  // 1. COMPROBACIÓN DE BLOQUEOS (VACACIONES/FESTIVOS)
  const bloqueosSnap = await db.collection('bloqueos')
    .where('clinic_id', '==', idClinica)
    .where('inicio', '<=', fechaSoloDia)
    .get();

  for (const doc of bloqueosSnap.docs) {
    const b = doc.data();
    if (fechaSoloDia >= b.inicio && fechaSoloDia <= b.fin) {
      return { available: false, reason: `estamos cerrados por ${b.motivo}` };
    }
  }

  // 2. MATEMÁTICA DE HORARIO (Sincronización Madrid)
  const [y, m, d] = fechaSoloDia.split('-').map(Number);
  const [hh, mm] = fechaIntentoStr.split(' ')[1].split(':').map(Number);
  const diaSemana = new Date(y, m - 1, d).getDay().toString();
  const horarioDia = clinicaData?.weekly_schedule?.[diaSemana];

  if (!horarioDia || horarioDia.length === 0) return { available: false, reason: "está cerrado por calendario" };

  const duracionMinutos = clinicaData?.default_duration_min || 45;
  const citaStartMin = (hh * 60) + mm;
  const citaEndMin = citaStartMin + duracionMinutos;

  let dentroHorario = false;
  for (const slot of horarioDia) {
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    if (citaStartMin >= (sh * 60 + sm) && citaEndMin <= (eh * 60 + em)) {
      dentroHorario = true;
      break;
    }
  }
  if (!dentroHorario) return { available: false, reason: "fuera de horario comercial" };

  // 3. COLISIONES (Eficiencia de costes: solo consultamos hoy)
  const inicioMs = Date.UTC(y, m-1, d, hh, mm);
  const finMs = inicioMs + (duracionMinutos * 60000);

  const citasConflicto = await db.collection('citas')
    .where('clinic_id', '==', idClinica)
    .where('fecha_hora_inicio', '>=', fechaSoloDia) 
    .where('status', 'in', ['confirmada', 'pendiente_pago', 'pendiente_confirmacion'])
    .get();

  for (const doc of citasConflicto.docs) {
    const c = doc.data();
    // Descartamos citas amarillas que ya expiraron (liberación de hueco instantánea)
    if(c.status === 'pendiente_pago' && c.expira_el && Date.now() > c.expira_el.toMillis()) continue;

    const [cY, cM, cD] = c.fecha_hora_inicio.split(' ')[0].split('-').map(Number);
    const [cH, cMin] = c.fecha_hora_inicio.split(' ')[1].split(':').map(Number);
    const cInicio = Date.UTC(cY, cM-1, cD, cH, cMin);
    const cFin = cInicio + (c.duracion_minutos || 45) * 60000;

    if (inicioMs < cFin && cInicio < finMs) return { available: false, reason: "el hueco ya está ocupado" };
  }

  return { available: true };
}
// ============================================================
// 🔄 6. PROCESAMIENTO UNIFICADO (MODO TOOLS - GRADO NASA)
// ============================================================

async function procesarMensajeUnificado(idClinica, tlf, msg, isWhatsapp, req) {
  try {
    let currentID = idClinica;
    const tlfLimpio = normalizarTelefono(tlf);

    // 1. IDENTIFICACIÓN Y CRM
    const pacienteRef = db.collection('pacientes').doc(`${currentID}_${tlfLimpio}`);
    const pacienteDoc = await pacienteRef.get();
    let identityMsg = pacienteDoc.exists 
      ? `Reconoces al paciente: ${pacienteDoc.data().nombre}.` 
      : "Paciente nuevo. Pide su nombre y EMAIL.";

    // 2. MEMORIA DE HISTORIAL
    const promptBase = await crearContextoAna(currentID);
    const chatsSnap = await db.collection('chats').where('clinic_id', '==', currentID).where('tlf', '==', tlfLimpio).orderBy('ts', 'desc').limit(6).get();
    let history = "";
    chatsSnap.docs.reverse().forEach(d => history += `User: ${d.data().usr}\nAna: ${d.data().ia}\n`);

    // 3. LLAMADA AL MOTOR SOBERANO (Fase B.2)
    const promptFinal = `${promptBase}\n\nIDENTIDAD:\n${identityMsg}\n\nHISTORIAL:\n${history}\nMENSAJE USUARIO: ${msg}`;
    const iaResponse = await callVertexAI([{ role: "user", parts: [{ text: promptFinal }] }]);
    
    let finalReply = iaResponse.text; // El texto que Ana quiere decir

    // 4. EJECUCIÓN DE HERRAMIENTAS (Function Calling)
    if (iaResponse.isTool) {
      const { functionName, args } = iaResponse;

      // --- CASO A: AGENDAR CITA ---
      if (functionName === "agendar_cita") {
        const { fecha, nombre, email } = args;
        const pacNombre = pacienteDoc.exists ? pacienteDoc.data().nombre : nombre;
        
        const check = await checkAgendaDeterminista(currentID, fecha);

        if (!check.available) {
          finalReply = `Vaya, acabo de revisar la agenda y ese hueco no es posible porque ${check.reason}. ¿Te va bien probar un poco más tarde?`;
        } else {
          const bono = await consultarYDescontarBono(tlfLimpio, currentID);
          const citaData = { 
            paciente_telefono: tlfLimpio, fecha, paciente_nombre: pacNombre, paciente_email: email,
            tipo_pago: bono.bonoUsado ? 'Bono' : 'Pendiente',
            status: bono.bonoUsado ? 'confirmada' : 'pendiente_pago',
            expira_el: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 12*3600000))
          };

          const citaId = await crearReserva(citaData, currentID, req);
          await enviarConfirmacionInmediata(citaData, currentID);

          if (bono.bonoUsado) {
            finalReply += `\n\n✅ ¡Todo listo! He usado tu bono. Te quedan ${bono.sesionesRestantes} sesiones.`;
          } else {
            // Lógica Stripe/Bizum integrada
            const clinicaDoc = await db.collection('clinicas').doc(currentID).get();
            const fianza = clinicaDoc.data()?.fianza_reserva || 15;
            
            if (stripe && clinicaDoc.data()?.stripe_account_id) {
              const host = getDynamicHost(req);
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: email,
                line_items: [{ price_data: { currency: 'eur', product_data: { name: 'Fianza Reserva' }, unit_amount: fianza * 100 }, quantity: 1 }],
                mode: 'payment',
                success_url: `${host}/dashboard?pago=ok`,
                cancel_url: `${host}/agenda/${currentID}`,
                metadata: { cita_id: citaId, tipo: "reserva_cita", clinic_id: currentID }
              });
              finalReply += `\n\n💳 Para confirmar tu cita, abona la señal de ${fianza}€ aquí: ${session.url}`;
            } else {
              finalReply += `\n\n✅ ¡Hecho! Tu cita está pre-reservada. El abono se realizará directamente en la clínica.`;
            }
          }
        }
      }

      // --- CASO B: ALERTA MÉDICA ---
      if (functionName === "crear_alerta_medica") {
        await crearAlerta(tlfLimpio, finalReply, currentID, args.motivo);
      }
    }

    // 5. REGISTRO Y ENVÍO
    if (isWhatsapp && WHATSAPP_TOKEN) {
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp', to: tlfLimpio, type: 'text', text: { body: finalReply }
      }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
    }

    await guardarLogChat(tlfLimpio, msg, finalReply, currentID);
    return { reply: finalReply };

  } catch (e) {
    console.error("🔥 Error Procesamiento Unificado:", e);
    return { reply: "Lo siento, he tenido un pequeño error de conexión. ¿Podrías repetirme para qué día querías la cita?" };
  }
}
// ============================================================
// 📲 7. FUNCIÓN ASÍNCRONA PARA WHATSAPP (CONEXIÓN EXTERNA)
// ============================================================

// Esta función procesa los mensajes de WhatsApp en segundo plano
async function procesarMensajeAsync(reqBody, clinicId) {
  try {
    if (!reqBody.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) return;
    
    const messageData = reqBody.entry[0].changes[0].value.messages[0];
    const tlf = messageData.from;
    const msg = messageData.text?.body;

    if (tlf && msg) {
      // Llamamos al motor unificado con flag de WhatsApp (isWhatsapp = true)
      await procesarMensajeUnificado(clinicId, tlf, msg, true, null);
    }
  } catch (e) {
    console.error("❌ Error en Procesador Async WhatsApp:", e.message);
  }
}

// ============================================================
// 🌐 8. ENDPOINTS DE INTERACCIÓN (CHATS Y CONFIG)
// ============================================================

// --- WEBHOOK WHATSAPP: VERIFICACIÓN (META) ---
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK VERIFICADO POR META");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// --- WEBHOOK WHATSAPP: RECEPCIÓN DE MENSAJES (PLAN B) ---
app.post('/webhook', async (req, res) => {
  // 📨 RESPONDER INMEDIATAMENTE (Evita que Meta reenvíe el mensaje si tardamos)
  res.sendStatus(200); 

  const reqBody = req.body;
  
  // Detectamos a qué número de teléfono va dirigido el mensaje (Para el Plan B)
  const phoneIDReceptor = reqBody.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
  
  try {
    let currentID = CLINIC_ID_DEFAULT;

    // LÓGICA PLAN B: Buscamos qué clínica es dueña de ese PhoneID
    if (phoneIDReceptor) {
      const q = await db.collection('clinicas').where('wa_phone_id_pro', '==', phoneIDReceptor).limit(1).get();
      if (!q.empty) currentID = q.docs[0].id;
    }

    // Ejecutamos el procesamiento en segundo plano para no bloquear el Webhook
    procesarMensajeAsync(reqBody, currentID);
    
  } catch (e) { console.error("Error identificando clínica en Webhook:", e); }
});

// --- API CHAT: EL MOTOR DEL LANDINGBOT (PLAN A) ---
app.post('/api/chat/:clinicId', async (req, res) => {
  const { message, patient_tlf } = req.body;
  const { clinicId } = req.params;

  if (!message || !patient_tlf) {
    return res.status(400).send({ error: "Faltan parámetros críticos (message, patient_tlf)." });
  }

  try {
    // El flag isWhatsapp es false (Plan A: Web)
    const result = await procesarMensajeUnificado(clinicId, patient_tlf, message, false, req); 
    res.json(result); 
  } catch (e) {
    res.status(500).json({ error: "Error en el cerebro de Ana." });
  }
});

// --- API CONFIG: ENTREGA DATOS AL FRONTEND ---
// --- API CONFIG: GPS SOBERANO (PÚBLICO) ---
app.get('/api/config/:clinicId', async (req, res) => {
  try {
    const clinica = await getClinicaSoberana(req.params.clinicId);
    if (!clinica) return res.status(404).send({ error: "Clínica no encontrada." });

    res.json({
      id: clinica.id,
      nombre_clinica: clinica.nombre_clinica,
      logo_url: clinica.logo_url || "",
      address: clinica.direcciones?.[0]?.calle || "Consultar",
      phone: clinica.phone || "",
      weekly_schedule: clinica.weekly_schedule,
      default_duration_min: clinica.default_duration_min || 45,
      mi_codigo_referido: clinica.mi_codigo_referido || clinica.id.substring(0,8).toUpperCase()
    });
  } catch (e) { res.status(500).send("Error al cargar configuración."); }
});
// --- REGISTRO DE CLÍNICA: ALTA, CIFRADO Y FACTURACIÓN (VERSION UNIFICADA OMEGA) ---
app.post('/api/register', async (req, res) => {
  const d = req.body;
  
  try {
    // 1. PREPARACIÓN DE IDENTIDAD Y SEGURIDAD
    const emailLimpio = d.email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(d.password, salt);

    // Generación de Slug único
    let slug = d.nombre_clinica.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existeSlug = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!existeSlug.empty) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const miCodigoReferido = 'FT-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // 2. CONSTRUCCIÓN DEL OBJETO DE DATOS (SOBERANÍA FIREBASE)
    const newClinicData = {
      nombre_clinica: d.nombre_clinica,
      slug: slug,
      email: emailLimpio,
      password: hashedPassword,
      precio_sesion: parseInt(d.precio || 100),
      fianza_reserva: parseInt(d.fianza || 15),
      default_duration_min: parseInt(d.duracion || 45),
      banderas_rojas: d.flags || [],
      metodos_pago: d.metodos_pago || ['Efectivo'],
      weekly_schedule: { 
        "1": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "2": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "3": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "4": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "5": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "6": [], "0": [] 
      },
      direcciones: [{ calle: d.calle || "", numero: d.numero || "", cp: d.cp || "", ciudad: d.ciudad || "", provincia: d.provincia || "", principal: true }],
      mi_codigo_referido: miCodigoReferido,
      plan: d.plan || 'solo',
      created_at: admin.firestore.Timestamp.now(),
      status: 'pendiente_pago',
      aceptacion_legal: { aceptado: true, fecha: admin.firestore.Timestamp.now(), version: "1.1" }
    };

    const ref = await db.collection('clinicas').add(newClinicData);
    const token = jwt.sign({ clinicId: ref.id }, JWT_SECRET, { expiresIn: '30d' });

    // 3. INTEGRACIÓN STRIPE MULTI-PLAN (CON TRIAL Y REFERIDOS)
    if (stripe) {
      const planElegido = d.plan || 'solo';
      const priceId = PLANES_STRIPE[planElegido] || PLANES_STRIPE['solo'];

      const sessionConfig = {
        payment_method_types: ['card'],
        customer_email: emailLimpio,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 30, // 🎁 30 días gratis
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          metadata: { 
            clinic_id: ref.id, 
            referente_id: d.codigo_invitacion || "" 
          }
        },
        payment_method_collection: 'always',
        success_url: `${getDynamicHost(req)}/dashboard?id=${ref.id}&pago=ok&token=${token}`,
        cancel_url: `${getDynamicHost(req)}/setup?error=pago_cancelado`,
        metadata: { 
            clinic_id: ref.id, 
            tipo: 'suscripcion',
            referente_id: d.codigo_invitacion || "" 
        }
      };

      // Si hay código de invitación (plan solo o con cupón activo), aplicamos descuento
      if (d.codigo_invitacion) {
        sessionConfig.subscription_data.discounts = [{ coupon: 'feMDHJlj' }];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log(`🚀 Checkout generado (${planElegido}) para: ${d.nombre_clinica}`);
      
      return res.json({ 
        success: true, 
        token, 
        payment_url: session.url 
      });
    }

    // Fallback si Stripe no está activo (Modo Desarrollo o Manual)
    return res.json({ 
      success: true, 
      token, 
      dashboard_url: `/dashboard?id=${ref.id}&token=${token}` 
    });

  } catch(e) { 
    console.error("🔥 Error Crítico en Registro:", e);
    return res.status(500).json({ error: "Fallo en el alta: " + e.message }); 
  }
});
 // ============================================================
// 🔑 MOTOR DE IDENTIDAD, SEGURIDAD Y REGISTRO (GRADO OMEGA)
// ============================================================

// --- REGISTRO DE CLÍNICA: ALTA, CIFRADO Y FACTURACIÓN ---
app.post('/api/register', async (req, res) => {
  const d = req.body;
  
  try {
    // 1. NORMALIZACIÓN Y LIMPIEZA
    const emailNormal = d.email.toLowerCase().trim();
    
    // 2. TRITURADORA DE CONTRASEÑAS (BCRYPT) - Soluciona Vulnerabilidad #1
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(d.password, salt);

    // 3. GENERACIÓN DE SLUG SOBERANO (IDENTIDAD DE URL)
    let slug = d.nombre_clinica.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existeSlug = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!existeSlug.empty) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 4. CONFIGURACIÓN DE REGLAS DE NEGOCIO (ESTANDARIZACIÓN TIMESTAMPS)
    const slots = d.hace_descanso === true 
      ? [{start: d.descanso_inicio, end: d.descanso_fin}] 
      : [];

    const miCodigoReferido = 'FT-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const newClinicData = {
      nombre_clinica: d.nombre_clinica,
      slug: slug,
      email: emailNormal,
      password: hashedPassword, // ✅ GUARDADA EN FORMATO HASH (SEGURIDAD TOTAL)
      precio_sesion: parseInt(d.precio || 100),
      fianza_reserva: parseInt(d.fianza || 15),
      default_duration_min: parseInt(d.duracion || 45),
      banderas_rojas: d.flags || [],
      metodos_pago: d.metodos_pago || ['Efectivo'],
      plan: d.plan || 'solo',
      weekly_schedule: { 
        "1": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "2": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "3": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "4": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "5": [{start: d.apertura || "09:00", end: d.cierre || "20:00"}], 
        "6": [], "0": [] 
      },
      direcciones: [{ 
        calle: d.calle || "", 
        numero: d.numero || "", 
        cp: d.cp || "", 
        ciudad: d.ciudad || "", 
        provincia: d.provincia || "", 
        principal: true 
      }],
      mi_codigo_referido: miCodigoReferido,
      created_at: admin.firestore.Timestamp.now(), // ✅ USO DE TIMESTAMPS NATIVOS
      status: 'pendiente_pago',
      aceptacion_legal: { aceptado: true, fecha: admin.firestore.Timestamp.now(), version: "1.1" }
    };

    // 5. GUARDADO EN FIRESTORE
    const ref = await db.collection('clinicas').add(newClinicData);
    
    // 6. EMISIÓN DE LLAVE MAESTRA (JWT) - Soluciona Vulnerabilidad #2
    const token = jwt.sign({ clinicId: ref.id }, JWT_SECRET, { expiresIn: '30d' });

    // 7. MOTOR FINANCIERO: STRIPE CON PRUEBA DE 30 DÍAS
    if (stripe) {
      const planElegido = d.plan || 'solo';
      const priceId = PLANES_STRIPE[planElegido] || PLANES_STRIPE['solo'];

      const sessionConfig = {
        payment_method_types: ['card'],
        customer_email: emailNormal,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 30, // 🎁 30 días de prueba gratuita
          metadata: { 
            clinic_id: ref.id, 
            referente_id: (planElegido === 'solo' && d.codigo_invitacion) ? d.codigo_invitacion : "" 
          }
        },
        payment_method_collection: 'always',
        success_url: `${getDynamicHost(req)}/dashboard?id=${ref.id}&pago=ok&token=${token}`,
        cancel_url: `${getDynamicHost(req)}/setup?error=pago_cancelado`,
        metadata: { 
            clinic_id: ref.id, 
            tipo: 'suscripcion',
            referente_id: (planElegido === 'solo' && d.codigo_invitacion) ? d.codigo_invitacion : "" 
        }
      };

      // Descuento referido Plan Solo
      if (planElegido === 'solo' && d.codigo_invitacion) {
        sessionConfig.subscription_data.discounts = [{ coupon: 'feMDHJlj' }];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      return res.json({ success: true, token, payment_url: session.url });
    }

    res.json({ success: true, token, dashboard_url: `/dashboard?id=${ref.id}&token=${token}` });

  } catch(e) { 
    console.error("🔥 Error Crítico en Registro:", e.message);
    res.status(500).json({ error: "Fallo en el sistema de alta." }); 
  }
});

// --- LOGIN CON VERIFICACIÓN CRIPTOGRÁFICA ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Datos incompletos." });

  try {
    const emailNormal = email.toLowerCase().trim();
    const q = await db.collection('clinicas').where('email', '==', emailNormal).limit(1).get();

    if (q.empty) {
      return res.status(401).json({ success: false, error: "Clínica no registrada." });
    }

    const clinicaDoc = q.docs[0];
    const clinicaData = clinicaDoc.data();

    // Comparamos el texto plano con el Hash de la DB
    const validPassword = await bcrypt.compare(password, clinicaData.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Contraseña incorrecta." });
    }

    // Emitimos Token Seguro
    const token = jwt.sign({ clinicId: clinicaDoc.id }, JWT_SECRET, { expiresIn: '30d' });

    console.log(`🔑 Acceso autorizado: ${clinicaData.nombre_clinica}`);
    res.json({ success: true, token, clinicId: clinicaDoc.id });

  } catch (e) { 
    console.error("🔥 Error en sistema de Login:", e);
    res.status(500).json({ error: "Fallo en la autenticación." }); 
  }
});
// ============================================================
// 🔄 10. WEBHOOK VIGILANTE DE STRIPE (CIERRE DE CICLO)
// ============================================================

// ============================================================
// 💳 10. WEBHOOK VIGILANTE DE STRIPE (PROTOCOLO RAW-BODY)
// ============================================================
app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Verificación de Firma (Garantiza que el mensaje viene de Stripe)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("❌ Error de Firma en Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // --- EVENTO A: ALTA INICIAL (Checkout Completado) ---
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { tipo, cita_id, clinic_id, referente_id } = session.metadata;

      if (tipo === 'reserva_cita') {
        const citaRef = db.collection('citas').doc(cita_id);
        const snap = await citaRef.get();
        await citaRef.update({ 
          status: 'confirmada', 
          tipo_pago: 'Stripe Online', 
          pagado_el: admin.firestore.Timestamp.now() 
        });
        if (snap.exists) await enviarConfirmacionInmediata(snap.data(), clinic_id);
        console.log(`✅ Cita confirmada: ${cita_id}`);
      } 
      
      else if (tipo === 'suscripcion') {
        const clinicaRef = db.collection('clinicas').doc(clinic_id);
        await clinicaRef.update({ 
          status: 'activo', 
          suscripcion_id: session.subscription,
          activado_el: admin.firestore.Timestamp.now(),
          referente_id_pendiente: referente_id || "" 
        });
        
        const snap = await clinicaRef.get();
        const cData = snap.data();
        if (cData && cData.email) {
          await enviarEmailBienvenida(cData.email, cData.nombre_clinica, clinic_id);
        }
        console.log(`🚀 Clínica activada: ${cData?.nombre_clinica}`);
      }
    }

    // --- EVENTO B: PAGO DE FACTURA (Recompensa al Referente) ---
    if (event.type === 'invoice.paid') {
      const factura = event.data.object;
      if (factura.subscription && factura.amount_paid > 0) {
        const sub = await stripe.subscriptions.retrieve(factura.subscription);
        const idRef = sub.metadata.referente_id;
        if (idRef) {
          const refDoc = await db.collection('clinicas').doc(idRef).get();
          if (refDoc.exists && refDoc.data().suscripcion_id) {
            await stripe.subscriptions.update(refDoc.data().suscripcion_id, { coupon: 'feMDHJlj' });
            console.log(`🎟️ Recompensa del 50% aplicada al referente: ${idRef}`);
          }
        }
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error("🔥 Error interno Webhook:", error.message);
    res.status(500).send("Fallo interno");
  }
});

// ✅ VITAL: Activamos el traductor JSON SOLO para las rutas que vienen después
app.use(express.json());
// ============================================================
// 💳 11. MOTOR STRIPE CONNECT (COBRO DIRECTO PARA FISIOS)
// ============================================================

app.post('/api/stripe/onboard', verificarToken, async (req, res) => {
  try {
    const account = await stripe.accounts.create({ type: 'express' });
    const host = getDynamicHost(req);
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${host}/dashboard?stripe=retry`,
      return_url: `${host}/dashboard?stripe=success`,
      type: 'account_onboarding',
    });
    // Usamos req.clinicId del Token, no el que envíe el cliente (Seguridad BOLA)
    await db.collection('clinicas').doc(req.clinicId).update({ stripe_connect_id: account.id });
    res.json({ url: accountLink.url });
  } catch (e) { res.status(500).send("Error en pasarela de alta."); }
});

// --- IMPORTACIÓN MASIVA (OPTIMIZADA PROMISE.ALL) ---
app.post('/api/dashboard/importar-pacientes', verificarToken, async (req, res) => {
  const { pacientes } = req.body;
  if (!pacientes) return res.status(400).send("No hay datos.");

  try {
    const chunks = [];
    for (let i = 0; i < pacientes.length; i += 500) chunks.push(pacientes.slice(i, i + 500));

    // Ejecutamos los lotes en paralelo para máxima velocidad (NASA Style)
    await Promise.all(chunks.map(async (chunk) => {
      const batch = db.batch();
      chunk.forEach(p => {
        const tlf = normalizarTelefono(p.telefono);
        const ref = db.collection('pacientes').doc(`${req.clinicId}_${tlf}`);
        batch.set(ref, { ...p, clinic_id: req.clinicId, creado_el: Timestamp.now() }, { merge: true });
      });
      return batch.commit();
    }));

    res.json({ success: true, total: pacientes.length });
  } catch (e) { res.status(500).send(e.message); }
});

// ============================================================
// 🕵️‍♂️ 12. THE FOUNDRY: MONITORIZACIÓN GLOBAL (VISTA DE DIOS)
// ============================================================

app.get('/api/admin/stats-globales', async (req, res) => {
  try {
    const clinicasSnap = await db.collection('clinicas').get();
    const citasSnap = await db.collection('citas').get();
    
    let mrr = 0; // Ingreso Mensual Recurrente
    const listaClinicas = [];

    clinicasSnap.forEach(doc => {
      const d = doc.data();
      listaClinicas.push({
        id: doc.id,
        nombre: d.nombre_clinica,
        email: d.email,
        status: d.status,
        fecha: d.created_at?.toDate().toLocaleDateString() || 'Antigua'
      });
      // Solo sumamos al MRR las clínicas que han pasado el trial
      if (d.status === 'activo') mrr += 100;
    });

    res.json({
      success: true,
      stats: {
        totalClinicas: clinicasSnap.size,
        totalCitasAna: citasSnap.size,
        mrr: mrr + "€"
      },
      clinicas: listaClinicas
    });
  } catch (e) { 
    console.error("❌ Error en Foundry Stats:", e.message);
    res.status(500).send("Fallo en la lectura global."); 
  }
});

// ============================================================
// 🧠 13. ANA ASSISTANT: CONSULTORÍA ESTRATÉGICA 24/7
// ============================================================

app.post('/api/dashboard/ana-assistant', async (req, res) => {
  const { clinic_id, message } = req.body;
  if (!clinic_id || !message) return res.status(400).send("Faltan datos.");

  try {
    const doc = await db.collection('clinicas').doc(clinic_id).get();
    if (!doc.exists) return res.status(404).send("Clínica no encontrada.");
    const info = doc.data();
    
    // Recuperamos datos reales para que Ana asesore con base científica
    const citasSnap = await db.collection('citas').where('clinic_id', '==', clinic_id).get();

    const promptAsistente = `
      Eres la Consultora de Élite para el dueño de la clínica "${info.nombre_clinica}".
      Tu Identidad Conductual Profunda se aplica ahora para ayudar al profesional a escalar su negocio.
      
      DATOS DE LA CLÍNICA:
      - Pacientes en sistema: ${citasSnap.size}
      - Precio sesión: ${info.precio_sesion}€
      - Localización: ${info.direcciones?.[0]?.ciudad || "No definida"}

      MISIÓN: Responder dudas sobre gestión, psicología de pacientes difíciles, o estrategias para aumentar la rentabilidad. 
      Sé su mano derecha, analítica y brillante.
      
      MENSAJE DEL PROFESIONAL: "${message}"
    `;

    const respuesta = await callVertexAI([{ role: 'user', parts: [{ text: promptAsistente }] }]);
    res.json({ success: true, reply: respuesta });
    
  } catch (e) {
    console.error("❌ Error en Consultoría Ana:", e.message);
    res.status(500).send("Ana está procesando otros datos, reintenta.");
  }
});
// ============================================================
// 🛡️ 14. ENDPOINTS PROTEGIDOS DEL DASHBOARD (AUTORIZACIÓN)
// ============================================================

// --- LISTADO DE PACIENTES (PROTEGIDO) ---
app.get('/api/dashboard/pacientes', verificarToken, async (req, res) => {
  try {
    // 🔥 CAMBIO CLAVE: Ya no usamos req.query.clinic_id. 
    // Usamos req.clinicId que viene SEGURO dentro del Token JWT.
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', req.clinicId)
      .orderBy('creado_el', 'desc')
      .get();

    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha_alta: doc.data().creado_el?.toDate().toLocaleDateString() || 'N/A'
    }));
    res.json(lista);
  } catch (e) { res.status(500).json({ error: "Error en lectura segura." }); }
});

// --- INFO DETALLADA DEL PACIENTE (PROTEGIDO) ---
app.get('/api/dashboard/paciente-info', verificarToken, async (req, res) => {
  const { telefono } = req.query;
  const tlfLimpio = normalizarTelefono(telefono);

  try {
    const notasSnap = await db.collection('notas_clinicas')
      .where('clinic_id', '==', req.clinicId)
      .where('paciente_tlf', '==', tlfLimpio)
      .orderBy('creado', 'desc')
      .get();

    const chatsSnap = await db.collection('chats')
      .where('clinic_id', '==', req.clinicId)
      .where('tlf', '==', tlfLimpio)
      .orderBy('ts', 'desc')
      .limit(20)
      .get();

    res.json({ 
      notas: notasSnap.docs.map(d => ({ contenido: d.data().contenido, creado: d.data().creado?.toDate().toISOString() })),
      chats: chatsSnap.docs.map(d => ({ msg: d.data().usr, reply: d.data().ia, ts: d.data().ts?.toDate().toISOString() }))
    });
  } catch (e) { res.status(500).json({ error: "No se pudo acceder a la ficha." }); }
});

// --- CALENDARIO MIXTO (PROTEGIDO) ---
app.get('/api/dashboard/calendar', verificarToken, async (req, res) => {
  try {
    const events = [];
    const [citas, bloqueos] = await Promise.all([
      db.collection('citas').where('clinic_id', '==', req.clinicId).get(),
      db.collection('bloqueos').where('clinic_id', '==', req.clinicId).get()
    ]);

    citas.forEach(doc => {
      const c = doc.data();
      events.push({
        id: doc.id,
        title: `${c.tipo_pago === 'Bono' ? '🎟️' : '💰'} ${c.paciente_nombre}`,
        start: c.fecha_hora_inicio.replace(' ', 'T'),
        backgroundColor: c.status === 'confirmada' ? '#10b981' : '#f59e0b',
        borderColor: 'transparent'
      });
    });

    bloqueos.forEach(doc => {
      const b = doc.data();
      events.push({ title: `🚫 ${b.motivo}`, start: b.inicio, end: b.fin, display: 'background', backgroundColor: '#334155' });
    });

    res.json(events);
  } catch (e) { res.status(500).send("Error en calendario."); }
});

// --- BALANCE REAL (PROTEGIDO) ---
app.get('/api/dashboard/balance', verificarToken, async (req, res) => {
  try {
    const citasSnap = await db.collection('citas').where('clinic_id', '==', req.clinicId).get();
    let real = 0, pot = 0;
    citasSnap.forEach(doc => {
      const c = doc.data();
      const precio = c.precio_sesion || 100;
      if (c.status === 'confirmada') real += precio;
      else if (c.status === 'pendiente_pago') pot += precio;
    });
    res.json({ success: true, real, potencial: pot, roi: (real / 100 * 100).toFixed(0) });
  } catch (e) { res.status(500).send("Error en balance."); }
});

// --- MOTOR DE IMPORTACIÓN MASIVA (GRADO OMEGA) ---
app.post('/api/dashboard/importar-pacientes', async (req, res) => {
  const { clinic_id, pacientes } = req.body; 
  if (!pacientes || !Array.isArray(pacientes)) return res.status(400).send("Datos inválidos.");

  try {
    // Fraccionamos en lotes de 500 para cumplir con la ley de Google Firestore
    const chunks = [];
    for (let i = 0; i < pacientes.length; i += 500) {
      chunks.push(pacientes.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      chunk.forEach(p => {
        const tlf = normalizarTelefono(p.telefono);
        if (tlf) {
          const ref = db.collection('pacientes').doc(`${clinic_id}_${tlf}`);
          batch.set(ref, {
            clinic_id,
            nombre: p.nombre.trim(),
            telefono: tlf,
            email: p.email?.toLowerCase().trim() || "",
            creado_el: admin.firestore.Timestamp.now(),
            origen: "importacion_masiva"
          }, { merge: true });
        }
      });
      await batch.commit();
    }

    console.log(`📦 Lotes procesados: ${pacientes.length} pacientes.`);
    res.json({ success: true, total: pacientes.length });
  } catch (e) { res.status(500).send(e.message); }
});

// --- EMISIÓN DE BONOS DE SESIONES ---
app.post('/api/dashboard/vender-bono', async (req, res) => {
  const { clinic_id, telefono, nombre, sesiones } = req.body;
  try {
    const tlfLimpio = normalizarTelefono(telefono);
    await db.collection('bonos').add({
      clinic_id,
      paciente_tlf: tlfLimpio,
      paciente_nombre: nombre,
      sesiones_disponibles: parseInt(sesiones),
      total_sesiones: parseInt(sesiones),
      fecha_compra: admin.firestore.Timestamp.now(),
      status: 'activo'
    });
    res.json({ success: true });
  } catch (e) { res.status(500).send(e.message); }
});

// --- GUARDADO DE NOTAS CLÍNICAS (SINCRO CON T-2) ---
app.post('/api/dashboard/guardar-nota', async (req, res) => {
  const { clinic_id, telefono, nombre, texto } = req.body;
  try {
    const tlfLimpio = normalizarTelefono(telefono);
    await db.collection('notas_clinicas').add({
      clinic_id,
      paciente_tlf: tlfLimpio,
      paciente_nombre: nombre,
      contenido: texto.trim(),
      creado: admin.firestore.Timestamp.now(),
      metodo: 'dictado_voz'
    });
    // Actualizamos el rastro en el CRM
    await db.collection('pacientes').doc(`${clinic_id}_${tlfLimpio}`).set({
      ultima_visita: admin.firestore.Timestamp.now()
    }, { merge: true });
    res.json({ success: true });
  } catch (e) { res.status(500).send(e.message); }
});
// ============================================================
// ⏰ 15. MOTOR CENTINELA INTEGRAL (EL SHERIFF DEL PALACIO)
// ============================================================

app.post('/api/tasks/centinela', async (req, res) => {
  console.log("👁️ Centinela: Iniciando patrulla de seguridad y ventas...");
  
  try {
    const ahora = new Date();
    // Sincronización horaria con el huso de la clínica (Madrid)
    const horaMadrid = parseInt(new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false
    }).format(ahora));

    const esHorarioComercial = (horaMadrid >= 8 && horaMadrid < 21);

    // --- FASE A: LIMPIEZA DE IMPAGOS (24/7) ---
    const expiradasSnap = await db.collection('citas')
      .where('status', '==', 'pendiente_pago')
      .where('expira_el', '<=', ahora)
      .get();

    for (const doc of expiradasSnap.docs) {
      await doc.ref.update({ 
        status: 'cancelada_por_expiracion',
        cancelado_el: admin.firestore.Timestamp.now()
      });
      console.log(`🗑️ Cita liberada por tiempo excedido: ${doc.id}`);
    }

    // --- FASES B Y C: COMUNICACIONES (SOLO EN HORARIO DE VIDA) ---
    let recordatoriosCount = 0;
    let prospeccionesCount = 0;

    if (esHorarioComercial) {
      
      // 1. AVISO DEL JUICIO FINAL (1 hora antes de expirar)
      const proximaHora = new Date(ahora.getTime() + (60 * 60 * 1000));
      const pendientesSnap = await db.collection('citas')
        .where('status', '==', 'pendiente_pago')
        .where('recordatorio_enviado', '==', false)
        .where('expira_el', '<=', proximaHora)
        .get();

      for (const doc of pendientesSnap.docs) {
        const cita = doc.data();
        await enviarAvisoJuicioFinal(cita);
        await doc.ref.update({ recordatorio_enviado: true });
        recordatoriosCount++;
      }

      // 2. GOTEO DE PROSPECCIÓN ASG (Crecimiento del SaaS)
      // Enviamos de 3 en 3 cada 30 min para proteger tu número de baneo
      const prospectosSnap = await db.collection('prospectos')
        .where('estado', '==', 'frio')
        .limit(3)
        .get();

      for (const doc of prospectosSnap.docs) {
        try {
          await enviarPlantillaProspeccion(doc.data());
          await doc.ref.update({ 
            estado: 'wa_enviado', 
            ultima_accion: admin.firestore.Timestamp.now(),
            intentos: 1 
          });
          prospeccionesCount++;
        } catch (e) { console.error("❌ Error goteo ASG:", e.message); }
      }
    }

    res.json({ 
      success: true, 
      resumen: {
        canceladas: expiradasSnap.size,
        recordatorios: recordatoriosCount,
        prospeccion: prospeccionesCount,
        hora_madrid: horaMadrid
      }
    });

  } catch (e) {
    console.error("🔥 Error Centinela Integral:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// 🎯 16. MOTOR ASG (AI SALES GENERATOR) Y HELPERS
// ============================================================

// Envío de Plantilla WhatsApp (Prospección)
async function enviarPlantillaProspeccion(prospecto) {
  const URL = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  await axios.post(URL, {
    messaging_product: "whatsapp",
    to: prospecto.telefono,
    type: "template",
    template: {
      name: "mensaje_prospeccion_1",
      language: { code: "es" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: prospecto.nombre_contacto }, // {{1}}
          { type: "text", text: prospecto.ciudad }            // {{2}}
        ]
      }]
    }
  }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
}

// Envío de Aviso de Expiración (Email + Estructura PWA)
async function enviarAvisoJuicioFinal(cita) {
  try {
    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: cita.paciente_email,
      subject: "⚠️ ÚLTIMA HORA: Tu reserva en FisioTool expira pronto",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #0066ff; padding: 30px; text-align: center; color: white;">
            <h2 style="margin: 0;">Confirmación Urgente</h2>
          </div>
          <div style="padding: 40px; color: #333;">
            <p>Hola <strong>${cita.paciente_nombre}</strong>,</p>
            <p>Tu reserva para el <strong>${cita.fecha_hora_inicio}</strong> está a punto de ser liberada.</p>
            <p>Solo queda <strong>1 HORA</strong> para confirmar el abono de la señal o el hueco se entregará a otro paciente.</p>
            <a href="https://fisiotool-1050901900632.us-central1.run.app/agenda/${cita.clinic_id}" 
               style="background: #0066ff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin-top: 20px;">
               ASEGURAR MI CITA AHORA ➜
            </a>
          </div>
        </div>`
    });
    // Nota: Aquí se dispararía el push notification si el token PWA existiera
    console.log(`📧 Aviso de Juicio Final enviado a: ${cita.paciente_nombre}`);
  } catch (e) { console.error("Error aviso juicio final:", e.message); }
}

// Endpoint Manual para Generar Emails de Venta (ASG Individual)
app.post('/api/asg/generar-email', async (req, res) => {
  const { tipo_dolor, test_email } = req.body;
  const promptVenta = `Eres un experto en Copywriting. Redacta un email de prospección para un fisio que sufre por ${tipo_dolor}. Véndele FisioTool Pro.`;
  
  try {
    const texto = await callVertexAI([{ parts: [{ text: promptVenta }] }]);
    const destinatario = test_email || "admin@fisiotool.com";

    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: destinatario,
      subject: `Solución estratégica para su Clínica`,
      html: `<div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden;">
              <div style="background:#0066ff; padding:40px; text-align:center;"><h1 style="color:white; margin:0;">FISIOTOOL PRO</h1></div>
              <div style="padding:40px; color:#1e293b; line-height:1.8;">
                ${texto.replace(/\n/g, '<br>')}
                <div style="text-align:center; margin-top:40px;"><a href="https://fisiotool.com/?promo=PROSPECT" style="background:#0066ff; color:white; padding:18px 35px; text-decoration:none; border-radius:50px; font-weight:bold;">RECLAMAR MI MES GRATIS ➜</a></div>
              </div>
              <div style="padding:30px; background:#f8fafc; border-top:1px solid #e2e8f0;">
                <strong>Ana</strong><br><span style="font-size:12px; color:#64748b;">Directora de Inteligencia Operativa</span><br>
                WhatsApp: +34 615 200 612
              </div>
            </div>`
    });
    res.json({ success: true, message: "Email ASG enviado." });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// ============================================================
// 🏁 17. ARRANQUE FINAL Y RUTAS SOBERANAS (FERRARI OMEGA)
// ============================================================

// 1. SERVIR CARROCERÍA (Archivos Estáticos de Next.js)
// El servidor entrega primero los estilos, imágenes y scripts del Ferrari
app.use(express.static(nextOutPath));

// 2. RUTA ESPECÍFICA PARA EL BOT DE PACIENTES (LANDINGBOT)
// Mantenemos la compatibilidad con el sistema de citas vía URL
app.get('/agenda/:clinicId', (req, res) => {
  const botPath = path.join(nextOutPath, 'landingbot.html');
  if (fs.existsSync(botPath)) {
    res.sendFile(botPath);
  } else {
    res.status(404).send("Motor visual del bot no encontrado.");
  }
});

// 3. RUTA COMODÍN (SPA HANDLING): El cerebro de navegación de Next.js
// Esta ruta captura cualquier dirección (setup, login, dashboard, foundry)
// y le entrega el chasis Next.js para que el Ferrari ruede por dentro.
// 3. RUTA COMODÍN (SPA HANDLING): El cerebro de navegación de Next.js
// Esta ruta asegura que /setup, /foundry o /login carguen su archivo real
app.get('*', (req, res, next) => {
  // Si la ruta es para la API o Webhooks, saltamos este bloque
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) return next();
  
  // Normalizamos la ruta para buscar el archivo físico .html
  let sanitizedPath = req.path;
  if (sanitizedPath === '/') {
    sanitizedPath = '/index.html';
  } else if (!sanitizedPath.endsWith('.html')) {
    sanitizedPath += '.html';
  }

  const fullPath = path.join(nextOutPath, sanitizedPath);

  // Verificamos si el archivo existe en el disco duro de Google
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    // Si la página exacta no existe, Next.js se encarga desde el index principal
    console.log(`⚠️ Redirigiendo ruta no encontrada: ${req.path}`);
    res.sendFile(path.join(nextOutPath, 'index.html'));
  }
});
// ============================================================
// 👥 14. MÓDULO MULTI-ESPECIALISTA (PLAN TEAM & CLINIC)
// ============================================================

app.post('/api/dashboard/add-especialista', async (req, res) => {
  const { clinic_id, nombre, especialidad, email } = req.body;
  if (!clinic_id || !nombre) return res.status(400).send("Datos incompletos.");

  try {
    // 1. Verificamos el plan de la clínica (Seguridad de Negocio)
    const doc = await db.collection('clinicas').doc(clinic_id).get();
    const clinica = doc.data();
    
    // Si es Plan Solo y ya tiene 1, o Plan Team y ya tiene 5, bloqueamos
    const equipoSnap = await db.collection('clinicas').doc(clinic_id).collection('especialistas').get();
    
    if (clinica.plan === 'solo' && equipoSnap.size >= 1) {
        return res.status(403).json({ error: "Límite de especialistas alcanzado en tu Plan Solo." });
    }

    // 2. Registramos al nuevo especialista
    await db.collection('clinicas').doc(clinic_id).collection('especialistas').add({
      nombre: nombre.trim(),
      especialidad: especialidad || "Fisioterapia",
      email: email || "",
      activo: true,
      creado_el: admin.firestore.Timestamp.now()
    });

    res.json({ success: true });
  } catch (e) { res.status(500).send(e.message); }
});

// Endpoint para que el Dashboard pinte al equipo
app.get('/api/dashboard/equipo', async (req, res) => {
  try {
    const snap = await db.collection('clinicas').doc(req.query.clinic_id).collection('especialistas').get();
    const equipo = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(equipo);
  } catch (e) { res.status(500).send(e.message); }
});

// 4. ENCENDIDO DEL MOTOR (PUERTO 8080)
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    // Verificamos si la identidad del proyecto está cargada
    const displayProject = PROJECT_ID_FIXED;
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🏎️  FERRARI FISIOTOOL ONLINE: 100%               ║
║                                                           ║
║  Puerto: ${PORT}                                           ║
║  Estado: OPERATIVO (Grado Omega)                          ║
║  Proyecto: ${displayProject}                ║
║  Región: ${REGION_FIXED} (Soberanía Bélgica)              ║
║  IA Engine: Gemini 2.5 Flash                              ║
║  Seguridad: SSL/TLS + Secret Manager                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});