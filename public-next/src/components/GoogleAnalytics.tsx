'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const COOKIE_CONSENT_KEY = 'fisiotool_cookie_consent';
// ID de medición GA4. Puedes sobreescribir con NEXT_PUBLIC_GA_MEASUREMENT_ID en Vercel.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QNG1ZJT0BL';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'accepted') return;

    const loadGtag = () => {
      if (loaded.current) return;
      loaded.current = true;

      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        gtag('event', 'page_view', { page_path: window.location.pathname, page_title: document.title });
      `;
      document.head.appendChild(script2);
    };

    loadGtag();

    const handleConsent = (e: CustomEvent) => {
      if (e.detail === 'accepted') loadGtag();
    };
    window.addEventListener('fisiotool-cookie-consent', handleConsent as EventListener);
    return () => window.removeEventListener('fisiotool-cookie-consent', handleConsent as EventListener);
  }, []);

  // Enviar page_view al cambiar de ruta (solo si GA ya está cargado y consentimiento aceptado)
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
    if (localStorage.getItem(COOKIE_CONSENT_KEY) !== 'accepted') return;
    if (typeof (window as any).gtag !== 'function') return;

    (window as any).gtag('event', 'page_view', {
      page_path: pathname || window.location.pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
