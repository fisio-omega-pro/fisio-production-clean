'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, Eye, EyeOff, MapPin, Mail, Lock, Info
} from 'lucide-react';

// LISTA DE PROVINCIAS (ESPAÑA)
const PROVINCIAS = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres",
  "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara",
  "Guipúzcoa", "Huelva", "Huesca", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid",
  "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya",
  "Zamora", "Zaragoza", "Ceuta", "Melilla"
];

export default function OnboardingPro() {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '',
    calle: '', numero: '', ciudad: '', cp: '', provincia: ''
  });

  const update = (field: string, val: string) => setFormData(prev => ({...prev, [field]: val}));

  // Validación en tiempo real del paso 1
  const isStep1Valid = formData.nombre && formData.email.includes('@') && formData.password.length > 5 && formData.calle && formData.ciudad && formData.provincia;

  return (
    <div style={styles.container}>
      {/* Fondo Dinámico (Aurora) */}
      <div style={styles.aurora} />
      
      <motion.div layout style={styles.card}>
        
        {/* BARRA DE PROGRESO */}
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${(step / 4) * 100}%`}} />
        </div>

        <AnimatePresence mode="wait">
          {/* --- PASO 1: IDENTIDAD --- */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={styles.header}>
                <div style={styles.iconBox}><Building2 color="#0066ff" size={24} /></div>
                <div>
                  <h2 style={styles.title}>Identidad Clínica</h2>
                  <p style={styles.subtitle}>Configura la sede principal de tu negocio.</p>
                </div>
              </div>

              {/* NOMBRE CLÍNICA */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>NOMBRE COMERCIAL</label>
                <input 
                  style={styles.inputLg} 
                  placeholder="Ej: Clínica Fisiotool Avanza" 
                  value={formData.nombre}
                  onChange={e => update('nombre', e.target.value)}
                />
                <div style={styles.infoBox}>
                  <Info size={14} color="#0066ff" style={{flexShrink:0}} />
                  <span>Si tienes varias clínicas, podrás añadir el resto desde tu panel de control.</span>
                </div>
              </div>

              {/* DIRECCIÓN (GRID REAL) */}
              <label style={styles.label}>DIRECCIÓN FISCAL</label>
              <div style={styles.gridAddress}>
                <input 
                  style={{...styles.input, gridColumn: 'span 3'}} 
                  placeholder="Calle / Avenida / Plaza" 
                  value={formData.calle} onChange={e => update('calle', e.target.value)}
                />
                <input 
                  style={{...styles.input, gridColumn: 'span 1'}} 
                  placeholder="Nº" 
                  value={formData.numero} onChange={e => update('numero', e.target.value)}
                />
              </div>
              
              <div style={{...styles.grid3, marginTop: '10px'}}>
                <input style={styles.input} placeholder="C.P." value={formData.cp} onChange={e => update('cp', e.target.value)} />
                <input style={styles.input} placeholder="Ciudad" value={formData.ciudad} onChange={e => update('ciudad', e.target.value)} />
                <select 
                  style={styles.select} 
                  value={formData.provincia} 
                  onChange={e => update('provincia', e.target.value)}
                >
                  <option value="">Provincia...</option>
                  {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={styles.divider} />

              {/* CREDENCIALES ADMIN */}
              <label style={styles.label}>CUENTA DE ADMINISTRADOR</label>
              <div style={styles.grid2}>
                <div style={styles.inputWrapper}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input 
                    style={styles.inputWithIcon} 
                    placeholder="Email Corporativo" 
                    type="email"
                    value={formData.email} onChange={e => update('email', e.target.value)}
                  />
                </div>
                
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input 
                    style={styles.inputWithIcon} 
                    placeholder="Contraseña Segura" 
                    type={showPass ? "text" : "password"}
                    value={formData.password} onChange={e => update('password', e.target.value)}
                  />
                  <div onClick={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              {/* BOTÓN SIGUIENTE */}
              <button 
                onClick={() => setStep(2)} 
                disabled={!isStep1Valid}
                style={isStep1Valid ? styles.btnMain : styles.btnDisabled}
              >
                CONFIGURAR HORARIOS <ArrowRight size={18} />
              </button>

            </motion.div>
          )}

          {/* PLACEHOLDER PARA SIGUIENTES PASOS */}
          {step > 1 && (
            <div style={{textAlign:'center', padding:'50px'}}>
              <h3>Próximamente: Paso {step}</h3>
              <button onClick={() => setStep(1)} style={styles.btnSec}>VOLVER ATRÁS</button>
            </div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- ESTILOS "FERRARI" (CSS-IN-JS LIMPIO) ---
const styles: any = {
  container: { minHeight: '100vh', background: '#020305', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Inter", sans-serif' },
  aurora: { position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,102,255,0.15) 0%, transparent 70%)', top: '-20%', right: '-10%', filter: 'blur(80px)', zIndex: 0 },
  
  card: { width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '50px', position: 'relative', zIndex: 1, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)' },
  
  progressBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#0066ff', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },

  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' },
  iconBox: { width: '50px', height: '50px', background: 'rgba(0,102,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 },
  subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '5px' },

  inputGroup: { marginBottom: '25px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px' },
  
  // Inputs de Alta Gama
  input: { width: '100%', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s' },
  inputLg: { width: '100%', padding: '18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', fontSize: '18px', fontWeight: 600, outline: 'none' },
  select: { width: '100%', padding: '16px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', cursor: 'pointer' },

  // Grids Reales
  gridAddress: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '15px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },

  // Elementos Auxiliares
  infoBox: { marginTop: '10px', display: 'flex', gap: '10px', fontSize: '12px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '10px', borderRadius: '10px', alignItems: 'center' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '30px 0' },

  // Iconos dentro de inputs
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '16px', color: 'rgba(255,255,255,0.3)' },
  inputWithIcon: { width: '100%', padding: '16px 16px 16px 45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none' },
  eyeIcon: { position: 'absolute', right: '16px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' },

  // Botones
  btnMain: { marginTop: '40px', width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 20px 40px -10px rgba(0,102,255,0.3)' },
  btnDisabled: { marginTop: '40px', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', border: 'none', padding: '20px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, cursor: 'not-allowed' },
  btnSec: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }
};
