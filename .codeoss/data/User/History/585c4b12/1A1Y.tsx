import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { InputField, ActionButton } from '../components/Atoms';
import { THEME } from '../theme';
import { motion } from 'framer-motion';

export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  // Estado local simulado para el chat (en producción esto iría a hooks o backend)
  const [chat, setChat] = useState([
    { role: 'ana', text: 'Hola, soy tu consultora estratégica. ¿Qué analizamos hoy?' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [
        ...chat, 
        { role: 'user', text: input },
        { role: 'ana', text: 'Entendido, estoy procesando tu solicitud...' } // Respuesta simulada
    ];
    setChat(newMsgs);
    setInput("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <div style={{ 
        flex: 1, overflowY: 'auto', padding: '30px', 
        background: 'rgba(0,0,0,0.2)', borderRadius: '32px', 
        border: `1px solid ${THEME.colors.border}`, marginBottom: '20px' 
      }}>
        {chat.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            style={{ 
              marginBottom: '25px', 
              textAlign: m.role === 'ana' ? 'left' : 'right',
              display: 'flex', flexDirection: 'column',
              alignItems: m.role === 'ana' ? 'flex-start' : 'flex-end'
            }}
          >
            <span style={{ 
              color: m.role === 'ana' ? THEME.colors.primary : THEME.colors.success, 
              fontWeight: 800, fontSize: '11px', textTransform:'uppercase', 
              marginBottom:'8px', letterSpacing:'1px' 
            }}>
              {m.role === 'ana' ? 'Ana (Consultora)' : 'Tú'}
            </span>
            <div style={{ 
              background: m.role === 'ana' ? 'rgba(255,255,255,0.05)' : 'rgba(0,102,255,0.15)', 
              padding: '20px', borderRadius: '24px', 
              borderTopLeftRadius: m.role === 'ana' ? '4px' : '24px',
              borderTopRightRadius: m.role === 'ana' ? '24px' : '4px',
              maxWidth: '85%', lineHeight: '1.6', fontSize: '15px'
            }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '100px', border: `1px solid ${THEME.colors.border}` }}>
        <InputField 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
          placeholder="Pregunta a Ana sobre gestión o estrategia..." 
          style={{ margin: 0, borderRadius: '100px', border: 'none', background: 'transparent' }} 
        />
        <ActionButton onClick={handleSend} style={{ borderRadius: '100px', padding: '12px 24px' }} icon={<Send size={18} />}>
          ENVIAR
        </ActionButton>
      </div>
    </div>
  );
};