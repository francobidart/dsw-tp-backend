const { injectIsAdmin, authenticateAdmin } = require("../utils/Utils");
const productoController = require("../controllers/ProductoController");
const express = require('express');
const { body } = require("express-validator");
const router = express.Router();

router.get('/', injectIsAdmin, productoController.list);
router.get('/disabled', authenticateAdmin, productoController.listDisabled);
router.get('/search/', productoController.search);
router.get('/:id', injectIsAdmin, productoController.find);

router.post('/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('categoria').isNumeric().withMessage('La categoría es obligatoria'),
    body('precio').isNumeric().withMessage('El precio es obligatorio'),
    body('stock').isNumeric().withMessage('El inventario es obligatorio'),
], productoController.update);

router.post('/', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('categoria').isNumeric().withMessage('La categoría es obligatoria'),
    body('precio').isNumeric().withMessage('El precio es obligatorio'),
    body('stock').isNumeric().withMessage('El inventario es obligatorio'),
], productoController.create);

router.get('/:id/disable', authenticateAdmin, productoController.disableProduct);
router.get('/:id/enable', authenticateAdmin, productoController.enableProduct);

module.exports = router;