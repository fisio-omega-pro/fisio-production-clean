const { db } = require('./backend/config/firebase');

async function migrateCitas() {
    console.log('🧹 Iniciando limpieza de citas...');
    try {
        const snapshot = await db.collection('citas').get();
        let updated = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const specId = data.specialist_id;

            if (specId === null || specId === '' || specId === 'null') {
                console.log(`Updating doc ${doc.id}: ${specId} -> admin`);
                await doc.ref.update({ specialist_id: 'admin' });
                updated++;
            }
        }
        console.log(`✅ Se actualizaron ${updated} citas a specialist_id: 'admin'.`);
    } catch (error) {
        console.error('🔥 Error:', error.message);
    }
}

migrateCitas().then(() => process.exit(0));
