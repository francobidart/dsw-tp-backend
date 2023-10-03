const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {Producto} = require("../models");
const TipoProducto = require('../models').TipoProducto;

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
        return TipoProducto.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']}
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return TipoProducto.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};