import { Metadata } from 'next';

export const viewport = {
  themeColor: '#075e54',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FisioTool',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Ana - Asistente FisioTool',
    description: 'Chatea con Ana, tu asistente de fisioterapia personal',
    url: '/ana',
    siteName: 'FisioTool',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
