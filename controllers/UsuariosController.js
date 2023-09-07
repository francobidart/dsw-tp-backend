const Sequelize = require('sequelize');
const Usuarios = require('../models').Usuarios;

module.exports = {
    async create(req, res) {
        let values = req.body;

        var user = await Usuarios.findOne({
            where: {email: values.email}
        })
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
                    clave: values.clave
                })
                .then(Usuarios => res.status(200).send(Usuarios))
                .catch(error => res.status(400).send(error))
        }
    },
    list(req, res) {
        return Usuarios.findAll()
            .then(Usuarios => res.status(200).send(Usuarios))
            .catch(error => res.status(400).send(error))
    },

    find(req, res) {

    },
};