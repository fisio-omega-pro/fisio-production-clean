'use client'
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, mouse, ArrowRight } from 'lucide-react';

export default function LinearMoodboard() {
  return (
    <div style={{
      backgroundColor: '#05070a', // Un negro con una gota de azul, más vivo que el negro puro
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* FONDO DE SEDA DIGITAL (AURORA V2) */}
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


      {/* NAV FLOTANTE */}
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
        letterSpacing: '-0.2px'
      }}>
        <span style={{ color: '#fff', fontWeight: 900 }}>FISIOTOOL</span>
        <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ cursor: 'pointer' }}>Producto</span>
          <span style={{ cursor: 'pointer' }}>Método</span>
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
        textAlign: 'center',
        paddingInline: '20px'
      }}>
        
        {/* BADGE VANGUARDISTA */}
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

        {/* TÍTULO ESTILO LINEAR - Grande, pegado y con gradiente sutil */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 'clamp(48px, 10vw, 110px)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: '0.85',
            margin: '0 auto 40px',
            maxWidth: '1000px',
            background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Diseñado para el talento, <br /> no para la vista.
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
            lineHeight: '1.5',
            fontWeight: 400
          }}
        >
          FisioTool es la primera plataforma de gestión médica con <span style={{color: '#fff'}}>Accesibilidad de Grado Superior</span>. Blindamos tu agenda mientras tú cuidas de lo que importa.
        </motion.p>

        {/* BOTÓN CON LUZ (Efecto Líquido) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
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
            boxShadow: '0 0 20px rgba(0, 112, 243, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Activar mi IA ahora <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* 3. LA TARJETA DE CRISTAL (Dashboard Preview) */}
        <div style={{
          marginTop: '100px',
          paddingInline: '20px',
          perspective: '1000px'
        }}>
          <motion.div 
            initial={{ opacity: 0, rotateX: 15, y: 40 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              height: '500px',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px 24px 0 0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              boxShadow: '0 -20px 80px -20px rgba(0,102,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Cabecera de la tarjeta simulada */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px' }}>DASHBOARD OMEGA v1.0</div>
            </div>
            
            {/* Contenido simulado de la tarjeta */}
            <div style={{ padding: '60px', textAlign: 'left' }}>
              <div style={{ width: '40%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '20px' }} />
              <div style={{ width: '80%', height: '100px', background: 'linear-gradient(90deg, rgba(255,255,255,0.03), transparent)', borderRadius: '12px' }} />
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}