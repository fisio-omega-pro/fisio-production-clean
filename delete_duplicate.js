const { db } = require('./backend/config/firebase');

async function deleteDuplicate() {
    const idToDelete = 'D7UMH0mWr8I3zFANREUi'; // Juanjo Fresa (el primero que se creó con null)
    console.log(`🗑️ Eliminando cita duplicada ${idToDelete}...`);
    try {
        await db.collection('citas').doc(idToDelete).delete();
        console.log('✅ Cita eliminada correctamente.');
    } catch (error) {
        console.error('🔥 Error:', error.message);
    }
}

deleteDuplicate().then(() => process.exit(0));
