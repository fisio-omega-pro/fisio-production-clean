'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, CheckCircle2, Award, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

export default function GarantiaPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL */}
      <div style={glowCyan} />
      
      {/* NAV SIMPLE DE RETORNO */}
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
          {/* CABECERA DE AUTORIDAD */}
          <header style={headerStyle}>
            <div style={iconBadge}><Award size={40} color="#0066ff" /></div>
            <h1 style={titleStyle}>Garantía de Satisfacción <br/><span style={gradientText}>FisioTool Pro</span></h1>
            <p style={subtitleStyle}>Nuestra tecnología no admite dudas. Tu éxito es nuestra única métrica.</p>
          </header>

          {/* CUERPO DEL MANIFIESTO */}
          <section style={textSection}>
            <div style={legalBlock}>
                <h2 style={h2Style}><ShieldCheck size={20} color="#0066ff" /> 1. El Compromiso de los 30 Días</h2>
                <p style={pStyle}>
                Estamos tan seguros de la capacidad de Ana para transformar tu clínica que ofrecemos una <strong>Garantía de Satisfacción Total</strong>. Si durante los primeros 30 días sientes que la herramienta no ha recuperado al menos el triple de su valor en tiempo o dinero, te devolvemos el importe íntegro de tu suscripción. Sin preguntas. Sin trabas.
                </p>
            </div>

            <div style={legalBlock}>
                <h2 style={h2Style}><Zap size={20} color="#0066ff" /> 2. Disponibilidad del Sistema (SLA)</h2>
                <p style={pStyle}>
                FisioTool Pro corre sobre la infraestructura de Google Cloud. Garantizamos un tiempo de actividad (uptime) del <strong>99.9%</strong>. Ana nunca duerme, para que tú puedas hacerlo.
                </p>
            </div>

            <div style={legalBlock}>
                <h2 style={h2Style}><Heart size={20} color="#0066ff" /> 3. Soporte de Élite</h2>
                <p style={pStyle}>
                Como usuario de la versión Pro Edition, tienes acceso prioritario a nuestro equipo de ingeniería. Cualquier incidencia técnica será atendida en un plazo máximo de 4 horas dentro del horario comercial.
                </p>
            </div>
          </section>

          {/* SELLO FINAL */}
          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Sello de Confianza FisioTool 2026</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Documento verificado por el departamento de ingeniería.</div>
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

// --- ESTILOS DE GRADO MÉDICO (CORREGIDOS) ---
const pageContainer: React.CSSProperties = { 
    backgroundColor: '#020305', 
    minHeight: '100vh', 
    color: '#fff', 
    fontFamily: 'Inter, sans-serif', 
    position: 'relative', 
    overflowX: 'hidden' 
};

const glowCyan: React.CSSProperties = { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '600px', 
    background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.08) 0%, transparent 50%)', 
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
    paddingLeft: '20px',   // Corregido: px sustituido por paddingLeft
    paddingRight: '20px',  // Corregido: px sustituido por paddingRight
    position: 'relative', 
    zIndex: 1 
};

const docCard: React.CSSProperties = { 
    maxWidth: '800px', 
    margin: '0 auto', 
    background: 'rgba(255,255,255,0.01)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: '40px', 
    padding: '80px 60px', 
    backdropFilter: 'blur(30px)', 
    boxShadow: '0 40px 100px rgba(0,0,0,0.5)' 
};

const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px', marginBottom: '30px' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };

// Añadido para mantener consistencia visual con los otros documentos
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(0,102,255,0.2)', paddingLeft: '30px' };

const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };