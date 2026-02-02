const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');
const crypto = require('crypto');

/**
 * 🔐 SERVICIO DE RECUPERACIÓN DE CONTRASEÑA
 * Maneja todo el flujo de "olvidé mi contraseña"
 */

/**
 * Genera un token único de recuperación
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Envía email de recuperación de contraseña
 */
const sendPasswordResetEmail = async (email) => {
  try {
    // 1. Buscar la clínica por email
    const clinicaSnapshot = await db.collection('clinicas')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (clinicaSnapshot.empty) {
      // No revelar si el email existe o no (seguridad)
      console.log(`⚠️ Intento de reset para email no registrado: ${email}`);
      return { success: true, message: 'Si el email existe, recibirás las instrucciones' };
    }

    const clinicaDoc = clinicaSnapshot.docs[0];
    const clinicaData = clinicaDoc.data();

    // 2. Generar token único
    const resetToken = generateResetToken();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)); // 1 hora

    // 3. Guardar token en Firestore
    await db.collection('password_resets').add({
      clinicId: clinicaDoc.id,
      email: email.toLowerCase().trim(),
      token: resetToken,
      expiresAt,
      used: false,
      createdAt: Timestamp.now()
    });

    // 4. Crear link de reseteo
    const resetLink = `https://fisiotool.com/reset-password?token=${resetToken}`;

    // 5. Enviar email
    const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); padding: 40px 30px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; }
    .content { padding: 40px 30px; }
    .content p { color: #333; line-height: 1.7; font-size: 15px; }
    .cta-button { display: inline-block; background: #0066ff; color: #fff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 900; margin: 30px 0; font-size: 16px; box-shadow: 0 10px 30px rgba(0,102,255,0.3); }
    .cta-button:hover { background: #0052cc; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; color: #856404; }
    .footer { background: #f4f4f4; padding: 30px; text-align: center; font-size: 12px; color: #999; }
    .code-box { background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #0066ff; margin: 20px 0; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Recuperación de Contraseña</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #0066ff;">Hola ${clinicaData.nombre_clinica || 'Fisioterapeuta'},</h2>
      
      <p>Recibimos tu solicitud para restablecer la contraseña de tu cuenta en <strong>FisioTool Pro</strong>.</p>
      
      <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>

      <div style="text-align: center;">
        <a href="${resetLink}" class="cta-button">RESTABLECER CONTRASEÑA</a>
      </div>

      <p style="font-size: 13px; color: #666;">O copia y pega este enlace en tu navegador:</p>
      <div class="code-box">${resetLink}</div>

      <div class="warning">
        <strong>⏰ Este enlace es válido por 1 hora</strong><br>
        Por seguridad, el enlace expirará automáticamente después de 60 minutos.
      </div>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <strong>¿No solicitaste este cambio?</strong><br>
        Si no fuiste tú, simplemente ignora este email. Tu contraseña permanecerá sin cambios.
      </p>

      <div style="margin-top: 30px; font-style: italic; color: #666;">
        <p><strong>— Ana</strong><br>Directora de Operaciones, FisioTool Pro</p>
      </div>
    </div>
    
    <div class="footer">
      <p>FisioTool Pro LLC | info@fisiotool.com | www.fisiotool.com</p>
      <p>Este email fue enviado a ${email} porque solicitaste recuperar tu contraseña.</p>
    </div>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: email,
      subject: '🔐 Recupera tu acceso a FisioTool Pro',
      html: emailHTML
    });

    console.log(`✅ Email de recuperación enviado a ${email}`);
    return { success: true, message: 'Email de recuperación enviado' };

  } catch (error) {
    console.error('❌ Error al enviar email de recuperación:', error);
    throw error;
  }
};

/**
 * Valida el token y resetea la contraseña
 */
const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const bcrypt = require('bcryptjs');

    // 1. Buscar el token en la base de datos
    const resetSnapshot = await db.collection('password_resets')
      .where('token', '==', token)
      .where('used', '==', false)
      .limit(1)
      .get();

    if (resetSnapshot.empty) {
      return { success: false, error: 'Token inválido o ya utilizado' };
    }

    const resetDoc = resetSnapshot.docs[0];
    const resetData = resetDoc.data();

    // 2. Verificar que no haya expirado
    const now = Timestamp.now();
    if (resetData.expiresAt.toMillis() < now.toMillis()) {
      return { success: false, error: 'El token ha expirado. Solicita uno nuevo.' };
    }

    // 3. Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la contraseña en la clínica
    await db.collection('clinicas').doc(resetData.clinicId).update({
      password: hashedPassword,
      updatedAt: Timestamp.now()
    });

    // 5. Marcar el token como usado
    await db.collection('password_resets').doc(resetDoc.id).update({
      used: true,
      usedAt: Timestamp.now()
    });

    console.log(`✅ Contraseña reseteada exitosamente para clinicId: ${resetData.clinicId}`);
    return { success: true, message: 'Contraseña actualizada exitosamente' };

  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  resetPasswordWithToken
};
