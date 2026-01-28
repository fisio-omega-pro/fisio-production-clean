'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, ArrowLeft, CheckCircle2, Globe, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA AZUL) */}
      <div style={glowBlue} />
      
      {/* NAV DE RETORNO */}
      <nav style={navStyle}>
        <Link href="/" style={btnBack}>
          <ArrowLeft size={18} /> Volver a la central
        </Link>
      </nav>

      <main style={mainContent}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          style={docCard}
        >
          {/* CABECERA */}
          <header style={headerStyle}>
            <div style={iconBadge}><ShieldCheck size={40} color="#0066ff" /></div>
            <h1 style={titleStyle}>Privacidad y Seguridad <br/><span style={gradientText}>Grado Médico</span></h1>
            <p style={subtitleStyle}>Protocolo de protección de datos personales y de salud asistida por IA.</p>
          </header>

          {/* CUERPO LEGAL */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Lock size={20} color="#0066ff" /> 1. Responsable y Encargado</h2>
              <p style={pStyle}>
                El titular de la clínica es el <strong>Responsable del Tratamiento</strong>. FISIOTOOL actúa como <strong>Encargado del Tratamiento</strong> (Art. 28 RGPD), proporcionando el entorno seguro y la IA Ana para gestionar la agenda.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Cpu size={20} color="#0066ff" /> 2. Interacción con la IA</h2>
              <p style={pStyle}>
                Al usar FisioTool, el paciente interactúa con la IA Ana (Google Vertex AI). Los síntomas y motivos de consulta se procesan bajo el Art. 9.2.h del RGPD para fines de asistencia sanitaria. Los datos nunca se utilizan para entrenar modelos públicos.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Globe size={20} color="#0066ff" /> 3. Ubicación y Cifrado</h2>
              <p style={pStyle}>
                Toda la información reside en servidores de Google Cloud dentro de la <strong>Unión Europea (Región: Bélgica)</strong>. Aplicamos cifrado de extremo a extremo y protocolos AES-256 en el almacenamiento de las historias clínicas.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Eye size={20} color="#0066ff" /> 4. Tus Derechos (ARCO+)</h2>
              <p style={pStyle}>
                Como titular de los datos, el paciente puede ejercer sus derechos de acceso, rectificación, supresión y oposición directamente a través de la recepción de su clínica o solicitándolo a nuestro equipo técnico.
              </p>
            </div>
          </section>

          {/* SELLO DE VERIFICACIÓN */}
          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Cumplimiento Normativo v1.2</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Verificado según el RGPD de la Unión Europea y la Ley de IA.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS
      </footer>
    </div>
  );
}

// --- ESTILOS SUPREME (CORREGIDOS) ---
const pageContainer: React.CSSProperties = { 
  backgroundColor: '#020305', 
  minHeight: '100vh', 
  color: '#fff', 
  fontFamily: 'Inter, sans-serif', 
  position: 'relative', 
  overflowX: 'hidden' 
};

const glowBlue: React.CSSProperties = { 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '600px', 
  background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.06) 0%, transparent 70%)', 
  zIndex: 0 
};

const navStyle: React.CSSProperties = { 
  position: 'fixed', 
  top: '40px', 
  left: '40px', 
  zIndex: 100 
};

const btnBack: React.CSSProperties = { 
  background: 'rgba(255,255,255,0.03)', 
  border: '1px solid rgba(255,255,255,0.1)', 
  color: '#fff', 
  padding: '12px 24px', 
  borderRadius: '100px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  textDecoration: 'none', 
  fontSize: '13px', 
  fontWeight: 700 
};

const mainContent: React.CSSProperties = { 
  paddingTop: '150px', 
  paddingBottom: '100px', 
  paddingLeft: '20px',  // Corregido: px cambiado por paddingLeft
  paddingRight: '20px', // Corregido: px cambiado por paddingRight
  position: 'relative', 
  zIndex: 1 
};

const docCard: React.CSSProperties = { 
  maxWidth: '850px', 
  margin: '0 auto', 
  background: 'rgba(255,255,255,0.01)', 
  border: '1px solid rgba(255,255,255,0.05)', 
  borderRadius: '40px', 
  padding: '80px 60px', 
  backdropFilter: 'blur(30px)', 
  boxShadow: '0 40px 100px rgba(0,0,0,0.5)' 
};

const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(0,102,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };