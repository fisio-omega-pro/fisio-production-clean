'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { MessageCircle, Send, Clock, Calendar, Download, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function AnaChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicId = searchParams.get('ref');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [userRegistered, setUserRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (clinicId) {
      // Obtener nombre de la clínica
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/clinic-info?ref=${clinicId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setClinicName(data.nombre);
            setMessages([{
              role: 'ana',
              text: `¡Hola! 👋 Soy Ana, asistente de ${data.nombre}.\n\n📱 **Descarga nuestra app** para tener tu agenda siempre a mano:\n\nBusca "FisioTool" en tu App Store / Play Store\n\nO accede directamente: https://fisiotool.com/ana?ref=${clinicId}\n\n¿Cómo te llamas y cuál es tu email para poder ayudarte mejor?`,
              timestamp: Date.now()
            }]);
          }
        })
        .catch(() => {});
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
      text: `¡Encantada de conocerte, ${userName}! 😊\n\nYa tengo tus datos para poder enviarte:\n• 📅 Recordatorios de citas\n• 💳 Enlaces de pago\n• 📋 Seguimiento de tratamientos\n• 🏥 Información de la clínica\n\n¿En qué puedo ayudarte hoy?\n• 📅 Pedir cita\n• 💳 Consultar precios\n• 📱 Descargar app\n• ❓ Otra pregunta`,
      timestamp: Date.now()
    }]);
    
    setUserRegistered(true);
    setShowForm(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || !userRegistered) return;
    
    console.log('🔍 [ANA] Sending message:', { message: input, clinicId });
    
    const userMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/ana-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, clinicId })
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
        text: 'Lo siento, estoy teniendo problemas técnicos. Por favor, llama a la clínica.',
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
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format" 
              alt="Ana" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-white font-semibold">Ana</h1>
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
      </div>

      {/* Chat Messages - WhatsApp Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] bg-opacity-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"100\\" height=\\"100\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cdefs%3E%3Cpattern id=\\"grid\\" width=\\"100\\" height=\\"100\\" patternUnits=\\"userSpaceOnUse\\"%3E%3Cpath d=\\"M 100 0 L 0 0 0 100\\" fill=\\"none\\" stroke=\\"rgba(255,255,255,0.03)\\" stroke-width=\\"1\\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\\"100%\\" height=\\"100%\\" fill=\\"url(%23grid)\\" /%3E%3C/svg%3E")'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user' 
                ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm' 
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                msg.role === 'user' ? 'text-gray-500 justify-end' : 'text-gray-400'
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
                <path d="M19.07 4.93c-3.9-3.91-10.24-3.91-14.14 0-3.91 3.9-3.91 10.24 0 14.14 3.9 3.91 10.24 3.91 14.14 0 3.91-3.9 3.91-10.24 0-14.14zm-1.41 12.73c-3.12 3.12-8.19 3.12-11.31 0-3.12-3.12-3.12-8.19 0-11.31 3.12-3.12 8.19-3.12 11.31 0 3.12 3.12 3.12 8.19 0 11.31z"/>
                <circle cx="12" cy="12" r="3"/>
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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            </div>
            
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.48L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.48H1v1.5h1.7l-.85 1.48 1.3.75zm6.7-.75l1.48.85 1.48-.85-.85-1.48H14v-1.5h-2.05l.85-1.48L11 7l-1.48 1.48L8.05 7l-1.3.75.85 1.48H5v1.5h2.05l-.85 1.48zm8 0l1.48.85 1.48-.85-.85-1.48H22v-1.5h-2.05l.85-1.48L19 7l-1.48 1.48L16.05 7l-1.3.75.85 1.48H13v1.5h2.05l-.85 1.48z"/>
              </svg>
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-full transition ${
                input.trim() && !isTyping 
                  ? 'bg-[#0086ea] text-white hover:bg-[#007ab5]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Functional Quick Actions */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            <button 
              onClick={() => {
                setInput('quiero pedir cita');
                setTimeout(() => sendMessage(), 100);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 whitespace-nowrap hover:bg-gray-50 transition flex items-center gap-1"
            >
              <Calendar size={12} />
              Pedir cita
            </button>
            <button 
              onClick={() => {
                setInput('¿cuánto cuesta?');
                setTimeout(() => sendMessage(), 100);
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 whitespace-nowrap hover:bg-gray-50 transition flex items-center gap-1"
            >
              <Clock size={12} />
              Precios
            </button>
            <button 
              onClick={() => {
                // Detectar si es iOS o Android y abrir la store correspondiente
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);
                
                if (isIOS) {
                  window.open('https://apps.apple.com/app/fisiotool', '_blank');
                } else if (isAndroid) {
                  window.open('https://play.google.com/store/apps/details?id=com.fisiotool.app', '_blank');
                } else {
                  // Para desktop, abrir página web de descarga
                  window.open('https://fisiotool.com/descargar', '_blank');
                }
              }}
              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 whitespace-nowrap hover:bg-gray-50 transition flex items-center gap-1"
            >
              <Download size={12} />
              Descargar app
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
