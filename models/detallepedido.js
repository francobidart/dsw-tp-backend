'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DetallePedido extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Pedido, {
                foreignKey: 'pedido'
            });
            this.hasOne(models.Producto, {
                foreignKey: 'id',
                as: 'detalleArticulo'
            })
        }
    }

    DetallePedido.init({
        articulo: DataTypes.INTEGER,
        cantidad: DataTypes.FLOAT,
        precioUnitario: DataTypes.FLOAT,
        montoTotal: DataTypes.FLOAT,
        pedido: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'DetallePedido',
    });
    return DetallePedido;
};