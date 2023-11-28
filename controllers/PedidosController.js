const Sequelize = require('sequelize');
const {errorResponse, buildResponse} = require("../utils/Utils");
const {Op} = require("sequelize");
const TipoProducto = require('../models').TipoProducto;
const Producto = require('../models').Producto;
const Pedido = require('../models').Pedido;
const Usuarios = require('../models').Usuarios;
const DetallePedido = require('../models').DetallePedido;
const HistorialEstadoPedido = require('../models').HistorialEstadoPedido;
const EstadoPedido = require('../models').EstadoPedido;
const MedioPago = require('../models').MedioPago;
const Sucursal = require('../models').Sucursal;
const {sequelize} = require('../models');

module.exports = {
    async create(req, res) {
        if (res.locals.isAdmin) {
            res.status(500).send(errorResponse('Para realizar una compra, deberás ingresar con un usuario de tipo CLIENTE, los administradores no pueden realizar compras en la plataforma.'))
            return;
        }
        const pedido = req.body;
        if ((!pedido.articulos || pedido.articulos.length === 0) || !pedido.sucursal || !pedido.mediodepago) {
            res.status(500).send(errorResponse('Faltan datos obligatorios para el pedido.'))
        } else {
            const t = await sequelize.transaction();
            try {
                let montoTotal = 0;
                for (var i = 0; i < pedido.articulos.length; i++) {
                    montoTotal += pedido.articulos[i].precio;
                }
                const nuevoPedido = await Pedido.create({
                    cliente: res.locals.user,
                    sucursal: pedido.sucursal,
                    montoTotal: montoTotal,
                    medioDePago: pedido.mediodepago
                }, {transaction: t})
                const historialEstado = await HistorialEstadoPedido.create({
                    pedido: nuevoPedido.dataValues.id,
                    estado: 1
                }, {transaction: t});
                for (var j = 0; j < pedido.articulos.length; j++) {
                    let articulo = pedido.articulos[j];

                    let inventarioActual = await Producto.findOne({
                        where: {
                            id: articulo.id
                        },
                        attributes: ['id', 'stock', 'nombre', 'precio'],
                        transaction: t
                    })

                    if (inventarioActual.dataValues.precio != articulo.precio) {
                        throw 'El precio del artículo es diferente al actual, reintentá la compra.'
                    }

                    let cantidad = 1;

                    if (cantidad > parseFloat(inventarioActual.dataValues.stock)) {
                        throw 'No hay suficiente inventario para el artículo ' + articulo.nombre;
                    }

                    await DetallePedido.create({
                        articulo: articulo.id,
                        detalle: inventarioActual.dataValues.nombre,
                        cantidad: cantidad,
                        montoTotal: cantidad * articulo.precio,
                        precioUnitario: articulo.precio,
                        pedido: nuevoPedido.dataValues.id
                    }, {transaction: t});

                    await Producto.update({
                        stock: inventarioActual.dataValues.stock - cantidad
                    }, {
                        where: {
                            id: articulo.id
                        },
                        transaction: t
                    });
                }
                await t.commit();
                res.status(200).send(buildResponse(nuevoPedido, 'Pedido registrado correctamente!'));
            } catch (error) {
                let mensaje = 'Ocurrió un error: ' + error;
                await t.rollback();
                res.status(500).send(errorResponse(mensaje));
            }
        }
    },

    async entregarPedido(req, res) {
        const t = await sequelize.transaction();
        try {
            const pedido = await Pedido.findOne({
                where: {
                    id: req.params.id
                },
                transaction: t
            })
            pedido.set('estadoActual', 4);
            await pedido.save({transaction: t});
            const historialEstado = await HistorialEstadoPedido.create({
                pedido: pedido.id,
                estado: 4,
            }, {transaction: t});

            await t.commit();

            res.status(200).send(buildResponse(pedido, 'Pedido entregado correctamente!'));

        } catch (error) {
            let mensaje = 'Ocurrió un error: ' + error;
            await t.rollback();
            res.status(500).send(errorResponse(mensaje));
        }
    },

    async cancelarPedido(req, res) {
        const t = await sequelize.transaction();
        try {
            const pedido = await Pedido.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {
                        model: DetallePedido,
                        attributes: ['articulo', 'cantidad'],
                        as: 'detallePedido'
                    }
                ],
                transaction: t
            })

            for (var i = 0; i < pedido.dataValues.detallePedido.length; i++) {
                let detallePedido = pedido.dataValues.detallePedido[i].dataValues;
                const productoActualizarStock = await Producto.findOne({
                    where: {
                        id: detallePedido.articulo
                    },
                    transaction: t
                });
                productoActualizarStock.set({
                    stock: parseFloat(productoActualizarStock.stock) + parseFloat(detallePedido.cantidad)
                })
                await productoActualizarStock.save({transaction: t})
            }

            pedido.set('estadoActual', 5);
            await pedido.save({transaction: t});
            const historialEstado = await HistorialEstadoPedido.create({
                pedido: pedido.id,
                estado: 5,
            }, {transaction: t});

            await t.commit();

            res.status(200).send(buildResponse(pedido, 'Pedido cancelado correctamente!'));

        } catch (error) {
            let mensaje = 'Ocurrió un error: ' + error;
            await t.rollback();
            res.status(500).send(errorResponse(mensaje));
        }
    },

    async validarCambioEstadoPedido(req, res, next) {
        let pedido = await Pedido.findOne({
            where: {
                id: req.params.id
            }
        })
        if (pedido) {
            if (pedido.estadoActual !== 4 && pedido.estadoActual !== 5) {
                next()
            } else {
                res.status(500).send(errorResponse('No es realizar esta acción un pedido que se encuentra en estado ENTREGADO o CANCELADO'));
            }
        } else {
            res.status(404).send(errorResponse('Pedido no encontrado'));
        }

    },

    async getById(req, res) {
        let pedido = await Pedido.findOne({
            where: {id: req.params.id},
            include: [
                {
                    model: DetallePedido,
                    include: {
                        model: Producto,
                        attributes: ['nombre', 'imagen', 'id'],
                        as: 'detalleArticulo'
                    },
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'pedido']},
                    as: 'detallePedido'
                },
                {
                    model: Usuarios,
                    as: 'clientePedido',
                    attributes: ['id', 'nombre', 'apellido', 'email']
                },
                {
                    model: HistorialEstadoPedido,
                    include: {
                        model: EstadoPedido,
                        as: 'detalleEstado',
                        attributes: ['nombre']
                    },
                    attributes: ['estado', 'createdAt'],
                    order: ['createdAt', 'DESC'],
                    as: 'historialEstadoPedido'
                },
                {
                    model: EstadoPedido,
                    as: 'detalleEstadoActual',
                    attributes: ['nombre']
                },
                {
                    model: MedioPago,
                    as: 'medioDePagoPedido',
                    attributes: ['nombre', 'id']
                },
                {
                    model: Sucursal,
                    as: 'sucursalPedido',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'active']
                    }
                }
            ]
        });
        if (pedido) {
            if (res.locals.isAdmin) {
                res.status(200).send(buildResponse([pedido]));
            } else {
                if (res.locals.user !== pedido.cliente) {
                    res.status(500).send(errorResponse('No autorizado'));
                } else {
                    res.status(200).send(buildResponse([pedido]));
                }
            }
        } else {
            res.status(404).send(errorResponse('No encontrado'));
        }
    },

    list(req, res) {
        let page = req.query.page ? req.query.page : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10000;
        let offset = page * limit;
        let whereSettings = {}
        if (!res.locals.isAdmin) {
            whereSettings = {
                cliente: res.locals.user
            }
        }
        return Pedido.findAndCountAll({
            limit: limit,
            offset: offset,
            where: whereSettings,
            order: [
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: DetallePedido,
                    include: {
                        model: Producto,
                        attributes: ['nombre', 'imagen'],
                        as: 'detalleArticulo'
                    },
                    attributes: {exclude: ['id', 'createdAt', 'updatedAt', 'pedido', 'articulo']},
                    as: 'detallePedido'
                },
                {
                    model: Usuarios,
                    as: 'clientePedido',
                    attributes: ['id', 'nombre', 'apellido', 'email']
                },
                {
                    model: EstadoPedido,
                    as: 'detalleEstadoActual',
                    attributes: ['nombre']
                },
                {
                    model: MedioPago,
                    as: 'medioDePagoPedido',
                    attributes: ['nombre', 'id']
                },
                {
                    model: Sucursal,
                    as: 'sucursalPedido',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'active']
                    }
                }
            ],
            attributes: {exclude: ['cliente']}
        })
            .then(Pedido => {
                res.status(200).send(buildResponse(Pedido.rows))
            })
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return Producto.findAll({
            where: {
                id: req.params.id,
            }
        })
            .then(Producto => res.status(200).send(buildResponse(Producto)))
            .catch(error => res.status(400).send(error))
    },

    async statsPedidos(req, res) {

        const fechaActual = new Date();
        const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

        let response = {
            cantidadPedidosPendientes: 0,
            importeVentasMensuales: 0,
            cantidadPedidosMes: 0
        }
        let cantidadPedidos = await Pedido.count({
            where: {
                estadoActual: {
                    [Op.notIn]: [4, 5]
                }
            }
        })
        let ventasTotales = await Pedido.sum('montoTotal', {
            where: {
                createdAt: {
                    [Op.between]: [primerDiaMes, ultimoDiaMes]
                },
                estadoActual: {
                    [Op.ne]: 5
                }
            }
        })

        let ventasDelMes = await Pedido.count({
            where: {
                createdAt: {
                    [Op.between]: [primerDiaMes, ultimoDiaMes]
                }
            }
        })
        response.importeVentasMensuales = ventasTotales ? ventasTotales : 0;
        response.cantidadPedidosPendientes = cantidadPedidos;
        response.cantidadPedidosMes = ventasDelMes;
        res.status(200).send(buildResponse(response))
    },


     listClient(req, res) {
    let page = req.query.page ? req.query.page : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10000;
    let offset = page * limit;

    // Obtener el ID del cliente (puedes cambiar la propiedad según la estructura de tu objeto de usuario)
    const clientId = res.locals.user.id;

    let whereSettings = {};

    // Agregar filtro por ID de cliente
    if (!res.locals.isAdmin) {
        whereSettings = {
            cliente: clientId
        };
    }

    return Pedido.findAndCountAll({
        limit: limit,
        offset: offset,
        where: whereSettings,
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: DetallePedido,
                include: {
                    model: Producto,
                    attributes: ['nombre', 'imagen'],
                    as: 'detalleArticulo'
                },
                attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'pedido', 'articulo'] },
                as: 'detallePedido'
            },
            {
                model: Usuarios,
                as: 'clientePedido',
                attributes: ['id', 'nombre', 'apellido', 'email']
            },
            {
                model: EstadoPedido,
                as: 'detalleEstadoActual',
                attributes: ['nombre']
            },
            {
                model: MedioPago,
                as: 'medioDePagoPedido',
                attributes: ['nombre', 'id']
            },
            {
                model: Sucursal,
                as: 'sucursalPedido',
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'active']
                }
            }
        ],
        attributes: { exclude: ['cliente'] }
    })
        .then(Pedido => {
            res.status(200).send(buildResponse(Pedido.rows));
        })
        .catch(error => res.status(400).send(errorResponse(error)));
}


};