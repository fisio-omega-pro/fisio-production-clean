import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/apiBase';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const backendUrl = `${API_BASE_URL}/api/public/ana-photo/${id}`;
        const response = await fetch(backendUrl);
        if (!response.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('[API proxy ana-photo] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
