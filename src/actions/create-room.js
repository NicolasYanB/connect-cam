import { RoomDAO } from "../DAOs/room-dao.js";
import { Room } from "../entities/room.js";
import { generateId } from "../utils/generate-id.js";

async function createRoom(ownerName) {
    const roomDao = new RoomDAO();
    const id = generateId();
    const room = new Room();
    room.roomId = id;
    room.ownerName = ownerName;
    try {
        await roomDao.save(room);
        return id;
    } catch (e) {
        throw new Error(`Error on create room: ${e.message}`);
    }
}

export {createRoom};