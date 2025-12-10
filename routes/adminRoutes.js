// routes/adminRoutes.js (VERSIÓN CORREGIDA PARA CLOUDINARY)

const express = require('express');
const router = express.Router();

// IMPORTACIÓN CRÍTICA: Desestructuramos el objeto para obtener solo 'upload' 
// (El middleware de Multer configurado para Cloudinary).
const { upload } = require('../middlewares/upload'); 
const adminController = require('../controllers/adminController');

// Middleware de Seguridad: Asegurar que solo el admin acceda
const ensureAdmin = (req, res, next) => {
  if (req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
};

// =================================================================
// CÓDIGO ELIMINADO: Ya no necesitamos Multer local ni su configuración
/*
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'producto-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
*/
// =================================================================


// Aplicar el middleware de seguridad a TODAS las rutas de este archivo
router.use(ensureAdmin);

// --- RUTAS DEL PANEL DE ADMINISTRADOR ---
router.get('/dashboard', adminController.showDashboard);
router.get('/productos', adminController.showProducts);
router.get('/usuarios', adminController.showUsers);

// Rutas para editar y eliminar productos
router.get('/editar-producto/:id', adminController.showEditForm);
// USAMOS EL MIDDLEWARE 'upload' IMPORTADO DE CLOUDINARY
router.post('/editar-producto/:id', upload.single('imagen'), adminController.updateProduct);
router.delete('/eliminar-producto/:id', adminController.deleteProduct);

// --- RUTAS NUEVAS AÑADIDAS ---
// Rutas para que el admin edite a otros usuarios
router.get('/editar-usuario/:id', adminController.showUserEditForm);
router.post('/editar-usuario/:id', adminController.updateUser);

module.exports = router;
