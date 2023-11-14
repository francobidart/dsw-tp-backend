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
const mediopago = require('./models/mediopago');
const MedioPagoController = require('./controllers/MedioPagoController');
const SucursalController = require('./controllers/SucursalController');
const PedidosController = require('./controllers/PedidosController');
const {
    validarCambioEstado,
    validarEntregaPedido,
    validarCancelacionPedido,
    validarCambioEstadoPedido
} = require("./controllers/PedidosController");
const {Sequelize} = require("sequelize");
const config = require("./config/config.json");

app.use(cookieParser());

var whitelist = ['http://localhost:4200']
var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(null, true)
            //callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(forms.array());

app.use(express.json());


app.get('/', authenticateAdmin, function (req, res) {
   res.status(200).json(['DSW TP Backend']);
});

// Tipo Productos
app.get('/tipoproducto/', tipoProductoController.list);
app.get('/tipoproducto/:id', tipoProductoController.find);


// Productos
app.get('/products/', injectIsAdmin, productoController.list);
app.get('/products/disabled', authenticateAdmin, productoController.listDisabled);
app.get('/products/search/', productoController.search);
app.get('/products/:id', injectIsAdmin, productoController.find);

// Categorías
app.get('/categories/', tipoProductoController.list);
app.get('/categories/:id', tipoProductoController.find);
app.get('/categories/:id/products', injectIsAdmin, productoController.findByCat);

app.get('/users', authenticateAdmin, usuarioController.list);
app.get('/users/:id', authenticateAdmin, usuarioController.find);

app.get('/session/validateSession', usuarioController.validateSession);
app.get('/session/validateAdmin', usuarioController.validateAdmin);
app.get('/account/profile', usuarioController.getLoggedAccountData);

app.get('/logout', usuarioController.logout)
app.post('/login', usuarioController.login);
app.post('/usuarios', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La clave es obligatoria'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.create);

// Medio Pago
app.get('/mediopago/', MedioPagoController.list);
app.get('/mediopago/:tag', MedioPagoController.find);
app.get('/sucursales/', SucursalController.list)

app.get('/pedidos', authenticateToken, PedidosController.list);
app.get('/pedidos/:id(\\d+)', authenticateToken, PedidosController.getById);

app.post('/pedidos/registrar', authenticateToken, PedidosController.create)

// MODULO ADMINSTRADOR
// Todos estos endpoints requieren autenticación superior, utilizar authenticateAdmin

// CLIENTES
app.get('/clientes', authenticateAdmin, usuarioController.list)
app.get('/clientes/:id', authenticateAdmin, usuarioController.find)
app.post('/usuarios/registrar', authenticateAdmin, usuarioController.create);
app.post('/usuarios/:id', [
    authenticateAdmin,
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('telefono').notEmpty().withMessage('El telefono es obligatorio'),
], usuarioController.updateUser);
app.get('/usuarios/:id/disable', authenticateAdmin, usuarioController.disableUser);
app.get('/usuarios/:id/enable', authenticateAdmin, usuarioController.enableUser);
app.post('/usuarios/:id/cambiarClave', [
    authenticateAdmin,
    body('password').notEmpty().withMessage('La nueva contraseña es obligatoria')
], usuarioController.changeUserPassword);

// PEDIDOS
app.get('/pedidos/stats', authenticateAdmin, PedidosController.listPedidosNoEntregados)
app.get('/pedidos/entregar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.entregarPedido)
app.get('/pedidos/cancelar/:id', [authenticateAdmin, validarCambioEstadoPedido], PedidosController.cancelarPedido)

// PRODUCTOS
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

// CATEGORÍAS
app.post('/categories', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio'),], tipoProductoController.create);
app.post('/categories/:id/update', [authenticateAdmin, body('nombre').notEmpty().withMessage('El nombre es obligatorio')], tipoProductoController.update);
app.get('/categories/:id/borrar', authenticateAdmin, tipoProductoController.delete);

app.get('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

app.post('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

app.listen(port, () => {
    console.log(`DSW TP Backend se está ejecutando en el puerto ${port}`)
})


app.use(bodyParser.json());