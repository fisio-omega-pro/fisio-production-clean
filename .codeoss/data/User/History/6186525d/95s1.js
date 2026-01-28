document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Motor de Chat FisioTool Pro Activo...");

    // 1. Detectar Clínica desde la URL
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const clinicSlug = pathParts[pathParts.length - 1]; 

    // Referencias UI (Con protección de punteros)
    const ui = {
        clinicName: document.getElementById('clinicName'),
        clinicLogo: document.getElementById('clinicLogo'),
        statusDot: document.getElementById('statusDot'),
        statusLabel: document.getElementById('statusLabel'),
        infoPhone: document.getElementById('infoPhone'),
        infoAddress: document.getElementById('infoAddress'),
        scheduleContainer: document.getElementById('scheduleContainer'),
        chatBox: document.getElementById('chatBox'),
        input: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendButton'),
        tlfInput: document.getElementById('patientTlf')
    };

    // --- FUNCIONES DE EXPERIENCIA DE USUARIO (UX) ---

    function addMessage(text, sender) {
        if (!ui.chatBox) return;
        
        const div = document.createElement('div');
        // Mapeo de clases al diseño Ferrari (ia / user)
        const typeClass = (sender === 'ana' || sender === 'ia') ? 'ia' : 'user';
        div.classList.add('msg', typeClass);
        
        // Reloj de precisión
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        // Lógica de detección de links de pago (Stripe)
        if (text.includes('http')) {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            div.innerHTML = text.replace(urlRegex, url => 
                `<a href="${url}" target="_blank" class="pay-link">PAGAR FIANZA AQUÍ 💳</a>`
            );
        } else {
            div.innerHTML = text.replace(/\n/g, '<br>');
        }

        // Añadimos la marca de tiempo estética
        const timeDiv = document.createElement('div');
        timeDiv.style = "font-size: 9px; opacity: 0.5; margin-top: 5px; text-align: right;";
        timeDiv.innerText = timeStr;
        div.appendChild(timeDiv);

        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight;

        // Feedback sonoro opcional para accesibilidad
        if (typeClass === 'ia' && typeof window.narrar === 'function') {
            window.narrar(text);
        }
    }

    function renderSchedule(scheduleMap) {
        if (!ui.scheduleContainer) return;
        try {
            if (!scheduleMap) { ui.scheduleContainer.innerHTML = '<span>Consultar</span>'; return; }
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            let html = '';
            Object.keys(scheduleMap).sort().forEach(key => {
                const slots = scheduleMap[key];
                if (Array.isArray(slots) && slots.length > 0 && key !== "0") {
                    const hours = slots.map(s => `${s.start}-${s.end}`).join(', ');
                    html += `<div><strong>${days[parseInt(key)]}:</strong> ${hours}</div>`;
                }
            });
            ui.scheduleContainer.innerHTML = html || "Consultar horario";
        } catch (e) { console.warn("Error visual horario", e); }
    }

    // --- COMUNICACIÓN CON EL SERVIDOR ---

    async function loadConfig() {
        try {
            if (!clinicSlug) return;
            const res = await fetch(`/api/config/${clinicSlug}`);
            if (!res.ok) throw new Error("Clínica no encontrada");
            const data = await res.json();

            if (ui.clinicName) ui.clinicName.innerText = data.nombre_clinica;
            if (ui.infoPhone) ui.infoPhone.innerText = data.phone || "";
            if (ui.infoAddress) ui.infoAddress.innerText = data.address || "";
            if (ui.clinicLogo && data.logo_url) ui.clinicLogo.src = data.logo_url;

            renderSchedule(data.weekly_schedule);
            
            // Saludo inicial inteligente
            const saludo = `👋 Hola, soy ${data.bot_nombre || 'Ana'}. Estoy revisando la agenda. ¿Cómo te llamas y qué día te gustaría venir?`;
            addMessage(saludo, 'ia');

        } catch (e) {
            console.error("Fallo carga inicial:", e);
            addMessage("❌ Error al conectar con la clínica. Por favor, recarga.", 'ia');
        }
    }

    async function sendMessage() {
        const txt = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim();
        
        if (!txt) return;
        if (tlf.length < 9) {
            alert("⚠️ Por favor, introduce tu número de teléfono para que Ana pueda gestionar tu cita.");
            ui.tlfInput.focus();
            return;
        }

        // UI Optimista
        addMessage(txt, 'user');
        ui.input.value = '';
        ui.sendBtn.disabled = true;

        // Indicador de "Pensando..."
        const loadingId = 'loading-' + Date.now();
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'msg ia';
        loadingMsg.id = loadingId;
        loadingMsg.innerText = 'Ana está consultando la disponibilidad...';
        ui.chatBox.appendChild(loadingMsg);

        try {
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: txt, patient_tlf: tlf })
            });
            const data = await res.json();
            
            document.getElementById(loadingId).remove();
            addMessage(data.reply, 'ia');

        } catch (e) {
            if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
            addMessage("⚠️ Lo siento, he tenido un micro-corte técnico. ¿Podrías repetirlo?", 'ia');
        } finally {
            ui.sendBtn.disabled = false;
            ui.input.focus();
        }
    }

    // --- EVENT LISTENERS ---
    if (ui.sendBtn) ui.sendBtn.addEventListener('click', sendMessage);
    if (ui.input) ui.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    loadConfig();
});