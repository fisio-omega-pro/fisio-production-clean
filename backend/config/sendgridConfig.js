// Configuración de SendGrid para producción
const config = {
  // 1. Crear cuenta en SendGrid: https://signup.sendgrid.com/
  // 2. Verificar email sender
  // 3. Obtener API Key
  
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@fisiotool.com',
  FROM_NAME: process.env.FROM_NAME || 'FisioTool Pro',
  
  // Emails de testing permitidos
  TESTING_EMAILS: [
    'aunquedemanera@gmail.com',
    'fisiotoolsaas@gmail.com',
    'test@fisiotool.com'
  ]
};

// Instrucciones de configuración:
const instructions = `
🔧 CONFIGURACIÓN SENDGRID - PASOS:

1. CREAR CUENTA SENDGRID:
   - Ir a: https://signup.sendgrid.com/
   - Registrarse con email: fisiotoolsaas@gmail.com
   - Verificar cuenta

2. CONFIGURAR SENDER:
   - Settings → Sender Authentication
   - Verificar dominio o email único
   - Usar: noreply@fisiotool.com

3. OBTENER API KEY:
   - Settings → API Keys
   - Crear API Key con permisos "Mail Send"
   - Copiar API Key

4. CONFIGURAR VARIABLES DE ENTORNO:
   export SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   export FROM_EMAIL="noreply@fisiotool.com"
   export FROM_NAME="FisioTool Pro"

5. INSTALAR DEPENDENCIA:
   npm install @sendgrid/mail

6. PROBAR ENVÍO:
   - Usar emailServiceREAL.js
   - Enviar a aunquedemanera@gmail.com
   - Verificar recepción

⚠️  IMPORTANTE:
- Sin API Key real, los emails no se enviarán
- El sistema actual solo simula envíos
- Se necesita configuración real para producción
`;

console.log(instructions);

module.exports = { config, instructions };
