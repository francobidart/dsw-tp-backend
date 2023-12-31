'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class EstadoPedido extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.hasMany(models.Pedido, {foreignKey: 'estadoActual', as: 'detalleEstadoActual'})
            this.hasMany(models.HistorialEstadoPedido, {foreignKey: 'estado', as: 'detalleEstado'})
        }
    }

    EstadoPedido.init({
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'EstadoPedido',
    });
    return EstadoPedido;
};