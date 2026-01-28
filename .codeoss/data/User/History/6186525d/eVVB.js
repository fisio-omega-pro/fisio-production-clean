document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    const clinicSlug = pathParts[pathParts.length - 1]; 

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

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
        div.innerHTML = text.replace(/\n/g, '<br>') + `<div class="time">${timeStr}</div>`;
        ui.chatBox.appendChild(div);
        ui.chatBox.scrollTop = ui.chatBox.scrollHeight;
    }

    function renderSchedule(scheduleMap) {
        if (!scheduleMap) return;
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        let html = '';
        Object.keys(scheduleMap).sort().forEach(key => {
            const slots = scheduleMap[key];
            const hours = slots.map(s => `${s.start}-${s.end}`).join(', ');
            if(key !== "0") html += `<div><strong>${days[parseInt(key)]}:</strong> ${hours}</div>`;
        });
        ui.scheduleContainer.innerHTML = html;
    }

    // Calcular si está abierto AHORA mismo (VERSIÓN BLINDADA)
    function checkOpenStatus(schedule) {
        try {
            if (!schedule) return;
            const now = new Date();
            const day = now.getDay().toString(); // 0-6
            const slots = schedule[day];

            if (!slots || !Array.isArray(slots)) {
                ui.statusLabel.innerText = "Consultar horario";
                ui.statusDot.classList.remove('open');
                return;
            }

            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            let isOpen = false;

            for (const slot of slots) {
                if (!slot.start || !slot.end) continue; // Si el dato está mal, saltamos
                
                const [sh, sm] = slot.start.split(':').map(Number);
                const [eh, em] = slot.end.split(':').map(Number);
                const start = sh * 60 + sm;
                const end = eh * 60 + em;

                if (currentMinutes >= start && currentMinutes < end) {
                    isOpen = true;
                    break;
                }
            }

            if (isOpen) {
                ui.statusLabel.innerText = "Abierto ahora";
                ui.statusDot.classList.add('open');
            } else {
                ui.statusLabel.innerText = "Cerrado ahora";
                ui.statusDot.classList.remove('open');
            }
        } catch (e) {
            console.warn("Error calculando horario visual", e);
            // Si falla, al menos dejamos el texto por defecto
            ui.statusLabel.innerText = "Info disponible";
        }
    }