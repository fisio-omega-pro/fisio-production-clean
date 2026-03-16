// Configuración base para testing
module.exports = async () => {
  console.log('🧪 Configurando entorno de testing...');
  
  // Variables de entorno para testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  process.env.JWT_SECRET = 'test-secret-key';
  
  console.log('✅ Entorno de testing configurado');
};
