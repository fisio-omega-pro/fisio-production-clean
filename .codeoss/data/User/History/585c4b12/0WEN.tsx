'use client';
import React, { useState, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';
import { THEME } from '../theme';
import { ActionButton } from '../components/Atoms';

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🪄 EFECTO WOW: Mensaje de bienvenida automático
  useEffect(() => {
    if (chat.length === 0) {
      setChat([{ role: 'ana', text: 'Hola, soy Ana. He analizado los datos de tu clínica y estoy lista para ayudarte a escalar. ¿Por dónde empezamos hoy?' }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput("");
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('fisio_token');
      
      // Intentamos llamar a la ruta debug si falla la normal
      const res = await fetch('/api/chat/debug', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo en motor");
      
      setChat(prev => [...prev, { role: 'ana', text: data.reply }]);
    } catch (err: any) {
      setChat(prev => [...prev, { role: 'ana', text: `⚠️ ERROR DE SISTEMA: ${err.message}. Verifique su conexión con Google Cloud.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '650px', background: '#0a0a0a', borderRadius: '32px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: '20px', textAlign: m.role === 'ana' ? 'left' : 'right' }}>
            {m.role === 'ana' && <div style={{fontSize:'10px', fontWeight:900, color:'#3b82f6', marginBottom:'5px', marginLeft:'5px'}}>ANA ESTRATEGIA</div>}
            <div style={{ 
              display: 'inline-block', padding: '15px 20px', borderRadius: '20px', 
              background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : '#3b82f6',
              color: '#fff', maxWidth: '85%', fontSize: '15px', lineHeight: '1.6',
              border: m.role === 'ana' ? '1px solid rgba(255,255,255,0.05)' : 'none'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{display:'flex', gap:'10px', alignItems:'center', opacity:0.5}}><Loader2 className="animate-spin" size={16}/> <span style={{fontSize:'12px'}}>Ana está pensando...</span></div>}
      </div>
      <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <input 
          style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 20px', color: '#fff', outline: 'none' }}
          value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="¿Cómo puedo mejorar mi rentabilidad?"
        />
        <button onClick={handleSend} style={{background:'#3b82f6', color:'#fff', border:'none', width:'45px', height:'45px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};