document.addEventListener('DOMContentLoaded', async () => {

    // 1. Detectamos el nombre de la clínica en la URL
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const clinicSlug = pathParts[pathParts.length - 1]; 

    console.log("Iniciando LandingBot para:", clinicSlug);

    const ui = {
        title: document.getElementById('pageTitle'),
        clinicName: document.getElementById('clinicName'),
        logo: document.getElementById('clinicLogo'),
        anaImg: document.getElementById('anaImage'),
        address: document.getElementById('infoAddress'),
        phone: document.getElementById('infoPhone'),
        schedule: document.getElementById('infoSchedule'),
        chatBox: document.getElementById('chatBox'),
        input: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendButton'),
        tlfInput: document.getElementById('patientTlf')
    };

    let botName = "Asistente"; 

    // --- FUNCION VISUAL: Pintar mensaje ---
    function renderMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`; 
        div.innerHTML = text.replace(/\n/g, '<br>'); 
        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight; 
    }

    // --- CARGA DE DATOS ---
    async function loadConfig() {
        if (!clinicSlug) {
            renderMessage("Error: URL incorrecta. Falta el nombre de la clínica.", 'ana');
            return;
        }

        try {
            // Conexión con el Servidor
            const response = await fetch(`/api/config/${clinicSlug}`);
            
            if (!response.ok) throw new Error("Clínica no encontrada");

            const data = await response.json();

            // Pintamos los datos
            ui.title.innerText = `Citas - ${data.nombre_clinica}`;
            ui.clinicName.innerText = data.nombre_clinica;
            ui.address.innerText = data.address || "Consultar dirección";
            ui.phone.innerText = data.phone || "Consultar web";
            
            // Imagenes (con seguridad por si fallan)
            ui.logo.src = data.logo_url && data.logo_url.startsWith('http') ? data.logo_url : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
            ui.anaImg.src = data.bot_avatar || "https://i.pravatar.cc/150?u=receptionist";
            
            botName = data.bot_nombre || "Laura";

            if (data.weekly_schedule) {
                ui.schedule.innerText = "Abierto: Consulta disponibilidad en chat.";
            } else {
                ui.schedule.innerText = "Cita Previa";
            }

            // Desbloqueamos el chat
            ui.input.disabled = false;
            ui.sendBtn.disabled = false;
            ui.input.placeholder = "Escribe tu mensaje...";

            // Saludo Inicial
            renderMessage(`👋 Hola, soy ${botName}, de ${data.nombre_clinica}. ¿Cómo puedo ayudarte?`, 'ana');

        } catch (error) {
            console.error(error);
            ui.clinicName.innerText = "Error 404";
            renderMessage(`❌ No encontramos la clínica '${clinicSlug}'.`, 'ana');
        }
    }

    // --- ENVIAR MENSAJE ---
    async function sendMessage() {
        const text = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim(); 

        if (!text) return;

        // Si no hay teléfono, avisamos y paramos (Validación suave)
        if (tlf.length < 5) {
            alert("⚠️ Necesito tu teléfono (arriba a la izquierda) para poder darte cita.");
            ui.tlfInput.style.borderColor = "red";
            ui.tlfInput.focus();
            return;
        }

        renderMessage(text, 'user');
        ui.input.value = '';
        ui.input.disabled = true;
        ui.sendBtn.innerText = "...";

        try {
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, patient_tlf: tlf })
            });

            if (!res.ok) throw new Error("Error Servidor");

            const data = await res.json();
            renderMessage(data.reply, 'ana');

        } catch (error) {
            renderMessage("🔌 Ups, error de conexión. Inténtalo de nuevo.", 'ana');
        } finally {
            ui.input.disabled = false;
            ui.sendBtn.innerText = "Enviar";
            ui.input.focus();
        }
    }

    // Eventos de botones
    ui.sendBtn.addEventListener('click', sendMessage);
    ui.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ¡Arrancar!
    loadConfig();
});