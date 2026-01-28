'use client';

import React from 'react';
import { Play, Star } from 'lucide-react';

// MOCK DATA: Cuando tengas los vídeos reales, cambiarás estas URLs
const TESTIMONIOS = [
  {
    id: 1,
    nombre: "Dr. Alejandro Murillo",
    clinica: "Clínica Avanza (Madrid)",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
    texto: "Desde que uso Ana, no he tenido un solo hueco libre en 3 meses."
  },
  {
    id: 2,
    nombre: "Dra. Sofía Valdés",
    clinica: "FisioSport (Valencia)",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
    texto: "La historia clínica por voz es magia. Termino mi jornada a mi hora por fin."
  },
  {
    id: 3,
    nombre: "Carlos R.",
    clinica: "Osteopatía Centro (Sevilla)",
    img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
    texto: "Mis pacientes están encantados con la atención por WhatsApp 24/7."
  }
];

export default function TestimonialsGallery() {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <small style={styles.label}>CASOS DE ÉXITO</small>
        <h2 style={styles.title}>Clínicas que ya han <br/>dado el salto.</h2>
      </div>

      <div style={styles.grid}>
        {TESTIMONIOS.map((t) => (
          <div key={t.id} style={styles.card}>
            {/* VIDEO THUMBNAIL */}
            <div style={styles.videoFrame}>
              <div style={styles.playButton}>
                <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: '4px' }} />
              </div>
              <img src={t.img} alt={`Testimonio de ${t.nombre}`} style={styles.img} />
              <div style={styles.overlay} />
            </div>
            
            {/* INFO */}
            <div style={styles.cardBody}>
              <div style={styles.stars}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={styles.quote}>"{t.texto}"</p>
              <div style={styles.author}>
                <strong style={{color:'#fff'}}>{t.nombre}</strong>
                <span style={{fontSize:'12px', opacity:0.5}}>{t.clinica}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <p style={{ opacity: 0.4, fontSize: '14px' }}>
          ¿Quieres ver más? Visita nuestro canal de <a href="#" style={{color:'#fff', fontWeight:700}}>YouTube</a>.
        </p>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: '#050a14' },
  header: { textAlign: 'center', marginBottom: '60px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' },
  title: { fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: '1.1' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' },
  
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', transition: '0.3s' },
  videoFrame: { height: '200px', position: 'relative', cursor: 'pointer' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', transition: '0.3s' },
  playButton: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, border: '1px solid rgba(255,255,255,0.5)' },
  
  cardBody: { padding: '30px' },
  stars: { display: 'flex', gap: '4px', marginBottom: '15px' },
  quote: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '20px' },
  author: { display: 'flex', flexDirection: 'column' }
};