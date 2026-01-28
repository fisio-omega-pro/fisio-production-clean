'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, ArrowLeft, CheckCircle2, Info, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div style={pageContainer}>
      <div style={glowTeal} />
      
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
            <div style={iconBadge}><Cookie size={40} color="#00f2ff" /></div>
            <h1 style={titleStyle}>
                Política de Cookies <br/>
                <span style={gradientText}>Transparencia Digital</span>
            </h1>
            <p style={subtitleStyle}>Cumplimiento estricto con la directiva ePrivacy y el RGPD.</p>
          </header>

          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Shield size={20} color="#00f2ff" /> 1. Definición y Función</h2>
              <p style={pStyle}>
                Fisiotool LLC utiliza cookies y dispositivos de almacenamiento similares. Son ficheros que se descargan en tu equipo para almacenar y recuperar datos sobre tu navegación, permitiendo que el sistema te reconozca, garantice la seguridad de tu sesión y personalice tu entorno operativo.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Lock size={20} color="#00f2ff" /> 2. Cookies Técnicas (Obligatorias)</h2>
              <p style={pStyle}>
                Son esenciales para el funcionamiento del SaaS. No requieren consentimiento previo.
                <br /><br />
                • <strong>Firebase Auth:</strong> Gestiona tu identidad y mantiene la sesión segura (Persistencia: Sesión/30 días).
                <br />
                • <strong>Stripe:</strong> Necesarias para la prevención de fraudes y procesamiento de pagos "Anti No-Show" (Persistencia: Hasta 2 años).
                <br />
                • <strong>Google Cloud / Firestore:</strong> Optimizan la entrega de datos de salud cifrados.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Globe size={20} color="#00f2ff" /> 3. Cookies de Análisis y Terceros</h2>
              <p style={pStyle}>
                Utilizamos herramientas como <strong>Google Analytics</strong> para entender cómo interactúas con la plataforma. Estas cookies solo se activarán si pulsas "Aceptar" en nuestro banner. Nos ayudan a medir el rendimiento sin identificar directamente a pacientes ni profesionales de forma individual.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Settings size={20} color="#00f2ff" /> 4. Transferencias Internacionales</h2>
              <p style={pStyle}>
                Al usar servicios de Google y Stripe, la información puede procesarse en servidores de EE. UU. Fisiotool LLC garantiza que estas transferencias se realizan bajo el marco del Data Privacy Framework o Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Info size={20} color="#00f2ff" /> 5. Gestión y Revocación</h2>
              <p style={pStyle}>
                Puedes configurar o retirar tu consentimiento en cualquier momento a través de nuestro panel de configuración o mediante los ajustes de tu navegador (Chrome, Firefox, Safari). Ten en cuenta que bloquear cookies técnicas impedirá el acceso al Dashboard y la gestión de citas.
              </p>
            </div>
          </section>

          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Última actualización: 2025</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Fisiotool LLC cumple con las guías de la AEPD sobre el uso de cookies.</div>
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

// --- ESTILOS (Se mantienen igual a tu diseño original) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowTeal: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 50%, rgba(0,242,255,0.06) 0%, transparent 70%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,242,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(0,242,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#00f2ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };