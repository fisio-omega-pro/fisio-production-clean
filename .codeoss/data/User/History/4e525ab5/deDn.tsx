'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, CheckCircle2, Award, Zap, Heart, Lock } from 'lucide-react';
import Link from 'next/link';

export default function GarantiaPage() {
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
            <div style={iconBadge}><Award size={40} color="#0066ff" /></div>
            <h1 style={titleStyle}>Garantía de Servicio <br/><span style={gradientText}>FisioTool Pro</span></h1>
            <p style={subtitleStyle}>Compromisos de rendimiento, seguridad y éxito operativo.</p>
          </header>

          <section style={textSection}>
            <div style={legalBlock}>
                <h2 style={h2Style}><ShieldCheck size={20} color="#0066ff" /> 1. Garantía de Prueba (30 Días)</h2>
                <p style={pStyle}>
                Confiamos plenamente en la capacidad de "Ana" para optimizar tu agenda. Por ello, ofrecemos un periodo de **garantía de satisfacción de 30 días naturales** desde tu primera suscripción. Si el sistema no cumple con los objetivos de eficiencia esperados, procederemos al reembolso de la cuota mensual de servicio, conforme a nuestra política de devoluciones.
                </p>
            </div>

            <div style={legalBlock}>
                <h2 style={h2Style}><Zap size={20} color="#0066ff" /> 2. Disponibilidad de Infraestructura (SLA)</h2>
                <p style={pStyle}>
                FisioTool Pro opera sobre infraestructura de **Google Cloud de grado empresarial**. Garantizamos un tiempo de actividad (uptime) del **99.9%** mensual. Esta garantía cubre el núcleo del sistema, excluyendo caídas programadas por mantenimiento o fallos en proveedores externos de conectividad (Stripe, operadoras de telefonía para SMS).
                </p>
            </div>

            <div style={legalBlock}>
                <h2 style={h2Style}><Lock size={20} color="#0066ff" /> 3. Garantía de Integridad de Datos</h2>
                <p style={pStyle}>
                Al tratar datos de salud, la seguridad es nuestra prioridad absoluta. Garantizamos que todos los datos de pacientes están **cifrados en reposo y en tránsito** mediante protocolos SSL/TLS de alta seguridad. Realizamos copias de seguridad diarias automatizadas para prevenir cualquier pérdida de información clínica.
                </p>
            </div>

            <div style={legalBlock}>
                <h2 style={h2Style}><Heart size={20} color="#0066ff" /> 4. Soporte Técnico Pro Edition</h2>
                <p style={pStyle}>
                El soporte prioritario para usuarios Pro asegura una respuesta inicial en menos de **4 horas laborables** (Lunes a Viernes, horario peninsular de España). Nuestro equipo de ingeniería supervisa de forma proactiva el motor de IA para asegurar que las citas y cobros se gestionen sin errores.
                </p>
            </div>
          </section>

          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Sello de Calidad FisioTool 2025</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Compromiso contractual de Fisiotool LLC con la excelencia médica.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC 2025 — GARANTÍA DE NIVEL DE SERVICIO (SLA)
      </footer>
    </div>
  );
}

// --- ESTILOS MANTENIDOS Y CORREGIDOS ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowCyan: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.08) 0%, transparent 50%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px', marginBottom: '30px' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(0,102,255,0.2)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };