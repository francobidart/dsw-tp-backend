const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');
const {sequelize} = require('../models');
const config = require('../config/config.json')
var mysql = require('mysql');
const {exec} = require("child_process");

var con = mysql.createConnection({
    host: config.development.host,
    user: config.development.username,
    password: config.development.password,
    database: config.development.database
});


con.connect(function (err) {
    if (err) throw 'Error al conectarse a la DB';
    var query = "DROP DATABASE IF EXISTS " + config.development.database;
    var queryCreate = "CREATE DATABASE " + config.development.database;
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log('Rows deleted: ' + result.affectedRows)
        con.query(queryCreate, function (err2, result2) {
            if (err2) throw "Error al crear nuevamente la DB";
            exec("sequelize-cli db:migrate", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    errorReporter(error)
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    errorReporter(stderr)
                }
                console.log(`stdout: ${stdout}`);
                console.log('DB Creada')

                sequelize_fixtures.loadFile('fixtures/json/test_set_1.json', models, {
                    logger: {
                        debug: console.log,
                        info: console.log,
                        warn: console.log,
                        error: errorReporter
                    }
                }).then(cargaFinalizada);
            });
        })
    })
})

function cargaFinalizada() {
    console.log('Carga finalizada');
    process.exit();
}
function errorReporter(message) {
    console.error('Error al ejecutar la carga ' + message);
    process.exit()
}
