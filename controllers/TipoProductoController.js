const Sequelize = require('sequelize');
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
            .then(TipoProducto => res.status(200).send(TipoProducto))
            .catch(error => res.status(400).send(error))
    },

    find(req, res) {

    },
};