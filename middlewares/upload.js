// middlewares/upload.js → VERSIÓN FINAL QUE FUNCIONA EN RENDER AL 100%
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// LOGS PARA CONFIRMAR QUE TODO ESTÁ BIEN
console.log("CLOUDINARY CARGADO CORRECTAMENTE");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "FALTA");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "OK" : "FALTA");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "OK" : "FALTA");

// CONFIGURACIÓN DE CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ALMACENAMIENTO EN CLOUDINARY
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mercado-lutter/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

// MULTER CON CLOUDINARY
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB por imagen
    files: 10                   // máximo 10 imágenes
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

module.exports = upload;
