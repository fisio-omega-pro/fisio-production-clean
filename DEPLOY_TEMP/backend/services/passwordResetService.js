const { db, Timestamp } = require('../config/firebase');
const crypto = require('crypto');
const { sendEmail } = require('./emailSenderService');
const { baseEmailHtml, escapeHtml } = require('./emailTemplates');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function createResetRequest(email) {
  const normalized = String(email || '').toLowerCase().trim();
  if (!normalized) return { ok: false, error: 'Email requerido' };

  const snap = await db.collection('clinicas').where('email', '==', normalized).limit(1).get();
  const token = generateToken();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)); // 1h

  if (!snap.empty) {
    await db.collection('password_resets').add({
      email: normalized,
      clinicId: snap.docs[0].id,
      type: 'clinic',
      token,
      used: false,
      createdAt: Timestamp.now(),
      expiresAt
    });
    return { ok: true, token };
  }

  const staffDoc = await db.collection('staff_logins').doc(normalized).get();
  if (!staffDoc.exists) return { ok: true };

  const staffData = staffDoc.data() || {};
  await db.collection('password_resets').add({
    email: normalized,
    type: 'staff',
    clinic_id: staffData.clinic_id || null,
    specialist_id: staffData.specialist_id || null,
    token,
    used: false,
    createdAt: Timestamp.now(),
    expiresAt
  });

  return { ok: true, token };
}

async function sendResetEmail(email, token) {
  const resetLink = `https://fisiotool.com/reset-password?token=${token}`;
  const subject = 'Recuperación de contraseña - FisioTool Pro';
  const text =
    `Hola,\n\n` +
    `Para restablecer tu contraseña haz clic en este enlace (válido 1 hora):\n` +
    `${resetLink}\n\n` +
    `Si no solicitaste este cambio, ignora este email.\n\n` +
    `— Ana`;

  const bodyHtml = `
    <div class="block-w">
      <div class="h1">Recuperación de contraseña</div>
      <p class="p">Hemos recibido una solicitud para restablecer tu contraseña de <strong>FisioTool Pro</strong>.</p>
    </div>
    <div class="block-w2">
      <p class="p">Este enlace es válido durante <strong>1 hora</strong>:</p>
      <p><a class="cta" href="${resetLink}">Restablecer contraseña</a></p>
    </div>
    <div class="block-w">
      <div class="box">
        <div class="muted">Si el botón no funciona, copia y pega este enlace:</div>
        <div class="muted" style="word-break:break-all">${escapeHtml(resetLink)}</div>
      </div>
    </div>
    <div class="block-w2">
      <p class="muted" style="margin:0">Si no solicitaste este cambio, ignora este email.</p>
    </div>
  `;

  const html = baseEmailHtml({
    title: subject,
    preheader: 'Enlace válido 1 hora para restablecer tu contraseña.',
    bodyHtml,
    footerNoteHtml: 'Email transaccional de seguridad.'
  });

  await sendEmail({ to: email, subject, text, html, type: 'ANA' });
}

async function consumeResetToken(token, newPasswordHash) {
  const snap = await db.collection('password_resets')
    .where('token', '==', String(token || '').trim())
    .where('used', '==', false)
    .limit(1)
    .get();

  if (snap.empty) return { ok: false, error: 'Token inválido o usado' };
  const doc = snap.docs[0];
  const data = doc.data() || {};

  if (!data.expiresAt || data.expiresAt.toMillis() < Date.now()) {
    return { ok: false, error: 'Token expirado' };
  }

  if (data.type === 'staff' && data.email) {
    await db.collection('staff_logins').doc(data.email).set({
      password: newPasswordHash,
      updated_at: Timestamp.now()
    }, { merge: true });
  } else {
    const clinicId = data.clinicId || data.clinic_id;
    if (clinicId) {
      await db.collection('clinicas').doc(clinicId).update({
        password: newPasswordHash,
        updated_at: Timestamp.now()
      });
    } else {
      return { ok: false, error: 'Token inválido' };
    }
  }

  await db.collection('password_resets').doc(doc.id).update({
    used: true,
    usedAt: Timestamp.now()
  });

  return { ok: true };
}

module.exports = {
  createResetRequest,
  sendResetEmail,
  consumeResetToken
};

