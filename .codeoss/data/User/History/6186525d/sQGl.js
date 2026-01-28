document.addEventListener('DOMContentLoaded', async () => {

    // 1. OBTENER IDENTIFICADOR DE LA CLÍNICA DESDE LA URL
    // Si la URL es midominio.com/clinica-ers, esto pilla "clinica-ers"
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const clinicSlug = pathParts[pathParts.length - 1];

    console.log("🚀 Iniciando sistema para:", clinicSlug);

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

    // --- FUNCIÓN VISUAL: AGREGAR BURBUJA DE CHAT ---
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`; // 'ana' o 'user'
        div.innerHTML = text.replace(/\n/g, '<br>');
        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight;
    }

    // --- LÓGICA DE ARRANQUE: CARGAR DATOS ---
    async function loadConfig() {
        if (!clinicSlug) {
            ui.clinicName.innerText = "Error";
            addMessage("⛔ No hay código de clínica en la URL.", 'ana');
            return;
        }

        try {
            const res = await fetch(`/api/config/${clinicSlug}`);
            
            if (!res.ok) throw new Error("Clínica no encontrada");
            const data = await res.json();

            // PINTAR DATOS EN LA WEB
            ui.title.innerText = data.nombre_clinica;
            ui.clinicName.innerText = data.nombre_clinica;
            ui.address.innerText = data.address || "Ver web";
            ui.phone.innerText = data.phone || "Ver web";
            ui.schedule.innerText = data.weekly_schedule ? "Abierto" : "Cita Previa";
            
            // Imagenes (Seguridad si están vacías)
            ui.logo.src = data.logo_url || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
            ui.anaImg.src = data.bot_avatar || "https://i.pravatar.cc/150?u=recepcion";

            // Desbloquear Inputs
            ui.input.disabled = false;
            ui.sendBtn.disabled = false;
            
            // Saludo de la IA
            const botName = data.bot_nombre || "Laura";
            addMessage(`👋 Hola, soy ${botName}, de ${data.nombre_clinica}. ¿En qué te ayudo?`, 'ana');

        } catch (error) {
            console.error(error);
            ui.clinicName.innerText = "No encontrada";
            addMessage(`❌ No existe la clínica: ${clinicSlug}`, 'ana');
        }
    }

    // --- LÓGICA DE CHAT: ENVIAR MENSAJE ---
    async function sendMessage() {
        const txt = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim();

        if (!txt) return;

        // Validar Teléfono (Obligatorio para identificar paciente)
        if (tlf.length < 5) {
            alert("⚠️ Por favor, indica tu teléfono en la casilla izquierda para poder darte cita.");
            ui.tlfInput.focus();
            ui.tlfInput.style.borderColor = "red";
            return;
        }
        ui.tlfInput.style.borderColor = "#ccc";

        // 1. Mostrar lo que dice el usuario
        addMessage(txt, 'user');
        ui.input.value = '';
        ui.input.disabled = true;
        ui.sendBtn.innerText = "...";

        try {
            // 2. Enviar al Servidor
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: txt, patient_tlf: tlf })
            });
            
            const data = await res.json();
            
            // 3. Mostrar respuesta de la IA
            addMessage(data.reply, 'ana');

        } catch (e) {
            addMessage("🔌 Error de conexión momentáneo.", 'ana');
        } finally {
            ui.input.disabled = false;
            ui.sendBtn.innerText = "Enviar";
            ui.input.focus();
        }
    }

    // EVENTOS
    ui.sendBtn.addEventListener('click', sendMessage);
    ui.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ENCENDEMOS MOTORES
    loadConfig();
});