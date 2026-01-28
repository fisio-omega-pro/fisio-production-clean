'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const router = useRouter();

  return (
    <section style={styles.heroSection} aria-label="Introducción Principal">
      <div style={styles.bgGlow} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        style={styles.content}
      >
        <div style={styles.badge}>
          <ShieldCheck size={14} color="#10b981" />
          <span>SOFTWARE CLÍNICO CERTIFICADO UE</span>
        </div>

        <h1 style={styles.title}>
          El Sistema Operativo <br />
          <span style={styles.gradientText}>Inteligente</span> para tu Clínica.
        </h1>

        <p style={styles.description}>
          FisioTool Pro no es solo una agenda. Es <strong>Ana</strong>, una Inteligencia Artificial que 
          gestiona citas, elimina el absentismo (no-shows) con fianzas automáticas y 
          redacta historias clínicas por voz. Recupera 20 horas de tu vida al mes.
        </p>

        {/* SOLO BOTÓN PRINCIPAL CENTRADO */}
        <div style={styles.ctaGroup}>
          <button 
            onClick={() => router.push('/setup')} 
            style={styles.primaryBtn}
            aria-label="Empezar prueba gratuita de 30 días"
          >
            EMPEZAR PRUEBA GRATUITA <ArrowRight size={20} />
          </button>
        </div>

        <div style={styles.trustBadges}>
          <div style={styles.trustItem}>
            <Star fill="#fbbf24" color="#fbbf24" size={16} />
            <Star fill="#fbbf24" color="#fbbf24" size={16} />
            <Star fill="#fbbf24" color="#fbbf24" size={16} />
            <Star fill="#fbbf24" color="#fbbf24" size={16} />
            <Star fill="#fbbf24" color="#fbbf24" size={16} />
            <span>+500 Clínicas confían en Ana</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  heroSection: { position: 'relative', paddingTop: '180px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center', overflow: 'hidden' },
  bgGlow: { position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,102,255,0.15) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 },
  content: { position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: '#10b981', marginBottom: '30px', letterSpacing: '1px' },
  title: { fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px', color: '#fff' },
  gradientText: { background: 'linear-gradient(to right, #38bdf8, #0066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  description: { fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 50px' },
  
  // CENTRADO PERFECTO
  ctaGroup: { display: 'flex', justifyContent: 'center', width: '100%' },
  primaryBtn: { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 60px', borderRadius: '16px', fontSize: '18px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px -10px rgba(0,102,255,0.4)', transition: '0.3s' },
  
  trustBadges: { marginTop: '50px', display: 'flex', justifyContent: 'center', opacity: 0.6 },
  trustItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }
};
