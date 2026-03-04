import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/apiBase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Manejar params como una promesa si es necesario (Next.js 15)
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Determinar si es una foto de Ana o un logo normal
        const { searchParams } = new URL(request.url);
        const isPhoto = searchParams.get('photo') === 'true';

        // URL del backend (GET)
        const backendUrl = `${API_BASE_URL}/api/public/logo/${id}${isPhoto ? '?photo=true' : ''}`;

        console.log('🔍 [API PROXY LOGO] Fetching:', backendUrl);

        const response = await fetch(backendUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('🔥 [API PROXY LOGO] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
