const express = require('express');
const usuarioController = require("../controllers/UsuariosController");
const {authenticateToken} = require("../utils/Utils");
const {body} = require("express-validator");
const router = express.Router();


router.post('/login', usuarioController.login);
router.get('/logout', usuarioController.logout);
router.get('/session/validateSession', usuarioController.validateSession);
router.get('/session/validateAdmin', usuarioController.validateAdmin);
router.get('/account/profile', usuarioController.getLoggedAccountData);
router.post('/account/profile', [
    authenticateToken,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.updateClient);

module.exports = router;