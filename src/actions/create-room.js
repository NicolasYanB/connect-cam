import { RoomDAO } from "../DAOs/room-dao.js";
import { Room } from "../entities/room.js";
import { ConnectionManager } from "../utils/connection-manager.js";
import { generateId } from "../utils/generate-id.js";

async function createRoom(ownerName) {
    const roomDao = new RoomDAO();
    const roomId = generateId();
    const room = new Room();
    const connectionManager = ConnectionManager.getConnectionManager();
    connectionManager.createConnection(roomId);
    room.roomId = roomId;
    room.ownerName = ownerName;
    try {
        await roomDao.save(room);
        return roomId;
    } catch (e) {
        throw new Error(`Error on create room: ${e.message}`);
    }
}

export {createRoom};