'use client';

import React from 'react';
import { Mic, ShieldCheck, Zap, Users, BrainCircuit, CreditCard, Smartphone, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Definición de tipos para las tarjetas
interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const featuresData: FeatureItem[] = [
  { icon: <BrainCircuit color="#0066ff" size={24} />, title: "Inteligencia Conductual", text: "Ana detecta patrones de dolor, filtra urgencias reales mediante triaje automático y gestiona la psicología del paciente para asegurar la cita." },
  { icon: <CreditCard color="#10b981" size={24} />, title: "Cobros y Fianzas", text: "Elimine el absentismo de raíz. Ana solicita una fianza automática vía Stripe Express. El dinero llega a su cuenta sin intervención manual." },
  { icon: <Mic color="#f59e0b" size={24} />, title: "Historia Clínica por Voz", text: "Optimice su tiempo tras cada sesión. Dicte el resumen del tratamiento y el sistema transcribirá y archivará la nota en el expediente del paciente." },
  { icon: <Users color="#ec4899" size={24} />, title: "Reactivación de Pacientes", text: "Comercial inteligente. Ana identifica pacientes inactivos y contacta proactivamente por WhatsApp para agendar revisiones de seguimiento." },
  { icon: <Smartphone color="#8b5cf6" size={24} />, title: "App PWA para Pacientes", text: "Sus pacientes instalan su plataforma como una App nativa. Gestión de citas, consulta de bonos y recordatorios push con su propia marca." },
  { icon: <TrendingUp color="#06b6d4" size={24} />, title: "Prospección Estratégica", text: "Motor de ventas activo. Ana analiza huecos libres en la semana y lanza campañas segmentadas para maximizar la ocupación de su agenda." },
  { icon: <ShieldCheck color="#6366f1" size={24} />, title: "Seguridad AES-256", text: "Datos blindados bajo estándares bancarios. Alojamiento en servidores críticos de la Unión Europea con cumplimiento estricto de la RGPD." },
  { icon: <Zap color="#ef4444" size={24} />, title: "Accesibilidad Radical", text: "Arquitectura inclusiva diseñada para profesionales invidentes. Control total del ecosistema mediante voz y lectores de pantalla avanzados." },
];

export default function Features() {
  return (
    <section id="ventajas" style={styles.section} aria-labelledby="features-title">
      <div style={styles.header}>
        <small style={styles.label}>CAPACIDADES OMEGA</small>
        <h2 id="features-title" style={styles.title}>
          La infraestructura definitiva <br />
          <span style={{ color: '#0066ff' }}>para la clínica moderna.</span>
        </h2>
        <p style={styles.description}>
          Hemos integrado 8 módulos de ingeniería en una sola interfaz. 
          Soberanía total sobre su tiempo, su dinero y su reputación médica.
        </p>
      </div>

      <div style={styles.grid}>
        {featuresData.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon} 
            title={feature.title} 
            text={feature.text} 
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }: FeatureItem) {
  return (
    <motion.article 
      whileHover={{ 
        y: -8, 
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.15)'
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={styles.card}
    >
      <div style={styles.iconBox}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </motion.article>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { 
    padding: '120px 5%', 
    backgroundColor: '#020305', 
    position: 'relative',
    overflow: 'hidden' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '80px', 
    maxWidth: '800px', 
    margin: '0 auto 80px' 
  },
  label: { 
    color: '#0066ff', 
    fontWeight: 900, 
    fontSize: '12px', 
    letterSpacing: '3px', 
    textTransform: 'uppercase', 
    marginBottom: '15px', 
    display: 'block' 
  },
  title: { 
    fontSize: 'clamp(32px, 5vw, 52px)', 
    fontWeight: 900, 
    color: '#fff', 
    lineHeight: '1.1', 
    marginBottom: '25px' 
  },
  description: { 
    fontSize: '18px', 
    color: 'rgba(255,255,255,0.4)', 
    lineHeight: '1.7' 
  },
  
  grid: { 
    display: 'grid', 
    // Aseguramos 4 columnas en desktop y bajamos a 1 en mobile
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '32px', // Aumentamos el gap para evitar contacto visual
    maxWidth: '1400px', 
    margin: '0 auto',
    alignItems: 'stretch' // Asegura que todas las tarjetas de una fila midan lo mismo
  },
  
  card: { 
    boxSizing: 'border-box', // CRÍTICO: Evita que el padding cause solapamiento
    background: 'rgba(255,255,255,0.01)', 
    border: '1px solid rgba(255,255,255,0.07)', 
    padding: '40px', 
    borderRadius: '24px', 
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    height: '100%',
    cursor: 'default',
    position: 'relative',
    zIndex: 1
  },
  
  iconBox: { 
    width: '52px', 
    height: '52px', 
    background: 'rgba(255,255,255,0.03)', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '32px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  
  cardTitle: { 
    fontSize: '20px', 
    fontWeight: 700, 
    color: '#fff', 
    marginBottom: '16px', 
    letterSpacing: '-0.2px' 
  },
  
  cardText: { 
    fontSize: '15px', 
    color: 'rgba(255,255,255,0.4)', 
    lineHeight: '1.6', 
    margin: 0,
    flexGrow: 1 // Hace que el texto ocupe el espacio sobrante de forma limpia
  }
};