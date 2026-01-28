/**
 * 📦 STORAGE SERVICE - GESTOR DE ARCHIVOS
 * Genera URLs firmadas para subidas seguras directas a Google Cloud.
 */
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Configuración
const BUCKET_NAME = 'fisiotool-pro-2026-media'; // El cubo que acabamos de crear
const keyPath = path.join(__dirname, '../config/key.json');

// Inicialización con la llave maestra
const storage = new Storage({
  projectId: 'fisiotool-pro-2026',
  keyFilename: keyPath
});

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

module.exports = { generateUploadUrl };