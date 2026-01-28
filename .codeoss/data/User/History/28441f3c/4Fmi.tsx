'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck, ArrowLeft, Zap, Scale, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PagosPage() {
  return (
    <div style={pageContainer}>
      <div style={glowCyan} />
      
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
          <header style={headerStyle}>
            <div style={iconBadge}><CreditCard size={40} color="#00f2ff" /></div>
            <h1 style={titleStyle}>Ecosistema de Cobros <br/><span style={gradientText}>Seguridad Financiera</span></h1>
            <p style={subtitleStyle}>Infraestructura de pagos optimizada para el cumplimiento fiscal y operativo.</p>
          </header>

          <section style={textSection}>
            <div style={paymentMethod}>
              <h2 style={h2Style}><Zap size={20} color="#00f2ff" /> 1. Stripe Connect (Estándar Pro)</h2>
              <p style={pStyle}>
                Utilizamos la tecnología de <strong>Stripe Connect</strong> para garantizar que los fondos de las fianzas "Anti No-Show" viajen de forma segura desde el paciente a la cuenta del profesional. 
                <br /><br />
                • <strong>Transparencia:</strong> Las comisiones de plataforma se deducen automáticamente.
                <br />
                • <strong>Seguridad:</strong> Cumplimiento estricto con la normativa SCA (Strong Customer Authentication) y PSD2.
                <br />
                • <strong>Liquidación:</strong> Transferencias automáticas a tu cuenta bancaria vinculada según el ciclo de Stripe.
              </p>
            </div>

            <div style={paymentMethod}>
              <h2 style={h2Style}><Smartphone size={20} color="#10b981" /> 2. Bizum y Transferencia (Validación Manual)</h2>
              <p style={pStyle}>
                FisioTool facilita el envío de instrucciones de pago directo. En esta modalidad, "Ana" actúa como puente informativo. El profesional es responsable de verificar la recepción del abono en su entidad bancaria y validar manualmente la cita en el panel para confirmar el slot.
              </p>
            </div>

            <div style={paymentMethod}>
              <h2 style={h2Style}><FileText size={20} color="#fff" /> 3. Responsabilidad Fiscal e IVA</h2>
              <p style={pStyle}>
                El profesional titular de la clínica es el único responsable de la emisión de facturas o tickets simplificados a sus pacientes por los servicios prestados, incluyendo la gestión del IVA (si aplica). FisioTool LLC emitirá facturas mensuales al profesional únicamente por el coste de la suscripción SaaS y las tasas de gestión técnica.
              </p>
            </div>
          </section>

          <div style={securityBanner}>
            <ShieldCheck size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Certificación PCI DSS Nivel 1</div>
               <div style={{fontSize:'12px', opacity:0.5}}>FisioTool LLC no almacena ni accede a datos de tarjetas de crédito. El procesamiento se delega íntegramente en servidores cifrados de Stripe con tokenización de seguridad.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC 2025 — INFRAESTRUCTURA DE PAGOS SEGUROS
      </footer>
    </div>
  );
}

// --- ESTILOS (SANEADOS Y MANTENIDOS) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowCyan: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 10% 10%, rgba(0,242,255,0.06) 0%, transparent 50%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
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