import { ConnectionManager } from "../utils/connection-manager";

function open({roomId}, connection) {
  const connectionManager = ConnectionManager.getConnectionManager();
  connectionManager.addOwnerToConnection(roomId, connection);
}

export {open};