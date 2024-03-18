import { RoomDAO } from "../DAOs/room-dao";
import { db } from "../database/db";
import { Room } from "../entities/room";
import { clean } from "../utils/clean-db";

describe('Room DAO Test Suite', () => {
    const roomDao = new RoomDAO();

    beforeEach(() => clean());

    test('should not create a room without an id', async () => {
        const room = new Room();
        await expect(roomDao.save(room)).rejects.toThrow('It is not possible to save a room without an id');
    });

    test('should create a room with an id', async () => {
        const room = new Room();
        room.roomId = '1';
        await expect(roomDao.save(room)).resolves.toBeUndefined();
        const fetchedRoom = await roomDao.getById('1');
        expect(fetchedRoom.roomId).toBe('1');
    });

    afterAll(() => db.end());
});