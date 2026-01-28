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

    function checkOpenStatus(schedule) {
        if (!schedule) return;
        const now = new Date();
        const day = now.getDay().toString(); 
        const slots = schedule[day];
        let isOpen = false;
        if (slots) {
            const min = now.getHours() * 60 + now.getMinutes();
            for (const s of slots) {
                const [sh,sm] = s.start.split(':').map(Number);
                const [eh,em] = s.end.split(':').map(Number);
                if (min >= sh*60+sm && min < eh*60+em) isOpen = true;
            }
        }
        if (isOpen) { ui.statusLabel.innerText = "Abierto"; ui.statusDot.classList.add('open'); }
        else { ui.statusLabel.innerText = "Cerrado"; ui.statusDot.classList.remove('open'); }
    }

    async function loadConfig() {
        try {
            const res = await fetch(`/api/config/${clinicSlug}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            ui.clinicName.innerText = data.nombre_clinica;
            ui.clinicLogo.src = data.logo_url || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
            ui.infoPhone.innerText = data.phone;
            ui.infoAddress.innerText = data.address;
            
            renderSchedule(data.weekly_schedule);
            checkOpenStatus(data.weekly_schedule);
            
            ui.input.disabled = false;
            ui.sendBtn.disabled = false;
            addMessage(`👋 Hola, soy ${data.bot_nombre}. ¿En qué te ayudo?`, 'ana');
        } catch (e) {
            addMessage("❌ Error de carga.", 'ana');
        }
    }

    async function sendMessage() {
        const txt = ui.input.value.trim();
        const tlf = ui.tlfInput.value.trim();
        if (!txt) return;
        if (tlf.length < 5) { alert("Tu teléfono es necesario."); ui.tlfInput.focus(); return; }
        
        addMessage(txt, 'user');
        ui.input.value = '';
        
        try {
            const res = await fetch(`/api/chat/${clinicSlug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: txt, patient_tlf: tlf })
            });
            const data = await res.json();
            addMessage(data.reply, 'ana');
        } catch (e) { addMessage("Error conexión", 'ana'); }
    }

    ui.sendBtn.addEventListener('click', sendMessage);
    ui.input.addEventListener('keypress', (e) => { if (e.key==='Enter') sendMessage(); });
    loadConfig();
});