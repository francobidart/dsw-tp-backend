'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Producto extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.TipoProducto, {
                foreignKey: 'categoria',
                onDelete: 'RESTRICT'
            })
        }
    }

    Producto.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        categoria: DataTypes.INTEGER,
        precio: DataTypes.FLOAT,
        imagen: DataTypes.STRING,
        nombre: DataTypes.STRING,
        descripcion: DataTypes.STRING,
        activo: DataTypes.INTEGER,
        stock: {
            type: DataTypes.FLOAT,
            validate: {
                isNumeric: true
            }
        }
    }, {
        sequelize,
        modelName: 'Producto',
    });
    return Producto;
};