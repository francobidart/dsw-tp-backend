const Sequelize = require('sequelize');
const {errorResponse, buildResponse} = require("../utils/Utils");
const {Op} = require("sequelize");
const TipoProducto = require('../models').TipoProducto;
const Producto = require('../models').Producto;

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
        let limit = 10000;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto.rows)))
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
            where: {categoria: categoria, stock: { [Op.gt]: 0 }},
            include: {
                model: TipoProducto
            }
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
            .then(Producto => res.status(200).send(Producto))
            .catch(error => res.status(400).send(error))
    },
};