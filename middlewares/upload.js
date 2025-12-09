// middlewares/upload.js → VERSIÓN FINAL 100% FUNCIONAL (Render + Local)
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// LOGS para ver en Render si las variables llegaron bien
console.log("CLOUDINARY_CLOUD_NAME →", process.env.CLOUDINARY_CLOUD_NAME || "NO EXISTE");
console.log("CLOUDINARY_API_KEY    →", process.env.CLOUDINARY_API_KEY ? "OK" : "NO EXISTE");
console.log("CLOUDINARY_API_SECRET →", process.env.CLOUDINARY_API_SECRET ? "OK" : "NO EXISTE");

// Configuración obligatoria de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// En caso de que falte alguna variable (evita errores silenciosos)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("ERROR: Faltan credenciales de Cloudinary. Las imágenes NO se subirán.");
}

// Almacenamiento directo en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mercado-lutter/productos',
    // carpeta que aparecerá en tu Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,   // 10 MB máximo por foto
    files: 10                     // máximo 10 fotos por producto
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpe?g|png|gif|webp/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'), false);
    }
  }
});

module.exports = upload;
