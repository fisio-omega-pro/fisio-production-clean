import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json(
        { success: false, error: 'clinicId is required' },
        { status: 400 }
      );
    }

    // Llamar al backend para obtener datos del dashboard
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/dashboard/data?clinicId=${clinicId}`);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in dashboard data API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
