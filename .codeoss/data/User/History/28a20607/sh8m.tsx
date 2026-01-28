'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, CheckCircle2, Award, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

// ==========================================
// 🎨 ESTILOS (DEFINIDOS ANTES DE LA FUNCIÓN)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' },
  glowCyan: { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.08) 0%, transparent 50%)', zIndex: 0 },
  navStyle: { position: 'fixed', top: '40px', left: '40px', zIndex: 100 },
  btnBack: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 },
  mainContent: { paddingTop: '150px', paddingBottom: '100px', px: '20px', position: 'relative', zIndex: 1 },
  docCard: { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' },
  headerStyle: { textAlign: 'center', marginBottom: '60px' },
  iconBadge: { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px', marginBottom: '30px' },
  titleStyle: { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' },
  gradientText: { color: '#0066ff' },
  subtitleStyle: { fontSize: '18px', opacity: 0.4, marginTop: '15px' },
  textSection: { display: 'flex', flexDirection: 'column', gap: '40px' },
  h2Style: { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' },
  pStyle: { fontSize: '16px', opacity: 0.6, lineHeight: '1.8', margin: 0 },
  stampContainer: { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' },
  footerStyle: { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' }
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL
// ==========================================
export default function GarantiaPage() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.glowCyan} />
      
      <nav style={styles.navStyle}>
        <Link href="/" style={styles.btnBack}>
          <ArrowLeft size={18} /> Volver a la central
        </Link>
      </nav>

      <main style={styles.mainContent}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.docCard}>
          <header style={styles.headerStyle}>
            <div style={styles.iconBadge}><Award size={40} color="#0066ff" /></div>
            <h1 style={styles.titleStyle}>Garantía de Satisfacción <br/><span style={styles.gradientText}>FisioTool Pro</span></h1>
            <p style={styles.subtitleStyle}>Nuestra tecnología no admite dudas. Tu éxito es nuestra única métrica.</p>
          </header>

          <section style={styles.textSection}>
            <h2 style={styles.h2Style}><ShieldCheck size={20} color="#0066ff" /> 1. El Compromiso de los 30 Días</h2>
            <p style={styles.pStyle}>
              Estamos tan seguros de la capacidad de Ana para transformar tu clínica que ofrecemos una <strong>Garantía de Satisfacción Total</strong>. Si durante los primeros 30 días sientes que la herramienta no ha recuperado al menos el triple de su valor en tiempo o dinero, te devolvemos el importe íntegro.
            </p>
          </section>

          <div style={styles.stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Sello de Confianza FisioTool 2026</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Verificado por el departamento de ingeniería.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={styles.footerStyle}>
        © FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS
      </footer>
    </div>
  );
}