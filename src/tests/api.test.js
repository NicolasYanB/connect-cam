
describe('Room API Test Suite', () => {
    let server;
    const baseUrl = 'http://127.0.0.1:3000/api'; // this aparently solves a mysterious undici error

    beforeAll(async () => {
        server = (await import('../index')).server; 
    });

    test('Should create user and return the user id', async () => {
        const response = await fetch(`${baseUrl}/create-room?ownerName=Nicolas`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(typeof data.id).toBe('string');
    });

    afterAll(async () => {
        await server.close();
    });
});