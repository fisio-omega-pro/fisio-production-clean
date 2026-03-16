import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fisio-backend-omega-740657183492.europe-west1.run.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[ANA PROSPECTO API] Forwarding request to backend:', body);

    const response = await fetch(`${BACKEND_URL}/api/public/ana-prospecto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    console.log('[ANA PROSPECTO API] Backend response:', data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[ANA PROSPECTO API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        response: 'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo.' 
      },
      { status: 500 }
    );
  }
}
