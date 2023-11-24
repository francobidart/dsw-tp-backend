const Sequelize = require('sequelize');
const Usuarios = require('../models').Usuarios;
var bcrypt = require('bcryptjs');
const {query, validationResult, body} = require('express-validator');
const {buildResponse, errorResponse} = require("../utils/Utils");
const jwt = require("jsonwebtoken");
const {jwtSecret, jwtPrivateKey} = require("../config/sec");
const fs = require("fs");
const {toBoolean} = require("validator");

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

        let values = req.body;

        var user = await Usuarios.findOne({
            where: {email: values.email}
        })

        let createAdminUser = false;

        if (res.locals.isAdmin) {
            if (values.isAdmin == 1) {
                createAdminUser = true;
            }
        }

        var hash = bcrypt.hashSync(values.password, 10);

        if (user !== null) {
            res.status(400).send(errorResponse('Ya existe un usuario registrado con el email ingresado.'))
        } else {
            return Usuarios
                .create({
                    nombre: values.nombre,
                    apellido: values.apellido,
                    email: values.email,
                    telefono: values.telefono,
                    usuario: values.usuario,
                    clave: hash,
                    isAdmin: createAdminUser,
                    active: 1
                })
                .then(Usuarios => {
                    res.status(200).send(buildResponse(null, 'Usuario registrado correctamente'))
                })
                .catch(error => res.status(400).send(errorResponse(error)))
        }
    },
    list(req, res) {
        return Usuarios.findAll()
            .then(Usuarios => {
                for (var i = 0; i < Usuarios.length; i++) {
                    Usuarios[i].clave = ''
                }
                res.status(200).send(buildResponse(Usuarios))
            })
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(Usuarios => {
                Usuarios.clave = '';
                res.status(200).send(buildResponse(Usuarios))
            })
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    async login(req, res) {
        let values = req.body;

        if (values.email !== undefined && values.password !== undefined) {
            var user = await Usuarios.findOne({
                where: {email: values.email}
            })

            if (user === null) {
                res.status(500).send(errorResponse('Usuario o contraseña no encontrados'))
            } else {
                if (!user.active) {
                    res.status(500).send(errorResponse('Usuario no habilitado'))
                } else {
                    bcrypt.compare(values.password, user.clave, function (err, result) {
                        if (err) {
                            res.status(500).send(errorResponse(err));
                        }
                        if (result) {
                            user.clave = null;
                            jwt.sign({
                                user: user.id,
                                email: user.email,
                                isAdmin: user.isAdmin
                            }, jwtSecret, {expiresIn: '1d'}, function (err, token) {
                                if (err) {
                                    res.clearCookie('tk')
                                    res.status(500).json(errorResponse(err.toString()));
                                } else {
                                    res.cookie('tk', token, {httpOnly: true});
                                    res.status(200).send(buildResponse({isAdmin: user.isAdmin}, 'Usuario identificado correctamente.'));
                                }
                            });
                        } else {
                            res.status(500).json(errorResponse('Contraseña invalida'));
                        }
                    });
                }
            }
        } else {
            res.status(500).send(errorResponse('Faltan datos obligatorios'));
        }
    },

    async logout(req, res) {
        res.clearCookie('tk')
        res.status(200).send(buildResponse('Sesión finalizada correctamente.'))
    },

    async validateSession(req, res) {
        if (req.cookies.tk === undefined) {
            res.status(403).send(errorResponse('No iniciaste sesión'))
        } else {
            jwt.verify(req.cookies.tk, jwtSecret, null, async (err, token) => {
                const user = await Usuarios.findOne({
                    where: {
                        id: token.user,
                        active: 1
                    },
                    attributes: ['isAdmin']
                });
                if (err) {
                    res.clearCookie('tk')
                    res.status(500).json(errorResponse(err.toString()));
                } else {
                    if (user) {
                        res.status(200).send(buildResponse({isAdmin: user.isAdmin}, 'Usuario identificado correctamente.'));
                    } else {
                        res.clearCookie('tk')
                        res.status(500).json(errorResponse('No autorizado'));
                    }
                }
            });
        }
    },

    async updateUser(req, res) {

        const usuarioActual = await Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })

        let email = usuarioActual.email;

        if (usuarioActual.email !== req.body.email) {
            const buscarUsuarioMail = await Usuarios.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (buscarUsuarioMail) {
                res.status(500).send(errorResponse('Ya existe un usuario registrado para el mail ingresado'));
                return;
            } else {
                email = req.body.email;
            }
        }

        usuarioActual.set({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            email: email,
            telefono: req.body.telefono
        })

        const usuarioActualizado = await usuarioActual.save();

        if (usuarioActualizado) {
            res.status(200).send(buildResponse(null, 'Usuario actualizado correctamente'));
        } else {
            res.status(500).send(errorResponse('Ocurrió un error al actualizar el usuario'))
        }
    },

    async disableUser(req, res) {
        const usuarioActual = await Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })

        if (res.locals.user === parseInt(req.params.id)) {
            res.status(500).send(errorResponse('No es posible deshabilitar tu propio usuario como administrador.'))
            return;
        }

        usuarioActual.set({
            active: 0
        })

        const usuarioActualizado = await usuarioActual.save();

        if (usuarioActualizado) {
            res.status(200).send(buildResponse(null, 'Usuario deshabilitado correctamente'));
        } else {
            res.status(500).send(errorResponse('Ocurrió un error al deshabilitar el usuario'))
        }
    },

    async enableUser(req, res) {
        const usuarioActual = await Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })

        usuarioActual.set({
            active: 1
        })

        const usuarioActualizado = await usuarioActual.save();

        if (usuarioActualizado) {
            res.status(200).send(buildResponse(null, 'Usuario habilitado correctamente'));
        } else {
            res.status(500).send(errorResponse('Ocurrió un error al habilitar el usuario'))
        }
    },

    async changeUserPassword(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let errores = '';
            for (let error of errors.errors) {
                errores += error.msg + ' / '
            }
            return res.status(400).json(errorResponse(errores));
        }

        const usuarioActual = await Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })

        let nuevaClave = bcrypt.hashSync(req.body.password, 10);

        usuarioActual.set({
            clave: nuevaClave
        })

        const usuarioActualizado = await usuarioActual.save();

        if (usuarioActualizado) {
            res.status(200).send(buildResponse(null, 'Contraseña actualizada correctamente'));
        } else {
            res.status(500).send(errorResponse('Ocurrió un error al actualizar la contraseña del usuario'))
        }
    },

    async validateAdmin(req, res) {
        if (req.cookies.tk === undefined) {
            res.status(403).send(errorResponse('No iniciaste sesión'))
        } else {
            jwt.verify(req.cookies.tk, jwtSecret, null, async (err, token) => {
                const user = await Usuarios.findOne({
                    where: {
                        id: token.user,
                        isAdmin: true,
                        active: 1
                    },
                    attributes: ['isAdmin']
                });
                if (err) {
                    res.clearCookie('tk')
                    res.status(500).json(errorResponse(err.toString()));
                } else {
                    if (user) {
                        res.status(200).send(buildResponse({isAdmin: user.isAdmin}, 'Usuario identificado correctamente.'));
                    } else {
                        res.clearCookie('tk')
                        res.status(500).json(errorResponse('No autorizado'));
                    }
                }
            });
        }
    },

    async getLoggedAccountData(req, res) {
        if (req.cookies.tk === undefined) {
            res.status(403).send(errorResponse('No iniciaste sesión'))
        } else {
            jwt.verify(req.cookies.tk, jwtSecret, null, (err, token) => {
                if (err) {
                    res.clearCookie('tk')
                    res.status(500).json(errorResponse(err.toString()));
                } else {
                    Usuarios.findOne({
                        where: {
                            id: token.user,
                            active: 1
                        }
                    }).then(Usuario => {
                        Usuario.dataValues.clave = null;
                        res.status(200).send(buildResponse(Usuario.dataValues, 'Consultado correctamente'));
                    })
                        .catch(error => {
                            res.status(500).json(errorResponse(error.toString()));
                        });
                }
            });
        }
    },

    async updateClient(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let errores = '';
            for (let error of errors.errors) {
                errores += error.msg + ' / '
            }
            return res.status(400).json(errorResponse(errores));
        }

        const usuarioActual = await Usuarios.findOne({
            where: {
                id: res.locals.user
            }
        })

        let email = usuarioActual.email;

        if (usuarioActual.email !== req.body.email) {
            const buscarUsuarioMail = await Usuarios.findOne({
                where: {
                    email: req.body.email
                }
            })
            if (buscarUsuarioMail) {
                res.status(500).send(errorResponse('Ya existe un usuario registrado para el mail ingresado'));
                return;
            } else {
                email = req.body.email;
            }
        }

        usuarioActual.set({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            email: email,
            telefono: req.body.telefono
        })

        const usuarioActualizado = await usuarioActual.save();

        if (usuarioActualizado) {
            res.status(200).send(buildResponse(null, 'Usuario actualizado correctamente'));
        } else {
            res.status(500).send(errorResponse('Ocurrió un error al actualizar el usuario'))
        }
    },

};