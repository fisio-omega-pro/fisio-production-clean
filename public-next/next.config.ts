import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin output: 'export' para que Vercel despliegue con .next y sirva todas las rutas (aviso-legal, devolucion, terminos…)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;