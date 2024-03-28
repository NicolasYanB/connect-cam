import { ConnectionManager } from "../utils/connection-manager";

function sendIceCandidate({roomId, client, candidate}) {
  const connectionManager = ConnectionManager.getConnectionManager();
  const conn = connectionManager.getConnection(roomId);
  let peerConection;
  if (client === 'owner') {
      peerConection = conn.visitorConnection;
  } else if (client === 'visitor') {
      peerConection = conn.ownerConnection;
  } else {
      throw new Error('client field is not valid');
  }

  const response = {
      event: 'new-candidate',
      payload: {candidate}
  };

  peerConection.sendUTF(JSON.stringify(response));
}

export {sendIceCandidate};