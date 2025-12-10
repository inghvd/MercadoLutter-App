// config/cloudinary.js

const cloudinary = require('cloudinary').v2;

// Usamos la configuración explícita y robusta
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, 
});

module.exports = cloudinary;
