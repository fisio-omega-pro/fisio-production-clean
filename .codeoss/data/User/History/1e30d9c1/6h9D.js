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

// Definimos el modelo globalmente para que todas las funciones lo vean
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2,
    topP: 0.8,
    topK: 40
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
app.use(bodyParser.json());
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
    console.log("🤖 Ana está procesando información conductual...");
    
    // Formateamos para cumplir el protocolo estricto de Google (role: user)
    const formattedContents = contents.map(c => ({
      role: c.role || "user",
      parts: c.parts
    }));

    const result = await model.generateContent({ contents: formattedContents });
    
    // NAVEGACIÓN DEFENSIVA: Ruta física verificada en el test de estrés
    const candidate = result.response.candidates && result.response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.warn("⚠️ IA bloqueada por filtros de seguridad.");
      return "Disculpa, no he podido procesar esa descripción. ¿Podrías explicármelo de otra forma?";
    }

    const text = candidate.content.parts[0].text;
    console.log("✅ Respuesta de IA generada con éxito.");
    return text;
  } catch (e) {
    console.error("❌ ERROR CRÍTICO EN MOTOR IA:", e.message);
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
// ==========================================
// 🔄 6. PROCESAMIENTO UNIFICADO (ANA ENGINE)
// ==========================================

async function procesarMensajeUnificado(idClinica, tlf, msg, isWhatsapp, req) {
  try {
    let currentID = idClinica;
    const tlfLimpio = normalizarTelefono(tlf);

    // 1. IDENTIFICACIÓN SOBERANA (¿Quién llama?)
    // Buscamos en la colección de pacientes usando el ID único de identidad
    const pacienteRef = db.collection('pacientes').doc(`${currentID}_${tlfLimpio}`);
    const pacienteDoc = await pacienteRef.get();
    
    let identityMsg = "El paciente es nuevo. Pide su nombre y email.";
    let nombreReconocido = null;

    if (pacienteDoc.exists) {
      nombreReconocido = pacienteDoc.data().nombre;
      identityMsg = `IMPORTANTE: Reconoces al paciente, se llama ${nombreReconocido}. No le preguntes su nombre. Salúdalo de forma cercana. Ya tienes su ficha técnica.`;
      console.log(`👤 Identidad detectada en el palacio: ${nombreReconocido}`);
    }

    // 2. RECUPERACIÓN DE HISTORIAL (MEMORIA DE CORTO PLAZO)
    const promptBase = await crearContextoAna(currentID);
    const chatsSnap = await db.collection('chats')
      .where('clinic_id', '==', currentID)
      .where('tlf', '==', tlfLimpio)
      .orderBy('ts', 'desc')
      .limit(6)
      .get();
    
    let historyTxt = "";
    chatsSnap.docs.reverse().forEach(d => {
      const data = d.data();
      historyTxt += `Usuario: ${data.usr}\nAna: ${data.ia}\n`;
    });

    // 3. CONSTRUCCIÓN DEL PROMPT Y LLAMADA A LA IA
    const promptFinal = `${promptBase}\n\nSITUACIÓN DE IDENTIDAD:\n${identityMsg}\n\nHISTORIAL RECIENTE:\n${historyTxt}\nMENSAJE ACTUAL DEL USUARIO: "${msg}"`;

    const contents = [{ role: "user", parts: [{ text: promptFinal }] }];
    const iaReply = await callVertexAI(contents);
    let finalReply = iaReply;

    // 4. LÓGICA DE COMANDOS (RESERVA | ALERTA)
    // Regex blindada para 3 grupos: [1]Fecha, [2]Nombre, [3]Email
    const matchReserva = iaReply.match(/###\s*RESERVA\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*###/i);
    const matchAlerta = iaReply.match(/###\s*ALERTA\s*\|\s*(.*?)\s*###/i); 

    if (matchAlerta) {
      await crearAlerta(tlfLimpio, iaReply, currentID, matchAlerta[1].trim());
      finalReply = iaReply.replace(matchAlerta[0], "").trim();
    }

    if (matchReserva) {
      const fechaIntento = matchReserva[1].trim();
      const pacNombre = nombreReconocido || matchReserva[2].trim();
      const pacEmail = matchReserva[3].trim();

      // Verificamos agenda con matemática pura
      const check = await checkAgendaDeterminista(currentID, fechaIntento);

      if (!check.available) {
        finalReply = `Vaya, acabo de revisar la agenda en tiempo real y ese hueco no está disponible (${check.reason}). ¿Te viene bien probar otra hora?`;
      } else {
        // --- GESTIÓN DE BONOS (PAGO PREVIO) ---
        const bonoResult = await consultarYDescontarBono(tlfLimpio, currentID); 

        const citaData = { 
            paciente_telefono: tlfLimpio, 
            fecha: fechaIntento, 
            paciente_nombre: pacNombre,
            paciente_email: pacEmail,
            tipo_pago: bonoResult.bonoUsado ? 'Bono' : 'Pendiente',
            status: bonoResult.bonoUsado ? 'confirmada' : 'pendiente_pago',
            expira_el: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 12*3600000))
        };

        const citaId = await crearReserva(citaData, currentID, req);
        
        // Notificación inmediata al email (Plan A)
        await enviarConfirmacionInmediata(citaData, currentID);

        if (bonoResult.bonoUsado) {
          finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Cita confirmada! Se ha descontado de tu bono activo. Te quedan ${bonoResult.sesionesRestantes} sesiones.`;
        } else {
          // --- PROCESAMIENTO DE COBRO HÍBRIDO (STRIPE / BIZUM) ---
          const clinicaDoc = await db.collection('clinicas').doc(currentID).get();
          const cData = clinicaDoc.data();
          const fianza = parseInt(cData?.fianza_reserva || "15");

          // Si el fisio tiene Stripe activo
          if (stripe && cData?.stripe_account_id) {
            try {
              const host = getDynamicHost(req);
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                  price_data: { 
                    currency: 'eur', 
                    product_data: { name: `Reserva Cita - ${cData.nombre_clinica}` }, 
                    unit_amount: fianza * 100 
                  },
                  quantity: 1,
                }],
                mode: 'payment',
                success_url: `${host}/dashboard?id=${currentID}&pago=ok`,
                cancel_url: `${host}/agenda/${currentID}`,
                metadata: { cita_id: citaId, tipo: "reserva_cita" }
              });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n💳 **Para confirmar, abona la señal de ${fianza}€ aquí:**\n${session.url}\n\n(El hueco se liberará en 12h si no se completa el pago).`;
            } catch(e) {
              // Fallback si falla Stripe: Modo Manual
              await db.collection('citas').doc(citaId).update({ status: 'confirmada', tipo_pago: 'Presencial (Error Stripe)' });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Todo listo ${pacNombre}! Tu cita está confirmada. Abonarás la sesión directamente en la clínica.`;
            }
          } else {
            // Modo Bizum o Efectivo (Manual)
            const instruccion = cData?.metodos_pago?.includes('Bizum') 
                ? `Por favor, haz un Bizum de ${fianza}€ al número de la clínica para confirmar.`
                : `Tu cita está pre-reservada. Te esperamos en la clínica.`;
            
            finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ${instruccion}`;
          }
        }
      }
    }

    // 5. LIMPIEZA FINAL Y ENVÍO
    const cleanText = finalReply.replace(/###.*?###/g, '').trim();

    if (isWhatsapp && WHATSAPP_TOKEN) {
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp', to: tlfLimpio, type: 'text', text: { body: cleanText }
      }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
    }

    await guardarLogChat(tlfLimpio, msg, cleanText, currentID);
    return { reply: cleanText };

  } catch (e) {
    console.error("❌ Error en Procesamiento Unificado:", e);
    return { reply: "Lo siento, mi conexión con la clínica ha tenido un breve parpadeo. ¿Podrías repetirme para qué día querías la cita?" };
  }
}

