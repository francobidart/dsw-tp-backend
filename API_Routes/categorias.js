const express = require('express');
const tipoProductoController = require("../controllers/TipoProductoController");
const {injectIsAdmin, authenticateAdmin} = require("../utils/Utils");
const productoController = require("../controllers/ProductoController");
const {body} = require("express-validator");
const router = express.Router();

router.get('/', tipoProductoController.list);
router.get('/:id', tipoProductoController.find);
router.get('/:id/products', injectIsAdmin, productoController.findByCat);

// Categorías | Solo para administradores (requiere authenticateAdmin)
router.post('/', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio'),], tipoProductoController.create);
router.post('/:id/update', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio')], tipoProductoController.update);
router.get('/:id/borrar', authenticateAdmin, tipoProductoController.delete);

module.exports = router;