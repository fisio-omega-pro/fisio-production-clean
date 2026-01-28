import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FisioTool Pro - Gestión Clínica con IA',
  description: 'El gestor de fisioterapia más avanzado del mercado. Inteligencia Artificial para administración, marketing y finanzas.',
  // 🚨 ETIQUETAS PWA
  manifest: '/manifest.json', 
  themeColor: '#d4af37',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
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
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(${registerServiceWorker.toString()})()` }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
