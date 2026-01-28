'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { THEME } from '../theme';
import { ActionButton } from '../components/Atoms';

interface Message {
  role: 'user' | 'ana';
  text: string;
  timestamp: number;
}

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const token = localStorage.getItem('fisio_token');
    if (!token) {
      setChat(prev => [...prev, { 
        role: 'ana', 
        text: "Sesión expirada. Por favor, vuelve a iniciar sesión.",
        timestamp: Date.now() 
      }]);
      return;
    }

    const userMsg: Message = { role: 'user', text: trimmedInput, timestamp: Date.now() };
    setChat(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: trimmedInput }),
        // credentials 'include' solo si el backend maneja Cookies de sesión/CORS específicos
        credentials: 'include' 
      });

      const data = await res.json().catch(() => ({ error: 'Error al procesar respuesta del servidor' }));

      if (!res.ok) {
        throw new Error(data.error || `Error HTTP ${res.status}`);
      }

      setChat(prev => [...prev, { 
        role: 'ana', 
        text: data.reply || "No recibí una respuesta clara.",
        timestamp: Date.now() 
      }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión desconocido';
      setChat(prev => [...prev, { 
        role: 'ana', 
        text: `⚠️ ERROR: ${errorMessage}`,
        timestamp: Date.now() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={containerStyle}>
      {/* Contenedor de mensajes */}
      <div ref={scrollRef} style={chatBoxStyle}>
        {chat.map((m) => (
          <div key={m.timestamp} style={{ 
            marginBottom: '15px', 
            textAlign: m.role === 'ana' ? 'left' : 'right' 
          }}>
            <div style={{ 
              ...bubbleStyle,
              background: m.role === 'ana' ? '#1e1e1e' : THEME.colors.primary,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px' }}>
            <Loader2 className="animate-spin" size={18} color={THEME.colors.primary} />
            <span style={{ fontSize: '12px', color: '#666' }}>Ana está pensando...</span>
          </div>
        )}
      </div>

      {/* Input de control */}
      <div style={inputContainerStyle}>
        <input 
          style={inputStyle}
          value={input}
          disabled={loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Esperando respuesta..." : "Escribe a Ana..."}
        />
        <ActionButton 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar'}
        </ActionButton>
      </div>
    </div>
  );
};

// Estilos extraídos para limpieza visual
const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '600px', 
  background: '#000', borderRadius: '20px', padding: '20px'
};

const chatBoxStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px'
};

const bubbleStyle: React.CSSProperties = {
  display: 'inline-block', padding: '12px 18px', borderRadius: '15px',
  color: '#fff', maxWidth: '80%', fontSize: '14px', lineHeight: '1.4'
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', alignItems: 'center'
};

const inputStyle: React.CSSProperties = {
  flex: 1, background: '#111', border: '1px solid #333', 
  padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none'
};