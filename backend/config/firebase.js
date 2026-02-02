const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const keyPath = path.join(__dirname, 'key.json');
if (!admin.apps.length) {
    // ✅ En Cloud Run SIEMPRE usar credenciales del entorno (ADC).
    // Evita depender de key.json (no debe empaquetarse en la imagen).
    const runningOnCloudRun = !!process.env.K_SERVICE;

    if (!runningOnCloudRun && fs.existsSync(keyPath)) {
        try {
            const serviceAccount = require(keyPath);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        } catch (e) { admin.initializeApp(); }
    } else {
        admin.initializeApp();
    }
}
const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
module.exports = { db, Timestamp };
