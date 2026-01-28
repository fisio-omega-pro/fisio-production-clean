import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FisioTool Pro | Gestión de Élite",
  description: "La inteligencia que blinda tu clínica",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {/* 🚀 ACTIVADOR DE APP PRO (PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('🏎️ FisioTool App: Lista y operativa en este dispositivo.');
                  }).catch(function(err) {
                    console.log('❌ Error en el motor de la App:', err);
                  });
                });
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}