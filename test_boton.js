// Test para verificar si el botón funciona
// Copia y pega esto en la consola del navegador en el dashboard

console.log('🔥 [MANUAL TEST] Iniciando test manual del botón...');

// Buscar el botón de upgrade
const botones = document.querySelectorAll('button');
let botonUpgrade = null;

botones.forEach(boton => {
  if (boton.textContent.includes('Subir a plan Multi-Sede')) {
    botonUpgrade = boton;
    console.log('✅ [MANUAL TEST] Botón encontrado:', boton.textContent);
  }
});

if (botonUpgrade) {
  console.log('🎯 [MANUAL TEST] Haciendo clic en el botón...');
  botonUpgrade.click();
} else {
  console.log('❌ [MANUAL TEST] No se encontró el botón de upgrade');
  console.log('📋 [MANUAL TEST] Botones encontrados:', Array.from(botones).map(b => b.textContent));
}
