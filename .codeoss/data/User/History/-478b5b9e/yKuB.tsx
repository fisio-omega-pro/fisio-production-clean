/**
 * FISIOTOOL ONLINE - CORE SERVER (GRADO OMEGA)
 * Bloque 1: Inicialización y Dependencias
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// ==========================================
// 1. CONFIGURACIÓN TÉCNICA GLOBAL
// ==========================================

const PROJECT_ID = process.env.PROJECT_ID || 'spatial-victory-480409-b7';
const REGION = process.env.REGION || 'europe-west1';
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// Mapeado de Planes Stripe (IDs de producto/precio reales)
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// Inicialización Firebase Admin
if (!admin.apps.length) {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });
}
const db = getFirestore();

// Configuración Vertex AI (Gemini Engine)
const auth = new GoogleAuth({ 
    scopes: ['https://www.googleapis.com/auth/cloud-platform'] 
});
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });
const model = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-flash', // Corregido: 2.5 no es una versión estable/actual
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
    }
});

// Motor de Pagos (Stripe)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

// Configuración Correo SMTP
const transporter = nodemailer.createTransport({
    host: "mail.fisiotool.com",
    port: 465,
    secure: true,
    auth: { 
        user: "ana@fisiotool.com", 
        pass: process.env.EMAIL_PASS 
    }
});

// Inicialización Express
const app = express();
app.use(cors());

// Rutas estáticas de Next.js
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out');
}

// Nota: El body-parser global se define en el siguiente bloque 
// para no interferir con el stream raw de Stripe.
/**
 * FISIOTOOL ONLINE - BLOQUE 2: Utilidades y Helpers de Persistencia
 */

// ==========================================
// 2. UTILIDADES DE INGENIERÍA (PRECISIÓN)
// ==========================================

// Limpieza de teléfonos: asegura formato E.164 simplificado
function normalizarTelefono(tlf) {
    if (!tlf) return "";
    // Eliminamos todo lo que no sea número
    let limpio = tlf.toString().replace(/\D/g, ''); 
    // Si empieza por 34 (España) y es largo, quitamos el prefijo para consistencia interna
    if (limpio.startsWith('34') && limpio.length > 9) {
        limpio = limpio.substring(2);
    }
    return limpio.trim();
}

// Detector dinámico de Host para redirecciones de Stripe
function getDynamicHost(req) {
    const host = req.get('host');
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol);
    // Soporte para Cloud Run y entornos locales
    if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
        return `https://${host}`;
    }
    return `${protocol}://${host}`;
}

// FUNCIÓN MAESTRA DE COMUNICACIÓN IA (Vertex AI SDK)
async function callVertexAI(contents) {
    try {
        console.log("🧠 Ana procesando consulta...");
        
        // El rol debe ser estrictamente 'user' o 'model'
        const formattedContents = contents.map(c => ({
            role: c.role === "assistant" ? "model" : "user",
            parts: Array.isArray(c.parts) ? c.parts : [{ text: c.parts }]
        }));

        const result = await model.generateContent({ contents: formattedContents });
        const response = await result.response;
        
        // Navegación defensiva del objeto de respuesta
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("La IA no generó candidatos (posible bloqueo de seguridad/filtro).");
        }

        const text = response.candidates[0].content.parts[0].text;
        console.log("✅ Respuesta generada con éxito.");
        return text;

    } catch (e) {
        console.error("❌ ERROR CRÍTICO MOTOR IA:", e.message);
        return "Lo siento, he tenido un problema técnico. ¿Podrías repetirme tu consulta?";
    }
}

// ==========================================
// 3. HELPERS DE BASE DE DATOS (CRM & LOGS)
// ==========================================

// Registro histórico de conversación
async function guardarLogChat(tlf, usrMsg, iaReply, idClinica) {
    try {
        await db.collection('chats').add({
            tlf: normalizarTelefono(tlf),
            usr: usrMsg,
            ia: iaReply,
            clinic_id: idClinica,
            ts: Timestamp.now()
        });
    } catch (e) {
        console.error("⚠️ Error en Log de Inteligencia:", e.message);
    }
}

