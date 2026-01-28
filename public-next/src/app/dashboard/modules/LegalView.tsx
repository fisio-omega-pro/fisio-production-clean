'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, ShieldCheck, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton } from '../components/Atoms';

export const LegalView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: 'lex' | 'user'; text: string }[]>([
    { role: 'lex', text: 'Bienvenido a la Asesoría Jurídica y Fiscal. Soy Lex. Superviso tu estructura LLC y el cumplimiento del RGPD. ¿Qué te preocupa hoy?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput("");
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('fisio_token');
      const res = await fetch('/api/chat/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg, agent: 'lex' })
      });

      const data = await res.json();
      if (data.reply) {
        setChat(prev => [...prev, { role: 'lex', text: data.reply }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'lex', text: "Error de conexión con la base jurídica." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px', height: '70vh' }}>
      
      {/* SIDEBAR DE ALERTAS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={cardStyle}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#10b981', fontWeight:800, fontSize:'12px', marginBottom:'10px'}}>
            <ShieldCheck size={16} /> ESTRUCTURA OK
          </div>
          <div style={{fontSize:'11px', opacity:0.6}}>Tu LLC en Wyoming está activa y al día.</div>
        </div>

        <div style={{...cardStyle, borderLeft:'4px solid #f59e0b'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#f59e0b', fontWeight:800, fontSize:'12px', marginBottom:'10px'}}>
            <AlertTriangle size={16} /> PRÓXIMO IMPUESTO
          </div>
          <div style={{fontSize:'14px', fontWeight:900, marginBottom:'5px'}}>IVA Trimestral (OSS)</div>
          <div style={{fontSize:'11px', opacity:0.6}}>Vence el 20 de Abril. Lex está recopilando las facturas de Stripe.</div>
        </div>

        <div style={cardStyle}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', color:'#3b82f6', fontWeight:800, fontSize:'12px', marginBottom:'10px'}}>
            <FileText size={16} /> FORMULARIO 5472
          </div>
          {/* CORRECCIÓN APLICADA AQUÍ: &gt; en lugar de > */}
          <div style={{fontSize:'11px', opacity:0.6}}>Pendiente para Abril 2026. Recuerda guardar facturas de gastos &gt;$500.</div>
        </div>
      </div>

      {/* CHAT CON LEX */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', display:'flex', alignItems:'center', gap:'10px' }}>
          <Scale size={20} color="#d4af37" />
          <span style={{fontWeight:700, color:'#d4af37'}}>SALA DE CONSULTA JURÍDICA</span>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {chat.map((m, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '20px', textAlign: m.role === 'lex' ? 'left' : 'right' }}
            >
              <div style={{ 
                display: 'inline-block', padding: '15px 20px', borderRadius: '18px', 
                background: m.role === 'lex' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                color: m.role === 'lex' ? '#d4af37' : '#fff',
                border: m.role === 'lex' ? '1px solid rgba(212,175,55,0.2)' : 'none',
                maxWidth: '80%', lineHeight: '1.6', fontSize: '14px'
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && <div style={{padding:'20px', opacity:0.5, fontSize:'12px'}}><Loader2 className="animate-spin" size={14}/> Consultando jurisprudencia...</div>}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ej: ¿Tengo que cobrar IVA a un cliente de Alemania?"
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', padding: '12px 20px', borderRadius: '100px', color: '#fff', outline: 'none' }}
            />
            <button onClick={handleSend} style={{ width:'45px', height:'45px', borderRadius:'50%', background:'#d4af37', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Send size={18} color="#000" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
};
