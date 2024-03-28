import { ConnectionError } from "../errors/connection-error.js";
import { ConnectionManager } from "../utils/connection-manager.js";

function join({roomId}, connection) {
  const connectionManager = ConnectionManager.getConnectionManager();
  try {
    connectionManager.addVisitorToConnection(roomId, connection);
    const {ownerConnection} = connectionManager.getConnection(roomId);
    const response = {
        event: 'found',
        payload: {}
    };
    ownerConnection.sendUTF(JSON.stringify(response));
  } catch(e) {
      if (e instanceof ConnectionError) {
          const response = {
              event: 'reject',
              payload: {
                  message: 'This room is already full'
              }
          };
          connection.sendUTF(JSON.stringify(response));
      }
  }
}

export {join};