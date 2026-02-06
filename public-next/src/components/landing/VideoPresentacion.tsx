'use client';

import React from 'react';

// Vídeo presentación FisioTool - solo este vídeo en la landing
const YOUTUBE_URL = 'https://youtu.be/sRyEgLpWQjA';
const YOUTUBE_ID = 'sRyEgLpWQjA';

export default function VideoPresentacion() {
  return (
    <section id="presentacion" style={styles.section} aria-label="Vídeo presentación FisioTool">
      <div style={styles.container}>
        <div style={styles.header}>
          <small style={styles.label}>PRESENTACIÓN</small>
          <h2 style={styles.title}>
            Descubre FisioTool en <span style={{ color: '#0066ff' }}>menos de 5 minutos</span>
          </h2>
          <p style={styles.description}>
            Cómo Ana gestiona tu agenda, elimina los no-shows y te devuelve el control de tu clínica.
          </p>
        </div>

        <div style={styles.videoCard}>
          <div style={styles.videoWrapper}>
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
              data-video-url={YOUTUBE_URL}
              title="FisioTool Pro - Vídeo presentación"
              style={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: {
    padding: '80px 5%',
    background: '#020305',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  label: {
    color: '#0066ff',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '2px',
    marginBottom: '10px',
    display: 'block',
  },
  title: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: 900,
    color: '#fff',
    lineHeight: '1.2',
    marginBottom: '16px',
  },
  description: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.5',
  },
  videoCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    width: '100%',
    background: '#000',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
};
