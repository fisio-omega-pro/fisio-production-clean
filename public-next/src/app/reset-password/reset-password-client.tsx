'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/apiBase';

export default function ResetPasswordClient() {
  const sp = useSearchParams();
  const token = sp.get('token') || '';
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError('Token inválido o ausente.');
  }, [token]);

  const submit = async () => {
    setError(null);
    if (!token) return setError('Token inválido.');
    if (p1.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (p1 !== p2) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: p1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data?.error || 'Error cambiando contraseña.');
      setDone(true);
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
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={successBadge}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 20 }}>Contraseña actualizada</h2>
            <p style={{ opacity: 0.6, marginTop: 12 }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <a href="/login" style={linkStyle}>Ir al login</a>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={logoBadge}><Lock color="#0066ff" size={28} /></div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 20, letterSpacing: '-1px' }}>Nueva contraseña</h2>
              <p style={{ opacity: 0.45, marginTop: 10 }}>Elige una contraseña segura.</p>
            </div>

            {error && (
              <div style={errorBox}>
                <AlertCircle size={16} style={{ marginRight: 8 }} /> {error}
              </div>
            )}

            <label style={labelStyle}>CONTRASEÑA</label>
            <div style={inputWrapper}>
              <Lock size={18} style={iconStyle} />
              <input
                style={inputField}
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
              />
              <button type="button" onClick={() => setShow((s) => !s)} style={eyeButton}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={labelStyle}>REPETIR CONTRASEÑA</label>
            <div style={inputWrapper}>
              <Lock size={18} style={iconStyle} />
              <input
                style={inputField}
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>

            <button onClick={submit} disabled={loading} style={{ ...btnMain, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'} <ArrowRight size={18} />
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

const containerStyle: React.CSSProperties = {
  backgroundColor: '#030507',
  minHeight: '100vh',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
};
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.07) 0%, transparent 60%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '50px', backdropFilter: 'blur(30px)', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const logoBadge: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', border: '1px solid rgba(0,102,255,0.2)' };
const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 16 };
const iconStyle: React.CSSProperties = { position: 'absolute', left: 18, opacity: 0.3 };
const eyeButton: React.CSSProperties = { position: 'absolute', right: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 52px', borderRadius: '18px', color: '#fff', fontSize: '16px', outline: 'none' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '18px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', boxShadow: '0 20px 40px rgba(0,102,255,0.2)' };
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', opacity: 0.6, marginTop: 20 };
const errorBox: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', marginBottom: 18 };
const successBadge: React.CSSProperties = { display: 'inline-flex', padding: 20, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)' };
const linkStyle: React.CSSProperties = { display: 'inline-block', marginTop: 22, color: '#0066ff', textDecoration: 'none', fontWeight: 800 };

