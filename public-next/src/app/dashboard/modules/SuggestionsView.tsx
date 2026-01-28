'use client';
import React, { useState } from 'react';
import { Lightbulb, Send, CheckCircle2 } from 'lucide-react';

export const SuggestionsView = () => {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if(!text.trim()) return;
    // Aquí iría la llamada a API para guardar el feedback
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setText('');
    }, 3000);
  };

  return (
    <div style={{maxWidth: '600px', margin: '0 auto', paddingTop: '40px'}}>
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <div style={{width:'60px', height:'60px', background:'rgba(236, 72, 153, 0.1)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
           <Lightbulb size={30} color="#ec4899" />
        </div>
        <h2 style={{fontSize:'28px', fontWeight:900, color:'#fff', marginBottom:'10px'}}>Tu Voz Cuenta</h2>
        <p style={{color:'rgba(255,255,255,0.5)', lineHeight:'1.6'}}>
          FisioTool Pro se construye contigo. ¿Qué echas en falta? ¿Qué mejorarías?<br/>
          Nuestro equipo de ingeniería lee cada mensaje.
        </p>
      </div>

      <div style={{background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px', padding:'30px'}}>
        {sent ? (
          <div style={{textAlign:'center', padding:'40px 0', color:'#10b981'}}>
            <CheckCircle2 size={40} style={{margin:'0 auto 20px'}} />
            <h3 style={{fontSize:'20px', fontWeight:800}}>¡Recibido! Gracias por tu idea.</h3>
          </div>
        ) : (
          <>
            <textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ej: Me gustaría poder exportar las facturas en PDF con un clic..."
              style={{width:'100%', height:'150px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', color:'#fff', padding:'20px', fontSize:'14px', outline:'none', resize:'none'}}
            />
            <button 
              onClick={handleSubmit}
              style={{width:'100%', marginTop:'20px', background:'#ec4899', border:'none', padding:'16px', borderRadius:'14px', color:'#fff', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}
            >
              <Send size={18} /> ENVIAR SUGERENCIA
            </button>
          </>
        )}
      </div>
    </div>
  );
};
