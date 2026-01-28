'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Server, ArrowRight } from 'lucide-react';

export default function TrustBar() {
  const router = useRouter();

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* SELLOS DE SEGURIDAD */}
        <div style={styles.badges}>
          <div style={styles.badgeItem}>
            <Lock size={20} color="#10b981" />
            <span>CIFRADO AES-256</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.badgeItem}>
            <ShieldCheck size={20} color="#10b981" />
            <span>DPA SALUD UE</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.badgeItem}>
            <Server size={20} color="#10b981" />
            <span>REGIÓN BÉLGICA (GCP)</span>
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={styles.ctaBox}>
          <h2 style={styles.title}>¿Listo para profesionalizar tu clínica?</h2>
          <p style={styles.subtitle}>Prueba FisioTool Pro gratis durante 30 días. Sin compromiso.</p>
          <button onClick={() => router.push('/setup')} style={styles.btnMain}>
            CREAR CUENTA AHORA <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '80px 5%', background: '#050a14', borderTop: '1px solid rgba(255,255,255,0.05)' },
  container: { maxWidth: '1000px', margin: '0 auto', textAlign: 'center' },
  badges: { display: 'inline-flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '15px 30px', borderRadius: '100px', marginBottom: '60px', flexWrap: 'wrap', justifyContent: 'center' },
  badgeItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 800, color: '#fff', opacity: 0.8 },
  divider: { width: '1px', height: '15px', background: 'rgba(255,255,255,0.1)' },
  ctaBox: { marginTop: '40px' },
  title: { fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '15px' },
  subtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' },
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 50px', borderRadius: '100px', fontSize: '18px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 20px 50px -10px rgba(0,102,255,0.4)' }
};