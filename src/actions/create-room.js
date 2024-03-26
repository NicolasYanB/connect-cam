import { ConnectionManager } from "../utils/connection-manager.js";
import { generateId } from "../utils/generate-id.js";

async function createRoom() {
    const roomId = generateId();
    const connectionManager = ConnectionManager.getConnectionManager();
    connectionManager.createConnection(roomId);
    try {
        return roomId;
    } catch (e) {
        throw new Error(`Error on create room: ${e.message}`);
    }
}

export {createRoom};