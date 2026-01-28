'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, ArrowLeft, CheckCircle2, Info, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA CIAN TECNOLÓGICO) */}
      <div style={glowTeal} />
      
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
            <div style={iconBadge}><Cookie size={40} color="#00f2ff" /></div>
            <h1 style={titleStyle}>Política de Cookies <br/><span style={gradientText}>Transparencia Digital</span></h1>
            <p style={subtitleStyle}>Información técnica sobre cómo optimizamos tu experiencia operativa.</p>
          </header>

          {/* CUERPO TÉCNICO */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Shield size={20} color="#00f2ff" /> 1. ¿Qué son las Cookies?</h2>
              <p style={pStyle}>
                Son pequeños archivos de datos que el Ferrari (nuestro servidor) deposita en tu navegador para recordarte. No son virus ni software espía; son las "instrucciones de memoria" que permiten que no tengas que loguearte cada 5 minutos.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Lock size={20} color="#00f2ff" /> 2. Cookies Esenciales (Obligatorias)</h2>
              <p style={pStyle}>
                Son las que mantienen el motor encendido. Incluyen la seguridad de <strong>Firebase Auth</strong> para tu login y la conexión cifrada con <strong>Stripe</strong> para tus cobros. Sin ellas, el Ferrari no arrancaría.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Settings size={20} color="#00f2ff" /> 3. Cookies de Personalización</h2>
              <p style={pStyle}>
                Utilizamos cookies para recordar tus preferencias de <strong>Accesibilidad</strong>. Si eres un profesional invidente y activas el narrador de voz, esta cookie le dice a Ana que debe hablarte en cada sesión futura sin que tengas que volver a configurarlo.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Info size={20} color="#00f2ff" /> 4. Control del Usuario</h2>
              <p style={pStyle}>
                Tienes el mando soberano. Puedes bloquear o eliminar las cookies desde los ajustes de tu navegador (Chrome, Safari, Edge). Ten en cuenta que, al hacerlo, algunas funciones de élite del Dashboard podrían quedar inhabilitadas.
              </p>
            </div>
          </section>

          {/* SELLO DE CUMPLIMIENTO */}
          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Auditoría de Rastreo 2026</div>
               <div style={{fontSize:'12px', opacity:0.5}}>FisioTool Pro no utiliza cookies de terceros para publicidad invasiva.</div>
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
const glowTeal: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 50%, rgba(0,242,255,0.06) 0%, transparent 70%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', px: '20px', position: 'relative', zIndex: 1 };
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