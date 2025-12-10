// routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // AHORA IMPORTA EL MIDDLEWARE DE CLOUDINARY
const usuarioController = require('../controllers/usuarioController');

// Middleware de seguridad: solo para usuarios logueados
const ensureUser = (req, res, next) => {
  if (req.session.usuario) return next();
  res.redirect('/auth/login');
};

// Aplicar middleware a todas las rutas de este archivo
router.use(ensureUser);

// --- Rutas de Gestión de Productos del Usuario ---
router.get('/productos', usuarioController.showMyProducts);
router.get('/crear-producto', usuarioController.showCreateForm);

// ==============================================================
// --- Usamos el middleware de Cloudinary (upload.single('imagen')) ---
// ==============================================================
router.post('/crear-producto', upload.single('imagen'), usuarioController.createProduct);

router.get('/editar-producto/:id', usuarioController.showEditForm);
router.post('/editar-producto/:id', upload.single('imagen'), usuarioController.updateProduct);
router.delete('/eliminar-producto/:id', usuarioController.deleteProduct);

// --- Rutas de Perfil ---
router.get('/perfil', usuarioController.showProfileForm);
router.post('/perfil', upload.single('imagenPerfil'), usuarioController.updateProfile); // Asumiendo que el campo de perfil es 'imagenPerfil' o similar

module.exports = router;
