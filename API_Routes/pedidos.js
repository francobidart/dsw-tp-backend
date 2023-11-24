const express = require('express');
const { body } = require("express-validator");
const router = express.Router();
const {errorResponse, authenticateToken, authenticateAdmin, injectIsAdmin, buildResponse} = require("../utils/Utils");
const PedidosController = require('../controllers/PedidosController');
const {validarCambioEstadoPedido} = require("../controllers/PedidosController");


// Pedidos

router.get('/', authenticateToken, PedidosController.list);
router.get('/:id(\\d+)', authenticateToken, PedidosController.getById);
router.post('/registrar', authenticateToken, PedidosController.create)
router.get('/client', authenticateToken, PedidosController.listClient);

// Pedidos | Solo para administradores (requiere authenticateAdmin)
router.get('/stats', authenticateAdmin, PedidosController.statsPedidos)
router.get('/entregar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.entregarPedido)
router.get('/cancelar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.cancelarPedido)



module.exports = router;