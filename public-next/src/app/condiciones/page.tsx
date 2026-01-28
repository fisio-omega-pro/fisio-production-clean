'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, ArrowLeft, Handshake, Briefcase, ShieldAlert, CheckCircle2, Scale, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CondicionesPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA AZUL ELÉCTRICO / VIOLETA) */}
      <div style={glowViolet} />
      
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
            <div style={iconBadge}><Gavel size={40} color="#8b5cf6" /></div>
            <h1 style={titleStyle}>Términos y Condiciones <br/><span style={gradientText}>Marco Operativo SaaS</span></h1>
            <p style={subtitleStyle}>Acuerdo legal vinculante entre Fisiotool LLC y el Profesional de la Salud.</p>
          </header>

          {/* CUERPO LEGAL */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Briefcase size={20} color="#8b5cf6" /> 1. Objeto del Servicio</h2>
              <p style={pStyle}>
                Fisiotool LLC proporciona una plataforma SaaS basada en IA para la gestión de citas, prospección de pacientes y automatización de cobros preventivos. Fisiotool actúa exclusivamente como **proveedor tecnológico**, no formando parte de la relación clínica entre el profesional y su paciente.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Zap size={20} color="#8b5cf6" /> 2. Gestión de Pagos (Stripe Connect)</h2>
              <p style={pStyle}>
                Los pagos de señales "Anti No-Show" se procesan mediante Stripe Connect. El Profesional es el único responsable de configurar su cuenta de Stripe y de la gestión de fondos. Fisiotool se reserva el derecho de cobrar una comisión por transacción técnica según el plan suscrito.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Scale size={20} color="#8b5cf6" /> 3. Política de Citas y Cancelaciones</h2>
              <p style={pStyle}>
                El sistema aplicará por defecto la regla de **24 horas** para la retención de señales. El Profesional acepta que es su responsabilidad informar explícitamente a sus pacientes de esta política, exonerando a Fisiotool de cualquier reclamación derivada de la ejecución de dicha retención económica.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Handshake size={20} color="#8b5cf6" /> 4. Responsabilidad sobre Datos de Salud</h2>
              <p style={pStyle}>
                El Profesional garantiza que cuenta con el consentimiento previo de los pacientes para cargar sus datos en la plataforma (vía CSV o registro directo). Fisiotool LLC cumple con el rol de **Encargado del Tratamiento**, limitándose a custodiar y procesar los datos bajo las instrucciones técnicas del Profesional.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><ShieldAlert size={20} color="#8b5cf6" /> 5. Limitación de Responsabilidad</h2>
              <p style={pStyle}>
                Fisiotool LLC no se hace responsable de: 1. Errores clínicos derivados del uso de la IA. 2. Caídas del servicio de terceros (Google Cloud/Stripe). 3. Disputas financieras entre el paciente y la clínica por devoluciones de fianza.
              </p>
            </div>
          </section>

          {/* FOOTER DE LA TARJETA */}
          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Jurisdicción: Wyoming, USA</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Cumplimiento internacional de servicios digitales v1.2</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC 2025 — CONDICIONES GENERALES DE CONTRATACIÓN
      </footer>
    </div>
  );
}

// --- ESTILOS ADAPTADOS ---
const pageContainer: React.CSSProperties = { 
  backgroundColor: '#020305', 
  minHeight: '100vh', 
  color: '#fff', 
  fontFamily: 'Inter, sans-serif', 
  position: 'relative', 
  overflowX: 'hidden' 
};

const glowViolet: React.CSSProperties = { 
  position: 'absolute', 
  top: 0, 
  right: 0, 
  width: '100%', 
  height: '600px', 
  background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 70%)', 
  zIndex: 0 
};

const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };

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
  paddingLeft: '20px', 
  paddingRight: '20px', 
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

const iconBadge: React.CSSProperties = { 
  display: 'inline-flex', 
  padding: '20px', 
  background: 'rgba(139,92,246,0.05)', 
  borderRadius: '24px', 
  marginBottom: '30px', 
  border: '1px solid rgba(139,92,246,0.1)' 
};

const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#a78bfa' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(139,92,246,0.3)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };