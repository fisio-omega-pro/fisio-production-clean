import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, clinicId } = body;

    if (!message || !clinicId) {
      return NextResponse.json(
        { success: false, error: 'Mensaje y clinicId requeridos' },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendUrl = 'https://fisio-backend-omega-740657183492.europe-west1.run.app/api/public/ana-chat';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, clinicId })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Error del backend' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('🔥 [API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
