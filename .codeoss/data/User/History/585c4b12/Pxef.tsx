'use client';
import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * Vista del Asistente (Ana)
 * Maneja la interacción con el motor de IA a través de una ruta pública optimizada.
 */
export const AsistenteView: React.FC = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🪄 EFECTO WOW: Mensaje de bienvenida automático
  useEffect(() => {
    if (chat.length === 0) {
      setChat([{ 
        role: 'ana', 
        text: 'Hola, soy Ana. He analizado los datos de tu clínica y estoy lista para ayudarte a escalar. ¿Por dónde empezamos hoy?' 
      }]);
    }
  }, [chat.length]);

  /**
   * Envía el mensaje al servidor utilizando la ruta pública simplificada.
   * Eliminamos la dependencia de tokens JWT para maximizar compatibilidad con túneles.
   */
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const msg = input;
    setInput("");
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      // LLAMADA SIMPLIFICADA A RUTA PÚBLICA (Evita bloqueos de CORS/Auth)
      const res = await fetch('/api/chat/ana', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ message: msg })
      });

      if (!res.ok) {
        throw new Error(`Servidor respondió con status: ${res.status}`);
      }

      const data = await res.json();
      
      setChat(prev => [...prev, { 
        role: 'ana', 
        text: data.reply || "Recibido, pero la respuesta está vacía." 
      }]);

    } catch (err: any) {
      console.error("Error en comunicación con Ana:", err);
      setChat(prev => [...prev, { 
        role: 'ana', 
        text: "⚠️ Error de conexión con el motor IA. Verifique que el servidor esté corriendo y accesible." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '650px', 
      background: '#0a0a0a', 
      borderRadius: '32px', 
      padding: '30px', 
      border: '1px solid rgba(255,255,255,0.05)' 
    }}>
      {/* Contenedor de Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: '20px', textAlign: m.role === 'ana' ? 'left' : 'right' }}>
            {m.role === 'ana' && (
              <div style={{
                fontSize:'10px', 
                fontWeight:900, 
                color:'#3b82f6', 
                marginBottom:'5px', 
                marginLeft:'5px',
                letterSpacing: '0.5px'
              }}>
                ANA ESTRATEGIA
              </div>
            )}
            <div style={{ 
              display: 'inline-block', 
              padding: '15px 20px', 
              borderRadius: '20px', 
              background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : '#3b82f6',
              color: '#fff', 
              maxWidth: '85%', 
              fontSize: '15px', 
              lineHeight: '1.6',
              border: m.role === 'ana' ? '1px solid rgba(255,255,255,0.05)' : 'none',
              boxShadow: m.role === 'ana' ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.2)'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{display:'flex', gap:'10px', alignItems:'center', opacity:0.6}}>
            <Loader2 className="animate-spin" size={16} color="#3b82f6"/> 
            <span style={{fontSize:'12px', color: '#fff'}}>Ana está analizando los datos...</span>
          </div>
        )}
      </div>

      {/* Input de Usuario */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        background: 'rgba(255,255,255,0.02)', 
        padding: '10px', 
        borderRadius: '100px', 
        border: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <input 
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            padding: '10px 20px', 
            color: '#fff', 
            outline: 'none',
            fontSize: '14px'
          }}
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="¿Cómo puedo mejorar mi rentabilidad?"
          disabled={loading}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#1a1a1a' : '#3b82f6', 
            color:'#fff', 
            border:'none', 
            width:'45px', 
            height:'45px', 
            borderRadius:'50%', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};