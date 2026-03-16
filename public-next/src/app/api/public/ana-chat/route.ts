import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, clinicId, userName, userEmail, userPhone, history } = body;

    if (!message || !clinicId) {
      return NextResponse.json(
        { success: false, error: 'Mensaje y clinicId requeridos' },
        { status: 400 }
      );
    }

    // Forward to backend
    const { API_BASE_URL } = await import('@/lib/apiBase');
    const backendUrl = `${API_BASE_URL}/api/public/ana-chat`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Clinic-ID': clinicId
      },
      body: JSON.stringify({ message, clinicId, userName, userEmail, userPhone, history })
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
