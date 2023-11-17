const Sequelize = require('sequelize');
const {buildResponse, errorResponse} = require("../utils/Utils");
const {Sucursal} = require("../models");
const {validationResult} = require("express-validator");
const MedioPago = require('../models').MedioPago;

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

        const existeMedioDePago = await MedioPago.findOne({
            where: {
                nombre: req.body.nombre
            }
        })

        if (existeMedioDePago) {
            return res.status(500).send(errorResponse('Ya existe un medio de pago con el nombre ingresado.'))
        }

        const nuevoMedioDePago = await MedioPago.create({
            nombre: req.body.nombre
        })

        if (nuevoMedioDePago) {
            res.status(200).send(buildResponse(nuevoMedioDePago, 'Medio de pago registrado correctamente'))
        } else {
            res.status(400).send(errorResponse('Error al crear el medio de pago'))
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

        const existeMedioDePago = await MedioPago.findOne({
            where: {
                nombre: req.body.nombre
            }
        })

        if (existeMedioDePago) {
            if (existeMedioDePago.id !== parseInt(req.params.id)) {
                return res.status(500).send(errorResponse('Ya existe un medio de pago con el nombre ingresado.'))
            }
        }

        const medioDePago = await MedioPago.findOne({
            where: {
                id: req.params.id
            }
        })

        medioDePago.set({
            nombre: req.body.nombre
        })

        const medioDePagoActualizado = await medioDePago.save();

        if (medioDePagoActualizado) {
            res.status(200).send(buildResponse(medioDePagoActualizado, 'Medio de pago actualizado correctamente'))
        } else {
            res.status(400).send(errorResponse('Error al actualizar el medio de pago'))
        }
    },

    async disable(req, res) {
        const mediodepago = await MedioPago.findOne({
            where: {
                id: req.params.id
            }
        });

        mediodepago.set({
            active: 0
        })

        const mediodepagoActualizado = await mediodepago.save();

        if (mediodepagoActualizado) {
            return res.status(200).send(buildResponse(null, 'Medio de pago deshabilitado correctamente'))
        } else {
            return res.status(500).send(errorResponse('Ocurrió un error al deshabilitar el medio de pago'))
        }
    },

    async enable(req, res) {
        const mediodepago = await MedioPago.findOne({
            where: {
                id: req.params.id
            }
        });

        mediodepago.set({
            active: 1
        })

        const mediodepagoActualizado = await mediodepago.save();

        if (mediodepagoActualizado) {
            return res.status(200).send(buildResponse(null, 'Medio de pago habilitado correctamente'))
        } else {
            return res.status(500).send(errorResponse('Ocurrió un error al habilitar el medio de pago'))
        }
    },

    list(req, res) {
        let whereOptions = {
            active: 1
        }

        if (res.locals.isAdmin) {
            whereOptions = {}
        }

        return MedioPago.findAll({
            where: whereOptions,
            attributes: {exclude: ['updatedAt']}
        })
            .then(MedioPago => res.status(200).send(buildResponse(MedioPago)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return MedioPago.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(MedioPago => res.status(200).send(buildResponse(MedioPago)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },
};