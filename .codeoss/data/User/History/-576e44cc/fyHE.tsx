'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ArrowLeft, Mail, FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DevolucionPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA MAGENTA) */}
      <div style={glowMagenta} />
      
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
            <div style={iconBadge}><RefreshCcw size={40} color="#ff00ff" /></div>
            <h1 style={titleStyle}>Política de Devolución <br/><span style={gradientText}>Transparencia Total</span></h1>
            <p style={subtitleStyle}>Sin preguntas incómodas. Sin procesos ocultos. Tu libertad es nuestra garantía.</p>
          </header>

          {/* CUERPO TÉCNICO */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><FileCheck size={20} color="#ff00ff" /> 1. Plazo de Reclamación</h2>
              <p style={pStyle}>
                Como se estipula en nuestra Garantía de Satisfacción, dispones de <strong>30 días naturales</strong> desde la fecha de tu primer pago para solicitar el reembolso total si Ana no ha cumplido con tus expectativas de gestión.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Mail size={20} color="#ff00ff" /> 2. Proceso de Solicitud</h2>
              <p style={pStyle}>
                Para ejecutar una devolución, solo tienes que enviar un email a <strong style={{color: '#fff'}}>soporte@fisiotool.com</strong> indicando el nombre de tu clínica. No necesitas adjuntar facturas; nuestro sistema reconocerá tu ID de cliente al instante.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><ShieldCheck size={20} color="#ff00ff" /> 3. Plazos de Abono</h2>
              <p style={pStyle}>
                Una vez recibida la solicitud, el equipo de administración procesará el reembolso en un máximo de <strong>48 horas</strong>. El dinero aparecerá en la misma tarjeta o cuenta con la que realizaste el pago original.
              </p>
            </div>
          </section>

          {/* FOOTER DE LA TARJETA */}
          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Protocolo de Salida FisioTool v1.0</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Gestionado de forma segura a través de Stripe Connect.</div>
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

// --- ESTILOS SUPREME (SANEADOS) ---
const pageContainer: React.CSSProperties = { 
  backgroundColor: '#020305', 
  minHeight: '100vh', 
  color: '#fff', 
  fontFamily: 'Inter, sans-serif', 
  position: 'relative', 
  overflowX: 'hidden' 
};

const glowMagenta: React.CSSProperties = { 
  position: 'absolute', 
  bottom: 0, 
  right: 0, 
  width: '600px', 
  height: '600px', 
  background: 'radial-gradient(circle at 90% 90%, rgba(255,0,255,0.05) 0%, transparent 60%)', 
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
  paddingLeft: '20px',  // Corregido: px sustituido por paddingLeft
  paddingRight: '20px', // Corregido: px sustituido por paddingRight
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

const iconBadge: React.CSSProperties = { 
  display: 'inline-flex', 
  padding: '20px', 
  background: 'rgba(255,0,255,0.05)', 
  borderRadius: '24px', 
  marginBottom: '30px', 
  border: '1px solid rgba(255,0,255,0.1)' 
};

const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#ff00ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };

// Añadido para consistencia con las otras páginas
const legalBlock: React.CSSProperties = { 
  borderLeft: '1px solid rgba(255,0,255,0.2)', 
  paddingLeft: '30px' 
};

const h2Style: React.CSSProperties = { 
  fontSize: '20px', 
  fontWeight: 800, 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  color: '#fff', 
  marginBottom: '15px' 
};

const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };