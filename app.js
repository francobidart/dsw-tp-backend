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

const sesionRoutes = require('./API_Routes/sesion');
app.use('/sesion', sesionRoutes);

// Productos

const productosRoutes = require('./API_Routes/products');
app.use('/products', productosRoutes);


// Categorías

const categoriasRoutes = require('./API_Routes/categorias');
app.use('/categories', categoriasRoutes);


// Carrito

app.post('/cart/updatePrices', productoController.getByCarrito)

// Sucursales

const sucursalesRoutes = require('./API_Routes/sucursales');
app.use('/sucursales', sucursalesRoutes);

// Medios de pago

const mediopagoRoutes = require('./API_Routes/mediopago');
app.use('/mediopago', mediopagoRoutes);

// Pedidos

const pedidosRoutes = require('./API_Routes/pedidos');
app.use('/pedidos', pedidosRoutes);

// Usuarios

const usuariosRoutes = require('./API_Routes/users');
app.use('/users', usuariosRoutes);

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