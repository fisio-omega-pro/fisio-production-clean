const { db } = require('./backend/config/firebase');

async function checkUsers() {
    console.log('--- CLINICAS ---');
    const snap = await db.collection('clinicas').get();
    snap.forEach(doc => {
        const d = doc.data();
        console.log(`ID: ${doc.id} | Email: ${d.email} | PassField: ${d.password ? 'password' : (d.password_hash ? 'password_hash' : 'NONE')}`);
    });

    console.log('\n--- STAFF LOGINS ---');
    const staffSnap = await db.collection('staff_logins').get();
    staffSnap.forEach(doc => {
        const d = doc.data();
        console.log(`Email/ID: ${doc.id} | Clinic: ${d.clinic_id}`);
    });

    process.exit(0);
}

checkUsers().catch(e => {
    console.error(e);
    process.exit(1);
});
