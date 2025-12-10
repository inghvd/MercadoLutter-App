// routes/usuarioRoutes.js

const express = require('express');
const router = express.Router();
// Importamos el middleware de Cloudinary
const upload = require('../middlewares/upload'); 
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

// **ESTA ES LA LÍNEA CORREGIDA:** Incluye el middleware de subida (upload.array)
router.post('/crear-producto', upload.array('imagenes', 10), usuarioController.createProduct);

router.get('/editar-producto/:id', usuarioController.showEditForm);
// Mantenemos upload.single para edición si solo se permite una imagen por el formulario de edición.
router.post('/editar-producto/:id', upload.single('imagen'), usuarioController.updateProduct);
router.delete('/eliminar-producto/:id', usuarioController.deleteProduct);

// --- Rutas de Perfil ---
router.get('/perfil', usuarioController.showProfileForm);
router.post('/perfil', upload.single('imagenPerfil'), usuarioController.updateProfile);

module.exports = router;
