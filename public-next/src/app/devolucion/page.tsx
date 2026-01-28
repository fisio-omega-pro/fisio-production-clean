'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ArrowLeft, Mail, FileCheck, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DevolucionPage() {
  return (
    <div style={pageContainer}>
      <div style={glowMagenta} />
      
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
            <div style={iconBadge}><RefreshCcw size={40} color="#ff00ff" /></div>
            <h1 style={titleStyle}>Política de Reembolsos <br/><span style={gradientText}>Y Cancelaciones</span></h1>
            <p style={subtitleStyle}>Reglas claras para profesionales y pacientes bajo la normativa de consumo.</p>
          </header>

          <section style={textSection}>
            {/* SECCIÓN PARA EL PROFESIONAL (FISIO) */}
            <div style={legalBlock}>
              <h2 style={h2Style}><FileCheck size={20} color="#ff00ff" /> 1. Suscripción SaaS (Para el Profesional)</h2>
              <p style={pStyle}>
                Ofrecemos una <strong>Garantía de Satisfacción de 30 días</strong> para nuevos suscriptores de Fisiotool. Si durante el primer mes consideras que el sistema no optimiza tu clínica, reembolsamos el 100% de tu cuota de suscripción. 
                <br /><br />
                <em>Nota: No se reembolsarán los costes de consumo variables (como créditos de SMS o minutos de procesamiento de IA ya utilizados).</em>
              </p>
            </div>

            {/* SECCIÓN PARA EL PACIENTE (Citas) */}
            <div style={legalBlock}>
              <h2 style={h2Style}><Clock size={20} color="#ff00ff" /> 2. Depósitos de Cita (Política Anti No-Show)</h2>
              <p style={pStyle}>
                Fisiotool facilita la gestión de cobros preventivos para evitar huecos en agenda. La política estándar aplicada es:
                <br /><br />
                • <strong>Cancelación con {'>'} 24h:</strong> El paciente tiene derecho al reembolso íntegro de la señal o al cambio de cita.
                <br />
                • <strong>Cancelación con {'<'} 24h o Incomparecencia:</strong> El profesional retendrá la señal en concepto de reserva de plaza y lucro cesante.
                <br /><br />
                Fisiotool LLC actúa como proveedor tecnológico. La responsabilidad final del abono reside en el profesional titular de la cuenta de Stripe Connect.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Mail size={20} color="#ff00ff" /> 3. Procedimiento de Solicitud</h2>
              <p style={pStyle}>
                Para suscripciones, contacta con <strong style={{color: '#fff'}}>soporte@fisiotool.com</strong>. Los reembolsos se tramitan en un máximo de <strong>48-72 horas</strong> laborables tras la validación, devolviendo los fondos al método de pago original a través de Stripe.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><AlertCircle size={20} color="#ff00ff" /> 4. Derecho de Desistimiento</h2>
              <p style={pStyle}>
                De acuerdo con la normativa española, el derecho de desistimiento no será aplicable una vez que el servicio haya sido completamente ejecutado o cuando la ejecución haya comenzado con el consentimiento previo y expreso del usuario (Art. 103 de la Ley 3/2014).
              </p>
            </div>
          </section>

          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Protocolo de Garantía FisioTool 2025</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Cumplimiento con la Ley de Consumidores y Usuarios de España.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC — WYOMING, USA & ESPAÑA
      </footer>
    </div>
  );
}

// --- ESTILOS (Se mantienen tus estilos con las correcciones aplicadas) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowMagenta: React.CSSProperties = { position: 'absolute', bottom: 0, right: 0, width: '600px', height: '600px', background: 'radial-gradient(circle at 90% 90%, rgba(255,0,255,0.05) 0%, transparent 60%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(255,0,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(255,0,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#ff00ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,0,255,0.2)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };