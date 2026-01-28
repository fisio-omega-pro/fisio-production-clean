'use client'
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
// Importamos el simulador que creamos en el taller
import RoiSimulator from '@/components/RoiSimulator';

export default function LinearFisioFerrari() {
  return (
    <div style={{
      backgroundColor: '#05070a', // Deep Navy Plastic
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* 1. FONDO DE SEDA DIGITAL (AURORA V2) */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(at 0% 0%, rgba(0, 102, 255, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.1) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(0, 242, 255, 0.05) 0px, transparent 50%)
        `,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* NAV FLOTANTE DE CRISTAL */}
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'fit-content',
        padding: '8px 24px',
        borderRadius: '100px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        zIndex: 100,
        fontSize: '13px',
        fontWeight: 500,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <span style={{ color: '#fff', fontWeight: 900, letterSpacing: '-1px' }}>FISIOTOOL</span>
        <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ cursor: 'pointer' }}>Producto</span>
          <span style={{ cursor: 'pointer' }}>Casos de éxito</span>
          <span style={{ cursor: 'pointer' }}>Precios</span>
        </div>
        <button style={{
          background: '#fff',
          color: '#000',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '100px',
          fontWeight: 700,
          fontSize: '12px',
          cursor: 'pointer'
        }}>Log in</button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <section style={{ 
        position: 'relative', 
        zIndex: 10, 
        paddingTop: '160px', 
        textAlign: 'center'
      }}>
        
        {/* BADGE IA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '100px',
            background: 'rgba(0,102,255,0.1)',
            border: '1px solid rgba(0,102,255,0.2)',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '40px'
          }}
        >
          <Sparkles size={14} /> Nueva Era: Ana 2.5 Flash
        </motion.div>

        {/* TÍTULO MAGNÉTICO */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 'clamp(48px, 9vw, 100px)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: '0.85',
            margin: '0 auto 40px',
            maxWidth: '1000px',
            background: 'linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.4))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          La Inteligencia que <br /> blinda tu agenda.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '650px',
            margin: '0 auto 60px',
            lineHeight: '1.5'
          }}
        >
          FisioTool reconoce a tus pacientes, cobra fianzas y te devuelve <span style={{color: '#fff'}}>1 hora de vida cada día</span>.
        </motion.p>

        {/* BOTÓN PRINCIPAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '80px' }}
        >
          <button style={{
            background: 'linear-gradient(180deg, #0070f3 0%, #004aab 100%)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(0, 112, 243, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Activar mi IA ahora <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* 2. PREVIEW DEL DASHBOARD (Tarjeta de Cristal) */}
        <div style={{ paddingInline: '20px', perspective: '1000px' }}>
          <motion.div 
            initial={{ opacity: 0, rotateX: 10, y: 40 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              height: '400px',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header Tarjeta */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <div style={{ padding: '60px', opacity: 0.1, fontSize: '40px', fontWeight: 900 }}>DASHBOARD OMEGA</div>
          </motion.div>
        </div>

        {/* 3. SECCIÓN DE RESULTADOS (EL SIMULADOR DE ROI) */}
        <div style={{ paddingInline: '20px', marginTop: '-100px', paddingBottom: '100px' }}>
            <RoiSimulator />
        </div>

      </section>

      <footer style={{ padding: '60px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: 0.4, fontSize: '12px', fontWeight: 600, letterSpacing: '2px' }}>
        FISIOTOOL PRO © 2025 • DISEÑADO PARA EL TALENTO
      </footer>

    </div>
  );
}