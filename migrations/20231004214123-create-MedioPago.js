'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('MedioPagos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            tag: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            nombre: {
                type: Sequelize.STRING
            },
            descripcion: {
                type: Sequelize.STRING
            },
            active: {
                allowNull: false,
                type: Sequelize.INTEGER,
                defaultValue: 1
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
        await queryInterface.dropTable('MedioPagos');
    }
};