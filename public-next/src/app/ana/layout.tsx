import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ana - Asistente FisioTool',
  description: 'Chatea con Ana, tu asistente de fisioterapia personal',
  manifest: '/manifest.json',
  themeColor: '#075e54',
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
