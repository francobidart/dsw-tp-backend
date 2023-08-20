const Sequelize = require('sequelize');
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
        let page = req.query.page ? req.query.page : 1;
        let limit = 1;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(Producto))
            .catch(error => res.status(400).send(error))
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