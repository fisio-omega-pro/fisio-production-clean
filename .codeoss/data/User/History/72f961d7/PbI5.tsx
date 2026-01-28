import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FisioTool Pro | Gestión de Élite",
  description: "La inteligencia que blinda tu clínica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}