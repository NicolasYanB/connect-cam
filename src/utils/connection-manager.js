import { ConnectionError } from "../errors/connection-error.js";

class ConnectionManager {
    // Singleton pattern to manage web socket connections
    #connections = [];
    static #instance = null;

    static getConnectionManager() {
        if (ConnectionManager.#instance == null) {
            ConnectionManager.#instance = new ConnectionManager();
        }
        return ConnectionManager.#instance;
    }

    createConnection(roomId) {
        this.#connections.push({
            roomId,
            ownerConnection: null,
            visitorConnection: null
        });
    }

    getConnection(roomId) {
        const connection = this.#connections.find(conn => conn.roomId === roomId);
        if (!connection) {
            throw new Error('Connection not found');
        }
        return connection;
    }

    addVisitorToConnection(roomId, visitorConnection) {
        const connection = this.getConnection(roomId);
        if (connection.visitorConnection) {
            throw new ConnectionError('Cannot add visitor to the room');
        }
        connection.visitorConnection = visitorConnection;
    }

    addOwnerToConnection(roomId, ownerConnection) {
        const connection = this.getConnection(roomId);
        connection.ownerConnection = ownerConnection;
    }

    removeConnection(roomId) {
        const conn = this.getConnection(roomId);
        conn.ownerConnection.close(1000);
        conn.visitorConnection.close(1000);
        this.#connections = this.#connections.filter(conn => conn.roomId !== roomId);
    }

    disconnectVisitor(roomId) {
        const conn = this.getConnection(roomId);
        conn.visitorConnection.close(1000);
        conn.visitorConnection = null;
    }
}

export {ConnectionManager};