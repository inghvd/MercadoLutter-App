const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/registro', authController.registroForm);
router.post('/registro', authController.registrarUsuario);
router.get('/rules-seen', authController.rulesSeen);

module.exports = router;
