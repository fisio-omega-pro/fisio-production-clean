import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId');
  
  if (!clinicId) {
    // Return default manifest if no clinic ID
    return new NextResponse(JSON.stringify({
      name: "FisioTool Pro",
      short_name: "FisioTool",
      description: "El gestor de clínicas con IA más avanzado. Tu CFO y Asistente 24/7.",
      start_url: "/ana",
      display: "standalone",
      background_color: "#05070a",
      theme_color: "#075e54",
      scope: "/",
      icons: [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    }), {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  try {
    // Get clinic data to fetch logo
    const clinicResponse = await fetch(`${process.env.API_BASE_URL}/api/public/clinic-info?clinicId=${clinicId}`);
    
    if (clinicResponse.ok) {
      const clinicData = await clinicResponse.json();
      
      if (clinicData.success && clinicData.data?.logo_url) {
        // Return custom manifest with clinic logo
        return new NextResponse(JSON.stringify({
          name: `${clinicData.data.nombre_clinica || 'FisioTool Pro'} - FisioTool`,
          short_name: clinicData.data.nombre_clinica?.slice(0, 12) || "FisioTool",
          description: `Gestión clínica para ${clinicData.data.nombre_clinica || 'tu clínica'}. El gestor con IA más avanzado.`,
          start_url: `/ana?clinic=${clinicId}`,
          display: "standalone",
          background_color: "#05070a",
          theme_color: "#075e54",
          scope: "/",
          icons: [
            {
              src: clinicData.data.logo_url,
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: clinicData.data.logo_url,
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        }), {
          headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error fetching clinic data for manifest:', error);
  }

  // Fallback to default manifest
  return new NextResponse(JSON.stringify({
    name: "FisioTool Pro",
    short_name: "FisioTool",
    description: "El gestor de clínicas con IA más avanzado. Tu CFO y Asistente 24/7.",
    start_url: "/ana",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#075e54",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  }), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
