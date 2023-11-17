'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Sucursal extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.hasMany(models.Pedido, {foreignKey: 'sucursal', as: 'sucursalPedido'})
        }
    }

    Sucursal.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: DataTypes.STRING,
        direccion: DataTypes.STRING,
        telefono: DataTypes.STRING,
        active: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: 'sucursales',
        modelName: 'Sucursal',
    });
    return Sucursal;
};