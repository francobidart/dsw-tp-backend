const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {Producto} = require("../models");
const {validationResult} = require("express-validator");
const TipoProducto = require('../models').TipoProducto;

module.exports = {

    async create(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let errores = '';
            for (let error of errors.errors) {
                errores += error.msg + ' / '
            }
            return res.status(400).json(errorResponse(errores));
        }

        try {

            const categoriaExistente = await TipoProducto.findOne({
                where: {
                    nombre: req.body.nombre
                }
            })

            if (categoriaExistente) {
                res.status(500).send(errorResponse('Ya existe una categoría con nombre: ' + req.body.nombre))
            } else {
                const tipoProducto = await TipoProducto.create({nombre: req.body.nombre});
                res.status(200).send(buildResponse([tipoProducto], 'Categoría creada correctamente'));
            }

        } catch (error) {
            let errorRes = 'Error al crear la categoría' + error.message
            res.status(400).send(errorResponse(errorRes));
        }
    },

    async delete(req, res) {
        try {
            const tipoProductoId = req.params.id;

            const productosExistentesCategoria = await Producto.findAll({
                where: {
                    categoria: req.params.id
                }
            });

            if (productosExistentesCategoria.length > 0) {
                res.status(500).send(errorResponse('No es posible eliminar una categoría que tiene artículos asociados, por favor verifique los artículos para continuar.'))
            } else {
                const resultado = await TipoProducto.destroy({where: {id: tipoProductoId}});
                if (resultado === 1) {
                    res.status(200).send(buildResponse([], 'Categoría eliminada correctamente'));
                } else {
                    res.status(404).send(errorResponse('No se encontró una categoría con el ID especificado'));
                }
            }
        } catch (error) {
            let errorRes = 'Error al eliminar categoría | ' + error.message;
            res.status(400).send(errorResponse(errorRes));
        }
    },


    async update(req, res) {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                let errores = '';
                for (let error of errors.errors) {
                    errores += error.msg + ' / '
                }
                return res.status(400).json(errorResponse(errores));
            }

            const categoriaExistente = await TipoProducto.findOne({
                where: {
                    nombre: req.body.nombre
                }
            })

            if (categoriaExistente) {
                if (categoriaExistente.dataValues.id === parseInt(req.params.id)) {
                    if (req.body.nombre === categoriaExistente.dataValues.nombre) {
                        res.status(500).send(errorResponse('Para editar la categoría, ingrese un nombre diferente al actual.'))
                    }
                } else {
                    res.status(500).send(errorResponse('Ya existe una categoría con nombre: ' + req.body.nombre))
                }
            } else {
                const resultado = await TipoProducto.update(
                    {nombre: req.body.nombre},
                    {where: {id: req.params.id}}
                );

                if (resultado[0] === 1) {
                    res.status(200).send(buildResponse(resultado, 'Categoría actualizada correctamente'));
                } else {
                    res.status(404).send(errorResponse('No se encontró una categoría con el ID especificado'));
                }

            }

        } catch (error) {
            let errorRes = 'Error al actualizar categoría | ' + error.message;
            res.status(400).send(errorResponse(errorRes));
        }
    },


    list(req, res) {
        return TipoProducto.findAll({
            attributes: {exclude: ['updatedAt']}
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return TipoProducto.findAll({
            where: {
                id: req.params.id
            }
        })
            .then(TipoProducto => res.status(200).send(buildResponse(TipoProducto)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};