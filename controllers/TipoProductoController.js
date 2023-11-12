const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {Producto} = require("../models");
const TipoProducto = require('../models').TipoProducto;

module.exports = {

    async create(req, res) {
        try {
            const tipoProducto = await TipoProducto.create({nombre: req.body.nombre});
            res.status(200).send({message: 'Categoría correctamente', data: tipoProducto});
        } catch (error) {
            res.status(400).send({error: 'Error al crear la categoría', details: error.message});
        }
    }, async delete(req, res) {
        try {
            const tipoProductoId = req.params.id;

            const resultado = await TipoProducto.destroy({where: {id: tipoProductoId}});

            if (resultado === 1) {
                res.status(200).send({message: 'Categoría eliminada correctamente'});
            } else {
                res.status(404).send({error: 'No se encontró una categoría con el ID especificado'});
            }
        } catch (error) {
            res.status(400).send({error: 'Error al eliminar categoría', details: error.message});
        }
    },


    async update(req, res) {
        try {
            const resultado = await TipoProducto.update(
                {nombre: req.body.nombre},
                {where: {
                    id: req.params.id
                }});

            if (resultado[0] === 1) {
                res.status(200).send({message: 'Categoría actualizada correctamente'});
            } else {
                res.status(404).send({error: 'No se encontró una categoría con el ID especificado'});
            }
        } catch (error) {
            res.status(400).send({error: 'Error al actualizar categoría', details: error.message});
        }
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

                id: req.params.id,

        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};