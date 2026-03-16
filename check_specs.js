const { db } = require('./backend/config/firebase');

async function checkSpecs() {
    console.log('🔍 Buscando especialistas...');
    try {
        const snapshot = await db.collection('especialistas').get();
        if (snapshot.empty) {
            console.log('❌ No hay especialistas en la colección.');
            return;
        }
        snapshot.forEach(doc => {
            console.log(`ID: ${doc.id} | Nombre: ${doc.data().nombre}`);
        });
    } catch (error) {
        console.error('🔥 Error:', error.message);
    }
}

checkSpecs().then(() => process.exit(0));
