const express = require('express');
const { body } = require("express-validator");
const {injectIsAdmin, authenticateAdmin} = require("../utils/Utils");
const MedioPagoController = require("../controllers/MedioPagoController");
const router = express.Router();


router.get('/', injectIsAdmin, MedioPagoController.list);
router.post('/', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre del medio de pago es obligatorio'),
], MedioPagoController.create);

router.get('/:id', injectIsAdmin, MedioPagoController.find);
router.post('/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre del medio de pago es obligatorio'),
], MedioPagoController.update);
router.get('/:id/disable', authenticateAdmin, MedioPagoController.disable);
router.get('/:id/enable', authenticateAdmin, MedioPagoController.enable);

module.exports = router;