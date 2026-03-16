import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // Crear directorio uploads si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'ana');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directorio ya existe, está bien
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const filename = `ana_${timestamp}.${file.type.split('/')[1]}`;
    const filepath = join(uploadsDir, filename);

    // Guardar archivo localmente
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generar URL pública (para desarrollo)
    const publicUrl = `http://localhost:3000/uploads/ana/${filename}`;

    console.log('✅ Foto de Ana subida localmente:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename
    });

  } catch (error: any) {
    console.error('🔥 [API Ana Photo Dev] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
