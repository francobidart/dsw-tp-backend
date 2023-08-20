const express = require('express')
const models = require('./models');
const productoController = require('./controllers/ProductoController');
const app = express()
const port = 3000

app.get('/', productoController.list)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
