class ConnectionManager {
    // Singleton to manage web socket connections
    #connections = [];
    static #instance = null;

    static getConnectionManager() {
        if (ConnectionManager.#instance == null) {
            ConnectionManager.#instance = new ConnectionManager();
        }
        return ConnectionManager.#instance;
    }

    createConnection(roomId, ownerConnection) {
        this.#connections.push({
            roomId,
            ownerConnection,
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
}

export {ConnectionManager};