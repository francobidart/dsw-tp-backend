const express = require('express');
const {authenticateAdmin} = require("../utils/Utils");
const {body} = require("express-validator");
const usuarioController = require("../controllers/UsuariosController");
const {Router} = require("express");
const router = express.Router();



router.post('/registrar', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La clave es obligatoria'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
    body('isAdmin').notEmpty().withMessage('El tipo de usuario es obligatorio'),
], usuarioController.create);

router.post('/:id(\\d+)', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.updateUser);

router.get('/:id/enable', authenticateAdmin, usuarioController.enableUser);
router.get('/:id/disable', authenticateAdmin, usuarioController.disableUser);
router.post('/:id/cambiarClave', [
    authenticateAdmin,
    body('password').notEmpty().withMessage('La nueva clave es obligatoria')
], usuarioController.changeUserPassword);

router.get('/', authenticateAdmin, usuarioController.list);
router.get('/:id(\\d+)', authenticateAdmin, usuarioController.find);

router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La clave es obligatoria'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.create);


module.exports = router;
