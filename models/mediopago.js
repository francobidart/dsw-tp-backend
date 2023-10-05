'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MedioPago extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        
        }
    }

    MedioPago.init({
        id: {
            type: DataTypes.STRING,
           autoIncrement: true,
            primaryKey: true
        },
        tag: {type: DataTypes.STRING, unique:true},
        nombre: DataTypes.STRING,
        descripcion: DataTypes.STRING,
       
    }, {
        sequelize,
        modelName: 'MedioPago',
    });
    return MedioPago;
};