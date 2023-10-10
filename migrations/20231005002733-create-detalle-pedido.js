'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('DetallePedidos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            articulo: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Productos',
                    key: 'id'
                }
            },
            cantidad: {
                allowNull: false,
                type: Sequelize.FLOAT
            },
            precioUnitario: {
                allowNull: false,
                type: Sequelize.FLOAT
            },
            montoTotal: {
                allowNull: false,
                type: Sequelize.FLOAT
            },
            pedido: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Pedidos',
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('DetallePedidos');
    }
};