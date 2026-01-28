'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ExternalLink } from 'lucide-react';

// Configuración de enlaces para fácil mantenimiento
const FOOTER_DATA = {
  producto: [
    { label: 'Características', href: '#ventajas' },
    { label: 'Planes y Precios', href: '#precios' },
    { label: 'Simulación IA', href: '#demo' },
  ],
  legal: [
    { label: 'Privacidad Pro', href: '/privacidad' },
    { label: 'Términos de Servicio', href: '/terminos' },
    { label: 'Contrato RGPD', href: '/rgpd' },
    { label: 'Aviso Legal', href: '/aviso-legal' },
  ],
  soporte: [
    { label: 'ana@fisiotool.com', href: 'mailto:ana@fisiotool.com', isEmail: true },
    { label: 'Soporte Directo', href: 'https://wa.me/34615200612', isWhatsApp: true },
  ]
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* BRAND SECTION */}
        <div style={styles.brandCol}>
          <h2 style={styles.brandName}>FISIOTOOL</h2>
          <p style={styles.brandDesc}>
            La primera arquitectura de gestión clínica impulsada por Inteligencia Conductual y diseñada para la soberanía económica del profesional sanitario.
          </p>
        </div>

        {/* LINKS GRID */}
        <div style={styles.linksGrid}>
          {/* MARCO LEGAL */}
          <div style={styles.linkGroup}>
            <h4 style={styles.groupTitle}>MARCO LEGAL</h4>
            {FOOTER_DATA.legal.map((link) => (
              <Link key={link.href} href={link.href} style={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* SOPORTE */}
          <div style={styles.linkGroup}>
            <h4 style={styles.groupTitle}>SOPORTE</h4>
            {FOOTER_DATA.soporte.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                target={link.isWhatsApp ? "_blank" : undefined}
                rel={link.isWhatsApp ? "noopener noreferrer" : undefined}
                style={{
                  ...styles.link, 
                  ...(link.isWhatsApp ? styles.whatsappLink : {})
                }}
              >
                {link.isWhatsApp && <MessageCircle size={14} style={{marginRight: 6}} />}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* COPYRIGHT */}
      <div style={styles.copyrightContainer}>
        <p style={styles.copyrightText}>
          © {currentYear} FISIOTOOL SOFTWARE LLC. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    background: '#000000',
    color: '#ffffff',
    padding: '80px 5% 40px 5%',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderTop: '1px solid #111'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '40px'
  },
  brandCol: {
    flex: '1 1 300px',
    maxWidth: '450px'
  },
  brandName: {
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '24px',
    color: '#fff'
  },
  brandDesc: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#666',
    maxWidth: '380px'
  },
  linksGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '80px'
  },
  linkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  groupTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#0055ff', // Azul eléctrico similar a la imagen
    letterSpacing: '1.5px',
    marginBottom: '15px',
    textTransform: 'uppercase'
  },
  link: {
    fontSize: '14px',
    color: '#888',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer'
  },
  whatsappLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#888' // Mantener gris para no romper la estética, o #25D366 si quieres destacar
  },
  copyrightContainer: {
    marginTop: '100px',
    paddingTop: '30px',
    borderTop: '1px solid #111',
    textAlign: 'center'
  },
  copyrightText: {
    fontSize: '11px',
    color: '#444',
    letterSpacing: '2px',
    fontWeight: 500,
    textTransform: 'uppercase'
  }
};