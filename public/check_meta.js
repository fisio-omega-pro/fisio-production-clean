const axios = require('axios');

// ==========================================
// 🔎 CONFIGURACIÓN DE LA SONDA
// ==========================================
const WABA_ID = "871742866029526"; // El número que copiaste
const TOKEN = "EAATVwWkeI9MBQFoMd2i3hmH3i0Rwy8B8zGJXHvz9799fQ4TurrXuatIesB3tksyngEXmgqNN0jZB9l5WShQq67yGw5VolWQE2enhunbGYb3EL4XQWD66SZCS2ipusYgLC708xcxeZCyuxp9ziBTraKtPhDXErodUBA5SPPkgqLhEzjDVWKnZCNhohyntwQZDZD"; // El código largo que empieza por EA...

async function comprobarPlantillas() {
    console.log("🚀 Sonda disparada hacia los servidores de Meta...");
    try {
        const url = `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates`;
        const res = await axios.get(url, {
            params: { access_token: TOKEN }
        });

        if (res.data.data && res.data.data.length > 0) {
            console.log("\n✅ ¡CONEXIÓN EXITOSA! Se han encontrado las siguientes plantillas:\n");
            res.data.data.forEach(p => {
                console.log(`-----------------------------------------`);
                console.log(`📋 NOMBRE: ${p.name}`);
                console.log(`🚦 ESTADO: ${p.status}`);
                console.log(`🌍 IDIOMA: ${p.language}`);
                if (p.status === 'REJECTED') {
                    console.log(`❌ MOTIVO RECHAZO: ${p.reason || 'Sin motivo especificado'}`);
                }
            });
        } else {
            console.log("⚠️ Conexión establecida, pero NO hay plantillas creadas en esta cuenta.");
        }
    } catch (e) {
        console.error("\n❌ ERROR DE CONEXIÓN CON META:");
        if (e.response) {
            console.error("Código:", e.response.status);
            console.error("Detalle:", JSON.stringify(e.response.data.error));
        } else {
            console.error("Mensaje:", e.message);
        }
    }
}

comprobarPlantillas();