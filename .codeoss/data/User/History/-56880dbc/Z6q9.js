// --- 👥 DASHBOARD: GESTIÓN DE PACIENTES ---
const getPacientes = async (req, res, next) => {
  try {
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', req.clinicId)
      .orderBy('creado_el', 'desc')
      .get();

    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
};

// --- 👩‍⚕️ DASHBOARD: GESTIÓN DE EQUIPO ---
const getEquipo = async (req, res, next) => {
  try {
    const snap = await db.collection('clinicas').doc(req.clinicId)
      .collection('especialistas').get();
    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
};

// VITAL: Exportar las 4 funciones
module.exports = {
  register,
  getBalance,
  getPacientes,
  getEquipo
};