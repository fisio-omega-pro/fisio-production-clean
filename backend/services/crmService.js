/**
 * 💾 CRM SERVICE - EL MOTOR DE SOBERANÍA Y AGENDA
 * Gestiona pacientes, citas y disponibilidad con precisión atómica.
 */
const { db, Timestamp, FieldValue } = require('../config/firebase');

// --- 🛠️ UTILIDADES INTERNAS ---
const normalizarTlf = (t) => t ? String(t).replace(/\D/g, '').slice(-9) : "";

// --- 🛰️ 1. LOCALIZADOR DE CLÍNICA (ID O SLUG) ---
const getClinica = async (idOrSlug) => {
  try {
    let doc = await db.collection('clinicas').doc(idOrSlug).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };

    const q = await db.collection('clinicas').where('slug', '==', idOrSlug).limit(1).get();
    if (!q.empty) return { id: q.docs[0].id, ...q.docs[0].data() };

    return null;
  } catch (e) {
    console.error("❌ [CRM] Error en localizador:", e.message);
    return null;
  }
};

// --- ⏰ 2. EL RELOJ ATÓMICO (CONTROL DE DISPONIBILIDAD) ---
const consultarHueco = async (clinicId, fechaStr, horaStr) => {
  const clinica = await getClinica(clinicId);
  if (!clinica) return { ok: false, msg: "Clínica no registrada." };

  // A. Verificación de Bloqueos (Vacaciones/Cierres)
  const bloqueos = await db.collection('bloqueos')
    .where('clinic_id', '==', clinica.id)
    .where('inicio', '<=', fechaStr)
    .get();

  for (const bDoc of bloqueos.docs) {
    const b = bDoc.data();
    if (fechaStr >= b.inicio && fechaStr <= b.fin) {
      return { ok: false, msg: `Cerrado por ${b.motivo}.` };
    }
  }

  // B. Verificación de Horario Comercial (Matemática Pura)
  const diaSemana = new Date(fechaStr).getDay().toString(); // 0=Dom, 1=Lun...
  const horario = clinica.horario?.pausa_mediodia ? // Si tiene pausa, validamos rangos
    { ...clinica.horario } : clinica.horario; 
  
  // Aquí el motor comparará los minutos absolutos del día para evitar desfases UTC
  const [hh, mm] = horaStr.split(':').map(Number);
  const solicitudMinutos = (hh * 60) + mm;
  const duracion = clinica.config_ia?.default_duration_min || 45;
  const solicitudFinMinutos = solicitudMinutos + duracion;

  // C. Detección de Colisiones (Zombies y Reales)
  const citasConflictivas = await db.collection('citas')
    .where('clinic_id', '==', clinica.id)
    .where('fecha', '==', fechaStr)
    .where('status', 'in', ['confirmada', 'pendiente_pago'])
    .get();

  for (const cDoc of citasConflictivas.docs) {
    const c = cDoc.data();
    // Si es una cita zombie (pendiente > 12h), la ignoramos (el Centinela la borrará luego)
    if (c.status === 'pendiente_pago' && c.expira_el && Date.now() > c.expira_el.toMillis()) continue;

    const [chh, cmm] = c.hora.split(':').map(Number);
    const cInicio = (chh * 60) + cmm;
    const cFin = cInicio + (c.duracion || 45);

    // Traslape de rangos
    if (solicitudMinutos < cFin && cInicio < solicitudFinMinutos) {
      return { ok: false, msg: "Hueco ocupado por otra reserva." };
    }
  }

  return { ok: true, clinicaId: clinica.id };
};

// --- 📝 3. CREACIÓN DE RESERVA CON BLINDAJE LEGAL ---
const registrarReserva = async (datos, ip = "0.0.0.0") => {
  const tlf = normalizarTlf(datos.telefono);
  const expira = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 horas para pagar

  const citaData = {
    ...datos,
    paciente_telefono: tlf,
    creado_el: Timestamp.now(),
    expira_el: Timestamp.fromDate(expira),
    status: datos.status || 'pendiente_pago',
    huella_legal: {
      ip_registro: ip,
      version_rgpd: "1.1",
      aceptado: true
    }
  };

  const ref = await db.collection('citas').add(citaData);
  return ref.id;
};

// --- 🐘 4. MEMORIA DE ELEFANTE (RECONOCIMIENTO PACIENTE) ---
const buscarPaciente = async (clinicId, telefono) => {
  const tlf = normalizarTlf(telefono);
  const doc = await db.collection('pacientes').doc(`${clinicId}_${tlf}`).get();
  return doc.exists ? doc.data() : null;
};

module.exports = {
  getClinica,
  consultarHueco,
  registrarReserva,
  buscarPaciente,
  db // Exportamos db para operaciones directas en otros servicios si fuera necesario
};
// --- 📊 5. RESUMEN MAESTRO PARA EL DASHBOARD ---
const getResumenDashboard = async (clinicId) => {
  try {
    // Ejecutamos consultas en paralelo para máxima velocidad
    const [citasSnap, pacientesSnap] = await Promise.all([
      db.collection('citas').where('clinic_id', '==', clinicId).get(),
      db.collection('pacientes')
        .where('clinic_id', '==', clinicId)
        .orderBy('creado_el', 'desc')
        .limit(10) // Solo los 10 más recientes para el resumen
        .get()
    ]);

    let balance = { real: 0, potencial: 0, roi: 0 };
    
    citasSnap.forEach(doc => {
      const c = doc.data();
      const monto = Number(c.precio_sesion) || 50;
      if (c.status === 'confirmada' || c.status === 'pagada') {
        balance.real += monto;
      } else if (c.status === 'pendiente_pago') {
        balance.potencial += monto;
      }
    });

    // Cálculo simple de ROI (Inversión base 100€)
    balance.roi = balance.real > 0 ? Math.round((balance.real / 100) * 100) : 0;

    const pacientes = pacientesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      creado_el: doc.data().creado_el?.toDate().toISOString()
    }));

    return { balance, pacientes };
  } catch (error) {
    console.error("❌ [CRM Service] Fallo en resumen:", error);
    throw error;
  }
};

// No olvides actualizar el module.exports
module.exports = {
  // ... las anteriores,
  getResumenDashboard
};