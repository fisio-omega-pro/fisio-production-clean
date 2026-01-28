'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Globe, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export default function RgpdPage() {
  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />
      <nav style={navStyle}>
        <button onClick={() => window.history.back()} style={btnBack}><ArrowLeft size={18} /> Volver</button>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <header style={headerStyle}>
          <div style={iconBadgeStyle}><ShieldCheck size={32} color="#0066ff" /></div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '20px 0 10px' }}>Protección de Datos Pro</h1>
          <p style={{ opacity: 0.5, fontSize: '14px' }}>Protocolo de Seguridad v1.1 - Grado Médico (Bélgica, UE)</p>
        </header>

        <main style={contentStyle}>
          <div style={legalSection}>
            <h2 style={sectionTitle}><Lock size={18} color="#0066ff" /> 1. El Rol de FisioTool</h2>
            <p style={pStyle}>Actuamos como Encargado del Tratamiento. La clínica mantiene la propiedad total y soberana de los expedientes.</p>
          </div>
          <div style={legalSection}>
            <h2 style={sectionTitle}><Globe size={18} color="#0066ff" /> 2. Cifrado y Ubicación</h2>
            <p style={pStyle}>Información cifrada en Google Cloud Bélgica. Aplicamos seguridad de grado bancario AES-256.</p>
          </div>
          <div style={stampStyle}>
            <CheckCircle2 size={16} /> Verificado para Clínicas 2025
          </div>
        </main>
      </motion.div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', padding: '120px 20px 60px', fontFamily: 'Inter, sans-serif', position: 'relative' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0,102,255,0.05) 0%, transparent 70%)', zIndex: 0 };
const cardStyle: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '60px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1 };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px' };
const contentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalSection: React.CSSProperties = { padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' };
const sectionTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' };
const pStyle: React.CSSProperties = { opacity: 0.6, fontSize: '15px' };
const navStyle: React.CSSProperties = { position: 'fixed', top: '30px', left: '30px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const stampStyle: React.CSSProperties = { padding: '20px', background: 'rgba(16,185,129,0.05)', borderRadius: '16px', color: '#10b981', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };