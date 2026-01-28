'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: "¿Es FisioTool compatible con la RGPD europea?", a: "Absolutamente. Todos los datos se almacenan en servidores en Bélgica (Región Europa-Oeste) bajo cifrado AES-256. Cumplimos con la normativa DPA Salud de la UE." },
  { q: "¿Cómo funcionan los cobros de fianzas?", a: "Integramos Stripe Connect. El dinero va del paciente a tu cuenta bancaria directamente. Nosotros solo facilitamos la tecnología. También puedes aceptar Bizum o efectivo." },
  { q: "¿Puedo importar mis pacientes actuales?", a: "Sí. Disponemos de una herramienta de importación masiva vía CSV. Ana reconocerá a tus pacientes antiguos automáticamente." },
  { q: "¿Hay permanencia?", a: "Ninguna. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control con un solo clic." }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.textSide}>
          <h2 style={styles.title}>Preguntas Frecuentes</h2>
          <p style={styles.desc}>Resolvemos tus dudas técnicas y operativas.</p>
        </div>
        
        <div style={styles.list}>
          {FAQS.map((item, i) => (
            <div key={i} style={styles.item}>
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)} 
                style={styles.questionBtn}
              >
                <span style={{fontWeight: 700, color: '#fff'}}>{item.q}</span>
                {openIndex === i ? <ChevronUp size={20} color="#0066ff" /> : <ChevronDown size={20} color="rgba(255,255,255,0.3)" />}
              </button>
              
              {openIndex === i && (
                <div style={styles.answer}>
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: '#020305' },
  container: { maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' },
  textSide: { textAlign: 'left' },
  title: { fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '10px' },
  desc: { fontSize: '16px', color: 'rgba(255,255,255,0.5)' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  item: { background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  questionBtn: { width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '16px' },
  answer: { padding: '0 20px 20px 20px', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }
};