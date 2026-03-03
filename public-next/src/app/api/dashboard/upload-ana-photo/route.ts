import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No se proporcionó ningún archivo' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'El archivo debe ser una imagen' },
                { status: 400 }
            );
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'La imagen no puede superar los 5MB' },
                { status: 400 }
            );
        }

        // Obtener token de autenticación
        const token = request.headers.get('authorization');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Enviar al backend
        const { API_BASE_URL } = await import('@/lib/apiBase');
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        backendFormData.append('type', type);

        const response = await fetch(`${API_BASE_URL}/api/dashboard/upload-ana-photo`, {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: backendFormData
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
        console.error('🔥 [API Ana Photo] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
