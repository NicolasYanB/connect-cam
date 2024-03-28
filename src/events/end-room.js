import { ConnectionManager } from "../utils/connection-manager";

function endRoom({roomId}) {
  const connectionManager = ConnectionManager.getConnectionManager();
  const conn = connectionManager.getConnection(roomId);
  const peerConnection = conn.visitorConnection;;
  const response = {
      event: 'exit',
      payload: {}
  };
  peerConnection.sendUTF(JSON.stringify(response));
  connectionManager.removeConnection(roomId);
}

export {endRoom};