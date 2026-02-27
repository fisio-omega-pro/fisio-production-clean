const { db } = require('./backend/config/firebase');

async function wipeDatabase() {
    const collections = [
        'clinicas',
        'staff_logins',
        'pacientes',
        'citas',
        'bonos',
        'audit_logs',
        'stripe_events',
        'stripe_connect_profesionales',
        'reset_tokens',
        'payment_logs',
        'notifications'
    ];

    console.log('🧹 Iniciando limpieza total de base de datos...');

    for (const colName of collections) {
        console.log(`🗑️ Limpiando colección: ${colName}...`);
        const snap = await db.collection(colName).get();
        const batch = db.batch();

        let count = 0;
        for (const doc of snap.docs) {
            batch.delete(doc.ref);
            count++;

            // Sub-colecciones recursivas (equipo, notas, etc.)
            if (colName === 'clinicas') {
                const subCols = ['equipo', 'sedes'];
                for (const sub of subCols) {
                    const subSnap = await doc.ref.collection(sub).get();
                    subSnap.forEach(sDoc => batch.delete(sDoc.ref));
                }
            }
            if (colName === 'pacientes') {
                const subSnap = await doc.ref.collection('notas').get();
                subSnap.forEach(sDoc => batch.delete(sDoc.ref));
            }
        }

        if (count > 0) {
            await batch.commit();
            console.log(`✅ ${count} documentos eliminados de ${colName}.`);
        } else {
            console.log(`ℹ️ La colección ${colName} ya estaba vacía.`);
        }
    }

    console.log('\n✨ BASE DE DATOS TOTALMENTE LIMPIA. Listo para el test E2E.');
    process.exit(0);
}

wipeDatabase().catch(e => {
    console.error('🔥 Error fatal en limpieza:', e);
    process.exit(1);
});
