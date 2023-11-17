const jwt = require('jsonwebtoken');
const {jwtSecret} = require("../config/sec");
const Usuarios = require('../models').Usuarios;

module.exports = {
    buildResponse(data = null, message = null) {
        let cantidadResultados = 0;

        if (data) {
            if (typeof data === 'object')
                cantidadResultados = data.length;
        }

        return {status: 'OK', mensaje: message, total_resultados: cantidadResultados, resultados: data};
    },

    errorResponse(message = null) {
        return {status: 'ERROR', mensaje: message};
    },

    async authenticateToken(req, res, next) {
        try {
            const authHeader = req.cookies['tk'];
            if (authHeader == null) return res.status(401).send({mensaje: 'El token de autorización no fue enviado a la aplicación'});
            const token = jwt.verify(authHeader, jwtSecret);
            const user = await Usuarios.findOne({
                where: {
                    id: token.user,
                    active: 1
                }
            })
            res.locals.user = user.id;
            res.locals.isAdmin = user.isAdmin;
            next();
        } catch {
            res.clearCookie('tk');
            return res.status(403).send({mensaje: 'Error verificando la sesión del usuario'})
        }
    },

    async authenticateAdmin(req, res, next) {
        try {
            const authHeader = req.cookies['tk'];
            if (authHeader == null) return res.status(401).send({mensaje: 'El token de autorización no fue enviado a la aplicación'});
            const token = jwt.verify(authHeader, jwtSecret);
            const user = await Usuarios.findOne({
                where: {
                    id: token.user,
                    isAdmin: true,
                    active: 1
                }
            })
            res.locals.user = user.id;
            res.locals.isAdmin = user.isAdmin;
            if (user === null) throw 'No autorizado';
            next();
        } catch {
            return res.status(403).send({mensaje: 'El usuario no posee los permisos requeridos para acceder a este recurso.'})
        }
    },

    async injectIsAdmin(req, res, next) {
        try {
            const authHeader = req.cookies['tk'];

            res.locals.isAdmin = false;
            res.locals.user = null;

            if (authHeader) {
                const token = jwt.verify(authHeader, jwtSecret);

                if (token) {
                    const user = await Usuarios.findOne({
                        where: {
                            id: token.user,
                            isAdmin: true,
                            active: 1
                        }
                    });

                    if (user) {
                        res.locals.user = user.id;
                        res.locals.isAdmin = true;
                    }
                }
            }

            next();
        } catch (ex) {
            res.locals.isAdmin = false;
            next();
        }
    }
}
;