// Emisión de alertas por Banderas Rojas (Triaje médico)
async function crearAlerta(tlf, iaReply, idClinica, motivo) {
    try {
        await db.collection('alertas_red_flag').add({
            paciente_tlf: normalizarTelefono(tlf),
            mensaje_ia: iaReply,
            clinic_id: idClinica,
            motivo: motivo,
            creado: Timestamp.now(),
            status: 'pendiente'
        });
        console.log("🚨 Alerta de seguridad emitida.");
    } catch (e) {
        console.error("❌ Error en Sistema de Alertas:", e.message);
    }
}

// Gestión de Bonos (Fidelización)
async function consultarYDescontarBono(tlf, idClinica) {
    try {
        const tlfLimpio = normalizarTelefono(tlf);
        const snap = await db.collection('bonos')
            .where('clinic_id', '==', idClinica)
            .where('paciente_tlf', '==', tlfLimpio)
            .where('status', '==', 'activo')
            .where('sesiones_disponibles', '>', 0)
            .limit(1).get();

        if (snap.empty) return { bonoUsado: false };

        const bonoDoc = snap.docs[0];
        const nuevasSesiones = bonoDoc.data().sesiones_disponibles - 1;
        
        await bonoDoc.ref.update({
            sesiones_disponibles: nuevasSesiones,
            status: nuevasSesiones <= 0 ? 'consumido' : 'activo'
        });

        return { 
            bonoUsado: true, 
            sesionesRestantes: nuevasSesiones 
        };
    } catch (e) {
        console.error("⚠️ Error consultando bono:", e.message);
        return { bonoUsado: false };
    }
}
/**
 * FISIOTOOL ONLINE - BLOQUE 3: Motor de Agenda y Onboarding
 */

// ============================================================
// 4. CEREBRO DE ANA (SISTEMA DE PROMPTING)
// ============================================================

