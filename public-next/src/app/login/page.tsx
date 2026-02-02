'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginFerrari() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

  const acceder = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/dashboard?id=${data.clinicId}`;
      } else {
        alert("Credenciales incorrectas.");
      }
    } catch (e) { alert("Error de conexión."); }
  };

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />
      <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} style={cardStyle}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
           <div style={logoBadge}><Sparkles color="#0066ff" size={28} /></div>
           <h2 style={{fontSize:'28px', fontWeight: 900, marginTop:'20px', letterSpacing: '-1px'}}>Acceso Élite</h2>
           <p style={{opacity:0.4, fontSize:'14px'}}>Entra a tu centro de mando FisioTool Pro</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'25px'}}>
          <div style={inputGroup}>
            <label style={labelStyle}>EMAIL PROFESIONAL</label>
            <div style={inputWrapper}><Mail size={18} style={iconStyle}/><input style={inputField} type="email" placeholder="doctor@tuclinica.com" onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>CONTRASEÑA</label>
            <div style={inputWrapper}><Lock size={18} style={iconStyle}/><input style={inputField} type="password" placeholder="••••••••" onChange={e => setPass(e.target.value)} /></div>
          </div>
          <button onClick={acceder} style={btnMain}>INICIAR SESIÓN <ArrowRight size={20}/></button>
        </div>

        <div style={footerStyle}>
          ¿No tienes una cuenta Pro? <a href="/setup" style={{color:'#0066ff', fontWeight:800, textDecoration:'none'}}>Comienza aquí</a>
        </div>
      </motion.div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.07) 0%, transparent 60%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '50px', backdropFilter: 'blur(30px)', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const logoBadge: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', border: '1px solid rgba(0,102,255,0.2)' };
const inputGroup: React.CSSProperties = { width: '100%' };
const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', marginTop: '8px' };
const iconStyle: React.CSSProperties = { position: 'absolute', left: '18px', opacity: 0.3 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 18px 18px 52px', borderRadius: '18px', color: '#fff', fontSize: '16px', outline: 'none' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(0,102,255,0.2)' };
const footerStyle: React.CSSProperties = { textAlign: 'center', fontSize: '13px', opacity: 0.5, marginTop: '40px' };