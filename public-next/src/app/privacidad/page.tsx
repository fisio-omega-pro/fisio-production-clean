'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, ArrowLeft, CheckCircle2, Globe, Cpu, Scale } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div style={pageContainer}>
      <div style={glowBlue} />
      
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
            <div style={iconBadge}><ShieldCheck size={40} color="#0066ff" /></div>
            <h1 style={titleStyle}>Privacidad y Seguridad <br/><span style={gradientText}>Protocolo de Salud</span></h1>
            <p style={subtitleStyle}>Protección avanzada de datos clínicos y transparencia en Inteligencia Artificial.</p>
          </header>

          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Lock size={20} color="#0066ff" /> 1. Roles de Tratamiento</h2>
              <p style={pStyle}>
                Conforme al RGPD, se establecen las siguientes responsabilidades:
                <br /><br />
                • <strong>Responsable del Tratamiento:</strong> El profesional o clínica de fisioterapia titular de la cuenta.
                <br />
                • <strong>Encargado del Tratamiento:</strong> Fisiotool LLC (con domicilio en 1234 Central Ave, Suite 200, Cheyenne, WY 82001, EE. UU.), quien provee la infraestructura tecnológica y el motor de IA.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Scale size={20} color="#0066ff" /> 2. Legitimación y Datos de Salud</h2>
              <p style={pStyle}>
                Tratamos datos de salud (sintomatología, historial de citas, motivos de consulta) bajo el amparo del <strong>Art. 9.2.h del RGPD</strong> (asistencia sanitaria y gestión de sistemas de salud) y el consentimiento explícito del paciente. Los datos se recogen exclusivamente para la gestión de citas y el recordatorio de tratamientos.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Cpu size={20} color="#0066ff" /> 3. Tratamiento mediante IA (Ana)</h2>
              <p style={pStyle}>
                Nuestra asistente "Ana" utiliza modelos de lenguaje (LLM) a través de Google Vertex AI. 
                <br /><br />
                • <strong>Privacidad del modelo:</strong> Los datos de salud de los pacientes no se utilizan para entrenar modelos públicos de Google ni de terceros.
                <br />
                • <strong>Transparencia:</strong> El paciente siempre es informado de que está interactuando con un sistema de IA (Art. 52 Ley de IA UE).
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Globe size={20} color="#0066ff" /> 4. Hosting y Transferencias Internacionales</h2>
              <p style={pStyle}>
                Los datos residen en servidores de <strong>Google Cloud (Región: Bélgica, UE)</strong>. Al ser Fisiotool una entidad estadounidense, la transferencia internacional se legitima mediante la adhesión al Data Privacy Framework o la firma de <strong>Cláusulas Contractuales Tipo</strong> aprobadas por la Comisión Europea, garantizando un nivel de protección equivalente al europeo.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Eye size={20} color="#0066ff" /> 5. Derechos ARSULIPO</h2>
              <p style={pStyle}>
                Los usuarios pueden ejercer sus derechos de Acceso, Rectificación, Supresión, Limitación, Portabilidad y Oposición escribiendo a <strong style={{color: '#fff'}}>info@fisiotool.com</strong>. Si el usuario es un paciente, su solicitud será tramitada y coordinada con el profesional responsable de su historial clínico.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Database size={20} color="#0066ff" /> 6. Conservación de Datos</h2>
              <p style={pStyle}>
                Los datos se conservarán mientras se mantenga la relación contractual con el profesional o durante los plazos legales exigidos por la normativa de autonomía del paciente y documentación clínica aplicable en España (generalmente 5 años).
              </p>
            </div>
          </section>

          <div style={stampContainer}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'14px'}}>Auditoría de Privacidad 2025</div>
               <div style={{fontSize:'12px', opacity:0.5}}>Cumplimiento certificado con RGPD, LOPDGDD y EU AI Act.</div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC — PROTOCOLO DE PRIVACIDAD DE GRADO MÉDICO
      </footer>
    </div>
  );
}

// --- ESTILOS (MANTENIDOS Y SANEADOS) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowBlue: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 50%, rgba(0,242,255,0.06) 0%, transparent 70%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
const docCard: React.CSSProperties = { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '80px 60px', backdropFilter: 'blur(30px)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' };
const headerStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '60px' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.05)', borderRadius: '24px', marginBottom: '30px', border: '1px solid rgba(0,102,255,0.1)' };
const titleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: 900, letterSpacing: '-1px', lineHeight: '1.1' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const subtitleStyle: React.CSSProperties = { fontSize: '18px', opacity: 0.4, marginTop: '15px' };
const textSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '40px' };
const legalBlock: React.CSSProperties = { borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', marginBottom: '15px' };
const pStyle: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.8', margin: 0 };
const stampContainer: React.CSSProperties = { marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' };
const footerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', fontSize: '11px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px' };