async function crearContextoAna(idClinicaActual) {
    let doc = await db.collection('clinicas').doc(idClinicaActual).get();
    
    // Fallback por slug si el ID no es directo
    if (!doc.exists) {
        const q = await db.collection('clinicas').where('slug', '==', idClinicaActual).limit(1).get();
        if (!q.empty) doc = q.docs[0];
    }

    const info = doc.exists ? doc.data() : { nombre_clinica: "FisioTool", precio_sesion: 100 };
    
    // Sincronización horaria (Servidor en Bélgica -> Operación en Madrid)
    const ahora = new Date().toLocaleString('es-ES', { 
        timeZone: 'Europe/Madrid', 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const fianza = info.fianza_reserva || 15;
    const sedes = info.direcciones || [];
    const metodos = info.metodos_pago ? info.metodos_pago.join(', ') : "Stripe, Bizum, Efectivo";

    let textoSedes = sedes.length > 1 
        ? `VARIAS SEDES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. PREGUNTA SEDE.`
        : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar'}, ${sedes[0]?.ciudad || ''}.`;

    return `
    IDENTIDAD: Eres 'Ana', recepcionista de élite de "${info.nombre_clinica}". 
    Eres experta en conducta humana, empática y extremadamente profesional.
    
    DATOS DE NEGOCIO:
    - FECHA ACTUAL: ${ahora}.
    - PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min || 45} min.
    - RESERVA: Requiere fianza de ${fianza}€ para blindar la agenda.
    - MÉTODOS: ${metodos}.
    - ${textoSedes}

    REGLAS DE ORO:
    Para agendar necesitas: 1. Nombre, 2. Motivo, 3. EMAIL (para justificante legal).
    NO reserves sin el EMAIL. 

    FORMATO DE COMANDO:
    Al confirmar, usa: ###RESERVA|YYYY-MM-DD HH:mm|Nombre|Email###
    `;
}

// ============================================================
// 5. AGENDA DETERMINISTA (CÁLCULO DE DISPONIBILIDAD)
// ============================================================

async function checkAgendaDeterminista(idClinica, fechaIntentoStr) {
    const clinicaDoc = await db.collection('clinicas').doc(idClinica).get();
    if (!clinicaDoc.exists) return { available: false, reason: "clínica no encontrada" };
    
    const data = clinicaDoc.data();
    const [fechaSoloDia, horaCita] = fechaIntentoStr.split(' ');
    const [hh, mm] = horaCita.split(':').map(Number);
    const citaInicioTotalMin = hh * 60 + mm;
    const duracionMinutos = data.default_duration_min || 45;
    const citaFinTotalMin = citaInicioTotalMin + duracionMinutos;

    // 1. Comprobación de bloqueos (Vacaciones/Cierres)
    const bloqueosSnap = await db.collection('bloqueos').where('clinic_id', '==', idClinica).get();
    for (const doc of bloqueosSnap.docs) {
        const b = doc.data();
        if (!b.hora_inicio && fechaSoloDia >= b.inicio && fechaSoloDia <= b.fin) return { available: false, reason: "Cerrado por vacaciones" };
        if (b.hora_inicio && fechaSoloDia === b.inicio) {
            const bIni = b.hora_inicio.split(':').map(Number);
            const bFin = b.hora_fin.split(':').map(Number);
            const blockStart = bIni[0] * 60 + bIni[1];
            const blockEnd = bFin[0] * 60 + bFin[1];
            if (citaInicioTotalMin < blockEnd && blockStart < citaFinTotalMin) return { available: false, reason: "Bloqueo horario" };
        }
    }

    // 2. Colisión con otras citas activas
    const citasHoy = await db.collection('citas')
        .where('clinic_id', '==', idClinica)
        .where('fecha', '>=', fechaSoloDia) // Simplificado para optimizar
        .get();

    for (const doc of citasHoy.docs) {
        const c = doc.data();
        if (['cancelada', 'cancelada_por_expiracion'].includes(c.status)) continue;
        if (c.fecha === fechaIntentoStr) return { available: false, reason: "Hueco ya ocupado" };
    }

    return { available: true };
}

// ============================================================
// 12. MOTOR STRIPE CONNECT (EL "CABLE" PARA EL FRONTEND)
// ============================================================

app.post('/api/stripe/onboard', async (req, res) => {
    const { clinic_id } = req.body;
    if (!stripe) return res.status(500).json({ error: "Stripe no configurado en el servidor." });

    try {
        // 1. Creamos la cuenta Connect Express
        const account = await stripe.accounts.create({
            type: 'express',
            capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        });

        // 2. Generamos el link de onboarding
        const host = getDynamicHost(req);
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${host}/dashboard?id=${clinic_id}&stripe=retry`,
            return_url: `${host}/dashboard?id=${clinic_id}&stripe=success`,
            type: 'account_onboarding',
        });

        // 3. Actualizamos la clínica con el ID de Connect
        await db.collection('clinicas').doc(clinic_id).update({
            stripe_connect_id: account.id,
            cobros_configurados: false
        });

        res.json({ url: accountLink.url });
    } catch (e) {
        console.error("❌ Error en Onboarding Stripe:", e.message);
        res.status(500).json({ error: e.message });
    }
});
/**
 * FISIOTOOL ONLINE - BLOQUE 4: Procesamiento Unificado (El Cerebro)
 */

// ============================================================
// 6. PROCESAMIENTO UNIFICADO (ANA ENGINE - MODO ACCIÓN)
// ============================================================

async function procesarMensajeUnificado(idClinica, tlf, msg, isWhatsapp, req) {
    try {
        const tlfLimpio = normalizarTelefono(tlf);
        
        // 1. IDENTIFICACIÓN SOBERANA (¿Quién escribe?)
        // Formato de ID de documento: CLINICAID_TELEFONO
        const pacienteRef = db.collection('pacientes').doc(`${idClinica}_${tlfLimpio}`);
        const pacienteDoc = await pacienteRef.get();
        
        let identityMsg = "El paciente es nuevo. Pide su nombre y EMAIL obligatoriamente.";
        let nombreReconocido = null;

        if (pacienteDoc.exists) {
            nombreReconocido = pacienteDoc.data().nombre;
            identityMsg = `IMPORTANTE: Reconoces al paciente, se llama ${nombreReconocido}. Ya tienes su email. Salúdalo por su nombre.`;
            console.log(`👤 Identidad detectada: ${nombreReconocido}`);
        }

        // 2. RECUPERACIÓN DE MEMORIA (Historial de chat)
        const promptBase = await crearContextoAna(idClinica);
        const chatsSnap = await db.collection('chats')
            .where('clinic_id', '==', idClinica)
            .where('tlf', '==', tlfLimpio)
            .orderBy('ts', 'desc')
            .limit(6)
            .get();
        
        let historyTxt = "";
        chatsSnap.docs.reverse().forEach(d => {
            const data = d.data();
            historyTxt += `Usuario: ${data.usr}\nAna: ${data.ia}\n`;
        });

        // 3. LLAMADA AL CEREBRO DE IA
        const promptFinal = `${promptBase}\n\nIDENTIDAD ACTUAL:\n${identityMsg}\n\nHISTORIAL:\n${historyTxt}\n\nMENSAJE USUARIO: "${msg}"`;
        const iaReply = await callVertexAI([{ role: "user", parts: promptFinal }]);
        let finalReply = iaReply;

        // 4. LÓGICA DE COMANDOS (Extracción de Reservas)
        // Buscamos el patrón: ###RESERVA|FECHA|NOMBRE|EMAIL###
        const matchReserva = iaReply.match(/###\s*RESERVA\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*###/i);
        const matchAlerta = iaReply.match(/###\s*ALERTA\s*\|\s*([^|]+)\s*###/i);

        if (matchAlerta) {
            await crearAlerta(tlfLimpio, iaReply, idClinica, matchAlerta[1].trim());
            finalReply = finalReply.replace(matchAlerta[0], "").trim();
        }

        if (matchReserva) {
            const fechaIntento = matchReserva[1].trim();
            const pacNombre = nombreReconocido || matchReserva[2].trim();
            const pacEmail = matchReserva[3].trim();

            // Verificamos agenda real
            const check = await checkAgendaDeterminista(idClinica, fechaIntento);

            if (!check.available) {
                finalReply = `Vaya, acabo de revisar la agenda y ese hueco no está disponible (${check.reason}). ¿Te viene bien otra hora?`;
            } else {
                // Gestión de Bonos
                const bonoResult = await consultarYDescontarBono(tlfLimpio, idClinica);
                
                // Datos de la reserva
                const citaData = {
                    paciente_telefono: tlfLimpio,
                    fecha: fechaIntento,
                    paciente_nombre: pacNombre,
                    paciente_email: pacEmail,
                    status: bonoResult.bonoUsado ? 'confirmada' : 'pendiente_pago',
                    tipo_pago: bonoResult.bonoUsado ? 'Bono' : 'Pendiente',
                    expira_el: Timestamp.fromDate(new Date(Date.now() + 12 * 3600000)) // 12h para pagar
                };

                const citaId = await crearReserva(citaData, idClinica, req);
                
                if (bonoResult.bonoUsado) {
                    finalReply = finalReply.replace(matchReserva[0], "").trim() + 
                        `\n\n✅ ¡Cita confirmada! Se ha descontado de tu bono. Te quedan ${bonoResult.sesionesRestantes} sesiones.`;
                } else {
                    // Aquí vendría la lógica de Stripe que uniremos en el bloque de pagos
                    finalReply = finalReply.replace(matchReserva[0], "").trim() + 
                        `\n\n✅ ¡Reserva registrada! Te he enviado un email para completar el pago de la fianza.`;
                }
            }
        }

        // 5. LIMPIEZA Y ENVÍO
        const cleanText = finalReply.replace(/###.*?###/g, "").trim();
        
        // Guardamos el log para que Ana tenga memoria en la siguiente frase
        await guardarLogChat(tlfLimpio, msg, cleanText, idClinica);

        return { reply: cleanText };

    } catch (e) {
        console.error("❌ Error en Procesamiento Unificado:", e.message);
        return { reply: "Lo siento, mi conexión con la agenda ha parpadeado. ¿Me repites la fecha, por favor?" };
    }
}

// Helper para crear la reserva física en Firestore
async function crearReserva(datos, idClinica, req) {
    const clientIp = req?.headers['x-forwarded-for'] || req?.ip || "unknown";
    const ref = await db.collection('citas').add({
        ...datos,
        clinic_id: idClinica,
        creado: Timestamp.now(),
        aceptacion_rgpd: {
            aceptado: true,
            fecha: Timestamp.now(),
            version: "1.1",
            ip: clientIp
        }
    });
    return ref.id;
}
/**
 * FISIOTOOL ONLINE - BLOQUE 5: Webhooks (WhatsApp & Stripe)
 */

// ==========================================
// 8. WEBHOOK WHATSAPP: VERIFICACIÓN (META)
// ==========================================

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log("✅ WEBHOOK WHATSAPP VERIFICADO POR META");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// ==========================================
// 9. WEBHOOK WHATSAPP: RECEPCIÓN DE MENSAJES
// ==========================================

app.post('/webhook', async (req, res) => {
    // Respondemos 200 OK inmediatamente para evitar que Meta reintente por timeout
    res.sendStatus(200);

    const reqBody = req.body;
    
    // Verificamos si es un mensaje de texto válido
    const messageData = reqBody.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phoneIDReceptor = reqBody.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (messageData && messageData.text) {
        const tlf = messageData.from;
        const msg = messageData.text.body;

        try {
            let currentID = CLINIC_ID_DEFAULT;

            // Lógica Multi-Sede: Identificamos la clínica por el ID de teléfono de Meta
            if (phoneIDReceptor) {
                const q = await db.collection('clinicas')
                    .where('wa_phone_id_pro', '==', phoneIDReceptor)
                    .limit(1).get();
                if (!q.empty) currentID = q.docs[0].id;
            }

            // Llamamos al motor del Bloque 4 en segundo plano
            // El último parámetro 'true' indica que es canal WhatsApp
            procesarMensajeUnificado(currentID, tlf, msg, true, req);
            
        } catch (e) {
            console.error("❌ Error identificando clínica en Webhook:", e.message);
        }
    }
});

// ==========================================
// 10. WEBHOOK VIGILANTE DE STRIPE (PAGOS)
// ==========================================

// NOTA: Esta ruta requiere 'express.raw' para verificar la firma
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!stripe) throw new Error("Stripe no configurado");
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`❌ Error de Firma en Webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // EVENTO A: Pago completado (Fianza de cita o suscripción de clínica)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { tipo, cita_id, clinic_id, referente_id } = session.metadata;

            // 1. Caso Pago de Cita (Paciente)
            if (tipo === 'reserva_cita') {
                await db.collection('citas').doc(cita_id).update({
                    status: 'confirmada',
                    tipo_pago: 'Stripe Online',
                    pagado_el: Timestamp.now()
                });
                console.log(`✅ Cita confirmada por pago: ${cita_id}`);
            } 
            
            // 2. Caso Alta de Suscripción (Clínica Nueva)
            else if (tipo === 'suscripcion') {
                await db.collection('clinicas').doc(clinic_id).update({
                    status: 'activo',
                    suscripcion_id: session.subscription,
                    stripe_customer_id: session.customer,
                    activado_el: Timestamp.now()
                });
                console.log(`🚀 Nueva clínica activada: ${clinic_id}`);
            }
        }

        // EVENTO B: Pago de factura mensual (Sistema de Referidos)
        if (event.type === 'invoice.paid') {
            const factura = event.data.object;
            
            if (factura.subscription && factura.amount_paid > 0) {
                // Buscamos si esta suscripción tiene un referente para darle su premio
                const subscription = await stripe.subscriptions.retrieve(factura.subscription);
                const idReferente = subscription.metadata.referente_id;

                if (idReferente) {
                    const refDoc = await db.collection('clinicas').doc(idReferente).get();
                    if (refDoc.exists && refDoc.data().suscripcion_id) {
                        // Aplicamos cupón del 50% al referente por su recomendación
                        await stripe.subscriptions.update(refDoc.data().suscripcion_id, {
                            coupon: 'feMDHJlj' // Tu ID de cupón en Stripe
                        });
                        console.log(`🎁 Recompensa aplicada al referente: ${idReferente}`);
                    }
                }
            }
        }

        res.json({ received: true });

    } catch (e) {
        console.error("❌ Error interno en Webhook Stripe:", e.message);
        res.status(500).send("Error interno");
    }
});
/**
 * FISIOTOOL ONLINE - BLOQUE 6: Endpoints del Dashboard (CRM & KPIs)
 */

// ============================================================
// 15. LISTADO DE PACIENTES (CRM)
// ============================================================

app.get('/api/dashboard/pacientes', async (req, res) => {
    const { clinic_id } = req.query;
    if (!clinic_id) return res.status(400).send("ID de clínica requerido.");

    try {
        const snap = await db.collection('pacientes')
            .where('clinic_id', '==', clinic_id)
            .orderBy('creado_el', 'desc')
            .get();

        const lista = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            fecha_alta: doc.data().creado_el?.toDate().toLocaleDateString() || 'N/A'
        }));

        res.json(lista);
    } catch (e) {
        console.error("❌ Error en lectura de CRM:", e.message);
        res.status(500).json([]);
    }
});

