const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const keyPath = path.join(__dirname, 'key.json');
if (!admin.apps.length) {
    if (fs.existsSync(keyPath)) {
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
