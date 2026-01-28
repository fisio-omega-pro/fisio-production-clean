import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // ✅ Obliga a Next.js a crear una carpeta 'out' con todo el diseño
  images: {
    unoptimized: true, // Necesario para que las imágenes funcionen sin servidor Next activo
  },
};

export default nextConfig;