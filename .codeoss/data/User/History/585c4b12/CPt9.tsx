'use client';
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { THEME } from '../theme';
import { ActionButton } from '../components/Atoms';

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

const handleSend = async () => {
  if (!input.trim() || loading) return;
  const msg = input;
  setInput("");
  setChat(prev => [...prev, { role: 'user', text: msg }]);
  setLoading(true);

  try {
    const token = localStorage.getItem('fisio_token');
    
    // 🚀 PETICIÓN BLINDADA PARA GOOGLE CLOUD PROXY
    const res = await fetch('/api/chat/dashboard', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: msg }),
      credentials: 'include' // <--- ESTO ES LO QUE ABRE EL TÚNEL DE GOOGLE
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Error ${res.status}: ${errorData.error || 'Fallo en motor Ana'}`);
    }

    const data = await res.json();
    setChat(prev => [...prev, { role: 'ana', text: data.reply }]);
  } catch (err: any) {
    console.error("Error crítico de red:", err);
    setChat(prev => [...prev, { role: 'ana', text: `⚠️ ERROR DE SISTEMA: No se pudo contactar con el motor IA. Verifique su sesión de Google.` }]);
  } finally {
    setLoading(false);
  }
};

      const data = await res.json();

      if (!res.ok) {
        // 🚨 SI FALLA, LANZAMOS ERROR CON EL STATUS
        throw new Error(`HTTP ${res.status}: ${data.error || 'Error desconocido'}`);
      }

      setChat(prev => [...prev, { role: 'ana', text: data.reply }]);
    } catch (err: any) {
      console.error("Fallo en chat:", err);
      setChat(prev => [...prev, { role: 'ana', text: `⚠️ ERROR DIAGNÓSTICO: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: '#000', borderRadius: '20px', padding: '20px' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: '15px', textAlign: m.role === 'ana' ? 'left' : 'right' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '12px 18px', 
              borderRadius: '15px', 
              background: m.role === 'ana' ? '#1e1e1e' : THEME.colors.primary,
              color: '#fff',
              maxWidth: '80%',
              fontSize: '14px'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <Loader2 className="animate-spin" size={20} color={THEME.colors.primary} />}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          style={{ flex: 1, background: '#111', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#fff' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe a Ana..."
        />
        <ActionButton onClick={handleSend}>Enviar</ActionButton>
      </div>
    </div>
  );
};