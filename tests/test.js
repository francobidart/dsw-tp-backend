const request = require('supertest');
const app = require('../app');
const requestWithSupertest = request(app);


describe('Pruebas de endpoints, post y get', () => {
    it('GET /products debería traer una lista de los 4 productos de prueba', async () => {
        const res = await requestWithSupertest.get('/products');
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
        expect(res.body.total_resultados).toEqual(4);
        expect(res.body.resultados.length).toEqual(4);
        expect(res.body.resultados[0].nombre).toEqual('MICROPROCESADOR INTEL CELERON G5905 TRAY OEM BULK 3.50GHZ 4MB 1200');
        expect(res.body.resultados[1].nombre).toEqual('TECLADO REDRAGON K630 DRAGONBORN BLACK 60 MECANICO');
        expect(res.body.resultados[2].nombre).toEqual('PLACA DE VIDEO NVIDIA GEFORCE GTX 1650 OC 4G PHOENIX GDDR6');
        expect(res.body.resultados[3].nombre).toEqual('DISCO SOLIDO SSD LEXAR 1TB SL200 EXTERNO');
    });

    it('GET /products/disabled debería devolver un mensaje de error de autenticación', async () => {
        const res = await requestWithSupertest.get('/products/disabled');
        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('json'));
        expect(res.body.mensaje).toEqual('El token de autorización no fue enviado a la aplicación');
    });

    it('GET /categories debería devolver listado de categorías disponibles', async () => {
        const res = await requestWithSupertest.get('/categories');
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
        expect(res.body.total_resultados).toEqual(5);
        expect(res.body.resultados[0].nombre).toEqual('Procesadores');
        expect(res.body.resultados[1].nombre).toEqual('Placas de video');
        expect(res.body.resultados[2].nombre).toEqual('Discos solidos');
        expect(res.body.resultados[3].nombre).toEqual('Memorias RAM');
        expect(res.body.resultados[4].nombre).toEqual('Otros');
    });


    it('POST /login debería evitar la autenticación del usuario', async () => {
        const res = await requestWithSupertest.post('/login')
            .field('email', 'test@test.com')
            .field('password', 'claveincorrecta')
        expect(res.status).toEqual(500);
        expect(res.body.mensaje).toEqual('Contraseña invalida');
    });

    it('POST /login debería autenticar al usuario', async () => {
        const res = await requestWithSupertest.post('/login')
            .field('email', 'test@test.com')
            .field('password', 'admin')

        expect(res.status).toEqual(200);
        expect(res.body.mensaje).toEqual('Usuario identificado correctamente.');
    });

    it('POST /productos debería registrar un producto en la plataforma, con usuario administrador.', async () => {
        const authentication = await requestWithSupertest.post('/login')
            .field('email', 'admin@test.com')
            .field('password', 'admin')

        let sessionCookie = authentication.header['set-cookie'][0];
        const crearProducto = await requestWithSupertest.post('/products')
            .field('nombre', 'Prueba')
            .field('categoria', 1)
            .field('precio', 150)
            .field('stock', 100)
            .set('Cookie', [sessionCookie])

        expect(crearProducto.status).toEqual(200);
        expect(crearProducto.body.mensaje).toEqual('Producto registrado correctamente');
    });

});

afterAll(async () => {
    if (app) {
        await app.close();
    }
});