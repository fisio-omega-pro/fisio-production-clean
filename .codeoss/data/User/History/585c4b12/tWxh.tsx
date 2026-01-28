'use client';
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { THEME } from '../theme';
import { ActionButton } from '../components/Atoms';

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([
    { role: 'ana', text: 'Sistema reiniciado. Comprobando conexión... Escríbeme algo.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      // LLAMADA DIRECTA AL BYPASS
      const res = await fetch('/api/chat/ana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setChat(prev => [...prev, { role: 'ana', text: data.reply }]);
      
    } catch (err: any) {
      console.error(err);
      setChat(prev => [...prev, { role: 'ana', text: `❌ ERROR: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: '#000', borderRadius: '20px', padding: '20px' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: '15px', textAlign: m.role === 'ana' ? 'left' : 'right' }}>
            <div style={{ display: 'inline-block', padding: '12px 18px', borderRadius: '15px', background: m.role === 'ana' ? '#222' : '#0066ff', color: '#fff' }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input style={{ flex: 1, background: '#111', border: '1px solid #333', padding: '12px', borderRadius: '10px', color:'#fff' }} value={input} onChange={e => setInput(e.target.value)} />
        <ActionButton onClick={handleSend} disabled={loading}><Send size={18}/></ActionButton>
      </div>
    </div>
  );
};