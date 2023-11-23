const express = require('express')
const models = require('./models');
const productoController = require('./controllers/ProductoController');
const tipoProductoController = require('./controllers/TipoProductoController');
const usuarioController = require('./controllers/UsuariosController')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
var multer = require('multer');
const {query, body} = require("express-validator");
const {errorResponse, authenticateToken, authenticateAdmin, injectIsAdmin, buildResponse} = require("./utils/Utils");
var forms = multer();
var cors = require('cors')
const cookieParser = require('cookie-parser');
const MedioPagoController = require('./controllers/MedioPagoController');
const SucursalController = require('./controllers/SucursalController');
const PedidosController = require('./controllers/PedidosController');
const {validarCambioEstadoPedido} = require("./controllers/PedidosController");
const {Sequelize} = require("sequelize");
const config = require("./config/config.js");
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const {auth} = require("mysql/lib/protocol/Auth");

app.use(cookieParser());

// Configuración de swagger

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Documentación de API',
            version: '1.0.0',
            description: 'Documentación de la API web de El Patrón del Hard'
        }
    },

    apis: ['./routes/docs.yaml']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Configuración de CORS

var whitelist = ['http://localhost:4200', 'http://localhost:3000']
var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Origen no permitido por CORS'))
        }
    }
}
app.use(cors(corsOptions))

// Configuración general de la plataforma

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(forms.array());
app.use(express.json());

// Rutas de la plataforma
app.get('/', authenticateAdmin, function (req, res) {
    res.status(200).json(['DSW TP Backend']);
});

// Sesión
app.post('/login', usuarioController.login);
app.get('/logout', usuarioController.logout);
app.get('/session/validateSession', usuarioController.validateSession);
app.get('/session/validateAdmin', usuarioController.validateAdmin);
app.get('/account/profile', usuarioController.getLoggedAccountData);
app.post('/account/profile', [
    authenticateToken,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.updateClient);

// Productos
app.get('/products/', injectIsAdmin, productoController.list);
app.get('/products/disabled', authenticateAdmin, productoController.listDisabled);
app.get('/products/search/', productoController.search);
app.get('/products/:id', injectIsAdmin, productoController.find);

// Productos | Solo para administradores (requiere authenticateAdmin)
app.post('/products/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('categoria').isNumeric().withMessage('La categoría es obligatoria'),
    body('precio').isNumeric().withMessage('El precio es obligatorio'),
    body('stock').isNumeric().withMessage('El inventario es obligatorio'),
], productoController.update);

app.post('/products', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('categoria').isNumeric().withMessage('La categoría es obligatoria'),
    body('precio').isNumeric().withMessage('El precio es obligatorio'),
    body('stock').isNumeric().withMessage('El inventario es obligatorio'),
], productoController.create);

app.get('/products/:id/disable', authenticateAdmin, productoController.disableProduct)
app.get('/products/:id/enable', authenticateAdmin, productoController.enableProduct)

// Categorías
app.get('/categories/', tipoProductoController.list);
app.get('/categories/:id', tipoProductoController.find);
app.get('/categories/:id/products', injectIsAdmin, productoController.findByCat);

// Categorías | Solo para administradores (requiere authenticateAdmin)
app.post('/categories', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio'),], tipoProductoController.create);
app.post('/categories/:id/update', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio')], tipoProductoController.update);
app.get('/categories/:id/borrar', authenticateAdmin, tipoProductoController.delete);

// Carrito

app.post('/cart/updatePrices', productoController.getByCarrito)

// Sucursales
app.get('/sucursales/', injectIsAdmin, SucursalController.list);
app.post('/sucursales/', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre de la sucursal es obligatorio'),
    body('direccion').notEmpty().withMessage('La dirección de la sucursal es obligatoria'),
    body('telefono').notEmpty().withMessage('El teléfono de la sucursal es obligatorio'),
], SucursalController.create);

app.get('/sucursales/:id', injectIsAdmin, SucursalController.find);
app.post('/sucursales/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre de la sucursal es obligatorio'),
    body('direccion').notEmpty().withMessage('La dirección de la sucursal es obligatoria'),
    body('telefono').notEmpty().withMessage('El teléfono de la sucursal es obligatorio'),
], SucursalController.update);
app.get('/sucursales/:id/disable', SucursalController.disable);
app.get('/sucursales/:id/enable', SucursalController.enable);

// Medios de pago
app.get('/mediopago/', injectIsAdmin, MedioPagoController.list);
app.post('/mediopago/', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre del medio de pago es obligatorio'),
], MedioPagoController.create);

app.get('/mediopago/:id', injectIsAdmin, MedioPagoController.find);
app.post('/mediopago/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre del medio de pago es obligatorio'),
], MedioPagoController.update);
app.get('/mediopago/:id/disable', authenticateAdmin, MedioPagoController.disable);
app.get('/mediopago/:id/enable', authenticateAdmin, MedioPagoController.enable);

// Pedidos

app.get('/pedidos', authenticateToken, PedidosController.list);
app.get('/pedidos/:id(\\d+)', authenticateToken, PedidosController.getById);
app.post('/pedidos/registrar', authenticateToken, PedidosController.create)

// Pedidos | Solo para administradores (requiere authenticateAdmin)
app.get('/pedidos/stats', authenticateAdmin, PedidosController.statsPedidos)
app.get('/pedidos/entregar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.entregarPedido)
app.get('/pedidos/cancelar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.cancelarPedido)

app.post('/users', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La clave es obligatoria'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.create);

// Clientes | Solo para administradores (requiere authenticateAdmin)

app.get('/users', authenticateAdmin, usuarioController.list);
app.get('/users/:id(\\d+)', authenticateAdmin, usuarioController.find);

// Usuarios | Solo para administradores (requiere authenticateAdmin)

app.post('/users/registrar', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La clave es obligatoria'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
    body('isAdmin').notEmpty().withMessage('El tipo de usuario es obligatorio'),
], usuarioController.create);

app.post('/users/:id(\\d+)', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.updateUser);

app.get('/users/:id/enable', authenticateAdmin, usuarioController.enableUser);
app.get('/users/:id/disable', authenticateAdmin, usuarioController.disableUser);
app.post('/users/:id/cambiarClave', [
    authenticateAdmin,
    body('password').notEmpty().withMessage('La nueva clave es obligatoria')
], usuarioController.changeUserPassword);


// Configuración de rutas para errores
app.get('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

app.post('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

const server = app.listen(port, () => {
    console.log(`DSW TP Backend se está ejecutando en el puerto ${port}`)
})

// Export utilizado para los tests.
module.exports = server;