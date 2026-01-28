'use client'
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export default function FerrariPreview() {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#0f172a',
      padding: '0',
      margin: '0',
      overflowX: 'hidden'
    }}>
      {/* NAV DE LUJO */}
      <nav style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1100px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '-1px' }}>
          FISIOTOOL <span style={{ color: '#0066ff', fontWeight: 500 }}>PRO</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{
            backgroundColor: '#0066ff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '100px',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 10px 20px rgba(0, 102, 255, 0.2)',
            cursor: 'pointer'
          }}>Probar Gratis</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', paddingTop: '180px', paddingBottom: '100px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#0066ff',
            marginBottom: '32px'
          }}
        >
          <Sparkles size={14} /> IA CONDUCTUAL 2.5
        </motion.div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 90px)',
          fontWeight: 900,
          letterSpacing: '-4px',
          lineHeight: '0.9',
          margin: '0 0 40px 0'
        }}>
          La Inteligencia que <br />
          <span style={{ color: '#0066ff' }}>Blinda tu Agenda.</span>
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#64748b',
          maxWidth: '600px',
          margin: '0 auto 48px',
          lineHeight: '1.6'
        }}>
          Ana reconoce a tus pacientes, cobra fianzas y te devuelve <span style={{color: '#0f172a', fontWeight: 'bold'}}>1 hora de vida cada día</span>.
        </p>

        {/* BOTONES */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button style={{
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '24px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}>Activar mi IA ahora</button>
        </div>

        {/* VIDEO MOCKUP */}
        <div style={{
          marginTop: '80px',
          padding: '0 20px'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            aspectRatio: '16/9',
            backgroundColor: '#0f172a',
            borderRadius: '40px',
            border: '12px solid white',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.4', position: 'absolute' }} 
            />
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              cursor: 'pointer'
            }}>
              <Play fill="#0066ff" color="#0066ff" />
            </div>
            <div style={{ position: 'absolute', bottom: '24px', color: 'white', opacity: 0.6, fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
              TESTIMONIO: CLÍNICA DR. MURILLO
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}