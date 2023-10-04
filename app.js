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
const {errorResponse, authenticateToken} = require("./utils/Utils");
var forms = multer();
var cors = require('cors')
const cookieParser = require('cookie-parser');
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

app.get('/', productoController.list)

// Productos
app.get('/products/', productoController.list);
app.get('/products/:id', productoController.find);

// Categorías
app.get('/categories/', tipoProductoController.list);
app.get('/categories/:id', tipoProductoController.find);
app.get('/categories/:id/products', productoController.findByCat);

app.get('/users', authenticateToken, usuarioController.list);

app.get('/session/validateSession', usuarioController.validateSession);
app.get('/account/profile', usuarioController.getLoggedAccountData);

app.get('/logout', usuarioController.logout)
app.post('/login', usuarioController.login);
app.post('/usuarios', usuarioController.create);

app.get('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

app.post('*', function (req, res) {
    res.status(404).send(errorResponse('404 - Not Found'));
});

app.listen(port, () => {
    console.log(`DSW TP Backend se está ejecutando en el puerto ${port}`)
})
