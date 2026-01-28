'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, ShieldAlert, ArrowLeft, CheckCircle2, Gavel, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div style={pageContainer}>
      {/* FONDO DE SEDA DIGITAL (AURA SILVER) */}
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
          transition={{ duration: 0.8 }}
          style={docCard}
        >
          {/* CABECERA */}
          <header style={headerStyle}>
            <div style={iconBadge}><Gavel size={40} color="#fff" /></div>
            <h1 style={titleStyle}>Términos de Servicio <br/><span style={gradientText}>FisioTool Pro Edition</span></h1>
            <p style={subtitleStyle}>Acuerdo de Licencia SaaS y Condiciones de Uso Profesional.</p>
          </header>

          {/* CUERPO DEL CONTRATO */}
          <section style={textSection}>
            <div style={legalBlock}>
              <h2 style={h2Style}><Zap size={20} color="#fff" /> 1. Aceptación y Registro</h2>
              <p style={pStyle}>
                El acceso a Fisiotool Pro implica la aceptación de estos términos. El servicio es prestado por <strong>Fisiotool LLC</strong> (Wyoming, USA). El Profesional garantiza que los datos proporcionados en el registro son veraces y que actúa en el ejercicio de su actividad económica.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Scale size={20} color="#fff" /> 2. Condiciones Económicas y Fiscalidad</h2>
              <p style={pStyle}>
                La suscripción Pro tiene un coste de <strong>100€/mes</strong>. 
                <br /><br />
                • <strong>IVA/Impuestos:</strong> Al ser una entidad de EE. UU., las facturas a profesionales en España se emiten bajo el mecanismo de <strong>Inversión del Sujeto Pasivo</strong> (el cliente es responsable de declarar el IVA en su país). 
                <br />
                • <strong>Impago:</strong> Tras 3 días naturales de impago, el acceso al Dashboard y las funciones de la IA "Ana" quedarán suspendidos.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><ShieldAlert size={20} color="#fff" /> 3. Uso de la IA y Supervisión Humana</h2>
              <p style={pStyle}>
                "Ana" es un sistema de asistencia basado en IA. El Profesional acepta que:
                <br /><br />
                1. Es responsable de supervisar las citas confirmadas por el sistema.
                2. Fisiotool no sustituye el juicio clínico.
                3. La IA actúa bajo parámetros configurados por el Profesional, quien asume la responsabilidad de cualquier instrucción médica o administrativa dada a través del chat.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><Globe size={20} color="#fff" /> 4. Gestión de Pagos y Disputas</h2>
              <p style={pStyle}>
                El cobro de fianzas a pacientes se realiza mediante Stripe Connect. Fisiotool LLC no es responsable de:
                <br /><br />
                • Reclamaciones de reembolso de pacientes (deben gestionarse directamente con la clínica).
                • Retrocesos de cargo (chargebacks) iniciados por el paciente final.
                • Errores en la configuración de la cuenta de Stripe del profesional.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><FileText size={20} color="#fff" /> 5. Jurisdicción y Ley Aplicable</h2>
              <p style={pStyle}>
                Este contrato se rige por las leyes del Estado de <strong>Wyoming, Estados Unidos</strong>. Cualquier disputa será resuelta en los tribunales competentes de dicha jurisdicción, sin perjuicio de lo establecido en el Acuerdo de Encargado de Tratamiento para la protección de datos en la Unión Europea.
              </p>
            </div>

            <div style={legalBlock}>
              <h2 style={h2Style}><CheckCircle2 size={20} color="#fff" /> 6. Terminación y Portabilidad</h2>
              <p style={pStyle}>
                No existe permanencia. La baja puede solicitarse en cualquier momento. El Profesional tiene derecho a exportar su base de datos de pacientes y citas en formato estándar (CSV/JSON) antes de que la cuenta sea eliminada definitivamente de nuestros servidores.
              </p>
            </div>
          </section>

          {/* FIRMA DIGITAL IMPLÍCITA */}
          <div style={legalFooter}>
            <div style={{opacity: 0.5, fontSize: '12px'}}>
               Versión 1.2 — Última actualización: Enero 2025. El uso continuado del software tras esta fecha constituye la aceptación de los nuevos términos.
            </div>
          </div>
        </motion.div>
      </main>

      <footer style={footerStyle}>
        © FISIOTOOL LLC 2025 — TODOS LOS DERECHOS RESERVADOS
      </footer>
    </div>
  );
}

// --- ESTILOS SUPREME OPTIMIZADOS ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowSilver: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05) 0%, transparent 50%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: '40px', left: '40px', zIndex: 100 };
const btnBack: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 };
const mainContent: React.CSSProperties = { paddingTop: '150px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', position: 'relative', zIndex: 1 };
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