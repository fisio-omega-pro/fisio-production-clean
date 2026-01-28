'use client';

import React from 'react';
import { Mic, ShieldCheck, Zap, Users, BrainCircuit, CreditCard } from 'lucide-react';

export default function Features() {
  return (
    <section id="ventajas" style={styles.section} aria-labelledby="features-title">
      <div style={styles.header}>
        <small style={styles.label}>ECOSISTEMA INTEGRAL</small>
        <h2 id="features-title" style={styles.title}>
          Todo lo que tu clínica necesita <br />
          <span style={{ color: '#0066ff' }}>en un solo sistema.</span>
        </h2>
        <p style={styles.description}>
          Hemos unificado 6 herramientas en 1. Deja de pagar suscripciones sueltas de CRM, 
          Pasarelas de Pago, Marketing y Agenda. FisioTool lo centraliza todo bajo el control de una IA.
        </p>
      </div>

      <div style={styles.grid}>
        <FeatureCard 
          icon={<BrainCircuit color="#0066ff" />} 
          title="Inteligencia Conductual" 
          text="Ana no es un chatbot. Entiende la psicología del paciente, detecta urgencias reales (Banderas Rojas) y filtra a los clientes que solo hacen perder tiempo."
        />
        <FeatureCard 
          icon={<CreditCard color="#10b981" />} 
          title="Cobros y Fianzas" 
          text="Elimina los impagos. Configura fianzas automáticas con Stripe Express. El dinero llega a tu cuenta al instante, sin intermediarios manuales."
        />
        <FeatureCard 
          icon={<Mic color="#f59e0b" />} 
          title="Historia Clínica por Voz" 
          text="Olvídate de teclear. Dicta el resumen de la sesión al terminar y Ana lo transcribe, estructura y guarda en la ficha del paciente en segundos."
        />
        <FeatureCard 
          icon={<Users color="#ec4899" />} 
          title="Reactivación de Pacientes" 
          text="El sistema detecta quién no ha vuelto en 3 meses y le envía un mensaje personalizado por WhatsApp para preguntar por su recuperación y agendar revisión."
        />
        <FeatureCard 
          icon={<ShieldCheck color="#6366f1" />} 
          title="Seguridad Grado Médico" 
          text="Tus datos están blindados con cifrado AES-256 en servidores de la UE (Bélgica). Cumplimos estrictamente con el RGPD y la Ley de Protección de Datos."
        />
        <FeatureCard 
          icon={<Zap color="#ef4444" />} 
          title="Accesibilidad Total" 
          text="La única plataforma del mundo diseñada nativamente para profesionales con discapacidad visual. Compatible con lectores de pantalla y comandos de voz."
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <article style={styles.card}>
      <div style={styles.iconBox}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </article>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', backgroundColor: '#020305', position: 'relative' },
  header: { textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' },
  title: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: '1.2', marginBottom: '20px' },
  description: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1400px', margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  iconBox: { width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' },
  cardTitle: { fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '15px' },
  cardText: { fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }
};