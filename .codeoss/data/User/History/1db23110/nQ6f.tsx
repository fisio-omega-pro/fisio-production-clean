'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Info, ArrowLeft, Building2, Globe, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AvisoLegalPage() {
  return (
    <div style={pageContainer}>
      <div style={glowWhite} />
      
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
            <div style={iconBadge}><Info size={40} color="#fff" /></div>
            <h1 style={titleStyle}>Aviso Legal <br/><span style={gradientText}>Identidad Corporativa</span></h1>
            <p style={subtitleStyle}>Transparencia informativa según la normativa LSSI-CE.</p>
          </header>

          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Building2 size={20} color="#fff" /> 1. Datos del Titular</h2>
              <p style={pStyle}>
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los datos identificativos:
                <br /><br />
                • <strong>Denominación Social:</strong> Fisiotool LLC
                <br />
                • <strong>Sede Social:</strong> 1234 Central Ave, Suite 200, Cheyenne, WY 82001, United States.
                <br />
                • <strong>Email de contacto:</strong> info@fisiotool.com
                <br />
                • <strong>Actividad:</strong> Proveedor de Software como Servicio (SaaS) para la gestión clínica asistida por IA.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Globe size={20} color="#fff" /> 2. Propiedad Intelectual</h2>
              <p style={pStyle}>
                El código fuente, los diseños gráficos, las imágenes, las fotografías, los sonidos, las animaciones, el software (incluyendo el motor de IA "Ana"), los textos, así como la información y los contenidos que se recogen en este sitio web están protegidos por la legislación internacional sobre los derechos de propiedad intelectual e industrial a favor de Fisiotool LLC.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><ShieldCheck size={20} color="#fff" /> 3. Condiciones de Uso</h2>
              <p style={pStyle}>
                El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que Fisiotool ofrece a través de su plataforma y a no emplearlos para incurrir en actividades ilícitas o contrarias a la buena fe y al ordenamiento legal.
              </p>
            </div>
          </section>

          <div style={stampContainer}>
            <div style={{opacity: 0.5, fontSize: '12px', textAlign: 'center', width: '100%'}}>
               Fisiotool LLC opera bajo las leyes del Estado de Wyoming y cumple con las directivas internacionales de comercio electrónico.
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC 2025 — IDENTIFICACIÓN LEGAL
      </footer>
    </div>
  );
}

// --- ESTILOS (MANTENIDOS) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowWhite: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03) 0%, transparent 50%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#ffffff', opacity: 0.6 };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };