import { ConnectionManager } from "../utils/connection-manager";

function sendSdp({roomId, type, data}) {
  const connectionManager = ConnectionManager.getConnectionManager();
  const conn = connectionManager.getConnection(roomId);
  let peerConection;
  if (type === 'offer') {
      peerConection = conn.visitorConnection;
  } else if (type === 'answer') {
      peerConection = conn.ownerConnection;
  } else {
      throw new Error('type field is not valid');
  }

  const response = {
      event: 'receive',
      payload: {type, data}
  };

  peerConection.sendUTF(JSON.stringify(response));
}

export {sendSdp};