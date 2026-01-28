document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const patientTlfInput = document.getElementById('patientTlf');
    
    // Elementos de personalización
    const clinicNameElement = document.getElementById('clinicName');
    const clinicLogoElement = document.getElementById('clinicLogo');
    const infoAddressElement = document.getElementById('infoAddress');
    const infoPhoneElement = document.getElementById('infoPhone');
    const infoScheduleElement = document.getElementById('infoSchedule');
    
    let clinicId = null;
    
    // --- FUNCIÓN HELPER: RENDERIZAR MENSAJES ---
    const renderMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        // Simple manejo de saltos de línea para la respuesta de la IA
        msgDiv.innerHTML = text.replace(/\n/g, '<br>'); 
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    };
    
    // --- FUNCIÓN CRÍTICA: CARGA DE CONFIGURACIÓN ---
    const loadConfiguration = async () => {
        const urlParts = window.location.pathname.split('/');
        // El clinicId es el último segmento de la URL: /agenda/clinicId
        clinicId = urlParts[urlParts.length - 1]; 
        
        if (!clinicId || clinicId.length < 5) {
            renderMessage("Error: No se encontró el identificador de la clínica en la URL.", 'ana');
            return;
        }

        try {
            // Llama al nuevo endpoint del Cloud Run
            const response = await fetch(`/api/config/${clinicId}`); 
            const config = await response.json();

            if (response.status !== 200) {
                renderMessage(`Error ${response.status}: ${config.error || 'No se pudo cargar la configuración de la clínica.'}`, 'ana');
                return;
            }

            // Aplicar configuración
            clinicNameElement.textContent = config.nombre_clinica;
            document.getElementById('pageTitle').textContent = `Recepción de ${config.nombre_clinica}`;
            clinicLogoElement.src = config.logo_url;
            infoAddressElement.textContent = config.address;
            infoPhoneElement.textContent = config.phone;
            
            // Renderizado simple del horario
            const scheduleText = Object.keys(config.weekly_schedule)
                .map(dayKey => {
                    const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][parseInt(dayKey)];
                    const hours = config.weekly_schedule[dayKey].map(slot => `${slot.start}-${slot.end}`).join(', ');
                    return hours ? `${dayName}: ${hours}` : null;
                })
                .filter(item => item !== null)
                .join('; ');
                
            infoScheduleElement.textContent = scheduleText || 'Horario no configurado.';
            
            // Habilitar la interacción
            messageInput.disabled = false;
            sendButton.disabled = false;
            
            renderMessage(`Hola, soy Ana, la recepcionista de ${config.nombre_clinica}. ¿En qué puedo ayudarte hoy?`, 'ana');

        } catch (error) {
            console.error("Error de conexión:", error);
            renderMessage("Error de conexión con el servidor. Por favor, inténtalo más tarde.", 'ana');
        }
    };
    
    // --- FUNCIÓN CRÍTICA: ENVÍO DE MENSAJE A LA IA ---
    const sendMessage = async () => {
        const message = messageInput.value.trim();
        const tlf = patientTlfInput.value.trim();

        if (!tlf.match(/^\+\d{8,15}$/)) { // Validación básica de teléfono internacional
             return renderMessage('Por favor, ingresa un número de teléfono válido (ej: +34xxxxxxxxx) para poder registrar tu cita.', 'ana');
        }
        if (!message) return;
        
        renderMessage(message, 'user');
        messageInput.value = '';
        sendButton.disabled = true; // Deshabilitar para evitar doble envío

        try {
            // Llama al nuevo endpoint de chat del Cloud Run
            const response = await fetch(`/api/chat/${clinicId}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, patient_tlf: tlf })
            });
            
            const data = await response.json();
            
            if (response.status === 200) {
                renderMessage(data.reply, 'ana');
            } else {
                renderMessage('Lo siento, la IA ha fallado. Error: ' + (data.error || 'Desconocido.'), 'ana');
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            renderMessage("Error de red. No pude contactar a Ana. Intenta nuevamente.", 'ana');
        } finally {
            sendButton.disabled = false;
            messageInput.focus();
        }
    };
    
    // --- EVENT LISTENERS ---
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Iniciar la carga de la configuración al cargar la página
    loadConfiguration();
});