// Ayudante de envío de confirmación (Utilizado arriba)
async function enviarConfirmacionInmediata(cita, idClinica) {
  try {
    const doc = await db.collection('clinicas').doc(idClinica).get();
    const info = doc.data();
    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: cita.paciente_email,
      subject: `✅ Reserva recibida: ${info.nombre_clinica}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px; padding: 30px;">
          <h2 style="color: #0066ff;">¡Hola ${cita.paciente_nombre}!</h2>
          <p>Hemos recibido tu solicitud de cita para el día <strong>${cita.fecha}</strong>.</p>
          <p>Si es una reserva con fianza, recuerda que tienes 12 horas para abonarla o el sistema liberará el hueco.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Ubicación: ${info.direcciones?.[0]?.calle || 'Consultar clínica'}</p>
        </div>`
    });
  } catch (err) { console.error("❌ Error enviando mail informativo:", err.message); }
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
app.get('/api/config/:clinicId', async (req, res) => {
  const { clinicId } = req.params;
  try {
    let doc = await db.collection('clinicas').doc(clinicId).get();
    
    // Fallback por slug si no se encuentra por ID directo
    if (!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', clinicId).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }

    if (!doc.exists) return res.status(404).send({ error: "Clínica no encontrada." });

    const data = doc.data();
    res.json({
      id: doc.id,
      nombre_clinica: data.nombre_clinica,
      logo_url: data.logo_url,
      phone: data.phone,
      address: data.direcciones?.[0]?.calle || "Consultar clínica",
      weekly_schedule: data.weekly_schedule,
      default_duration_min: data.default_duration_min || 45,
      mi_codigo_referido: data.mi_codigo_referido || doc.id.substring(0,8).toUpperCase()
    });
  } catch (e) {
    res.status(500).send({ error: "Error al cargar configuración." });
  }
});
// ============================================================
// 📝 9. REGISTRO DE NUEVA CLÍNICA (ESTRATEGIA 100€ + TRIAL)
// ============================================================

app.post('/api/register', async (req, res) => {
  const d = req.body;
  
  try {
    // 1. GENERACIÓN DE IDENTIDAD SOBERANA (SLUG)
    let slug = d.nombre_clinica.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Verificación de unicidad del slug para evitar colisiones
    const existe = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!existe.empty) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. CONFIGURACIÓN DE HORARIOS
    const slots = d.descanso_mediodia === 'si' 
      ? [{start: d.hora_apertura, end: d.descanso_inicio}, {start: d.descanso_fin, end: d.hora_cierre}] 
      : [{start: d.hora_apertura, end: d.hora_cierre}];

    const miCodigoReferido = 'FT-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const newClinicData = {
      nombre_clinica: d.nombre_clinica, 
      slug, 
      email: d.email, 
      password: d.password, // Nota: Se recomienda hashear en producción
      precio_sesion: parseInt(d.precio || 100), 
      fianza_reserva: parseInt(d.fianza || 15),
      default_duration_min: parseInt(d.duracion || 45),
      banderas_rojas: d.banderas_rojas ? d.banderas_rojas.split(',') : [],
      metodos_pago: d.metodos_pago || ['Efectivo'],
      weekly_schedule: { "1": slots, "2": slots, "3": slots, "4": slots, "5": slots, "6": [], "0": [] },
      direcciones: [{ calle: d.calle, numero: d.numero, cp: d.cp, ciudad: d.ciudad, provincia: d.provincia, principal: true }],
      mi_codigo_referido: miCodigoReferido,
      created_at: admin.firestore.Timestamp.now(), 
      status: 'pendiente_pago', // Se activa tras el pago/trial exitoso
      aceptacion_legal: { aceptado: true, fecha: admin.firestore.Timestamp.now() }
    };

    const ref = await db.collection('clinicas').add(newClinicData);

    // 3. GENERACIÓN DE SESIÓN DE PAGO (STRIPE CONNECT READY)
    if (stripe) {
      const sessionData = {
        payment_method_types: ['card'],
        customer_email: d.email,
        line_items: [{
          price: 'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // ✅ Tu ID de precio de 100€
          quantity: 1,
        }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 30, // 🎁 30 días gratis
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          metadata: {
            referente_id: d.codigo_invitacion || "" // Huella del amigo para el premio final
          }
        },
        payment_method_collection: 'always',
        success_url: `${getDynamicHost(req)}/dashboard?id=${ref.id}&pago=ok`,
        cancel_url: `${getDynamicHost(req)}/setup?error=pago_cancelado`,
        metadata: { 
            clinic_id: ref.id, 
            tipo: 'suscripcion',
            referente_id: d.codigo_invitacion || "" 
        }
      };

      // Si viene con invitación, aplicamos el cupón del 50% al nuevo cliente
      if (d.codigo_invitacion) {
        sessionData.subscription_data.discounts = [{
          coupon: 'feMDHJlj', // ✅ Tu cupón de 50%
        }];
      }

      const session = await stripe.checkout.sessions.create(sessionData);
      
      console.log(`🚀 Suscripción generada para: ${d.nombre_clinica}`);
      return res.json({ success: true, payment_url: session.url });
    }

    // Fallback si Stripe no está configurado (Modo Desarrollo)
    res.json({ success: true, dashboard_url: `/dashboard?id=${ref.id}` });

  } catch(e) { 
    console.error("❌ Error en Registro Maestro:", e);
    res.status(500).json({ error: e.message }); 
  }
});