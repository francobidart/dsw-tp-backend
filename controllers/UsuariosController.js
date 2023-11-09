const Sequelize = require('sequelize');
const Usuarios = require('../models').Usuarios;
var bcrypt = require('bcryptjs');
const {query, validationResult, body} = require('express-validator');
const {buildResponse, errorResponse} = require("../utils/Utils");
const jwt = require("jsonwebtoken");
const {jwtSecret, jwtPrivateKey} = require("../config/sec");
const fs = require("fs");

module.exports = {
    async create(req, res) {
        let values = req.body;

        var user = await Usuarios.findOne({
            where: {email: values.email}
        })

        let createAdminUser = false;

        if(res.locals.isAdmin) {
            if(values.isAdmin) {
                createAdminUser = true;
            }
        }

        var hash = bcrypt.hashSync(values.password, 10);

        if (user !== null) {
            res.status(400).send({error: 'Ya existe un usuario registrado con ese email.'})
        } else {
            return Usuarios
                .create({
                    nombre: values.nombre,
                    apellido: values.apellido,
                    email: values.email,
                    telefono: values.telefono,
                    usuario: values.usuario,
                    clave: hash,
                    isAdmin: createAdminUser
                })
                .then(Usuarios => res.status(200).send(buildResponse(Usuarios)))
                .catch(error => res.status(400).send(errorResponse(error)))
        }
    },
    list(req, res) {
        return Usuarios.findAll()
            .then(Usuarios => res.status(200).send(buildResponse(Usuarios)))
            .catch(error => res.status(400).send(errorResponse(error)))
    },

    find(req, res) {
        return Usuarios.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(Usuarios => res.status(200).send(buildResponse(Usuarios)))
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
                        id: token.user
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

    async validateAdmin(req, res) {
        if (req.cookies.tk === undefined) {
            res.status(403).send(errorResponse('No iniciaste sesión'))
        } else {
            jwt.verify(req.cookies.tk, jwtSecret, null, async (err, token) => {
                const user = await Usuarios.findOne({
                    where: {
                        id: token.user,
                        isAdmin: true
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
                            id: token.user
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
    }
};