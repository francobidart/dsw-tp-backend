const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const MedioPago = require('../models').MedioPago;

module.exports = {
    create(req, res) {
    },
    list(req, res) {
        return MedioPago.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']}
        })
            .then(MedioPago => res.status(200).send(buildResponse(MedioPago)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return MedioPago.findAll({
            where: {
                tag: req.params.tag,
            }
        })
            .then(MedioPago => res.status(200).send(buildResponse(MedioPago)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};