import { createRoom } from "../actions/create-room";

describe('Actions Test Suite', () => {

    test('should create a room', async () => {
        const id = await createRoom();
        expect(typeof id).toBe('string');
    });
});