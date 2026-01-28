'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PagosPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA CIAN) */}
      <div style={glowCyan} />
      
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
            <div style={iconBadge}><CreditCard size={40} color="#00f2ff" /></div>
            <h1 style={titleStyle}>Ecosistema de Cobros <br/><span style={gradientText}>FisioTool Pro</span></h1>
            <p style={subtitleStyle}>Tecnología de pago diseñada para optimizar el flujo de caja de tu clínica.</p>
          </header>

          {/* OPCIONES DE COBRO */}
          <section style={textSection}>
            <div style={paymentMethod}>
              <h2 style={h2Style}><Zap size={20} color="#00f2ff" /> 1. Stripe Express (Modo Pro)</h2>
              <p style={pStyle}>
                Es el estándar de oro. El paciente abona la fianza con tarjeta en un entorno 100% seguro. El dinero se procesa mediante <strong>Stripe Connect</strong> y llega a tu cuenta bancaria automáticamente cada semana, descontando el coste del servicio de forma transparente.
              </p>
            </div>

            <div style={paymentMethod}>
              <h2 style={h2Style}><Smartphone size={20} color="#10b981" /> 2. Bizum Directo</h2>
              <p style={pStyle}>
                Para una relación más directa y sin comisiones de pasarela. Ana le indica al paciente tu número de teléfono y el concepto exacto. Una vez recibas el aviso en tu móvil, validas la cita en tu panel con un solo clic.
              </p>
            </div>

            <div style={paymentMethod}>
              <h2 style={h2Style}><Banknote size={20} color="#fff" /> 3. Pago en Clínica</h2>
              <p style={pStyle}>
                FisioTool te permite decidir la soberanía de tu agenda. Si prefieres no cobrar fianza online, Ana agendará la cita en modo "Reserva Gratuita" y el paciente abonará el total en tu centro como lo ha hecho siempre.
              </p>
            </div>
          </section>

          {/* SEGURIDAD DE DATOS BANCARIOS */}
          <div style={securityBanner}>
            <ShieldCheck size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Cifrado de Grado Bancario</div>
               <div style={{fontSize:'12px', opacity:0.5}}>FisioTool no almacena nunca los datos de las tarjetas. Todo el proceso ocurre en los servidores cifrados de Stripe (Certificación PCI Nivel 1).</div>
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

const glowCyan: React.CSSProperties = { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '600px', 
    background: 'radial-gradient(circle at 10% 10%, rgba(0,242,255,0.06) 0%, transparent 50%)', 
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
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,242,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(0,242,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#00f2ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '50px' };
const paymentMethod: React.CSSProperties = { padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' };
const h2Style: React.CSSProperties = { fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '15px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const securityBanner: React.CSSProperties = { marginTop: '60px', padding: '30px', background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };