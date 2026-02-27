import { Metadata } from 'next';

export const viewport = {
  themeColor: '#0066ff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'FisioTool Pro - Plataforma Accesible para Fisioterapeutas Invidentes',
  description: 'Software de gestión clínica diseñado específicamente para fisioterapeutas invidentes. Control total por voz, agenda inteligente y blindaje económico. Navegación 100% accesible.',
  keywords: 'fisioterapia invidentes, software accesible, gestión clínica voz, agenda automática, fisioterapeuta discapacidad visual',
  robots: 'index, follow',
  openGraph: {
    title: 'FisioTool Pro - Independencia Total para Fisioterapeutas Invidentes',
    description: 'La única plataforma de gestión clínica diseñada desde cero para ser navegada sin vista. Control por voz, agenda inteligente y blindaje económico.',
    type: 'website',
    locale: 'es_ES'
  }
};

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
