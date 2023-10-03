const jwt = require('jsonwebtoken');
const {jwtSecret} = require("../config/sec");

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

    authenticateToken(req, res, next) {
        const authHeader = req.cookies['tk'];

        if (authHeader == null) return res.status(401).send({mensaje: 'El token de autorización no fue enviado a la aplicación'});

        jwt.verify(authHeader, jwtSecret, (err, user) => {
                if (err) {
                    res.clearCookie('tk');
                    return res.status(403).send({mensaje: 'Error verificando la sesión del usuario: ' + err.toString()});
                }
                next();
            }
        )
    }
}
;