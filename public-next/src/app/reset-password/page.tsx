'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_BASE = "https://fisio-backend-omega-740657183492.europe-west1.run.app";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setStatus('error');
      setMessage('Token inválido o ausente');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    // Validaciones
    if (!password || !confirmPassword) {
      setStatus('error');
      setMessage('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage('Contraseña actualizada exitosamente');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al resetear la contraseña');
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
            <h2 style={{fontSize:'24px', fontWeight: 900, marginTop:'20px', color:'#10b981'}}>¡Contraseña Actualizada!</h2>
            <p style={{opacity:0.6, fontSize:'14px', lineHeight:'1.6', marginTop:'15px'}}>
              Tu contraseña ha sido cambiada exitosamente
            </p>
            <p style={{opacity:0.4, fontSize:'13px', marginTop:'20px'}}>
              Serás redirigido al login en 3 segundos...
            </p>
            <a href="/login" style={backLink}>Ir al login ahora</a>
          </div>
        ) : (
          // PANTALLA DE RESETEO
          <>
            <div style={{textAlign:'center', marginBottom:'40px'}}>
              <div style={logoBadge}><Lock color="#0066ff" size={28} /></div>
              <h2 style={{fontSize:'28px', fontWeight: 900, marginTop:'20px', letterSpacing: '-1px'}}>Nueva Contraseña</h2>
              <p style={{opacity:0.4, fontSize:'14px', marginTop:'10px'}}>
                Ingresa tu nueva contraseña segura
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
                <label style={labelStyle}>NUEVA CONTRASEÑA</label>
                <div style={inputWrapper}>
                  <Lock size={18} style={iconStyle}/>
                  <input 
                    style={inputField} 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={eyeButton}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>CONFIRMAR CONTRASEÑA</label>
                <div style={inputWrapper}>
                  <Lock size={18} style={iconStyle}/>
                  <input 
                    style={inputField} 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSubmit} 
                disabled={status === 'loading' || !token}
                style={{
                  ...btnMain,
                  opacity: (status === 'loading' || !token) ? 0.6 : 1,
                  cursor: (status === 'loading' || !token) ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'loading' ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'} <ArrowRight size={20}/>
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
const eyeButton: React.CSSProperties = { position: 'absolute', right: '18px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 52px', borderRadius: '18px', color: '#fff', fontSize: '16px', outline: 'none' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(0,102,255,0.2)', transition: 'all 0.3s' };
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', opacity: 0.5, marginTop: '40px' };
const errorBox: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '15px', marginBottom: '20px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center' };
const backLink: React.CSSProperties = { display: 'inline-block', marginTop: '30px', color: '#0066ff', textDecoration: 'none', fontWeight: 800, fontSize: '14px' };
