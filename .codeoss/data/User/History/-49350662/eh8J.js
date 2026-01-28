/**
 * 💾 CRM SERVICE - LA MEMORIA DEL SISTEMA
 * Gestiona todas las operaciones de lectura/escritura en Firestore.
 * Aquí reside la lógica de disponibilidad de agenda y gestión de pacientes.
 */

const { db, admin, Timestamp } = require('../config/firebase');
const { normalizarTelefono } = require('../utils/helpers');

// --- 1. LOCALIZADOR SOBERANO (Clínicas) ---
const getClinicaByIdOrSlug = async (idOrSlug) => {
  try {
    if (!idOrSlug) return null;
    // Intento 1: ID directo
    let doc = await db.collection('clinicas').doc(idOrSlug).get();
    if (doc.exists) return { id: doc.id, ...doc.data() };
    
    // Intento 2: Slug (URL amigable)
    const q = await db.collection('clinicas').where('slug', '==', idOrSlug).limit(1).get();
    if (!q.empty) return { id: q.docs[0].id, ...q.docs[0].data() };
    
    return null;
  } catch (error) {
    console.error(`❌ [CRM] Error buscando clínica ${idOrSlug}:`, error);
    return null;
  }
};

// --- 2. MOTOR DE AGENDA (DETERMINISTA) ---
const checkDisponibilidad = async (clinicId, fechaHoraStr) => {
  // fechaHoraStr formato esperado: "YYYY-MM-DD HH:mm"
  const clinica = await getClinicaByIdOrSlug(clinicId);
  if (!clinica) return { available: false, reason: "clínica no encontrada" };

  const [fecha, hora] = fechaHoraStr.split(' ');
  
  // A. Bloqueos (Vacaciones/Festivos)
  const bloqueos = await db.collection('bloqueos')
    .where('clinic_id', '==', clinica.id)
    .where('inicio', '<=', fecha)
    .get();

  for (const doc of bloqueos.docs) {
    const b = doc.data();
    if (fecha >= b.inicio && fecha <= b.fin) {
      return { available: false, reason: `estamos cerrados por ${b.motivo}` };
    }
  }

  // B. Horario Comercial
  const dateObj = new Date(fecha);
  const diaSemana = dateObj.getDay().toString(); // 0=Domingo, 1=Lunes...
  const horarioDia = clinica.weekly_schedule?.[diaSemana];

  if (!horarioDia || horarioDia.length === 0) {
    return { available: false, reason: "estamos cerrados ese día de la semana" };
  }

  // Convertimos todo a minutos para comparar fácil
  const [hh, mm] = hora.split(':').map(Number);
  const citaStartMin = (hh * 60) + mm;
  const duracion = clinica.default_duration_min || 45;
  const citaEndMin = citaStartMin + duracion;

  let dentroHorario = false;
  for (const slot of horarioDia) {
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    if (citaStartMin >= (sh * 60 + sm) && citaEndMin <= (eh * 60 + em)) {
      dentroHorario = true;
      break;
    }
  }

  if (!dentroHorario) return { available: false, reason: "esa hora está fuera de nuestro horario" };

  // C. Colisiones con otras citas (La parte difícil)
  // Consultamos citas que empiecen ese mismo día
  const citasDelDia = await db.collection('citas')
    .where('clinic_id', '==', clinica.id)
    .where('fecha_hora_inicio', '>=', fecha)
    .where('fecha_hora_inicio', '<', fecha + '\uf8ff') // Truco para filtrar strings por prefijo
    .get();

  // Convertimos la cita solicitada a timestamp numérico para comparar rangos
  const solicitudInicio = new Date(`${fecha}T${hora}:00`).getTime();
  const solicitudFin = solicitudInicio + (duracion * 60000);

  for (const doc of citasDelDia.docs) {
    const c = doc.data();
    // Ignoramos citas canceladas o expiradas
    if (['cancelada', 'cancelada_por_expiracion'].includes(c.status)) continue;
    if (c.status === 'pendiente_pago' && c.expira_el && Date.now() > c.expira_el.toMillis()) continue;

    const cInicio = new Date(c.fecha_hora_inicio.replace(' ', 'T')).getTime();
    const cFin = cInicio + ((c.duracion_minutos || 45) * 60000);

    // Algoritmo de intersección de rangos
    if (solicitudInicio < cFin && cInicio < solicitudFin) {
      return { available: false, reason: "ese hueco ya está ocupado" };
    }
  }

  return { available: true };
};

// --- 3. CREACIÓN DE RESERVAS ---
const crearReserva = async (datos, clinicId) => {
  const clinica = await getClinicaByIdOrSlug(clinicId);
  const ref = await db.collection('citas').add({
    ...datos,
    clinic_id: clinica.id,
    nombre_clinica: clinica.nombre_clinica,
    duracion_minutos: clinica.default_duration_min || 45,
    creado: Timestamp.now(),
    recordatorio_enviado: false,
    aceptacion_rgpd: { aceptado: true, version: "1.1", fecha: Timestamp.now() }
  });
  return ref.id;
};

// --- 4. GESTIÓN DE BONOS (Transaccional) ---
const usarBono = async (telefono, clinicId) => {
  const tlf = normalizarTelefono(telefono);
  return await db.runTransaction(async (t) => {
    const q = db.collection('bonos')
      .where('clinic_id', '==', clinicId)
      .where('paciente_tlf', '==', tlf)
      .where('status', '==', 'activo')
      .where('sesiones_disponibles', '>', 0)
      .limit(1);
      
    const snap = await t.get(q);
    if (snap.empty) return { usado: false };

    const doc = snap.docs[0];
    const nuevas = doc.data().sesiones_disponibles - 1;
    t.update(doc.ref, {
      sesiones_disponibles: nuevas,
      status: nuevas <= 0 ? 'consumido' : 'activo'
    });
    return { usado: true, restantes: nuevas };
  });
};

// --- 5. LOGS DE CHAT ---
const guardarLog = async (data) => {
  await db.collection('chats').add({ ...data, ts: Timestamp.now() });
};

module.exports = {
  getClinicaByIdOrSlug,
  checkDisponibilidad,
  crearReserva,
  usarBono,
  guardarLog,
  db // Exportamos db por si acaso se necesita acceso raw en algún controlador
};