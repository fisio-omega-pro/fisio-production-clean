const { db } = require('./backend/config/firebase');

async function checkCitas() {
    const fecha = '2026-03-07';
    const hora = '09:00';
    console.log(`🔍 Buscando citas para ${fecha} ${hora}...`);

    try {
        const snapshot = await db.collection('citas')
            .where('fecha', '==', fecha)
            .where('hora', '==', hora)
            .get();

        if (snapshot.empty) {
            console.log('❌ No se encontraron citas.');
            return;
        }

        console.log(`✅ Se encontraron ${snapshot.size} citas:`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id}`);
            console.log(`Nombre: ${data.nombre}`);
            console.log(`Especialista: ${data.specialistId || data.specialist_id}`);
            console.log(`Created: ${data.created_at?.toDate()?.toISOString()}`);
            console.log('---');
        });
    } catch (error) {
        console.error('🔥 Error:', error.message);
    }
}

checkCitas().then(() => process.exit(0));
