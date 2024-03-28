import { ConnectionManager } from "../utils/connection-manager";

function disconnectVisitor({roomId}) {
  const connectionManager = ConnectionManager.getConnectionManager();
  const conn = connectionManager.getConnection(roomId);
  const peerConection = conn.ownerConnection;
  const response = {
      event: 'disconnect-peer',
      payload: {}
  };
  peerConection.sendUTF(JSON.stringify(response));
  connectionManager.disconnectVisitor(roomId);
}

export {disconnectVisitor};