'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';

export const AsistenteView = () => {
  const [messages, setMessages] = useState([{ role: 'ana', text: 'CONEXIÓN DE PRUEBA ACTIVA. Hola, soy Ana. ¿En qué puedo ayudarte?' }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // 🛡️ LLAMADA A RUTA PÚBLICA SIN CABECERAS (Para evitar el bloqueo del túnel)
      const res = await fetch('/api/chat/ana-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ana', text: data.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'ana', text: "⚠️ Error: El túnel de Google sigue bloqueando el POST. Intenta refrescar el Web Preview." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Bot size={18} color="#fff" /></div>
        <span className="text-xs font-bold text-white uppercase tracking-widest">Modo Diagnóstico Ana</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'ana' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'ana' ? 'bg-white/5 text-gray-200' : 'bg-blue-600 text-white'}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="text-blue-500 text-[10px] font-bold animate-pulse">ANA PENSANDO...</div>}
      </div>
      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-3">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={(e)=>e.key === 'Enter' && handleSend()} placeholder="Escribe aquí..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none" />
        <button onClick={handleSend} className="bg-blue-600 p-2 rounded-xl text-white"><Send size={18} /></button>
      </div>
    </div>
  );
};
