const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {validationResult} = require("express-validator");
const Sucursal = require('../models').Sucursal;

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

        const existeSucursal = await Sucursal.findOne({
            where: {
                nombre: req.body.nombre
            }
        })

        if (existeSucursal) {
            return res.status(500).send(errorResponse('Ya existe una sucursal con el nombre ingresado.'))
        }

        const nuevaSucursal = await Sucursal.create({
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            telefono: req.body.telefono
        })

        if (nuevaSucursal) {
            res.status(200).send(buildResponse(nuevaSucursal, 'Sucursal registrada correctamente'))
        } else {
            res.status(400).send(errorResponse('Error al crear la sucursal'))
        }
    },
    async update(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let errores = '';
            for (let error of errors.errors) {
                errores += error.msg + ' / '
            }
            return res.status(400).json(errorResponse(errores));
        }

        const existeSucursal = await Sucursal.findOne({
            where: {
                nombre: req.body.nombre
            }
        })

        if (existeSucursal) {
            if (existeSucursal.id !== parseInt(req.params.id)) {
                return res.status(500).send(errorResponse('Ya existe una sucursal con el nombre ingresado.'))
            }
        }

        const sucursal = await Sucursal.findOne({
            where: {
                id: req.params.id
            }
        })

        sucursal.set({
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            telefono: req.body.telefono
        })

        const sucursalActualizada = await sucursal.save();

        if (sucursalActualizada) {
            res.status(200).send(buildResponse(nuevaSucursal, 'Sucursal actualizada correctamente'))
        } else {
            res.status(400).send(errorResponse('Error al actualizar la sucursal'))
        }
    },

    async disable(req, res) {
        const sucursal = await Sucursal.findOne({
            where: {
                id: req.params.id
            }
        });

        sucursal.set({
            active: 0
        })


        const sucursalActualizada = await sucursal.save();

        if (sucursalActualizada) {
            return res.status(200).send(buildResponse(null, 'Sucursal deshabilitada correctamente'))
        } else {
            return res.status(500).send(errorResponse('Ocurrió un error al deshabilitar la sucursal'))
        }
    },

    async enable(req, res) {
        const sucursal = await Sucursal.findOne({
            where: {
                id: req.params.id
            }
        });

        sucursal.set({
            active: 1
        })

        const sucursalActualizada = await sucursal.save();

        if (sucursalActualizada) {
            return res.status(200).send(buildResponse(null, 'Sucursal habilitada correctamente'))
        } else {
            return res.status(500).send(errorResponse('Ocurrió un error al habilitar la sucursal'))
        }
    },

    list(req, res) {

        let whereOptions = {
            active: 1
        }

        if (res.locals.isAdmin) {
            whereOptions = {}
        }

        return Sucursal.findAll({
            where: whereOptions,
            attributes: {exclude: ['createdAt', 'updatedAt']}
        })
            .then(Sucursal => res.status(200).send(buildResponse(Sucursal)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {

        let whereOptions = {
            id: req.params.id,
            active: 1
        }

        if (res.locals.isAdmin) {
            whereOptions = {
                id: req.params.id
            }
        }

        return Sucursal.findOne({
            where: whereOptions
        })
            .then(Sucursal => {
                if (Sucursal) {
                    res.status(200).send(buildResponse(Sucursal))
                } else {
                    res.status(404).send(errorResponse('No existe una sucursal con ID: ' + req.params.id))
                }
            })
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};