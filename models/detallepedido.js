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
            this.belongsTo(models.Producto, {
                foreignKey: 'articulo',
                as: 'detalleArticulo'
            })
        }
    }

    DetallePedido.init({
        articulo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        detalle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cantidad: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        precioUnitario: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        montoTotal: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        pedido: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'DetallePedido',
    });
    return DetallePedido;
};