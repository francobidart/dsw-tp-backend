'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pedidos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      montoTotal: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      estadoActual: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      cliente: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Usuarios',
          key: 'id'
        }
      },
      medioDePago: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'MedioPagos',
          key: 'id'
        }
      },
      sucursal: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Sucursales',
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
    await queryInterface.dropTable('Pedidos');
  }
};