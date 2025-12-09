// middlewares/upload.js  → VERSIÓN FINAL 100% FUNCIONAL EN RENDER
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// LOGS IMPORTANTES: así vemos en Render si llegan las variables
console.log("CLOUDINARY_CLOUD_NAME →", process.env.CLOUDINARY_CLOUD_NAME || "NO EXISTE");
console.log("CLOUDINARY_API_KEY    →", process.env.CLOUDINARY_API_KEY ? "OK" : "NO EXISTE");
console.log("CLOUDINARY_API_SECRET →", process.env.CLOUDINARY_API_SECRET ? "OK" : "NO EXISTE");

// Configuración obligatoria de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("ERROR: Faltan variables de Cloudinary. No se subirán imágenes.");
}

// Almacenamiento directo en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'mercado-lutter/productos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: `producto-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10 MB por imagen
    files: 10                    // máximo 10 imágenes
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes permitidas'), false);
    }
  }
});

module.exports = upload;
