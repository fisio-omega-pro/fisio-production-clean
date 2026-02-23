import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata = {
  title: 'FisioTool Pro - Gestión Clínica con IA',
  description: 'El gestor de fisioterapia más avanzado del mercado. Inteligencia Artificial para administración, marketing y finanzas.',
  // 🚨 ETIQUETAS PWA
  manifest: '/manifest.json', 
  themeColor: '#d4af37',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
  icons: {
    icon: '/logo_fisiotool.png',
    shortcut: '/logo_fisiotool.png',
    apple: '/logo_fisiotool.png',
  },
};

// 🚨 REGISTRO DEL SERVICE WORKER (CLIENTE)
const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => console.log('Service Worker registrado con éxito:', registration.scope))
      .catch((err) => console.error('Fallo en registro de Service Worker:', err));
  }
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(${registerServiceWorker.toString()})()` }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
