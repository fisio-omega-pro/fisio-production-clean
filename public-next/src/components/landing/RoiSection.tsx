'use client';

import React, { useState } from 'react';
import { TrendingDown, AlertTriangle } from 'lucide-react';

export default function RoiSection() {
  const [precio, setPrecio] = useState(50);
  const [citasSemana, setCitasSemana] = useState(40);
  const [tasaFallo, setTasaFallo] = useState(15);

  // Cálculos
  const perdidasSemana = (citasSemana * (tasaFallo / 100)) * precio;
  const perdidasMes = perdidasSemana * 4;
  const perdidasAno = perdidasMes * 12;

  return (
    <section id="roi" style={styles.section} aria-labelledby="roi-title">
      <div style={styles.container}>
        
        {/* COLUMNA 1: CALCULADORA INTERACTIVA */}
        <div style={styles.calcCard}>
          <div style={styles.calcHeader}>
            <TrendingDown color="#0066ff" size={32} />
            <h3 style={styles.calcTitle}>Simulador de Pérdidas</h3>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Precio medio por sesión (€)</label>
            <input type="range" min="20" max="150" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} style={styles.range} />
            <div style={styles.valueDisplay}>{precio}€</div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Citas agendadas por semana</label>
            <input type="range" min="10" max="200" value={citasSemana} onChange={(e) => setCitasSemana(Number(e.target.value))} style={styles.range} />
            <div style={styles.valueDisplay}>{citasSemana} citas</div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tasa de absentismo (No-shows) %</label>
            <input type="range" min="0" max="50" value={tasaFallo} onChange={(e) => setTasaFallo(Number(e.target.value))} style={styles.range} />
            <div style={styles.valueDisplay}>{tasaFallo}%</div>
          </div>

          <div style={styles.resultBox}>
            <div style={styles.resultLabel}>DINERO QUEMADO AL AÑO</div>
            <div style={styles.resultValue}>{perdidasAno.toLocaleString()}€</div>
            <p style={styles.resultSub}>*Equivalente a {Math.floor(perdidasAno / 1500)} meses de alquiler tirados.</p>
          </div>
        </div>

        {/* COLUMNA 2: TEXTO PERSUASIVO (SEO) */}
        <div style={styles.textContent}>
          <small style={styles.badge}>IMPACTO FINANCIERO</small>
          <h2 id="roi-title" style={styles.mainTitle}>No es solo una cita perdida. <br />Es un agujero en tu bolsillo.</h2>
          
          <div style={styles.textBlock}>
            <h4 style={styles.subTitle}>El Coste Invisible del "No-Show"</h4>
            <p style={styles.paragraph}>
              Cuando un paciente no aparece, no solo dejas de ganar esos {precio}€. 
              <strong>Sigues pagando alquiler, luz, autónomos y sueldos</strong> durante esa hora vacía. 
              En realidad, esa hora te cuesta dinero.
            </p>
          </div>

          <div style={styles.textBlock}>
            <h4 style={styles.subTitle}>La Solución: Fianza Automática</h4>
            <p style={styles.paragraph}>
              Ana elimina este problema de raíz. Al solicitar una fianza (ej. 15€) durante la reserva online, 
              el compromiso psicológico del paciente se dispara. 
              <br/><br/>
              <strong>Resultado:</strong> El absentismo baja del 15% al 0.2% en la primera semana.
            </p>
          </div>

          {/* CAJA DE AVISO AMARILLA MEJORADA */}
          <div style={styles.alertBox}>
            <AlertTriangle size={20} color="#facc15" />
            <span style={{fontSize:'14px', color:'#facc15', fontWeight: 600}}>
              FisioTool Pro se paga solo recuperando apenas 2 citas al mes.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: '#020305' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center' },
  
  // Calculadora Styles
  calcCard: { background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)' },
  calcHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  calcTitle: { fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 },
  inputGroup: { marginBottom: '25px' },
  label: { display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' },
  
  // CORRECCIÓN: Sliders Azules
  range: { width: '100%', cursor: 'pointer', accentColor: '#0066ff' }, 
  
  valueDisplay: { textAlign: 'right', color: '#fff', fontWeight: 700, marginTop: '5px' },
  
  // CORRECCIÓN: Resultado en Azul
  resultBox: { background: 'rgba(0,102,255,0.1)', padding: '25px', borderRadius: '20px', textAlign: 'center', marginTop: '30px', border: '1px solid rgba(0,102,255,0.3)' },
  resultLabel: { fontSize: '12px', color: '#0066ff', fontWeight: 900, letterSpacing: '2px' },
  resultValue: { fontSize: '48px', fontWeight: 900, color: '#0066ff', margin: '10px 0' },
  resultSub: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },

  // Text Styles
  textContent: { textAlign: 'left' },
  badge: { color: '#0066ff', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' },
  mainTitle: { fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: '1.1', marginBottom: '40px' },
  textBlock: { marginBottom: '30px' },
  subTitle: { fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '10px' },
  paragraph: { fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' },
  
  // CORRECCIÓN: Amarillo Brillante
  alertBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(250, 204, 21, 0.1)', borderRadius: '12px', border: '1px solid rgba(250, 204, 21, 0.3)' }
};