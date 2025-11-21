// routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usuarioController = require('../controllers/usuarioController');

// Middleware de seguridad: solo para usuarios logueados
const ensureUser = (req, res, next) => {
  if (req.session.usuario) return next();
  res.redirect('/auth/login');
};

// --- CONFIGURACIÓN DE MULTER (CLAVE) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `producto-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Aplicar middleware a todas las rutas de este archivo
router.use(ensureUser);

// --- Rutas de Gestión de Productos del Usuario ---
router.get('/productos', usuarioController.showMyProducts);
router.get('/crear-producto', usuarioController.showCreateForm);

// ==============================================================
// --- LÍNEA CORREGIDA: AÑADIMOS upload.single('imagen') ---
// ==============================================================
router.post('/crear-producto', upload.single('imagen'), usuarioController.createProduct);

router.get('/editar-producto/:id', usuarioController.showEditForm);
router.post('/editar-producto/:id', upload.single('imagen'), usuarioController.updateProduct);
router.delete('/eliminar-producto/:id', usuarioController.deleteProduct);

// --- Rutas de Perfil ---
router.get('/perfil', usuarioController.showProfileForm);
router.post('/perfil', usuarioController.updateProfile);

module.exports = router;
