'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Pedido extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.hasMany(models.DetallePedido, {
                as: 'detallePedido',
                foreignKey: 'pedido',
                onDelete: 'RESTRICT'
            })
            this.belongsTo(models.Usuarios, {
                targetKey: 'id',
                as: 'clientePedido',
                foreignKey: 'cliente',
                onDelete: 'RESTRICT'
            })
        }
    }

    Pedido.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        montoTotal: DataTypes.FLOAT,
        estadoActual: DataTypes.INTEGER,
        cliente: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Pedido',
    });
    return Pedido;
};