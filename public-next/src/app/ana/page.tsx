'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, Calendar, Download, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AnaChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicId = searchParams.get('ref');
  const [messages, setMessages] = useState([
    { role: 'ana', text: '¡Hola! Soy Ana, asistente de recepción. ¿En qué puedo ayudarte?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    if (clinicId) {
      // Obtener nombre de la clínica
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/clinic-info?ref=${clinicId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setClinicName(data.nombre);
            setMessages(prev => [{
              role: 'ana',
              text: `¡Hola! Soy Ana, asistente de ${data.nombre}. ¿En qué puedo ayudarte?`,
              timestamp: Date.now()
            }]);
          }
        })
        .catch(() => {});
    }
  }, [clinicId]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
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
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ana',
          text: data.response,
          timestamp: Date.now()
        }]);
      }
    } catch (e) {
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
      {/* Header */}
      <div className="bg-[#111113] border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white/5 transition"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageCircle size={20} className="text-blue-500" />
              </div>
              <div>
                <h1 className="text-white font-bold">Ana</h1>
                <p className="text-xs text-gray-400">Asistente de {clinicName || 'la clínica'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            En línea
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-[#1a1a1c] border border-white/10 text-gray-200'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#111113] border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs whitespace-nowrap hover:bg-blue-500/30 transition">
              <Calendar size={14} className="inline mr-1" />
              Ver agenda
            </button>
            <button className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs whitespace-nowrap hover:bg-green-500/30 transition">
              <Clock size={14} className="inline mr-1" />
              Pedir cita
            </button>
            <button className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs whitespace-nowrap hover:bg-purple-500/30 transition">
              <Download size={14} className="inline mr-1" />
              Descargar app
            </button>
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-[#0a0b10] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
