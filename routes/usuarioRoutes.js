// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const usuarioController = require('../controllers/usuarioController');

// Solo usuarios logueados
const ensureUser = (req, res, next) => {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/auth/login');
};

// Aplica el middleware a todas las rutas de usuario
router.use(ensureUser);

// --- Gestión de productos ---
router.get('/productos', usuarioController.showMyProducts);
router.get('/crear-producto', usuarioController.showCreateForm);
router.post('/crear-producto', upload.array('imagenes', 10), usuarioController.createProduct);

router.get('/editar-producto/:id', usuarioController.showEditForm);
router.post('/editar-producto/:id', upload.single('imagen'), usuarioController.updateProduct);
router.delete('/eliminar-producto/:id', usuarioController.deleteProduct);

// --- Perfil ---
router.get('/perfil', usuarioController.showProfileForm);
router.post('/perfil', upload.single('imagenPerfil'), usuarioController.updateProfile);

module.exports = router;

