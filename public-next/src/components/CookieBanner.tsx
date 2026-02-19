'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'fisiotool_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== 'accepted' && saved !== 'rejected') {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fisiotool-cookie-consent', { detail: 'accepted' }));
    }
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      style={styles.wrapper}
    >
      <div style={styles.banner}>
        <div style={styles.iconWrap}>
          <Cookie size={24} color="#00f2ff" />
        </div>
        <div style={styles.content}>
          <p style={styles.text}>
            Utilizamos cookies técnicas necesarias para el funcionamiento y la seguridad de la plataforma.
            Las cookies de análisis solo se activan si aceptas.{' '}
            <Link href="/cookies" style={styles.link}>
              Política de cookies
            </Link>
          </p>
          <div style={styles.actions}>
            <button type="button" onClick={reject} style={styles.btnReject}>
              Rechazar no esenciales
            </button>
            <button type="button" onClick={accept} style={styles.btnAccept}>
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: '16px',
    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
  },
  banner: {
    pointerEvents: 'auto',
    maxWidth: '600px',
    width: '100%',
    background: 'rgba(15, 23, 42, 0.98)',
    border: '1px solid rgba(0, 242, 255, 0.2)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  iconWrap: {
    flexShrink: 0,
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(0, 242, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.5,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '14px',
  },
  link: {
    color: '#00f2ff',
    textDecoration: 'underline',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  btnReject: {
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 700,
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
  },
  btnAccept: {
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: 700,
    border: 'none',
    borderRadius: '10px',
    background: '#0066ff',
    color: '#fff',
    cursor: 'pointer',
  },
};
