// middlewares/upload.js → ESTE ES EL QUE SÍ FUNCIONA EN RENDER
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// ESTOS LOGS TIENEN QUE APARECER EN RENDER
console.log("CLOUDINARY CARGADO CORRECTAMENTE");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "FALTA");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "OK" : "FALTA");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "OK" : "FALTA");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mercado-lutter/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

module.exports = upload;
