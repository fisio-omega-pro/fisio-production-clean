'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, ShieldAlert, ArrowLeft, CheckCircle2, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function CondicionesPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA BLANCA/SILVER) */}
      <div style={glowSilver} />
      
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
          style={docCard}
        >
          {/* CABECERA */}
          <header style={headerStyle}>
            <div style={iconBadge}><Gavel size={40} color="#fff" /></div>
            <h1 style={titleStyle}>Términos de Servicio <br/><span style={gradientText}>FisioTool Pro Edition</span></h1>
            <p style={subtitleStyle}>Marco legal y condiciones de uso para profesionales de la salud.</p>
          </header>

          {/* CUERPO DEL CONTRATO */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><FileText size={20} color="#fff" /> 1. Objeto del Servicio</h2>
              <p style={pStyle}>
                FisioTool proporciona una plataforma SaaS de gestión automatizada mediante Inteligencia Artificial. El servicio incluye la gestión de agenda, cobro de fianzas y transcripción de informes clínicos. La licencia de uso es personal para la clínica registrada y no transferible.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Scale size={20} color="#fff" /> 2. Suscripción y Pagos</h2>
              <p style={pStyle}>
                La modalidad Pro tiene un coste de <strong>100€/mes (IVA no incluido)</strong>. El cobro se realiza de forma recurrente cada 30 días. El impago de la cuota resultará en la suspensión automática de las funciones de Ana y el acceso al Dashboard tras un periodo de gracia de 3 días.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><ShieldAlert size={20} color="#fff" /> 3. Responsabilidad Profesional</h2>
              <p style={pStyle}>
                FisioTool es una herramienta de apoyo administrativo. La responsabilidad final sobre el diagnóstico, tratamiento y gestión de los datos médicos de los pacientes recae exclusivamente sobre el profesional colegiado titular de la clínica.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><CheckCircle2 size={20} color="#fff" /> 4. Cancelación</h2>
              <p style={pStyle}>
                El usuario puede cancelar su suscripción en cualquier momento desde el panel de ajustes. No existe compromiso de permanencia. Los datos de la clínica podrán ser exportados íntegramente antes de la baja definitiva.
              </p>
            </div>
          </section>

          {/* FIRMA DIGITAL IMPLÍCITA */}
          <div style={legalFooter}>
            <div style={{opacity: 0.5, fontSize: '12px'}}>
               Este documento constituye un contrato legal vinculante entre FISIOTOOL y el titular de la suscripción una vez aceptado en el proceso de registro (Setup).
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

// --- ESTILOS SUPREME ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowSilver: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05) 0%, transparent 50%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', px: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { opacity: 0.5 };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const legalFooter: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };