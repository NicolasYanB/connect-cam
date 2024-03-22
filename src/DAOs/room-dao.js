import { DataAccessObjectError } from "../errors/data-access-object-error.js";
import { Room } from "../entities/room.js";
import { db } from "../database/db.js";

function createRoom({room_id, owner_name, visitor_name}) {
    const room = new Room();
    room.roomId = room_id;
    room.ownerName = owner_name;
    room.visitorName = visitor_name;
    return room;
}

class RoomDAO {
    async save(room) {
        if (!room.roomId) {
            throw new DataAccessObjectError('It is not possible to save a room without an id');
        }
        const raw = 'insert into room (room_id, owner_name, visitor_name) values ($1, $2, $3)';
        try {
            await db.query(raw, [room.roomId, room.ownerName, room.visitorName]);
        } catch (e) {
            throw new DataAccessObjectError(`Error when inserting new room: ${e.message}`);
        }
    }

    async getById(roomId) {
        const raw = 'select * from room where room_id = $1';
        try {
            const result = await db.query(raw, [roomId]);
            const room = createRoom(result.rows[0]);
            return room;
        } catch (e) {
            throw new DataAccessObjectError(`Error when fetching room: ${e.message}`);
        }
    }
}

export {RoomDAO};