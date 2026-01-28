'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const router = useRouter();

  return (
    <section id="precios" style={styles.section}>
      <div style={styles.header}>
        <small style={styles.label}>INVERSIÓN ESTRATÉGICA</small>
        <h2 style={styles.title}>Planes de Licenciamiento</h2>
        <p style={styles.description}>Seleccione la capacidad operativa adecuada para su centro.</p>
      </div>

      <div style={styles.grid}>
        {/* PLAN PROFESSIONAL (ANTES SOLO) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.planName}>Professional</h3>
            <div style={styles.price}>100€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>Para consultas unipersonales de alto rendimiento.</p>
          </div>
          <div style={styles.features}>
            <FeatureItem text="1 Licencia de Especialista" />
            <FeatureItem text="IA Ana (Motor Conductual)" />
            <FeatureItem text="Gestión de Citas y Fianzas" />
            <FeatureItem text="Historia Clínica por Voz" />
          </div>
          <button onClick={() => router.push('/setup?plan=solo')} style={styles.btnOutline}>
            COMENZAR PRUEBA
          </button>
        </div>

        {/* PLAN BUSINESS (ANTES TEAM) */}
        <div style={styles.cardFeatured}>
          <div style={styles.badge}>RECOMENDADO</div>
          <div style={styles.cardHeader}>
            <h3 style={styles.planName}>Business</h3>
            <div style={styles.price}>300€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>Infraestructura para clínicas en crecimiento.</p>
          </div>
          <div style={styles.features}>
            <FeatureItem text="Hasta 5 Especialistas" />
            <FeatureItem text="Multi-Departamento" />
            <FeatureItem text="Panel Financiero Avanzado" />
            <FeatureItem text="Soporte Técnico Prioritario" />
          </div>
          <button onClick={() => router.push('/setup?plan=team')} style={styles.btnSolid}>
            ACTIVAR LICENCIA <Zap size={16} fill="currentColor" />
          </button>
        </div>

        {/* PLAN CORPORATE (ANTES CLINIC) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.planName}>Corporate</h3>
            <div style={styles.price}>500€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>Para redes de clínicas y hospitales.</p>
          </div>
          <div style={styles.features}>
            <FeatureItem text="Especialistas Ilimitados" />
            <FeatureItem text="Gestión Multi-Sede Global" />
            <FeatureItem text="API de Integración" />
            <FeatureItem text="Consultor Dedicado" />
          </div>
          <button onClick={() => router.push('/setup?plan=clinic')} style={styles.btnOutline}>
            CONTACTAR VENTAS
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
      <Check size={16} color="#10b981" /> {text}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: '#020305' },
  header: { textAlign: 'center', marginBottom: '60px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', marginBottom: '10px', display: 'block' },
  title: { fontSize: '42px', fontWeight: 900, color: '#fff', marginBottom: '15px' },
  description: { fontSize: '16px', color: 'rgba(255,255,255,0.5)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' },
  
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column' },
  cardFeatured: { background: 'rgba(255,255,255,0.04)', border: '2px solid #0066ff', borderRadius: '24px', padding: '50px 40px', position: 'relative', boxShadow: '0 20px 60px -10px rgba(0,102,255,0.15)', display: 'flex', flexDirection: 'column' },
  
  badge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0066ff', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 12px', borderRadius: '100px', letterSpacing: '1px' },
  
  cardHeader: { marginBottom: '30px', textAlign: 'center' },
  planName: { fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '10px' },
  price: { fontSize: '42px', fontWeight: 900, color: '#fff' },
  period: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 },
  planDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' },
  
  features: { marginBottom: '40px', flex: 1 },
  
  btnOutline: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '15px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.3s', width: '100%' },
  btnSolid: { background: '#0066ff', border: 'none', color: '#fff', padding: '15px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,102,255,0.2)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }
};