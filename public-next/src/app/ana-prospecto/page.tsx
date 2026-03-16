'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, TrendingUp, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';

export default function AnaProspectoPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [userRegistered, setUserRegistered] = useState(false);

  // Cargar persistencia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('ana_prospecto_name');
      const savedEmail = localStorage.getItem('ana_prospecto_email');
      
      if (savedName && savedEmail) {
        setUserName(savedName);
        setUserEmail(savedEmail);
        setUserRegistered(true);
        setShowForm(false);
        
        // Mensaje de bienvenida
        setMessages([{
          role: 'ana',
          text: `¡Hola de nuevo ${savedName}! 👋 ¿En qué más puedo ayudarte sobre FisioTool Pro?`,
          timestamp: Date.now()
        }]);
      }
    }
  }, []);

  const handleUserRegistration = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('Por favor, introduce tu nombre y email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert('Por favor, introduce un email válido');
      return;
    }

    setUserRegistered(true);
    setShowForm(false);

    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ana_prospecto_name', userName);
      localStorage.setItem('ana_prospecto_email', userEmail);
    }

    // Mensaje de bienvenida
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/public/ana-prospecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hola',
          userName,
          userEmail
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([{
          role: 'ana',
          text: data.response,
          timestamp: Date.now()
        }]);
      }
    } catch (e) {
      console.error('Error:', e);
      setMessages([{
        role: 'ana',
        text: `¡Hola ${userName}! 👋 Soy Ana, tu asesora de FisioTool Pro. ¿Qué te gustaría saber?`,
        timestamp: Date.now()
      }]);
    }
    
    setIsTyping(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping || !userRegistered) return;

    const userMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/public/ana-prospecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          userName,
          userEmail
        })
      });

      const data = await response.json();
      
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
      console.error('Error:', e);
      setMessages(prev => [...prev, {
        role: 'ana',
        text: 'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo.',
        timestamp: Date.now()
      }]);
    }
    
    setIsTyping(false);
  };

  const quickQuestions = [
    { icon: TrendingUp, text: '¿Cuánto cuesta?', query: 'precio' },
    { icon: Sparkles, text: '¿Qué hace Ana?', query: 'qué es fisiotool' },
    { icon: Users, text: 'Casos de éxito', query: 'casos de éxito' },
    { icon: Zap, text: 'Quiero probarlo', query: 'quiero registrarme' }
  ];

  const handleQuickQuestion = (query) => {
    setInput(query);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="text-purple-600" size={28} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Ana - Asesora FisioTool Pro</h1>
              <p className="text-purple-100 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Experta en Ventas • Disponible 24/7
              </p>
            </div>
          </div>
          <a 
            href="https://www.fisiotool.com" 
            target="_blank"
            className="hidden md:flex items-center gap-2 bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-purple-50 transition-all shadow-lg"
          >
            Ir a FisioTool.com
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 py-4">
          {!userRegistered && messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Sparkles className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                ¡Hola! Soy Ana 👋
              </h2>
              <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
                Tu asesora personal de FisioTool Pro. Estoy aquí para resolver todas tus dudas sobre cómo transformar tu clínica de fisioterapia.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="text-green-400 mx-auto mb-2" size={24} />
                  <p className="text-white text-sm font-semibold">Precios claros</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="text-green-400 mx-auto mb-2" size={24} />
                  <p className="text-white text-sm font-semibold">Sin permanencia</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="text-green-400 mx-auto mb-2" size={24} />
                  <p className="text-white text-sm font-semibold">30 días gratis</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="text-green-400 mx-auto mb-2" size={24} />
                  <p className="text-white text-sm font-semibold">Soporte 24/7</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                  : 'bg-white text-gray-800'
              }`}>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        {userRegistered && messages.length <= 2 && (
          <div className="mb-4">
            <p className="text-purple-200 text-sm mb-3 text-center">Preguntas rápidas:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q.query)}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-white/20"
                >
                  <q.icon size={16} />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        {showForm ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              Empecemos a hablar
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/30"
              />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Tu email"
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/30"
              />
              <button
                onClick={handleUserRegistration}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Empezar a chatear con Ana
              </button>
              <p className="text-purple-200 text-xs text-center">
                No spam. Solo información valiosa sobre FisioTool Pro.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/30"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
