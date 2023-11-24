const {injectIsAdmin, authenticateAdmin} = require("../utils/Utils");
const SucursalController = require("../controllers/SucursalController");
const {body} = require("express-validator");
const express = require("express");
const router = express.Router();


router.get('/', injectIsAdmin, SucursalController.list);
router.post('', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre de la sucursal es obligatorio'),
    body('direccion').notEmpty().withMessage('La dirección de la sucursal es obligatoria'),
    body('telefono').notEmpty().withMessage('El teléfono de la sucursal es obligatorio'),
], SucursalController.create);

router.get('/:id', injectIsAdmin, SucursalController.find);
router.post('/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre de la sucursal es obligatorio'),
    body('direccion').notEmpty().withMessage('La dirección de la sucursal es obligatoria'),
    body('telefono').notEmpty().withMessage('El teléfono de la sucursal es obligatorio'),
], SucursalController.update);
router.get('/:id/disable', SucursalController.disable);
router.get('/:id/enable', SucursalController.enable);


module.exports = router;