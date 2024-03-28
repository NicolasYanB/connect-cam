import { createRoom } from "../actions/create-room";
import { ConnectionManager } from "../utils/connection-manager";

describe('Actions Test Suite', () => {

    test('should create a room', async () => {
        const id = await createRoom();
        expect(typeof id).toBe('string');
        const connectionManager = ConnectionManager.getConnectionManager();
        expect(() => connectionManager.getConnection(id)).not.toThrow();
        const conn = connectionManager.getConnection(id);
        expect(conn).toHaveProperty('roomId');
        expect(conn).toHaveProperty('ownerConnection');
        expect(conn).toHaveProperty('visitorConnection');
        expect(conn.roomId).toBe(id);
        expect(conn.ownerConnection).toBeNull();
        expect(conn.visitorConnection).toBeNull();
    });
});