'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { MessageCircle, Send, Clock, Calendar, Download, ArrowLeft, Phone, Video, MoreVertical, Share2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// TypeScript declaration for PWA install prompt
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

// 🍪 Cookie helpers - persisten entre browser y PWA instalada (localStorage no en iOS)
const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
};
const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').reduce((acc, part) => {
    const [k, v] = part.split('=');
    return k === name ? decodeURIComponent(v || '') : acc;
  }, '');
};

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
  const [userPhone, setUserPhone] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [showiOSModal, setShowiOSModal] = useState(false);

  // � Cargar persistencia de sesión (localStorage + cookies para compatibilidad PWA iOS)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Intentar localStorage primero, luego cookies como fallback (PWA iOS tiene localStorage aislado)
      const savedName  = localStorage.getItem(`ana_user_name_${clinicId}`)  || getCookie(`ana_name_${clinicId}`);
      const savedEmail = localStorage.getItem(`ana_user_email_${clinicId}`) || getCookie(`ana_email_${clinicId}`);
      const savedPhone = localStorage.getItem(`ana_user_phone_${clinicId}`) || getCookie(`ana_phone_${clinicId}`);

      const urlParams = new URLSearchParams(window.location.search);
      const fromEmail = urlParams.get('from') === 'email';

      if (savedName && savedEmail && !fromEmail) {
        setUserName(savedName);
        setUserEmail(savedEmail);
        if (savedPhone) setUserPhone(savedPhone);
        setUserRegistered(true);
        setShowForm(false);
      } else {
        setShowForm(true);
        setUserRegistered(false);
      }
    }
  }, [clinicId]);

  // 🤖 Ana Profile State
  const [anaProfile, setAnaProfile] = useState({
    name: 'Ana',
    photo_url: null,
    use_clinic_logo: false,
    custom_color: '#075E54',
    logo_url: null
  });

  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // 🕵️ Detectar si ya es una PWA instalada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone
        || document.referrer.includes('android-app://');
      setIsAppInstalled(isStandalone);

      // Escuchar cuando el usuario instala la app para ocultar el botón
      const handleAppInstalled = () => setIsAppInstalled(true);
      window.addEventListener('appinstalled', handleAppInstalled);
      return () => window.removeEventListener('appinstalled', handleAppInstalled);
    }
  }, []);

  // 📥 Cargar configuración de Ana desde Firestore
  useEffect(() => {
    const loadAnaProfile = async () => {
      if (!clinicId) return;

      try {
        const response = await fetch(`https://fisio-backend-omega-740657183492.europe-west1.run.app/api/public/clinic-info?clinicId=${clinicId}&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAnaProfile({
              name: data.data.ana_nombre || 'Ana',
              photo_url: data.data.ana_foto || null,
              use_clinic_logo: data.data.ana_usa_logo_clinica || false,
              custom_color: data.data.ana_color || '#075E54',
              logo_url: data.data.logo_url ? 'https://fisio-backend-omega-740657183492.europe-west1.run.app' + data.data.logo_url : null
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
    // 🔋 Registrar Service Worker para PWA (necesario para botón instalar)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        // .then(reg => console.log('✅ SW registrado:', reg.scope)) // ELIMINADO PARA PRODUCCIÓN
        .catch(err => console.error('🔥 Error SW:', err));
    }

    // PWA install prompt listener
    const handleBeforeInstallPrompt = (e: any) => {
      // console.log('📥 beforeinstallprompt detectado'); // ELIMINADO PARA PRODUCCIÓN
      e.preventDefault();
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Removed clinicId from dependencies as it's not used here

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
              // console.log('🎨 Updated PWA manifest with clinic logo:', manifestData.name); // ELIMINADO PARA PRODUCCIÓN
            }
          }
        } catch (error) {
          console.error('Error updating manifest:', error);
        }
      };

      updateManifest();
    }
  }, [clinicId]);

  const handleUserRegistration = async () => {
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) {
      alert('Por favor, introduce tu nombre, email y teléfono');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert('Por favor, introduce un email válido');
      return;
    }

    if (userPhone.trim().length < 9) {
      alert('Por favor, introduce un teléfono válido');
      return;
    }

    setUserRegistered(true);
    setShowForm(false);

    // Guardar en localStorage Y cookies (cookies persisten en PWA iOS donde localStorage es aislado)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ana_user_name_${clinicId}`, userName);
      localStorage.setItem(`ana_user_email_${clinicId}`, userEmail);
      localStorage.setItem(`ana_user_phone_${clinicId}`, userPhone);
      localStorage.setItem(`ana_registered_${clinicId}`, 'true');
      setCookie(`ana_name_${clinicId}`, userName);
      setCookie(`ana_email_${clinicId}`, userEmail);
      setCookie(`ana_phone_${clinicId}`, userPhone);
    }

    // Trigger initial welcome message from Ana via backend (SILENTLY)
    const registrationMessage = `Hola, me llamo ${userName}, mi email es ${userEmail} y mi teléfono es ${userPhone}. Me acabo de registrar.`;

    setIsTyping(true);

    try {
      const response = await fetch('/api/public/ana-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: registrationMessage,
          clinicId,
          history: [],
          userName,
          userEmail,
          userPhone
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([{
          role: 'ana',
          text: data.response,
          timestamp: Date.now()
        }]);

        // 📱 MENSAJE PROACTIVO PARA INSTALAR PWA
        if (!isAppInstalled) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'ana',
              text: "¡Por cierto! 📱 Te recomiendo instalar nuestra App para que siempre me tengas a mano en tu pantalla de inicio. Solo tienes que pulsar el botón azul de 'INSTALAR' que verás justo aquí arriba. ¡Es mucho más cómodo!",
              timestamp: Date.now() + 1000
            }]);
          }, 3000);
        }
      }
    } catch (e) {
      console.error('🔥 Error sending registration welcome:', e);
      // Fallback if API fails
      setMessages([{
        role: 'ana',
        text: `¡Hola ${userName}! Ya te he registrado. ¿Cómo puedo ayudarte?`,
        timestamp: Date.now()
      }]);
    }
    setIsTyping(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || !userRegistered) return;

    // console.log('🔍 [ANA] clinicId value:', clinicId); // ELIMINADO PARA PRODUCCIÓN
    // console.log('🔍 [ANA] input value:', input); // ELIMINADO PARA PRODUCCIÓN

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
      const response = await fetch('/api/public/ana-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          clinicId,
          history: messages,
          userName,
          userEmail,
          userPhone
        })
      });

      // console.log('🔍 [ANA] Response status:', response.status); // ELIMINADO PARA PRODUCCIÓN
      const data = await response.json();
      // console.log('🔍 [ANA] Response data:', data); // ELIMINADO PARA PRODUCCIÓN

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ana',
          text: data.reply || data.response,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error(data.error || 'Error en respuesta');
      }
    } catch (e) {
      console.error('🔥 [ANA] Error:', e);
      setMessages(prev => [...prev, {
        role: 'ana',
        text: `Error técnico: ${e.message}.Por favor, llama a la clínica.`,
        timestamp: Date.now()
      }]);
    }
    setIsTyping(false);
  };

  // 📱 Componente de Modal para iOS
  const iOSInstructionsModal = () => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Share2 size={32} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">INSTALAR EN IPHONE</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sigue estos 3 pasos para tener la App en tu pantalla de inicio:
          </p>

          <div className="space-y-6 text-left mb-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">1</div>
              <p className="text-gray-700 pt-1">Toca el botón <strong>"Compartir"</strong> en la barra inferior (el cuadrado con la flecha <Share2 size={16} className="inline-block text-blue-500" />).</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">2</div>
              <p className="text-gray-700 pt-1">Desliza hacia abajo y toca en <strong>"Añadir a pantalla de inicio"</strong>.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">3</div>
              <p className="text-gray-700 pt-1">Pulsa <strong>"Añadir"</strong> en la esquina superior derecha.</p>
            </div>
          </div>

          <button
            onClick={() => setShowiOSModal(false)}
            className="w-full bg-[#0086ea] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b10] to-black flex flex-col">
      {showiOSModal && iOSInstructionsModal()}
      {/* Header - WhatsApp Style with Ana's Photo */}
      <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-white font-semibold leading-tight">{anaProfile.name}</h1>
            <p className="text-[10px] text-green-300 leading-tight">Asistente de {clinicName || 'la clínica'}</p>
            <p className="text-[10px] text-green-200 flex items-center gap-1 leading-tight">
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
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
              ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-2 flex items-center gap-1 ${msg.role === 'user' ? 'text-gray-500 justify-end' : 'text-gray-400'
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
                placeholder="Tu nombre completo"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Tu teléfono (WhatsApp)"
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
          {/* 📱 Botón de Instalación (Siempre visible si no está instalada) */}
          {!isAppInstalled && (
            <div className="mb-2">
              <button
                onClick={() => {
                  if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    window.deferredPrompt.userChoice.then((choiceResult: any) => {
                      if (choiceResult.outcome === 'accepted') {
                        setIsAppInstalled(true);
                        setMessages(prev => [...prev, {
                          role: 'ana',
                          text: "¡Excelente! Ya tienes la App instalada. Verás lo cómodo que es recibir mis avisos directamente en tu pantalla de inicio. 😊",
                          timestamp: Date.now()
                        }]);
                      }
                      window.deferredPrompt = null;
                    });
                  } else {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
                    if (isIOS) {
                      setShowiOSModal(true);
                    } else {
                      alert('📱 Tu navegador ya tiene la App instalada o no soporta instalación automática.\n\nBusca los 3 puntos (⋮) en tu navegador y selecciona "Añadir a pantalla de inicio".');
                    }
                  }
                }}
                className="w-full bg-[#0086ea] text-white py-3 rounded-xl font-bold text-base shadow-lg hover:bg-[#007ab5] active:scale-95 transition-all flex items-center justify-center gap-3 animate-pulse"
              >
                <Download size={20} />
                📱 INSTALAR APP DE LA CLÍNICA
              </button>
            </div>
          )}

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
            </div>

            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-full transition ${input.trim() && !isTyping
                ? 'bg-[#0086ea] text-white hover:bg-[#007ab5] shadow-md'
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
