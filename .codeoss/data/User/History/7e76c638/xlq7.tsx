'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        {/* BRAND */}
        <div style={styles.brandCol}>
          <div style={styles.logoBox}>
             {/* Asegúrate de que este logo existe en public/ */}
             <img src="/logo_fisiotool.png" alt="Logo Fisiotool" style={{height: '32px'}} />
             <span style={styles.brandName}>FISIOTOOL</span>
          </div>
          <p style={styles.brandDesc}>
            Tecnología clínica de vanguardia para profesionales exigentes.
          </p>
        </div>

        {/* LINKS */}
        <div style={styles.linksGrid}>
          <div style={styles.linkGroup}>
            <h4 style={styles.groupTitle}>PRODUCTO</h4>
            <Link href="#ventajas" style={styles.link}>Características</Link>
            <Link href="#precios" style={styles.link}>Planes y Precios</Link>
            <Link href="#demo" style={styles.link}>Demo IA</Link>
          </div>

          <div style={styles.linkGroup}>
            <h4 style={styles.groupTitle}>LEGAL</h4>
            <Link href="/aviso-legal" style={styles.link}>Aviso Legal</Link>
            <Link href="/privacidad" style={styles.link}>Política Privacidad</Link>
            <Link href="/rgpd" style={styles.link}>Contrato RGPD</Link>
          </div>

          <div style={styles.linkGroup}>
            <h4 style={styles.groupTitle}>SOPORTE</h4>
            <a href="mailto:ana@fisiotool.com" style={styles.link}>ana@fisiotool.com</a>
            <a href="https://wa.me/34615200612" style={{...styles.link, color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'}}>
              <MessageCircle size={14} /> WhatsApp Soporte
            </a>
          </div>
        </div>
      </div>
      
      <div style={styles.copyright}>
        © 2026 FISIOTOOL PRO — TODOS LOS DERECHOS RESERVADOS
      </div>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: { background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 5% 40px' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '60px', justifyContent: 'space-between' },
  brandCol: { maxWidth: '300px' },
  logoBox: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  brandName: { fontSize: '18px', fontWeight: 900, color: '#fff' },
  brandDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' },
  linksGrid: { display: 'flex', gap: '60px', flexWrap: 'wrap' },
  linkGroup: { display: 'flex', flexDirection: 'column', gap: '15px' },
  groupTitle: { fontSize: '12px', fontWeight: 900, color: '#0066ff', marginBottom: '10px', letterSpacing: '1px' },
  link: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: '0.2s' },
  copyright: { textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px', paddingTop: '40px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '2px' }
};