// ============================================================
// 16. FICHA TÉCNICA DEL PACIENTE (NOTAS + CHATS)
// ============================================================

app.get('/api/dashboard/paciente-info', async (req, res) => {
    const { clinic_id, telefono } = req.query;
    const tlfLimpio = normalizarTelefono(telefono);

    try {
        // 1. Recuperamos Notas Clínicas (Evolución médica)
        const notasSnap = await db.collection('notas_clinicas')
            .where('clinic_id', '==', clinic_id)
            .where('paciente_tlf', '==', tlfLimpio)
            .orderBy('creado', 'desc')
            .get();

        const notas = notasSnap.docs.map(d => ({
            contenido: d.data().contenido,
            creado: d.data().creado?.toDate().toISOString()
        }));

        // 2. Recuperamos rastro de conversación con la IA
        const chatsSnap = await db.collection('chats')
            .where('clinic_id', '==', clinic_id)
            .where('tlf', '==', tlfLimpio)
            .orderBy('ts', 'desc')
            .limit(20)
            .get();

        const chats = chatsSnap.docs.map(d => ({
            msg: d.data().usr,
            reply: d.data().ia,
            ts: d.data().ts?.toDate().toISOString()
        }));

        res.json({ notas, chats });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================================
// 17. MOTOR DE IMPORTACIÓN MASIVA (FRACCIONADOR)
// ============================================================

app.post('/api/dashboard/importar-pacientes', async (req, res) => {
    const { clinic_id, pacientes } = req.body;
    if (!pacientes || !Array.isArray(pacientes)) return res.status(400).send("Datos inválidos.");

    try {
        // Fraccionamos en lotes de 500 (Límite de Google Firestore)
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
                        creado_el: Timestamp.now(),
                        origen: "importacion_masiva",
                        status: "activo"
                    }, { merge: true });
                }
            });
            await batch.commit();
        }

        console.log(`📥 Importación masiva completada: ${pacientes.length} pacientes.`);
        res.json({ success: true, total: pacientes.length });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// ============================================================
