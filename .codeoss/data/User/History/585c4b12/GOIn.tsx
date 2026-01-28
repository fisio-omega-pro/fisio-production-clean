'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../theme';
import { ActionButton, InputField } from '../components/Atoms';

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: 'ana' | 'user'; text: string }[]>([
    { role: 'ana', text: 'Hola, soy tu consultora estratégica. ¿En qué puedo ayudarte a mejorar tu clínica hoy?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('fisio_token');
      // LLAMADA REAL AL BACKEND BLINDADO
      const res = await fetch('/api/chat/dashboard', { // El clinicId lo saca el backend del Token
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      
      if (data.reply) {
        setChat(prev => [...prev, { role: 'ana', text: data.reply }]);
      } else {
        throw new Error("Sin respuesta");
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'ana', text: "Lo siento, he tenido un problema de conexión. ¿Puedes repetir?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <div ref={scrollRef} style={styles.chatContainer}>
        <AnimatePresence>
          {chat.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: m.role === 'ana' ? 'flex-start' : 'flex-end'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '5px',
                flexDirection: m.role === 'ana' ? 'row' : 'row-reverse'
              }}>
                {m.role === 'ana' ? <Bot size={14} color={THEME.colors.primary} /> : <User size={14} color={THEME.colors.success} />}
                <span style={{ fontSize: '10px', fontWeight: 800, color: THEME.colors.text.disabled }}>
                  {m.role === 'ana' ? 'ANA ESTRATEGIA' : 'TÚ'}
                </span>
              </div>
              <div style={{ 
                background: m.role === 'ana' ? 'rgba(255,255,255,0.05)' : THEME.colors.primary, 
                padding: '15px 20px', 
                borderRadius: '18px', 
                borderTopLeftRadius: m.role === 'ana' ? '4px' : '18px',
                borderTopRightRadius: m.role === 'ana' ? '18px' : '4px',
                maxWidth: '80%', 
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#fff',
                border: m.role === 'ana' ? `1px solid ${THEME.colors.border}` : 'none'
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.5 }}>
              <Loader2 className="animate-spin" size={16} />
              <span style={{ fontSize: '12px' }}>Ana está analizando datos...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div style={styles.inputArea}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
          placeholder="Pregunta a Ana sobre gestión o estrategia..." 
          style={styles.input} 
          disabled={loading}
        />
        <ActionButton 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          style={{ borderRadius: '100px', height: '45px', width: '45px', padding: 0 }}
        >
          <Send size={18} />
        </ActionButton>
      </div>
    </div>
  );
};

const styles = {
  chatContainer: { flex: 1, overflowY: 'auto' as const, padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: `1px solid ${THEME.colors.border}`, marginBottom: '20px' },
  inputArea: { display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '100px', border: `1px solid ${THEME.colors.border}`, alignItems: 'center' },
  input: { flex: 1, background: 'transparent', border: 'none', padding: '10px 20px', color: '#fff', outline: 'none', fontSize: '14px' }
};