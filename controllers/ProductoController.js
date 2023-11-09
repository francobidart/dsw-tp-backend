const Sequelize = require('sequelize');
const {errorResponse, buildResponse} = require("../utils/Utils");
const {Op} = require("sequelize");
const TipoProducto = require('../models').TipoProducto;
const Producto = require('../models').Producto;
const {sequelize} = require('../models');
const {validationResult} = require("express-validator");

module.exports = {
    create(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let errores = '';
            for (let error of errors.errors) {
                errores += error.msg + ' / '
            }
            return res.status(400).json(errorResponse(errores));
        }

        return Producto
            .create({
                nombre: req.body.nombre,
                categoria: req.body.categoria,
                precio: req.body.precio,
                imagen: req.body.imagen,
                descripcion: req.body.descripcion,
                stock: req.body.stock
            })
            .then(Producto => res.status(200).send(Producto))
            .catch(error => res.status(400).send(error))
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

        let producto = await Producto.findOne({
            where: {
                id: req.params.id
            }
        });

        producto.set({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            precio: req.body.precio,
            imagen: req.body.imagen,
            descripcion: req.body.descripcion,
            stock: req.body.stock
        })

        const productoUpdate = await producto.save();

        res.status(200).send(buildResponse('OK'))
    },

    async disableProduct(req, res) {
        let producto = await Producto.findOne({
            where: {id: req.params.id}
        })

        producto.set({
            activo: false
        })

        await producto.save().then((result) => {
            res.status(200).send(buildResponse('Artículo deshabilitado correctamente.'))
        }).catch((err) => {
            res.status(500).send(errorResponse(err));
        });
    },

    async enableProduct(req, res) {
        let producto = await Producto.findOne({
            where: {id: req.params.id}
        })

        producto.set({
            activo: true
        })

        await producto.save().then((result) => {
            res.status(200).send(buildResponse('Artículo habilitado correctamente.'))
        }).catch((err) => {
            res.status(500).send(errorResponse(err));
        });
    },

    list(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10000;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            where: {
                activo: true
            },
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto.rows)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    listDisabled(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10000;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            where: {
                activo: false
            },
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto.rows)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    findByCat(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let order = req.query.order ? req.query.order : null;
        let orderArray = ['nombre', 'ASC'];
        if (order) {
            if (order === 'Ascendente') {
                orderArray = ['precio', 'ASC']
            } else {
                orderArray = ['precio', 'DESC']
            }
        }
        let limit = 10000;
        let categoria = req.params.id;
        let offset = page * limit;
        return Producto.findAndCountAll({
            limit: limit,
            offset: offset,
            where: {categoria: categoria, stock: {[Op.gt]: 0}, activo: true},
            order: [orderArray],
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
                activo: true
            },
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto)))
            .catch(error => res.status(400).send(error))
    },

    search(req, res) {
        const searchTerm = req.query.q;
        if (searchTerm == '') {
            return res.status(500).send(errorResponse('Ingresar un término es obligatorio'));
        }
        return Producto.findAll({
            where: {
                nombre: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                activo: true
            },
            include: {
                model: TipoProducto
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto)))
            .catch(error => res.status(400).send(error))
    },
};