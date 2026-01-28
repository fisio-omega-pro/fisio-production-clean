'use client';

import React from 'react';
import { Star, Quote, PlayCircle } from 'lucide-react';

// DATOS REALES (Solo tienes que cambiar el 'youtubeId')
const MAIN_VIDEO = {
  id: "main",
  youtubeId: "dQw4w9WgXcQ", // Poner aquí el ID del video destacado (ej: el trailer de tu app o el mejor testimonio)
  title: "Cómo la Clínica San Juan facturó 5.000€ extra el primer mes",
  author: "Dr. Carlos M. - Director Médico"
};

const TESTIMONIALS = [
  {
    id: 1,
    youtubeId: "LXb3EKWsInQ", // ID de video de YouTube
    author: "Laura G.",
    role: "Fisioterapeuta",
    quote: "Ana gestiona mis citas mientras yo disfruto de mi fin de semana."
  },
  {
    id: 2,
    youtubeId: "jNQXAC9IVRw",
    author: "Clínica Avanza",
    role: "Centro Deportivo",
    quote: "El sistema de fianzas ha eliminado los no-shows al 100%."
  },
  {
    id: 3,
    youtubeId: "9bZkp7q19f0", // Gangnam style de ejemplo, cámbialo por tus videos reales
    author: "OsteoLife",
    role: "Madrid",
    quote: "La transcripción de voz a texto es brujería. Ahorro 1h al día."
  }
];

export default function TestimonialsGallery() {
  return (
    <section id="testimonios" style={styles.section}>
      <div style={styles.container}>
        
        {/* CABECERA */}
        <div style={styles.header}>
          <small style={styles.label}>COMUNIDAD DE ÉLITE</small>
          <h2 style={styles.title}>No confíes en nosotros. <br /><span style={{color:'#0066ff'}}>Confía en tus compañeros.</span></h2>
          <p style={styles.description}>
            Más de 500 clínicas ya han digitalizado su negocio. 
            Únete y obtén <strong>1 mes gratis</strong> a cambio de contarnos tu experiencia.
          </p>
        </div>

        {/* VIDEO PRINCIPAL (FEATURED) */}
        <div style={styles.mainVideoCard}>
          <div style={styles.videoWrapperMain}>
            <iframe 
              src={`https://www.youtube.com/embed/${MAIN_VIDEO.youtubeId}?rel=0&modestbranding=1`} 
              title="Testimonio Principal"
              style={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
          <div style={styles.mainMeta}>
            <div style={styles.badge}>CASO DE ÉXITO DESTACADO</div>
            <h3 style={styles.mainTitle}>{MAIN_VIDEO.title}</h3>
            <p style={{opacity:0.6}}>{MAIN_VIDEO.author}</p>
          </div>
        </div>

        {/* PARRILLA DE 3 VIDEOS */}
        <div style={styles.grid}>
          {TESTIMONIALS.map((t) => (
            <div key={t.id} style={styles.card}>
              <div style={styles.videoWrapperSmall}>
                <iframe 
                  src={`https://www.youtube.com/embed/${t.youtubeId}?rel=0&modestbranding=1`} 
                  style={styles.iframe}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div style={styles.cardBody}>
                <div style={styles.stars}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={styles.quote}>"{t.quote}"</p>
                <div style={styles.authorBox}>
                  <strong style={{color:'#fff', fontSize:'13px'}}>{t.author}</strong>
                  <span style={{fontSize:'11px', opacity:0.5}}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div style={styles.footerCta}>
          <p style={{fontSize:'14px', color:'rgba(255,255,255,0.6)'}}>
            ¿Ya eres usuario? <span style={{color:'#fff', fontWeight:700}}>Sube tu video y te regalamos 30 días.</span>
          </p>
        </div>

      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: '#020305' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  
  header: { textAlign: 'center', marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', marginBottom: '10px', display: 'block' },
  title: { fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: '1.2', marginBottom: '20px' },
  description: { fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' },

  // VIDEO GRANDE
  mainVideoCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden', marginBottom: '40px' },
  videoWrapperMain: { position: 'relative', paddingBottom: '56.25%', height: 0, width: '100%', background:'#000' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  mainMeta: { padding: '30px', textAlign: 'left' },
  badge: { display: 'inline-block', background: 'rgba(0,102,255,0.1)', color: '#0066ff', fontSize: '10px', fontWeight: 900, padding: '5px 10px', borderRadius: '6px', marginBottom: '10px' },
  mainTitle: { fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '5px' },

  // GRID 3 VIDEOS
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  videoWrapperSmall: { position: 'relative', paddingBottom: '56.25%', height: 0, width: '100%', background:'#000' },
  
  cardBody: { padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' },
  stars: { display: 'flex', gap: '3px', marginBottom: '15px' },
  quote: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '20px', flex: 1 },
  authorBox: { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', flexDirection: 'column' },

  footerCta: { textAlign: 'center', marginTop: '50px', padding: '20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '100px', maxWidth: '500px', margin: '50px auto 0' }
};