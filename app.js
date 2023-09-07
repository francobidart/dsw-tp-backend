const express = require('express')
const models = require('./models');
const productoController = require('./controllers/ProductoController');
const tipoProductoController = require('./controllers/TipoProductoController');
const usuarioController = require('./controllers/UsuariosController')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
var multer = require('multer');
var forms = multer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(forms.array());

app.use(express.json());

app.get('/', productoController.list)

// Productos



// Categorías

app.get('/products/categories', tipoProductoController.list);
app.get('/users', usuarioController.list);



app.get('*', function(req, res){
  res.status(404).send({mensaje: "404 | NOT FOUND"});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post('/usuarios', usuarioController.create)