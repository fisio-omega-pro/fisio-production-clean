/**
 * 📦 STORAGE SERVICE - GESTOR DE ARCHIVOS
 * Utilidades sobre GCS (Cloud Storage).
 *
 * Nota: En Cloud Run usamos ADC (service account del servicio).
 */
const { Storage } = require('@google-cloud/storage');

// Configuración
const BUCKET_NAME = 'fisiotool-pro-2026-media'; // El cubo que acabamos de crear

// ✅ En Cloud Run usar credenciales del entorno (ADC) y la service account del servicio.
// (No dependemos de key.json dentro del contenedor)
const storage = new Storage({ projectId: 'fisiotool-pro-2026' });

const bucket = storage.bucket(BUCKET_NAME);

/**
 * Genera una URL temporal para subir un archivo (PUT)
 * @param {string} filename - Nombre del archivo (ej: 'logos/clinica_123.png')
 * @param {string} filetype - Tipo de archivo (ej: 'image/png')
 */
const generateUploadUrl = async (filename, filetype) => {
  try {
    const file = bucket.file(filename);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos de validez
      contentType: filetype,
    });

    // Devolvemos la URL de subida y la URL pública final
    return {
      uploadUrl: url,
      publicUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`
    };

  } catch (error) {
    console.error("🔥 [STORAGE] Error generando URL firmada:", error);
    throw new Error("No se pudo preparar la subida del archivo.");
  }
};

const uploadBuffer = async ({ filename, buffer, contentType, cacheControl }) => {
  try {
    const file = bucket.file(filename);
    await file.save(buffer, {
      resumable: false,
      contentType: contentType || 'application/octet-stream',
      metadata: cacheControl ? { cacheControl } : undefined,
    });
    return { filename };
  } catch (error) {
    console.error("🔥 [STORAGE] Error subiendo buffer:", error);
    throw new Error("No se pudo subir el archivo al storage.");
  }
};

const getReadStream = (filename) => {
  const file = bucket.file(filename);
  return file.createReadStream();
};

module.exports = {
  BUCKET_NAME,
  generateUploadUrl,
  uploadBuffer,
  getReadStream,
};