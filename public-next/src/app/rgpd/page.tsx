'use client'
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, Globe, Sparkles, Scale, Fingerprint } from 'lucide-react';

export default function RgpdPage() {
  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />
      <nav style={navStyle}>
        <button onClick={() => window.history.back()} style={btnBack}><ArrowLeft size={18} /> Volver al sistema</button>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <header style={headerStyle}>
          <div style={iconBadgeStyle}><ShieldCheck size={32} color="#0066ff" /></div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '20px 0 10px' }}>Cumplimiento Normativo</h1>
          <p style={{ opacity: 0.5, fontSize: '14px' }}>Compromiso de Fisiotool LLC con el RGPD y la Seguridad Clínica</p>
        </header>

        <main style={contentStyle}>
          <div style={legalSection}>
            <h2 style={sectionTitle}><Scale size={18} color="#0066ff" /> 1. Acuerdo de Encargado (Art. 28)</h2>
            <p style={pStyle}>
              Al utilizar nuestra plataforma, se formaliza un contrato de <strong>Encargado del Tratamiento</strong>. Fisiotool LLC procesa los datos de salud únicamente bajo las instrucciones técnicas del profesional, quien mantiene la plena propiedad y soberanía sobre las historias clínicas de sus pacientes.
            </p>
          </div>

          <div style={legalSection}>
            <h2 style={sectionTitle}><Globe size={18} color="#0066ff" /> 2. Soberanía de Datos en la UE</h2>
            <p style={pStyle}>
              Aunque Fisiotool es una entidad con sede en EE. UU., garantizamos que los datos de salud de ciudadanos europeos se alojan exclusivamente en la infraestructura de <strong>Google Cloud en Bélgica (Región Europa)</strong>, cumpliendo con los estándares de seguridad física y lógica más exigentes.
            </p>
          </div>

          <div style={legalSection}>
            <h2 style={sectionTitle}><Sparkles size={18} color="#00ffcc" /> 3. Inteligencia Artificial Ética</h2>
            <p style={pStyle}>
              Nuestra IA "Ana" cumple con la <strong>EU AI Act</strong>. El procesamiento de síntomas se legitima mediante el Art. 9.2.h del RGPD. Garantizamos por contrato que los datos médicos no se utilizan para el entrenamiento de modelos de IA externos ni se comparten con terceros con fines comerciales.
            </p>
          </div>

          <div style={legalSection}>
            <h2 style={sectionTitle}><Fingerprint size={18} color="#0066ff" /> 4. Transferencias Internacionales</h2>
            <p style={pStyle}>
              La transferencia técnica de datos a nuestra matriz en Wyoming se encuentra blindada jurídicamente mediante la firma de <strong>Cláusulas Contractuales Tipo (Standard Contractual Clauses)</strong> aprobadas por la Comisión Europea, asegurando que tus datos tienen el mismo nivel de protección en EE. UU. que en España.
            </p>
          </div>

          <div style={stampStyle}>
            <CheckCircle2 size={16} /> Certificación de Cumplimiento para Fisioterapia y Osteopatía v1.2 (2025)
          </div>
        </main>
      </motion.div>
    </div>
  );
}

// --- ESTILOS MANTENIDOS Y OPTIMIZADOS ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', padding: '120px 20px 60px', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0,102,255,0.05) 0%, transparent 70%)', zIndex: 0 };
const cardStyle: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '60px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1 };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px', border: '1px solid rgba(0,102,255,0.2)' };
const contentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '30px' };
const legalSection: React.CSSProperties = { padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' };
const sectionTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#fff' };
const pStyle: React.CSSProperties = { opacity: 0.6, fontSize: '15px', lineHeight: '1.8', margin: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '30px', left: '30px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' };
const stampStyle: React.CSSProperties = { marginTop: '20px', padding: '20px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '16px', color: '#10b981', textAlign: 'center', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };