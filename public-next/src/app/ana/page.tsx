'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { MessageCircle, Send, Clock, Calendar, Download, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// TypeScript declaration for PWA install prompt
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

function AnaChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get clinicId from URL params - try multiple methods
  const getClinicId = () => {
    // Method 1: useSearchParams (Next.js way)
    const fromSearchParams = searchParams.get('ref');
    if (fromSearchParams) return fromSearchParams;

    // Method 2: window.location (fallback)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const fromWindow = urlParams.get('ref');
      if (fromWindow) return fromWindow;
    }

    // Method 3: hardcoded fallback for testing
    return 'bleRbykAj1TgF4lOYdMh'; // Test clinic ID
  };

  const clinicId = getClinicId();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [userRegistered, setUserRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showForm, setShowForm] = useState(true);

  // 🤖 Ana Profile State
  const [anaProfile, setAnaProfile] = useState({
    name: 'Ana',
    photo_url: null,
    use_clinic_logo: false,
    custom_color: '#075E54'
  });

  // 📥 Cargar configuración de Ana desde Firestore
  useEffect(() => {
    const loadAnaProfile = async () => {
      if (!clinicId) return;
      
      try {
        const response = await fetch(`/api/public/clinic-info?clinicId=${clinicId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAnaProfile({
              name: data.data.ana_name || 'Ana',
              photo_url: data.data.ana_photo || null,
              use_clinic_logo: data.data.ana_use_clinic_logo || false,
              custom_color: data.data.ana_color || '#075E54'
            });
            setClinicName(data.data.nombre_clinica || data.data.nombre || 'la clínica');
          }
        }
      } catch (error) {
        console.error('Error loading Ana profile:', error);
      }
    };

    loadAnaProfile();
  }, [clinicId]);

  useEffect(() => {
    // PWA install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);


    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [clinicId]);

  // Update manifest with clinic logo
  useEffect(() => {
    if (clinicId && typeof window !== 'undefined') {
      // Update manifest link to include clinic ID
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        manifestLink.href = `/api/manifest?clinicId=${clinicId}`;
      }

      // Also update for PWA install
      const updateManifest = async () => {
        try {
          const response = await fetch(`/api/manifest?clinicId=${clinicId}`);
          if (response.ok) {
            const manifestData = await response.json();

            // Update theme color and icons dynamically
            if (manifestData.icons && manifestData.icons.length > 0) {
              // Update PWA icons if needed
              console.log('🎨 Updated PWA manifest with clinic logo:', manifestData.name);
            }
          }
        } catch (error) {
          console.error('Error updating manifest:', error);
        }
      };

      updateManifest();
    }
  }, [clinicId]);

  const handleUserRegistration = () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('Por favor, introduce tu nombre y email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert('Por favor, introduce un email válido');
      return;
    }

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      text: `Me llamo ${userName} y mi email es ${userEmail}`,
      timestamp: Date.now()
    }]);

    // Add Ana response
    setMessages(prev => [...prev, {
      role: 'ana',
      text: `¡Gracias por registrarte! 🎉

� **ANTES DE EMPEZAR - INSTALA LA APP GRATIS:**

📱 **Toca el botón "📱 INSTALAR APP" aquí abajo**

✅ Notificaciones instantáneas de citas
✅ Chat más rápido y fluido  
✅ Acceso directo sin navegador
✅ Recordatorios automáticos

Es 100% GRATIS y se instala en 10 segundos.

Una vez instalada, podremos comunicarnos directamente y yo podré ayudarte mejor con tus citas y seguimiento.`,
      timestamp: Date.now()
    }]);

    // Add PWA install prompt message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ana',
        text: `🔥 **¿LISTO PARA INSTALAR?**

👇 **Toca AHORA el botón "📱 INSTALAR APP"**

Es 100% GRATIS y se instala en 10 segundos:

1. Toca el botón azul "📱 INSTALAR APP"
2. Pulsa "Instalar" o "Añadir a pantalla de inicio"
3. ¡Listo! La app aparecerá en tu móvil

¿Necesitas ayuda? ¡Dime "instalar" y te guío paso a paso!`,
        timestamp: Date.now()
      }]);
    }, 3000);

    setUserRegistered(true);
    setShowForm(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || !userRegistered) return;

    console.log('🔍 [ANA] clinicId value:', clinicId);
    console.log('🔍 [ANA] input value:', input);

    if (!clinicId) {
      console.error('🔥 [ANA] No clinicId found!');
      setMessages(prev => [...prev, {
        role: 'ana',
        text: 'Error: No se encontró el ID de la clínica. Por favor, usa el enlace completo.',
        timestamp: Date.now()
      }]);
      return;
    }

    const userMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsTyping(true);

    try {
      const apiUrl = '/api/public/ana-chat';
      console.log('🔍 [ANA] API URL:', apiUrl);
      console.log('🔍 [ANA] Sending payload:', JSON.stringify({ message: messageToSend, clinicId, history: messages }, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, clinicId, history: messages })
      });

      console.log('🔍 [ANA] Response status:', response.status);
      const data = await response.json();
      console.log('🔍 [ANA] Response data:', data);

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ana',
          text: data.response,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error(data.error || 'Error en respuesta');
      }
    } catch (e) {
      console.error('🔥 [ANA] Error:', e);
      setMessages(prev => [...prev, {
        role: 'ana',
        text: `Error técnico: ${e.message}. Por favor, llama a la clínica.`,
        timestamp: Date.now()
      }]);
    }
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b10] to-black flex flex-col">
      {/* Header - WhatsApp Style with Ana's Photo */}
      <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-semibold">{anaProfile.name}</h1>
            <p className="text-xs text-green-300">Asistente de {clinicName || 'la clínica'}</p>
            <p className="text-xs text-green-200 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              En línea
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Ana Profile Photo */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
          {anaProfile.photo_url ? (
            <img
              src={anaProfile.photo_url}
              alt={anaProfile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format"
              alt={anaProfile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </div>

      {/* Chat Messages - Real WhatsApp Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
        backgroundColor: '#E5DDD5',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"100\\" height=\\"100\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cdefs%3E%3Cpattern id=\\"wa-bg\\" width=\\"100\\" height=\\"100\\" patternUnits=\\"userSpaceOnUse\\"%3E%3Cpath d=\\"M 100 0 L 0 0 0 100\\" fill=\\"none\\" stroke=\\"rgba(255,255,255,0.1)\\" stroke-width=\\"0.5\\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\\"100%\\" height=\\"100%\\" fill=\\"url(%23wa-bg)\\" /%3E%3C/svg%3E")'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
              ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${msg.role === 'user' ? 'text-gray-500 justify-end' : 'text-gray-400'
                }`}>
                {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'user' && <span className="text-blue-500">✓✓</span>}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registration Form or Input Area */}
      {showForm ? (
        <div className="bg-[#f0f2f5] px-4 py-4 border-t border-gray-200">
          <div className="bg-white rounded-lg p-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">👋 Regístrate para continuar</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleUserRegistration}
                className="w-full bg-[#0086ea] text-white rounded-lg py-2 font-medium hover:bg-[#007ab5] transition"
              >
                Continuar chat
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#f0f2f5] px-4 py-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.07 4.93c-3.9-3.91-10.24-3.91-14.14 0-3.91 3.9-3.91 10.24 0 14.14 3.9 3.91 10.24 3.91 14.14 0 3.91-3.9 3.91-10.24 0-14.14zm-1.41 12.73c-3.12 3.12-8.19 3.12-11.31 0-3.12-3.12-3.12-8.19 0-11.31 3.12-3.12 8.19-3.12 11.31 0 3.12 3.12 3.12 8.19 0 11.31z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </button>
            </div>

            <button 
              onClick={() => {
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the A2HS prompt');
                      setMessages(prev => [...prev, {
                        role: 'ana',
                        text: `🎉 **¡INSTALACIÓN COMPLETADA!**

¡Perfecto! Ya tienes nuestra app en tu móvil.

Ahora podrás:
✅ Recibir notificaciones instantáneas
✅ Chatear más rápido
✅ Acceder directamente sin navegador

¿En qué puedo ayudarte ahora?`,
                        timestamp: Date.now()
                      }]);
                    } else {
                      console.log('User dismissed the A2HS prompt');
                    }
                    window.deferredPrompt = null;
                  });
                } else {
                  setMessages(prev => [...prev, {
                    role: 'ana',
                    text: `Si no ves el botón de instalación:

1. En Android: Toca los 3 puntos ⋮ > "Añadir a pantalla de inicio"
2. En iOS: Toca el icono de compartir ⬆️ > "Añadir a pantalla de inicio"

¿Necesitas ayuda paso a paso?`,
                    timestamp: Date.now()
                  }]);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
              title="Instalar App en tu móvil"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
              </svg>
              📱 INSTALAR APP
            </button>

            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-full transition ${input.trim() && !isTyping
                ? 'bg-[#0086ea] text-white hover:bg-[#007ab5]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send size={20} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default function AnaChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white">Cargando...</div>}>
      <AnaChatContent />
    </Suspense>
  );
}
