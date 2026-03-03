const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, Timestamp } = require('../config/firebase');

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo debe ser una imagen'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
});

// Función para guardar foto de Ana
const uploadAnaPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No se proporcionó ningún archivo' });
        }

        const { type } = req.body;
        
        if (type !== 'ana_photo') {
            return res.status(400).json({ success: false, error: 'Tipo de archivo no válido' });
        }

        // Generar nombre único para el archivo
        const extension = path.extname(req.file.originalname);
        const fileName = `ana_${req.clinicId}_${Date.now()}${extension}`;
        
        // Crear directorio si no existe
        const uploadDir = path.join(__dirname, '../public/uploads/ana');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Guardar archivo
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);

        // Generar URL pública
        const publicUrl = `/uploads/ana/${fileName}`;

        // Actualizar configuración de Ana en la base de datos
        await db.collection('clinicas').doc(req.clinicId).update({
            ana_photo: publicUrl,
            ana_use_clinic_logo: false,
            updated_at: Timestamp.now()
        });

        console.log('✅ Foto de Ana subida:', publicUrl);

        res.json({
            success: true,
            url: publicUrl,
            message: 'Foto de Ana subida correctamente'
        });

    } catch (error) {
        console.error('🔥 Error subiendo foto de Ana:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al subir la foto'
        });
    }
};

module.exports = {
    upload,
    uploadAnaPhoto
};
