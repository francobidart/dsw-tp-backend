'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('HistorialEstadoPedidos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            pedido: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Pedidos',
                    key: 'id'
                }
            },
            estado: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'EstadoPedidos',
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
        await queryInterface.dropTable('HistorialEstadoPedidos');
    }
};