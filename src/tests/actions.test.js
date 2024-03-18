import { RoomDAO } from "../DAOs/room-dao";
import { createRoom } from "../actions/create-room";
import { db } from "../database/db";
import { clean } from "../utils/clean-db";

describe('Actions Test Suite', () => {
    const roomDao = new RoomDAO();

    beforeEach(() => clean());

    test('should create a room', async () => {
        const id = await createRoom('Nicolas');
        expect(typeof id).toBe('string');
        const room = await roomDao.getById(id);
        expect(room.roomId).toBe(id);
        expect(room.ownerName).toBe('Nicolas');
    });

    afterAll(() => db.end());
});