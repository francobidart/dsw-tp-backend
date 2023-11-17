'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('Usuarios', [
            {
                nombre: 'Juan Carlos',
                apellido: 'Bodoque',
                email: 'test@test.com',
                clave: '$2a$12$TTk.q4Gez2E1WqDVV9SSd.9Lxdd4jMo6Fs8ngYmnodQb5lAz7iEAe', // Contraseña hasheada
                telefono: '3410000000',
                isAdmin: 0,
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                nombre: 'Admin',
                apellido: 'Admin',
                email: 'admin@test.com',
                clave: '$2a$12$TTk.q4Gez2E1WqDVV9SSd.9Lxdd4jMo6Fs8ngYmnodQb5lAz7iEAe', // Contraseña hasheada
                telefono: '3410000000',
                isAdmin: 1,
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
        await queryInterface.bulkInsert('TipoProductos', [
            {
                id: 1,
                nombre: 'Procesadores',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                nombre: 'Placas de video',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                nombre: 'Discos solidos',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 4,
                nombre: 'Memorias RAM',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 5,
                nombre: 'Otros',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
        await queryInterface.bulkInsert('MedioPagos', [
            {
                id: 1,
                nombre: 'Pago en efectivo',
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                nombre: 'Transferencia bancaria',
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
        await queryInterface.bulkInsert('Productos', [
            {
                id: 1,
                categoria: 3,
                precio: 15029,
                nombre: 'DISCO SOLIDO SSD LEXAR 1TB SL200 EXTERNO',
                stock: 10,
                imagen: 'https://www.venex.com.ar/products_images/1689616133_4.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                categoria: 2,
                precio: 240500,
                nombre: 'PLACA DE VIDEO NVIDIA GEFORCE GTX 1650 OC 4G PHOENIX GDDR6',
                stock: 10,
                imagen: 'https://www.venex.com.ar/products_images/1686052397_4.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                categoria: 5,
                precio: 45000,
                nombre: 'TECLADO REDRAGON K630 DRAGONBORN BLACK 60 MECANICO',
                stock: 10,
                imagen: 'https://www.venex.com.ar/products_images/1622142628_k630rgb-pngweb-10-1.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 4,
                categoria: 1,
                precio: 124029,
                nombre: 'MICROPROCESADOR INTEL CELERON G5905 TRAY OEM BULK 3.50GHZ 4MB 1200',
                stock: 10,
                imagen: 'https://www.venex.com.ar/products_images/1641988097_5905.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
        await queryInterface.bulkInsert('Sucursales', [
            {
                id: 1,
                nombre: 'Centro',
                direccion: 'Zeballos 1341 | Rosario | Santa Fe',
                telefono: '341000010',
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                nombre: 'Norte',
                direccion: 'Thedy 100 | Rosario | Santa Fe',
                telefono: '341000010',
                active: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
        await queryInterface.bulkInsert('EstadoPedidos', [
            {
                id: 1,
                nombre: 'Generado',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                nombre: 'Pendiente de pago',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 3,
                nombre: 'Cobrado (pendiente de entrega)',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 4,
                nombre: 'Entregado',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 5,
                nombre: 'Cancelado',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Usuarios', null, {});
        await queryInterface.bulkDelete('TipoProductos', null, {});
        await queryInterface.bulkDelete('MedioPagos', null, {});
        await queryInterface.bulkDelete('Productos', null, {});
        await queryInterface.bulkDelete('Sucursales', null, {});
        await queryInterface.bulkDelete('EstadoPedidos', null, {});
    }
};