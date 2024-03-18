import { db } from '../database/db';
import { clean } from '../utils/clean-db';

describe('Room API Test Suite', () => {
    let server;
    const baseUrl = 'http://localhost:3000/api';

    beforeAll(async () => {
        server = (await import('../index')).server; 
    });

    beforeEach(() => {
        clean();
    });

    test('Should create user and return the user id', async () => {
        const response = await fetch(`${baseUrl}/create-room?ownerName=Nicolas`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(typeof data.id).toBe('string');
    });

    afterAll(async () => {
        db.end();
        await server.close();
    });
});