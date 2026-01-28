document.addEventListener('DOMContentLoaded', async () => {
    // 1. Detectar el nombre de la clínica de la URL
    // URL ejemplo: .../clinica-ers
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    // Si estamos en la raíz o algo raro, intentamos pillar el último trozo
    const clinicSlug = pathParts[pathParts.length - 1]; 

    console.log("🔍 Intentando conectar con:", clinicSlug);

    const ui = {
        clinicName: document.getElementById('clinicName'),
        chatBox: document.getElementById('chatBox'),
        input: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendButton'),
        tlfInput: document.getElementById('patientTlf'),
        schedule: document.getElementById('infoSchedule'),
        phone: document.getElementById('infoPhone'),
        address: document.getElementById('infoAddress'),
        anaImg: document.getElementById('anaImage'),
        logo: document.getElementById('clinicLogo')
    };

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight;
    }

    async function loadConfig() {
        if (!clinicSlug) {
            ui.clinicName.innerText = "Error URL";
            addMessage("❌ No se ha especificado la clínica en la dirección web.", 'ana');
            return;
        }

        try {
            // Petición al servidor
            const res = await fetch(`/api/config/${clinicSlug}`);
            
            if (!res.ok) throw new Error("Clínica no encontrada");
            
            const data = await res.json();

            // Rellenar datos visuales
            if (ui.clinicName) ui.clinicName.innerText = data.nombre_clinica || "Clínica";
            if (ui.phone) ui.phone.innerText = data.phone || "";
            if (ui.address) ui.address.innerText = data.address || "";
            if (ui.logo) ui.logo.src = data.logo_url || "";
            if (ui.anaImg) ui.anaImg.src = data.bot_avatar || "https://i.pravatar.cc/150?u=a";
            
            // Habilitar chat
            ui.input.disabled = false;
            ui.sendBtn.disabled = false;
            
            addMessage(`👋 Hola, soy ${data.bot_nombre || 'Ana'}. ¿En qué puedo ayudarte hoy?`, 'ana');

        } catch (e) {
            console.error(e);
            if (ui.clinicName) ui.clinicName.innerText = "Error de Conexión";
            addMessage("❌ No he podido cargar los datos de la clínica. Por favor verifica el nombre en la URL.", 'ana');
        }
    }

    async function sendMessage() {
        const txt = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim();

        if (!txt) return;
        if (tlf.length < 5) {
            alert("⚠️ Por favor, introduce tu teléfono arriba para poder gestionar la cita.");
            ui.tlfInput.focus();
            return;
        }
        
        // Pintar mensaje usuario
        addMessage(txt, 'user');
        ui.input.value = '';
        ui.input.disabled = true;
        
        try {
            // Enviar al Backend
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: txt, patient_tlf: tlf })
            });
            
            const data = await res.json();
            addMessage(data.reply, 'ana');

        } catch (e) {
            addMessage("⚠️ Error de conexión. Inténtalo de nuevo.", 'ana');
        } finally {
            ui.input.disabled = false;
            ui.input.focus();
        }
    }

    if (ui.sendBtn) ui.sendBtn.addEventListener('click', sendMessage);
    if (ui.input) ui.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Arrancar
    loadConfig();
});