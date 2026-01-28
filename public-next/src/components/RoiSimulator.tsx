'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Euro } from 'lucide-react';

export default function RoiSimulator() {
  const [pacientes, setPacientes] = useState(120);
  const [precio, setPrecio] = useState(55);
  const [noShow, setNoShow] = useState(15);
  const [ahorro, setAhorro] = useState(0);

  useEffect(() => {
    // Lógica Ferrari: (Pérdida por no-show evitada) + (Valor del tiempo de gestión recuperado)
    const perdidaAnual = (pacientes * 12) * precio * (noShow / 100);
    const ahorroNoShow = perdidaAnual * 0.85; // Ana recupera el 85% de los no-shows
    const ahorroTiempo = (pacientes * 12 * 0.15) * precio; // Recuperamos 10 min por paciente en gestión
    setAhorro(Math.round(ahorroNoShow + ahorroTiempo));
  }, [pacientes, precio, noShow]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '40px',
        maxWidth: '900px',
        margin: '60px auto',
        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp className="text-blue-500" /> Calculador de Rentabilidad Pro
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Desliza para ver cuánto dinero está dejando de ganar tu clínica hoy mismo.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
        {/* COLUMNA CONTROLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>PACIENTES / MES</label>
              <span style={{ color: '#0070f3', fontWeight: 800 }}>{pacientes}</span>
            </div>
            <input 
              type="range" min="20" max="500" value={pacientes} 
              onChange={(e) => setPacientes(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#0070f3', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>PRECIO SESIÓN (€)</label>
              <span style={{ color: '#0070f3', fontWeight: 800 }}>{precio}€</span>
            </div>
            <input 
              type="range" min="30" max="150" value={precio} 
              onChange={(e) => setPrecio(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#0070f3', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>% NO-SHOW (CANCELACIONES)</label>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>{noShow}%</span>
            </div>
            <input 
              type="range" min="5" max="40" value={noShow} 
              onChange={(e) => setNoShow(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* COLUMNA RESULTADO (EL IMPACTO) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,112,243,0.1) 0%, rgba(0,0,0,0) 100%)',
          borderRadius: '24px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid rgba(0,112,243,0.2)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: '#38bdf8', marginBottom: '10px' }}>AHORRO ANUAL ESTIMADO</span>
          <motion.h2 
            key={ahorro}
            initial={{ scale: 1.1, color: '#38bdf8' }}
            animate={{ scale: 1, color: '#fff' }}
            style={{ fontSize: '64px', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}
          >
            {ahorro.toLocaleString()}€
          </motion.h2>
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ fontSize: '11px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} /> +240h tiempo/año
            </div>
            <div style={{ fontSize: '11px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={12} /> Agenda Blindada
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}