document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Iniciando LandingBot...");

    // 1. Detectar Clínica
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const clinicSlug = pathParts[pathParts.length - 1]; 

    // Referencias UI (Con protección por si falta algo)
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

    // --- FUNCIONES VISUALES SEGURAS ---

    function addMessage(text, sender) {
        if (!ui.chatBox) return;
        const div = document.createElement('div');
        div.classList.add('message', sender);
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
        div.innerHTML = text.replace(/\n/g, '<br>') + `<div class="time">${timeStr}</div>`;
        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight;
    }

    function renderSchedule(scheduleMap) {
        if (!ui.scheduleContainer) return;
        try {
            if (!scheduleMap) { ui.scheduleContainer.innerHTML = '<p>Consultar</p>'; return; }
            
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            let html = '';
            
            // Ordenar con seguridad
            Object.keys(scheduleMap).sort((a,b) => {
                const da = parseInt(a) || 0; const db = parseInt(b) || 0;
                return (da===0?7:da) - (db===0?7:db);
            }).forEach(key => {
                const slots = scheduleMap[key];
                if (Array.isArray(slots)) {
                    const hours = slots.map(s => `${s.start}-${s.end}`).join(', ');
                    if(key !== "0") html += `<div style="font-size:13px; margin-bottom:4px;"><strong>${days[parseInt(key)]}:</strong> ${hours}</div>`;
                }
            });
            ui.scheduleContainer.innerHTML = html || "Sin horario público";
        } catch (e) {
            console.warn("Fallo visual horario", e);
        }
    }

    function checkOpenStatus(schedule) {
        if (!ui.statusLabel || !ui.statusDot) return;
        try {
            if (!schedule) return;
            const now = new Date();
            const day = now.getDay().toString();
            const slots = schedule[day];
            let isOpen = false;
            
            if (slots && Array.isArray(slots)) {
                const min = now.getHours() * 60 + now.getMinutes();
                for (const s of slots) {
                    if (s.start && s.end) {
                        const [sh,sm] = s.start.split(':').map(Number);
                        const [eh,em] = s.end.split(':').map(Number);
                        if (min >= sh*60+sm && min < eh*60+em) isOpen = true;
                    }
                }
            }
            if (isOpen) { ui.statusLabel.innerText = "Abierto"; ui.statusDot.classList.add('open'); }
            else { ui.statusLabel.innerText = "Cerrado"; ui.statusDot.classList.remove('open'); }
        } catch (e) { console.warn("Fallo visual semáforo", e); }
    }

    // --- CARGA Y ARRANQUE ---
    async function loadConfig() {
        try {
            if (!clinicSlug) throw new Error("Sin slug");

            const res = await fetch(`/api/config/${clinicSlug}`);
            if (!res.ok) throw new Error("Error API");
            
            const data = await res.json();

            // 1. ACTIVAR CHAT (PRIORIDAD MÁXIMA)
            // Hacemos esto primero para que si falla lo visual, al menos funcione el chat
            if (ui.input) {
                ui.input.disabled = false;
                ui.input.placeholder = "Escribe aquí...";
            }
            if (ui.sendBtn) ui.sendBtn.disabled = false;

            // 2. Rellenar Textos (Con seguridad)
            if (ui.clinicName) ui.clinicName.innerText = data.nombre_clinica || "Clínica";
            if (ui.infoPhone) { ui.infoPhone.innerText = data.phone || ""; ui.infoPhone.href = `tel:${data.phone}`; }
            if (ui.infoAddress) ui.infoAddress.innerText = data.address || "";
            if (ui.clinicLogo && data.logo_url) ui.clinicLogo.src = data.logo_url;

            // 3. Pintar cosas complejas (Dentro de try/catch implícito en sus funciones)
            renderSchedule(data.weekly_schedule);
            checkOpenStatus(data.weekly_schedule);
            
            // 4. Saludo
            addMessage(`👋 Hola, soy ${data.bot_nombre || 'Ana'}. ¿En qué te ayudo?`, 'ana');

        } catch (e) {
            console.error("Error crítico carga:", e);
            if (ui.clinicName) ui.clinicName.innerText = "Error conexión";
            addMessage("❌ No se pudo conectar con la clínica. Refresca la página.", 'ana');
        }
    }

    // --- LÓGICA ENVÍO ---
    async function sendMessage() {
        const txt = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim();
        
        if (!txt) return;
        if (tlf.length < 5) {
            alert("⚠️ Necesito tu número de móvil (arriba) para la cita.");
            ui.tlfInput.focus();
            return;
        }

        addMessage(txt, 'user');
        ui.input.value = '';
        ui.input.disabled = true;

        try {
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: txt, patient_tlf: tlf })
            });
            const data = await res.json();
            addMessage(data.reply, 'ana');
        } catch (e) {
            addMessage("⚠️ Error de red. Intenta de nuevo.", 'ana');
        } finally {
            ui.input.disabled = false;
            ui.input.focus();
        }
    }

    if (ui.sendBtn) ui.sendBtn.addEventListener('click', sendMessage);
    if (ui.input) ui.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    loadConfig();
});