'use client';

import React from 'react';
import { Check, Zap, Crown, Rocket, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const router = useRouter();

  return (
    <section id="precios" style={styles.section}>
      <div style={styles.header}>
        <small style={styles.label}>TU NUEVA VENTAJA COMPETITIVA</small>
        <h2 style={styles.title}>Selecciona la Transformación Digital Precisa para tu Clínica.</h2>
        <p style={styles.description}>
          No cobramos por "usar un software". Cobramos una fracción de lo que te generamos. 
          <br /><span style={{color: '#fff', fontWeight: 600}}>Cualquier plan se paga solo recuperando apenas 2 citas al mes.</span>
        </p>
      </div>

      <div style={styles.grid}>
        
        {/* NIVEL 1: PROFESSIONAL */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapper}><Rocket size={24} color="#3b82f6" /></div>
            <h3 style={styles.planName}>Professional</h3>
            <div style={styles.price}>100€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              Para el especialista que quiere dejar de ser <strong>esclavo del teléfono</strong> y dedicarse solo a curar.
            </p>
          </div>
          <div style={styles.separator} />
          <div style={styles.features}>
            <FeatureItem text="IA Ana: Tu Recepcionista 24/7" sub="Nunca duerme, nunca se queja." />
            <FeatureItem text="Agenda Atómica Anti-Conflictos" sub="Cálculo matemático de huecos." />
            <FeatureItem text="Cobro de Fianza Automática" sub="Elimina el 100% de No-Shows." />
            <FeatureItem text="Dictado Clínico por Voz" sub="Ahorra 1 hora de escritura al día." />
            <FeatureItem text="Soporte Técnico Dedicado" />
          </div>
          <button onClick={() => router.push('/setup?plan=solo')} style={styles.btnOutline}>
            COMENZAR PRUEBA GRATUITA
          </button>
        </div>

        {/* NIVEL 2: BUSINESS */}
        <div style={styles.cardFeatured}>
          <div style={styles.badge}>MÁS RENTABLE</div>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapperFeatured}><Crown size={24} color="#fff" /></div>
            <h3 style={styles.planName}>Business</h3>
            <div style={styles.price}>300€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              La infraestructura definitiva para <strong>clínicas en expansión</strong> que buscan duplicar su facturación.
            </p>
          </div>
          <div style={styles.separatorFeatured} />
          <div style={styles.features}>
            <FeatureItem text="Hasta 5 Especialistas" sub="Gestión de agendas cruzadas." />
            <FeatureItem text="Panel Financiero en Tiempo Real" sub="Control total de tu tesorería." />
            <FeatureItem text="Motor de Reactivación (ASG)" sub="Ana vende a tus antiguos pacientes." />
            <FeatureItem text="Multi-Departamento" sub="Fisio, Podo, Nutri... todo en uno." />
            <FeatureItem text="Prioridad en Soporte VIP" />
          </div>
          <button onClick={() => router.push('/setup?plan=team')} style={styles.btnSolid}>
            ACTIVAR LICENCIA BUSINESS <Zap size={18} fill="currentColor" />
          </button>
        </div>

        {/* NIVEL 3: CORPORATE */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapper}><Shield size={24} color="#3b82f6" /></div>
            <h3 style={styles.planName}>Corporate</h3>
            <div style={styles.price}>500€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              Arquitectura de grado hospitalario para <strong>redes de clínicas</strong> y centros de alto volumen.
            </p>
          </div>
          <div style={styles.separator} />
          <div style={styles.features}>
            <FeatureItem text="Especialistas Ilimitados" sub="Escalabilidad infinita." />
            <FeatureItem text="Gestión Multi-Sede Global" sub="Controla 10 clínicas desde 1 pantalla." />
            <FeatureItem text="API de Integración Abierta" sub="Conecta con tu ERP actual." />
            <FeatureItem text="Consultor de Estrategia Propio" sub="Reuniones mensuales de optimización." />
            <FeatureItem text="Auditoría Legal RGPD Incluida" />
          </div>
          <button onClick={() => router.push('/setup?plan=clinic')} style={styles.btnOutline}>
            HABLAR CON VENTAS
          </button>
        </div>

      </div>
    </section>
  );
}

function FeatureItem({ text, sub }: { text: string, sub?: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#fff', fontWeight: 600 }}>
        <div style={{background:'rgba(16,185,129,0.1)', borderRadius:'50%', padding:'2px'}}>
            <Check size={14} color="#10b981" strokeWidth={3} /> 
        </div>
        {text}
      </div>
      {sub && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', paddingLeft: '28px', margin: '4px 0 0 0', lineHeight: '1.4' }}>{sub}</p>}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '120px 5%', background: '#020305' },
  header: { textAlign: 'center', marginBottom: '80px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '13px', letterSpacing: '3px', marginBottom: '15px', display: 'block', textTransform: 'uppercase' },
  title: { fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, color: '#fff', marginBottom: '20px', lineHeight: '1.1' },
  description: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', display: 'flex', flexDirection: 'column', transition: '0.3s' },
  cardFeatured: { background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.2) 0%, rgba(2,3,5,0) 100%)', border: '2px solid #0066ff', borderRadius: '32px', padding: '50px 40px', position: 'relative', boxShadow: '0 0 60px -10px rgba(0,102,255,0.15)', display: 'flex', flexDirection: 'column', transform: 'scale(1.02)' },
  badge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#0066ff', color: '#fff', fontSize: '11px', fontWeight: 900, padding: '6px 16px', borderRadius: '100px', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(0,102,255,0.4)' },
  cardHeader: { textAlign: 'center' },
  iconWrapper: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' },
  iconWrapperFeatured: { width: '60px', height: '60px', background: '#0066ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' },
  planName: { fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '10px' },
  price: { fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-2px' },
  period: { fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginLeft: '5px' },
  planDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginTop: '15px', lineHeight: '1.6', minHeight: '50px' },
  separator: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '30px 0' },
  separatorFeatured: { height: '1px', background: 'rgba(0,102,255,0.2)', margin: '30px 0' },
  features: { marginBottom: '40px', flex: 1 },
  btnOutline: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: '0.3s', width: '100%', fontSize: '14px', letterSpacing: '1px' },
  btnSolid: { background: '#0066ff', border: 'none', color: '#fff', padding: '20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,102,255,0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', letterSpacing: '0.5px' }
};