// 18. GUARDADO DE NOTA CLÍNICA (DICTADO POR VOZ)
// ============================================================

app.post('/api/dashboard/guardar-nota', async (req, res) => {
    const { clinic_id, telefono, nombre, texto } = req.body;
    try {
        const tlfLimpio = normalizarTelefono(telefono);
        await db.collection('notas_clinicas').add({
            clinic_id,
            paciente_tlf: tlfLimpio,
            paciente_nombre: nombre,
            contenido: texto.trim(),
            creado: Timestamp.now(),
            metodo: 'dictado_voz'
        });

        // Actualizamos la fecha de última visita en el CRM
        await db.collection('pacientes').doc(`${clinic_id}_${tlfLimpio}`).set({
            ultima_visita: Timestamp.now()
        }, { merge: true });

        res.json({ success: true });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// ============================================================
// 19. MOTOR DE BALANCE ECONÓMICO (KPIs)
// ============================================================

app.get('/api/dashboard/balance', async (req, res) => {
    const { clinic_id } = req.query;
    try {
        const citasSnap = await db.collection('citas').where('clinic_id', '==', clinic_id).get();
        
        let ingresosReales = 0;
        let ingresosPendientes = 0;
        let totalCitasExito = 0;

        citasSnap.forEach(doc => {
            const c = doc.data();
            const precio = parseFloat(c.precio_sesion) || 100;
            
            if (c.status === 'confirmada') {
                ingresosReales += precio;
                totalCitasExito++;
            } else if (c.status === 'pendiente_pago') {
                ingresosPendientes += precio;
            }
        });

        res.json({
            success: true,
            real: ingresosReales,
            potencial: ingresosPendientes,
            citas_exito: totalCitasExito,
            roi: ((ingresosReales / 100) * 100).toFixed(0) // ROI sobre inversión base 100€
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
});