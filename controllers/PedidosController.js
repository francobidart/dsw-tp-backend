const Sequelize = require('sequelize');
const {errorResponse, buildResponse} = require("../utils/Utils");
const {Op} = require("sequelize");
const TipoProducto = require('../models').TipoProducto;
const Producto = require('../models').Producto;
const Pedido = require('../models').Pedido;
const Usuarios = require('../models').Usuarios;
const DetallePedido = require('../models').DetallePedido;

module.exports = {
    create(req, res) {
        /*
        return Producto
            .create({
                // Values
            })
            .then(usuario => res.status(200).send(Producto))
            .catch(error => res.status(400).send(error))

         */
    },
    list(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10000;
        let offset = page * limit;
        return Pedido.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [
                {
                    model: DetallePedido,
                    include: {
                        model: Producto,
                        attributes: ['nombre'],
                        as: 'detalleArticulo'
                    },
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'pedido', 'articulo']},
                    as: 'detallePedido'
                },
                {
                    model: Usuarios,
                    as: 'clientePedido',
                    attributes: ['id', 'nombre', 'apellido', 'email']
                }
            ],
            attributes: {exclude: ['cliente']}
        })
            .then(Pedido => res.status(200).send(buildResponse(Pedido.rows)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
    findByCat(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let limit = 10000;
        let categoria = req.params.id;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            where: {categoria: categoria, stock: {[Op.gt]: 0}},
            include: [
                {
                    model: TipoProducto
                },
                {
                    model: DetallePedido,
                    as: 'detallePedido'
                }
            ]
        })
            .then(Producto => res.status(200).send(buildResponse(Producto.rows)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
    find(req, res) {
        return Producto.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto)))
            .catch(error => res.status(400).send(error))
    },
};