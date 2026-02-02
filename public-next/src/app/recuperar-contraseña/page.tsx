'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiBase';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim()) return setError('Introduce tu email.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data?.error || 'Error enviando el email.');
      setSent(true);
    } catch (_) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={successBadge}><CheckCircle2 size={48} color="#10b981" /></div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 20 }}>Revisa tu email</h2>
            <p style={{ opacity: 0.6, marginTop: 12, lineHeight: 1.6 }}>
              Si el email existe en el sistema, recibirás un enlace para restablecer tu contraseña.
            </p>
            <a href="/login" style={linkStyle}>Volver al login</a>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={logoBadge}><Mail color="#0066ff" size={28} /></div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 20, letterSpacing: '-1px' }}>Recuperar contraseña</h2>
              <p style={{ opacity: 0.45, marginTop: 10 }}>Te enviaremos un enlace válido 1 hora.</p>
            </div>

            {error && (
              <div style={errorBox}>
                <AlertCircle size={16} style={{ marginRight: 8 }} /> {error}
              </div>
            )}

            <label style={labelStyle}>EMAIL</label>
            <div style={inputWrapper}>
              <Mail size={18} style={iconStyle} />
              <input
                style={inputField}
                type="email"
                placeholder="doctor@tuclinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>

            <button onClick={submit} disabled={loading} style={{ ...btnMain, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'} <ArrowRight size={18} />
            </button>

            <div style={footerStyle}>
              <a href="/login" style={{ color: '#0066ff', fontWeight: 800, textDecoration: 'none' }}>Volver</a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.07) 0%, transparent 60%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '50px', backdropFilter: 'blur(30px)', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const logoBadge: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', border: '1px solid rgba(0,102,255,0.2)' };
const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 20 };
const iconStyle: React.CSSProperties = { position: 'absolute', left: 18, opacity: 0.3 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 18px 18px 52px', borderRadius: '18px', color: '#fff', fontSize: '16px', outline: 'none' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '18px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', boxShadow: '0 20px 40px rgba(0,102,255,0.2)' };
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', opacity: 0.6, marginTop: 20 };
const errorBox: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', marginBottom: 18 };
const successBadge: React.CSSProperties = { display: 'inline-flex', padding: 20, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)' };
const linkStyle: React.CSSProperties = { display: 'inline-block', marginTop: 22, color: '#0066ff', textDecoration: 'none', fontWeight: 800 };

'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = "https://fisio-backend-omega-740657183492.europe-west1.run.app";

export default function RecuperarContraseña() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Por favor ingresa tu email');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage('Te hemos enviado un email con las instrucciones para recuperar tu contraseña');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al enviar el email');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Error de conexión. Intenta de nuevo.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />
      <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} style={cardStyle}>
        {status === 'success' ? (
          // PANTALLA DE ÉXITO
          <div style={{textAlign:'center'}}>
            <div style={successBadge}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <h2 style={{fontSize:'24px', fontWeight: 900, marginTop:'20px', color:'#10b981'}}>¡Email Enviado!</h2>
            <p style={{opacity:0.6, fontSize:'14px', lineHeight:'1.6', marginTop:'15px'}}>
              {message}
            </p>
            <p style={{opacity:0.4, fontSize:'13px', marginTop:'20px'}}>
              Revisa tu bandeja de entrada (y spam por si acaso)
            </p>
            <a href="/login" style={backLink}>Volver al login</a>
          </div>
        ) : (
          // PANTALLA DE SOLICITUD
          <>
            <div style={{textAlign:'center', marginBottom:'40px'}}>
              <div style={logoBadge}><Mail color="#0066ff" size={28} /></div>
              <h2 style={{fontSize:'28px', fontWeight: 900, marginTop:'20px', letterSpacing: '-1px'}}>Recuperar Contraseña</h2>
              <p style={{opacity:0.4, fontSize:'14px', marginTop:'10px'}}>
                Ingresa tu email y te enviaremos instrucciones
              </p>
            </div>

            {status === 'error' && (
              <div style={errorBox}>
                <AlertCircle size={16} style={{marginRight:'8px'}} />
                {message}
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:'25px'}}>
              <div style={inputGroup}>
                <label style={labelStyle}>EMAIL PROFESIONAL</label>
                <div style={inputWrapper}>
                  <Mail size={18} style={iconStyle}/>
                  <input 
                    style={inputField} 
                    type="email" 
                    placeholder="doctor@tuclinica.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSubmit} 
                disabled={status === 'loading'}
                style={{
                  ...btnMain,
                  opacity: status === 'loading' ? 0.6 : 1,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'} <ArrowRight size={20}/>
              </button>
            </div>

            <div style={footerStyle}>
              ¿Recordaste tu contraseña? <a href="/login" style={{color:'#0066ff', fontWeight:800, textDecoration:'none'}}>Volver al login</a>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.07) 0%, transparent 60%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '50px', backdropFilter: 'blur(30px)', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const logoBadge: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', border: '1px solid rgba(0,102,255,0.2)' };
const successBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)' };
const inputGroup: React.CSSProperties = { width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', marginTop: '8px' };
const iconStyle: React.CSSProperties = { position: 'absolute', left: '18px', opacity: 0.3 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 18px 18px 52px', borderRadius: '18px', color: '#fff', fontSize: '16px', outline: 'none' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(0,102,255,0.2)', transition: 'all 0.3s' };
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', opacity: 0.5, marginTop: '40px' };
const errorBox: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '15px', marginBottom: '20px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center' };
const backLink: React.CSSProperties = { display: 'inline-block', marginTop: '30px', color: '#0066ff', textDecoration: 'none', fontWeight: 800, fontSize: '14px' };
