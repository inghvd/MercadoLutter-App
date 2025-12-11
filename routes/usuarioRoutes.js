const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/upload'); // IMPORTAR CON LLAVES
const usuarioController = require('../controllers/usuarioController');

const ensureUser = (req, res, next) => {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/auth/login');
};

router.use(ensureUser);

// Productos
router.get('/productos', usuarioController.showMyProducts);
router.get('/crear-producto', usuarioController.showCreateForm);
router.post('/crear-producto', upload.array('imagenes', 10), usuarioController.createProduct);

router.get('/editar-producto/:id', usuarioController.showEditForm);
router.post('/editar-producto/:id', upload.single('imagen'), usuarioController.updateProduct);
router.delete('/eliminar-producto/:id', usuarioController.deleteProduct);

// Perfil
router.get('/perfil', usuarioController.showProfileForm);
router.post('/perfil', upload.single('imagenPerfil'), usuarioController.updateProfile);

module.exports = router;

