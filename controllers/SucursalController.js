const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const Sucursal = require('../models').Sucursal;

module.exports = {
    create(req, res) {
  
    },
    list(req, res) {
        return Sucursal.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']}
        })
            .then(Sucursal => res.status(200).send(buildResponse(Sucursal)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return Sucursal.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(Sucursal => res.status(200).send(buildResponse(Sucursal)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};